import React from "react";
import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-800",
        className
      )}
      {...props}
    />
  );
}

export function AvatarImage({ src, alt, className, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarGroup({ className, children, ...props }) {
  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {children}
    </div>
  );
}
