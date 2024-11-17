import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PostgrestError } from '@supabase/supabase-js';

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown) => {
    console.error('Error occurred:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if ((error as PostgrestError).message) {
      errorMessage = (error as PostgrestError).message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    setError(errorMessage);
    toast.error(errorMessage);

    return errorMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}