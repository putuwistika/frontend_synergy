"use client";

import * as React from "react";
import Button from "@/components/ui/Button";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { downloadFile, toCSV } from "@/lib/utils";
import { Upload, FileDown, Eraser, Check } from "lucide-react";

/** Tailwind-aware class merger */
function cn(...inputs: Array<string | false | null | undefined>) {
  return twMerge(clsx(inputs));
}

export type ManualExogValue = Record<string, number[]>;

export type ManualExogGridProps = {
  /** Ordered column names (from /api/debug/exog → expected_exog_used_by_forecast) */
  columns: string[];
  /** Number of future periods to provide (rows) */
  horizon: number;
  /** Controlled value (map-style) — arrays length should be `horizon` */
  value?: ManualExogValue;
  /** Emits the complete map on every edit/import/clear */
  onChange: (next: ManualExogValue) => void;

  /** Disable edit/import */
  disabled?: boolean;
  /** Optional class */
  className?: string;
  /** Title shown on the header */
  title?: string;
};

/* ============================================================
 * Helpers
 * ========================================================== */

function toNumberOrZero(v: any): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function initGrid(columns: string[], horizon: number, from?: ManualExogValue): ManualExogValue {
  const next: ManualExogValue = {};
  for (const col of columns) {
    const src = from?.[col] ?? [];
    // pad/truncate to horizon
    const arr = Array.from({ length: horizon }, (_, i) => toNumberOrZero(src[i]));
    next[col] = arr;
  }
  return next;
}

/** Basic CSV parser (handles quoted fields and commas) */
function parseCSV(text: string, delimiter = ","): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;

  const pushCell = () => {
    // Unescape double quotes
    const unq = inQuotes ? cur.replace(/""/g, '"') : cur;
    row.push(unq);
    cur = "";
    inQuotes = false;
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      // toggle or escape
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      pushCell();
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      // handle \r\n / \n / \r
      if (ch === "\r" && text[i + 1] === "\n") i++;
      pushCell();
      pushRow();
    } else {
      cur += ch;
    }
  }
  // last cell
  pushCell();
  // last row if not already
  if (row.length) pushRow();

  // remove empty trailing rows
  while (rows.length && rows[rows.length - 1].every((c) => c === "")) rows.pop();
  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = rows.shift() ?? [];
  return { headers, rows };
}

/** Convert map into matrix aligned to `columns` */
export function exogMapToMatrix(
  map: ManualExogValue,
  columns: string[],
  horizon: number
): { columns: string[]; rows: number[][] } {
  const rows: number[][] = Array.from({ length: horizon }, () => Array(columns.length).fill(0));
  for (let c = 0; c < columns.length; c++) {
    const name = columns[c];
    const col = map[name] ?? [];
    for (let r = 0; r < horizon; r++) {
      rows[r][c] = toNumberOrZero(col[r]);
    }
  }
  return { columns, rows };
}

/** Download a CSV template aligned to columns + horizon (all zeros) */
function downloadTemplate(columns: string[], horizon: number) {
  const rows = Array.from({ length: horizon }, () =>
    Object.fromEntries(columns.map((c) => [c, 0]))
  );
  const csv = toCSV(rows);
  downloadFile("manual_exog_template.csv", csv, "text/csv");
}

/* ============================================================
 * Component
 * ========================================================== */

