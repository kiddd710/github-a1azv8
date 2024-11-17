import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ProjectDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const { projects, deleteProject } = useProjectStore();
  const isOperationsManager = userProfile?.role === 'operations_manager';

  const handleDeleteProject = async (projectId: string) => {
    if (!isOperationsManager) return;
    
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);

        if (error) throw error;
        
        deleteProject(projectId);
        toast.success('Project deleted successfully');
      } catch (err) {
        console.error('Error deleting project:', err);
        toast.error('Failed to delete project');
      }
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
    if (progress >= 50) return 'bg-gradient-to-r from-brand-navy to-brand-maroon';
    if (progress > 0) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Projects Yet</h2>
        {isOperationsManager && (
          <button
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-navy hover:bg-brand-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Project
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isOperationsManager && (
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/projects/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-navy hover:bg-brand-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Project
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-brand-navy to-brand-maroon">
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">End Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Current Phase</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Progress</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-brand-navy">{project.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{project.startDate.toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{project.endDate.toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-navy bg-opacity-10 text-brand-navy">
                    {project.currentPhase}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{project.assignedTo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{project.progress}%</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="inline-flex items-center px-3 py-1.5 border border-brand-navy text-brand-navy rounded-md hover:bg-brand-navy hover:text-white transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    {isOperationsManager && (
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-600 text-red-600 rounded-md hover:bg-red-600 hover:text-white transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}