// src/components/steps/MediaStep.jsx
import React, { useState, useCallback } from 'react';
import { Upload, X, Camera, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

const MediaStep = ({ formData, setFormData, onNext, onPrev }) => {
  const [images, setImages] = useState(formData.images || []);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    processImageFiles(files);
  }, []);

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
    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
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
        images
      }));
      onNext();
    }
  };

  return (
    <div className="space-y-8">
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
              ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'}
              ${errors.images ? 'border-red-300' : ''}
              transition-colors`}
          >
            <div className="space-y-2 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500">
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
                  <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500">
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

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 
                   transition-colors flex items-center space-x-2"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                   transition-colors flex items-center space-x-2"
        >
          <span>Next Step</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MediaStep;