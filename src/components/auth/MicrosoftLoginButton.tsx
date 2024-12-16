import React from 'react';
import { LayoutGrid } from 'lucide-react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function MicrosoftLoginButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2F2F2F] hover:bg-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
    >
      <LayoutGrid className="w-5 h-5 mr-2" />
      Sign in with Microsoft 365
    </button>
  );
}