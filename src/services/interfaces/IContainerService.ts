

// src/services/interfaces/IContainerService.ts
import { 
  IContainer, 
  IContainerClientCreateRequest, 
  ICustomProperties, 
  ICustomProperty, 
 
  IRecycleBinItem
} from '../../models/container';

import { IColumnDefinition, IColumnCreateRequest } from '../../models/column';
/**
 * Container service interface adhering to the Interface Segregation Principle
 * Provides container-related operations
 */
export interface IContainerService {
  /**
   * Get all containers
   */
  getContainers(): Promise<IContainer[]>;
  
  /**
   * Get a specific container by ID
   */
  getContainer(containerId: string): Promise<IContainer>;
  
  /**
   * Create a new container
   */
  createContainer(container: IContainerClientCreateRequest): Promise<IContainer>;
  
  /**
   * Delete a container by ID
   */
  deleteContainer(containerId: string): Promise<boolean>;
  
  /**
   * Update container details
   */
  updateContainerDetails(containerId: string, details: {
    displayName?: string, 
    description?: string
  }): Promise<IContainer>;
  
  /**
   * Get container permissions
   */
  getContainerPermissions(containerId: string): Promise<any[]>;
  
  /**
   * Update container permissions
   */
  updateContainerPermissions(containerId: string, permissions: any): Promise<any>;
  
  /**
   * Delete a container permission
   */
  deleteContainerPermission(containerId: string, permissionId: string): Promise<void>;
  
  /**
   * Get container custom properties
   */
  getContainerCustomProperties(containerId: string): Promise<ICustomProperties>;
  
  /**
   * Update a container custom property
   */
  updateContainerCustomProperty(
    containerId: string, 
    propertyKey: string, 
    property: ICustomProperty
  ): Promise<void>;
  
  /**
   * Delete a container custom property
   */
  deleteContainerCustomProperty(containerId: string, propertyKey: string): Promise<void>;
  
  /**
   * Get container columns
   */
  getContainerColumns(containerId: string): Promise<IColumnDefinition[]>;
  
  /**
   * Create a container column
   */
  createContainerColumn(
    containerId: string, 
    column: IColumnCreateRequest
  ): Promise<IColumnDefinition>;
  
  /**
   * Update a container column
   */
  updateContainerColumn(
    containerId: string, 
    columnId: string, 
    column: Partial<IColumnCreateRequest>
  ): Promise<IColumnDefinition>;
  
  /**
   * Delete a container column
   */
  deleteContainerColumn(containerId: string, columnId: string): Promise<void>;
  
  /**
   * Get recycle bin items
   */
  getRecycleBinItems(containerId: string): Promise<IRecycleBinItem[]>;
  
  /**
   * Restore a recycle bin item
   */
  restoreRecycleBinItem(containerId: string, itemId: string): Promise<void>;
  
  /**
   * Permanently delete a recycle bin item
   */
  permanentlyDeleteRecycleBinItem(containerId: string, itemId: string): Promise<void>;
}