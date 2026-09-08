"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Info } from "lucide-react";
import { useConnectedMember } from "@/hooks/useConnectedMember";
import { useCreateSplitter } from "@/hooks/useCreateSplitter";
import {
  validate,
  distributeEvenly,
  fromBps,
  type MemberRowState,
} from "@/lib/create";
import { MemberRow } from "@/components/create/MemberRow";
import { ShareSummary } from "@/components/create/ShareSummary";
import { TxButton } from "@/components/tx/TxButton";
import { ConfirmCreateModal } from "@/components/create/ConfirmCreateModal";
import { shareTone } from "@/lib/format";

let counter = 0;
const newRow = (address = ""): MemberRowState => ({
  id: `row-${counter++}`,
  nickname: "",
  address,
  share: "",
});

export default function CreatePage() {
  const router = useRouter();
  const { address, canAct } = useConnectedMember();
  const [rows, setRows] = useState<MemberRowState[]>([newRow()]);
  const [seeded, setSeeded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (address && !seeded) {
    setRows([newRow(address)]);
    setSeeded(true);
  }

  const validation = useMemo(() => validate(rows), [rows]);

  const { create, status, reset, isSimulating, simulationError } =
    useCreateSplitter({
      payload: validation.payload,
      account: address,
    });

  const patch = (id: string, values: Partial<MemberRowState>) =>
    setRows((current) =>
      current.map((r) => (r.id === id ? { ...r, ...values } : r)),
    );

  const spread = () => {
    const shares = distributeEvenly(rows.length);
    setRows((current) =>
      current.map((r, i) => ({ ...r, share: fromBps(shares[i]) })),
    );
  };

  const submit = async () => {
    const created = await create();
    if (created) router.push(`/s/${created}`);
  };

  const reason = !canAct
    ? "Connect your wallet first"
    : (validation.globalError ??
      (validation.isValid ? undefined : "Fix the highlighted rows"));

  //TODO : rendre la liste trop longue scrollable sur les membres pour que ça soit plus propre
  return (
    <main className="mx-auto flex max-w-275 flex-col gap-4 p-8">
      <div>
        <h1 className="text-2xl">New splitter</h1>
        <p className="mt-1 text-sm text-muted">
          Define who receives what. Shares are permanent : they can never be
          changed once created.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-rule bg-surface">
        <div className="grid grid-cols-[10px_120px_minmax(0,1fr)_90px_32px] gap-2 border-b border-rule border-l-3 border-l-transparent bg-surface/40 px-3 py-2 text-[11px] uppercase tracking-wide text-muted">
          <span />
          <span>Label</span>
          <span>Address</span>
          <div className="flex items-center gap-1">
            <span className="flex-1">Share</span>
            <span className="invisible text-xs">%</span>
          </div>
          <span />
        </div>

        {rows.map((row, i) => (
          <MemberRow
            key={row.id}
            row={row}
            memberNumber={i + 1}
            tone={shareTone(i, rows.length).bg}
            error={validation.rowErrors[i]}
            canRemove={rows.length > 1}
            onChange={(values) => patch(row.id, values)}
            onRemove={() => setRows((c) => c.filter((r) => r.id !== row.id))}
          />
        ))}

        <ShareSummary rows={rows} totalBps={validation.totalBps} />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRows((c) => [...c, newRow()])}
          disabled={rows.length >= 50}
          className="flex items-center gap-1 rounded-lg border border-rule bg-surface px-3 py-1.5 text-sm disabled:opacity-40"
        >
          <Plus size={14} /> Add member
        </button>
        <button
          type="button"
          onClick={spread}
          className="rounded-lg border border-rule bg-surface px-3 py-1.5 text-sm"
        >
          Distribute evenly
        </button>
      </div>

      <div className="flex flex-col items-end">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={!validation.isValid || !canAct}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-paper disabled:opacity-40"
        >
          Review and create
        </button>

        <div
          className={`
              overflow-hidden transition-all duration-300 ease-out
              ${reason ? "max-h-20 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"}
            `}
        >
          <div className="flex gap-1 rounded-lg border border-amber-200 bg-amber-100 p-2">
            <Info size={16} className="shrink-0 text-muted" />
            <p className="text-xs text-muted">{reason}</p>
          </div>
        </div>
      </div>

      <ConfirmCreateModal
        open={confirming}
        rows={rows}
        status={status}
        isSimulating={isSimulating}
        simulationError={simulationError}
        onClose={() => setConfirming(false)}
        onConfirm={submit}
        onReset={reset}
      />
    </main>
  );
}
