// src/services/campaignService.js
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// Helper function to convert file to downloadable URL
const uploadFile = async (file, path) => {
  if (!file) return null;
  
  const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
};

// Convert Firestore timestamps to regular dates
const convertTimestamps = (data) => {
  const result = { ...data };
  
  for (const key in result) {
    if (result[key] && typeof result[key].toDate === 'function') {
      result[key] = result[key].toDate().toISOString();
    } else if (result[key] && typeof result[key] === 'object') {
      result[key] = convertTimestamps(result[key]);
    }
  }
  
  return result;
};

// Helper function to process campaign data from Firestore
const processCampaignData = (doc) => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    ...convertTimestamps(data)
  };
};

export const campaignService = {
  // Get all campaigns with optional filters
  getCampaigns: async (filters = {}) => {
    try {
      console.log("Fetching campaigns with filters:", filters);
      const campaignsRef = collection(db, 'campaigns');
      let campaignsQuery = query(campaignsRef, orderBy('createdAt', 'desc'));
      
      // Apply filters
      if (filters.category) {
        campaignsQuery = query(campaignsQuery, where('category', '==', filters.category));
      }
      
      if (filters.stage) {
        campaignsQuery = query(campaignsQuery, where('stage', '==', filters.stage));
      }
      
      if (filters.creatorId) {
        campaignsQuery = query(campaignsQuery, where('creator.id', '==', filters.creatorId));
      }
      
      if (filters.limit) {
        campaignsQuery = query(campaignsQuery, limit(filters.limit));
      }
      
      const snapshot = await getDocs(campaignsQuery);
      const campaigns = snapshot.docs.map(processCampaignData);
      console.log(`Retrieved ${campaigns.length} campaigns from Firestore`);
      
      return {
        data: campaigns,
        total: campaigns.length
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw new Error(error.message || 'Failed to fetch campaigns');
    }
  },

  // Get a single campaign by ID
  getCampaignById: async (id) => {
    try {
      console.log(`Fetching campaign with ID: ${id}`);
      const campaignRef = doc(db, 'campaigns', id);
      const campaignDoc = await getDoc(campaignRef);
      
      if (!campaignDoc.exists()) {
        console.log(`Campaign with ID ${id} not found`);
        throw new Error('Campaign not found');
      }
      
      const campaign = processCampaignData(campaignDoc);
      console.log('Retrieved campaign:', campaign);
      return campaign;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw new Error(error.message || 'Failed to fetch campaign');
    }
  },

  // Create a new campaign
  createCampaign: async (campaignData, userId) => {
    try {
      console.log('Creating new campaign for user:', userId);
      // Process and upload images
      const processedData = { ...campaignData };
      
      // Upload main images if they are File objects
      if (processedData.images && processedData.images.length > 0) {
        const imageUrls = await Promise.all(
          processedData.images.map(async (image) => {
            if (image.file) {
              const url = await uploadFile(image.file, 'campaign-images');
              return { url, preview: url };
            }
            return image;
          })
        );
        
        processedData.images = imageUrls;
      }
      
      // Upload pitch asset if it's a File object
      if (processedData.pitchAsset && processedData.pitchAsset.file) {
        const pitchAssetUrl = await uploadFile(
          processedData.pitchAsset.file, 
          `pitch-assets/${processedData.pitchAsset.type}`
        );
        
        processedData.pitchAsset = {
          ...processedData.pitchAsset,
          preview: pitchAssetUrl,
          url: pitchAssetUrl
        };
      }
      
      // Upload milestone images
      if (processedData.financials && processedData.financials.milestones) {
        processedData.financials.milestones = await Promise.all(
          processedData.financials.milestones.map(async (milestone) => {
            if (milestone.image && milestone.image.file) {
              const url = await uploadFile(milestone.image.file, 'milestone-images');
              return {
                ...milestone,
                image: { preview: url, url }
              };
            }
            return milestone;
          })
        );
      }
      
      // Upload team member images
      if (processedData.team && processedData.team.length > 0) {
        processedData.team = await Promise.all(
          processedData.team.map(async (member) => {
            if (member.image && member.image.file) {
              const url = await uploadFile(member.image.file, 'team-images');
              return {
                ...member,
                image: { preview: url, url }
              };
            }
            return member;
          })
        );
      }
      
      // Upload business plan if it's a File object
      if (processedData.businessPlan && processedData.businessPlan.file) {
        const businessPlanUrl = await uploadFile(
          processedData.businessPlan.file,
          'business-plans'
        );
        
        processedData.businessPlan = {
          name: processedData.businessPlan.name,
          url: businessPlanUrl
        };
      }
      
      // Add server-managed fields
      const campaignToAdd = {
        ...processedData,
        currentAmount: 0,
        status: 'active',
        creator: {
          id: userId,
          name: processedData.creator?.name || 'Anonymous',
          avatar: processedData.creator?.avatar || null,
          totalCampaigns: 1,
          successRate: 100
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        endDate: processedData.projectDuration?.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      };
      
      console.log('Saving campaign to Firestore...');
      const campaignRef = await addDoc(collection(db, 'campaigns'), campaignToAdd);
      console.log('Campaign created with ID:', campaignRef.id);
      
      // Return the new campaign with its ID
      return {
        id: campaignRef.id,
        ...campaignToAdd
      };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error(error.message || 'Failed to create campaign');
    }
  },

  // Update an existing campaign
  updateCampaign: async (id, campaignData) => {
    try {
      console.log(`Updating campaign with ID: ${id}`);
      const campaignRef = doc(db, 'campaigns', id);
      
      // Add updatedAt timestamp
      const dataToUpdate = {
        ...campaignData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(campaignRef, dataToUpdate);
      console.log('Campaign successfully updated');
      
      // Get updated campaign
      const updatedCampaign = await getDoc(campaignRef);
      return processCampaignData(updatedCampaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw new Error(error.message || 'Failed to update campaign');
    }
  },

  // Delete a campaign
  deleteCampaign: async (id) => {
    try {
      console.log(`Deleting campaign with ID: ${id}`);
      const campaignRef = doc(db, 'campaigns', id);
      await deleteDoc(campaignRef);
      console.log('Campaign successfully deleted');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw new Error(error.message || 'Failed to delete campaign');
    }
  },

  // Get campaign statistics
  getCampaignStats: async (id) => {
    try {
      console.log(`Getting stats for campaign with ID: ${id}`);
      const campaignRef = doc(db, 'campaigns', id);
      const campaignDoc = await getDoc(campaignRef);
      
      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found');
      }
      
      const campaignData = processCampaignData(campaignDoc);
      
      // Calculate additional stats
      const contributionsQuery = query(
        collection(db, 'contributions'), 
        where('campaignId', '==', id)
      );
      
      const contributions = await getDocs(contributionsQuery);
      
      const totalContributors = new Set(
        contributions.docs.map(doc => doc.data().investorId)
      ).size;
      
      const stats = {
        totalAmount: campaignData.currentAmount || 0,
        targetAmount: campaignData.targetAmount || 0,
        percentageFunded: campaignData.targetAmount 
          ? (campaignData.currentAmount / campaignData.targetAmount) * 100 
          : 0,
        totalContributors,
        daysLeft: campaignData.endDate 
          ? Math.max(0, Math.floor((new Date(campaignData.endDate) - new Date()) / (1000 * 60 * 60 * 24))) 
          : 0
      };
      
      console.log('Campaign stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching campaign statistics:', error);
      throw new Error(error.message || 'Failed to fetch campaign statistics');
    }
  },

  // Contribute to a campaign
  contributeToCampaign: async (campaignId, amount, userId, selectedMilestones) => {
    try {
      console.log(`Processing contribution of ${amount} to campaign ${campaignId} by user ${userId}`);
      
      // Update campaign total
      const campaignRef = doc(db, 'campaigns', campaignId);
      const campaignDoc = await getDoc(campaignRef);
      
      if (!campaignDoc.exists()) {
        throw new Error('Campaign not found');
      }
      
      const campaignData = campaignDoc.data();
      const newAmount = (campaignData.currentAmount || 0) + amount;
      
      await updateDoc(campaignRef, {
        currentAmount: newAmount,
        updatedAt: serverTimestamp()
      });
      
      // Record contribution in contributions collection
      const contributionData = {
        campaignId,
        investorId: userId,
        amount,
        milestones: selectedMilestones || [],
        status: 'completed',
        date: serverTimestamp(),
        paymentDetails: {
          method: 'card'
        }
      };
      
      const contributionRef = await addDoc(
        collection(db, 'contributions'), 
        contributionData
      );
      
      console.log('Contribution added with ID:', contributionRef.id);
      
      // Add to user's funded campaigns
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fundedCampaigns: arrayUnion({
          campaignId,
          amount,
          date: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: contributionRef.id,
        ...contributionData
      };
    } catch (error) {
      console.error('Error processing contribution:', error);
      throw new Error(error.message || 'Failed to process contribution');
    }
  },
  
  // Track viewed campaigns for a user
  trackCampaignView: async (campaignId, userId) => {
    if (!userId) {
      console.log('No user ID provided, skipping view tracking');
      
      // For non-authenticated users, store in localStorage
      try {
        const viewedCampaigns = JSON.parse(localStorage.getItem('viewedCampaigns') || '[]');
        
        // Remove the campaign if it's already in the list
        const filteredCampaigns = viewedCampaigns.filter(id => id !== campaignId);
        
        // Add to the beginning (most recent)
        const updatedViews = [campaignId, ...filteredCampaigns];
        
        // Limit to 20 items
        const limitedViews = updatedViews.slice(0, 20);
        
        localStorage.setItem('viewedCampaigns', JSON.stringify(limitedViews));
        console.log('Stored view in localStorage:', campaignId);
      } catch (error) {
        console.error('Error storing view in localStorage:', error);
      }
      
      return;
    }
    
    try {
      console.log(`Tracking view of campaign ${campaignId} for user ${userId}`);
      
      // Get user's document
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log(`User document not found for user ${userId} - creating new user document`);
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          viewedCampaigns: [campaignId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`Created new user document and tracked view for campaign ${campaignId}`);
        return;
      }
      
      // Get existing viewed campaigns
      const userData = userDoc.data();
      const viewedCampaigns = userData.viewedCampaigns || [];
      
      // Only update if this campaign is not already at the top of the list
      if (viewedCampaigns[0] !== campaignId) {
        // Remove the campaign if it's in the list already (to avoid duplicates)
        const filteredCampaigns = viewedCampaigns.filter(id => id !== campaignId);
        
        // Add campaign to the beginning of the list (most recent)
        const updatedViews = [campaignId, ...filteredCampaigns];
        
        // Limit to 20 most recent viewed campaigns
        const limitedViews = updatedViews.slice(0, 20);
        
        // Update Firestore
        await updateDoc(userRef, {
          viewedCampaigns: limitedViews,
          updatedAt: serverTimestamp()
        });
        
        console.log(`Successfully tracked view: ${campaignId}`);
      } else {
        console.log(`Campaign ${campaignId} is already at the top of the viewed list - skipping update`);
      }
    } catch (error) {
      console.error('Error tracking campaign view:', error);
      throw error;
    }
  },

  // Toggle favorite campaign
  toggleFavoriteCampaign: async (campaignId, userId) => {
    if (!userId) throw new Error('User must be authenticated');
    
    try {
      console.log(`Toggling favorite for campaign ${campaignId} by user ${userId}`);
      
      // Get user's document
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log(`User document not found for user ${userId} - creating new user document`);
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          favoriteCampaigns: [campaignId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return true; // Now favorited
      }
      
      // Get existing favorites
      const userData = userDoc.data();
      const favoriteCampaigns = userData.favoriteCampaigns || [];
      
      // Check if already favorited
      const isFavorited = favoriteCampaigns.includes(campaignId);
      
      if (isFavorited) {
        // Remove from favorites
        await updateDoc(userRef, {
          favoriteCampaigns: arrayRemove(campaignId),
          updatedAt: serverTimestamp()
        });
        
        console.log(`Removed from favorites: ${campaignId}`);
        return false; // Not favorited anymore
      } else {
        // Add to favorites
        await updateDoc(userRef, {
          favoriteCampaigns: arrayUnion(campaignId),
          updatedAt: serverTimestamp()
        });
        
        console.log(`Added to favorites: ${campaignId}`);
        return true; // Now favorited
      }
    } catch (error) {
      console.error('Error toggling favorite campaign:', error);
      throw new Error(error.message || 'Failed to update favorites');
    }
  },
  
  // Get user's viewed campaigns
  getViewedCampaigns: async (userId) => {
    if (!userId) {
      console.log('No user ID provided, retrieving viewed campaigns from localStorage');
      // For non-authenticated users, get from localStorage
      try {
        const viewedCampaignIds = JSON.parse(localStorage.getItem('viewedCampaigns') || '[]');
        console.log(`Found ${viewedCampaignIds.length} viewed campaign IDs in localStorage`);
        
        if (viewedCampaignIds.length === 0) return [];
        
        // Fetch campaign details for each ID
        const campaigns = [];
        for (const campaignId of viewedCampaignIds) {
          try {
            const campaign = await campaignService.getCampaignById(campaignId);
            if (campaign) {
              campaigns.push(campaign);
            }
          } catch (error) {
            console.error(`Error fetching campaign ${campaignId} from localStorage view:`, error);
          }
        }
        
        return campaigns;
      } catch (error) {
        console.error('Error retrieving views from localStorage:', error);
        return [];
      }
    }
    
    try {
      console.log(`Getting viewed campaigns for user ${userId}`);
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log(`User document not found for user ${userId}`);
        return [];
      }
      
      const viewedCampaignIds = userDoc.data().viewedCampaigns || [];
      console.log(`Found ${viewedCampaignIds.length} viewed campaign IDs in Firestore`);
      
      if (viewedCampaignIds.length === 0) return [];
      
      // Fetch actual campaign data
      const campaigns = [];
      for (const campaignId of viewedCampaignIds) {
        try {
          const campaign = await campaignService.getCampaignById(campaignId);
          if (campaign) {
            campaigns.push(campaign);
          }
        } catch (error) {
          // Skip campaigns that can't be fetched
          console.error(`Error fetching viewed campaign ${campaignId}:`, error);
        }
      }
      
      return campaigns;
    } catch (error) {
      console.error('Error getting viewed campaigns:', error);
      return [];
    }
  },
  
  // Get user's favorite campaigns
  getFavoriteCampaigns: async (userId) => {
    if (!userId) return []; // Return empty array for non-authenticated users
    
    try {
      console.log(`Getting favorite campaigns for user ${userId}`);
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return [];
      
      const favoriteCampaignIds = userDoc.data().favoriteCampaigns || [];
      console.log(`Found ${favoriteCampaignIds.length} favorite campaign IDs`);
      
      // Fetch actual campaign data
      const campaigns = [];
      for (const campaignId of favoriteCampaignIds) {
        try {
          const campaign = await campaignService.getCampaignById(campaignId);
          if (campaign) {
            campaigns.push(campaign);
          }
        } catch (error) {
          // Skip campaigns that can't be fetched
          console.error(`Error fetching favorite campaign ${campaignId}:`, error);
        }
      }
      
      return campaigns;
    } catch (error) {
      console.error('Error getting favorite campaigns:', error);
      return [];
    }
  },
  
  // Get user's created campaigns (for founders)
  getCreatedCampaigns: async (userId) => {
    if (!userId) return [];
    
    try {
      console.log(`Getting created campaigns for user ${userId}`);
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        where('creator.id', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(campaignsQuery);
      const campaigns = snapshot.docs.map(processCampaignData);
      console.log(`Found ${campaigns.length} created campaigns`);
      
      return campaigns;
    } catch (error) {
      console.error('Error getting created campaigns:', error);
      return [];
    }
  },
  
  // Get user's funded campaigns (for investors)
  getFundedCampaigns: async (userId) => {
    if (!userId) return [];
    
    try {
      console.log(`Getting funded campaigns for user ${userId}`);
      
      // Get user document to check fundedCampaigns array
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists() && userDoc.data().fundedCampaigns) {
        const fundedCampaignsData = userDoc.data().fundedCampaigns;
        const campaignIds = fundedCampaignsData.map(item => item.campaignId);
        console.log(`Found ${campaignIds.length} funded campaign IDs in user document`);
        
        // Fetch actual campaign data
        const campaigns = [];
        for (const campaignId of campaignIds) {
          try {
            const campaign = await campaignService.getCampaignById(campaignId);
            if (campaign) {
              campaigns.push(campaign);
            }
          } catch (error) {
            // Skip campaigns that can't be fetched
            console.error(`Error fetching funded campaign ${campaignId}:`, error);
          }
        }
        
        return campaigns;
      }
      
      // Fallback: Check contributions collection
      console.log("No fundedCampaigns array found, checking contributions collection...");
      const contributionsQuery = query(
        collection(db, 'contributions'),
        where('investorId', '==', userId),
        where('status', '==', 'completed')
      );
      
      const contributionsSnapshot = await getDocs(contributionsQuery);
      const campaignIds = new Set(
        contributionsSnapshot.docs.map(doc => doc.data().campaignId)
      );
      console.log(`Found ${campaignIds.size} funded campaign IDs in contributions`);
      
      // Fetch the actual campaigns
      const campaigns = [];
      for (const campaignId of campaignIds) {
        try {
          const campaign = await campaignService.getCampaignById(campaignId);
          if (campaign) {
            campaigns.push(campaign);
          }
        } catch (error) {
          // Skip campaigns that can't be fetched
          console.error(`Error fetching funded campaign ${campaignId}:`, error);
        }
      }
      
      return campaigns;
    } catch (error) {
      console.error('Error getting funded campaigns:', error);
      return [];
    }
  }
};

export default campaignService;