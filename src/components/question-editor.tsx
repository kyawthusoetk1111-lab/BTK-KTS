"use client";

import { useRef } from "react";
import type { Question, QuestionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Image as ImageIcon, Music, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import MultipleChoiceEditor from "./quiz/question-types/multiple-choice-editor";
import ShortAnswerEditor from "./quiz/question-types/short-answer-editor";
import EssayEditor from "./quiz/question-types/essay-editor";
import MatchingEditor from "./quiz/question-types/matching-editor";
import DropdownEditor from "./quiz/question-types/dropdown-editor";
import PassageWithDropdownsEditor from "./quiz/question-types/passage-with-dropdowns-editor";
import TrueFalseEditor from "./quiz/question-types/true-false-editor";
import { MathEquationHelper } from "./math-type-helper";
import { LatexRenderer } from "./latex-renderer";

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Question) => void;
  passageQuestions: Pick<Question, 'id' | 'text'>[];
}

export default function QuestionEditor({ question, onUpdate, passageQuestions }: QuestionEditorProps) {
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof Question, value: any) => {
    onUpdate({ ...question, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === 'image') {
          handleFieldChange('imageUrl', reader.result as string);
        } else {
          handleFieldChange('audioUrl', reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + symbol + text.substring(end);
      
      handleFieldChange('text', newText);

      // Focus and set cursor position after re-render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + symbol.length;
        }
      }, 0);
    }
  };
  
  const handleTypeChange = (type: QuestionType) => {
    let newOptions = question.options;
    if ((type === 'multiple-choice' || type === 'dropdown') && (!question.options || question.options.length === 0)) {
      newOptions = [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ]
    }
    if (type === 'true-false') {
      newOptions = [
          { id: crypto.randomUUID(), text: "True", isCorrect: false },
          { id: crypto.randomUUID(), text: "False", isCorrect: false },
      ]
    }

    let newMatchingPairs = question.matchingPairs;
    if (type === 'matching' && (!question.matchingPairs || question.matchingPairs.length === 0)) {
        newMatchingPairs = [
            { id: crypto.randomUUID(), left: "", right: "" },
            { id: crypto.randomUUID(), left: "", right: "" },
        ]
    }
    
    let newDropdowns = question.dropdowns;
    if (type === 'passage' && !newDropdowns) {
        newDropdowns = [];
    }

    onUpdate({ ...question, type, options: newOptions, matchingPairs: newMatchingPairs, dropdowns: newDropdowns });
  }
  
  const handleAiPoints = () => {
    // Placeholder for AI suggestion call
    toast({
        title: "AI Suggestion",
        description: "This feature is coming soon!"
    });
  }

  const showLinkToPassage = passageQuestions.length > 0 && question.type !== 'passage';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor={`question-text-${question.id}`}>{question.type === 'passage' ? 'Passage Text' : 'Question'}</Label>
          <MathEquationHelper onInsert={handleInsertSymbol} />
        </div>
        <Textarea
          id={`question-text-${question.id}`}
          ref={textareaRef}
          placeholder={
            question.type === 'passage' 
            ? "Enter the passage text. Use [[1]], [[2]], etc. to mark where dropdowns should appear. You can also leave it as plain text to be referenced by other questions."
            : "Enter question text, using $...$ for inline math and $$...$$ for block math. E.g., What is $x$ if $x^2 = 4$?"
          }
          value={question.text}
          onChange={(e) => handleFieldChange("text", e.target.value)}
          rows={question.type === 'passage' ? 6 : 3}
        />
        {question.text && (
            <div className="pt-2">
                <Label className="text-xs text-muted-foreground">Live Preview</Label>
                <div className="p-4 border rounded-md mt-1 min-h-[40px] bg-muted/30">
                    <LatexRenderer text={question.text} />
                </div>
            </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`question-image-url-${question.id}`}>Image</Label>
        <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <Input
                id={`question-image-url-${question.id}`}
                placeholder="Paste image URL or upload a file"
                value={question.imageUrl || ''}
                onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
            />
            <Button variant="outline" onClick={() => imageInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <input 
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'image')}
            />
        </div>
         {question.imageUrl && <img src={question.imageUrl} alt="Question preview" className="mt-2 rounded-md border max-h-48 object-contain" />}
      </div>

       <div className="space-y-2">
        <Label htmlFor={`question-audio-url-${question.id}`}>Audio</Label>
        <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <Input
                id={`question-audio-url-${question.id}`}
                placeholder="Paste audio URL or upload a file"
                value={question.audioUrl || ''}
                onChange={(e) => handleFieldChange("audioUrl", e.target.value)}
            />
            <Button variant="outline" onClick={() => audioInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
             <input 
              type="file"
              ref={audioInputRef}
              className="hidden"
              accept="audio/*"
              onChange={(e) => handleFileChange(e, 'audio')}
            />
        </div>
        {question.audioUrl && <audio controls src={question.audioUrl} className="mt-2 w-full" />}
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
              <SelectItem value="true-false">True / False</SelectItem>
              <SelectItem value="short-answer">Short Answer</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
              <SelectItem value="matching">Matching</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="passage">Passage</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
      </div>

      {showLinkToPassage && (
        <div className="space-y-2">
            <Label>Link to Passage</Label>
            <Select
                value={question.passageId || ''}
                onValueChange={(passageId) => handleFieldChange('passageId', passageId || undefined)}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select a passage to link this question to" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {passageQuestions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                            <p className="truncate">{p.text || `Passage (ID: ...${p.id.slice(-4)})`}</p>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      )}
      
      <div>
        {question.type === 'multiple-choice' && (
          <MultipleChoiceEditor
            options={question.options}
            onOptionsChange={(opts) => handleFieldChange('options', opts)}
          />
        )}
        {question.type === 'true-false' && (
          <TrueFalseEditor
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
        {question.type === 'passage' && (
            <PassageWithDropdownsEditor 
                dropdowns={question.dropdowns || []}
                onDropdownsChange={(dropdowns) => handleFieldChange('dropdowns', dropdowns)}
            />
        )}
      </div>
    </div>
  );
}
