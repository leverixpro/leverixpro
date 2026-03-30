import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Connection, Keypair, SystemProgram, Transaction, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';


export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const connection = new Connection(
    process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com',
    'confirmed'
  );
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
    }

    // 1. Fetch Agent Keys from Supabase
    const { data: agentData, error: fetchError } = await supabase
      .from('agent_wallets')
      .select('agent_public_key, agent_private_key')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError || !agentData) {
      return NextResponse.json({ error: 'No Agent Wallet found for this user.' }, { status: 404 });
    }

    const agentKeypair = Keypair.fromSecretKey(bs58.decode(agentData.agent_private_key));
    const userPubkey = new PublicKey(walletAddress);

    // 2. Check Balance
    const balanceLamports = await connection.getBalance(agentKeypair.publicKey);
    
    // Reserve ~0.000005 SOL (5000 lamports) for network fee
    const feeBuffer = 5000;
    const withdrawAmount = balanceLamports - feeBuffer;

    if (withdrawAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Insufficient Agent Balance to withdraw.' }, { status: 400 });
    }

    // 3. Build Transfer Instruction
    const transferIx = SystemProgram.transfer({
      fromPubkey: agentKeypair.publicKey,
      toPubkey: userPubkey,
      lamports: withdrawAmount,
    });

    const transaction = new Transaction().add(transferIx);
    
    // 4. Send and Confirm
    const txId = await sendAndConfirmTransaction(connection, transaction, [agentKeypair], {
        commitment: 'processed'
    });

    return NextResponse.json({ 
      success: true, 
      txId,
      withdrawnLamports: withdrawAmount
    });

  } catch (error: any) {
    console.error('Withdraw API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
