// src/pages/FAQ.jsx
import React, { useState, useRef } from 'react';
import { 
  ChevronDown, 
  Search, 
  X, 
  MessageSquare, 
  Send, 
  Bookmark, 
  Copy, 
  Share2,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { CustomNav } from '../hooks/CustomNavigation';

// FAQ Item Component with improved interaction
const FAQItem = ({ question, answer, isOpen, onClick, id }) => {
  const contentRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Copy answer to clipboard
  const copyToClipboard = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`Q: ${question}\n\nA: ${answer}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle bookmark
  const toggleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
    
    // Save bookmarks to localStorage
    const bookmarks = JSON.parse(localStorage.getItem('faqBookmarks') || '[]');
    if (!bookmarked) {
      localStorage.setItem('faqBookmarks', JSON.stringify([...bookmarks, id]));
    } else {
      localStorage.setItem('faqBookmarks', JSON.stringify(bookmarks.filter(item => item !== id)));
    }
  };

  // Share FAQ
  const shareFAQ = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'FAQ: ' + question,
        text: `${question}\n\n${answer}`,
        url: window.location.href + '#faq-' + id
      });
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href + '#faq-' + id);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div id={`faq-${id}`} className="border-b border-gray-200 transition-all duration-200 hover:bg-gray-50">
      <button
        className="w-full flex justify-between items-center py-6 px-4 md:px-6 text-left focus:outline-none group"
        onClick={onClick}
      >
        <span className="text-xl font-medium text-gray-900 pr-8 group-hover:text-purple-700">{question}</span>
        <ChevronDown 
          className={`transition-transform duration-300 flex-shrink-0 h-6 w-6 ${isOpen ? 'rotate-180 text-green-600' : 'text-gray-500'}`}
        />
      </button>
      
      {isOpen && (
        <div 
          ref={contentRef}
          className="pb-6 px-4 md:px-6 text-gray-600 text-lg leading-relaxed"
          style={{ 
            maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out'
          }}
        >
          <div className="prose prose-lg max-w-none">
            <p>{answer}</p>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={copyToClipboard}
              className="flex items-center text-sm text-gray-500 hover:text-gray-900"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  <span className="text-green-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  <span>Copy</span>
                </>
              )}
            </button>
            
            <button 
              onClick={toggleBookmark}
              className="flex items-center text-sm text-gray-500 hover:text-gray-900"
              title={bookmarked ? "Remove bookmark" : "Bookmark this answer"}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${bookmarked ? 'fill-purple-700 text-purple-800' : ''}`} />
              <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
            
            <button 
              onClick={shareFAQ}
              className="flex items-center text-sm text-gray-500 hover:text-gray-900"
              title="Share this FAQ"
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>Share</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  // State
  const [openQuestionId, setOpenQuestionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const navigate = CustomNav();
  
  // FAQ data with categories
  const faqData = [
    // Original FAQs
    {
      id: 1,
      category: 'general',
      question: "How Can I Make a Donation?",
      answer: "You can make a donation through our secure online platform using your credit card, debit card, or PayPal account. Simply click the donate button and follow the instructions."
    },
    {
      id: 2,
      category: 'payments',
      question: "Is My Donation Tax-Deductible?",
      answer: "Yes, all donations are tax-deductible to the extent allowed by law. You will receive a tax receipt for your records."
    },
    {
      id: 3,
      category: 'general',
      question: "Can I Donate In Honor Or Memory Of Someone?",
      answer: "Yes, you can make a donation in honor or memory of someone special. During the donation process, you'll have the option to specify this information."
    },
    {
      id: 4,
      category: 'payments',
      question: "How Will My Donation Be Used?",
      answer: "Your donation will be used to support our mission and programs. We ensure transparency in how funds are allocated and used."
    },
    {
      id: 5,
      category: 'payments',
      question: "Can I Set Up A Recurring Donation?",
      answer: "Yes, you can set up recurring donations on a monthly, quarterly, or annual basis. This option is available during the donation process."
    },
    
    // New FAQs for Nigerian P2P lending
    {
      id: 6,
      category: 'process',
      question: "How does the P2P lending process work for startups in Nigeria?",
      answer: "Our platform connects Nigerian startups with investors through a transparent P2P lending model. Startups create detailed campaign pages with funding goals and milestone deliverables. Investors can browse campaigns, perform due diligence, and contribute funds to specific milestones. Funds are only released when pre-defined milestones are achieved and verified, ensuring accountability throughout the funding journey."
    },
    {
      id: 7,
      category: 'requirements',
      question: "What documentation do I need to register as a startup borrower?",
      answer: "Startup borrowers need to provide: Business registration certificate (CAC documents), Bank Verification Number (BVN), valid ID (National ID, International Passport, or Driver's License), business plan, financial projections, bank account details, and supporting documents like pitch deck and product demos. Additional sector-specific documentation may be required for regulated industries."
    },
    {
      id: 8,
      category: 'requirements',
      question: "What are the eligibility requirements for Nigerian startups?",
      answer: "To be eligible, your startup must be legally registered in Nigeria with CAC, have been operational for at least 6 months, have a clear business model with market potential, a comprehensive business plan, and a founding team with relevant experience. You must also have a Nigerian bank account, valid BVN, and be able to provide collateral or guarantors for certain funding thresholds."
    },
    {
      id: 9,
      category: 'financial',
      question: "What interest rates and fees should I expect as a borrower?",
      answer: "Interest rates typically range from 8% to 25% per annum depending on your risk assessment, business stage, and loan duration. Our platform charges a 3% origination fee on successfully funded campaigns. For partial funding, a 1.5% facilitation fee applies. There are no application fees, but late repayments incur a 1% penalty fee. All rates and fees are transparent and displayed before campaign launch."
    },
    {
      id: 10,
      category: 'process',
      question: "How are funds disbursed and what is the milestone verification process?",
      answer: "Funds are held in escrow until milestone completion. Disbursement happens in tranches based on your predefined milestones. For each milestone, you'll submit evidence of completion through our platform. Our verification team and key investors will review the submission, and upon approval, funds for that milestone are released to your registered bank account within 2-3 business days."
    },
    {
      id: 11,
      category: 'financial',
      question: "What happens if my startup fails to reach its funding goal?",
      answer: "We use a flexible funding model with minimum thresholds. If you reach at least 70% of your funding goal, you can choose to accept the partial funding with adjusted milestones or decline it with no fees charged. If funding is below 70%, all pledged amounts are returned to investors with no fees to either party. You can revise your campaign and relaunch after a 30-day waiting period."
    },
    {
      id: 12,
      category: 'investors',
      question: "How do I verify investors on the platform?",
      answer: "All investors undergo our strict verification process including KYC verification, accreditation checks (for certain investment thresholds), and source of funds verification. As a borrower, you can view investor profiles showing their investment history, expertise, and ratings. You can also request direct communication with potential investors for further verification before accepting their funding."
    },
    {
      id: 13,
      category: 'financial',
      question: "What loan amounts and durations are available?",
      answer: "Loan amounts range from ₦500,000 to ₦50,000,000, with durations from 6 to 36 months. New borrowers are limited to ₦5,000,000 for their first campaign. Higher amounts require additional verification, collateral, or successful repayment history. Loan duration must align with your business cycle and realistic milestone timeframes."
    },
    {
      id: 14,
      category: 'process',
      question: "How is my loan repayment structured?",
      answer: "Repayments follow the agreed schedule in your funding terms. Options include monthly installments, quarterly payments, or custom structures based on your revenue cycle. Each payment includes principal and interest. Early repayment is allowed with a reduced fee structure. All repayments are made through our secure payment gateway and distributed to investors according to their contribution percentages."
    },
    {
      id: 15,
      category: 'legal',
      question: "What happens if I miss a repayment deadline?",
      answer: "If you anticipate payment difficulties, contact us at least 7 days before your due date to discuss restructuring options. For late payments, a 1% penalty applies in the first 15 days. After that, we implement a graduated penalty system and work with you on a recovery plan. Persistent defaults may result in collateral claims, reporting to credit bureaus, and legal action. We always prioritize collaborative solutions before enforcement."
    }
  ];

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'General' },
    { id: 'process', label: 'Process' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'financial', label: 'Financial' },
    { id: 'investors', label: 'Investors' },
    { id: 'payments', label: 'Payments' },
    { id: 'legal', label: 'Legal' }
  ];

  // Filtering logic
  React.useEffect(() => {
    const filtered = faqData.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredFAQs(filtered);
  }, [searchTerm, activeCategory]);

  // Handle opening/closing questions
  const toggleQuestion = (id) => {
    setOpenQuestionId(openQuestionId === id ? null : id);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Handle new question submission
  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    
    // Form validation
    if (!newQuestion.trim()) {
      setSubmitError('Please enter your question');
      return;
    }
    
    if (!userEmail.trim() || !/^\S+@\S+\.\S+$/.test(userEmail)) {
      setSubmitError('Please enter a valid email address');
      return;
    }
    
    // Here you would typically send the question to your backend
    // For now, we'll just simulate success
    console.log('Submitting question:', { question: newQuestion, email: userEmail });
    
    setSubmitSuccess(true);
    setNewQuestion('');
    setUserEmail('');
    setSubmitError('');
    
    // Reset success message after a delay
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowAskForm(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-700 to-green-900 py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-green-100">
              Find answers to common questions about our P2P lending platform for Nigerian startups
            </p>
            
            {/* Search Bar */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search for answers..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-10 py-4 rounded-xl border-0 bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-green-500 shadow-lg"
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        
        {/* FAQ List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <FAQItem
                key={faq.id}
                id={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openQuestionId === faq.id}
                onClick={() => toggleQuestion(faq.id)}
              />
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-2 text-gray-500">
                No FAQs match your search criteria. Try adjusting your search or browsing all categories.
              </p>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Ask a Question Section */}
        <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Still have questions?</h2>
            <p className="mt-2 text-gray-600">
              Can't find the answer you're looking for? Submit your question and we'll get back to you.
            </p>
          </div>
          
          {!showAskForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowAskForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm 
                         text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-all"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Ask a Question
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuestion} className="max-w-xl mx-auto">
              {submitSuccess ? (
                <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
                  <Check className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-lg font-medium text-green-800">Question Submitted!</h3>
                  <p className="mt-1 text-green-700">
                    Thanks for your question. We'll review it and get back to you shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="question" className="block text-sm font-medium text-purple-700 mb-1">
                      Your Question
                    </label>
                    <textarea
                      id="question"
                      rows={4}
                      placeholder="What would you like to know about our platform?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="So we can get back to you"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-purple-700 focus:border-purple-700"
                      required
                    />
                  </div>
                  
                  {submitError && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {submitError}
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAskForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium 
                               rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent 
                               rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 
                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Question
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;