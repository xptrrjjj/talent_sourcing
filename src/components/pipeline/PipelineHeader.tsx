import React from 'react';
import { Plus, Filter, SortAsc } from 'lucide-react';

interface Props {
  onAddCandidate: () => void;
  onFilter: () => void;
  onSort: () => void;
}

export function PipelineHeader({ onAddCandidate, onFilter, onSort }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={onFilter}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button
            onClick={onSort}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <SortAsc className="w-4 h-4 mr-2" />
            Sort
          </button>
          <button
            onClick={onAddCandidate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-magentiq hover:bg-magentiq/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </button>
        </div>
      </div>
    </div>
  );
}