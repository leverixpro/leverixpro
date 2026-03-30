import type { Metadata } from "next";
import "./globals.css";
import { AppWalletProvider } from "@/components/WalletProvider";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "LeverixPro | AI-Powered Solana DEX",
  description: "Advanced institutional-grade decentralized trading powered by xAI and Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body>
        <div className="relative z-0 min-h-screen">
          <div className="fixed inset-0 bg-black/40 -z-10 pointer-events-none mix-blend-multiply" />
          <ScrollToTop />
          <AppWalletProvider>
            {children}
            <MobileNav />
          </AppWalletProvider>
        </div>
      </body>
    </html>
  );
}
