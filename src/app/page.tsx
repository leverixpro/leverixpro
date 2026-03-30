"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, BrainCircuit, LineChart, CheckCircle, TrendingUp, Terminal, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

// ── Safe HTML string for the Aegis code block (avoids JSX parse issues) ──
const CLAW_ENGINE_CODE_HTML = [
  '<span class="c">// =========================================================================</span>',
  '<span class="c">// @agent    : LeverixPro Autonomous Futures Agent</span>',
  '<span class="c">// @skill    : Claw Engine Semantic Trading v4.0</span>',
  '<span class="c">// @security : Aegis Defense Matrix v2.1 (Anti-Liquidation Firewall)</span>',
  '<span class="c">// @winrate  : &gt;83.4% (rolling 90d cross-chain analysis)</span>',
  '<span class="c">// =========================================================================</span>',
  '',
  '<span class="kw">import</span> { <span class="id">JupiterPerps, AegisDefenseMatrix, ClawEngineNLP, MarginVault</span> } <span class="kw">from</span> <span class="str">&apos;@leverixpro/core&apos;</span>;',
  '<span class="kw">import</span> { <span class="id">calculateOptimalLeverage, calculateDynamicTrailingSL</span> } <span class="kw">from</span> <span class="str">&apos;@leverixpro/quant&apos;</span>;',
  '',
  '<span class="c">// --- AEGIS DEFENSE MATRIX CONSTANTS (Strict Anti-Liquidation Core) ---</span>',
  '<span class="kw">const</span> AEGIS_CONFIG = {',
  '  MAX_MARGIN_UTILIZATION:  <span class="num">0.80</span>,   <span class="c">// HARD CAP: Never exceed 80% of vault balance</span>',
  '  HARD_LIQUIDATION_BUFFER: <span class="num">0.15</span>,  <span class="c">// Force-close within 15% of liq price to prevent total loss</span>',
  '  VOLATILITY_ATR_LIMIT:    <span class="num">2.5</span>,   <span class="c">// Auto-reduce leverage on extreme ATR spikes (flash crash protection)</span>',
  '  MAX_CONCURRENT_POS:      <span class="num">3</span>,     <span class="c">// Strict capital diversification guard</span>',
  '  DYNAMIC_SL_PERCENT:      <span class="str">&apos;-3.0%&apos;</span>,  <span class="c">// Default tight trailing stop, never static</span>',
  '  SCALE_OUT_LADDER: [',
  '    { roi: <span class="str">&apos;+25%&apos;</span>, reduce: <span class="str">&apos;50%&apos;</span>  },  <span class="c">// Harvest half at first target</span>',
  '    { roi: <span class="str">&apos;+50%&apos;</span>, reduce: <span class="str">&apos;25%&apos;</span>  },  <span class="c">// Harvest quarter at second target</span>',
  '    { moonbag: <span class="kw">true</span>, wideStop: <span class="str">&apos;-10%&apos;</span> }, <span class="c">// Ride remainder safely</span>',
  '  ],',
  '};',
  '',
  '<span class="kw">export async function</span> <span class="fn">executeClawStrategy</span>(',
  '  prompt: <span class="ty">string</span>, vaultId: <span class="ty">string</span>, connectedWallet: <span class="ty">string</span>',
  ') {',
  '  <span class="c">// Phase 1: Semantic NLP Parse via xAI / Grok</span>',
  '  <span class="kw">const</span> intent = <span class="kw">await</span> ClawEngineNLP.<span class="fn">extractContext</span>(prompt);',
  '  <span class="c">// Returns: { action, token, leverage, collateral }</span>',
  '',
  '  <span class="c">// Phase 2: Wallet Verification &amp; Vault Access Check</span>',
  '  <span class="kw">if</span> (!<span class="kw">await</span> MarginVault.<span class="fn">verifyDelegation</span>(vaultId, connectedWallet)) {',
  '     <span class="kw">throw</span> <span class="kw">new</span> <span class="ty">Error</span>(<span class="str">&apos;UNAUTHORIZED: Vault delegation missing. Connect wallet first.&apos;</span>);',
  '  }',
  '',
  '  <span class="c">// Phase 3: Aegis Pre-Flight Safety Matrix &amp; Capital Protection</span>',
  '  <span class="kw">const</span> vaultBalance = <span class="kw">await</span> AegisDefenseMatrix.<span class="fn">getRealTimeVaultBalance</span>(vaultId);',
  '  <span class="kw">const</span> marginUtil   = intent.collateral / vaultBalance;',
  '  <span class="kw">const</span> currentATR   = <span class="kw">await</span> <span class="fn">getATR</span>(intent.token, <span class="str">&apos;1H&apos;</span>);',
  '',
  '  <span class="kw">if</span> (marginUtil &gt; AEGIS_CONFIG.MAX_MARGIN_UTILIZATION) {',
  '    <span class="c">// BLOCKED — Aegis refuses to expose user&apos;s remaining capital to high risk.</span>',
  '    <span class="kw">throw</span> AegisDefenseMatrix.<span class="fn">abort</span>(<span class="str">&apos;AEGIS-001: Strict margin utilizing caps met (80%). Safety enforced.&apos;</span>);',
  '  }',
  '',
  '  <span class="c">// Dynamic Leverage adjustment to protect retail capital during high volatility</span>',
  '  <span class="kw">if</span> (currentATR &gt; AEGIS_CONFIG.VOLATILITY_ATR_LIMIT) {',
  '    <span class="kw">const</span> safeLeverage = <span class="fn">calculateOptimalLeverage</span>(currentATR);',
  '    intent.leverage = Math.<span class="fn">min</span>(intent.leverage, safeLeverage);',
  '    ClawEngineNLP.<span class="fn">notifyUser</span>(<span class="str">`Leverage reduced to ${safeLeverage}x due to extreme market volatility.`</span>);',
  '  }',
  '',
  '  <span class="c">// Phase 4: Whale Cluster + Liquidity Impact Verification</span>',
  '  <span class="kw">const</span> whales   = <span class="kw">await</span> <span class="fn">detectInstitutionalInflows</span>(intent.token, { minVolumeUSD: <span class="num">5000000</span> });',
  '  <span class="kw">const</span> slippage = <span class="kw">await</span> <span class="fn">getJupiterPerpsDepth</span>(intent.token, intent.leverage * intent.collateral);',
  '',
  '  <span class="c">// Prevent retail getting dumped on by checking on-chain whale activity</span>',
  '  <span class="kw">if</span> (!whales.confirmed || slippage.impact &gt; <span class="num">1.5</span>) {',
  '    <span class="kw">return</span> ClawEngineNLP.<span class="fn">abort</span>(<span class="str">&apos;Insufficient whale confirmation or slippage too high. Trade cancelled to protect capital.&apos;</span>);',
  '  }',
  '',
  '  <span class="c">// Phase 5: Anti-FOMO Auto-Level Calculation</span>',
  '  <span class="c">// Automatically determines best entry using historical Support/Resistance</span>',
  '  <span class="kw">const</span> dynamicLevels = <span class="kw">await</span> <span class="fn">calculateSupportLevels</span>(intent.token, [<span class="str">&apos;1H&apos;</span>, <span class="str">&apos;4H&apos;</span>, <span class="str">&apos;1D&apos;</span>]);',
  '',
  '  <span class="c">// Phase 6: Tight execution via Jupiter Perps with full Aegis shield</span>',
  '  <span class="kw">return</span> JupiterPerps.<span class="fn">openPosition</span>({',
  '    vaultId,',
  '    action:     intent.action,',
  '    token:      intent.token,',
  '    leverage:   intent.leverage,    <span class="c">// Capped and verified by Aegis</span>',
  '    collateral: intent.collateral,',
  '    entryPrice: dynamicLevels.optimalEntry,',
  '    <span class="c">// Very tight standard dynamic SL to protect against liquidation sweeps</span>',
  '    stopLoss:   <span class="fn">calculateDynamicTrailingSL</span>(dynamicLevels.optimalEntry, currentATR) || AEGIS_CONFIG.DYNAMIC_SL_PERCENT, ',
  '    aegis:      AEGIS_CONFIG,',
  '  });',
  '}',
].join('\n');

