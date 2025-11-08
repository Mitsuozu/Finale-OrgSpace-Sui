
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

export const SUI_NETWORK = 'testnet';
export const FULLNODE_URL = getFullnodeUrl(SUI_NETWORK);
export const SUI_CLIENT = new SuiClient({ url: FULLNODE_URL });

// These are the details from your deployed smart contract
// Replace them with your actual values if they change
export const PACKAGE_ID = '0x647474de5fd49990644a5bc3cb8ae1792ebb489ba85a42d848812fe91c433967'; 
export const REGISTRY_ID = '0x1aff4634dc9178e151cfc4181edcb9654c78ef3fc5816e9cbd74c80de663046d';
export const ADMIN_CAP_ID = '0x25f76f11e9c3ccf1bd7cf5daf3ae01dd936a7c1fd6388cbfcd13dc25c0c15bb0';

export const MODULE_NAME = 'membership_badge';

// This will be used in the OAuth flow
export const REDIRECT_URI =
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'http://localhost:9002/auth/callback';
