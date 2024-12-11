import type { TalentAnalysis } from '../types';

export function generateShareableUrl(analysis: TalentAnalysis, proposedRate: number) {
  // Create a sanitized version of the analysis without sensitive information
  const shareableData = {
    jobDescription: analysis.jobDescription,
    talentPoolSize: analysis.talentPoolSize,
    onshoreSalaryRange: analysis.onshoreSalaryRange,
    proposedRate: {
      annual: proposedRate,
      monthly: Math.round(proposedRate / 12)
    }
  };

  // Create a base64 encoded string of the data
  const encoded = btoa(encodeURIComponent(JSON.stringify(shareableData)));
  
  // Generate a URL with the encoded data
  const url = new URL(window.location.href);
  url.pathname = '/share';
  url.searchParams.set('data', encoded);
  
  return url.toString();
}