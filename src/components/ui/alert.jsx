import React from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, children }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children }) {
  return <div className="font-medium">{children}</div>;
}

export function AlertDescription({ children }) {
  return <div className="text-xs text-slate-300">{children}</div>;
}

export function AlertAction({ children }) {
  return <div className="mt-2 flex items-center gap-2">{children}</div>;
}

