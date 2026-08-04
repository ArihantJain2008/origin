import { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-8",
        className
      )}
    >
      <div className="w-full max-w-3xl">
        {children}
      </div>
    </main>
  );
}