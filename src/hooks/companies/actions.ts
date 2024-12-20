import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Company, CompanyFormData } from '../../types';
import { getCompanies, saveCompany, deleteCompany } from '../../services/storage';
import type { UseCompaniesState } from './types';

export function useCompaniesActions(state: UseCompaniesState) {
  const {
    setCompanies,
    setSelectedCompany,
    setIsLoading,
    setError
  } = state;

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCompanies = await getCompanies();
      setCompanies(fetchedCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  }, [setCompanies, setIsLoading, setError]);

  const handleCompanySubmit = useCallback(async (data: CompanyFormData, editId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const company: Company = {
        id: editId || nanoid(),
        name: data.companyName,
        website: data.website || '',
        contactName: data.contactName,
        source: data.source,
        onshoreLocation: data.onshoreLocation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await saveCompany(company);
      await fetchCompanies();
      setSelectedCompany(company);
      return company;
    } catch (err) {
      console.error('Error in handleCompanySubmit:', err);
      setError('Failed to save company');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchCompanies, setIsLoading, setError, setSelectedCompany]);

  const handleCompanyDelete = useCallback(async (id: string) => {
    try {
      console.log("This gets triggered bro")
      await deleteCompany(id);

      await fetchCompanies();
      setSelectedCompany(null);
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company');
      throw err;
    }
  }, [fetchCompanies, setSelectedCompany, setError]);

  return {
    fetchCompanies,
    handleCompanySubmit,
    handleCompanyDelete
  };
}