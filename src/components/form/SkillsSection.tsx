import React from 'react';
import { Wand2, Loader, AlertCircle } from 'lucide-react';
import type { SkillCategory } from '../../types';
import { UseFormRegister } from 'react-hook-form';
import type { JobFormData } from '../../types';

interface Props {
  currentSkills: string[];
  suggestedCategories: SkillCategory[];
  isLoadingSkills: boolean;
  onSuggestSkills: () => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  register: UseFormRegister<JobFormData>;
  error?: string | null;
}

export function SkillsSection({
  currentSkills = [],
  suggestedCategories = [],
  isLoadingSkills,
  onSuggestSkills,
  onAddSkill,
  onRemoveSkill,
  register,
  error
}: Props) {
  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Required Skills
          <span className="text-gray-500 text-xs ml-1">(optional)</span>
        </label>
        <button
          type="button"
          onClick={onSuggestSkills}
          disabled={isLoadingSkills}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoadingSkills ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Suggesting...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Suggest Skills
            </>
          )}
        </button>
      </div>

      <div className="mt-1 space-y-3">
        <textarea
          {...register('requiredSkills')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder="Enter key skills, separated by commas"
        />

        {error && (
          <div className="flex items-start p-4 rounded-md bg-red-50 text-red-700">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {currentSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentSkills.map((skill, index) => (
              <span
                key={`current-${index}-${skill}`}
                className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill)}
                  className="ml-1.5 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {suggestedCategories.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            {suggestedCategories.map((category, categoryIndex) => (
              <div key={`category-${categoryIndex}-${category.name}`}>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{category.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {(category.skills || []).map((skill, skillIndex) => (
                    <button
                      key={`skill-${categoryIndex}-${skillIndex}-${skill}`}
                      type="button"
                      onClick={() => onAddSkill(skill)}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-sm hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}