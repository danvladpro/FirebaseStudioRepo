/**
 * Analytics + Google Ads conversion tracking.
 *
 * Consent is handled by Cookiebot via Google Consent Mode v2. Every gtag call
 * below is safe to make unconditionally: until the visitor grants consent the
 * default state (set in `analytics-scripts.tsx`) is `denied`, so gtag buffers
 * without writing cookies. Do not add manual consent checks here — that would
 * double-gate the events and lose the ones Google can model post-consent.
 */

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? '';
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? '';
export const COOKIEBOT_CBID = process.env.NEXT_PUBLIC_COOKIEBOT_CBID ?? '';

/** Google Ads conversion label for a completed purchase (the part after the `/`). */
export const ADS_PURCHASE_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL ?? '';

export const analyticsEnabled = Boolean(GA4_ID || GOOGLE_ADS_ID);

/**
 * The funnel a paid click walks through. Kept as a closed union so a typo can't
 * silently create a new event name that never shows up in a GA4 report.
 */
export type FunnelEvent =
  | 'landing_cta_click'
  | 'signup_started'
  | 'signup_completed'
  | 'verification_email_resent'
  | 'email_verified'
  | 'survey_completed'
  | 'challenge_started'
  | 'challenge_completed'
  | 'paywall_viewed'
  | 'checkout_started'
  | 'purchase';

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    // Injected by Cookiebot's uc.js
    Cookiebot?: {
      consent: {
        necessary: boolean;
        preferences: boolean;
        statistics: boolean;
        marketing: boolean;
      };
      renew: () => void;
      show: () => void;
    };
  }
}

function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  // The shim is defined synchronously in the beforeInteractive script, so it is
  // always present by the time React code runs. The dataLayer fallback covers
  // the case where that script was blocked (ad blocker, CSP) — pushing an array
  // is equivalent to pushing `arguments`, both being indexed + length.
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

/** Fire a funnel event to GA4. No-op when no measurement ID is configured. */
export function trackEvent(event: FunnelEvent, params?: GtagParams): void {
  if (!analyticsEnabled) return;
  gtag('event', event, params ?? {});
}

/** Fire a GA4 `page_view`. Needed on client-side navigation, which gtag can't see. */
export function trackPageView(path: string): void {
  if (!GA4_ID) return;
  gtag('event', 'page_view', {
    page_path: path,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
  });
}

interface PurchaseArgs {
  /** Amount actually charged, in euros. */
  value: number;
  /** Stripe Checkout session id — dedupes if the success page is reloaded. */
  transactionId: string;
  currency?: string;
  plan?: string;
}

/**
 * Report a confirmed purchase to both GA4 and Google Ads.
 *
 * Only call this once the Stripe webhook has actually granted access — landing
 * on the success URL is not proof of payment (async methods like iDEAL settle
 * later, and the page can be reloaded).
 */
export function trackPurchase({
  value,
  transactionId,
  currency = 'EUR',
  plan,
}: PurchaseArgs): void {
  if (!analyticsEnabled) return;

  // GA4 ecommerce purchase
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items_plan: plan,
  });

  // Google Ads conversion
  if (GOOGLE_ADS_ID && ADS_PURCHASE_LABEL) {
    gtag('event', 'conversion', {
      send_to: `${GOOGLE_ADS_ID}/${ADS_PURCHASE_LABEL}`,
      transaction_id: transactionId,
      value,
      currency,
    });
  }
}

/** Price shown in the UI for each plan, used as the reported conversion value. */
export const PLAN_VALUES: Record<string, number> = {
  'one-week': 9.99,
  'one-month': 14.99,
};

/** Re-open the Cookiebot consent dialog (for the footer "Cookie settings" link). */
export function openCookieSettings(): void {
  window.Cookiebot?.renew();
}
