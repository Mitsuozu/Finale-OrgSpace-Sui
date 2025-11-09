
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

export const SUI_NETWORK = 'testnet';
export const FULLNODE_URL = getFullnodeUrl(SUI_NETWORK);
export const SUI_CLIENT = new SuiClient({ url: FULLNODE_URL });

// These are the details from your deployed smart contract
// Replace them with your actual values if they change
export const PACKAGE_ID = '0xca6f713b52771f906414924353a1df83969d3d1f0f593b5b183e7cf7d3a99db6'; 
export const REGISTRY_ID = '0x784fb669553b0c940f5a1d57386bda8dc39c8cdbc240042822455f7d4095721a';
export const ADMIN_CAP_ID = '0x638a64584750a712e28bbfd77640f8040f716e1bb694e313e1c42b7ae22e090d';

export const MODULE_NAME = 'membership_badge';

// This will be used in the OAuth flow
export const REDIRECT_URI =
  typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'http://localhost:9003/auth/callback';

