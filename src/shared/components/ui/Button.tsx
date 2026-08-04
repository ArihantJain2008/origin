import { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl px-6 py-3 font-medium transition-all duration-200",

        variant === "primary" &&
          "bg-blue-600 text-white hover:bg-blue-500",

        variant === "secondary" &&
          "border border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}