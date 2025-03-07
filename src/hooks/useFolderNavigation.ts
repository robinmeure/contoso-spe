// src/hooks/useFolderNavigation.ts

import { useState, useCallback } from 'react';
import { IDriveItem } from '../api';

export interface NavigationItem {
  id: string;
  name: string;
  type: 'container' | 'folder';
  parentId?: string;
}

export interface UseFolderNavigationResult {
  currentFolderId: string;
  breadcrumbs: NavigationItem[];
  navigateToFolder: (item: IDriveItem, newBreadcrumbs: NavigationItem[]) => void;
  navigateToBreadcrumb: (item: NavigationItem, index: number) => void;
  resetNavigation: (containerId: string, containerName: string) => void;
}

export function useFolderNavigation(): UseFolderNavigationResult {
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<NavigationItem[]>([]);

  const navigateToFolder = useCallback((item: IDriveItem, newBreadcrumbs: NavigationItem[]) => {
    if (item.id) {
      setCurrentFolderId(item.id);
      setBreadcrumbs(newBreadcrumbs);
    }
  }, []);

  const navigateToBreadcrumb = useCallback((item: NavigationItem, index: number) => {
    if (item.type === 'container') {
      // Reset to container root
      setCurrentFolderId('root');
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    } else if (item.type === 'folder') {
      // Navigate to specific folder
      setCurrentFolderId(item.id);
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  }, [breadcrumbs]);

  const resetNavigation = useCallback((containerId: string, containerName: string) => {
    setCurrentFolderId('root');
    setBreadcrumbs([{
      id: containerId,
      name: containerName,
      type: 'container'
    }]);
  }, []);

  return {
    currentFolderId,
    breadcrumbs,
    navigateToFolder,
    navigateToBreadcrumb,
    resetNavigation
  };
}