import { Configuration, PublicClientApplication, AccountInfo, BrowserAuthError } from '@azure/msal-browser';
import { config } from './config';

export const msalConfig: Configuration = {
  auth: {
    clientId: config.azure.clientId,
    authority: `https://login.microsoftonline.com/${config.azure.tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true // Enable cookies to help with IE11 and iFrame operations
  },
  system: {
    windowHashTimeout: 9000, // Increase timeout from default 6000ms to 9000ms
    iframeHashTimeout: 9000,
    loadFrameTimeout: 9000,
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case 0: console.error(message); return;
          case 1: console.warn(message); return;
          case 2: console.info(message); return;
          case 3: console.debug(message); return;
        }
      },
      piiLoggingEnabled: false
    }
  }
};

export const loginRequest = {
  scopes: ['User.Read', 'GroupMember.Read.All'],
  prompt: 'select_account' // Force account selection to avoid cached credentials issues
};

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
msalInstance.initialize()
  .then(() => {
    console.log('MSAL initialized successfully');
  })
  .catch(error => {
    console.error('MSAL initialization failed:', error);
    // Handle initialization error gracefully
    if (error instanceof BrowserAuthError) {
      // Handle specific browser auth errors
      if (error.errorCode === 'monitor_window_timeout') {
        console.error('Authentication window timed out. Please try again.');
      }
    }
  });

// Handle redirect promise to catch any errors after redirect login
msalInstance.handleRedirectPromise().catch(error => {
  console.error('Error handling redirect:', error);
});