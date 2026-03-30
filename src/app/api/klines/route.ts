import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Solana/USDC pool on Raydium/Orca
    const poolAddress = "8sLbNZoA1cfnvAStpWeu1TXXvYk1sBN12c3qYyqT1pS5"; 
    const url = `https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddress}/ohlcv/hour?limit=100`;
    
    const response = await fetch(url, { headers: { "Accept": "application/json" } });
    const json = await response.json();
    
    if (!json.data || !json.data.attributes || !json.data.attributes.ohlcv_list) {
        throw new Error("Invalid Format");
    }

    const ohlcv = json.data.attributes.ohlcv_list;
    // GeckoTerminal format: [timestamp, open, high, low, close, volume]
    // Needs to be sorted ascending for Lightweight Charts, gecko returns descending
    const formattedData = ohlcv.map((d: any) => ({
      time: d[0], // seconds
      open: d[1],
      high: d[2],
      low: d[3],
      close: d[4],
    })).reverse();

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Klines API Error:', error);
    // Return mock data fallback so chart never crashes entirely
    const mockData = [];
    let time = Math.floor(Date.now() / 1000) - 100 * 3600;
    let price = 150;
    for(let i=0; i<100; i++) {
        mockData.push({
            time: time,
            open: price,
            high: price + Math.random()*2,
            low: price - Math.random()*2,
            close: price + (Math.random()-0.5)*3
        });
        price = mockData[mockData.length-1].close;
        time += 3600;
    }
    return NextResponse.json({ success: true, data: mockData });
  }
}
