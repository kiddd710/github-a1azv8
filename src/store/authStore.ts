import { create } from 'zustand';
import { AccountInfo } from '@azure/msal-browser';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { msalInstance } from '../lib/auth';

interface AuthState {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  setUserProfile: (profile: UserProfile | null) => void;
  createOrUpdateProfile: (account: AccountInfo) => Promise<UserProfile | null>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userProfile: null,
  loading: false,
  error: null,

  setUserProfile: (profile) => set({ userProfile: profile }),

  createOrUpdateProfile: async (account) => {
    try {
      set({ loading: true, error: null });

      // Get user groups from Microsoft Graph
      const response = await msalInstance.acquireTokenSilent({
        scopes: ['User.Read', 'GroupMember.Read.All'],
        account: account
      });

      const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
        headers: {
          'Authorization': `Bearer ${response.accessToken}`,
          'ConsistencyLevel': 'eventual'
        }
      });

      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch user groups');
      }

      const { value: groups } = await groupsResponse.json();
      
      // Check for operations manager group membership
      const isOperationsManager = groups.some((group: any) => 
        group.displayName === 'Project_Workflow_Operations_Manager'
      );

      console.log('Groups:', groups.map((g: any) => g.displayName));
      console.log('Is Operations Manager:', isOperationsManager);
      
      const role = isOperationsManager ? 'operations_manager' : 'project_manager';

      // Check for existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select()
        .eq('azure_id', account.localAccountId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const userProfile = {
        azure_id: account.localAccountId,
        email: account.username,
        display_name: account.name || account.username,
        role: role,
        last_login: new Date().toISOString()
      };

      let result;

      if (existingUser) {
        // Always update role to match current group membership
        const { data, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            ...userProfile,
            role: role // Ensure role is updated based on current group membership
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;

        // Log role change if it occurred
        if (existingUser.role !== role) {
          await supabase
            .from('role_history')
            .insert({
              user_id: existingUser.id,
              previous_role: existingUser.role,
              new_role: role,
              changed_by: 'system',
              reason: 'Azure AD group membership update'
            });
        }
      } else {
        // Create new user
        const { data, error: insertError } = await supabase
          .from('user_profiles')
          .insert([userProfile])
          .select()
          .single();

        if (insertError) throw insertError;
        result = data;
      }

      if (!result) {
        throw new Error('Failed to create or update user profile');
      }

      const profile: UserProfile = {
        id: result.id,
        azureId: result.azure_id,
        email: result.email,
        displayName: result.display_name,
        role: result.role,
        createdAt: new Date(result.created_at),
        lastLogin: new Date(result.last_login)
      };

      set({ userProfile: profile });
      return profile;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create/update profile';
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null })
}));