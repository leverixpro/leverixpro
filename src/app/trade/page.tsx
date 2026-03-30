"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AgentTerminal } from "@/components/AgentTerminal";
import { Activity, TrendingUp, Send, MessageCircle, Lock, Shield } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useEffect, useState, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";


const TradingChart = dynamic(
  () => import("@/components/TradingChart").then((mod) => mod.TradingChart),
  { ssr: false }
);

const TwitterIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none">
    <path d="M4 4l11.733 16h4.267l-11.733-16z"/><path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772"/>
  </svg>
);

export default function TradeDashboard() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [mounted, setMounted] = useState(false);
  
  const [balance, setBalance] = useState<number | null>(null);
  const [vaultBalance, setVaultBalance] = useState<number | null>(null);
  const [isInitializingVault, setIsInitializingVault] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'portfolio'>('positions');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentToken, setCurrentToken] = useState("SOL");

  const supabaseRef = useRef<SupabaseClient | null>(null);
  const getDb = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    return supabaseRef.current;
  };

  // Share functionality
  const handleShare = (platform: "x" | "tg" | "wa", position: any) => {
    const isWin = position.pnlPct?.startsWith('+') || parseFloat(position.leverage) > 0;
    const text = `I'm currently automating a ${position.leverage}x ${position.action} on ${position.token_symbol} using @LeverixPro's AI Agent! \n\n🤖 Powered by Claw Engine.\n\n#Solana #LeverixPro #Trading`;
    const shareUrl = "https://leverixpro.app";
    
    if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "tg") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "wa") {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`, "_blank");
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync Network & Vault Balances
  useEffect(() => {
    if (connected && publicKey) {
      // 1. Fetch Phantom Balance
      connection.getBalance(publicKey).then((lamports) => {
        setBalance(lamports / LAMPORTS_PER_SOL);
      });
      const id = connection.onAccountChange(publicKey, (account) => {
        setBalance(account.lamports / LAMPORTS_PER_SOL);
      });

      // 2. Fetch Agent Vault Balance
      const fetchAgent = async () => {
        try {
          const req = await fetch('/api/vault/agent-wallet', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ walletAddress: publicKey.toBase58() })
          });
          const res = await req.json();
          if (res.success && res.agentPublicKey) {
             const lamports = await connection.getBalance(new PublicKey(res.agentPublicKey));
             setVaultBalance(lamports / LAMPORTS_PER_SOL);
          }
        } catch (e) {
          console.error("Vault Check Error", e);
        } finally {
          setIsInitializingVault(false);
        }
      };
      fetchAgent();

      // 3. Fetch Real Orders from DB
      const fetchOrders = async () => {
         setLoadingOrders(true);
         const { data, error } = await getDb()
            .from('orders')
            .select('*')
            .eq('wallet_address', publicKey.toBase58())
            .order('created_at', { ascending: false });
         if (!error && data) {
            setOrders(data);
         }
         setLoadingOrders(false);
      };
      fetchOrders();

      return () => { connection.removeAccountChangeListener(id); };
    } else {
      setBalance(null);
      setVaultBalance(null);
      setOrders([]);
      setIsInitializingVault(false);
    }
  }, [connected, publicKey, connection]);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505]">
      {/* Dashboard Navbar */}
      <header className="glass-panel rounded-none border-x-0 border-t-0 bg-black/60 h-20 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm shadow-white/5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.jpeg" alt="LeverixPro Logo" className="w-8 h-8 rounded-lg object-cover transform scale-[1.2] shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter">
              LeverixPro
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <span className="text-white cursor-pointer px-4 py-2 bg-white/10 rounded-lg shadow-inner">Trade Terminal</span>
            <Link href="/vault" className="hover:text-white cursor-pointer transition-colors">Agent Vault</Link>
            <Link href="/feeds" className="hover:text-white cursor-pointer transition-colors">Social Signals</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {mounted && (
            <div className="wallet-btn-wrapper custom-wallet-btn">
              <WalletMultiButton />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Market Data & Chart */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div initial={{opacity: 0, y: -10}} animate={{opacity:1, y:0}} className="glass-card px-6 py-4 flex justify-between items-center border border-white/5 bg-black/40 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                 <img src={`https://assets.coincap.io/assets/icons/${currentToken.toLowerCase()}@2x.png`} alt={currentToken} className="w-7 h-7 rounded-full" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div>
                <div className="flex items-center gap-2 relative">
                  <input 
                    type="text"
                    value={currentToken} 
                    onChange={(e) => setCurrentToken(e.target.value.toUpperCase())}
                    placeholder="Search e.g. BTC"
                    className="bg-[#0a0a0a] border border-white/10 text-white font-bold text-2xl tracking-tight rounded-lg px-3 py-1 outline-none transition-colors hover:border-white/30 focus:border-blue-500/50 uppercase w-32 shadow-inner"
                  />
                  <span className="text-xl text-gray-500 font-bold">/ USD</span>
                </div>
                <div className="text-xs text-gray-500 font-mono mt-1">TYPE TOKEN SYMBOL TO LOAD CHART</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono text-white font-bold tracking-tight">LIVE CHART</div>
            </div>
          </motion.div>

          <motion.div initial={{opacity: 0}} animate={{opacity:1}} transition={{delay: 0.1}} className="glass-card h-[500px] flex items-center justify-center relative border border-white/5 p-0 overflow-hidden bg-[#0a0a0a] shadow-inner">
             <TradingChart token={currentToken} />
          </motion.div>

          {/* Database Driven Order Tables */}
          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="glass-card flex flex-col border border-white/5 overflow-hidden bg-black/40">
            <div className="flex items-center gap-6 px-6 pt-5 border-b border-white/10 bg-[#0a0a0a]">
              {['positions', 'portfolio'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-4 text-xs font-mono uppercase tracking-widest relative transition-colors ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab === 'positions' ? 'Executed Orders' : 'My Portfolio'}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-t-full" />}
                </button>
              ))}
            </div>

            <div className="p-6">
              {!connected ? (
                <div className="text-center py-12 text-gray-500 text-sm font-mono tracking-wide">
                  CONNECT WALLET TO SYNC ON-CHAIN DATA.
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {activeTab === 'portfolio' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-5 bg-[#111] rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">SOL</div>
                          <span className="text-gray-300 font-medium tracking-wider">Phantom Wallet (Cold)</span>
                        </div>
                        <div className="text-xl font-mono text-white">
                          {balance !== null ? `${balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : '...'} SOL
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-5 bg-green-500/5 rounded-xl border border-green-500/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-black border-2 border-green-500 flex items-center justify-center text-green-400"><Lock size={14}/></div>
                          <span className="text-green-400 font-bold tracking-wider">Agent Custodial Vault</span>
                        </div>
                        <div className="text-xl font-mono text-green-400 font-bold">
                          {vaultBalance !== null ? `${vaultBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : '...'} SOL
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'positions' && (
                    <div className="overflow-x-auto">
                      {loadingOrders ? (
                         <div className="text-center text-xs text-gray-500 font-mono py-10 animate-pulse">FETCHING SECURE LOGS...</div>
                      ) : orders.length === 0 ? (
                         <div className="text-center text-xs text-gray-500 font-mono py-10">NO SIGNAL HISTORY RECORDED.</div>
                      ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="text-[10px] text-gray-500 tracking-widest uppercase font-mono border-b border-white/5">
                            <tr>
                              <th className="pb-3 px-4">Direction</th>
                              <th className="pb-3 px-4">Leverage</th>
                              <th className="pb-3 px-4">Size</th>
                              <th className="pb-3 px-4">Risk Matrix</th>
                              <th className="pb-3 px-4 text-center">Export</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {orders.map((pos) => (
                              <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 px-4 flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${pos.action === 'LONG' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {pos.action}
                                  </span>
                                  <span className="text-white font-mono text-xs">{pos.token_symbol}</span>
                                </td>
                                <td className="py-4 px-4 text-gray-300 font-mono text-xs">
                                  {pos.leverage}x
                                </td>
                                <td className="py-4 px-4 text-white font-mono text-xs">
                                  ${pos.collateral}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-[10px] font-mono text-gray-400">TP {pos.take_profit}</div>
                                  <div className="text-[10px] font-mono text-gray-500">SL {pos.stop_loss}</div>
                                </td>
                                <td className="py-4 px-4 flex justify-center gap-2">
                                  <button onClick={() => handleShare('x', pos)} className="p-1.5 bg-black/40 hover:bg-[#1DA1F2]/20 rounded-md border border-white/5 text-gray-500 hover:text-[#1DA1F2] transition-colors" title="Export X">
                                    <TwitterIcon size={14} />
                                  </button>
                                  <button onClick={() => handleShare('tg', pos)} className="p-1.5 bg-black/40 hover:bg-[#0088cc]/20 rounded-md border border-white/5 text-gray-500 hover:text-[#0088cc] transition-colors" title="Export TG">
                                    <Send size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Terminal / Onboarding Lock */}
        <div className="xl:col-span-1 relative">
           
           {/* Terminal Container */}
           <motion.div initial={{opacity: 0, x: 20}} animate={{opacity:1, x:0}} transition={{delay: 0.3}} className="h-full">
              <AgentTerminal onTokenDetect={(token) => setCurrentToken(token)} />
           </motion.div>

           {/* Onboarding Lock Overlay */}
           <AnimatePresence>
             {connected && !isInitializingVault && vaultBalance === 0 && (
               <motion.div 
                 initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                 animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                 className="absolute inset-0 z-20 bg-black/60 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/10"
               >
                 <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                   <Shield className="text-blue-400" size={30} />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Agent Standby Mode</h3>
                 <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                   Your Custodial Agent Vault is currently unfunded (0 SOL). The Autonomous Copilot requires operating capital to propose and execute trades on your behalf.
                 </p>
                 
                 <div className="w-full space-y-3 mb-8 text-left">
                    <div className="bg-[#111] p-3 rounded-lg border border-green-500/20 flex items-center gap-3">
                       <CheckCircle className="text-green-400" size={16}/>
                       <span className="text-sm text-gray-300">Phase 1: Wallet Verification</span>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30 flex items-center gap-3">
                       <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0"></div>
                       <span className="text-sm text-white font-medium">Phase 2: Establish Agent Vault</span>
                    </div>
                 </div>

                 <Link href="/vault" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm uppercase tracking-wider">
                   Deposit Capital to Un-Lock
                 </Link>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
// Needed checkcircle import
import { CheckCircle } from "lucide-react";
