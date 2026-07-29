import {
  COOKIEBOT_CBID,
  GA4_ID,
  GOOGLE_ADS_ID,
  analyticsEnabled,
} from '@/lib/analytics';

/**
 * European Economic Area + UK + Switzerland.
 *
 * Consent Mode defaults are denied for these regions and granted elsewhere, so
 * visitors from jurisdictions without an opt-in requirement are measured
 * immediately while EEA/UK/CH visitors are measured only after they accept.
 * If Cookiebot is configured to show the banner worldwide this still behaves
 * correctly — accepting simply re-grants what was already granted.
 */
const CONSENT_DENIED_REGIONS = [
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // Non-EU EEA
  'IS', 'LI', 'NO',
  // United Kingdom + Switzerland
  'GB', 'CH',
];

/**
 * Consent Mode v2 defaults + the Cookiebot banner + gtag.
 *
 * Emitted as a single inline <script> in <head> that sets the consent defaults
 * and *then* injects the Cookiebot and gtag loaders itself.
 *
 * That shape is deliberate, after two simpler ones failed:
 *
 *   - `next/script` with `strategy="beforeInteractive"` does not inline script
 *     bodies into <head> in the App Router; it defers them into the streamed
 *     payload, landing the defaults after Cookiebot's own <head> entry.
 *   - Raw sibling <script> tags don't work either: React hoists tags carrying
 *     `src` + `async` above inline ones, so the loaders again preceded the
 *     defaults in the emitted HTML. Async scripts need a network round trip so
 *     the inline block would normally still win — but a `uc.js` served from
 *     cache on a repeat visit can execute immediately, which is a race that
 *     would silently fire tags before consent defaults exist.
 *
 * Creating the loaders from inside the inline block removes the race entirely:
 * defaults are set synchronously at parse time, and nothing Google-owned exists
 * in the document until after that. Both loaders stay `async`, so this costs
 * nothing in the critical path — which matters, because this is an ad landing
 * page and LCP feeds Quality Score feeds cost per click.
 *
 * Blocking mode is deliberately `manual`. Cookiebot's auto-blocking rewrites
 * script tags and is unreliable against scripts React injects at runtime;
 * Consent Mode is the supported mechanism and does not depend on interception.
 */
export function AnalyticsScripts() {
  // Nothing configured (e.g. local dev without env vars) → render nothing at all
  // rather than a banner with no tags behind it.
  if (!COOKIEBOT_CBID && !analyticsEnabled) return null;

  const bootstrap = `(function(){
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;

    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500,
      region: ${JSON.stringify(CONSENT_DENIED_REGIONS)}
    });

    gtag('consent', 'default', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted'
    });

    // Redact ad click ids while ad_storage is denied, and pass gclid through the
    // URL so attribution survives a cookieless first visit.
    gtag('set', 'ads_data_redaction', true);
    gtag('set', 'url_passthrough', true);

    function load(src, attrs){
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      for (var k in attrs) s.setAttribute(k, attrs[k]);
      document.head.appendChild(s);
    }

    ${
      COOKIEBOT_CBID
        ? `load('https://consent.cookiebot.com/uc.js', {
             'id': 'Cookiebot',
             'data-cbid': '${COOKIEBOT_CBID}',
             'data-blockingmode': 'manual'
           });`
        : ''
    }

    ${
      analyticsEnabled
        ? `load('https://www.googletagmanager.com/gtag/js?id=${GA4_ID || GOOGLE_ADS_ID}', {});
           gtag('js', new Date());
           ${GA4_ID ? `gtag('config', '${GA4_ID}', { send_page_view: true });` : ''}
           ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}`
        : ''
    }
  })();`;

  return (
    <script
      id="google-consent-bootstrap"
      dangerouslySetInnerHTML={{ __html: bootstrap }}
    />
  );
}
