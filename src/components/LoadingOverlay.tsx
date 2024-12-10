import React from 'react';
import { Loader } from 'lucide-react';

interface Props {
  message?: string;
}

export function LoadingOverlay({ message = 'Analyzing position...' }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-lg text-gray-800 font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        
        <div className="mt-6">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-1 bg-blue-600 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}