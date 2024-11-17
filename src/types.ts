export interface Task {
  id: string;
  name: string;
  sequence: number;
  phase: string;
  completionStatus: CompletionStatus;
  uploadRequired: boolean;
  reportType: string;
  updateFrequency: string;
  lastUpdated: Date;
  documents: string[];
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  recurrence?: TaskRecurrence | null;
}

export interface Project {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: string;
  assignedTo: string;
  progress: number;
  currentPhase: string;
  tasks: Task[];
}

export interface UserProfile {
  id: string;
  azureId: string;
  email: string;
  displayName: string;
  role: 'project_manager' | 'operations_manager';
  createdAt: Date;
  lastLogin: Date;
}

export type CompletionStatus = 'Not Started' | 'In Progress' | 'Partial Complete' | 'Complete' | 'Not Scheduled';

export interface TaskTemplate {
  id: string;
  sequence: number;
  name: string;
  phase: string;
  uploadRequired: boolean;
  updateFrequency: string;
  recurrence?: TaskRecurrence;
}

export interface ProjectPhase {
  id: string;
  name: string;
  sequence: number;
  description: string;
}

export interface TaskRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: string;
  occurrences?: number;
}

export interface SupabaseProjectPhase {
  id: string;
  name: string;
  sequence: number;
  description: string;
  created_at: string;
}

export interface SupabaseTaskTemplate {
  id: string;
  sequence: number;
  name: string;
  phase_id: string;
  upload_required: boolean;
  update_frequency: string;
  recurrence?: TaskRecurrence;
  created_at: string;
  project_phases: {
    name: string;
  };
}