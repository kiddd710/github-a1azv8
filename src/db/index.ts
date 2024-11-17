import { supabase } from '../lib/supabase';
import { TaskTemplate, ProjectPhase } from '../types';

export const getProjectPhases = async (): Promise<ProjectPhase[]> => {
  const { data, error } = await supabase
    .from('project_phases')
    .select('*')
    .order('sequence');

  if (error) throw error;

  return data.map(phase => ({
    id: phase.id,
    name: phase.name,
    sequence: phase.sequence,
    description: phase.description
  }));
};

export const getTaskTemplates = async (): Promise<TaskTemplate[]> => {
  const { data, error } = await supabase
    .from('task_templates')
    .select(`
      *,
      project_phases (
        name
      )
    `)
    .order('sequence');

  if (error) throw error;

  return data.map(task => ({
    id: task.id,
    sequence: task.sequence,
    name: task.name,
    phase: task.project_phases.name,
    uploadRequired: task.upload_required,
    updateFrequency: task.update_frequency
  }));
};

export const addProjectPhase = async (phase: Omit<ProjectPhase, 'id'>): Promise<ProjectPhase> => {
  const { data, error } = await supabase
    .from('project_phases')
    .insert([{
      name: phase.name,
      sequence: phase.sequence,
      description: phase.description
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addTaskTemplate = async (task: Omit<TaskTemplate, 'id'>): Promise<TaskTemplate> => {
  const { data: phaseData } = await supabase
    .from('project_phases')
    .select('id')
    .eq('name', task.phase)
    .single();

  if (!phaseData) throw new Error('Phase not found');

  const { data, error } = await supabase
    .from('task_templates')
    .insert([{
      sequence: task.sequence,
      name: task.name,
      phase_id: phaseData.id,
      upload_required: task.uploadRequired,
      update_frequency: task.updateFrequency
    }])
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    phase: task.phase
  };
};

export const deleteProjectPhase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('project_phases')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const deleteTaskTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('task_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
};