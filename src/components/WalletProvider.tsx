"use client";

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export const AppWalletProvider = ({ children }: { children: React.ReactNode }) => {
    // Set network to mainnet-beta for actual trading, or devnet for testing
    const network = 'mainnet-beta'; // We'll use mainnet because the user wants "REAL product use"

    // Consume the Helius RPC URL from the environment, otherwise fallback to public rate-limited endpoints.
    const endpoint = useMemo(() => process.env.NEXT_PUBLIC_HELIUS_RPC_URL || clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