export default function ManualExogGrid({
  columns,
  horizon,
  value,
  onChange,
  disabled,
  className,
  title = "Manual Exogenous Variables",
}: ManualExogGridProps) {
  const [grid, setGrid] = React.useState<ManualExogValue>(() =>
    initGrid(columns, horizon, value)
  );

  // Sync when external value/shape changes
  React.useEffect(() => {
    setGrid((prev) => initGrid(columns, horizon, value ?? prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns.join("|"), horizon, JSON.stringify(value ?? {})]);

  // Emits upward when grid changes
  const emit = React.useCallback(
    (next: ManualExogValue) => {
      setGrid(next);
      onChange(next);
    },
    [onChange]
  );

  // Update single cell
  const setCell = (colIdx: number, rowIdx: number, raw: string) => {
    const colName = columns[colIdx];
    const next: ManualExogValue = { ...grid, [colName]: [...(grid[colName] ?? [])] };
    next[colName][rowIdx] = toNumberOrZero(raw);
    emit(next);
  };

  // Fill column with a value
  const [fillCol, setFillCol] = React.useState<string>(columns[0] ?? "");
  const [fillVal, setFillVal] = React.useState<string>("0");

  const doFill = () => {
    if (!fillCol) return;
    const v = toNumberOrZero(fillVal);
    const next = { ...grid, [fillCol]: Array.from({ length: horizon }, () => v) };
    emit(next);
  };

  // Import CSV
  const fileRef = React.useRef<HTMLInputElement>(null);
  const onPickFile = () => fileRef.current?.click();

  const onImportCSV = async (file: File) => {
    const text = await file.text();
    const { headers, rows } = parseCSV(text);
    if (!headers.length || !rows.length) return;

    // Align by expected columns
    const headerIdx: Record<string, number> = {};
    headers.forEach((h, i) => (headerIdx[h.trim()] = i));

    const next: ManualExogValue = {};
    for (const name of columns) {
      const idx = headerIdx[name];
      const arr: number[] = [];
      for (let r = 0; r < horizon; r++) {
        const srcRow = rows[r] ?? [];
        const raw = typeof idx === "number" ? srcRow[idx] : "";
        arr.push(toNumberOrZero(raw));
      }
      next[name] = arr;
    }
    emit(next);
  };

  // Clear all → zeros
  const clearAll = () => emit(initGrid(columns, horizon));

  // Paste textarea (optional)
  const [showPaste, setShowPaste] = React.useState(false);
  const [pasteText, setPasteText] = React.useState("");
  const doPaste = () => {
    const { headers, rows } = parseCSV(pasteText.trim());
    if (!headers.length || !rows.length) return;
    const headerIdx: Record<string, number> = {};
    headers.forEach((h, i) => (headerIdx[h.trim()] = i));
    const next: ManualExogValue = {};
    for (const name of columns) {
      const idx = headerIdx[name];
      const arr: number[] = [];
      for (let r = 0; r < horizon; r++) {
        const srcRow = rows[r] ?? [];
        const raw = typeof idx === "number" ? srcRow[idx] : "";
        arr.push(toNumberOrZero(raw));
      }
      next[name] = arr;
    }
    emit(next);
    setShowPaste(false);
    setPasteText("");
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-white/70">
            {columns.length} columns • {horizon} rows (periods)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadTemplate(columns, horizon)}
            disabled={disabled}
            startIcon={<FileDown className="h-4 w-4" />}
          >
            Template CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onPickFile}
            disabled={disabled}
            startIcon={<Upload className="h-4 w-4" />}
          >
            Import CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportCSV(f);
              e.currentTarget.value = "";
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPaste((s) => !s)}
            disabled={disabled}
          >
            {showPaste ? "Close Paste" : "Paste CSV"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            disabled={disabled}
            startIcon={<Eraser className="h-4 w-4" />}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Optional paste area */}
      {showPaste && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <label className="mb-2 block text-xs font-medium text-white/80">
            Paste CSV (first row = headers; columns will align to expected order)
          </label>
          <textarea
            className="h-28 w-full rounded-lg border border-white/15 bg-white/5 p-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            placeholder={`Room Nights,ADR,Month,Day of Week,Weekend Flag\n33,13000000,4,0,1\n...`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="primary" onClick={doPaste} startIcon={<Check className="h-4 w-4" />}>
              Apply Paste
            </Button>
          </div>
        </div>
      )}

      {/* Quick fill */}
      <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px_100px]">
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/80">Fill column</label>
          <select
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            value={fillCol}
            onChange={(e) => setFillCol(e.target.value)}
            disabled={disabled}
          >
            {columns.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          type="number"
          className="rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          value={fillVal}
          onChange={(e) => setFillVal(e.target.value)}
          placeholder="0"
          disabled={disabled}
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={doFill}
          disabled={disabled}
        >
          Fill
        </Button>
      </div>

      {/* Grid */}
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="min-w-[720px] w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white/10 backdrop-blur">
            <tr>
              <th className="w-16 border-b border-white/10 px-3 py-2 text-left text-xs text-white/80">
                #
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  className="border-b border-white/10 px-3 py-2 text-left text-xs text-white/80"
                  title={c}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: horizon }).map((_, r) => (
              <tr key={r} className="even:bg-white/5">
                <td className="whitespace-nowrap px-3 py-2 text-xs text-white/70">
                  {r + 1}
                </td>
                {columns.map((c, colIdx) => {
                  const val = grid[c]?.[r] ?? 0;
                  return (
                    <td key={`${c}-${r}`} className="px-2 py-1.5">
                      <input
                        type="number"
                        className={cn(
                          "w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none",
                          "focus-visible:ring-2 focus-visible:ring-white/25",
                          disabled && "cursor-not-allowed opacity-60"
                        )}
                        value={String(val)}
                        onChange={(e) => setCell(colIdx, r, e.target.value)}
                        disabled={disabled}
                        inputMode="decimal"
                        step="any"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-white/60">
        Pastikan jumlah baris = <strong>{horizon}</strong>. Kolom tambahan akan diabaikan oleh server; kolom hilang diisi 0.
      </p>
    </div>
  );
}
