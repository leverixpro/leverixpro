"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Terminal, Bot, User, Shield, TrendingUp, TrendingDown, Check, Loader2 } from "lucide-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";

function RichText({ content }: { content: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|\[(.*?)\]\((.*?)\)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>);
    }
    if (match[1] !== undefined) parts.push(<strong key={key++} className="font-bold text-white">{match[1]}</strong>);
    else if (match[2] !== undefined) parts.push(<em key={key++} className="text-blue-400 not-italic">{match[2]}</em>);
    else if (match[3] !== undefined) parts.push(<code key={key++} className="font-mono text-green-400 bg-green-500/10 px-1 rounded text-xs">{match[3]}</code>);
    else if (match[4] !== undefined) parts.push(<a key={key++} href={match[5]} className="text-green-400 underline underline-offset-2" target="_blank" rel="noreferrer">{match[4]}</a>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) parts.push(<span key={key++}>{content.slice(lastIndex)}</span>);
  // Render line breaks
  const lines = ([] as React.ReactNode[]).concat(...parts.map((p, i) =>
    typeof p === 'string' ? p.split('\n').flatMap((line, j) => j === 0 ? [line] : [<br key={`br-${i}-${j}`}/>, line]) : [p]
  ));
  return <>{lines}</>;
}

type AIActionPayload = {
  type: "PROPOSAL" | "ANALYSIS";
  sentiment?: "BULLISH" | "BEARISH" | "NEUTRAL";
  action?: "LONG" | "SHORT";
  token?: string;
  leverage?: number;
  sizeUsd?: number;
  tp?: string;
  sl?: string;
};

type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  payload?: AIActionPayload | null;
  executed?: boolean;
};

