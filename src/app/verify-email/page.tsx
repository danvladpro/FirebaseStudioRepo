"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { RefreshCw, Mail } from 'lucide-react';

const COOLDOWN_KEY = 'verifyEmailCooldownExpiry';
const COOLDOWN_SECONDS = 60;

function getCooldownRemaining(): number {
  if (typeof window === 'undefined') return 0;
  const expiry = sessionStorage.getItem(COOLDOWN_KEY);
  if (!expiry) return 0;
  const remaining = Math.ceil((parseInt(expiry, 10) - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Restore cooldown from sessionStorage on mount (survives page refresh)
  useEffect(() => {
    setCooldown(getCooldownRemaining());
  }, []);

  // Tick the cooldown counter down every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCheckNow = async () => {
    if (!user) return;
    setChecking(true);
    try {
      await user.reload();
      if (auth.currentUser?.emailVerified) {
        router.push('/survey');
      } else {
        toast({
          title: "Not verified yet",
          description: "Check your inbox and click the link we sent you.",
        });
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    if (!user || cooldown > 0) return;
    try {
      await sendEmailVerification(user);
      const expiry = Date.now() + COOLDOWN_SECONDS * 1000;
      sessionStorage.setItem(COOLDOWN_KEY, String(expiry));
      setCooldown(COOLDOWN_SECONDS);
      toast({ title: "Verification email sent", description: "Check your inbox." });
    } catch (error) {
      toast({ title: "Failed to resend", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleDifferentEmail = async () => {
    try {
      await signOut(auth);
      router.push('/signup');
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-1 bg-primary" />
          <div className="p-8 flex flex-col items-center gap-5 text-center">

            <div className="relative">
              <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white text-xs font-bold leading-none">1</span>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1.5">Check your email</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a verification link to<br />
                <strong className="text-gray-900">{user?.email}</strong>
              </p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <Button
                onClick={handleCheckNow}
                disabled={checking}
                className="w-full gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Checking...' : 'I verified — check now'}
              </Button>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={cooldown > 0}
                className="w-full"
              >
                {cooldown > 0 ? `Resend link (${cooldown}s)` : 'Resend link'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Can't find it? Check your spam folder.
              <br />
              <button
                onClick={handleDifferentEmail}
                className="text-primary underline underline-offset-2 hover:opacity-80 mt-1"
              >
                Use a different email address
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
