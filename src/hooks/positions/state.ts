import { useState, useEffect } from 'react';
import type { SavedPosition } from '../../types';
import { getSavedPositions } from '../../services/storage/positions/operations';
import type { UsePositionsState } from './types';

export function usePositionsState(): UsePositionsState {
  const [positions, setPositions] = useState<SavedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch positions on mount
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const fetchedPositions = await getSavedPositions();
        setPositions(fetchedPositions);
      } catch (err) {
        console.error('Error fetching positions:', err);
        setError('Failed to load positions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, []);

  return {
    positions,
    isLoading,
    error,
    setPositions,
    setIsLoading,
    setError
  };
}