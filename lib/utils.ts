// lib/utils.ts
import { format as formatDateFns, parseISO, isValid as isValidDate } from "date-fns";
import { API_DATE_FMT } from "./constants";
import type {
  NumLike,
  ForecastPointRaw,
  ForecastPoint,
  PredictResponseRaw,
  PredictResponse,
} from "./types";

/* ============================================================
 * Numbers & Normalization
 * ========================================================== */

/** Convert possible string/nullable numeric into number (undefined if NaN). */
export function toNumber(v: NumLike): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Strict numeric: fallback to 0 when undefined/NaN. */
export function toNumberStrict(v: NumLike, fallback = 0): number {
  const n = toNumber(v);
  return typeof n === "number" ? n : fallback;
}

/** Normalize array of forecast points from RAW → numbers guaranteed. */
export function normalizeForecastPoints(raw: ForecastPointRaw[]): ForecastPoint[] {
  return (raw ?? []).map((p) => ({
    ds: p.ds,
    yhat: toNumberStrict(p.yhat, 0),
    yhat_lower: toNumber(p.yhat_lower),
    yhat_upper: toNumber(p.yhat_upper),
  }));
}

/** Normalize /api/predict RAW response → normalized (numbers). */
export function normalizePredictResponse(r: PredictResponseRaw): PredictResponse {
  return {
    ...r,
    forecasts: normalizeForecastPoints(r.forecasts),
  };
}

/** Back-compat helper: extract normalized points from RAW response. */
export function normalizeForecast(r: PredictResponseRaw): ForecastPoint[] {
  return normalizeForecastPoints(r.forecasts);
}

/* ============================================================
 * Dates & Formatting
 * ========================================================== */

/** Parse date from ISO string or Date; returns Date (may be invalid). */
export function parseDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  const d = parseISO(input);
  // fallback attempt for non-ISO strings
  return isValidDate(d) ? d : new Date(input);
}

/** Format date to API format by default ("yyyy-MM-dd"). */
export function formatDate(date: Date | string, fmt: string = API_DATE_FMT): string {
  const d = parseDate(date);
  return isValidDate(d) ? formatDateFns(d, fmt) : String(date);
}

/** Build query params object for /api/metrics. */
export function buildMetricsParams(args: {
  start: Date | string;
  end: Date | string;
  alpha?: number;
}) {
  const out: Record<string, string | number> = {
    eval_start: formatDate(args.start, API_DATE_FMT),
    eval_end: formatDate(args.end, API_DATE_FMT),
  };
  if (typeof args.alpha === "number") out.alpha = args.alpha;
  return out;
}

/* ============================================================
 * Chart helpers
 * ========================================================== */

/** Augment points with actual Date object for chart libs that prefer Date. */
export function toChartData(points: ForecastPoint[]) {
  return (points ?? []).map((p) => ({ ...p, date: parseDate(p.ds) }));
}

/* ============================================================
 * Clipping & Value Guards
 * ========================================================== */

/** Apply UI-level clipping (non-negative / floor) to forecast points. */
export function applyClip(
  points: ForecastPoint[],
  opts?: { clipNonNegative?: boolean; floor?: number }
): ForecastPoint[] {
  const clipNN = Boolean(opts?.clipNonNegative);
  const hasFloor = typeof opts?.floor === "number";
  const floor = hasFloor ? (opts!.floor as number) : undefined;

  const clamp = (x?: number): number | undefined => {
    if (x === undefined) return undefined;
    let y = x;
    if (clipNN && y < 0) y = 0;
    if (hasFloor && y < (floor as number)) y = floor as number;
    return y;
  };

  return (points ?? []).map((p) => ({
    ...p,
    yhat: clamp(p.yhat)!,
    yhat_lower: clamp(p.yhat_lower),
    yhat_upper: clamp(p.yhat_upper),
  }));
}

/* ============================================================
 * Stable stringify & hashing (for cache keys, etc.)
 * ========================================================== */

/** Stable stringify (sorts object keys; handles arrays; avoids cycles). */
export function stableStringify(value: any): string {
  const seen = new WeakSet();
  const sorter = (val: any): any => {
    if (!val || typeof val !== "object") return val;
    if (seen.has(val)) return undefined;
    seen.add(val);

    if (Array.isArray(val)) return val.map(sorter);

    const out: Record<string, any> = {};
    for (const k of Object.keys(val).sort()) {
      out[k] = sorter(val[k]);
    }
    return out;
  };
  return JSON.stringify(sorter(value));
}

/** Small, fast string hash (djb2 xor variant) → hex string. */
export function hashString(s: string): string {
  let h = 5381 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

/** Hash any JSON-serializable object using stable stringify. */
export function hashObject(obj: any): string {
  return hashString(stableStringify(obj));
}

/* ============================================================
 * CSV & Download helpers (CSR only)
 * ========================================================== */

/** Convert array of objects to CSV string (with safe quoting). */
export function toCSV(rows: Array<Record<string, any>>, delimiter = ","): string {
  if (!Array.isArray(rows) || rows.length === 0) return "";

  // Collect all columns (maintain insertion order & uniqueness)
  const headerSet = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => headerSet.add(k)));
  const headers = Array.from(headerSet);

  const esc = (val: any) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    // escape if contains comma, quote, or newline
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [headers.join(delimiter)];
  for (const r of rows) {
    lines.push(headers.map((h) => esc(r[h])).join(delimiter));
  }
  return lines.join("\n");
}

/** Trigger a download in the browser (no-op on server). */
export function downloadFile(filename: string, content: string, mime = "text/plain") {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
}

/** Export forecast points to CSV and download. */
export function exportForecastCSV(points: ForecastPoint[], filename = "forecast.csv") {
  const rows = (points ?? []).map((p) => ({
    ds: p.ds,
    yhat: p.yhat,
    yhat_lower: p.yhat_lower ?? "",
    yhat_upper: p.yhat_upper ?? "",
  }));
  const csv = toCSV(rows);
  if (csv) downloadFile(filename, csv, "text/csv");
}

/* ============================================================
 * Misc guards & error helpers
 * ========================================================== */

export function isNonEmptyArray<T = unknown>(x: any): x is T[] {
  return Array.isArray(x) && x.length > 0;
}

export function isFiniteNumber(x: any): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

/** Normalize any error-like into readable string. */
export function getErrorMessage(err: unknown, fallback = "Request failed"): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || fallback;
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}
