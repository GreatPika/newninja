import React from "react";
import { Button } from "@nextui-org/react";

import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";

import { useAuthForm } from "@/components/LoginPage/useAuthForm";

export default function RegisterForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    handleSubmit,
  } = useAuthForm({ isLogin: false });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <EmailInput placeholder="Почта" value={email} onChange={setEmail} />
      <PasswordInput
        placeholder="Пароль"
        value={password}
        onChange={setPassword}
      />
      <PasswordInput
        placeholder="Подтверждение пароля"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />
      {error && <p className="text-xs text-danger text-center">{error}</p>}
      <Button className="mt-4" color="primary" radius="lg" type="submit">
        Зарегистрироваться
      </Button>
    </form>
  );
}
