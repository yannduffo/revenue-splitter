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
import { useInvalidateOnInterval } from "@/hooks/useInvalidateOnInterval";
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
import { shortenAddress } from "@/lib/format";
import { useSplitterBlock } from "@/hooks/useSplitterBlock";
import { useIsOfficialSplitter } from "@/hooks/useIsOfficialSplitter";
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

  const { data: official } = useIsOfficialSplitter(splitter);
  const { data: info } = useSplitter(splitter);
  const { data: fromBlock } = useSplitterBlock(splitter);

  const { data: tokens } = useSplitterTokens(splitter, extraToken, fromBlock);
  const { data: detail, isLoading: isLoadingDetail } = useMemberDetail(
    splitter, openMember, tokens, fromBlock
  )

  const { data: history, isLoading : isLoadingHistory} = useHistory(splitter, fromBlock)

  //only using 'token-balances' and 'member-detail' keys because 'splitter-tokens' key would "overcall" getlogs calls
  // adding 'history' key would garanty an fresh history but would also overload the API
  useInvalidateOnInterval(["token-balances", "member-detail"]);

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
  //checked if it's official before reading the splitter (qyery on getMembers() would otherwise leave the page spinning forever)
  if (official === undefined)
    return <p className="p-8 text-muted">Loading…</p>;

  if (!official)
    return (
      <MessagePage //we are using 404 model
        heading="/ unknown contract "
        message="This address is not a splitter created by the official factory. It may be an unrelated contract, or an imitation — don't interact with it."
      />
    );

  if (!info) return <p className="p-8 text-muted">Loading…</p>;

  return (
    <main className="flex flex-col mx-auto max-w-275 p-4 gap-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-4 items-center">
          <h1 className='flex gap-2'>
            {/* alt="" : the header already carries the brand, here it is decoration */}
            <Image
              src="/logo-no-txt.svg"
              alt=""
              width={38}
              height={38}
            />
            <span className='text-base font-mono sm:text-xl lg:text-2xl'>
              <span className="sm:hidden">/ s / </span>
              <span className="hidden sm:inline">/ splitter / </span>
            </span>
            <span className="font-mono text-base sm:text-xl lg:text-2xl">
              {/* full address at text-2xl needs ~990px of room */}
              <span className="lg:hidden">{shortenAddress(splitter, 4)}</span>
              <span className="hidden lg:inline">{splitter}</span>
            </span>
          </h1>
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
      <section className="flex flex-col gap-2">
        <h2 className="text-xs text-muted">Shares distribution : </h2>
        <AllocationBar members={info.members} />
      </section>
      <div>
        {!tokens?.length ? (
          <section className="flex flex-col gap-1">
            <h2 className="text-xs text-muted">Splitter tokens :</h2>
            <p className="rounded-xl border border-rule bg-surface p-6 text-sm text-muted">
              No tokens received yet. Send any ERC-20 to the address above.
            </p>
            <AddTokenInput onAdd={addToken} />
          </section>
        ) : activeToken ? (
          <div className="space-y-4">
            <section className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xs text-muted">Splitter tokens :</h2>

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
            </section>
            <section className="flex flex-col gap-2">
              <h2 className="text-xs text-muted">Members status :</h2>
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
              </section>
              <section className="flex flex-col gap-2">
                <h2 className="text-xs text-muted">Activity :</h2>
                <ActivityTable entries={history} tokens={tokens} isLoading={isLoadingHistory} />
              </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
