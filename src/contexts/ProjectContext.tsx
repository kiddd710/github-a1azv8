import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Project } from '../types';
import * as projectService from '../services/projectService';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

type ProjectAction = 
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string };

interface ProjectContextType extends ProjectState {
  loadProjects: (userId: string) => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null
};

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload)
      };
    default:
      return state;
  }
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { handleError } = useErrorHandler();

  const loadProjects = useCallback(async (userId: string) => {
    if (!userId) {
      console.warn('No user ID provided to loadProjects');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const projects = await projectService.getProjects(userId);
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects';
      handleError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleError]);

  const addProject = useCallback((project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  }, []);

  const updateProject = useCallback((project: Project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: project });
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: projectId });
  }, []);

  return (
    <ProjectContext.Provider value={{
      ...state,
      loadProjects,
      addProject,
      updateProject,
      deleteProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}