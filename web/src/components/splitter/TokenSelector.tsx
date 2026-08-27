import type { SplitterToken } from "@/lib/chain/types";

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
    <div className="flex gap-2">
      {tokens.map((token) => (
        <button
          key={token.address}
          onClick={() => onSelect(token.address)}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            selected === token.address
              ? 'border-accent bg-accent text-paper'
              : 'border-rule bg-surface text-muted hover:border-muted'
            }`}>
              {token.symbol}
          </button>
      ))}
    </div>
  )
}
