// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import type { CSSProperties } from 'react';
import { SITE_NAME } from '@/lib/seo';

export const alt =
  'Excel Shortcuts Ninja — Learn Excel Shortcuts. Stop wasting time.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const keycap: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '14px 28px',
  borderRadius: 12,
  border: '2px solid #334155',
  backgroundColor: '#1e293b',
  color: '#f8fafc',
  fontSize: 36,
  fontWeight: 600,
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
          backgroundColor: '#0b1220',
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: '#10b981',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 50 50" fill="none">
              <path d="M15 18H25" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M15 25H35" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M15 32H25" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M30 18L35 32" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', color: '#f8fafc', fontSize: 40, fontWeight: 600 }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', color: '#f8fafc', fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Learn Excel Shortcuts.
          </div>
          <div style={{ display: 'flex', color: '#34d399', fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Stop wasting time.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={keycap}>Ctrl</div>
          <div style={{ display: 'flex', color: '#64748b', fontSize: 36 }}>+</div>
          <div
            style={{
              ...keycap,
              backgroundColor: '#10b981',
              border: '2px solid #34d399',
            }}
          >
            D
          </div>
          <div style={{ display: 'flex', color: '#94a3b8', fontSize: 28, marginLeft: 14 }}>
            Fill Down — one of 100+ shortcuts you&apos;ll master
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
