# LeverixPro — OpenClaw Trading Skill

> The core intelligence framework powering the LeverixPro AI Agent.

## Overview

**OpenClaw** is LeverixPro's proprietary semantic trading framework. It enables the AI agent (powered by xAI / Grok-4) to transform natural language inputs into precise, high-winrate perpetual futures setups on Solana — while the **Aegis Defense Matrix** enforces strict capital protection at every step.

---

## 1. High-Winrate Strategy Mechanics (>83.4%)

Every parameter must pass through the following strict evaluation stages before execution:

### Whale Cluster Tracking
The agent continuously monitors large-cap transactions (>$50,000) from known *Smart Money* and institutional wallet clusters across the Solana network. Entry is only triggered when confirmed whale accumulation exceeds a 3-sigma threshold.

### Liquidity Pool Depth Check
Potential slippage is calculated against Jupiter Aggregator liquidity pools. If projected slippage exceeds:
- **1.5%** for mid-cap tokens
- **5.0%** for meme/micro-cap tokens

...the entry is temporarily aborted to preserve capital.

### 15-Minute Precision Matrix
All entry and exit levels are derived strictly from the **15-minute (15m) timeframe** to ensure tight entry prices that are never too far from the current market.

### Mean-Reversion Anti-FOMO Logic
The agent is hardcoded to **never buy the top**. Limit entries are always positioned at the strongest support level calculated over the preceding 1H or 4H timeframes — not at market price.

---

## 2. Natural Language Parsing

When a user submits a prompt in the Chat Terminal, for example:

> *"Long WIF with 5x leverage"*

The OpenClaw framework dissects the sentence into an execution matrix:

| Field | Extracted Value |
|---|---|
| `ACTION` | LONG |
| `TOKEN` | WIF |
| `LEVERAGE` | 5x |
| `ENTRY` | Auto — nearest 15m support |
| `RISK_MGT` | Auto trailing SL at -3.0% |

The result is a **Trade Proposal Ticket** presented to the user for review and approval before anything is executed on-chain.

---

## 3. Scale-Out Profit Ladder

OpenClaw uses a dynamic profit-harvesting algorithm to lock in gains progressively:

| Trigger | Action |
|---|---|
| ROI reaches **+25%** | Sell 50% of position |
| ROI reaches **+50%** | Sell 25% of position |
| Remaining 25% (Moonbag) | Trailing stop widened to -10% |

---

## 4. Aegis Defense Matrix — Rejection Parameters

The agent automatically declines or aborts any operation if:

- Base liquidity of target token is **below $100,000** *(rugpull / honeypot filter)*
- Mint Authority is **still active** on an untested token contract
- DEX price spread is **excessively wide** (>2–3%)
- Trade would push margin utilization **above 80%** of vault balance
- Number of concurrent open positions would **exceed 3**
- Current ATR volatility is **above 2.5×** the standard threshold

---

## 5. Execution Flow

```
User Prompt (Chat Terminal)
        │
        ▼
   OpenClaw NLP Parse
   (xAI / Grok-4-1-Fast-Reasoning)
        │
        ▼
   Aegis Pre-Flight Checks
   · Margin cap < 80%
   · Liquidity depth OK
   · ATR within safe range
   · Concurrent positions < 3
        │
        ▼
   Trade Proposal Ticket ──► User Review & Approval
        │
        ▼
   Jupiter v6 Perps Execution
        │
        ▼
   Solana On-Chain Transaction
```

---

*Part of the [LeverixPro](https://leverixpro.com) open-source AI trading terminal.*
*Website: [leverixpro.com](https://leverixpro.com) · X: [@leverixpro](https://x.com/leverixpro)*
