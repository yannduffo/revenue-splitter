import { ExternalLink } from "lucide-react";
import type { SplitterToken } from "@/lib/chain/types";
import { explorerUrl } from "@/lib/chain/config";

export function TokenSelector({
  tokens,
  selected,
  onSelect,
}: {
  tokens: SplitterToken[];
  selected?: string;
  onSelect: (token: string) => void;
  }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((token) => {
        const isSelected = selected === token.address
        //undefined sur anvil : la pilule reste alors un simple bouton
        const url = explorerUrl('address', token.address)

        return (
          //cuting the pill in two : token name & link to etherscan
          <div
            key={token.address}
            className={`flex items-stretch overflow-hidden rounded-lg border text-sm ${
              isSelected
                ? 'border-accent bg-accent text-paper'
                : 'border-rule bg-surface text-muted hover:border-muted'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(token.address)}
              className="cursor-pointer px-3 py-1.5"
            >
              {token.symbol}
            </button>

            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                title={`View ${token.symbol} on the explorer`}
                className={`flex items-center border-l px-2 ${
                  isSelected
                    ? 'border-paper/30 hover:bg-paper/15'
                    : 'border-rule hover:text-accent'
                }`}
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
