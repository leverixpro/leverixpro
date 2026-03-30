"use client";

import { useState, useEffect, useRef } from "react";
import { 
  CheckCircle, Zap, Shield, TrendingUp, Terminal, Code, Cpu, Lock,
  BookOpen, Network, Layers, ArrowRight, Globe, Users, Target,
  Activity, Bot, Wallet, ChevronDown, ExternalLink, Star, Flame
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";

// Animated counter hook  
function useCounter(to: number, start: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let current = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [start, to]);
  return val;
}

function StatCard({ value, suffix, label, start }: { value: number; suffix: string; label: string; start: boolean }) {
  const count = useCounter(value, start);
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-white font-mono tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-500 mt-1 tracking-wider uppercase">{label}</div>
    </div>
  );
}

const NAV_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "whitepaper", label: "Whitepaper" },
  { id: "how-it-works", label: "How It Works" },
  { id: "architecture", label: "Architecture" },
  { id: "security", label: "Security" },
  { id: "roadmap", label: "Roadmap" },
];

// Floating animated orb background
function FloatingOrb({ x, y, size, color, delay }: any) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, filter: "blur(80px)", opacity: 0.12 }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.3 });
    NAV_SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingOrb x={10} y={20} size={600} color="rgba(99,102,241,1)" delay={0} />
        <FloatingOrb x={70} y={60} size={500} color="rgba(34,197,94,1)" delay={3} />
        <FloatingOrb x={50} y={10} size={400} color="rgba(59,130,246,1)" delay={1.5} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-32">

        {/* ── HERO ── */}
        <motion.section 
          id="overview"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="pt-20 pb-20"
        >
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold tracking-widest text-white uppercase mb-8 shadow-lg"
            >
              <Zap size={12} className="text-yellow-400" />
              LeverixPro — Technical Documentation v1.0
            </motion.div>

            <h1 className="text-6xl sm:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              The Autonomous<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
                DeFi Intelligence
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-12">
              LeverixPro is an open-source AI trading system built on Solana that lets a custodial AI agent execute 
              perpetual futures positions on your behalf, 24 hours a day, with strict capital preservation protocols.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/trade" className="bg-white text-black font-bold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-2">
                Launch Terminal <ArrowRight size={16} />
              </Link>
              <a href="https://github.com/leverixpro/leverixpro" target="_blank" rel="noreferrer" className="bg-white/5 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                <Code size={16} /> View Source <ExternalLink size={14} className="text-gray-500" />
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 p-8 glass-card border border-white/5 bg-black/40"
          >
            <StatCard value={83} suffix="%" label="Winrate Target" start={statsInView} />
            <StatCard value={65000} suffix="+" label="TPS Solana Network" start={statsInView} />
            <StatCard value={0} suffix=" SOL" label="Deploy Cost" start={statsInView} />
            <StatCard value={24} suffix="/7" label="Autonomous Trading" start={statsInView} />
          </motion.div>
        </motion.section>

        {/* ── STICKY SIDE NAV ── */}
        <div className="flex gap-16 relative">
          <aside className="hidden xl:block w-56 shrink-0">
            <div className="sticky top-28 space-y-1">
              <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-4">On This Page</p>
              {NAV_SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-all ${
                    activeSection === s.id 
                      ? "text-white bg-white/10 font-semibold border-l-2 border-white" 
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex-1 space-y-24 min-w-0">

            {/* ── WHITEPAPER ── */}
            <section id="whitepaper" className="scroll-mt-28">
              <SectionHeader
                icon={<BookOpen size={22} className="text-purple-400" />}
                badge="Whitepaper"
                title="Vision & Mission"
                color="purple"
              />

              <div className="grid md:grid-cols-2 gap-6 mt-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="p-8 glass-card border border-purple-500/20 bg-purple-900/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                    <Target size={26} className="text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    A world where institutional-grade algorithmic trading is no longer gated behind expensive quant firms, 
                    private APIs, or deep technical knowledge. LeverixPro democratizes autonomous financial intelligence 
                    by making a self-directing AI agent accessible to any wallet holder on Solana.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="p-8 glass-card border border-blue-500/20 bg-blue-900/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                    <Globe size={26} className="text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    Build the most transparent, safest, and most intelligent autonomous DeFi agent on Solana — 
                    fully open-source, verifiable by anyone. We do not take custody of funds. We do not earn from spreads. 
                    We publish our entire logic on-chain and on GitHub.
                  </p>
                </motion.div>
              </div>

              {/* Core Principles */}
              <div className="mt-8 p-8 glass-card border border-white/5 bg-[#0a0a0a]">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Star size={18} className="text-yellow-400" /> Core Principles
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: <Lock size={18} className="text-green-400" />, title: "Non-Custodial Architecture", desc: "Your funds live in your wallet. The agent wallet is a separate custodial address that you fund voluntarily — withdrawable at any time with one click." },
                    { icon: <Code size={18} className="text-blue-400" />, title: "Fully Open Source", desc: "Every line of code — from AI prompts to Vault APIs — is published on GitHub. No black boxes, no hidden fees, no rug vectors." },
                    { icon: <Shield size={18} className="text-purple-400" />, title: "Capital Preservation First", desc: "The Aegis Defense Matrix enforces hard constraints on leverage, drawdown, and position sizing. No instruction can bypass these rules." },
                  ].map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        {p.icon}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm mb-1">{p.title}</div>
                        <div className="text-gray-500 text-xs leading-relaxed">{p.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="scroll-mt-28">
              <SectionHeader
                icon={<Layers size={22} className="text-blue-400" />}
                badge="How To Use"
                title="Getting Started in 4 Steps"
                color="blue"
              />

              <div className="mt-10 relative">
                {/* Vertical timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-green-500/50" />

                <div className="space-y-8 ml-16">
                  {[
                    {
                      n: "01",
                      color: "blue",
                      icon: <Wallet size={22} className="text-blue-400" />,
                      title: "Connect Your Wallet",
                      desc: "Click the Phantom-branded wallet button in the top navigation. Connect your Solana wallet (Phantom, Solflare, or any adapter-compatible wallet). Your identity is verified cryptographically — no passwords, no email.",
                      tag: "Phantom / Solflare"
                    },
                    {
                      n: "02",
                      color: "purple",
                      icon: <Shield size={22} className="text-purple-400" />,
                      title: "Fund Your Agent Vault",
                      desc: "Navigate to Agent Vault. The system automatically generates a unique, dedicated AI Wallet Address for your account. Send SOL from your Phantom wallet to this address. This is the capital your AI agent will trade with.",
                      tag: "No Smart Contract Fees"
                    },
                    {
                      n: "03",
                      color: "green",
                      icon: <Bot size={22} className="text-green-400" />,
                      title: "Brief Your AI Agent",
                      desc: "Open the Trade Terminal. Talk to the Leverix Core Agent naturally. Ask for a market analysis first: 'How is SOL performing?' — it will return a social sentiment score. When ready, say 'Long SOL with 5x leverage' and receive a Trade Proposal Ticket.",
                      tag: "NLP → Proposal Ticket"
                    },
                    {
                      n: "04",
                      color: "yellow",
                      icon: <CheckCircle size={22} className="text-yellow-400" />,
                      title: "Approve & Let It Run",
                      desc: "Review the Trade Proposal Ticket containing: Direction, Leverage, Size, Take Profit, and Stop Loss. Click Approve & Execute. After execution, the agent monitors positions 24/7. Return any time to Withdraw your capital.",
                      tag: "Withdraw Anytime"
                    },
                  ].map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative glass-card p-6 border border-white/5 bg-black/40 hover:border-white/10 transition-all"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[52px] w-8 h-8 rounded-full border-2 flex items-center justify-center bg-[#0a0a0a] border-${step.color}-500/50`}>
                        <span className={`text-[10px] font-mono font-bold text-${step.color}-400`}>{step.n}</span>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl bg-${step.color}-500/10 border border-${step.color}-500/20 flex items-center justify-center shrink-0`}>
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-bold">{step.title}</h3>
                            <span className={`text-[10px] font-mono font-bold text-${step.color}-400 bg-${step.color}-500/10 px-2 py-0.5 rounded border border-${step.color}-500/20`}>
                              {step.tag}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Example prompts */}
              <div className="mt-10 p-6 bg-[#0d0f11] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal size={16} className="text-green-400" />
                  <span className="text-sm font-mono text-gray-400">Example Prompts — Copy & Paste</span>
                </div>
                <div className="space-y-3">
                  {[
                    { type: "ANALYSIS", text: '"What is the current social sentiment for SOL? Is the market bullish or bearish?"' },
                    { type: "PROPOSAL", text: '"Long JUP with 5x leverage, use conservative sizing."' },
                    { type: "ANALYSIS", text: '"Give me a technical breakdown of BTC momentum this week."' },
                    { type: "PROPOSAL", text: '"Short WIF with tight stop loss, market looks overheated."' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${
                        p.type === "ANALYSIS" ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : "text-green-400 border-green-500/30 bg-green-500/10"
                      }`}>{p.type}</span>
                      <span className="text-gray-300 text-sm font-mono">{p.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── ARCHITECTURE ── */}
            <section id="architecture" className="scroll-mt-28">
              <SectionHeader
                icon={<Network size={22} className="text-green-400" />}
                badge="Technical"
                title="System Architecture"
                color="green"
              />

              {/* Architecture Diagram */}
              <div className="mt-10 p-8 bg-[#050607] border border-white/5 rounded-2xl font-mono text-xs overflow-x-auto">
                <div className="flex items-center gap-2 mb-6 text-gray-500">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-700"/><div className="w-3 h-3 rounded-full bg-gray-700"/><div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"/></div>
                  system_architecture.svg
                </div>
                <ArchitectureDiagram />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {[
                  {
                    icon: <Cpu size={20} className="text-blue-400" />,
                    title: "xAI Grok Integration Layer",
                    color: "blue",
                    items: [
                      "Model: grok-4-1-fast-reasoning via x.ai API",
                      "Prompt engineering with Claw Engine v4.0 framework",
                      "JSON-structured output: ANALYSIS or PROPOSAL type",
                      "Social sentiment parsing from X/Twitter corpus",
                      "Dual-mode: Signal only vs. Trade execution"
                    ]
                  },
                  {
                    icon: <Wallet size={20} className="text-purple-400" />,
                    title: "Custodial Agent Wallet",
                    color: "purple",
                    items: [
                      "Solana Keypair generated per-user via @solana/web3.js",
                      "Private key stored in Database with RLS policies",
                      "Agent executes Jupiter v6 swaps autonomously",
                      "Owner withdrawal via backend-signed SystemProgram.transfer",
                      "No Smart Contract deployment required (0 SOL cost)"
                    ]
                  },
                  {
                    icon: <Activity size={20} className="text-green-400" />,
                    title: "Market Data Layer",
                    color: "green",
                    items: [
                      "GeckoTerminal API via internal Next.js proxy (/api/market)",
                      "CoinCap API for global top-5 ticker data",
                      "TradingView Lightweight Charts for candlestick rendering",
                      "K-line data proxied via /api/klines to avoid CORS",
                      "Real-time price via GeckoTerminal WebSocket pools"
                    ]
                  },
                  {
                    icon: <Shield size={20} className="text-green-400" />,
                    title: "Database & Auth",
                    color: "green",
                    items: [
                      "Database PostgreSQL with Row Level Security",
                      "Tables: profiles, orders, feeds, agent_wallets",
                      "Wallet address as primary auth identifier (no email)",
                      "Service Role Key used only in backend API routes",
                      "Public keys visible; private keys RLS-protected"
                    ]
                  }
                ].map((block, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 glass-card border border-${block.color}-500/15 bg-${block.color}-900/5`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-9 h-9 rounded-xl bg-${block.color}-500/10 border border-${block.color}-500/20 flex items-center justify-center`}>
                        {block.icon}
                      </div>
                      <h3 className="font-bold text-white text-sm">{block.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex gap-2 text-xs text-gray-400">
                          <span className={`text-${block.color}-500 shrink-0`}>›</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── SECURITY ── */}
            <section id="security" className="scroll-mt-28">
              <SectionHeader
                icon={<Shield size={22} className="text-green-400" />}
                badge="Security Model"
                title="Aegis Defense Matrix"
                color="green"
              />

              <div className="mt-10 grid md:grid-cols-3 gap-4">
                {[
                  { rule: "MAX_MARGIN_UTILIZATION", value: "80%", desc: "Hard cap on collateral per trade cycle to prevent over-leveraging." },
                  { rule: "HARD_LIQUIDATION_BUFFER", value: "15%", desc: "Positions within 15% of liquidation price trigger forced close." },
                  { rule: "LEVERAGE_CAP", value: "10x", desc: "Leverage above 10x is auto-reduced based on current ATR volatility." },
                  { rule: "TRAILING_STOP_LOSS", value: "-3%", desc: "Dynamic SL that trails the market price. Never static." },
                  { rule: "SCALE_OUT_TP", value: "+25/50%", desc: "Partial profit harvesting: 50% at +25%, 25% at +50%." },
                  { rule: "MAX_POSITIONS", value: "3", desc: "Prevents capital concentration. Agent manages up to 3 positions." },
                ].map((rule, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="p-4 bg-[#020b02] border border-green-500/15 rounded-xl hover:border-green-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-mono text-green-400 font-bold">{rule.rule}</span>
                      <span className="text-xs font-bold text-white bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded font-mono">{rule.value}</span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{rule.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Lock size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">Why Custodial is Safe Here</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      The agent wallet's private key is stored in Database behind Row Level Security. Only the server-side 
                      backend (authenticated with the Service Role key) can retrieve it — browser clients cannot. 
                      The agent <strong className="text-white">cannot withdraw to external addresses</strong>; 
                      the withdrawal API only allows transfers back to the <em className="text-blue-400">original owner wallet address</em> that created the vault.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── ROADMAP ── */}
            <section id="roadmap" className="scroll-mt-28">
              <SectionHeader
                icon={<Flame size={22} className="text-orange-400" />}
                badge="Roadmap"
                title="What's Coming Next"
                color="orange"
              />

              <div className="mt-10 space-y-4">
                {[
                  { phase: "Phase 1", status: "live", title: "MVP Launch", items: ["Custodial Agent Wallet", "AI Chat Terminal with Proposal Tickets", "Social Sentiment Analysis", "Jupiter v6 Swap Execution"] },
                  { phase: "Phase 2", status: "building", title: "Agent Intelligence", items: ["Automated 24/7 position monitoring via VPS worker", "Real TP/SL auto-close via backend cron", "Multi-token portfolio management", "Copy-trade from KOL feeds"] },
                  { phase: "Phase 3", status: "planned", title: "Protocol Expansion", items: ["On-chain Smart Contract Vault (optional upgrade)", "LEVERIX governance token launch on Pump.fun", "Agent performance leaderboard", "Mobile PWA with push notifications"] },
                ].map((phase, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 rounded-2xl border ${
                      phase.status === "live" ? "border-green-500/30 bg-green-900/5" :
                      phase.status === "building" ? "border-blue-500/20 bg-blue-900/5" :
                      "border-white/5 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-gray-500">{phase.phase}</span>
                        <h3 className="font-bold text-white">{phase.title}</h3>
                      </div>
                      <StatusBadge status={phase.status} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {phase.items.map((item, j) => (
                        <div key={j} className="flex gap-2 items-center text-xs text-gray-400">
                          <CheckCircle size={12} className={phase.status === "live" ? "text-green-400" : phase.status === "building" ? "text-blue-400" : "text-gray-600"} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── FAQ ── */}
            <section className="scroll-mt-28">
              <SectionHeader
                icon={<Users size={22} className="text-gray-400" />}
                badge="FAQ"
                title="Common Questions"
                color="gray"
              />
              <div className="mt-10 space-y-3">
                {[
                  { q: "Is my money safe? Can the agent rug me?", a: "The agent wallet is a separate Solana address funded by you. The withdrawal API strictly returns funds only to the wallet address that created the vault — it cannot send to arbitrary external addresses. The private key is backend-only; frontends have zero access." },
                  { q: "Does LeverixPro take a fee from my trades?", a: "No. LeverixPro is fully open-source and takes zero protocol fees. The only cost is Solana network transaction fees (~$0.001 per trade) and Jupiter's standard routing which finds the best DEX price." },
                  { q: "What happens if the VPS server goes down?", a: "Your funds in the agent wallet remain safe on-chain. The agent simply stops trading. Since we are building automated position monitoring in Phase 2, any open positions would rely on manual withdrawal during downtime." },
                  { q: "Can I use this without any SOL in my Phantom wallet?", a: "You still need some SOL in your Phantom wallet to cover the gas fee for depositing to the agent vault (~0.000005 SOL). After that, the agent handles all subsequent transaction fees from within the vault." },
                ].map((faq, i) => (
                  <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                      <ChevronDown 
                        size={16} 
                        className={`text-gray-500 shrink-0 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} 
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, badge, title, color }: { icon: React.ReactNode; badge: string; title: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${color}-500/10 border border-${color}-500/20 text-[10px] font-bold tracking-widest text-${color}-400 uppercase mb-4`}>
        {icon} {badge}
      </div>
      <h2 className="text-4xl font-bold text-white tracking-tight">{title}</h2>
      <div className={`w-12 h-0.5 bg-${color}-500/50 mt-3 rounded-full`} />
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "live") return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
    </div>
  );
  if (status === "building") return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> IN PROGRESS
    </div>
  );
  return (
    <div className="text-[10px] font-bold text-gray-500 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">PLANNED</div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px] space-y-6 text-gray-400">
        {/* Layer 1 */}
        <div className="flex items-center gap-4">
          <div className="w-full border border-blue-500/30 rounded-lg p-3 bg-blue-900/10 text-center text-blue-400 font-bold text-xs">
            🌐 USER BROWSER — Phantom Wallet + Next.js Frontend
          </div>
        </div>
        <div className="flex justify-center"><div className="w-px h-6 bg-white/20" /></div>
        {/* Layer 2 */}
        <div className="flex gap-4 items-stretch">
          <div className="flex-1 border border-purple-500/30 rounded-lg p-3 bg-purple-900/10 text-center text-purple-400 text-xs">
            🤖 xAI Grok API<br/><span className="text-gray-600">Chat / Analysis / Proposals</span>
          </div>
          <div className="flex-1 border border-white/10 rounded-lg p-3 bg-white/[0.02] text-center text-white text-xs">
            ⚙️ Next.js API Routes<br/><span className="text-gray-600">/api/vault, /api/chat, /api/market</span>
          </div>
          <div className="flex-1 border border-green-500/30 rounded-lg p-3 bg-green-900/10 text-center text-green-400 text-xs">
            📊 Market Data Proxy<br/><span className="text-gray-600">CoinCap · GeckoTerminal</span>
          </div>
        </div>
        <div className="flex justify-center"><div className="w-px h-6 bg-white/20" /></div>
        {/* Layer 3 */}
        <div className="flex gap-4">
          <div className="flex-1 border border-orange-500/30 rounded-lg p-3 bg-orange-900/10 text-center text-orange-400 text-xs">
            🗄️ Core Database<br/><span className="text-gray-600">orders · feeds · agent_wallets</span>
          </div>
          <div className="flex-1 border border-cyan-500/30 rounded-lg p-3 bg-cyan-900/10 text-center text-cyan-400 text-xs">
            ☁️ VPS Infrastructure<br/><span className="text-gray-600">24/7 Live Server</span>
          </div>
        </div>
        <div className="flex justify-center"><div className="w-px h-6 bg-white/20" /></div>
        {/* Layer 4 */}
        <div className="border border-green-500/40 rounded-lg p-3 bg-green-900/10 text-center text-green-300 font-bold text-xs">
          ⚡ SOLANA MAINNET — Jupiter v6 Aggregator · SystemProgram · SPL Token
        </div>
      </div>
    </div>
  );
}
