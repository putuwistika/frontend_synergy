"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, Rocket, AlertTriangle } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KPI, { KPIGrid } from "@/components/ui/KPI";
import ForecastChart from "@/components/charts/ForecastChart";
import ForecastTable from "@/components/tables/ForecastTable";

import { useChatForecast } from "@/lib/hooks";
import type { PredictResponse } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

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

export default function ChatPage() {
  const chartRef = React.useRef<HTMLDivElement>(null);

  const { mutateAsync: chatForecast, isPending } = useChatForecast();

  const [prompt, setPrompt] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<PredictResponse | null>(null);

  const stats = React.useMemo(() => summarize(result), [result]);

  async function submit(msg?: string) {
    const message = (msg ?? prompt).trim();
    if (!message) return;
    setError(null);
    try {
      const r = await chatForecast({ message });
      setResult(r);
      setTimeout(() => {
        chartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  const suggestions = [
    "forecast 14 hari smart exog",
    "forecast 30 hari",
    "forecast 21 hari zeros exog",
  ];

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
        {/* Title Row */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Chat Forecast</h1>
          <p className="mt-1 text-sm text-white/70">
            Ketik perintah natural, misalnya:{" "}
            <span className="rounded bg-white/10 px-2 py-0.5">forecast 14 hari smart exog</span>
          </p>
        </div>

        {/* Layout */}
        <div className="grid gap-6 lg:grid-cols-[480px_minmax(0,1fr)]">
          {/* Left: prompt box */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <label className="mb-2 block text-sm font-medium">Prompt</label>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    placeholder="contoh: forecast 14 hari smart exog"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    startIcon={
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-white/70"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path strokeWidth="2" d="M3 5h18M3 12h18M3 19h18" />
                      </svg>
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => submit()}
                  loading={isPending}
                  startIcon={<Send className="h-4 w-4" />}
                >
                  Send
                </Button>
              </div>

              {/* Suggestions */}
              <div className="-mx-1 mt-3 overflow-x-auto">
                <div className="flex min-w-0 items-center gap-2 px-1 pb-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setPrompt(s);
                        submit(s);
                      }}
                      className="whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error box */}
              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold">Request failed</div>
                    <div className="opacity-90">{error}</div>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="mt-3 text-xs text-white/70">
                Didukung:{" "}
                <code className="rounded bg-white/10 px-1 py-0.5">hari</code>,{" "}
                <code className="rounded bg-white/10 px-1 py-0.5">minggu</code>,{" "}
                <code className="rounded bg-white/10 px-1 py-0.5">bulan</code>,{" "}
                <code className="rounded bg-white/10 px-1 py-0.5">smart exog</code>,{" "}
                <code className="rounded bg-white/10 px-1 py-0.5">zeros exog</code>.
              </div>
            </div>
          </div>

          {/* Right: results */}
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

            {/* Chart + Table */}
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

            {Array.isArray(result?.warnings) && result?.warnings?.length ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                <div className="mb-1 font-semibold">Warnings</div>
                <ul className="list-inside list-disc space-y-1">
                  {result!.warnings!.map((w, i) => (
                    <li key={i} className="opacity-90">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

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
              SYNERGIZED INTELLIGENCE — data-driven hotel revenue forecasting with a beautiful, modern UX.
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

  const hasBand = arr.every(
    (p) => typeof p.yhat_lower === "number" && typeof p.yhat_upper === "number"
  );
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
