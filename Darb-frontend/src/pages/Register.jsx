// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  CreditCard, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    userType: 'founder',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    bvn: '',
    cacNumber: '',
    accountNumber: '',
    bankName: '',
    companyName: '',
    phoneNumber: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate passwords
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Register user with Firebase
      await register(formData);
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (currentStep) => {
    let valid = true;
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName) {
        valid = false;
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.email) {
        valid = false;
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        valid = false;
        newErrors.email = 'Email is invalid';
      }
      if (!formData.phoneNumber) {
        valid = false;
        newErrors.phoneNumber = 'Phone number is required';
      }
    } else if (currentStep === 2) {
      if (formData.userType === 'founder' && !formData.companyName) {
        valid = false;
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.bvn) {
        valid = false;
        newErrors.bvn = 'BVN is required';
      }
      if (!formData.address) {
        valid = false;
        newErrors.address = 'Address is required';
      }
    } else if (currentStep === 3) {
      if (!formData.bankName) {
        valid = false;
        newErrors.bankName = 'Bank name is required';
      }
      if (!formData.accountNumber) {
        valid = false;
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.password) {
        valid = false;
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        valid = false;
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        valid = false;
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        valid = false;
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!valid) {
      setError(Object.values(newErrors)[0]);
    }
    
    return valid;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => setStep(prev => prev - 1);

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Account Type</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className={`flex flex-col items-center justify-center py-6 px-4 rounded-lg border-2 transition-all ${
              formData.userType === 'founder'
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
            onClick={() => handleInputChange({ target: { name: 'userType', value: 'founder' } })}
          >
            <Building className="h-10 w-10 mb-3" />
            <span className="font-medium">Founder</span>
            <p className="text-xs mt-1 text-center">Create campaigns and raise funds</p>
          </button>
          
          <button
            type="button"
            className={`flex flex-col items-center justify-center py-6 px-4 rounded-lg border-2 transition-all ${
              formData.userType === 'investor'
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
            onClick={() => handleInputChange({ target: { name: 'userType', value: 'investor' } })}
          >
            <CreditCard className="h-10 w-10 mb-3" />
            <span className="font-medium">Investor</span>
            <p className="text-xs mt-1 text-center">Fund promising startups</p>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your email address"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your phone number"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {formData.userType === 'founder' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your company name"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">BVN</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="bvn"
            value={formData.bvn}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your BVN"
            required
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Your BVN is required for verification purposes and financial compliance.
        </p>
      </div>

      {formData.userType === 'founder' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CAC Registration Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="cacNumber"
              value={formData.cacNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your CAC number (if registered)"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your full address"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
        <select
          name="bankName"
          value={formData.bankName}
          onChange={handleInputChange}
          className="mt-1 block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
          required
        >
          <option value="">Select your bank</option>
          <option value="access">Access Bank</option>
          <option value="gtbank">GT Bank</option>
          <option value="firstbank">First Bank</option>
          <option value="zenith">Zenith Bank</option>
          <option value="uba">UBA</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CreditCard className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your account number"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Create a password"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
            placeholder="Confirm your password"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left side with background image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-green-700 to-green-900 p-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-green-800/95 to-green-900/90" />
        <img 
          src="/src/assets/featured-bg.png" 
          alt="Background Pattern" 
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <img 
              src="/src/assets/Logo.png" 
              alt="Logo" 
              className="h-16 w-auto mb-12"
            />
            <h1 className="text-4xl font-bold text-white mb-6">Join our community</h1>
            <p className="text-green-100 text-lg max-w-md">
              {formData.userType === 'founder' 
                ? "Create your campaign and connect with investors who believe in your vision."
                : "Discover promising Nigerian startups and be part of their success story."}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <p className="text-white italic">
              "I've invested in three startups through this platform, and the milestone-based funding gives me confidence that my investments are being put to good use."
            </p>
            <div className="flex items-center mt-4">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold mr-3">
                JO
              </div>
              <div>
                <p className="text-white font-medium">Johnson Oladele</p>
                <p className="text-green-200 text-sm">Angel Investor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
            <p className="mt-2 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in
              </Link>
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute left-0 top-2 w-full h-1 bg-gray-200 rounded">
                <div
                  className="h-1 bg-green-500 rounded transition-all duration-300"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {[1, 2, 3].map((number) => (
                  <div
                    key={number}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step >= number
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white border-gray-300 text-gray-500'
                    } transition-all duration-300`}
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Account Details</span>
              <span>Verification</span>
              <span>Security</span>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className={`${step > 1 ? '' : 'ml-auto'} flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-green-600 hover:text-green-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="text-green-600 hover:text-green-500">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;