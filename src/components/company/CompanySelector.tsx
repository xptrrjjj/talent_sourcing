import React, { useState } from 'react';
import { Plus, Building2, Search, MapPin, Edit2, Archive, MoreVertical } from 'lucide-react';
import type { Company } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface Props {
  companies: Company[];
  selectedCompany: Company | null;
  onSelect: (company: Company) => void;
  onCreateNew: () => void;
  onEdit: (company: Company) => void;
  onArchive: (company: Company) => void;
  isLoading?: boolean;
}

export function CompanySelector({ 
  companies = [], 
  selectedCompany, 
  onSelect, 
  onCreateNew,
  onEdit,
  onArchive,
  isLoading 
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);

  // Ensure companies is always an array and filter only valid companies
  const validCompanies = Array.isArray(companies) ? companies.filter(company => 
    company && company.name && company.contactName
  ) : [];

  const filteredCompanies = validCompanies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-magentiq focus:border-magentiq"
        />
      </div>

      {filteredCompanies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className={`group relative flex items-start p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                selectedCompany?.id === company.id
                  ? 'border-magentiq bg-magentiq/5'
                  : 'border-gray-200 hover:border-magentiq/50'
              }`}
              onClick={() => onSelect(company)}
            >
              <Building2 className={`w-6 h-6 mr-3 flex-shrink-0 ${
                selectedCompany?.id === company.id ? 'text-magentiq' : 'text-gray-400'
              }`} />
              <div className="flex-grow text-left">
                <h3 className="font-medium text-gray-900">{company.name}</h3>
                <p className="text-sm text-gray-600">{company.contactName}</p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {company.onshoreLocation}
                </div>
              </div>
              
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionsFor(showActionsFor === company.id ? null : company.id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
                
                {showActionsFor === company.id && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(company);
                        setShowActionsFor(null);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive(company);
                        setShowActionsFor(null);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? `No companies found matching "${searchTerm}"` : 'No companies available'}
        </div>
      )}

      <button
        onClick={onCreateNew}
        className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-magentiq hover:text-magentiq transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Company
      </button>
    </div>
  );
}