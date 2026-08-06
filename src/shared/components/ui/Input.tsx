import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leading, trailing, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-[34px] items-center rounded-[8px] border border-[var(--color-border-default)] bg-[var(--color-bg-canvas)] px-3 transition duration-150",
          "focus-within:border-[var(--color-accent)] focus-within:ring-3 focus-within:ring-[rgb(91_141_239_/_0.15)]",
          className
        )}
      >
        {leading ? (
          <span className="mr-2 text-[var(--color-text-tertiary)]">
            {leading}
          </span>
        ) : null}

        <input
          ref={ref}
          className="h-full flex-1 border-0 bg-transparent text-[13px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none"
          {...props}
        />

        {trailing ? (
          <span className="ml-2 text-[var(--color-text-tertiary)]">
            {trailing}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
