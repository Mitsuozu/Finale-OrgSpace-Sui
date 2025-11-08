/**
 * @file This file contains all the logic for interacting with the Sui blockchain.
 * It initializes the Sui client and provides functions to call the smart contract.
 */
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import type { Member } from './types';

// TODO: Replace with your deployed package and object IDs from your `sui client publish` output.
// These are placeholders from the README.md
const PACKAGE_ID = '0x647474de5fd49990644a5bc3cb8ae1792ebb489ba85a42d848812fe91c433967'; 
const ADMIN_CAP_ID = '0x456def...';
const REGISTRY_ID = '0x789ghi...';


const MODULE_NAME = 'membership_badge';

// Initialize Sui Client
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// This is the server's keypair for signing transactions.
// IMPORTANT: In a production environment, this private key must be stored
// securely (e.g., in a secret manager) and not hardcoded.
const serverKeypair = () => {
    // For now, we'll use a mock keypair for local development if the env var isn't set.
    if (!process.env.SERVER_PRIVATE_KEY) {
        console.warn("SERVER_PRIVATE_KEY not set, using a mock keypair. Do not use in production.");
        return new Ed25519Keypair();
    }
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    // Private key is expected to be a Base64 encoded string.
    const privateKeyBytes = Buffer.from(privateKey, 'base64');
    // We may need to trim the first byte if it's a 0 for some encoding schemes.
    const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes.slice(privateKeyBytes[0] === 0 ? 1 : 0));
    return keypair;
};

type RegistrationData = Omit<Member, 'id' | 'status'> & {emailDomain: string, organization: string};

/**
 * Calls the `register_member` function on the smart contract.
 * The member signs this transaction themselves.
 * @param data - The member's registration data including emailDomain and organization.
 * @param useMock - If true, simulates the transaction without sending it.
 */
export async function registerMemberOnSui(data: RegistrationData, useMock = false) {
    console.log('Registering member on Sui:', data.name);
    
    if (useMock) {
        console.log('--- MOCK MODE: register_member ---');
        console.log(`Would call ${PACKAGE_ID}::${MODULE_NAME}::register_member`);
        console.log('With arguments:', REGISTRY_ID, data.emailDomain, data.organization);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, digest: 'mock-digest-for-register_member' };
    }

    try {
        const keypair = serverKeypair(); // This should be the *user's* zkLogin keypair/signature
        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE_NAME}::register_member`,
            arguments: [
                tx.object(REGISTRY_ID),
                tx.pure(data.emailDomain),
                tx.pure(data.organization),
            ],
        });

        console.log('Executing transaction (user-signed)...');
        // In a real app, this would be signed and executed by the user's wallet
        const result = await suiClient.signAndExecuteTransactionBlock({
            signer: keypair, // Replace with user's wallet signer
            transactionBlock: tx,
            options: { showEffects: true },
        });

        console.log('Transaction successful. Digest:', result.digest);
        if (result.effects?.status.status !== 'success') {
            throw new Error(`Transaction failed with status: ${result.effects?.status.error}`);
        }
        return { success: true, digest: result.digest };

    } catch (error) {
        console.error('Error in registerMemberOnSui:', error);
        throw new Error('Failed to execute registration transaction.');
    }
}


/**
 * Calls the `verify_badge` function on the smart contract.
 * This is a read-only call.
 * @param badgeId - The ID of the badge to verify.
 * @param holderAddress - The claimed address of the badge holder.
 * @param useMock - If true, simulates the call.
 */
export async function verifyBadgeOnSui(badgeId: string, holderAddress: string, useMock = false) {
    if (useMock) {
        console.log('--- MOCK MODE: verify_badge ---');
        return { success: true, isValid: true };
    }
    // Implement read-only call using devInspectTransactionBlock
    return { success: false, isValid: false, message: "Not implemented yet." };
}

/**
 * Calls admin functions on the smart contract (add/remove domain, revoke membership).
 * These transactions must be signed by the admin.
 * @param action - The admin action to perform.
 * @param payload - The data required for the action.
 * @param useMock - If true, simulates the transaction.
 */
export async function executeAdminTransaction(
    action: 'add_allowed_domain' | 'remove_allowed_domain' | 'revoke_membership',
    payload: { domain?: string; memberAddress?: string },
    useMock = false
) {
    if (useMock) {
        console.log(`--- MOCK MODE: ${action} ---`);
        console.log('Payload:', payload);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, digest: `mock-digest-for-${action}` };
    }

    try {
        const keypair = serverKeypair(); // Admin's keypair
        const tx = new TransactionBlock();
        let target: `${string}::${string}::${string}` | undefined;
        const args: any[] = [tx.object(ADMIN_CAP_ID), tx.object(REGISTRY_ID)];

        if (action === 'add_allowed_domain' && payload.domain) {
            target = `${PACKAGE_ID}::${MODULE_NAME}::add_allowed_domain`;
            args.push(tx.pure(payload.domain));
        } else if (action === 'remove_allowed_domain' && payload.domain) {
            target = `${PACKAGE_ID}::${MODULE_NAME}::remove_allowed_domain`;
            args.push(tx.pure(payload.domain));
        } else if (action === 'revoke_membership' && payload.memberAddress) {
            target = `${PACKAGE_ID}::${MODULE_NAME}::revoke_membership`;
            args.push(tx.pure(payload.memberAddress));
        } else {
            throw new Error('Invalid action or missing payload for admin transaction.');
        }

        tx.moveCall({ target, arguments: args });

        console.log(`Executing admin transaction: ${action}...`);
        const result = await suiClient.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
        });
        
        console.log('Admin transaction successful. Digest:', result.digest);
        return { success: true, digest: result.digest };

    } catch (error) {
        console.error(`Error in ${action}:`, error);
        throw new Error(`Failed to execute ${action} transaction.`);
    }
}
