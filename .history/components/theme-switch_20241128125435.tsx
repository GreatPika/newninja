"use client";

import { FC } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useSwitch } from "@nextui-org/switch";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
}) => {
  const { theme, setTheme } = useTheme();

  const {
    Component,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: theme === "light",
    "aria-label": `Switch to ${theme === "light" ? "dark" : "light"} mode`,
    onChange: () => theme === "light" ? setTheme("dark") : setTheme("light"),
  });

  return (
    <Component
      {...getBaseProps({
        className: "px-0 cursor-pointer",
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className="w-auto h-auto bg-transparent rounded-lg flex items-center justify-center p-2 hover:bg-default-100"
      >
        {theme === "light" ? <Sun size={22} /> : <Moon size={22} />}
      </div>
    </Component>
  );
};
