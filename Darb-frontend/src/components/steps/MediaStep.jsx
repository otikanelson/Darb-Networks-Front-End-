// src/components/steps/MediaStep.jsx
import React, { useState, useCallback } from 'react';
import { Upload, X, Camera, FileText, Video } from 'lucide-react';

const MediaStep = ({ formData, setFormData, onNext, onPrev, newItemRef, setGlobalError, bottomRef }) => {
  const [images, setImages] = useState(formData.images || []);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [pitchAssetType, setPitchAssetType] = useState(formData.pitchAsset?.type || 'image');
  const [pitchAsset, setPitchAsset] = useState(formData.pitchAsset || null);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    processImageFiles(files);
  }, []);

  const handlePitchAssetUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    if (pitchAssetType === 'image' && !file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        pitchAsset: 'Please upload an image file'
      }));
      return;
    }
    
    if (pitchAssetType === 'video' && !file.type.startsWith('video/')) {
      setErrors(prev => ({
        ...prev,
        pitchAsset: 'Please upload a video file'
      }));
      return;
    }
    
    // Check file size
    const maxSize = pitchAssetType === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        pitchAsset: `${pitchAssetType === 'image' ? 'Image' : 'Video'} size should not exceed ${pitchAssetType === 'image' ? '5MB' : '50MB'}`
      }));
      return;
    }
    
    // Clear any previous errors
    if (errors.pitchAsset) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.pitchAsset;
        return newErrors;
      });
    }
    
    // Process the file
    const reader = new FileReader();
    reader.onloadend = () => {
      setPitchAsset({
        file,
        preview: reader.result,
        type: pitchAssetType,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const processImageFiles = (files) => {
    // Limit to 5 images
    const remainingSlots = 5 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          images: 'Image size should not exceed 5MB'
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          file,
          preview: reader.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    processImageFiles(files);
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const removePitchAsset = () => {
    setPitchAsset(null);
  };

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors(prev => ({
          ...prev,
          document: 'Document size should not exceed 10MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        businessPlan: {
          file,
          name: file.name
        }
      }));
    }
  };

  const validateMediaStep = () => {
    const newErrors = {};
    
    // Campaign images validation
    if (images.length === 0) {
      newErrors.images = 'At least one campaign image is required';
    }
    
    // Pitch asset validation
    if (!pitchAsset) {
      newErrors.pitchAsset = 'A pitch asset (image or video) is required';
    }
    
    // Business plan validation
    if (!formData.businessPlan) {
      newErrors.document = 'Business plan document is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateMediaStep()) {
      setFormData(prev => ({
        ...prev,
        images,
        pitchAsset
      }));
      onNext();
    }
  };

  const handlePitchAssetTypeChange = (type) => {
    setPitchAssetType(type);
    // Reset the pitch asset when changing types
    if (pitchAsset && pitchAsset.type !== type) {
      setPitchAsset(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pitch Asset */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Pitch Asset</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload an image or video that will appear at the top of your campaign page
          </p>
        </div>
        
        {/* Toggle between video and image */}
        <div className="flex border border-gray-300 rounded-md w-64 overflow-hidden">
          <button
            type="button"
            onClick={() => handlePitchAssetTypeChange('image')}
            className={`flex-1 py-2 text-sm font-medium ${
              pitchAssetType === 'image'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            IMAGE
          </button>
          <button
            type="button"
            onClick={() => handlePitchAssetTypeChange('video')}
            className={`flex-1 py-2 text-sm font-medium ${
              pitchAssetType === 'video'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            VIDEO
          </button>
        </div>

        {/* Pitch Asset Preview */}
        {pitchAsset ? (
          <div className="relative">
            {pitchAssetType === 'image' ? (
              <img
                src={pitchAsset.preview}
                alt="Pitch asset"
                className="w-full h-80 object-contain rounded-lg border border-gray-300"
              />
            ) : (
              <video
                src={pitchAsset.preview}
                controls
                className="w-full h-80 rounded-lg border border-gray-300"
              />
            )}
            <button
              onClick={removePitchAsset}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg"
            >
              <X className="h-5 w-5 text-gray-500 hover:text-red-500" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg">
            <div className="space-y-2 text-center">
              {pitchAssetType === 'image' ? (
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
              ) : (
                <Video className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-green-700 hover:text-purple-500">
                  <span>Upload {pitchAssetType}</span>
                  <input
                    type="file"
                    accept={pitchAssetType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handlePitchAssetUpload}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                {pitchAssetType === 'image' 
                  ? 'PNG, JPG up to 5MB (695 x 460 recommended)' 
                  : 'MP4, MOV up to 50MB'}
              </p>
            </div>
          </div>
        )}
        
        {errors.pitchAsset && (
          <p className="mt-2 text-sm text-red-500">{errors.pitchAsset}</p>
        )}
      </div>

      {/* Campaign Images */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Campaign Images</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add up to 5 high-quality images to showcase your campaign
            </p>
          </div>
          <span className="text-sm text-gray-500">
            {images.length}/5 images
          </span>
        </div>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt="Campaign preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg 
                           opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Image Upload Area */}
        {images.length < 5 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg
              ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}
              ${errors.images ? 'border-red-300' : ''}
              transition-colors`}
          >
            <div className="space-y-2 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-green-700 hover:text-purple-500">
                  <span>Upload images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG up to 5MB
              </p>
            </div>
          </div>
        )}
        
        {errors.images && (
          <p className="mt-2 text-sm text-red-500">{errors.images}</p>
        )}
      </div>

      {/* Business Plan Upload */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Business Plan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload your business plan document
          </p>
        </div>

        <div className="mt-2">
          {formData.businessPlan ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formData.businessPlan.name}
                </span>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, businessPlan: null }))}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg">
              <div className="space-y-2 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-green-700 hover:text-purple-500">
                    <span>Upload business plan</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleDocumentUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PDF or Word document up to 10MB
                </p>
              </div>
            </div>
          )}
          {errors.document && (
            <p className="mt-2 text-sm text-red-500">{errors.document}</p>
          )}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm 
                  font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm 
                  font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MediaStep;