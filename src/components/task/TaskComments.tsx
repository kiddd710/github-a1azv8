import React, { useState } from 'react';
import { User, Clock } from 'lucide-react';
import { TaskComment } from '../../types';
import { useAuth } from '../AuthProvider';
import { supabase } from '../../lib/supabase';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  onCommentAdded: () => void;
}

export default function TaskComments({ taskId, comments, onCommentAdded }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const { userProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: userProfile.id,
          content: newComment,
          type: 'comment'
        });

      if (error) throw error;

      setNewComment('');
      onCommentAdded();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-navy focus:border-brand-navy"
          rows={3}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-brand-maroon transition-colors"
        >
          Add Comment
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-brand-navy" />
                <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}