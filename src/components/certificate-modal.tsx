
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Download, Linkedin, Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import { toast } from "@/hooks/use-toast";
import { ChallengeSet } from "@/lib/types";
import { buildLinkedInUrl } from "@/lib/utils";

interface CertificateModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    examSet: ChallengeSet | null;
}

export function CertificateModal({ isOpen, onOpenChange, examSet }: CertificateModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { user, userProfile } = useAuth();

    const handleDownload = async () => {
        if (!user || !userProfile || !examSet) {
            toast({
                title: "Error",
                description: "Cannot download certificate. User or exam data is missing.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/certificate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userProfile.name || "Excel Ninja",
                    examName: examSet.name,
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate PDF.");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ExcelNinja_${examSet.name.replace(/\s+/g, '_')}_Certificate.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({ title: "Success", description: "Your certificate has started downloading." });
            onOpenChange(false);

        } catch (error: any) {
            toast({
                title: "Download Error",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleShare = () => {
        if (!examSet || !user) return;
        const url = buildLinkedInUrl(examSet, user);
        window.open(url, '_blank', 'noopener,noreferrer');
        onOpenChange(false);
    }

    if (!examSet) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Claim Your Certificate</DialogTitle>
                    <DialogDescription>
                        You've passed the {examSet.name}! How would you like to claim your achievement?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                    <Button onClick={handleDownload} disabled={isLoading} size="lg">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Download as PDF
                    </Button>
                    <Button onClick={handleShare} variant="secondary" size="lg" className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white">
                        <Linkedin className="mr-2 h-4 w-4" />
                        Share on LinkedIn
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
