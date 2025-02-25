import React from 'react';
import { ArrowRight, Users, Target, Award, BookOpen, Mail, Phone } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const About = () => {

  const resources = [
    {
      title: "Educational Guides",
      description: "Comprehensive guides on fundraising, scaling, and investment strategies",
      icon: BookOpen
    },
    {
      title: "Investor Network",
      description: "Connect with verified investors aligned with your industry",
      icon: Users
    },
    {
      title: "Success Stories",
      description: "Learn from startups that achieved their funding goals",
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-700 to-green-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-700/90" />
        </div>
        <div className="relative px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Transforming Startup Funding
            </h1>
            <p className="mt-6 text-lg leading-8 text-green-100">
              We're revolutionizing how startups access capital through our innovative P2P lending platform.
              Join thousands of successful ventures that have found their perfect funding match.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-green-50 p-8 rounded-xl">
            <Target className="h-12 w-12 text-green-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To democratize startup funding by creating a transparent, accessible, and efficient platform
              that connects visionary entrepreneurs with forward-thinking investors. We break down traditional
              barriers to ensure brilliant ideas receive the support they deserve, regardless of background
              or location.
            </p>
          </div>
          <div className="bg-green-50 p-8 rounded-xl">
            <Award className="h-12 w-12 text-green-700 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the world's leading P2P lending platform for startups, fostering innovation
              and economic growth across all sectors. We're building a future where access to funding
              is determined by merit and potential, not connections or location.
            </p>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Resources for Success</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to make informed decisions and achieve your funding goals
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <resource.icon className="h-8 w-8 text-green-700 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600">{resource.description}</p>
                <button className="mt-4 flex items-center text-green-700 hover:text-green-800">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
          <p className="mt-4 text-lg text-gray-600">
            Our team is here to help you succeed
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Mail className="h-8 w-8 text-green-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600 mb-4">For general inquiries:</p>
            <a href="mailto:info@example.com" className="text-green-700 hover:text-green-800">
              info@example.com
            </a>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Phone className="h-8 w-8 text-green-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">Support available 24/7:</p>
            <a href="tel:+15551234567" className="text-green-700 hover:text-green-800">
              +1 (555) 123-4567
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;