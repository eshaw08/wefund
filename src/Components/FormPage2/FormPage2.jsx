// FormPage2.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './FormPage2.css';
import icon from '../../assets/icon.png';

const FormPage2 = () => {
  const [goalAmount, setGoalAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verify campaign ID exists when component mounts
    const campaignId = localStorage.getItem('campaignId');
    if (!campaignId) {
      alert("Campaign not found. Starting over.");
      navigate('/form');
    }
  }, [navigate]);

  const handleInputChange = (event) => {
    setGoalAmount(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      alert('Please enter a valid goal amount greater than 0.');
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

      // Verify the campaign belongs to the current user
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignDoc = await getDoc(campaignRef);
      
      if (!campaignDoc.exists() || campaignDoc.data().userId !== userId) {
        alert("Campaign not found or access denied.");
        navigate('/form');
        return;
      }

      await updateDoc(campaignRef, {
        goalAmount: parseFloat(goalAmount),
      });
      
      console.log("Campaign updated with goalAmount: ", goalAmount);
      navigate('/form3');
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
          <h1>Set your fundraising goal</h1>
          <p>This amount helps us understand the scope of your fundraiser.</p>
        </div>
      </div>
      <div className="right-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="goalAmount">Fundraising Goal Amount (₹)</label>
            <input
              type="number"
              id="goalAmount"
              value={goalAmount}
              onChange={handleInputChange}
              placeholder="Enter your goal amount"
              min="1"
              required
            />
          </div>
          <button type="submit" className="form-submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormPage2;