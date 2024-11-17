import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, UserCircle } from 'lucide-react';
import { UserProfile } from '../types';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  userProfile: UserProfile | null;
  onLogout: () => void;
}

export default function Header({ userProfile, onLogout }: HeaderProps) {
  const isOperationsManager = userProfile?.role === 'operations_manager';

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <img 
                src="https://i.ibb.co/Xz7SWDq/Wipro-PARI-logo.png" 
                alt="Wipro PARI Logo" 
                className="h-12 w-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold text-brand-navy">Project Workflow Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <div className="flex items-center space-x-2">
              <UserCircle className="w-6 h-6 text-brand-navy" />
              <span className="text-sm text-brand-navy">{userProfile?.displayName}</span>
              <span className="text-xs text-gray-500">({userProfile?.role})</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-brand-navy hover:text-brand-maroon transition-colors"
            >
              Sign Out
            </button>
            {isOperationsManager && (
              <Link
                to="/admin"
                className="p-2 text-brand-navy hover:text-brand-maroon transition-colors"
                title="Admin Settings"
              >
                <Settings className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}