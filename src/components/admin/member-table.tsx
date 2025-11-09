'use client';

import { useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { manageMembership } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Member } from '@/lib/types';

export default function MemberTable({ members }: { members: Member[] }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAction = (id: string, action: 'verify' | 'revoke') => {
    startTransition(async () => {
        const result = await manageMembership(id, action);
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
        <CardTitle>Member Management</CardTitle>
        <CardDescription>View, verify, and revoke memberships.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Program</TableHead>
                        <TableHead className="hidden lg:table-cell">Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {members.length > 0 ? members.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell className="hidden md:table-cell">{member.program}</TableCell>
                            <TableCell className="hidden lg:table-cell text-xs font-mono truncate max-w-[200px]">{member.address}</TableCell>
                            <TableCell>
                                <Badge variant={member.status === 'verified' ? 'default' : member.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled={isPending}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {member.status !== 'verified' && (
                                            <DropdownMenuItem onClick={() => handleAction(member.id, 'verify')}>
                                                <Check className="mr-2 h-4 w-4" />
                                                Verify
                                            </DropdownMenuItem>
                                        )}
                                        {member.status !== 'revoked' && (
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleAction(member.id, 'revoke')}>
                                                <X className="mr-2 h-4 w-4" />
                                                Revoke
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No members found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
