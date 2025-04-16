// src/components/ui/DraftCampaignItem.jsx
import React from 'react';
import { Calendar, PenLine, Trash2, Send, User, Tag, MapPin } from 'lucide-react';

const DraftCampaignItem = ({ draft, onEdit, onPublish, onDelete }) => {

  const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Simple relative time calculation
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffDays > 0) {
      return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
    } else if (diffHr > 0) {
      return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else {
      return 'just now';
    }
  } catch (error) {
    return 'Invalid date';
  }
};

  // Generate a preview image or placeholder
  const getImageSrc = () => {
    if (draft.images && draft.images.length > 0) {
      return draft.images[0].url || draft.images[0].preview;
    }
    return '/placeholder-image.jpg';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-32 overflow-hidden bg-gray-200">
          <img 
            src={getImageSrc()} 
            alt={draft.title || 'Draft campaign'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>
        
        <div className="flex flex-col flex-grow p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                {draft.title || 'Untitled Draft'}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                {draft.category && (
                  <div className="flex items-center">
                    <Tag className="h-3.5 w-3.5 mr-1" />
                    <span>{draft.category}</span>
                  </div>
                )}
                
                {draft.location && (
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{draft.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium rounded-md">
              DRAFT
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {draft.description || 'No description yet. Click edit to complete your draft campaign.'}
          </p>
          
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Updated {formatDate(draft.updatedAt)}</span>
              </div>
              
              {draft.creator && (
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" />
                  <span>{draft.creator.name || 'You'}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(draft.id);
                }}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                title="Edit Draft"
              >
                <PenLine className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPublish(draft.id);
                }}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                title="Publish Campaign"
              >
                <Send className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(draft.id);
                }}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                title="Delete Draft"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Indicators */}
      {draft.financials?.targetAmount && (
        <div className="px-4 pb-3">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: '25%' }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Draft completion: 25%</span>
            <span>Target: {new Intl.NumberFormat('en-US', {
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(draft.financials.targetAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftCampaignItem;