'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from './ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

interface ExamProctorGuardProps {
  children: React.ReactNode;
  onSubmit: (isTimeUp: boolean) => void;
  isQuizActive: boolean; // To control when the guard is active
}

export function ExamProctorGuard({ children, onSubmit, isQuizActive }: ExamProctorGuardProps) {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [violationCount, setViolationCount] = useState(0);
  const isMounted = useRef(false);

  const requestFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  }, []);

  // Check fullscreen status
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    // Initial check in case component mounts into an already fullscreen window
    checkFullscreen();
    return () => document.removeEventListener('fullscreenchange', checkFullscreen);
  }, []);

  // Handle visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isQuizActive) {
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);

        if (newViolationCount === 1 || newViolationCount === 2) {
          toast({
            title: 'Cheating Detected!',
            description: `Do not switch tabs. This is violation #${newViolationCount}.`,
            variant: 'destructive',
            duration: 5000,
          });
        } else if (newViolationCount >= 3) {
          toast({
            title: 'Exam Terminated',
            description: 'You have switched tabs too many times. Your exam is being submitted.',
            variant: 'destructive',
            duration: 5000,
          });
          onSubmit(false); // isTimeUp = false
        }
      }
    };
    
    if (isQuizActive) {
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [violationCount, toast, onSubmit, isQuizActive]);
  
  // Request fullscreen on mount
  useEffect(() => {
    if (isQuizActive && !isMounted.current) {
        // We set a small timeout to ensure the UI is ready and the browser will accept the request.
        const timer = setTimeout(() => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false); // Show the modal immediately if not in fullscreen
            }
        }, 500);
        isMounted.current = true;
        return () => clearTimeout(timer);
    }
  }, [isQuizActive, requestFullscreen]);


  if (!isQuizActive) {
    return <>{children}</>;
  }

  return (
    <>
      <AlertDialog open={!isFullscreen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-destructive" />
                Fullscreen Required
            </AlertDialogTitle>
            <AlertDialogDescription>
              To ensure a fair testing environment, this exam must be taken in fullscreen mode. Please click the button below to continue. Exiting fullscreen will pause your exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={requestFullscreen}>
              Enter Fullscreen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className={cn(!isFullscreen && 'blur-sm pointer-events-none')}>
        {children}
      </div>
    </>
  );
}
