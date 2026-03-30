import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
    }

    // 1. Check if user already has an agent wallet
    const { data: existingWallet, error: fetchError } = await supabase
      .from('agent_wallets')
      .select('agent_public_key')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (existingWallet) {
      return NextResponse.json({ 
        success: true, 
        agentPublicKey: existingWallet.agent_public_key,
        isNew: false
      });
    }

    // 2. Generate a new Solana Keypair
    const newAgent = Keypair.generate();
    const agentPublicKeyStr = newAgent.publicKey.toBase58();
    const agentPrivateKeyStr = bs58.encode(newAgent.secretKey);

    // 3. Auto-create basic profile if needed (FK constraint)
    await supabase.from('profiles').upsert({
      wallet_address: walletAddress,
      username: `user_${walletAddress.slice(0, 5)}`
    }, { onConflict: 'wallet_address' });

    // 4. Save agent wallet
    const { error: insertError } = await supabase
      .from('agent_wallets')
      .insert({
        wallet_address: walletAddress,
        agent_public_key: agentPublicKeyStr,
        agent_private_key: agentPrivateKeyStr
      });

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      agentPublicKey: agentPublicKeyStr,
      isNew: true
    });

  } catch (error: any) {
    console.error('Agent Wallet Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
