// src/components/copilot/CopilotChat.tsx

import React, { useRef, useCallback } from 'react';
import { 
  ChatEmbedded, 
  ChatEmbeddedAPI, 
  DataSourceType,
  IDataSourcesProps
} from '@microsoft/sharepointembedded-copilotchat-react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { IContainer } from '../../models/container';
import { IDriveItem } from '../../models/driveItem';
import { ChatAuthProvider } from '../../providers/ChatAuthProvider';
import { ChatProvider } from '../../providers/ChatProvider';
import { useCopilotChat } from '../../hooks/useCopilotChat';
import { useFileDetails } from '../../hooks/useFileDetails';

const useStyles = makeStyles({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4
  },
  loadingState: {
    padding: tokens.spacingVerticalL,
    textAlign: 'center',
    color: tokens.colorNeutralForeground1
  },
  error: {
    padding: tokens.spacingVerticalL,
    textAlign: 'center',
    color: tokens.colorPaletteRedForeground1
  }
});

interface CopilotChatProps {
  container: IContainer;
  selectedFiles: IDriveItem[];  // Changed to support multiple files
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ container, selectedFiles }) => {
  const styles = useStyles();
  const copilotApiRef = useRef<ChatEmbeddedAPI | null>(null);
  const { isConfigured, error: configError, chatConfig } = useCopilotChat();
  const { 
    fileDetailsList,
    isLoading: isLoadingFileDetails,
    hasErrors: hasFileErrors
  } = useFileDetails(container, selectedFiles);

  // Handle API ready event
  const handleApiReady = useCallback(async (api: ChatEmbeddedAPI) => {
    console.log('Chat API ready');
    copilotApiRef.current = api;
    
    if (!chatConfig) {
      console.error('Chat config not available when API is ready');
      return;
    }

    try {
      // Open chat with config
      await api.openChat(chatConfig);
      console.log('Chat opened successfully');
      
      // Create data sources based on selection state
      const dataSources: IDataSourcesProps[] = [];
      
      // Add file data sources if files are selected
      if (fileDetailsList.length > 0) {
        const fileDataSources = fileDetailsList.map(details => ({
          type: DataSourceType.File as const,
          value: {
            siteId: details.siteId,
            webId: details.webId,
            listId: details.listId,
            uniqueId: details.uniqueId
          }
        }));
        dataSources.push(...fileDataSources);
      }
      
      // Add container data source if no files are selected or as additional context
      if (container?.drive?.webUrl) {
        dataSources.push({
          type: DataSourceType.DocumentLibrary,
          value: {
            url: container.drive.webUrl
          }
        });
      }
      
      // Set all data sources
      if (dataSources.length > 0) {
        await api.setDataSources(dataSources);
        ChatProvider.instance.setDataSources(dataSources);
        console.log('Data sources set successfully:', dataSources);
      }
    } catch (err) {
      console.error('Error configuring chat:', err);
    }
  }, [chatConfig, container?.drive?.webUrl, fileDetailsList]);

  if (configError) {
    return <div className={styles.error}>Error: {configError}</div>;
  }

  if (!isConfigured || !chatConfig) {
    return <div className={styles.loadingState}>Loading Copilot...</div>;
  }

  if (isLoadingFileDetails) {
    return <div className={styles.loadingState}>Loading file details...</div>;
  }

  if (hasFileErrors) {
    return <div className={styles.error}>Error loading some file details. Please try again.</div>;
  }

  return (
    <div className={styles.root}>
      <ChatEmbedded
        authProvider={ChatAuthProvider.instance}
        onApiReady={handleApiReady}
        containerId={container.id!}
      />
    </div>
  );
};
