import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Package, Calendar, Image, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarberProfileSetup } from '../components/barber/BarberProfileSetup';
import { ServiceManagement } from '../components/barber/ServiceManagement';
import { BarberBookingsManager } from '../components/barber/BarberBookingsManager';
import { GalleryManagement } from '../components/barber/GalleryManagement';
import { RevenueDashboard } from '../components/barber/RevenueDashboard';

type TabType = 'profile' | 'services' | 'bookings' | 'gallery' | 'revenue';

export const BarberDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">KwikCut</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 hidden sm:inline">Welcome, {currentUser?.name}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
            <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
              <Calendar className="w-5 h-5" />
              Bookings
            </button>
            <button onClick={() => setActiveTab('services')} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'services' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
              <Package className="w-5 h-5" />
              Services
            </button>
            <button onClick={() => setActiveTab('gallery')} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'gallery' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
              <Image className="w-5 h-5" />
              Gallery
            </button>
            <button onClick={() => setActiveTab('revenue')} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'revenue' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
              <DollarSign className="w-5 h-5" />
              Revenue
            </button>
            <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
              <Settings className="w-5 h-5" />
              Profile
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' && <BarberProfileSetup />}
        {activeTab === 'services' && <ServiceManagement />}
        {activeTab === 'bookings' && <BarberBookingsManager />}
        {activeTab === 'gallery' && <GalleryManagement />}
        {activeTab === 'revenue' && <RevenueDashboard />}
      </main>
    </div>
  );
};
