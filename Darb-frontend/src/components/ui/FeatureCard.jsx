import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="p-6 bg-white rounded-lg">
      {/* Icon/Emoji container */}
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;