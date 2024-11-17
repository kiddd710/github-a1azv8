import React from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Task } from '../../types';

interface TaskDetailsHeaderProps {
  task: Task;
  onBack: () => void;
}

export default function TaskDetailsHeader({ task, onBack }: TaskDetailsHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Partial Complete': return 'bg-amber-100 text-amber-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center text-brand-navy hover:text-brand-maroon transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Task List
        </button>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.completionStatus)}`}>
          {task.completionStatus}
        </span>
      </div>
      
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{task.name}</h1>
          <p className="text-gray-600 mt-1">Sequence: {task.sequence.toFixed(2)}</p>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Phase: {task.phase}</span>
          </div>
          {task.startDate && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>Start: {new Date(task.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.assignedTo && (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>Assigned to: {task.assignedTo}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}