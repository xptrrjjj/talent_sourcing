import React from 'react';
import { useForm } from 'react-hook-form';
import type { CompanyFormData, Company } from '../../types';
import { FormField } from '../form/FormField';

interface Props {
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
  initialData?: Company;
}

export function CompanyForm({ onSubmit, onCancel, initialData }: Props) {
  const { register, handleSubmit } = useForm<CompanyFormData>({
    defaultValues: initialData ? {
      companyName: initialData.name,
      website: initialData.website,
      contactName: initialData.contactName,
      source: initialData.source,
      onshoreLocation: initialData.onshoreLocation
    } : undefined
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Company Name"
          name="companyName"
          register={register}
          required
          placeholder="e.g., Acme Corporation"
        />

        <FormField
          label="Website"
          name="website"
          register={register}
          placeholder="www.example.com"
          optional
        />

        <FormField
          label="Contact Name"
          name="contactName"
          register={register}
          required
          placeholder="e.g., John Smith"
        />

        <FormField
          label="Source"
          name="source"
          register={register}
          required
          placeholder="e.g., LinkedIn, Referral, Direct"
        />

        <FormField
          label="Onshore Location"
          name="onshoreLocation"
          register={register}
          required
          placeholder="e.g., United States"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-magentiq"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-magentiq hover:bg-magentiq/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-magentiq"
        >
          {initialData ? 'Update Company' : 'Save Company'}
        </button>
      </div>
    </form>
  );
}