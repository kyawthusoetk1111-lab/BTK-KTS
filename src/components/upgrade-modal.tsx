'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, ShieldCheck, FileText } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <Rocket className="text-primary" />
            Upgrade to QuizCraft Pro
          </DialogTitle>
          <DialogDescription className="pt-2">
            You've reached the limit for the free plan. Upgrade to unlock unlimited quizzes and premium features.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-4">
            <h3 className="font-semibold">Pro features include:</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>**Unlimited Quizzes**: Create as many quizzes as you need without any restrictions.</span>
                </li>
                <li className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>**Anti-Cheat Guard**: Enable fullscreen enforcement and tab-switching detection to ensure exam integrity.</span>
                </li>
                 <li className="flex items-start gap-3">
                    <Rocket className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>**Monetize Your Quizzes**: Set a price for your premium quizzes and earn from your content.</span>
                </li>
            </ul>
        </div>
        <div className="flex justify-end">
          <Button onClick={onUpgrade} size="lg">Upgrade Now (5,000 MMK)</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    