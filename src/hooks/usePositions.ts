import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { getSavedPositions, savePosition } from '../services/storage';
import type { SavedPosition, JobFormData, TalentAnalysis } from '../types';
import { useUserContext } from '../contexts/UserContext';

export function usePositions() {
  const { currentUser } = useUserContext();
  const [positions, setPositions] = useState<SavedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const fetchedPositions = await getSavedPositions();
      setPositions(fetchedPositions.filter(p => p && p.companyData && p.formData));
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError('Failed to load positions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const createPosition = useCallback(async (
    formData: JobFormData,
    analysis: TalentAnalysis,
    companyData: SavedPosition['companyData']
  ) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newPosition: SavedPosition = {
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name,
        status: 'draft',
        companyData,
        formData: {
          ...formData,
          companyId: companyData.companyName // Use company name as ID for now
        },
        analysis
      };
      
      await savePosition(newPosition);
      await fetchPositions(); // Refresh the list
      return newPosition;
    } catch (err) {
      setError('Failed to save position');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchPositions]);

  return {
    positions,
    isLoading,
    error,
    fetchPositions,
    createPosition
  };
}