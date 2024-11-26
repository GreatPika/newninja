/* eslint-disable no-console */
"use client";
import React from "react";
import { NextUIProvider, Button } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { signInWithGoogle } from "../utils/supabase";

import { GoogleIcon } from "@/components/icons";

export default function Page() {
  const handleGoogleSignIn = async () => {
    try {
      const { url } = await signInWithGoogle();

      window.location.href = url;
    } catch (error) {
      console.error("Ошибка при входе через Google:", error);
    }
  };

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" value={{}}>
      <NextUIProvider>
        <div className="flex items-center justify-center w-full min-h-screen nextui-theme">
          <Button
            fullWidth
            className="w-48"
            startContent={<GoogleIcon />}
            onClick={handleGoogleSignIn}
          >
            Войти через Google
          </Button>
        </div>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
