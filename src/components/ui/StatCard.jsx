import React from 'react';

const StatCard = ({ value, change, comparison }) => {
  const getIcon = () => {
    switch (comparison.toLowerCase()) {
      case 'total funded':
        return (
          <svg viewBox="0 0 48 48" className="h-12 w-12">
            <circle cx="24" cy="24" r="20" fill="#E1F5E6" />
            <path
              d="M24 12v24M17 20l7-8 7 8M16 30h16"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 36c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12z"
              stroke="#10B981"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      case 'startups funded':
        return (
          <svg viewBox="0 0 48 48" className="h-12 w-12">
            <circle cx="24" cy="24" r="20" fill="#EEF2FF" />
            <path
              d="M16 24h16M16 18h16M16 30h10"
              stroke="#6366F1"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="14"
              y="12"
              width="20"
              height="24"
              rx="2"
              stroke="#6366F1"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      case 'active investors':
        return (
          <svg viewBox="0 0 48 48" className="h-12 w-12">
            <circle cx="24" cy="24" r="20" fill="#FEF3F2" />
            <path
              d="M32 28c0-4.418-3.582-8-8-8s-8 3.582-8 8"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="24"
              cy="16"
              r="4"
              stroke="#EF4444"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M24 36c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12z"
              stroke="#EF4444"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      case 'success rate':
        return (
          <svg viewBox="0 0 48 48" className="h-12 w-12">
            <circle cx="24" cy="24" r="20" fill="#FEF9C3" />
            <path
              d="M16 24l6 6 12-12"
              stroke="#CA8A04"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M24 36c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12z"
              stroke="#CA8A04"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
          <div className="flex items-center space-x-1">
            <span className="text-green-600 font-medium">{change}</span>
            <span className="text-gray-500">{comparison}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatCard;