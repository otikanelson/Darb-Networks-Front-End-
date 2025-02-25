import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = ({ mainImages = [], milestoneImages = [] }) => {
  // Combine all images while keeping track of their source
  const allImages = [
    ...mainImages.map(img => ({ ...img, source: 'main' })),
    ...milestoneImages.map(img => ({ ...img, source: 'milestone' }))
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Main Image Display */}
      <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={allImages[currentImageIndex].preview}
            alt={`Project image ${currentImageIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 
                       text-white hover:bg-black/75 transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 
                       text-white hover:bg-black/75 transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute h-7 w-18 bottom-4 right-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
          {currentImageIndex + 1} / {allImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-2 h-24">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden 
                     ${currentImageIndex === index ? 'ring-2 ring-green-500' : 'opacity-70 hover:opacity-100'}
                     transition-all duration-200`}
          >
            <img
              src={image.preview}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Badge to indicate image source */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 px-2">
              <span className="text-white text-xs">
                {image.source === 'main' ? 'Main' : 'Milestone'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;