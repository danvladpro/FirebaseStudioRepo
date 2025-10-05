
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "./auth-provider";
import { Suspense } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// NOTE: Auth has been temporarily disabled for debugging.
const useAuthBypass = () => ({ user: null });

function HeaderContent() {
    const { user } = useAuthBypass();
    const router = useRouter();

    const handleLogout = async () => {
        // await signOut(auth);
        router.push('/');
    };

    const getInitials = (email: string | null | undefined) => {
        if (!email) return '??';
        return email.substring(0, 2).toUpperCase();
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-6">
                    <Logo />
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="#features" className="text-muted-foreground hover:text-foreground">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
                            Pricing
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                                </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">My Account</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                    </p>
                                </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard">Go to Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                 Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}


export function LandingHeader() {
    return (
        <Suspense>
            <HeaderContent />
        </Suspense>
    )
}
