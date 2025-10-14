import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Booking } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { EmptyState } from '../shared/EmptyState';
import { Calendar, Clock, DollarSign, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

export const CustomerBookings: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

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
      const q = query(bookingsRef, where('customerId', '==', currentUser!.id));
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
      });
      
      // Refresh bookings
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      
      // Refresh bookings
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to delete booking');
    }
  };

  const filterBookings = () => {
    const now = new Date();
    
    if (filter === 'all') return bookings;
    
    if (filter === 'upcoming') {
      return bookings.filter(booking => {
        const bookingDate = new Date(`${booking.date} ${booking.time}`);
        return bookingDate >= now && booking.status !== 'cancelled' && booking.status !== 'completed';
      });
    }
    
    // past
    return bookings.filter(booking => {
      const bookingDate = new Date(`${booking.date} ${booking.time}`);
      return bookingDate < now || booking.status === 'cancelled' || booking.status === 'completed';
    });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
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

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
            filter === 'upcoming'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
            filter === 'past'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          All
        </button>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description={
            filter === 'upcoming'
              ? "You don't have any upcoming appointments"
              : "No bookings to display"
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {booking.serviceName}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(booking.status)}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary-600 font-bold">
                    <DollarSign className="w-4 h-4" />
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

              {booking.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes: </span>
                    {booking.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              {booking.status === 'pending' ? (
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  Cancel Booking
                </button>
              ) : booking.status === 'confirmed' ? (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <p className="font-medium">Booking Confirmed</p>
                  <p className="text-xs mt-1">Contact the barber to request cancellation</p>
                </div>
              ) : booking.status === 'cancelled' || booking.status === 'completed' ? (
                <button
                  onClick={() => handleDeleteBooking(booking.id)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
