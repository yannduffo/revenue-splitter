"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { isAddress, type Address } from "viem";
import { useSplitter } from "@/hooks/useSplitter";
import { useSplitterTokens } from "@/hooks/useSplitterTokens";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useInvalidateOnBlock } from "@/hooks/useInvalidateOnBlock";
import { AllocationBar } from "@/components/splitter/AllocationBar";
import { TokenSelector } from "@/components/splitter/TokenSelector";
import { MemberGrid } from "@/components/splitter/MemberGrid";
import { shortenAddress } from "@/lib/format";

export default function SplitterPage() {
  const params = useParams<{ address: string }>();
  const address = params.address;

  const splitter = isAddress(address) ? (address as Address) : undefined;

  const [token, setToken] = useState<string>();
  const [member, setMember] = useState<string>();

  const { data: info } = useSplitter(splitter);
  const { data: tokens } = useSplitterTokens(splitter);

  useInvalidateOnBlock(["splitter-tokens", "token-balances"]);

  const activeToken = useMemo(
    () => tokens?.find((t) => t.address === token) ?? tokens?.[0],
    [tokens, token],
  );

  const { data: balances } = useTokenBalances(
    splitter,
    activeToken?.address,
    info?.members,
  );

  if (!splitter) return <p className="p-8 text-muted">Not a valid address.</p>;
  if (!info) return <p className="p-8 text-muted">Loading…</p>;

  return (
    <main className="flex flex-col mx-auto max-w-275 p-6 gap-4">
      <div>
        <p className="text-md text-muted">Splitter</p>
        <p className="font-mono text-lg">{shortenAddress(splitter, 6)}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted">Shares distribution : </p>
        <AllocationBar members={info.members} />
      </div>
      <div>
        {!tokens?.length ? (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted">Splitter tokens :</p>
            <p className="rounded-xl border border-rule bg-surface p-6 text-sm text-muted">
              No tokens received yet. Send any ERC-20 to the address above.
            </p>
          </div>
        ) : activeToken ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted">Splitter tokens :</p>
              <TokenSelector
                tokens={tokens}
                selected={activeToken.address}
                onSelect={setToken}
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted">Members status :</p>
              <MemberGrid
                members={info.members}
                balances={balances}
                token={activeToken}
                selected={member}
                onSelect={setMember}
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
