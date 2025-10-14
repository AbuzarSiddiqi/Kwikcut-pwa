import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  variant?: 'error' | 'warning';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onClose,
  variant = 'error' 
}) => {
  const bgColor = variant === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const textColor = variant === 'error' ? 'text-red-800' : 'text-yellow-800';
  const Icon = variant === 'error' ? AlertCircle : AlertCircle;

  return (
    <div className={`${bgColor} ${textColor} px-4 py-3 rounded-lg flex items-start gap-3 animate-fade-in`}>
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <XCircle size={20} />
        </button>
      )}
    </div>
  );
};
