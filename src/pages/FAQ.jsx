import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { CustomNav } from '../hooks/CustomNavigation';

const FAQItem = ({ question, answer, isOpen, onClick }) => {

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full flex justify-between items-center py-5 text-left focus:outline-none"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <ChevronDown 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="pb-5">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const navigate = CustomNav();  // Add this line

  const [openQuestionId, setOpenQuestionId] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "How does the funding process work?",
      answer: "Our platform uses a milestone-based funding approach. Once you create a campaign, investors can pledge funds towards your target amount. The funds are only released when specific, pre-agreed milestones are met, ensuring transparency and accountability."
    },
    {
      id: 2,
      question: "What are the eligibility requirements for startups?",
      answer: "To be eligible, your startup must be legally registered, have a clear business plan, and meet our basic due diligence requirements. You'll need to provide documentation including business registration, financial statements, and team background information."
    },
    {
      id: 3,
      question: "How much can I raise on the platform?",
      answer: "The minimum campaign goal is $10,000, while the maximum is $5 million. Your specific limit will depend on factors such as your business stage, financial history, and the completeness of your campaign documentation."
    },
    {
      id: 4,
      question: "What fees do you charge?",
      answer: "We charge a 5% platform fee on successfully funded campaigns. There's also a payment processing fee of 2.9% + $0.30 per transaction. Failed campaigns don't incur any fees."
    },
    {
      id: 5,
      question: "How long does a campaign typically last?",
      answer: "Campaigns can run for 30, 60, or 90 days. We recommend 60 days as the optimal duration to build momentum while maintaining urgency."
    },
    {
      id: 6,
      question: "What happens if I don't reach my funding goal?",
      answer: "We use an all-or-nothing funding model. If you don't reach your goal, all pledged funds are returned to investors with no fees charged."
    },
    {
      id: 7,
      question: "How do you verify investors?",
      answer: "All investors undergo a verification process that includes identity verification, accreditation status check (if applicable), and source of funds verification for larger investments."
    },
    {
      id: 8,
      question: "What support do you provide to startups?",
      answer: "We provide campaign strategy guidance, pitch deck review, investor matchmaking, and ongoing support throughout your fundraising journey. Our platform also includes resources and tools to help you succeed."
    },
    {
      id: 9,
      question: "How do you handle investor communications?",
      answer: "Our platform includes built-in tools for investor updates, document sharing, and Q&A sessions. You can easily communicate with all your investors through our secure messaging system."
    },
    {
      id: 10,
      question: "What happens after successful funding?",
      answer: "After successful funding, we help facilitate the legal documentation process and funds transfer. We also provide post-funding support and tools to help you manage investor relations."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-green-700 py-16">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-green-100">
              Find answers to common questions about our platform, funding process, and more.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Bar */}
        <div className="mb-12">
          <input
            type="search"
            placeholder="Search frequently asked questions..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-1">
          {faqData.map((faq) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              isOpen={openQuestionId === faq.id}
              onClick={() => setOpenQuestionId(openQuestionId === faq.id ? null : faq.id)}
            />
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Please contact our friendly support team.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors">
            Contact Support
          </button>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;