import React from 'react';
import { FileText, Users, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  activeTab: 'create' | 'saved' | 'pipeline';
  onTabChange: (tab: 'create' | 'saved' | 'pipeline') => void;
  children: React.ReactNode;
}

export function DashboardLayout({ activeTab, onTabChange, children }: Props) {
  const tabs = [
    { id: 'create', label: 'Create Role', icon: PlusCircle },
    { id: 'saved', label: 'Saved Roles', icon: FileText },
    { id: 'pipeline', label: 'Pipeline', icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="https://magentiq.com/wp-content/uploads/2024/01/magentiq-logo.png" 
                alt="Magentiq Logo" 
                className="h-8 w-auto"
              />
            </div>
            <nav className="flex space-x-4">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id)}
                  className={clsx(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === id
                      ? 'bg-magentiq text-white'
                      : 'text-gray-600 hover:text-magentiq hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}