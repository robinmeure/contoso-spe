import { Client } from "@microsoft/microsoft-graph-client";
import { Drive } from "@microsoft/microsoft-graph-types";
import * as Graph from "@microsoft/microsoft-graph-client";

import { IContainer, IContainerClientCreateRequest, ICustomProperties, ICustomProperty, IRecycleBinItem, ContainerPermission, PermissionRequest } from "../models/container";
import { IDriveItem, DriveItemArrayConstructor } from "../models/driveItem";
import { IColumnDefinition, IColumnCreateRequest } from "../models/column";
import { ISearchOptions, ISearchResponse, ISearchResult } from "../models/search";

// SharePoint Embedded API Client
export class SharePointEmbeddedClient {
  private _client: Client;
  private _providerClient: Client;
  private _containerTypeId: string;

  constructor(accessToken: string, containerTypeId: string) {
    this._containerTypeId = containerTypeId;
    
    this._client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    this._providerClient = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
      baseUrl: "https://graph.microsoft.com/",
      defaultVersion: "beta",
    });
  }

  public async createContainer(container: IContainerClientCreateRequest): Promise<IContainer> {
    const endpoint = `/storage/fileStorage/containers`;
    const body = {
      displayName: container.displayName,
      description: container.description,
      containerTypeId: this._containerTypeId
    };
    const response = await this._providerClient.api(endpoint).post(body);
    return response as IContainer;
  }

  public async deleteContainer(containerId: string): Promise<boolean> {
    const endpoint = `/storage/fileStorage/containers/${containerId}`;
    const response = await this._providerClient.api(endpoint).delete();
    return true; 
  }

  public async getContainers(): Promise<IContainer[]> {
    const endpoint = `/storage/fileStorage/containers`;
    const query = {
      $filter: `containerTypeId eq ${this._containerTypeId}`,
      $expand: 'drive'
    };
    const response = await this._providerClient.api(endpoint).query(query).get();
    const containers = response.value as IContainer[];
    return containers;
  }

  public async getContainer(containerId: string, options?: { expand?: string }): Promise<IContainer> {
    const endpoint = `/storage/fileStorage/containers/${containerId}`;
    const query: Record<string, string> = {
      $expand: options?.expand || 'drive'
    };
    const response = await this._providerClient.api(endpoint).query(query).get();
    return response as IContainer;
  }

  public async getDrive(driveId: string): Promise<Drive> {
    const endpoint = `/drives/${driveId}`;
    const response = await this._providerClient.api(endpoint).get();
    return response as Drive;
  }

  public async listItems(driveId: string, parentId: string = 'root'): Promise<IDriveItem[]> {
    const endpoint = `/drives/${driveId}/items/${parentId}/children`;
    const query = {
      $expand: 'listitem($expand=fields)',
      $select: 'id,name,createdDateTime,lastModifiedBy,lastModifiedDateTime,size,folder,file,root,parentReference,webUrl,webDavUrl,content.downloadUrl'
    };
    const response = await this._providerClient.api(endpoint).query(query).get();
    const items = response.value;
    return DriveItemArrayConstructor.from(items);
  }

  public async uploadFile(
    driveId: string, 
    file: File, 
    parentId: string = 'root', 
    onProgress?: (progress: number) => void
  ): Promise<IDriveItem> {
    const smallSizeMax = 4 * 1024 * 1024;
    if (file.size > smallSizeMax) {
      return this._uploadLargeFile(driveId, file, parentId, onProgress);
    } else {
      return this._uploadSmallFile(driveId, file, parentId, onProgress);
    }
  }

  private async _uploadLargeFile(
    driveId: string, 
    file: File, 
    parentId: string,
    onProgress?: (progress: number) => void
  ): Promise<IDriveItem> {
    const options: Graph.LargeFileUploadTaskOptions = {
      // Chunk size must be a multiple of 320 KiB
      rangeSize: 10 * 320 * 1024, // 3.2 MiB
      uploadEventHandlers: {
        progress: (range, _) => {
          const currentBytes = range?.maxValue || 0;
          const percentage = file.size > 0 ? Math.round((currentBytes / file.size) * 100) : 0;
          console.log(`Uploaded bytes ${range?.minValue}-${range?.maxValue} of ${file.size} (${percentage}%)`);
          
          if (onProgress) {
            onProgress(percentage);
          }
        }
      },
    };
    const endpoint = `/drives/${driveId}/items/${parentId}:/${file.name}:/createUploadSession`;
    const payload = {
      item: {
        "@microsoft.graph.conflictBehavior": "rename",
        "name": file.name
      }
    };
    const session = await Graph.LargeFileUploadTask.createUploadSession(this._client, endpoint, payload);
    const upload = new Graph.FileUpload(file, file.name, file.size);
    const task = new Graph.LargeFileUploadTask(this._client, upload, session, options);
    const result = await task.upload();
    
    if (onProgress) {
      onProgress(100); // Ensure we show 100% when complete
    }
    
    return result.responseBody as IDriveItem;
  }

  private async _uploadSmallFile(
    driveId: string, 
    file: File, 
    parentId: string,
    onProgress?: (progress: number) => void
  ): Promise<IDriveItem> {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    
    // Report start of upload
    if (onProgress) {
      onProgress(0);
    }
    
    return new Promise<IDriveItem>((resolve, reject) => {
      fileReader.addEventListener('loadend', async () => {
        try {
          // Report reading complete
          if (onProgress) {
            onProgress(50); // At 50% after file is read into memory
          }
          
          const endpoint = `/drives/${driveId}/items/${parentId}:/${file.name}:/content`;
          const response = await this._providerClient.api(endpoint).putStream(fileReader.result);
          
          // Report upload complete
          if (onProgress) {
            onProgress(100);
          }
          
          resolve(response as IDriveItem);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          reject(new Error(`Failed to upload file ${file.name}: ${message}`));
        }
      });
      
      fileReader.addEventListener('error', () => {
        reject(new Error(`Error on reading file: ${file.name}`));
      });
      
      fileReader.addEventListener('progress', (event: ProgressEvent) => {
        if (event.lengthComputable && onProgress) {
          // Report progress during file reading (0-50%)
          const percentLoaded = Math.round((event.loaded / event.total) * 50);
          onProgress(percentLoaded);
        }
      });
    });
  }

  public async newDocument(driveId: string, parentId: string, extension: string): Promise<IDriveItem> {
    const endpoint = `/drives/${driveId}/items/${parentId}/children`;
    const body = {
      name: `New Document.${extension}`,
      file: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    };
    return await this._providerClient.api(endpoint).post(body) as IDriveItem;
  }

  public async createFolder(driveId: string, parentId: string, newFolderName: string): Promise<IDriveItem> {
    const endpoint = `/drives/${driveId}/items/${parentId}/children`;
    const body = {
      name: newFolderName,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    };
    return await this._providerClient.api(endpoint).post(body) as IDriveItem;
  }

  public async renameItem(driveId: string, itemId: string, newName: string): Promise<IDriveItem> {
    const endpoint = `/drives/${driveId}/items/${itemId}`;
    const body = { name: newName };
    return await this._providerClient.api(endpoint).patch(body) as IDriveItem;
  }

  public async deleteItem(driveId: string, itemId: string): Promise<void> {
    const endpoint = `/drives/${driveId}/items/${itemId}`;
    await this._providerClient.api(endpoint).delete();
  }

  public async getPreviewUrl(driveId: string, itemId: string): Promise<URL> {
    const endpoint = `/drives/${driveId}/items/${itemId}/preview`;
    const response = await this._providerClient.api(endpoint).post({});
    const url = new URL(response.getUrl);
    url.searchParams.set('nb', 'true');
    return url;
  }

  public async getContentStream(driveId: string, itemId: string): Promise<ReadableStream<Uint8Array>> {
    const endpoint = `/drives/${driveId}/items/${itemId}/content`;
    return await this._providerClient.api(endpoint).getStream();
  }

  public async getContainerCustomProperties(containerId: string): Promise<ICustomProperties> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/customProperties`;
    const response = await this._providerClient.api(endpoint).get();
    return response as ICustomProperties;
  }

  public async updateContainerCustomProperty(containerId: string, propertyKey: string, property: ICustomProperty): Promise<void> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/customProperties/${propertyKey}`;
    await this._providerClient.api(endpoint).put(property);
  }

  public async deleteContainerCustomProperty(containerId: string, propertyKey: string): Promise<void> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/customProperties/${propertyKey}`;
    await this._providerClient.api(endpoint).delete();
  }

  public async getContainerColumns(containerId: string): Promise<IColumnDefinition[]> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/columns`;
    const response = await this._providerClient.api(endpoint).get();
    return response.value as IColumnDefinition[];
  }

  public async createContainerColumn(containerId: string, column: IColumnCreateRequest): Promise<IColumnDefinition> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/columns`;
    const response = await this._providerClient.api(endpoint).post(column);
    return response as IColumnDefinition;
  }

  public async updateContainerColumn(containerId: string, columnId: string, column: Partial<IColumnCreateRequest>): Promise<IColumnDefinition> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/columns/${columnId}`;
    const response = await this._providerClient.api(endpoint).patch(column);
    return response as IColumnDefinition;
  }

  public async deleteContainerColumn(containerId: string, columnId: string): Promise<void> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/columns/${columnId}`;
    await this._providerClient.api(endpoint).delete();
  }

  public async getContainerPermissions(containerId: string): Promise<ContainerPermission[]> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/permissions`;
    const response = await this._providerClient.api(endpoint).get();
    return response.value;
  }

  public async updateContainerPermissions(containerId: string, permissions: PermissionRequest): Promise<ContainerPermission> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/permissions`;
    return await this._providerClient.api(endpoint).post(permissions);
  }

  public async deleteContainerPermission(containerId: string, permissionId: string): Promise<void> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/permissions/${permissionId}`;
    await this._providerClient.api(endpoint).delete();
  }

  public async updateContainerDetails(containerId: string, details: {displayName?: string, description?: string}): Promise<IContainer> {
    const endpoint = `/storage/fileStorage/containers/${containerId}`;
    const response = await this._providerClient.api(endpoint).patch(details);
    return response as IContainer;
  }

  public async searchItems(options: string | ISearchOptions, driveId?: string): Promise<ISearchResponse> {
    // For backward compatibility
    if (typeof options === 'string') {
      options = { query: options };
    }
    
    // Route to appropriate search method
    if (driveId) {
      return this.searchDriveItems(driveId, options);
    } else {
      return this.searchGlobalItems(options);
    }
  }

  /**
   * Search for items within a specific drive (local search)
   * @param driveId The ID of the drive to search in
   * @param options Search options or query string
   */
  public async searchDriveItems(driveId: string, options: string | ISearchOptions): Promise<ISearchResponse> {
    // Handle string query for backward compatibility
    if (typeof options === 'string') {
      options = { query: options };
    }

    // Use the drive-specific search endpoint
    const endpoint = `/drives/${driveId}/root/search(q='${encodeURIComponent(options.query)}')`;
    const response = await this._providerClient.api(endpoint).get();
    const items = response.value as ISearchResult[];
    
    return {
      results: items,
      totalResults: items.length,
      moreResultsAvailable: false
    };
  }

  /**
   * Search globally across all containers with extended options
   * @param options Search options including query, pagination, sorting, etc.
   */
  public async searchGlobalItems(options: string | ISearchOptions): Promise<ISearchResponse> {
    // Handle string query for backward compatibility
    if (typeof options === 'string') {
      options = { query: options };
    }

    // Global search endpoint
    const endpoint = `/search/query`;
    
    const queryString = options.query;
    
    // Build the search request object
    const requestEntry: Record<string, unknown> = {
      entityTypes: options.entityTypes || ["driveItem"],
      query: { queryString },
      sharePointOneDriveOptions: { includeHiddenContent: true },
      fields: options.fields?.length ? options.fields : [
        "id", "name", "parentReference", "file", "folder", "webUrl",
        "createdDateTime", "lastModifiedDateTime", "size",
        "fileSystemInfo", "createdBy", "lastModifiedBy"
      ],
    };
    
    if (options.from !== undefined || options.size !== undefined) {
      requestEntry.from = options.from || 0;
      requestEntry.size = options.size || 25;
    }
    if (options.aggregations?.length) {
      requestEntry.aggregations = options.aggregations;
    }
    if (options.aggregationFilters?.length) {
      requestEntry.aggregationFilters = options.aggregationFilters;
    }
    if (options.sortProperties?.length) {
      requestEntry.sortProperties = options.sortProperties;
    }
    
    const searchRequest = { requests: [requestEntry] };
    
    // Execute the search request
    const response = await this._providerClient.api(endpoint).post(searchRequest);
    
    // Process the search results
    if (response.value && response.value.length > 0) {
      const searchResult = response.value[0];
      if (searchResult.hitsContainers && searchResult.hitsContainers.length > 0) {
        const hitsContainer = searchResult.hitsContainers[0];
        
        const allHits: ISearchResult[] = hitsContainer.hits ?? [];
        
        // Extract aggregation results
        const aggregationResults = hitsContainer.aggregations 
          ? hitsContainer.aggregations.map((agg: { field: string; buckets: unknown[] }) => ({
              field: agg.field,
              buckets: agg.buckets
            }))
          : undefined;
        
        return {
          results: allHits,
          totalResults: hitsContainer.total || allHits.length,
          moreResultsAvailable: hitsContainer.moreResultsAvailable || false,
          aggregationResults
        };
      }
    }
    
    return {
      results: [],
      totalResults: 0,
      moreResultsAvailable: false
    };
  }

  public async getRecycleBinItems(containerId: string): Promise<IRecycleBinItem[]> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/recycleBin/items`;
    const response = await this._providerClient.api(endpoint).get();
    return response.value as IRecycleBinItem[];
  }

  public async restoreRecycleBinItem(containerId: string, itemId: string): Promise<void> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/recycleBin/items/${itemId}/restore`;
    await this._providerClient.api(endpoint).post({});
  }

  public async permanentlyDeleteRecycleBinItem(containerId: string, itemId: string): Promise<void> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/recycleBin/items/${itemId}`;
    await this._providerClient.api(endpoint).delete();
  }

  /**
   * Gets thumbnail for a specified drive item
   * @param driveId The ID of the drive
   * @param itemId The ID of the drive item
   * @param size The size of the thumbnail (small, medium, large)
   * @returns Thumbnail response with URLs for different sizes
   */
  public async getThumbnail(driveId: string, itemId: string, size: 'small' | 'medium' | 'large' = 'small'): Promise<Record<string, unknown>> {
    const endpoint = `/drives/${driveId}/items/${itemId}/thumbnails`;
    const response = await this._providerClient.api(endpoint).get();
    
    // Return the full thumbnail response object
    // The consumer can extract the URL from response.value[0][size].url
    return response;
  }

  /**
   * Gets permissions for a drive item
   * @param driveId The ID of the drive
   * @param itemId The ID of the drive item
   * @returns Array of permissions
   */
  public async getDriveItemPermissions(driveId: string, itemId: string): Promise<Record<string, unknown>[]> {
    const endpoint = `/drives/${driveId}/items/${itemId}/permissions`;
    const response = await this._providerClient.api(endpoint).get();
    return response.value;
  }

  /**
   * Updates permissions for a drive item
   * @param driveId The ID of the drive
   * @param itemId The ID of the drive item
   * @param permission The permission object with roles and recipients
   * @returns The created permission
   */
  public async addDriveItemPermission(driveId: string, itemId: string, permission: Record<string, unknown>): Promise<Record<string, unknown>> {
    const endpoint = `/drives/${driveId}/items/${itemId}/invite`;
    
    // Ensure the permission object has the correct format
    // If it's a sharing link request, keep the existing structure
    if (!permission.link) {
      // Format for sharing with recipients
      const requestBody = {
        requireSignIn: permission.requireSignIn !== undefined ? permission.requireSignIn : true,
        sendInvitation: permission.sendInvitation !== undefined ? permission.sendInvitation : false,
        roles: permission.roles || ["read"],
        recipients: permission.recipients?.map((recipient: Record<string, unknown>) => ({
          "@odata.type": "microsoft.graph.driveRecipient",
          ...recipient
        })) || [],
        message: permission.message || ""
      };
      
      return await this._providerClient.api(endpoint).post(requestBody);
    } else {
      // For link-based sharing, keep the original structure
      return await this._providerClient.api(endpoint).post(permission);
    }
  }

  /**
   * Creates a sharing link for a drive item using the createLink API
   * @param driveId The ID of the drive
   * @param itemId The ID of the drive item
   * @param type The type of link to create (view, edit)
   * @param scope The scope of the link (anonymous, organization)
   * @returns The created sharing link
   */
  public async createSharingLink(
    driveId: string, 
    itemId: string, 
    type: 'view' | 'edit' = 'view',
    scope: 'anonymous' | 'organization' = 'organization'
  ): Promise<Record<string, unknown>> {
    const endpoint = `/drives/${driveId}/items/${itemId}/createLink`;
    
    const requestBody = {
      type,
      scope
    };
    
    return await this._providerClient.api(endpoint).post(requestBody);
  }

  /**
   * Removes a permission from a drive item
   * @param driveId The ID of the drive
   * @param itemId The ID of the drive item
   * @param permissionId The ID of the permission to remove
   */
  public async removeDriveItemPermission(driveId: string, itemId: string, permissionId: string): Promise<void> {
    const endpoint = `/drives/${driveId}/items/${itemId}/permissions/${permissionId}`;
    await this._providerClient.api(endpoint).delete();
  }

  /**
   * Gets the detailed listItem information for a specific drive item
   * This provides the data needed for Copilot file-specific context
   * @param driveId The ID of the drive
   * @param itemId The ID of the drive item
   * @returns An object containing the listItem details including siteId, webId, listId, and uniqueId
   */
  public async getListItemDetails(driveId: string, itemId: string): Promise<{
    siteId: string;
    webId: string;
    listId: string;
    uniqueId: string;
  }> {
    try {
      // First, get the item with expanded listItem fields
      const endpoint = `/drives/${driveId}/items/${itemId}?$select=sharepointIds`;
      const response = await this._providerClient.api(endpoint).get();
      
      if (!response.sharepointIds) {
        throw new Error("List item information not available for this drive item.");
      }
      
      const siteId = response.sharepointIds.siteId;
      const webId = response.sharepointIds.webId;
      const listId = response.sharepointIds.listId;
      const uniqueId = response.sharepointIds.listItemUniqueId;

      // Return the formatted data needed for Copilot file context
      return {
        siteId: siteId,
        webId: webId,
        listId: listId,
        uniqueId: uniqueId
      };
    } catch (error) {
      console.error("Failed to get list item details:", error);
      throw error;
    }
  }
}