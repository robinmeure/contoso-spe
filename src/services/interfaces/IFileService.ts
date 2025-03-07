// src/services/interfaces/IFileService.ts
import { IDriveItem } from '../../models/driveItem';

/**
 * File service interface adhering to the Interface Segregation Principle
 * Provides file-related operations
 */
export interface IFileService {
  /**
   * List items in a folder
   */
  listItems(driveId: string, parentId?: string): Promise<IDriveItem[]>;
  
  /**
   * Upload a file
   */
  uploadFile(
    driveId: string, 
    file: File, 
    parentId?: string, 
    onProgress?: (progress: number) => void
  ): Promise<IDriveItem>;
  
  /**
   * Download a file
   */
  downloadFile(driveId: string, itemId: string): Promise<void>;
  
  /**
   * Create a new folder
   */
  createFolder(driveId: string, parentId: string, folderName: string): Promise<IDriveItem>;
  
  /**
   * Get a specific item
   */
  getItem(driveId: string, itemId: string): Promise<IDriveItem>;
  
  /**
   * Rename an item
   */
  renameItem(driveId: string, itemId: string, newName: string): Promise<IDriveItem>;
  
  /**
   * Delete an item
   */
  deleteItem(driveId: string, itemId: string): Promise<void>;
  
  /**
   * Get a preview URL for a file
   */
  getPreviewUrl(driveId: string, itemId: string): Promise<URL>;
  
  /**
   * Get content stream for a file
   */
  getContentStream(driveId: string, itemId: string): Promise<ReadableStream<Uint8Array>>;
  
  /**
   * Create a new document
   */
  newDocument(driveId: string, parentId: string, extension: string): Promise<IDriveItem>;
}