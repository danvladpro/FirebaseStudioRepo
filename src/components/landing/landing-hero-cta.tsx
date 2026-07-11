"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useAuth, useAuthHint } from "@/components/auth-provider";
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

  return (
    <Link href="/signup" className={cx("btn", "btn-primary-lg")}>
      Start Free — No Card Needed
    </Link>
  );
}

export function HeroPrimaryCta() {
  return (
    <Suspense
      fallback={
        <Link href="/signup" className={cx("btn", "btn-primary-lg")}>
          Start Free — No Card Needed
        </Link>
      }
    >
      <HeroPrimaryCtaInner />
    </Suspense>
  );
}
