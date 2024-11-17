import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../lib/auth';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BrowserAuthError } from '@azure/msal-browser';

export default function LoginButton() {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      if (!import.meta.env.VITE_AZURE_CLIENT_ID || !import.meta.env.VITE_AZURE_TENANT_ID) {
        throw new Error('Azure AD configuration is missing');
      }
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing');
      }

      // Try popup first, fall back to redirect if popup blocked
      try {
        await instance.loginPopup(loginRequest);
      } catch (error) {
        if (error instanceof BrowserAuthError && error.errorCode === 'popup_window_error') {
          console.log('Popup blocked, falling back to redirect...');
          await instance.loginRedirect(loginRequest);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error instanceof BrowserAuthError) {
        if (error.errorCode === 'monitor_window_timeout') {
          errorMessage = 'Authentication timed out. Please try again.';
        } else if (error.errorCode === 'popup_window_error') {
          errorMessage = 'Popup was blocked. Please allow popups or try again.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="inline-flex items-center px-6 py-3 bg-brand-navy text-white rounded-lg hover:bg-brand-maroon transition-colors text-lg disabled:opacity-50"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
        ) : (
          <LogIn className="w-5 h-5 mr-2" />
        )}
        Sign in with Microsoft
      </button>
    </div>
  );
}