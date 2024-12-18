import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Wand2, Loader } from 'lucide-react';
import type { JobFormData, SkillCategory, Company } from '../types';
import { suggestSkills } from '../services/openai';
import { FormField } from './form/FormField';
import { SkillsSection } from './form/SkillsSection';
import { EXPERIENCE_LEVELS, EDUCATION_LEVELS, EMPLOYMENT_TYPES } from './form/constants';

interface Props {
  onSubmit: (data: JobFormData) => void;
  isLoading: boolean;
  selectedCompany: Company;
}

export function JobForm({ onSubmit, isLoading, selectedCompany }: Props) {
  const [suggestedCategories, setSuggestedCategories] = useState<SkillCategory[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset } = useForm<JobFormData>({
    defaultValues: {
      experienceLevel: 'Mid Level',
      educationLevel: 'Bachelor',
      employmentType: 'Full Time',
      onshoreLocation: selectedCompany?.onshoreLocation || '',
      companyId: selectedCompany?.id || ''
    }
  });

  // Update form when selected company changes
  useEffect(() => {
    if (selectedCompany) {
      setValue('onshoreLocation', selectedCompany.onshoreLocation);
      setValue('companyId', selectedCompany.id);
    }
  }, [selectedCompany, setValue]);

  const currentSkills = watch('requiredSkills') || '';
  const currentSkillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);

  const handleSuggestSkills = async () => {
    setIsLoadingSkills(true);
    try {
      const result = await suggestSkills({
        ...watch(),
        requiredSkills: currentSkills
      });
      setSuggestedCategories(result.categories || []);
    } catch (error) {
      console.error('Error suggesting skills:', error);
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const addSkill = (skill: string) => {
    if (!skill) return;
    const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
    if (!skillsArray.includes(skill)) {
      const newSkills = [...skillsArray, skill].join(', ');
      setValue('requiredSkills', newSkills);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (!skillToRemove) return;
    const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newSkills = skillsArray.filter(skill => skill !== skillToRemove).join(', ');
    setValue('requiredSkills', newSkills);
  };

  const validateForm = (data: JobFormData): string | null => {
    if (!data.jobTitle) {
      return 'Job title is required';
    }
    if (!data.requiredSkills) {
      return 'At least one required skill is needed';
    }
    if (!selectedCompany) {
      return 'Please select a company first';
    }
    return null;
  };

  const handleFormSubmit = async (data: JobFormData) => {
    try {
      setError(null);
      const validationError = validateForm(data);
      if (validationError) {
        setError(validationError);
        return;
      }
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Form submission error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Job Title"
          name="jobTitle"
          register={register}
          required
          placeholder="e.g., Senior Software Engineer"
        />

        <FormField
          label="Onshore Location"
          name="onshoreLocation"
          register={register}
          required
          placeholder="e.g., United States"
        />

        <FormField
          label="Experience Level"
          name="experienceLevel"
          type="select"
          register={register}
          required
          options={EXPERIENCE_LEVELS}
        />

        <FormField
          label="Education Level"
          name="educationLevel"
          type="select"
          register={register}
          required
          options={EDUCATION_LEVELS}
        />

        <FormField
          label="Employment Type"
          name="employmentType"
          type="select"
          register={register}
          required
          options={EMPLOYMENT_TYPES}
        />
      </div>

      <SkillsSection
        currentSkills={currentSkillsArray}
        suggestedCategories={suggestedCategories}
        isLoadingSkills={isLoadingSkills}
        onSuggestSkills={handleSuggestSkills}
        onAddSkill={addSkill}
        onRemoveSkill={removeSkill}
        register={register}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-magentiq hover:bg-magentiq/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-magentiq disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Position'
          )}
        </button>
      </div>
    </form>
  );
}