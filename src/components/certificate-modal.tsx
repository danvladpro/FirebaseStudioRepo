
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Download, Linkedin, Share2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import { buildLinkedInUrl } from "@/lib/utils";

interface CertificateModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function CertificateModal({ isOpen, onOpenChange }: CertificateModalProps) {
    const { user, userProfile } = useAuth();
    const certId = userProfile?.masteryCertificateId;

    // Prefer the date the certificate was actually earned (stored in Firestore);
    // fall back to today for certificates that predate that field. Format in UTC
    // so a value stored at T00:00:00.000Z doesn't roll back a day in browsers
    // behind UTC.
    const certDate = userProfile?.masteryCertificateDate
        ? new Date(userProfile.masteryCertificateDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleDownload = () => {
        if (!user || !userProfile || !certId) return;

        const params = new URLSearchParams({
            name: userProfile.name || "Excel Ninja",
            date: certDate,
            certId: certId,
        });

        const url = `/certificate?${params.toString()}`;
        window.open(url, '_blank');
        onOpenChange(false);
    };

    const handleShareImage = () => {
        if (!user || !userProfile) return;

        const params = new URLSearchParams({
            name: userProfile.name || "Excel Ninja",
            date: certDate,
        });

        const url = `/certificate/social?${params.toString()}`;
        window.open(url, '_blank');
        onOpenChange(false);
    };

    const handleShare = () => {
        if (!user || !certId) return;
        const url = buildLinkedInUrl(user, certId);
        window.open(url, '_blank', 'noopener,noreferrer');
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Claim Your Mastery Certificate</DialogTitle>
                    <DialogDescription>
                        Congratulations! You've passed all exams. How would you like to claim your achievement?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 mt-4">
                    <Button onClick={handleDownload} size="lg" disabled={!certId}>
                        <Download className="mr-2 h-4 w-4" />
                        Download as PDF
                    </Button>
                    <Button onClick={handleShareImage} variant="outline" size="lg" disabled={!certId}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Save Image to Share
                    </Button>
                    <Button onClick={handleShare} variant="secondary" size="lg" className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white" disabled={!certId}>
                        <Linkedin className="mr-2 h-4 w-4" />
                        Add to LinkedIn Profile
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
