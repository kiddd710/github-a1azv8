import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Clock, Calendar, User, FileText } from 'lucide-react';
import { Task, CompletionStatus } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

interface TaskDetailsProps {
  task: Task;
  projectId: string;
  onBack: () => void;
  onStatusChange: (taskId: string, status: CompletionStatus) => void;
}

export default function TaskDetails({ task, projectId, onBack, onStatusChange }: TaskDetailsProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Array<{ id: string; file_name: string; file_url: string }>>([]);
  const [taskLogs, setTaskLogs] = useState<Array<{ id: string; type: 'status' | 'file'; status: string; comments: string; user_name: string; created_at: string; file_name?: string }>>([]);
  const [selectedStatus, setSelectedStatus] = useState<CompletionStatus>(task.completionStatus);
  const [comments, setComments] = useState('');
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
      setTaskLogs(data || []);
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
      setDocuments(data || []);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      // Log the status change
      const { error: logError } = await supabase
        .from('task_status_logs')
        .insert({
          task_id: task.id,
          project_id: projectId,
          status: selectedStatus,
          comments: comments,
          user_id: userProfile.id,
          user_name: userProfile.displayName,
          type: 'status'
        });

      if (logError) throw logError;

      // Update the task status
      await onStatusChange(task.id, selectedStatus);
      
      // Refresh the logs
      await loadTaskLogs();
      
      // Clear the comments
      setComments('');
      
    } catch (err: any) {
      console.error('Status update error:', err);
      setError(err.message);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!userProfile?.id) {
      setError('User not authenticated');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${projectId}/${task.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          task_id: task.id,
          file_name: file.name,
          file_url: publicUrl,
          uploaded_by: userProfile.id
        });

      if (dbError) throw dbError;

      // Log the file upload
      const { error: logError } = await supabase
        .from('task_status_logs')
        .insert({
          task_id: task.id,
          project_id: projectId,
          status: task.completionStatus,
          comments: `File uploaded: ${file.name}`,
          user_id: userProfile.id,
          user_name: userProfile.displayName,
          type: 'file',
          file_name: file.name
        });

      if (logError) throw logError;

      await loadDocuments();
      await loadTaskLogs();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Partial Complete': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center text-brand-navy hover:text-brand-maroon transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Task List
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.completionStatus)}`}>
            {task.completionStatus}
          </span>
        </div>
      </div>

      {/* Task Details Section */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Task Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500">Task Name</label>
                <p className="text-sm font-medium text-gray-900">{task.name}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Sequence</label>
                <p className="text-sm font-medium text-gray-900">{task.sequence.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500">Project Phase</label>
                <p className="text-sm font-medium text-gray-900">{task.phase}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Update Frequency</label>
                <p className="text-sm font-medium text-gray-900">{task.updateFrequency}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Status Update Form */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-brand-navy mb-4">Update Status</h3>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as CompletionStatus)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Partial Complete">Partial Complete</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-navy text-white rounded-md py-2 hover:bg-brand-maroon transition-colors"
              >
                Submit Update
              </button>
            </form>
          </div>

          {/* Recent Updates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-brand-navy mb-4">Recent Updates</h3>
            <div className="space-y-4 overflow-y-auto h-[300px]">
              {taskLogs.map((log) => (
                <div key={log.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{log.comments}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    By {log.user_name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-brand-navy mb-4">Upload Document</h3>
            <div className="space-y-4">
              <label className="block w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-navy transition-colors cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  disabled={uploading}
                />
                <div className="h-full flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click or drag files to upload</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div>
          <h3 className="text-lg font-semibold text-brand-navy mb-4">Documents</h3>
          <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-brand-navy" />
                  <span className="text-sm text-gray-600 truncate">{doc.file_name}</span>
                </div>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-navy hover:text-brand-maroon text-sm font-medium"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-lg">
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
    </div>
  );
}