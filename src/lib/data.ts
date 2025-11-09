
import type { Member, WhitelistedDomain } from './types';

// This is an in-memory "database". Data will reset on server restart.
export let members: Member[] = [
  {
    id: 'badge-001',
    name: 'Alice Johnson',
    program: 'Computer Science',
    studentNumber: '123456',
    address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    status: 'verified',
  },
  {
    id: 'badge-002',
    name: 'Bob Williams',
    program: 'Electrical Engineering',
    studentNumber: '654321',
    address: '0xefgh567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    status: 'pending',
  },
    {
    id: 'badge-003',
    name: 'Charlie Brown',
    program: 'Mechanical Engineering',
    studentNumber: '987654',
    address: '0xijkl901234abcdef1234567890abcdef1234567890abcdef1234567890abcd',
    status: 'revoked',
  },
];

export let whitelistedDomains: WhitelistedDomain[] = [
  { id: 'domain-1', domain: '@university.edu' },
  { id: 'domain-2', domain: '@gradschool.university.edu' },
];

// In-memory data mutation functions (for server actions to use)
export const addMember = (member: Omit<Member, 'id' | 'status'>) => {
  const newId = `badge-${String(members.length + 1).padStart(3, '0')}`;
  const newMember: Member = {
    ...member,
    id: newId,
    status: 'pending',
  };
  members.push(newMember);
  return newMember;
};

export const updateMemberStatus = (id: string, status: 'verified' | 'revoked') => {
    const memberIndex = members.findIndex(m => m.id === id);
    if (memberIndex !== -1) {
        members[memberIndex].status = status;
        return members[memberIndex];
    }
    return null;
}

export const addDomain = (domain: string) => {
    if (whitelistedDomains.some(d => d.domain === domain)) {
        return null; // Already exists
    }
    const newDomain: WhitelistedDomain = {
        id: `domain-${whitelistedDomains.length + 1 + Math.random()}`,
        domain,
    };
    whitelistedDomains.push(newDomain);
    return newDomain;
}

export const removeDomain = (id: string) => {
    const initialLength = whitelistedDomains.length;
    whitelistedDomains = whitelistedDomains.filter(d => d.id !== id);
    return whitelistedDomains.length < initialLength;
}

export const findMemberByAddress = (address: string) => {
    return members.find(m => m.address === address) || null;
}

export const findMemberById = (id: string) => {
    return members.find(m => m.id === id) || null;
}

export const findBadge = (id: string, address: string) => {
    return members.find(m => m.id.toLowerCase() === id.toLowerCase() && m.address.toLowerCase() === address.toLowerCase()) || null;
}

export const findDomain = (id: string) => {
    return whitelistedDomains.find(d => d.id === id) || null;
}

export const isDomainWhitelisted = (domain: string) => {
    return whitelistedDomains.some(d => d.domain.toLowerCase() === domain.toLowerCase());
}
