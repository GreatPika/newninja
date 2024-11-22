import React from "react";
import { Button } from "@nextui-org/react";

import { useAuthForm } from "@/components/LoginPage/useAuthForm";

import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {
  const { email, setEmail, password, setPassword, error, handleSubmit } =
    useAuthForm({ isLogin: true });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <EmailInput label="Почта" value={email} onChange={setEmail} />
      <PasswordInput label="Пароль" value={password} onChange={setPassword} />
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
