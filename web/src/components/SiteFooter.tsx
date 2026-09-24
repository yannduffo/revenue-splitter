"use client";

import { ExternalLink } from "lucide-react";
import {
  explorerUrl,
  FACTORY_ADDRESS,
  IMPLEMENTATION_ADDRESS,
} from "@/lib/chain/config";
import { shortenAddress } from "@/lib/format";
import type { Address } from "viem";

const REPO = "https://github.com/yannduffo/revenue-splitter";
const AUTHOR = "https://yannduffo.com";

//plain text when there is no explorer (anvil) : the footer degrades instead of vanishing
function ContractLink({ label, address }: { label: string; address: Address }) {
  const url = explorerUrl("address", address);
  const body = (
    <>
      {label} <span className="font-mono">{shortenAddress(address)}</span>
      {url && <ExternalLink size={11} />}
    </>
  );

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1 transition-colors hover:text-accent"
    >
      {body}
    </a>
  ) : (
    <span className="flex items-center gap-1">{body}</span>
  );
}

export function SiteFooter() {
  return (
    //bottom padding clears the floating Demo tools button : it overlaps the
    //left-aligned disclaimer on mobile only, hence the two values
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-275 flex-col gap-2 px-4 pb-12 pt-6 text-xs text-muted sm:px-8 sm:pb-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ContractLink label="Factory" address={FACTORY_ADDRESS} />

            {/* clones delegate here : this is the only readable source on the explorer */}
            {IMPLEMENTATION_ADDRESS && (
              <ContractLink
                label="Implementation"
                address={IMPLEMENTATION_ADDRESS}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-accent"
            >
              Source <ExternalLink size={11} />
            </a>

            <a
              href={AUTHOR}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-accent"
            >
              Built by Yann Duffo <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* "testnet" is already said by the network badge and the demo panel :
            only the audit status is new information here */}
        <p>Unaudited contracts, for demonstration only.</p>
      </div>
    </footer>
  );
}
