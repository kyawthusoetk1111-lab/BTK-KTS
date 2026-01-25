"use client";

import type { MatchingPair } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchingEditorProps {
  pairs: MatchingPair[];
  onPairsChange: (pairs: MatchingPair[]) => void;
}

export default function MatchingEditor({ pairs, onPairsChange }: MatchingEditorProps) {
  const { toast } = useToast();

  const handlePairChange = (id: string, side: 'left' | 'right', text: string) => {
    onPairsChange(pairs.map((p) => (p.id === id ? { ...p, [side]: text } : p)));
  };

  const addPair = () => {
    onPairsChange([...pairs, { id: crypto.randomUUID(), left: "", right: "" }]);
  };

  const removePair = (id: string) => {
    if (pairs.length <= 2) {
      toast({
        title: "Cannot remove pair",
        description: "Matching questions must have at least two pairs.",
        variant: "destructive",
      });
      return;
    }
    onPairsChange(pairs.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <Label>Matching Pairs</Label>
      <div className="space-y-3">
        {pairs.map((pair, index) => (
          <div key={pair.id} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
            <Input
              type="text"
              placeholder={`Item ${index + 1} Left`}
              value={pair.left}
              onChange={(e) => handlePairChange(pair.id, 'left', e.target.value)}
            />
             <span className="text-muted-foreground">=</span>
            <Input
              type="text"
              placeholder={`Item ${index + 1} Right`}
              value={pair.right}
              onChange={(e) => handlePairChange(pair.id, 'right', e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => removePair(pair.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
       <Button variant="outline" size="sm" onClick={addPair}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Pair
      </Button>
    </div>
  );
}
