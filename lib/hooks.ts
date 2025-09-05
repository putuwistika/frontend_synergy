"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import {
  ENDPOINTS,
  QUERY_KEYS,
  DEFAULTS,
} from "./constants";
import {
  getJSON,
  postJSON,
} from "./api-client";
import {
  normalizePredictResponse,
  buildMetricsParams,
  hashObject,
  getErrorMessage,
} from "./utils";

import type {
  HealthzResponse,
  ReadyzResponse,
  MetaResponse,
  DebugExog,
  DebugVersions,
  PredictRequest,
  PredictResponseRaw,
  PredictResponse,
  ChatForecastRequest,
  ChatForecastResponseRaw,
  ChatForecastResponse,
  MetricsResponse,
  AdminReloadResponse,
} from "./types";

/* ========================================================================
 * Health & Info
 * ===================================================================== */

export function useHealthz(): UseQueryResult<HealthzResponse, Error> {
  return useQuery({
    queryKey: ["healthz"],
    queryFn: () => getJSON<HealthzResponse>(ENDPOINTS.healthz),
    staleTime: 30_000,
  });
}

export function useReadyz(): UseQueryResult<ReadyzResponse, Error> {
  return useQuery({
    queryKey: ["readyz"],
    queryFn: () => getJSON<ReadyzResponse>(ENDPOINTS.readyz),
    staleTime: 15_000,
  });
}

export function useMeta(): UseQueryResult<MetaResponse, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.meta,
    queryFn: () => getJSON<MetaResponse>(ENDPOINTS.meta),
    staleTime: 60_000,
  });
}

export function useDebugExog(): UseQueryResult<DebugExog, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.debugExog,
    queryFn: () => getJSON<DebugExog>(ENDPOINTS.debugExog),
    staleTime: 60 * 60_000, // 1 hour
  });
}

export function useDebugVersions(): UseQueryResult<DebugVersions, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.versions,
    queryFn: () => getJSON<DebugVersions>(ENDPOINTS.debugVersions),
    staleTime: 10 * 60_000,
  });
}

/* ========================================================================
 * Predict & Chat Forecast (normalized)
 * ===================================================================== */

type PredictInput = PredictRequest;

/**
 * Ensure sensible defaults for auto-exog when user doesn't provide flags/exog.
 * - If body has no `exog`, enforce auto mode ("smart" + clip ≥ 0 by default).
 */
function withPredictDefaults(input: PredictInput): PredictInput {
  const hasExog =
    typeof (input as any).exog !== "undefined" && (input as any).exog !== null;

  if (!hasExog) {
    const alpha =
      typeof (input as any).alpha === "number" ? (input as any).alpha : DEFAULTS.alpha;
    const frequency = (input as any).frequency ?? DEFAULTS.frequency;
    const horizon = (input as any).horizon ?? DEFAULTS.horizon;

    return {
      horizon,
      frequency,
      alpha,
      flags: {
        use_auto_exog: true,
        exog_strategy:
          (input as any).flags?.exog_strategy ?? DEFAULTS.exogStrategy,
        clip_non_negative:
          (input as any).flags?.clip_non_negative ?? DEFAULTS.clipNonNegative,
        floor: (input as any).flags?.floor ?? DEFAULTS.floor,
      },
    } as PredictInput;
  }

  return input;
}

/** POST /api/predict -> normalized response */
export function usePredict(): UseMutationResult<
  PredictResponse,
  Error,
  PredictInput
> {
  return useMutation({
    mutationKey: ["predict"],
    mutationFn: async (input: PredictInput) => {
      try {
        const body = withPredictDefaults(input);
        const raw = await postJSON<PredictResponseRaw>(ENDPOINTS.predict, body);
        return normalizePredictResponse(raw);
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
  });
}

/** POST /api/chat/forecast -> normalized response */
export function useChatForecast(): UseMutationResult<
  ChatForecastResponse,
  Error,
  ChatForecastRequest
> {
  return useMutation({
    mutationKey: ["chat-forecast"],
    mutationFn: async (input: ChatForecastRequest) => {
      try {
        const raw = await postJSON<ChatForecastResponseRaw>(
          ENDPOINTS.chatForecast,
          input
        );
        return normalizePredictResponse(raw);
      } catch (err) {
        throw new Error(getErrorMessage(err));
      }
    },
  });
}

/* ========================================================================
 * Metrics
 * ===================================================================== */

export function useMetrics(args: {
  start?: Date | string;
  end?: Date | string;
  alpha?: number;
}): UseQueryResult<MetricsResponse, Error> {
  const enabled = Boolean(args.start && args.end);

  return useQuery({
    queryKey: QUERY_KEYS.metrics({
      start: String(args.start ?? ""),
      end: String(args.end ?? ""),
      alpha: args.alpha,
    }),
    queryFn: async () => {
      const params = buildMetricsParams({
        start: args.start!,
        end: args.end!,
        alpha: args.alpha,
      });
      return await getJSON<MetricsResponse>(ENDPOINTS.metrics, params);
    },
    enabled,
    staleTime: 30_000,
    // Keep old data while refetching
    placeholderData: (prev) => prev,
  });
}

/* ========================================================================
 * Admin / Ops
 * ===================================================================== */

export function useAdminReload(): UseMutationResult<
  AdminReloadResponse,
  Error,
  void
> {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["admin-reload"],
    mutationFn: async () => {
      return await postJSON<AdminReloadResponse>(ENDPOINTS.adminReload, {});
    },
    onSuccess: () => {
      // Refresh caches that might depend on model
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meta });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.debugExog });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.versions });
    },
  });
}

/* ========================================================================
 * Convenience helpers
 * ===================================================================== */

/** Helper to hash any predict body for cache keys elsewhere (if needed). */
export function hashPredictBody(body: PredictInput) {
  return hashObject(withPredictDefaults(body));
}

/** Helper to hash chat message for cache keys elsewhere (if needed). */
export function hashChatMessage(input: ChatForecastRequest) {
  return hashObject(input);
}
