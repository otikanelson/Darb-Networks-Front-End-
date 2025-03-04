import React, { useState } from 'react';
import { Image as ImageIcon, X, Bold, Italic, Underline, Link2, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

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
  const [currentFormat, setCurrentFormat] = useState({
    bold: false,
    italic: false,
    underline: false
  });

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

  const applyFormat = (format) => {
    // In a real implementation, this would modify the text with formatting
    // Here we just toggle the UI state
    setCurrentFormat(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Text Editor with Word-like toolbar */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center border-b border-gray-300 bg-gray-50 p-2 space-x-1">
          <button 
            type="button" 
            onClick={() => applyFormat('bold')}
            className={`p-1 rounded ${currentFormat.bold ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          >
            <Bold size={16} />
          </button>
          <button 
            type="button" 
            onClick={() => applyFormat('italic')}
            className={`p-1 rounded ${currentFormat.italic ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          >
            <Italic size={16} />
          </button>
          <button 
            type="button" 
            onClick={() => applyFormat('underline')}
            className={`p-1 rounded ${currentFormat.underline ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          >
            <Underline size={16} />
          </button>
          
          <div className="h-4 border-l border-gray-300 mx-1"></div>
          
          <select 
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
            defaultValue="Format"
          >
            <option disabled>Format</option>
            <option>Paragraph</option>
            <option>Heading 1</option>
            <option>Heading 2</option>
            <option>Heading 3</option>
          </select>
          
          <div className="h-4 border-l border-gray-300 mx-1"></div>
          
          <button type="button" className="p-1 rounded hover:bg-gray-200">
            <Link2 size={16} />
          </button>
          <button type="button" className="p-1 rounded hover:bg-gray-200">
            <List size={16} />
          </button>
          <button type="button" className="p-1 rounded hover:bg-gray-200">
            <ListOrdered size={16} />
          </button>
          
          <div className="h-4 border-l border-gray-300 mx-1"></div>
          
          <button type="button" className="p-1 rounded hover:bg-gray-200">
            <AlignLeft size={16} />
          </button>
          <button type="button" className="p-1 rounded hover:bg-gray-200">
            <AlignCenter size={16} />
          </button>
          <button type="button" className="p-1 rounded hover:bg-gray-200">
            <AlignRight size={16} />
          </button>
          
          <div className="h-4 border-l border-gray-300 mx-1"></div>
          
          <button 
            type="button" 
            className="p-1 rounded hover:bg-gray-200 flex items-center"
            onClick={() => document.getElementById(`${label}-image-upload`).click()}
          >
            <ImageIcon size={16} />
            <span className="ml-1 text-sm">Insert Image</span>
          </button>
        </div>
        
        {/* Content Area */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          className={`w-full px-4 py-3 ${
            error ? 'border-red-500' : 'border-none'
          } focus:ring-0 focus:outline-none`}
          placeholder={placeholder}
        />
        
        {/* Hidden file input for image upload */}
        <input
          id={`${label}-image-upload`}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => onImageUpload(Array.from(e.target.files))}
          className="hidden"
        />
      </div>

      {/* Alternative Image Upload Area (Drag & Drop) */}
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

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default RichTextEditor;