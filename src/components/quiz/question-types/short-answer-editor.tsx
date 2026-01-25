"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ShortAnswerEditor() {
  return (
    <div className="space-y-2">
        <Label>Correct Answer (Optional)</Label>
        <Input 
            placeholder="Provide a correct answer for auto-grading"
        />
    </div>
  );
}
