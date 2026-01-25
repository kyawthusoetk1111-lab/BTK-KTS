"use client";

import type { Section, Question, QuestionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, PlusCircle, GripVertical } from "lucide-react";
import QuestionEditor from "./question-editor";

interface SectionEditorProps {
  section: Section;
  sectionNumber: number;
  onUpdate: (section: Section) => void;
  onDelete: (sectionId: string) => void;
}

export default function SectionEditor({ section, sectionNumber, onUpdate, onDelete }: SectionEditorProps) {
  
  const handleNameChange = (name: string) => {
    onUpdate({ ...section, name });
  };
  
  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'multiple-choice',
      text: '',
      points: 10,
      options: [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
      matchingPairs: [],
    };
    onUpdate({ ...section, questions: [...section.questions, newQuestion] });
  };

  const updateQuestion = (updatedQuestion: Question) => {
    onUpdate({
      ...section,
      questions: section.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q),
    });
  };
  
  const deleteQuestion = (questionId: string) => {
    onUpdate({
      ...section,
      questions: section.questions.filter(q => q.id !== questionId),
    });
  };

  const calculateSectionPoints = () => {
    return section.questions.reduce((total, q) => total + (Number(q.points) || 0), 0);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 p-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 flex-grow">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <Input 
                value={section.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-lg font-headline font-semibold border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-0 h-auto"
            />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{calculateSectionPoints()} pts</span>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(section.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {section.questions.map((question, index) => (
            <Accordion key={question.id} type="single" collapsible className="w-full bg-background border rounded-lg">
                <AccordionItem value={`item-${question.id}`} className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                <span className="font-semibold">Question {index + 1}</span>
                                <span className="text-muted-foreground truncate max-w-xs">{question.text || '...'}</span>
                            </div>
                            <div className="flex items-center gap-2 pr-2">
                                <span className="text-sm font-medium text-muted-foreground">{question.points || 0} pts</span>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive rounded-full h-8 w-8" onClick={(e) => {e.stopPropagation(); deleteQuestion(question.id)}}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <QuestionEditor question={question} onUpdate={updateQuestion} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        ))}

        <Button variant="outline" className="w-full border-dashed" onClick={addQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
        </Button>
      </CardContent>
    </Card>
  );
}
