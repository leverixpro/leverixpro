'use client';

import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function VaultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("=== VAULT PAGE FATAL CRASH ===");
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-mono">
      <div className="bg-black border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)] p-8 max-w-3xl w-full rounded-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-full">
            <ShieldAlert className="text-red-500" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">System Exception Detected</h2>
            <p className="text-red-400/80 text-sm">The Vault interface encountered a critical client-side error.</p>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-md p-5 mb-6 overflow-x-auto">
          <div className="text-xs text-gray-500 mb-2 font-bold tracking-widest uppercase">Error Message</div>
          <div className="text-sm text-red-400 font-bold mb-4">{error.message || "Unknown Error"}</div>
          
          <div className="text-xs text-gray-500 mb-2 font-bold tracking-widest uppercase mt-4">Stack Trace</div>
          <pre className="text-[10px] text-gray-400 whitespace-pre-wrap break-words">
            {error.stack || "No stack trace available"}
          </pre>
          
          {error.digest && (
            <div className="mt-4 text-xs text-gray-600">
              Digest: {error.digest}
            </div>
          )}
        </div>

        <button
          onClick={() => reset()}
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-3 px-6 rounded transition-all uppercase tracking-widest text-sm"
        >
          Reboot Interface
        </button>
      </div>
    </div>
  );
}
