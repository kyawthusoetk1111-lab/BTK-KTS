'use client';

import type { Question } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LatexRenderer } from '../latex-renderer';

interface QuestionRendererProps {
    question: Question;
    answer: any;
    onAnswerChange: (answer: any) => void;
    passageText?: string;
}

export function QuestionRenderer({ question, answer, onAnswerChange, passageText }: QuestionRendererProps) {
    
    return (
        <div className="space-y-4">
             {passageText && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                    <h4 className="font-semibold mb-2 text-muted-foreground">Linked Passage</h4>
                    <LatexRenderer text={passageText} className="whitespace-pre-wrap" />
                </div>
            )}
            <LatexRenderer text={question.text} className="text-lg font-semibold" />
            
            {question.type === 'multiple-choice' && (
                 <RadioGroup onValueChange={onAnswerChange} value={answer} className="space-y-2">
                    {question.options.map(opt => (
                        <div key={opt.id} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-secondary">
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
                       <div key={opt.id} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-secondary">
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
