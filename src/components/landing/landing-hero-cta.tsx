"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useAuth, useAuthHint } from "@/components/auth-provider";
import { trackEvent } from "@/lib/analytics";
import styles from "./landing.module.css";

const cx = (...keys: string[]) => keys.map((k) => styles[k]).filter(Boolean).join(" ");

function HeroPrimaryCtaInner() {
  const { user, loading } = useAuth();
  const authHint = useAuthHint();

  // Optimistic: show the signed-in CTA while Firebase is still resolving if
  // this browser was signed in last time. A stale hint is harmless —
  // /dashboard is middleware-protected and bounces to /login.
  if (user || (loading && authHint)) {
    return (
      <Link href="/dashboard" className={cx("btn", "btn-primary-lg")}>
        Go to Dashboard
      </Link>
    );
  }

  return <SignupCta />;
}

/**
 * The hero CTA is the first measurable step of the paid funnel — landing →
 * signup. Rendered in both the resolved and Suspense-fallback states so the
 * click is counted either way.
 */
function SignupCta() {
  return (
    <Link
      href="/signup"
      className={cx("btn", "btn-primary-lg")}
      onClick={() => trackEvent('landing_cta_click', { location: 'hero' })}
    >
      Start Free — No Card Needed
    </Link>
  );
}

export function HeroPrimaryCta() {
  return (
    <Suspense fallback={<SignupCta />}>
      <HeroPrimaryCtaInner />
    </Suspense>
  );
}
