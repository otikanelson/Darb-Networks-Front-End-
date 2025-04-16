// src/services/LocalStorageService.js
/**
 * A service to handle all localStorage operations
 * This will serve as a replacement for Firebase until MySQL integration
 */

// Collection names - similar to Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  CAMPAIGNS: 'campaigns',
  PAYMENTS: 'payments',
  CONTRIBUTIONS: 'contributions',
};

/**
 * Initialize the local storage with default data
 */
export const initializeLocalStorage = () => {
  // Only initialize if not already initialized
  if (!localStorage.getItem('storageInitialized')) {
    // Initialize collections
    for (const collection of Object.values(COLLECTIONS)) {
      if (!localStorage.getItem(collection)) {
        localStorage.setItem(collection, JSON.stringify([]));
      }
    }

    // Initialize current user
    if (!localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', null);
    }

    // Flag that storage has been initialized
    localStorage.setItem('storageInitialized', 'true');
    
    console.log('Local storage initialized');
  }
};

/**
 * Get all documents from a collection
 * @param {string} collection - The collection name
 * @returns {Array} - Array of documents
 */
export const getAll = (collection) => {
  const data = localStorage.getItem(collection);
  return data ? JSON.parse(data) : [];
};

/**
 * Get a document by ID from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The document ID
 * @returns {Object|null} - The document or null if not found
 */
export const getById = (collection, id) => {
  const items = getAll(collection);
  return items.find(item => item.id === id) || null;
};

/**
 * Add a document to a collection
 * @param {string} collection - The collection name
 * @param {Object} data - The document data
 * @returns {Object} - The added document with ID
 */
export const add = (collection, data) => {
  const items = getAll(collection);
  const id = `${collection}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newItem = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  items.push(newItem);
  localStorage.setItem(collection, JSON.stringify(items));
  
  return newItem;
};

/**
 * Update a document in a collection
 * @param {string} collection - The collection name
 * @param {string} id - The document ID
 * @param {Object} data - The updated data
 * @returns {Object|null} - The updated document or null if not found
 */
export const update = (collection, id, data) => {
  const items = getAll(collection);
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) return null;
  
  const updatedItem = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  items[index] = updatedItem;
  localStorage.setItem(collection, JSON.stringify(items));
  
  return updatedItem;
};

/**
 * Delete a document from a collection
 * @param {string} collection - The collection name
 * @param {string} id - The document ID
 * @returns {boolean} - True if deleted, false if not found
 */
export const remove = (collection, id) => {
  const items = getAll(collection);
  const filtered = items.filter(item => item.id !== id);
  
  if (filtered.length === items.length) return false;
  
  localStorage.setItem(collection, JSON.stringify(filtered));
  return true;
};

/**
 * Query documents in a collection based on conditions
 * @param {string} collection - The collection name
 * @param {Object} conditions - The conditions to match
 * @returns {Array} - Array of matching documents
 */
export const query = (collection, conditions = {}) => {
  const items = getAll(collection);
  
  return items.filter(item => {
    for (const [key, value] of Object.entries(conditions)) {
      // Handle nested properties with dot notation
      if (key.includes('.')) {
        const parts = key.split('.');
        let nestedValue = item;
        
        for (const part of parts) {
          if (nestedValue === undefined || nestedValue === null) return false;
          nestedValue = nestedValue[part];
        }
        
        if (nestedValue !== value) return false;
      } 
      // Handle regular properties
      else if (item[key] !== value) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Set the current user
 * @param {Object|null} user - The user object or null to logout
 */
export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', user ? JSON.stringify(user) : null);
};

/**
 * Get the current user
 * @returns {Object|null} - The current user or null if not logged in
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user && user !== 'null' ? JSON.parse(user) : null;
};

/**
 * Storage utility for handling file-like objects in localStorage
 */
export const storageUtils = {
  /**
   * Store a file (as base64 string) in localStorage
   * @param {File} file - The file to store
   * @param {string} path - The storage path
   * @returns {Promise<string>} - The stored file URL
   */
  uploadFile: (file, path) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const base64String = reader.result;
          const fileId = `${path}/${Date.now()}_${file.name}`;
          
          // Store the file in localStorage
          localStorage.setItem(fileId, base64String);
          
          // Return the "URL" (actually the storage key)
          resolve(fileId);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      // Read the file as Data URL (base64)
      reader.readAsDataURL(file);
    });
  },
  
  /**
   * Get a file from localStorage
   * @param {string} url - The file URL (localStorage key)
   * @returns {string|null} - The file data URL or null if not found
   */
  getFileUrl: (url) => {
    return localStorage.getItem(url);
  },
  
  /**
   * Delete a file from localStorage
   * @param {string} url - The file URL (localStorage key)
   * @returns {boolean} - True if deleted, false if not found
   */
  deleteFile: (url) => {
    if (!localStorage.getItem(url)) return false;
    
    localStorage.removeItem(url);
    return true;
  }
};

export default {
  initializeLocalStorage,
  getAll,
  getById,
  add,
  update,
  remove,
  query,
  setCurrentUser,
  getCurrentUser,
  storageUtils,
  COLLECTIONS
};