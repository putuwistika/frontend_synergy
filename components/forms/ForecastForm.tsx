"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { DEFAULTS, type Frequency } from "@/lib/constants";
import type { PredictRequestAuto } from "@/lib/types";

import Input from "@/components/ui/Input";
import Toggle from "@/components/ui/Toggle";
import Slider from "@/components/ui/Slider";
import Button from "@/components/ui/Button";

import { CalendarDays, Sparkles, Minus, Plus } from "lucide-react";

/* =============================================================================
 * Schema & Types (cleaned: no clip_non_negative / floor)
 * ========================================================================== */

const schema = z.object({
  horizon: z
    .number({ invalid_type_error: "Horizon harus angka." })
    .int()
    .min(1, "Minimal 1.")
    .max(365, "Maksimal 365."),
  frequency: z.enum(["D", "W", "M"], { required_error: "Pilih frequency." }),
  alpha: z
    .number({ invalid_type_error: "Alpha harus angka desimal." })
    .min(0.001, "Terlalu kecil.")
    .max(0.5, "Biasanya ≤ 0.5 (50% CI)."),
  use_auto_exog: z.boolean().default(true),
  exog_strategy: z.enum(["zeros", "smart"]).default("smart"),
});

export type ForecastFormValues = z.infer<typeof schema>;

export type ForecastFormProps = {
  /** Default values for the form */
  defaultValues?: Partial<ForecastFormValues>;
  /** Submit handler: emits a PredictRequestAuto body */
  onSubmit: (body: PredictRequestAuto) => void;
  /** Loading state for the submit button */
  submitting?: boolean;
  /** Disable entire form */
  disabled?: boolean;
  /** Optional: show compact header title */
  title?: string;
  /** Optional: className for outer wrapper */
  className?: string;
};

/* =============================================================================
 * Component
 * ========================================================================== */

