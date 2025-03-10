import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import FundraiserPreview from "../FundraiserPreview/FundraiserPreview"; // Import FundraiserPreview
import Navbar from "../Navbar/Navbar"; // Import the Navbar component
import "./AllCampaign.css";

const AllCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null); // State for selected campaign
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "campaigns"));
        const fetchedCampaigns = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCampaigns(fetchedCampaigns);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const calculateProgressPercentage = (raised, goal) => {
    if (!goal) return 0;
    return Math.round((raised / goal) * 100);
  };

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  return (
    <div style={{ backgroundColor: "#eff7e9" }}> {/* Set background color */}
      <Navbar /> {/* Add Navbar component */}
      <div className="all-campaigns-section">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "#046a07" }}>
            All Campaigns
          </h2>

          <div className="campaigns-grid">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="campaign-card"
                onClick={() => setSelectedCampaign(campaign)} // Set selected campaign
              >
                <div className="relative">
                  <div className="image-container" style={{ aspectRatio: "1646 / 903" }}>
                    <img
                      src={campaign.coverPhoto || "path/to/fallback-image.jpg"}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "path/to/fallback-image.jpg";
                      }}
                    />
                  </div>
                  <div className="absolute top-2 right-2 bg-white/75 px-2 py-1 rounded">
                    {campaign.donationsCount || 0} donations
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {campaign.title || "Untitled Campaign"}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {campaign.description || "No description available."}
                  </p>
                  {campaign.walletAddress && (
                    <p className="text-xs text-gray-500 mt-1">
                      Wallet Address: {campaign.walletAddress}
                    </p>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${calculateProgressPercentage(
                          campaign.raisedAmount || 0,
                          campaign.goalAmount || 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-green-600">
                      ₹{campaign.raisedAmount?.toLocaleString() || 0} raised
                    </span>
                    <span className="text-gray-600">
                      of ₹{campaign.goalAmount?.toLocaleString() || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Render the FundraiserPreview modal if a campaign is selected */}
      {selectedCampaign && (
        <FundraiserPreview
          onClose={() => setSelectedCampaign(null)} // Close modal
          campaignData={selectedCampaign} // Pass selected campaign data
          navigateToDonatePage={() =>
            navigate("/donate", { state: { campaign: selectedCampaign } })
          } // Navigate to donate page
          isStandalone={false} // Ensure the actual wallet address is displayed
        />
      )}
    </div>
  );
};

export default AllCampaigns;