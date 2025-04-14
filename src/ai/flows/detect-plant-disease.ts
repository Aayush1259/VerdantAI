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
  detectedPlant: z.string().optional().describe('The identified plant species.'),
  quickSummary: z.string().optional().describe('A brief overview of the plant\'s condition, urgency, and severity.'),
  plantCondition: z.string().optional().describe('Visible symptoms, affected areas, and signs of spread.'),
  likelyCauses: z.string().optional().describe('Common reasons, environmental factors, and care-related issues.'),
  recommendedActions: z.string().optional().describe('Immediate steps, basic care adjustments, and expert consultation advice.'),
  careInstructions: z.string().optional().describe('A step-by-step treatment guide with routine care tips.'),
  preventionGuide: z.string().optional().describe('Early warning signs and preventive measures.'),
  additionalTips: z.string().optional().describe('Common mistakes to avoid and improvement indicators.'),
  ecosystemImpact: z.string().optional().describe('Potential effects on surrounding plants and soil health.'),
  basicDiseaseInformation: z.string().optional().describe('Common diseases related to the observed symptoms.'),
  detailedCareInstructions: z.string().optional().describe('Comprehensive, step-by-step guide tailored to the plant\'s specific needs.'),
  diseaseDetected: z.boolean().describe('Whether a disease was detected or not.'),
  diseaseName: z.string().optional().describe('The name of the detected disease, if any.'),
  symptoms: z.string().optional().describe('Symptoms of the detected disease, if any.'),
  causes: z.string().optional().describe('Causes of the detected disease, if any.'),
  treatments: z.string().optional().describe('Treatments for the detected disease, if any.'),
  prevention: z.string().optional().describe('Prevention methods for the detected disease, if any.'),
  fertilizerRecommendation: z.string().optional().describe('Recommended fertilizer for recovery, if any.'), // Added field
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

const DEFAULT_SECTIONS = `
Please provide:
0. Detected Plant
   - Identify the plant, tree, bush, or leaf species. Begin your report with a line starting with 'Detected Plant:' followed by the species name.

1. Quick Summary
   - A simple description of what you see
   - Urgency of attention
   - Severity of the condition

2. Plant Condition
   - Visible symptoms
   - Affected areas
   - Signs of spread

3. Likely Causes
   - Common reasons, environmental factors, and care-related issues

4. Recommended Actions
   - Immediate steps, basic care adjustments, and expert consultation advice

5. Care Instructions
   - A step-by-step treatment guide with routine care tips

6. Prevention Guide
   - Early warning signs and preventive measures

7. Additional Tips
   - Common mistakes to avoid and improvement indicators

8. Optional Ecosystem Impact (for experienced users)
   - Potential effects on surrounding plants and soil health

9. Basic Disease Information
   - Describe common diseases related to the observed symptoms
   - Highlight potential pathogens (fungal, bacterial, or viral)

10. Detailed Care Instructions
    - Provide a comprehensive, step-by-step guide tailored to the plant's specific needs
    - Include additional maintenance tips and long-term care recommendations
`;

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

  Based on the image, provide a detailed analysis of the plant's condition, following these guidelines:

  ${DEFAULT_SECTIONS}

  Also, recommend a fertilizer that can help the plant recover from the disease.

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
