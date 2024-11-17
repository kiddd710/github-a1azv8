import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Project } from '../types';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  loadProjects: (userId: string) => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  loadProjects: async (userId: string) => {
    if (!userId) {
      set({ error: 'No user ID provided' });
      return;
    }

    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tasks (
            id,
            name,
            sequence,
            phase,
            completion_status,
            upload_required,
            report_type,
            update_frequency,
            last_updated
          )
        `)
        .eq('created_by', userId);

      if (error) throw error;

      const projects: Project[] = (data || []).map(project => ({
        id: project.id,
        name: project.name,
        startDate: new Date(project.start_date),
        endDate: new Date(project.end_date),
        status: project.status,
        assignedTo: project.assigned_to,
        progress: project.progress || 0,
        currentPhase: project.current_phase || 'Planning',
        tasks: (project.project_tasks || []).map(task => ({
          id: task.id,
          name: task.name,
          sequence: task.sequence,
          phase: task.phase,
          completionStatus: task.completion_status,
          uploadRequired: task.upload_required,
          reportType: task.report_type,
          updateFrequency: task.update_frequency,
          lastUpdated: new Date(task.last_updated || Date.now())
        }))
      }));

      set({ projects });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load projects';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  addProject: (project) => {
    set(state => ({
      projects: [...state.projects, project]
    }));
  },

  updateProject: (project) => {
    set(state => ({
      projects: state.projects.map(p => 
        p.id === project.id ? project : p
      )
    }));
  },

  deleteProject: (projectId) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== projectId)
    }));
  },

  clearError: () => set({ error: null })
}));