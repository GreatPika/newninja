/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { signIn, signUp } from "@/utils/supabase";

interface UseAuthFormProps {
  isLogin: boolean;
}

export const useAuthForm = ({ isLogin }: UseAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Пароли не совпадают");

      return;
    }

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const { data, error: signUpError } = await signUp(email, password);

        if (signUpError?.message?.includes("User already registered")) {
          setError("Пользователь с такой почтой уже зарегистрирован");

          return;
        }
      }
      router.push("/chat");
    } catch (err: any) {
      setError(
        isLogin
          ? "Ошибка входа. Проверьте адрес и пароль."
          : "Ошибка регистрации. Попробуйте позже.",
      );
      console.error("Auth error:", err);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    handleSubmit,
  };
};
