import Link from "next/link";
import styles from "./landing.module.css";
import { HeroPrimaryCta } from "./landing-hero-cta";
import { ContactSalesCta, ContactFooterLink } from "./contact-modal";

const cx = (...keys: string[]) => keys.map((k) => styles[k]).filter(Boolean).join(" ");

const Check = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="2,6 5,9 10,3" />
  </svg>
);

export function LandingContent() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles["hero-grid"]} />
        <div className={styles["hero-inner"]}>
          <div className={styles["hero-content"]}>
            <div className={styles["hero-badge"]}>
              <span className={styles["hero-badge-dot"]} />
              Excel Shortcuts Training
            </div>
            <h1>
              Learn Excel Shortcuts.
              <br />
              <em>Stop wasting time</em>
            </h1>
            <p className={styles["hero-sub"]}>
              Learn shortcuts through real-life Excel drills.
            </p>
            <div className={styles["hero-ctas"]}>
              <HeroPrimaryCta />
              <a href="#features" className={cx("btn", "btn-outline-lg")}>
                See How It Works
              </a>
            </div>
            <div className={styles["hero-proof"]}>
              <div className={styles["hero-proof-avatars"]}>
                <span>JM</span>
                <span>AK</span>
                <span>RS</span>
                <span>TL</span>
                <span>+</span>
              </div>
              <p className={styles["hero-proof-text"]}>
                <strong>Many data and finance professionals</strong> choose us to level up their game!
              </p>
            </div>
          </div>

          <div className={styles["hero-visual"]}>
            <div className={styles["hero-card"]}>
              <div className={styles["hero-card-header"]}>
                <span className={styles["hero-card-title"]}>Today&apos;s Challenge</span>
                <span className={styles["hero-level-badge"]}>Level 2 · Rookie</span>
              </div>
              <div className={styles["challenge-prompt"]}>
                <span className={styles["cp-icon"]}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                  </svg>
                </span>
                <span>
                  Copy the <strong>Total</strong> formula down the column.
                </span>
              </div>

              <div className={styles.ss}>
                <table className={styles["ss-table"]}>
                  <thead>
                    <tr>
                      <th className={styles["ss-corner"]} />
                      <th className={styles["ss-colh"]}>A</th>
                      <th className={styles["ss-colh"]}>B</th>
                      <th className={styles["ss-colh"]}>C</th>
                      <th className={cx("ss-colh", "ss-colh-on")}>D</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={styles["ss-rowh"]}>1</td>
                      <td className={cx("ss-cell", "ss-head")}>Region</td>
                      <td className={cx("ss-cell", "ss-head")}>Q1</td>
                      <td className={cx("ss-cell", "ss-head")}>Q2</td>
                      <td className={cx("ss-cell", "ss-head")}>Total</td>
                    </tr>
                    <tr>
                      <td className={styles["ss-rowh"]}>2</td>
                      <td className={styles["ss-cell"]}>North</td>
                      <td className={cx("ss-cell", "ss-num")}>120</td>
                      <td className={cx("ss-cell", "ss-num")}>90</td>
                      <td className={cx("ss-cell", "ss-num", "ss-active")}>210</td>
                    </tr>
                    <tr>
                      <td className={styles["ss-rowh"]}>3</td>
                      <td className={styles["ss-cell"]}>South</td>
                      <td className={cx("ss-cell", "ss-num")}>85</td>
                      <td className={cx("ss-cell", "ss-num")}>110</td>
                      <td className={cx("ss-cell", "ss-sel", "ss-ghost")}>=SUM(B3:C3)</td>
                    </tr>
                    <tr>
                      <td className={styles["ss-rowh"]}>4</td>
                      <td className={styles["ss-cell"]}>East</td>
                      <td className={cx("ss-cell", "ss-num")}>140</td>
                      <td className={cx("ss-cell", "ss-num")}>75</td>
                      <td className={cx("ss-cell", "ss-sel", "ss-ghost")}>=SUM(B4:C4)</td>
                    </tr>
                    <tr>
                      <td className={styles["ss-rowh"]}>5</td>
                      <td className={styles["ss-cell"]}>West</td>
                      <td className={cx("ss-cell", "ss-num")}>60</td>
                      <td className={cx("ss-cell", "ss-num")}>130</td>
                      <td className={cx("ss-cell", "ss-sel", "ss-sel-end", "ss-ghost")}>=SUM(B5:C5)</td>
                    </tr>
                  </tbody>
                </table>
                <div className={styles["ss-tabs"]}>
                  <span className={cx("ss-tab", "ss-tab-on")}>Sales</span>
                  <span className={styles["ss-tab"]}>Summary</span>
                </div>
              </div>

              <div className={styles["kbd-hint"]}>
                <div className={styles["kbd-mini"]}>
                  <div className={styles["kbd-row"]}>
                    {["Q", "W", "E", "R", "T", "Y", "U", "I", "O"].map((k) => (
                      <span key={k} className={styles.kkey}>
                        {k}
                      </span>
                    ))}
                  </div>
                  <div className={styles["kbd-row"]}>
                    {["A", "S"].map((k) => (
                      <span key={k} className={styles.kkey}>
                        {k}
                      </span>
                    ))}
                    <span className={cx("kkey", "kkey-lit")}>D</span>
                    {["F", "G", "H", "J", "K", "L"].map((k) => (
                      <span key={k} className={styles.kkey}>
                        {k}
                      </span>
                    ))}
                  </div>
                  <div className={styles["kbd-row"]}>
                    <span className={cx("kkey", "kkey-wide", "kkey-lit")}>Ctrl</span>
                    <span className={styles.kkey}>Alt</span>
                    <span className={cx("kkey", "kkey-space")} />
                    <span className={styles.kkey}>Alt</span>
                  </div>
                </div>
                <span className={styles["kbd-press"]}>
                  Press <strong>Ctrl</strong> + <strong>D</strong> to fill down
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={cx("features-header", "text-center")}>
            <div className={styles["section-tag"]}>How It Works</div>
            <h2 className={styles["section-heading"]}>Built to build muscle memory</h2>
            <p className={styles["section-sub"]}>
              Three learning modes that work together — so shortcuts stop feeling like memorization and start feeling automatic.
            </p>
          </div>
          <div className={styles["features-grid"]}>
            <div className={styles["feature-card"]}>
              <div className={styles["feature-icon"]}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M18 12h.01M6 16h6M15 14l2 2 3-3" />
                </svg>
              </div>
              <h3>Interactive Challenges</h3>
              <p>Timed, scenario-based exercises that put shortcuts to real use. No multiple choice — you actually press the keys.</p>
            </div>
            <div className={styles["feature-card"]}>
              <div className={styles["feature-icon"]}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="7" y1="15" x2="7.01" y2="15" strokeWidth="3" />
                  <line x1="11" y1="15" x2="13" y2="15" />
                  <line x1="17" y1="15" x2="17.01" y2="15" strokeWidth="3" />
                </svg>
              </div>
              <h3>Visual Flashcards</h3>
              <p>Study at your own pace with an interactive keyboard that highlights exactly which keys to press — no guessing.</p>
            </div>
            <div className={styles["feature-card"]}>
              <div className={styles["feature-icon"]}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3>Drills - Learning by doing</h3>
              <p>Achieve muscle memory through repetitive drills executed directly on your keyboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LEVEL PROGRESS */}
      <section className={styles["levels-section"]}>
        <div className={styles["levels-inner"]}>
          <div className={styles["section-tag"]}>Gamified Progress</div>
          <h2 className={styles["section-heading"]} style={{ marginTop: "0.5rem" }}>
            Every shortcut mastered earns you rank
          </h2>
          <p className={styles["section-sub"]}>Practice builds XP. XP unlocks ranks. Your ninja evolves as you do.</p>
          <div className={styles["levels-track"]}>
            <div className={styles["level-step"]}>
              <div className={styles["level-orb"]}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Level0.svg" alt="Rookie ninja" />
              </div>
              <span className={styles["level-name"]}>Rookie</span>
            </div>
            <div className={styles["level-step"]}>
              <div className={styles["level-orb"]}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Level1.svg" alt="Apprentice ninja" />
              </div>
              <span className={styles["level-name"]}>Apprentice</span>
            </div>
            <div className={styles["level-step"]}>
              <div className={cx("level-orb", "active")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Level2.svg" alt="Master ninja" />
              </div>
              <span className={cx("level-name", "active")}>Master</span>
            </div>
            <div className={styles["level-step"]}>
              <div className={styles["level-orb"]}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Level3.svg" alt="Excel Ninja" />
              </div>
              <span className={styles["level-name"]}>Ninja</span>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS: For Individuals (light) */}
      <section id="benefits" className={cx("benefits", "benefits-light")}>
        <div className={styles.container}>
          <div className={styles["benefits-row"]}>
            <div className={cx("ninja-placeholder", "benefits-visual")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/GirlNinja.svg" alt="Individual learner becoming an Excel Ninja" />
            </div>
            <div className={styles["benefits-content"]}>
              <div className={styles["benefit-role"]}>
                <span className={styles["benefit-role-icon"]}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span className={styles["benefit-role-label"]}>For Individuals</span>
              </div>
              <h2>Work faster with fewer mistakes</h2>
              <p>Master shortcuts and reclaim that lost time for real analysis — working faster, with sharper focus and fewer mistakes.</p>
              <ul className={styles["check-list"]}>
                <li>
                  <span className={styles["check-icon"]}>
                    <Check />
                  </span>
                  <span>
                     <strong>Become Faster and More Efficient</strong> —  the most important, you are quicker without your mouse or trackpad
                  </span>
                </li>
                <li>
                  <span className={styles["check-icon"]}>
                    <Check />
                  </span>
                  <span>
                    <strong>Earn Certificate</strong> — Show off your certificate of achievement and how quickly you can get your job done.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS: For Companies (dark) */}
      <section id="benefits-companies" className={cx("benefits", "benefits-dark")}>
        <div className={styles.container}>
          <div className={cx("benefits-row", "flip")}>
            <div className={styles["benefits-visual"]}>
              <div className={styles["ninja-frame"]}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/allNinjasNobackground.svg" alt="A team of Excel Ninjas" />
              </div>
            </div>
            <div className={styles["benefits-content"]}>
              <div className={styles["benefit-role"]}>
                <span className={styles["benefit-role-icon"]}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M5 21V7l8-4v18" />
                    <path d="M19 21V11l-6-4" />
                    <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                  </svg>
                </span>
                <span className={styles["benefit-role-label"]}>For Companies</span>
              </div>
              <h2>Increase output of your team</h2>
              <p>
                Keyboard-proficient employees complete everyday tasks noticeably faster and make fewer data-entry errors — a measurable return on a
                small training investment.
              </p>
              <ul className={styles["check-list"]}>
                <li>
                  <span className={styles["check-icon"]}>
                    <Check />
                  </span>
                  <span>
                    <strong>Faster task completion</strong> across teams with keyboard-first habits.
                  </span>
                </li>
                <li>
                  <span className={styles["check-icon"]}>
                    <Check />
                  </span>
                  <span>
                    <strong>Fewer errors</strong> — keyboard-driven workflows are more consistent than mouse-based ones.
                  </span>
                </li>
                <li>
                  <span className={styles["check-icon"]}>
                    <Check />
                  </span>
                  <span>
                    <strong>Faster project delivery</strong> — your team spends time thinking, not hunting through menus.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.container}>
          <div className={cx("pricing-header", "text-center")}>
            <div className={styles["section-tag"]}>Pricing</div>
            <h2 className={styles["section-heading"]}>Simple, honest pricing</h2>
            <p className={styles["section-sub"]}>
              Start free — no credit card needed. Upgrade when you&apos;re ready to unlock everything.
            </p>
          </div>
          <div className={styles["pricing-grid"]}>
            {/* 1 Week */}
            <div className={styles["pricing-card"]} id="plan-week">
              <div className={styles["pricing-label"]}>Short-term</div>
              <h3>1-Week Access</h3>
              <p className={styles["pricing-desc"]}>Perfect for a focused sprint before an interview or deadline.</p>
              <div className={styles["pricing-price"]}>
                <span className={styles["price-amount"]}>€9.99</span>
                <span className={styles["price-period"]}>/ 7 days</span>
              </div>
              <ul className={styles["pricing-features"]}>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> All challenges and flashcards
                </li>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> Performance tracking
                </li>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> 7 days full access
                </li>
              </ul>
              <Link href="/signup" className={cx("pricing-cta", "cta-border")}>
                Try for Free
              </Link>
            </div>

            {/* 1 Month (featured) */}
            <div className={cx("pricing-card", "featured")} id="plan-month">
              <span className={styles["featured-badge"]}>Most Popular</span>
              <div className={styles["pricing-label"]}>Best value</div>
              <h3>1-Month Access</h3>
              <p className={styles["pricing-desc"]}>The sweet spot — enough time to build real muscle memory and earn your certificate.</p>
              <div className={styles["pricing-price"]}>
                <span className={styles["price-amount"]}>€14.99</span>
                <span className={styles["price-period"]}>/ month</span>
              </div>
              <ul className={styles["pricing-features"]}>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> All challenges and flashcards
                </li>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> Performance tracking
                </li>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> Shareable certificate
                </li>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> 30 days full access
                </li>
              </ul>
              <Link href="/signup" className={cx("pricing-cta", "cta-green")}>
                Try for Free
              </Link>
            </div>

            {/* Corporate */}
            <div className={styles["pricing-card"]}>
              <div className={styles["pricing-label"]}>Teams and Enterprise</div>
              <h3>Corporate</h3>
              <p className={styles["pricing-desc"]}>Equip your whole team. Custom billing and volume pricing included.</p>
              <div className={styles["pricing-price"]}>
                <span className={styles["price-amount"]} style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
                  Let&apos;s talk
                </span>
              </div>
              <ul className={styles["pricing-features"]}>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> Per-user annual billing
                </li>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> Team performance dashboard
                </li>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> Dedicated support
                </li>
                <li>
                  <span className={styles["pf-check"]}><Check /></span> Bulk certificate reporting
                </li>
              </ul>
              <ContactSalesCta />
            </div>
          </div>
          <p className={styles["pricing-note"]}>
            Not ready to pay? <Link href="/signup">Start for free</Link> — flashcards and some challenges are always free.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles["footer-inner"]}>
          <div className={styles["footer-top"]}>
            <div className={styles["footer-brand"]}>
              <div className={styles.logo} style={{ marginBottom: "0.75rem" }}>
                <div className={styles["logo-icon"]}>
                  <svg viewBox="0 0 50 50" fill="none">
                    <path d="M15 18H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M15 25H35" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M15 32H25" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M30 18L35 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className={styles["logo-text"]}>Excel Ninja</span>
              </div>
              <p>Master Excel shortcuts through practice, not memorization.</p>
            </div>
            <div className={styles["footer-col"]}>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#benefits">For Individuals</a>
              <a href="#benefits-companies">For Companies</a>
            </div>
            <div className={styles["footer-col"]}>
              <h4>Account</h4>
              <Link href="/signup">Sign Up</Link>
              <Link href="/login">Sign In</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div className={styles["footer-col"]}>
              <h4>Support</h4>
              <Link href="/help">Help Center</Link>
              <ContactFooterLink />
            </div>
          </div>
          <div className={styles["footer-bottom"]}>
            <p>&copy; 2026 Excel Ninja. All rights reserved.</p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem" }}>Built for people who live in spreadsheets.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
