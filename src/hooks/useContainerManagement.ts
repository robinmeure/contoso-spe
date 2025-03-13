// src/hooks/useContainerManagement.ts

import { useState, useCallback } from 'react';
import { IContainer, useSPEClient } from '../api';

export interface UseContainerManagementResult {
  selectedContainer: IContainer | null;
  isLoading: boolean;
  error: string | null;
  selectContainer: (container: IContainer) => Promise<void>;
  driveId: string | null;
  refreshContainer: () => Promise<void>;
  fetchContainerDetails: (containerId: string) => Promise<IContainer>;
}

export function useContainerManagement(): UseContainerManagementResult {
  const { getClient } = useSPEClient();
  const [selectedContainer, setSelectedContainer] = useState<IContainer | null>(null);
  const [driveId, setDriveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContainerDetails = useCallback(async (containerId: string): Promise<IContainer> => {
    try {
      const client = await getClient();
      // Get complete container details with drive information and quota
      const containerDetails = await client.getContainer(containerId, {
        expand: 'drive($expand=quota)'
      });
      return containerDetails;
    } catch (err) {
      console.error('Error fetching container details:', err);
      throw err;
    }
  }, [getClient]);

  const selectContainer = useCallback(async (container: IContainer) => {
    // Don't fetch if we already have this container selected with drive info
    if (selectedContainer?.id === container.id && driveId) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch full container details with drive and quota information
      const containerDetails = await fetchContainerDetails(container.id);
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
  }, [fetchContainerDetails, selectedContainer, driveId]);

  const refreshContainer = useCallback(async () => {
    if (!selectedContainer) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const refreshedContainer = await fetchContainerDetails(selectedContainer.id);
      setSelectedContainer(refreshedContainer);
      
      const containerDriveId = refreshedContainer.drive?.id;
      setDriveId(containerDriveId || null);
    } catch (err) {
      console.error('Error refreshing container:', err);
      setError(`Failed to refresh container: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchContainerDetails, selectedContainer]);

  return {
    selectedContainer,
    driveId,
    isLoading,
    error,
    selectContainer,
    refreshContainer,
    fetchContainerDetails
  };
}