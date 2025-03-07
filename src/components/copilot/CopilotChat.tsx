// src/components/copilot/CopilotChat.tsx

import React, { useRef, useEffect, useState } from 'react';
import { 
  ChatEmbedded, 
  ChatEmbeddedAPI, 
  ChatLaunchConfig,
  DataSourceType,
  IDataSourcesProps
} from '@microsoft/sharepointembedded-copilotchat-react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { useMsal } from '@azure/msal-react';
import { ChatAuthProvider } from '../../providers/ChatAuthProvider';
import { ChatProvider } from '../../providers/ChatProvider';
import { IContainer } from '../../models/container';

const useStyles = makeStyles({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4
  }
});

interface CopilotChatProps {
  container: IContainer;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ container }) => {
  const styles = useStyles();
  const { instance } = useMsal();
  const copilotApiRef = useRef<ChatEmbeddedAPI | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatConfig, setChatConfig] = useState<ChatLaunchConfig | null>(null);

  // Configure the auth provider on component mount
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

  // Set container data source when container changes or when API becomes ready
  useEffect(() => {
    if (!container?.drive?.webUrl || !copilotApiRef.current) {
      return;
    }
    
    const setContainerDataSource = async () => {
      try {
        console.log('Setting container data source:', container.drive!.webUrl);
        
        // Create single data source for container drive
        const containerDataSource: IDataSourcesProps = {
          type: DataSourceType.DocumentLibrary,
          value: {
            url: container.drive!.webUrl!
          }
        };
        
        // Set data source directly via API
        await copilotApiRef.current!.setDataSources([containerDataSource]);
        
        // Set only this data source in the provider (replacing any existing ones)
        ChatProvider.instance.setDataSources([containerDataSource]);
        
        console.log('Container data source set successfully');
      } catch (err) {
        console.error('Error setting container data source:', err);
        setError(err instanceof Error ? err.message : 'Failed to set container data source');
      }
    };
    
    setContainerDataSource();
  }, [container?.drive?.webUrl, copilotApiRef.current]);

  // Handle API ready event
  const handleApiReady = async (api: ChatEmbeddedAPI) => {
    console.log('Chat API ready');
    copilotApiRef.current = api;
    
    if (!chatConfig) {
      console.error('Chat config not available when API is ready');
      setError('Chat configuration not available. Please refresh the page and try again.');
      return;
    }

    try {
      // Check if authProvider exists and has getToken method
      console.log('Opening chat with config:', chatConfig);
      // Open chat with config
      await api.openChat(chatConfig);
      console.log('Chat opened successfully');
      
      // If container already has a drive with webUrl, set data source immediately
      if (container?.drive?.webUrl) {
        console.log('Setting container data source on API ready');
        const containerDataSource: IDataSourcesProps = {
          type: DataSourceType.DocumentLibrary,
          value: {
            url: container.drive!.webUrl!
          }
        };
        
        await api.setDataSources([containerDataSource]);
        console.log('Container data source set successfully on API ready');
      }
    } catch (err) {
      console.error('Error opening chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to open chat');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isConfigured || !chatConfig) {
    return <div>Loading Copilot...</div>;
  }

  return (
    <div className={styles.root}>
      <ChatEmbedded
          authProvider={ChatAuthProvider.instance}
          onApiReady={(api: ChatEmbeddedAPI) => handleApiReady(api)}
          containerId={container.id!}
      />
    </div>
  );
};
