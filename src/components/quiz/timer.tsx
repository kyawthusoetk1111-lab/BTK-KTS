'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimerProps {
    durationInMinutes: number;
    onTimeUp: () => void;
}

export function Timer({ durationInMinutes, onTimeUp }: TimerProps) {
    const { toast } = useToast();
    const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            toast({
                title: "Time's up!",
                description: "Your quiz has been automatically submitted.",
                variant: "destructive"
            })
            onTimeUp();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp, toast]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const isLowTime = timeLeft < 5 * 60; // 5 minutes

    return (
        <div className={`flex items-center gap-2 font-medium p-2 rounded-md ${isLowTime ? 'text-destructive' : ''}`}>
            <Clock className="h-5 w-5" />
            <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
        </div>
    )
}

    