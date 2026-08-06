import { ReactNode } from "react";

import { cn } from "@/lib/utils";

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
        "flex min-h-screen items-center justify-center bg-zinc-950 px-8 text-zinc-50",
        className
      )}
    >
      <div className="w-full max-w-3xl">
        {children}
      </div>
    </main>
  );
}
