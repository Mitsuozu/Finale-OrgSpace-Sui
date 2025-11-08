
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { verifyBadge } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Search } from 'lucide-react';
import type { Member } from '@/lib/types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card';

const badgeCheckerSchema = z.object({
  badgeId: z.string().min(1, 'Badge ID is required.'),
  zkAddress: z.string().min(10, 'A valid zkLogin address is required.'),
});

type BadgeCheckerFormValues = z.infer<typeof badgeCheckerSchema>;

export default function PublicBadgeChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ member: Member; success: boolean } | { message: string; success: boolean } | null>(null);

  const form = useForm<BadgeCheckerFormValues>({
    resolver: zodResolver(badgeCheckerSchema),
    defaultValues: {
      badgeId: '',
      zkAddress: '',
    },
  });

  async function onSubmit(data: BadgeCheckerFormValues) {
    setLoading(true);
    setResult(null);
    const apiResult = await verifyBadge(data.badgeId, data.zkAddress);
    setResult(apiResult as any);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="badgeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge ID</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., badge-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zkAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>zkLogin Address</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 0x123..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Check Badge
          </Button>
        </form>
      </Form>
      
      {result && (
        result.success && 'member' in result ? (
          <Alert>
             <CheckCircle className="h-4 w-4" />
            <AlertTitle>Badge is Verified!</AlertTitle>
            <AlertDescription className="space-y-2 mt-2 text-xs">
              <p><strong>Name:</strong> {result.member.name}</p>
              <p><strong>Program:</strong> {result.member.program}</p>
              <p><strong>Status:</strong> <span className="font-semibold capitalize">{result.member.status}</span></p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              {'message' in result && result.message}
            </AlertDescription>
          </Alert>
        )
      )}
    </div>
  );
}
