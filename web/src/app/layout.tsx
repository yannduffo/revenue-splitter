import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { Providers } from "@/lib/providers";
import { ConnectButton } from "@/components/wallet/ConnectButton";

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
            <div className="mx-auto flex max-w-275 items-center justify-between px-8 py-4">
              <span className="text-sm">Revenue Splitter</span>
              <ConnectButton />
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
