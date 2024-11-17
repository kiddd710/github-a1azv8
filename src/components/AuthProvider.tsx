import React, { createContext, useContext } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '../lib/auth';
import { config } from '../lib/config';
import { useAuthStore } from '../store/authStore';
import { UserProfile } from '../types';

interface AuthContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  setUserProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { userProfile, loading, error, setUserProfile } = useAuthStore();

  try {
    config;
  } catch (err: any) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-700 mb-4">{err.message}</p>
          <p className="text-sm text-gray-500">
            Please check your environment variables and ensure they are properly configured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MsalProvider instance={msalInstance}>
      <AuthContext.Provider value={{ userProfile, loading, error, setUserProfile }}>
        {children}
      </AuthContext.Provider>
    </MsalProvider>
  );
}