import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { AccountInfo } from '@azure/msal-browser';

export function useAuthManagement() {
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();

  const createOrUpdateProfile = useCallback(async (account: AccountInfo): Promise<UserProfile | null> => {
    try {
      setLoading(true);

      const { data: existingUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('azure_id', account.localAccountId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const userProfile = {
        azure_id: account.localAccountId,
        email: account.username,
        display_name: account.name || account.username,
        role: 'project_manager',
        last_login: new Date().toISOString()
      };

      let profile;
      if (existingUser) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update(userProfile)
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) throw updateError;
        profile = updatedProfile;
      } else {
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert([userProfile])
          .select()
          .single();

        if (insertError) throw insertError;
        profile = newProfile;
      }

      return profile ? {
        id: profile.id,
        azureId: profile.azure_id,
        email: profile.email,
        displayName: profile.display_name,
        role: profile.role as 'project_manager' | 'operations_manager',
        createdAt: new Date(profile.created_at),
        lastLogin: new Date(profile.last_login)
      } : null;

    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    loading,
    createOrUpdateProfile
  };
}