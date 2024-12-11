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
import { useCompanies } from '../hooks/useCompanies';
import { usePositions } from '../hooks/usePositions';
import type { JobFormData, TalentAnalysis, Company } from '../types';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'create' | 'saved' | 'pipeline'>('create');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<TalentAnalysis | null>(null);
  const [rawGeminiAnalysis, setRawGeminiAnalysis] = useState<any>(null);
  const [currentFormData, setCurrentFormData] = useState<JobFormData | null>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<string | null>(null);
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
      await handleCompanySubmit(data, companyToEdit || undefined);
      setShowCompanyForm(false);
      setCompanyToEdit(null);
    } catch (err) {
      setError('Failed to save company');
    }
  };

  const handleEditCompany = (id: string) => {
    setCompanyToEdit(id);
    setShowCompanyForm(true);
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setAnalysis(null);
    setCurrentFormData(null);
    setError(null);
  };

  const handleJobSubmit = async (data: JobFormData) => {
    if (!selectedCompany) {
      setError('Please select or create a company first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setCurrentFormData(data);
    setRawGeminiAnalysis(null);
    
    try {
      const result = await analyzePosition(data);
      setAnalysis(result.analysis);
      setRawGeminiAnalysis(result.rawGeminiAnalysis);
    } catch (err) {
      setError('Failed to analyze position. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!currentFormData || !selectedCompany || !analysis) return;
    
    setIsSaving(true);
    try {
      await createPosition(currentFormData, analysis, {
        companyName: selectedCompany.name,
        website: selectedCompany.website,
        contactName: selectedCompany.contactName,
        source: selectedCompany.source,
        onshoreLocation: selectedCompany.onshoreLocation
      });
      setActiveTab('saved');
    } catch (err) {
      setError('Failed to save position');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePositionSelect = (position: SavedPosition) => {
    setAnalysis(position.analysis);
    setCurrentFormData(position.formData);
    const company = companies.find(c => c.name === position.companyData.companyName);
    setSelectedCompany(company || null);
    setActiveTab('create');
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
                  initialData={companyToEdit ? companies.find(c => c.id === companyToEdit) : undefined}
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Position Details</h2>
                <JobForm 
                  onSubmit={handleJobSubmit} 
                  isLoading={isAnalyzing} 
                  selectedCompany={selectedCompany}
                  initialData={currentFormData}
                />
              </div>
            )}

            {isAnalyzing && <LoadingOverlay />}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {analysis && currentFormData && !isAnalyzing && (
              <>
                <EditableJobDescription
                  jobDescription={analysis.jobDescription}
                  onSave={(description) => {
                    setAnalysis({ ...analysis, jobDescription: description });
                  }}
                />
                <AnalysisResult 
                  analysis={analysis} 
                  rawGeminiAnalysis={rawGeminiAnalysis}
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
        return positions.length > 0 ? (
          <SavedPositions positions={positions} onSelect={handlePositionSelect} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No saved positions yet. Create your first position to get started.
          </div>
        );

      case 'pipeline':
        return <ApplicationStages />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}