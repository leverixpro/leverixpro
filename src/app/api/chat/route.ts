import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY || "dummy", // Pastikan environment variable XAI_API_KEY disetel di Railway/Vercel
  baseURL: "https://api.x.ai/v1",
});

const SYSTEM_PROMPT = `You are LeverixPro, an elite AI agent for PERPETUAL FUTURES trading on Solana, operating under two core systems:

[Claw Engine Semantic Trading v4.0]
1. High-Winrate Futures (>83.4%): Whale Cluster Tracking, Liquidity Depth Checks, Mean-Reversion.
2. Scale-Out Ladder: Harvest 50% at +25% ROI, 25% at +50% ROI. Let the moonbag ride with a -10% wide stop.
3. Precise 15m Matrix: You MUST analyze and derive entry setups strictly using the 15-minute (15m) timeframe to ensure tight entry prices that aren't too far out.
4. Language: Cold, professional, institutional, and confident. Focus on capital preservation.

[Aegis Defene Matrix & Negotiation Protocol]
You MUST NEVER execute a trade directly without user approval.
Instead, you must analyze the market and issue a "Trade Proposal Ticket".

If the user asks for ANALYSIS or SENTIMENT (e.g. "How is SOL?"):
Provide a brief, cold market overview and Twitter/X social sentiment reading.
Append this JSON:
\`\`\`json
{
  "type": "ANALYSIS",
  "sentiment": "BULLISH"
}
\`\`\`

If the user asks to OPEN A TRADE or BUY/SHORT (e.g. "Long SOL" or "Buy WIF"):
Give a very brief reasoning, calculate an optimal setup, and issue a PROPOSAL.
Append exactly this JSON structure:
\`\`\`json
{
  "type": "PROPOSAL",
  "action": "LONG",
  "token": "SOL",
  "leverage": 5,
  "sizeUsd": 50,
  "tp": "+25%",
  "sl": "-10%"
}
\`\`\`
Rules for Proposal:
- Leverage MUST mathematically scale with volatility (usually 3x-10x max).
- Size should be a reasonable dollar amount (e.g. 50 or 100).
- NEVER output type "EXECUTE". Only "PROPOSAL" or "ANALYSIS".`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array." }, { status: 400 });
    }

    // Format messages for OpenAI SDK (xAI compatible)
    const formattedMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role === "agent" ? "assistant" : m.role,
        content: m.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: "grok-4-1-fast-reasoning",
      messages: formattedMessages,
      temperature: 0.2, // Low temperature for highly analytical responses
      stream: false, 
    });

    const aiMessage = response.choices[0].message;

    return NextResponse.json({ message: aiMessage });
  } catch (error: unknown) {
    console.error("LeverixPro xAI API Error:", error);
    return NextResponse.json(
      { error: "LeverixPro AI encounters a disruption. Re-initializing matrix..." },
      { status: 500 }
    );
  }
}
