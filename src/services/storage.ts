import type { SavedPosition, Company } from '../types';

const POSITIONS_KEY = 'savedPositions';
const COMPANIES_KEY = 'companies';

export function getSavedPositions(): SavedPosition[] {
  const saved = localStorage.getItem(POSITIONS_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function savePosition(position: SavedPosition): void {
  const positions = getSavedPositions();
  const index = positions.findIndex(p => p.id === position.id);
  
  if (index >= 0) {
    positions[index] = position;
  } else {
    positions.push(position);
  }
  
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
}

export function deletePosition(id: string): void {
  const positions = getSavedPositions();
  const filtered = positions.filter(p => p.id !== id);
  localStorage.setItem(POSITIONS_KEY, JSON.stringify(filtered));
}

export function getCompanies(): Company[] {
  const saved = localStorage.getItem(COMPANIES_KEY);
  return saved ? JSON.parse(saved) : [];
}

export function saveCompany(company: Company): void {
  const companies = getCompanies();
  const index = companies.findIndex(c => c.id === company.id);
  
  if (index >= 0) {
    companies[index] = company;
  } else {
    companies.push(company);
  }
  
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
}

export function deleteCompany(id: string): void {
  const companies = getCompanies();
  const filtered = companies.filter(c => c.id !== id);
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(filtered));
}