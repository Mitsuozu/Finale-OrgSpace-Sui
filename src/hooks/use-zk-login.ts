
'use client';

import { useState } from 'react';
import { zkLogin } from '@/lib/zklogin-client';
import type { OpenIDProvider } from '@mysten/zklogin';

export function useZkLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const beginZkLogin = async (provider: OpenIDProvider) => {
    setLoading(true);
    setError(null);
    try {
      // This will initiate the OAuth flow
      await zkLogin(provider);
    } catch (err: any) {
      setError(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, beginZkLogin };
}
