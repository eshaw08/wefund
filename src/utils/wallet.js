import { ethers } from 'ethers';

// Function to connect to MetaMask and switch to Ganache network
export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Check the current network
      const network = await provider.getNetwork();
      if (network.chainId !== 1337) {
        // Prompt the user to switch to Ganache
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // Ganache chain ID in hex (1337)
          });
        } catch (error) {
          console.error("Failed to switch to Ganache network:", error);
          alert("Please switch to the Ganache network manually in MetaMask.");
          return null;
        }
      }

      return { account: accounts[0], provider, signer };
    } catch (error) {
      console.error("User denied account access or error occurred", error);
      return null;
    }
  } else {
    // MetaMask not detected
    alert("MetaMask is not installed. Please install it to continue.");
    window.open("https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn", "_blank");
    return null;
  }
};

// Function to get the wallet balance in ETH
export const getWalletBalance = async (account) => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(account);
    return ethers.utils.formatEther(balance); // Convert balance to ETH
  } else {
    console.error("MetaMask not detected");
    return null;
  }
};

// Function to convert INR to ETH using an API
export const convertINRtoETH = async (inrAmount) => {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr`);
    const data = await response.json();
    const inrToETH = 1 / data.ethereum.inr; // Get the current INR to ETH rate
    return (inrAmount * inrToETH).toFixed(6); // Convert INR to ETH with 6 decimal places
  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    return null;
  }
};

// Function to convert ETH to INR using an API
export const convertETHtoINR = async (ethAmount) => {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr`);
    const data = await response.json();
    const ethToINR = data.ethereum.inr; // Get the current ETH to INR rate
    return (ethAmount * ethToINR).toFixed(2); // Convert ETH to INR with 2 decimal places
  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    return null;
  }
};

// Function to send a transaction
export const sendTransaction = async (fromAddress, toAddress, amount) => {
  if (window.ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.utils.parseEther(amount), // Convert amount to wei
      });

      await tx.wait(); // Wait for the transaction to be mined
      return tx.hash; // Return transaction hash
    } catch (error) {
      console.error("Error sending transaction:", error);
      return null;
    }
  } else {
    console.error("MetaMask not detected");
    return null;
  }
};