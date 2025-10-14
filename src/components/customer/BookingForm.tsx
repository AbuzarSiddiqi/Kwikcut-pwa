import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Barber, Service } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Calendar as CalendarIcon, Clock, ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export const BookingForm: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [barber, setBarber] = useState<Barber | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get selected services from BarberProfile if passed
  const preSelectedServices = location.state?.selectedServices || {};

  useEffect(() => {
    if (barberId) {
      fetchBarberAndServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberId]);

  const fetchBarberAndServices = async () => {
    try {
      setLoading(true);
      
      // Fetch barber details
      const barberDoc = await getDoc(doc(db, 'barbers', barberId!));
      if (!barberDoc.exists()) {
        setError('Barber not found');
        return;
      }
      setBarber({ id: barberDoc.id, ...barberDoc.data() } as Barber);

      // Fetch services
      const servicesRef = collection(db, 'services');
      const q = query(
        servicesRef,
        where('barberId', '==', barberId),
        where('active', '==', true)
      );
      const snapshot = await getDocs(q);
      const servicesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      
      setServices(servicesList);
      if (servicesList.length > 0) {
        setSelectedService(servicesList[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    const [openHour] = barber!.workingHours.open.split(':').map(Number);
    const [closeHour] = barber!.workingHours.close.split(':').map(Number);
    
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let min of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const getTotalPrice = () => {
    return Object.entries(preSelectedServices).reduce((total, [serviceId, count]) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0) * (count as number);
    }, 0);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Auto scroll to time selection
    setTimeout(() => {
      document.getElementById('time-selection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    // Auto scroll to booking details
    setTimeout(() => {
      document.getElementById('booking-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to book');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const dateStr = selectedDate.toISOString().split('T')[0];

      // Create bookings for each selected service
      const bookingPromises = Object.entries(preSelectedServices).map(([serviceId, quantity]) => {
        const serviceData = services.find(s => s.id === serviceId);
        return addDoc(collection(db, 'bookings'), {
          customerId: currentUser.id,
          barberId: barberId,
          serviceId: serviceId,
          serviceName: serviceData?.name || '',
          servicePrice: serviceData?.price || 0,
          quantity: quantity,
          date: dateStr,
          time: selectedTime,
          status: 'pending',
          notes: notes,
          createdAt: Timestamp.now(),
        });
      });

      await Promise.all(bookingPromises);

      setSuccess(true);
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!barber || services.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ErrorMessage message="No services available for booking" />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your appointment has been booked successfully.
        </p>
        <LoadingSpinner size={24} />
        <p className="text-sm text-gray-500 mt-2">Redirecting to your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: '#ccfbf1' }}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 z-30 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <div>
            <h1 className="text-lg font-bold">Book Appointment</h1>
            <p className="text-xs text-gray-600">{barber.shopName}</p>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        {/* Calendar Widget */}
        <div className="bg-white shadow-lg rounded-3xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              Select Date
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="px-3 py-2 bg-gray-100 rounded-xl">
                <span className="text-sm font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} />;
              }
              const isPast = isPastDate(date);
              const isSelected = isSameDay(date, selectedDate);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isPast && handleDateSelect(date)}
                  disabled={isPast}
                  className={`aspect-square flex items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : isTodayDate
                      ? 'bg-primary-100 text-primary-700 font-bold'
                      : isPast
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Creative Time Slots */}
        <div id="time-selection" className={`bg-white shadow-lg rounded-3xl p-5 border border-gray-100 transition-all duration-500 ${!selectedDate ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-900" />
            <h2 className="text-base font-bold text-gray-900">Select Time</h2>
            {selectedDate && (
              <span className="ml-auto text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          
          {/* Morning Slots */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Morning</p>
            <div className="grid grid-cols-4 gap-2">
              {generateTimeSlots().filter(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour < 12;
              }).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleTimeSelect(slot)}
                  disabled={!selectedDate}
                  className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedTime === slot
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : !selectedDate
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Afternoon Slots */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Afternoon</p>
            <div className="grid grid-cols-4 gap-2">
              {generateTimeSlots().filter(slot => {
                const hour = parseInt(slot.split(':')[0]);
                return hour >= 12 && hour < 17;
              }).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleTimeSelect(slot)}
                  disabled={!selectedDate}
                  className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedTime === slot
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : !selectedDate
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Evening Slots */}
          {generateTimeSlots().some(slot => parseInt(slot.split(':')[0]) >= 17) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Evening</p>
              <div className="grid grid-cols-4 gap-2">
                {generateTimeSlots().filter(slot => {
                  const hour = parseInt(slot.split(':')[0]);
                  return hour >= 17;
                }).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleTimeSelect(slot)}
                    disabled={!selectedDate}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                      selectedTime === slot
                        ? 'bg-gray-900 text-white shadow-lg scale-105'
                        : !selectedDate
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Details Summary */}
        {selectedDate && selectedTime && Object.keys(preSelectedServices).length > 0 && (
          <div id="booking-details" className="bg-white shadow-lg rounded-3xl p-5 border border-gray-100 animate-fade-in">
            <h2 className="text-base font-bold text-gray-900 mb-4">Booking Details</h2>
            
            {/* Date & Time Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="font-bold text-gray-900">{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="font-bold text-gray-900">{selectedTime}</p>
              </div>
            </div>

            {/* Services Summary */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Services</p>
              {Object.entries(preSelectedServices).map(([serviceId, quantity]) => {
                const service = services.find(s => s.id === serviceId);
                if (!service) return null;
                return (
                  <div key={serviceId} className="flex items-center justify-between py-2 bg-gray-50 rounded-xl px-3 border border-gray-100">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-600">${service.price} × {quantity as number}</p>
                    </div>
                    <p className="font-bold text-gray-900">${service.price * (quantity as number)}</p>
                  </div>
                );
              })}
            </div>

            {/* Total Price */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
              <p className="text-lg font-bold text-gray-900">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${getTotalPrice()}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {selectedDate && selectedTime && (
          <div className="bg-white shadow-lg rounded-3xl p-5 border border-gray-100 animate-fade-in">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              placeholder="Any specific requests..."
            />
          </div>
        )}

        {/* Confirm Booking Button - Fixed at Bottom */}
        {selectedDate && selectedTime && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white py-4 rounded-full hover:bg-gray-800 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl flex items-center justify-center gap-3 text-base font-bold"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CalendarIcon className="w-5 h-5" />
                  <span>Confirm Booking • ${getTotalPrice()}</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
