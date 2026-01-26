'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { subjects } from '@/lib/subjects';
import { Search, Library } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';

interface QuizBankBrowserProps {
  onImport: (questions: Question[]) => void;
}

export function QuizBankBrowser({ onImport }: QuizBankBrowserProps) {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Record<string, Question>>({});

  const bankQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'quizBank'));
  }, [firestore]);

  const { data: allQuestions, isLoading } = useCollection<Question>(bankQuery);

  const filteredQuestions = useMemo(() => {
    return (allQuestions || []).filter(q => {
      const searchMatch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
      const subjectMatch = selectedSubject === 'all' || q.subject === selectedSubject;
      return searchMatch && subjectMatch;
    });
  }, [allQuestions, searchTerm, selectedSubject]);

  const handleSelectQuestion = (question: Question, isSelected: boolean) => {
    setSelectedQuestions(prev => {
      const newSelected = { ...prev };
      if (isSelected) {
        newSelected[question.id] = question;
      } else {
        delete newSelected[question.id];
      }
      return newSelected;
    });
  };

  const handleImportClick = () => {
    onImport(Object.values(selectedQuestions));
    setSelectedQuestions({});
  };
  
  const selectedCount = Object.keys(selectedQuestions).length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 py-4 space-y-4 border-b">
         <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
            />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
                <SelectValue placeholder="Filter by subject..." />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.filter(s => s !== 'Global').map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner />
            </div>
          ) : filteredQuestions.length > 0 ? (
            filteredQuestions.map(q => (
              <div
                key={q.id}
                className="flex items-start gap-3 p-3 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-300"
              >
                <Checkbox
                  id={`cb-${q.id}`}
                  checked={!!selectedQuestions[q.id]}
                  onCheckedChange={(checked) => handleSelectQuestion(q, !!checked)}
                />
                <label htmlFor={`cb-${q.id}`} className="flex-1 cursor-pointer">
                  <p className="font-medium line-clamp-2">{q.text}</p>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <Badge variant="outline">{q.subject}</Badge>
                    <Badge variant="secondary" className="capitalize">{q.type.replace('-', ' ')}</Badge>
                    <span>{q.points} pts</span>
                  </div>
                </label>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <Library className="mx-auto h-12 w-12 mb-4" />
              <p>No questions found in the bank matching your criteria.</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-background mt-auto">
        <Button 
            className="w-full" 
            disabled={selectedCount === 0}
            onClick={handleImportClick}
        >
          Import {selectedCount > 0 ? `(${selectedCount})` : ''} Question{selectedCount !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
