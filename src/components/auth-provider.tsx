
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile } from '@/lib/types';
import { isFuture } from 'date-fns';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isPremium: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, isPremium: false, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const sub = userProfile?.subscription;
  const isPremium = 
    (!!sub &&
    sub.status === 'active' &&
    (sub.type === 'lifetime' || (!!sub.expiresAt && isFuture(new Date(sub.expiresAt))))) || userProfile?.preview === true;


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      if (user) {
        document.cookie = 'auth-present=1; path=/; SameSite=Strict';
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            setUserProfile(profileData);
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        });
        return () => unsubscribeSnapshot();
      } else {
        document.cookie = 'auth-present=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const publicPages = ['/', '/login', '/signup', '/verify', '/auth-action', '/checkout/success', '/checkout/cancel'];
    const isPublicPage = publicPages.includes(pathname);
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    // Rule 1: no user on protected page → login
    if (!user && !isPublicPage) {
      router.push('/login');
      return;
    }

    // Rule 2: unverified user trying to access anything except /verify-email and public pages
    if (user && !user.emailVerified && pathname !== '/verify-email' && !isPublicPage) {
      router.push('/verify-email');
      return;
    }

    // Rule 2.5: verified user who hasn't completed the survey → /survey
    if (user && user.emailVerified && !userProfile?.survey && pathname !== '/survey') {
      router.push('/survey');
      return;
    }

    // Rule 3: verified user sitting on /verify-email → move them along
    if (user && user.emailVerified && pathname === '/verify-email') {
      router.push('/dashboard');
      return;
    }

    // Rule 4: logged-in verified user on /login or /signup → dashboard
    if (user && user.emailVerified && isAuthPage) {
      router.push('/dashboard');
      return;
    }

    // Rule 5: logged-in UNverified user on /login or /signup → verify-email
    if (user && !user.emailVerified && isAuthPage) {
      router.push('/verify-email');
      return;
    }

    // Rule 6: all other cases → render children (no redirect)
  }, [user, userProfile, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, userProfile, isPremium, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Effective keyboard platform: the user's saved preference wins; otherwise fall
// back to user-agent detection. Single source of truth for "is this a Mac?".
export const useIsMac = (): boolean => {
  const { userProfile } = useAuth();
  const [navIsMac, setNavIsMac] = useState(false);
  useEffect(() => {
    setNavIsMac(typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac'));
  }, []);
  if (userProfile?.platform) return userProfile.platform === 'mac';
  return navIsMac;
};

// Optimistic auth hint: was this browser signed in last time? Reads the
// `auth-present` cookie that AuthProvider maintains (also used by
// middleware.ts). Returns false on the server and on the first client
// render so statically rendered pages hydrate cleanly, then reflects the
// cookie one frame after mount — long before Firebase resolves the session.
export const useAuthHint = (): boolean => {
  const [hint, setHint] = useState(false);
  useEffect(() => {
    setHint(document.cookie.split('; ').includes('auth-present=1'));
  }, []);
  return hint;
};
