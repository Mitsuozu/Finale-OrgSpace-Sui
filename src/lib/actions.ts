'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addDomain, addMember as addMemberMock, findBadge, removeDomain, updateMemberStatus, findMemberByAddress } from './data';
import { registerMemberOnSui } from './sui';

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
  
  // This check can be removed if your smart contract handles it
  const existingMember = findMemberByAddress(validatedFields.data.address);
  if (existingMember) {
      return { error: 'This address is already registered.' };
  }

  try {
    // This is where we call the blockchain.
    // The second argument `true` is to use the mock data for now.
    // Change it to `false` to call your actual smart contract.
    await registerMemberOnSui(validatedFields.data, true);
    
    // We still call the mock data function to update the UI instantly.
    // In a real app, you might want to fetch the new state from the blockchain.
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
    // TODO: Replace with smart contract call
    const badge = findBadge(id, address);
    if(badge && badge.status === 'verified') {
        return { success: true, member: badge };
    }
    return { success: false, message: 'Badge not found or not verified.' };
}

// Admin Actions
export async function manageMembership(id: string, action: 'verify' | 'revoke') {
    // TODO: Replace with smart contract call
    try {
        const newStatus = action === 'verify' ? 'verified' : 'revoked';
        const updatedMember = updateMemberStatus(id, newStatus);
        if (!updatedMember) {
            return { error: 'Member not found.' };
        }
        revalidatePath('/admin');
        revalidatePath('/dashboard'); // Member status might affect their dashboard
        return { success: `Member status updated to ${newStatus}.` };
    } catch (e) {
        return { error: 'Failed to update member status.' };
    }
}

export async function addAllowedDomain(domain: string) {
    if (!domain || !domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
        return { error: 'Invalid domain format.' };
    }
    try {
        const result = addDomain(domain.toLowerCase());
        if (!result) return { error: 'Domain already exists.' };
        revalidatePath('/admin');
        return { success: 'Domain added to whitelist.' };
    } catch (e) {
        return { error: 'Failed to add domain.' };
    }
}

export async function removeAllowedDomain(id: string) {
    try {
        const success = removeDomain(id);
        if (!success) {
            return { error: 'Domain not found.' };
        }
        revalidatePath('/admin');
        return { success: 'Domain removed from whitelist.' };
    } catch (e) {
        return { error: 'Failed to remove domain.' };
    }
}
