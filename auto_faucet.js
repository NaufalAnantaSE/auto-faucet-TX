const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// Koneksi ke node BaseSepolia
const provider = new ethers.providers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/9J4cs6b4S3P7quW5ARc7A6SubXCzA_Gt');

// Alamat kontrak faucet di BaseSepolia
const faucetContractAddress = '0x22F2D35C812Ad4Fe5B8AA3658a5E3Fc1c3D7bA27';

// ABI dari kontrak faucet
const faucetAbi = [
  {
    "constant": false,
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Membuat instance kontrak
const faucetContract = new ethers.Contract(faucetContractAddress, faucetAbi, provider);

// Membaca file sender.json
const wallets = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'senders.json'), 'utf8'));

// Fungsi untuk mengklaim faucet
async function claimFaucet(wallet) {
  try {
    const walletInstance = new ethers.Wallet(wallet.privateKey, provider);
    const faucetWithSigner = faucetContract.connect(walletInstance);

    const gasLimit = ethers.BigNumber.from(88067);  // Menyesuaikan dengan contoh transaksi
    const maxFeePerGas = ethers.utils.parseUnits('0.001067868', 'gwei');  // Max fee per gas (in gwei) dari contoh kedua
    const maxPriorityFeePerGas = ethers.utils.parseUnits('0.001067087', 'gwei');  // Max priority fee per gas (in gwei)

    const balance = await provider.getBalance(wallet.address);

    const txCost = gasLimit.mul(maxFeePerGas);

    if (balance.lt(txCost)) {
      throw new Error(`Insufficient funds: balance ${ethers.utils.formatEther(balance)}, tx cost ${ethers.utils.formatEther(txCost)}`);
    }

    console.log(`Claiming faucet for wallet: ${wallet.address}`);
    console.log(`Gas Limit: ${gasLimit}`);
    console.log(`Max Fee Per Gas: ${maxFeePerGas}`);
    console.log(`Max Priority Fee Per Gas: ${maxPriorityFeePerGas}`);
    console.log(`Balance: ${ethers.utils.formatEther(balance)}`);

    const tx = await faucetWithSigner.claim({
      gasLimit: gasLimit,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas
    });

    console.log(`Transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();
    if (receipt.status === 0) {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }
    return receipt;

  } catch (error) {
    console.error(`Error in claimFaucet function: ${error}`);
    throw error;
  }
}

// Main loop untuk mengklaim faucet secara berkala
(async () => {
  while (true) {
    for (const wallet of wallets) {
      try {
        const result = await claimFaucet(wallet);
        console.log(`Faucet claimed for ${wallet.address}: ${JSON.stringify(result)}`);
      } catch (error) {
        console.error(`Error claiming faucet for ${wallet.address}: ${error}`);
      }
      await new Promise(resolve => setTimeout(resolve, 10000)); // Tunggu beberapa detik sebelum mengklaim untuk wallet berikutnya
    }
    await new Promise(resolve => setTimeout(resolve, 3600000)); // Tunggu 1 jam sebelum memulai siklus lagi
  }
})();
