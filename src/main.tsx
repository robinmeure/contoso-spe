import React from 'react';
import ReactDOM from 'react-dom/client';

import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, MsalAuthenticationTemplate } from "@azure/msal-react";
import { initializeIcons } from '@fluentui/react';
import { FluentProvider } from '@fluentui/react-components';
import { Layout } from './components/Layout';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

initializeIcons();

const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_PUBLIC_APP_ID || "",
        authority: import.meta.env.VITE_PUBLIC_AUTHORITY_URL || "",
        redirectUri: "/",
        postLogoutRedirectUri: "/",
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
      },
};

const pca = new PublicClientApplication(msalConfig);

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Wrapper component to consume theme context
const ThemedApp: React.FC = () => {
  const { themeObject } = useTheme();
  
  return (
    <FluentProvider theme={themeObject} className="app-root">
      <MsalProvider instance={pca}>
        <MsalAuthenticationTemplate
          interactionType={InteractionType.Redirect}
          authenticationRequest={authRequest}
        >
          <Layout />
        </MsalAuthenticationTemplate>
      </MsalProvider>
    </FluentProvider>
  );
};

const authRequest = {
    scopes: ["openid", "profile", import.meta.env.VITE_BACKEND_SCOPE || ""]
  };
  
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>
);
