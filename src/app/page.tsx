import type { Metadata } from 'next';
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingContent } from "@/components/landing/landing-content";
import { inter, interTight, jetbrainsMono } from "@/components/landing/fonts";
import styles from "@/components/landing/landing.module.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@ninjashortcuts.com',
        contactType: 'customer support',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: [
        {
          '@type': 'Offer',
          name: '1-Week Access',
          price: '9.99',
          priceCurrency: 'EUR',
        },
        {
          '@type': 'Offer',
          name: '1-Month Access',
          price: '14.99',
          priceCurrency: 'EUR',
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${styles.page}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav />
      <main>
        <LandingContent />
      </main>
    </div>
  );
}
