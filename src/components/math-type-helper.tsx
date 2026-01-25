'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { InlineMath } from 'react-katex';
import { Separator } from './ui/separator';

interface MathEquationHelperProps {
  onInsert: (text: string) => void;
}

// All items are { display: string, insert: string }
// display is the LaTeX to render in the button
// insert is the LaTeX to insert into the editor
const mathSymbols = [
    // Basic Operators
    { display: '+', insert: '+' }, { display: '-', insert: '-' }, { display: '\\times', insert: '\\times' }, { display: '\\div', insert: '\\div' }, { display: '\\pm', insert: '\\pm' }, { display: '=', insert: '=' }, { display: '\\neq', insert: '\\neq' }, { display: '\\approx', insert: '\\approx' },
    // Comparison
    { display: '<', insert: '<' }, { display: '>', insert: '>' }, { display: '\\le', insert: '\\le' }, { display: '\\ge', insert: '\\ge' }, { display: '\\equiv', insert: '\\equiv' }, { display: '\\propto', insert: '\\propto' },
    // Exponents and Radicals
    { display: 'x^2', insert: '^{2}' }, { display: 'x^3', insert: '^{3}' }, { display: 'x^n', insert: '^{n}' }, 
    { display: '\\sqrt{x}', insert: '\\sqrt{}' }, { display: '\\sqrt[3]{x}', insert: '\\sqrt[3]{}' }, { display: '\\sqrt[n]{x}', insert: '\\sqrt[n]{}' },
    // Fractions & Misc
    { display: '\\frac{a}{b}', insert: '\\frac{}{}' }, { display: '°', insert: '°' }, { display: '\\infty', insert: '\\infty' }, { display: '\\cdot', insert: '\\cdot' },
    // Greek Letters
    { display: '\\pi', insert: '\\pi' }, { display: '\\theta', insert: '\\theta' }, { display: '\\alpha', insert: '\\alpha' }, { display: '\\beta', insert: '\\beta' }, { display: '\\gamma', insert: '\\gamma' }, { display: '\\delta', insert: '\\delta' }, { display: '\\epsilon', insert: '\\epsilon' }, { display: '\\lambda', insert: '\\lambda' },
    { display: '\\mu', insert: '\\mu' }, { display: '\\sigma', insert: '\\sigma' }, { display: '\\phi', insert: '\\phi' }, { display: '\\omega', insert: '\\omega' },
    // Calculus and Vectors
    { display: '\\sum', insert: '\\sum' }, { display: '\\int', insert: '\\int' }, { display: '\\frac{d}{dx}', insert: '\\frac{d}{dx}' }, { display: '\\partial', insert: '\\partial' }, { display: '\\nabla', insert: '\\nabla' }, { display: '\\Delta', insert: '\\Delta' }, { display: '\\to', insert: '\\to' },
    // Logic and Set Theory
    { display: '\\forall', insert: '\\forall' }, { display: '\\exists', insert: '\\exists' }, { display: '\\neg', insert: '\\neg' }, { display: '\\land', insert: '\\land' }, { display: '\\lor', insert: '\\lor' }, { display: '\\in', insert: '\\in' }, { display: '\\notin', insert: '\\notin' }, { display: '\\subset', insert: '\\subset' },
    { display: '\\supset', insert: '\\supset' }, { display: '\\cap', insert: '\\cap' }, { display: '\\cup', insert: '\\cup' },
];

const mathEquations = [
    { display: 'ax^2+bx+c=0', insert: 'ax^2 + bx + c = 0' },
    { display: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', insert: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
    { display: 'a^2+b^2=c^2', insert: 'a^2 + b^2 = c^2' },
    { display: 'E=mc^2', insert: 'E=mc^2' },
    { display: '\\sin(\\theta)', insert: '\\sin()' },
    { display: '\\cos(\\theta)', insert: '\\cos()' },
    { display: '\\tan(\\theta)', insert: '\\tan()' },
    { display: '\\int_{a}^{b} f(x)dx', insert: '\\int_{a}^{b} f(x)dx' },
    { display: '\\lim_{x\\to\\infty} f(x)', insert: '\\lim_{x\\to\\infty}' },
    { display: '\\sum_{i=1}^{n} a_i', insert: '\\sum_{i=1}^{n}' },
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
      <PopoverContent className="w-96 p-2">
        <div className="space-y-2">
            <div>
                <p className="text-xs font-medium text-muted-foreground px-1 pb-1">Symbols</p>
                <div className="grid grid-cols-8 gap-1">
                {mathSymbols.map((symbol, i) => (
                    <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    className="text-base font-mono h-9 w-9"
                    onClick={() => onInsert(symbol.insert)}
                    title={symbol.insert}
                    >
                        <InlineMath math={symbol.display} />
                    </Button>
                ))}
                </div>
            </div>
            <Separator />
            <div>
                <p className="text-xs font-medium text-muted-foreground px-1 pb-1">Common Equations</p>
                <div className="grid grid-cols-2 gap-2">
                    {mathEquations.map((eq, i) => (
                        <Button
                            key={i}
                            variant="outline"
                            className="text-base font-mono h-auto p-2 flex justify-center"
                            onClick={() => onInsert(`$$${eq.insert}$$`)}
                            title={`Insert: $$${eq.insert}$$`}
                        >
                            <InlineMath math={eq.display} />
                        </Button>
                    ))}
                </div>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
