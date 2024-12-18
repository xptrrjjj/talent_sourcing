import React, { useState } from 'react';
import type { SavedPosition } from '../types';
import { SavedPositionsFilters } from './saved-positions/SavedPositionsFilters';
import { SavedPositionsGrouped } from './saved-positions/SavedPositionsGrouped';
import { useUserContext } from '../contexts/UserContext';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface Props {
  positions: SavedPosition[];
  onSelect: (position: SavedPosition) => void;
  isLoading?: boolean;
}

export function SavedPositions({ positions, onSelect, isLoading }: Props) {
  const { currentUser } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'archived'>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Get unique company names from valid positions
  const companies = Array.from(new Set(
    positions
      .filter(p => p && p.companyData && p.companyData.companyName)
      .map(p => p.companyData.companyName)
  ));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter positions
  const filteredPositions = positions.filter(position => {
    if (!position || !position.companyData || !position.formData) return false;

    const matchesSearch = 
      position.formData.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.companyData.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || position.status === statusFilter;
    const matchesCompany = companyFilter === 'all' || position.companyData.companyName === companyFilter;
    const matchesUser = showAllUsers || position.userId === currentUser?.id;
    
    return matchesSearch && matchesStatus && matchesCompany && matchesUser;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Saved Positions</h2>
          <SavedPositionsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            companyFilter={companyFilter}
            onCompanyChange={setCompanyFilter}
            companies={companies}
            showAllUsers={showAllUsers}
            onShowAllUsersChange={setShowAllUsers}
          />
        </div>
      </div>

      {filteredPositions.length > 0 ? (
        <SavedPositionsGrouped
          positions={filteredPositions}
          onSelect={onSelect}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
          {searchTerm ? `No positions found matching "${searchTerm}"` : 'No saved positions yet'}
        </div>
      )}
    </div>
  );
}