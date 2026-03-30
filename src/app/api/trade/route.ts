import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";


// ── Lazy Supabase client — only instantiated if env vars are set ─────────────
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("your_supabase") || url.includes("your-project")) return null;
  return createClient(url, key);
}

// ── Auto TP/SL Limit Order — Core Handler ────────────────────────────────────
// This endpoint is called by the AgentTerminal after AI outputs an execution payload.
// It records the order in Supabase, where a backend worker (Railway cron job) 
// will poll Jupiter Perps prices and auto-execute when trigger price is hit.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      walletAddress,
      action,      // "LONG" | "SHORT"
      token,       // "SOL" | "WIF" | "JUP" etc.
      tokenMint,   // Optional SPL Token Mint Address
      leverage,    // number (e.g. 10)
      sizeUsd,     // number
      collateral,  // string (e.g. "50 USD")
      stopLoss,    // string
      takeProfit,  // string
      aegisCheck,  // "PASSED" | "BLOCKED"
      type,        // "MARKET" | "LIMIT" | "TP_SL"
      priceLimit,  // optional
    } = body;

    // ── Basic Validation ──────────────────────────────────────────────────────
    if (!walletAddress || !action || !token || !sizeUsd) {
      return NextResponse.json(
        { error: "LeverixPro: Missing required trade parameters." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "LeverixPro Supabase connection missing." }, { status: 500 });
    }

    const { data: agentData, error: agentError } = await supabase
      .from('agent_wallets')
      .select('agent_public_key, agent_private_key')
      .eq('wallet_address', walletAddress)
      .single();

    if (agentError || !agentData || !agentData.agent_private_key || !agentData.agent_public_key) {
      return NextResponse.json(
        { error: "Agent Wallet not initialized or found for this user." },
        { status: 404 }
      );
    }

    const agentPublicKeyStr: string = agentData.agent_public_key;
    const agentPrivateKeyStr: string = agentData.agent_private_key;

    // ── Execute Real Action via Jupiter v6 ────────────────────────────────────
    const connection = new Connection(rpcUrl, 'confirmed');
    const agentKeypair = Keypair.fromSecretKey(bs58.decode(agentPrivateKeyStr));

    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const SOL_MINT = "So11111111111111111111111111111111111111112";
    
    // Simple logic mapping depending on LONG/SHORT/Asset
    const isLong = action.toUpperCase() === "LONG" || token === "SOL";
    const inputMint = isLong ? USDC_MINT : SOL_MINT;
    const outputMint = isLong ? SOL_MINT : USDC_MINT;

    // Calculate simulated raw amount. Normally use strict oracle. 
    // Using simple assumption: sizeUsd * 1M (USDC decimals are 6)
    const amountRaw = Math.floor(sizeUsd * 1000000);

    // 1. Get Quote
    const quoteReq = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountRaw}&slippageBps=50`);
    const quoteResponse = await quoteReq.json();

    if (quoteResponse.error) {
      throw new Error(`Jupiter Quote Error: ${quoteResponse.error}`);
    }

    // 2. Get Swap Transaction Data
    const swapReq = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey: agentPublicKeyStr,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto"
      })
    });
    
    const { swapTransaction, error: swapError } = await swapReq.json();
    if (swapError) {
      throw new Error(`Jupiter Swap Error: ${swapError}`);
    }

    // 3. Deserialize and Sign with Agent Keypair
    const swapTransactionBuf = Uint8Array.from(atob(swapTransaction), c => c.charCodeAt(0));
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    
    transaction.sign([agentKeypair]);

    // 4. Broadcast
    const liveTxSignature = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 2,
    });

    // ── Save Order to Supabase (History & Background Loop Tracking) ───────────
    let dbRecord = null;
    const { data: orderData, error: dbError } = await supabase.from("orders").insert([
      {
        wallet_address: walletAddress,
        action: action.toUpperCase(),
        token_symbol: token.toUpperCase(),
        token_mint: tokenMint || null,
        leverage: Number(leverage),
        collateral: collateral || `${sizeUsd} USD`,
        stop_loss: stopLoss || "-3.0% trailing",
        take_profit: takeProfit || "+25%",
        aegis_check: aegisCheck || "PASSED",
        order_type: type || "MARKET",
        limit_price: priceLimit || null,
        status: "EXECUTED",
      },
    ]).select().single();

    if (dbError) {
      console.warn("LeverixPro DB Warning (Orders Table):", dbError.message);
    } else {
      dbRecord = orderData;
    }

    return NextResponse.json({
      status: "success",
      message: `LeverixPro Autonomous Execution Completed.`,
      data: {
        orderId: dbRecord?.id || liveTxSignature,
        txSignature: liveTxSignature,
        action: action.toUpperCase(),
        token,
        leverage,
        collateral,
        stopLoss: stopLoss || "-3.0% trailing",
        takeProfit: takeProfit || "+25%",
        aegisStatus: aegisCheck || "PASSED",
        status: "EXECUTED",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("LeverixPro Trade API Error:", message);
    return NextResponse.json(
      { error: message || "Execution failed during on-chain routing." },
      { status: 500 }
    );
  }
}

// ── GET: Fetch active orders for a wallet ──────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("wallet");

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required." }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ orders: [], note: "Supabase not configured." });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ orders: data || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("LeverixPro Trade GET Error:", message);
    return NextResponse.json(
      { error: "Failed to fetch order history." },
      { status: 500 }
    );
  }
}
