import type { Company, CompanyFormData } from '../../types';

export interface UseCompaniesState {
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  setCompanies: (companies: Company[]) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface UseCompaniesActions {
  fetchCompanies: () => Promise<void>;
  handleCompanySubmit: (data: CompanyFormData, editId?: string) => Promise<Company>;
  handleCompanyDelete: (id: string) => Promise<void>;
}

export type UseCompaniesReturn = Omit<UseCompaniesState, 'setCompanies' | 'setIsLoading' | 'setError'> & UseCompaniesActions;