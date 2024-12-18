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
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { analyzePosition } from '../services/analysis';
import { useCompanies } from '../hooks/companies';
import { usePositions } from '../hooks/positions';
import { useUserContext } from '../contexts/UserContext';
import type { JobFormData, TalentAnalysis, Company, CompanyFormData } from '../types';

export function Dashboard() {
  const { currentUser } = useUserContext();
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
      setIsSaving(true);
      await handleCompanySubmit(data, companyToEdit?.id);
      setShowCompanyForm(false);
      setCompanyToEdit(null);
    } catch (err) {
      setError('Failed to save company');
    } finally {
      setIsSaving(false);
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

  const handleAnalyze = async (data: JobFormData) => {
    if (!selectedCompany) return;

    setError(null);
    setIsAnalyzing(true);
    
    try {
      const result = await analyzePosition(data);
      setAnalysis(result.analysis);
      setRawGeminiAnalysis(result.rawGeminiAnalysis);
      setCurrentFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCompany || !currentFormData || !analysis || !currentUser) return;

    setIsSaving(true);
    try {
      await createPosition(
        currentFormData,
        analysis,
        {
          companyName: selectedCompany.name,
          website: selectedCompany.website,
          contactName: selectedCompany.contactName,
          source: selectedCompany.source,
          onshoreLocation: selectedCompany.onshoreLocation
        }
      );
      setActiveTab('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save position');
    } finally {
      setIsSaving(false);
    }
  };

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
                  isLoading={isLoadingCompanies}
                />
              )}
            </div>

            {selectedCompany && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Position Details</h2>
                <JobForm
                  onSubmit={handleAnalyze}
                  isLoading={isAnalyzing}
                  selectedCompany={selectedCompany}
                />
              </div>
            )}

            {analysis && currentFormData && (
              <>
                <AnalysisResult
                  analysis={analysis}
                  rawGeminiAnalysis={rawGeminiAnalysis}
                />
                <EditableJobDescription
                  jobDescription={analysis.jobDescription}
                  onSave={(updatedDescription) => {
                    setAnalysis(prev => prev ? {
                      ...prev,
                      jobDescription: updatedDescription
                    } : null);
                  }}
                />
                <RoleActions
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              </>
            )}
          </div>
        );

      case 'saved':
        return (
          <SavedPositions
            positions={positions}
            onSelect={(position) => {
              console.log('Selected position:', position);
            }}
            isLoading={isLoadingPositions}
          />
        );

      case 'pipeline':
        return <ApplicationStages />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      {renderContent()}
      {isAnalyzing && (
        <LoadingOverlay 
          message="Analyzing position..." 
          isTransparent
        />
      )}
      {isSaving && (
        <LoadingOverlay 
          message="Saving..." 
          isTransparent
        />
      )}
    </DashboardLayout>
  );
}