import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

// Fonts pulled straight from the v4 design. Exposed as CSS variables so the
// landing page's scoped stylesheet can reference them without affecting the
// rest of the app's typography.
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});
