import { useState } from 'react';
import type { SavedPosition } from '../../types';
import type { UsePositionsState } from './types';

export function usePositionsState(): UsePositionsState {
  const [positions, setPositions] = useState<SavedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    positions,
    isLoading,
    error,
    setPositions,
    setIsLoading,
    setError
  };
}