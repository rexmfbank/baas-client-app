"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "rex-theme";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: React.PropsWithChildren<{ defaultTheme?: Theme }>) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    return (window.localStorage.getItem(STORAGE_KEY) as Theme | null) ?? defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const applyTheme = (nextTheme: Theme) => {
      const nextResolved = nextTheme === "system" ? getSystemTheme() : nextTheme;
      document.documentElement.classList.toggle("dark", nextResolved === "dark");
      setResolvedTheme(nextResolved);
    };

    applyTheme(theme);

    if (theme !== "system") {
      window.localStorage.setItem(STORAGE_KEY, theme);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme: Theme) => setThemeState(nextTheme),
    }),
    [resolvedTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
