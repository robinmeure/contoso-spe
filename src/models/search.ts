// Search-related interfaces
export interface ISearchAggregation {
  field: string;
  size?: number;
  bucketDefinition: {
    sortBy: 'count' | 'keyAsString';
    isDescending: true | false;
    minimumCount: number;
    ranges?: Array<{
      from?: string;
      to?: string;
    }>;
  };
}

export interface ISearchBucket {
  key: string;
  count: number;
  aggregationFilterToken: string;
}

export interface ISearchAggregationResult {
  field: string;
  buckets: ISearchBucket[];
}

export interface ISortProperty {
  name: string;
  isDescending: boolean;
}

export interface ISearchOptions {
  query: string;
  entityTypes?: string[];
  from?: number;
  size?: number;
  aggregations?: ISearchAggregation[];
  aggregationFilters?: string[];
  fields?: string[];
  sortProperties?: ISortProperty[];
}

export interface ISearchResponse {
  results: ISearchResult[];
  totalResults: number;
  moreResultsAvailable: boolean;
  aggregationResults?: ISearchAggregationResult[];
}

export interface ISearchResult {
  hitId?: string;
  summary?: string;
  rank?: number;
  containerName?: string;
  resource?: {
    size?: number;
    fileSystemInfo?: {
      createdDateTime?: string;
      lastModifiedDateTime?: string;
    };
    lastModifiedDateTime?: string;
    name?: string;
    webUrl?: string;
    folder?: any;
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
    parentReference?: {
      siteId?: string;
      driveId?: string;
      sharepointIds?: {
        siteId?: string;
        siteUrl?: string;
      }
    };
  };
  // Keep these for backward compatibility
  size?: number;
  lastModifiedDateTime?: string;
  createdDateTime?: string;
  name?: string;
  webUrl?: string;
  folder?: any;
}