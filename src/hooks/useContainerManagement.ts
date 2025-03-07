// src/hooks/useContainerManagement.ts

import { useState, useCallback } from 'react';
import { IContainer, useSPEClient } from '../api';

export interface UseContainerManagementResult {
  selectedContainer: IContainer | null;
  isLoading: boolean;
  error: string | null;
  selectContainer: (container: IContainer) => Promise<void>;
  driveId: string | null;
}

export function useContainerManagement(): UseContainerManagementResult {
  const { getClient } = useSPEClient();
  const [selectedContainer, setSelectedContainer] = useState<IContainer | null>(null);
  const [driveId, setDriveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectContainer = useCallback(async (container: IContainer) => {
    // Don't fetch if we already have this container selected with drive info
    if (selectedContainer?.id === container.id && driveId) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get client
      const client = await getClient();
      
      // Fetch full container details to ensure we have drive information
      const containerDetails = await client.getContainer(container.id);
      setSelectedContainer(containerDetails);
      
      const containerDriveId = containerDetails.drive?.id;
      setDriveId(containerDriveId || null);
    } catch (err) {
      console.error('Error selecting container:', err);
      setError(`Failed to load container: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getClient, selectedContainer, driveId]);

  return {
    selectedContainer,
    driveId,
    isLoading,
    error,
    selectContainer
  };
}