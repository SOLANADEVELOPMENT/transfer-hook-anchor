import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransferHook } from "../target/types/transfer_hook";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  createTransferCheckedWithTransferHookInstruction,
} from "@solana/spl-token";

describe("transfer-hook", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TransferHook as Program<TransferHook>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  // Generate keypair to use as address for the transfer-hook enabled mint
  const mint = new Keypair();
  const decimals = 9;

  // Sender token account address
  const sourceTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Recipient token account address
  const recipient = Keypair.generate();
  const destinationTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    recipient.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // ExtraAccountMetaList address
  // Store extra accounts required by the custom transfer hook instruction
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), new PublicKey("MINT_ADDRESS").toBuffer()],
    new PublicKey("PROGRAM_ID")
  );

  // Account to store extra accounts required by the transfer hook instruction
  it("Create ExtraAccountMetaList Account", async () => {
    const initializeExtraAccountMetaListInstruction = await program.methods
      .initializeExtraAccountMetaList()
      .accounts({
        mint: new PublicKey("MINT_ADDRESS"),
        extraAccountMetaList: extraAccountMetaListPDA,
      })
      .instruction();

    const transaction = new Transaction().add(
      initializeExtraAccountMetaListInstruction
    );

    const txSig = await sendAndConfirmTransaction(
      provider.connection,
      transaction,
      [wallet.payer],
      { skipPreflight: true, commitment: "confirmed" }
    );
    console.log("Transaction Signature:", txSig);
  });

  // it("Transfer Hook with Extra Account Meta", async () => {
  //   // 1 tokens
  //   const amount = 1 * 10 ** decimals;
  //   const bigIntAmount = BigInt(amount);

  //   // Standard token transfer instruction
  //   const transferInstruction = await createTransferCheckedWithTransferHookInstruction(
  //     connection,
  //     sourceTokenAccount,
  //     mint.publicKey,
  //     destinationTokenAccount,
  //     wallet.publicKey,
  //     bigIntAmount,
  //     decimals,
  //     [],
  //     "confirmed",
  //     TOKEN_2022_PROGRAM_ID
  //   );

  //   const transaction = new Transaction().add(
  //     transferInstruction
  //   );

  //   const txSig = await sendAndConfirmTransaction(
  //     connection,
  //     transaction,
  //     [wallet.payer],
  //     { skipPreflight: true }
  //   );
  //   console.log("Transfer Signature:", txSig);
  // });
});
