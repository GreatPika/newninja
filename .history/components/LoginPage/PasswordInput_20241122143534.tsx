import React, { useState } from "react";
import { Input, InputProps } from "@nextui-org/react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends Omit<InputProps, "onChange"> {
  onChange: (value: string) => void;
}

export default function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <Input
      {...props}
      disableAnimation
      endContent={
        <button
          className="focus:outline-none"
          type="button"
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <EyeOff className="text-xl text-gray-500 pointer-events-none" />
          ) : (
            <Eye className="text-xl text-gray-500 pointer-events-none" />
          )}
        </button>
      }
      label={label}
      placeholder={placeholder}
      type={isVisible ? "text" : "password"}
      value={value}
      variant="underlined"
      onValueChange={onChange}
    />
  );
}
