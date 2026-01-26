'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Payment, Purchase } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { format } from 'date-fns';
import { Check, X, User, ShoppingCart, Calendar, Tag, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import NextImage from 'next/image';

function PaymentCard({ payment, onApprove, onReject, isProcessing }: { payment: Payment, onApprove: (payment: Payment) => void, onReject: (payment: Payment) => void, isProcessing: boolean }) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{payment.userName}</CardTitle>
                        <CardDescription>{payment.userEmail}</CardDescription>
                    </div>
                     <Badge variant="outline">{payment.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="text-sm space-y-2 text-muted-foreground">
                    <p className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> <span>{payment.itemDescription}</span></p>
                    <p className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> <span className="font-semibold text-foreground">{payment.amount.toLocaleString()} {payment.currency}</span></p>
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> <span>{format(new Date(payment.createdAt), 'PPp')}</span></p>
                </div>
                <div>
                     <a href={payment.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video w-full rounded-md overflow-hidden border">
                        <NextImage src={payment.screenshotUrl} alt="Payment Screenshot" fill style={{ objectFit: 'cover' }} />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                    </a>
                </div>
            </CardContent>
            {payment.status === 'pending' && (
                <CardFooter className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={() => onReject(payment)} disabled={isProcessing}>
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button className="w-full" onClick={() => onApprove(payment)} disabled={isProcessing}>
                        <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}


export default function PaymentVerificationPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const pendingQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'pending')) : null, [firestore]);
    const approvedQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'approved')) : null, [firestore]);
    const rejectedQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'rejected')) : null, [firestore]);

    const { data: pending, isLoading: loadingPending } = useCollection<Payment>(pendingQuery);
    const { data: approved, isLoading: loadingApproved } = useCollection<Payment>(approvedQuery);
    const { data: rejected, isLoading: loadingRejected } = useCollection<Payment>(rejectedQuery);

    const handleApprove = async (payment: Payment) => {
        if (!firestore) return;
        setProcessingId(payment.id);

        try {
            // Update payment status
            const paymentRef = doc(firestore, 'payments', payment.id);
            await updateDocumentNonBlocking(paymentRef, { status: 'approved' });

            // Create purchase record for the user
            const purchaseRef = collection(firestore, 'users', payment.userId, 'purchases');
            const newPurchase: Omit<Purchase, 'id'> = {
                userId: payment.userId,
                itemId: payment.itemId,
                itemType: payment.itemDescription.toLowerCase().includes('subscription') ? 'subscription' : 'quiz',
                itemDescription: payment.itemDescription,
                amountPaid: payment.amount,
                purchaseDate: new Date().toISOString(),
            };
            await addDocumentNonBlocking(purchaseRef, newPurchase);
            
            toast({
                title: 'Payment Approved!',
                description: `${payment.userName}'s purchase has been verified.`,
            });
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'Could not approve payment.', variant: 'destructive' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (payment: Payment) => {
        if (!firestore) return;
        setProcessingId(payment.id);

        try {
             const paymentRef = doc(firestore, 'payments', payment.id);
             await updateDocumentNonBlocking(paymentRef, { status: 'rejected' });
             toast({
                title: 'Payment Rejected',
                variant: 'destructive',
            });
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'Could not reject payment.', variant: 'destructive' });
        } finally {
             setProcessingId(null);
        }
    };

    const renderPaymentList = (payments: Payment[] | null, isLoading: boolean, emptyMessage: string) => {
        if (isLoading) {
            return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
        }

        if (!payments || payments.length === 0) {
            return <p className="text-center text-muted-foreground py-20">{emptyMessage}</p>;
        }

        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {payments.map(p => (
                    <PaymentCard 
                        key={p.id}
                        payment={p}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isProcessing={processingId === p.id}
                    />
                ))}
            </div>
        );
    };

    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Payment Verification</h2>
                    <p className="text-muted-foreground">
                        Approve or reject student payment submissions.
                    </p>
                </div>
            </div>
            
            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3 md:w-[600px] mb-6">
                    <TabsTrigger value="pending">
                        Pending
                        {pending && pending.length > 0 && <Badge className="ml-2">{pending.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                    {renderPaymentList(pending, loadingPending, 'No pending payments.')}
                </TabsContent>
                <TabsContent value="approved">
                     {renderPaymentList(approved, loadingApproved, 'No approved payments yet.')}
                </TabsContent>
                <TabsContent value="rejected">
                    {renderPaymentList(rejected, loadingRejected, 'No rejected payments.')}
                </TabsContent>
            </Tabs>
        </main>
    );
}
