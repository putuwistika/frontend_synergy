"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, RefreshCw, Rocket, AlertTriangle, LineChart } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KPI, { KPIGrid } from "@/components/ui/KPI";
import ErrorHistogram from "@/components/charts/ErrorHistogram";
import MetricsByPeriodTable from "@/components/tables/MetricsByPeriodTable";

import type { MetricsResponse } from "@/lib/types";
import { ENDPOINTS } from "@/lib/constants";
import { getJSON } from "@/lib/api-client";
import { buildMetricsParams, getErrorMessage } from "@/lib/utils";

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
 * Page
 * ========================================================================== */

export default function MetricsPage() {
  const [evalStart, setEvalStart] = React.useState<string>(""); // kosong = pakai full test_df
  const [evalEnd, setEvalEnd] = React.useState<string>("");     // kosong = pakai full test_df
  const [alpha, setAlpha] = React.useState<number>(0.05);

  const [result, setResult] = React.useState<MetricsResponse | null>(null);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const rows = result?.by_period ?? [];
  const stats = React.useMemo(() => summarize(result), [result]);

  async function submit() {
    setError(null);
    setIsPending(true);
    try {
      // Jika kedua tanggal kosong → panggil /api/metrics tanpa params (server pakai test_df full)
      const params =
        evalStart || evalEnd
          ? buildMetricsParams({ start: evalStart || undefined, end: evalEnd || undefined, alpha })
          : undefined;

      const data = await getJSON<MetricsResponse>(ENDPOINTS.metrics, params);
      setResult(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsPending(false);
    }
  }

  function reset() {
    setEvalStart("");
    setEvalEnd("");
    setAlpha(0.05);
    setResult(null);
    setError(null);
  }

  return (
    <div className="min-h-dvh bg-transparent">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Synergy Squad Home">
            <Image
              src="/logo.png"
              alt="Synergy Squad"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full ring-2 ring-white/30 object-contain"
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
        {/* Title Row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Metrics & Evaluation</h1>
            <p className="mt-1 text-sm text-white/70">
              Run evaluation over <code>test_df</code>. Leave dates empty to use the full window.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="secondary"
              onClick={reset}
              startIcon={<RefreshCw className="h-4 w-4" />}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Layout: Controls + Visuals */}
        <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          {/* Left — Controls */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-white/80" />
                <h3 className="text-sm font-semibold">Evaluation Window</h3>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    type="date"
                    label="Start date"
                    value={evalStart}
                    onChange={(e) => setEvalStart(e.target.value)}
                    startIcon={<Calendar className="h-4 w-4" />}
                    hint="Optional — empty = full test_df"
                  />
                  <Input
                    type="date"
                    label="End date"
                    value={evalEnd}
                    onChange={(e) => setEvalEnd(e.target.value)}
                    startIcon={<Calendar className="h-4 w-4" />}
                    hint="Optional — empty = full test_df"
                  />
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
                  <Input
                    type="number"
                    step="0.01"
                    min={0.001}
                    max={0.5}
                    label="Alpha (CI)"
                    hint="0.05 = 95% confidence interval"
                    value={String(alpha)}
                    onChange={(e) => setAlpha(Number(e.target.value || "0.05"))}
                  />

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={submit}
                    loading={isPending}
                  >
                    Run Evaluation
                  </Button>
                </div>
              </div>

              {/* Error box */}
              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold">Request failed</div>
                    <div className="opacity-90">{error}</div>
                  </div>
                </div>
              )}

              {/* Info box */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/75">
                Server will assemble exogenous variables from <code>test_df</code>. Missing
                columns are filled with zero and order is aligned automatically.
              </div>
            </div>
          </div>

          {/* Right — KPIs + Chart + Table */}
          <div className="space-y-6">
            {/* KPIs */}
            <KPIGrid>
              <KPI label="MAE" value={stats.mae} precision={0} hint="Mean Absolute Error" />
              <KPI label="RMSE" value={stats.rmse} precision={0} hint="Root Mean Squared Error" />
              <KPI
                label="MAPE"
                value={stats.mapePct}
                precision={1}
                suffix="%"
                hint="Mean Absolute Percentage Error"
              />
              <KPI
                label="sMAPE"
                value={stats.smapePct}
                precision={1}
                suffix="%"
                hint="Symmetric MAPE"
              />
              <KPI
                label="Coverage"
                value={stats.coveragePct}
                precision={0}
                suffix="%"
                ringPercent={
                  typeof stats.coverage === "number" ? clamp(stats.coverage, 0, 1) : undefined
                }
                ringLabel={
                  typeof stats.coveragePct === "number"
                    ? `${Math.round(stats.coveragePct)}%`
                    : undefined
                }
                hint="Prob. that actual is inside CI"
              />
              <KPI
                label="Bias (ME)"
                value={stats.bias}
                precision={0}
                trend={stats.biasTrend}
                hint="Mean Error (y − yhat). Positive = underprediction"
              />
            </KPIGrid>

            {/* Histogram */}
            <ErrorHistogram
              data={rows}
              mode="residual"
              height={300}
              title="Error Distribution"
              subtitle="Residuals (y − yhat)"
              showToolbar
            />

            {/* Table */}
            <MetricsByPeriodTable data={rows} />
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
              SYNERGIZED INTELLIGENCE — data-driven hotel revenue forecasting with a beautiful,
              modern UX.
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function summarize(r: MetricsResponse | null) {
  const m = r?.metrics;
  const mae = numberOrZero(m?.mae);
  const rmse = numberOrZero(m?.rmse);
  const mape = numberOrZero(m?.mape);
  const smape = numberOrZero(m?.smape);
  const bias = numberOrZero(m?.bias_me);
  const coverage = typeof m?.coverage_95 === "number" ? m.coverage_95 : undefined;

  return {
    mae: Math.round(mae),
    rmse: Math.round(rmse),
    mapePct: mape * 100,
    smapePct: smape * 100,
    coverage,
    coveragePct: typeof coverage === "number" ? coverage * 100 : undefined,
    bias: Math.round(bias),
    biasTrend: (bias === 0 ? "flat" : bias > 0 ? "up" : "down") as const,
  };
}

function numberOrZero(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

function getErrorMessageSafe(err: unknown) {
  try {
    return getErrorMessage(err);
  } catch {
    return "Unknown error";
  }
}
