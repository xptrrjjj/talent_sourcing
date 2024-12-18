import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { JobForm } from '../components/JobForm';
import { CompanyForm } from '../components/company/CompanyForm';
import { CompanySelector } from '../components/company/CompanySelector';
import { SavedPositions } from '../components/SavedPositions';
import { ApplicationStages } from '../components/ApplicationStages';
import { AnalysisResult } from '../components/AnalysisResult';
import { EditableJobDescription } from '../components/EditableJobDescription';
import { RoleActions } from '../components/role/RoleActions';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { analyzePosition } from '../services/analysis';
import { useCompanies } from '../hooks/companies';
import { usePositions } from '../hooks/positions';
import type { JobFormData, TalentAnalysis, Company, CompanyFormData } from '../types';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'create' | 'saved' | 'pipeline'>('create');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<TalentAnalysis | null>(null);
  const [rawGeminiAnalysis, setRawGeminiAnalysis] = useState<any>(null);
  const [currentFormData, setCurrentFormData] = useState<JobFormData | null>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    companies,
    selectedCompany,
    isLoading: isLoadingCompanies,
    setSelectedCompany,
    handleCompanySubmit,
    handleCompanyDelete
  } = useCompanies();

  const {
    positions,
    isLoading: isLoadingPositions,
    createPosition
  } = usePositions();

  const handleCompanyFormSubmit = async (data: CompanyFormData) => {
    try {
      await handleCompanySubmit(data, companyToEdit?.id);
      setShowCompanyForm(false);
      setCompanyToEdit(null);
    } catch (err) {
      setError('Failed to save company');
    }
  };

  const handleEditCompany = (company: Company) => {
    setCompanyToEdit(company);
    setShowCompanyForm(true);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setAnalysis(null);
    setCurrentFormData(null);
    setError(null);
  };

  // Rest of the component remains the same...

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>
              {showCompanyForm ? (
                <CompanyForm 
                  onSubmit={handleCompanyFormSubmit}
                  onCancel={() => {
                    setShowCompanyForm(false);
                    setCompanyToEdit(null);
                  }}
                  initialData={companyToEdit}
                />
              ) : (
                <CompanySelector
                  companies={companies}
                  selectedCompany={selectedCompany}
                  onSelect={handleCompanySelect}
                  onCreateNew={() => setShowCompanyForm(true)}
                  onEdit={handleEditCompany}
                  onArchive={handleCompanyDelete}
                />
              )}
            </div>

            {/* Rest of the render content remains the same... */}
          </div>
        );

      // Other cases remain the same...
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}