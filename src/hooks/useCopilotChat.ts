import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { ChatLaunchConfig } from '@microsoft/sharepointembedded-copilotchat-react';
import { ChatAuthProvider } from '../providers/ChatAuthProvider';
import { ChatProvider } from '../providers/ChatProvider';

/**
 * Hook to handle Copilot Chat configuration
 */
export function useCopilotChat() {
  const { instance } = useMsal();
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatConfig, setChatConfig] = useState<ChatLaunchConfig | null>(null);

  useEffect(() => {
    const configureChat = async () => {
      try {
        console.log('Starting chat configuration...');
        // Get SPO host from environment
        const spoHost = import.meta.env.VITE_REACT_APP_SPO_HOST || '';
        if (!spoHost) {
          throw new Error('SPO host not configured. Set VITE_REACT_APP_SPO_HOST in .env');
        }

        // If already configured, don't reconfigure
        if (ChatAuthProvider.instance.isConfigured) {
          console.log('ChatAuthProvider already configured, checking for existing config');
          const existingConfig = ChatProvider.instance.getChatConfig();
          if (existingConfig) {
            console.log('Using existing chat configuration');
            setChatConfig(existingConfig);
            setIsConfigured(true);
            return;
          }
        }

        // Configure the auth provider with the SPO host and token function
        console.log('Configuring auth provider with host:', spoHost);
        ChatAuthProvider.instance.configure(spoHost, async () => {
          console.log('Token function called');
          // Get all accounts from MSAL
          const accounts = instance.getAllAccounts();
          if (accounts.length === 0) {
            throw new Error('No accounts found, user must sign in');
          }

          // Build the scope needed for SharePoint embedded
          const cleanHostname = spoHost.endsWith('/') ? spoHost.slice(0, -1) : spoHost;
          const spoScope = `${cleanHostname}/Container.Selected`;

          try {
            const response = await instance.acquireTokenSilent({
              scopes: [spoScope],
              account: accounts[0],
            });
            console.log('Token acquired silently');
            return response.accessToken;
          } catch (error) {
            console.error('Silent token acquisition failed:', error);
            
            // Fall back to popup
            const response = await instance.acquireTokenPopup({
              scopes: [spoScope],
            });
            console.log('Token acquired via popup');
            return response.accessToken;
          }
        });

        // Verify that auth provider is working by getting a token
        try {
          // Test the getToken function to make sure it's working
          console.log('Testing token acquisition...');
          const token = await ChatAuthProvider.instance.getToken();
          console.log('Token acquisition test successful');
        } catch (err) {
          console.error('Failed to test token acquisition:', err);
          throw new Error('Failed to verify authentication. Please check your connection and try again.');
        }

        // Create and store chat config
        const newChatConfig: ChatLaunchConfig = {
          // Add required properties for ChatLaunchConfig
          instruction: 'Please ask your question or type / to add people.',
        };
        
        // Store in provider and set local state
        console.log('Setting chat config in provider');
        ChatProvider.instance.setChatConfig(newChatConfig);
        setChatConfig(newChatConfig);
        setIsConfigured(true);
        console.log('Chat configuration complete');
      } catch (err) {
        console.error('Failed to configure chat:', err);
        setError(err instanceof Error ? err.message : 'Failed to configure chat');
      }
    };

    configureChat();
    
    // Subscribe to chat config changes
    return ChatProvider.instance.addConfigSubscriber((config) => {
      console.log('Chat config updated from provider');
      setChatConfig(config);
      setIsConfigured(true);
    });
  }, [instance]);

  return { isConfigured, error, chatConfig };
}