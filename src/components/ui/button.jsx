import React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-sky-500 text-slate-950 hover:bg-sky-400",
    outline:
      "border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800/80",
    subtle: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  };

  const sizes = {
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4",
    lg: "h-10 px-6 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export default Button;

