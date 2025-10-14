import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { MapPin, Clock, Phone, Save, CheckCircle } from 'lucide-react';

export const BarberProfileSetup: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contact, setContact] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchBarberProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchBarberProfile = async () => {
    try {
      setLoading(true);
      
      // Check if barber profile exists
      const barberRef = doc(db, 'barbers', currentUser!.id);
      const barberDoc = await getDoc(barberRef);
      
      if (barberDoc.exists()) {
        const data = barberDoc.data();
        setExistingProfile(true);
        setShopName(data.shopName || '');
        setAddress(data.location?.address || '');
        setLatitude(data.location?.lat?.toString() || '');
        setLongitude(data.location?.lng?.toString() || '');
        setContact(data.contact || '');
        setOpenTime(data.workingHours?.open || '09:00');
        setCloseTime(data.workingHours?.close || '18:00');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLoading(false);
      },
      (error) => {
        setError('Unable to get your location. Please enter manually.');
        setLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopName || !address || !latitude || !longitude || !contact) {
      setError('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      setError('Invalid latitude or longitude');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const barberRef = doc(db, 'barbers', currentUser!.id);
      
      if (existingProfile) {
        // For updates, only include fields that should be updated
        await updateDoc(barberRef, {
          userId: currentUser!.id,
          shopName,
          location: {
            address,
            lat: Number(latitude),
            lng: Number(longitude),
          },
          contact,
          workingHours: {
            open: openTime,
            close: closeTime,
          },
          isActive: true,
          updatedAt: Timestamp.now()
        });
      } else {
        // For new profiles, include all fields
        await setDoc(barberRef, {
          userId: currentUser!.id,
          shopName,
          location: {
            address,
            lat: Number(latitude),
            lng: Number(longitude),
          },
          contact,
          workingHours: {
            open: openTime,
            close: closeTime,
          },
          images: [],
          rating: 0,
          totalRatings: 0,
          isActive: true,
          createdAt: Timestamp.now()
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        fetchBarberProfile(); // Reload the profile data
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Saved!</h2>
        <p className="text-gray-600 mb-6">
          Your barber profile has been {existingProfile ? 'updated' : 'created'} successfully.
        </p>
        <LoadingSpinner size={24} />
        <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {existingProfile ? 'Edit' : 'Setup'} Your Barber Profile
        </h1>
        <p className="text-gray-600 mb-8">
          {existingProfile ? 'Update your shop details' : 'Complete your profile to start accepting bookings'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <ErrorMessage message={error} onClose={() => setError('')} />}

          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name *
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Classic Cuts Barber Shop"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Full Address *
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="123 Main Street, City, State, ZIP"
              required
            />
          </div>

          {/* Location Coordinates */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Location Coordinates *
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Use My Current Location
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 40.7128"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., -74.0060"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Coordinates help customers find you. Click "Use My Current Location" or enter manually.
            </p>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Contact Number *
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., (555) 123-4567"
              required
            />
          </div>

          {/* Working Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 inline mr-1" />
              Working Hours *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Opening Time</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Closing Time</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/barber/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {existingProfile ? 'Update' : 'Save'} Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
