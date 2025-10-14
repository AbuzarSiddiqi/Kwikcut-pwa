import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { BarberDashboard } from './pages/BarberDashboard';
import { BarberProfile } from './components/customer/BarberProfile';
import { BookingForm } from './components/customer/BookingForm';

const App: React.FC = () => {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl text-gray-600">Loading...</div></div>}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            {/* Customer Routes */}
            <Route 
              path="/customer/dashboard" 
              element={
                <ProtectedRoute requiredType="customer">
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/barber/:barberId" 
              element={
                <ProtectedRoute requiredType="customer">
                  <BarberProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/book/:barberId" 
              element={
                <ProtectedRoute requiredType="customer">
                  <BookingForm />
                </ProtectedRoute>
              } 
            />

            {/* Barber Routes */}
            <Route 
              path="/barber/dashboard" 
              element={
                <ProtectedRoute requiredType="barber">
                  <BarberDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </React.Suspense>
  );
};

export default App;
