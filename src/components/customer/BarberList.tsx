import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Barber } from '../../types';
import { useGeolocation } from '../../hooks/useGeolocation';
import { calculateDistance, formatDistance } from '../../utils/geolocation';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { EmptyState } from '../shared/EmptyState';
import { MapPin, Star, Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BarberWithDistance extends Barber {
  distance: number;
}

type Category = 'All' | 'Mens' | 'Womens' | 'Kids';

export const BarberList: React.FC = () => {
  const [barbers, setBarbers] = useState<BarberWithDistance[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<BarberWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBarbers();
  }, [latitude, longitude]);

  useEffect(() => {
    applyFilters();
  }, [barbers, searchTerm, maxDistance, minRating, selectedCategory]);

  const fetchBarbers = async () => {
    try {
      setLoading(true);
      setError('');

      const barbersRef = collection(db, 'barbers');
      const q = query(barbersRef, where('isActive', '==', true));
      const snapshot = await getDocs(q);

      let barberList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Barber[];

      // Calculate distances if location available
      if (latitude && longitude) {
        const barbersWithDistance = barberList.map((barber) => ({
          ...barber,
          distance: calculateDistance(
            latitude,
            longitude,
            barber.location.lat,
            barber.location.lng
          ),
        })).sort((a, b) => a.distance - b.distance);
        setBarbers(barbersWithDistance);
      } else {
        // No location - just add distance as 0
        const barbersWithDistance = barberList.map(b => ({ ...b, distance: 0 }));
        setBarbers(barbersWithDistance);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load barbers');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...barbers];

    // Category filter
    if (selectedCategory !== 'All') {
      // This is a placeholder - you can add category field to barber data model later
      // For now, we'll show all barbers regardless of category
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (barber) =>
          barber.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          barber.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Distance filter (only if we have location)
    if (latitude && longitude) {
      filtered = filtered.filter((barber) => barber.distance <= maxDistance);
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((barber) => barber.rating >= minRating);
    }

    setFilteredBarbers(filtered);
  };

  if (geoLoading || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Glassmorphism Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#115e59' }} />
          <input
            type="text"
            placeholder="Search barbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl rounded-full focus:outline-none focus:ring-2 focus:ring-primary-800 text-sm"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:bg-white/50 rounded-full transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {(['All', 'Mens', 'Womens', 'Kids'] as Category[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary-800 text-white shadow-md'
                  : 'bg-white/60 backdrop-blur-xl text-gray-700 border border-white/20 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Location Info */}
        {latitude && longitude && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>Within {maxDistance}km</span>
          </div>
        )}
        {geoError && (
          <p className="text-xs text-amber-600">
            {geoError}
          </p>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 animate-fade-in">
            <div className="space-y-4">
              {/* Distance Filter */}
              {latitude && longitude && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Distance: {maxDistance}km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Rating: {minRating || 'Any'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Barbers Grid - 2 Column Square Cards */}
      {filteredBarbers.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No salons found"
          description="Try adjusting your filters"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredBarbers.map((barber) => (
            <div
              key={barber.id}
              onClick={() => navigate(`/customer/barber/${barber.id}`)}
              className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-[0.97]"
            >
              {/* Square Barber Image */}
              <div className="relative aspect-square">
                {barber.images && barber.images.length > 0 ? (
                  <img
                    src={barber.images[0]}
                    alt={barber.shopName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-3xl font-bold">
                    {barber.shopName.charAt(0)}
                  </div>
                )}
                {/* Rating Badge - Top Left */}
                {barber.rating > 0 && (
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-gray-900">{barber.rating.toFixed(1)}</span>
                  </div>
                )}
                {/* Book Button - Bottom Right */}
                <div className="absolute bottom-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customer/barber/${barber.id}`);
                    }}
                    className="px-3 py-1 text-white text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-lg"
                    style={{ backgroundColor: '#115e59' }}
                  >
                    Book
                  </button>
                </div>
              </div>

              {/* Barber Info */}
              <div className="p-3">
                <h3 className="font-bold text-sm text-gray-900 mb-1 truncate">{barber.shopName}</h3>
                <div className="flex items-start gap-1 text-gray-500 mb-2">
                  <MapPin className="w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] line-clamp-2 leading-tight">{barber.location.address}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  {latitude && longitude && barber.distance > 0 && (
                    <span className="font-medium text-primary-600 text-[10px]">
                      {formatDistance(barber.distance)}
                    </span>
                  )}
                  {barber.totalRatings > 0 && (
                    <span className="text-gray-500 text-[10px]">{barber.totalRatings} reviews</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
