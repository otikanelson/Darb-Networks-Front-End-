import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQSection = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqData = [
    {
      question: "How Can I Make Donation?",
      answer: "You can make a donation through our secure online platform using your credit card, debit card, or PayPal account. Simply click the donate button and follow the instructions."
    },
    {
      question: "Is My Donation Tax-Deductible?",
      answer: "Yes, all donations are tax-deductible to the extent allowed by law. You will receive a tax receipt for your records."
    },
    {
      question: "Can I Donate In Honor Or Memory Of Someone?",
      answer: "Yes, you can make a donation in honor or memory of someone special. During the donation process, you'll have the option to specify this information."
    },
    {
      question: "How Will My Donation Be Used?",
      answer: "Your donation will be used to support our mission and programs. We ensure transparency in how funds are allocated and used."
    },
    {
      question: "Can I Set Up A Recurring Donation?",
      answer: "Yes, you can set up recurring donations on a monthly, quarterly, or annual basis. This option is available during the donation process."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12">
          Frequently Asked Questions.
        </h2>
        
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div 
              key={index}
              className="border-b border-gray-200"
            >
              <button
                className="w-full flex justify-between items-center py-5 text-left"
                onClick={() => toggleQuestion(index)}
              >
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`transition-transform ${openQuestion === index ? 'rotate-180' : ''}`}
                />
              </button>
              
              {openQuestion === index && (
                <div className="pb-5">
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;