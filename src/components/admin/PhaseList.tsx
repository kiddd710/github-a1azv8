import React from 'react';
import { Trash2 } from 'lucide-react';
import { ProjectPhase } from '../../types';

interface PhaseListProps {
  phases: ProjectPhase[];
  onDelete: (id: string) => void;
}

export default function PhaseList({ phases, onDelete }: PhaseListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gradient-to-r from-brand-navy to-brand-maroon">
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Sequence</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Phase Name</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {phases
            .sort((a, b) => a.sequence - b.sequence)
            .map((phase) => (
              <tr key={phase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{phase.sequence}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{phase.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{phase.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => onDelete(phase.id)}
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