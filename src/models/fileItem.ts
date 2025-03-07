// src/models/fileItem.ts
import { IBaseItem } from './baseItem';

/**
 * Interface for file items
 * Extends IBaseItem to maintain Liskov Substitution Principle
 */
export interface IFileItem extends IBaseItem {
  /**
   * Size of the file in bytes
   */
  size?: number;
  
  /**
   * File-specific metadata
   */
  file: {
    /**
     * MIME type of the file
     */
    mimeType: string;
    
    /**
     * Hash values for the file
     */
    hashes?: {
      sha1Hash?: string;
      quickXorHash?: string;
    };
  };
  
  /**
   * Content URL for direct file access
   */
  contentUrl?: string;
  
  /**
   * Information about who created and modified the file
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