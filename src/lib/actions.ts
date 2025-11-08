'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addDomain, addMember, findBadge, removeDomain, updateMemberStatus, findMemberByAddress } from './data';

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

  try {
    addMember(validatedFields.data);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: 'Registration submitted successfully! Please wait for admin verification.' };
  } catch (e) {
    return { error: 'Failed to register member.' };
  }
}

export async function verifyBadge(id: string, address: string) {
    const badge = findBadge(id, address);
    if(badge && badge.status === 'verified') {
        return { success: true, member: badge };
    }
    return { success: false, message: 'Badge not found or not verified.' };
}

// Admin Actions
export async function manageMembership(id: string, action: 'verify' | 'revoke') {
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
