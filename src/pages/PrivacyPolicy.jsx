import React from 'react';
import { Shield, Users, Share2, Key, Lock, Mail } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PrivacyPolicy = () => {
  const sections = [
    {
      id: 'collection',
      icon: Users,
      title: '1. Information We Collect',
      content: [
        'We collect information that you provide directly to us, including when you:',
        ['Create an account', 'Start a campaign', 'Make an investment', 'Contact us']
      ]
    },
    {
      id: 'usage',
      icon: Shield,
      title: '2. How We Use Your Information',
      content: [
        'We use the information we collect to:',
        ['Provide and maintain our services', 'Process your transactions', 'Send you updates and marketing communications', 'Improve our platform']
      ]
    },
    {
      id: 'sharing',
      icon: Share2,
      title: '3. Information Sharing',
      content: [
        'We may share your information with:',
        ['Service providers', 'Legal authorities when required', 'Other users as needed for platform functionality']
      ]
    },
    {
      id: 'rights',
      icon: Key,
      title: '4. Your Rights',
      content: [
        'You have the right to:',
        ['Access your personal information', 'Correct inaccurate data', 'Request deletion of your data', 'Opt out of marketing communications']
      ]
    },
    {
      id: 'security',
      icon: Lock,
      title: '5. Security',
      content: [
        'We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.'
      ]
    },
    {
      id: 'contact',
      icon: Mail,
      title: '6. Contact Us',
      content: [
        'If you have any questions about this Privacy Policy, please contact us at:',
        ['Email: privacy@example.com', 'Phone: +1 (555) 123-4567', 'Address: 123 Privacy Street, Security City, 12345']
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-4 text-gray-600">Last updated: February 14, 2025</p>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 overflow-x-auto pb-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                {section.title.split('.')[1]}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-16">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="bg-white rounded-xl shadow-sm p-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <section.icon className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              
              {section.content.map((item, index) => (
                typeof item === 'string' ? (
                  <p key={index} className="text-gray-600 mb-4">
                    {item}
                  </p>
                ) : (
                  <ul key={index} className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                    {item.map((listItem, listIndex) => (
                      <li key={listIndex}>{listItem}</li>
                    ))}
                  </ul>
                )
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Back to Top Button */}
      <div className="fixed bottom-8 right-8">
        <a
          href="#"
          className="bg-green-600 text-white rounded-full p-3 shadow-lg hover:bg-green-700 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </a>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;