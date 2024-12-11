import React from 'react';
import { Search, ChevronDown, Users } from 'lucide-react';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: 'all' | 'draft' | 'active' | 'archived') => void;
  companyFilter: string;
  onCompanyChange: (value: string) => void;
  companies: string[];
  showAllUsers: boolean;
  onShowAllUsersChange: (value: boolean) => void;
}

export function SavedPositionsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  companyFilter,
  onCompanyChange,
  companies,
  showAllUsers,
  onShowAllUsersChange
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
      <div className="relative flex-1 md:flex-none">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search positions or companies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-magentiq focus:border-magentiq"
        />
      </div>
      
      <div className="flex gap-4">
        <div className="relative">
          <select
            value={companyFilter}
            onChange={(e) => onCompanyChange(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-magentiq focus:border-magentiq"
          >
            <option value="all">All Companies</option>
            {companies.filter(c => c !== 'all').map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-magentiq focus:border-magentiq"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <button
          onClick={() => onShowAllUsersChange(!showAllUsers)}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
            showAllUsers
              ? 'border-magentiq text-magentiq bg-magentiq/5'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          {showAllUsers ? 'All Users' : 'My Roles'}
        </button>
      </div>
    </div>
  );
}