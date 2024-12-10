import React, { useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { Check, X, Copy, Edit2 } from 'lucide-react';
import type { JobDescription } from '../types';

interface Props {
  jobDescription: JobDescription;
  onSave: (description: JobDescription) => void;
}

export function EditableJobDescription({ jobDescription, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(jobDescription);

  const handleSave = () => {
    onSave(editedDescription);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDescription(jobDescription);
    setIsEditing(false);
  };

  const copyHtml = () => {
    const content = document.querySelector('.job-description-content')?.innerHTML;
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
        <div className="flex space-x-2">
          <button
            onClick={copyHtml}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy HTML
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1 border border-green-500 rounded-md text-sm text-white bg-green-500 hover:bg-green-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="prose max-w-none job-description-content">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Overview</h3>
          <ContentEditable
            html={editedDescription.overview}
            disabled={!isEditing}
            onChange={(e) => setEditedDescription({
              ...editedDescription,
              overview: e.target.value
            })}
            className={`block w-full ${isEditing ? 'border-gray-300 rounded-md p-2' : ''}`}
          />
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Responsibilities</h3>
          {editedDescription.responsibilities.map((resp, index) => (
            <ContentEditable
              key={index}
              html={resp}
              disabled={!isEditing}
              onChange={(e) => {
                const newResponsibilities = [...editedDescription.responsibilities];
                newResponsibilities[index] = e.target.value;
                setEditedDescription({
                  ...editedDescription,
                  responsibilities: newResponsibilities
                });
              }}
              className={`block w-full mb-2 ${isEditing ? 'border-gray-300 rounded-md p-2' : ''}`}
            />
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Requirements</h3>
          {editedDescription.requirements.map((req, index) => (
            <ContentEditable
              key={index}
              html={req}
              disabled={!isEditing}
              onChange={(e) => {
                const newRequirements = [...editedDescription.requirements];
                newRequirements[index] = e.target.value;
                setEditedDescription({
                  ...editedDescription,
                  requirements: newRequirements
                });
              }}
              className={`block w-full mb-2 ${isEditing ? 'border-gray-300 rounded-md p-2' : ''}`}
            />
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h3>
          {editedDescription.benefits.map((benefit, index) => (
            <ContentEditable
              key={index}
              html={benefit}
              disabled={!isEditing}
              onChange={(e) => {
                const newBenefits = [...editedDescription.benefits];
                newBenefits[index] = e.target.value;
                setEditedDescription({
                  ...editedDescription,
                  benefits: newBenefits
                });
              }}
              className={`block w-full mb-2 ${isEditing ? 'border-gray-300 rounded-md p-2' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}