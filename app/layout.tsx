// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

import QueryProvider from "@/providers/query-provider";
import ThemeProvider from "@/providers/theme-provider";

/**
 * Fonts
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Metadata (Next 15)
 * - Jangan taruh `viewport` di sini; gunakan export viewport terpisah di bawah.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://forecast-frontend.synergy"),
  applicationName: "Synergy Squad Forecast",
  title: {
    default: "Synergy Squad — Hotel Revenue Forecast",
    template: "%s | Synergy Squad",
  },
  description:
    "SYNERGIZED INTELLIGENCE — Hotel revenue forecasting (FastAPI + MongoDB + SARIMAX) with a modern Next.js front end.",
  keywords: [
    "hotel",
    "revenue",
    "forecast",
    "time series",
    "sarimax",
    "fastapi",
    "mongodb",
    "nextjs",
  ],
  authors: [{ name: "Synergy Squad" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: "https://forecast-frontend.synergy",
    title: "Synergy Squad — Hotel Revenue Forecast",
    description:
      "Modern forecasting platform with smart exogenous variables & confidence bands.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Synergy Squad" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Viewport (Next 15) — diexport terpisah dari metadata
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#13247a",
};

/**
 * Root Layout
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-[#13247a] text-white antialiased selection:bg-fuchsia-500/40 selection:text-white`}
      >
        {/* A11y: Skip link */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-[#13247a]"
        >
          Skip to content
        </a>

        {/* Subtle global background accents (non-interactive) */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tl from-rose-400/30 to-sky-400/30 blur-3xl" />
        </div>

        {/* Global Providers (client components) */}
        <ThemeProvider>
          <QueryProvider>
            {/* Main slot */}
            <div id="main" className="min-h-dvh">
              {children}
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
