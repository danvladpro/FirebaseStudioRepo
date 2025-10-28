
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
    !!sub &&
    sub.status === 'active' &&
    (sub.type === 'lifetime' || (!!sub.expiresAt && isFuture(new Date(sub.expiresAt))));


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      if (user) {
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
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
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

  return (
    <AuthContext.Provider value={{ user, userProfile, isPremium, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
