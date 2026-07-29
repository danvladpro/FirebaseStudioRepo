"use client";

import { useState } from "react";
import { LegalSheet } from "@/components/legal-sheet";
import { openCookieSettings } from "@/lib/analytics";

/**
 * Footer legal links for the landing page.
 *
 * `LegalSheet` was previously only reachable from the signed-in user menu and
 * the upgrade modal, which left logged-out visitors — including everyone
 * arriving from an advertisement — with no route to the privacy policy at all.
 * The cookie settings link is required too: consent has to be as easy to
 * withdraw as it was to give.
 */
export function LandingLegalLinks() {
  const [legalOpen, setLegalOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setLegalOpen(true)}>
        Privacy Policy
      </button>
      <button type="button" onClick={() => setLegalOpen(true)}>
        Terms &amp; Conditions
      </button>
      <button type="button" onClick={openCookieSettings}>
        Cookie Settings
      </button>

      <LegalSheet isOpen={legalOpen} onOpenChange={setLegalOpen} />
    </>
  );
}
