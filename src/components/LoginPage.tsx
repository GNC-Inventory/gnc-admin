'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('joseph@example.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation - just check if fields are not empty
    if (!email.trim() || !password.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="/bg.png"
        alt="Background"
        fill
        className="object-cover"
        priority
      />

      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          <div 
            className="rounded-2xl p-8 shadow-xl"
            style={{ backgroundColor: 'var(--bg-white-0, #FFFFFF)' }}
          >
          {/* Welcome Back Title */}
          <h1 
            className="text-center mb-2"
            style={{
              fontFamily: 'var(--font-geist), Geist, sans-serif',
              fontWeight: 500,
              fontSize: '40px',
              lineHeight: '48px',
              letterSpacing: '-1%',
              color: 'var(--text-main-900, #0A0D14)',
            }}
          >
            Welcome Back
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-center mb-8"
            style={{
              fontFamily: 'Sora, sans-serif',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '-0.6%',
              color: 'var(--text-sub-500, #525866)',
            }}
          >
            Continue from where you left off
          </p>
          
          {/* Email Field */}
          <div className="mb-6">
            <label 
              htmlFor="email"
              className="block mb-2"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-main-900, #0A0D14)',
              }}
            >
              Email Address/Username
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="joseph@example.com"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontSize: '14px',
                color: '#9CA3AF',
              }}
            />
          </div>
          
          {/* Password Field */}
          <div className="mb-8">
            <label 
              htmlFor="password"
              className="block mb-2"
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-main-900, #0A0D14)',
              }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                style={{
                  fontFamily: 'var(--font-inter), Inter, sans-serif',
                  fontSize: '14px',
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-lg transition-opacity ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
            }`}
            style={{
              height: '40px',
              padding: '10px',
              backgroundColor: 'var(--primary-base, #375DFB)',
              borderRadius: '10px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.6%',
                color: 'var(--text-white-0, #FFFFFF)',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </span>
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}