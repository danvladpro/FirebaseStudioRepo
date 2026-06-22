"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Crown, Settings, Clock, LifeBuoy, HelpCircle, ScrollText } from 'lucide-react';
import React from 'react';
import { EditProfileModal } from './edit-profile-modal';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { SupportModal } from './support-modal';
import { LegalSheet } from './legal-sheet';

/**
 * The signed-in user avatar + dropdown menu. Shared by the dashboard header
 * (`app-header`) and the landing page nav so both show the same menu.
 * Renders nothing when no user is signed in.
 */
export function UserMenu() {
  const { user, userProfile, isPremium } = useAuth();
  const router = useRouter();
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = React.useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const [isLegalSheetOpen, setIsLegalSheetOpen] = React.useState(false);

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
  };

  const getPremiumStatusText = () => {
    if (!isPremium || !userProfile?.subscription) return null;

    // Legacy lifetime users (plan no longer sold) keep their permanent badge.
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

      // Final week: switch to an orange "expires soon" warning.
      if (daysLeft < 7) {
        const distance = formatDistanceToNow(new Date(userProfile.subscription.expiresAt));
        return (
          <span className='text-xs font-semibold bg-orange-400/20 text-orange-600 px-2 py-0.5 rounded-md flex items-center gap-1'>
            <Clock className="w-3 h-3" />
            Expires in {distance}
          </span>
        );
      }

      // Otherwise always show remaining days with the premium badge.
      return (
        <span className='text-xs font-semibold bg-emerald-400/20 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1'>
          <Crown className="w-3 h-3" />
          {daysLeft} days left
        </span>
      );
    }
    return null;
  };

  if (!user) return null;

  return (
    <>
      <EditProfileModal isOpen={isEditProfileModalOpen} onOpenChange={setIsEditProfileModalOpen} />
      <SupportModal isOpen={isSupportModalOpen} onOpenChange={setIsSupportModalOpen} />
      <LegalSheet isOpen={isLegalSheetOpen} onOpenChange={setIsLegalSheetOpen} />
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
          <DropdownMenuItem onSelect={() => setIsLegalSheetOpen(true)}>
            <ScrollText className="mr-2 h-4 w-4" />
            Terms &amp; Privacy
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
