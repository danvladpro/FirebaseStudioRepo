export function LegalContent() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-foreground">

      {/* ── TERMS & CONDITIONS ── */}
      <section>
        <h2 className="text-lg font-bold mb-4 pb-2 border-b">Terms &amp; Conditions</h2>
        <p className="text-xs text-muted-foreground mb-6">Last updated: May 11, 2026</p>

        <div className="space-y-6">

          <div>
            <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
            <p>
              By accessing or using Excel Ninja ("the Service"), you agree to be bound by
              these Terms &amp; Conditions ("Terms"). If you do not agree, please do not use
              the Service.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Description of Service</h3>
            <p>
              Excel Ninja is a web-based training tool that helps you learn and practice
              Microsoft Excel keyboard shortcuts through interactive flashcards, drills, and
              challenges. The Service is provided "as is" for educational purposes only.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Product Limitations</h3>
            <p className="mb-3">
              Please read this section carefully. The Service has inherent limitations you
              should be aware of before purchasing:
            </p>
            <ul className="space-y-3 list-none pl-0">
              <li>
                <span className="font-medium">Browser environment.</span>{" "}
                Excel Ninja runs inside a web browser, not inside Microsoft Excel itself.
                Some keyboard shortcuts may behave differently, be only partially supported,
                or not function at all due to browser restrictions. This is a known
                limitation of the browser environment, not a defect in the Service. We have
                done our best to replicate Excel behavior — but a browser is not Excel.
              </li>
              <li>
                <span className="font-medium">Keyboard layout — English (US) QWERTY.</span>{" "}
                The Service is designed and tested on US English QWERTY keyboards. If you
                use a different keyboard layout (such as UK QWERTY, AZERTY, QWERTZ, or any
                non-Latin layout), some shortcuts may produce unexpected results or not work
                as described. The shortcut labels shown in the app assume an English (US)
                keyboard.
              </li>
              <li>
                <span className="font-medium">OS and browser shortcut conflicts.</span>{" "}
                Some key combinations may be intercepted by your operating system (Windows,
                macOS, Linux) or your web browser before they reach the Service — for
                example, Ctrl+W closing a browser tab or Cmd+M minimizing a window on
                macOS. If this happens, simply return to the Service and continue your
                session. No progress is lost.
              </li>
              <li>
                <span className="font-medium">On-screen keyboard.</span>{" "}
                The on-screen keyboard displayed in the app is a visual reference tool. It
                shows which keys are part of each shortcut and lets you click individual
                keys manually if your physical keyboard is missing a key, or if a key
                combination is intercepted by your system before it reaches the app. Use it
                as a fallback — for example, hold a modifier key physically and click the
                remaining key on-screen.
              </li>
              <li>
                <span className="font-medium">Shortcut accuracy and Excel version.</span>{" "}
                The shortcuts in the Service reflect Microsoft Excel 365 (Windows) as of the
                date of last update. Microsoft may change, add, or remove shortcuts in
                future versions of Excel. We cannot guarantee that all shortcuts in the
                Service remain current at all times.
              </li>
              <li>
                <span className="font-medium">Practice in real Excel.</span>{" "}
                Excel Ninja is a training aid, not a replacement for real-world practice.
                Keyboard shortcuts are learned through repetition. The most effective way to
                retain them is to use them in your actual Excel work — in your projects, at
                your job, in your day-to-day spreadsheets. The app gives you the foundation;
                your real work is where it sticks.
              </li>
              <li>
                <span className="font-medium">Browser compatibility.</span>{" "}
                The Service is optimised for modern desktop browsers (Google Chrome
                recommended). It is not designed for mobile or touch devices. If you access
                the Service from a mobile browser, functionality may be limited or broken.
              </li>
              <li>
                <span className="font-medium">Internet connection required.</span>{" "}
                The Service requires a live internet connection. We are not liable for
                service interruptions caused by connectivity issues, hosting outages, or
                third-party infrastructure.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. No Affiliation with Microsoft</h3>
            <p>
              Excel Ninja is an independent product. It is not affiliated with, endorsed by,
              sponsored by, or connected to Microsoft Corporation in any way. "Microsoft
              Excel" and "Microsoft" are registered trademarks of Microsoft Corporation. All
              references to Excel are for descriptive and educational purposes only.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">5. No Guarantees</h3>
            <p>
              The Service makes no guarantee of specific learning outcomes, improvement in
              job performance, productivity gains, or any other measurable result. Individual
              results depend on many factors outside our control, including how frequently
              and consistently you practice.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">6. Achievement Certificate</h3>
            <p>
              Upon completing a set of challenges, the Service may award a digital
              achievement certificate. This certificate is a recognition of in-app
              achievement only. It is not an accredited professional qualification,
              certification, or credential recognised by any employer, educational
              institution, or industry body.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">7. Payment and Refunds</h3>
            <p>
              Payments are processed by Stripe, Inc. By completing a purchase you agree to
              Stripe's terms of service. Refunds are handled through Stripe's standard
              refund process. We do not process manual refunds outside of that process.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">8. User Conduct</h3>
            <p className="mb-2">You agree not to:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Scrape, copy, or extract content from the Service by automated means</li>
              <li>
                Reverse engineer, decompile, or attempt to extract the source code of the
                Service
              </li>
              <li>Resell, sublicense, or redistribute access to the Service</li>
              <li>Use the Service in any way that violates applicable law</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">9. Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at any time if we
              reasonably believe you have violated these Terms, without prior notice and
              without refund.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">10. Governing Law</h3>
            <p>
              These Terms are governed by the laws of the Netherlands. Any dispute arising
              from these Terms or your use of the Service shall be submitted to the exclusive
              jurisdiction of the competent courts in the Netherlands.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">11. Changes to These Terms</h3>
            <p>
              We may update these Terms from time to time. The date at the top of this
              section indicates when they were last updated. Continued use of the Service
              after changes are posted constitutes your acceptance of the revised Terms.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">12. Contact</h3>
            <p>
              For questions about these Terms, contact us at:{" "}
              <span className="font-medium">[contact@excelninja.app]</span>
            </p>
          </div>

        </div>
      </section>

      {/* ── PRIVACY POLICY & COOKIE NOTICE ── */}
      <section>
        <h2 className="text-lg font-bold mb-4 pb-2 border-b">
          Privacy Policy &amp; Cookie Notice
        </h2>
        <p className="text-xs text-muted-foreground mb-6">Last updated: May 11, 2026</p>

        <div className="space-y-6">

          <div>
            <h3 className="font-semibold mb-2">1. Who We Are</h3>
            <p>
              Excel Ninja is operated by <span className="font-medium">[Your Name]</span>,
              a sole trader (<em>eenmanszaak</em>) registered in the Netherlands, with
              registered address at{" "}
              <span className="font-medium">[Your Address, City, Netherlands]</span>. We
              are the data controller for personal data collected through this Service.
            </p>
            <p className="mt-2">
              For privacy-related matters, contact us at:{" "}
              <span className="font-medium">[privacy@excelninja.app]</span>
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. What Data We Collect</h3>
            <ul className="space-y-2 list-none pl-0">
              <li>
                <span className="font-medium">Account data.</span>{" "}
                Your email address, and your display name if provided, collected when you
                create an account.
              </li>
              <li>
                <span className="font-medium">Usage data.</span>{" "}
                Information about how you use the Service, including which shortcuts you
                practise, your session duration, and drill and challenge results. This is
                used to personalise your experience and improve the Service.
              </li>
              <li>
                <span className="font-medium">Survey responses.</span>{" "}
                If you complete the onboarding survey, we collect your responses to
                understand your experience level and goals.
              </li>
              <li>
                <span className="font-medium">Payment data.</span>{" "}
                When you make a purchase, payment is handled by Stripe. We receive
                confirmation of the transaction and your subscription status. We do not
                store your card details.
              </li>
              <li>
                <span className="font-medium">Technical data.</span>{" "}
                Browser type, operating system, and IP address, collected automatically
                when you visit the Service.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Legal Basis for Processing (GDPR)</h3>
            <ul className="space-y-2 list-none pl-0">
              <li>
                <span className="font-medium">Contract performance.</span>{" "}
                We process your account data and subscription status to deliver the Service
                you have purchased (Art. 6(1)(b) GDPR).
              </li>
              <li>
                <span className="font-medium">Legitimate interest.</span>{" "}
                We process usage data and technical data to improve the Service and diagnose
                technical issues (Art. 6(1)(f) GDPR).
              </li>
              <li>
                <span className="font-medium">Consent.</span>{" "}
                We rely on your consent for marketing communications (if any) and for
                non-essential analytics cookies (Art. 6(1)(a) GDPR). You may withdraw
                consent at any time without affecting the lawfulness of prior processing.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Who We Share Your Data With</h3>
            <ul className="space-y-2 list-none pl-0">
              <li>
                <span className="font-medium">Stripe.</span>{" "}
                Your payment information is processed by Stripe, Inc. Stripe is responsible
                for the security of payment data under its own privacy policy.
              </li>
              <li>
                <span className="font-medium">Google Analytics.</span>{" "}
                We use Google Analytics to collect anonymised usage statistics. Google may
                process data outside the EEA under appropriate safeguards (Standard
                Contractual Clauses).
              </li>
              <li>
                <span className="font-medium">Google Firebase.</span>{" "}
                Our authentication and database infrastructure is provided by Google
                Firebase.
              </li>
              <li>
                We do <span className="font-medium">not</span> sell your personal data to
                any third party.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">5. Data Retention</h3>
            <p>
              We retain your personal data for as long as your account is active. If you
              request deletion of your account, we will delete your personal data within 30
              days of receiving the request, except where retention is required by law (for
              example, transaction records for tax purposes).
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">6. Your Rights (GDPR)</h3>
            <p className="mb-2">
              If you are based in the EU or EEA, you have the following rights:
            </p>
            <ul className="space-y-1 list-disc pl-5">
              <li>
                <span className="font-medium">Access</span> — request a copy of the
                personal data we hold about you
              </li>
              <li>
                <span className="font-medium">Rectification</span> — ask us to correct
                inaccurate data
              </li>
              <li>
                <span className="font-medium">Erasure</span> — ask us to delete your data
                ("right to be forgotten")
              </li>
              <li>
                <span className="font-medium">Portability</span> — receive your data in a
                structured, portable format
              </li>
              <li>
                <span className="font-medium">Object</span> — object to processing based on
                legitimate interest
              </li>
              <li>
                <span className="font-medium">Withdraw consent</span> — withdraw consent
                for marketing or non-essential cookies at any time
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <span className="font-medium">[privacy@excelninja.app]</span>. You also have
              the right to lodge a complaint with the Dutch Data Protection Authority
              (Autoriteit Persoonsgegevens) at{" "}
              <span className="font-medium">autoriteitpersoonsgegevens.nl</span>.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">7. Cookie Notice</h3>
            <p className="mb-3">We use the following types of cookies:</p>
            <ul className="space-y-2 list-none pl-0">
              <li>
                <span className="font-medium">Strictly necessary cookies.</span>{" "}
                Required for the Service to function — for example, keeping you logged in.
                These are set automatically and do not require your consent.
              </li>
              <li>
                <span className="font-medium">Analytics cookies.</span>{" "}
                Used by Google Analytics to understand how visitors use the Service. These
                are only placed with your consent, which you can provide or withdraw via the
                cookie consent banner.
              </li>
              <li>
                We do <span className="font-medium">not</span> use advertising, tracking,
                or profiling cookies.
              </li>
            </ul>
            <p className="mt-3">
              You can manage cookie preferences at any time via the cookie settings link on
              our site.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">8. Contact</h3>
            <p>
              For any privacy-related queries, contact us at:{" "}
              <span className="font-medium">[privacy@excelninja.app]</span>
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
