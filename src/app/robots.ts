import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/challenge',
        '/drills',
        '/flashcards',
        '/certificate',
        '/results',
        '/drill-results',
        '/survey',
        '/checkout',
        '/verify',
        '/verify-email',
        '/auth-action',
        '/help',
        '/api',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
