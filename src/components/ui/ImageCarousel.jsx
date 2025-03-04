// src/components/ui/ImageCarousel.jsx - Updated with CustomVideoPlayer
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer'; // Import the new component

const ImageCarousel = ({ pitchAsset = null, mainImages = [], milestoneImages = [] }) => {
  // Combine all images while keeping track of their source
  const processMedia = () => {
    const processed = [];
    
    // Process pitch asset if it exists
    if (pitchAsset) {
      processed.push({
        source: 'pitch',
        type: pitchAsset.type || 'image',
        preview: pitchAsset.preview || pitchAsset.url || ''
      });
    }
    
    // Process main images
    if (mainImages && mainImages.length > 0) {
      mainImages.forEach(img => {
        if (typeof img === 'string') {
          processed.push({ source: 'main', type: 'image', preview: img });
        } else {
          processed.push({
            source: 'main',
            type: 'image',
            preview: img.preview || img.url || ''
          });
        }
      });
    }
    
    // Process milestone images
    if (milestoneImages && milestoneImages.length > 0) {
      milestoneImages.forEach(img => {
        if (typeof img === 'string') {
          processed.push({ source: 'milestone', type: 'image', preview: img });
        } else {
          processed.push({
            source: 'milestone',
            type: 'image',
            preview: img.preview || img.url || ''
          });
        }
      });
    }
    
    return processed;
  };

  const allMedia = processMedia();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Reset index when media changes
  useEffect(() => {
    setCurrentMediaIndex(0);
    setIsVideoPlaying(false);
  }, [pitchAsset, mainImages, milestoneImages]);

  if (allMedia.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-900">No media available</p>
      </div>
    );
  }

  const nextMedia = () => {
    if (isVideoPlaying) return; // Don't change media while video is playing
    setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
  };

  const prevMedia = () => {
    if (isVideoPlaying) return; // Don't change media while video is playing
    setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const renderMediaDisplay = () => {
    const currentMedia = allMedia[currentMediaIndex];
    
    if (!currentMedia || !currentMedia.preview) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Media not available</p>
        </div>
      );
    }

    if (currentMedia.type === 'video') {
      return (
        <CustomVideoPlayer
          src={currentMedia.preview}
          posterImage={null} // You can add a poster image if you have one
          className="w-full h-full"
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
        />
      );
    }

    // For images
    return (
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={currentMedia.preview}
          alt={`Project media ${currentMediaIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            console.error("Image failed to load:", currentMedia.preview);
            e.target.src = '/placeholder-image.jpg';
          }}
        />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Main Media Display */}
      <div className="flex-1 rounded-lg relative overflow-hidden mb-4">
        {/* Media Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          {renderMediaDisplay()}
        </div>

        {/* Navigation Arrows - Only show if video is not playing */}
        {allMedia.length > 1 && !isVideoPlaying && (
          <>
            <button
              onClick={prevMedia}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full 
                        bg-black bg-opacity-50 text-white hover:bg-opacity-75 
                        transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full 
                        bg-black bg-opacity-50 text-white hover:bg-opacity-75 
                        transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Media Counter - Only show if video is not playing */}
        {!isVideoPlaying && (
          <div className="absolute bottom-4 right-4 px-3 py-1 
                          bg-black bg-opacity-50 rounded-full text-white text-sm font-medium z-10">
            {currentMediaIndex + 1} / {allMedia.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto py-2 px-2 h-24 bg-gray-200 rounded-lg">
        {allMedia.map((media, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isVideoPlaying) {
                setCurrentMediaIndex(index);
              }
            }}
            className={`
              relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden 
              ${currentMediaIndex === index ? 'ring-2 ring-green-500' : 'opacity-70 hover:opacity-100'}
              ${isVideoPlaying ? 'cursor-not-allowed' : 'cursor-pointer'}
              transition-all duration-200
            `}
          >
            {media.type === 'video' ? (
              <div className="relative w-full h-full">
                <img 
                  src={media.preview} 
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-1 px-2">
                  <span className="text-white text-xs">Video</span>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={media.preview}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-1 px-2">
                  <span className="text-white text-xs">
                    {media.source === 'pitch' ? 'Pitch' : 
                     media.source === 'main' ? 'Main' : 'Milestone'}
                  </span>
                </div>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;