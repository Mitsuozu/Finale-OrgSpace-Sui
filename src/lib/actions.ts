'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addMember as addMemberMock, findBadge, removeDomain, updateMemberStatus, findMemberById, findDomain, addDomain as addDomainMock } from './data';
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

  // The user object is now stored in localStorage and passed to the form,
  // which includes the email. The auth context handles getting this.
  // We need to derive the email domain from the user's email.
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
    // --- THIS IS THE MOCK IMPLEMENTATION ---
    const isDomainInWhitelist = isDomainWhitelisted(validatedFields.data.emailDomain);
    if (!isDomainInWhitelist) {
        return { error: `Your email domain (${validatedFields.data.emailDomain}) is not authorized.` };
    }
    
    // Add to our mock DB for instant UI updates.
    addMemberMock({ 
        ...validatedFields.data,
        id: `badge-mock-${Date.now()}`,
    });

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: 'Registration submitted successfully! Please wait for admin verification.' };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to register member on-chain.' };
  }
}

export async function verifyBadge(id: string, address: string) {
    try {
        // We still check local data first to see if we even know about this badge.
        const badge = findBadge(id, address);
        if (!badge) {
             return { success: false, message: 'Badge not found in local data.' };
        }
        
        // This part still does a read-only check against the chain.
        const { isValid } = await verifyBadgeOnSui(badge.id, badge.address);

        if(isValid) {
            return { success: true, member: badge };
        }
        return { success: false, message: 'On-chain verification failed or badge is revoked.' };

    } catch (e: any) {
        // Since we are mocking, let's just return true if the badge is 'verified' locally.
        const badge = findBadge(id, address);
        if (badge?.status === 'verified') {
            return { success: true, member: badge };
        }
        return { success: false, message: 'Could not verify on-chain. ' + e.message };
    }
}

// Admin Actions
export async function manageMembership(memberId: string, action: 'verify' | 'revoke') {
    const member = findMemberById(memberId);
    if (!member) {
        return { error: 'Member not found in mock data.' };
    }

    try {
        const newStatus = action === 'verify' ? 'verified' : 'revoked';
        
        // MOCK: Directly update mock data instead of real transaction
        console.log(`[MOCK] Calling executeAdminTransaction for ${action} on member ${member.address}`);
        // const result = await executeAdminTransaction(action === 'verify' ? 'verify_membership' : 'revoke_membership', {
        //     memberAddress: member.address,
        // });
        updateMemberStatus(memberId, newStatus);
        
        revalidatePath('/admin');
        revalidatePath('/dashboard');
        return { success: `[MOCK] Member status updated to ${newStatus}.` };
    } catch(e: any) {
        return { error: `[MOCK] Failed to execute admin transaction: ${e.message}`};
    }
}

export async function addAllowedDomain(domain: string) {
    if (!domain || !domain.includes('.') || !domain.startsWith('@') || domain.endsWith('.')) {
        return { error: 'Invalid domain format. Must start with @.' };
    }
    
    try {
        // MOCK: Directly update mock data
        console.log(`[MOCK] Calling executeAdminTransaction to add domain ${domain}`);
        // const result = await executeAdminTransaction('add_allowed_domain', { domain });
        const newDomain = addDomainMock(domain);
        if (!newDomain) {
          return { error: 'Domain already exists in mock data.' };
        }

        revalidatePath('/admin');
        return { success: '[MOCK] Domain added to whitelist.' };
    } catch (e: any) {
        return { error: `[MOCK] Failed to add domain: ${e.message}`};
    }
}

export async function removeAllowedDomain(id: string) {
    const domainToRemove = findDomain(id);
    if (!domainToRemove) {
        return { error: 'Domain not found in mock data.' };
    }

    try {
        // MOCK: Directly update mock data
        console.log(`[MOCK] Calling executeAdminTransaction to remove domain ${domainToRemove.domain}`);
        // const result = await executeAdminTransaction('remove_allowed_domain', { domain: domainToRemove.domain });
        removeDomain(id);

        revalidatePath('/admin');
        return { success: '[MOCK] Domain removed from whitelist.' };
    } catch (e: any) {
        return { error: `[MOCK] Failed to remove domain: ${e.message}`};
    }
}
