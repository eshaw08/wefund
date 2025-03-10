import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './MainForm.css';
import icon from '../../assets/icon.png';
import FundraiserPreview from '../FundraiserPreview/FundraiserPreview';

const MainForm = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const campaignId = localStorage.getItem('campaignId');
        if (!campaignId) {
          alert("Campaign not found. Starting over.");
          navigate('/form');
          return;
        }

        const userId = auth.currentUser?.uid;
        if (!userId) {
          alert("You must be logged in to view campaign.");
          navigate('/login');
          return;
        }

        const campaignRef = doc(db, "campaigns", campaignId);
        const campaignDoc = await getDoc(campaignRef);
        
        if (!campaignDoc.exists() || campaignDoc.data().userId !== userId) {
          alert("Campaign not found or access denied.");
          navigate('/form');
          return;
        }

        setCampaignData(campaignDoc.data());
      } catch (error) {
        console.error("Error fetching campaign data:", error);
        alert("Error loading campaign data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [navigate]);

  const handleEdit = (field) => {
    switch (field) {
      case 'location':
        navigate('/form');
        break;
      case 'fundraisingFor':
        navigate('/form1');
        break;
      case 'goal':
        navigate('/form2');
        break;
      case 'photo':
        navigate('/form3');
        break;
      case 'story':
        navigate('/form4');
        break;
      case 'title':
        navigate('/form5');
        break;
      default:
        console.log(`Edit ${field}`);
    }
  };

  const handleLaunch = async () => {
    try {
      const campaignId = localStorage.getItem('campaignId');
      const userId = auth.currentUser?.uid;

      if (!campaignId || !userId) {
        alert("Campaign data or user not found.");
        return;
      }

      // Update the campaign status to 'launched' in Firestore
      await updateDoc(doc(db, "campaigns", campaignId), {
        status: 'launched',
        launchedAt: new Date(),
      });

      // Navigate to the launch page with the campaign ID
      navigate('/launch', { state: { campaignId } });
    } catch (error) {
      console.error("Error launching campaign:", error);
      alert("Error launching campaign. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="main-form">
        <div className="loading">Loading campaign data...</div>
      </div>
    );
  }

  return (
    <div className="main-form">
      <div className="main-form-left">
        <img src={icon} alt="WeFund Logo" className="form-logo" />
        <h1>Review Your Fundraiser</h1>
        <p>Let's make sure your fundraiser is complete before launching. Review all details and make any necessary changes.</p>
      </div>
      <div className="main-form-right">
        <div className="review-section">
          <h2>Cover Media</h2>
          <div className="media-upload-box">
            {campaignData?.coverPhoto ? (
              <div className="uploaded-media">
                <p>Photo uploaded: {campaignData.coverPhoto.name}</p>
                <button className="edit-button" onClick={() => handleEdit('photo')}>Change Photo</button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">📷</span>
                <p>Upload a photo or video</p>
                <small>Add bright and clear media to help donors connect to your fundraiser.</small>
                <button className="upload-button" onClick={() => handleEdit('photo')}>Add Photo</button>
              </div>
            )}
          </div>
          
          <div className="review-item">
            <div className="review-header">
              <h3>Title</h3>
              <button className="edit-button" onClick={() => handleEdit('title')}>Edit</button>
            </div>
            <p>{campaignData?.title || 'Not set'}</p>
          </div>

          <div className="review-item">
            <div className="review-header">
              <h3>Goal Amount</h3>
              <button className="edit-button" onClick={() => handleEdit('goal')}>Edit</button>
            </div>
            <p>₹{campaignData?.goalAmount?.toLocaleString() || 'Not set'}</p>
          </div>

          <div className="review-item">
            <div className="review-header">
              <h3>Category</h3>
              <button className="edit-button" onClick={() => handleEdit('location')}>Edit</button>
            </div>
            <p>{campaignData?.fundraisingReason || 'Not set'}</p>
          </div>

          <div className="review-item">
            <div className="review-header">
              <h3>Location</h3>
              <button className="edit-button" onClick={() => handleEdit('location')}>Edit</button>
            </div>
            <p>{`${campaignData?.country || 'Not set'} - ${campaignData?.zipCode || 'Not set'}`}</p>
          </div>

          <div className="review-item">
            <div className="review-header">
              <h3>Fundraising For</h3>
              <button className="edit-button" onClick={() => handleEdit('fundraisingFor')}>Edit</button>
            </div>
            <p>{campaignData?.fundraisingFor || 'Not set'}</p>
          </div>

          <div className="review-item">
            <div className="review-header">
              <h3>Story</h3>
              <button className="edit-button" onClick={() => handleEdit('story')}>Edit</button>
            </div>
            <p>{campaignData?.description || 'Not set'}</p>
          </div>
        </div>

        <div className="button-group">
          <button className="preview-button" onClick={() => setShowPreview(true)}>Preview</button>
          <button 
            className="launch-button"
            onClick={handleLaunch}
            disabled={!campaignData?.title || !campaignData?.description || !campaignData?.goalAmount}
          >
            Launch fundraiser
          </button>
        </div>
      </div>
      
      {showPreview && <FundraiserPreview onClose={() => setShowPreview(false)} campaignData={campaignData} />}
    </div>
  );
};

export default MainForm;