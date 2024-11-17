import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { AccountInfo } from '@azure/msal-browser';
import { msalInstance } from '../lib/auth';

export async function createOrUpdateUserProfile(account: AccountInfo): Promise<UserProfile | null> {
  try {
    // Get user groups from Microsoft Graph to determine role
    const response = await msalInstance.acquireTokenSilent({
      scopes: ['User.Read', 'GroupMember.Read.All'],
      account: account
    });

    const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
      headers: {
        Authorization: `Bearer ${response.accessToken}`
      }
    });

    if (!groupsResponse.ok) {
      throw new Error('Failed to fetch user groups');
    }

    const { value: groups } = await groupsResponse.json();
    
    // Determine role based on group membership
    const isOperationsManager = groups.some((g: any) => 
      g.displayName === 'Project_Workflow_Operations_Manager'
    );
    
    const role = isOperationsManager ? 'operations_manager' : 'project_manager';

    // Check for existing user profile
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
      // Update existing user
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update(userProfile)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      result = data;
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

    return {
      id: result.id,
      azureId: result.azure_id,
      email: result.email,
      displayName: result.display_name,
      role: result.role as 'project_manager' | 'operations_manager',
      createdAt: new Date(result.created_at),
      lastLogin: new Date(result.last_login)
    };
  } catch (error) {
    console.error('Error in createOrUpdateUserProfile:', error);
    throw error;
  }
}