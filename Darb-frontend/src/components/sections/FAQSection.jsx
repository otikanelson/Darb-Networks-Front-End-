// src/components/sections/FAQSection.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CustomNav } from '../../hooks/CustomNavigation';

const FAQSection = () => {
  const [openQuestion, setOpenQuestion] = useState(null);
  const navigate = CustomNav();

  const faqData = [
    {
      question: "How does the P2P lending process work for startups in Nigeria?",
      answer: "Our platform connects Nigerian startups with investors through a transparent P2P lending model. Startups create detailed campaign pages with funding goals and milestone deliverables. Investors can browse campaigns, perform due diligence, and contribute funds to specific milestones. Funds are only released when pre-defined milestones are achieved and verified, ensuring accountability throughout the funding journey."
    },
    {
      question: "What documentation do I need to register as a startup borrower?",
      answer: "Startup borrowers need to provide: Business registration certificate (CAC documents), Bank Verification Number (BVN), valid ID, business plan, financial projections, bank account details, and supporting documents like pitch deck and product demos."
    },
    {
      question: "What are the eligibility requirements for Nigerian startups?",
      answer: "To be eligible, your startup must be legally registered in Nigeria with CAC, have been operational for at least 6 months, have a clear business model with market potential, a comprehensive business plan, and a founding team with relevant experience."
    },
    {
      question: "What interest rates and fees should I expect as a borrower?",
      answer: "Interest rates typically range from 8% to 25% per annum depending on your risk assessment, business stage, and loan duration. Our platform charges a 3% origination fee on successfully funded campaigns. All rates and fees are transparent and displayed before campaign launch."
    },
    {
      question: "How are funds disbursed and what is the milestone verification process?",
      answer: "Funds are held in escrow until milestone completion. Disbursement happens in tranches based on your predefined milestones. For each milestone, you'll submit evidence of completion for review, and upon approval, funds for that milestone are released to your registered bank account within 2-3 business days."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn more about our P2P lending platform for Nigerian startups
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <button
                className="w-full flex justify-between items-center p-5 text-left bg-white hover:bg-gray-50 transition duration-150"
                onClick={() => toggleQuestion(index)}
              >
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`transition-transform duration-200 ${openQuestion === index ? 'rotate-180 text-green-600' : 'text-gray-400'}`}
                />
              </button>
              
              {openQuestion === index && (
                <div className="p-5 bg-gray-50 border-t border-gray-100">
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <button 
            onClick={() => navigate('/faq')}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm 
                     text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-all"
          >
            View All FAQs
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;