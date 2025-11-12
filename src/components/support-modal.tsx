
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "./auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { submitSupportTicket } from "@/app/actions/submit-support-ticket";

interface SupportModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function SupportModal({ isOpen, onOpenChange }: SupportModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [category, setCategory] = useState("");
    const [topic, setTopic] = useState("");
    const [body, setBody] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setCategory("");
        setTopic("");
        setBody("");
        setAttachment(null);
    };
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        onOpenChange(open);
    }

    const handleSubmit = async () => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
            return;
        }

        if (!category || !topic.trim() || !body.trim()) {
            toast({ title: "Missing Information", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await submitSupportTicket({
                uid: user.uid,
                email: user.email!,
                category,
                topic,
                body,
                attachmentName: attachment?.name,
            });
            toast({ title: "Success", description: "Your support ticket has been submitted." });
            handleOpenChange(false);
        } catch (error: any) {
            toast({ title: "Submission Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Contact Support</DialogTitle>
                    <DialogDescription>
                        Have a question or a problem? Let us know. We're here to help.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category
                        </Label>
                        <Select onValueChange={setCategory} value={category}>
                            <SelectTrigger id="category" className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bug-report">Bug Report</SelectItem>
                                <SelectItem value="feature-request">Feature Request</SelectItem>
                                <SelectItem value="billing-issue">Billing Issue</SelectItem>
                                <SelectItem value="general-question">General Question</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="topic" className="text-right">
                            Topic
                        </Label>
                        <Input
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="col-span-3"
                            placeholder="e.g., Issue with exam results"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="body" className="text-right pt-2">
                            Details
                        </Label>
                        <Textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="col-span-3 min-h-[100px]"
                            placeholder="Please describe the issue in detail."
                        />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="attachment" className="text-right">
                            Attachment
                        </Label>
                        <Input
                            id="attachment"
                            type="file"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Ticket
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
