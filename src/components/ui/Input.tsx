import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-white/10 bg-surface px-3 text-sm text-foreground placeholder:text-white/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      {...props}
    />
  );
});
