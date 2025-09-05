"use client";

import { PropsWithChildren, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/**
 * Global React Query provider
 * - Stable QueryClient instance via useState initializer
 * - Sensible defaults (no refetch on window focus, short retries)
 * - Console error logging for queries/mutations (optional but helpful)
 */
export default function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Avoid noisy logs for intentional errors
            if (process.env.NODE_ENV !== "production") {
              // eslint-disable-next-line no-console
              console.error("[RQ][Query Error]", query?.queryKey, error);
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (process.env.NODE_ENV !== "production") {
              // eslint-disable-next-line no-console
              console.error("[RQ][Mutation Error]", mutation?.options?.mutationKey, error);
            }
          },
        }),
        defaultOptions: {
          queries: {
            /**
             * v5 options:
             * - gcTime replaces cacheTime
             */
            staleTime: 30_000,           // 30s fresh
            gcTime: 5 * 60_000,          // 5 min garbage collect
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
            // keepPreviousData can smooth pagination/switching
            placeholderData: undefined,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
