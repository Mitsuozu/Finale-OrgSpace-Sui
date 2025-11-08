'use client';

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import RegistrationForm from "@/components/dashboard/registration-form";
import { findMemberByAddress } from "@/lib/data";
import type { Member } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Clock, XCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { verifyBadge } from "@/lib/actions";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [memberInfo, setMemberInfo] = useState<Member | null | undefined>(undefined);
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Using a memoized version of the member data to avoid re-running findMemberByAddress on every render
    const currentMemberInfo = useMemo(() => {
        if (user) {
            return findMemberByAddress(user.zkAddress);
        }
        return null;
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        } else if (user) {
            setMemberInfo(currentMemberInfo);
        }
    }, [user, authLoading, router, currentMemberInfo]);

    const handleVerifyBadge = async () => {
        if (!memberInfo) return;
        setIsVerifying(true);
        toast({
            title: "Verifying Badge...",
            description: "Please wait while we confirm your badge on-chain.",
        });

        const result = await verifyBadge(memberInfo.id, memberInfo.address);

        if (result.success) {
            toast({
                title: "Badge Verified!",
                description: "Your membership badge is authentic and active.",
            });
        } else {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: result.message || "Your badge could not be verified on-chain.",
            });
        }
        setIsVerifying(false);
    };

    if (authLoading || memberInfo === undefined) {
        return (
            <div className="flex items-center justify-center h-full min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8 font-headline">Your Dashboard</h1>
            {memberInfo ? (
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                            <span>Membership Status</span>
                            <Badge variant={memberInfo.status === 'verified' ? 'default' : memberInfo.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                                {memberInfo.status === 'verified' && <CheckCircle className="mr-2 h-4 w-4" />}
                                {memberInfo.status === 'pending' && <Clock className="mr-2 h-4 w-4" />}
                                {memberInfo.status === 'revoked' && <XCircle className="mr-2 h-4 w-4" />}
                                {memberInfo.status}
                            </Badge>
                        </CardTitle>
                        <CardDescription>Welcome back, {memberInfo.name}. Here's your membership overview.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 border rounded-lg bg-secondary/50 space-y-2 text-sm">
                            <div><strong>Name:</strong> {memberInfo.name}</div>
                            <div><strong>Program:</strong> {memberInfo.program}</div>
                            <div><strong>Student Number:</strong> {memberInfo.studentNumber}</div>
                            <div><strong>Badge ID:</strong> {memberInfo.id}</div>
                            <div><strong>zkLogin Address:</strong> <span className="text-xs break-all font-mono bg-background/50 px-1 py-0.5 rounded">{memberInfo.address}</span></div>
                        </div>
                         <Button onClick={handleVerifyBadge} disabled={isVerifying}>
                            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            Verify My Badge
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                user && <RegistrationForm user={user} />
            )}
        </div>
    );
}
