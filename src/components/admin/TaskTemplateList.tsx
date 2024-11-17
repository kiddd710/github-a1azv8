import React from 'react';
import { Trash2 } from 'lucide-react';
import { TaskTemplate } from '../../types';

interface TaskTemplateListProps {
  templates: TaskTemplate[];
  onDelete: (id: string) => void;
}

export default function TaskTemplateList({ templates, onDelete }: TaskTemplateListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gradient-to-r from-brand-navy to-brand-maroon">
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Sequence</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Task Description</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Project Phase</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Requires Upload</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Update Frequency</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {templates
            .sort((a, b) => a.sequence - b.sequence)
            .map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.sequence.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.phase}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.uploadRequired ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {task.updateFrequency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}