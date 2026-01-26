"use client";

import { useState } from "react";
import type { Section, Question } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, PlusCircle, GripVertical, Library } from "lucide-react";
import QuestionEditor from "./question-editor";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "./ui/sheet";
import { QuizBankBrowser } from "./quiz-bank-browser";
import { useToast } from "@/hooks/use-toast";

interface SectionEditorProps {
  section: Section;
  sectionNumber: number;
  onUpdate: (section: Section) => void;
  onDelete: (sectionId: string) => void;
}

export default function SectionEditor({ section, sectionNumber, onUpdate, onDelete }: SectionEditorProps) {
  const [isBankOpen, setIsBankOpen] = useState(false);
  const { toast } = useToast();
  
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
      dropdowns: [],
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
  
  const handleImportFromBank = (questionsToImport: Question[]) => {
    const newQuestions = questionsToImport.map(q => ({
      ...q,
      id: crypto.randomUUID(), // Give it a new ID for this quiz instance
      options: q.options?.map(o => ({ ...o, id: crypto.randomUUID() })) || [],
      matchingPairs: q.matchingPairs?.map(p => ({ ...p, id: crypto.randomUUID() })) || [],
      dropdowns: q.dropdowns?.map(d => ({
        ...d,
        id: crypto.randomUUID(),
        options: d.options.map(o => ({...o, id: crypto.randomUUID()}))
      })) || [],
      sourceQuizId: q.id, // Keep track of the original bank question ID
    }));
    onUpdate({ ...section, questions: [...section.questions, ...newQuestions] });
    setIsBankOpen(false);
    toast({ title: `${newQuestions.length} question(s) imported successfully!` });
  };

  const passageQuestions = section.questions.filter(q => q.type === 'passage');

  return (
    <>
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
                                  <div
                                      role="button"
                                      aria-label="Delete question"
                                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-muted-foreground hover:text-destructive rounded-full h-8 w-8")}
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          deleteQuestion(question.id);
                                      }}
                                  >
                                      <Trash2 className="h-4 w-4" />
                                  </div>
                              </div>
                          </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 pt-0">
                          <QuestionEditor question={question} onUpdate={updateQuestion} passageQuestions={passageQuestions} />
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
          ))}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full border-dashed" onClick={addQuestion}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Question
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsBankOpen(true)}>
                <Library className="mr-2 h-4 w-4" />
                မေးခွန်းဘဏ်မှ ထုတ်ယူရန်
            </Button>
          </div>
        </CardContent>
      </Card>
      <Sheet open={isBankOpen} onOpenChange={setIsBankOpen}>
        <SheetContent className="w-full max-w-2xl sm:max-w-2xl p-0">
           <QuizBankBrowser onImport={handleImportFromBank} />
        </SheetContent>
      </Sheet>
    </>
  );
}
