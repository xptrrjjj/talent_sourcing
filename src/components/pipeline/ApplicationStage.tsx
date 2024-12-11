import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { ApplicationStage as StageType } from '../../types';

interface Props {
  stage: StageType;
  isLast?: boolean;
}

export function ApplicationStage({ stage, isLast }: Props) {
  return (
    <div className="flex-1">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{stage.name}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {stage.candidates.length}
          </span>
        </div>
        
        <div className="space-y-3">
          {stage.candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{candidate.name}</p>
                  <p className="text-sm text-gray-500">{candidate.role}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(candidate.updatedAt).toLocaleDateString()}
                </span>
              </div>
              {candidate.tags && candidate.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {candidate.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {!isLast && (
        <div className="flex items-center justify-center my-4">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
  );
}