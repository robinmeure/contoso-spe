// src/services/implementations/ContainerService.ts
import { Client } from "@microsoft/microsoft-graph-client";
import { 
  IContainer, 
  IContainerClientCreateRequest, 
  ICustomProperties, 
  ICustomProperty, 
  IRecycleBinItem
} from '../../models/container';
import { IContainerService } from '../interfaces/IContainerService';
import { errorHandler, ErrorContext, ErrorSeverity } from '../../utils/errorHandling';
import { IColumnDefinition, IColumnCreateRequest } from '../../models/column';

/**
 * Implementation of the Container Service
 * This separates container concerns from the main SharePointEmbeddedClient
 */
export class ContainerService implements IContainerService {
  private _client: Client;
  private _containerTypeId: string;

  /**
   * Constructor for ContainerService
   * @param client The Microsoft Graph client
   * @param containerTypeId Container type ID
   */
  constructor(client: Client, containerTypeId: string) {
    this._client = client;
    this._containerTypeId = containerTypeId;
  }

  /**
   * Get all containers
   */
  public async getContainers(): Promise<IContainer[]> {
    try {
      const endpoint = `/storage/fileStorage/containers`;
      const query = {
        $filter: `containerTypeId eq ${this._containerTypeId}`,
        $expand: 'drive'
      };
      const response = await this._client.api(endpoint).query(query).get();
      const containers = response.value as IContainer[];
      return containers;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'getContainers',
        containerTypeId: this._containerTypeId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }

  /**
   * Get a specific container by ID
   */
  public async getContainer(containerId: string): Promise<IContainer> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}`;
      const query = {
        $expand: 'drive'
      };
      const response = await this._client.api(endpoint).query(query).get();
      return response as IContainer;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'getContainer',
        containerId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }

  /**
   * Create a new container
   */
  public async createContainer(container: IContainerClientCreateRequest): Promise<IContainer> {
    try {
      const endpoint = `/storage/fileStorage/containers`;
      const body = {
        ...container,
        containerTypeId: this._containerTypeId,
      };
      const response = await this._client.api(endpoint).post(body);
      return response as IContainer;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'createContainer',
        requestData: container
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }

  /**
   * Delete a container by ID
   */
  public async deleteContainer(containerId: string): Promise<boolean> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}`;
      await this._client.api(endpoint).delete();
      return true;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'deleteContainer',
        containerId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }

  /**
   * Update container details
   */
  public async updateContainerDetails(containerId: string, details: {
    displayName?: string, 
    description?: string
  }): Promise<IContainer> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}`;
      const response = await this._client.api(endpoint).patch(details);
      return response as IContainer;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'updateContainerDetails',
        containerId,
        requestData: details
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Get container permissions
   */
  public async getContainerPermissions(containerId: string): Promise<any[]> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/permissions`;
      const response = await this._client.api(endpoint).get();
      return response.value;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'getContainerPermissions',
        containerId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Update container permissions
   */
  public async updateContainerPermissions(containerId: string, permissions: any): Promise<any> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/permissions`;
      const response = await this._client.api(endpoint).post(permissions);
      return response;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'updateContainerPermissions',
        containerId,
        requestData: permissions
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Delete container permission
   */
  public async deleteContainerPermission(containerId: string, permissionId: string): Promise<void> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/permissions/${permissionId}`;
      await this._client.api(endpoint).delete();
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'deleteContainerPermission',
        containerId,
        permissionId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }

  /**
   * Get container custom properties
   */
  public async getContainerCustomProperties(containerId: string): Promise<ICustomProperties> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/customProperties`;
      const response = await this._client.api(endpoint).get();
      return response as ICustomProperties;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'getContainerCustomProperties',
        containerId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Update container custom property
   */
  public async updateContainerCustomProperty(
    containerId: string, 
    propertyKey: string, 
    property: ICustomProperty
  ): Promise<void> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/customProperties/${propertyKey}`;
      await this._client.api(endpoint).put(property);
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'updateContainerCustomProperty',
        containerId,
        propertyKey,
        property
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Delete container custom property
   */
  public async deleteContainerCustomProperty(containerId: string, propertyKey: string): Promise<void> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/customProperties/${propertyKey}`;
      await this._client.api(endpoint).delete();
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'deleteContainerCustomProperty',
        containerId,
        propertyKey
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Get container columns
   */
  public async getContainerColumns(containerId: string): Promise<IColumnDefinition[]> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/columns`;
      const response = await this._client.api(endpoint).get();
      return response.value as IColumnDefinition[];
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'getContainerColumns',
        containerId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Create container column
   */
  public async createContainerColumn(
    containerId: string, 
    column: IColumnCreateRequest
  ): Promise<IColumnDefinition> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/columns`;
      const response = await this._client.api(endpoint).post(column);
      return response as IColumnDefinition;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'createContainerColumn',
        containerId,
        column
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Update container column
   */
  public async updateContainerColumn(
    containerId: string, 
    columnId: string, 
    column: Partial<IColumnDefinition>
  ): Promise<IColumnDefinition> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/columns/${columnId}`;
      const response = await this._client.api(endpoint).patch(column);
      return response as IColumnDefinition;
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'updateContainerColumn',
        containerId,
        columnId,
        column
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Delete container column
   */
  public async deleteContainerColumn(containerId: string, columnId: string): Promise<void> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/columns/${columnId}`;
      await this._client.api(endpoint).delete();
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'deleteContainerColumn',
        containerId,
        columnId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Get recycle bin items
   */
  public async getRecycleBinItems(containerId: string): Promise<IRecycleBinItem[]> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/recycleBin/items`;
      const response = await this._client.api(endpoint).get();
      return response.value as IRecycleBinItem[];
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'getRecycleBinItems',
        containerId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Restore recycle bin item
   */
  public async restoreRecycleBinItem(containerId: string, itemId: string): Promise<void> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/recycleBin/items/${itemId}/restore`;
      await this._client.api(endpoint).post({});
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'restoreRecycleBinItem',
        containerId,
        itemId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
  
  /**
   * Permanently delete recycle bin item
   */
  public async permanentlyDeleteRecycleBinItem(containerId: string, itemId: string): Promise<void> {
    try {
      const endpoint = `/storage/fileStorage/containers/${containerId}/recycleBin/items/${itemId}`;
      await this._client.api(endpoint).delete();
    } catch (error) {
      const context: ErrorContext = {
        component: 'ContainerService',
        operation: 'permanentlyDeleteRecycleBinItem',
        containerId,
        itemId
      };
      errorHandler.handleError(error, context);
      throw error;
    }
  }
}