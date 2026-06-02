import { LandingNav } from "@/components/landing/landing-nav";
import { LandingContent } from "@/components/landing/landing-content";
import { inter, interTight, jetbrainsMono } from "@/components/landing/fonts";
import styles from "@/components/landing/landing.module.css";

export default function Home() {
  return (
    <div className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${styles.page}`}>
      <LandingNav />
      <main>
        <LandingContent />
      </main>
    </div>
  );
}
