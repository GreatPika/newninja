import { useEffect } from "react";
import { useTheme } from "next-themes";

export function useThemeManager() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme) {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);
} 