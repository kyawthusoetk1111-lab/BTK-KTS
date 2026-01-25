"use client";

import { useState } from "react";
import type { Quiz, Section } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import SectionEditor from "@/components/section-editor";
import { PlusCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface QuizEditorProps {
  initialQuiz: Quiz;
}

export function QuizEditor({ initialQuiz }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);
  const { toast } = useToast();

  const handleQuizDetailsChange = (
    field: "name" | "description",
    value: string
  ) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      name: `Section ${quiz.sections.length + 1}`,
      questions: [],
    };
    setQuiz((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  const updateSection = (updatedSection: Section) => {
    setQuiz((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === updatedSection.id ? updatedSection : s
      ),
    }));
  };

  const deleteSection = (sectionId: string) => {
    setQuiz((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
  };

  const calculateTotalPoints = () => {
    return quiz.sections.reduce((total, section) => {
      return total + section.questions.reduce((sectionTotal, question) => {
        return sectionTotal + (Number(question.points) || 0);
      }, 0);
    }, 0);
  };
  
  const handleSave = () => {
    // In a real app, you would send this to your backend API
    console.log("Saving quiz:", JSON.stringify(quiz, null, 2));
    toast({
      title: "Quiz Saved!",
      description: "Your quiz has been successfully saved.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold font-headline text-primary">
                QuizCraft Pro
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Total Points: {calculateTotalPoints()}
              </span>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Quiz
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold font-headline tracking-tight">Quiz Details</h2>
              <div>
                <Input
                  placeholder="Quiz Name"
                  value={quiz.name}
                  onChange={(e) => handleQuizDetailsChange("name", e.target.value)}
                  className="text-2xl font-bold h-12 font-headline"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Quiz Description"
                  value={quiz.description}
                  onChange={(e) =>
                    handleQuizDetailsChange("description", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {quiz.sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                sectionNumber={index + 1}
                onUpdate={updateSection}
                onDelete={deleteSection}
              />
            ))}
          </div>

          <div>
            <Button variant="outline" className="w-full" onClick={addSection}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
