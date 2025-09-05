"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  /** Field label (renders a <label>) */
  label?: string;
  /** Helper text shown under the field (ignored if `error` present) */
  hint?: string;
  /** Error message (renders red style + message) */
  error?: string;
  /** Left inline icon / element (absolute positioned) */
  leftIcon?: React.ReactNode;
  /** Right inline icon / element (absolute positioned) */
  rightIcon?: React.ReactNode;
  /** Inline text prefix (e.g., IDR) */
  prefix?: React.ReactNode;
  /** Inline text suffix (e.g., /day) */
  suffix?: React.ReactNode;
  /** Show clear (×) button when there is value */
  onClear?: () => void;
  /** For password fields: show a toggle eye icon */
  showPasswordToggle?: boolean;
  /** Visual size */
  size?: InputSize;
  /** Full width */
  fullWidth?: boolean;
  /** ClassName for the outer wrapper */
  wrapperClassName?: string;
};

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 text-sm rounded-xl",
  md: "h-10 text-sm rounded-xl",
  lg: "h-12 text-base rounded-2xl",
};

const paddingBase: Record<InputSize, string> = {
  sm: "px-3",
  md: "px-3.5",
  lg: "px-4",
};

const labelSize: Record<InputSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
};

const hintSize: Record<InputSize, string> = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-xs",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      id,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      prefix,
      suffix,
      onClear,
      showPasswordToggle,
      size = "md",
      fullWidth = true,
      className,
      wrapperClassName,
      type = "text",
      disabled,
      required,
      ...rest
    },
    ref
  ) {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword && showPasswordToggle && showPassword ? "text" : type;

    const hasLeft = Boolean(leftIcon || prefix);
    const hasRight = Boolean(rightIcon || suffix || (onClear && rest.value) || (isPassword && showPasswordToggle));

    // Internal paddings adjusted by adornments
    const leftPad = hasLeft ? "pl-11" : "";
    const rightPad = hasRight ? "pr-11" : "";

    const inputId = id || React.useId();

    const adornClass =
      "pointer-events-none absolute inset-y-0 flex items-center text-white/60";

    const buttonAdornment =
      "absolute inset-y-0 right-2 flex items-center gap-1";

    return (
      <div className={cn(fullWidth && "w-full", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-1.5 block font-medium text-white/90",
              labelSize[size]
            )}
          >
            {label}
            {required && <span className="ml-1 text-rose-400">*</span>}
          </label>
        )}

        <div
          className={cn(
            "relative",
            disabled && "opacity-70 cursor-not-allowed"
          )}
        >
          {/* Left icon */}
          {leftIcon && (
            <span className={cn(adornClass, "left-3")}>
              <span className="pointer-events-none">{leftIcon}</span>
            </span>
          )}

          {/* Prefix */}
          {prefix && (
            <span
              className={cn(
                "absolute inset-y-0 left-9 flex items-center border-r border-white/10 px-2 text-sm text-white/70"
              )}
            >
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              "w-full border border-white/15 bg-white/5 text-white placeholder:text-white/40 outline-none",
              "focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:border-white/30",
              sizeStyles[size],
              paddingBase[size],
              leftPad,
              rightPad,
              "transition",
              "disabled:cursor-not-allowed",
              error && "border-rose-500/50 focus-visible:ring-rose-400/30"
            )}
            disabled={disabled}
            required={required}
            {...rest}
          />

          {/* Right side buttons (interactive) */}
          <div className={buttonAdornment}>
            {/* Suffix (non-interactive) */}
            {suffix && (
              <span className="pointer-events-none mr-2 select-none rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/70">
                {suffix}
              </span>
            )}

            {/* Clear button */}
            {onClear && rest.value && (
              <button
                type="button"
                aria-label="Clear"
                className="group rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={onClear}
                tabIndex={0}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}

            {/* Password toggle */}
            {isPassword && showPasswordToggle && (
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={0}
              >
                {showPassword ? (
                  // Eye-off
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.585 10.585A3 3 0 0012 15a3 3 0 002.121-.879M9.88 9.88C9.323 10.437 9 11.18 9 12a3 3 0 003 3c.82 0 1.563-.323 2.12-.88M6.343 6.343C4.253 7.82 2.82 9.72 2 12c1.5 4 6 7 10 7 1.632 0 3.184-.37 4.586-1.03M17.657 17.657C19.747 16.18 21.18 14.28 22 12c-1.5-4-6-7-10-7-1.05 0-2.067.145-3.03.415" />
                  </svg>
                ) : (
                  // Eye
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                )}
              </button>
            )}

            {/* Right icon (non-interactive) */}
            {rightIcon && (
              <span className="pointer-events-none ml-1 text-white/70">{rightIcon}</span>
            )}
          </div>
        </div>

        {/* Hint / Error */}
        {error ? (
          <p id={`${inputId}-error`} className={cn("mt-1 text-rose-300", hintSize[size])}>
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className={cn("mt-1 text-white/60", hintSize[size])}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

/* -------------------------------------------
 * TextArea — API mirip Input
 * -----------------------------------------*/

export type TextAreaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> & {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode; // decorative left badge
  suffix?: React.ReactNode; // decorative right badge
  size?: InputSize;
  fullWidth?: boolean;
  wrapperClassName?: string;
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      id,
      label,
      hint,
      error,
      prefix,
      suffix,
      size = "md",
      rows = 4,
      fullWidth = true,
      className,
      wrapperClassName,
      required,
      disabled,
      ...rest
    },
    ref
  ) {
    const areaId = id || React.useId();

    return (
      <div className={cn(fullWidth && "w-full", wrapperClassName)}>
        {label && (
          <label
            htmlFor={areaId}
            className={cn("mb-1.5 block font-medium text-white/90", labelSize[size])}
          >
            {label}
            {required && <span className="ml-1 text-rose-400">*</span>}
          </label>
        )}

        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute left-3 top-2 rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/70">
              {prefix}
            </span>
          )}

          <textarea
            ref={ref}
            id={areaId}
            rows={rows}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              error ? `${areaId}-error` : hint ? `${areaId}-hint` : undefined
            }
            className={cn(
              "w-full border border-white/15 bg-white/5 text-white placeholder:text-white/40 outline-none",
              "focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:border-white/30",
              "rounded-2xl p-3.5 text-sm transition",
              "disabled:cursor-not-allowed",
              prefix && "pt-8",
              className,
              error && "border-rose-500/50 focus-visible:ring-rose-400/30"
            )}
            disabled={disabled}
            required={required}
            {...rest}
          />

          {suffix && (
            <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/70">
              {suffix}
            </span>
          )}
        </div>

        {error ? (
          <p id={`${areaId}-error`} className={cn("mt-1 text-rose-300", hintSize[size])}>
            {error}
          </p>
        ) : hint ? (
          <p id={`${areaId}-hint`} className={cn("mt-1 text-white/60", hintSize[size])}>
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

export default Input;
