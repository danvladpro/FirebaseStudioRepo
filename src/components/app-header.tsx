
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ModeToggle } from './mode-toggle';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export function AppHeader() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  }

  const isPremium = userProfile?.isPremium === true;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/">Home</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
           {user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <div className={cn(
                    "relative rounded-full h-9 w-9",
                    isPremium && "p-0.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                  )}>
                    <Avatar className={cn(
                      "h-full w-full",
                      isPremium && "border-2 border-background"
                    )}>
                      <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                    </Avatar>
                    {isPremium && (
                       <div className="absolute bottom-[-4px] right-[-4px] bg-background p-0.5 rounded-full">
                         <div className="bg-yellow-400 text-yellow-900 rounded-full h-5 w-5 flex items-center justify-center">
                            <Crown className="h-3 w-3" />
                         </div>
                       </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className='flex items-center justify-between'>
                       <p className="text-sm font-medium leading-none">My Account</p>
                       {isPremium && <span className='text-xs font-semibold bg-yellow-400/20 text-yellow-600 px-2 py-0.5 rounded-md'>Premium</span>}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
           )}
        </div>
      </div>
    </header>
  );
}
