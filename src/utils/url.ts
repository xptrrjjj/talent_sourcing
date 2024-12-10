import type { TalentAnalysis } from '../types';

export function generateShareableUrl(analysis: TalentAnalysis, proposedRate: number) {
  // Create a sanitized version of the analysis without offshore rates
  const shareableData = {
    ...analysis,
    offshoreSalaryRange: undefined,
    proposedRate: {
      annual: proposedRate,
      monthly: Math.round(proposedRate / 12)
    }
  };

  const encoded = btoa(JSON.stringify(shareableData));
  const baseUrl = window.location.origin;
  return `${baseUrl}/share/${encoded}`;
}