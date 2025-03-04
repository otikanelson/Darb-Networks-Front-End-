// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    userType: 'startup',
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
      if (formData.userType === 'startup' && !formData.companyName) {
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
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            formData.userType === 'startup'
              ? 'bg-green-50 text-green-700 border-2 border-green-500'
              : 'bg-gray-50 text-gray-700 border-2 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => handleInputChange({ target: { name: 'userType', value: 'startup' } })}
        >
          Founder
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            formData.userType === 'investor'
              ? 'bg-green-50 text-green-700 border-2 border-green-500'
              : 'bg-gray-50 text-gray-700 border-2 border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => handleInputChange({ target: { name: 'userType', value: 'investor' } })}
        >
          Investor
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {formData.userType === 'startup' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">BVN</label>
        <input
          type="text"
          name="bvn"
          value={formData.bvn}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      {formData.userType === 'startup' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">CAC Registration Number</label>
          <input
            type="text"
            name="cacNumber"
            value={formData.cacNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows="3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Bank Name</label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Account Number</label>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-green-600 hover:text-green-500">
            Sign in
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div className="mb-8">
            <div className="relative">
              <div className="absolute left-0 top-2 w-full">
                <div className="h-1 bg-gray-200 rounded">
                  <div
                    className="h-1 bg-green-500 rounded transition-all duration-300"
                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                  />
                </div>
              </div>
              <div className="relative flex justify-between">
                {[1, 2, 3].map((number) => (
                  <div
                    key={number}
                    className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${
                        step >= number
                          ? 'bg-green-500 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-500'
                      }`}
                  >
                    {number}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 ml-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
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
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;