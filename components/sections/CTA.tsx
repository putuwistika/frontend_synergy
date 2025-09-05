"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";

type CTAProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  note?: string;
  /** When true, renders a stronger gradient background */
  emphasize?: boolean;
  className?: string;
};

/**
 * CTA Section — reusable call-to-action block
 * - Brand gradient (indigo ↔ fuchsia), soft glass card, responsive layout
 * - Accessible: heading hierarchy left to page, buttons are <Link>s
 */
export default function CTA({
  id,
  title = "Ready to forecast like a pro?",
  subtitle = "Generate forecasts in seconds. Export, compare scenarios, and stay ahead of demand.",
  primaryHref = "/forecast",
  primaryLabel = "Get Started",
  secondaryHref = "/chat",
  secondaryLabel = "Try Chat Mode",
  note,
  emphasize = true,
  className,
}: CTAProps) {
  return (
    <section id={id} className={clsx("container-7xl", className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={clsx(
          "overflow-hidden rounded-3xl border border-white/10 p-8 shadow-2xl md:p-12",
          emphasize
            ? "bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20"
            : "bg-white/5"
        )}
      >
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold md:text-3xl">{title}</h3>
            {subtitle && (
              <p className="mt-2 max-w-xl text-white/80">{subtitle}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-[#13247a] transition hover:opacity-90"
              aria-label={primaryLabel}
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              aria-label={secondaryLabel}
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>

        {note && (
          <p className="mt-4 text-xs text-white/60">
            {note}
          </p>
        )}
      </motion.div>
    </section>
  );
}
