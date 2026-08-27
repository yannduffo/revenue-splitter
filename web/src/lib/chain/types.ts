import type { Address } from 'viem';

export type Member = {
  address: Address
  shareBps : number     //sum = 10_000
}

export type Splitter = {
  address: Address
  members: Member[]     //sorted by decreasing sharedDistribution
}

//one token balances of a Splitter contract
export type SplitterToken = {
  address: Address
  symbol: string
  decimals: number
  held: bigint          //balanceOf(splitter)
  attributed: bigint    //getTotalAttributed
  claimed: bigint       //getTotalClaimed
  unattributed: bigint  //held - (attributed - claimed)
}

export type MemberBalance = {
  member: Address
  pending: bigint
  claimed: bigint
}
