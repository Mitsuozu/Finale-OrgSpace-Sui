'use client';

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { members, whitelistedDomains } from "@/lib/data";
import MemberTable from "@/components/admin/member-table";
import DomainManager from "@/components/admin/domain-manager";

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !user.isAdmin) {
                setIsAuthorized(false);
                setTimeout(() => router.push('/'), 3000);
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, authLoading, router]);

    if (authLoading || isAuthorized === null) {
        return (
            <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Verifying authorization...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-10rem)] text-center p-4">
                <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-muted-foreground">You are not authorized to view this page. Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8 font-headline">Admin Dashboard</h1>
            <div className="space-y-12">
                <MemberTable members={members} />
                <DomainManager domains={whitelistedDomains} />
            </div>
        </div>
    );
}
