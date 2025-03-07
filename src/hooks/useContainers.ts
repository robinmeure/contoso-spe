// src/hooks/useContainers.ts

import { useState, useCallback } from 'react';
import { 
  IContainer, 
  IContainerClientCreateRequest, 
  ICustomProperties,
  ICustomProperty,
  IColumnDefinition,
  IColumnCreateRequest
} from '../api';
import { IContainerService } from '../services/interfaces/IContainerService';
import { errorHandler, ErrorContext } from '../utils/errorHandling';

export interface ContainerPermission {
  id: string;
  roles: string[];
  grantedToV2: {
    user?: {
      displayName: string;
      email: string;
      userPrincipalName: string;
    };
    group?: {
      displayName: string;
      email?: string;
    };
  };
}

export interface PermissionRequest {
  roles: string[];
  recipients: {
    email: string;
  }[];
}

export interface UseContainersResult {
  containers: IContainer[];
  loading: boolean;
  error: string | null;
  loadContainers: () => Promise<void>;
  createContainer: (container: IContainerClientCreateRequest) => Promise<void>;
  getContainerPermissions: (containerId: string) => Promise<ContainerPermission[]>;
  updateContainerPermissions: (containerId: string, request: PermissionRequest) => Promise<void>;
  deleteContainerPermission: (containerId: string, permissionId: string) => Promise<void>;
  
  // Custom properties methods
  getContainerCustomProperties: (containerId: string) => Promise<ICustomProperties>;
  addContainerCustomProperty: (containerId: string, propertyKey: string, property: ICustomProperty) => Promise<void>;
  updateContainerCustomProperty: (containerId: string, propertyKey: string, property: ICustomProperty) => Promise<void>;
  deleteContainerCustomProperty: (containerId: string, propertyKey: string) => Promise<void>;
  
  // Column methods
  getContainerColumns: (containerId: string) => Promise<IColumnDefinition[]>;
  createContainerColumn: (containerId: string, column: IColumnCreateRequest) => Promise<IColumnDefinition>;
  updateContainerColumn: (containerId: string, columnId: string, column: Partial<IColumnCreateRequest>) => Promise<IColumnDefinition>;
  deleteContainerColumn: (containerId: string, columnId: string) => Promise<void>;
  
  // Container details
  updateContainerDetails: (containerId: string, details: {displayName?: string, description?: string}) => Promise<IContainer>;
}

/**
 * Hook for container operations using dependency injection
 * @param containerService The container service implementation to use
 */
export function useContainers(containerService: IContainerService): UseContainersResult {
  const [containers, setContainers] = useState<IContainer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadContainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await containerService.getContainers();
      setContainers(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load containers';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'loadContainers'
      };
      errorHandler.handleError(err, context);
    } finally {
      setLoading(false);
    }
  }, [containerService]);

  const createContainer = useCallback(async (container: IContainerClientCreateRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      await containerService.createContainer(container);
      await loadContainers(); // Refresh the list after creating
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create container';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'createContainer',
        params: { container }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [containerService, loadContainers]);

  const getContainerPermissions = useCallback(async (containerId: string): Promise<ContainerPermission[]> => {
    try {
      return await containerService.getContainerPermissions(containerId);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load permissions';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'getContainerPermissions',
        params: { containerId }
      };
      errorHandler.handleError(err, context);
      
      return [];
    }
  }, [containerService]);

  const updateContainerPermissions = useCallback(async (containerId: string, request: PermissionRequest) => {
    try {
      await containerService.updateContainerPermissions(containerId, request);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add permission';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'updateContainerPermissions',
        params: { containerId, request }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  const deleteContainerPermission = useCallback(async (containerId: string, permissionId: string) => {
    try {
      await containerService.deleteContainerPermission(containerId, permissionId);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete permission';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'deleteContainerPermission',
        params: { containerId, permissionId }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  // Custom properties methods
  const getContainerCustomProperties = useCallback(async (containerId: string): Promise<ICustomProperties> => {
    try {
      return await containerService.getContainerCustomProperties(containerId);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load custom properties';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'getContainerCustomProperties',
        params: { containerId }
      };
      errorHandler.handleError(err, context);
      
      return {};
    }
  }, [containerService]);

  const addContainerCustomProperty = useCallback(async (
    containerId: string, 
    propertyKey: string, 
    property: ICustomProperty
  ) => {
    try {
      await containerService.updateContainerCustomProperty(containerId, propertyKey, property);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add custom property';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'addContainerCustomProperty',
        params: { containerId, propertyKey, property }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  const updateContainerCustomProperty = useCallback(async (
    containerId: string, 
    propertyKey: string, 
    property: ICustomProperty
  ) => {
    try {
      await containerService.updateContainerCustomProperty(containerId, propertyKey, property);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update custom property';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'updateContainerCustomProperty',
        params: { containerId, propertyKey, property }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  const deleteContainerCustomProperty = useCallback(async (containerId: string, propertyKey: string) => {
    try {
      await containerService.deleteContainerCustomProperty(containerId, propertyKey);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete custom property';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'deleteContainerCustomProperty',
        params: { containerId, propertyKey }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  // Column methods
  const getContainerColumns = useCallback(async (containerId: string): Promise<IColumnDefinition[]> => {
    try {
      return await containerService.getContainerColumns(containerId);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load columns';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'getContainerColumns',
        params: { containerId }
      };
      errorHandler.handleError(err, context);
      
      return [];
    }
  }, [containerService]);

  const createContainerColumn = useCallback(async (
    containerId: string, 
    column: IColumnCreateRequest
  ): Promise<IColumnDefinition> => {
    try {
      return await containerService.createContainerColumn(containerId, column);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create column';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'createContainerColumn',
        params: { containerId, column }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  const updateContainerColumn = useCallback(async (
    containerId: string, 
    columnId: string, 
    column: Partial<IColumnDefinition>
  ): Promise<IColumnDefinition> => {
    try {
      const updatedColumn = await containerService.updateContainerColumn(containerId, columnId, column);

      return updatedColumn;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update column';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'updateContainerColumn',
        params: { containerId, columnId, column }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  const deleteContainerColumn = useCallback(async (containerId: string, columnId: string) => {
    try {
      await containerService.deleteContainerColumn(containerId, columnId);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete column';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'deleteContainerColumn',
        params: { containerId, columnId }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  // Container details
  const updateContainerDetails = useCallback(async (
    containerId: string, 
    details: {displayName?: string, description?: string}
  ): Promise<IContainer> => {
    try {
      return await containerService.updateContainerDetails(containerId, details);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update container details';
      setError(errorMsg);
      
      const context: ErrorContext = {
        component: 'useContainers',
        operation: 'updateContainerDetails',
        params: { containerId, details }
      };
      errorHandler.handleError(err, context);
      
      throw err;
    }
  }, [containerService]);

  return {
    containers,
    loading,
    error,
    loadContainers,
    createContainer,
    getContainerPermissions,
    updateContainerPermissions,
    deleteContainerPermission,
    getContainerCustomProperties,
    addContainerCustomProperty,
    updateContainerCustomProperty,
    deleteContainerCustomProperty,
    getContainerColumns,
    createContainerColumn,
    updateContainerColumn,
    deleteContainerColumn,
    updateContainerDetails
  };
}