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

const defaultValues: Partial<JobFormData> = {
  experienceLevel: 'Mid Level',
  educationLevel: 'High School',
  employmentType: 'Full Time'
};

export function JobForm({ onSubmit, isLoading, selectedCompany }: Props) {
  const { register, handleSubmit, watch, setValue, reset } = useForm<JobFormData>({
    defaultValues: {
      ...defaultValues,
      onshoreLocation: selectedCompany.onshoreLocation
    }
  });

  const [suggestedCategories, setSuggestedCategories] = useState<SkillCategory[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const currentSkills = watch('requiredSkills') || '';
  const currentSkillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);

  // Update form when selected company changes
  useEffect(() => {
    setValue('onshoreLocation', selectedCompany.onshoreLocation);
  }, [selectedCompany, setValue]);

  const handleSuggestSkills = async () => {
    setIsLoadingSkills(true);
    setSkillsError(null);
    try {
      const result = await suggestSkills({
        ...watch(),
        requiredSkills: currentSkills
      });
      setSuggestedCategories(result.categories || []);
    } catch (error) {
      setSkillsError(error instanceof Error ? error.message : 'Failed to suggest skills');
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          defaultValue={selectedCompany.onshoreLocation}
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
        error={skillsError}
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