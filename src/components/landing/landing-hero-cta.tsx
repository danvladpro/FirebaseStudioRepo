"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useAuth } from "@/components/auth-provider";
import styles from "./landing.module.css";

const cx = (...keys: string[]) => keys.map((k) => styles[k]).filter(Boolean).join(" ");

function HeroPrimaryCtaInner() {
  const { user } = useAuth();

  if (user) {
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
