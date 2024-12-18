import { nanoid } from 'nanoid';
import type { SavedPosition, JobFormData, TalentAnalysis } from '../../types';
import { savePosition } from '../../services/storage/positions/operations';
import { useUserContext } from '../../contexts/UserContext';
import type { UsePositionsState } from './types';

export function usePositionsActions(state: UsePositionsState) {
  const { currentUser } = useUserContext();
  const { setPositions, setIsLoading, setError } = state;

  const createPosition = async (
    formData: JobFormData,
    analysis: TalentAnalysis,
    companyData: SavedPosition['companyData']
  ) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure we have valid user data
      if (!currentUser.id || !currentUser.name) {
        throw new Error('Invalid user data');
      }

      const newPosition: SavedPosition = {
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.name || 'Unknown User', // Fallback name if missing
        status: 'draft',
        companyData,
        formData: {
          ...formData,
          companyId: companyData.companyName
        },
        analysis
      };
      
      await savePosition(newPosition);
      
      // Update local state
      setPositions(prev => [...prev, newPosition]);
      
      return newPosition;
    } catch (err) {
      console.error('Failed to create position:', err);
      setError('Failed to save position');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPosition
  };
}