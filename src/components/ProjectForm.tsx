import React, { useState, useEffect } from 'react';
import { CalendarDays, Folder } from 'lucide-react';
import Select from 'react-select';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface ProjectFormProps {
  onSubmit: (project: { name: string; startDate: string; endDate: string; assignedTo: string }) => void;
}

interface ProjectManagerOption {
  value: string;
  label: string;
}

export default function ProjectForm({ onSubmit }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    assignedTo: ''
  });
  const [projectManagers, setProjectManagers] = useState<ProjectManagerOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjectManagers();
  }, []);

  const loadProjectManagers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .eq('role', 'project_manager');

      if (error) throw error;

      const options = data.map((user: UserProfile) => ({
        value: user.id,
        label: `${user.displayName} (${user.email})`
      }));

      setProjectManagers(options);
    } catch (err) {
      console.error('Error loading project managers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
      <div className="text-center mb-8">
        <img 
          src="https://i.ibb.co/Xz7SWDq/Wipro-PARI-logo.png" 
          alt="Wipro PARI Logo" 
          className="h-16 w-auto mx-auto mb-6"
        />
        <h2 className="text-2xl font-bold text-brand-navy">Create New Project</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brand-navy">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-brand-navy">
            Project Manager
          </label>
          <Select
            id="assignedTo"
            options={projectManagers}
            isLoading={loading}
            className="mt-1"
            onChange={(option) => setFormData({ ...formData, assignedTo: option?.value || '' })}
            placeholder="Select a project manager..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-brand-navy">
              Start Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 h-5 w-5 text-brand-navy opacity-50" />
              <input
                type="date"
                id="startDate"
                required
                className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-brand-navy">
              End Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 h-5 w-5 text-brand-navy opacity-50" />
              <input
                type="date"
                id="endDate"
                required
                className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-gradient-to-r from-brand-navy to-brand-maroon text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
      >
        Create Project
      </button>
    </form>
  );
}