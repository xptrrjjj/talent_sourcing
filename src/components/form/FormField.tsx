import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { JobFormData } from '../../types';

interface Props {
  label: string;
  name: keyof JobFormData;
  type?: 'text' | 'select';
  register: UseFormRegister<JobFormData>;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  optional?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  register,
  required = false,
  placeholder,
  options,
  optional
}: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {optional && <span className="text-gray-500 text-xs ml-1">(optional)</span>}
      </label>
      {type === 'text' ? (
        <input
          type="text"
          {...register(name, { required })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={placeholder}
        />
      ) : (
        <select
          {...register(name, { required })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options?.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}