
'use client';

import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useZkLogin } from '@/hooks/use-zk-login';

export default function ZkLoginButton() {
  const { beginZkLogin } = useZkLogin();

  const handleLogin = () => {
    // We will pass the provider (e.g., 'google') to this function
    beginZkLogin('google'); 
  };

  return (
    <Button size="sm" onClick={handleLogin}>
      <LogIn className="mr-2 h-4 w-4" /> Connect
    </Button>
  );
}
