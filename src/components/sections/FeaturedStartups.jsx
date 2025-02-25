// src/components/sections/FeaturedStartups.jsx
import React from 'react';
import StartupCard from '../ui/StartupCard';
import { CustomNav } from '../../hooks/CustomNavigation';

const FeaturedStartups = () => {
  const navigate = CustomNav();
  
  const startups = [
    {
      name: "EcoCharge",
      category: "Clean Tech",
      raised: 550000,
      goal: 1500000,
      image: "/src/assets/EcoVehicle.webp",
      description: "Revolutionary wireless charging technology for electric vehicles."
    },
    {
      name: "HealthAI",
      category: "Healthcare",
      raised: 320000,
      goal: 400000,
      image: "/src/assets/Aihealth.jpg",
      description: "AI-powered early disease detection and prevention platform."
    },
    {
      name: "AgroSmart",
      category: "AgTech",
      raised: 250000,
      goal: 550000,
      image: "src/assets/AgroSmart.png",
      description: "Smart farming solutions using IoT and machine learning."
    }
  ];

  return (
    <section className="relative py-24">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-green-800/90" />
        <img 
          src="/src/assets/featured-bg.png" 
          alt="Background Pattern" 
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Featured Startups
          </h2>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Discover innovative startups that are shaping the future
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {startups.map((startup, index) => (
            <StartupCard key={index} {...startup} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/Dashboard')}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white/20 
                     px-8 py-3 rounded-full transition-colors"
          >
            View All Startups
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedStartups;