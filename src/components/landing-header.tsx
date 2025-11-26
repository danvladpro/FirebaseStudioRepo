
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "./auth-provider";
import React, { Suspense } from "react";
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
import { cn } from "@/lib/utils";
import { Crown, Settings, LifeBuoy, LayoutDashboard, HelpCircle } from "lucide-react";
import { EditProfileModal } from "./edit-profile-modal";
import { SupportModal } from "./support-modal";
import { differenceInDays, formatDistanceToNow } from "date-fns";


function HeaderContent() {
    const { user, userProfile, isPremium } = useAuth();
    const router = useRouter();
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = React.useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
    };
    
    const getInitials = (name: string | null | undefined) => {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const getPremiumStatusText = () => {
        if (!isPremium || !userProfile?.subscription) return null;

        if (userProfile.subscription.type === 'lifetime') {
          return (
            <span className='text-xs font-semibold bg-yellow-400/20 text-yellow-600 px-2 py-0.5 rounded-md flex items-center gap-1'>
              <Crown className="w-3 h-3" />
              Lifetime
            </span>
          );
        }

        if (userProfile.subscription.expiresAt) {
          const daysLeft = differenceInDays(new Date(userProfile.subscription.expiresAt), new Date());
          const distance = formatDistanceToNow(new Date(userProfile.subscription.expiresAt));
          if (daysLeft < 7) {
            return (
              <span className='text-xs font-semibold bg-orange-400/20 text-orange-600 px-2 py-0.5 rounded-md flex items-center gap-1'>
                <Crown className="w-3 h-3" />
                Expires in {distance}
              </span>
            );
          }
        }
        return null;
    }

    return (
        <>
            <EditProfileModal isOpen={isEditProfileModalOpen} onOpenChange={setIsEditProfileModalOpen} />
            <SupportModal isOpen={isSupportModalOpen} onOpenChange={setIsSupportModalOpen} />
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Logo />
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <Link href="#features" className="text-muted-foreground hover:text-foreground">
                                Features
                            </Link>
                            <Link href="#benefits" className="text-muted-foreground hover:text-foreground">
                                Benefits
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
                                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent">
                                    <Avatar className="h-9 w-9">
                                      <div className={cn(
                                          "w-full h-full rounded-full flex items-center justify-center",
                                          isPremium && "p-0.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                                        )}>
                                          <div className={cn("w-full h-full rounded-full flex items-center justify-center", isPremium && "bg-background")}>
                                            <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
                                          </div>
                                      </div>
                                    </Avatar>
                                    {isPremium && (
                                        <div className="absolute bottom-[-2px] right-[-2px] bg-background p-0.5 rounded-full border">
                                          <div className="bg-yellow-400 text-yellow-900 rounded-full h-4 w-4 flex items-center justify-center">
                                            <Crown className="h-2.5 w-2.5" />
                                          </div>
                                        </div>
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <div className='flex items-center justify-between'>
                                            <p className="text-sm font-medium leading-none">{userProfile?.name || 'My Account'}</p>
                                            {getPremiumStatusText()}
                                        </div>
                                        <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                        </p>
                                    </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            Go to Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setIsEditProfileModalOpen(true)}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </DropdownMenuItem>
                                     <DropdownMenuItem asChild>
                                        <Link href="/help">
                                          <HelpCircle className="mr-2 h-4 w-4" />
                                          Help & Support
                                        </Link>
                                      </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setIsSupportModalOpen(true)}>
                                        <LifeBuoy className="mr-2 h-4 w-4" />
                                        Contact Support
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline">
                                    <Link href="/login">Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}


export function LandingHeader() {
    return (
        <Suspense>
            <HeaderContent />
        </Suspense>
    )
}
