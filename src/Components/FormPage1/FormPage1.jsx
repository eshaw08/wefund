// FormPage1.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import './FormPage1.css';
import icon from '../../assets/icon.png';
import yourselfImg from '../../assets/yourself.png';
import someoneElseImg from '../../assets/someone_else.png';
import charityImg from '../../assets/charity.png';

const FormPage1 = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify campaign ID exists when component mounts
    const campaignId = localStorage.getItem('campaignId');
    if (!campaignId) {
      alert("Campaign not found. Starting over.");
      navigate('/form');
    }
  }, [navigate]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option === selectedOption ? null : option);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedOption) {
      alert('Please select an option before continuing.');
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
        fundraisingFor: selectedOption,
      });
      
      console.log("Campaign updated with fundraisingFor: ", selectedOption);
      navigate('/form2');
    } catch (error) {
      console.error("Error updating campaign: ", error);
      alert("Error updating campaign. Please try again.");
    }
  };

  const options = [
    {
      key: 'Yourself',
      img: yourselfImg,
      heading: 'Yourself',
      description: 'Funds are delivered to your bank account for your own use.',
    },
    {
      key: 'Someone else',
      img: someoneElseImg,
      heading: 'Someone Else',
      description:
        'You will invite a beneficiary to receive funds or distribute them yourself.',
    },
    {
      key: 'Charity',
      img: charityImg,
      heading: 'Charity',
      description: 'Funds are delivered to your chosen nonprofit for you.',
    },
  ];

  return (
    <div className="form-page">
      <div className="left-section">
        <div className="text-content">
          <img src={icon} alt="WeFund Logo" className="form-logo" />
          <h1>Tell us who you're raising funds for</h1>
          <p>This information helps us get to know you and your fundraising needs.</p>
        </div>
      </div>
      <div className="right-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Who are you fundraising for?</label>
            <div className="options">
              {options.map(({ key, img, heading, description }) => (
                <button
                  key={key}
                  type="button"
                  className={`option ${selectedOption === key ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(key)}
                >
                  <div className="option-content">
                    <img src={img} alt={heading} className="option-image" />
                    <div className="option-text">
                      <h3>{heading}</h3>
                      <p>{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="form-submit">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormPage1;
