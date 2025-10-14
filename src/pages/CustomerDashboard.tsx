import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarberList } from '../components/customer/BarberList';
import { CustomerBookings } from '../components/customer/CustomerBookings';

type TabType = 'home' | 'bookings' | 'favourites';

export const CustomerDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ccfbf1' }}>
      {/* Glassmorphism Header */}
      <header className="sticky top-0 bg-white/70 backdrop-blur-xl z-40 border-b border-white/20 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">KwikCut</h1>
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#115e59' }}
            >
              <User className="w-5 h-5 text-white" />
            </button>
            
            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/20">
                    <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Full Width, Scrollable */}
      <main className="pb-28">
        {activeTab === 'home' && (
          <div className="px-4 pt-4">
            <BarberList />
          </div>
        )}
        {activeTab === 'bookings' && (
          <div className="px-4 pt-4">
            <CustomerBookings />
          </div>
        )}
        {activeTab === 'favourites' && (
          <div className="px-4 pt-4">
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favourites Yet</h3>
              <p className="text-gray-500">Save your favorite salons here</p>
            </div>
          </div>
        )}
      </main>

      {/* Glassmorphism Pill Bottom Navigation */}
      <nav 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showNavbar ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
        }`}
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 shadow-2xl flex items-center gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
              activeTab === 'home'
                ? 'text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
            style={activeTab === 'home' ? { backgroundColor: '#115e59' } : {}}
          >
            <Home className="w-5 h-5" />
            {activeTab === 'home' && <span className="text-sm font-semibold">Home</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
              activeTab === 'bookings'
                ? 'text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
            style={activeTab === 'bookings' ? { backgroundColor: '#115e59' } : {}}
          >
            <Calendar className="w-5 h-5" />
            {activeTab === 'bookings' && <span className="text-sm font-semibold">Bookings</span>}
          </button>
          
          <button
            onClick={() => setActiveTab('favourites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
              activeTab === 'favourites'
                ? 'text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/50'
            }`}
            style={activeTab === 'favourites' ? { backgroundColor: '#115e59' } : {}}
          >
            <Heart className="w-5 h-5" />
            {activeTab === 'favourites' && <span className="text-sm font-semibold">Favourites</span>}
          </button>
        </div>
      </nav>
    </div>
  );
};
