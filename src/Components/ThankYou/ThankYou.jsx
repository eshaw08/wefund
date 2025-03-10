import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './ThankYou.css';

const ThankYou = () => {
  const location = useLocation();
  const { campaign, donationAmount } = location.state || {};
  const [progressWidth, setProgressWidth] = useState(0);
  
  // Use progress percentage directly from campaign context
  const percentageRaised = campaign?.progressPercentage || 0;
  
  useEffect(() => {
    // Animate progress bar on component mount
    setTimeout(() => {
      setProgressWidth(percentageRaised);
    }, 300);
  }, [percentageRaised]);

  return (
    <div className="thank-you">
      <div className="thank-you-container">
        <h1>Thank You for Your Support! <span className="heart-icon">💙</span></h1>
        <p>"No act of kindness, no matter how small, is ever wasted."</p>

        {/* Display campaign and donation details if available */}
        {campaign && (
          <div className="campaign-details">
            <h2>{campaign.title}</h2>
            <p>Your contribution</p>
            <span className="donation-amount">₹{donationAmount}</span>
            
            <div className="progress-container">
              <p>Total raised: ₹{campaign.raisedAmount} of ₹{campaign.goalAmount || '100,000'}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressWidth}%` }}
                ></div>
              </div>
              <p>{percentageRaised}% of our goal reached</p>
            </div>
            
            <p>Your generosity helps make a real difference!</p>
            
            <div className="social-share">
              <button className="social-button facebook" aria-label="Share on Facebook">
                f
              </button>
              <button className="social-button twitter" aria-label="Share on Twitter">
                t
              </button>
              <button className="social-button whatsapp" aria-label="Share on WhatsApp">
                w
              </button>
            </div>
          </div>
        )}

        <Link to="/" className="home-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;