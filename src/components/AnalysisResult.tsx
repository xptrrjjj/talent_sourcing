import React, { useState } from 'react';
import { Check, Link, Share2, Briefcase, AlertCircle, DollarSign, Users, TrendingDown } from 'lucide-react';
import type { TalentAnalysis, JobFormData } from '../types';
import { generateShareableUrl } from '../utils/url';
import { ClientProposal } from './ClientProposal';
import { createJob } from '../services/api/recruitcrm';

interface Props {
  analysis: TalentAnalysis;
  formData: JobFormData;
}

export function AnalysisResult({ analysis, formData }: Props) {
  const [showCopied, setShowCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [proposedRate, setProposedRate] = useState(
    Math.round(analysis.onshoreSalaryRange.min * 0.5)
  );

  const formatSalary = (amount: number) => {
    const annual = amount.toLocaleString();
    const monthly = Math.round(amount / 12).toLocaleString();
    return `$${annual}/yr ($${monthly}/mo)`;
  };

  const calculateMargin = () => {
    const costRate = analysis.offshoreSalaryRange.min;
    const annualMargin = proposedRate - costRate;
    const marginPercentage = ((proposedRate - costRate) / costRate) * 100;
    return {
      annual: annualMargin,
      percentage: marginPercentage
    };
  };

  const margin = calculateMargin();
  const costSavings = Math.round((1 - proposedRate/analysis.onshoreSalaryRange.min) * 100);

  const handlePublishToRecruitCRM = async () => {
    setIsPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);

    try {
      const skills = formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      
      await createJob({
        ...analysis.jobDescription,
        title: formData.jobTitle,
        experienceLevel: formData.experienceLevel,
        educationLevel: formData.educationLevel,
        skills,
        salaryRange: analysis.onshoreSalaryRange,
        location: formData.onshoreLocation
      });

      setPublishSuccess(true);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : 'Failed to publish job');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePublishToRecruitCRM}
              disabled={isPublishing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish to RecruitCRM'}
            </button>
          </div>
        </div>

        {publishError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to publish job</h3>
                <p className="text-sm text-red-700 mt-1">{publishError}</p>
              </div>
            </div>
          </div>
        )}

        {publishSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Job published successfully</h3>
                <p className="text-sm text-green-700 mt-1">
                  The job has been published to RecruitCRM and is now ready for candidates.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-blue-900">Available Talent</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{analysis.talentPoolSize.toLocaleString()}</p>
            <p className="text-sm text-blue-700 mt-1">Qualified Candidates</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-green-900">Market Rates</h3>
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">
                {formatSalary(analysis.onshoreSalaryRange.min)} - {formatSalary(analysis.onshoreSalaryRange.max)}
              </p>
              <p className="text-sm text-green-700">Onshore Range</p>
              
              <p className="text-xl font-bold text-green-600 mt-2">
                {formatSalary(analysis.offshoreSalaryRange.min)} - {formatSalary(analysis.offshoreSalaryRange.max)}
              </p>
              <p className="text-sm text-green-700">Philippines Range</p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingDown className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-purple-900">Proposed Rate</h3>
            </div>
            <div>
              <input
                type="range"
                min={analysis.offshoreSalaryRange.min}
                max={analysis.onshoreSalaryRange.min}
                value={proposedRate}
                onChange={(e) => setProposedRate(Number(e.target.value))}
                className="w-full mb-2"
              />
              <p className="text-xl font-bold text-purple-600">{formatSalary(proposedRate)}</p>
              <div className="text-sm text-purple-700 space-y-1">
                <p>Annual Margin: ${margin.annual.toLocaleString()}</p>
                <p>Markup: {Math.round(margin.percentage)}%</p>
                <p>Cost Savings: {costSavings}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sources</h3>
          <div className="space-y-2">
            {analysis.sources.map((source, index) => (
              <div key={index} className="flex items-start">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {source.name}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Share Analysis</h3>
            <button
              onClick={() => {
                const url = generateShareableUrl(analysis, proposedRate);
                navigator.clipboard.writeText(url);
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              {showCopied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Link className="w-4 h-4 mr-2" />
              )}
              {showCopied ? 'Copied!' : 'Copy Shareable Link'}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Share this analysis with your client (excludes sensitive pricing information)
          </p>
        </div>
      </div>

      <ClientProposal analysis={analysis} proposedRate={proposedRate} />
    </div>
  );
}