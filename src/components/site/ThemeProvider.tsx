"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

type Theme = "dark" | "light";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void };
const themeEvent = "nghieng:theme-changed";

const ThemeContext = createContext<ThemeContextValue>({ theme: "dark", toggleTheme: () => undefined });

function getTheme(): Theme {
  const stored = window.localStorage.getItem("nghieng-theme");
  return stored === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  window.addEventListener(themeEvent, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(themeEvent, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, () => "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme: () => {
      const next = getTheme() === "dark" ? "light" : "dark";
      window.localStorage.setItem("nghieng-theme", next);
      document.documentElement.dataset.theme = next;
      window.dispatchEvent(new Event(themeEvent));
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useSiteTheme() {
  return useContext(ThemeContext);
}
