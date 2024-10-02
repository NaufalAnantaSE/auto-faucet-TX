const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/9J4cs6b4S3P7quW5ARc7A6SubXCzA_Gt');

const privateKey = 'e0f8c3d18031ec7f6fac459b222650d7d6715c86e031df4caa2f3014a1b26183';
const wallet = new ethers.Wallet(privateKey, provider);

// Definisikan ABI dan alamat kontrak
const abi = [
  "constructor(address _logic, address admin_, bytes _data)",
  "event AdminChanged(address previousAdmin, address newAdmin)",
  "event BeaconUpgraded(address indexed beacon)",
  "event Upgraded(address indexed implementation)",
  "receive() external payable"
];
const contractAddress = '0x22F2D35C812Ad4Fe5B8AA3658a5E3Fc1c3D7bA27';

// Buat instance kontrak
const contract = new ethers.Contract(contractAddress, abi, wallet);

async function sendEthToContract() {
  try {
    // Tetapkan batas gas manual
    const gasLimit = ethers.utils.hexlify(80000); // Sesuaikan sesuai kebutuhan

    // Definisikan parameter transaksi
    const txParams = {
      to: contractAddress,
      value: ethers.utils.parseEther('0.01'), // Kirim 0.01 ETH
      gasLimit: gasLimit,
      maxPriorityFeePerGas: ethers.utils.parseUnits('2.5', 'gwei'), // Sesuaikan sesuai kebutuhan
      maxFeePerGas: ethers.utils.parseUnits('50', 'gwei') // Sesuaikan sesuai kebutuhan
    };

    console.log('Mengirim transaksi dengan parameter:', txParams);

    // Kirim transaksi
    const tx = await wallet.sendTransaction(txParams);
    console.log('Transaksi dikirim:', tx.hash);

    // Tunggu transaksi dikonfirmasi
    const receipt = await tx.wait();
    console.log('Transaksi dikonfirmasi:', receipt);
  } catch (error) {
    console.error('Terjadi kesalahan dalam fungsi sendEthToContract:', error);

    // Logging detail
    if (error.transaction) {
      console.error('Transaksi:', error.transaction);
    }
    if (error.receipt) {
      console.error('Tanda terima:', error.receipt);
    }
  }
}

// Panggil fungsi
sendEthToContract();
