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
import { useHistory } from "@/hooks/useHistory";
//components
import { AllocationBar } from "@/components/splitter/AllocationBar";
import { TokenSelector } from "@/components/splitter/tokens/TokenSelector";
import { AddTokenInput } from "@/components/splitter/tokens/AddTokenInput";
import { MemberGrid } from "@/components/splitter/members/MemberGrid";
import { MessagePage } from "@/components/MessagePage";
import { DemoBadge } from "@/components/splitter/DemoBadge";
import { isDemoSplitter, explorerUrl } from "@/lib/chain/config";
import { useSplitterBlock } from "@/hooks/useSplitterBlock";
import { ActivityTable } from "@/components/splitter/ActivityTable";
import { Plus, X, ExternalLink } from "lucide-react";

export default function SplitterPage() {
  const params = useParams<{ address: string }>();
  const address = params.address;

  const [manualTrackingOpen, setManualTrackingOpen] = useState(false)

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

  const { data: history, isLoading : isLoadingHistory} = useHistory(splitter, fromBlock)

  //only using 'token-balances' and 'member-detail' keys because 'splitter-tokens' key would "overcall" getlogs calls
  // adding 'history' key would garanty an fresh history but would also overload the API
  useInvalidateOnBlock(["token-balances", "member-detail",]);

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

  if (!splitter)
    return (
      <MessagePage
        heading="/ not a splitter address "
        message="This is not a valid splitter address. Check the link you followed, or browse the existing splitters from the home page."
      />
    );
  if (!info) return <p className="p-8 text-muted">Loading…</p>;

  //TODO : avant de rendre la page détail, il faudrait vérifier si le splitter est officiel (récupérable en intérrogeant "isOfficialSplitter" de lib/chain/factory.ts)
  return (
    <main className="flex flex-col mx-auto max-w-275 p-6 gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-4 items-center">
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
          {explorerUrl('address', splitter) && (
            <a
              href={explorerUrl('address', splitter)}
              target="_blank"
              rel="noreferrer"
              title="View this splitter on the explorer"
              className="self-center text-muted transition-colors hover:text-accent"
            >
              <ExternalLink size={16} />
            </a>
          )}
          {isDemoSplitter(splitter) && <DemoBadge />}
        </div>

        {/*
        <p className=" text-muted">
          Live balances for every member of this splitter, token by token.
          Connect your wallet to claim your share
        </p>
        */}
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
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">Splitter tokens :</p>

                <button
                  type="button"
                  onClick={() => setManualTrackingOpen((current) => !current)}
                  className="text-[11px] text-muted transition-colors hover:text-accent hover:font-medium"
                >
                    {manualTrackingOpen ? (
                      <div className="flex gap-0.5 items-center">
                        <X size={11} />
                        <span>Close manual tracking</span>
                      </div>
                    ) : (
                      <div className="flex gap-0.5 items-center">
                        <Plus size={11} />
                        <span>Add token tracking manually</span>
                      </div>
                    )}
                </button>
              </div>

              <div
                className={`grid transition-all duration-300 ease-out ${
                  manualTrackingOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <AddTokenInput onAdd={addToken} />
                </div>
              </div>

              <TokenSelector
                tokens={tokens}
                selected={activeToken.address}
                onSelect={setToken}
              />
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
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted">Activity :</p>
                <ActivityTable entries={history} tokens={tokens} isLoading={isLoadingHistory} />
              </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
