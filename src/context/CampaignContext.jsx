import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CampaignContext = createContext();

// UTC DateTime helper functions
const CURRENT_UTC_DATETIME = '2025-03-14 16:12:34';
const CURRENT_USER = 'eshaw08';

const formatToUTC = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(CURRENT_UTC_DATETIME);
  const [currentUser] = useState(CURRENT_USER);

  // Update current datetime every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(formatToUTC(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log('Setting up campaign listener...');
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
      const campaignsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const raisedAmount = parseFloat(data.raisedAmount || 0);
        const goalAmount = parseFloat(data.goalAmount || 0);
        const donationsCount = parseInt(data.donationsCount || 0);
        const recentDonors = Array.isArray(data.recentDonors) ? data.recentDonors : [];
        const progressPercentage = goalAmount > 0 ? Math.min(100, Math.round((raisedAmount / goalAmount) * 100)) : 0;
        
        const validatedData = {
          id: doc.id,
          ...data,
          raisedAmount,
          goalAmount,
          donationsCount,
          recentDonors,
          status: data.status || 'pending',
          progressPercentage,
          lastUpdated: data.lastUpdated || currentDateTime,
          lastUpdatedBy: data.lastUpdatedBy || currentUser,
          createdAt: data.createdAt || currentDateTime,
          createdBy: data.createdBy || currentUser
        };
        
        // Ensure all components receive the same validated data
        return validatedData;
      });
      
      setCampaigns(campaignsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentDateTime, currentUser]);

  const updateCampaignProgress = async (campaignId, amount, donorName) => {
    try {
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignSnap = await getDoc(campaignRef);
      
      if (!campaignSnap.exists()) {
        throw new Error("Campaign not found");
      }
  
      const currentData = campaignSnap.data();
      const currentAmount = parseFloat(currentData.raisedAmount || 0);
      const donationAmount = parseFloat(amount);
      
      if (isNaN(donationAmount) || donationAmount <= 0) {
        throw new Error("Invalid donation amount");
      }
      
      const newAmount = currentAmount + donationAmount;
      const goalAmount = parseFloat(currentData.goalAmount || 0);
      const progressPercentage = goalAmount > 0 ? Math.min(100, Math.round((newAmount / goalAmount) * 100)) : 0;
      const currentDonationsCount = parseInt(currentData.donationsCount || 0);
      
      const donorInfo = {
        name: donorName || 'Anonymous',
        amount: donationAmount,
        timestamp: new Date().toISOString(),
        donatedBy: currentUser
      };

      // Update campaign data with new values
      const updatedData = {
        raisedAmount: newAmount,
        donationsCount: currentDonationsCount + 1,
        progressPercentage,
        recentDonors: arrayUnion(donorInfo),
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: currentUser
      };

      // Update Firestore
      await updateDoc(campaignRef, updatedData);

      // Update local state to ensure immediate UI updates
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign.id === campaignId
            ? {
                ...campaign,
                ...updatedData,
                recentDonors: [...(campaign.recentDonors || []), donorInfo]
              }
            : campaign
        )
      );

      return true;
    } catch (error) {
      console.error("Error in updateCampaignProgress:", error);
      throw error;
    }
  };

  const getCampaignById = (campaignId) => {
    return campaigns.find(campaign => campaign.id === campaignId);
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <CampaignContext.Provider value={{ 
      campaigns,
      loading,
      updateCampaignProgress,
      getCampaignById,
      formatCurrency,
      currentUser,
      currentDateTime
    }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};