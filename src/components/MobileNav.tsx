"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Terminal, Shield, Rss } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-2 py-3 pb-safe">
      <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/' ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}>
         <Home size={20} />
         <span className="text-[10px] font-medium tracking-wide">Home</span>
      </Link>
      <Link href="/vault" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/vault' ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}>
         <Shield size={20} />
         <span className="text-[10px] font-medium tracking-wide">Vault</span>
      </Link>
      <Link href="/trade" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/trade' ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}>
         <Terminal size={20} />
         <span className="text-[10px] font-medium tracking-wide">Terminal</span>
      </Link>
      <Link href="/feeds" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/feeds' ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}>
         <Rss size={20} />
         <span className="text-[10px] font-medium tracking-wide">Feeds</span>
      </Link>
    </div>
  );
}
