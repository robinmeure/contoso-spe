import { Client } from "@microsoft/microsoft-graph-client";
import { Drive } from "@microsoft/microsoft-graph-types";
import * as Graph from "@microsoft/microsoft-graph-client";

import { IContainer, IContainerClientCreateRequest, ICustomProperties, ICustomProperty, IRecycleBinItem } from "../models/container";
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

  public async getContainer(containerId: string): Promise<IContainer> {
    const endpoint = `/storage/fileStorage/containers/${containerId}`;
    const query = {
      $expand: 'drive'
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
      fileReader.addEventListener('loadend', async (event: any) => {
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
        } catch (error: any) {
          reject(new Error(`Failed to upload file ${file.name}: ${error.message}`));
        }
      });
      
      fileReader.addEventListener('error', (event: any) => {
        reject(new Error(`Error on reading file: ${event.message}`));
      });
      
      fileReader.addEventListener('progress', (event: any) => {
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

  public async getContainerPermissions(containerId: string): Promise<any[]> {
    const endpoint = `/storage/fileStorage/containers/${containerId}/permissions`;
    const response = await this._providerClient.api(endpoint).get();
    return response.value;
  }

  public async updateContainerPermissions(containerId: string, permissions: any): Promise<any> {
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
    
    // Append ContainerTypeId filter to the query
    let queryString = options.query;
    // if (!queryString.includes(`ContainerTypeId:${this._containerTypeId}`)) {
    //   queryString = `${queryString} ContainerTypeId:${this._containerTypeId}`;
    // }
    
    // Prepare the search request
    const searchRequest: any = {
      requests: [{
        entityTypes: options.entityTypes || ["driveItem"],
        query: {
          queryString: queryString
        },
        sharePointOneDriveOptions: {
          includeHiddenContent: true
        }
      }]
    };
    
    // Add requested fields if provided
    if (options.fields && options.fields.length > 0) {
      searchRequest.requests[0].fields = options.fields;
    } else {
      // Default fields to include
      searchRequest.requests[0].fields = [
        "id",
        "name",
        "parentReference",
        "file",
        "folder",
        "webUrl",
        "createdDateTime",
        "lastModifiedDateTime",
        "size",
        "fileSystemInfo",
        "createdBy",
        "lastModifiedBy"
      ];
    }
    
    // Add pagination if provided
    if (options.from !== undefined || options.size !== undefined) {
      searchRequest.requests[0].from = options.from || 0;
      searchRequest.requests[0].size = options.size || 25;
    }
    
    // Add aggregations if provided
    if (options.aggregations && options.aggregations.length > 0) {
      searchRequest.requests[0].aggregations = options.aggregations;
    }
    
    // Add aggregation filters if provided
    if (options.aggregationFilters && options.aggregationFilters.length > 0) {
      searchRequest.requests[0].aggregationFilters = options.aggregationFilters;
    }
    
    // Add sort properties if provided
    if (options.sortProperties && options.sortProperties.length > 0) {
      searchRequest.requests[0].sortProperties = options.sortProperties;
    }
    
    // Execute the search request
    const response = await this._providerClient.api(endpoint).post(searchRequest);
    
    // Process the search results
    if (response.value && response.value.length > 0) {
      const searchResult = response.value[0];
      if (searchResult.hitsContainers && searchResult.hitsContainers.length > 0) {
        const container = searchResult.hitsContainers[0];
        
        // Extract all hits from all containers
        const allHits: ISearchResult[] = [];
        
        if (container.hits && container.hits.length > 0) {
          container.hits.forEach((hit: ISearchResult) => {
              allHits.push(hit);
          });
        }
        
        // Extract aggregation results
        const aggregationResults = container.aggregations 
          ? container.aggregations.map((agg: any) => ({
              field: agg.field,
              buckets: agg.buckets
            }))
          : undefined;
        
        return {
          results: allHits as ISearchResult[],
          totalResults: container.total || allHits.length,
          moreResultsAvailable: container.moreResultsAvailable || false,
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
  public async getThumbnail(driveId: string, itemId: string, size: 'small' | 'medium' | 'large' = 'small'): Promise<any> {
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
  public async getDriveItemPermissions(driveId: string, itemId: string): Promise<any[]> {
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
  public async addDriveItemPermission(driveId: string, itemId: string, permission: any): Promise<any> {
    const endpoint = `/drives/${driveId}/items/${itemId}/invite`;
    
    // Ensure the permission object has the correct format
    // If it's a sharing link request, keep the existing structure
    if (!permission.link) {
      // Format for sharing with recipients
      const requestBody = {
        requireSignIn: permission.requireSignIn !== undefined ? permission.requireSignIn : true,
        sendInvitation: permission.sendInvitation !== undefined ? permission.sendInvitation : false,
        roles: permission.roles || ["read"],
        recipients: permission.recipients?.map((recipient: any) => ({
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
  ): Promise<any> {
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
}