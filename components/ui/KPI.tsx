"use client";

import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

type Trend = "up" | "down" | "flat";

type KPISize = "sm" | "md" | "lg";

export type KPIProps = {
  /** Main label, e.g. "MAE" */
  label: string;
  /** Main value; number or custom React node */
  value: number | React.ReactNode;
  /** Unit suffix shown next to value (e.g., "%", "IDR") */
  unit?: string;
  /** Number of decimals for auto number formatting (only when value is number) */
  precision?: number;
  /** Delta vs. benchmark/previous period (positive/negative renders color + arrow) */
  delta?: number;
  /** Explicit trend; if omitted, inferred from delta sign */
  trend?: Trend;
  /** Small helper text under value */
  hint?: string;
  /** Show circular progress ring (0..1). Useful for coverage, completion, etc. */
  ringPercent?: number; // 0..1
  /** Optional text inside ring center (e.g., "95%") */
  ringLabel?: string;
  /**
   * Tailwind class for ring accent stroke (defaults auto by trend/brand)
   * e.g., "stroke-emerald-400" or "stroke-rose-400"
   */
  ringColorClass?: string;
  /** Loading state shows skeleton */
  loading?: boolean;
  /** Visual size of the KPI */
  size?: KPISize;
  /** Compact layout (no hint spacing) */
  compact?: boolean;
  /** Custom class */
  className?: string;
};

/** Grid wrapper for multiple KPIs */
export function KPIGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </div>
  );
}

/** Format number with thousands separator and optional precision */
function formatNumber(n: number, precision = 0): string {
  if (!Number.isFinite(n)) return String(n);
  const opts: Intl.NumberFormatOptions = {
    maximumFractionDigits: precision,
    minimumFractionDigits: precision,
  };
  return new Intl.NumberFormat(undefined, opts).format(n);
}

/** Compute SVG ring metrics */
function ringMetrics(sizePx: number) {
  const r = (sizePx - 6) / 2; // 3px stroke padding
  const c = 2 * Math.PI * r;
  return { r, c };
}

export default function KPI({
  label,
  value,
  unit,
  precision = 0,
  delta,
  trend,
  hint,
  ringPercent,
  ringLabel,
  ringColorClass,
  loading = false,
  size = "md",
  compact = false,
  className,
}: KPIProps) {
  const resolvedTrend: Trend =
    trend ??
    (typeof delta === "number"
      ? delta > 0
        ? "up"
        : delta < 0
        ? "down"
        : "flat"
      : "flat");

  const sizeMap: Record<KPISize, { ring: number; label: string; value: string; gap: string; padding: string }> = {
    sm: { ring: 48, label: "text-[11px]", value: "text-base", gap: "gap-2", padding: "p-3" },
    md: { ring: 56, label: "text-xs", value: "text-lg", gap: "gap-3", padding: "p-4" },
    lg: { ring: 64, label: "text-sm", value: "text-xl", gap: "gap-4", padding: "p-5" },
  };

  const SZ = sizeMap[size];
  const ringSize = SZ.ring;
  const { r, c } = ringMetrics(ringSize);
  const pct = typeof ringPercent === "number" ? Math.max(0, Math.min(1, ringPercent)) : undefined;
  const dash = pct !== undefined ? c * pct : 0;

  // Colors
  const deltaColor =
    resolvedTrend === "up"
      ? "text-emerald-300"
      : resolvedTrend === "down"
      ? "text-rose-300"
      : "text-white/70";

  const deltaBg =
    resolvedTrend === "up"
      ? "bg-emerald-400/15"
      : resolvedTrend === "down"
      ? "bg-rose-400/15"
      : "bg-white/10";

  const ringStroke =
    ringColorClass ??
    (resolvedTrend === "up"
      ? "stroke-emerald-400"
      : resolvedTrend === "down"
      ? "stroke-rose-400"
      : "stroke-sky-400");

  // Value rendering
  const showNumber = typeof value === "number";
  const valueText = showNumber ? formatNumber(value, precision) : value;

  // Delta text
  const deltaText =
    typeof delta === "number" ? `${delta > 0 ? "+" : ""}${formatNumber(delta, precision)}${unit ?? ""}` : null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur",
        SZ.padding,
        className
      )}
      role="group"
      aria-label={`KPI ${label}`}
    >
      <div className={cn("flex items-center", SZ.gap)}>
        {/* Ring (optional) */}
        {pct !== undefined ? (
          <div className="relative">
            <svg
              width={ringSize}
              height={ringSize}
              viewBox={`0 0 ${ringSize} ${ringSize}`}
              className="block"
              aria-hidden="true"
            >
              {/* Track */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={r}
                className="stroke-white/15"
                strokeWidth="6"
                fill="none"
              />
              {/* Progress */}
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={r}
                className={cn(ringStroke, "transition-[stroke-dasharray] duration-700")}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                style={{
                  strokeDasharray: `${dash} ${c}`,
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
              />
            </svg>
            {/* Center label */}
            {ringLabel && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="text-[11px] font-semibold text-white/90">{ringLabel}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Text block */}
        <div className="min-w-0 flex-1">
          <div className={cn("truncate text-white/70", SZ.label)}>{label}</div>

          {loading ? (
            <div className="mt-1 h-5 w-32 rounded-md skeleton" />
          ) : (
            <div className={cn("mt-1 flex flex-wrap items-baseline gap-2")}>
              <div className={cn("font-semibold leading-none", SZ.value)}>
                {valueText}
                {showNumber && unit ? <span className="ml-1 text-white/70">{unit}</span> : null}
              </div>

              {deltaText && (
                <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px]", deltaBg, deltaColor)}>
                  <TrendIcon trend={resolvedTrend} className={cn(deltaColor)} />
                  {deltaText}
                </span>
              )}
            </div>
          )}

          {!compact && (hint || loading) && (
            <div className="mt-1">
              {loading ? (
                <div className="h-3 w-40 rounded-md skeleton" />
              ) : hint ? (
                <span className="text-[11px] text-white/60">{hint}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Icons ---------------------------------- */

function TrendIcon({
  trend,
  className,
}: {
  trend: Trend;
  className?: string;
}) {
  if (trend === "up") {
    return (
      <svg
        className={cn("h-3.5 w-3.5", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeWidth="2" strokeLinecap="round" d="M4 14l6-6 4 4 6-6" />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg
        className={cn("h-3.5 w-3.5", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeWidth="2" strokeLinecap="round" d="M4 10l6 6 4-4 6 6" />
      </svg>
    );
  }
  return (
    <svg
      className={cn("h-3.5 w-3.5 rotate-45", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeWidth="2" strokeLinecap="round" d="M4 12h16" />
    </svg>
  );
}
