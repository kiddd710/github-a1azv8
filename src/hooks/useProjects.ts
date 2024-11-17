import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types';
import { useErrorHandler } from './useErrorHandler';

export function useProjects() {
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const loadProjects = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tasks (*)
        `)
        .eq('created_by', userId);

      if (error) throw error;

      const formattedProjects: Project[] = (data || []).map(project => ({
        id: project.id,
        name: project.name,
        startDate: new Date(project.start_date),
        endDate: new Date(project.end_date),
        status: project.status,
        assignedTo: project.assigned_to,
        progress: project.progress,
        currentPhase: project.current_phase || 'Planning',
        tasks: (project.project_tasks || []).map((task: any) => ({
          id: task.id,
          name: task.name,
          sequence: task.sequence,
          phase: task.phase,
          completionStatus: task.completion_status,
          uploadRequired: task.upload_required,
          reportType: task.report_type,
          updateFrequency: task.update_frequency,
          lastUpdated: new Date(task.last_updated)
        }))
      }));

      return formattedProjects;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    loading,
    loadProjects
  };
}