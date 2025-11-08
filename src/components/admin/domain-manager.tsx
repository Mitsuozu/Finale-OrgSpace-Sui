'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { addAllowedDomain, removeAllowedDomain } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { WhitelistedDomain } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DomainManager({ initialDomains }: { initialDomains: WhitelistedDomain[] }) {
  const [newDomain, setNewDomain] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAddDomain = () => {
    startTransition(async () => {
      const result = await addAllowedDomain(newDomain);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: 'Success', description: result.success });
        setNewDomain('');
      }
    });
  };

  const handleRemoveDomain = (id: string) => {
    startTransition(async () => {
      const result = await removeAllowedDomain(id);
       if (result.error) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        toast({ title: 'Success', description: result.success });
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Whitelist</CardTitle>
        <CardDescription>Manage email domains allowed for zkLogin.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="e.g., @university.edu" 
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            disabled={isPending}
            onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
          />
          <Button onClick={handleAddDomain} disabled={isPending || !newDomain.startsWith('@')}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 sm:mr-2" />}
            <span className="hidden sm:inline">Add Domain</span>
          </Button>
        </div>
        <div className="rounded-md border">
          <ul className="divide-y divide-border">
            {initialDomains.map((domain) => (
              <li key={domain.id} className="flex items-center justify-between p-3">
                <span className="font-mono text-sm">{domain.domain}</span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isPending}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the domain <span className="font-semibold">{domain.domain}</span> from the whitelist. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveDomain(domain.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
             {initialDomains.length === 0 && (
                <li className="p-4 text-center text-sm text-muted-foreground">No domains whitelisted.</li>
             )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
