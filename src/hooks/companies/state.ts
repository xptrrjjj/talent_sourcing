import { useState } from 'react';
import type { Company } from '../../types';
import type { UseCompaniesState } from './types';

export function useCompaniesState(): UseCompaniesState {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    companies,
    selectedCompany,
    isLoading,
    error,
    setCompanies,
    setSelectedCompany,
    setIsLoading,
    setError
  };
}