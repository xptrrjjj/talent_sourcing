import type { SavedPosition, JobFormData, TalentAnalysis } from '../../types';

export interface UsePositionsState {
  positions: SavedPosition[];
  isLoading: boolean;
  error: string | null;
}

export interface UsePositionsActions {
  fetchPositions: () => Promise<void>;
  createPosition: (
    formData: JobFormData,
    analysis: TalentAnalysis,
    companyData: SavedPosition['companyData']
  ) => Promise<SavedPosition>;
}

export type UsePositionsReturn = UsePositionsState & UsePositionsActions;