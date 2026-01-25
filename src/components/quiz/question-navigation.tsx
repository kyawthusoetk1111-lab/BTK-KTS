'use client';

import type { Question, Section } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestionNavigationProps {
    sections: Section[];
    currentSectionIndex: number;
    answers: Record<string, any>;
    onQuestionSelect: (index: number) => void;
}

export function QuestionNavigation({ sections, currentSectionIndex, answers, onQuestionSelect }: QuestionNavigationProps) {
    
    const allQuestions = sections.flatMap(s => s.questions);

    let sectionStart = 0;
    let currentSectionStartIndex = -1;
    for (let i = 0; i < sections.length; i++) {
        if (i === currentSectionIndex) {
            currentSectionStartIndex = sectionStart;
            break;
        }
        sectionStart += sections[i].questions.length;
    }
    const currentSectionLength = sections[currentSectionIndex]?.questions.length || 0;
    const currentSectionEndIndex = currentSectionStartIndex + currentSectionLength;
    
    return (
        <div className="grid grid-cols-5 gap-2">
            {allQuestions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null;
                const isCurrent = currentSectionStartIndex !== -1 && index >= currentSectionStartIndex && index < currentSectionEndIndex;
                
                return (
                    <Button
                        key={q.id}
                        variant="outline"
                        className={cn(
                            "h-10 w-10 p-0",
                            isCurrent && "ring-2 ring-primary ring-offset-2",
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
