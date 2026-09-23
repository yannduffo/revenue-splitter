import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { Providers } from "@/lib/providers";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { NetworkBadge } from "@/components/NetworkBadge";
import { DemoPanel } from "@/components/demo/DemoPanel";
import Link from "next/link";
import Image from "next/image";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://revenue-splitter.yannduffo.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), //metadataBase pointing to the prod url
  title: {
    default: "Splittr — immutable ERC-20 revenue splitting",
    template: "%s · Splittr",
  },
  description:
    "Split ERC-20 revenue between a fixed set of members. Shares are set at creation and can never be changed, each member claims their share on-chain.",
  openGraph: {
    type: "website",
    siteName: "Splittr",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b border-rule">
            <div className="mx-auto flex items-center justify-between px-4 py-4 sm:px-8">
              <Link href={"/"}>
                {/* 608x155 source : 120x31 keeps the ratio */}
                <Image
                  src="/logo-texte-sans-fond-selection.png"
                  alt="Splittr"
                  width={120}
                  height={31}
                  className="hidden sm:block"
                />
                <Image
                  src="/logo-no-txt.svg"
                  alt="Splittr"
                  width={32}
                  height={32}
                  className="sm:hidden"
                />
              </Link>
              <div className="flex items-center gap-3">
                <NetworkBadge />
                <span className="hidden text-lg text-muted/20 sm:inline">|</span>
                <ConnectButton />
              </div>
            </div>
          </header>
          {children}
          <DemoPanel />
        </Providers>
      </body>
    </html>
  );
}

{/* <span className="text-sm">Revenue Splitter</span> */}
