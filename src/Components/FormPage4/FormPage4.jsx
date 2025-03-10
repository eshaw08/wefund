// FormPage4.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './FormPage4.css';
import icon from '../../assets/icon.png';

const FormPage4 = () => {
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load existing campaign data
    const loadCampaignData = async () => {
      const campaignId = localStorage.getItem('campaignId');
      if (!campaignId) {
        alert("Campaign not found. Starting over.");
        navigate('/form');
        return;
      }

      try {
        const campaignRef = doc(db, "campaigns", campaignId);
        const campaignDoc = await getDoc(campaignRef);
        
        if (campaignDoc.exists()) {
          // Load description if it exists
          const data = campaignDoc.data();
          if (data.description) {
            setDescription(data.description);
          }

          // Store campaign data in localStorage
          const formData = {
            ...JSON.parse(localStorage.getItem('campaignFormData') || '{}'),
            description: data.description || ''
          };
          localStorage.setItem('campaignFormData', JSON.stringify(formData));
        }
      } catch (error) {
        console.error("Error loading campaign data:", error);
      }
    };

    loadCampaignData();
  }, [navigate]);

  const handleInputChange = (event) => {
    const newDescription = event.target.value;
    setDescription(newDescription);
    
    // Update formData in localStorage
    const formData = JSON.parse(localStorage.getItem('campaignFormData') || '{}');
    formData.description = newDescription;
    localStorage.setItem('campaignFormData', JSON.stringify(formData));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!description.trim()) {
      alert('Please provide a description before continuing.');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("You must be logged in to create a campaign.");
        return;
      }

      const campaignId = localStorage.getItem('campaignId');
      if (!campaignId) {
        alert("Campaign not found. Starting over.");
        navigate('/form');
        return;
      }

      // Update Firestore
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignDoc = await getDoc(campaignRef);
      
      if (!campaignDoc.exists() || campaignDoc.data().userId !== userId) {
        alert("Campaign not found or access denied.");
        navigate('/form');
        return;
      }

      await updateDoc(campaignRef, {
        description: description.trim(),
      });
      
      console.log("Campaign updated with description");
      navigate('/form5');
    } catch (error) {
      console.error("Error updating campaign: ", error);
      alert("Error updating campaign. Please try again.");
    }
  };

  return (
    <div className="form-page">
      <div className="left-section">
        <div className="text-content">
          <img src={icon} alt="WeFund Logo" className="form-logo" />
          <h1>Describe your fundraiser</h1>
          <p>
            Provide details about your cause to help people understand why you are raising funds.
            The more details you share, the more likely people are to support you.
          </p>
        </div>
      </div>
      <div className="right-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Fundraiser Description</label>
            <textarea
              id="description"
              value={description}
              onChange={handleInputChange}
              placeholder="Write your story here..."
              rows="8"
              required
              minLength="50"
              maxLength="5000"
            />
            <small className="character-count">
              {description.length}/5000 characters
            </small>
          </div>
          <button type="submit" className="form-submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormPage4;