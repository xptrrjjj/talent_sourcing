import React from 'react';
import { Save, Loader } from 'lucide-react';
import { LoadingButton } from '../ui/LoadingButton';

interface Props {
  onSave: () => void;
  isSaving: boolean;
}

export function RoleActions({ onSave, isSaving }: Props) {
  return (
    <div className="flex justify-end space-x-4 mt-8">
      <LoadingButton
        onClick={onSave}
        isLoading={isSaving}
        loadingText="Saving..."
        variant="primary"
      >
        Save Role
      </LoadingButton>
    </div>
  );
}