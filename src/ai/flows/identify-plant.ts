// src/ai/flows/identify-plant.ts
'use server';

/**
 * @fileOverview Identifies the species of a plant from an image and provides information about it.
 *
 * - identifyPlant - A function that handles the plant identification process.
 * - IdentifyPlantInput - The input type for the identifyPlant function.
 * - IdentifyPlantOutput - The return type for the identifyPlant function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifyPlantInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the plant photo.'),
});
export type IdentifyPlantInput = z.infer<typeof IdentifyPlantInputSchema>;

const IdentifyPlantOutputSchema = z.object({
  commonName: z.string().describe('The common name of the identified plant.'),
  scientificName: z.string().describe('The scientific name of the identified plant.'),
  careTips: z.string().describe('Tips on how to care for the identified plant.'),
  detailedAnalysis: z.string().describe('Detailed analysis of the identified plant, including growth characteristics, environmental needs, and potential issues.'),
});
export type IdentifyPlantOutput = z.infer<typeof IdentifyPlantOutputSchema>;

export async function identifyPlant(input: IdentifyPlantInput): Promise<IdentifyPlantOutput> {
  return identifyPlantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPlantPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the plant photo.'),
    }),
  },
  output: {
    schema: IdentifyPlantOutputSchema,
  },
  prompt: `You are an expert botanist. Identify the plant species in the image provided.

  Provide the common name, scientific name, and detailed care tips for the plant. Also, provide a detailed analysis of the identified plant, including growth characteristics, environmental needs, and potential issues.

  Photo: {{media url=photoUrl}}
  `,
});

const identifyPlantFlow = ai.defineFlow<
  typeof IdentifyPlantInputSchema,
  typeof IdentifyPlantOutputSchema
>({
  name: 'identifyPlantFlow',
  inputSchema: IdentifyPlantInputSchema,
  outputSchema: IdentifyPlantOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
