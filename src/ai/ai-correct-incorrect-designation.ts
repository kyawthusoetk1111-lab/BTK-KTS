'use server';

/**
 * @fileOverview An AI agent to evaluate answers to closed-ended questions and suggest the ground truth.
 *
 * - suggestCorrectAnswers - A function that evaluates provided answers and suggests the correct ones.
 * - SuggestCorrectAnswersInput - The input type for the suggestCorrectAnswers function.
 * - SuggestCorrectAnswersOutput - The return type for the suggestCorrectAnswers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCorrectAnswersInputSchema = z.object({
  questionType: z.enum(['multiple-choice', 'numerical-entry']).describe('The type of question being evaluated.'),
  questionText: z.string().describe('The text of the question.'),
  answers: z.array(z.string()).describe('An array of student-provided answers to the question.'),
});
export type SuggestCorrectAnswersInput = z.infer<typeof SuggestCorrectAnswersInputSchema>;

const SuggestCorrectAnswersOutputSchema = z.object({
  suggestedCorrectAnswers: z.array(z.string()).describe('An array of suggested correct answers based on the provided student answers.'),
  confidenceScores: z.array(z.number()).describe('An array of confidence scores (0-1) for each suggested correct answer.'),
});
export type SuggestCorrectAnswersOutput = z.infer<typeof SuggestCorrectAnswersOutputSchema>;

export async function suggestCorrectAnswers(input: SuggestCorrectAnswersInput): Promise<SuggestCorrectAnswersOutput> {
  return suggestCorrectAnswersFlow(input);
}

const suggestCorrectAnswersPrompt = ai.definePrompt({
  name: 'suggestCorrectAnswersPrompt',
  input: {schema: SuggestCorrectAnswersInputSchema},
  output: {schema: SuggestCorrectAnswersOutputSchema},
  prompt: `You are an expert teacher responsible for determining the correct answers to student questions.

You are provided with the following question and a list of student answers. Your job is to evaluate the student answers and determine the correct answer(s) and provide a confidence score for each.

Question Type: {{{questionType}}}
Question: {{{questionText}}}
Student Answers: {{#each answers}}{{{this}}}\n{{/each}}

Provide the correct answer(s) and a confidence score (0-1) for each.

Ensure that the suggestedCorrectAnswers array only contains values present in the answers array.

Output in JSON format:
{
  "suggestedCorrectAnswers": ["correct answer 1", "correct answer 2", ...],
  "confidenceScores": [0.95, 0.80, ...]
}
`,
});

const suggestCorrectAnswersFlow = ai.defineFlow(
  {
    name: 'suggestCorrectAnswersFlow',
    inputSchema: SuggestCorrectAnswersInputSchema,
    outputSchema: SuggestCorrectAnswersOutputSchema,
  },
  async input => {
    const {output} = await suggestCorrectAnswersPrompt(input);
    return output!;
  }
);
