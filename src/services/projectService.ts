import { supabase } from '../lib/supabase';
import { Project } from '../types';

export async function getProjects(userId: string): Promise<Project[]> {
  try {
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

    return (data || []).map(project => ({
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
  } catch (error) {
    console.error('Error in getProjects:', error);
    throw error;
  }
}