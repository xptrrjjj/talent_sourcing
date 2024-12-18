import { nanoid } from 'nanoid';
import type { SavedPosition, JobFormData, TalentAnalysis } from '../../types';
import { getSavedPositions, savePosition } from '../../services/storage/positions';
import { useUserContext } from '../../contexts/UserContext';
import type { UsePositionsState } from './types';

export function usePositionsActions(state: UsePositionsState) {
  const { currentUser } = useUserContext();
  const { setPositions, setIsLoading, setError } = state;

  const fetchPositions = async () => {
    try {
      const fetchedPositions = await getSavedPositions();
      setPositions(fetchedPositions.filter(p => p && p.companyData && p.formData));
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError('Failed to load positions');
    } finally {
      setIsLoading(false);
    }
  };

  const createPosition = async (
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
          companyId: companyData.companyName
        },
        analysis
      };
      
      await savePosition(newPosition);
      await fetchPositions();
      return newPosition;
    } catch (err) {
      setError('Failed to save position');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchPositions,
    createPosition
  };
}