import { IBaseItem } from './baseItem';
import { IFileItem } from './fileItem';
import { IFolderItem } from './folderItem';

import { DriveItem } from '@microsoft/microsoft-graph-types';

export interface IDriveItem extends DriveItem {
  isRoot?: boolean;
}

/**
 * Union type that can represent either a file or folder
 * This follows LSP by ensuring each type maintains the contract of IBaseItem
 */
export type DriveItemTypes = IFileItem | IFolderItem | IBaseItem;

/**
 * Type guard to check if an item is a file
 */
export function isFileItem(item: IDriveItem): item is IFileItem {
  return item && item.file !== undefined;
}

/**
 * Type guard to check if an item is a folder
 */
export function isFolderItem(item: IDriveItem): item is IFolderItem {
  return item && item.folder !== undefined;
}

/**
 * Helper for creating DriveItem arrays
 * Ensures consistent type handling across the application
 */
export class DriveItemArrayConstructor {
  /**
   * Convert API response to typed array
   */
  static from(items: any[]): IDriveItem[] {
    return items.map(item => {
      // For consistency, ensure all items have at least 
      // the base properties even if the API doesn't provide them
      const baseItem: IDriveItem = {
        id: item.id || '',
        name: item.name || '',
        createdDateTime: item.createdDateTime,
        lastModifiedDateTime: item.lastModifiedDateTime,
        webUrl: item.webUrl,
        parentReference: item.parentReference
      };

      if (item.folder) {
        // It's a folder
        return {
          ...baseItem,
          folder: {
            childCount: item.folder.childCount || 0,
            view: item.folder.view
          },
          isRoot: item.root ? true : false,
          createdBy: item.createdBy,
          lastModifiedBy: item.lastModifiedBy
        };
      } else if (item.file) {
        // It's a file
        return {
          ...baseItem,
          size: item.size,
          file: {
            mimeType: item.file.mimeType || 'application/octet-stream',
            hashes: item.file.hashes
          },
          contentUrl: item.contentUrl || item['@microsoft.graph.downloadUrl'],
          createdBy: item.createdBy,
          lastModifiedBy: item.lastModifiedBy
        };
      }
      
      // Default case - return as base item
      return baseItem;
    });
  }
}