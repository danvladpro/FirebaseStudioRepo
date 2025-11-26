
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Download, Linkedin } from "lucide-react";
import { useAuth } from "./auth-provider";
import { ChallengeSet } from "@/lib/types";
import { buildLinkedInUrl } from "@/lib/utils";
import { usePerformanceTracker } from "@/hooks/use-performance-tracker";

interface CertificateModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    examSet: ChallengeSet | null;
}

export function CertificateModal({ isOpen, onOpenChange, examSet }: CertificateModalProps) {
    const { user, userProfile } = useAuth();
    const { stats } = usePerformanceTracker();

    if (!examSet) return null;

    const examStats = stats[examSet.id];
    const certId = examStats?.certificateId;

    const handleDownload = () => {
        if (!user || !userProfile || !examSet || !certId) return;
        
        const params = new URLSearchParams({
            name: userProfile.name || "Excel Ninja",
            examName: examSet.name,
            date: examStats?.lastTrained ? new Date(examStats.lastTrained).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            certId: certId,
        });
        
        const url = `/certificate?${params.toString()}`;
        window.open(url, '_blank');
        onOpenChange(false);
    };
    
    const handleShare = () => {
        if (!examSet || !user || !certId) return;
        const url = buildLinkedInUrl(examSet, user, certId);
        window.open(url, '_blank', 'noopener,noreferrer');
        onOpenChange(false);
    }

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
                    <Button onClick={handleDownload} size="lg" disabled={!certId}>
                        <Download className="mr-2 h-4 w-4" />
                        Download as PDF
                    </Button>
                    <Button onClick={handleShare} variant="secondary" size="lg" className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white" disabled={!certId}>
                        <Linkedin className="mr-2 h-4 w-4" />
                        Share on LinkedIn
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
