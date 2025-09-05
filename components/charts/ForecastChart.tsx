"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Brush,
  ReferenceLine,
} from "recharts";
import { parseISO, format as formatDate } from "date-fns";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import Button from "@/components/ui/Button";
import { Download, Eye, EyeOff } from "lucide-react";
import type { ForecastPoint } from "@/lib/types";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export type ForecastChartProps = {
  /** Normalized forecast points [{ ds, yhat, yhat_lower?, yhat_upper? }] */
  data: ForecastPoint[];
  /** Height in px (container is responsive width) */
  height?: number;
  /** Optional title */
  title?: string;
  /** Optional subtitle / hint */
  subtitle?: string;
  /** Show toolbar (toggle band, download PNG) */
  showToolbar?: boolean;
  /** Sync id to coordinate zoom/tooltip with other charts */
  syncId?: string;
  /** Loading state (renders skeleton) */
  loading?: boolean;
  /** Extra class */
  className?: string;
};

/* ------------------------------ Utils ------------------------------ */

function formatNumber(n: number | undefined, digits = 0) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(n);
}

function formatTickDate(ds: string) {
  const d = parseISO(ds);
  return Number.isNaN(d.getTime()) ? ds : formatDate(d, "MMM d");
}

function hasBand(points: ForecastPoint[]) {
  return points?.some((p) => typeof p.yhat_lower === "number" && typeof p.yhat_upper === "number");
}

/* ---------------------------- Component ---------------------------- */

export default function ForecastChart({
  data,
  height = 360,
  title = "Forecast",
  subtitle,
  showToolbar = true,
  syncId,
  loading,
  className,
}: ForecastChartProps) {
  const [showBand, setShowBand] = React.useState(true);
  const bandAvailable = hasBand(data);

  // When there is no band in the data, force-hide
  React.useEffect(() => {
    if (!bandAvailable) setShowBand(false);
  }, [bandAvailable]);

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg",
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-36 skeleton" />
          <div className="h-8 w-32 skeleton rounded-xl" />
        </div>
        <div className="h-[360px] w-full skeleton rounded-xl" />
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70",
          className
        )}
      >
        No forecast data yet. Generate a forecast to see the chart.
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg", className)}>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-white/70">{subtitle}</p>}
        </div>

        {showToolbar && (
          <div className="flex items-center gap-2">
            {bandAvailable && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowBand((s) => !s)}
                startIcon={showBand ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              >
                {showBand ? "Hide CI" : "Show CI"}
              </Button>
            )}
            <DownloadPNG targetId="forecast-chart-capture" />
          </div>
        )}
      </div>

      {/* Chart */}
      <div id="forecast-chart-capture" className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId={syncId}>
            <defs>
              {/* Band gradient */}
              <linearGradient id="fc_band" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(99,102,241,0.45)" />
                <stop offset="100%" stopColor="rgba(236,72,153,0.10)" />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="ds"
              tickFormatter={formatTickDate}
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.15)" }}
              minTickGap={28}
            />
            <YAxis
              width={70}
              tickFormatter={(v) => formatNumber(v)}
              tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
              tickLine={{ stroke: "rgba(255,255,255,0.15)" }}
            />

            <Tooltip
              content={<ForecastTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.25)", strokeDasharray: 4 }}
            />

            {/* Optional: baseline at zero */}
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />

            {/* Confidence band (approximation with two translucent areas) */}
            {showBand && bandAvailable && (
              <>
                <Area
                  type="monotone"
                  dataKey="yhat_upper"
                  stroke="none"
                  fill="url(#fc_band)"
                  fillOpacity={0.35}
                  connectNulls
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="yhat_lower"
                  stroke="none"
                  fill="rgba(19,36,122,0.60)" // backdrop color to visually cut the lower area
                  fillOpacity={0.25}
                  connectNulls
                  isAnimationActive={false}
                />
              </>
            )}

            {/* Main forecast line */}
            <Line
              type="monotone"
              dataKey="yhat"
              stroke="#ffffff"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />

            {/* Zoom/inspect */}
            <Brush
              height={28}
              travellerWidth={10}
              stroke="rgba(255,255,255,0.25)"
              fill="rgba(255,255,255,0.06)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* -------------------------- Custom Tooltip -------------------------- */

function ForecastTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  // Find values by dataKey
  const p = Array.isArray(payload) ? payload : [];
  const yhat = p.find((x: any) => x.dataKey === "yhat")?.value as number | undefined;
  const upper = p.find((x: any) => x.dataKey === "yhat_upper")?.value as number | undefined;
  const lower = p.find((x: any) => x.dataKey === "yhat_lower")?.value as number | undefined;

  const d = (() => {
    try {
      return formatDate(parseISO(label), "EEEE, MMM d yyyy");
    } catch {
      return String(label);
    }
  })();

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1c66]/90 p-3 text-xs text-white shadow-xl backdrop-blur">
      <div className="mb-1 font-semibold">{d}</div>
      <div className="grid gap-1">
        <Row name="yhat" value={formatNumber(yhat)} color="white" />
        {typeof lower === "number" && typeof upper === "number" && (
          <Row
            name="95% CI"
            value={`${formatNumber(lower)} – ${formatNumber(upper)}`}
            color="rgba(147,197,253,1)"
          />
        )}
      </div>
    </div>
  );
}

function Row({ name, value, color }: { name: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-white/70">{name}</span>
      <span className="font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}

/* ---------------------------- Download PNG ---------------------------- */
/**
 * Small helper that uses the browser's `toDataURL` via <canvas> and <svg> serialization.
 * For simplicity & no deps, we capture the container node as a PNG using foreignObject.
 * Note: Works best on modern browsers; for production-grade export consider html-to-image.
 */
function DownloadPNG({ targetId }: { targetId: string }) {
  const [busy, setBusy] = React.useState(false);

  const handle = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;

    try {
      setBusy(true);

      // Serialize node using XMLSerializer inside a foreignObject SVG
      const serializer = new XMLSerializer();
      const html = serializer.serializeToString(el);

      const w = el.clientWidth || 1000;
      const h = el.clientHeight || 400;

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
          <foreignObject width="100%" height="100%">
            ${html}
          </foreignObject>
        </svg>
      `.trim();

      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = w * 2; // retina-ish
      canvas.height = h * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(2, 2);
      // Fill background to avoid transparent export
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg") || "#13247a";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      URL.revokeObjectURL(url);

      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `forecast_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("PNG export failed:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={handle}
      loading={busy}
      startIcon={<Download className="h-4 w-4" />}
    >
      PNG
    </Button>
  );
}
