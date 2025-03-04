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
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// Constants for optimization
const MAX_INLINE_IMAGE_SIZE = 200 * 1024; // 200KB
const MAX_FIRESTORE_DOC_SIZE = 1000000; // 1MB limit for Firestore documents

/**
 * Utility function to compress an image
 * @param {File|Blob} imageFile - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} - Compressed image as blob
 */
const compressImage = (imageFile, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.7,
    type = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // Create image from file
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      // Release object URL
      URL.revokeObjectURL(img.src);
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = Math.round(width * (maxHeight / height));
        height = maxHeight;
      }
      
      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF'; // White background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with specified quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new file with original name but compressed data
            const newFile = new File(
              [blob], 
              imageFile.name || `compressed-image.${type.split('/')[1]}`,
              { type }
            );
            resolve(newFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        type,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image for compression'));
    };
  });
};

/**
 * Utility to create a thumbnail from an image
 * @param {File|Blob} imageFile - Original image file
 * @param {number} size - Size of thumbnail
 * @returns {Promise<Blob>} - Thumbnail as blob
 */
const createThumbnail = (imageFile, size = 300) => {
  return compressImage(imageFile, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.6,
    type: 'image/jpeg'
  });
};

/**
 * Convert image to base64 data URL
 * @param {File|Blob} imageFile - Image file to convert
 * @returns {Promise<string>} - Base64 data URL
 */
const imageToDataUrl = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
};

/**
 * Process all images in a campaign for optimal storage
 * @param {Object} campaignData - Campaign data to process
 * @returns {Promise<Object>} - Campaign data with optimized images
 */
const processCampaignImages = async (campaignData) => {
  try {
    const processedData = { ...campaignData };
    
    // Process main campaign images
    if (processedData.images && processedData.images.length > 0) {
      const optimizedImages = await Promise.all(
        processedData.images.map(async (image) => {
          if (image.file) {
            // Compress the image
            const compressedFile = await compressImage(image.file);
            
            // Generate a thumbnail
            const thumbnailFile = await createThumbnail(image.file);
            
            // Convert thumbnail to data URL
            const preview = await imageToDataUrl(thumbnailFile);
            
            return {
              ...image,
              file: compressedFile,
              preview,
              optimized: true
            };
          }
          return image;
        })
      );
      
      processedData.images = optimizedImages;
    }
    
    // Process pitch asset
    if (processedData.pitchAsset && processedData.pitchAsset.file) {
      if (processedData.pitchAsset.type === 'image') {
        // For images, create compressed version and thumbnail
        const compressedFile = await compressImage(processedData.pitchAsset.file, {
          maxWidth: 1500,
          maxHeight: 1000,
          quality: 0.8
        });
        
        const thumbnailFile = await createThumbnail(processedData.pitchAsset.file, 600);
        const preview = await imageToDataUrl(thumbnailFile);
        
        processedData.pitchAsset = {
          ...processedData.pitchAsset,
          file: compressedFile,
          preview,
          optimized: true
        };
      }
      // For videos, we keep the original file and upload to storage later
    }
    
    // Process milestone images
    if (processedData.financials && processedData.financials.milestones) {
      processedData.financials.milestones = await Promise.all(
        processedData.financials.milestones.map(async (milestone) => {
          if (milestone.image && milestone.image.file) {
            const compressedFile = await compressImage(milestone.image.file, {
              maxWidth: 800,
              maxHeight: 600,
              quality: 0.7
            });
            
            const preview = await imageToDataUrl(
              await createThumbnail(milestone.image.file, 400)
            );
            
            return {
              ...milestone,
              image: {
                ...milestone.image,
                file: compressedFile,
                preview,
                optimized: true
              }
            };
          }
          return milestone;
        })
      );
    }
    
    // Process team member images
    if (processedData.team && processedData.team.length > 0) {
      processedData.team = await Promise.all(
        processedData.team.map(async (member) => {
          if (member.image && member.image.file) {
            const compressedFile = await compressImage(member.image.file, {
              maxWidth: 300,
              maxHeight: 300,
              quality: 0.7
            });
            
            const preview = await imageToDataUrl(compressedFile);
            
            return {
              ...member,
              image: {
                ...member.image,
                file: compressedFile,
                preview,
                optimized: true
              }
            };
          }
          return member;
        })
      );
    }
    
    return processedData;
  } catch (error) {
    console.error('Error processing campaign images:', error);
    throw error;
  }
};

