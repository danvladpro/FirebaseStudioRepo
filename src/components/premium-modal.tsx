
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Check, Loader2, Sparkles, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { toast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/ai/flows/create-checkout-session";
import { LegalSheet } from "./legal-sheet";

interface PremiumModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function PremiumModal({ isOpen, onOpenChange }: PremiumModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<"one-week" | "one-month">("one-month");
    const [isLoading, setIsLoading] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [legalSheetOpen, setLegalSheetOpen] = useState(false);
    const { user } = useAuth();

    const handleCheckout = async () => {
        if (!user || !user.email) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to make a purchase.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await createCheckoutSession({
                firebaseToken: await user.getIdToken(),
                plan: selectedPlan,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            if (!result.url) {
                throw new Error("Could not create a checkout session URL.");
            }

            if (!result.url.startsWith('https://checkout.stripe.com')) {
                throw new Error("Unexpected redirect URL.");
            }

            window.location.href = result.url;

        } catch (error: any) {
            toast({
                title: "Checkout Error",
                description: error.message || "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    return (
    <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                        Upgrade to Premium
                    </DialogTitle>
                    <DialogDescription>
                        Unlock all features and accelerate your journey to Excel mastery.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <Card
                        className={cn("cursor-pointer", selectedPlan === 'one-week' && "border-primary ring-2 ring-primary")}
                        onClick={() => setSelectedPlan('one-week')}
                    >
                        <CardContent className="p-6 text-center">
                            <Zap className="w-10 h-10 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-bold">1 Week Access</h3>
                            <p className="text-3xl font-bold mt-2">€9.99</p>
                            <p className="text-xs text-muted-foreground mt-1">7 days full access</p>
                        </CardContent>
                    </Card>
                     <Card
                        className={cn("relative cursor-pointer", selectedPlan === 'one-month' && "border-primary ring-2 ring-primary")}
                        onClick={() => setSelectedPlan('one-month')}
                    >
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                            Most Popular
                        </span>
                        <CardContent className="p-6 text-center">
                            <Star className="w-10 h-10 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-bold">1 Month Access</h3>
                            <p className="text-3xl font-bold mt-2">€14.99</p>
                            <p className="text-xs text-muted-foreground mt-1">30 days full access</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-6">
                    <h4 className="font-semibold mb-3">Premium features include:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Unlimited access to all challenge sets
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Full access to all Exams
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Complete flashcard decks for all sets
                        </li>
                         <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Detailed performance and progress tracking
                        </li>
                    </ul>
                </div>
                <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="terms-agreed"
                            checked={termsAgreed}
                            onCheckedChange={(checked) => setTermsAgreed(checked === true)}
                            className="mt-0.5"
                        />
                        <label htmlFor="terms-agreed" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                            I have read and agree to the{" "}
                            <button
                                type="button"
                                onClick={() => setLegalSheetOpen(true)}
                                className="underline text-foreground hover:text-primary transition-colors"
                            >
                                Terms &amp; Conditions and Privacy Policy
                            </button>
                        </label>
                    </div>
                    <Button
                        onClick={handleCheckout}
                        className="w-full"
                        size="lg"
                        disabled={isLoading || !termsAgreed}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        {isLoading ? "Redirecting..." : "Upgrade Now"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

        <LegalSheet isOpen={legalSheetOpen} onOpenChange={setLegalSheetOpen} />
    </>
    );
}
