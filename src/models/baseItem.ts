// src/models/baseItem.ts

/**
 * Base interface for all items in the system
 * Following the Liskov Substitution Principle by defining a common contract
 */
export interface IBaseItem {
  /**
   * Unique identifier for the item
   */
  id: string;
  
  /**
   * Display name of the item
   */
  name: string;
  
  /**
   * When the item was created
   */
  createdDateTime?: string;
  
  /**
   * When the item was last modified
   */
  lastModifiedDateTime?: string;
  
  /**
   * Web URL for the item
   */
  webUrl?: string;
  
  /**
   * Parent reference information
   */
  parentReference?: {
    driveId?: string;
    id?: string;
    path?: string;
  };
}