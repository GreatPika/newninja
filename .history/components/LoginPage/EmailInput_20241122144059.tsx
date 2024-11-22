import React, { useState } from "react";
import { Input, InputProps } from "@nextui-org/react";

interface EmailInputProps extends Omit<InputProps, "onChange"> {
  onChange: (value: string) => void;
}

export default function EmailInput({
  label,
  placeholder,
  value,
  onChange,
  ...props
}: EmailInputProps) {
  const [isInvalid, setIsInvalid] = useState(false);

  const validateEmail = (email: string) =>
    email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);

  const handleBlur = () => {
    if (value === "" || value === undefined) {
      setIsInvalid(false);
    } else {
      setIsInvalid(!validateEmail(String(value)));
    }
  };

  return (
    <Input
      {...props}
      disableAnimation
      color={isInvalid ? "danger" : "default"}
      errorMessage={
        isInvalid ? "Пожалуйста, введите корректный адрес почты" : ""
      }
      isInvalid={isInvalid}
      placeholder={placeholder}
      type="email"
      value={value}
      variant="underlined"
      onBlur={handleBlur}
      onValueChange={onChange}
    />
  );
}
