import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const CampaignContext = createContext();

export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add logging to track campaign updates
  useEffect(() => {
    console.log('Setting up campaign listener...');
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
      const campaignsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const raisedAmount = parseFloat(data.raisedAmount || 0);
        const goalAmount = parseFloat(data.goalAmount || 0);
        // Add data validation with consistent progress calculation
        const validatedData = {
          id: doc.id,
          ...data,
          raisedAmount: raisedAmount,
          goalAmount: goalAmount,
          donationsCount: parseInt(data.donationsCount || 0),
          recentDonors: Array.isArray(data.recentDonors) ? data.recentDonors : [],
          status: data.status || 'pending',
          progressPercentage: goalAmount > 0 ? Math.min(100, Math.round((raisedAmount / goalAmount) * 100)) : 0
        };
        console.log(`Validated campaign ${doc.id}:`, validatedData);
        return validatedData;
      });
      setCampaigns(campaignsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Enhanced updateCampaignProgress with real-time updates
  const updateCampaignProgress = async (campaignId, amount, donorName) => {
    try {
      console.log(`Updating campaign ${campaignId} with amount ${amount} from ${donorName}`);
      
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignSnap = await getDoc(campaignRef);
      
      if (!campaignSnap.exists()) {
        console.error("Campaign not found:", campaignId);
        return false;
      }
  
      const currentData = campaignSnap.data();
      console.log('Current campaign data:', currentData);
      
      const currentAmount = parseFloat(currentData.raisedAmount || 0);
      const donationAmount = parseFloat(amount);
      
      if (isNaN(donationAmount) || donationAmount <= 0) {
        console.error("Invalid donation amount:", amount);
        return false;
      }
      
      const newAmount = currentAmount + donationAmount;
      const goalAmount = parseFloat(currentData.goalAmount || 0);
      const progressPercentage = goalAmount > 0 ? Math.min(100, Math.round((newAmount / goalAmount) * 100)) : 0;
      
      console.log(`Updating amount from ${currentAmount} to ${newAmount}`);
      
      const donorInfo = {
        name: donorName || 'Anonymous',
        amount: donationAmount,
        timestamp: new Date().toISOString()
      };

      // Update campaign document with atomic operations
      await updateDoc(campaignRef, {
        raisedAmount: newAmount,
        donationsCount: (currentData.donationsCount || 0) + 1,
        progressPercentage,
        recentDonors: arrayUnion(donorInfo),
        lastUpdated: new Date().toISOString()
      });

      // Update local state after successful Firestore update
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(camp => 
          camp.id === campaignId
            ? {
                ...camp,
                raisedAmount: newAmount,
                donationsCount: (camp.donationsCount || 0) + 1,
                progressPercentage,
                recentDonors: [...(camp.recentDonors || []), donorInfo]
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .slice(0, 10)
              }
            : camp
        )
      );

      return true;
    } catch (error) {
      console.error("Error in updateCampaignProgress:", error);
      return false;
    }
  };

  const getCampaignById = (campaignId) => {
    return campaigns.find(campaign => campaign.id === campaignId);
  };

  return (
    <CampaignContext.Provider value={{ 
      campaigns, 
      loading,
      updateCampaignProgress,
      getCampaignById
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

// Add console logs to track campaign creation
const createCampaign = async (campaignData) => {
  try {
    console.log('Creating campaign with data:', campaignData);
    const docRef = await addDoc(collection(db, 'campaigns'), {
      ...campaignData,
      createdAt: new Date(),
      raisedAmount: 0,
      donationsCount: 0
    });
    console.log('Campaign created successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};