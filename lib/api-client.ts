// lib/api-client.ts
import axios, { AxiosError, AxiosInstance } from "axios";
import {
  API_BASE as PRESET_API_BASE,
  REQUEST_HEADERS,
  REQUEST_TIMEOUT_MS,
} from "./constants";
import { isApiErrorResponse, type ApiErrorResponse } from "./types";

/**
 * Resolve API base at runtime:
 *  - window.__API_BASE__ (optional override on the browser)
 *  - NEXT_PUBLIC_API_BASE (Next.js env)
 *  - PRESET_API_BASE (fallback constant)
 */
function resolveApiBase(): string {
  if (typeof window !== "undefined" && (window as any).__API_BASE__) {
    return String((window as any).__API_BASE__);
  }
  return (
    process.env.NEXT_PUBLIC_API_BASE ||
    PRESET_API_BASE
  );
}

/**
 * Create Axios instance
 */
function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      ...REQUEST_HEADERS,
      "X-Requested-With": "XMLHttpRequest",
      "X-Request-Source": "frontend-next15",
    },
    withCredentials: false,
    // Accept JSON only; rely on backend to send JSON consistently
    responseType: "json",
    // Avoid axios JSON transforming pitfalls; keep default
  });

  // Request interceptor (you can add auth token here later)
  instance.interceptors.request.use((config) => {
    // Example: attach a per-request correlation id if needed
    // config.headers["X-Correlation-Id"] = crypto.randomUUID?.() ?? Date.now().toString();
    return config;
  });

  // Response interceptor to normalize error messages from FastAPI
  instance.interceptors.response.use(
    (res) => res,
    (err: AxiosError) => {
      // Network / timeout
      if (err.code === "ECONNABORTED") {
        return Promise.reject(
          new Error("Request timeout. Please try again.")
        );
      }
      if (err.message?.includes("Network Error")) {
        return Promise.reject(
          new Error("Network error. Check your internet connection.")
        );
      }

      // HTTP errors with server response
      const data = err.response?.data as ApiErrorResponse | undefined;

      if (data && isApiErrorResponse(data) && data.detail) {
        // FastAPI detail can be string or array
        const detail = Array.isArray(data.detail) ? data.detail[0] : data.detail;
        const msg =
          typeof detail === "string"
            ? detail
            : detail?.msg ||
              (typeof detail?.type === "string" ? detail.type : null) ||
              err.response?.statusText ||
              "Request failed";
        return Promise.reject(new Error(msg));
      }

      // Fallback message
      const status = err.response?.status;
      const statusText = err.response?.statusText || "Request failed";
      return Promise.reject(
        new Error(status ? `${status} ${statusText}` : statusText)
      );
    }
  );

  return instance;
}

/** Singleton client (safe for both server and client usage) */
export const api: AxiosInstance = createClient(resolveApiBase());

/**
 * Change API base at runtime (optional).
 * Also sets window.__API_BASE__ so subsequent resolves use the new base.
 */
export function setApiBase(nextBaseUrl: string) {
  if (typeof window !== "undefined") {
    (window as any).__API_BASE__ = nextBaseUrl;
  }
  api.defaults.baseURL = nextBaseUrl;
}

/* ============================
 * Convenience JSON helpers
 * ============================ */

/**
 * GET JSON with optional query params object.
 * Example: await getJSON<MetaResponse>(ENDPOINTS.meta)
 */
export async function getJSON<T>(
  path: string,
  params?: Record<string, any>
): Promise<T> {
  const res = await api.get<T>(path, { params });
  return res.data;
}

/**
 * POST JSON body; returns typed response.
 * Example: await postJSON<PredictResponse>(ENDPOINTS.predict, body)
 */
export async function postJSON<T>(
  path: string,
  body?: any
): Promise<T> {
  const res = await api.post<T>(path, body ?? {});
  return res.data;
}

/**
 * PUT JSON body
 */
export async function putJSON<T>(
  path: string,
  body?: any
): Promise<T> {
  const res = await api.put<T>(path, body ?? {});
  return res.data;
}

/**
 * DELETE JSON with optional params/body
 */
export async function delJSON<T>(
  path: string,
  params?: Record<string, any>
): Promise<T> {
  const res = await api.delete<T>(path, { params });
  return res.data;
}
