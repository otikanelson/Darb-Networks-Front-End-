import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

const RichTextEditor = ({ 
  value, 
  onChange, 
  label, 
  error, 
  required = false,
  placeholder,
  images = [],
  onImageUpload,
  onImageRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);

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
    if (files.length > 0 && onImageUpload) {
      onImageUpload(files);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Text Editor */}
      <div className="space-y-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className={`w-full px-4 py-3 rounded-lg border ${
            error ? 'border-red-500' : 'border-gray-300'
          } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
          placeholder={placeholder}
        />

        {/* Image Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-2 border-2 border-dashed rounded-lg p-4 transition-colors ${
            isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <label className="cursor-pointer flex flex-col items-center">
              <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Drag and drop images or click to upload
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onImageUpload(Array.from(e.target.files))}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.preview}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onImageRemove(index)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg 
                           opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default RichTextEditor;