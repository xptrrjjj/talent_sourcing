import { useEffect } from 'react';
import { useCompaniesState } from './state';
import { useCompaniesActions } from './actions';
import type { UseCompaniesReturn } from './types';

export function useCompanies(): UseCompaniesReturn {
  const state = useCompaniesState();
  const actions = useCompaniesActions(state);

  // Fetch companies on mount
  useEffect(() => {
    actions.fetchCompanies();
  }, [actions.fetchCompanies]);

  return {
    ...state,
    ...actions
  };
}

export type { UseCompaniesReturn };