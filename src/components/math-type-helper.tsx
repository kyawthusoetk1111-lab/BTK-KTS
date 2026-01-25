'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface MathEquationHelperProps {
  onInsert: (text: string) => void;
}

const mathSymbols = [
  // Basic Operators
  '+', '-', '×', '÷', '±', '=', '≠', '≈',
  // Comparison
  '<', '>', '≤', '≥', '≡', '∝',
  // Exponents and Radicals
  'x²', 'x³', 'xⁿ', '√', '∛', 'ⁿ√',
  // Fractions & Misc
  '½', '⅓', '¼', '°', '∞', '·',
  // Greek Letters
  'π', 'θ', 'α', 'β', 'γ', 'δ', 'ε', 'λ',
  'μ', 'σ', 'φ', 'ω',
  // Calculus and Vectors
  '∑', '∫', 'd/dx', '∂', '∇', 'Δ', 'x→',
  // Logic and Set Theory
  '∀', '∃', '¬', '∧', '∨', '∈', '∉', '⊂',
  '⊃', '∩', '∪',
];


export function MathEquationHelper({ onInsert }: MathEquationHelperProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Calculator className="h-4 w-4 mr-2" />
          Math Equation Helper
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-8 gap-1">
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
