import React, { useState } from 'react';
import { ChevronDown, Bot, ArrowDownUp } from 'lucide-react';
import type { TalentAnalysis } from '../../types';

interface Props {
  gptAnalysis: TalentAnalysis | null;
  geminiAnalysis: any | null;
}

export function AnalysisComparison({ gptAnalysis, geminiAnalysis }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (!gptAnalysis || !geminiAnalysis) return null;

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const metrics = [
    {
      name: 'Talent Pool Size',
      gpt: formatNumber(gptAnalysis.talentPoolSize),
      gemini: formatNumber(geminiAnalysis.talentPoolSize),
      difference: Math.abs(gptAnalysis.talentPoolSize - geminiAnalysis.talentPoolSize)
    },
    {
      name: 'Onshore Salary (Min)',
      gpt: formatSalary(gptAnalysis.onshoreSalaryRange.min),
      gemini: formatSalary(geminiAnalysis.salaryRanges.onshore.min),
      difference: Math.abs(gptAnalysis.onshoreSalaryRange.min - geminiAnalysis.salaryRanges.onshore.min)
    },
    {
      name: 'Onshore Salary (Max)',
      gpt: formatSalary(gptAnalysis.onshoreSalaryRange.max),
      gemini: formatSalary(geminiAnalysis.salaryRanges.onshore.max),
      difference: Math.abs(gptAnalysis.onshoreSalaryRange.max - geminiAnalysis.salaryRanges.onshore.max)
    },
    {
      name: 'Offshore Salary (Min)',
      gpt: formatSalary(gptAnalysis.offshoreSalaryRange.min),
      gemini: formatSalary(geminiAnalysis.salaryRanges.offshore.min),
      difference: Math.abs(gptAnalysis.offshoreSalaryRange.min - geminiAnalysis.salaryRanges.offshore.min)
    },
    {
      name: 'Offshore Salary (Max)',
      gpt: formatSalary(gptAnalysis.offshoreSalaryRange.max),
      gemini: formatSalary(geminiAnalysis.salaryRanges.offshore.max),
      difference: Math.abs(gptAnalysis.offshoreSalaryRange.max - geminiAnalysis.salaryRanges.offshore.max)
    }
  ];

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <ArrowDownUp className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Compare Analysis Results</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <span>ChatGPT</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <span>Gemini</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.map((metric, index) => (
                <tr key={metric.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metric.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.gpt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.gemini}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {metric.name.includes('Salary') ? formatSalary(metric.difference) : formatNumber(metric.difference)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-gray-50 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Market Trends (Gemini)</h4>
            <ul className="list-disc list-inside space-y-1">
              {geminiAnalysis.marketTrends.map((trend: string, index: number) => (
                <li key={index} className="text-sm text-gray-600">{trend}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}