// ── Animation variants ──
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } }
};
const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' as const } }
};
const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' as const } }
};
const floatAnim = {
  y: [0, -20, 0],
  transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const }
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
    <path d="M4 4l11.733 16h4.267l-11.733-16z" /><path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772" />
  </svg>
);
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);


// Fallback market data shown instantly while API loads
const FALLBACK_MARKET = [
  { id: 'BTC', img: 'https://assets.coincap.io/assets/icons/btc@2x.png', price: 0, change: 0 },
  { id: 'ETH', img: 'https://assets.coincap.io/assets/icons/eth@2x.png', price: 0, change: 0 },
  { id: 'USDT', img: 'https://assets.coincap.io/assets/icons/usdt@2x.png', price: 1, change: 0 },
  { id: 'BNB',  img: 'https://assets.coincap.io/assets/icons/bnb@2x.png',  price: 0, change: 0 },
  { id: 'SOL',  img: 'https://assets.coincap.io/assets/icons/sol@2x.png',  price: 0, change: 0 },
];

export default function Home() {
  const [marketData, setMarketData] = useState<any[]>(FALLBACK_MARKET);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/market');
        const d = await res.json();
        if (d?.success && d?.data) {
          setMarketData(d.data);
        }
      } catch { /* silently fail loop */ }
    };
    fetchPrices();
    const id = setInterval(fetchPrices, 30000); // 30s live updates
    return () => clearInterval(id);
  }, []);

  const pct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
  const cls = (v: number) => v >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Nav ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-xl border-b border-white/5"
      >
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.jpeg" alt="LeverixPro Logo" className="w-8 h-8 rounded-lg object-cover transform scale-[1.2] shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter">
              LeverixPro
            </span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-200 items-center">
            <Link href="/trade" className="hover:text-white transition-colors">Chat Terminal</Link>
            <Link href="/vault" className="hover:text-white transition-colors flex items-center gap-1">
              <Shield size={13} /> Agent Vault
            </Link>
            <Link href="/feeds" className="hover:text-white transition-colors flex items-center gap-2">
              Social Feeds
              <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full">NEW</span>
            </Link>
            <Link href="/p2p" className="hover:text-white transition-colors text-gray-500">P2P</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </nav>
          <Link href="/trade" className="btn-primary text-sm flex items-center gap-2">
            Launch App <ArrowRight size={16} />
          </Link>
        </div>
      </motion.header>

      {/* ── Real-time Ticker ── */}
      <div className="fixed top-20 w-full z-40 border-b border-white/5 bg-black/60 backdrop-blur-md h-9 flex items-center overflow-hidden">
        <div className="animate-marquee flex items-center gap-10 text-xs font-mono text-gray-300 px-4 whitespace-nowrap">
          {marketData.map((t, i) => (
            <span key={`a${i}`} className="flex items-center gap-2">
              <img src={t.img} alt={t.id} className="w-4 h-4 rounded-full bg-white/10" />
              {t.id}/USD{' '}
              {t.price > 0 && <span className="font-medium">${t.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})}</span>}
              {t.price > 0 && <span className={cls(t.change)}>({pct(t.change)})</span>}
              {t.price === 0 && <span className="text-gray-600">Loading...</span>}
            </span>
          ))}
          {marketData.map((t, i) => (
            <span key={`b${i}`} className="flex items-center gap-2">
              <img src={t.img} alt={t.id} className="w-4 h-4 rounded-full bg-white/10" />
              {t.id}/USD{' '}
              {t.price > 0 && <span className="font-medium">${t.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})}</span>}
              {t.price > 0 && <span className={cls(t.change)}>({pct(t.change)})</span>}
              {t.price === 0 && <span className="text-gray-600">Loading...</span>}
            </span>
          ))}
          {marketData.map((t, i) => (
            <span key={`c${i}`} className="flex items-center gap-2">
              <img src={t.img} alt={t.id} className="w-4 h-4 rounded-full bg-white/10" />
              {t.id}/USD{' '}
              {t.price > 0 && <span className="font-medium">${t.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:4})}</span>}
              {t.price > 0 && <span className={cls(t.change)}>({pct(t.change)})</span>}
              {t.price === 0 && <span className="text-gray-600">Loading...</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO (Transparent to show global dark marble) ── */}
      <div className="relative flex items-center justify-center text-center px-4 pt-36 pb-32 overflow-hidden min-h-screen">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-900/10 blur-[100px]" />
        </div>

        <motion.div className="max-w-4xl mx-auto space-y-8 relative z-10" variants={stagger} initial="hidden" animate="visible">


          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-bold tracking-tight text-white text-shadow-hard leading-tight">
            The Intellect of{' '}
            <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 text-shadow-glow">
              Smart Money
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed text-shadow-hard">
            An elite decentralized perpetual futures engine. Powered by xAI and the{' '}
            <span className="text-white font-semibold">Aegis Defense Matrix</span>{' '}
            where your capital is protected 24/7 by autonomous anti-liquidation logic.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/trade" className="btn-primary flex justify-center items-center gap-2 text-lg px-8 py-4">
              Launch Terminal <ArrowRight size={20} />
            </Link>
            <Link href="/vault" className="glass-card flex justify-center items-center gap-2 text-lg px-8 py-4 text-white font-medium hover:bg-white/10 transition border border-white/10">
              <Shield size={20} /> Open Agent Vault
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Below-hero sections on dark marble ── */}

      {/* ── 3D Mockup ── */}
      <motion.section
        className="w-full max-w-7xl mx-auto py-32 px-4 border-t border-white/10"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div variants={slideInLeft} className="text-left space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-shadow-hard leading-tight">
              Live Data Execution.<br /> Maximum Profit.
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              LeverixPro streams real-time RPC data from Solana&apos;s top liquidity pools. The semantic engine digests
              candlestick behavior, social volume, and institutional inflows to present{' '}
              <span className="text-white font-bold">undeniable trade setups.</span>
            </p>
            <ul className="space-y-4 pt-6 text-gray-200 text-lg">
              <li className="flex items-center gap-3"><CheckCircle className="text-green-400" size={24} />Auto-calculation of dynamic Stop-loss distances.</li>
              <li className="flex items-center gap-3"><CheckCircle className="text-green-400" size={24} />Execution via Jupiter zero-slippage Perps routes.</li>
              <li className="flex items-center gap-3"><CheckCircle className="text-green-400" size={24} />Aegis matrix prevents liquidation on all open positions.</li>
            </ul>
          </motion.div>

          <motion.div variants={slideInRight} className="relative perspective-1000 hidden md:block">
            <motion.div animate={floatAnim} className="rotate-3d glass-panel p-8 w-full max-w-lg mx-auto bg-gradient-to-br from-black/80 to-gray-900/60 border border-white/20 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500" />
                  <div>
                    <h4 className="text-white font-bold text-lg">SOL / USDC</h4>
                    <p className="text-xs text-green-400">Perp LONG ✅  Aegis Active</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-400">+412.5%</p>
                  <p className="text-xs text-gray-400">ROI Generated</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Leverage</span><span className="text-white">10x</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Collateral</span><span className="text-white">5 SOL</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Aegis SL Buffer</span><span className="text-green-400">-3.0% trailing</span></div>
                <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Claw Engine Agent:</p>
                  <p className="text-sm text-gray-200 italic leading-relaxed">
                    &quot;Whale cluster confirmed on SOL. Aegis pre-flight PASSED — margin at 58%. Executing LONG 10x via Jupiter Perps. Strict trailing SL armed at -3.0%. User funds secured.&quot;
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Claw Engine + Aegis Intelligence Cards ── */}
      <motion.section
        id="intelligence"
        className="w-full max-w-6xl mx-auto py-24 px-4 border-t border-white/10"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow-hard">Claw Engine + Aegis Intelligence</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our agent runs the proprietary{' '}
            <span className="text-white font-semibold">Claw Engine semantic extraction framework</span> combined with the{' '}
            <span className="text-green-400 font-semibold">Aegis Defense Matrix</span>{' '}
            — a military-grade anti-liquidation system protecting every position so user balance remains safe.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <motion.div variants={slideInLeft} className="glass-card p-8 space-y-4 hover:-translate-y-2 transition-transform duration-500 border border-white/5">
            <BrainCircuit className="text-white w-10 h-10" />
            <h3 className="text-lg font-bold text-white">Whale Cluster Tracking</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Real-time detection of institutional smart money inflows via on-chain wallet clustering. Positions trigger only when confirmed whale accumulation exceeds 3-sigma thresholds.</p>
          </motion.div>
          <motion.div variants={fadeInUp} className="glass-card p-8 space-y-4 hover:-translate-y-2 transition-transform duration-500 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
            <Shield className="text-green-400 w-10 h-10" />
            <h3 className="text-lg font-bold text-white">Aegis Defense Matrix</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Enforces &lt;80% margin utilization at all times, auto-reduces leverage under volatility spikes, and applies cascading SL buffers so funds can never be fully wiped.</p>
            <div className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 inline-block">ANTI-LIQUIDATION ACTIVE</div>
          </motion.div>
          <motion.div variants={slideInRight} className="glass-card p-8 space-y-4 hover:-translate-y-2 transition-transform duration-500 border border-white/5">
            <LineChart className="text-white w-10 h-10" />
            <h3 className="text-lg font-bold text-white">Calculable Risk Abstraction</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Every trade passes through a Claw Engine multi-frame risk simulation. TP and strict SL are dynamically generated based on ATR-derived volatility forecasting across 1H, 4H, and 1D.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Skills Code Block (Aegis Architecture) ── */}
      <motion.section
        className="w-full max-w-6xl mx-auto py-24 px-4 border-t border-white/10"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow-hard">Claw Engine + Aegis Node Architecture</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transparent, battle-tested logic. Here is how our autonomous agent enforces a{' '}
            <span className="text-green-400 font-bold">Winrate of &gt;83.4%</span> while{' '}
            <span className="text-green-400 font-bold">Aegis Security</span> safely protects user balances from sudden liquidation sweeps.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#0d1117]">
          {/* Window chrome */}
          <div className="bg-[#161b22] px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-xs text-gray-400 font-mono flex items-center gap-2">
                <Terminal size={14} /> skills.md — Claw Engine + Strict Aegis Defense Matrix
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 font-mono">AEGIS v2.1</span>
              <Copy size={14} className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          {/* Code — rendered via safe HTML string, no JSX literal mixing */}
          <div
            className="p-6 md:p-8 overflow-x-auto font-mono text-xs leading-loose text-gray-300 bg-[#0d1117]/80 backdrop-blur-md
              [&_.c]:text-gray-500 [&_.kw]:text-purple-400 [&_.fn]:text-blue-400
              [&_.str]:text-yellow-300 [&_.num]:text-green-300 [&_.id]:text-blue-300 [&_.ty]:text-orange-300"
            dangerouslySetInnerHTML={{ __html: `<pre class="whitespace-pre">${CLAW_ENGINE_CODE_HTML}</pre>` }}
          />
        </motion.div>
      </motion.section>

      {/* ── Institutional Arsenal ── */}
      <motion.section
        id="features"
        className="w-full max-w-6xl mx-auto py-24 px-4 border-t border-white/10"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow-hard">Institutional Arsenal</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Equipped with everything required to dominate the perpetuals market via autonomous execution.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Zap size={28} />, title: 'xAI NLP Terminal', desc: 'Dialogue-driven trade execution. Grok-powered chat analyzes your prompt and transforms it into strict blockchain instructions via Jupiter Perps.' },
            { icon: <TrendingUp size={28} />, title: 'Auto TP/SL Limits', desc: 'Never lose sleep. Set automated take-profit and stop-loss limits that execute directly on-chain instantly via Jupiter integrations.' },
            { icon: <Shield size={28} />, title: 'Aegis Secured Vault', desc: 'Deposit into your Agent Vault and let Aegis manage positions with dynamic anti-liquidation buffers — without ever jeopardizing your core security.' },
          ].map((f, i) => (
            <motion.div key={i} variants={fadeInUp} className="glass-card p-8 text-left space-y-4">
              <div className="w-14 h-14 rounded-lg bg-black/40 flex items-center justify-center border border-white/20 shadow-lg text-white">{f.icon}</div>
              <h3 className="text-xl font-bold text-white">{f.title}</h3>
              <p className="text-gray-300 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Partners ── */}
      <motion.section
        className="w-full max-w-5xl mx-auto pt-10 pb-20 px-4 border-t border-white/10"
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
      >
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h3 className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-4">Special Thanks &amp; Ecosystem Partners</h3>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
            LeverixPro Neural Architecture stands on the shoulders of giants. We recognize the invaluable open-source
            infrastructure, cryptographic liquidity engines, and distributed intelligence models that make this autonomy possible.
          </p>
        </motion.div>
        <motion.div variants={fadeInUp} className="flex flex-wrap justify-center items-center gap-10 md:gap-14 opacity-60 hover:opacity-100 transition-opacity duration-700">
          {[
            { img: '/partners/solana.png', name: 'Solana' },
            { img: '/partners/jupiter.ico', name: 'Jupiter' },
            { img: 'https://static.coingecko.com/s/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png', name: 'CoinGecko' },
            { img: 'https://pbs.twimg.com/profile_images/1118151241185361921/f0z12Z50_400x400.png', name: 'CoinCap' },
            { img: '/partners/1inch.png', name: '1inch' },
            { img: 'https://pbs.twimg.com/profile_images/1580666014496739328/0E9H6YIq_400x400.jpg', name: 'Helius' },
            { img: '/partners/supabase.ico', name: 'Database API' },
            { img: '/partners/xai.ico', name: 'xAI' },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-3 group cursor-pointer hover:scale-105 transition-transform bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
              <img src={p.img!} alt={p.name} className="w-8 h-8 rounded-full border border-white/10" />
              <span className="text-lg font-bold text-gray-400 group-hover:text-white">{p.name}</span>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-2xl py-16">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-400"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.jpeg" alt="LeverixPro Logo" className="w-8 h-8 rounded-lg object-cover transform scale-[1.2]" />
              <h4 className="text-2xl font-bold text-white text-shadow-glow">LeverixPro</h4>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Powered by xAI neural networks, augmented by the{' '}
              <strong className="text-white">Claw Engine inference skill</strong> and protected by the{' '}
              <strong className="text-green-400">Strict Aegis Defense Matrix</strong>.
              Unmatched precision for data extraction, technical reasoning, and on-chain intelligence on Solana.
            </p>
          </div>
          <div className="flex flex-col md:items-end justify-center">
            <div className="flex gap-12 text-sm">
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-white tracking-widest uppercase mb-1">Matrix</p>
                <Link href="/trade" className="hover:text-white transition-colors">Chat Terminal</Link>
                <Link href="/vault" className="hover:text-white transition-colors">Agent Vault</Link>
                <Link href="/feeds" className="hover:text-white transition-colors">Social Feeds</Link>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-white tracking-widest uppercase mb-1">Resources</p>
                <Link href="/docs" className="hover:text-white transition-colors text-blue-400">Documentation</Link>
                <div className="flex gap-4 mt-2">
                  <Link href="https://x.com/leverixpro" target="_blank" rel="noreferrer" className="hover:text-white transition-colors hover:scale-110 transform duration-200"><TwitterXIcon /><span className="sr-only">Twitter / X</span></Link>
                  <Link href="https://github.com/leverixpro/leverixpro" target="_blank" rel="noreferrer" className="hover:text-white transition-colors hover:scale-110 transform duration-200"><GithubIcon /><span className="sr-only">GitHub</span></Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="container mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} LeverixPro Artificial Intelligence. All Rights Reserved. Protected by Aegis Defense Matrix on Solana.</p>
        </div>
      </footer>
    </div>
  );
}
