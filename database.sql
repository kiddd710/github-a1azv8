-- Drop existing constraint if it exists
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_azure_id_key;

-- Add unique constraint to azure_id in user_profiles table
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_azure_id_key UNIQUE (azure_id);

-- Update user_profiles table to handle role changes
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('project_manager', 'operations_manager'));

-- Add role change history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.role_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
    previous_role text NOT NULL,
    new_role text NOT NULL,
    changed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    changed_by text NOT NULL,
    reason text
);

-- Enable RLS for role_history if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policies 
        WHERE tablename = 'role_history' AND policyname = 'Enable all for authenticated users'
    ) THEN
        ALTER TABLE role_history ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable all for authenticated users" ON public.role_history
            FOR ALL USING (true);
    END IF;
END $$;

-- Grant permissions for role_history
GRANT ALL ON TABLE public.role_history TO authenticated;
GRANT ALL ON TABLE public.role_history TO anon;