'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { registerMember } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';

const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  program: z.string().min(3, 'Program must be at least 3 characters.'),
  studentNumber: z.string().min(1, 'Student number is required.'),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegistrationForm({ user }: { user: User }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: user.name || '',
      program: '',
      studentNumber: '',
    },
  });

  async function onSubmit(data: RegistrationFormValues) {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('program', data.program);
    formData.append('studentNumber', data.studentNumber);
    formData.append('address', user.zkAddress);
    // Pass the whole user object to the server action
    formData.append('user', JSON.stringify(user));

    const result = await registerMember(formData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: result.error,
      });
    } else {
      toast({
        title: 'Registration Submitted',
        description: result.success,
      });
      // A small delay to allow the user to see the toast before reload
      setTimeout(() => window.location.reload(), 1500);
    }
    setLoading(false);
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Become a Member</CardTitle>
        <CardDescription>
          You are not yet registered as a member. Complete the form below to apply. Your zkLogin address will be associated with your membership.
        </CardDescription>
        <p className="text-xs text-muted-foreground pt-2">
            Address: <span className="font-mono bg-secondary px-1 py-0.5 rounded">{user.zkAddress}</span>
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="program"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program / Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Registration
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
