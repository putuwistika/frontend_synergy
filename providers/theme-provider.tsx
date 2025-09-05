"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type ThemeSetting = "light" | "dark" | "system";

type ThemeContextValue = {
  /**
   * The persisted theme preference: "light" | "dark" | "system"
   */
  theme: ThemeSetting;
  /**
   * The actual applied theme considering system preference when theme === "system"
   */
  resolvedTheme: "light" | "dark";
  /**
   * Set theme preference (also persisted to localStorage)
   */
  setTheme: (next: ThemeSetting) => void;
  /**
   * Toggle between light and dark (keeps "system" if that's the current preference)
   */
  toggle: () => void;
};

const ThemeCtx = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme";

/**
 * Read saved theme from localStorage (on client only).
 */
function getSavedTheme(): ThemeSetting | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = raw.toLowerCase();
    if (v === "light" || v === "dark" || v === "system") return v as ThemeSetting;
    return null;
  } catch {
    return null;
  }
}

/**
 * Detect system prefers-dark in a safe way.
 */
function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Apply the resolved theme to <html> element.
 */
function applyThemeClass(isDark: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  // Optional: reflect data attribute for styling hooks
  root.setAttribute("data-theme", isDark ? "dark" : "light");
}

export default function ThemeProvider({ children }: PropsWithChildren) {
  // Initial preference: defer to saved or "system"
  const [theme, setThemeState] = useState<ThemeSetting>("system");
  const [systemDark, setSystemDark] = useState<boolean>(false);

  // Initialize on mount
  useEffect(() => {
    const saved = getSavedTheme();
    const sys = getSystemPrefersDark();
    setThemeState(saved ?? "system");
    setSystemDark(sys);
    applyThemeClass(saved === "dark" || (saved === "system" && sys));

    // Listen to system changes
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  // Compute resolved theme
  const resolvedTheme: "light" | "dark" = useMemo(() => {
    if (theme === "system") return systemDark ? "dark" : "light";
    return theme;
  }, [theme, systemDark]);

  // Keep DOM class in sync when either preference or system changes
  useEffect(() => {
    applyThemeClass(resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setTheme = useCallback((next: ThemeSetting) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore storage errors */
    }
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    // If currently "system", toggle the resolved value but keep explicit light/dark
    if (theme === "system") {
      setTheme(systemDark ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  }, [setTheme, systemDark, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

/**
 * Hook to access theme context anywhere in the app.
 */
export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider />");
  }
  return ctx;
}
