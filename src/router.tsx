import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Defaults tuned for resilience + cache reuse.
  // - staleTime 30s: avoid thrash on focus/remount while keeping data fresh enough.
  // - gcTime 5min: hold cached pages across in-app navigation.
  // - retry: skip client errors (4xx) to prevent retry storms on auth/permission failures.
  // - refetchOnWindowFocus: off (we explicitly invalidate on mutations / auth changes).
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: unknown) => {
          const status =
            error && typeof error === "object" && "status" in error
              ? Number((error as { status?: unknown }).status)
              : undefined;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
