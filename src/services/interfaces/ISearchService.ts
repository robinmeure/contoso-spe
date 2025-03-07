// src/services/interfaces/ISearchService.ts
import { ISearchOptions, ISearchResponse } from '../../models/search';

/**
 * Search service interface adhering to the Interface Segregation Principle
 * Provides search-related operations
 */
export interface ISearchService {
  /**
   * Search items with options
   */
  searchItems(options: string | ISearchOptions, driveId?: string): Promise<ISearchResponse>;
  
  /**
   * Search items within a specific drive
   */
  searchDriveItems(driveId: string, options: string | ISearchOptions): Promise<ISearchResponse>;
  
  /**
   * Global search across all containers
   */
  searchGlobalItems(options: string | ISearchOptions): Promise<ISearchResponse>;
}