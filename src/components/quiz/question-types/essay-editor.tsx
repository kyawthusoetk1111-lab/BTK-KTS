"use client";

import { Textarea } from "@/components/ui/textarea";

export default function EssayEditor() {
  return (
    <div className="p-4 bg-muted/50 rounded-lg border">
        <Textarea 
            placeholder="Students will write their essay response here. No specific answer key is required for this question type."
            disabled
            className="bg-background"
        />
    </div>
  );
}
