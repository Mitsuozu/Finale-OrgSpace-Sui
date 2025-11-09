'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { decodeJwt } from 'jose';

export default function AuthCallbackPage() {
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        // OAuth providers often return tokens in the URL fragment (#)
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1)); // remove the '#'
        const id_token = params.get('id_token');
        console.log("Handling OAuth callback...");

        if (id_token) {
            try {
                // Decode the JWT to get user info.
                // NOTE: In a real production app, you would also verify the token's signature.
                // For this project, we'll trust the token from Google's redirect.
                const decodedToken: { email: string, sub: string } = decodeJwt(id_token);
                const userEmail = decodedToken.email;
                
                // This is a placeholder for the real zkAddress, which would be derived
                // from the JWT's `sub` claim and the user's salt.
                // For now, we'll create a mock address from the user's unique google ID (`sub`)
                // to ensure it's unique.
                const mockZkAddress = `0x${decodedToken.sub.substring(0, 62)}`;

                console.log("Simulating login for:", userEmail);
                login(userEmail, mockZkAddress);

                // Simulate proof generation time and then redirect
                const timer = setTimeout(() => {
                    console.log("Redirecting to dashboard...");
                    router.push('/dashboard');
                }, 3000); // 3-second delay

                return () => clearTimeout(timer);
            } catch (error) {
                console.error("Failed to decode JWT:", error);
                router.push('/');
            }
        } else {
             console.error("No id_token found in callback URL");
             router.push('/');
        }
    }, [router, login]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h1 className="text-2xl font-bold">Verifying your identity...</h1>
            <p className="text-muted-foreground">Please wait while we generate your secure proof. This may take a few seconds.</p>
        </div>
    );
}
