'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addMember as addMemberMock, findBadge, removeDomain as removeDomainMock, updateMemberStatus, findMemberByAddress, findDomain, findMemberById } from './data';
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
 * For now, we'll pass a mock signature and derive the email from the address.
 */
export async function registerMember(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  // This is a temporary solution to get the user's email domain.
  // In a real flow (Phase 7), the JWT from the client will provide this.
  const tempUser = Object.values(MOCK_USERS).find(u => u.zkAddress === data.address);
  if (!tempUser) return { error: 'Could not find a mock user for this address.' };
  data.emailDomain = tempUser.email.substring(tempUser.email.indexOf('@'));

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
        return { error: `Your email domain (${validatedFields.data.emailDomain}) is not authorized.`}
    }

    // In a real app, the client would provide the full ZkLoginSignature
    const mockZkLoginSignature: ZkLoginSignature = {
        inputs: {
            kty: "RSA",
            e: "AQAB",
            n: "mock-n",
            maxEpoch: 0,
            addrSeed: "mock-seed",
            iss: "mock-iss",
        },
        proofPoints: {
            a: [],
            b: [[], []],
            c: [],
        },
    };
    
    const suiData = {
      ...validatedFields.data,
      organization: "Sui University" // Example organization
    };

    const result = await registerMemberOnSui(suiData, mockZkLoginSignature);
    
    // Add to our mock DB for instant UI updates.
    addMemberMock({ 
        ...validatedFields.data,
        id: result.badgeId,
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
        
        const { isValid } = await verifyBadgeOnSui(badge.id, badge.address);

        if(isValid) {
            return { success: true, member: badge };
        }
        return { success: false, message: 'On-chain verification failed or badge is revoked.' };

    } catch (e: any) {
        return { success: false, message: e.message || 'Failed to verify badge.'};
    }
}

// Admin Actions
export async function manageMembership(memberId: string, action: 'verify' | 'revoke') {
    try {
        const member = findMemberById(memberId);
        if (!member) {
            return { error: 'Member not found.' };
        }
        
        // For 'revoke', we use the member's address.
        // The 'verify' action here is a mock action to update status, as on-chain verification is a read-op.
        if (action === 'revoke') {
            await executeAdminTransaction('revoke_membership', { memberAddress: member.address });
        }
        
        // Mock data update for instant UI feedback
        const newStatus = action === 'verify' ? 'verified' : 'revoked';
        updateMemberStatus(memberId, newStatus);
        
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
        await executeAdminTransaction('add_allowed_domain', { domain });
        
        // Mock data update
        addDomain(domain);

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

        await executeAdminTransaction('remove_allowed_domain', { domain: domainToRemove.domain });

        // Mock data update
        removeDomainMock(id);

        revalidatePath('/admin');
        return { success: 'Domain removed from whitelist.' };
    } catch (e: any) {
        return { error: e.message || 'Failed to remove domain.' };
    }
}

// Dummy MOCK_USERS to find user email from address.
// This will be removed in Phase 8 when we have a real auth context.
const MOCK_USERS: Record<string, { email: string, zkAddress: string }> = {
  'user@example.com': {
    email: 'user@example.com',
    zkAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  },
  'admin@university.edu': {
    email: 'admin@university.edu',
    zkAddress: '0xabcdeffedcba0987654321fedcba0987654321fedcba0987654321fedcba0',
  },
};
