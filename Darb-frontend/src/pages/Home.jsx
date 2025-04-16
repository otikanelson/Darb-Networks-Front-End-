// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import FeaturedStartups from '../components/sections/FeaturedStartups';
import FAQSection from '../components/sections/FAQSection';
import UserCampaignsSection from '../components/sections/UserCampaignsSection';


const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
      <HeroSection />
        <FeaturedStartups />
        <FeaturesSection />
        <UserCampaignsSection />  
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;