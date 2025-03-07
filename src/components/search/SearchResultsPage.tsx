import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  shorthands,
  Text,
  Button,
  Spinner,
  tokens,
  Card,
  Input,
  Badge,
  Tooltip,
  Persona,
  Dropdown,
  Option
} from '@fluentui/react-components';
import { 
  Folder24Regular,
  Open24Regular,
  Filter24Regular,
  Filter24Filled,
  ChevronLeft24Regular,
  ChevronRight24Regular,
  Search24Regular,
  NumberSymbol24Regular,
  Globe24Regular} from '@fluentui/react-icons';
import { Icon } from '@fluentui/react';
import { getFileTypeIconProps, FileIconType, initializeFileTypeIcons } from '@fluentui/react-file-type-icons';
import { useSPEClient, ISearchAggregationResult, ISearchOptions, ISearchResult } from '../../api';
import { formatFileSize, formatDate } from '../../utils/formatters';
import { SearchFilters, FilterSelection } from './SearchFilters';

// Initialize file type icons
initializeFileTypeIcons();

interface SearchResultsPageProps {
  initialQuery?: string;
}

const DEFAULT_PAGE_SIZE = 20;

// Default aggregations to request
const DEFAULT_AGGREGATIONS = [
  {
    field: 'fileType',
    size: 10,
    bucketDefinition: {
      sortBy: "count" as "count",
      isDescending: true,
      minimumCount: 0
    }
  },
  {
    field: 'lastModifiedTime',
    size: 3,
    bucketDefinition: {
      sortBy: "keyAsString" as "keyAsString",
      isDescending: true,
      minimumCount: 0,
      ranges: [
        {
          to: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
        },
        {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        },
        {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  }
];

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
   // backgroundColor: tokens.colorNeutralBackground2,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalM + ' ' + tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground1,
    //boxShadow: tokens.shadow4,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    gap: tokens.spacingHorizontalL,
  },
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    maxWidth: '800px',
    width: '100%',
  },
  searchInputWrapper: {
    display: 'flex',
    flexGrow: 1,
    position: 'relative',
  },
  searchActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexShrink: 0,
  },
  searchInput: {
    width: '100%',
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground1,
    flexShrink: 0,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground1,
  },
  content: {
    display: 'flex',
    flexGrow: 1,
    overflow: 'hidden',
    gap: tokens.spacingHorizontalL,
    padding: tokens.spacingHorizontalL
    
  },
  filtersPane: {
    display: 'flex',
    flexShrink: 0,
    transition: 'width 0.2s ease-in-out',
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    borderRadius: tokens.borderRadiusMedium,
  },
  resultsContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    
  },
  resultCard: {
    marginBottom: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1)   
  },
  resultItemContent: {
    padding: tokens.spacingVerticalL + ' ' + tokens.spacingHorizontalL,
  },
  badgeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginBottom: tokens.spacingVerticalS,
  },
  rankBadge: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground2,
    ...shorthands.padding('2px', tokens.spacingHorizontalS),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  containerBadge: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    ...shorthands.padding('2px', tokens.spacingHorizontalS),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  siteBadge: {
    backgroundColor: tokens.colorPaletteBerryBackground2,
    color: tokens.colorPaletteBerryForeground2,
    ...shorthands.padding('2px', tokens.spacingHorizontalS),
    ...shorthands.borderRadius(tokens.borderRadiusCircular),
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXXS,
  },
  resultTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
  },
  titleText: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase500,
  },
  resultIcon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
    fontSize: tokens.fontSizeBase500,
  },
  summaryText: {
    marginBottom: tokens.spacingVerticalL,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase300,
    '& c0': {
      backgroundColor: tokens.colorBrandBackgroundInverted,
      color: tokens.colorBrandForeground1,
      fontWeight: tokens.fontWeightSemibold,
      ...shorthands.padding('0px', '2px'),
      ...shorthands.borderRadius(tokens.borderRadiusSmall),
      display: 'inline-block',
      margin: '0 2px',
    },
    '& ddd': {
      '&::before': {
        content: '"..."',
        color: tokens.colorNeutralForeground3,
        margin: '0 4px',
      }
    }
  },
  metadataGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: tokens.spacingHorizontalL + ' ' + tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    marginBottom: tokens.spacingVerticalL,
  },
  metadataSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  metadataLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    textTransform: 'uppercase'
  },
  metadataValue: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
  },
  personaContainer: {
    marginTop: tokens.spacingVerticalS,
  },
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalL,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: tokens.spacingVerticalM,
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.spacingVerticalS + ' ' + tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke1),
    boxShadow: tokens.shadow4,
    marginBottom: tokens.spacingVerticalL,
  },
  searchStats: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    
  },
  pageInfo: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    minWidth: '100px',
    textAlign: 'center',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: tokens.spacingVerticalL,
    color: tokens.colorNeutralForeground2,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    boxShadow: tokens.shadow4,
    padding: tokens.spacingVerticalXXL,
  },
  emptyStateIcon: {
    fontSize: '48px',
    color: tokens.colorBrandForeground2,
  },
  resultsLoadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: tokens.spacingVerticalXL,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    boxShadow: tokens.shadow4,
    marginTop: tokens.spacingVerticalL,
  }
});

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ initialQuery = '' }) => {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isInitialSearch, setIsInitialSearch] = useState<boolean>(true);
  const [results, setResults] = useState<ISearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [aggregationResults, setAggregationResults] = useState<ISearchAggregationResult[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterSelection[]>([]);
  const [moreResultsAvailable, setMoreResultsAvailable] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>("relevance");
  
  const { getClient } = useSPEClient();

  const performSearch = async (query: string, page: number = 1, filters: FilterSelection[] = [], sort: string = sortOption) => {
    if (!query?.trim()) {
      setResults([]);
      setTotalResults(0);
      setAggregationResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const client = await getClient();
      
      // Convert selected filters to the format expected by the API
      const aggregationFilters = filters.flatMap(filter => 
        filter.selectedTokens.map(token => `${filter.field}:${token}`)
      );
      
      // Prepare sort property based on sort option
      const sortProperties = [];
      if (sort === "date") {
        sortProperties.push({
          name: "lastModifiedDateTime",
          isDescending: true
        });
      }
      // relevance is default sorting in the API
      
      // Prepare search options
      const options: ISearchOptions = {
        query,
        entityTypes: ["driveItem"],
        from: (page - 1) * DEFAULT_PAGE_SIZE,
        size: DEFAULT_PAGE_SIZE,
        aggregations: DEFAULT_AGGREGATIONS,
        aggregationFilters: aggregationFilters.length > 0 ? aggregationFilters : undefined,
        sortProperties: sortProperties.length > 0 ? sortProperties : undefined
      };
      
      // Perform the search
      const searchResponse = await client.searchItems(options);
      
      setResults(searchResponse.results as ISearchResult[]);
      setTotalResults(searchResponse.totalResults);
      setAggregationResults(searchResponse.aggregationResults || []);
      setMoreResultsAvailable(searchResponse.moreResultsAvailable);
      setIsInitialSearch(false);
      
      // Set page number after search is complete
      setCurrentPage(page);
    } catch (error) {
      console.error('Error during search:', error);
      setResults([]);
      setTotalResults(0);
      setAggregationResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery, 1, selectedFilters, sortOption);
  };

  const handleFilterChange = (newFilters: FilterSelection[]) => {
    setSelectedFilters(newFilters);
    performSearch(searchQuery, 1, newFilters, sortOption);
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    performSearch(searchQuery, 1, [], sortOption);
  };

  const handlePageChange = (newPage: number) => {
    // Don't update the currentPage state here, it will be updated after search completes
    performSearch(searchQuery, newPage, selectedFilters, sortOption);
  };

  const handleSortChange = (e: React.SyntheticEvent, data: { selectedOptions: string[] }) => {
    const newSortOption = data.selectedOptions[0];
    setSortOption(newSortOption);
    performSearch(searchQuery, 1, selectedFilters, newSortOption);
  };
  
  const openItem = (item: ISearchResult) => {
    if (item.webUrl || (item.resource && item.resource.webUrl)) {
      window.open(item.webUrl || item.resource?.webUrl, '_blank');
    }
  };

  const renderIcon = (item: ISearchResult) => {
    // Check if it's a folder first
    if (item.folder || (item.resource && item.resource.folder)) {
      return <Folder24Regular />;
    }
    
    // Get file name for determining icon
    const name = getItemName(item);
    
    // Get file icon props from Fluent UI
    const iconProps = getFileTypeIconProps({
      extension: name.split('.').pop() || '',
      size: 24,
      imageFileType: 'svg'
      //iconType: FileIconType.loopworkspace
    });
    
    // Return the icon
    return <Icon {...iconProps} />;
  };

  // Get the correct values regardless of structure
  const getItemName = (item: ISearchResult): string => {
    return item.name || item.resource?.name || '';
  };

  const getItemModifiedDate = (item: ISearchResult): string | undefined => {
    const dateString = item.lastModifiedDateTime || 
                      item.resource?.lastModifiedDateTime || 
                      item.resource?.fileSystemInfo?.lastModifiedDateTime;
    return dateString ? new Date(dateString).toISOString() : undefined;
  };

  const getItemCreatedDate = (item: ISearchResult): string | undefined => {
    const dateString = item.createdDateTime || 
                     item.resource?.fileSystemInfo?.createdDateTime;
    return dateString ? new Date(dateString).toISOString() : undefined;
  };

  const getItemCreatedBy = (item: ISearchResult): { displayName?: string, email?: string } | undefined => {
    return item.resource?.createdBy?.user;
  };

  const getItemModifiedBy = (item: ISearchResult): { displayName?: string, email?: string } | undefined => {
    return item.resource?.lastModifiedBy?.user;
  };

  const getItemSize = (item: ISearchResult): number | undefined => {
    return item.size || item.resource?.size;
  };

  const getItemSiteInfo = (item: ISearchResult): string | undefined => {
    if (item.resource?.parentReference?.sharepointIds?.siteUrl) {
      return item.resource?.parentReference.sharepointIds.siteUrl;
    } else if (item.resource?.parentReference?.siteId) {
      return item.resource?.parentReference.siteId;
    }
    return undefined;
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 1).toUpperCase();
    }
    
    return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
  };

  // Calculate pagination information
  const totalPages = Math.ceil(totalResults / DEFAULT_PAGE_SIZE) || 1;
  const startItem = (currentPage - 1) * DEFAULT_PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * DEFAULT_PAGE_SIZE, totalResults);

  // Count total active filters
  const activeFiltersCount = selectedFilters.reduce(
    (count, filter) => count + filter.selectedTokens.length, 
    0
  );

  // Determine if we should show the results header with pagination
  const showResultsHeader = !isInitialSearch || results.length > 0;

  return (
    <div className={styles.container}>
      <div className={styles.header} role="banner">
        
        <form className={styles.searchForm} onSubmit={handleSearchSubmit} role="search">
          <div className={styles.searchInputWrapper}>
            <Input 
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all containers..."
              contentBefore={<Search24Regular />}
              size="large"
              // Remove disabled state during searching to keep UI static
            />
          </div>
          
          <div className={styles.searchActions}>
            <Button 
              appearance="primary" 
              type="submit"
              disabled={!searchQuery.trim()}  // Only disable if query is empty
              size="large"
            >
              {/* Don't show spinner in button to keep UI static */}
              Search
            </Button>
            
            <Tooltip content={showFilters ? "Hide filters" : "Show filters"} relationship="label">
              <Button
                icon={showFilters ? <Filter24Filled /> : <Filter24Regular />}
                appearance="subtle"
                onClick={() => setShowFilters(!showFilters)}
                style={{ position: 'relative' }}
                size="large"
              >
                {activeFiltersCount > 0 && (
                  <Badge 
                    // className={styles.activeFiltersCount} 
                    appearance="filled"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </Tooltip>
          </div>
        </form>
      </div>

      <div className={styles.content}>
        {/* Filters pane */}
        <div 
          className={styles.filtersPane} 
          style={{ width: showFilters ? '300px' : '0px' }}
          role="complementary"
          aria-label="Search filters"
        >
          {showFilters && (
            <SearchFilters 
              aggregationResults={aggregationResults}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>

        {/* Search results */}
        <main className={styles.resultsContainer} role="main">
          {isInitialSearch && !results.length ? (
            <div className={styles.emptyState} role="status">
              <Search24Regular className={styles.emptyStateIcon} />
              <Text size={600} weight="semibold">Start searching</Text>
              <Text size={400}>Enter keywords above to search across all containers</Text>
            </div>
          ) : (
            <>
              {/* Always show the results header after first search */}
              {showResultsHeader && (
                <div className={styles.resultsHeader} role="status">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Text className={styles.searchStats}>
                      Showing {startItem}-{endItem} of {totalResults} results
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text>Sort by:</Text>
                      <Dropdown
                        value={sortOption}
                        onOptionSelect={handleSortChange}
                        style={{ minWidth: '120px' }}
                        // Keep dropdown enabled during search
                      >
                        <Option value="relevance">Relevance</Option>
                        <Option value="date">Modified Date</Option>
                      </Dropdown>
                    </div>
                  </div>
                  
                  {totalPages > 1 && (
                    <nav className={styles.paginationControls} aria-label="Search results pagination">
                      <Button
                        icon={<ChevronLeft24Regular />}
                        disabled={currentPage === 1 || isSearching}
                        onClick={() => handlePageChange(currentPage - 1)}
                        appearance="subtle"
                        aria-label="Previous page"
                      />
                      <Text className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                      </Text>
                      <Button
                        icon={<ChevronRight24Regular />}
                        disabled={currentPage === totalPages || !moreResultsAvailable || isSearching}
                        onClick={() => handlePageChange(currentPage + 1)}
                        appearance="subtle"
                        aria-label="Next page"
                      />
                    </nav>
                  )}
                </div>
              )}
              
              {/* Show loading state only for the results area */}
              {isSearching ? (
                <div className={styles.resultsLoadingContainer} role="status" aria-label="Loading results">
                  <Spinner size="large" label="Loading results..." />
                </div>
              ) : results.length > 0 ? (
                <div role="feed" aria-label="Search results">
                  {results.map((result) => (
                    <Card 
                      key={result.hitId} 
                      className={styles.resultCard}
                      role="article"
                    >
                      <div className={styles.resultItemContent}>
                        <div className={styles.resultTitle}>
                          <span className={styles.resultIcon} aria-hidden="true">
                            {renderIcon(result)}
                          </span>
                          <Text className={styles.titleText}>{getItemName(result)}</Text>
                        </div>
                        
                        {result.summary && (
                           <div className={styles.summaryText}>{result.summary}</div>
                        )}
                        
                        <div className={styles.metadataGrid} role="contentinfo">
                          {getItemCreatedDate(result) && (
                            <div className={styles.metadataSection}>
                              <Text className={styles.metadataLabel}>Created</Text>
                              <Text className={styles.metadataValue}>
                                {formatDate(getItemCreatedDate(result)!)}
                              </Text>
                              {getItemCreatedBy(result) && (
                                <div className={styles.personaContainer}>
                                  <Persona
                                    name={getItemCreatedBy(result)?.displayName || "Unknown"}
                                    secondaryText={getItemCreatedBy(result)?.email || ""}
                                    presence={{ status: "available" }}
                                    avatar={{
                                      color: "colorful",
                                      initials: getInitials(getItemCreatedBy(result)?.displayName),
                                    }}
                                    size="small"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {getItemModifiedDate(result) && (
                            <div className={styles.metadataSection}>
                              <Text className={styles.metadataLabel}>Modified</Text>
                              <Text className={styles.metadataValue}>
                                {formatDate(getItemModifiedDate(result)!)}
                              </Text>
                              {getItemModifiedBy(result) && (
                                <div className={styles.personaContainer}>
                                  <Persona
                                    name={getItemModifiedBy(result)?.displayName || "Unknown"}
                                    secondaryText={getItemModifiedBy(result)?.email || ""}
                                    presence={{ status: "available" }}
                                    avatar={{
                                      color: "colorful",
                                      initials: getInitials(getItemModifiedBy(result)?.displayName),
                                    }}
                                    size="small"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {getItemSize(result) !== undefined && (
                            <div className={styles.metadataSection}>
                              <Text className={styles.metadataLabel}>Size</Text>
                              <Text className={styles.metadataValue}>
                                {formatFileSize(getItemSize(result)!)}
                              </Text>
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.actionButtons}>
                          <Button 
                            icon={<Open24Regular />} 
                            appearance="primary"
                            onClick={() => openItem(result)}
                            aria-label={`Open ${getItemName(result)}`}
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState} role="status">
                  <Search24Regular className={styles.emptyStateIcon} />
                  <Text size={600} weight="semibold">No results found</Text>
                  <Text size={400}>Try different keywords or filters</Text>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};