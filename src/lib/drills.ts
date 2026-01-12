
import { Challenge, ChallengeSet } from "./types";

export interface Drill {
    id: string;
    challengeId: string; // The ID of the challenge this drill is for
    name: string;
    description: string;
    repetitions: number;
    shortcut: string[]; // The key sequence for the drill
    mistakeLimit: number;
}

export interface DrillSet {
    id: string;
    name: string;
    drills: Drill[];
}

// Function to generate drills from existing challenge sets
const createDrillsFromChallenge = (challenge: Challenge): Drill[] => {
    if (challenge.steps.length === 1) {
        const step = challenge.steps[0];
        return [{
            id: `${challenge.description.toLowerCase().replace(/\s/g, '-')}`,
            challengeId: challenge.description, // Not ideal, but will work for now
            name: challenge.description,
            description: `Practice the shortcut for: ${challenge.description}.`,
            repetitions: 15,
            shortcut: step.keys,
            mistakeLimit: 2,
        }];
    } else {
        // For multi-step challenges (scenarios), we can create a drill for the whole sequence
        return [{
            id: `${challenge.description.toLowerCase().replace(/\s/g, '-')}`,
            challengeId: challenge.description,
            name: challenge.description,
            description: `Practice the sequence for: ${challenge.description}.`,
            repetitions: 5, // Fewer reps for longer sequences
            shortcut: challenge.steps.flatMap(s => s.keys), // This is a simplification
            mistakeLimit: 2,
        }];
    }
};

// This is a placeholder; a more robust system would be needed.
// For now, let's create a placeholder DrillSet.
import { CHALLENGE_SETS } from './challenges';

const allDrills: Drill[] = CHALLENGE_SETS.flatMap(set => 
    set.challenges.flatMap(createDrillsFromChallenge)
);

// We'll just have one big set of drills for now.
export const DRILL_SET: DrillSet = {
    id: 'master-drill-set',
    name: 'All Drills',
    drills: allDrills,
};
