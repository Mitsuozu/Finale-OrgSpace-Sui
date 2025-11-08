'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyBadge } from '@/lib/actions';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { Member } from '@/lib/types';

const badgeCheckerSchema = z.object({
  badgeId: z.string().min(1, 'Badge ID is required.'),
  holderAddress: z.string().min(1, 'Holder address is required.'),
});

type BadgeCheckerFormValues = z.infer<typeof badgeCheckerSchema>;

type VerificationResult = {
  status: 'success' | 'error' | 'idle';
  message: string;
  member?: Member;
};

export default function PublicBadgeChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult>({ status: 'idle', message: '' });

  const form = useForm<BadgeCheckerFormValues>({
    resolver: zodResolver(badgeCheckerSchema),
    defaultValues: {
      badgeId: '',
      holderAddress: '',
    },
  });

  const onSubmit: SubmitHandler<BadgeCheckerFormValues> = async (data) => {
    setLoading(true);
    setResult({ status: 'idle', message: '' });
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await verifyBadge(data.badgeId, data.holderAddress);
    if (response.success && response.member) {
      setResult({ status: 'success', message: 'Badge is authentic and verified.', member: response.member });
    } else {
      setResult({ status: 'error', message: response.message || 'Badge could not be verified.' });
    }
    setLoading(false);
  };

  return (
    <Card className="w-full text-left shadow-lg">
      <CardContent className="p-6">
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
              name="holderAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holder Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 0x1234...cdef" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Badge
            </Button>
          </form>
        </Form>
        {result.status !== 'idle' && (
          <Alert className="mt-4" variant={result.status === 'success' ? 'default' : 'destructive'}>
            {result.status === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{result.status === 'success' ? 'Verification Successful' : 'Verification Failed'}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.member && (
                 <div className="mt-2 text-sm space-y-1">
                    <div><strong>Name:</strong> {result.member.name}</div>
                    <div><strong>Program:</strong> {result.member.program}</div>
                    <div><strong>Status:</strong> <span className="capitalize font-semibold">{result.member.status}</span></div>
                 </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
