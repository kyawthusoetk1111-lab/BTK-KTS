'use client';

import { useState, useEffect } from 'react';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { subjects } from '@/lib/subjects';
import MultipleChoiceEditor from "./quiz/question-types/multiple-choice-editor";

interface QuizBankEditorProps {
  question: Question | null;
  onOpenChange: (open: boolean) => void;
  onSave: (question: Question) => void;
}

export function QuizBankEditor({ question, onOpenChange, onSave }: QuizBankEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setEditedQuestion(question);
  }, [question]);

  if (!editedQuestion) return null;

  const handleFieldChange = (field: keyof Question, value: any) => {
    setEditedQuestion(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleSaveChanges = () => {
    if (editedQuestion) {
      onSave(editedQuestion);
      onOpenChange(false);
      toast({ title: "Question Saved!" });
    }
  };

  const difficultyLevels: Array<'Easy' | 'Medium' | 'Hard'> = ['Easy', 'Medium', 'Hard'];

  return (
    <Sheet open={!!question} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-2xl sm:max-w-2xl p-0">
        {editedQuestion && (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6">
              <SheetTitle>မေးခွန်းပြင်ရန် (Edit Question)</SheetTitle>
              <SheetDescription>Make changes to your question and save them.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question-text">Question Text</Label>
                <Textarea
                  id="question-text"
                  value={editedQuestion.text}
                  onChange={(e) => handleFieldChange('text', e.target.value)}
                  rows={4}
                />
              </div>

              { (editedQuestion.type === 'multiple-choice' || editedQuestion.type === 'dropdown') && editedQuestion.options && (
                  <MultipleChoiceEditor 
                    options={editedQuestion.options}
                    onOptionsChange={(opts) => handleFieldChange('options', opts)}
                  />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="question-subject">Subject</Label>
                      <Select
                          value={editedQuestion.subject || ''}
                          onValueChange={(value) => handleFieldChange('subject', value)}
                      >
                          <SelectTrigger id="question-subject">
                              <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                              {subjects.map((subject) => (
                                  <SelectItem key={subject} value={subject}>
                                      {subject}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="question-difficulty">Difficulty</Label>
                      <Select
                          value={editedQuestion.difficulty || 'Medium'}
                          onValueChange={(value) => handleFieldChange('difficulty', value)}
                      >
                          <SelectTrigger id="question-difficulty">
                              <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                              {difficultyLevels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                      {level}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="question-points">Points</Label>
                <Input
                    id="question-points"
                    type="number"
                    value={editedQuestion.points}
                    onChange={(e) => handleFieldChange('points', parseInt(e.target.value, 10) || 0)}
                />
              </div>

            </div>
            <div className="p-6 border-t flex justify-end">
              <Button onClick={handleSaveChanges}>အပြောင်းအလဲများသိမ်းရန် (Save Changes)</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

    