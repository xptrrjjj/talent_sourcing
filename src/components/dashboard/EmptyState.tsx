import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: Props) {
  return (
    <div className="text-center py-12">
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 max-w-lg mx-auto">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <Plus className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}