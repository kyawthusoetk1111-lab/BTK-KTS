"use client";

import type { Option } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TrueFalseEditorProps {
  options: Option[];
  onOptionsChange: (options: Option[]) => void;
}

export default function TrueFalseEditor({ options, onOptionsChange }: TrueFalseEditorProps) {

  const handleCorrectChange = (correctText: string) => {
    onOptionsChange(
      options.map((opt) => ({ ...opt, isCorrect: opt.text === correctText }))
    );
  };

  const correctOption = options.find((opt) => opt.isCorrect)?.text;

  return (
    <div className="space-y-2">
      <Label>Correct Answer</Label>
      <RadioGroup value={correctOption} onValueChange={handleCorrectChange} className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="True" id="true-option" />
          <Label htmlFor="true-option">True</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="False" id="false-option" />
          <Label htmlFor="false-option">False</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
