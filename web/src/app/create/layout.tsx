import type { Metadata } from "next";
import type { ReactNode } from "react";

// metadata export is server side : we are using a server side layout because our page is 'use client'
export const metadata: Metadata = {
  title: "Create a splitter",
  description:
    "Set up a new splitter: add members, set each share, and deploy it on-chain. The allocation is permanent.",
};

export default function CreateLayout({ children }: { children: ReactNode }) {
  return children;
}
