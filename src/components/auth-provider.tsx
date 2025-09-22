
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isGuest: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isGuest = searchParams.get('guest') === 'true';

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
    
    // Allow guest access to certain pages
    const isGuestAllowedPath = ['/dashboard', '/challenges', '/flashcards', '/challenge', '/results'].some(p => pathname.startsWith(p));
    
    if (isGuest && isGuestAllowedPath) {
      // If in guest mode and on an allowed path, do nothing.
      return;
    }

    const isProtectedRoute = !isAuthPage && !isLandingPage;

    if (!user && isProtectedRoute) {
      router.push('/login');
    }
    if (user && (isAuthPage || isGuest)) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router, isGuest]);

  return (
    <AuthContext.Provider value={{ user, loading, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
