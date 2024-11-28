"use client";

import { FC } from "react";
import { Button } from "@nextui-org/button";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
  };

  return (
    <Button
      isIconOnly
      className={className}
      radius="lg"
      variant="light"
      onClick={toggleTheme}
    >
      {theme === "light" ? <Sun size={22} /> : <Moon size={22} />}
    </Button>
  );
};
