import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ethers } from "ethers";
import { useCampaign } from "../../context/CampaignContext";
import "./DonatePage.css";
import logo from "../../assets/logo.png";

const DonatePage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { campaign: locationCampaign } = location.state || {};
  
  const { updateCampaignProgress, campaigns } = useCampaign();
  
  const [campaign, setCampaign] = useState(locationCampaign || null);
  const [donationAmount, setDonationAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [ethToINR, setEthToINR] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState("");

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaign) {
        const contextCampaign = campaigns.find(c => c.id === campaignId);
        
        if (contextCampaign) {
          setCampaign(contextCampaign);
          return;
        }
        
        try {
          setTransactionStatus("Loading campaign data...");
          const campaignRef = doc(db, "campaigns", campaignId);
          const campaignSnap = await getDoc(campaignRef);
          if (campaignSnap.exists()) {
            setCampaign({ ...campaignSnap.data(), id: campaignId });
            setTransactionStatus("");
          } else {
            setError("Campaign not found.");
          }
        } catch (err) {
          console.error("Error fetching campaign:", err);
          setError("Failed to load campaign details.");
        }
      }
    };
    
    fetchCampaign();
  }, [campaignId, campaign, campaigns]);

  useEffect(() => {
    const fetchEthToINR = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
        );
        const data = await response.json();
        setEthToINR(data.ethereum.inr);
      } catch (error) {
        console.error("Error fetching ETH to INR rate:", error);
        setEthToINR(250000); // Fallback value if API fails
      }
    };
    fetchEthToINR();
  }, []);

  const handleConnectWallet = async () => {
    try {
      setTransactionStatus("Connecting to wallet...");
      if (!window.ethereum) {
        alert("MetaMask not detected. Please install MetaMask.");
        setTransactionStatus("");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userWallet = await signer.getAddress();
      setWalletAddress(userWallet);
      setWalletConnected(true);
      setTransactionStatus(`Connected: ${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`);
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setTransactionStatus("");
      }, 3000);
    } catch (error) {
      setError("Failed to connect wallet. Please try again.");
      setTransactionStatus("");
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDonate = async () => {
    if (!walletConnected) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!campaign?.walletAddress) {
      setError("Campaign wallet address is missing.");
      return;
    }
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError("Please enter a valid donation amount.");
      return;
    }

    setLoading(true);
    setError(""); // Clear any previous errors

    try {
      // Step 1: Prepare for ETH transaction
      setTransactionStatus("Preparing transaction...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const ethAmount = (parseFloat(donationAmount) / ethToINR).toFixed(6);
      
      // Step 2: Request transaction approval from wallet
      setTransactionStatus("Waiting for wallet confirmation...");
      console.log(`Sending ${ethAmount} ETH to ${campaign.walletAddress}`);
      
      const tx = await signer.sendTransaction({
        to: campaign.walletAddress,
        value: ethers.parseEther(ethAmount.toString()),
      });
      
      console.log("Transaction sent:", tx.hash);
      setTransactionStatus("Transaction submitted, waiting for confirmation...");
      
      // Step 3: Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      setTransactionStatus("Transaction confirmed! Updating records...");

      // Step 4: Update Firestore with new donation data
      try {
        const donationAmount_float = parseFloat(donationAmount);
        const campaignRef = doc(db, "campaigns", campaign.id);
        
        // Use raisedAmount for consistency with context
        const currentAmount = campaign.raisedAmount || campaign.amountRaised || 0;
        const newAmount = currentAmount + donationAmount_float;
        
        const donorInfo = { 
          name: donorName || walletAddress, 
          amount: donationAmount_float,
          timestamp: new Date().toISOString(),
          txHash: tx.hash
        };
        
        if (isNaN(donationAmount_float)) {
          throw new Error("Invalid donation amount");
        }

        // Add donation to donations collection
        await addDoc(collection(db, "donations"), {
          campaignId: campaign.id,
          name: donorName || walletAddress,
          amount: donationAmount_float,
          timestamp: new Date(),
          txHash: tx.hash,
          type: "online"
        });

        // Update the campaign data through context to ensure consistent updates
        const success = await updateCampaignProgress(campaign.id, donationAmount_float, donorName || walletAddress);
        
        if (!success) {
          throw new Error("Failed to update campaign progress");
        }
        
        console.log("Firestore updated successfully");
        setTransactionStatus("Success! Redirecting to thank you page...");
        
        // Get the updated campaign data from context
        const updatedCampaign = campaigns.find(c => c.id === campaign.id);
        
        // Navigate to thank you page with updated campaign data
        setTimeout(() => {
          navigate("/thank-you", { 
            state: { 
              campaign: updatedCampaign || {
                ...campaign,
                raisedAmount: newAmount,
                amountRaised: newAmount,
                donationsCount: (campaign.donationsCount || 0) + 1,
                progressPercentage: Math.min(100, Math.round((newAmount / campaign.goalAmount) * 100))
              },
              donationAmount: donationAmount_float,
              donorName: donorName || walletAddress,
              txHash: tx.hash
            } 
          });
        }, 2000);
      } catch (firestoreError) {
        console.error("Error updating Firestore:", firestoreError);
        setTransactionStatus("Transaction successful! Redirecting...");
        
        // Even if Firestore update fails, we should still show thank you page
        setTimeout(() => {
          navigate("/thank-you", { 
            state: { 
              campaign,
              donationAmount: parseFloat(donationAmount),
              donorName: donorName || walletAddress,
              txHash: tx.hash,
              dbUpdateFailed: true
            } 
          });
        }, 2000);
      }
    } catch (txError) {
      console.error("Transaction error:", txError);
      if (txError.code === "ACTION_REJECTED") {
        setError("Transaction was rejected. Please try again.");
      } else {
        setError("Transaction failed. Please try again.");
      }
      setTransactionStatus("");
      setLoading(false);
    }
  };

  // Calculate progress percentage safely
  const calculateProgressPercentage = () => {
    if (!campaign || !campaign.goalAmount || campaign.goalAmount <= 0) return 0;
    // Use both field names for compatibility
    const raised = campaign.raisedAmount || campaign.amountRaised || 0;
    return Math.min(raised / campaign.goalAmount * 100, 100);
  };

  if (!campaign) {
    return (
      <div className="donate-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading campaign data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="donate-page">
      <div className="donate-container">
        {/* Logo and "wefund" text side by side */}
        <div className="donate-header">
          <img src={logo} alt="WeFund Logo" className="donate-logo" />
          <span className="donate-logo-text">wefund</span>
        </div>

        <div className="campaign-info">
          <img
            src={campaign.coverPhoto || "/placeholder.jpg"}
            alt={campaign.title || "Campaign"}
            className="campaign-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.jpg";
            }}
          />
          <h2 className="campaign-title">{campaign.title || "Campaign"}</h2>

          {/* Progress Bar below the campaign title */}
          <div className="progress-bar">
            <div
              className="progress"
              style={{
                width: `${calculateProgressPercentage()}%`,
              }}
            ></div>
          </div>
          
          <div className="progress-text">
            <span>₹{((campaign.raisedAmount || campaign.amountRaised || 0)).toLocaleString()}</span>
            <span>of ₹{(campaign.goalAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="donation-amount">
          <label htmlFor="donationAmount">Enter your donation (INR):</label>
          <input
            type="number"
            id="donationAmount"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="0.00"
            min="1"
            step="0.01"
          />
        </div>

        <div className="quick-amounts">
          {[100, 500, 1000, 2000, 5000].map((amount) => (
            <button
              key={amount}
              onClick={() => setDonationAmount(amount.toString())}
              className={`amount-button ${parseInt(donationAmount) === amount ? 'active' : ''}`}
            >
              ₹{amount}
            </button>
          ))}
        </div>

        <div className="donor-name">
          <label htmlFor="donorName">Your Name (Optional):</label>
          <input
            type="text"
            id="donorName"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {campaign.walletAddress && (
          <div className="wallet-address">
            <p>Campaign wallet: {campaign.walletAddress.slice(0, 8)}...{campaign.walletAddress.slice(-6)}</p>
          </div>
        )}

        {transactionStatus && (
          <div className="status-message">
            <div className="status-spinner"></div>
            <span>{transactionStatus}</span>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="donation-summary">
          <h3>Your Donation: ₹{donationAmount || "0.00"}</h3>
          {!walletConnected ? (
            <button onClick={handleConnectWallet} className="donate-button">
              Connect Wallet
            </button>
          ) : (
            <button onClick={handleDonate} className="donate-button" disabled={loading}>
              {loading ? "Processing..." : "Donate Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonatePage;