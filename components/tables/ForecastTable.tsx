"use client";

import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { parseISO, format as formatDate } from "date-fns";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

import Button from "@/components/ui/Button";
import type { ForecastPoint } from "@/lib/types";
import { exportForecastCSV } from "@/lib/utils";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

type SortKey = "ds" | "yhat" | "yhat_lower" | "yhat_upper";
type SortDir = "asc" | "desc";

export type ForecastTableProps = {
  data: ForecastPoint[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  pageSize?: number;
  className?: string;
};

export default function ForecastTable({
  data,
  loading,
  title = "Forecast Table",
  subtitle,
  pageSize = 15,
  className,
}: ForecastTableProps) {
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSize);
  const [page, setPage] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<SortKey>("ds");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  React.useEffect(() => {
    setPage(0);
  }, [rowsPerPage, sortKey, sortDir]);

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg", className)}>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-40 skeleton rounded" />
          <div className="h-8 w-24 skeleton rounded-xl" />
        </div>
        <div className="h-[320px] w-full skeleton rounded-xl" />
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70", className)}>
        No rows. Generate a forecast to populate the table.
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "ds") {
      const da = safeDate(a.ds);
      const db = safeDate(b.ds);
      return (da.getTime() - db.getTime()) * dir;
    }
    const va = a[sortKey] ?? Number.NEGATIVE_INFINITY;
    const vb = b[sortKey] ?? Number.NEGATIVE_INFINITY;
    return ((va as number) - (vb as number)) * dir;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const pageClamped = Math.min(page, totalPages - 1);
  const start = pageClamped * rowsPerPage;
  const end = start + rowsPerPage;
  const pageRows = sorted.slice(start, end);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg", className)}>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-white/70">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => exportForecastCSV(sorted)}
            startIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-white/70">Rows/page</span>
            <select
              className="rounded-xl border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              {[10, 15, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white/10 backdrop-blur">
            <tr>
              <Th
                active={sortKey === "ds"}
                dir={sortKey === "ds" ? sortDir : undefined}
                onClick={() => handleSort("ds")}
              >
                Date (ds)
              </Th>
              <Th
                active={sortKey === "yhat"}
                dir={sortKey === "yhat" ? sortDir : undefined}
                onClick={() => handleSort("yhat")}
                className="text-right"
              >
                yhat
              </Th>
              <Th
                active={sortKey === "yhat_lower"}
                dir={sortKey === "yhat_lower" ? sortDir : undefined}
                onClick={() => handleSort("yhat_lower")}
                className="text-right"
              >
                lower
              </Th>
              <Th
                active={sortKey === "yhat_upper"}
                dir={sortKey === "yhat_upper" ? sortDir : undefined}
                onClick={() => handleSort("yhat_upper")}
                className="text-right"
              >
                upper
              </Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={`${r.ds}-${i}`} className="even:bg-white/5">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-white/80">{formatDs(r.ds)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.yhat)}</td>
                <td className="px-3 py-2 text-right">{numOrDash(r.yhat_lower)}</td>
                <td className="px-3 py-2 text-right">{numOrDash(r.yhat_upper)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          Showing <span className="text-white/80">{start + 1}</span>–
          <span className="text-white/80">{Math.min(end, sorted.length)}</span>{" "}
          of <span className="text-white/80">{sorted.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={pageClamped === 0}
            startIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Prev
          </Button>
          <span className="text-xs text-white/70">
            Page <span className="text-white/90">{pageClamped + 1}</span> / {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={pageClamped >= totalPages - 1}
            endIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Subcomponents ----------------------------- */

function Th({
  children,
  active,
  dir,
  onClick,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  dir?: SortDir;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "select-none cursor-pointer border-b border-white/10 px-3 py-2 text-left text-xs text-white/80 transition hover:bg-white/10",
        active && "bg-white/10 text-white",
        className
      )}
      onClick={onClick}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      scope="col"
    >
      <div className="flex items-center gap-1">
        {children}
        <SortIcon active={active} dir={dir} />
      </div>
    </th>
  );
}

function SortIcon({ active, dir }: { active?: boolean; dir?: SortDir }) {
  return (
    <svg
      className={cn("h-3.5 w-3.5 text-white/50", active && "text-white/90")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      {dir === "desc" ? (
        <path strokeWidth="2" strokeLinecap="round" d="M7 10l5 5 5-5" />
      ) : (
        <path strokeWidth="2" strokeLinecap="round" d="M7 14l5-5 5 5" />
      )}
    </svg>
  );
}

/* ------------------------------ Formatters ------------------------------ */

function safeDate(ds: string): Date {
  try {
    const d = parseISO(ds);
    return Number.isNaN(d.getTime()) ? new Date(ds) : d;
  } catch {
    return new Date(ds);
  }
}

function formatDs(ds: string): string {
  const d = safeDate(ds);
  try {
    return formatDate(d, "yyyy-MM-dd");
  } catch {
    return ds;
  }
}

function fmt(n: number | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function numOrDash(n?: number): string {
  return typeof n === "number" && Number.isFinite(n) ? fmt(n) : "—";
}
