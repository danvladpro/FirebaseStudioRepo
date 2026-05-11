"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

type PageState =
  | 'loading'
  | 'verify-success'
  | 'verify-error'
  | 'reset-form'
  | 'reset-success'
  | 'reset-error'
  | 'unknown-mode';

function getPasswordStrength(password: string): { label: string; colorClass: string; width: string } {
  if (!password) return { label: '', colorClass: '', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak', colorClass: 'bg-red-500', width: '25%' };
  if (score === 2) return { label: 'Fair', colorClass: 'bg-orange-500', width: '50%' };
  if (score === 3) return { label: 'Good', colorClass: 'bg-yellow-500', width: '75%' };
  return { label: 'Strong', colorClass: 'bg-primary', width: '100%' };
}

export default function AuthActionClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const mode = params.get('mode');
  const oobCode = params.get('oobCode');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (!oobCode) { setPageState('unknown-mode'); return; }

    if (mode === 'verifyEmail') {
      applyActionCode(auth, oobCode)
        .then(async () => {
          await auth.currentUser?.reload();
          setPageState('verify-success');
          setTimeout(() => {
            if (auth.currentUser) {
              router.push('/survey');
            } else {
              router.push('/login?verified=true');
            }
          }, 2000);
        })
        .catch((err: unknown) => {
          const code = (err as { code?: string }).code;
          setErrorMessage(code === 'auth/expired-action-code'
            ? 'This verification link has expired.'
            : 'This verification link is invalid or has already been used.');
          setPageState('verify-error');
        });
      return;
    }

    if (mode === 'resetPassword') {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => setPageState('reset-form'))
        .catch((err: unknown) => {
          const code = (err as { code?: string }).code;
          setErrorMessage(code === 'auth/expired-action-code'
            ? 'This password reset link has expired.'
            : 'This password reset link is invalid or has already been used.');
          setPageState('reset-error');
        });
      return;
    }

    setPageState('unknown-mode');
  }, [mode, oobCode, router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (!oobCode) return;
    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setPageState('reset-success');
    } catch (error: unknown) {
      toast({ title: "Reset failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) { router.push('/signup'); return; }
    try {
      await sendEmailVerification(auth.currentUser);
      toast({ title: "Verification email sent", description: "Check your inbox." });
      router.push('/verify-email');
    } catch (error: unknown) {
      toast({ title: "Failed to resend", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {/* Loading */}
        {pageState === 'loading' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Processing your request...</p>
          </div>
        )}

        {/* Email verified successfully */}
        {pageState === 'verify-success' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-1 bg-primary" />
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <CheckCircle className="w-14 h-14 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1.5">Email verified!</h1>
                <p className="text-sm text-muted-foreground">Taking you into the app...</p>
              </div>
            </div>
          </div>
        )}

        {/* Verification link expired/invalid */}
        {pageState === 'verify-error' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-1 bg-destructive" />
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <XCircle className="w-14 h-14 text-destructive" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1.5">Link expired</h1>
                <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
              </div>
              <Button onClick={handleResendVerification} className="w-full">
                Send a new verification link
              </Button>
            </div>
          </div>
        )}

        {/* Password reset form */}
        {pageState === 'reset-form' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-1 bg-primary" />
            <div className="p-8 flex flex-col gap-5">
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-1.5">Set a new password</h1>
                <p className="text-sm text-muted-foreground">Choose something strong.</p>
              </div>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  {newPassword && (
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Password strength</span>
                        <span className="text-xs font-semibold text-primary">{strength.label}</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${strength.colorClass}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update password'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Password reset success */}
        {pageState === 'reset-success' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-1 bg-primary" />
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <CheckCircle className="w-14 h-14 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1.5">Password updated!</h1>
                <p className="text-sm text-muted-foreground mb-4">You can now sign in with your new password.</p>
              </div>
              <Button onClick={() => router.push('/login')} className="w-full">
                Sign in
              </Button>
            </div>
          </div>
        )}

        {/* Reset link expired/invalid */}
        {pageState === 'reset-error' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-1 bg-destructive" />
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <XCircle className="w-14 h-14 text-destructive" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1.5">Link expired</h1>
                <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
              </div>
              <Button onClick={() => router.push('/login')} className="w-full">
                Back to sign in
              </Button>
            </div>
          </div>
        )}

        {/* Unknown mode fallback */}
        {pageState === 'unknown-mode' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-muted-foreground text-sm mb-4">Invalid or missing action link.</p>
            <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
              Back to sign in
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
