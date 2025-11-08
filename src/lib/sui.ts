/**
 * @file This file contains all the logic for interacting with the Sui blockchain.
 * It initializes the Sui client and provides functions to call the smart contract.
 */
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import type { Member } from './types';

// TODO: Replace with your deployed package ID
const PACKAGE_ID = '0x...';

// TODO: Replace with your specific module and function names
const MODULE_NAME = 'university_membership';
const REGISTER_FUNCTION_NAME = 'register_member';

// Initialize Sui Client
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// This is the server's keypair for signing transactions.
// IMPORTANT: In a production environment, this private key must be stored
// securely (e.g., in a secret manager) and not hardcoded.
const serverKeypair = () => {
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('SERVER_PRIVATE_KEY environment variable not set.');
    }
    // Private key is expected to be a Base64 encoded string.
    // We trim the first byte if it's a 0, which can happen with some encodings.
    const privateKeyBytes = Buffer.from(privateKey, 'base64');
    const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes.slice(1));
    return keypair;
};

type RegistrationData = Omit<Member, 'id' | 'status'>;

/**
 * Calls the `register_member` function on the smart contract.
 * @param data - The member's registration data.
 * @param useMock - If true, simulates the transaction without sending it.
 */
export async function registerMemberOnSui(data: RegistrationData, useMock = false) {
    console.log('Registering member on Sui:', data.name);
    
    if (useMock) {
        console.log('--- MOCK MODE ---');
        console.log('Simulating transaction...');
        console.log(`Would call ${PACKAGE_ID}::${MODULE_NAME}::${REGISTER_FUNCTION_NAME}`);
        console.log('With arguments:', data.name, data.program, data.studentNumber, data.address);
        // Simulate a successful transaction
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, digest: 'mock-digest-for-registration' };
    }

    try {
        const keypair = serverKeypair();
        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE_NAME}::${REGISTER_FUNCTION_NAME}`,
            arguments: [
                tx.pure(data.name),
                tx.pure(data.program),
                tx.pure(data.studentNumber),
                tx.pure(data.address),
            ],
        });

        console.log('Executing transaction...');
        const result = await suiClient.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEffects: true,
            },
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

// TODO: Implement other smart contract interaction functions
// - verifyMembership(badgeId: string)
// - revokeMembership(badgeId: string)
// - getMember(address: string)
// etc.
