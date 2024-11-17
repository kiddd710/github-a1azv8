import React from 'react';
import { ProjectPhase } from '../../types';

interface PhaseFormProps {
  phase: Omit<ProjectPhase, 'id'>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (phase: Omit<ProjectPhase, 'id'>) => void;
}

export default function PhaseForm({ phase, onSubmit, onCancel, onChange }: PhaseFormProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold text-brand-navy mb-6">Add Project Phase</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sequence
            </label>
            <input
              type="number"
              value={phase.sequence || ''}
              onChange={(e) => onChange({ ...phase, sequence: Number(e.target.value) })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phase Name
            </label>
            <input
              type="text"
              value={phase.name || ''}
              onChange={(e) => onChange({ ...phase, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={phase.description || ''}
              onChange={(e) => onChange({ ...phase, description: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-maroon"
          >
            Save Phase
          </button>
        </div>
      </form>
    </div>
  );
}