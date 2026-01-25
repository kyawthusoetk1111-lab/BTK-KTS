'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Payment, Purchase } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Users, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { AuthButton } from '@/components/auth-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagementTable } from '@/components/admin/user-management';


export default function AdminPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

    const paymentsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'payments'), where('status', '==', filter));
    }, [firestore, filter]);

    const { data: payments, isLoading: isLoadingPayments } = useCollection<Payment>(paymentsQuery);

    const handleApprove = (payment: Payment) => {
        if (!firestore) return;
        
        const paymentRef = doc(firestore, 'payments', payment.id);
        updateDocumentNonBlocking(paymentRef, { status: 'approved' });

        if (payment.itemId === 'pro-upgrade') {
            const userRef = doc(firestore, 'users', payment.userId);
            updateDocumentNonBlocking(userRef, { accountTier: 'pro' });
        } else {
            const purchaseRef = collection(firestore, 'users', payment.userId, 'purchases');
            const newPurchase: Omit<Purchase, 'id'> = {
                userId: payment.userId,
                itemId: payment.itemId,
                itemType: 'quiz',
                itemDescription: payment.itemDescription,
                amountPaid: payment.amount,
                purchaseDate: new Date().toISOString(),
            };
            addDocumentNonBlocking(purchaseRef, newPurchase);
        }

        toast({
            title: 'Payment Approved!',
            description: `${payment.userName}'s payment for ${payment.itemDescription} has been approved.`,
        });
    };

    const handleReject = (payment: Payment) => {
        if (!firestore) return;
        const paymentRef = doc(firestore, 'payments', payment.id);
        updateDocumentNonBlocking(paymentRef, { status: 'rejected' });
        toast({
            title: 'Payment Rejected',
            variant: 'destructive',
        });
    };

    return (
         <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-primary">
                        <Activity />
                        Admin Dashboard
                    </Link>
                    <AuthButton />
                </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <Tabs defaultValue="payments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payments">Payment Verification</TabsTrigger>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                </TabsList>
                <TabsContent value="payments">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CreditCard/>Payment Verification</CardTitle>
                            <CardDescription>Review and approve or reject user payments.</CardDescription>
                            <div className="flex space-x-2 pt-4">
                                <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pending</Button>
                                <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')}>Approved</Button>
                                <Button variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')}>Rejected</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingPayments ? (
                                <div className="flex justify-center items-center h-64">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Screenshot</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments && payments.length > 0 ? payments.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>
                                                    <div className="font-medium">{p.userName}</div>
                                                    <div className="text-sm text-muted-foreground">{p.userEmail}</div>
                                                </TableCell>
                                                <TableCell>{p.itemDescription}</TableCell>
                                                <TableCell>{p.amount.toLocaleString()} {p.currency}</TableCell>
                                                <TableCell>{format(new Date(p.createdAt), 'PPp')}</TableCell>
                                                <TableCell>
                                                    <a href={p.screenshotUrl} target="_blank" rel="noopener noreferrer">
                                                        <Image src={p.screenshotUrl} alt="Payment proof" width={100} height={100} className="rounded-md object-cover"/>
                                                    </a>
                                                </TableCell>
                                                <TableCell>
                                                    {p.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleApprove(p)}><Check className="mr-2"/>Approve</Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleReject(p)}><X className="mr-2"/>Reject</Button>
                                                        </div>
                                                    )}
                                                    {p.status !== 'pending' && <Badge variant={p.status === 'approved' ? 'secondary' : 'destructive'}>{p.status}</Badge>}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24">No {filter} payments found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users />User Management</CardTitle>
                            <CardDescription>View, edit, and manage user roles and permissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserManagementTable />
                        </CardContent>
                    </Card>
                </TabsContent>
               </Tabs>
            </main>
        </div>
    );
}
