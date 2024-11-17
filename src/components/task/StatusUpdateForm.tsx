import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { CompletionStatus } from '../../types';

interface StatusUpdateFormProps {
  currentStatus: CompletionStatus;
  onSubmit: (data: { status: CompletionStatus; comments: string; file?: File }) => Promise<void>;
  uploading: boolean;
}

export default function StatusUpdateForm({ currentStatus, onSubmit, uploading }: StatusUpdateFormProps) {
  const [status, setStatus] = useState<CompletionStatus>(currentStatus);
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      status,
      comments,
      ...(file && { file })
    });
    setComments('');
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy"
          value={status}
          onChange={(e) => setStatus(e.target.value as CompletionStatus)}
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Partial Complete">Partial Complete</option>
          <option value="Complete">Complete</option>
        </select>
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
          Comments
        </label>
        <textarea
          id="comments"
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy"
          placeholder="Add your update comments here..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attach File (Optional)
        </label>
        <div className="flex items-center space-x-2">
          <label
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose File
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </label>
          {file && (
            <span className="text-sm text-gray-600">{file.name}</span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-navy hover:bg-brand-maroon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Updating...' : 'Submit Update'}
      </button>
    </form>
  );
}