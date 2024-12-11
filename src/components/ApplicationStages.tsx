import React, { useState } from 'react';
import { PipelineHeader } from './pipeline/PipelineHeader';
import { ApplicationStage } from './pipeline/ApplicationStage';
import type { ApplicationStage as StageType } from '../types';

const DEFAULT_STAGES: StageType[] = [
  {
    id: '1',
    name: 'Applied',
    candidates: []
  },
  {
    id: '2',
    name: 'Screening',
    candidates: []
  },
  {
    id: '3',
    name: 'Interview',
    candidates: []
  },
  {
    id: '4',
    name: 'Offer',
    candidates: []
  },
  {
    id: '5',
    name: 'Hired',
    candidates: []
  }
];

interface Props {
  stages?: StageType[];
}

export function ApplicationStages({ stages = DEFAULT_STAGES }: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const handleAddCandidate = () => {
    // TODO: Implement add candidate functionality
    console.log('Add candidate clicked');
  };

  return (
    <div className="space-y-6">
      <PipelineHeader
        onAddCandidate={handleAddCandidate}
        onFilter={() => setShowFilters(!showFilters)}
        onSort={() => setShowSort(!showSort)}
      />

      <div className="flex gap-6 overflow-x-auto pb-6">
        {stages.map((stage, index) => (
          <ApplicationStage
            key={stage.id}
            stage={stage}
            isLast={index === stages.length - 1}
          />
        ))}
      </div>
    </div>
  );
}