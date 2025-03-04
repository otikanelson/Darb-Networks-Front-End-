// src/components/ui/StorageChecker.jsx
import React, { useState, useEffect } from 'react';
import { HardDrive, AlertTriangle, Trash2 } from 'lucide-react';
import { checkStorageSpace, performFullCleanup, formatBytes } from '../../utils/storageUtils';

const StorageChecker = ({ onCritical, onCleanup }) => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [cleanupInProgress, setCleanupInProgress] = useState(false);
  
  // Check storage on mount and periodically
  useEffect(() => {
    // Initial check
    checkStorage();
    
    // Set up periodic checking
    const checkInterval = setInterval(checkStorage, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }, []);
  
  const checkStorage = () => {
    const storageStatus = checkStorageSpace();
    setStorageInfo(storageStatus);
    
    // Notify parent if storage is critical
    if (storageStatus.isCritical && onCritical) {
      onCritical(storageStatus);
    }
  };
  
  const handleCleanup = async () => {
    setCleanupInProgress(true);
    try {
      // Perform storage cleanup
      const results = await performFullCleanup();
      
      // Re-check storage
      checkStorage();
      
      // Notify parent of cleanup
      if (onCleanup) {
        onCleanup(results);
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      setCleanupInProgress(false);
    }
  };
  
  // Don't show anything if storage usage is normal
  if (!storageInfo || (!storageInfo.isNearLimit && !storageInfo.isCritical)) {
    return null;
  }
  
  return (
    <div className={`p-4 rounded-lg mb-4 ${
      storageInfo.isCritical ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {storageInfo.isCritical ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <HardDrive className="h-5 w-5 text-yellow-500" />
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            storageInfo.isCritical ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {storageInfo.isCritical 
              ? 'Storage nearly full!' 
              : 'Storage usage is high'
            }
          </h3>
          
          <div className="mt-2 text-sm">
            <p className={storageInfo.isCritical ? 'text-red-700' : 'text-yellow-700'}>
              {storageInfo.bytesFormatted} used ({storageInfo.percentUsed}% of available storage)
            </p>
            
            {storageInfo.isCritical && (
              <p className="mt-1 text-red-700">
                You may not be able to create new campaigns without freeing up space.
              </p>
            )}
          </div>
          
          {/* Storage Details */}
          {showDetails && (
            <div className="mt-3 text-xs border-t border-gray-200 pt-3">
              <h4 className="font-medium mb-1">Largest stored items:</h4>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {storageInfo.details.slice(0, 5).map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="truncate max-w-[200px]">{item.key}</span>
                    <span>{item.sizeFormatted}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleCleanup}
              disabled={cleanupInProgress}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
                storageInfo.isCritical 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              } disabled:opacity-50`}
            >
              {cleanupInProgress ? (
                <>
                  <div className="animate-spin h-3 w-3 mr-1 border border-current border-t-transparent rounded-full" />
                  Cleaning...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Free up space
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs underline"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageChecker;