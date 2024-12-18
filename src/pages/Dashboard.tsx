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

  const handleJobFormSubmit = async (data: JobFormData) => {
    if (!selectedCompany) {
      setError('Please select a company first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

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

  const handleSavePosition = async () => {
    if (!selectedCompany || !currentFormData || !analysis) {
      setError('Missing required data to save position');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const companyData = {
        companyName: selectedCompany.name,
        website: selectedCompany.website,
        contactName: selectedCompany.contactName,
        source: selectedCompany.source,
        onshoreLocation: selectedCompany.onshoreLocation
      };

      await createPosition(currentFormData, analysis, companyData);
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
                />
              )}
            </div>

            {selectedCompany && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Role Details</h2>
                <JobForm
                  onSubmit={handleJobFormSubmit}
                  isLoading={isAnalyzing}
                  selectedCompany={selectedCompany}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
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
                    setAnalysis({
                      ...analysis,
                      jobDescription: updatedDescription
                    });
                  }}
                />
                <RoleActions
                  onSave={handleSavePosition}
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
              // Handle saved position selection
              console.log('Selected position:', position);
            }}
          />
        );

      case 'pipeline':
        return <ApplicationStages />;

      default:
        return null;
    }
  };

  if (isLoadingCompanies) {
    return <LoadingOverlay message="Loading..." />;
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}