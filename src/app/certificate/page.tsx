"use client";

// "Classic & prestigious" certificate design.
// Assets required in /public: mono-emerald.svg, seal.svg.

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Image from 'next/image';
import { Cormorant_Garamond, Inter } from 'next/font/google';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], style: ['normal', 'italic'] });
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const S = {
  page: {
    backgroundColor: '#FDFBF5',
    width: '29.7cm',
    height: '21cm',
    boxSizing: 'border-box' as const,
    padding: '26px',
    display: 'flex',
    position: 'relative' as const,
  },
  frame: {
    flex: 1,
    border: '1.5px solid #B3BDB4',
    outline: '4px solid #065F46',
    outlineOffset: '-12px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    boxSizing: 'border-box' as const,
    padding: '56px 90px 44px',
    position: 'relative' as const,
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandName: { fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A' },
  kicker: {
    fontSize: '14px', fontWeight: 500, letterSpacing: '0.34em',
    textTransform: 'uppercase' as const, color: '#8A8271', marginTop: '40px',
  },
  goldRuleShort: { width: '64px', height: '1px', backgroundColor: '#C9A24B', margin: '18px 0 30px' },
  certify: { fontStyle: 'italic' as const, fontWeight: 500, fontSize: '26px', color: '#57534E' },
  name: { fontWeight: 700, fontSize: '76px', color: '#064E3B', margin: '14px 0 6px', lineHeight: 1.05 },
  goldRuleLong: { width: '340px', height: '1px', backgroundColor: '#C9A24B' },
  body: {
    fontWeight: 500, fontSize: '21px', color: '#44403C', maxWidth: '640px',
    textAlign: 'center' as const, lineHeight: 1.55, margin: '28px 0 0',
    textWrap: 'pretty' as const,
  },
  footer: {
    marginTop: 'auto', width: '100%', display: 'flex',
    justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' as const,
  },
  sigBlock: { textAlign: 'center' as const },
  sigName: { fontStyle: 'italic' as const, fontWeight: 600, fontSize: '24px', color: '#1C1917' },
  sigDate: { fontWeight: 600, fontSize: '22px', color: '#1C1917' },
  sigLine: { width: '220px', height: '1px', backgroundColor: '#A8A29E', margin: '6px auto' },
  sigLabel: {
    fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em',
    textTransform: 'uppercase' as const, color: '#78716C',
  },
  seal: { width: '150px', height: 'auto', marginBottom: '-8px' },
  certId: {
    position: 'absolute' as const, bottom: '14px', left: 0, right: 0,
    textAlign: 'center' as const, fontSize: '10px', color: '#A8A29E', letterSpacing: '0.05em',
  },
};

function CertificateContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Valued User';
  const date =
    searchParams.get('date') ||
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certificateId = searchParams.get('certId');

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 print:bg-white print:p-0">
      <style>{'@page { size: A4 landscape; margin: 0; }'}</style>
      <div className="print-controls mb-4 print:hidden flex items-center justify-center flex-col gap-4">
        <h2 className="text-lg font-semibold">Certificate Preview</h2>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print or Save as PDF
        </Button>
      </div>
      <div style={S.page} className={sans.className} id="certificate">
        <div style={S.frame}>
          <div style={S.brandRow}>
            <Image src="/mono-emerald.svg" alt="Ninja Shortcuts" width={40} height={40} />
            <span style={S.brandName}>Ninja Shortcuts</span>
          </div>
          <div style={S.kicker}>Certificate of Mastery</div>
          <div style={S.goldRuleShort} />
          <div className={serif.className} style={S.certify}>This is to certify that</div>
          <div className={serif.className} style={S.name}>{name}</div>
          <div style={S.goldRuleLong} />
          <p className={serif.className} style={S.body}>
            has achieved Excel Shortcuts mastery — conquering every challenge and timed drill, and
            demonstrating true command of essential Excel shortcuts and workflows.
          </p>
          <div style={S.footer}>
            <div style={S.sigBlock}>
              <div className={serif.className} style={S.sigName}>Ninja Shortcuts</div>
              <div style={S.sigLine} />
              <div style={S.sigLabel}>Issued by</div>
            </div>
            <Image src="/seal.svg" alt="Official Seal" width={150} height={100} style={S.seal} />
            <div style={S.sigBlock}>
              <div className={serif.className} style={S.sigDate}>{date}</div>
              <div style={S.sigLine} />
              <div style={S.sigLabel}>Date of completion</div>
            </div>
          </div>
          {certificateId && (
            <div style={S.certId}>
              Verify this certificate at ninjashortcuts.com/verify?id={certificateId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense>
      <CertificateContent />
    </Suspense>
  );
}
