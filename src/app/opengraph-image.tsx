// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import type { CSSProperties } from 'react';
import { SITE_NAME } from '@/lib/seo';

export const alt =
  'Ninja Shortcuts — You can be a lot faster in Excel. Learn shortcuts.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand accent (default from the "Link Preview Redesign" handoff).
const ACCENT = '#16a673';

// Small spreadsheet / key-row mark, matching the site logo in the OG card.
function BrandMark({ box, glyph }: { box: number; glyph: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: box,
        height: box,
        borderRadius: box * 0.28,
        backgroundColor: ACCENT,
      }}
    >
      <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" fill="#ffffff" opacity="0.95" />
        <rect x="5" y="9" width="2.4" height="2.4" rx="0.6" fill={ACCENT} />
        <rect x="9" y="9" width="2.4" height="2.4" rx="0.6" fill={ACCENT} />
        <rect x="13" y="9" width="2.4" height="2.4" rx="0.6" fill={ACCENT} />
        <rect x="17" y="9" width="2.4" height="2.4" rx="0.6" fill={ACCENT} />
        <rect x="6" y="13.5" width="12" height="2.4" rx="1.2" fill={ACCENT} />
      </svg>
    </div>
  );
}

const keycapBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px 30px',
  borderRadius: 14,
  fontSize: 34,
  fontWeight: 700,
};

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '76px 84px',
        }}
      >
        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <BrandMark box={72} glyph={34} />
          <div style={{ display: 'flex', color: '#15201b', fontSize: 40, fontWeight: 700 }}>
            {SITE_NAME}
          </div>
        </div>

        {/* Headline + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: '#15201b', fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            You can be a lot faster in Excel.
          </div>
          <div style={{ display: 'flex', color: ACCENT, fontSize: 58, fontWeight: 800, lineHeight: 1.15 }}>
            Learn shortcuts.
          </div>
          <div style={{ display: 'flex', color: '#4c5750', fontSize: 32, fontWeight: 500, marginTop: 24 }}>
            The most interactive Excel Shortcuts trainer on the market.
          </div>
        </div>

        {/* Key-cap example */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              ...keycapBase,
              backgroundColor: '#ffffff',
              border: '2px solid #d7ddd8',
              color: '#15201b',
            }}
          >
            Ctrl
          </div>
          <div style={{ display: 'flex', color: '#8a938c', fontSize: 34, fontWeight: 700 }}>+</div>
          <div style={{ ...keycapBase, backgroundColor: ACCENT, color: '#ffffff' }}>D</div>
          <div style={{ display: 'flex', color: '#6b746d', fontSize: 28, marginLeft: 16 }}>
            Fill Down — one of 100+ shortcuts you&apos;ll master
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
