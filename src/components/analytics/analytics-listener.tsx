"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsEnabled, trackPageView } from '@/lib/analytics';

/**
 * Bridges Cookiebot's consent state into Google Consent Mode, and reports
 * client-side navigations to GA4.
 *
 * The Cookiebot dashboard has its own Consent Mode integration; this bridge is
 * deliberately independent of it so consent still propagates if that setting is
 * off or gets toggled. Sending the same signals twice is idempotent.
 */
export function AnalyticsListener() {
  const pathname = usePathname();
  // gtag('config') already emits the initial page_view, so skip the first run
  // to avoid counting the landing page twice.
  const isFirstPathname = useRef(true);

  // ── Cookiebot → Consent Mode ───────────────────────────────────────────────
  useEffect(() => {
    const syncConsent = () => {
      const consent = window.Cookiebot?.consent;
      if (!consent || typeof window.gtag !== 'function') return;

      window.gtag('consent', 'update', {
        analytics_storage: consent.statistics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied',
        functionality_storage: consent.preferences ? 'granted' : 'denied',
        personalization_storage: consent.preferences ? 'granted' : 'denied',
      });
    };

    // ConsentReady covers the returning-visitor case (consent already stored);
    // Accept/Decline cover a fresh choice made in the dialog.
    const events = [
      'CookiebotOnConsentReady',
      'CookiebotOnAccept',
      'CookiebotOnDecline',
    ];
    events.forEach((e) => window.addEventListener(e, syncConsent));

    // Cookiebot may have finished before this effect ran.
    if (window.Cookiebot?.consent) syncConsent();

    return () => events.forEach((e) => window.removeEventListener(e, syncConsent));
  }, []);

  // ── SPA route changes → GA4 page_view ──────────────────────────────────────
  useEffect(() => {
    if (!analyticsEnabled) return;
    if (isFirstPathname.current) {
      isFirstPathname.current = false;
      return;
    }
    // Read the query string from the URL rather than useSearchParams(), which
    // would opt the entire app out of static rendering from the root layout.
    trackPageView(pathname + window.location.search);
  }, [pathname]);

  return null;
}
