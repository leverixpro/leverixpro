import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const symbols = '["BTCUSDT","ETHUSDT","SOLUSDT","BNBUSDT","XRPUSDT"]';
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`;
    
    // Add User-Agent & fetch cached for 30s
    const response = await fetch(url, { 
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 30 }
    });
    
    if (!response.ok) throw new Error("Binance API error");
    
    const json = await response.json();
    if (!Array.isArray(json)) throw new Error("Invalid Binance response");

    const tokens: Record<string, string> = {
      'BTCUSDT': 'btc',
      'ETHUSDT': 'eth',
      'SOLUSDT': 'sol',
      'BNBUSDT': 'bnb',
      'XRPUSDT': 'xrp'
    };

    const results = json.map((token: any) => {
        const symbol = tokens[token.symbol];
        return {
            id: symbol.toUpperCase(),
            img: `https://assets.coincap.io/assets/icons/${symbol}@2x.png`,
            price: parseFloat(token.lastPrice || "0"),
            change: parseFloat(token.priceChangePercent || "0")
        };
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Market API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch global top 5' }, { status: 500 });
  }
}
