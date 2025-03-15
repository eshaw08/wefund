import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "../../../firebase";
import { ethers } from "ethers";
import { Share, Settings, Wallet, CreditCard, Plus, Edit, Copy, X } from "lucide-react";
import FundraiserPreview from "../../FundraiserPreview/FundraiserPreview";
import Navbar from "../../Navbar/Navbar";
import "./ManagePage.css";
import { AuthContext } from "../../../context/AuthContext";
import { useCampaign } from "../../../context/CampaignContext";
import Web3 from "web3";

// Import icons for tabs
import dashIcon from "../../../assets/dash.png";
import donateIcon from "../../../assets/donate.png";
import transIcon from "../../../assets/trans.png";
import updateIcon from "../../../assets/update.png";
import msgIcon from "../../../assets/msg.png";

const ManagePage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the campaign context at the component level
  const { campaigns, updateCampaignProgress, getCampaignById } = useCampaign();

  // Use the activeTab state passed from LaunchPage.jsx
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "dashboard");
  const [showOfflineDonation, setShowOfflineDonation] = useState(false);
  const [offlineDonation, setOfflineDonation] = useState({ name: "", amount: "" });
  const [receiveMethod, setReceiveMethod] = useState("");
  const [googlePayId, setGooglePayId] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [donors, setDonors] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showCopyLinkPopup, setShowCopyLinkPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [walletAddress, setWalletAddress] = useState("Not Connected");
  const [walletBalance, setWalletBalance] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Create real-time listener for campaign data
    const campaignRef = doc(db, "campaigns", campaignId);
    const unsubscribeCampaign = onSnapshot(campaignRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCampaignData(data);
        setEditData(data);
        setIsLoading(false);
      } else {
        navigate("/");
      }
    }, (error) => {
      console.error("Error listening to campaign data:", error);
      setIsLoading(false);
    });

    // Create real-time listener for donations
    const donationsQuery = query(
      collection(db, "donations"),
      where("campaignId", "==", campaignId)
    );
    
    const unsubscribeDonations = onSnapshot(donationsQuery, (snapshot) => {
      const donorsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort donors by timestamp in descending order (most recent first)
      donorsList.sort((a, b) => {
        const timestampA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const timestampB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return timestampB - timestampA;
      });
      
      setDonors(donorsList);
    }, (error) => {
      console.error("Error listening to donations:", error);
    });

    // Clean up listeners when component unmounts
    return () => {
      unsubscribeCampaign();
      unsubscribeDonations();
    };
  }, [campaignId, navigate]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateDoc(doc(db, "campaigns", campaignId), editData);
      setShowEditModal(false);
      // No need to manually update campaignData as the onSnapshot listener will handle it
    } catch (error) {
      console.error("Error updating campaign data:", error);
    }
  };

  const handleOfflineDonationSubmit = async () => {
    if (!offlineDonation.name || !offlineDonation.amount || isNaN(offlineDonation.amount) || Number(offlineDonation.amount) <= 0) {
      alert("Please enter a valid name and amount");
      return;
    }

    try {
      const donationAmount = Number(offlineDonation.amount);
      
      // First update campaign progress through context
      const success = await updateCampaignProgress(
        campaignId, 
        donationAmount,
        offlineDonation.name
      );

      if (success) {
        // Then add to donations collection
        const donationRef = collection(db, "donations");
        await addDoc(donationRef, {
          campaignId,
          name: offlineDonation.name,
          amount: donationAmount,
          type: "offline",
          timestamp: new Date(),
        });

        // Reset form and show success message
        setShowOfflineDonation(false);
        setOfflineDonation({ name: "", amount: "" });
        alert(`Donation of ₹${donationAmount.toLocaleString()} added successfully!`);

        // Update local campaign data from context
        const updatedCampaign = getCampaignById(campaignId);
        if (updatedCampaign) {
          setCampaignData(updatedCampaign);
        }
      } else {
        alert("Failed to update campaign progress. Please try again.");
      }
    } catch (error) {
      console.error("Error adding offline donation:", error);
      alert("Failed to add donation. Please try again.");
    }
  };

  const handleShare = async () => {
    const campaignLink = `${window.location.origin}/campaign/${campaignId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: campaignData?.title,
          text: "Check out my fundraising campaign!",
          url: campaignLink,
        });
      } else {
        setShowSharePopup(true);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const copyLink = () => {
    const campaignLink = `${window.location.origin}/campaign/${campaignId}`;
    navigator.clipboard.writeText(campaignLink);
    setShowCopyLinkPopup(false);
    alert("Link copied to clipboard!");
  };

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum); // Correct provider syntax
      await provider.send("eth_requestAccounts", []); // Request accounts
  
      const signer = await provider.getSigner();
      const userWallet = await signer.getAddress();
      setWalletAddress(userWallet);
  
      // Save wallet address to Firebase
      const campaignRef = doc(db, "campaigns", campaignId);
      await updateDoc(campaignRef, { walletAddress: userWallet });
  
      alert(`Wallet Connected: ${userWallet}`);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };
  
  const checkBalance = async () => {
    if (walletAddress !== "Not Connected") {
      try {
        const web3 = new Web3(window.ethereum);
        const balance = await web3.eth.getBalance(walletAddress);
        setWalletBalance(web3.utils.fromWei(balance, "ether") + " ETH");
      } catch (error) {
        alert("Failed to fetch balance. Try again.");
        console.error("Balance fetch error:", error);
      }
    } else {
      alert("Please connect your wallet first.");
    }
  };

  // Calculate progress percentage with safety checks
  const calculateProgress = () => {
    // Get the most up-to-date campaign data
    const contextCampaign = getCampaignById(campaignId);
    const currentData = contextCampaign || campaignData;

    if (!currentData?.goalAmount || currentData.goalAmount <= 0) return 0;
    // Use progressPercentage from context if available, otherwise calculate
    if (currentData.progressPercentage !== undefined) {
      return currentData.progressPercentage;
    }
    // Fallback to manual calculation
    const raised = parseFloat(currentData?.raisedAmount || currentData?.amountRaised || 0);
    const goal = parseFloat(currentData?.goalAmount || 1);
    const percentage = (raised / goal) * 100;
    // Ensure the percentage is a valid number and clamp between 0-100%
    return isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));
  };

  // Get the most up-to-date campaign information
  const getCurrentCampaign = () => {
    // First try to get from context (most up-to-date)
    const contextCampaign = getCampaignById(campaignId);
    return contextCampaign || campaignData;
  };

  const currentCampaign = getCurrentCampaign();

  const renderDashboard = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="user-greeting">
          <h2>Hi, {user?.displayName || "User"}</h2>
          <p>Your effort's paying off</p>
        </div>
        <div className="action-buttons">
          <button className="view-btn" onClick={() => setShowPreview(true)}>
            View
          </button>
          <button className="share-btn" onClick={handleShare}>
            Share
          </button>
        </div>
      </div>
  
      <h1 className="campaign-title">{currentCampaign?.title}</h1>
      <div className="goal-amount">
        Goal Amount: ₹{currentCampaign?.goalAmount?.toLocaleString() || "0"}
      </div>
  
      {/* Progress Bar with live updates */}
      <div className="progress-bar-container">
        <div className="progress-amounts">
          <span>₹{currentCampaign?.amountRaised?.toLocaleString() || "0"}</span>
          <span>₹{currentCampaign?.goalAmount?.toLocaleString() || "0"}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress"
            style={{
              width: `${calculateProgress()}%`,
              transition: "width 0.5s ease-in-out"
            }}
          ></div>
        </div>
      </div>
      
      <div className="raised-summary">
        <p>
          Total Donations: {currentCampaign?.donationsCount || donors.length || 0}
        </p>
      </div>
  
      <div className="dashboard-actions">
        <button className="edit-btn" onClick={handleEdit}>
          <Edit size={16} />
          <span className="underline">Edit</span>
        </button>
        <button className="copy-link-btn" onClick={() => setShowCopyLinkPopup(true)}>
          <Copy size={16} />
          <span className="underline">Copy unique link</span>
        </button>
      </div>
  
      <div className="setup-transfer" onClick={() => setActiveTab("transfer")}>
        <span className="underline">Set up transfers</span>
      </div>
    </div>
  );
  
  const renderDonation = () => (
    <div className="donation-container">
      <div className="raised-amount-card">
        <div className="raised-info">
          <p>You have raised ₹{currentCampaign?.amountRaised?.toLocaleString() || "0"} of your ₹{currentCampaign?.goalAmount?.toLocaleString() || "0"} goal</p>
          <div className="progress-bar" style={{ margin: "10px 0" }}>
            <div
              className="progress"
              style={{
                width: `${calculateProgress()}%`,
                transition: "width 0.5s ease-in-out"
              }}
            ></div>
          </div>
          <div className="share-section">
            <span className="share-text">Share fundraisers <span className="arrow">→</span></span>
            <img src={msgIcon} alt="Share" className="share-icon" onClick={handleShare} />
          </div>
        </div>
      </div>

      <div className="offline-donation-section">
        <button onClick={() => setShowOfflineDonation(true)} className="add-offline-donation">
          <Plus size={16} />
          <span>Add offline donation</span>
        </button>
      </div>

      {showOfflineDonation && (
        <div className="offline-donation-form">
          <input
            type="text"
            placeholder="Donor Name"
            value={offlineDonation.name}
            onChange={(e) => setOfflineDonation({ ...offlineDonation, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            value={offlineDonation.amount}
            onChange={(e) => setOfflineDonation({ ...offlineDonation, amount: e.target.value })}
          />
          <button onClick={handleOfflineDonationSubmit}>Add Donation</button>
        </div>
      )}

      <div className="donors-list">
        <h3>Recent Donors</h3>
        {donors.length > 0 ? (
          <div className="donors-grid">
            {donors.map((donor) => (
              <div key={donor.id} className="donor-item">
                <div className="donor-name">{donor.name}</div>
                <div className="donor-amount">₹{donor.amount.toLocaleString()}</div>
                <div className="donor-date">
                  {new Date(donor.timestamp?.toDate?.() || donor.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-donors">No donations yet. Share your campaign to start raising funds!</p>
        )}
      </div>
    </div>
  );

  const renderTransfer = () => (
    <div className="transfer-container">
      <h2>Transfer</h2>
      <div className="wallet-info">
        <p>Current raised amount: <strong>₹{currentCampaign?.amountRaised?.toLocaleString() || "0"}</strong></p>
      </div>
      <button onClick={handleConnectWallet}>Connect Wallet</button>
      <p>Wallet Address: <strong>{walletAddress}</strong></p>
      <button onClick={checkBalance}>Check Wallet Balance</button>
      <p>Wallet Balance: <strong>{walletBalance}</strong></p>
    </div>
  );

  const renderUpdate = () => (
    <div className="update-container">
      <h2>Campaign Updates</h2>
      <p>Share progress and updates with your supporters</p>
      <div className="campaign-progress">
        <h3>Current Progress</h3>
        <p>You've raised ₹{currentCampaign?.amountRaised?.toLocaleString() || "0"} of your ₹{currentCampaign?.goalAmount?.toLocaleString() || "0"} goal</p>
        <div className="progress-bar">
          <div
            className="progress"
            style={{
              width: `${calculateProgress()}%`,
              transition: "width 0.5s ease-in-out"
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="loading">Loading campaign details...</div>;
  }

  return (
    <div className="manage-page">
      <Navbar />
      <div className="main-container">
        <div className="tabs">
          {[
            { id: "dashboard", icon: dashIcon, label: "Dashboard" },
            { id: "donate", icon: donateIcon, label: "Donate" },
            { id: "transfer", icon: transIcon, label: "Transfer" },
            { id: "update", icon: updateIcon, label: "Update" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "active" : ""}
            >
              <img src={tab.icon} alt={tab.label} className="tab-icon" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "donate" && renderDonation()}
          {activeTab === "transfer" && renderTransfer()}
          {activeTab === "update" && renderUpdate()}
        </div>
      </div>

      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>Edit Campaign Details</h3>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              placeholder="Campaign Title"
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Campaign Description"
            />
            <input
              type="number"
              value={editData.goalAmount}
              onChange={(e) => setEditData({ ...editData, goalAmount: Number(e.target.value) })}
              placeholder="Goal Amount"
            />
            <div className="edit-modal-buttons">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showSharePopup && (
        <div className="share-popup-overlay">
          <div className="share-popup">
            <h3>Share Campaign</h3>
            <div className="share-popup-buttons">
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/campaign/${campaignId}`, "_blank")}>
                Facebook
              </button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.origin}/campaign/${campaignId}&text=Check out my fundraising campaign!`, "_blank")}>
                Twitter
              </button>
              <button onClick={() => window.open(`https://wa.me/?text=Check out my fundraising campaign! ${window.location.origin}/campaign/${campaignId}`, "_blank")}>
                WhatsApp
              </button>
            </div>
            <button className="close-button" onClick={() => setShowSharePopup(false)}>Close</button>
          </div>
        </div>
      )}

      {showCopyLinkPopup && (
        <div className="copy-link-popup-overlay">
          <div className="copy-link-popup">
            <h3>Copy Unique Link</h3>
            <input
              type="text"
              value={`${window.location.origin}/campaign/${campaignId}`}
              readOnly
            />
            <div className="copy-link-popup-buttons">
              <button onClick={copyLink}>Copy</button>
              <button onClick={() => setShowCopyLinkPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="preview-container">
          <button className="preview-close-btn" onClick={() => setShowPreview(false)}>
            <X size={24} />
          </button>
          <FundraiserPreview
            campaignData={currentCampaign}
            onClose={() => setShowPreview(false)}
            isStandalone={false} 
          />
        </div>
      )}
    </div>
  );
};

export default ManagePage;