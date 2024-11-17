interface Config {
  azure: {
    clientId: string;
    tenantId: string;
    communicationServiceConnectionString?: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  email?: {
    senderAddress?: string;
  };
}

function validateConfig(): Config {
  const config = {
    azure: {
      clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
      tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
      communicationServiceConnectionString: import.meta.env.VITE_AZURE_COMMUNICATION_CONNECTION_STRING,
    },
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    email: {
      senderAddress: import.meta.env.VITE_EMAIL_SENDER_ADDRESS,
    },
  };

  // Validate required config values
  const missingVars: string[] = [];
  
  if (!config.azure.clientId) missingVars.push('VITE_AZURE_CLIENT_ID');
  if (!config.azure.tenantId) missingVars.push('VITE_AZURE_TENANT_ID');
  if (!config.supabase.url) missingVars.push('VITE_SUPABASE_URL');
  if (!config.supabase.anonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please create a .env.local file with these variables. See .env.example for reference.'
    );
  }

  // Validate Supabase URL format
  try {
    if (!config.supabase.url.startsWith('https://') || !config.supabase.url.includes('.supabase.co')) {
      throw new Error('Invalid URL format');
    }
    new URL(config.supabase.url);
  } catch (e) {
    throw new Error(
      'Invalid VITE_SUPABASE_URL format. Please ensure it\'s a valid URL.\n' +
      'Example: https://your-project.supabase.co'
    );
  }

  return config;
}

export const config = validateConfig();