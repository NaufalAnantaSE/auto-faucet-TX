const axios = require('axios');
const { ethers } = require('ethers');
const dotenv = require('dotenv');

dotenv.config();

const apiUrl = process.env.FAUCET_API_URL;
const walletAddresses = process.env.WALLET_ADDRESSES.split(',');
const alchemyUrl = process.env.ALCHEMY_API_URL;
const privateKey = process.env.PRIVATE_KEY;

const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const claimFaucet = async (walletAddress) => {
    try {
        // If the faucet requires a signed message, you can sign it here
        const message = ethers.utils.solidityKeccak256(['address'], [walletAddress]);
        const signature = await wallet.signMessage(ethers.utils.arrayify(message));

        // Log the request payload
        const payload = {
            walletAddress,
            signature,
        };
        console.log(`Sending request to ${apiUrl} with payload:`, payload);

        // Try with GET request
        const response = await axios.get(apiUrl, { params: payload });

        console.log(`Successfully claimed for ${walletAddress}:`, response.data);
    } catch (error) {
        if (error.response) {
            console.error(`Error claiming for ${walletAddress}:`, error.response.data);
        } else if (error.request) {
            console.error(`Error claiming for ${walletAddress}: No response received from server`, error.request);
        } else {
            console.error(`Error claiming for ${walletAddress}:`, error.message);
        }
    }
};

const main = async () => {
    for (const walletAddress of walletAddresses) {
        await claimFaucet(walletAddress);
    }
};

// Run the script immediately
main();
