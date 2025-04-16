// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      
      // Check if there was a redirect path saved
      const redirectPath = localStorage.getItem('redirectPath');
      if (redirectPath) {
        localStorage.removeItem('redirectPath');
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide user-friendly error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
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
            <h1 className="text-4xl font-bold text-white mb-6">Welcome Back</h1>
            <p className="text-green-100 text-lg max-w-md">
              Connect with the most promising Nigerian startups and be part of their success story.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
            <p className="text-white italic">
              "The platform made it incredibly easy to connect with investors who truly understood our vision. We secured funding within weeks!"
            </p>
            <div className="flex items-center mt-4">
              <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold mr-3">
                OA
              </div>
              <div>
                <p className="text-white font-medium">Oluwaseun Afolabi</p>
                <p className="text-green-200 text-sm">CEO, EcoCharge</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
            <p className="mt-2 text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                Create one now
              </Link>
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Your email address"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Forgot your password?
                </button>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-0.643 2.783-2.835 4.769-5.445 4.769-3.271 0-5.921-2.66-5.921-5.942s2.65-5.942 5.921-5.942c1.498 0 2.866 0.559 3.921 1.488l2.814-2.814c-1.801-1.677-4.206-2.702-6.736-2.702-5.518 0-10 4.48-10 10s4.482 10 10 10c5.523 0 10-4.486 10-10 0-0.772-0.098-1.52-0.275-2.241l-9.725 0.063z" />
                </svg>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.891h2.54v-2.203c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238 0.195 2.238 0.195v2.459h-1.26c-1.243 0-1.63 0.771-1.63 1.562v1.875h2.773l-0.443 2.891h-2.33v6.988c4.781-0.75 8.437-4.887 8.437-9.877z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;