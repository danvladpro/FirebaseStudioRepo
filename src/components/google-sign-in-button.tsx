"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile } from '@/app/actions/create-user-profile';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * The Google "G" mark. Inlined as an SVG so there is no external image request
 * and no extra dependency — and it is the one place in the app where Google's
 * own brand colours (rather than the emerald/orange palette) are correct.
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

interface GoogleSignInButtonProps {
  /** Button label — e.g. "Continue with Google". */
  label?: string;
  /** Disable while the sibling email/password form is submitting. */
  disabled?: boolean;
  /** Lets the parent disable its own form button while the popup is open. */
  onBusyChange?: (busy: boolean) => void;
}

export function GoogleSignInButton({
  label = 'Continue with Google',
  disabled = false,
  onBusyChange,
}: GoogleSignInButtonProps) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const setBusyState = (value: boolean) => {
    setBusy(value);
    onBusyChange?.(value);
  };

  const handleGoogleSignIn = async () => {
    setBusyState(true);
    const provider = new GoogleAuthProvider();
    // Always let the user pick an account instead of silently reusing the last
    // one — important on shared/work machines.
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const { user } = await signInWithPopup(auth, provider);

      // signInWithPopup does NOT create the Firestore profile document, and
      // for a returning Google user it already exists — so we always call the
      // server action and let it decide based on whether the doc is there.
      // That existence check (rather than `isNewUser`) means a sign-in that
      // died before the write landed is repaired on the next attempt.
      const token = await user.getIdToken();
      await createUserProfile(token, user.email ?? '');

      // Google has already verified the address, so the /verify-email gate is a
      // no-op here. AuthProvider's survey gate takes over and sends first-time
      // users to /survey; everyone else lands on the dashboard.
      router.push('/dashboard');
    } catch (error: unknown) {
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : '';

      // The user simply changed their mind, or a second popup superseded this
      // one. Neither is an error worth shouting about.
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/user-cancelled'
      ) {
        setBusyState(false);
        return;
      }

      let description = "Google sign-in failed. Please try again.";
      if (code === 'auth/account-exists-with-different-credential') {
        description =
          "You already have an account with this email address. Please sign in with your email and password instead.";
      } else if (code === 'auth/popup-blocked') {
        description = "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
      } else if (code === 'auth/unauthorized-domain') {
        description = "Google sign-in isn't available on this domain yet. Please use email and password.";
      } else if (code === 'auth/network-request-failed') {
        description = "Network error. Check your connection and try again.";
      } else if (code === 'auth/too-many-requests') {
        description = "Too many attempts. Please wait a moment and try again.";
      }

      toast({ title: "Google Sign-In Failed", description, variant: "destructive" });
      setBusyState(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={disabled || busy}
    >
      {busy ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon className="mr-2 h-4 w-4" />
      )}
      {busy ? 'Connecting...' : label}
    </Button>
  );
}

/** Small "or" rule used to separate the Google button from the email form. */
export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
