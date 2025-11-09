
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addMember as addMemberMock, findBadge, removeDomain as removeDomainMock, updateMemberStatus, findMemberById, findDomain, addDomain as addDomainMock, findMemberByAddress, isDomainWhitelisted as isDomainWhitelistedMock } from './data';
import { registerMemberOnSui, verifyBadgeOnSui, executeAdminTransaction, isDomainWhitelisted } from './sui';
import type { ZkLoginSignature } from '@mysten/zklogin';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  program: z.string().min(2, 'Program is required'),
  studentNumber: z.string().min(1, 'Student number is required'),
  address: z.string(),
  emailDomain: z.string(),
});

/**
 * Note: This function is more complex in a real app. 
 * We would pass the full zkLogin signature from the client.
 * For now, we'll pass a mock signature and derive the email from the user object.
 */
export async function registerMember(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const userJson = formData.get('user') as string;
  if (!userJson) {
      return { error: 'User data is missing.' };
  }
  const user = JSON.parse(userJson);
  data.emailDomain = user.email.substring(user.email.indexOf('@'));


  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'Invalid data provided.' };
  }
  
  const existingMember = findMemberByAddress(validatedFields.data.address);
  if (existingMember) {
      return { error: 'This address is already registered.' };
  }

  try {
    const domainIsAllowed = await isDomainWhitelisted(validatedFields.data.emailDomain);
    if (!domainIsAllowed) {
        return { error: `Your email domain (${validatedFields.data.emailDomain}) is not authorized for registration.` };
    }
    
    // In a real app, the client would provide the full ZkLoginSignature.
    // Since this is a server action without client-side proof generation logic piped in yet,
    // we cannot call the real `registerMemberOnSui` which requires a real signature.
    // We will proceed with the mock implementation for registration but use real on-chain checks.
    addMemberMock({ 
        ...validatedFields.data,
        id: `badge-mock-${Date.now()}`,
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: 'Registration submitted! Please wait for admin verification.' };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to register member.' };
  }
}

export async function verifyBadge(id: string, address: string) {
    try {
        const badge = findBadge(id, address);
        if (!badge) {
             return { success: false, message: 'Badge not found in local data.' };
        }
        
        const { isValid } = await verifyBadgeOnSui(badge.id, badge.address);

        if(isValid) {
            return { success: true, member: badge };
        }
        return { success: false, message: 'On-chain verification failed or badge is revoked.' };

    } catch (e: any) {
        console.error("Verification error:", e);
        return { success: false, message: 'Could not verify on-chain. ' + e.message };
    }
}

// Admin Actions
export async function manageMembership(memberId: string, action: 'verify' | 'revoke') {
    const member = findMemberById(memberId);
    if (!member) {
        return { error: 'Member not found.' };
    }

    try {
        const newStatus = action === 'verify' ? 'verified' : 'revoked';
        
        if (action === 'revoke') {
            await executeAdminTransaction('revoke_membership', { memberAddress: member.address });
        }
        
        // For 'verify', we assume off-chain verification is done, and this is just for local status.
        // A real contract might have an admin-verify function. For now, we update local mock data.
        updateMemberStatus(memberId, newStatus);
        
        revalidatePath('/admin');
        revalidatePath('/dashboard');
        return { success: `Member status updated to ${newStatus}.` };
    } catch(e: any) {
        return { error: `Failed to execute admin transaction: ${e.message}`};
    }
}

export async function addAllowedDomain(domain: string) {
    if (!domain || !domain.includes('.') || !domain.startsWith('@') || domain.endsWith('.')) {
        return { error: 'Invalid domain format. Must start with @.' };
    }
    
    try {
        await executeAdminTransaction('add_allowed_domain', { domain });
        addDomainMock(domain);

        revalidatePath('/admin');
        return { success: 'Domain successfully added to whitelist on-chain.' };
    } catch (e: any) {
        return { error: `Failed to add domain on-chain: ${e.message}`};
    }
}

export async function removeAllowedDomain(id: string) {
    const domainToRemove = findDomain(id);
    if (!domainToRemove) {
        return { error: 'Domain not found.' };
    }

    try {
        await executeAdminTransaction('remove_allowed_domain', { domain: domainToRemove.domain });
        removeDomainMock(id);

        revalidatePath('/admin');
        return { success: 'Domain successfully removed from whitelist on-chain.' };
    } catch (e: any) {
        return { error: `Failed to remove domain on-chain: ${e.message}`};
    }
}
