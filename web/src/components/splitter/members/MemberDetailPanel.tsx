"use client";

import { useState, type CSSProperties } from "react";
import type { Address } from "viem";

//lib/
import { formatBps } from "@/lib/format";
import type { MemberTokenRow } from "@/lib/chain/balance";

//components/
import { MemberFlowChart } from "./MemberFlowChart";
import { ClaimAction } from "../../tx/ClaimAction";
import { ClaimManyAction } from "../../tx/ClaimManyAction";

import { User } from "lucide-react";

// detail panel for a member : old "extended version of MemberCard"
export function MemberDetailPanel({
  splitter,
  account,
  shareBps,
  tone,
  isOpen,
  detail,
  isLoading,
  isConnected,
  canAct,
}: {
  splitter: Address;
  account: Address;
  shareBps: number;
  tone: string;
  isOpen: boolean;
  detail?: MemberTokenRow[];
  isLoading?: boolean;
  isConnected?: boolean;
  canAct: boolean;
}) {
  const [frozen, setFrozen] = useState(detail);
  if (detail && detail !== frozen) setFrozen(detail);
  const rows = detail ?? frozen;

  const claimable = rows?.filter((r) => r.pending > 0n) ?? [];
  const showClaimMany = Boolean(isConnected && canAct && claimable.length >= 2);

  return (
    <div
      className={`col-span-full grid transition-[grid-template-rows] duration-300 ease-out ${
        isOpen ? "grid-rows-[1fr] starting:grid-rows-[0fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <div
          style={{ borderTopColor: tone } as CSSProperties}
          className={`rounded-xl border-2 border-rule bg-surface p-3 transition-opacity duration-200 ${
            isOpen ? "opacity-100 delay-75 starting:opacity-0" : "opacity-0"
          }`}
        >
          <span className="flex items-center gap-1.5 pb-2 font-mono text-xs text-muted">
            <User size={16} />
            {account}
            <span className="text-rule">•</span>
            {formatBps(shareBps)}
          </span>

          {isLoading && <p className="pt-3 text-sm text-muted">Loading…</p>}

          {rows?.map((row) => (
            <div
              key={row.token}
              className="flex gap-3 border-b border-rule py-2 last:border-0"
            >
              <span className="w-12 shrink-0 font-mono text-sm">
                {row.symbol}
              </span>
              <div className="min-w-0 flex-1">
                <MemberFlowChart
                  pending={row.pending ?? 0n}
                  claimed={row.claimed ?? 0n}
                  decimals={row.decimals}
                  symbol={row.symbol}
                />
              </div>
              {isConnected && (
                <ClaimAction
                  splitter={splitter}
                  token={row.token}
                  account={account}
                  pending={row.pending}
                  canAct={canAct}
                />
              )}
            </div>
          ))}

          {showClaimMany && (
            <div className="flex justify-end pt-3">
              <ClaimManyAction
                splitter={splitter}
                account={account}
                tokens={claimable.map((r) => r.token)}
                canAct={canAct}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
