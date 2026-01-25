'use client';

import type { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestionNavigationProps {
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<string, any>;
    onQuestionSelect: (index: number) => void;
}

export function QuestionNavigation({ questions, currentQuestionIndex, answers, onQuestionSelect }: QuestionNavigationProps) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null;
                const isCurrent = index === currentQuestionIndex;
                
                return (
                    <Button
                        key={q.id}
                        variant="outline"
                        className={cn(
                            "h-10 w-10 p-0",
                            isCurrent && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                            !isCurrent && isAnswered && "bg-secondary text-secondary-foreground",
                        )}
                        onClick={() => onQuestionSelect(index)}
                    >
                        {index + 1}
                    </Button>
                );
            })}
        </div>
    )
}

    