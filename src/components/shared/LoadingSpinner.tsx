import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24, 
  className = '',
  fullScreen = false 
}) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary-600" size={size} />
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className="animate-spin text-primary-600" size={size} />
    </div>
  );
};
