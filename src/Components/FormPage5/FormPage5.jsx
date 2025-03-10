import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './FormPage5.css';
import icon from '../../assets/icon.png';

const FormPage5 = () => {
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        const campaignId = localStorage.getItem('campaignId');
        if (!campaignId) {
          alert("Campaign not found. Starting over.");
          navigate('/form');
          return;
        }

        // Load existing form data from localStorage
        const storedFormData = JSON.parse(localStorage.getItem('campaignFormData') || '{}');
        setFormData(storedFormData);

        // Load campaign data from Firestore
        const campaignRef = doc(db, "campaigns", campaignId);
        const campaignDoc = await getDoc(campaignRef);
        
        if (campaignDoc.exists()) {
          const data = campaignDoc.data();
          if (data.title) {
            setTitle(data.title);
          }

          // Update formData with Firestore data
          const updatedFormData = {
            ...storedFormData,
            title: data.title || ''
          };
          setFormData(updatedFormData);
          localStorage.setItem('campaignFormData', JSON.stringify(updatedFormData));
        }
      } catch (error) {
        console.error("Error loading campaign data:", error);
        alert("Error loading campaign data. Please try again.");
      }
    };

    loadCampaignData();
  }, [navigate]);

  const handleInputChange = (event) => {
    const newTitle = event.target.value;
    if (newTitle.length <= 100) {
      setTitle(newTitle);
      
      // Update formData in state and localStorage
      const updatedFormData = { ...formData, title: newTitle };
      setFormData(updatedFormData);
      localStorage.setItem('campaignFormData', JSON.stringify(updatedFormData));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!title.trim()) {
      alert('Please provide a title before continuing.');
      return;
    }
    
    if (title.length < 10) {
      alert('Title must be at least 10 characters long.');
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
      await updateDoc(campaignRef, {
        title: title.trim(),
        status: 'pending_review', // Update status as this is the final step
        walletAddress: null, // No wallet address at creation
      });
      
      // Navigate to the review page (MainForm)
      navigate('/review');
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Error updating campaign. Please try again.');
    }
  };

  return (
    <div className="form-page">
      <div className="left-section">
        <div className="text-content">
          <img src={icon} alt="WeFund Logo" className="form-logo" />
          <h1>Give Your Fundraiser a Title</h1>
          <p>
            The title is your fundraiser's first impression. Make it clear, 
            engaging, and goal-focused to attract support.
          </p>
        </div>
      </div>
      <div className="right-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Your Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter your title here"
              value={title}
              onChange={handleInputChange}
              required
              minLength="10"
              maxLength="100"
            />
            <small className="character-count">
              {title.length}/100 characters
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

export default FormPage5;