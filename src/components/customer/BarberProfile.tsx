import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Barber, Service } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { MapPin, Clock, Phone, Star, ArrowLeft, Search, Plus, Minus } from 'lucide-react';

export const BarberProfile: React.FC = () => {
  const { barberId } = useParams<{ barberId: string }>();
  const navigate = useNavigate();
  
  const [barber, setBarber] = useState<Barber | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (barberId) {
      fetchBarberDetails();
      fetchServices();
    }
  }, [barberId]);

  const fetchBarberDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const barberDoc = await getDoc(doc(db, 'barbers', barberId!));
      
      if (!barberDoc.exists()) {
        setError('Barber not found');
        return;
      }

      setBarber({
        id: barberDoc.id,
        ...barberDoc.data(),
      } as Barber);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load barber details');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
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
    } catch (err: any) {
      console.error('Failed to load services:', err);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = (serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + 1
    }));
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => {
      const newCount = (prev[serviceId] || 0) - 1;
      if (newCount <= 0) {
        const { [serviceId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [serviceId]: newCount };
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedServices).reduce((total, [serviceId, count]) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0) * count;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(selectedServices).reduce((sum, count) => sum + count, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (error || !barber) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorMessage message={error || 'Barber not found'} />
        <button
          onClick={() => navigate('/customer/dashboard')}
          className="mt-4 text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary-50 min-h-screen pb-24">
      {/* Hero Image */}
      <div className="relative h-64">
        {barber.images && barber.images.length > 0 ? (
          <img
            src={barber.images[selectedImage]}
            alt={barber.shopName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-6xl text-white font-bold">
              {barber.shopName.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>

        {/* Image Thumbnails */}
        {barber.images && barber.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {barber.images.map((_, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  selectedImage === index ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shop Info Card */}
      <div className="bg-white mx-4 -mt-6 rounded-2xl shadow-xl p-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{barber.shopName}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="line-clamp-1">{barber.location.address}</span>
            </div>
          </div>
          {barber.rating > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-bold text-gray-900">{barber.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-primary-600" />
            <span>{barber.workingHours.open} - {barber.workingHours.close}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-primary-600" />
            <span>{barber.contact}</span>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="px-4 mt-6 space-y-4">
        {/* Search Services */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-gray-500">No services found</p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const quantity = selectedServices[service.id] || 0;
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{service.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-primary-600 font-bold text-lg">${service.price}</span>
                        <span className="text-gray-500">• {service.duration} min</span>
                      </div>
                    </div>
                    
                    {/* Add/Remove Buttons */}
                    <div className="flex items-center gap-2">
                      {quantity > 0 ? (
                        <>
                          <button
                            onClick={() => handleRemoveService(service.id)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 active:scale-95 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-bold text-gray-900">{quantity}</span>
                          <button
                            onClick={() => handleAddService(service.id)}
                            className="w-8 h-8 flex items-center justify-center bg-primary-600 text-white rounded-full hover:bg-primary-700 active:scale-95 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAddService(service.id)}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-full hover:bg-primary-700 active:scale-95 transition-all shadow-md"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Proceed to Book Pill - Only shows when services selected, positioned above bottom nav */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
          <button
            onClick={() => navigate(`/customer/book/${barberId}`, { 
              state: { selectedServices, services: filteredServices } 
            })}
            className="w-full bg-gray-900 text-white py-3.5 rounded-full hover:bg-gray-800 active:scale-98 transition-all shadow-2xl flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{getTotalItems()}</span>
              </div>
              <span className="font-bold text-base">Proceed to Book</span>
            </div>
            <span className="text-lg font-bold">${getTotalPrice()}</span>
          </button>
        </div>
      )}
    </div>
  );
};
