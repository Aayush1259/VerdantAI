'use server';

/**
 * @fileOverview Detects plant diseases from an image and provides information on symptoms, causes, treatments, and prevention methods.
 *
 * - detectPlantDisease - A function that handles the plant disease detection process.
 * - DetectPlantDiseaseInput - The input type for the detectPlantDisease function.
 * - DetectPlantDiseaseOutput - The return type for the detectPlantDisease function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getFertilizer, Fertilizer} from '@/services/fertilizer';

const DetectPlantDiseaseInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the plant photo.'),
});
export type DetectPlantDiseaseInput = z.infer<typeof DetectPlantDiseaseInputSchema>;

const DetectPlantDiseaseOutputSchema = z.object({
  diseaseDetected: z.boolean().describe('Whether a disease was detected or not.'),
  diseaseName: z.string().optional().describe('The name of the detected disease, if any.'),
  symptoms: z.string().optional().describe('Symptoms of the detected disease, if any.'),
  causes: z.string().optional().describe('Causes of the detected disease, if any.'),
  treatments: z.string().optional().describe('Treatments for the detected disease, if any.'),
  prevention: z.string().optional().describe('Prevention methods for the detected disease, if any.'),
  fertilizerRecommendation: z.string().optional().describe('Recommended fertilizer for recovery, if any.'),
});
export type DetectPlantDiseaseOutput = z.infer<typeof DetectPlantDiseaseOutputSchema>;

export async function detectPlantDisease(input: DetectPlantDiseaseInput): Promise<DetectPlantDiseaseOutput> {
  return detectPlantDiseaseFlow(input);
}

const getFertilizerInfo = ai.defineTool({
  name: 'getFertilizerInfo',
  description: 'Retrieves information about a specific fertilizer.',
  inputSchema: z.object({
    fertilizerName: z.string().describe('The name of the fertilizer to retrieve information for.'),
  }),
  outputSchema: z.object({
    name: z.string(),
    description: z.string(),
    npk: z.string(),
  }).nullable(),
},
async input => {
  try {
    const fertilizer = await getFertilizer(input.fertilizerName);
    return fertilizer;
  } catch (e) {
    return null;
  }
});

const prompt = ai.definePrompt({
  name: 'detectPlantDiseasePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the plant photo.'),
    }),
  },
  output: {
    schema: DetectPlantDiseaseOutputSchema,
  },
  tools: [getFertilizerInfo],
  prompt: `You are an expert plant pathologist. Analyze the image of the plant and determine if it has any diseases.
  Based on the image, determine if a disease is present. If a disease is present, provide the name of the disease, symptoms, causes, treatments, and prevention methods. Also, recommend a fertilizer that can help the plant recover from the disease.

  {{media url=photoUrl}}
`,
});

const detectPlantDiseaseFlow = ai.defineFlow<
  typeof DetectPlantDiseaseInputSchema,
  typeof DetectPlantDiseaseOutputSchema
>({
  name: 'detectPlantDiseaseFlow',
  inputSchema: DetectPlantDiseaseInputSchema,
  outputSchema: DetectPlantDiseaseOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
