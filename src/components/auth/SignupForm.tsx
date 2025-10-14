import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, MapPin, Store, Phone, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserType } from '../../types';
import { ErrorMessage } from '../shared/ErrorMessage';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

interface SignupFormProps {
  userType: UserType;
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ userType, onSwitchToLogin, onBack }) => {
  const [step, setStep] = useState(1); // Step 1: Basic Info, Step 2: Barber Profile (only for barbers)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [barberProfile, setBarberProfile] = useState({
    shopName: '',
    address: '',
    lat: '',
    lng: '',
    contact: '',
    openTime: '09:00',
    closeTime: '18:00'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBarberProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarberProfile({
      ...barberProfile,
      [e.target.name]: e.target.value
    });
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setBarberProfile({
            ...barberProfile,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
          setGettingLocation(false);
        },
        (error) => {
          setError('Failed to get location. Please enter manually.');
          setGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/[- ]/g, ''))) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // If customer, complete signup
    if (userType === 'customer') {
      try {
        setError('');
        setLoading(true);
        await signup(formData.email, formData.password, formData.name, formData.phone, userType);
        navigate('/customer/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to create account');
      } finally {
        setLoading(false);
      }
    } else {
      // If barber, go to step 2
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate barber profile
    if (!barberProfile.shopName || !barberProfile.address || !barberProfile.contact) {
      setError('Please fill in all required fields');
      return;
    }

    if (!barberProfile.lat || !barberProfile.lng) {
      setError('Please provide location coordinates');
      return;
    }

    const lat = parseFloat(barberProfile.lat);
    const lng = parseFloat(barberProfile.lng);
    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Create user account
      const user = await signup(formData.email, formData.password, formData.name, formData.phone, userType);
      
      // Create barber profile
      await setDoc(doc(db, 'barbers', user.id), {
        userId: user.id,
        shopName: barberProfile.shopName,
        location: {
          address: barberProfile.address,
          lat,
          lng
        },
        contact: barberProfile.contact,
        workingHours: {
          open: barberProfile.openTime,
          close: barberProfile.closeTime
        },
        images: [],
        rating: 0,
        totalRatings: 0,
        isActive: true,
        createdAt: Timestamp.now()
      });

      navigate('/barber/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
      <div className="text-center mb-6">
        <UserPlus className="w-12 h-12 text-primary-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-900">
          Sign Up as {userType === 'customer' ? 'Customer' : 'Barber'}
        </h2>
        <p className="text-gray-600 mt-2">
          {step === 1 ? 'Create your account to get started' : 'Complete your shop profile'}
        </p>
        {userType === 'barber' && (
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded ${step >= 1 ? 'bg-primary-600' : 'bg-gray-300'}`} />
            <div className={`h-2 w-16 rounded ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
          </div>
        )}
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          {error && <ErrorMessage message={error} onClose={() => setError('')} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner size={20} /> : (
              <>
                {userType === 'barber' ? 'Next Step' : 'Create Account'}
              </>
            )}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 text-gray-600 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="flex-1 text-primary-600 border border-primary-600 py-2 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Sign In Instead
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorMessage message={error} onClose={() => setError('')} />}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Store className="w-4 h-4 inline mr-1" />
              Shop Name *
            </label>
            <input
              type="text"
              name="shopName"
              value={barberProfile.shopName}
              onChange={handleBarberProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Joe's Barber Shop"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Shop Address *
            </label>
            <input
              type="text"
              name="address"
              value={barberProfile.address}
              onChange={handleBarberProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="123 Main St, City, State"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Coordinates *
            </label>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="w-full mb-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {gettingLocation ? <LoadingSpinner size={16} /> : <MapPin size={16} />}
              Use My Current Location
            </button>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                name="lat"
                value={barberProfile.lat}
                onChange={handleBarberProfileChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Latitude"
                required
              />
              <input
                type="text"
                name="lng"
                value={barberProfile.lng}
                onChange={handleBarberProfileChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Longitude"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Shop Contact Number *
            </label>
            <input
              type="tel"
              name="contact"
              value={barberProfile.contact}
              onChange={handleBarberProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="1234567890"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Working Hours
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                name="openTime"
                value={barberProfile.openTime}
                onChange={handleBarberProfileChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="time"
                name="closeTime"
                value={barberProfile.closeTime}
                onChange={handleBarberProfileChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size={20} />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Complete Signup
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={loading}
            className="w-full text-gray-600 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
};