/**
 * Check if file should be uploaded to storage vs inline as data URL
 * @param {File|Blob} file - File to check
 * @returns {boolean} - Whether file should be uploaded to storage
 */
const shouldUploadToStorage = (file) => {
  return file && file.size > MAX_INLINE_IMAGE_SIZE;
};

/**
 * Upload a file to Firebase Storage
 * @param {File|Blob} file - File to upload
 * @param {string} path - Path in storage
 * @returns {Promise<string>} - Download URL
 */
const uploadFileToStorage = async (file, path) => {
  if (!file) return null;
  
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading file to path ${path}:`, error);
    throw error;
  }
};

/**
 * Check if campaign is too large for Firestore (1MB limit)
 * @param {Object} campaignData - Campaign data to check
 * @returns {boolean} - Whether campaign is too large
 */
const isCampaignTooLarge = (campaignData) => {
  const campaignString = JSON.stringify(campaignData);
  return new Blob([campaignString]).size > MAX_FIRESTORE_DOC_SIZE;
};

/**
 * Remove file objects from campaign data before saving to Firestore
 * @param {Object} campaignData - Campaign data to prepare
 * @returns {Object} - Campaign data without file objects
 */
const prepareCampaignForSaving = (campaignData) => {
  const preparedData = { ...campaignData };
  
  // Remove files from images
  if (preparedData.images) {
    preparedData.images = preparedData.images.map(img => {
      if (img.file) {
        const { file, ...imageWithoutFile } = img;
        return imageWithoutFile;
      }
      return img;
    });
  }
  
  // Remove files from team member images
  if (preparedData.team) {
    preparedData.team = preparedData.team.map(member => {
      if (member.image && member.image.file) {
        const { file, ...imageWithoutFile } = member.image;
        return { ...member, image: imageWithoutFile };
      }
      return member;
    });
  }
  
  // Remove files from milestone images
  if (preparedData.financials?.milestones) {
    preparedData.financials.milestones = preparedData.financials.milestones.map(milestone => {
      if (milestone.image && milestone.image.file) {
        const { file, ...imageWithoutFile } = milestone.image;
        return { ...milestone, image: imageWithoutFile };
      }
      return milestone;
    });
  }
  
  // Remove file from pitch asset
  if (preparedData.pitchAsset && preparedData.pitchAsset.file) {
    const { file, ...assetWithoutFile } = preparedData.pitchAsset;
    preparedData.pitchAsset = assetWithoutFile;
  }
  
  // Remove file from business plan
  if (preparedData.businessPlan && preparedData.businessPlan.file) {
    const { file, ...planWithoutFile } = preparedData.businessPlan;
    preparedData.businessPlan = planWithoutFile;
  }
  
  return preparedData;
};

/**
 * Convert Firestore timestamps to regular dates for consistent handling
 * @param {Object} data - Data with potential timestamps
 * @returns {Object} - Data with timestamps converted to ISO strings
 */
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

/**
 * Process campaign data from Firestore
 * @param {DocumentSnapshot} doc - Firestore document snapshot
 * @returns {Object|null} - Processed campaign data
 */
const processCampaignData = (doc) => {
  if (!doc.exists()) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    ...convertTimestamps(data)
  };
};

/**
 * Clean up localStorage to conserve space
 * @param {number} keepCount - Number of campaigns to keep
 * @returns {boolean} - Success status
 */
const cleanupLocalStorage = (keepCount = 10) => {
  try {
    // Clean campaigns
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    if (campaigns.length > keepCount) {
      // Sort by creation date (newest first)
      const sortedCampaigns = campaigns
        .filter(c => c.createdAt) // Filter campaigns with createdAt
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Merge sorted campaigns with those without createdAt (at the end)
      const campaignsWithoutDates = campaigns.filter(c => !c.createdAt);
      const campaignsToKeep = [...sortedCampaigns, ...campaignsWithoutDates].slice(0, keepCount);
      
      localStorage.setItem('campaigns', JSON.stringify(campaignsToKeep));
      console.log(`Cleaned up campaigns, kept ${campaignsToKeep.length} of ${campaigns.length}`);
    }
    
    // Clean viewed campaigns
    const viewedItems = JSON.parse(localStorage.getItem('viewedCampaigns') || '[]');
    if (viewedItems.length > 20) {
      localStorage.setItem('viewedCampaigns', JSON.stringify(viewedItems.slice(-20)));
    }
    
    // Clean favorites
    const favoriteKeys = Object.keys(localStorage).filter(key => key.includes('_favoriteCampaigns'));
    favoriteKeys.forEach(key => {
      const favorites = JSON.parse(localStorage.getItem(key) || '[]');
      if (favorites.length > 20) {
        localStorage.setItem(key, JSON.stringify(favorites.slice(-20)));
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error cleaning up localStorage:', error);
    return false;
  }
};

export const campaignService = {
  /**
   * Get all campaigns with optional filters
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Object>} - Campaigns data and total count
   */
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
      
      if (filters.status) {
        campaignsQuery = query(campaignsQuery, where('status', '==', filters.status));
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
      
      // Fallback to localStorage if Firestore fails
      try {
        const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        console.log(`Fetched ${campaigns.length} campaigns from localStorage`);
        
        // Apply any filters to localStorage campaigns
        let filteredCampaigns = [...campaigns];
        
        if (filters.category) {
          filteredCampaigns = filteredCampaigns.filter(
            c => c.category === filters.category
          );
        }
        
        if (filters.status) {
          filteredCampaigns = filteredCampaigns.filter(
            c => c.status === filters.status
          );
        }
        
        if (filters.creatorId) {
          filteredCampaigns = filteredCampaigns.filter(
            c => c.creator && c.creator.id === filters.creatorId
          );
        }
        
        return {
          data: filteredCampaigns,
          total: filteredCampaigns.length
        };
      } catch (localError) {
        console.error('Failed to fetch from localStorage:', localError);
        throw new Error('Failed to fetch campaigns');
      }
    }
  },

  /**
   * Get a single campaign by ID
   * @param {string} id - Campaign ID
   * @returns {Promise<Object>} - Campaign data
   */
  getCampaignById: async (id) => {
    try {
      console.log(`Fetching campaign with ID: ${id}`);
      const campaignRef = doc(db, 'campaigns', id);
      const campaignDoc = await getDoc(campaignRef);
      
      if (!campaignDoc.exists()) {
        console.log(`Campaign with ID ${id} not found in Firestore`);
        
        // Try localStorage as fallback
        const storedCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        const localCampaign = storedCampaigns.find(c => c.id === id);
        
        if (localCampaign) {
          console.log(`Found campaign in localStorage: ${id}`);
          return localCampaign;
        }
        
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

  /**
   * Create a new campaign
   * @param {Object} campaignData - Campaign data
   * @param {string} userId - User ID of creator
   * @returns {Promise<Object>} - Created campaign
   */
  createCampaign: async (campaignData, userId) => {
    try {
      console.log('Creating new campaign for user:', userId);
      
      // First, optimize images to reduce payload size
      const processedData = await processCampaignImages(campaignData);
      
      // Prepare server-managed fields
      const campaignToAdd = {
        ...processedData,
        currentAmount: 0,
        status: processedData.status || 'active',
        creator: {
          id: userId,
          name: processedData.creator?.name || 'Anonymous',
          avatar: processedData.creator?.avatar || null,
          totalCampaigns: 1,
          successRate: 100
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        endDate: processedData.projectDuration?.endDate || 
                 new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Try to save to Firestore first
      try {
        // Check if campaign is too large for Firestore (1MB limit)
        if (isCampaignTooLarge(campaignToAdd)) {
          throw new Error('Campaign data exceeds Firestore size limit');
        }
        
        // Process large images by uploading to Firebase Storage
        const uploadTasks = [];
        
        // Upload main campaign images if they're large
        if (campaignToAdd.images && campaignToAdd.images.length > 0) {
          for (let i = 0; i < campaignToAdd.images.length; i++) {
            const image = campaignToAdd.images[i];
            if (image.file && shouldUploadToStorage(image.file)) {
              // Upload to storage and update URL
              uploadTasks.push(
                uploadFileToStorage(image.file, 'campaign-images').then(url => {
                  campaignToAdd.images[i].url = url;
                  // Keep the smaller preview as a data URL
                })
              );
            }
          }
        }
        
        // Upload team member images if they're large
        if (campaignToAdd.team) {
          for (let i = 0; i < campaignToAdd.team.length; i++) {
            const member = campaignToAdd.team[i];
            if (member.image?.file && shouldUploadToStorage(member.image.file)) {
              uploadTasks.push(
                uploadFileToStorage(member.image.file, 'team-images').then(url => {
                  campaignToAdd.team[i].image.url = url;
                })
              );
            }
          }
        }
        
        // Upload milestone images if they're large
        if (campaignToAdd.financials?.milestones) {
          const milestones = campaignToAdd.financials.milestones;
          for (let i = 0; i < milestones.length; i++) {
            if (milestones[i].image?.file && shouldUploadToStorage(milestones[i].image.file)) {
              uploadTasks.push(
                uploadFileToStorage(milestones[i].image.file, 'milestone-images').then(url => {
                  campaignToAdd.financials.milestones[i].image.url = url;
                })
              );
            }
          }
        }
        
        // Upload pitch asset if it's large
        if (campaignToAdd.pitchAsset?.file && shouldUploadToStorage(campaignToAdd.pitchAsset.file)) {
          uploadTasks.push(
            uploadFileToStorage(
              campaignToAdd.pitchAsset.file, 
              `pitch-assets/${campaignToAdd.pitchAsset.type}`
            ).then(url => {
              campaignToAdd.pitchAsset.url = url;
            })
          );
        }
        
        // Process business plan if it exists
        if (campaignToAdd.businessPlan?.file) {
          uploadTasks.push(
            uploadFileToStorage(campaignToAdd.businessPlan.file, 'business-plans').then(url => {
              campaignToAdd.businessPlan = {
                name: campaignToAdd.businessPlan.name,
                url
              };
            })
          );
        }
        
        // Wait for all uploads to complete
        if (uploadTasks.length > 0) {
          console.log(`Uploading ${uploadTasks.length} files to Firebase Storage...`);
          await Promise.all(uploadTasks);
        }
        
        // Prepare final data by removing file objects
        const preparedData = prepareCampaignForSaving(campaignToAdd);
        
        // Add campaign to Firestore
        console.log('Saving campaign to Firestore...');
        const campaignRef = await addDoc(collection(db, 'campaigns'), {
          ...preparedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log('Campaign created with ID:', campaignRef.id);
        
        return {
          id: campaignRef.id,
          ...campaignToAdd
        };
      } catch (firestoreError) {
        console.error('Failed to save to Firestore, falling back to localStorage:', firestoreError);
        
        // Fallback to localStorage
        try {
          // Clean up localStorage to make space
          cleanupLocalStorage();
          
          // Create a campaign with a local ID
          const fallbackId = `local-${Date.now()}`;
          
          // Remove all file objects to minimize size
          const preparedData = prepareCampaignForSaving(campaignToAdd);
          
          const localCampaign = {
            ...preparedData,
            id: fallbackId
          };
          
          // Save to localStorage
          const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
          campaigns.push(localCampaign);
          localStorage.setItem('campaigns', JSON.stringify(campaigns));
          
          console.log('Campaign saved to localStorage with ID:', fallbackId);
          return localCampaign;
        } catch (localStorageError) {
          console.error('Failed to save to localStorage:', localStorageError);
          throw new Error('Failed to create campaign: Storage quota exceeded. Try reducing image sizes or using fewer images.');
        }
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  /**
   * Update an existing campaign
   * @param {string} id - Campaign ID
   * @param {Object} campaignData - Updated campaign data
   * @returns {Promise<Object>} - Updated campaign
   */
  updateCampaign: async (id, campaignData) => {
    try {
      console.log(`Updating campaign with ID: ${id}`);
      
      // First, optimize any new images
      const processedData = await processCampaignImages(campaignData);
      
      // Add updatedAt timestamp
      const dataToUpdate = {
        ...processedData,
        updatedAt: new Date().toISOString()
      };
      
      try {
        // Try to update in Firestore
        const campaignRef = doc(db, 'campaigns', id);
        
        // Process and upload new images
        const uploadTasks = [];
        
        // Upload any new images (similar logic to createCampaign)
        if (dataToUpdate.images) {
          for (let i = 0; i < dataToUpdate.images.length; i++) {
            const image = dataToUpdate.images[i];
            if (image.file && shouldUploadToStorage(image.file) && !image.url) {
              uploadTasks.push(
                uploadFileToStorage(image.file, 'campaign-images').then(url => {
                  dataToUpdate.images[i].url = url;
                })
              );
            }
          }
        }
        
        // Handle other image uploads (team, milestones, etc.) similarly
        
        // Wait for all uploads to complete
        if (uploadTasks.length > 0) {
          console.log(`Uploading ${uploadTasks.length} new files to Firebase Storage...`);
          await Promise.all(uploadTasks);
        }
        
        // Prepare final data by removing file objects
        const preparedData = prepareCampaignForSaving(dataToUpdate);
        
        // Update in Firestore
        await updateDoc(campaignRef, {
          ...preparedData,
          updatedAt: serverTimestamp()
        });
        
        console.log('Campaign successfully updated in Firestore');
        
        // Get updated campaign
        const updatedCampaign = await getDoc(campaignRef);
        return processCampaignData(updatedCampaign);
      } catch (firestoreError) {
        console.error('Failed to update in Firestore, falling back to localStorage:', firestoreError);
        
        // Fallback to localStorage
        try {
          // Clean up localStorage first
          cleanupLocalStorage();
          
          // Remove all file objects to minimize size
          const preparedData = prepareCampaignForSaving(dataToUpdate);
          
          const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
          const updatedCampaigns = campaigns.map(campaign => 
            campaign.id === id ? { ...campaign, ...preparedData } : campaign
          );
          
          localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
          console.log('Campaign updated in localStorage');
          
          // Return the updated campaign
          return updatedCampaigns.find(campaign => campaign.id === id);
        } catch (localStorageError) {
          console.error('Failed to update in localStorage:', localStorageError);
          throw new Error('Failed to update campaign: Storage quota exceeded. Try reducing image sizes or using fewer images.');
        }
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  /**
   * Delete a campaign
   * @param {string} id - Campaign ID
   * @returns {Promise<void>}
   */
  deleteCampaign: async (id) => {
    try {
      console.log(`Deleting campaign with ID: ${id}`);
      
      try {
        // Try to delete from Firestore
        const campaignRef = doc(db, 'campaigns', id);
        await deleteDoc(campaignRef);
        console.log('Campaign successfully deleted from Firestore');
      } catch (firestoreError) {
        console.error('Failed to delete from Firestore, falling back to localStorage:', firestoreError);
        
        // Fallback to localStorage
        const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        const updatedCampaigns = campaigns.filter(campaign => campaign.id !== id);
        localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
        console.log('Campaign deleted from localStorage');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  /**
   * Contribute to a campaign
   * @param {string} campaignId - Campaign ID
   * @param {number} amount - Contribution amount
   * @param {string} userId - Contributor user ID
   * @param {Array} selectedMilestones - Selected milestones
   * @returns {Promise<Object>} - Contribution details
   */
  contributeToCampaign: async (campaignId, amount, userId, selectedMilestones = []) => {
    try {
      console.log(`Processing contribution of ${amount} to campaign ${campaignId} by user ${userId}`);
      
      try {
        // Try Firestore first
        // 1. Update campaign amount
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
        
        // 2. Record contribution in contributions collection
        const contributionData = {
          campaignId,
          investorId: userId,
          amount,
          milestones: selectedMilestones || [],
          status: 'completed',
          createdAt: serverTimestamp(),
          paymentDetails: {
            method: 'direct'
          }
        };
        
        const contributionRef = await addDoc(collection(db, 'contributions'), contributionData);
        console.log('Contribution added with ID:', contributionRef.id);
        
        // 3. Add to user's funded campaigns
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, {
            fundedCampaigns: arrayUnion({
              campaignId,
              amount,
              date: serverTimestamp()
            }),
            updatedAt: serverTimestamp()
          });
        } else {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            fundedCampaigns: [{
              campaignId,
              amount,
              date: serverTimestamp()
            }],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        return {
          id: contributionRef.id,
          campaignId,
          amount,
          status: 'completed',
          milestones: selectedMilestones
        };
      } catch (firestoreError) {
        console.error('Failed to process contribution in Firestore:', firestoreError);
        
        // Fallback to localStorage
        try {
          // Update campaign amount in localStorage
          const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
          const updatedCampaigns = campaigns.map(campaign => {
            if (campaign.id === campaignId) {
              const currentAmount = Number(campaign.currentAmount || 0);
              return {
                ...campaign,
                currentAmount: currentAmount + Number(amount),
                updatedAt: new Date().toISOString()
              };
            }
            return campaign;
          });
          
          localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
          
          // Save contribution to localStorage
          const contributionId = `local-contrib-${Date.now()}`;
          const contributions = JSON.parse(localStorage.getItem(`user_${userId}_contributions`) || '[]');
          
          const newContribution = {
            id: contributionId,
            campaignId,
            amount,
            milestones: selectedMilestones,
            status: 'completed',
            date: new Date().toISOString()
          };
          
          contributions.push(newContribution);
          localStorage.setItem(`user_${userId}_contributions`, JSON.stringify(contributions));
          
          console.log('Contribution processed in localStorage');
          return newContribution;
        } catch (localStorageError) {
          console.error('Failed to process contribution in localStorage:', localStorageError);
          throw new Error('Failed to process contribution');
        }
      }
    } catch (error) {
      console.error('Error processing contribution:', error);
      throw error;
    }
  },

  /**
   * Track viewed campaigns for a user
   * @param {string} campaignId - Campaign ID
   * @param {string|null} userId - User ID (null for anonymous)
   * @returns {Promise<void>}
   */
  trackCampaignView: async (campaignId, userId) => {
    if (!campaignId) return;
    
    try {
      console.log(`Tracking view of campaign ${campaignId}${userId ? ` for user ${userId}` : ''}`);
      
      // Handle anonymous users
      if (!userId) {
        try {
          const viewedCampaigns = JSON.parse(localStorage.getItem('viewedCampaigns') || '[]');
          
          // Remove if already exists to avoid duplicates
          const filteredCampaigns = viewedCampaigns.filter(id => id !== campaignId);
          
          // Add to front (most recent)
          const updatedViews = [campaignId, ...filteredCampaigns].slice(0, 20);
          
          localStorage.setItem('viewedCampaigns', JSON.stringify(updatedViews));
          console.log('Tracked view in localStorage for anonymous user');
        } catch (error) {
          console.error('Error tracking anonymous view:', error);
        }
        return;
      }
      
      // Handle logged-in users with Firestore
      try {
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
      } catch (firestoreError) {
        console.error('Error tracking view in Firestore:', firestoreError);
        
        // Fallback to localStorage
        try {
          const storageKey = `user_${userId}_viewedCampaigns`;
          const viewedCampaigns = JSON.parse(localStorage.getItem(storageKey) || '[]');
          
          // Remove if already exists
          const filteredCampaigns = viewedCampaigns.filter(id => id !== campaignId);
          
          // Add to front (most recent)
          const updatedViews = [campaignId, ...filteredCampaigns].slice(0, 20);
          
          localStorage.setItem(storageKey, JSON.stringify(updatedViews));
          console.log(`Fallback: Tracked view in localStorage for user ${userId}`);
        } catch (error) {
          console.error('Error tracking view in localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Error tracking campaign view:', error);
    }
  },

  /**
   * Toggle favorite campaign status
   * @param {string} campaignId - Campaign ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - New favorited status
   */
  toggleFavoriteCampaign: async (campaignId, userId) => {
    if (!userId) throw new Error('User must be authenticated');
    
    try {
      console.log(`Toggling favorite for campaign ${campaignId} by user ${userId}`);
      
      try {
        // Try in Firestore
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
      } catch (firestoreError) {
        console.error('Failed to toggle favorite in Firestore:', firestoreError);
        
        // Fallback to localStorage
        try {
          const storageKey = `user_${userId}_favoriteCampaigns`;
          const favoriteCampaigns = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const isFavorited = favoriteCampaigns.includes(campaignId);
          
          if (isFavorited) {
            // Remove from favorites
            const updated = favoriteCampaigns.filter(id => id !== campaignId);
            localStorage.setItem(storageKey, JSON.stringify(updated));
            console.log(`Removed from favorites in localStorage: ${campaignId}`);
            return false;
          } else {
            // Add to favorites
            favoriteCampaigns.push(campaignId);
            localStorage.setItem(storageKey, JSON.stringify(favoriteCampaigns));
            console.log(`Added to favorites in localStorage: ${campaignId}`);
            return true;
          }
        } catch (localStorageError) {
          console.error('Failed to toggle favorite in localStorage:', localStorageError);
          throw localStorageError;
        }
      }
    } catch (error) {
      console.error('Error toggling favorite campaign:', error);
      throw new Error(error.message || 'Failed to update favorites');
    }
  },
  
  /**
   * Get user's viewed campaigns
   * @param {string|null} userId - User ID (null for anonymous)
   * @returns {Promise<Array>} - Array of viewed campaigns
   */
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
        
        // Try localStorage as fallback
        const storageKey = `user_${userId}_viewedCampaigns`;
        const localViews = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if (localViews.length === 0) return [];
        
        // Fetch campaign details for each ID
        const campaigns = [];
        for (const campaignId of localViews) {
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
  
  /**
   * Get user's favorite campaigns
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of favorite campaigns
   */
  getFavoriteCampaigns: async (userId) => {
    if (!userId) return []; // Return empty array for non-authenticated users
    
    try {
      console.log(`Getting favorite campaigns for user ${userId}`);
      
      try {
        // Try Firestore first
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.log(`User document not found for user ${userId}, checking localStorage`);
          throw new Error('User document not found');
        }
        
        const favoriteCampaignIds = userDoc.data().favoriteCampaigns || [];
        console.log(`Found ${favoriteCampaignIds.length} favorite campaign IDs in Firestore`);
        
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
      } catch (firestoreError) {
        console.error('Failed to get favorites from Firestore:', firestoreError);
        
        // Fallback to localStorage
        const storageKey = `user_${userId}_favoriteCampaigns`;
        const favoriteCampaignIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        console.log(`Found ${favoriteCampaignIds.length} favorite campaign IDs in localStorage`);
        
        if (favoriteCampaignIds.length === 0) return [];
        
        // Fetch campaign details for each ID
        const campaigns = [];
        for (const campaignId of favoriteCampaignIds) {
          try {
            const campaign = await campaignService.getCampaignById(campaignId);
            if (campaign) {
              campaigns.push(campaign);
            }
          } catch (error) {
            console.error(`Error fetching campaign ${campaignId} from localStorage favorites:`, error);
          }
        }
        
        return campaigns;
      }
    } catch (error) {
      console.error('Error getting favorite campaigns:', error);
      return [];
    }
  },
  
  /**
   * Get user's created campaigns (for founders)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of created campaigns
   */
  getCreatedCampaigns: async (userId) => {
    if (!userId) return [];
    
    try {
      console.log(`Getting created campaigns for user ${userId}`);
      
      try {
        // Try Firestore first
        const campaignsQuery = query(
          collection(db, 'campaigns'),
          where('creator.id', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(campaignsQuery);
        const campaigns = snapshot.docs.map(processCampaignData);
        console.log(`Found ${campaigns.length} created campaigns in Firestore`);
        
        return campaigns;
      } catch (firestoreError) {
        console.error('Failed to get created campaigns from Firestore:', firestoreError);
        
        // Fallback to localStorage
        const allCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
        const createdCampaigns = allCampaigns.filter(
          campaign => campaign.creator && campaign.creator.id === userId
        );
        
        console.log(`Found ${createdCampaigns.length} created campaigns in localStorage`);
        return createdCampaigns;
      }
    } catch (error) {
      console.error('Error getting created campaigns:', error);
      return [];
    }
  },
  
  /**
   * Get user's funded campaigns (for investors)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of funded campaigns
   */
  getFundedCampaigns: async (userId) => {
    if (!userId) return [];
    
    try {
      console.log(`Getting funded campaigns for user ${userId}`);
      
      try {
        // Try Firestore first
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
      } catch (firestoreError) {
        console.error('Failed to get funded campaigns from Firestore:', firestoreError);
        
        // Fallback to localStorage
        const storageKey = `user_${userId}_contributions`;
        const contributions = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if (contributions.length === 0) return [];
        
        // Get unique campaign IDs
        const campaignIds = [...new Set(contributions.map(c => c.campaignId))];
        
        // Fetch campaign details
        const campaigns = [];
        for (const campaignId of campaignIds) {
          try {
            const campaign = await campaignService.getCampaignById(campaignId);
            if (campaign) {
              campaigns.push(campaign);
            }
          } catch (error) {
            console.error(`Error fetching funded campaign ${campaignId} from localStorage:`, error);
          }
        }
        
        return campaigns;
      }
    } catch (error) {
      console.error('Error getting funded campaigns:', error);
      return [];
    }
  },
  
  /**
   * Get campaign statistics
   * @param {string} id - Campaign ID
   * @returns {Promise<Object>} - Campaign stats
   */
  getCampaignStats: async (id) => {
    try {
      console.log(`Getting stats for campaign with ID: ${id}`);
      const campaign = await campaignService.getCampaignById(id);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // Try to get contributor count from Firestore
      try {
        const contributionsQuery = query(
          collection(db, 'contributions'), 
          where('campaignId', '==', id),
          where('status', '==', 'completed')
        );
        
        const contributions = await getDocs(contributionsQuery);
        const totalContributors = new Set(
          contributions.docs.map(doc => doc.data().investorId)
        ).size;
        
        // Calculate percentage funded
        const percentageFunded = campaign.targetAmount 
          ? Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)
          : 0;
        
        // Calculate days left
        const daysLeft = campaign.endDate 
          ? Math.max(0, Math.floor((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
          : 0;
        
        return {
          totalAmount: campaign.currentAmount || 0,
          targetAmount: campaign.targetAmount || 0,
          percentageFunded,
          totalContributors,
          daysLeft,
          status: campaign.status || 'active'
        };
      } catch (error) {
        console.error('Error getting contributor stats from Firestore:', error);
        
        // Provide basic stats without detailed contributor info
        return {
          totalAmount: campaign.currentAmount || 0,
          targetAmount: campaign.targetAmount || 0,
          percentageFunded: campaign.targetAmount 
            ? Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)
            : 0,
          totalContributors: 0,
          daysLeft: campaign.endDate 
            ? Math.max(0, Math.floor((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
            : 0,
          status: campaign.status || 'active'
        };
      }
    } catch (error) {
      console.error('Error fetching campaign statistics:', error);
      throw new Error('Failed to fetch campaign statistics');
    }
  }
};

export default campaignService;