import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function IconButton({
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "flex h-9 w-9 items-center justify-center rounded-lg",
        "text-zinc-400 transition",
        "hover:bg-zinc-800 hover:text-white",
        "active:scale-95",
        className
      )}
    >
      {children}
    </button>
  );
}