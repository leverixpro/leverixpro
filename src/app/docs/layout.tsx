import Link from 'next/link';
import { BookOpen, Code, ExternalLink } from 'lucide-react';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#040404] text-gray-200">
      {/* Docs Header */}
      <header className="sticky top-0 w-full z-40 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center h-16 px-6 gap-8">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <img src="/logo.jpeg" alt="LeverixPro Logo" className="w-7 h-7 rounded-md object-cover transform scale-[1.2] shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all" />
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter">
              LeverixPro
            </span>
            <span className="text-[10px] font-mono text-gray-600 border border-white/10 px-1.5 py-0.5 rounded ml-1">DOCS</span>
          </Link>

          {/* Quick nav */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-gray-500">
            <Link href="#whitepaper" className="hover:text-white transition-colors">Whitepaper</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How To Use</Link>
            <Link href="#architecture" className="hover:text-white transition-colors">Architecture</Link>
            <Link href="#security" className="hover:text-white transition-colors">Security</Link>
            <Link href="#roadmap" className="hover:text-white transition-colors">Roadmap</Link>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <a 
              href="https://github.com/leverixpro/leverixpro" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20"
            >
              <Code size={12} /> Source <ExternalLink size={10} />
            </a>
            <Link 
              href="/trade"
              className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
            >
              Launch App →
            </Link>
          </div>
        </div>
      </header>

      {/* Full-width content — no prose constraint, let the page own its layout */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
