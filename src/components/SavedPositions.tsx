import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, Building2 } from 'lucide-react';
import type { SavedPosition } from '../types';

interface Props {
  positions: SavedPosition[];
  onSelect: (position: SavedPosition) => void;
}

export function SavedPositions({ positions, onSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'archived'>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  // Get unique company names
  const companies = useMemo(() => {
    const uniqueCompanies = new Set(positions.map(p => p.companyData.companyName));
    return ['all', ...Array.from(uniqueCompanies)];
  }, [positions]);

  const filteredPositions = positions.filter(position => {
    const matchesSearch = 
      position.formData.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.companyData.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || position.status === statusFilter;
    const matchesCompany = companyFilter === 'all' || position.companyData.companyName === companyFilter;
    return matchesSearch && matchesStatus && matchesCompany;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Saved Positions</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search positions or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-magentiq focus:border-magentiq"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
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
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-magentiq focus:border-magentiq"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPositions.length > 0 ? (
          filteredPositions.map((position) => (
            <div
              key={position.id}
              onClick={() => onSelect(position)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{position.formData.jobTitle}</h3>
                    <p className="text-sm text-gray-600">{position.companyData.companyName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${position.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      position.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(position.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {position.formData.requiredSkills.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No positions found {searchTerm ? `matching "${searchTerm}"` : ''}
          </div>
        )}
      </div>
    </div>
  );
}