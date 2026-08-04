import { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Title({
  children,
  className,
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-6xl font-bold tracking-tight",
        className
      )}
    >
      {children}
    </h1>
  );
}

export function Text({
  children,
  className,
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-lg text-zinc-400",
        className
      )}
    >
      {children}
    </p>
  );
}