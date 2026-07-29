
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { AnalyticsScripts } from '@/components/analytics/analytics-scripts';
import { AnalyticsListener } from '@/components/analytics/analytics-listener';
import { Suspense } from 'react';
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'excel keyboard shortcuts',
    'learn excel shortcuts',
    'excel shortcuts training',
    'excel shortcuts practice',
    'excel drills',
    'excel flashcards',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
      <head>
        {/* Consent defaults must execute in <head> before anything Google
            loads. Raw <script> tags here so document order is guaranteed —
            see analytics-scripts.tsx for why next/script doesn't work. */}
        <AnalyticsScripts />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <AnalyticsListener />
      </body>
    </html>
  );
}
