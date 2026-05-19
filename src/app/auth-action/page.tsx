import { Suspense } from 'react';
import AuthActionClient from './client';

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
          <p className="text-muted-foreground text-sm">Processing...</p>
        </div>
      }
    >
      <AuthActionClient />
    </Suspense>
  );
}
