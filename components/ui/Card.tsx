"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Elevation level: "none" | "soft" | "lg" */
  elevation?: "none" | "soft" | "lg";
  /** Use glass background (adds backdrop-blur) */
  glass?: boolean;
  /** Highlight border */
  highlight?: boolean;
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  function Card(
    { className, elevation = "soft", glass = false, highlight = false, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/10 bg-white/5",
          elevation === "soft" && "shadow-lg",
          elevation === "lg" && "shadow-2xl",
          glass && "backdrop-blur",
          highlight && "ring-1 ring-white/20",
          className
        )}
        {...props}
      />
    );
  }
);

export type CardSectionProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1 p-5 pb-0", className)}
        {...props}
      />
    );
  }
);

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function CardTitle({ className, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={cn("text-base font-semibold leading-tight", className)}
      {...props}
    />
  );
});

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-white/75", className)}
      {...props}
    />
  );
});

export const CardContent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn("p-5", className)} {...props} />
    );
  }
);

export const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-end gap-3 p-5 pt-0", className)}
        {...props}
      />
    );
  }
);

/* ---------------------------------------------------------
 * Optional: compact stat card for KPI/metrics (generic)
 * -------------------------------------------------------*/

export type StatBadgeProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
};

export function StatBadge({ label, value, hint, className }: StatBadgeProps) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/5 p-4", className)}>
      <div className="text-xs text-white/70">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-white/60">{hint}</div>}
    </div>
  );
}

export default Card;
