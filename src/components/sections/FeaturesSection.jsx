import React from 'react';
import FeatureCard from '../ui/FeatureCard';

const FeaturesSection = () => {
  const features = [
    {
      emoji: "💡",
      title: "Launch Your Startup",
      description: "Create compelling campaign pages to showcase your innovative ideas and attract potential investors."
    },
    {
      emoji: "🤝",
      title: "Connect with Investors",
      description: "Get matched with verified investors who align with your industry and funding requirements."
    },
    {
      emoji: "📊",
      title: "Track Progress",
      description: "Monitor your fundraising goals, investor engagement, and campaign metrics in real-time."
    },
    {
      emoji: "🔒",
      title: "Secure Transactions",
      description: "Benefit from our secure payment system and automated legal documentation process."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-sans text-gray-900 mb-4">
            Everything you need to fund your startup
          </h2>
          <p className="text-xl text-gray-600 font-inter max-w-2xl mx-auto">
            From campaign creation to successful funding, we provide all the tools you need to bring your vision to life
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.emoji}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;