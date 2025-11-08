'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addMember as addMemberMock, findBadge, removeDomain, updateMemberStatus, findMemberByAddress, findDomain, members, whitelistedDomains, findMemberById } from './data';
import { registerMemberOnSui, verifyBadgeOnSui, executeAdminTransaction } from './sui';
import type { User } from './types';
import { MOCK_USERS } from '@/components/auth-context';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  program: z.string().min(2, 'Program is required'),
  studentNumber: z.string().min(1, 'Student number is required'),
  address: z.string(),
});


export async function registerMember(formData: FormData) {
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { error: 'Invalid data provided.' };
  }
  
  const existingMember = findMemberByAddress(validatedFields.data.address);
  if (existingMember) {
      return { error: 'This address is already registered.' };
  }
  
  // Find the logged-in user to get their email
  const userEmail = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].zkAddress === validatedFields.data.address);
  if (!userEmail) {
    return { error: 'Could not identify user.' };
  }
  
  const emailDomain = userEmail.substring(userEmail.indexOf('@'));

  // Check if domain is whitelisted using mock data
  const domainIsAllowed = whitelistedDomains.some(d => emailDomain.endsWith(d.domain));
  if (!domainIsAllowed) {
    return { error: `Your email domain (${emailDomain}) is not authorized.`}
  }


  try {
    const suiData = {
      ...validatedFields.data,
      emailDomain: emailDomain,
      organization: "Sui University" // Example organization
    };

    // This is where we call the blockchain.
    // The second argument `true` is to use the mock data for now.
    // Change it to `false` to call your actual smart contract.
    await registerMemberOnSui(suiData, true);
    
    // We still call the mock data function to update the UI instantly.
    addMemberMock(validatedFields.data);

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: 'Registration submitted successfully! Please wait for admin verification.' };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'Failed to register member on-chain.' };
  }
}

export async function verifyBadge(id: string, address: string) {
    // This action will now use the Sui function
    try {
        const badge = findBadge(id, address);
        if (!badge) {
             return { success: false, message: 'Badge not found in local data.' };
        }
        // Always returns true in mock mode for now
        const { isValid } = await verifyBadgeOnSui(id, address, true);

        if(isValid) {
            return { success: true, member: badge };
        }
        return { success: false, message: 'On-chain verification failed.' };

    } catch (e: any) {
        return { success: false, message: e.message || 'Failed to verify badge.'};
    }
}

// Admin Actions
export async function manageMembership(memberId: string, action: 'verify' | 'revoke') {
    try {
        // Find member to get their address for the revoke call
        const member = findMemberById(memberId);
        if (!member) {
            return { error: 'Member not found.' };
        }
        
        // This would require more logic for 'verify' in a real scenario
        // For 'revoke' we have the member address
        await executeAdminTransaction('revoke_membership', { memberAddress: member.address }, true);
        
        // Mock data update
        const newStatus = action === 'verify' ? 'verified' : 'revoked';
        const updatedMember = updateMemberStatus(memberId, newStatus);
        if (!updatedMember) throw new Error("Failed to update mock data.");

        revalidatePath('/admin');
        revalidatePath('/dashboard');
        return { success: `Member status updated to ${newStatus}.` };
    } catch (e: any) {
        return { error: e.message || 'Failed to update member status.' };
    }
}

export async function addAllowedDomain(domain: string) {
    if (!domain || !domain.includes('.') || !domain.startsWith('@') || domain.endsWith('.')) {
        return { error: 'Invalid domain format. Must start with @.' };
    }
    try {
        await executeAdminTransaction('add_allowed_domain', { domain }, true);
        
        // Mock data update
        const result = addDomain(domain);
        if (!result) return { error: 'Domain already exists in mock data.' };

        revalidatePath('/admin');
        return { success: 'Domain added to whitelist.' };
    } catch (e: any) {
        return { error: e.message || 'Failed to add domain.' };
    }
}

export async function removeAllowedDomain(id: string) {
    try {
        const domainToRemove = findDomain(id);
        if (!domainToRemove) {
            return { error: 'Domain not found.' };
        }

        await executeAdminTransaction('remove_allowed_domain', { domain: domainToRemove.domain }, true);

        // Mock data update
        removeDomain(id);

        revalidatePath('/admin');
        return { success: 'Domain removed from whitelist.' };
    } catch (e: any) {
        return { error: e.message || 'Failed to remove domain.' };
    }
}
