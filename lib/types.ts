// lib/types.ts

/**
 * =====================================================
 *  Synergy Forecast — TypeScript Interfaces for the FE
 * =====================================================
 * Sesuai API Spec (base: https://backendsynergy-production.up.railway.app)
 * - Health / Ready / Meta / Debug
 * - Predict (auto-exog, manual map, manual matrix)
 * - Chat Forecast
 * - Metrics
 * - Admin Reload
 *
 * Catatan:
 * - Beberapa response numerik bisa muncul sebagai string dari backend.
 *   Untuk itu disediakan tipe RAW dan Normalized.
 */

import type { Frequency, ExogStrategy } from "./constants";

/* ---------------------------------- Common --------------------------------- */

export type NumLike = number | `${number}` | null | undefined;

export type TrainRange = { start: string; end: string };

/** Pola error umum dari FastAPI */
export type ApiErrorDetail =
  | string
  | {
      msg?: string;
      type?: string;
      loc?: Array<string | number>;
    };

export interface ApiErrorResponse {
  detail?: ApiErrorDetail | ApiErrorDetail[];
}

/* --------------------------------- Health ---------------------------------- */

export interface HealthzResponse {
  status: "ok";
}

export interface ReadyMongoInfo {
  connected?: boolean;
  collections?: {
    train_df_count?: number;
    test_df_count?: number;
  };
}

export interface ReadyGridFSInfo {
  filename?: string;
  length?: number;
  uploadDate?: string; // ISO
}

export interface ReadyMetaInfo {
  date_col?: string;
  target_col?: string;
  exog_columns_len?: number;
  exog_from_model_len?: number;
  freq?: Frequency | string;
  train_range?: TrainRange;
  model_order?: [number, number, number];
  model_seasonal_order?: [number, number, number, number];
}

export interface ReadyConfigInfo {
  db?: string;
  bucket?: string;
  model_filename?: string;
  train_collection?: string;
  test_collection?: string;
}

export interface ReadyzResponse {
  ready: boolean;
  mongo?: ReadyMongoInfo;
  gridfs_model?: ReadyGridFSInfo;
  meta?: ReadyMetaInfo;
  config?: ReadyConfigInfo;
}

/* ----------------------------------- Meta ---------------------------------- */

export interface MetaResponse {
  model_name: string; // "sarimax"
  default_freq: Frequency | string; // "D"
  date_col: string; // "Date"
  target_col: string; // "Revenue"
  exog_columns: string[]; // used in data pipeline
  exog_columns_from_model: string[]; // raw model columns (may contain "const")
  train_range: TrainRange;
  model_order: [number, number, number];
  model_seasonal_order: [number, number, number, number];
}

/* ---------------------------------- Debug ---------------------------------- */

export interface DebugExog {
  expected_exog_from_model_raw?: string[]; // may include "const"
  expected_exog_used_by_forecast: string[]; // WITHOUT "const" — use this order on FE
  len_raw?: number;
  len_used?: number;
  freq?: Frequency | string;
  train_range?: TrainRange;
}

export interface DebugVersions {
  python?: string;
  numpy?: string;
  scipy?: string;
  pandas?: string;
  statsmodels?: string;
  pymongo?: string;
  fastapi?: string;
  pydantic?: string;
}

/* --------------------------------- Predict --------------------------------- */

/** Flags untuk auto-exogenous & display options */
export interface PredictFlags {
  use_auto_exog?: boolean; // true untuk auto mode
  exog_strategy?: ExogStrategy; // "zeros" | "smart"
  clip_non_negative?: boolean; // FE display clamp
  floor?: number; // min value (optional)
}

/** Request: Auto-exog (recommended) */
export interface PredictRequestAuto {
  horizon: number;
  frequency: Frequency | string; // "D" | "W" | "M"
  alpha?: number; // default 0.05
  flags: PredictFlags;
}

/** Request: Manual exog (map-style) */
export interface PredictRequestManualMap {
  horizon: number;
  frequency: Frequency | string;
  alpha?: number;
  exog: Record<string, number[]>;
}

/** Request: Manual exog (columns + rows) */
export interface PredictRequestManualMatrix {
  horizon: number;
  frequency: Frequency | string;
  alpha?: number;
  exog: {
    columns: string[];
    rows: Array<Array<number | null | undefined>>;
  };
}

/** Union dari semua bentuk request /api/predict */
export type PredictRequest =
  | PredictRequestAuto
  | PredictRequestManualMap
  | PredictRequestManualMatrix;

/** Titik forecast — RAW (angka bisa string/null) */
export interface ForecastPointRaw {
  ds: string; // ISO date
  yhat: NumLike;
  yhat_lower?: NumLike;
  yhat_upper?: NumLike;
}

/** Titik forecast — Normalized (angka pasti number) */
export interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower?: number;
  yhat_upper?: number;
}

export type ExogMode = "auto" | "manual" | "none";

/** Response /api/predict — RAW */
export interface PredictResponseRaw {
  model_name: string;
  generated_at: string; // ISO
  horizon: number;
  freq: Frequency | string;
  exog_mode: ExogMode;
  exog_summary?: {
    mode?: string; // "smart" | "zeros" | "manual-*"
    columns?: string[];
    [k: string]: unknown;
  };
  forecasts: ForecastPointRaw[];
  warnings?: string[];
}

/** Response /api/predict — Normalized (sesudah parsing angka) */
export interface PredictResponse extends Omit<PredictResponseRaw, "forecasts"> {
  forecasts: ForecastPoint[];
}

/* ------------------------------- Chat Forecast ----------------------------- */

export interface ChatForecastRequest {
  message: string; // e.g., "forecast 15 hari smart exog tanpa minus floor=0"
  alpha?: number;
}

export type ChatForecastResponseRaw = PredictResponseRaw;
export type ChatForecastResponse = PredictResponse;

/* ---------------------------------- Metrics -------------------------------- */

export interface MetricsSummary {
  mae: number;
  rmse: number;
  mape: number; // 0..1
  smape: number; // 0..1
  bias_me: number;
  coverage_95: number; // 0..1
}

export interface MetricsByPeriodRow {
  ds: string; // ISO date
  y?: number;
  yhat?: number;
  lower?: number;
  upper?: number;
  abs_err?: number;
}

export interface MetricsResponse {
  eval_window: { start: string; end: string; n: number };
  metrics: MetricsSummary | null; // null jika window kosong
  by_period: MetricsByPeriodRow[];
  exog_info?: {
    expected?: string[];
    missing_in_test?: string[];
    used_columns?: string[];
  };
  warnings?: string[];
}

/* ---------------------------------- Admin ---------------------------------- */

export interface AdminReloadResponse {
  reloaded: boolean;
  gridfs_model?: ReadyGridFSInfo;
}

/* ---------------------------- Helper / Narrowing --------------------------- */

/** Type guard: cek apakah respons memiliki `detail` (error FastAPI) */
export function isApiErrorResponse(x: unknown): x is ApiErrorResponse {
  return Boolean(x && typeof x === "object" && "detail" in (x as any));
}
