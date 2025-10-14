import React, { useState } from 'react';
import { Scissors, User, Store } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { UserType } from '../types';

type ViewMode = 'landing' | 'login' | 'signup';

export const LandingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [selectedUserType, setSelectedUserType] = useState<UserType>('customer');

  const handleSelectUserType = (type: UserType) => {
    setSelectedUserType(type);
    setViewMode('signup');
  };

  if (viewMode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <LoginForm onSwitchToSignup={() => setViewMode('landing')} />
      </div>
    );
  }

  if (viewMode === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <SignupForm
          userType={selectedUserType}
          onSwitchToLogin={() => setViewMode('login')}
          onBack={() => setViewMode('landing')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">KwikCut</h1>
          </div>
          <button
            onClick={() => setViewMode('login')}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Haircut, Your Way
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with local barbers and book your perfect haircut in seconds
          </p>
        </div>

        {/* User Type Selection */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Get Started
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Card */}
            <button
              onClick={() => handleSelectUserType('customer')}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left group"
            >
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">I'm a Customer</h4>
              <p className="text-gray-600 mb-6">
                Browse local barbers, view services, and book your next haircut with ease
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                  Find nearby barbers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                  Book appointments instantly
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                  Manage your bookings
                </li>
              </ul>
              <div className="mt-6 text-primary-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Sign Up as Customer
                <span>→</span>
              </div>
            </button>

            {/* Barber Card */}
            <button
              onClick={() => handleSelectUserType('barber')}
              className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left group"
            >
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                <Store className="w-8 h-8 text-primary-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">I'm a Barber</h4>
              <p className="text-gray-600 mb-6">
                Showcase your services, manage appointments, and grow your business
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                  Create your shop profile
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                  Manage services & pricing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                  Handle bookings easily
                </li>
              </ul>
              <div className="mt-6 text-primary-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Sign Up as Barber
                <span>→</span>
              </div>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Why Choose KwikCut?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Quick & Easy</h4>
              <p className="text-gray-600">Book appointments in under a minute</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Find Nearby</h4>
              <p className="text-gray-600">Discover barbers in your area</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Grow Business</h4>
              <p className="text-gray-600">Barbers can reach more customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            © 2025 KwikCut. Made with ❤️ for barbers and customers.
          </p>
        </div>
      </footer>
    </div>
  );
};