export function AgentTerminal({ onTokenDetect, vaultBalance }: { onTokenDetect?: (token: string) => void; vaultBalance?: number | null }) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "agent",
      content: "Welcome to LeverixPro. How can I assist you with your Solana assets today? I can help you open positions, analyze markets, or set Auto TP/SL limits."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    // Auto-detect typed tokens like "BTC", "ETH" and switch chart immediately
    const userMatchToken = userMessage.content.toUpperCase().match(/\b(BTC|ETH|SOL|WIF|JUP|BONK|XRP|DOGE|PEPE)\b/);
    if (userMatchToken && onTokenDetect) {
       onTokenDetect(userMatchToken[1]);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("xAI API unavailable");

      const data = await response.json();
      let aiContent = data.message?.content || "Leverix AI nodes offline.";
      
      const jsonRegex = /```json\n([\s\S]*?)\n```/;
      const match = aiContent.match(jsonRegex);
      
      let payload: AIActionPayload | null = null;
      if (match && match[1]) {
        try {
          payload = JSON.parse(match[1]);
          aiContent = aiContent.replace(jsonRegex, "").trim();
          
          if (payload?.token && onTokenDetect) {
             onTokenDetect(payload.token);
          }
        } catch (e) {
          console.error("Failed to parse Claw Engine JSON payload", e);
        }
      }

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "agent", 
        content: aiContent,
        payload 
      }]);

    } catch (_error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "agent", content: "Error: Matrix disconnected. Check your API keys and connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const updatePayload = (msgId: string, updates: Partial<AIActionPayload>) => {
    setMessages(prev => prev.map(m => m.id === msgId && m.payload ? { ...m, payload: { ...m.payload, ...updates } } : m));
  };

  const executeProposal = async (msgId: string, payload: AIActionPayload) => {
    if (!publicKey) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: "agent",
        content: "⚠️ **Trade execution halted.** Please connect your Solana wallet to sign the transaction."
      }]);
      return;
    }

    // Block execution if vault has no funds
    if (vaultBalance === 0 || vaultBalance === null || vaultBalance === undefined) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: "agent",
        content: "🔒 **Agent Vault Unfunded.** Your custodial vault has 0 SOL. Please [deposit capital to the Vault](/vault) first so the agent can execute this trade on your behalf."
      }]);
      return;
    }
    
    // Mark as executed
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, executed: true } : m));

    try {
      setMessages(prev => [...prev, {
        id: (Date.now() + 3).toString(),
        role: "agent",
        content: `⚡ **Execution Engine:** Delegating ${payload.action} on ${payload.token} to Agent Vault...`
      }]);

      // Call backend trade execution API
      const req = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          action: payload.action || "LONG",
          token: payload.token || "SOL",
          leverage: payload.leverage || 5,
          sizeUsd: payload.sizeUsd || 50,
          takeProfit: payload.tp,
          stopLoss: payload.sl,
          collateral: `${payload.sizeUsd} USD`, // Record keeping
        })
      });

      const res = await req.json();

      if (!req.ok || res.error) {
        throw new Error(res.error || res.message || "Execution failed in backend.");
      }

      const txid = res.data?.txSignature || "PENDING_EXECUTION";

      setMessages(prev => [...prev, {
        id: (Date.now() + 4).toString(),
        role: "agent",
        content: `✅ **Vault Swap Executed!**\n\nAction: **${payload.action} ${payload.token}**\nRoute: Jupiter v6 (Vault Key)\nTxID: [\`${txid.substring(0, 8)}...\`](https://solscan.io/tx/${txid})\n\nAuto TP/SL matrix algorithm is now actively tracking this position.`
      }]);
      
    } catch(e: any) {
      console.error("Trade API Error", e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 5).toString(),
        role: "agent",
        content: `⚠️ **Failed to execute transaction:** ${e.message || "Agent Vault encountered an issue."}`
      }]);
    }
  };

  return (
    <div className="flex flex-col h-[650px] glass-card rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <div className="bg-[#0a0a0a] px-6 py-4 border-b border-white/5 flex items-center justify-between shadow-[0_4px_30px_rgba(34,197,94,0.05)]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bot className="text-green-400 bg-green-500/10 p-2.5 rounded-xl border border-green-500/20" size={40} />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-black"></span>
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Leverix Core Agent</h3>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
               Claw Engine v4.0 Active
            </div>
          </div>
        </div>
        <Terminal className="text-gray-600" size={20} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6" ref={scrollRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            
            <div className={`mt-1 p-2 rounded-xl h-fit flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-white/10" : "bg-black/50 border border-white/10"}`}>
              {msg.role === "user" ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-400" />}
            </div>

            <div className="flex flex-col gap-3 max-w-[85%] sm:max-w-[75%]">
              
              <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-white text-black font-medium" 
                  : "bg-[#111] text-gray-300 border border-white/5"
              }`}>
                <RichText content={msg.content} />
              </div>

              {/* Agent Rich Payload UI Tools */}
              {msg.payload && msg.role === "agent" && (
                <div className="w-full">
                  
                  {/* Analysis Sentiment Badge */}
                  {msg.payload.type === "ANALYSIS" && msg.payload.sentiment && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-black/40 text-xs font-bold font-mono shadow-md border-white/10">
                      Social Sentiment: 
                      <span className={msg.payload.sentiment === "BULLISH" ? "text-green-400 flex gap-1 items-center" : "text-red-400 flex gap-1 items-center"}>
                        {msg.payload.sentiment === "BULLISH" ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                        {msg.payload.sentiment}
                      </span>
                    </div>
                  )}

                  {/* Trade Proposal Ticket */}
                  {msg.payload.type === "PROPOSAL" && (
                     <div className="mt-1 bg-[#1a1c1e] border border-blue-500/20 rounded-xl p-4 shadow-[0_0_20px_rgba(59,130,246,0.05)]">
                        <div className="flex items-center gap-2 text-blue-400 font-bold mb-4 text-xs tracking-wider uppercase">
                          <Shield size={14}/> Trade Proposal Ticket
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="bg-black/50 rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Direction</span>
                            <span className={`font-bold flex items-center gap-1.5 ${msg.payload.action === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                              {msg.payload.action === 'LONG' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {msg.payload.action} {msg.payload.token}
                            </span>
                          </div>
                          <div className="bg-black/50 rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Leverage</span>
                            {!msg.executed ? (
                              <div className="flex items-center text-white font-bold bg-[#0a0a0a] border border-white/10 rounded px-2 w-full">
                                <input 
                                  type="number" 
                                  className="bg-transparent border-none outline-none w-full tabular-nums text-sm py-0.5" 
                                  value={msg.payload.leverage || 1} 
                                  onChange={(e) => updatePayload(msg.id, { leverage: Number(e.target.value) })}
                                />
                                <span className="text-gray-500 text-xs">x</span>
                              </div>
                            ) : (
                              <span className="font-bold text-white">{msg.payload.leverage}x</span>
                            )}
                          </div>
                          <div className="bg-black/50 rounded-lg p-2.5 border border-white/5">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Size (USD)</span>
                            {!msg.executed ? (
                              <div className="flex items-center text-white font-bold bg-[#0a0a0a] border border-white/10 rounded px-2 w-full">
                                <span className="text-gray-500 text-xs mr-1">$</span>
                                <input 
                                  type="number" 
                                  className="bg-transparent border-none outline-none w-full tabular-nums text-sm py-0.5" 
                                  value={msg.payload.sizeUsd || 10} 
                                  onChange={(e) => updatePayload(msg.id, { sizeUsd: Number(e.target.value) })}
                                />
                              </div>
                            ) : (
                              <span className="font-bold text-white">${msg.payload.sizeUsd}</span>
                            )}
                          </div>
                          <div className="bg-black/50 rounded-lg p-2.5 border border-white/5 col-span-2">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Risk Bounds (TP / SL)</span>
                            {!msg.executed ? (
                               <div className="flex items-center gap-2">
                                  <div className="flex items-center bg-[#0a0a0a] border border-green-500/30 rounded px-2 flex-1">
                                     <span className="text-green-500 text-[10px] font-bold mr-1">TP</span>
                                     <input type="text" value={msg.payload.tp || ''} onChange={(e) => updatePayload(msg.id, { tp: e.target.value })} className="bg-transparent text-green-400 font-mono text-xs w-full py-1 outline-none"/>
                                  </div>
                                  <div className="flex items-center bg-[#0a0a0a] border border-red-500/30 rounded px-2 flex-1">
                                     <span className="text-red-500 text-[10px] font-bold mr-1">SL</span>
                                     <input type="text" value={msg.payload.sl || ''} onChange={(e) => updatePayload(msg.id, { sl: e.target.value })} className="bg-transparent text-red-400 font-mono text-xs w-full py-1 outline-none"/>
                                  </div>
                               </div>
                            ) : (
                               <span className="font-mono text-[11px] text-gray-300">TP {msg.payload.tp} / SL {msg.payload.sl}</span>
                            )}
                          </div>
                        </div>

                        {!msg.executed ? (
                          <div className="flex gap-2">
                             <button className="flex-1 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 font-semibold text-xs transition-colors border border-white/5">
                               Reject
                             </button>
                             {(vaultBalance === 0 || vaultBalance === null || vaultBalance === undefined) ? (
                               <a href="/vault" className="flex-2 w-[60%] py-2.5 rounded-lg bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 font-bold text-xs transition-colors text-center flex items-center justify-center gap-1">
                                 🔒 Fund Vault to Execute
                               </a>
                             ) : (
                               <button 
                                  onClick={() => executeProposal(msg.id, msg.payload!)}
                                  className="flex-2 w-[60%] py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                               >
                                 Approve & Execute
                               </button>
                             )}
                          </div>
                        ) : (
                          <div className="w-full py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs flex items-center justify-center gap-2">
                             <Check size={14}/> Trade Approved & Dispatched
                          </div>
                        )}
                     </div>
                  )}
                  
                </div>
              )}
            </div>
            
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
             <div className="mt-1 p-2 rounded-xl h-fit bg-black/50 border border-white/10 flex items-center justify-center">
              <Bot size={16} className="text-gray-400" />
            </div>
            <div className="bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-gray-400 text-sm flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-75"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#0a0a0a] border-t border-white/10 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Analyze SOL's sentiment or propose a LONG position..."
            className="input-field pr-12 rounded-xl bg-[#1a1c1e] border border-white/10 text-sm py-4 w-full focus:ring-1 ring-blue-500/30 focus:border-blue-500/50 transition-all outline-none text-white shadow-inner block"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 bg-white text-black rounded-lg hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 transition-all cursor-pointer shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
