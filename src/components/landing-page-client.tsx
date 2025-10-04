
"use client";

import { LandingHeader } from "@/components/landing-header";
import { LandingHero } from "@/components/landing-hero";
import { LandingFeatures } from "@/components/landing-features";
import { LandingPricing } from "@/components/landing-pricing";
import { LandingFooter } from "@/components/landing-footer";
import { LandingDonation } from "@/components/landing-donation";

export function LandingPageClient() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingDonation />
      </main>
      <LandingFooter />
    </div>
  );
}
