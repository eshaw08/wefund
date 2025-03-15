import React from 'react';
import { X, Heart, ShieldCheck, Users, Share } from 'lucide-react';
import './FundraiserPreview.css';
import heartIcon from '../../assets/heart.png';
import { useCampaign } from '../../context/CampaignContext';
import ProgressBar from '../common/ProgressBar/ProgressBar';

const FundraiserPreview = ({ onClose, campaignData, navigateToDonatePage, isStandalone, isManagePage }) => {
  const { getCampaignById } = useCampaign();
  const campaign = getCampaignById(campaignData?.id) || campaignData;

  if (!campaign) return null;

  const {
    title,
    goalAmount,
    coverPhoto,
    description,
    walletAddress,
    creatorName,
    raisedAmount,
    donationsCount,
    recentDonors,
  } = campaign;

  const userName = creatorName || 'Anonymous Organizer';
  const totalDonations = donationsCount || recentDonors?.length || 0;
  const totalRaised = raisedAmount || 0;

  const getImageUrl = () => {
    if (!coverPhoto) return '/placeholder.jpg';
    if (typeof coverPhoto === 'string') return coverPhoto;
    if (coverPhoto instanceof File) return URL.createObjectURL(coverPhoto);
    return '/placeholder.jpg';
  };

  return (
    <div className="fundraiser-preview-overlay">
      <div className="fundraiser-preview-modal">
        {/* Show header with title for ManagePage, just X button for campaign discovery */}
        {isManagePage ? (
          <div className="preview-header">
            <h3>Fundraiser Preview</h3>
            <button onClick={onClose} className="close-button">
              <X size={24} color="#333" />
            </button>
          </div>
        ) : (
          <div className="preview-close-container">
            <button onClick={onClose} className="close-button">
              <X size={24} color="#333" />
            </button>
          </div>
        )}

        <h1 className="campaign-title">{title}</h1>

        <div className="campaign-container">
          <div className="campaign-image-container" style={{ aspectRatio: '1646 / 903' }}>
            <img
              src={getImageUrl()}
              alt="Campaign Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.jpg';
              }}
            />
          </div>

          <div className="donation-box">
            <div className="amount-container">
              <span className="goal-amount">₹{goalAmount?.toLocaleString()} Goal</span>
              <ProgressBar
                raisedAmount={totalRaised}
                goalAmount={goalAmount}
                style="circle"
                size="medium"
                showText={false}
              />
            </div>
            <div className="amounts">
              <span>₹{totalRaised.toLocaleString()} raised</span>
              <span>of ₹{goalAmount?.toLocaleString()}</span>
            </div>
            {totalDonations > 0 && (
              <div className="donations-count">
                <span>{totalDonations} donation{totalDonations !== 1 ? 's' : ''}</span>
              </div>
            )}
            {walletAddress && <p>Wallet Address: {walletAddress}</p>}
            <button onClick={navigateToDonatePage} className="donate-button">
              Donate Now
            </button>
            <button className="share-button">
              <Share size={16} />
              Share
            </button>
            <div className="donation-quote">
              <img src={heartIcon} alt="Heart Icon" className="heart-icon" />
              <span>
                {totalDonations > 0
                  ? `Join ${totalDonations} supporter${totalDonations !== 1 ? 's' : ''} who have donated to this campaign.`
                  : "Become the first supporter for this campaign."}
              </span>
            </div>
            <b className="donation-matter">YOUR DONATION MATTERS</b>
          </div>
        </div>

        <div className="organizer-info">
          <Users size={16} />
          <span>{userName} is organizing this fundraiser</span>
        </div>
        <hr className="separator" />

        {/* Display recent donors if available */}
        {recentDonors && recentDonors.length > 0 && (
          <>
            <div className="recent-donors">
              <h3 className="recent-donors-title">Recent Donors</h3>
              <ul className="donors-list">
                {recentDonors.slice(0, 5).map((donor, index) => (
                  <li key={index} className="donor-item">
                    <span className="donor-name">{donor.name}</span>
                    <span className="donor-amount">₹{donor.amount.toLocaleString()}</span>
                    <span className="donor-date">
                      {new Date(donor.timestamp).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <hr className="separator" />
          </>
        )}

        <div className="campaign-description">
          <p>{description}</p>
        </div>
        <hr className="separator" />

        <div className="donation-protection">
          <ShieldCheck size={16} color="#27AE60" />
          <span>Donations are protected by WeFund's guarantee</span>
        </div>

        <div className="show-support">
          <Heart size={16} color="#FF6B6B" />
          <span>Show your support for this WeFund campaign</span>
        </div>
      </div>
    </div>
  );
};

export default FundraiserPreview;