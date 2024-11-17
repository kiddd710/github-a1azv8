import React, { useState, useEffect } from 'react';
import { Task, CompletionStatus } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../AuthProvider';
import TaskDetailsHeader from './TaskDetailsHeader';
import TaskTimeline from './TaskTimeline';
import TaskDocuments from './TaskDocuments';
import StatusUpdateForm from './StatusUpdateForm';

interface TaskDetailsProps {
  task: Task;
  projectId: string;
  onBack: () => void;
  onStatusChange: (taskId: string, status: CompletionStatus) => void;
}

export default function TaskDetails({ task, projectId, onBack, onStatusChange }: TaskDetailsProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Array<{ id: string; fileName: string; fileUrl: string; uploadedBy: string; createdAt: string; version?: number }>>([]);
  const [taskLogs, setTaskLogs] = useState<Array<{ id: string; type: 'status' | 'file'; status: string; comments: string; userName: string; createdAt: string; fileName?: string; fileUrl?: string }>>([]);
  const { userProfile } = useAuth();

  useEffect(() => {
    loadDocuments();
    loadTaskLogs();
  }, [task.id]);

  const loadTaskLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('task_status_logs')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaskLogs(data?.map(log => ({
        id: log.id,
        type: log.type,
        status: log.status,
        comments: log.comments,
        userName: log.user_name,
        createdAt: log.created_at,
        fileName: log.file_name,
        fileUrl: log.file_url
      })) || []);
    } catch (err: any) {
      console.error('Error loading task logs:', err);
      setError('Failed to load task history');
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data?.map(doc => ({
        id: doc.id,
        fileName: doc.file_name,
        fileUrl: doc.file_url,
        uploadedBy: doc.uploaded_by,
        createdAt: doc.created_at
      })) || []);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    }
  };

  const handleStatusUpdate = async ({ status, comments, file }: { status: CompletionStatus; comments: string; file?: File }) => {
    if (!userProfile?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setUploading(true);
      let fileUrl = '';
      let fileName = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${projectId}/${task.id}/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-documents')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;

        // Save document metadata
        const { error: docError } = await supabase
          .from('project_documents')
          .insert({
            project_id: projectId,
            task_id: task.id,
            file_name: fileName,
            file_url: fileUrl,
            uploaded_by: userProfile.id
          });

        if (docError) throw docError;
      }

      // Log the status update
      const { error: logError } = await supabase
        .from('task_status_logs')
        .insert({
          task_id: task.id,
          project_id: projectId,
          status,
          comments,
          user_id: userProfile.id,
          user_name: userProfile.displayName,
          type: file ? 'file' : 'status',
          file_name: fileName,
          file_url: fileUrl
        });

      if (logError) throw logError;

      // Update task status
      await onStatusChange(task.id, status);
      
      // Refresh data
      await Promise.all([
        loadTaskLogs(),
        loadDocuments()
      ]);

    } catch (err: any) {
      console.error('Status update error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="p-6">
        <TaskDetailsHeader task={task} onBack={onBack} />

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-brand-navy mb-4">Task History</h2>
              <TaskTimeline items={taskLogs} />
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-brand-navy mb-4">Update Status</h2>
              <StatusUpdateForm
                currentStatus={task.completionStatus}
                onSubmit={handleStatusUpdate}
                uploading={uploading}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-brand-navy mb-4">Documents</h2>
              <TaskDocuments
                documents={documents}
                onUpload={async (file) => {
                  await handleStatusUpdate({
                    status: task.completionStatus,
                    comments: `Uploaded document: ${file.name}`,
                    file
                  });
                }}
                uploading={uploading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}