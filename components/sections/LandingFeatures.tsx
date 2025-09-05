"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import {
  Brain,
  LineChart,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  Activity,
  type LucideIcon,
} from "lucide-react";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  href?: string;
  tag?: string;
};

type LandingFeaturesProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
  showCTA?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
};

/**
 * LandingFeatures
 * - Feature grid with subtle animations and optional CTA.
 * - Tailored to Synergy Squad brand (indigo ↔ fuchsia).
 */
export default function LandingFeatures({
  id = "features",
  title = "Built for Hoteliers",
  subtitle = "Fresh, professional, and modern—crafted for decision speed and clarity.",
  items = DEFAULT_FEATURES,
  showCTA = true,
  ctaHref = "/metrics",
  ctaLabel = "View Evaluation Metrics",
  className,
}: LandingFeaturesProps) {
  return (
    <section id={id} className={clsx("container-7xl py-16 md:py-24", className)}>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 text-white/80">{subtitle}</p>}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, desc, href, tag }) => {
          const Card = (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20% 0px -10% 0px" }}
              transition={{ duration: 0.45 }}
              className="group h-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg transition hover:bg-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/30 to-fuchsia-400/30">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                </div>
                {tag && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/80">
                    {tag}
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm text-white/75">{desc}</p>

              <div className="mt-4 h-px w-full bg-white/10" />

              <div className="mt-3 text-xs text-white/60">
                <span className="rounded-md bg-white/5 px-2 py-1">
                  Secure by design
                </span>{" "}
                <span className="rounded-md bg-white/5 px-2 py-1">
                  FastAPI + MongoDB
                </span>
              </div>
            </motion.div>
          );

          return href ? (
            <Link key={title} href={href} className="block">
              {Card}
            </Link>
          ) : (
            Card
          );
        })}
      </div>

      {showCTA && (
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/15"
          >
            <ShieldCheck className="h-4 w-4" /> {ctaLabel}
          </Link>
          <p className="text-xs text-white/60">
            Smart exog, non-negative clipping, and shape-safe alignment included.
          </p>
        </div>
      )}
    </section>
  );
}

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: Brain,
    title: "AI-Powered Forecasting",
    desc: "SARIMAX + smart exogenous variables for reliable predictions.",
    tag: "Core",
  },
  {
    icon: LineChart,
    title: "Interactive Analytics",
    desc: "Zoomable charts, confidence bands, and export-ready data.",
    tag: "Charts",
  },
  {
    icon: Sparkles,
    title: "Smart Exog Mode",
    desc: "Auto-fill drivers with realistic heuristics (zeros or smart).",
    tag: "Auto",
  },
  {
    icon: CalendarDays,
    title: "Multi-Horizon",
    desc: "Daily, weekly, or monthly horizons—pick what you need.",
    tag: "Flex",
  },
  {
    icon: Activity,
    title: "Shape-Safe Alignment",
    desc: "Server aligns exog order and drops const/intercept automatically.",
    tag: "Safety",
  },
  {
    icon: ShieldCheck,
    title: "Confidence Bands",
    desc: "Calibrated intervals with configurable alpha (e.g., 95%).",
    tag: "CI",
  },
];
