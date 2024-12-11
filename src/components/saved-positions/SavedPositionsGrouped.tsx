import React from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import type { SavedPosition } from '../../types';
import { SavedPositionCard } from './SavedPositionCard';

interface Props {
  positions: SavedPosition[];
  onSelect: (position: SavedPosition) => void;
}

export function SavedPositionsGrouped({ positions, onSelect }: Props) {
  // Group positions by company
  const groupedPositions = positions.reduce((acc, position) => {
    const companyName = position.companyData.companyName;
    if (!acc[companyName]) {
      acc[companyName] = {
        companyData: position.companyData,
        positions: []
      };
    }
    acc[companyName].positions.push(position);
    return acc;
  }, {} as Record<string, { companyData: SavedPosition['companyData']; positions: SavedPosition[] }>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedPositions).map(([companyName, group]) => (
        <div key={companyName} className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{companyName}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{group.companyData.contactName}</span>
                    <span>•</span>
                    <span>{group.companyData.onshoreLocation}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {group.positions.length} {group.positions.length === 1 ? 'Position' : 'Positions'}
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {group.positions.map((position) => (
              <div key={position.id} className="px-6 py-4">
                <SavedPositionCard
                  position={position}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}