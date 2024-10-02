const { ethers } = require('ethers');
const fs = require('fs');

// Load senders data from sender.json
const senderData = fs.readFileSync('senders.json');
const senders = JSON.parse(senderData);

// Alamat penerima
const recipientAddress = '0xD29a9A4Ae1Cf6749fafdb452F103c02aD5BC66d2';

// Alamat kontrak token USDC
const usdcContractAddress = '0x22F2D35C812Ad4Fe5B8AA3658a5E3Fc1c3D7bA27';

// ABI kontrak ERC-20
const erc20Abi = [
    'function transfer(address to, uint amount) public returns (bool)',
];

// Buat instance provider ke jaringan Ethereum menggunakan URL RPC dari Alchemy
const provider = new ethers.providers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/-OQQR4pgjMqwMOkfAYvayHGDsRxMgDCo');

async function sendToken(senders, recipient, tokenContractAddress) {
    for (const sender of senders) {
        if (sender.privateKey && sender.address) {
            try {
                // Buat instance wallet untuk setiap pengirim
                const wallet = new ethers.Wallet(sender.privateKey, provider);

                // Buat instance kontrak token USDC
                const tokenContract = new ethers.Contract(tokenContractAddress, erc20Abi, wallet);

                // Tentukan jumlah token yang akan dikirim (misalnya 500 USDC)
                const amountInTokens = ethers.utils.parseUnits('500.0', 6); // USDC memiliki 6 desimal

                // Kirim transaksi token
                const txResponse = await tokenContract.transfer(recipient, amountInTokens);
                console.log(`Transaksi dari ${sender.address} berhasil dikirim: ${txResponse.hash}`);

                // Tunggu sampai transaksi masuk ke dalam blok
                await txResponse.wait();
                console.log(`Transaksi dari ${sender.address} telah dikonfirmasi dalam blok.`);
            } catch (error) {
                console.error(`Transaksi dari ${sender.address} gagal:`, error);
            }
        }
    }
}

sendToken(senders, recipientAddress, usdcContractAddress);
