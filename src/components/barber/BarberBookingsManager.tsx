import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Booking } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { EmptyState } from '../shared/EmptyState';
import { Calendar, Clock, DollarSign, User, Check, X, CheckCircle } from 'lucide-react';

export const BarberBookingsManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('pending');

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
      const q = query(bookingsRef, where('barberId', '==', currentUser!.id));
      const snapshot = await getDocs(q);

      const bookingsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      // Sort by date (newest first)
      bookingsList.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });

      setBookings(bookingsList);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      setError('');
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'confirmed',
      });
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to accept booking');
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to reject this booking?')) return;

    try {
      setError('');
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
      });
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to reject booking');
    }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      setError('');
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'completed',
      });
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking');
    }
  };

  const filterBookings = () => {
    if (filter === 'all') return bookings;
    return bookings.filter(booking => booking.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  const filteredBookings = filterBookings();
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
        <p className="text-gray-600 mt-1">
          Manage your appointments {pendingCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
              {pendingCount} pending
            </span>
          )}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            filter === 'pending'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            filter === 'confirmed'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            filter === 'completed'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({bookings.filter(b => b.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({bookings.length})
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description={`You don't have any ${filter === 'all' ? '' : filter} bookings`}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.serviceName}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <User className="w-4 h-4" />
                    <span>Customer ID: {booking.customerId.substring(0, 8)}...</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary-600 font-bold text-lg">
                    <DollarSign className="w-5 h-5" />
                    {booking.servicePrice}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(booking.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{booking.time}</span>
                </div>
              </div>

              {/* Actions based on status */}
              {booking.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(booking.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(booking.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <button
                  onClick={() => handleComplete(booking.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Completed
                </button>
              )}

              {booking.status === 'completed' && (
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium text-center">
                  ✓ Service completed
                </div>
              )}

              {booking.status === 'cancelled' && (
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium text-center">
                  ✗ Booking cancelled
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
