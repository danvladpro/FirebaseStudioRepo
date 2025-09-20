
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardUI } from "./flashcard-ui";
import type { Challenge, ChallengeSet } from "@/lib/types";

interface FlashcardClientPageProps {
    allChallenges: Challenge[];
    challengeSets: ChallengeSet[];
}

export function FlashcardClientPage({ allChallenges, challengeSets }: FlashcardClientPageProps) {
    return (
        <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 lg:grid-cols-7 mb-8 h-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                {challengeSets.map(set => (
                    <TabsTrigger key={set.id} value={set.id}>{set.name}</TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="all">
                <FlashcardUI challenges={allChallenges} title="all" />
            </TabsContent>

            {challengeSets.map(set => (
                <TabsContent key={set.id} value={set.id}>
                    <FlashcardUI challenges={set.challenges} title={set.name} />
                </TabsContent>
            ))}
        </Tabs>
    );
}
