import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ value, change, comparison }) => {
  // Determine if change is positive or negative
  const isPositive = change && change.startsWith('+');
  
  // Function to create unique visual elements based on card type
  const renderVisual = () => {
    switch (comparison.toLowerCase()) {
      case 'total funded':
        return (
          <div className="relative h-16 w-full mb-4">
            <div className="absolute bottom-0 left-0 w-full h-12 bg-purple-200 rounded-md">
              <div 
                className="h-full bg-purple-600 rounded-md" 
                style={{ width: '70%' }}
              />
            </div>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-2 left-[70%] w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold"
            >
              ${value.replace('$', '').replace('M+', '')}M
            </motion.div>
          </div>
        );
      
      case 'startups funded':
        return (
          <div className="grid grid-cols-5 gap-1 mb-4">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={`h-6 w-6 rounded-md ${i < 7 ? 'bg-green-700' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        );
      
      case 'active investors':
        return (
          <div className="relative h-16 mb-4">
            <div className="flex justify-between">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: [8, 16, 24, 16, 32][i % 5] }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="w-6 bg-green-700 rounded-t-md"
                />
              ))}
            </div>
          </div>
        );
      
      case 'success rate':
        return (
          <div className="relative h-16 mb-4">
            <svg viewBox="0 0 100 100" className="h-16 w-full">
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#8E24AA"
                strokeWidth="8"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 * (1 - parseInt(value) / 100) }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text
                x="50"
                y="55"
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
                fill="#111827"
              >
                {value}
              </text>
            </svg>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.2 }}
      className="bg-white p-6 rounded-lg shadow-xl transition-all duration-300"
    >
      {renderVisual()}
      
      <div className="flex justify-between items-end">
        <div>
          <div className="text-4xl font-bold text-gray-900">{value}</div>
          <div className="flex items-center space-x-1 mt-1">
            <span className={`font-medium ${isPositive ? 'text-green-700' : 'text-green-600'}`}>
              {change}
            </span>
            <span className="text-gray-500">{comparison}</span>
          </div>
        </div>
        
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          comparison.toLowerCase() === 'total funded' ? 'bg-purple-100 text-purple-600' :
          comparison.toLowerCase() === 'startups funded' ? 'bg-green-100 text-green-700' :
          comparison.toLowerCase() === 'active investors' ? 'bg-green-100 text-green-700' : 
          'bg-purple-100 text-purple-700'
        }`}>
          {comparison.toLowerCase() === 'total funded' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {comparison.toLowerCase() === 'startups funded' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )}
          {comparison.toLowerCase() === 'active investors' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )}
          {comparison.toLowerCase() === 'success rate' && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;