'use server';

/**
 * @fileOverview An AI agent that suggests adequate scores for different answers or subproblems of an essay.
 *
 * - suggestPoints - A function that handles the point suggestion process.
 * - SuggestPointsInput - The input type for the suggestPoints function.
 * - SuggestPointsOutput - The return type for the suggestPoints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPointsInputSchema = z.object({
  essayQuestion: z.string().describe('The essay question to be graded.'),
  studentAnswer: z.string().describe('The student answer to the essay question.'),
  maxPoints: z.number().describe('The maximum possible points for the essay question.'),
});

export type SuggestPointsInput = z.infer<typeof SuggestPointsInputSchema>;

const SuggestPointsOutputSchema = z.object({
  suggestedPoints: z
    .record(z.string(), z.number())
    .describe('A breakdown of suggested points for different aspects of the answer.'),
  overallFeedback: z.string().describe('Overall feedback on the student answer.'),
});

export type SuggestPointsOutput = z.infer<typeof SuggestPointsOutputSchema>;

export async function suggestPoints(input: SuggestPointsInput): Promise<SuggestPointsOutput> {
  return suggestPointsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPointsPrompt',
  input: {schema: SuggestPointsInputSchema},
  output: {schema: SuggestPointsOutputSchema},
  prompt: `You are an AI assistant that helps teachers grade essay questions by suggesting points for different aspects of the answer.

  Consider the essay question, student answer, and maximum points available.
  Provide a breakdown of suggested points for different aspects of the answer, and overall feedback.

  Essay Question: {{{essayQuestion}}}
  Student Answer: {{{studentAnswer}}}
  Maximum Points: {{{maxPoints}}}

  Ensure that the suggested points add up to no more than the maximum points available.

  Your response should be formatted as a JSON object.
  `,
});

const suggestPointsFlow = ai.defineFlow(
  {
    name: 'suggestPointsFlow',
    inputSchema: SuggestPointsInputSchema,
    outputSchema: SuggestPointsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
