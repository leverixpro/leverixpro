"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction, PublicKey, Connection } from "@solana/web3.js";
import { Shield, Zap, Lock, Activity, CheckCircle, Copy, Check, Terminal, CornerDownRight, Loader2, Cpu, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ── Agent Live Execution Logs (Mock Stream) ──
const AGENT_MESSAGES = [
  "SYSTEM_BOOT: Aegis Defense Matrix v4.0 Online",
  "HANDSHAKE: Establishing secure encrypted channel...",
  "NODE_SYNC: Solana Mainnet-Beta RPC connection established.",
  "SCANNING: Monitoring SPL Token Liquidity Pools...",
  "THREAT_ASSESSMENT: Background volatility index normal.",
  "PROTOCOL: Standing by for user delegation...",
  "GUARD_RAIL: Max Drawdown parameter locked at 15%",
  "ROUTING: Jupiter v6 pre-flight checks verified.",
  "PING: Execution latency < 400ms",
  "CORE: Awaiting capital injection to begin autonomous trading."
];

type TxState = 'idle' | 'awaiting_signature' | 'broadcasting' | 'confirming' | 'success' | 'error';

export default function VaultPage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [balance, setBalance] = useState<number | null>(null);
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [agentAddress, setAgentAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  
  const [txState, setTxState] = useState<TxState>('idle');
  const [txError, setTxError] = useState("");
  
  const [logs, setLogs] = useState<string[]>([AGENT_MESSAGES[0]]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulated Matrix Log Stream
  useEffect(() => {
    if (!connected) return;
    let i = 1;
    const interval = setInterval(() => {
      if (i < AGENT_MESSAGES.length) {
        setLogs(prev => [...prev, AGENT_MESSAGES[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [connected]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Fetch real SOL balance and Agent Data
  useEffect(() => {
    if (!connected || !publicKey) { 
      setBalance(null);
      setAgentAddress(null);
      return; 
    }
    
    const fetchBalance = async () => {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    };
    fetchBalance();
    
    const id = connection.onAccountChange(publicKey, (info) => {
      setBalance(info.lamports / LAMPORTS_PER_SOL);
    });

    const initAgent = async () => {
      try {
        const req = await fetch('/api/vault/agent-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: publicKey.toBase58() })
        });
        const res = await req.json();
        if (res.success && res.agentPublicKey) {
          setAgentAddress(res.agentPublicKey);
          fetchAgentBalance(res.agentPublicKey);
        }
      } catch (e) {
        console.error("Agent init err", e);
      }
    };
    initAgent();

    return () => { connection.removeAccountChangeListener(id); };
  }, [connected, publicKey, connection]);

  async function fetchAgentBalance(address: string) {
    try {
      if (!address || address === "INITIALIZING_NODE...") return;
      const pubkey = new PublicKey(address);
      const lamports = await connection.getBalance(pubkey);
      setVaultBalance(lamports / LAMPORTS_PER_SOL);
    } catch (e) {
      console.warn("Failed to fetch agent balance or invalid address format", e);
    }
  }

  const copyToClipboard = () => {
    if (!agentAddress) return;
    navigator.clipboard.writeText(agentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0 || !balance || amt > balance || !agentAddress || !publicKey) return;
    
    try {
      setTxState('awaiting_signature');
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(agentAddress),
          lamports: amt * LAMPORTS_PER_SOL,
        })
      );
      
      const signature = await sendTransaction(transaction, connection);
      setTxState('broadcasting');
      
      await connection.confirmTransaction(signature, 'processed');
      setTxState('success');
      
      setDepositAmount("");
      fetchAgentBalance(agentAddress);
      
      setLogs(prev => [...prev, `[SYSTEM] DEPOSIT DETECTED: +${amt} SOL. Agent capital augmented.`]);
      
      setTimeout(() => setTxState('idle'), 3000);
    } catch (e: any) {
      console.error(e);
      setTxState('error');
      setTxError(e.message || "Transaction rejected.");
      setTimeout(() => setTxState('idle'), 4000);
    }
  };

  const handleWithdraw = async () => {
    if (!agentAddress || !publicKey || vaultBalance <= 0) return;
    try {
      setTxState('broadcasting');
      const req = await fetch('/api/vault/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() })
      });
      const res = await req.json();
      
      if (res.success) {
        setTxState('success');
        setWithdrawAmount("");
        fetchAgentBalance(agentAddress);
        setLogs(prev => [...prev, `[SYSTEM] WITHDRAWAL EXECUTED: All operational capital returned to owner.`]);
        setTimeout(() => setTxState('idle'), 3000);
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      console.error(e);
      setTxState('error');
      setTxError(e.message || "Failed to process withdrawal via Agent API.");
      setTimeout(() => setTxState('idle'), 4000);
    }
  };

  const TxStatusDisplay = () => {
    switch (txState) {
      case 'idle': return null;
      case 'awaiting_signature':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 text-blue-400 py-3">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm font-semibold tracking-wide">Awaiting Phantom Signature...</span>
          </motion.div>
        );
      case 'broadcasting':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 text-yellow-400 py-3">
            <Activity className="animate-pulse" size={18} />
            <span className="text-sm font-semibold tracking-wide">Broadcasting to Solana Network...</span>
          </motion.div>
        );
      case 'success':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 text-green-400 py-3">
            <CheckCircle size={18} />
            <span className="text-sm font-semibold tracking-wide">Transaction Confirmed!</span>
          </motion.div>
        );
      case 'error':
        return (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-center py-2">
            <div className="text-red-400 text-sm font-semibold flex items-center justify-center gap-2 mb-1"><Shield size={16}/> Execution Failed</div>
            <p className="text-xs text-red-400/70">{txError}</p>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-20 overflow-hidden">
      {/* Background Matrix Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl border-b border-white/5 h-20 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.jpeg" alt="LeverixPro Logo" className="w-8 h-8 rounded-lg object-cover transform scale-[1.2] shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter">
              LeverixPro
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/trade" className="hover:text-white transition-colors">Terminal</Link>
            <span className="text-white px-3 py-1.5 bg-white/10 rounded-lg flex items-center gap-1.5"><Shield size={14} className="text-green-400" /> Agent Vault</span>
            <Link href="/feeds" className="hover:text-white transition-colors">Social Feeds</Link>
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

      <main className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        
        {/* Dynamic Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-green-300 tracking-wider">CUSTODIAL AI ARCHITECTURE: ACTIVE</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Agent Command Vault</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Deploy capital directly into your dedicated, backend-encrypted AI Wallet. Allow the <span className="text-green-400 font-semibold">Leverix Core</span> to execute high-frequency operations on your behalf, 24/7.
          </p>
        </motion.div>

        {!connected ? (
          /* Disconnected State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="glass-card p-12 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.03)] w-full max-w-lg text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
              <Cpu className="mx-auto text-gray-500 mb-6" size={48} strokeWidth={1} />
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">System Offline</h2>
              <p className="text-gray-400 text-sm mb-10 leading-relaxed">Cryptographic handshake required. Connect your Solana environment to instantiate your personal AI Trading delegate.</p>
              <div className="custom-wallet-btn flex justify-center w-full scale-110">
                <WalletMultiButton />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: Custodial Operations Panel */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="lg:col-span-5 space-y-6"
            >
              {/* Agent Identity Card */}
              <div className="glass-card p-6 border border-white/10 bg-black/60 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-green-500/20"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Cpu size={14} className="text-green-400" /> Dedicated AI Wallet
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-sm border border-green-500/20 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Encrypted
                  </div>
                </div>

                <div className="bg-black/80 rounded-lg p-4 border border-white/5 mb-6 flex justify-between items-center group/copy">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Public Deposit Address</p>
                    <p className="text-white font-mono text-xs sm:text-sm tracking-widest">{agentAddress ? `${agentAddress.slice(0, 12)}...${agentAddress.slice(-12)}` : "INITIALIZING_NODE..."}</p>
                  </div>
                  <button 
                    onClick={copyToClipboard} 
                    disabled={!agentAddress}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Personal Wallet</span>
                    <span className="text-white font-mono">{balance !== null ? `${balance.toFixed(4)} SOL` : "SYNCING..."}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Agent Allocation</span>
                    <span className="text-green-400 font-mono text-xl">{vaultBalance.toFixed(4)} SOL</span>
                  </div>
                </div>
              </div>

              {/* Transaction Terminal */}
              <div className="glass-card p-1 border border-white/10 bg-black/40">
                <div className="flex p-1 gap-1 relative z-10">
                  {['deposit', 'withdraw'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`relative flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors z-20 ${activeTab === tab ? "text-black" : "text-gray-500 hover:text-white"}`}
                    >
                      {activeTab === tab && (
                        <motion.div layoutId="activeTabIndicator" className="absolute inset-0 bg-white rounded-sm -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                      )}
                      <span className="flex items-center justify-center gap-2">
                        {tab === 'deposit' ? <ArrowRightLeft size={14} className="rotate-90" /> : <ArrowRightLeft size={14} className="-rotate-90" />}
                        {tab}
                      </span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                    className="p-5"
                  >
                    {activeTab === "deposit" ? (
                      <div className="space-y-5">
                        <div className="relative">
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">Delegation Amount</label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              placeholder="0.00"
                              disabled={txState !== 'idle' && txState !== 'error'}
                              className="w-full bg-black/80 border border-white/10 rounded-md px-4 py-4 text-white outline-none focus:border-green-500/50 transition-colors font-mono text-xl disabled:opacity-50"
                            />
                            <div className="absolute right-4 flex items-center gap-3">
                              <span className="text-gray-500 font-bold">SOL</span>
                              <button
                                onClick={() => balance && setDepositAmount((balance * 0.98).toFixed(4))}
                                className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white transition-colors"
                              >
                                MAX
                              </button>
                            </div>
                          </div>
                        </div>

                        {txState === 'idle' || txState === 'error' ? (
                          <button 
                            onClick={handleDeposit}
                            disabled={!depositAmount || isNaN(parseFloat(depositAmount))}
                            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-widest py-4 rounded-md transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] disabled:opacity-50 disabled:shadow-none"
                          >
                            Execute Deposit
                          </button>
                        ) : <TxStatusDisplay />}
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="relative">
                          <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block">Withdrawal Parameter</label>
                          <div className="relative flex items-center gap-4">
                            <div className="w-full bg-black/80 border border-white/10 rounded-md px-4 py-4 text-gray-400 font-mono text-xl flex justify-between">
                              <span>{vaultBalance.toFixed(4)}</span>
                              <span className="text-gray-600">SOL</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-blue-400 mt-2 flex items-center gap-1"><Shield size={10}/> Full withdrawal resets agent operational limits.</p>
                        </div>
                        
                        {txState === 'idle' || txState === 'error' ? (
                          <button 
                            onClick={handleWithdraw}
                            disabled={vaultBalance <= 0}
                            className="w-full bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-widest py-4 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Harvest Total Capital
                          </button>
                        ) : <TxStatusDisplay />}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right: Live Matrix Command Log */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="glass-card border border-white/10 bg-[#0a0a0a] h-full flex flex-col overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                
                {/* Terminal Header */}
                <div className="bg-[#111] border-b border-white/5 py-3 px-5 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <Terminal className="text-gray-500" size={16} />
                    <span className="text-xs font-mono font-bold text-gray-400 tracking-widest">LEVERIX_CORE_SYSLOG</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  </div>
                </div>

                {/* Terminal Output */}
                <div className="p-5 flex-1 min-h-[400px] max-h-[600px] overflow-y-auto font-mono text-[11px] sm:text-xs leading-relaxed custom-scrollbar">
                  <div className="text-green-500/20 mb-6 bg-green-500/[0.02] p-4 rounded-lg border border-green-500/10 shadow-inner hidden md:block overflow-x-auto">
                    <pre className="font-mono text-[8px] sm:text-[9.5px] leading-none tracking-[0.1em] whitespace-pre">
{`██╗     ███████╗██╗   ██╗███████╗██████╗ ██╗██╗  ██╗
██║     ██╔════╝██║   ██║██╔════╝██╔══██╗██║╚██╗██╔╝
██║     █████╗  ██║   ██║█████╗  ██████╔╝██║ ╚███╔╝ 
██║     ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║ ██╔██╗ 
███████╗███████╗ ╚████╔╝ ███████╗██║  ██║██║██╔╝ ██╗
╚══════╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝`}
                    </pre>
                  </div>
                  <div className="text-green-500/60 font-bold mb-4 tracking-widest break-words whitespace-pre-wrap">
==================================================
[AUTH] SECURE TERMINAL CONNECTION ESTABLISHED
[AUTH] WALLET PK: {publicKey ? publicKey.toBase58() : "UNAUTHORIZED"}
==================================================
                  </div>
                  
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={index} className="flex gap-3 text-gray-400">
                        <span className="text-gray-600 shrink-0">[{new Date().toISOString().substring(11,19)}]</span>
                        <div className="flex gap-2">
                          <CornerDownRight size={12} className="text-green-500/50 mt-1 shrink-0" />
                          <span className={log.includes("DEPOSIT") || log.includes("WITHDRAWAL") ? "text-green-400 font-bold" : "text-gray-300"}>
                            {log}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>

                {/* Scanline Effect Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20" style={{ background: "linear-gradient(transparent 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }}></div>

              </div>
            </motion.div>

          </div>
        )}
      </main>
    </div>
  );
}
