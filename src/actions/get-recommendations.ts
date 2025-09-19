'use server';

import { generateTrainingRecommendations } from '@/ai/flows/personalized-training-recommendations';

export async function getRecommendationsAction(performanceData: Record<string, number>) {
  try {
    const result = await generateTrainingRecommendations({ performanceData });
    return { success: true, recommendations: result.recommendations };
  } catch (error) {
    console.error('AI recommendation generation failed:', error);
    return { success: false, error: 'Failed to generate recommendations. Please try again later.' };
  }
}
