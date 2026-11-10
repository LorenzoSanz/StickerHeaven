import * as React from "react";
import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerProps = Omit<React.SVGAttributes<SVGSVGElement>, "children"> & {
  size?: SpinnerSize;
  label?: string;
};

const pxBySize: Record<SpinnerSize, number> = {
  sm: 16,
  md: 20,
  lg: 28,
};

export function Spinner({ size = "md", label = "Cargando", className, ...props }: SpinnerProps) {
  const px = pxBySize[size];
  const gradientId = React.useId();

  return (
    <span role="status" aria-live="polite" className="inline-flex items-center justify-center">
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        className={cn("animate-spin text-primary drop-shadow-[0_0_14px_rgba(139,92,246,0.35)]", className)}
        {...props}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="55%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.10)" strokeWidth="3" fill="none" />
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="20 60"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
