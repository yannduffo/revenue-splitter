"use client";

import { X, Info } from "lucide-react";
import type { MemberRowState, RowError } from "@/lib/create";

export function MemberRow({
  row,
  memberNumber,
  tone,
  error,
  canRemove,
  onChange,
  onRemove,
}: {
    row: MemberRowState;
    memberNumber: number,
  tone: string
  error?: RowError;
  canRemove: boolean;
  onChange: (patch: Partial<MemberRowState>) => void;
  onRemove: () => void;
  }) {
  const message = error?.address ?? error?.share

  return (
    <div
      className="border-b border-l-3 border-rule px-3 py-2 last:border-0"
      style={{borderLeftColor: tone}}
    >
      <div className="grid grid-cols-[10px_minmax(0,1fr)_90px_32px] items-center gap-2 sm:grid-cols-[10px_120px_minmax(0,1fr)_90px_32px]">
        <p className="text-sm text-muted">{memberNumber}</p>
        <input
          value={row.nickname}
          onChange={(e) => onChange({ nickname: e.target.value })}
          placeholder="Member name"
          className="min-w-0 rounded-lg border border-rule bg-surface px-2 py-1.5 text-sm"
        />
        <input
          value={row.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="0x…"
          spellCheck={false}
          //only explicitly placed cell : auto-placement fills the rest in DOM order
          className={`col-start-2 col-span-3 row-start-2 min-w-0 rounded-lg border bg-surface px-2 py-1.5 font-mono text-sm sm:col-auto sm:row-auto ${
            error?.address ? "border-accent" : "border-rule"
          }`}
        />
        <div className="flex min-w-0 items-center gap-1">
          <input
            value={row.share}
            onChange={(e) => onChange({ share: e.target.value })}
            inputMode="decimal"
            placeholder="0"
            className={`w-full rounded-lg border bg-surface px-2 py-1.5 text-right font-mono text-sm ${
              error?.share ? "border-accent" : "border-rule"
            }`}
          />
          <span className="text-xs text-muted">%</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="flex justify-center text-muted disabled:opacity-25"
          aria-label="Remove member"
        >
          <X size={16} />
        </button>
      </div>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-out
          ${message
            ? "max-h-20 opacity-100 mt-2"
            : "max-h-0 opacity-0 mt-0"}
        `}
      >
        <div className="flex gap-1 rounded-lg border border-amber-200 bg-amber-100 p-2">
          <Info size={16} className="text-muted" />
          <p className="text-xs text-muted">
            {message}
          </p>
        </div>
      </div>

    </div>
  );
}
