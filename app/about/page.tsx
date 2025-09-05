// app/about/page.tsx

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Rocket, Layers, Boxes, Cpu, Database, Network, Shield } from "lucide-react";
import TeamGrid from "@/components/team/TeamGrid";
import Button from "@/components/ui/Button";

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

export default function AboutPage() {
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
              priority={false}
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
      <main className="container-7xl py-10 md:py-12">
        {/* Hero */}
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-fuchsia-500/10 to-sky-500/10 p-6 md:p-10">
          <div className="pointer-events-none absolute -inset-40 -z-10 blur-3xl"
               style={{
                 background:
                   "radial-gradient(60rem 30rem at 15% 20%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(50rem 30rem at 85% 120%, rgba(236,72,153,0.25), transparent 60%)",
               }}
          />
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                SYNERGIZED INTELLIGENCE
              </div>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                About Synergy Squad Forecast
              </h1>
              <p className="mt-2 text-sm text-white/80 md:text-base">
                Platform peramalan pendapatan hotel yang modern, cepat, dan mudah dipakai —
                memadukan UI/UX yang menyenangkan dengan pipeline analitik yang solid. Tujuan kami:
                membantu tim revenue menghasilkan prediksi akurat dan mengambil keputusan lebih cepat.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/forecast">
                  <Button variant="primary" size="md">Mulai Forecast</Button>
                </Link>
                <Link href="/metrics">
                  <Button variant="secondary" size="md">Lihat Metrics</Button>
                </Link>
              </div>
            </div>

            <div className="shrink-0">
              <Image
                src="/logo.png"
                alt="Synergy Squad Logo"
                width={96}
                height={96}
                className="h-24 w-24 rounded-2xl ring-2 ring-white/30 object-contain"
                priority={false}
              />
            </div>
          </div>
        </section>

        {/* Mission / Description */}
        <section className="mb-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg lg:col-span-2">
            <h2 className="text-lg font-semibold">Misi & Tujuan</h2>
            <p className="mt-2 text-sm text-white/80">
              Website ini dibangun untuk mempercepat proses forecasting dan eksperimen skenario
              pada bisnis perhotelan. Pengguna dapat menghasilkan prediksi multi-horizon, melihat
              confidence interval, mengevaluasi performa model (MAE, RMSE, MAPE, sMAPE, coverage, bias),
              serta mengekspor hasil dengan mudah.
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm text-white/80">
              <li>Antarmuka interaktif dan responsif untuk <em>what-if analysis</em>.</li>
              <li>Horizon fleksibel (harian/mingguan/bulanan) dengan auto/manual exogenous variables.</li>
              <li>Evaluasi berkala langsung dari <code>test_df</code> untuk menjaga kualitas model.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Teknologi Inti</h3>
            <p className="mt-2 text-sm text-white/80">
              Backend kami memakai <b>FastAPI</b> & <b>MongoDB</b>, sementara frontend dibangun dengan Next.js 15.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <TechBadge icon={<Cpu className="h-3.5 w-3.5" />} label="FastAPI" />
              <TechBadge icon={<Database className="h-3.5 w-3.5" />} label="MongoDB (GridFS)" />
              <TechBadge icon={<Layers className="h-3.5 w-3.5" />} label="Next.js 15" />
              <TechBadge icon={<Boxes className="h-3.5 w-3.5" />} label="Tailwind CSS" />
              <TechBadge icon={<Network className="h-3.5 w-3.5" />} label="React Query" />
              <TechBadge icon={<Shield className="h-3.5 w-3.5" />} label="CORS + HTTPS" />
            </div>
            <p className="mt-3 text-xs text-white/60">
              Base API:{" "}
              <code className="rounded-lg bg-white/10 px-1.5 py-0.5">
                https://backendsynergy-production.up.railway.app
              </code>
            </p>
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="text-lg font-semibold">Arsitektur Singkat</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Frontend</h3>
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-white/80">
                <li>Next.js (App Router) + TypeScript</li>
                <li>Tailwind CSS + Framer Motion</li>
                <li>React Query untuk caching & revalidation</li>
                <li>Recharts untuk visualisasi forecast</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Backend</h3>
              <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-white/80">
                <li>FastAPI sebagai REST layer</li>
                <li>Model SARIMAX (statsmodels) di GridFS</li>
                <li>MongoDB: <code>train_df</code> & <code>test_df</code></li>
                <li>Endpoint utama: <code>/api/predict</code>, <code>/api/chat/forecast</code>, <code>/api/metrics</code></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Team */}
        <TeamGrid className="mb-10" />

        {/* CTA Bottom */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-lg">
          <h3 className="text-lg font-semibold">Siap mencoba?</h3>
          <p className="mt-1 text-sm text-white/80">
            Mulai dari halaman Forecast, kemudian cek performa di Metrics.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link href="/forecast">
              <Button variant="primary">Buka Forecast</Button>
            </Link>
            <Link href="/metrics">
              <Button variant="secondary">Lihat Metrics</Button>
            </Link>
          </div>
        </section>
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
 * Local tiny component
 * ========================================================================== */

function TechBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white/80">
      {icon}
      {label}
    </span>
  );
}
