import React from 'react';
import { Clock, Upload, User } from 'lucide-react';

interface TimelineItem {
  id: string;
  type: 'status' | 'file';
  status: string;
  comments: string;
  userName: string;
  createdAt: string;
  fileName?: string;
  fileUrl?: string;
}

interface TaskTimelineProps {
  items: TimelineItem[];
}

export default function TaskTimeline({ items }: TaskTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-emerald-100 text-emerald-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Partial Complete': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4 h-[calc(100vh-24rem)] overflow-y-auto pr-4 custom-scrollbar">
      {items.map((item) => (
        <div key={item.id} className="relative pl-4 pb-4 border-l-2 border-gray-200 last:pb-0">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-navy border-2 border-white" />
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 ml-4">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(item.createdAt)}
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{item.comments}</p>
            
            {item.type === 'file' && item.fileName && item.fileUrl && (
              <div className="flex items-center justify-between bg-gray-50 rounded p-2 mb-3">
                <div className="flex items-center text-sm">
                  <Upload className="w-4 h-4 mr-2 text-brand-navy" />
                  <span className="text-gray-600">{item.fileName}</span>
                </div>
                <a
                  href={item.fileUrl}
                  className="text-brand-navy hover:text-brand-maroon text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </div>
            )}
            
            <div className="flex items-center text-xs text-gray-500">
              <User className="w-3 h-3 mr-1" />
              <span>{item.userName}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}