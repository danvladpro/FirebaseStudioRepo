"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isLandingPage = pathname === '/';
    const isProtectedRoute = !isAuthPage && !isLandingPage;

    if (!user && isProtectedRoute) {
      router.push('/login');
    }
    if (user && isAuthPage) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  // While loading, and on a protected route, show a skeleton to avoid layout shifts
  if (loading && !pathname.startsWith('/_next') && pathname !== '/' && pathname !== '/login' && pathname !== '/signup') {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
          <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <div className="container flex items-center justify-between h-16">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </header>
          <main className="flex-1 container py-8 md:py-12 mt-16">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </main>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);