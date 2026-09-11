import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAddress } from "viem";
import { shortenAddress } from "@/lib/format";

// metadata export is server side : we are using a server side layout because our page is 'use client'
export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;

  return {
    title: isAddress(address)
      ? `Splitter ${shortenAddress(address)}`
      : "Splitter",
    description:
      "Live balances and claimable amounts for every member of this splitter.",
  };
}

export default function SplitterLayout({ children }: { children: ReactNode }) {
  return children;
}
