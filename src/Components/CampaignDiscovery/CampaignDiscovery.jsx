import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaign } from '../../context/CampaignContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import FundraiserPreview from '../FundraiserPreview/FundraiserPreview';
import './CampaignDiscovery.css';

const CampaignDiscovery = () => {
  const { campaigns: contextCampaigns, fetchCampaigns } = useCampaign();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch campaigns in real-time
    const campaignsQuery = query(
      collection(db, 'campaigns'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(campaignsQuery, (snapshot) => {
      const fetchedCampaigns = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        raisedAmount: doc.data().raisedAmount || doc.data().amountRaised || 0,
        donationsCount: doc.data().donationsCount || 0,
        recentDonors: doc.data().recentDonors || [],
      }));

      setCampaigns(fetchedCampaigns);
      setLoading(false);

      // Update the context if needed
      if (typeof fetchCampaigns === 'function') {
        fetchCampaigns(fetchedCampaigns);
      }
    });

    return () => unsubscribe();
  }, [fetchCampaigns]);

  const calculateProgressPercentage = (campaign) => {
    const raised = campaign.raisedAmount || campaign.amountRaised || 0;
    const goal = campaign.goalAmount || 100;
    return Math.min(100, Math.round((raised / goal) * 100));
  };

  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
  };

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="campaign-discovery-section">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#046a07' }}>
            Discover and Support Impactful Campaigns
          </h2>
          <div className="text-center py-8">
            <p>No campaigns available at the moment.</p>
            <button
              onClick={() => navigate('/form')}
              className="more-button"
              style={{ margin: '20px auto' }}
            >
              <span className="underline">Create a Campaign</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-discovery-section">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#046a07' }}>
          Discover and Support Impactful Campaigns
        </h2>

        <div className="campaign-layout">
          {/* Featured Campaign (Left Side) */}
          {campaigns.length > 0 && (
            <div className="featured-campaign" onClick={() => handleCampaignClick(campaigns[0])}>
              <div className="relative">
                <div className="image-container" style={{ aspectRatio: '1646 / 903' }}>
                  <img
                    src={campaigns[0].coverPhoto || '/placeholder.jpg'}
                    alt={campaigns[0].title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2 bg-white/75 px-2 py-1 rounded">
                  {campaigns[0].donationsCount || 0} donations
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-2xl mb-4 line-clamp-2">
                  {campaigns[0].title || 'Untitled Campaign'}
                </h3>
                <p className="text-gray-600 text-lg mb-4 line-clamp-3">
                  {campaigns[0].description || 'No description available.'}
                </p>
                {campaigns[0].walletAddress && (
                  <p className="wallet-address">
                    Wallet: {campaigns[0].walletAddress}
                  </p>
                )}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${calculateProgressPercentage(campaigns[0])}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-green-600">
                    ₹{(campaigns[0].raisedAmount || 0).toLocaleString()} raised
                  </span>
                  <span className="text-gray-600">
                    of ₹{(campaigns[0].goalAmount || 100).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Smaller Campaign Cards (Right Side) */}
          <div className="small-campaigns-grid">
            {campaigns.slice(1, 5).map((campaign) => (
              <div
                key={campaign.id || Math.random().toString(36).substr(2, 9)}
                className="small-campaign"
                onClick={() => handleCampaignClick(campaign)}
              >
                <div className="relative">
                  <div className="image-container" style={{ aspectRatio: '1646 / 903' }}>
                    <img
                      src={campaign.coverPhoto || '/placeholder.jpg'}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="absolute top-2 right-2 bg-white/75 px-2 py-1 rounded">
                    {campaign.donationsCount || 0} donations
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {campaign.title || 'Untitled Campaign'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {campaign.description || 'No description available.'}
                  </p>
                  {campaign.walletAddress && (
                    <p className="wallet-address">
                      Wallet: {campaign.walletAddress}
                    </p>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${calculateProgressPercentage(campaign)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-green-600">
                      ₹{(campaign.raisedAmount || 0).toLocaleString()} raised
                    </span>
                    <span className="text-gray-600">
                      of ₹{(campaign.goalAmount || 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "More" Button with Arrow and Underline */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/all-campaigns')}
            className="more-button"
          >
            <span className="underline">More</span>
            <span className="arrow">→</span>
          </button>
        </div>
      </div>

      {/* Render the FundraiserPreview modal if a campaign is selected */}
      {selectedCampaign && (
        <FundraiserPreview
          onClose={() => setSelectedCampaign(null)}
          campaignData={selectedCampaign}
          navigateToDonatePage={() =>
            navigate('/donate', { state: { campaign: selectedCampaign } })
          }
          isStandalone={false}
        />
      )}
    </div>
  );
};

export default CampaignDiscovery;