"use client";

import { X } from "lucide-react";
import type { MemberRowState } from "@/lib/create";
import type { TxStatus } from "@/hooks/useTx";
import type { TxError } from "@/lib/errors";
import { TxButton } from "@/components/tx/TxButton";
import { shortenAddress } from "@/lib/format";

export function ConfirmCreateModal({
  open,
  rows,
  status,
  isSimulating,
  simulationError,
  onClose,
  onConfirm,
  onReset,
}: {
  open: boolean;
  rows: MemberRowState[];
  status: TxStatus;
  isSimulating: boolean;
  simulationError?: TxError;
  onClose: () => void;
  onConfirm: () => void;
  onReset: () => void;
}) {
  if (!open) return null;

  //TODO : voir comment ça réagit à une liste trop longue : rendre scrollable
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-24">
      <div className="w-full max-w-xl rounded-xl border border-rule bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-rule p-5">
          <div>
            <h2 className="text-lg">Review splitter</h2>
            <p className="mt-1 text-sm text-muted">
              Check the allocation before creating it
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted transition-opacity hover:opacity-60"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Review */}
        <div className="p-5">
          <div className="mb-3 flex items-center justify-between text-xs text-muted">
            <span>{rows.length} members</span>
            <span>100% allocated</span>
          </div>

          <div className="grid grid-cols-[max-content_minmax(0,1fr)_80px] overflow-hidden rounded-xl border border-rule bg-surface">
            {rows.map((row) => (
              <div
                key={row.id}
                className="col-span-3 grid grid-cols-subgrid items-center gap-3 border-b border-rule px-3 py-2.5 last:border-b-0"
              >
                <p className="font-mono text-[12px]">
                  {row.nickname}
                </p>

                <p className="truncate font-mono text-[12px]">
                  {row.address}
                </p>

                <span className="text-right font-mono text-sm">
                  {row.share}%
                </span>
              </div>
            ))}
          </div>

          {/* Immutable warning */}
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-100 p-3">
            <p className="text-sm">
              This allocation is permanent. Once created, no one can change the
              members or their shares.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-rule p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-rule px-3 py-1.5 text-sm"
          >
            Back
          </button>

          <TxButton
            label="Create splitter"
            status={status}
            onClick={onConfirm}
            onReset={onReset}
            isSimulating={isSimulating}
            simulationError={simulationError}
          />
        </div>
      </div>
    </div>
  );
}
