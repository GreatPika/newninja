"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    if (theme === "system") {
      document.documentElement.className = systemTheme || "dark";
    } else {
      document.documentElement.className = theme || "dark";
    }
  }, [theme, systemTheme]);

  return <>{children}</>;
}