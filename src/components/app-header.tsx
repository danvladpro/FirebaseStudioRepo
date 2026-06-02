
"use client";

import Link from 'next/link';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { UserMenu } from './user-menu';

export function AppHeader() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="link" asChild className="text-foreground/80 hover:text-foreground">
              <Link href="/">Home</Link>
            </Button>
            <Button variant="link" asChild className="text-foreground/80 hover:text-foreground">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
             <Button variant="link" asChild className="text-foreground/80 hover:text-foreground">
              <Link href="/help">Help</Link>
            </Button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <UserMenu />
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
