import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../Navbar/Navbar';
import './MyFundraisers.css';

const MyFundraisers = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          alert("You must be logged in to view your campaigns.");
          navigate('/login');
          return;
        }

        const campaignsQuery = query(collection(db, 'campaigns'), where('userId', '==', userId));
        const querySnapshot = await getDocs(campaignsQuery);
        const fetchedCampaigns = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCampaigns(fetchedCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        alert("Error loading campaigns. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [navigate]);

  if (loading) {
    return <div className="loading-message">Loading your campaigns...</div>;
  }

  return (
    <>
      <Navbar />
      <h2 className="my-fundraisers-heading">Your Fundraisers</h2>
      <p className="my-fundraisers-subheading">Track and manage your active and past campaigns.</p>

      <div className="campaign-list">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="campaign-item">
            <img src={campaign.coverPhoto} alt={campaign.title} />
            <h3>{campaign.title}</h3>
            <div className="campaign-actions">
              <button onClick={() => navigate(`/manage/${campaign.id}`)}>Manage</button>
              <button onClick={() => navigate(`/campaign/${campaign.id}`)}>View</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MyFundraisers;