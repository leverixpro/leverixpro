"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Heart, Share2, Copy, Image as ImageIcon, TrendingUp, TrendingDown, Minus, Loader2, X, Zap, Activity, BarChart2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";


export default function FeedsPage() {
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState("for-you");
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [postSentiment, setPostSentiment] = useState<"BULLISH" | "BEARISH" | "NEUTRAL">("BULLISH");
  const [postToken, setPostToken] = useState("SOL");
  const [isPublishing, setIsPublishing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [postImage, setPostImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [aiSignals] = useState([
    { token: "SOL", signal: "STRONG BUY", confidence: 87, color: "green" },
    { token: "BTC", signal: "BUY", confidence: 74, color: "green" },
    { token: "ETH", signal: "NEUTRAL", confidence: 52, color: "yellow" },
    { token: "WIF", signal: "SELL", confidence: 68, color: "red" },
    { token: "JUP", signal: "WATCH", confidence: 61, color: "blue" },
  ]);

  const MOCK_FEEDS = [
    {
      id: "mock1",
      author_wallet: "5YNmS1R9nNS24FpD3hryx1y3yMw9wQ5hTj",
      content: "Just loaded up heavily on $SOL. On-chain metrics are showing massive accumulation by smart money over the last 48 hours. The breakout past $150 is inevitable if BTC holds.",
      token_symbol: "SOL",
      sentiment: "BULLISH",
      likes_count: 142,
      comments_count: 24,
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      copytrade_payload: { action: "LONG", token: "SOL", leverage: 5, sizeUsd: 2500 }
    },
    {
      id: "mock2",
      author_wallet: "9uXyB2MvW4rFp8nTd3y1Zq3wKw5vTj9R",
      content: "Seeing early signs of exhaustion on $WIF. Funding rates are way too high and OI is dropping. Proceed with caution, short-term correction likely before next leg up.",
      token_symbol: "WIF",
      sentiment: "BEARISH",
      likes_count: 89,
      comments_count: 12,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      copytrade_payload: { action: "SHORT", token: "WIF", leverage: 3, sizeUsd: 1000 }
    },
    {
      id: "mock3",
      author_wallet: "3nRcK7LpB1tYw5mQd9x2Zy4vHw8fTj6M",
      content: "JUP consolidating beautifully right here. Aggregator volume consistently breaking ATHs. Spot bags fully packed, deploying perps once we clear resistance.",
      token_symbol: "JUP",
      sentiment: "BULLISH",
      likes_count: 215,
      comments_count: 56,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "mock4",
      author_wallet: "7bHxV5NwC2mDp9qRd1y3Zt4vFw8hTj2K",
      content: "BTC macro structure remains incredibly strong. Any dip below 60k is for buying. Wall Street flows acting as massive backstop against downside.",
      token_symbol: "BTC",
      sentiment: "BULLISH",
      likes_count: 341,
      comments_count: 89,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      copytrade_payload: { action: "LONG", token: "BTC", leverage: 10, sizeUsd: 15000 }
    },
    {
      id: "mock5",
      author_wallet: "1xZpT9RwN5cFd2mQq8y3Vb4vHw7jT1M",
      content: "Volume is dying down across the board. Staying flat on $ETH until we get a clear directional break from this wedge.",
      token_symbol: "ETH",
      sentiment: "NEUTRAL",
      likes_count: 45,
      comments_count: 8,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    }
  ];

  const LEADERBOARD = [
    { rank: 1, name: "0xDeepAlpha", roi: "+842%", winRate: "91%", trades: 142, pnl: "$124K", addr: "DeepA...lpha1" },
    { rank: 2, name: "LeverixWhale", roi: "+610%", winRate: "88%", trades: 98, pnl: "$89K", addr: "LvxW...hale2" },
    { rank: 3, name: "Claw_Master", roi: "+494%", winRate: "85%", trades: 215, pnl: "$65K", addr: "ClwM...aster3" },
    { rank: 4, name: "SolanaSniper", roi: "+380%", winRate: "82%", trades: 310, pnl: "$41K", addr: "SolS...niper4" },
    { rank: 5, name: "Quant_Vault", roi: "+312%", winRate: "79%", trades: 156, pnl: "$35K", addr: "QntV...ault5" },
    { rank: 6, name: "MacroBull", roi: "+290%", winRate: "76%", trades: 84, pnl: "$28K", addr: "McBu...l6xY" },
    { rank: 7, name: "Aegis_Prime", roi: "+245%", winRate: "75%", trades: 120, pnl: "$22K", addr: "AegP...rime7" },
    { rank: 8, name: "DegenTrader", roi: "+198%", winRate: "68%", trades: 450, pnl: "$18K", addr: "DegT...rader8" },
  ];

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

  // Fetch live market data for the AI Alpha Matrix panel
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch('/api/market');
        const data = await res.json();
        if (data.success && data.data) {
          setMarketData(data.data);
        }
      } catch (e) {
        console.warn('Market data fetch failed', e);
      } finally {
        setMarketLoading(false);
      }
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  const sentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "BULLISH": return "text-green-400 bg-green-500/10 border-green-500/20";
      case "BEARISH": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const sentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "BULLISH": return <TrendingUp size={12} className="inline mr-1" />;
      case "BEARISH": return <TrendingDown size={12} className="inline mr-1" />;
      default: return <Minus size={12} className="inline mr-1" />;
    }
  };

  const fetchFeeds = async () => {
    const db = getDb();
    setLoading(true);
    const { data, error } = await db
      .from("feeds")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    
    // Merge real database posts with high-quality mock dummy data
    if (!error && data) {
      setFeeds([...data, ...MOCK_FEEDS]);
    } else {
      setFeeds(MOCK_FEEDS);
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    if (!postContent.trim() || !connected || !publicKey) return;
    const db = getDb();
    setIsPublishing(true);
    const { error } = await db.from("feeds").insert({
      author_wallet: publicKey.toBase58(),
      content: postContent,
      token_symbol: postToken,
      sentiment: postSentiment,
      image_url: postImage || null
    });
    if (!error) {
      setPostContent("");
      setPostImage("");
      await fetchFeeds();
    }
    setIsPublishing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    if (likedPosts.has(postId)) return;
    const db = getDb();
    setLikedPosts(prev => new Set([...prev, postId]));
    setFeeds(prev => prev.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    if (!String(postId).startsWith("mock")) {
      await db.from("feeds").update({ likes_count: currentLikes + 1 }).eq("id", postId);
    }
  };

  const handleComment = (postId: string) => {
    const comment = prompt("Add your comment:");
    if (comment && comment.trim() !== "") {
      setFeeds(prev => prev.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
      alert("Comment published successfully!");
    }
  };

  const handleShare = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/feeds?post=${postId}`);
    alert("Post link copied to clipboard!");
  };

  useEffect(() => { fetchFeeds(); }, []);

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const avatarLetters = (wallet: string) =>
    wallet ? `${wallet.slice(0, 2).toUpperCase()}` : "??";

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="glass-panel border-x-0 border-t-0 bg-black/60 h-20 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.jpeg" alt="LeverixPro Logo" className="w-8 h-8 rounded-lg object-cover transform scale-[1.2] shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter">
              LeverixPro
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/trade" className="hover:text-white cursor-pointer transition-colors">Trade Terminal</Link>
            <Link href="/vault" className="hover:text-white cursor-pointer transition-colors">Agent Vault</Link>
            <span className="text-white cursor-pointer px-4 py-2 bg-white/10 rounded-lg">Social Signals</span>
          </div>
        </div>
        <div className="custom-wallet-btn">
          <WalletMultiButton />
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left: AI Alpha Matrix Panel */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          {/* Live Market Prices */}
          <div className="glass-card p-5 border border-white/5 sticky top-28 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <BarChart2 size={14} className="text-blue-400" /> Live Market
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="space-y-2.5">
              {marketLoading ? (
                <div className="flex gap-2 items-center text-gray-600 text-xs py-2"><Loader2 size={12} className="animate-spin" /> Syncing...</div>
              ) : marketData.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={t.img} alt={t.id} className="w-5 h-5 rounded-full" onError={(e) => { e.currentTarget.src = ''; }} />
                    <span className="text-xs text-gray-300 font-mono font-bold">{t.id}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-white">${t.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={`text-[10px] font-mono font-bold ${t.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Activity size={10} /> OpenClaw AI Signals
              </h4>
              <div className="space-y-2.5">
                {aiSignals.map((s) => (
                  <div key={s.token} className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-gray-400">${s.token}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.color === 'green' ? 'bg-green-500' :
                          s.color === 'red' ? 'bg-red-500' :
                          s.color === 'blue' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${s.confidence}%` }}
                      />
                    </div>
                    <span className={`text-[9px] font-bold font-mono w-16 text-right ${
                      s.color === 'green' ? 'text-green-400' :
                      s.color === 'red' ? 'text-red-400' :
                      s.color === 'blue' ? 'text-blue-400' : 'text-yellow-400'
                    }`}>{s.signal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <h4 className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertTriangle size={10} /> Whale Radar
              </h4>
              {[
                { token: "SOL", size: "$2.4M", type: "BUY", ago: "4m ago" },
                { token: "BTC", size: "$18.1M", type: "SELL", ago: "11m ago" },
                { token: "ETH", size: "$5.7M", type: "BUY", ago: "23m ago" },
              ].map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                  <Zap size={9} className={w.type === 'BUY' ? 'text-green-400' : 'text-red-400'} />
                  <span className="text-gray-500">{w.ago}</span>
                  <span className={`font-bold ml-auto ${w.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{w.type}</span>
                  <span className="text-white">{w.size}</span>
                  <span className="text-gray-500">{w.token}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Main Feed */}
        <div className="lg:col-span-2 space-y-5">

          {/* Create Post */}
          <div className="glass-card p-5 border border-white/5 bg-black/40">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs text-white font-bold shrink-0">
                {connected && publicKey ? avatarLetters(publicKey.toBase58()) : "?"}
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder={connected ? "Share your market analysis or signal..." : "Connect wallet to post signals..."}
                  disabled={!connected}
                  className="w-full bg-transparent text-white text-sm placeholder-gray-600 outline-none resize-none h-16 disabled:opacity-40"
                />
                <div className="flex gap-2 items-center border-t border-white/5 pt-3">
                  <select
                    value={postToken}
                    onChange={e => setPostToken(e.target.value)}
                    disabled={!connected}
                    className="text-xs bg-black/40 border border-white/10 text-gray-300 rounded px-2 py-1 outline-none disabled:opacity-40"
                  >
                    {["SOL", "BTC", "ETH", "WIF", "JUP", "BONK"].map(t => <option key={t}>{t}</option>)}
                  </select>
                  {(["BULLISH", "NEUTRAL", "BEARISH"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setPostSentiment(s)}
                      disabled={!connected}
                      className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors disabled:opacity-40 ${postSentiment === s ? sentimentColor(s) : "border-white/10 text-gray-500"}`}
                    >
                      {s}
                    </button>
                  ))}
                  
                  {/* Hidden Image Input */}
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!connected}
                    className={`p-1.5 rounded transition-colors ${postImage ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-white'}`}
                    title="Upload Chart Image"
                  >
                    <ImageIcon size={14} />
                  </button>

                  <button
                    onClick={handlePublish}
                    disabled={!connected || !postContent.trim() || isPublishing}
                    className="ml-auto bg-white text-black text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    {isPublishing ? <Loader2 size={12} className="animate-spin" /> : null}
                    Publish
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Tabs */}
          <div className="flex border-b border-white/10">
            {["for-you", "following"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 text-xs font-mono uppercase tracking-widest relative transition-colors ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                {tab === "for-you" ? "Live Feed" : "Following"}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
              </button>
            ))}
          </div>

          {/* Posts */}
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-600">
                <Loader2 className="animate-spin mr-2" size={20} />
                <span className="text-xs font-mono tracking-widest">SYNCING SIGNAL FEED...</span>
              </div>
            ) : feeds.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-600 text-xs font-mono tracking-widest border border-white/5 rounded-xl"
              >
                NO SIGNALS DETECTED. BE THE FIRST TO PUBLISH.
              </motion.div>
            ) : (
              <div className="space-y-4">
                {feeds.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5 border border-white/5 hover:border-white/10 transition-colors bg-black/40"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                          {avatarLetters(post.author_wallet || "")}
                        </div>
                        <div>
                          <div className="text-white text-sm font-semibold font-mono">
                            {post.author_wallet ? `${post.author_wallet.slice(0, 6)}...${post.author_wallet.slice(-4)}` : "Anonymous"}
                          </div>
                          <div className="text-[10px] text-gray-600">
                            {post.created_at ? timeAgo(post.created_at) : "Just now"}
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded border text-[10px] font-bold tracking-widest flex items-center ${sentimentColor(post.sentiment)}`}>
                        {sentimentIcon(post.sentiment)} {post.sentiment}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        ${post.token_symbol}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed">{post.content}</p>

                    {post.image_url && (
                      <div className="w-full h-52 rounded-lg overflow-hidden mt-4 border border-white/10">
                        <img src={post.image_url} alt="Signal Chart" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                      </div>
                    )}

                    {post.copytrade_payload && (
                      <div className="mt-4 bg-blue-500/5 rounded-lg p-3 border border-blue-500/20 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-400 font-mono">
                          <span className="text-white font-bold">{post.copytrade_payload.action} {post.copytrade_payload.token}</span>
                          {" · "}{post.copytrade_payload.leverage}x{" · "}${post.copytrade_payload.sizeUsd}
                        </span>
                        <button className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-3 py-1 rounded text-[10px] font-bold transition-colors">
                          <Copy size={11} /> 1-Click Copy
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleLike(post.id, post.likes_count || 0)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${likedPosts.has(post.id) ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}
                      >
                        <Heart size={14} fill={likedPosts.has(post.id) ? "currentColor" : "none"} />
                        {post.likes_count || 0}
                      </button>
                      <button 
                        onClick={() => handleComment(post.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors"
                      >
                        <MessageSquare size={14} />
                        {post.comments_count || 0}
                      </button>
                      <button 
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors ml-auto"
                      >
                        <Share2 size={14} /> Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Top Copytraders */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="glass-card p-5 border border-white/5 sticky top-28">
            <h3 className="text-white font-bold mb-4 text-sm">Top Copytraders 🏆</h3>
            <div className="space-y-3">
              {LEADERBOARD.map(t => (
                <div 
                  key={t.rank} 
                  onClick={() => setSelectedTrader(t)}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10"
                >
                  <span className="text-xs font-mono text-gray-600 w-4">{t.rank}.</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white font-bold border ${
                    t.rank === 1 ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-500" :
                    t.rank === 2 ? "bg-gray-400/20 border-gray-400/50 text-gray-300" :
                    t.rank === 3 ? "bg-orange-700/20 border-orange-700/50 text-orange-400" :
                    "bg-gradient-to-br from-gray-700 to-black border-white/10"
                  }`}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">{t.name}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-green-400 font-mono font-bold">{t.roi}</span>
                    <span className="text-[9px] text-gray-500 font-mono">WR: {t.winRate}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-xs transition-colors">
              View Full Leaderboard
            </button>
          </div>
        </div>

      </main>

      {/* Trader Profile Popup Modal */}
      <AnimatePresence>
        {selectedTrader && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass-card border border-white/10 shadow-[0_0_40px_rgba(34,197,94,0.1)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-purple-900/30 to-blue-900/30" />
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedTrader(null); }}
                className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors z-[120] bg-black/50 p-1.5 rounded-full"
              >
                <X size={16} />
              </button>

              <div className="px-6 pb-6 relative z-10 pt-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-black border-2 border-green-500/50 mx-auto flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] mb-4">
                  {selectedTrader.name.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-white mb-1 tracking-tight">{selectedTrader.name}</h2>
                <div className="inline-flex items-center gap-1.5 bg-black/50 border border-white/10 px-3 py-1 rounded-full text-[10px] font-mono text-gray-400 mb-6">
                  {selectedTrader.addr} <Copy size={10} className="hover:text-white cursor-pointer" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-widest">Total ROI</div>
                    <div className="text-xl font-bold text-green-400 tracking-tighter">{selectedTrader.roi}</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-widest">Win Rate</div>
                    <div className="text-xl font-bold text-white tracking-tighter">{selectedTrader.winRate}</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-widest">Realized PNL</div>
                    <div className="text-xl font-bold text-white tracking-tighter">{selectedTrader.pnl}</div>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-widest">Total Trades</div>
                    <div className="text-xl font-bold text-white tracking-tighter">{selectedTrader.trades}</div>
                  </div>
                </div>

                <button 
                  onClick={() => { alert(`Auto-Copytrade connected to ${selectedTrader.name}`); setSelectedTrader(null); }}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={16} /> 1-Click Subscribe
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
