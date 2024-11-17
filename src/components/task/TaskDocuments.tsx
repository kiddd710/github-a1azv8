import React from 'react';
import { Upload, File, Calendar, User } from 'lucide-react';

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
  version?: number;
}

interface TaskDocumentsProps {
  documents: Document[];
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export default function TaskDocuments({ documents, onUpload, uploading }: TaskDocumentsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-navy border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative"
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-navy"></div>
              <span className="ml-2 text-sm text-gray-500">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-brand-navy" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <File className="w-5 h-5 text-brand-navy flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{doc.fileName}</h4>
                  {doc.version && (
                    <span className="text-xs text-gray-500">Version {doc.version}</span>
                  )}
                </div>
              </div>
              <a
                href={doc.fileUrl}
                className="text-brand-navy hover:text-brand-maroon text-sm font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                <span>{doc.uploadedBy}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDate(doc.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}