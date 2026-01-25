"use client";

import type { Question, QuestionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import MultipleChoiceEditor from "./quiz/question-types/multiple-choice-editor";
import ShortAnswerEditor from "./quiz/question-types/short-answer-editor";
import EssayEditor from "./quiz/question-types/essay-editor";
import MatchingEditor from "./quiz/question-types/matching-editor";
import DropdownEditor from "./quiz/question-types/dropdown-editor";
import PassageEditor from "./quiz/question-types/passage-editor";

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Question) => void;
}

export default function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
  const { toast } = useToast();

  const handleFieldChange = (field: keyof Question, value: any) => {
    onUpdate({ ...question, [field]: value });
  };
  
  const handleTypeChange = (type: QuestionType) => {
    let newOptions = question.options;
    if ((type === 'multiple-choice' || type === 'dropdown') && question.options.length === 0) {
      newOptions = [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ]
    }

    let newMatchingPairs = question.matchingPairs;
    if (type === 'matching' && question.matchingPairs.length === 0) {
        newMatchingPairs = [
            { id: crypto.randomUUID(), left: "", right: "" },
            { id: crypto.randomUUID(), left: "", right: "" },
        ]
    }

    let newPoints = question.points;
    if (type === 'passage') {
        newPoints = 0;
    }

    onUpdate({ ...question, type, options: newOptions, matchingPairs: newMatchingPairs, points: newPoints });
  }
  
  const handleAiPoints = () => {
    // Placeholder for AI suggestion call
    toast({
        title: "AI Suggestion",
        description: "This feature is coming soon!"
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{question.type === 'passage' ? 'Passage Text' : 'Question'}</Label>
        <Textarea
          placeholder={question.type === 'passage' ? "Enter the passage text" : "Enter the question text"}
          value={question.text}
          onChange={(e) => handleFieldChange("text", e.target.value)}
          rows={question.type === 'passage' ? 6 : undefined}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select value={question.type} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              <SelectItem value="short-answer">Short Answer</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="matching">Matching</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="passage">Passage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {question.type !== 'passage' && (
          <div className="space-y-2 md:col-span-2">
            <Label>Points</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Points"
                value={question.points}
                onChange={(e) => handleFieldChange("points", parseInt(e.target.value) || 0)}
              />
              <Button variant="ghost" size="sm" onClick={handleAiPoints}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Suggest
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div>
        {question.type === 'multiple-choice' && (
          <MultipleChoiceEditor
            options={question.options}
            onOptionsChange={(opts) => handleFieldChange('options', opts)}
          />
        )}
        {question.type === 'dropdown' && (
          <DropdownEditor
            options={question.options}
            onOptionsChange={(opts) => handleFieldChange('options', opts)}
          />
        )}
        {question.type === 'short-answer' && <ShortAnswerEditor />}
        {question.type === 'essay' && <EssayEditor />}
        {question.type === 'matching' && (
            <MatchingEditor 
                pairs={question.matchingPairs}
                onPairsChange={(pairs) => handleFieldChange('matchingPairs', pairs)}
            />
        )}
        {question.type === 'passage' && <PassageEditor />}
      </div>
    </div>
  );
}
