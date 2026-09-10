import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { Providers } from "@/lib/providers";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { NetworkBadge } from "@/components/NetworkBadge";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Revenue Splitter",
  description: "Immutable ERC-20 revenue splitting",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b border-rule">
            <div className="mx-auto flex items-center justify-between px-8 py-4">
              <Link href={"/"}>
                <Image
                  src="/logo-text-spaced.svg"
                  alt="Splittr"
                  width={120}
                  height={20}
                />
              </Link>
              <div className="flex items-center gap-3">
                <NetworkBadge />
                <span className="text-muted/20 text-lg">|</span>
                <ConnectButton />
              </div>
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}

{/* <span className="text-sm">Revenue Splitter</span> */}
