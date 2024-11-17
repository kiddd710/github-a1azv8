import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { useAuthStore } from './store/authStore';
import { useProjectStore } from './store/projectStore';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectForm from './components/ProjectForm';
import TaskList from './components/TaskList';
import AdminPanel from './components/AdminPanel';
import LoginButton from './components/LoginButton';
import Header from './components/Header';
import toast from 'react-hot-toast';

function App() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const { userProfile, loading, error, createOrUpdateProfile, setUserProfile } = useAuthStore();
  const { loadProjects } = useProjectStore();

  useEffect(() => {
    async function initializeUserProfile() {
      if (isAuthenticated && accounts[0] && !userProfile) {
        try {
          console.log('Initializing user profile...');
          const profile = await createOrUpdateProfile(accounts[0]);
          if (profile) {
            console.log('Profile created/updated successfully:', profile);
            await loadProjects(profile.id);
          }
        } catch (err) {
          console.error('Profile initialization error:', err);
          toast.error('Failed to initialize user profile');
        }
      }
    }

    initializeUserProfile();
  }, [isAuthenticated, accounts, userProfile, createOrUpdateProfile, loadProjects]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="https://i.ibb.co/Xz7SWDq/Wipro-PARI-logo.png" 
            alt="Wipro PARI Logo" 
            className="h-16 w-auto mx-auto mb-8"
          />
          <h1 className="text-3xl font-bold text-brand-navy mb-8">Project Workflow Manager</h1>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header 
        userProfile={userProfile} 
        onLogout={() => {
          instance.logoutPopup();
          setUserProfile(null);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4">
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

        <Routes>
          <Route path="/" element={<ProjectDashboard />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<TaskList />} />
          {userProfile?.role === 'operations_manager' && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;