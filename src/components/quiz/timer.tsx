'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimerProps {
    deadline: number; // Deadline as a timestamp (Date.now())
    onTimeUp: () => void;
}

export function Timer({ deadline, onTimeUp }: TimerProps) {
    const { toast } = useToast();
    const [timeLeft, setTimeLeft] = useState(Math.max(0, deadline - Date.now()));

    useEffect(() => {
        const intervalId = setInterval(() => {
            const remaining = Math.max(0, deadline - Date.now());
            setTimeLeft(remaining);

            if (remaining === 0) {
                toast({
                    title: "Time's up!",
                    description: "Your quiz has been automatically submitted.",
                    variant: "destructive"
                });
                onTimeUp();
                clearInterval(intervalId);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [deadline, onTimeUp, toast]);

    const totalSeconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const isLowTime = totalSeconds < 5 * 60; // 5 minutes

    return (
        <div className={`flex items-center gap-2 font-medium p-2 rounded-md ${isLowTime ? 'text-destructive' : ''}`}>
            <Clock className="h-5 w-5" />
            <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
    )
}
