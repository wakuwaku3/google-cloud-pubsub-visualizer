import React from "react";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";
import { GoogleIcon } from "@/components/icon";
import "./GoogleAuthButton.css";

export interface GoogleAuthButtonProps extends Omit<ButtonProps, "children"> {
  children: React.ReactNode;
}

export function GoogleAuthButton({
  children,
  className = "",
  ...buttonProps
}: GoogleAuthButtonProps) {
  return (
    <Button
      variant="primary"
      size="large"
      className={`google-auth-button ${className}`}
      {...buttonProps}
    >
      <GoogleIcon />
      <span className="google-auth-button__text">{children}</span>
    </Button>
  );
}
