'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useStorage, useUser, addDocumentNonBlocking, uploadFileToStorage, useFirestore } from '@/firebase';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { paymentDetails } from '@/lib/payment-details';
import type { Payment } from '@/lib/types';
import { collection } from 'firebase/firestore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemDescription: string;
  amount: number;
}

export function PaymentModal({ isOpen, onClose, itemId, itemDescription, amount }: PaymentModalProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const storage = useStorage();
  const firestore = useFirestore();
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!screenshotFile || !user || !storage || !firestore) {
      toast({
        title: 'Submission Error',
        description: 'Please upload a screenshot of your payment.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const screenshotUrl = await uploadFileToStorage(storage, user.uid, screenshotFile);
      
      const paymentRef = collection(firestore, 'payments');
      const newPayment: Omit<Payment, 'id'> = {
        userId: user.uid,
        userName: user.displayName || 'N/A',
        userEmail: user.email || 'N/A',
        itemId,
        itemDescription,
        amount,
        currency: 'MMK',
        screenshotUrl,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // We don't await this so the UI can close instantly
      addDocumentNonBlocking(paymentRef, newPayment);

      toast({
        title: 'Payment Submitted!',
        description: 'Your payment is being verified. You will be notified once it is approved.',
      });
      onClose();
      setScreenshotFile(null);

    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error submitting your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            Complete your payment of **{amount.toLocaleString()} MMK** for '{itemDescription}' using one of the methods below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <h3 className="font-semibold">{paymentDetails.kpay.name}</h3>
                <Image src={paymentDetails.kpay.qrCodeUrl} alt="KPay QR" width={200} height={200} />
                <p className="text-sm">Name: {paymentDetails.kpay.accountName}</p>
                <p className="text-sm font-semibold">Phone: {paymentDetails.kpay.accountNumber}</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                <h3 className="font-semibold">{paymentDetails.wavepay.name}</h3>
                <Image src={paymentDetails.wavepay.qrCodeUrl} alt="WavePay QR" width={200} height={200} />
                <p className="text-sm">Name: {paymentDetails.wavepay.accountName}</p>
                <p className="text-sm font-semibold">Phone: {paymentDetails.wavepay.accountNumber}</p>
            </div>
        </div>
        <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Upload Payment Proof</h3>
            <p className="text-sm text-muted-foreground">After paying, please upload a screenshot of your transaction receipt.</p>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {screenshotFile && <p className="text-sm text-green-600">File selected: {screenshotFile.name}</p>}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit} disabled={isUploading || !screenshotFile}>
            {isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              <><UploadCloud className="mr-2 h-4 w-4" /> Submit for Verification</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
