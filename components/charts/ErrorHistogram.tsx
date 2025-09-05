"use client";

import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import Button from "@/components/ui/Button";
import { Minus, Plus, SlidersHorizontal } from "lucide-react";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type ByPeriodPoint = {
  ds: string;   // date
  y: number;    // actual
  yhat: number; // prediction
  lower?: number;
  upper?: number;
  abs_err?: number; // provided by API (optional)
};

export type ErrorHistogramProps = {
  /** Raw by_period data from /api/metrics */
  data: ByPeriodPoint[];
  /** residual = y - yhat (signed), absolute = |y - yhat| */
  mode?: "residual" | "absolute";
  /** Suggested number of bins (will be clamped 5..60, default auto) */
  bins?: number;
  /** Height (px) for the chart area */
  height?: number;
  /** Optional title */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Show toolbar (mode & bin controls) */
  showToolbar?: boolean;
  /** Extra class for outer container */
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function ErrorHistogram({
  data,
  mode: modeProp = "residual",
  bins: binsProp,
  height = 280,
  title = "Error Distribution",
  subtitle,
  showToolbar = true,
  className,
}: ErrorHistogramProps) {
  const [mode, setMode] = React.useState<"residual" | "absolute">(modeProp);
  const [bins, setBins] = React.useState<number>(() => {
    const n = Array.isArray(data) ? data.length : 0;
    return binsProp ?? sturges(n);
  });

  React.useEffect(() => {
    setMode(modeProp);
  }, [modeProp]);

  React.useEffect(() => {
    if (typeof binsProp === "number" && Number.isFinite(binsProp)) {
      setBins(binsProp);
    }
  }, [binsProp]);

  const values = React.useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [] as number[];
    if (mode === "absolute") {
      // Prefer API-provided abs_err if available
      return data.map((d) =>
        typeof d.abs_err === "number" ? Math.max(0, d.abs_err) : Math.abs((d.y ?? 0) - (d.yhat ?? 0))
      );
    }
    // residual: y - yhat (positive => underprediction)
    return data.map((d) => (d.y ?? 0) - (d.yhat ?? 0));
  }, [data, mode]);

  const hist = React.useMemo(() => toHistogram(values, bins, mode), [values, bins, mode]);

  const maxCount = React.useMemo(
    () => hist.reduce((m, b) => (b.count > m ? b.count : m), 0),
    [hist]
  );

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70",
          className
        )}
      >
        No evaluation data yet. Run metrics to see the error histogram.
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg", className)}>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-white/70">
            {subtitle ??
              (mode === "residual"
                ? "Residuals (y − yhat); positive means underprediction."
                : "Absolute errors |y − yhat|.")}
          </p>
        </div>

        {showToolbar && (
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2 py-1 text-xs md:flex">
              <SlidersHorizontal className="mr-1 h-3.5 w-3.5 text-white/70" />
              Bins
              <Button
                size="xs"
                variant="secondary"
                onClick={() => setBins((b) => clamp(b - 1, 5, 60))}
                startIcon={<Minus className="h-3.5 w-3.5" />}
              />
              <span className="tabular-nums">{bins}</span>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => setBins((b) => clamp(b + 1, 5, 60))}
                startIcon={<Plus className="h-3.5 w-3.5" />}
              />
            </div>

            <div className="inline-flex overflow-hidden rounded-xl border border-white/15 bg-white/5">
              {(["residual", "absolute"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={cn(
                    "px-3 py-1.5 text-xs transition",
                    mode === m
                      ? "bg-gradient-to-r from-indigo-500/40 to-fuchsia-500/40 text-white"
                      : "text-white/80 hover:bg-white/10"
                  )}
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                >
                  {m === "residual" ? "Residual" : "Absolute"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hist}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="center"
              type="number"
              domain={[hist.length ? hist[0].x0 : 0, hist.length ? hist[hist.length - 1].x1 : 1]}
              tickFormatter={(v: number) => formatCompact(v)}
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.15)" }}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, Math.max(5, maxCount)]}
              tickFormatter={(v) => String(v)}
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.15)" }}
              width={40}
            />
            <Tooltip content={<HistTooltip mode={mode} />} cursor={{ fill: "rgba(255,255,255,0.08)" }} />
            {/* Baseline at 0 for residual mode */}
            {mode === "residual" && (
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.35)" strokeDasharray="4" />
            )}
            <Bar
              dataKey="count"
              isAnimationActive={false}
              radius={[6, 6, 0, 0]}
              // Soft gradient-ish fill via solid color for simplicity
              fill="rgba(99,102,241,0.85)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tooltip                                                            */
/* ------------------------------------------------------------------ */

type HistRow = {
  x0: number;
  x1: number;
  center: number;
  count: number;
};

type ReTooltipPayload = { payload?: HistRow };
type ReTooltipArgs = {
  active?: boolean;
  payload?: ReTooltipPayload[];
  label?: number;
};

function HistTooltip({ active, payload }: ReTooltipArgs & { mode: "residual" | "absolute" }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1c66]/90 p-3 text-xs text-white shadow-xl backdrop-blur">
      <div className="mb-1 font-semibold">Bin</div>
      <div className="grid gap-1">
        <Row name="Range" value={`${formatNumber(row.x0)} – ${formatNumber(row.x1)}`} />
        <Row name="Center" value={`${formatNumber(row.center)}`} />
        <Row name="Count" value={`${row.count}`} />
      </div>
    </div>
  );
}

function Row({ name, value }: { name: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-white/70">{name}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function sturges(n: number) {
  if (!Number.isFinite(n) || n <= 0) return 20;
  const k = Math.ceil(Math.log2(n) + 1);
  return clamp(k, 5, 40);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Convert values into histogram bins suitable for recharts.
 * - For residual mode, bins are symmetric around 0.
 * - For absolute mode, bins start at 0.
 */
function toHistogram(values: number[], bins: number, mode: "residual" | "absolute"): HistRow[] {
  const clean = values.filter((v) => Number.isFinite(v)) as number[];
  if (clean.length === 0) return [];

  let min = Math.min(...clean);
  let max = Math.max(...clean);

  if (mode === "residual") {
    const a = Math.max(Math.abs(min), Math.abs(max));
    min = -a;
    max = a;
  } else {
    min = Math.max(0, min);
    max = Math.max(min, max);
  }

  const k = clamp(bins, 5, 60);
  const width = (max - min) / k || 1;

  // Build bins
  const edges: number[] = [];
  for (let i = 0; i <= k; i++) edges.push(min + i * width);

  const rows: HistRow[] = [];
  for (let i = 0; i < k; i++) {
    const x0 = edges[i]!;
    const x1 = edges[i + 1]!;
    rows.push({ x0, x1, center: (x0 + x1) / 2, count: 0 });
  }

  // Count
  for (const v of clean) {
    if (v < min || v > max) continue;
    let idx = Math.floor((v - min) / width);
    if (idx < 0) idx = 0;
    if (idx >= k) idx = k - 1; // include max value
    rows[idx]!.count++;
  }

  return rows;
}
