'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const id_token = searchParams.get('id_token');
        console.log("Handling OAuth callback...");

        // In a real app, we would exchange this token for a zkLogin proof
        // and get the user's zkAddress.
        // For now, we will simulate this by logging in a mock user.

        // This is a placeholder. We will replace this logic in the next steps.
        // The id_token would be parsed to get the user's email.
        // For example, if JWT contains 'user@example.com' or 'admin@university.edu'
        // For this mock, let's just log in the default admin user to show it works.
        const mockUserEmail = 'admin@university.edu'; 
        
        console.log("Simulating login for:", mockUserEmail);
        login(mockUserEmail);

        // Simulate proof generation time and then redirect
        const timer = setTimeout(() => {
            console.log("Redirecting to dashboard...");
            router.push('/dashboard');
        }, 3000); // 3-second delay

        return () => clearTimeout(timer);
    }, [searchParams, router, login]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold">Verifying your identity...</h1>
            <p className="text-muted-foreground">Please wait while we generate your secure proof. This may take a few seconds.</p>
        </div>
    );
}
