"use client";

import * as React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

type SliderSize = "sm" | "md" | "lg";

/** Mark (tick) on the slider track */
export type SliderMark = {
  /** value in [min..max] */
  value: number;
  /** optional label under the tick */
  label?: string;
};

export type SliderProps = {
  /** Single value or range tuple */
  value?: number | [number, number];
  /** Initial value (for uncontrolled) */
  defaultValue?: number | [number, number];
  /** Callback when value changes (fires on every drag) */
  onValueChange?: (v: number | [number, number]) => void;

  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;

  /** Show live number bubble above the thumb(s) */
  showValue?: boolean;
  /** Format number for display bubble */
  formatValue?: (n: number) => React.ReactNode;

  /** Optional marks (ticks) on track */
  marks?: SliderMark[];

  /** Label/Hint/Error like other inputs */
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;

  /** Visual size */
  size?: SliderSize;

  /** Full width */
  fullWidth?: boolean;

  /** Custom classes */
  className?: string;
  trackClassName?: string;
  thumbClassName?: string;
  wrapperClassName?: string;
};

function isRange(v: number | [number, number] | undefined): v is [number, number] {
  return Array.isArray(v);
}
function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
function pct(val: number, min: number, max: number) {
  if (max === min) return 0;
  return ((val - min) / (max - min)) * 100;
}

const SIZE_MAP: Record<
  SliderSize,
  { railH: string; thumb: string; bubble: string; label: string; hint: string }
> = {
  sm: { railH: "h-1.5", thumb: "h-4 w-4", bubble: "text-[10px] px-1.5 py-0.5", label: "text-xs", hint: "text-[11px]" },
  md: { railH: "h-2", thumb: "h-4.5 w-4.5", bubble: "text-xs px-2 py-0.5", label: "text-sm", hint: "text-xs" },
  lg: { railH: "h-2.5", thumb: "h-5 w-5", bubble: "text-sm px-2.5 py-1", label: "text-sm", hint: "text-xs" },
};

