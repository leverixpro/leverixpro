"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";

interface TradingChartProps {
  token?: string;
}

export function TradingChart({ token = "SOL" }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const symbolMap: Record<string, string> = {
    SOL: "BINANCE:SOLUSDT",
    BTC: "BINANCE:BTCUSDT",
    ETH: "BINANCE:ETHUSDT",
    WIF: "BINANCE:WIFUSDT",
    JUP: "BINANCE:JUPUSDT",
    BONK: "BINANCE:BONKUSDT",
  };

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = ""; // Clear existing chart content

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window !== "undefined" && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: symbolMap[token] || `BINANCE:${token}USDT`,
          interval: "60", // 1H default, users can freely change via UI
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: "rgba(0, 0, 0, 0)",
          gridColor: "rgba(255, 255, 255, 0.05)",
          save_image: false,
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          container_id: containerRef.current?.id,
        });
      }
    };
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [token]);

  return (
    <div className="w-full h-full relative group bg-[#0a0a0a] rounded-xl overflow-hidden shadow-inner">
      <div id={`tv_chart_${token}`} ref={containerRef} className="w-full h-full min-h-[500px]" />
    </div>
  );
}
