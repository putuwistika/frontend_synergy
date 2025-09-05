"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Rocket, Sparkles } from "lucide-react";

type Stat = { label: string; value: string };

type LandingHeroProps = {
  title?: string;
  subtitle?: string;
  ctaPrimaryHref?: string;
  ctaPrimaryLabel?: string;
  ctaSecondaryHref?: string;
  ctaSecondaryLabel?: string;
  showStats?: boolean;
  stats?: Stat[];
  className?: string;
};

/**
 * LandingHero
 * - Animated hero section with CTA, stats, and a decorative forecast preview.
 * - Tailored to Synergy Squad brand (indigo ↔ fuchsia).
 */
export default function LandingHero({
  title = "Hotel Revenue Forecast Platform",
  subtitle = "SYNERGIZED INTELLIGENCE — modern forecasting with confidence bands, smart exogenous variables, and delightful interactions.",
  ctaPrimaryHref = "/forecast",
  ctaPrimaryLabel = "Launch Forecasts",
  ctaSecondaryHref = "#features",
  ctaSecondaryLabel = "Learn More",
  showStats = true,
  stats = [
    { label: "Forecasts", value: "12,408" },
    { label: "Avg Accuracy", value: "93.1%" },
    { label: "Active Models", value: "7" },
    { label: "Data Points", value: "1.2M+" },
  ],
  className,
}: LandingHeroProps) {
  return (
    <section className={clsx("relative container-7xl pt-10 md:pt-20", className)}>
      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* Left: Heading, subtitle, CTAs, stats */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
          >
            <Sparkles className="h-3.5 w-3.5" />
            SYNERGIZED INTELLIGENCE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-3 text-4xl font-extrabold leading-tight md:text-5xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="mt-4 max-w-xl text-white/80"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href={ctaPrimaryHref}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:brightness-110"
              aria-label={ctaPrimaryLabel}
            >
              <Rocket className="mr-2 h-4 w-4" />
              {ctaPrimaryLabel}
            </Link>
            <Link
              href={ctaSecondaryHref}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              aria-label={ctaSecondaryLabel}
            >
              {ctaSecondaryLabel}
            </Link>
          </motion.div>

          {showStats && (
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="mt-1 text-xs text-white/70">{s.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Decorative forecast preview card */}
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

          {/* Sparkline-like SVG with confidence band */}
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

          {/* Mini stats under chart */}
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

          {/* Floating accent */}
          <div className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 animate-float rounded-xl bg-gradient-to-br from-sky-400/40 to-fuchsia-400/40 blur-[1px]" />
        </motion.div>
      </div>
    </section>
  );
}
