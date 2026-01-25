"use client";

import type { Option } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, PlusCircle, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DropdownEditorProps {
  options: Option[];
  onOptionsChange: (options: Option[]) => void;
}

export default function DropdownEditor({ options, onOptionsChange }: DropdownEditorProps) {
  const { toast } = useToast();

  const handleOptionTextChange = (id: string, text: string) => {
    onOptionsChange(options.map((opt) => (opt.id === id ? { ...opt, text } : opt)));
  };

  const handleCorrectChange = (correctId: string) => {
    onOptionsChange(options.map((opt) => ({ ...opt, isCorrect: opt.id === correctId })));
  };

  const addOption = () => {
    onOptionsChange([...options, { id: crypto.randomUUID(), text: "", isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "Dropdown questions must have at least two options.",
        variant: "destructive",
      });
      return;
    }
    onOptionsChange(options.filter((opt) => opt.id !== id));
  };
  
  const handleAiSuggestions = () => {
    // Placeholder for AI suggestion call
    toast({
        title: "AI Suggestion",
        description: "This feature is coming soon!"
    });
  }

  const correctOptionId = options.find((opt) => opt.isCorrect)?.id;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Options (select the correct one)</Label>
        <Button variant="ghost" size="sm" onClick={handleAiSuggestions}>
          <Wand2 className="h-4 w-4 mr-2" />
          AI Suggest
        </Button>
      </div>
      <RadioGroup value={correctOptionId} onValueChange={handleCorrectChange}>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <RadioGroupItem value={option.id} id={`r-${option.id}`} />
              <Input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option.text}
                onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                className="flex-grow"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeOption(option.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </RadioGroup>
      <Button variant="outline" size="sm" onClick={addOption}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Option
      </Button>
    </div>
  );
}
