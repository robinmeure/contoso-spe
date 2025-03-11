import { useState, useEffect } from 'react';
import { IContainer } from '../models/container';
import { IDriveItem, isFileItem } from '../models/driveItem';
import { useSPEClient } from '../api';

export interface FileListItemDetails {
  siteId: string;
  webId: string;
  listId: string;
  uniqueId: string;
  driveItemId: string; // Adding driveItemId to trace back to original item
  fileName: string;    // Adding file name for easier identification
}

/**
 * Hook to handle fetching file details for multiple files
 */
export function useFileDetails(container: IContainer, selectedFiles: IDriveItem[] = []) {
  const [fileDetailsMap, setFileDetailsMap] = useState<Map<string, FileListItemDetails>>(new Map());
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  const [failedFiles, setFailedFiles] = useState<Set<string>>(new Set());
  const { getClient } = useSPEClient();

  useEffect(() => {
    // Clear all state when container changes
    if (container?.id) {
      setFileDetailsMap(new Map());
      setLoadingFiles(new Set());
      setFailedFiles(new Set());
    }
  }, [container?.id]);

  useEffect(() => {
    if (!container?.drive?.id || selectedFiles.length === 0) return;

    const fetchFileDetails = async () => {
      // Filter to only actual files (not folders) and files not already processed
      const filesToProcess = selectedFiles.filter(file => 
        isFileItem(file) && 
        file.id && 
        !fileDetailsMap.has(file.id) && 
        !loadingFiles.has(file.id) &&
        !failedFiles.has(file.id)
      );

      if (filesToProcess.length === 0) return;

      // Add all files to loading state
      const newLoadingFiles = new Set(loadingFiles);
      filesToProcess.forEach(file => file.id && newLoadingFiles.add(file.id));
      setLoadingFiles(newLoadingFiles);

      try {
        const client = await getClient();
        const driveId = container.drive!.id!;

        // Process files in parallel
        const promises = filesToProcess.map(async (file) => {
          if (!file.id) return null;
          
          try {
            console.log(`Fetching list item details for ${file.name} (ID: ${file.id})`);
            const details = await client.getListItemDetails(driveId, file.id);
            
            // Add additional useful properties
            return {
              ...details,
              driveItemId: file.id,
              fileName: file.name || 'Unknown'
            } as FileListItemDetails;
          } catch (error) {
            console.error(`Failed to fetch details for file ${file.name}:`, error);
            return { fileId: file.id, error };
          }
        });

        const results = await Promise.all(promises);

        // Update state with successful and failed fetches
        const newFileDetailsMap = new Map(fileDetailsMap);
        const newFailedFiles = new Set(failedFiles);
        const finalLoadingFiles = new Set(loadingFiles);

        results.forEach(result => {
          if (!result) return;
          
          if ('error' in result && result.fileId) {
            newFailedFiles.add(result.fileId);
          } else if ('uniqueId' in result && result.driveItemId) {
            newFileDetailsMap.set(result.driveItemId, result as FileListItemDetails);
          }
          
          // Remove from loading state
          if ('fileId' in result && result.fileId) {
            finalLoadingFiles.delete(result.fileId);
          } else if ('driveItemId' in result) {
            finalLoadingFiles.delete(result.driveItemId);
          }
        });

        setFileDetailsMap(newFileDetailsMap);
        setFailedFiles(newFailedFiles);
        setLoadingFiles(finalLoadingFiles);
      } catch (error) {
        console.error('Failed to fetch file details:', error);
        
        // Mark all as failed
        const newFailedFiles = new Set(failedFiles);
        filesToProcess.forEach(file => file.id && newFailedFiles.add(file.id));
        setFailedFiles(newFailedFiles);
        
        // Clear loading state
        const finalLoadingFiles = new Set(loadingFiles);
        filesToProcess.forEach(file => file.id && finalLoadingFiles.delete(file.id));
        setLoadingFiles(finalLoadingFiles);
      }
    };

    fetchFileDetails();
  }, [container?.drive?.id, selectedFiles, fileDetailsMap, loadingFiles, failedFiles, getClient]);

  return {
    fileDetailsMap,
    loadingFiles,
    failedFiles,
    isLoading: loadingFiles.size > 0,
    hasErrors: failedFiles.size > 0,
    // Get all file details as an array
    fileDetailsList: Array.from(fileDetailsMap.values())
  };
}