export default function ForecastForm({
  defaultValues,
  onSubmit,
  submitting,
  disabled,
  title = "Forecast Controls",
  className,
}: ForecastFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ForecastFormValues>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      horizon: DEFAULTS.horizon,
      frequency: DEFAULTS.frequency,
      alpha: DEFAULTS.alpha,
      use_auto_exog: true,
      exog_strategy: DEFAULTS.exogStrategy,
      ...defaultValues,
    },
  });

  const horizon = watch("horizon");
  const frequency = watch("frequency");
  const useAuto = watch("use_auto_exog");
  const exogStrategy = watch("exog_strategy");

  const presets = [7, 14, 30, 60, 90, 120];

  const clamp = (n: number) => Math.min(365, Math.max(1, Math.round(n)));
  const setHorizon = (n: number) =>
    setValue("horizon", clamp(n), { shouldDirty: true, shouldValidate: true });

  const suffixByFreq = frequency === "D" ? "days" : frequency === "W" ? "weeks" : "months";

  const onSubmitInternal = (values: ForecastFormValues) => {
    const body: PredictRequestAuto = {
      horizon: values.horizon,
      frequency: values.frequency as Frequency,
      alpha: values.alpha,
      flags: {
        use_auto_exog: values.use_auto_exog,
        exog_strategy: values.exog_strategy,
      },
    };
    onSubmit(body);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitInternal)}
      className={["rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-white/80" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        <div className="text-xs text-white/60">
          Frequency:{" "}
          <span className="rounded-md bg-white/10 px-2 py-0.5">{frequency}</span>
        </div>
      </div>

      {/* Horizon — neatly arranged: header controls + slider + presets */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        {/* Top row: label + stepper + numeric */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-medium text-white/90">Horizon</label>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Decrease horizon"
              onClick={() => setHorizon(horizon - 1)}
              disabled={disabled || horizon <= 1}
              startIcon={<Minus className="h-4 w-4" />}
            />
            <div className="w-28">
              <Input
                type="number"
                min={1}
                max={365}
                value={String(horizon)}
                onChange={(e) => setHorizon(Number(e.target.value || 0))}
                suffix={suffixByFreq}
                hint={undefined}
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Increase horizon"
              onClick={() => setHorizon(horizon + 1)}
              disabled={disabled || horizon >= 365}
              startIcon={<Plus className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Slider with extra spacing so bubbles don't overlap next section */}
        <div className="mt-2 pb-2">
          <Slider
            value={horizon}
            onValueChange={(n) => setHorizon(Number(n))}
            min={1}
            max={120}
            step={1}
            marks={[
              { value: 7, label: "7" },
              { value: 14, label: "14" },
              { value: 30, label: "30" },
              { value: 60, label: "60" },
              { value: 90, label: "90" },
              { value: 120, label: "120" },
            ]}
            formatValue={(n) => `${n} ${suffixByFreq}`}
            hint="Geser slider, atau pakai preset/stepper di atas."
          />
        </div>

        {/* Presets — scrollable row so they don't wrap awkwardly */}
        <div className="-mx-1 mt-2 overflow-x-auto">
          <div className="flex min-w-0 items-center gap-2 px-1 pb-1">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setHorizon(p)}
                className={[
                  "whitespace-nowrap rounded-xl border px-3 py-1 text-xs transition",
                  horizon === p
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {errors.horizon && (
          <p className="mt-1 text-xs text-rose-300">{errors.horizon.message}</p>
        )}
      </div>

      {/* Frequency segmented control */}
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-white/90">
          Frequency
        </label>
        <div className="inline-flex overflow-hidden rounded-xl border border-white/15 bg-white/5">
          {(
            [
              { k: "D", label: "Daily" },
              { k: "W", label: "Weekly" },
              { k: "M", label: "Monthly" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.k}
              type="button"
              className={[
                "px-3 py-1.5 text-xs transition",
                frequency === opt.k
                  ? "bg-gradient-to-r from-indigo-500/40 to-fuchsia-500/40 text-white"
                  : "text-white/80 hover:bg-white/10",
              ].join(" ")}
              onClick={() =>
                setValue("frequency", opt.k, { shouldDirty: true, shouldValidate: true })
              }
            >
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {opt.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Alpha (single column) */}
      <div className="mt-4">
        <Input
          type="number"
          step="0.01"
          min={0.001}
          max={0.5}
          label="Alpha (CI)"
          hint="0.05 = 95% confidence interval"
          {...register("alpha", {
            valueAsNumber: true,
          })}
          error={errors.alpha?.message as string}
        />
      </div>

      {/* Auto-exog strategy */}
      <div className="mt-4 grid gap-2">
        <Toggle
          label="Use Auto Exogenous Variables"
          checked={useAuto}
          onCheckedChange={(v) => setValue("use_auto_exog", v, { shouldDirty: true })}
          hint="Jika dimatikan, isi exog manual di grid terpisah."
          size="md"
        />

        <fieldset
          className={`flex items-center gap-2 rounded-xl border p-2 ${
            useAuto ? "border-white/15 bg-white/5" : "border-white/10 bg-white/5 opacity-60"
          }`}
          disabled={!useAuto}
        >
          <legend className="px-1 text-xs text-white/70">Auto Exog Mode</legend>
          {(["zeros", "smart"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() =>
                setValue("exog_strategy", mode, { shouldDirty: true, shouldValidate: true })
              }
              className={[
                "rounded-lg px-3 py-1.5 text-xs transition",
                exogStrategy === mode
                  ? "bg-gradient-to-r from-indigo-500/40 to-fuchsia-500/40 text-white"
                  : "text-white/80 hover:bg-white/10",
              ].join(" ")}
              aria-pressed={exogStrategy === mode}
            >
              {mode === "smart" ? "Smart (recommended)" : "Zeros (faster)"}
            </button>
          ))}
        </fieldset>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-white/60">
          {useAuto ? (
            <>
              Mode:{" "}
              <span className="rounded bg-white/10 px-2 py-0.5">auto / {exogStrategy}</span>
            </>
          ) : (
            <>
              Mode: <span className="rounded bg-white/10 px-2 py-0.5">manual exog</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
            disabled={disabled}
          >
            Generate Forecast
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => {
              setHorizon(DEFAULTS.horizon);
              setValue("frequency", DEFAULTS.frequency, { shouldDirty: true, shouldValidate: true });
              setValue("alpha", DEFAULTS.alpha, { shouldDirty: true, shouldValidate: true });
              setValue("use_auto_exog", true, { shouldDirty: true });
              setValue("exog_strategy", DEFAULTS.exogStrategy, { shouldDirty: true, shouldValidate: true });
            }}
            disabled={disabled || !isDirty}
          >
            Reset
          </Button>
        </div>
      </div>
    </form>
  );
}
