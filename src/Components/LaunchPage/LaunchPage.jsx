import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './LaunchPage.css';
import logo from '../../assets/logo.png';

const LaunchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [campaignData, setCampaignData] = useState(null);

  useEffect(() => {
    const fetchCampaignData = async () => {
      const campaignId = location.state?.campaignId;
      if (!campaignId) {
        navigate('/');
        return;
      }
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignDoc = await getDoc(campaignRef);
      if (campaignDoc.exists()) {
        setCampaignData(campaignDoc.data()); // Fetch latest campaign data
      } else {
        navigate('/');
      }
    };
    fetchCampaignData();
  }, [location, navigate]);

  if (!campaignData) {
    return <div>Loading...</div>;
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleSetUpTransfer = () => {
    navigate(`/manage/${location.state.campaignId}`, { state: { activeTab: 'transfer' } });
  };

  return (
    <div className="launch-page">
      <div className="logo-container" onClick={() => navigate('/')}> 
        <img src={logo} alt="WeFund Logo" />
        <span>wefund</span>
      </div>
      
      <h1>Your fundraiser is ready to share!</h1>
      <div className="campaign-details">
        <h2>{campaignData.title}</h2>
        <p>{campaignData.description}</p>
        <p>Goal: ₹{campaignData.goalAmount?.toLocaleString()}</p>
        <img src={campaignData.coverPhoto} alt="Campaign Cover" />
      </div>
      
      <div className="share-options">
        <button className="copy-link-button" onClick={copyLink}>Copy Link</button>
        <button className="copy-link-button" onClick={handleSetUpTransfer}>Set Up Transfer</button>
      </div>
      
      <button className="skip-button" onClick={() => navigate('/newpage')}>Skip</button>
    </div>
  );
};

export default LaunchPage;