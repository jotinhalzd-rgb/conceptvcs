import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

const PREVIOUS_ROUTE_KEY = "previousInternalRoute";
const CURRENT_ROUTE_KEY = "currentInternalRoute";
const DEFAULT_FALLBACK = "/dashboard";

const AUTH_ROUTES = ["/auth", "/login", "/register", "/reset-password"];
const HIDDEN_BACK_ROUTES = new Set(["/", "/dashboard", "/dashboard/"]);
const KNOWN_INTERNAL_PREFIXES = [
  "/dashboard",
  "/queues",
  "/inbox",
  "/customers",
  "/crm",
  "/reports",
  "/campaigns",
  "/knowledge",
  "/supervisor",
  "/opportunities",
  "/admin",
  "/settings",
];

function normalizeRoute(route?: string | null) {
  if (!route) return null;

  try {
    const url = route.startsWith("http")
      ? new URL(route)
      : new URL(route, typeof window !== "undefined" ? window.location.origin : "http://localhost");

    const normalizedPath = url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : url.pathname;
    return `${normalizedPath}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function routePath(route: string) {
  return normalizeRoute(route)?.split(/[?#]/)[0] ?? route;
}

function isAuthRoute(route: string) {
  const path = routePath(route);
  return AUTH_ROUTES.some((authRoute) => path === authRoute || path.startsWith(`${authRoute}/`));
}

function isKnownInternalRoute(route: string) {
  const normalized = normalizeRoute(route);
  if (!normalized || !normalized.startsWith("/")) return false;
  if (normalized.startsWith("//") || isAuthRoute(normalized)) return false;

  const path = routePath(normalized);
  return path === "/" || KNOWN_INTERNAL_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function isSafeBackTarget(route: string | null, currentRoute: string) {
  if (!route) return false;

  const normalizedTarget = normalizeRoute(route);
  const normalizedCurrent = normalizeRoute(currentRoute);

  if (!normalizedTarget || !normalizedCurrent) return false;
  if (normalizedTarget === normalizedCurrent) return false;
  if (!isKnownInternalRoute(normalizedTarget)) return false;
  if (isAuthRoute(normalizedTarget)) return false;

  return true;
}

function getFallbackForRoute(route: string, fallback?: string) {
  const normalizedFallback = normalizeRoute(fallback);
  if (normalizedFallback && isKnownInternalRoute(normalizedFallback) && !isAuthRoute(normalizedFallback)) {
    return normalizedFallback;
  }

  return DEFAULT_FALLBACK;
}

function readStoredRoute(key: string) {
  if (typeof window === "undefined") return null;
  return normalizeRoute(window.sessionStorage.getItem(key));
}

export function useSmartBackNavigation(options: { fallback?: string } = {}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentRoute = normalizeRoute(pathname) ?? DEFAULT_FALLBACK;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextRoute = normalizeRoute(pathname);
    if (!nextRoute) return;

    if (isAuthRoute(nextRoute)) {
      window.sessionStorage.removeItem(PREVIOUS_ROUTE_KEY);
      window.sessionStorage.removeItem(CURRENT_ROUTE_KEY);
      return;
    }

    if (!isKnownInternalRoute(nextRoute)) return;

    const storedCurrent = readStoredRoute(CURRENT_ROUTE_KEY);
    const isFirstPageLoad = !window.__oneContactRouteTrackerReady;

    window.__oneContactRouteTrackerReady = true;

    if (isFirstPageLoad) {
      window.sessionStorage.removeItem(PREVIOUS_ROUTE_KEY);
      window.sessionStorage.setItem(CURRENT_ROUTE_KEY, nextRoute);
      return;
    }

    if (storedCurrent === nextRoute) return;

    if (isSafeBackTarget(storedCurrent, nextRoute)) {
      window.sessionStorage.setItem(PREVIOUS_ROUTE_KEY, storedCurrent!);
    } else {
      window.sessionStorage.removeItem(PREVIOUS_ROUTE_KEY);
    }

    window.sessionStorage.setItem(CURRENT_ROUTE_KEY, nextRoute);
  }, [pathname]);

  const fallbackRoute = useMemo(
    () => getFallbackForRoute(currentRoute, options.fallback),
    [currentRoute, options.fallback],
  );

  const goBack = useCallback(
    (overrideFallback?: string) => {
      const safeFallback = getFallbackForRoute(currentRoute, overrideFallback ?? options.fallback);
      const previousRoute = readStoredRoute(PREVIOUS_ROUTE_KEY);
      const target = isSafeBackTarget(previousRoute, currentRoute) ? previousRoute! : safeFallback;

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(PREVIOUS_ROUTE_KEY);
      }

      navigate({ to: target as any });
    },
    [currentRoute, navigate, options.fallback],
  );

  return {
    goBack,
    fallbackRoute,
    previousInternalRoute: readStoredRoute(PREVIOUS_ROUTE_KEY),
    currentInternalRoute: currentRoute,
    shouldShowBackButton: !HIDDEN_BACK_ROUTES.has(currentRoute) && !isAuthRoute(currentRoute),
  };
}

declare global {
  interface Window {
    __oneContactRouteTrackerReady?: boolean;
  }
}