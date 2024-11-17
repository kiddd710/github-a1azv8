import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProjectPhases, getTaskTemplates, addProjectPhase, addTaskTemplate, deleteProjectPhase, deleteTaskTemplate } from '../db';
import { TaskTemplate, ProjectPhase } from '../types';
import LoadingSpinner from './common/LoadingSpinner';

const TaskTemplateList = lazy(() => import('./admin/TaskTemplateList'));
const PhaseList = lazy(() => import('./admin/PhaseList'));
const TaskForm = lazy(() => import('./admin/TaskForm'));
const PhaseForm = lazy(() => import('./admin/PhaseForm'));

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'phases'>('tasks');
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Omit<TaskTemplate, 'id'> | null>(null);
  const [editingPhase, setEditingPhase] = useState<Omit<ProjectPhase, 'id'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [phasesData, templatesData] = await Promise.all([
        getProjectPhases(),
        getTaskTemplates()
      ]);
      setPhases(phasesData);
      setTaskTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const newTask = await addTaskTemplate(editingTask);
      setTaskTemplates([...taskTemplates, newTask]);
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhase) return;

    try {
      const newPhase = await addProjectPhase(editingPhase);
      setPhases([...phases, newPhase]);
      setEditingPhase(null);
      setShowPhaseForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add phase');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTaskTemplate(id);
      setTaskTemplates(taskTemplates.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleDeletePhase = async (id: string) => {
    try {
      await deleteProjectPhase(id);
      setPhases(phases.filter(phase => phase.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete phase');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="inline-flex items-center text-brand-navy hover:text-brand-maroon transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold text-brand-navy">Project Settings</h2>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Task Templates
          </button>
          <button
            onClick={() => setActiveTab('phases')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'phases'
                ? 'border-brand-navy text-brand-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Project Phases
          </button>
        </nav>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        {activeTab === 'tasks' ? (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingTask({
                    sequence: taskTemplates.length > 0 
                      ? Math.max(...taskTemplates.map(t => t.sequence)) + 0.01 
                      : 1.00,
                    name: '',
                    phase: phases[0]?.name || 'Planning',
                    uploadRequired: false,
                    updateFrequency: 'Once',
                  });
                  setShowTaskForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-maroon transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task Template
              </button>
            </div>

            <TaskTemplateList
              templates={taskTemplates}
              onDelete={handleDeleteTask}
            />

            {showTaskForm && editingTask && (
              <TaskForm
                task={editingTask}
                phases={phases}
                onSubmit={handleAddTask}
                onCancel={() => {
                  setEditingTask(null);
                  setShowTaskForm(false);
                }}
                onChange={setEditingTask}
              />
            )}
          </>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingPhase({
                    name: '',
                    sequence: phases.length > 0 ? Math.max(...phases.map(p => p.sequence)) + 1 : 1,
                    description: '',
                  });
                  setShowPhaseForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-maroon transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project Phase
              </button>
            </div>

            <PhaseList
              phases={phases}
              onDelete={handleDeletePhase}
            />

            {showPhaseForm && editingPhase && (
              <PhaseForm
                phase={editingPhase}
                onSubmit={handleAddPhase}
                onCancel={() => {
                  setEditingPhase(null);
                  setShowPhaseForm(false);
                }}
                onChange={setEditingPhase}
              />
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}