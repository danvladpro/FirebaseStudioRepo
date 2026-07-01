
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Excel Ninja',
  description:
    'Master Excel keyboard shortcuts through interactive flashcards, timed drills, and real-world scenarios.',
  icons: {
    icon: { url: '/mono-emerald.svg', type: 'image/svg+xml' },
    shortcut: '/mono-emerald.svg',
    apple: '/mono-emerald.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
