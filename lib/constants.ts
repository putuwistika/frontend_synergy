// lib/constants.ts

/**
 * =========================
 *  Synergy Forecast — Constants
 * =========================
 * - Centralized constants for API base, endpoints, defaults, and keys.
 * - Safe to import on both server and client (SSR/CSR).
 */

/** Runtime guards */
export const IS_BROWSER = typeof window !== "undefined";
export const IS_PROD = process.env.NODE_ENV === "production";

/** Default API base if env is missing (can be overridden by NEXT_PUBLIC_API_BASE) */
export const DEFAULT_API_BASE =
  "https://backendsynergy-production.up.railway.app";

/**
 * Resolve API base:
 * 1) window.__API_BASE__ (for on-the-fly override in the browser)
 * 2) process.env.NEXT_PUBLIC_API_BASE (preferred in Next.js)
 * 3) DEFAULT_API_BASE (sensible fallback)
 */
export const API_BASE: string = (() => {
  const fromWindow =
    IS_BROWSER && (window as any).__API_BASE__
      ? String((window as any).__API_BASE__)
      : undefined;

  return (
    fromWindow ||
    process.env.NEXT_PUBLIC_API_BASE ||
    DEFAULT_API_BASE
  );
})();

/** API endpoints — relative paths (joined with API_BASE by the HTTP client) */
export const ENDPOINTS = {
  healthz: "/api/healthz",
  readyz: "/api/readyz",
  meta: "/api/meta",

  // Debug
  debugExog: "/api/debug/exog",
  debugVersions: "/api/debug/versions",

  // Forecast
  predict: "/api/predict",
  chatForecast: "/api/chat/forecast",

  // Evaluation
  metrics: "/api/metrics",

  // Admin/ops
  adminReload: "/api/admin/reload",
} as const;

/** Standard headers for JSON requests */
export const REQUEST_HEADERS = {
  "Content-Type": "application/json",
} as const;

/** Network timeout for API requests (ms) */
export const REQUEST_TIMEOUT_MS = 30_000;

/** Supported frequency values (backend expects these) */
export type Frequency = "D" | "W" | "M";

/** Exogenous variable strategies for auto-exog */
export type ExogStrategy = "zeros" | "smart";

/** Defaults used across UI when user hasn't specified */
export const DEFAULTS = {
  horizon: 14,                  // days
  frequency: "D" as Frequency,  // Daily
  alpha: 0.05,                  // 95% CI
  exogStrategy: "smart" as ExogStrategy,
  clipNonNegative: true,
  floor: 0,
};

/** Date format used in API query params (date-fns tokens) */
export const API_DATE_FMT = "yyyy-MM-dd";

/** React Query keys (keep in sync with lib/hooks.ts) */
export const QUERY_KEYS = {
  meta: ["meta"] as const,
  debugExog: ["debug-exog"] as const,
  versions: ["debug-versions"] as const,
  predict: (bodyHash: string) => ["predict", bodyHash] as const,
  chatForecast: (messageHash: string) =>
    ["chat-forecast", messageHash] as const,
  metrics: (params: { start: string; end: string; alpha?: number }) =>
    ["metrics", params] as const,
};

/** Common HTTP status references (optional) */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNPROCESSABLE: 422,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
} as const;

/** Human-friendly error tips mapped to common backend errors (optional) */
export const ERROR_HINTS: Record<string, string> = {
  SHAPE_MISMATCH:
    "Exogenous shape mismatch. Pastikan urutan kolom mengikuti /api/debug/exog dan panjang baris = horizon.",
  MISSING_EXOG:
    "Model memerlukan exogenous variables. Gunakan auto-exog (zeros/smart) atau isi manual exog.",
  WINDOW_EMPTY:
    "Window evaluasi kosong. Coba ubah rentang tanggal (eval_start / eval_end).",
};
