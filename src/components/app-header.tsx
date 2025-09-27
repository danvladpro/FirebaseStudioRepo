
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
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppHeader() {
  const { user, isGuest } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleLogout = async () => {
    await signOut(auth);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('isGuest');
    }
    router.push('/');
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  }

  const guestQuery = isGuest ? '?guest=true' : '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href={`/dashboard${guestQuery}`}>
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/">Home</Link>
            </Button>
            <Button variant="link" asChild className="text-muted-foreground hover:text-foreground">
              <Link href={`/dashboard${guestQuery}`}>Dashboard</Link>
            </Button>
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
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
            isClient && isGuest && (
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            )
           )}
        </div>
      </div>
    </header>
  );
}
