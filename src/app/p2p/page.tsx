"use client";

import Link from "next/link";
import { ArrowLeft, Users, Zap, Shield, Clock } from "lucide-react";

export default function P2PPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl border-b border-white/5 h-20 flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.jpeg" alt="LeverixPro Logo" className="w-8 h-8 rounded-lg object-cover transform scale-[1.2] shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter">
              LeverixPro
            </span>
          </Link>
          <span className="text-gray-500 text-sm font-medium">/ P2P Exchange</span>
        </div>
        <Link href="/" className="ml-auto flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16}/> Back
        </Link>
      </header>

      {/* Background layer (blurred out interface teaser) */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none select-none" aria-hidden="true">
        <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
          {/* Fake trade cards */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 border border-white/5 h-40 rounded-xl"></div>
          ))}
        </div>
      </div>

      {/* Heavy blur overlay */}
      <div className="absolute inset-0 z-10 backdrop-blur-xl bg-black/60 pointer-events-none" />

      {/* Coming Soon Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-[85vh] text-center px-4">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md mb-8">
          <Clock size={14} className="text-yellow-400 animate-pulse" />
          <span className="text-xs font-semibold text-gray-200 tracking-wider">DEVELOPMENT IN PROGRESS</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 text-shadow-hard">
          P2P Exchange
        </h1>
        <div className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-600 mb-10 tracking-tight">
          COMING SOON
        </div>

        <p className="text-xl text-gray-300 max-w-2xl leading-relaxed mb-12">
          A fully decentralized peer-to-peer perpetual futures exchange is under construction. Trade directly against other LeverixPro users — no intermediary, no central orderbook, full on-chain settlement.
        </p>

        {/* Feature teasers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full mb-12">
          <div className="glass-card p-6 border border-white/5 text-left space-y-3">
            <Users className="text-gray-400" size={24} />
            <h3 className="text-white font-semibold">Direct P2P Matching</h3>
            <p className="text-gray-500 text-sm">Match directly against counterparties without a centralized exchange taking fees.</p>
          </div>
          <div className="glass-card p-6 border border-white/5 text-left space-y-3">
            <Zap className="text-yellow-400" size={24} />
            <h3 className="text-white font-semibold">Instant Settlement</h3>
            <p className="text-gray-500 text-sm">All positions settle on-chain via Solana smart contracts in under 400ms.</p>
          </div>
          <div className="glass-card p-6 border border-white/5 text-left space-y-3">
            <Shield className="text-green-400" size={24} />
            <h3 className="text-white font-semibold">Aegis Protected</h3>
            <p className="text-gray-500 text-sm">Every P2P trade will be fully governed by the Aegis Defense Matrix anti-liquidation system.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/trade" className="btn-primary flex items-center gap-2 px-8 py-4">
            Use Terminal Instead <Zap size={16} />
          </Link>
          <Link href="/vault" className="glass-card flex items-center gap-2 px-8 py-4 text-white font-medium hover:bg-white/10 transition border border-white/10">
            <Shield size={16} /> Open Agent Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
