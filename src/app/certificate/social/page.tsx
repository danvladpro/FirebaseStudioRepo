"use client";

// Shareable 1200x630 social card.
// Assets required in /public: mono-white.svg, NinjaCelebrate.svg.
// Reuses the same query params as the certificate page: ?name=...&date=...

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['700'] });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '700'] });

const S = {
  card: {
    backgroundColor: '#065F46', width: '1200px', height: '630px',
    boxSizing: 'border-box' as const, display: 'flex',
    overflow: 'hidden', position: 'relative' as const,
  },
  left: {
    flex: 1, padding: '64px 72px', display: 'flex',
    flexDirection: 'column' as const, justifyContent: 'center', boxSizing: 'border-box' as const,
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandName: { fontSize: '19px', fontWeight: 700, color: '#fff' },
  kicker: {
    fontSize: '13px', fontWeight: 500, letterSpacing: '0.3em',
    textTransform: 'uppercase' as const, color: '#FFAB40', marginTop: '44px',
  },
  name: { fontWeight: 700, fontSize: '74px', color: '#fff', lineHeight: 1.02, marginTop: '12px' },
  body: {
    fontSize: '19px', color: 'rgba(255,255,255,0.82)', maxWidth: '520px',
    lineHeight: 1.55, margin: '22px 0 0',
  },
  meta: { fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginTop: '34px' },
  ninja: { width: '400px', height: 'auto', alignSelf: 'flex-end' as const, marginRight: '24px' },
};

function SocialCardContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Valued User';
  const date =
    searchParams.get('date') ||
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const download = async () => {
    const { toPng } = await import('html-to-image');
    const node = document.getElementById('social-card');
    if (!node) return;
    const dataUrl = await toPng(node, { pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `excel-shortcuts-ninja-certificate-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 gap-4">
      <div className="flex items-center justify-center flex-col gap-4">
        <h2 className="text-lg font-semibold">Share your achievement</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Download this image and post it on LinkedIn, X, or anywhere else to show off your mastery.
        </p>
        <Button onClick={download}>
          <Download className="mr-2 h-4 w-4" />
          Download image
        </Button>
      </div>
      <div style={S.card} className={sans.className} id="social-card">
        <div style={S.left}>
          <div style={S.brandRow}>
            <Image src="/mono-white.svg" alt="" width={36} height={36} />
            <span style={S.brandName}>Ninja Shortcuts</span>
          </div>
          <div style={S.kicker}>Certified Master</div>
          <div className={serif.className} style={S.name}>{name}</div>
          <p style={S.body}>
            Every challenge conquered. Every drill defeated. Excel shortcuts, mastered like a ninja.
          </p>
          <div style={S.meta}>{date} · www.ninjashortcuts.com</div>
        </div>
        <Image src="/NinjaCelebrate.svg" alt="Celebrating ninja" width={400} height={400} style={S.ninja} />
      </div>
    </div>
  );
}

export default function SocialCardPage() {
  return (
    <Suspense>
      <SocialCardContent />
    </Suspense>
  );
}
