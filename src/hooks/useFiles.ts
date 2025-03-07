// src/hooks/useFiles.ts

import { useState, useCallback, useEffect } from 'react';
import { IDriveItem, useSPEClient } from '../api';
import { NavigationItem } from './useFolderNavigation';
import { isFolderItem } from '../models/driveItem';

export interface UseFilesResult {
  files: IDriveItem[];
  loading: boolean;
  error: string | null;
  loadFiles: (driveId: string | null, folderId: string) => Promise<void>;
 // searchFiles: (driveId: string | null, query: string, isGlobal: boolean) => Promise<void>;
  navigateToFolder: (item: IDriveItem, currentBreadcrumbs: NavigationItem[]) => NavigationItem[];
  uploadFile: (driveId: string, folderId: string, file: File) => Promise<IDriveItem>;
  downloadFile: (driveId: string, fileId: string) => Promise<void>;
  deleteFile: (driveId: string, fileId: string) => Promise<void>;
  createFolder: (driveId: string, parentFolderId: string, folderName: string) => Promise<IDriveItem>;
}

export function useFiles(): UseFilesResult {
  const { getClient } = useSPEClient();
  const [files, setFiles] = useState<IDriveItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load files from a folder
  const loadFiles = useCallback(async (driveId: string | null, folderId: string) => {
    if (!driveId) {
      setFiles([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const client = await getClient();
      // Fixed: changed getDriveItems to listItems which is the correct method name
      const items = await client.listItems(driveId, folderId);
      setFiles(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load files');
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  }, [getClient]);

  // Navigate to a folder and update breadcrumbs
  const navigateToFolder = useCallback((item: IDriveItem, currentBreadcrumbs: NavigationItem[]): NavigationItem[] => {
    if (!item.id || !isFolderItem(item)) {
      return currentBreadcrumbs;
    }

    // Create a new breadcrumb item for this folder
    const newBreadcrumb: NavigationItem = {
      id: item.id,
      name: item.name || 'Unnamed Folder',
      type: 'folder',
      parentId: item.parentReference?.id
    };

    // Return updated breadcrumb trail
    return [...currentBreadcrumbs, newBreadcrumb];
  }, []);

  // Upload a file
  const uploadFile = useCallback(async (driveId: string, folderId: string, file: File): Promise<IDriveItem> => {
    setLoading(true);
    setError(null);
    
    try {
      const client = await getClient();
      // Fixed parameter order: driveId, file, parentId (folderId)
      const uploadedFile = await client.uploadFile(driveId, file, folderId);
      
      // Refresh the file list after uploading
      await loadFiles(driveId, folderId);
      
      return uploadedFile;
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      console.error('Error uploading file:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getClient, loadFiles]);

  // Download a file
  const downloadFile = useCallback(async (driveId: string, fileId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const client = await getClient();
      // Using getContentStream instead of the non-existent downloadFile method
      const stream = await client.getContentStream(driveId, fileId);
      
      // Create a blob from the stream
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      
      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine chunks
      const blob = new Blob(chunks);
      
      // Use the download attribute to trigger a browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'downloaded-file'; // Ideally, get the file name from somewhere
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      setError(err.message || 'Failed to download file');
      console.error('Error downloading file:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getClient]);

  // Delete a file
  const deleteFile = useCallback(async (driveId: string, fileId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const client = await getClient();
      await client.deleteItem(driveId, fileId);
      
      // Update the file list by filtering out the deleted item
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
      console.error('Error deleting file:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getClient]);

  // Create a folder
  const createFolder = useCallback(async (driveId: string, parentFolderId: string, folderName: string): Promise<IDriveItem> => {
    setLoading(true);
    setError(null);
    
    try {
      const client = await getClient();
      const newFolder = await client.createFolder(driveId, parentFolderId, folderName);
      
      // Refresh the file list to include the new folder
      await loadFiles(driveId, parentFolderId);
      
      return newFolder;
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
      console.error('Error creating folder:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getClient, loadFiles]);

  return {
    files,
    loading,
    error,
    loadFiles,
    navigateToFolder,
    uploadFile,
    downloadFile,
    deleteFile,
    createFolder
  };
}