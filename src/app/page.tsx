
import { LandingBenefits } from "@/components/landing-benefits";
import { LandingDonation } from "@/components/landing-donation";
import { LandingFeatures } from "@/components/landing-features";
import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { LandingHero } from "@/components/landing-hero";
import { LandingPricing } from "@/components/landing-pricing";


export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingBenefits />
        <LandingPricing />
        <LandingDonation />
      </main>
      <LandingFooter />
    </div>
  );
}
