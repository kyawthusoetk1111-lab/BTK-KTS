"use client";

import type { InlineDropdown, Option } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface PassageWithDropdownsEditorProps {
  dropdowns: InlineDropdown[];
  onDropdownsChange: (dropdowns: InlineDropdown[]) => void;
}

function DropdownOptionsEditor({ dropdown, onUpdate }: { dropdown: InlineDropdown, onUpdate: (dropdown: InlineDropdown) => void }) {
  const { toast } = useToast();

  const handleOptionTextChange = (id: string, text: string) => {
    onUpdate({
        ...dropdown,
        options: dropdown.options.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    });
  };

  const handleCorrectChange = (correctId: string) => {
    onUpdate({
        ...dropdown,
        options: dropdown.options.map((opt) => ({ ...opt, isCorrect: opt.id === correctId }))
    });
  };

  const addOption = () => {
    onUpdate({
        ...dropdown,
        options: [...dropdown.options, { id: crypto.randomUUID(), text: "", isCorrect: false }]
    });
  };

  const removeOption = (id: string) => {
    if (dropdown.options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "Dropdowns must have at least two options.",
        variant: "destructive",
      });
      return;
    }
    onUpdate({
        ...dropdown,
        options: dropdown.options.filter((opt) => opt.id !== id)
    });
  };
  
  const correctOptionId = dropdown.options.find((opt) => opt.isCorrect)?.id;

  return (
    <div className="space-y-3">
        <RadioGroup value={correctOptionId} onValueChange={handleCorrectChange}>
            <div className="space-y-3">
            {dropdown.options.map((option, index) => (
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
  )
}

export default function PassageWithDropdownsEditor({ dropdowns, onDropdownsChange }: PassageWithDropdownsEditorProps) {
  
  const addDropdown = () => {
    onDropdownsChange([...dropdowns, { 
        id: crypto.randomUUID(),
        options: [
            { id: crypto.randomUUID(), text: "", isCorrect: false },
            { id: crypto.randomUUID(), text: "", isCorrect: false },
        ]
    }]);
  };

  const updateDropdown = (updatedDropdown: InlineDropdown) => {
    onDropdownsChange(dropdowns.map(d => d.id === updatedDropdown.id ? updatedDropdown : d));
  }

  const removeDropdown = (id: string) => {
    onDropdownsChange(dropdowns.filter(d => d.id !== id));
  };
  
  return (
    <div className="space-y-4">
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>How to use Inline Dropdowns</AlertTitle>
            <AlertDescription>
                In the question text above, use placeholders like `[[1]]`, `[[2]]`, etc. to indicate where you want dropdowns to appear. Each placeholder number corresponds to the dropdown editor below (e.g., `[[1]]` for Dropdown 1).
            </AlertDescription>
        </Alert>
        <div className="space-y-4">
            {dropdowns.map((dropdown, index) => (
                <Card key={dropdown.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Dropdown {index + 1}</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeDropdown(dropdown.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DropdownOptionsEditor 
                            dropdown={dropdown}
                            onUpdate={updateDropdown}
                        />
                    </CardContent>
                </Card>
            ))}
        </div>
        <Button variant="outline" className="w-full" onClick={addDropdown}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Dropdown
        </Button>
    </div>
  );
}
