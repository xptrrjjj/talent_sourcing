import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  message?: string;
  isTransparent?: boolean;
}

export function LoadingOverlay({ message = 'Loading...', isTransparent = false }: Props) {
  return (
    <div className={`fixed inset-0 ${isTransparent ? 'bg-white/50' : 'bg-white'} flex items-center justify-center z-50`}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900">{message}</p>
      </div>
    </div>
  );
}