const ethers = require('ethers');
const fs = require('fs');

// Load recipients from the JSON file
const recipients = JSON.parse(fs.readFileSync('recipients.json')).recipients;

// Configuration object
const config = {
    rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/9J4cs6b4S3P7quW5ARc7A6SubXCzA_Gt',
    senderPrivateKey: 'your priv key',
    amountInEth: '0.003',
    gasLimit: 21000
};

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(config.senderPrivateKey, provider);

// Function to get current gas price
const getGasPrice = async () => {
    try {
        return await provider.getGasPrice();
    } catch (error) {
        console.error('Error fetching gas price:', error);
        throw error;
    }
};

// Function to create a transaction object
const createTransaction = async (to, amount) => {
    try {
        const gasPrice = await getGasPrice();
        const chainId = (await provider.getNetwork()).chainId;

        return {
            to,
            value: ethers.utils.parseEther(amount),
            gasLimit: config.gasLimit,
            gasPrice,
            chainId
        };
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

// Function to send a single transaction
const sendTransaction = async (tx) => {
    try {
        const transaction = await wallet.sendTransaction(tx);
        await transaction.wait();
        return transaction.hash;
    } catch (error) {
        console.error(`Error sending transaction to ${tx.to}:`, error);
        throw error;
    }
};

// Main function to send ETH to all recipients
const main = async () => {
    for (const recipient of recipients) {
        try {
            const tx = await createTransaction(recipient, config.amountInEth);
            const txHash = await sendTransaction(tx);
            console.log(`Transaction sent to ${recipient}, tx hash: ${txHash}`);
        } catch (error) {
            console.error(`Failed to send transaction to ${recipient}:`, error);
        }
    }
};

main().catch((error) => {
    console.error('Error in main function:', error);
});
