import React, { useState } from 'react';
import { TaskTemplate, ProjectPhase } from '../../types';

interface TaskFormProps {
  task: Omit<TaskTemplate, 'id'>;
  phases: ProjectPhase[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (task: Omit<TaskTemplate, 'id'>) => void;
}

export default function TaskForm({ task, phases, onSubmit, onCancel, onChange }: TaskFormProps) {
  const [showRecurrence, setShowRecurrence] = useState(task.updateFrequency !== 'Once');

  const frequencies = [
    { value: 'Once', label: 'One Time' },
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Bi-Weekly', label: 'Every Two Weeks' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Every Three Months' },
    { value: 'Semi-Annual', label: 'Every Six Months' },
    { value: 'Annual', label: 'Yearly' }
  ];

  const statuses = [
    'Not Started',
    'In Progress',
    'Pending Review',
    'Needs Revision',
    'Approved',
    'Complete',
    'On Hold',
    'Cancelled'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold text-brand-navy mb-6">
          {task.id ? 'Edit Task Template' : 'Add Task Template'}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sequence
              </label>
              <input
                type="number"
                step="0.01"
                value={task.sequence || ''}
                onChange={(e) => onChange({ ...task, sequence: Number(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Phase
              </label>
              <select
                value={task.phase || ''}
                onChange={(e) => onChange({ ...task, phase: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy"
                required
              >
                {phases.map(phase => (
                  <option key={phase.id} value={phase.name}>{phase.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Description
            </label>
            <input
              type="text"
              value={task.name || ''}
              onChange={(e) => onChange({ ...task, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed Statuses
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map(status => (
                <label key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={task.allowedStatuses?.includes(status) || false}
                    onChange={(e) => {
                      const current = task.allowedStatuses || [];
                      const updated = e.target.checked
                        ? [...current, status]
                        : current.filter(s => s !== status);
                      onChange({ ...task, allowedStatuses: updated });
                    }}
                    className="h-4 w-4 text-brand-navy focus:ring-brand-navy border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showRecurrence}
                onChange={(e) => {
                  setShowRecurrence(e.target.checked);
                  if (!e.target.checked) {
                    onChange({ ...task, updateFrequency: 'Once' });
                  }
                }}
                className="h-4 w-4 text-brand-navy focus:ring-brand-navy border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable Recurrence</span>
            </label>

            {showRecurrence && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Frequency
                </label>
                <select
                  value={task.updateFrequency || 'Once'}
                  onChange={(e) => onChange({ ...task, updateFrequency: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.uploadRequired || false}
                onChange={(e) => onChange({ ...task, uploadRequired: e.target.checked })}
                className="h-4 w-4 text-brand-navy focus:ring-brand-navy border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Requires Document Upload</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.requiresApproval || false}
                onChange={(e) => onChange({ ...task, requiresApproval: e.target.checked })}
                className="h-4 w-4 text-brand-navy focus:ring-brand-navy border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Requires Operations Manager Approval</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
          >
            {task.id ? 'Update Task' : 'Save Task'}
          </button>
        </div>
      </form>
    </div>
  );
}