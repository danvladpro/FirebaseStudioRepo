// src/ai/flows/personalized-training-recommendations.ts
'use server';

/**
 * @fileOverview Generates personalized training recommendations based on user performance in different Excel shortcut categories.
 *
 * - generateTrainingRecommendations - A function that generates training recommendations.
 * - TrainingRecommendationsInput - The input type for the generateTrainingRecommendations function.
 * - TrainingRecommendationsOutput - The return type for the generateTrainingRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrainingRecommendationsInputSchema = z.object({
  performanceData: z
    .record(z.number())
    .describe(
      'A record of the user performance data for different categories of Excel shortcuts. The keys are the shortcut categories and values are the time taken to complete in seconds.'
    ),
});
export type TrainingRecommendationsInput = z.infer<
  typeof TrainingRecommendationsInputSchema
>;

const TrainingRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('Personalized training recommendations.'),
});
export type TrainingRecommendationsOutput = z.infer<
  typeof TrainingRecommendationsOutputSchema
>;

export async function generateTrainingRecommendations(
  input: TrainingRecommendationsInput
): Promise<TrainingRecommendationsOutput> {
  return generateTrainingRecommendationsFlow(input);
}

const generateRecommendationsPrompt = ai.definePrompt({
  name: 'generateRecommendationsPrompt',
  input: {schema: TrainingRecommendationsInputSchema},
  output: {schema: TrainingRecommendationsOutputSchema},
  prompt: `You are an expert in Excel shortcuts and personalized training.
  Based on the user's performance data, provide personalized training recommendations.

  Performance Data: {{{performanceData}}}
  Give specific recommendations on which shortcut categories the user should focus on to improve their efficiency.
  `,
});

const generateTrainingRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateTrainingRecommendationsFlow',
    inputSchema: TrainingRecommendationsInputSchema,
    outputSchema: TrainingRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await generateRecommendationsPrompt(input);
    return output!;
  }
);
