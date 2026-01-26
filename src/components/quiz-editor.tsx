"use client";

import { useState } from "react";
import type { Quiz, Section } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import SectionEditor from "@/components/section-editor";
import { PlusCircle, Save, CalendarIcon, Eye, Copy, ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subjects } from "@/lib/subjects";
import { Switch } from "./ui/switch";
import { useParams, useRouter } from "next/navigation";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Badge } from "@/components/badge";

interface QuizEditorProps {
  initialQuiz: Quiz;
}

export function QuizEditor({ initialQuiz }: QuizEditorProps) {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz);
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const handleQuizDetailsChange = (
    field: keyof Quiz,
    value: string | number | boolean | undefined
  ) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };
  
  const handlePremiumToggle = (checked: boolean) => {
    setQuiz(prev => {
        const newState = { ...prev, isPremium: checked };
        if (checked) {
            if (newState.price === undefined || newState.price === null) {
                newState.price = 0;
            }
        } else {
            newState.price = 0;
        }
        return newState;
    });
  };

  const handleDateChange = (field: "startDate" | "endDate", date: Date | undefined) => {
    if (date) {
        setQuiz((prev) => ({ ...prev, [field]: date.toISOString() }));
    }
}

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

  const handlePreview = () => {
    // If it's a new, unsaved quiz, store it in localStorage for the preview page to pick up.
    if (params.id === 'new') {
      localStorage.setItem('quiz-preview', JSON.stringify(quiz));
    }
  };
  
  const handleSave = async () => {
    if (!user || !firestore) {
        toast({
            title: "Error",
            description: "Could not save quiz. User not logged in.",
            variant: "destructive"
        });
        return;
    }

    setIsSaving(true);
    const isNewQuiz = params.id === 'new';

    const quizToSave: Quiz = {
        ...quiz,
        ownerId: user.uid,
        updatedAt: new Date().toISOString(),
        createdAt: quiz.createdAt || new Date().toISOString()
    }

    const quizDocRef = doc(firestore, 'quizzes', quiz.id);

    try {
        await setDoc(quizDocRef, quizToSave, { merge: true });

        toast({
          title: "Quiz Saved!",
          description: "Your quiz has been successfully saved.",
        });

        // If it was a new quiz, redirect to the edit page for that quiz
        if (isNewQuiz) {
            router.replace(`/quizzes/${quiz.id}/edit`);
        }
    } catch (error) {
        console.error("Error saving quiz:", error);
        toast({
            title: "Save Failed",
            description: "There was an error saving your quiz. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const previewId = params.id;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold font-headline text-primary">
                BTK EXAM
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                Total Points: {calculateTotalPoints()}
              </span>
              <Link href={`/quizzes/${previewId}/preview`} target="_blank" onClick={handlePreview}>
                <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Preview</span>
                </Button>
              </Link>
              <Button onClick={handleSave} disabled={isSaving} size="sm">
                {isSaving ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground sm:mr-2"></div> 
                        <span className="hidden sm:inline">Saving...</span>
                    </>
                ) : (
                    <>
                        <Save className="h-4 w-4 sm:mr-2" /> 
                        <span className="hidden sm:inline">Save Quiz</span>
                    </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Quiz Details</h2>

                <div className="space-y-2">
                    <Label htmlFor="quiz-name">Quiz Name</Label>
                    <Input
                        id="quiz-name"
                        placeholder="Quiz Name"
                        value={quiz.name}
                        onChange={(e) => handleQuizDetailsChange("name", e.target.value)}
                        className="text-xl font-bold h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quiz-description">Quiz Description</Label>
                    <Textarea
                        id="quiz-description"
                        placeholder="A brief summary of what this quiz is about."
                        value={quiz.description}
                        onChange={(e) => handleQuizDetailsChange("description", e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="quiz-subject">Subject</Label>
                        <Select
                            value={quiz.subject || ''}
                            onValueChange={(value) => handleQuizDetailsChange('subject', value)}
                        >
                            <SelectTrigger id="quiz-subject">
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
                        <Label htmlFor="exam-code">Exam Code</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="exam-code"
                                placeholder="e.g. EXAM-101"
                                value={quiz.examCode || ''}
                                onChange={(e) => handleQuizDetailsChange("examCode", e.target.value)}
                                className="font-mono"
                            />
                            <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0" onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                    navigator.clipboard.writeText(quiz.examCode || '');
                                    toast({ title: 'Copied!', description: 'Exam code copied to clipboard.' });
                                }
                            }}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !quiz.startDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {quiz.startDate ? format(new Date(quiz.startDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={quiz.startDate ? new Date(quiz.startDate) : undefined}
                                    onSelect={(date) => handleDateChange('startDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !quiz.endDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {quiz.endDate ? format(new Date(quiz.endDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={quiz.endDate ? new Date(quiz.endDate) : undefined}
                                    onSelect={(date) => handleDateChange('endDate', date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timer">Timer (minutes)</Label>
                        <Input
                            id="timer"
                            type="number"
                            placeholder="e.g. 60"
                            value={quiz.timerInMinutes || ''}
                            onChange={(e) => handleQuizDetailsChange("timerInMinutes", e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="instant-feedback" className="text-base font-medium">Show Instant Feedback</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable practice mode to show students if their answer is correct immediately.
                            </p>
                        </div>
                        <Switch
                            id="instant-feedback"
                            checked={!!quiz.showInstantFeedback}
                            onCheckedChange={(checked) => handleQuizDetailsChange("showInstantFeedback", checked)}
                        />
                    </div>
                    
                    <div className="rounded-lg border">
                        <div className="flex items-center justify-between p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="is-premium" className="text-base font-medium flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    Monetize Quiz
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Charge students a fee to take this quiz.
                                </p>
                            </div>
                            <Switch
                                id="is-premium"
                                checked={!!quiz.isPremium}
                                onCheckedChange={handlePremiumToggle}
                            />
                        </div>

                        {quiz.isPremium && (
                            <div className="p-4 border-t space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor="price">Price (MMK)</Label>
                                  <Badge variant="premium">Premium</Badge>
                                </div>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    placeholder="e.g., 5000"
                                    value={quiz.price ?? 0}
                                    onChange={(e) => handleQuizDetailsChange("price", Math.max(0, parseInt(e.target.value, 10) || 0))}
                                    className="max-w-xs"
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="rounded-lg border">
                        <div className="flex items-center justify-between p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="anti-cheat" className="text-base font-medium flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-amber-500" />
                                    Anti-Cheat Guard
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Enforces fullscreen and detects tab switching.
                                </p>
                            </div>
                            <Switch
                                id="anti-cheat"
                                checked={!!quiz.enableAntiCheat}
                                onCheckedChange={(checked) => handleQuizDetailsChange("enableAntiCheat", checked)}
                            />
                        </div>
                    </div>
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
