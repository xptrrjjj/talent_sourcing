import React from 'react';
import { Save, Loader } from 'lucide-react';

interface Props {
  onSave: () => void;
  isSaving: boolean;
}

export function RoleActions({ onSave, isSaving }: Props) {
  return (
    <div className="flex justify-end space-x-4 mt-8">
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="inline-flex items-center px-4 py-2 border border-magentiq text-sm font-medium rounded-md text-magentiq bg-white hover:bg-magentiq/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-magentiq disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Role
          </>
        )}
      </button>
    </div>
  );
}