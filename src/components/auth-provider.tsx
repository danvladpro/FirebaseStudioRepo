
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

// Helper to check sessionStorage safely on the client
const isGuestSessionActive = () => {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem('isGuest') === 'true';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // This will only run once on the client when the component mounts
  const [isGuest, setIsGuest] = useState(isGuestSessionActive());

  useEffect(() => {
    // When the component loads, check if the `?guest=true` param is in the URL.
    // If it is, we activate guest mode and store it in sessionStorage.
    if (typeof window !== 'undefined' && searchParams.get('guest') === 'true') {
      window.sessionStorage.setItem('isGuest', 'true');
      setIsGuest(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If a user signs in, they are no longer a guest.
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem('isGuest');
        }
        setIsGuest(false);
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isLandingPage = pathname === '/';
    
    // A guest is allowed on these specific paths
    const isGuestAllowedPath = ['/dashboard', '/challenges', '/flashcards', '/results'].some(p => pathname.startsWith(p)) || pathname.startsWith('/challenge/') || pathname.startsWith('/flashcards/');
    
    if (isGuest && isGuestAllowedPath) {
      // If in guest mode and on an allowed path, do nothing.
      return;
    }

    // A protected route is any route that isn't the landing page or an auth page
    const isProtectedRoute = !isAuthPage && !isLandingPage;

    if (!user && isProtectedRoute && !isGuest) {
      router.push('/login');
    }
    
    // If a user is logged in, they shouldn't be on the auth pages or in a guest-parameterized URL
    if (user && (isAuthPage || searchParams.get('guest') === 'true')) {
       // Clear guest param and redirect to a clean dashboard URL
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router, isGuest, searchParams]);

  return (
    <AuthContext.Provider value={{ user, loading, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
