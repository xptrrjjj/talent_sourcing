import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { getCompanies, saveCompany, deleteCompany } from '../services/storage';
import type { Company, CompanyFormData } from '../types';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  // Only fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []); // Remove fetchCompanies from dependencies

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
      
      // Update local state directly instead of fetching
      setCompanies(prev => {
        const index = prev.findIndex(c => c.id === company.id);
        if (index >= 0) {
          return [...prev.slice(0, index), company, ...prev.slice(index + 1)];
        }
        return [...prev, company];
      });
      
      setSelectedCompany(company);
      return company;
    } catch (err) {
      console.error('Error in handleCompanySubmit:', err);
      setError('Failed to save company');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCompanyDelete = useCallback(async (id: string) => {
    try {
      await deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      if (selectedCompany?.id === id) {
        setSelectedCompany(null);
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('Failed to delete company');
      throw err;
    }
  }, [selectedCompany]);

  return {
    companies,
    selectedCompany,
    isLoading,
    error,
    setSelectedCompany,
    fetchCompanies,
    handleCompanySubmit,
    handleCompanyDelete
  };
}