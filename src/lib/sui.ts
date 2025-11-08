/**
 * @file This file contains all the logic for interacting with the Sui blockchain.
 * It initializes the Sui client and provides functions to call the smart contract.
 */
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import type { Member } from './types';
import { PACKAGE_ID, REGISTRY_ID, ADMIN_CAP_ID, MODULE_NAME, SUI_CLIENT } from './sui-utils';
import type { ZkLoginSignature } from '@mysten/zklogin';

// This is the server's keypair for signing transactions.
// IMPORTANT: In a production environment, this private key must be stored
// securely (e.g., in a secret manager) and not hardcoded.
const serverKeypair = () => {
    if (!process.env.SERVER_PRIVATE_KEY) {
        console.warn("SERVER_PRIVATE_KEY not set, using a mock keypair. Do not use in production.");
        return new Ed25519Keypair();
    }
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    const privateKeyBytes = Buffer.from(privateKey, 'base64');
    return Ed25519Keypair.fromSecretKey(privateKeyBytes.slice(privateKeyBytes[0] === 0 ? 1 : 0));
};

type RegistrationData = Omit<Member, 'id' | 'status'> & {emailDomain: string, organization: string};

/**
 * Calls the `register_member` function on the smart contract.
 * This transaction is signed with a zkLogin signature.
 * @param data - The member's registration data.
 * @param zkLoginSignature - The zkLogin signature.
 */
export async function registerMemberOnSui(data: RegistrationData, zkLoginSignature: ZkLoginSignature) {
    console.log('🔗 Registering member on Sui blockchain...');
    const tx = new TransactionBlock();
    
    // Set sender to the zkLogin address
    tx.setSender(data.address);
    
    // Call the smart contract function
    tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::register_member`,
        arguments: [
            tx.object(REGISTRY_ID),
            tx.pure(data.emailDomain),
            tx.pure(data.organization),
        ],
    });
    
    // Execute the transaction with the zkLogin signature
    const result = await SUI_CLIENT.executeTransactionBlock({
        transactionBlock: await tx.build({ client: SUI_CLIENT }),
        signature: zkLoginSignature,
        options: {
            showEffects: true,
            showEvents: true,
        },
    });

    if (result.effects?.status.status !== 'success') {
        throw new Error(`Transaction failed with status: ${result.effects?.status.error}`);
    }

    // Extract the badge ID from the events
    const memberRegisteredEvent = result.events?.find(
        e => e.type.endsWith('::membership_badge::MemberRegistered')
    );
    
    const badgeId = memberRegisteredEvent?.parsedJson?.badge_id;
    
    return {
        success: true,
        digest: result.digest,
        badgeId,
    };
}


/**
 * Calls the `verify_badge` function on the smart contract.
 * This is a read-only call.
 * @param badgeId - The ID of the badge to verify.
 * @param holderAddress - The claimed address of the badge holder.
 */
export async function verifyBadgeOnSui(badgeId: string, holderAddress: string) {
  const tx = new TransactionBlock();
  
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::verify_badge`,
    arguments: [
      tx.object(badgeId),
      tx.object(REGISTRY_ID),
      tx.pure(holderAddress),
    ],
  });
  
  const result = await SUI_CLIENT.devInspectTransactionBlock({
    transactionBlock: tx,
    sender: holderAddress,
  });
  
  if (result.effects.status.status !== 'success') {
      throw new Error(`Verification check failed: ${result.effects.status.error}`);
  }
  
  // The return value is a boolean, encoded as a u8. 1 is true, 0 is false.
  const isValid = result.results?.[0]?.returnValues?.[0]?.[0] === 1;
  
  return { isValid };
}

/**
 * Checks if a domain is whitelisted by calling the `is_domain_allowed` function.
 * @param domain - The domain to check (e.g., "@university.edu").
 */
export async function isDomainWhitelisted(domain: string) {
    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::is_domain_allowed`,
        arguments: [tx.object(REGISTRY_ID), tx.pure(domain)],
    });

    // An arbitrary address can be used for devInspect
    const sender = '0x0000000000000000000000000000000000000000000000000000000000000000';

    const result = await SUI_CLIENT.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: sender,
    });

    if (result.effects.status.status !== 'success') {
      throw new Error(`Domain check failed: ${result.effects.status.error}`);
    }

    const isAllowed = result.results?.[0]?.returnValues?.[0]?.[0] === 1;
    return isAllowed;
}

/**
 * Calls admin functions on the smart contract (add/remove domain, revoke membership).
 * These transactions must be signed by the admin's keypair.
 * @param action - The admin action to perform.
 * @param payload - The data required for the action.
 */
export async function executeAdminTransaction(
    action: 'add_allowed_domain' | 'remove_allowed_domain' | 'revoke_membership',
    payload: { domain?: string; memberAddress?: string }
) {
    const keypair = serverKeypair(); // Admin's keypair
    const tx = new TransactionBlock();
    
    let target: `${string}::${string}::${string}`;
    const args: any[] = [tx.object(ADMIN_CAP_ID), tx.object(REGISTRY_ID)];

    switch (action) {
        case 'add_allowed_domain':
            if (!payload.domain) throw new Error('Domain is required for add_allowed_domain');
            target = `${PACKAGE_ID}::${MODULE_NAME}::add_allowed_domain`;
            args.push(tx.pure(payload.domain));
            break;
        case 'remove_allowed_domain':
            if (!payload.domain) throw new Error('Domain is required for remove_allowed_domain');
            target = `${PACKAGE_ID}::${MODULE_NAME}::remove_allowed_domain`;
            args.push(tx.pure(payload.domain));
            break;
        case 'revoke_membership':
            if (!payload.memberAddress) throw new Error('Member address is required for revoke_membership');
            target = `${PACKAGE_ID}::${MODULE_NAME}::revoke_membership`;
            args.push(tx.pure(payload.memberAddress));
            break;
        default:
            throw new Error('Invalid admin action.');
    }

    tx.moveCall({ target, arguments: args });

    console.log(`Executing admin transaction: ${action}...`);
    const result = await SUI_CLIENT.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
        options: { showEffects: true },
    });
    
    if (result.effects?.status.status !== 'success') {
        throw new Error(`Transaction failed: ${result.effects?.status.error}`);
    }

    console.log('Admin transaction successful. Digest:', result.digest);
    return { success: true, digest: result.digest };
}
