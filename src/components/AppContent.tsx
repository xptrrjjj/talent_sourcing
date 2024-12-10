import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from './auth/LoginForm';
import { DashboardLayout } from './dashboard/DashboardLayout';
import { JobForm } from './JobForm';
import { CompanyForm } from './company/CompanyForm';
import { CompanySelector } from './company/CompanySelector';
import { SavedPositions } from './SavedPositions';
import { ApplicationStages } from './ApplicationStages';
import { AnalysisResult } from './AnalysisResult';
import { EditableJobDescription } from './EditableJobDescription';
import { RoleActions } from './role/RoleActions';
import { EmptyState } from './dashboard/EmptyState';
import { LoadingOverlay } from './LoadingOverlay';
import { analyzePosition } from '../services/openai';
import { savePosition, getPositions, saveCompany, getCompanies, updatePosition } from '../services/api/datastore';
import { nanoid } from 'nanoid';
import type { JobFormData, TalentAnalysis, SavedPosition, CompanyFormData, Company } from '../types';

export function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <MainContent />;
}

function MainContent() {
  const [activeTab, setActiveTab] = useState<'create' | 'saved' | 'pipeline'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<TalentAnalysis | null>(null);
  const [currentFormData, setCurrentFormData] = useState<JobFormData | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<SavedPosition[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [positionsData, companiesData] = await Promise.all([
          getPositions(),
          getCompanies()
        ]);
        setPositions(positionsData);
        setCompanies(companiesData);
      } catch (error) {
        setError('Failed to load data');
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  const handleCompanySubmit = async (data: CompanyFormData) => {
    try {
      const company: Company = {
        id: companyToEdit?.id || nanoid(),
        name: data.companyName,
        website: data.website,
        contactName: data.contactName,
        source: data.source,
        onshoreLocation: data.onshoreLocation,
        createdAt: companyToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await saveCompany(company);
      const updatedCompanies = await getCompanies();
      setCompanies(updatedCompanies);
      setSelectedCompany(company);
      setShowCompanyForm(false);
      setCompanyToEdit(null);
    } catch (error) {
      setError('Failed to save company');
      console.error('Error saving company:', error);
    }
  };

  const handleEditCompany = (company: Company) => {
    setCompanyToEdit(company);
    setShowCompanyForm(true);
  };

  const handleArchiveCompany = async (company: Company) => {
    if (window.confirm(`Are you sure you want to archive ${company.name}?`)) {
      try {
        await saveCompany({ ...company, status: 'archived' });
        const updatedCompanies = await getCompanies();
        setCompanies(updatedCompanies);
        if (selectedCompany?.id === company.id) {
          setSelectedCompany(null);
        }
      } catch (error) {
        setError('Failed to archive company');
        console.error('Error archiving company:', error);
      }
    }
  };

  const handleJobSubmit = async (data: JobFormData) => {
    if (!selectedCompany) {
      setError('Please select or create a company first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setCurrentFormData(data);
    
    try {
      const result = await analyzePosition(data);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze position. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentFormData || !selectedCompany || !analysis) return;
    
    setIsSaving(true);
    try {
      const newPosition: SavedPosition = {
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyData: {
          companyName: selectedCompany.name,
          website: selectedCompany.website,
          contactName: selectedCompany.contactName,
          source: selectedCompany.source,
          onshoreLocation: selectedCompany.onshoreLocation
        },
        formData: currentFormData,
        analysis,
        status: 'draft'
      };
      
      await savePosition(newPosition);
      const updatedPositions = await getPositions();
      setPositions(updatedPositions);
      setActiveTab('saved');
    } catch (error) {
      setError('Failed to save position');
      console.error('Error saving position:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!currentFormData || !selectedCompany || !analysis) return;
    
    setIsPublishing(true);
    setError(null);
    
    try {
      const newPosition: SavedPosition = {
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        companyData: {
          companyName: selectedCompany.name,
          website: selectedCompany.website,
          contactName: selectedCompany.contactName,
          source: selectedCompany.source,
          onshoreLocation: selectedCompany.onshoreLocation
        },
        formData: currentFormData,
        analysis,
        status: 'active'
      };
      
      await savePosition(newPosition);
      const updatedPositions = await getPositions();
      setPositions(updatedPositions);
      
      // Reset form
      setCurrentFormData(null);
      setAnalysis(null);
      
      // Show success message
      alert('Position published successfully!');
    } catch (error) {
      setError('Failed to publish position. Please try again.');
      console.error('Error publishing:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePositionSelect = (position: SavedPosition) => {
    setAnalysis(position.analysis);
    setCurrentFormData(position.formData);
    const company = companies.find(c => c.name === position.companyData.companyName);
    setSelectedCompany(company || null);
    setActiveTab('create');
  };

  if (isLoadingData) {
    return <LoadingOverlay message="Loading..." />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>
              {showCompanyForm ? (
                <CompanyForm 
                  onSubmit={handleCompanySubmit}
                  onCancel={() => {
                    setShowCompanyForm(false);
                    setCompanyToEdit(null);
                  }}
                  initialData={companyToEdit ? {
                    companyName: companyToEdit.name,
                    website: companyToEdit.website,
                    contactName: companyToEdit.contactName,
                    source: companyToEdit.source,
                    onshoreLocation: companyToEdit.onshoreLocation
                  } : undefined}
                />
              ) : (
                <CompanySelector
                  companies={companies}
                  selectedCompany={selectedCompany}
                  onSelect={setSelectedCompany}
                  onCreateNew={() => setShowCompanyForm(true)}
                  onEdit={handleEditCompany}
                  onArchive={handleArchiveCompany}
                />
              )}
            </div>

            {selectedCompany && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Position Details</h2>
                <JobForm 
                  onSubmit={handleJobSubmit} 
                  isLoading={isLoading} 
                  selectedCompany={selectedCompany}
                />
              </div>
            )}

            {isLoading && <LoadingOverlay />}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {analysis && currentFormData && !isLoading && (
              <>
                <EditableJobDescription
                  jobDescription={analysis.jobDescription}
                  onSave={(description) => {
                    setAnalysis({ ...analysis, jobDescription: description });
                  }}
                />
                <AnalysisResult analysis={analysis} formData={currentFormData} />
                <RoleActions
                  onSave={handleSave}
                  onPublish={handlePublish}
                  isPublishing={isPublishing}
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
          <EmptyState
            title="No saved positions"
            description="Get started by creating your first position analysis"
            actionLabel="Create Position"
            onAction={() => setActiveTab('create')}
          />
        );

      case 'pipeline':
        return <ApplicationStages stages={[]} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}