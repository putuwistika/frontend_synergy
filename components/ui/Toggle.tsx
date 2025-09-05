"use client";

import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

type ToggleSize = "sm" | "md" | "lg";
type LabelPosition = "right" | "left";

export type ToggleProps = {
  /** Controlled checked state */
  checked?: boolean;
  /** Uncontrolled initial state */
  defaultChecked?: boolean;
  /** Callback when toggled */
  onCheckedChange?: (next: boolean) => void;

  /** Field label (clicking toggles the switch) */
  label?: React.ReactNode;
  /** Helper text under the control (ignored if `error` present) */
  hint?: React.ReactNode;
  /** Error message */
  error?: React.ReactNode;

  /** Visual size */
  size?: ToggleSize;
  /** Position of the label relative to the switch */
  labelPosition?: LabelPosition;

  /** Disable interaction */
  disabled?: boolean;
  /** Show loading spinner (locks interaction) */
  loading?: boolean;

  /** Icons rendered inside the knob for on/off states */
  iconOn?: React.ReactNode;
  iconOff?: React.ReactNode;

  /** Participate in HTML forms (hidden checkbox will be rendered) */
  name?: string;
  value?: string;

  /** Required mark on the label (visual only) */
  required?: boolean;

  /** Styling */
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  id?: string;
};

/* ----------------------------- Size presets ----------------------------- */

const SIZE: Record<
  ToggleSize,
  {
    track: string; // HxW
    knob: string; // HxW
    onTranslate: string; // translate-x-* class
    label: string; // text size
    hint: string; // text size
  }
> = {
  sm: {
    track: "h-5 w-9",
    knob: "h-4 w-4",
    onTranslate: "translate-x-4",
    label: "text-xs",
    hint: "text-[11px]",
  },
  md: {
    track: "h-6 w-11",
    knob: "h-5 w-5",
    onTranslate: "translate-x-5",
    label: "text-sm",
    hint: "text-xs",
  },
  lg: {
    track: "h-7 w-14",
    knob: "h-6 w-6",
    onTranslate: "translate-x-7",
    label: "text-sm",
    hint: "text-xs",
  },
};

/* ----------------------------- Component -------------------------------- */

export default function Toggle({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  hint,
  error,
  size = "md",
  labelPosition = "right",
  disabled,
  loading,
  iconOn,
  iconOff,
  name,
  value = "on",
  required,
  className,
  wrapperClassName,
  labelClassName,
  id,
}: ToggleProps) {
  const isControlled = typeof checked === "boolean";
  const [internal, setInternal] = React.useState<boolean>(Boolean(defaultChecked));
  const isOn = isControlled ? (checked as boolean) : internal;

  React.useEffect(() => {
    if (isControlled) setInternal(checked as boolean);
  }, [isControlled, checked]);

  const switchId = id || React.useId();
  const describedBy =
    error ? `${switchId}-error` : hint ? `${switchId}-hint` : undefined;

  const SZ = SIZE[size];
  const isInteractive = !disabled && !loading;

  const toggle = () => {
    if (!isInteractive) return;
    const next = !isOn;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  };

  /* Default icons */
  const iconOnNode =
    iconOn ?? (
      <svg
        className="h-3.5 w-3.5 text-emerald-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
      </svg>
    );
  const iconOffNode =
    iconOff ?? (
      <svg
        className="h-3.5 w-3.5 text-white/60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeWidth="2.5" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    );

  return (
    <div className={cn("w-full", wrapperClassName)}>
      <div
        className={cn(
          "flex items-center gap-3",
          labelPosition === "left" && "flex-row-reverse justify-end"
        )}
      >
        {/* Button switch (accessible) */}
        <button
          id={switchId}
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-describedby={describedBy}
          aria-disabled={!isInteractive || undefined}
          onClick={toggle}
          className={cn(
            "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-white/10 transition",
            SZ.track,
            isOn
              ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500"
              : "bg-white/15",
            !isInteractive && "cursor-not-allowed opacity-60",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
            className
          )}
        >
          {/* Spinner overlay when loading */}
          {loading && (
            <span className="absolute inset-0 grid place-items-center">
              <svg
                className="h-4 w-4 animate-spin text-white/80"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-30"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  className="opacity-90"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
                />
              </svg>
            </span>
          )}

          {/* Knob */}
          <span
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 translate-x-1 rounded-full bg-white shadow-md transition-all",
              SZ.knob,
              isOn && SZ.onTranslate
            )}
          />

          {/* Icon inside knob (slightly centered) */}
          <span
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 translate-x-1 transition-all",
              isOn && SZ.onTranslate
            )}
            style={{ transform: undefined }}
          >
            <span className="grid h-5 w-5 place-items-center">
              {isOn ? iconOnNode : iconOffNode}
            </span>
          </span>
        </button>

        {/* Clickable label */}
        {label && (
          <label
            onClick={(e) => {
              e.preventDefault();
              toggle();
            }}
            htmlFor={switchId}
            className={cn(
              "cursor-pointer select-none text-white/90",
              SZ.label,
              !isInteractive && "cursor-not-allowed opacity-70",
              labelClassName
            )}
          >
            {label}
            {required && <span className="ml-1 text-rose-400">*</span>}
          </label>
        )}
      </div>

      {/* Hidden checkbox for forms */}
      {name && (
        <input
          type="checkbox"
          name={name}
          value={value}
          checked={isOn}
          readOnly
          hidden
        />
      )}

      {/* Hint / Error */}
      {error ? (
        <p id={`${switchId}-error`} className={cn("mt-1 text-rose-300", SIZE[size].hint)}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${switchId}-hint`} className={cn("mt-1 text-white/60", SIZE[size].hint)}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
