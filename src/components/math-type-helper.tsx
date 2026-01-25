'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface MathTypeHelperProps {
  onInsert: (text: string) => void;
}

const mathSymbols = [
  '+', '-', '×', '÷', '=', '≠', '<', '>', '≤', '≥',
  'x²', 'x³', 'xⁿ', '√', '∛', 'ⁿ√', '½', '⅓', '¼',
  'π', 'θ', 'α', 'β', 'γ', 'δ', '∑', '∫', '∞', '±', '°',
];

export function MathTypeHelper({ onInsert }: MathTypeHelperProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Calculator className="h-4 w-4 mr-2" />
          Math Helper
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-6 gap-1">
          {mathSymbols.map((symbol) => (
            <Button
              key={symbol}
              variant="ghost"
              size="icon"
              className="text-base font-mono h-9 w-9"
              onClick={() => onInsert(symbol.replace(/^x/, ''))}
            >
              {symbol}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
