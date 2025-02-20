import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createTransferInstruction } from '@solana/spl-token';
import * as solanaWeb3 from '@solana/web3.js';

document.addEventListener("DOMContentLoaded", () => {
    const connectWalletButton = document.getElementById('connectWalletButton');
    const walletInfoDiv = document.getElementById('walletInfo');
    const walletAddressElement = document.getElementById('walletAddress');
    const tokenBalanceElement = document.getElementById('tokenBalance');
    const transferForm = document.getElementById('transferForm');
    const transferTokenForm = document.getElementById('transferTokenForm');

    let connection;
    let walletAddress;
    let walletPublicKey;
    const mintAddress = new solanaWeb3.PublicKey('mntWh1FASwFZt7pqq1XvW8pyXph48WG3JLtTgkWFaYZ'); // Replace with correct mint address

    // Check if Phantom or Solflare Wallet is installed
    const isPhantomInstalled = window.solana && window.solana.isPhantom;
    const isSolflareInstalled = window.solflare && window.solflare.isSolflare;

    if (isPhantomInstalled || isSolflareInstalled) {
        console.log("✅ Phantom or Solflare Wallet is installed.");
    } else {
        alert("⚠ Please install Phantom or Solflare Wallet to continue.");
        return;
    }

    // Connect to Phantom/Solflare Wallet
    connectWalletButton.addEventListener('click', async () => {
        try {
            if (isPhantomInstalled) {
                await window.solana.connect();
                walletAddress = window.solana.publicKey.toString(); // Phantom
                walletPublicKey = window.solana.publicKey;
            } else if (isSolflareInstalled) {
                await window.solflare.connect();
                walletAddress = window.solflare.publicKey.toString(); // Solflare
                walletPublicKey = window.solflare.publicKey;
            }

            // Validate wallet address
            if (!walletAddress) {
                throw new Error("Wallet address not found. Ensure the wallet is connected.");
            }

            console.log("✅ Connected to wallet:", walletAddress);
            walletAddressElement.textContent = walletAddress;
            walletInfoDiv.style.display = 'block';
            transferForm.style.display = 'block';

            // Initialize Solana connection
            connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
            console.log("✅ Connected to Devnet");

            await getBalance(walletAddress, connection);
        } catch (err) {
            console.error('❌ Failed to connect to wallet:', err);
            alert("Error connecting to wallet: " + err.message);
        }
    });

    // Fetch token balance
    async function getBalance(walletAddress, connection) {
        try {
            const publicKey = new solanaWeb3.PublicKey(walletAddress);
            const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, { mint: mintAddress });

            if (tokenAccounts.value.length > 0) {
                const tokenBalance = await connection.getTokenAccountBalance(tokenAccounts.value[0].pubkey);
                tokenBalanceElement.textContent = tokenBalance.value.uiAmount || 0;
            } else {
                tokenBalanceElement.textContent = '0';
            }
        } catch (err) {
            console.error('❌ Error fetching balance:', err);
        }
    }

    // Handle token transfer
    transferTokenForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const recipientAddress = document.getElementById('recipientAddress').value;
        const amount = parseFloat(document.getElementById('amount').value); // Parse amount as a float

        try {
            const recipientPublicKey = new solanaWeb3.PublicKey(recipientAddress);

            // Get the associated token accounts for sender and recipient
            const fromTokenAccount = await getAssociatedTokenAddress(mintAddress, walletPublicKey);
            const toTokenAccount = await getAssociatedTokenAddress(mintAddress, recipientPublicKey);

            // Convert the amount to the smallest unit (lamports for tokens with 9 decimals)
            const amountInSmallestUnit = Math.round(amount * 1_000_000_000); // Multiply by 1 billion for 9 decimals

            // Create a transfer instruction for SPL tokens
            const transferInstruction = createTransferInstruction(
                fromTokenAccount, // Source token account
                toTokenAccount,   // Destination token account
                walletPublicKey,  // Owner of the source token account
                amountInSmallestUnit, // Amount in the smallest unit (e.g., lamports for 9 decimals)
                [], // No multisig signers
                TOKEN_PROGRAM_ID // SPL Token Program ID
            );

            // Create and sign the transaction
            const transaction = new solanaWeb3.Transaction().add(transferInstruction);

            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletPublicKey;

            // Sign the transaction
            let signedTransaction;
            if (isPhantomInstalled) {
                signedTransaction = await window.solana.signTransaction(transaction);
            } else if (isSolflareInstalled) {
                signedTransaction = await window.solflare.signTransaction(transaction);
            } else {
                throw new Error("No wallet provider found.");
            }

            // Send the transaction
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());

            console.log("✅ Transaction sent with signature:", signature);
            alert("Transaction sent successfully!");
        } catch (err) {
            console.error('❌ Error transferring tokens:', err);
            alert("Error transferring tokens: " + err.message);
        }
    });
});