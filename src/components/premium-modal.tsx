
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Check, Loader2, Sparkles, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";
import { toast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/ai/flows/create-checkout-session";
import { STRIPE_PRICES } from "@/lib/stripe-prices";

interface PremiumModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function PremiumModal({ isOpen, onOpenChange }: PremiumModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<"one-week" | "lifetime">("lifetime");
    const [isLoading, setIsLoading] = useState(false);
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
            const priceId = selectedPlan === 'one-week' 
                ? STRIPE_PRICES.oneWeek 
                : STRIPE_PRICES.lifetime;

            if (!priceId) {
                throw new Error("Stripe price ID is not configured.");
            }

            const result = await createCheckoutSession({
                priceId: priceId,
                userId: user.uid,
                userEmail: user.email,
                plan: selectedPlan,
            });

            if (result.error) {
                throw new Error(result.error);
            }

            if (!result.url) {
                 throw new Error("Could not create a checkout session URL.");
            }
            
            // Redirect to the checkout URL provided by the server
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
                            <p className="text-3xl font-bold mt-2">$10</p>
                            <p className="text-xs text-muted-foreground mt-1">7 days full access</p>
                        </CardContent>
                    </Card>
                     <Card
                        className={cn("cursor-pointer", selectedPlan === 'lifetime' && "border-primary ring-2 ring-primary")}
                        onClick={() => setSelectedPlan('lifetime')}
                    >
                        <CardContent className="p-6 text-center">
                            <Star className="w-10 h-10 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-bold">Lifetime</h3>
                            <p className="text-3xl font-bold mt-2">$17</p>
                            <p className="text-xs text-muted-foreground mt-1">One-time payment</p>
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
                <div className="mt-6">
                    <Button onClick={handleCheckout} className="w-full" size="lg" disabled={isLoading}>
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
    );
}
