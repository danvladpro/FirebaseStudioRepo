
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { ArrowRight, PartyPopper } from "lucide-react";
import Confetti from "react-confetti";
import { LEVEL_THRESHOLDS } from "./home-page-client";

interface LevelUpModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    newLevel: string;
    totalXP: number;
}

export function LevelUpModal({ isOpen, onOpenChange, newLevel, totalXP }: LevelUpModalProps) {
    const levelInfo = LEVEL_THRESHOLDS.find(l => l.level === newLevel);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {isOpen && <Confetti recycle={false} numberOfPieces={400} />}
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit mb-4">
                        <PartyPopper className="h-12 w-12" />
                    </div>
                    <DialogTitle className="text-3xl">Level Up!</DialogTitle>
                    <DialogDescription>
                        Congratulations! You've reached a new rank.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-6 flex flex-col items-center gap-4">
                    <div className="scale-125">
                       {levelInfo?.icon}
                    </div>
                    <p className="text-2xl font-bold text-primary">You are now a {newLevel}!</p>
                    <p className="font-semibold text-muted-foreground">Total XP: {totalXP}</p>
                </div>
                <Button onClick={() => onOpenChange(false)} className="w-full">
                    Keep Going
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogContent>
        </Dialog>
    );
}
