import React from 'react';
import type { SavedPosition } from '../../types';

interface Props {
  position: SavedPosition;
  onSelect: (position: SavedPosition) => void;
}

export function SavedPositionCard({ position, onSelect }: Props) {
  return (
    <div
      onClick={() => onSelect(position)}
      className="hover:bg-gray-50 cursor-pointer transition-colors rounded-lg"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{position.formData.jobTitle}</h4>
          <p className="text-sm text-gray-500">Created by: {position.userName}</p>
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
  );
}