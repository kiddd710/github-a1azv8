# Project Workflow Manager

A comprehensive project management solution built with React, Azure AD authentication, and Supabase backend.

## Setup Instructions

1. Create a `.env.local` file in the root directory
2. Copy the contents from `.env.example`
3. Fill in your environment variables:

```env
VITE_AZURE_CLIENT_ID=your_azure_client_id        # From Azure AD App Registration
VITE_AZURE_TENANT_ID=your_azure_tenant_id        # From Azure AD Directory
VITE_SUPABASE_URL=your_supabase_project_url      # From Supabase Project Settings
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key    # From Supabase Project Settings
```

## Development

```bash
npm install
npm run dev
```

[Edit in StackBlitz ⚡️](https://stackblitz.com/~/github.com/kiddd710/Project-Workflow-Manager)