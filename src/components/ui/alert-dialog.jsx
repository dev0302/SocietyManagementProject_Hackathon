import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "./button";

export function AlertDialog({ children }) {
  return <>{children}</>;
}

export function AlertDialogTrigger({ asChild, children, onClick }) {
  if (asChild) {
    return React.cloneElement(children, { onClick });
  }
  return <div onClick={onClick}>{children}</div>;
}

export function AlertDialogContent({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-lg",
          "animate-in fade-in-0 zoom-in-95"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children }) {
  return <div className="flex flex-col space-y-2 text-center sm:text-left">{children}</div>;
}

export function AlertDialogMedia({ children }) {
  return <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center text-sky-400">{children}</div>;
}

export function AlertDialogTitle({ children }) {
  return <h2 className="text-lg font-semibold text-slate-50">{children}</h2>;
}

export function AlertDialogDescription({ children }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}

export function AlertDialogFooter({ children }) {
  return <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>;
}

export function AlertDialogCancel({ children, onClick }) {
  return (
    <Button variant="outline" onClick={onClick}>
      {children}
    </Button>
  );
}

export function AlertDialogAction({ children, onClick }) {
  return (
    <Button onClick={onClick}>
      {children}
    </Button>
  );
}

export function AlertDialogWithMedia({ trigger, title, description, onConfirm, onCancel }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  if (!open) {
    return (
      <AlertDialogTrigger onClick={() => setOpen(true)}>
        {trigger}
      </AlertDialogTrigger>
    );
  }

  return (
    <AlertDialogContent onClose={() => setOpen(false)}>
      <AlertDialogHeader>
        <AlertDialogMedia>
          {React.cloneElement(trigger.props.children || <div />, { className: "h-6 w-6" })}
        </AlertDialogMedia>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
