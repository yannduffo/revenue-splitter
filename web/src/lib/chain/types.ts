import type { Address } from 'viem';

export type Member = {
  address: Address
  shareBps : number     //sum = 10_000
}

export type Splitter = {
  address: Address
  members: Member[]     //sorted by decreasing sharedDistribution
}

export type SplitterToken = {
  address: Address
  symbol: string
  decimals: number
  held: bigint          //balanceOf(splitter)
  attributed: bigint    //getTotalAttributed
  claimed: bigint       //getTotalClaimed
}

export type Pending = {
  token: Address
  member: Address
  amount: bigint
}
