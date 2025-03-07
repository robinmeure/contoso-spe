// Export all SharePoint Embedded models and client
// Container models
export { 
  type IContainer,
  type IContainerClientCreateRequest,
  type ICustomProperty,
  type ICustomProperties,
  type IRecycleBinItem
} from './models/container';

// Drive item models
export {
  type IDriveItem,
  DriveItemArrayConstructor
} from './models/driveItem';

// Column models
export {
  type IColumnDefinition,
  type IColumnCreateRequest
} from './models/column';

// Search models
export {
  type ISearchAggregation,
  type ISearchBucket,
  type ISearchAggregationResult,
  type ISortProperty,
  type ISearchOptions,
  type ISearchResponse,
  type ISearchResult
} from './models/search';

// SharePoint Embedded Client
export { SharePointEmbeddedClient } from './services/sharePointEmbeddedClient';

// React hook for SharePoint Embedded
export { useSPEClient } from './hooks/useSharePointEmbedded';