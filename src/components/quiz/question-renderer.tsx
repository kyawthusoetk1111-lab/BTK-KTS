'use client';

import type { Question } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LatexRenderer } from '../latex-renderer';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface QuestionRendererProps {
    question: Question;
    answer: any;
    onAnswerChange: (answer: any) => void;
    passageText?: string;
    showInstantFeedback?: boolean;
}

export function QuestionRenderer({ question, answer, onAnswerChange, passageText, showInstantFeedback }: QuestionRendererProps) {
    
    const getIsCorrect = (question: Question, answer: any): boolean | null => {
        if (answer === undefined || answer === null || answer === '') return null;

        if (question.type === 'multiple-choice' || question.type === 'dropdown') {
            const correctOption = question.options.find(o => o.isCorrect);
            return correctOption?.id === answer;
        }
        if (question.type === 'true-false') {
            const correctOption = question.options.find(o => o.isCorrect);
            return correctOption?.text === answer;
        }
        return null;
    }

    const getOptionClass = (optionId: string) => {
        if (!showInstantFeedback || answer === undefined || answer === null || answer === '') return '';
        const correctOption = question.options.find(o => o.isCorrect);
        if (!correctOption) return '';

        const isSelected = optionId === answer;
        const isCorrect = optionId === correctOption.id;

        if (isSelected) {
            return isCorrect 
                ? 'border-green-500 bg-green-100/50 dark:bg-green-900/50' 
                : 'border-red-500 bg-red-100/50 dark:bg-red-900/50';
        }

        if (isCorrect && answer !== correctOption.id) {
            return 'border-green-500 bg-green-100/50 dark:bg-green-900/50';
        }
        
        return '';
    };
    
    const getTrueFalseOptionClass = (optionText: string) => {
        if (!showInstantFeedback || answer === undefined || answer === null || answer === '') return '';
        const correctOption = question.options.find(o => o.isCorrect);
        if (!correctOption) return '';

        const isSelected = optionText === answer;
        const isCorrect = optionText === correctOption.text;

        if (isSelected) {
            return isCorrect
                ? 'border-green-500 bg-green-100/50 dark:bg-green-900/50' 
                : 'border-red-500 bg-red-100/50 dark:bg-red-900/50';
        }
        
        if (isCorrect && answer !== correctOption.text) {
             return 'border-green-500 bg-green-100/50 dark:bg-green-900/50';
        }

        return '';
    };

    return (
        <div className="space-y-4">
             {passageText && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                    <h4 className="font-semibold mb-2 text-muted-foreground">Linked Passage</h4>
                    <LatexRenderer text={passageText} className="whitespace-pre-wrap" />
                </div>
            )}
            <LatexRenderer text={question.text} className="text-lg font-semibold" />
            
            {(question.imageUrl || question.audioUrl) && (
              <div className="space-y-4 my-4">
                {question.imageUrl && (
                  <div className="relative w-full aspect-video">
                    <Image src={question.imageUrl} alt="Question content" fill objectFit="contain" className="rounded-lg border" />
                  </div>
                )}
                {question.audioUrl && (
                  <div>
                    <audio controls src={question.audioUrl} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            )}

            {question.type === 'multiple-choice' && (
                 <RadioGroup onValueChange={onAnswerChange} value={answer} className="space-y-2">
                    {question.options.map(opt => (
                        <div key={opt.id} className={cn("flex items-center space-x-3 p-3 border rounded-md transition-colors", !showInstantFeedback && 'has-[:checked]:bg-secondary', getOptionClass(opt.id))}>
                            <RadioGroupItem value={opt.id} id={opt.id} />
                            <Label htmlFor={opt.id} className="flex-1 cursor-pointer">
                                <LatexRenderer text={opt.text} />
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            )}

            {question.type === 'true-false' && (
                <RadioGroup onValueChange={onAnswerChange} value={answer} className="space-y-2">
                   {question.options.map(opt => (
                       <div key={opt.id} className={cn("flex items-center space-x-3 p-3 border rounded-md transition-colors", !showInstantFeedback && "has-[:checked]:bg-secondary", getTrueFalseOptionClass(opt.text))}>
                           <RadioGroupItem value={opt.text} id={opt.id} />
                           <Label htmlFor={opt.id} className="flex-1 cursor-pointer">
                               <LatexRenderer text={opt.text} />
                           </Label>
                       </div>
                   ))}
               </RadioGroup>
            )}

            {question.type === 'short-answer' && (
                <Input 
                    value={answer || ''}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    placeholder="Your answer"
                />
            )}

            {question.type === 'essay' && (
                <Textarea
                    value={answer || ''}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    placeholder="Your essay response"
                    rows={10}
                />
            )}

            {(question.type === 'matching' || question.type === 'dropdown') && (
                <div className="p-4 bg-muted/50 rounded-lg border text-center text-muted-foreground">
                    <p>This question type is not yet supported in the student view.</p>
                </div>
            )}
            
            {question.type === 'passage' && !question.passageId && (
                <div className="p-4 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
                    <p>This is a passage. Questions linked to it will appear separately.</p>
                </div>
            )}
        </div>
    )
}
