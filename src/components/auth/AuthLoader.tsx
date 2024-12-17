import React from 'react';
import { Sparkles } from 'lucide-react';

export function AuthLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-magentiq animate-pulse" />
          </div>
          <div className="absolute inset-0 border-4 border-magentiq/30 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-magentiq rounded-full animate-spin"></div>
        </div>
        <p className="text-lg text-gray-800 font-medium">Initializing...</p>
      </div>
    </div>
  );
}