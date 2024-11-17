import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Project } from './types';
import ProjectForm from './components/ProjectForm';
import TaskList from './components/TaskList';
import ProjectDashboard from './components/ProjectDashboard';
import AdminPanel from './components/AdminPanel';
import LoginButton from './components/LoginButton';
import { Settings, UserCircle } from 'lucide-react';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { createOrUpdateUserProfile } from './lib/auth';
import { useAuth } from './components/AuthProvider';
import { supabase } from './lib/supabase';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();
  const { userProfile, setUserProfile } = useAuth();

  useEffect(() => {
    async function initializeUserProfile() {
      if (isAuthenticated && accounts[0] && !userProfile) {
        try {
          console.log('Initializing user profile...');
          const profile = await createOrUpdateUserProfile(accounts[0]);
          if (profile) {
            console.log('Profile created/updated successfully:', profile);
            setUserProfile(profile);
            await loadProjects(profile.id);
          }
        } catch (err: any) {
          console.error('Profile initialization error:', err);
          setError(err.message);
        }
      }
    }

    initializeUserProfile();
  }, [isAuthenticated, accounts, userProfile, setUserProfile]);

  const loadProjects = async (userId: string) => {
    try {
      setLoading(true);
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_tasks (*)
        `)
        .eq('created_by', userId);

      if (projectsError) throw projectsError;

      if (projectsData) {
        const formattedProjects = projectsData.map(project => ({
          id: project.id,
          name: project.name,
          startDate: new Date(project.start_date),
          endDate: new Date(project.end_date),
          status: project.status,
          assignedTo: project.assigned_to,
          progress: project.progress,
          tasks: project.project_tasks.map((task: any) => ({
            id: task.id,
            name: task.name,
            sequence: task.sequence,
            phase: task.phase,
            completionStatus: task.completion_status,
            uploadRequired: task.upload_required,
            reportType: task.report_type,
            updateFrequency: task.update_frequency,
            lastUpdated: new Date(task.last_updated)
          }))
        }));

        setProjects(formattedProjects);
      }
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreate = async ({ name, startDate, endDate }: { name: string; startDate: string; endDate: string }) => {
    if (!userProfile?.id) {
      setError('User profile not found. Please try logging in again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating project with user ID:', userProfile.id);

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          name,
          start_date: startDate,
          end_date: endDate,
          status: 'Planning',
          assigned_to: userProfile.displayName,
          progress: 0,
          created_by: userProfile.id
        }])
        .select()
        .single();

      if (projectError) {
        console.error('Project creation error:', projectError);
        throw projectError;
      }

      console.log('Project created:', project);

      // Get task templates
      const { data: taskTemplates, error: templatesError } = await supabase
        .from('task_templates')
        .select(`
          *,
          project_phases (
            name
          )
        `)
        .order('sequence');

      if (templatesError) throw templatesError;

      // Create tasks from templates
      if (taskTemplates && taskTemplates.length > 0) {
        const projectTasks = taskTemplates.map((template: any) => ({
          project_id: project.id,
          template_id: template.id,
          name: template.name,
          sequence: template.sequence,
          phase: template.project_phases.name,
          completion_status: 'Not Started',
          upload_required: template.upload_required,
          update_frequency: template.update_frequency
        }));

        const { error: tasksError } = await supabase
          .from('project_tasks')
          .insert(projectTasks);

        if (tasksError) throw tasksError;
      }

      await loadProjects(userProfile.id);
      setShowForm(false);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup();
    setUserProfile(null);
    setProjects([]);
  };

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
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
                {!showForm && !selectedProject && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-brand-navy to-brand-maroon text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
                  >
                    New Project
                  </button>
                )}
                <div className="flex items-center space-x-2">
                  <UserCircle className="w-6 h-6 text-brand-navy" />
                  <span className="text-sm text-brand-navy">{userProfile?.displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-brand-navy hover:text-brand-maroon transition-colors"
                >
                  Sign Out
                </button>
                <Link
                  to="/admin"
                  className="p-2 text-brand-navy hover:text-brand-maroon transition-colors"
                  title="Admin Settings"
                >
                  <Settings className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </header>

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
            <Route 
              path="/" 
              element={
                showForm ? (
                  <div className="flex justify-center items-center min-h-[60vh]">
                    <ProjectForm onSubmit={handleProjectCreate} />
                  </div>
                ) : selectedProject ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-brand-navy mb-2">{selectedProject.name}</h2>
                        <div className="flex space-x-4 text-sm text-brand-dark">
                          <span>Start: {selectedProject.startDate.toLocaleDateString()}</span>
                          <span>End: {selectedProject.endDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedProject(null)}
                        className="px-4 py-2 bg-white border border-brand-navy text-brand-navy rounded-lg shadow-sm hover:bg-brand-navy hover:text-white transition-colors duration-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy"
                      >
                        Back to Dashboard
                      </button>
                    </div>

                    <TaskList
                      tasks={selectedProject.tasks}
                      projectId={selectedProject.id}
                      onStatusChange={async (taskId, status) => {
                        const { error: updateError } = await supabase
                          .from('project_tasks')
                          .update({ 
                            completion_status: status,
                            last_updated: new Date().toISOString()
                          })
                          .eq('id', taskId);

                        if (updateError) {
                          setError(updateError.message);
                          return;
                        }

                        if (userProfile) {
                          await loadProjects(userProfile.id);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <ProjectDashboard
                    projects={projects}
                    onViewProject={setSelectedProject}
                  />
                )
              } 
            />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}