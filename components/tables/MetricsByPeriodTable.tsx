"use client";

import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import Button from "@/components/ui/Button";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type ByPeriodPoint = {
  ds: string;          // date (ISO)
  y: number;           // actual
  yhat: number;        // prediction
  lower?: number;      // interval lower
  upper?: number;      // interval upper
  abs_err?: number;    // absolute error (optional from API)
};

type SortKey = "ds" | "y" | "yhat" | "lower" | "upper" | "abs_err" | "residual";
type SortDir = "asc" | "desc";

export type MetricsByPeriodTableProps = {
  data: ByPeriodPoint[];
  loading?: boolean;
  pageSize?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  /** Add computed residual (y − yhat) column */
  showResidual?: boolean;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function MetricsByPeriodTable({
  data,
  loading,
  pageSize = 20,
  title = "Metrics — By Period",
  subtitle = "Actual vs Predicted with per-period errors",
  className,
  showResidual = true,
}: MetricsByPeriodTableProps) {
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(pageSize);
  const [page, setPage] = React.useState<number>(0);
  const [sortKey, setSortKey] = React.useState<SortKey>("ds");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  React.useEffect(() => {
    setPage(0);
  }, [rowsPerPage, sortKey, sortDir]);

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg", className)}>
        <div className="mb-4 flex items-center justify-between">
          <div className="h-5 w-48 skeleton rounded" />
          <div className="h-8 w-24 skeleton rounded-xl" />
        </div>
        <div className="h-[320px] w-full skeleton rounded-xl" />
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70", className)}>
        No rows. Run evaluation to populate the table.
      </div>
    );
  }

  const enriched = data.map((r) => ({
    ...r,
    residual: (r.y ?? 0) - (r.yhat ?? 0),
    abs_err_calc: typeof r.abs_err === "number" ? r.abs_err : Math.abs((r.y ?? 0) - (r.yhat ?? 0)),
  }));

  const sorted = [...enriched].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "ds": {
        // Sort by date string safely
        const ta = Date.parse(a.ds);
        const tb = Date.parse(b.ds);
        const na = Number.isFinite(ta) ? ta : 0;
        const nb = Number.isFinite(tb) ? tb : 0;
        return (na - nb) * dir;
      }
      case "y":      return ((a.y ?? 0)        - (b.y ?? 0))        * dir;
      case "yhat":   return ((a.yhat ?? 0)     - (b.yhat ?? 0))     * dir;
      case "lower":  return ((a.lower ?? 0)    - (b.lower ?? 0))    * dir;
      case "upper":  return ((a.upper ?? 0)    - (b.upper ?? 0))    * dir;
      case "abs_err":return ((a.abs_err_calc)  - (b.abs_err_calc))  * dir;
      case "residual":return ((a.residual)     - (b.residual))      * dir;
      default:       return 0;
    }
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
            onClick={() => exportMetricsCSV(sorted)}
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
              {[10, 20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="min-w-[760px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white/10 backdrop-blur">
            <tr>
              <Th active={sortKey === "ds"} dir={sortKey === "ds" ? sortDir : undefined} onClick={() => handleSort("ds")}>
                Date (ds)
              </Th>
              <Th active={sortKey === "y"} dir={sortKey === "y" ? sortDir : undefined} onClick={() => handleSort("y")} className="text-right">
                Actual (y)
              </Th>
              <Th active={sortKey === "yhat"} dir={sortKey === "yhat" ? sortDir : undefined} onClick={() => handleSort("yhat")} className="text-right">
                Pred (yhat)
              </Th>
              <Th active={sortKey === "lower"} dir={sortKey === "lower" ? sortDir : undefined} onClick={() => handleSort("lower")} className="text-right">
                Lower
              </Th>
              <Th active={sortKey === "upper"} dir={sortKey === "upper" ? sortDir : undefined} onClick={() => handleSort("upper")} className="text-right">
                Upper
              </Th>
              {showResidual && (
                <Th
                  active={sortKey === "residual"}
                  dir={sortKey === "residual" ? sortDir : undefined}
                  onClick={() => handleSort("residual")}
                  className="text-right"
                >
                  Residual
                </Th>
              )}
              <Th active={sortKey === "abs_err"} dir={sortKey === "abs_err" ? sortDir : undefined} onClick={() => handleSort("abs_err")} className="text-right">
                |Error|
              </Th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={`${r.ds}-${i}`} className="even:bg-white/5">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-white/80">{formatDateISO(r.ds)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.y)}</td>
                <td className="px-3 py-2 text-right">{fmt(r.yhat)}</td>
                <td className="px-3 py-2 text-right">{numOrDash(r.lower)}</td>
                <td className="px-3 py-2 text-right">{numOrDash(r.upper)}</td>
                {showResidual && <td className="px-3 py-2 text-right">{fmt(((r.y ?? 0) - (r.yhat ?? 0)))}</td>}
                <td className="px-3 py-2 text-right">{fmtAbs(typeof r.abs_err === "number" ? r.abs_err : Math.abs((r.y ?? 0) - (r.yhat ?? 0)))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          Showing <span className="text-white/80">{start + 1}</span>–
          <span className="text-white/80">{Math.min(end, sorted.length)}</span> of{" "}
          <span className="text-white/80">{sorted.length}</span>
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

/* ------------------------------------------------------------------ */
/* Subcomponents                                                       */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function fmtAbs(n: number | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  const v = Math.abs(n);
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(v);
}

function numOrDash(n?: number): string {
  return typeof n === "number" && Number.isFinite(n) ? fmt(n) : "—";
}

function formatDateISO(ds: string): string {
  // Keep simple ISO-like format; avoid extra deps
  const t = Date.parse(ds);
  if (!Number.isFinite(t)) return ds;
  const d = new Date(t);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function exportMetricsCSV(rows: Array<ByPeriodPoint & { residual: number; abs_err_calc: number }>) {
  const header = ["ds", "y", "yhat", "lower", "upper", "residual", "abs_err"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        safeCSV(r.ds),
        num(r.y),
        num(r.yhat),
        num(r.lower),
        num(r.upper),
        num(r.residual),
        num(r.abs_err ?? r.abs_err_calc),
      ].join(",")
    ),
  ];
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `metrics_by_period_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeCSV(s: string): string {
  // Wrap in quotes if needed
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function num(n: number | undefined): string {
  return typeof n === "number" && Number.isFinite(n) ? String(n) : "";
}
