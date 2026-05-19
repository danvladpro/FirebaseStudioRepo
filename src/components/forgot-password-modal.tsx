"use client";

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

type ModalState = 'idle' | 'loading' | 'sent';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<ModalState>('idle');
  const { toast } = useToast();

  const handleClose = (open: boolean) => {
    if (!open) {
      // Reset state when modal closes so it's fresh next time
      setTimeout(() => { setState('idle'); setEmail(''); }, 200);
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      await sendPasswordResetEmail(auth, email);
      setState('sent');
    } catch {
      setState('idle');
      // Show generic message to avoid leaking which emails are registered
      toast({
        title: "Something went wrong",
        description: "If that address is registered, you'll receive a reset link shortly.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {state !== 'sent' ? (
          <>
            <DialogHeader>
              <DialogTitle>Reset your password</DialogTitle>
              <DialogDescription>
                Enter your email and we'll send you a reset link.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={state === 'loading'}
                />
              </div>
              <Button type="submit" className="w-full" disabled={state === 'loading'}>
                {state === 'loading' ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Link sent!</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Check <strong>{email}</strong> for a reset link.<br />
                It expires in 1 hour.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => handleClose(false)}>
              Back to sign in
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
