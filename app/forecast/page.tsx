"use client";

import * as React from "react";
import { useDebugExog, usePredict } from "@/lib/hooks";
import { DEFAULTS } from "@/lib/constants";
import type {
  PredictRequestAuto,
  PredictRequestManualMap,
  PredictResponse,
} from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

import ForecastForm from "@/components/forms/ForecastForm";
import ManualExogGrid, { type ManualExogValue } from "@/components/forms/ManualExogGrid";
import ForecastChart from "@/components/charts/ForecastChart";
import ForecastTable from "@/components/tables/ForecastTable";

import Button from "@/components/ui/Button";
import KPI, { KPIGrid } from "@/components/ui/KPI";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Rocket } from "lucide-react";

/* ============================================================================
 * Shared Nav
 * ========================================================================== */
const NAV = [
  { label: "Forecast", href: "/forecast" },
  { label: "Metrics", href: "/metrics" },
  { label: "Chat", href: "/chat" },
  { label: "About", href: "/about" },
];

/* ============================================================================
 * Forecast Page — layout & core state
 * ========================================================================== */

export default function ForecastPage() {
  const chartRef = React.useRef<HTMLDivElement>(null);

  // 1) Load expected exog order from backend (for manual editor)
  const { data: exogInfo, isLoading: exogLoading, isError: exogErr } = useDebugExog();
  const exogColumns = exogInfo?.expected_exog_used_by_forecast ?? [];

  // 2) Manual exog grid state (map-style)
  const [horizon, setHorizon] = React.useState<number>(DEFAULTS.horizon);
  const [manualExog, setManualExog] = React.useState<ManualExogValue>(() =>
    Object.fromEntries(exogColumns.map((c) => [c, Array.from({ length: DEFAULTS.horizon }, () => 0)]))
  );

  // Keep manual grid rows aligned with latest "horizon"
  React.useEffect(() => {
    setManualExog((prev) => {
      const next: ManualExogValue = {};
      for (const c of exogColumns) {
        const src = prev[c] ?? [];
        next[c] = Array.from({ length: horizon }, (_, i) => Number(src[i] ?? 0));
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizon, exogColumns.join("|")]);

  // 3) Predict mutation
  const { mutateAsync: doPredict, isPending } = usePredict();

  const [result, setResult] = React.useState<PredictResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // 4) Submit handler from the form
  async function handleSubmit(body: PredictRequestAuto) {
    setError(null);
    setHorizon(body.horizon);

    try {
      const useAuto = body.flags?.use_auto_exog !== false; // default true
      if (!useAuto) {
        const manualBody: PredictRequestManualMap = {
          horizon: body.horizon,
          frequency: body.frequency,
          alpha: body.alpha,
          exog: manualExog,
        };
        const r = await doPredict(manualBody);
        setResult(r);
      } else {
        const r = await doPredict(body);
        setResult(r);
      }

      setTimeout(() => {
        chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  // 5) Quick stats from forecast
  const stats = React.useMemo(() => summarize(result), [result]);

  return (
    <div className="min-h-dvh bg-transparent">
      {/* ===== Header (same vibe as landing) ===== */}
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
            {NAV.map((n) => (
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

      {/* ===== Main ===== */}
      <main className="container-7xl py-8 md:py-10">
        {/* Title row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Forecast</h1>
            <p className="mt-1 text-sm text-white/70">
              Generate hotel revenue forecasts with auto/manual exogenous variables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="secondary"
              onClick={() => window?.location?.reload()}
              startIcon={<RefreshCw className="h-4 w-4" />}
            >
              Reload
            </Button>
          </div>
        </div>

        {/* Grid layout — slightly wider left column for Horizon controls */}
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          {/* Left column — Controls */}
          <div className="space-y-6">
            {/* NOTE: clip_non_negative default FALSE per request */}
            <ForecastForm
              onSubmit={handleSubmit}
              submitting={isPending}
              defaultValues={{
                horizon: DEFAULTS.horizon,
                frequency: DEFAULTS.frequency,
                alpha: DEFAULTS.alpha,
                use_auto_exog: true,
                exog_strategy: DEFAULTS.exogStrategy,
                clip_non_negative: false, // <- default false
                floor: DEFAULTS.floor,
              }}
              title="Forecast Controls"
            />

            {/* Manual Exog Editor */}
            <ManualExogGrid
              columns={exogColumns}
              horizon={horizon}
              value={manualExog}
              onChange={setManualExog}
              disabled={isPending}
            />

            {/* Info: server alignment */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/75">
              Server aligns exog order automatically and ignores extra columns. If
              you submit with <span className="font-semibold">Use Auto Exogenous</span>{" "}
              turned <span className="font-semibold">off</span>, the grid above will
              be sent as manual drivers.
            </div>

            {/* Errors */}
            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold">Request failed</div>
                  <div className="opacity-90">{error}</div>
                </div>
              </div>
            )}

            {/* Exog loading/fallback */}
            {exogLoading && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                Loading exogenous column order…
              </div>
            )}
            {exogErr && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                Failed to load exog columns. You can still forecast in auto mode.
              </div>
            )}
          </div>

          {/* Right column — Results */}
          <div className="space-y-6" ref={chartRef}>
            {/* KPIs */}
            <KPIGrid>
              <KPI
                label="Average yhat"
                value={stats.avg}
                precision={0}
                hint="Mean forecasted revenue"
                ringPercent={stats.coverage}
                ringLabel={stats.coverageLabel}
              />
              <KPI
                label="Peak yhat"
                value={stats.peak}
                precision={0}
                hint={stats.peakDate ? `on ${stats.peakDate}` : undefined}
                trend="up"
              />
              <KPI
                label="Trend"
                value={stats.trendLabel}
                hint="vs. first day"
                delta={stats.delta}
                precision={0}
              />
            </KPIGrid>

            {/* Chart */}
            <ForecastChart
              data={result?.forecasts ?? []}
              title="Forecast"
              subtitle={
                result
                  ? `Mode: ${result.exog_mode}${
                      result.exog_summary?.mode ? ` / ${result.exog_summary.mode}` : ""
                    } • Horizon: ${result.horizon} • Freq: ${result.freq}`
                  : undefined
              }
              loading={isPending}
              height={380}
            />

            {/* Warnings */}
            {Array.isArray(result?.warnings) && result?.warnings?.length ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                <div className="mb-1 font-semibold">Warnings</div>
                <ul className="list-inside list-disc space-y-1">
                  {result!.warnings!.map((w, i) => (
                    <li key={i} className="opacity-90">{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Table */}
            <ForecastTable data={result?.forecasts ?? []} loading={isPending} />
          </div>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/10 bg-white/5 mt-10">
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
            <div>v0.1 • Built with ♥️ in Bali</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================================
 * Helpers
 * ========================================================================== */

function summarize(r: PredictResponse | null) {
  if (!r?.forecasts?.length) {
    return {
      avg: 0,
      peak: 0,
      peakDate: "",
      trendLabel: "—",
      delta: 0,
      coverage: undefined as number | undefined,
      coverageLabel: undefined as string | undefined,
    };
    }

  const arr = r.forecasts;
  const sum = arr.reduce((acc, p) => acc + (p.yhat ?? 0), 0);
  const avg = sum / arr.length;

  let peak = -Infinity;
  let peakDate = "";
  for (const p of arr) {
    if ((p.yhat ?? -Infinity) > peak) {
      peak = p.yhat;
      peakDate = p.ds;
    }
  }

  const start = arr[0]?.yhat ?? 0;
  const end = arr[arr.length - 1]?.yhat ?? 0;
  const delta = end - start;
  const trendLabel = delta > 0 ? "Upward ↗" : delta < 0 ? "Downward ↘" : "Flat →";

  // simple coverage proxy when lower/upper present for all points
  const hasBand = arr.every((p) => typeof p.yhat_lower === "number" && typeof p.yhat_upper === "number");
  const coverage = hasBand ? 0.95 : undefined;
  const coverageLabel = hasBand ? "95%" : undefined;

  return {
    avg: Math.max(0, Math.round(avg)),
    peak: Math.max(0, Math.round(peak)),
    peakDate,
    trendLabel,
    delta,
    coverage,
    coverageLabel,
  };
}