export default function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  showValue = true,
  formatValue = (n) => n,
  marks,
  label,
  hint,
  error,
  required,
  size = "md",
  fullWidth = true,
  className,
  trackClassName,
  thumbClassName,
  wrapperClassName,
}: SliderProps) {
  const controlled = typeof value !== "undefined";
  const initial: number | [number, number] =
    typeof defaultValue !== "undefined" ? defaultValue : (isRange(value) ? value : (typeof value === "number" ? value : min));

  const [internal, setInternal] = React.useState<number | [number, number]>(
    isRange(initial)
      ? [clamp(initial[0], min, max), clamp(initial[1], min, max)]
      : clamp(initial as number, min, max)
  );

  // keep in sync when controlled
  React.useEffect(() => {
    if (controlled) {
      const v = value!;
      setInternal(isRange(v) ? [clamp(v[0], min, max), clamp(v[1], min, max)] : clamp(v as number, min, max));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, value, min, max]);

  const isRangeMode = isRange(internal);
  const lo = isRangeMode ? internal[0] : min;
  const hi = isRangeMode ? internal[1] : (internal as number);

  const SZ = SIZE_MAP[size];

  const handleChangeSingle = (n: number) => {
    const next = clamp(n, min, max);
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  const handleChangeLower = (n: number) => {
    const nextLo = clamp(n, min, Math.min(hi, max));
    const next: [number, number] = [Math.min(nextLo, hi), hi];
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  const handleChangeUpper = (n: number) => {
    const nextHi = clamp(n, Math.max(lo, min), max);
    const next: [number, number] = [lo, Math.max(nextHi, lo)];
    if (!controlled) setInternal(next);
    onValueChange?.(next);
  };

  const loPct = pct(lo, min, max);
  const hiPct = pct(hi, min, max);

  // z-index to keep the active thumb on top when crossing
  const lowerOnTop = isRangeMode && loPct > 50 && loPct > hiPct - 2;

  return (
    <div className={cn(fullWidth && "w-full", wrapperClassName)}>
      {label && (
        <label className={cn("mb-1.5 block font-medium text-white/90", SZ.label)}>
          {label}
          {required && <span className="ml-1 text-rose-400">*</span>}
        </label>
      )}

      <div className={cn("relative", disabled && "opacity-70 cursor-not-allowed", className)}>
        {/* Rail */}
        <div className={cn("relative w-full rounded-full bg-white/10", SZ.railH, trackClassName)}>
          {/* Selected range highlight */}
          <div
            className="absolute top-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
            style={{
              left: `${isRangeMode ? loPct : 0}%`,
              width: `${isRangeMode ? Math.max(0, hiPct - loPct) : hiPct}%`,
            }}
          />
          {/* Marks */}
          {Array.isArray(marks) &&
            marks.map((m, idx) => {
              const x = pct(m.value, min, max);
              return (
                <div key={idx} className="absolute inset-y-0" style={{ left: `${x}%` }}>
                  <div className="absolute left-[-1px] top-1/2 h-2 w-[2px] -translate-y-1/2 bg-white/30" />
                  {m.label && (
                    <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 text-[10px] text-white/70">
                      {m.label}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Inputs (transparent) */}
        {isRangeMode ? (
          <>
            {/* Lower */}
            <input
              type="range"
              aria-label="Minimum value"
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-full appearance-none bg-transparent outline-none",
                "pointer-events-auto"
              )}
              min={min}
              max={max}
              step={step}
              value={lo}
              onChange={(e) => handleChangeLower(Number(e.target.value))}
              disabled={disabled}
              style={{ zIndex: lowerOnTop ? 20 : 10 }}
            />
            {/* Upper */}
            <input
              type="range"
              aria-label="Maximum value"
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-full appearance-none bg-transparent outline-none",
                "pointer-events-auto"
              )}
              min={min}
              max={max}
              step={step}
              value={hi}
              onChange={(e) => handleChangeUpper(Number(e.target.value))}
              disabled={disabled}
              style={{ zIndex: lowerOnTop ? 10 : 20 }}
            />
          </>
        ) : (
          <input
            type="range"
            aria-label="Value"
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-full appearance-none bg-transparent outline-none",
              "pointer-events-auto"
            )}
            min={min}
            max={max}
            step={step}
            value={hi}
            onChange={(e) => handleChangeSingle(Number(e.target.value))}
            disabled={disabled}
            style={{ zIndex: 20 }}
          />
        )}

        {/* Visual thumbs */}
        {isRangeMode && (
          <Thumb
            size={SZ.thumb}
            percent={loPct}
            showValue={showValue}
            valueNode={formatValue(lo) as React.ReactNode}
            disabled={disabled}
            className={thumbClassName}
          />
        )}
        <Thumb
          size={SZ.thumb}
          percent={hiPct}
          showValue={showValue}
          valueNode={formatValue(hi) as React.ReactNode}
          disabled={disabled}
          className={thumbClassName}
        />
      </div>

      {/* Hint / Error */}
      {error ? (
        <p className={cn("mt-1 text-rose-300", SZ.hint)}>{error}</p>
      ) : hint ? (
        <p className={cn("mt-1 text-white/60", SZ.hint)}>{hint}</p>
      ) : null}

      {/* Local styles for native input thumbs (for keyboard focus outline) */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 9999px;
          background: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        input[type="range"] {
          /* makes the native track invisible but keeps it focusable */
          background: transparent;
        }
        input[type="range"]:focus-visible::-webkit-slider-thumb {
          outline: 2px solid rgba(255,255,255,0.6);
          outline-offset: 2px;
        }
        input[type="range"]:focus-visible::-moz-range-thumb {
          outline: 2px solid rgba(255,255,255,0.6);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

/* ---------------------------- Thumb bubble ---------------------------- */

function Thumb({
  percent,
  size,
  showValue,
  valueNode,
  disabled,
  className,
}: {
  percent: number;
  size: string;
  showValue: boolean;
  valueNode: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("pointer-events-none absolute -top-2", className)}
      style={{ left: `calc(${percent}% - 10px)` }}
      aria-hidden
    >
      {/* Thumb dot */}
      <div
        className={cn(
          "grid place-items-center rounded-full bg-white shadow-lg transition",
          size,
          disabled ? "opacity-60" : ""
        )}
      >
        <div className="h-2 w-2 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
      </div>

      {/* Value bubble */}
      {showValue && (
        <div className="relative bottom-2 left-1/2 mt-1 -translate-x-1/2 select-none rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur">
          {valueNode}
        </div>
      )}
    </div>
  );
}
