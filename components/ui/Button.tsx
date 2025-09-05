"use client";

import * as React from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/**
 * Simple utility to merge class names with Tailwind awareness.
 */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "subtle"
  | "success"
  | "danger";

type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = {
  /** Visual style of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** When provided, renders as a link (Next.js Link) */
  href?: string;
  /** Stretch to container width */
  fullWidth?: boolean;
  /** Show spinner and disable interactions */
  loading?: boolean;
  /** Optional leading / trailing icons (React nodes) */
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  /** Native button type */
  type?: "button" | "submit" | "reset";
  /** Additional classes */
  className?: string;
  /** Children label/content */
  children?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** aria-label for icon-only buttons */
  "aria-label"?: string;
  /** Link target (when href present) */
  target?: React.HTMLAttributeAnchorTarget;
  /** Link rel (when href present) */
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick" | "disabled"> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "onClick" | "href">;

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-60 disabled:cursor-not-allowed";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-900/30 hover:brightness-110",
  secondary:
    "text-white border border-white/20 bg-white/10 hover:bg-white/15",
  ghost:
    "text-white/90 hover:text-white hover:bg-white/10",
  outline:
    "text-white border border-white/30 hover:bg-white/10",
  subtle:
    "text-white/90 bg-white/5 hover:bg-white/10",
  success:
    "text-white bg-emerald-600 hover:bg-emerald-500",
  danger:
    "text-white bg-rose-600 hover:bg-rose-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
  icon:
    "p-2 text-sm aspect-square !rounded-xl",
};

const spinner =
  "animate-spin h-4 w-4 rtl:ml-0";

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(
  {
    variant = "primary",
    size = "md",
    href,
    fullWidth,
    loading,
    startIcon,
    endIcon,
    className,
    children,
    type = "button",
    disabled,
    target,
    rel,
    onClick,
    ...rest
  },
  ref
) {
  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className
  );

  const content = (
    <>
      {/* Spinner or startIcon */}
      {loading ? (
        <svg
          className={spinner}
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z"
          />
        </svg>
      ) : (
        startIcon
      )}

      {/* Label */}
      {children && <span className="truncate">{children}</span>}

      {/* End icon keeps space while loading */}
      {loading ? <span className="w-4" /> : endIcon}
    </>
  );

  const isDisabled = disabled || loading;

  if (href) {
    // Render as Next Link
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        onClick={(e) => {
          if (isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onClick?.(e);
        }}
        target={target}
        rel={rel}
        {...(rest as Omit<
          React.AnchorHTMLAttributes<HTMLAnchorElement>,
          "href"
        >)}
      >
        {content}
      </Link>
    );
  }

  // Render as native button
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
});

export default Button;
