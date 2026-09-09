"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { isAddress, type Address } from "viem";
//hooks
import { useSplitter } from "@/hooks/useSplitter";
import { useSplitterTokens } from "@/hooks/useSplitterTokens";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useMemberDetail } from "@/hooks/useMemberDetail";
import { useInvalidateOnBlock } from "@/hooks/useInvalidateOnBlock";
import { useConnectedMember } from "@/hooks/useConnectedMember";
//components
import { AllocationBar } from "@/components/splitter/AllocationBar";
import { TokenSelector } from "@/components/splitter/TokenSelector";
import { AddTokenInput } from "@/components/splitter/AddTokenInput";
import { MemberGrid } from "@/components/splitter/MemberGrid";
import { useSplitterBlock } from "@/hooks/useSplitterBlock";

export default function SplitterPage() {
  const params = useParams<{ address: string }>();
  const address = params.address;

  const splitter = isAddress(address) ? (address as Address) : undefined;

  const [token, setToken] = useState<string>();
  const [extraToken, setExtraToken] = useState<Address[]>([])

  const [openMember, setOpenMember] = useState<Address>()
  const [touched, setTouched] = useState(false) //flag to auto-open member's card only the 1st time

  const { data: info } = useSplitter(splitter);
  const { data: fromBlock } = useSplitterBlock(splitter);

  const { data: tokens } = useSplitterTokens(splitter, extraToken, fromBlock);
  const { data: detail, isLoading: isLoadingDetail } = useMemberDetail(
    splitter, openMember, tokens, fromBlock
  )

  //only using 'token-balances' and 'member-detail' keys because 'splitter-tokens' key would "overcall" getlogs calls
  useInvalidateOnBlock(["token-balances", "member-detail"]);

  const activeToken = useMemo(
    () => tokens?.find((t) => t.address === token) ?? tokens?.[0],
    [tokens, token],
  );

  const { data: balances } = useTokenBalances(
    splitter,
    activeToken?.address,
    info?.members,
    fromBlock
  );

  const {address: connectedAddress, isMember, canAct} = useConnectedMember(info?.members)

  const handleToggle = (member?: Address) => {
    setTouched(true)
    setOpenMember(member)
  }

  const addToken = (token: Address) => {
    setExtraToken((current) =>
      current.some((t) => t.toLowerCase() === token.toLowerCase()) ? current : [...current, token])
  }

  useEffect(() => {
    if(!touched && isMember && connectedAddress) setOpenMember(connectedAddress)
  }, [touched, isMember, connectedAddress])

  if (!splitter) return <p className="p-8 text-muted">Not a valid address.</p>;
  if (!info) return <p className="p-8 text-muted">Loading…</p>;

  //TODO : avant de rendre la page détail, il faudrait vérifier si le splitter est officiel (récupérable en intérrogeant "isOfficialSplitter" de lib/chain/factory.ts)
  return (
    <main className="flex flex-col mx-auto max-w-275 p-6 gap-4">
      <div className="flex gap-2 items-baseline">
        <div className='flex gap-2'>
          <Image
            src="/logo-no-txt.svg"
            alt="Logo"
            width={38}
            height={38}
          />
          <span className='text-2xl font-mono'>/ splitter / </span>
          <span className="font-mono text-2xl">{splitter}</span>
        </div>
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
            <AddTokenInput onAdd={addToken} />
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
                <AddTokenInput onAdd={addToken} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted">Members status :</p>
              <MemberGrid
                splitter={splitter}
                members={info.members}
                balances={balances}
                token={activeToken}
                openMember={openMember}
                onToggle={handleToggle}
                detail={detail}
                isLoadingDetail={isLoadingDetail}
                connectedAddress={connectedAddress}
                canAct={canAct}
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
