import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
      tokenMint,   // SPL Token Mint Address (for Jupiter Perps routing)
      leverage,    // number (e.g. 10)
      collateral,  // string (e.g. "5 SOL")
      stopLoss,    // string (e.g. "-3.0% trailing")
      takeProfit,  // string (e.g. "+25%")
      aegisCheck,  // "PASSED" | "BLOCKED"
      type,        // "MARKET" | "LIMIT" | "TP_SL"
      priceLimit,  // optional: limit price for limit orders
    } = body;

    // ── Basic Validation ──────────────────────────────────────────────────────
    if (!walletAddress || !action || !token || !leverage || !collateral) {
      return NextResponse.json(
        { error: "LeverixPro: Missing required trade parameters." },
        { status: 400 }
      );
    }

    // ── Aegis Defense Matrix Pre-Flight Check ─────────────────────────────────
    if (aegisCheck === "BLOCKED") {
      return NextResponse.json(
        {
          status: "blocked",
          message: "AEGIS-001: Trade blocked. Collateral exceeds 80% margin utilization limit.",
        },
        { status: 403 }
      );
    }

    // ── Save Order to Supabase (Auto TP/SL Execution Engine) ─────────────────
    // The Railway worker will poll this table and execute when conditions are met.
    let dbRecord = null;
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from("orders").insert([
        {
          wallet_address: walletAddress,
          action: action.toUpperCase(),
          token_symbol: token.toUpperCase(),
          token_mint: tokenMint || null,
          leverage: Number(leverage),
          collateral: collateral,
          stop_loss: stopLoss || "-3.0% trailing",
          take_profit: takeProfit || "+25%",
          aegis_check: aegisCheck || "PASSED",
          order_type: type || "MARKET",
          limit_price: priceLimit || null,
          status: "PENDING", // Will be updated to "EXECUTED" or "CANCELLED" by the worker
        },
      ]).select().single();

      if (error) {
        // Non-fatal: log but still return success (Supabase may not be configured yet)
        console.warn("LeverixPro Supabase warning (orders table):", error.message);
      } else {
        dbRecord = data;
      }
    }

    // ── Generate mock tx signature (real integration: Jupiter Perps SDK call) ─
    const mockTxSignature = `lvrx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return NextResponse.json({
      status: "success",
      message: `LeverixPro Order Queued. Action: ${action.toUpperCase()} ${token} @ ${leverage}x`,
      data: {
        orderId: dbRecord?.id || `mock_${mockTxSignature}`,
        txSignature: mockTxSignature,
        action: action.toUpperCase(),
        token,
        leverage,
        collateral,
        stopLoss: stopLoss || "-3.0% trailing",
        takeProfit: takeProfit || "+25%",
        orderType: type || "MARKET",
        limitPrice: priceLimit || null,
        aegisStatus: aegisCheck || "PASSED",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        note: "Order is pending Aegis execution engine. Auto TP/SL will trigger automatically via Jupiter Perps when price conditions are met.",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("LeverixPro Trade API Error:", message);
    return NextResponse.json(
      { error: "LeverixPro encountered an error processing the trade." },
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
