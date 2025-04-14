'use server';
/**
 * @fileOverview An AI-powered assistant for plant care advice.
 *
 * - askGreenAiAssistant - A function that handles the plant care question and returns personalized advice.
 * - AskGreenAiAssistantInput - The input type for the askGreenAiAssistant function.
 * - AskGreenAiAssistantOutput - The return type for the askGreenAiAssistant function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getFertilizer, Fertilizer} from '@/services/fertilizer';

const AskGreenAiAssistantInputSchema = z.object({
  question: z.string().describe('The question about plant care.'),
});
export type AskGreenAiAssistantInput = z.infer<typeof AskGreenAiAssistantInputSchema>;

const AskGreenAiAssistantOutputSchema = z.object({
  advice: z.string().describe('Personalized advice for plant care.'),
});
export type AskGreenAiAssistantOutput = z.infer<typeof AskGreenAiAssistantOutputSchema>;

export async function askGreenAiAssistant(input: AskGreenAiAssistantInput): Promise<AskGreenAiAssistantOutput> {
  return askGreenAiAssistantFlow(input);
}

const fertilizerTool = ai.defineTool({
  name: 'getFertilizerInfo',
  description: 'Retrieves information about a specific fertilizer.',
  inputSchema: z.object({
    fertilizerName: z.string().describe('The name of the fertilizer to retrieve information about.'),
  }),
  outputSchema: z.object({
    name: z.string(),
    description: z.string(),
    npk: z.string(),
  }),
}, async (input) => {
  return getFertilizer(input.fertilizerName);
});

const prompt = ai.definePrompt({
  name: 'askGreenAiAssistantPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The question about plant care.'),
    }),
  },
  output: {
    schema: z.object({
      advice: z.string().describe('Personalized advice for plant care.'),
    }),
  },
  tools: [fertilizerTool],
  prompt: `You are a helpful AI assistant providing personalized advice for plant care.

  The user will ask a question about plant care, and you should provide helpful and informative advice.

  You can use the getFertilizerInfo tool if the user asks about a specific fertilizer.

  Question: {{{question}}}`,
});

const askGreenAiAssistantFlow = ai.defineFlow<
  typeof AskGreenAiAssistantInputSchema,
  typeof AskGreenAiAssistantOutputSchema
>({
  name: 'askGreenAiAssistantFlow',
  inputSchema: AskGreenAiAssistantInputSchema,
  outputSchema: AskGreenAiAssistantOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
