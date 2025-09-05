"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  LineChart,
  Sparkles,
  CalendarDays,
  Rocket,
  ShieldCheck,
} from "lucide-react";

const nav = [
  { label: "Forecast", href: "/forecast" },
  { label: "Metrics", href: "/metrics" },
  { label: "Chat", href: "/chat" },
  { label: "About", href: "/about" },
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered Forecasting",
    desc: "SARIMAX + smart exogenous variables for reliable predictions.",
  },
  {
    icon: LineChart,
    title: "Interactive Analytics",
    desc: "Zoomable charts, confidence bands, and export-ready data.",
  },
  {
    icon: Sparkles,
    title: "Smart Exog Mode",
    desc: "Auto-fill drivers with realistic heuristics (zeros or smart).",
  },
  {
    icon: CalendarDays,
    title: "Multi-Horizon",
    desc: "Daily, weekly, or monthly horizons—pick what you need.",
  },
];

const stats = [
  { k: "Forecasts", v: "12,408" },
  { k: "Avg Accuracy", v: "93.1%" },
  { k: "Active Models", v: "7" },
  { k: "Data Points", v: "1.2M+" },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Synergy Squad Home">
            <img
              src="/logo.png"
              alt="Synergy Squad"
              className="h-9 w-9 rounded-full ring-2 ring-white/30 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="text-lg font-semibold tracking-wide">
              Synergy <span className="text-sky-300">Squad</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-sm text-white/80 transition hover:text-white"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/forecast"
              className="group inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-white/15"
              aria-label="Start Forecasting"
            >
              <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              Start Forecasting
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pt-10 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl font-extrabold leading-tight md:text-5xl"
            >
              Hotel Revenue Forecast Platform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="mt-4 max-w-xl text-white/80"
            >
              SYNERGIZED INTELLIGENCE — modern forecasting with confidence bands,
              smart exogenous variables, and delightful interactions.
            </motion.p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/forecast"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:brightness-110"
              >
                Launch Forecasts
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <motion.div
                  key={s.k}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <div className="text-xl font-bold">{s.v}</div>
                  <div className="mt-1 text-xs text-white/70">{s.k}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Decorative chart card (no external chart lib) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium text-white/80">Forecast Preview</div>
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-300">
                95% CI
              </span>
            </div>

            {/* Simple sparkline-style SVG with band */}
            <svg viewBox="0 0 480 220" className="h-60 w-full">
              <defs>
                <linearGradient id="band" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(96,165,250,0.45)" />
                  <stop offset="100%" stopColor="rgba(216,180,254,0.10)" />
                </linearGradient>
              </defs>
              {/* Confidence band */}
              <path
                d="M0,120 C80,90 120,95 180,110 C240,125 280,100 340,120 C400,140 440,135 480,145 L480,180 L0,180 Z"
                fill="url(#band)"
              />
              {/* Baseline grid */}
              <g stroke="rgba(255,255,255,0.08)">
                {[...Array(5)].map((_, i) => (
                  <line key={i} x1="0" x2="480" y1={40 * (i + 1)} y2={40 * (i + 1)} />
                ))}
              </g>
              {/* Forecast line */}
              <path
                d="M0,140 C60,100 120,110 180,120 C240,130 300,105 360,120 C420,135 450,120 480,130"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              />
            </svg>

            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-white/60">Avg Daily Rev</div>
                <div className="font-semibold">IDR 12.3M</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-white/60">Peak Day</div>
                <div className="font-semibold">Fri</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-white/60">Trend</div>
                <div className="font-semibold">Upward ↗</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Built for Hoteliers</h2>
          <p className="mt-3 text-white/80">
            Fresh, professional, and modern—crafted for decision speed and clarity.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg transition hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/30 to-fuchsia-400/30">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold">{title}</h3>
              </div>
              <p className="mt-3 text-sm text-white/75">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
          <Link
            href="/metrics"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/15"
          >
            <ShieldCheck className="h-4 w-4" /> View Evaluation Metrics
          </Link>
          <p className="text-xs text-white/60">
            Smart exog, non-negative clipping, and shape-safe alignment included.
          </p>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 p-8 md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-bold md:text-3xl">Ready to forecast like a pro?</h3>
              <p className="mt-2 max-w-xl text-white/80">
                Generate forecasts in seconds. Export, compare scenarios, and stay ahead of demand.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/forecast"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#13247a] transition hover:opacity-90"
              >
                Get Started
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Try Chat Mode
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-fuchsia-400" />
              <div className="font-semibold">Synergy Squad</div>
            </div>
            <p className="mt-3 max-w-md text-sm text-white/75">
              SYNERGIZED INTELLIGENCE — data-driven hotel revenue forecasting with
              a beautiful, modern UX.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li><Link href="/forecast" className="hover:text-white">Forecast</Link></li>
              <li><Link href="/metrics" className="hover:text-white">Metrics</Link></li>
              <li><Link href="/chat" className="hover:text-white">Chat Mode</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Company</div>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-xs text-white/60">
            <div>© {new Date().getFullYear()} Synergy Squad. All rights reserved.</div>
            <div>v0.1 • Built with ♥️</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
