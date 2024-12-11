import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  message?: string;
}

export function LoadingOverlay({ message = 'Analyzing position...' }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-magentiq animate-pulse" />
          </div>
          <div className="absolute inset-0 border-4 border-magentiq/30 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-magentiq rounded-full animate-spin"></div>
        </div>
        <p className="text-lg text-gray-800 font-medium">{message}</p>
        <p className="text-sm text-gray-500 mt-2">Analyzing with ChatGPT and Google Gemini</p>
      </div>
    </div>
  );
}