"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useAuth } from "@/components/auth-provider";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";
import styles from "./landing.module.css";

function NavContent() {
  const { user } = useAuth();

  return (
    <nav className={styles.nav}>
      <div className={styles["nav-inner"]}>
        <Link className={styles.logo} href="/">
          <Logo />
        </Link>
        <div className={styles["nav-links"]}>
          <a href="#features">Features</a>
          <a href="#benefits">Why it works</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className={styles["nav-actions"]}>
          {user ? (
            <UserMenu />
          ) : (
            <>
              <Link href="/login" className={`${styles.btn} ${styles["btn-ghost"]}`}>
                Sign In
              </Link>
              <Link href="/signup" className={`${styles.btn} ${styles["btn-primary"]}`}>
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function LandingNav() {
  return (
    <Suspense>
      <NavContent />
    </Suspense>
  );
}
