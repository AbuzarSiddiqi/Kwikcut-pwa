import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Booking } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { DollarSign, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

export const RevenueDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('barberId', '==', currentUser!.id),
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(q);

      const bookingsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      setBookings(bookingsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const filterBookingsByPeriod = (bookings: Booking[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      
      switch (period) {
        case 'today':
          return bookingDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return bookingDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return bookingDate >= monthAgo;
        case 'all':
        default:
          return true;
      }
    });
  };

  const calculateStats = () => {
    const filteredBookings = filterBookingsByPeriod(bookings);
    
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.servicePrice || 0), 0);
    const totalBookings = filteredBookings.length;
    const averageBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      totalRevenue,
      totalBookings,
      averageBooking,
    };
  };

  const getRevenueByService = () => {
    const filteredBookings = filterBookingsByPeriod(bookings);
    const serviceMap = new Map<string, { count: number; revenue: number }>();

    filteredBookings.forEach(booking => {
      const existing = serviceMap.get(booking.serviceName) || { count: 0, revenue: 0 };
      serviceMap.set(booking.serviceName, {
        count: existing.count + 1,
        revenue: existing.revenue + (booking.servicePrice || 0),
      });
    });

    return Array.from(serviceMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const stats = calculateStats();
  const serviceRevenue = getRevenueByService();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h2>
        <p className="text-gray-600 mt-1">Track your earnings and performance</p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 overflow-x-auto">
        <button
          onClick={() => setPeriod('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            period === 'today'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setPeriod('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            period === 'week'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            period === 'month'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setPeriod('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            period === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Time
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Completed Bookings</h3>
          <p className="text-3xl font-bold">{stats.totalBookings}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-white text-opacity-90 text-sm font-medium mb-1">Average per Booking</h3>
          <p className="text-3xl font-bold">${stats.averageBooking.toFixed(2)}</p>
        </div>
      </div>

      {/* Revenue by Service */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue by Service</h3>
        {serviceRevenue.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No completed bookings yet</p>
        ) : (
          <div className="space-y-4">
            {serviceRevenue.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{service.name}</span>
                    <span className="text-primary-600 font-bold">${service.revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{service.count} bookings</span>
                    <span>•</span>
                    <span>Avg: ${(service.revenue / service.count).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(service.revenue / stats.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Completed Bookings</h3>
        {filterBookingsByPeriod(bookings).slice(0, 5).length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings in this period</p>
        ) : (
          <div className="space-y-3">
            {filterBookingsByPeriod(bookings).slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.serviceName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">${(booking.servicePrice || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{booking.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
