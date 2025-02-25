import React from 'react';

const StartupCard = ({ name, category, raised, goal, image, description }) => {
  // Calculate funding progress percentage
  const progress = Math.round((raised / goal) * 100, 100);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {/* Image */}
      <div className="h-48 overflow-hidden">
        <img 
          src={image}
          alt={name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-900">{name}</h3>
          <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {category}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-green-600 rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Funding info */}
          <div className="flex justify-between items-center text-sm">
            <div>
              <div className="font-bold text-gray-900">{formatCurrency(raised)}</div>
              <div className="text-gray-500">raised</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900">{progress}%</div>
              <div className="text-gray-500">of {formatCurrency(goal)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupCard;