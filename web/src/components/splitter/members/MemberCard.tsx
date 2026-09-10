"use client";

import type { CSSProperties } from "react";

//lib/
import { formatBps, shareTone, shortenAddress } from "@/lib/format";
import type { Member, MemberBalance, SplitterToken } from "@/lib/chain/types";

//components/
import { MemberFlowChart } from "./MemberFlowChart";

import { User, ChevronDown } from "lucide-react";

// Carte compacte : elle ne change pas de place quand on l'ouvre.
// La carte entière est le bouton de bascule ; le chevron n'est qu'un indicateur.
// État sélectionné = contour shareTone + fond légèrement teinté + léger agrandissement.
// Le scale ne joue que sur le transform, donc il ne pousse aucune carte voisine :
// il déborde dans le gap de la grille, d'où le z-10 pour passer par-dessus.
export function MemberCard({
  member,
  index,
  total,
  balance,
  token,
  isOpen,
  onToggle,
  isConnected,
}: {
  member: Member;
  index: number;
  total: number;
  balance?: MemberBalance;
  token: SplitterToken;
  isOpen: boolean;
  onToggle: () => void;
  isConnected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      //border-2 i every state so hover doesn't move the card
      style={{ "--tone": shareTone(index, total).bg } as CSSProperties}
      className={`relative w-full cursor-pointer rounded-xl border-2 p-3 text-left transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out ${
        isOpen
          ? "z-10 scale-[1.02] border-[var(--tone)] bg-[#F1F8F5] shadow-md"
          : "border-rule border-t-[var(--tone)] bg-surface hover:border-[var(--tone)]"
      }`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
            <User size={16} />
            {shortenAddress(member.address)}
            <span className="text-rule">•</span>
            {formatBps(member.shareBps)}
            {isConnected && (
              <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-paper">
                you
              </span>
            )}
          </span>

          <span
            aria-hidden="true"
            className={`shrink-0 transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180 text-[var(--tone)]" : "text-muted"
            }`}
          >
            <ChevronDown size={16} />
          </span>
        </div>

        <MemberFlowChart
          pending={balance?.pending ?? 0n}
          claimed={balance?.claimed ?? 0n}
          decimals={token.decimals}
          symbol={token.symbol}
        />
      </div>
    </button>
  );
}
