// src/models/folderItem.ts
import { IBaseItem } from './baseItem';

/**
 * Interface for folder items
 * Extends IBaseItem to maintain Liskov Substitution Principle
 */
export interface IFolderItem extends IBaseItem {
  /**
   * Folder-specific metadata
   */
  folder: {
    /**
     * Count of child items in the folder
     */
    childCount: number;
    
    /**
     * View settings for the folder
     */
    view?: {
      sortBy?: string;
      sortOrder?: 'ascending' | 'descending';
      viewType?: string;
    };
  };
  
  /**
   * Whether this is the root folder
   */
  isRoot?: boolean;
  
  /**
   * Information about who created and modified the folder
   */
  createdBy?: {
    user?: {
      displayName?: string;
      email?: string;
    }
  };
  
  lastModifiedBy?: {
    user?: {
      displayName?: string;
      email?: string;
    }
  };
}