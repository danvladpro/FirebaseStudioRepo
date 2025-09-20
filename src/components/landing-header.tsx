"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "./auth-provider";

export function LandingHeader() {
    const { user } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <div className="container flex h-16 items-center justify-between">
                <Logo />
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="#features" className="text-muted-foreground hover:text-foreground">
                        Features
                    </Link>
                    <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
                        Pricing
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {user ? (
                         <Button asChild>
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link href="/login">Sign In</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/signup">Sign Up</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
