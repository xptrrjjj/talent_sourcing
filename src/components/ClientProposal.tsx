import React from 'react';
import { DollarSign, Users, TrendingDown } from 'lucide-react';
import type { TalentAnalysis } from '../types';

interface Props {
  analysis: TalentAnalysis;
  proposedRate: number;
}

export function ClientProposal({ analysis, proposedRate }: Props) {
  const costSavings = Math.round((1 - proposedRate/analysis.onshoreSalaryRange.min) * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Value Proposition Summary</h2>
      
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
            <h3 className="text-lg font-medium text-green-900">Market Rate</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${analysis.onshoreSalaryRange.min.toLocaleString()}
          </p>
          <p className="text-sm text-green-700 mt-1">Current Market Range</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingDown className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-purple-900">Cost Savings</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{costSavings}%</p>
          <p className="text-sm text-purple-700 mt-1">Potential Savings</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Qualifications</h3>
          <ul className="space-y-2">
            {analysis.jobDescription.requirements.map((req, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span className="text-gray-700">{req.replace(/<[^>]*>/g, '')}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h3>
          <ul className="space-y-2">
            {analysis.jobDescription.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span className="text-gray-700">{benefit.replace(/<[^>]*>/g, '')}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <p className="text-gray-700">
            By partnering with us, you can access a rich talent pool of {analysis.talentPoolSize.toLocaleString()} qualified candidates
            while achieving significant cost optimization of up to {costSavings}% compared to current market rates
            in your region.
          </p>
        </div>
      </div>
    </div>
  );
}