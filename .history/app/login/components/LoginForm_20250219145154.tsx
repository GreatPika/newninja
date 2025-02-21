import React from "react";
import { Button } from "@nextui-org/react";

import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";

import { useAuthForm } from "@/app/login/useAuthForm";

export default function LoginForm() {
  const { email, setEmail, password, setPassword, error, handleSubmit } =
    useAuthForm({ isLogin: true });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <EmailInput
        disableAnimation
        placeholder="Почта"
        value={email}
        onChange={setEmail}
      />
      <PasswordInput
        disableAnimation
        placeholder="Пароль"
        value={password}
        onChange={setPassword}
      />
      {error && <p className="text-xs text-danger text-center">{error}</p>}
      <Button
        className="mt-4"
        color="primary"
        radius="lg"
        size="md"
        type="submit"
      >
        Войти
      </Button>
    </form>
  );
}
