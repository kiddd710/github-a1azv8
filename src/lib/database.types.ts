export interface Database {
  public: {
    Tables: {
      project_phases: {
        Row: {
          id: string;
          name: string;
          sequence: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sequence: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sequence?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      task_templates: {
        Row: {
          id: string;
          sequence: number;
          name: string;
          phase_id: string;
          upload_required: boolean;
          update_frequency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sequence: number;
          name: string;
          phase_id: string;
          upload_required?: boolean;
          update_frequency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sequence?: number;
          name?: string;
          phase_id?: string;
          upload_required?: boolean;
          update_frequency?: string;
          created_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          end_date: string;
          status: string;
          assigned_to: string;
          progress: number;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date: string;
          end_date: string;
          status?: string;
          assigned_to: string;
          progress?: number;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          status?: string;
          assigned_to?: string;
          progress?: number;
          created_at?: string;
          created_by?: string;
        };
      };
      project_tasks: {
        Row: {
          id: string;
          project_id: string;
          template_id: string;
          name: string;
          sequence: number;
          phase: string;
          completion_status: string;
          upload_required: boolean;
          report_type: string | null;
          update_frequency: string | null;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          template_id: string;
          name: string;
          sequence: number;
          phase: string;
          completion_status?: string;
          upload_required?: boolean;
          report_type?: string | null;
          update_frequency?: string | null;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          template_id?: string;
          name?: string;
          sequence?: number;
          phase?: string;
          completion_status?: string;
          upload_required?: boolean;
          report_type?: string | null;
          update_frequency?: string | null;
          last_updated?: string;
          created_at?: string;
        };
      };
      project_documents: {
        Row: {
          id: string;
          project_id: string;
          task_id: string;
          file_name: string;
          file_url: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          task_id: string;
          file_name: string;
          file_url: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          task_id?: string;
          file_name?: string;
          file_url?: string;
          uploaded_by?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}