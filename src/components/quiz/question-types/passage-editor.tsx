"use client";

export default function PassageEditor() {
  return (
    <div className="p-4 bg-muted/50 rounded-lg border">
        <p className="text-sm text-muted-foreground">
            The main question text area above will be used as the passage content. 
            Passages are typically not assigned points, and subsequent questions can refer to this passage.
        </p>
    </div>
  );
}
