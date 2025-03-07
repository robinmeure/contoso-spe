import React from 'react';
import {
  makeStyles,
  shorthands,
  Checkbox,
  Text,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  tokens,
  Badge,
  Divider,
  Button,
} from '@fluentui/react-components';
import { Dismiss20Regular } from '@fluentui/react-icons';
import { ISearchAggregationResult, ISearchBucket } from '../../api';

export interface FilterSelection {
  field: string;
  selectedTokens: string[];
}

interface SearchFiltersProps {
  aggregationResults?: ISearchAggregationResult[];
  selectedFilters: FilterSelection[];
  onFilterChange: (newFilters: FilterSelection[]) => void;
  onClearFilters: () => void;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '240px',
    maxWidth: '320px',
    ...shorthands.borderRight('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding(tokens.spacingVerticalS, 0),
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('0', tokens.spacingHorizontalM, tokens.spacingVerticalS),
    marginBottom: tokens.spacingVerticalXS,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  accordionItem: {
    ...shorthands.borderRadius('0'),
    ...shorthands.borderLeft('0'),
    ...shorthands.borderRight('0'),
    ...shorthands.borderBottom('0'),
  },
  accordionHeader: {
    ...shorthands.padding(tokens.spacingVerticalXS, tokens.spacingHorizontalM),
  },
  filtersCount: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    marginLeft: tokens.spacingHorizontalXS,
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    ...shorthands.padding('0', tokens.spacingHorizontalM),
  },
  checkboxItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    fontSize: tokens.fontSizeBase200,
  },
  count: {
    marginLeft: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  clearButton: {
    ...shorthands.padding(tokens.spacingVerticalXXS, tokens.spacingHorizontalXS),
    height: 'auto',
    minWidth: 'auto',
  },
  noFilters: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    textAlign: 'center',
  },
  activeFiltersContainer: {
    ...shorthands.padding('0', tokens.spacingHorizontalM, tokens.spacingVerticalXS),
  },
  activeFiltersTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalXXS,
  },
  activeFilter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalXXS, tokens.spacingHorizontalXS),
    marginBottom: tokens.spacingVerticalXXS,
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    fontSize: tokens.fontSizeBase100,
  },
  filterName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
  },
});

// Helper function to format filter display names
const formatFilterField = (field: string): string => {
  switch (field) {
    case 'fileType':
      return 'File Type';
    case 'contentclass':
      return 'Content Type';
    case 'lastModifiedTime':
      return 'Modified Date';
    default:
      // Convert camelCase or snake_case to Title Case
      return field.replace(/([A-Z])|_([a-z])/g, (_, g1, g2) => {
        return (g1 ? ' ' + g1 : ' ' + g2?.toUpperCase()) || '';
      }).replace(/^./, str => str.toUpperCase());
  }
};

const formatFilterValue = (value: string): string => {
  if (value.startsWith('range(')) {
    return value; // Keep the range formatting as is
  }
  
  // For file types, make them title case and more readable
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// Component to display active filters with ability to remove them
const ActiveFilters: React.FC<{
  selectedFilters: FilterSelection[];
  aggregationResults?: ISearchAggregationResult[];
  onRemoveFilter: (field: string, token: string) => void;
  onClearFilters: () => void;
}> = ({ selectedFilters, aggregationResults, onRemoveFilter, onClearFilters }) => {
  const styles = useStyles();
  
  if (selectedFilters.length === 0) return null;
  
  // Get bucket key mapping to display readable filter values
  const bucketMap = new Map<string, string>();
  
  if (aggregationResults) {
    aggregationResults.forEach(agg => {
      agg.buckets.forEach(bucket => {
        bucketMap.set(bucket.aggregationFilterToken, bucket.key);
      });
    });
  }
  
  return (
    <div className={styles.activeFiltersContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text className={styles.activeFiltersTitle}>Active Filters</Text>
        <Button
          size="small"
          appearance="subtle"
          onClick={onClearFilters}
          className={styles.clearButton}
        >
          Clear All
        </Button>
      </div>
      
      <div>
        {selectedFilters.flatMap(filter => 
          filter.selectedTokens.map(token => {
            // Get display value for the token from the bucket map, or just use the token
            const displayValue = bucketMap.get(token) || token.replace(/^"ǂǂ|"$/g, '');
            
            return (
              <div key={`${filter.field}-${token}`} className={styles.activeFilter}>
                <div className={styles.filterName}>
                  <Text weight="semibold">{formatFilterField(filter.field)}:</Text>{' '}
                  <Text>{displayValue}</Text>
                </div>
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<Dismiss20Regular />}
                  onClick={() => onRemoveFilter(filter.field, token)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  aggregationResults,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const styles = useStyles();

  const handleFilterChange = (field: string, token: string, isChecked: boolean) => {
    let newFilters = [...selectedFilters];
    
    // Find existing filter for this field
    const existingFilterIndex = newFilters.findIndex(f => f.field === field);
    
    if (existingFilterIndex > -1) {
      const existingFilter = newFilters[existingFilterIndex];
      
      if (isChecked) {
        // Add token to existing filter
        newFilters[existingFilterIndex] = {
          ...existingFilter,
          selectedTokens: [...existingFilter.selectedTokens, token]
        };
      } else {
        // Remove token from existing filter
        newFilters[existingFilterIndex] = {
          ...existingFilter,
          selectedTokens: existingFilter.selectedTokens.filter(t => t !== token)
        };
        
        // If no tokens left, remove the filter entirely
        if (newFilters[existingFilterIndex].selectedTokens.length === 0) {
          newFilters = newFilters.filter(f => f.field !== field);
        }
      }
    } else if (isChecked) {
      // Create new filter for this field
      newFilters.push({
        field,
        selectedTokens: [token]
      });
    }
    
    onFilterChange(newFilters);
  };

  const handleRemoveFilter = (field: string, token: string) => {
    handleFilterChange(field, token, false);
  };

  const isFilterSelected = (field: string, token: string): boolean => {
    const filter = selectedFilters.find(f => f.field === field);
    return filter ? filter.selectedTokens.includes(token) : false;
  };

  // Count the total number of applied filters
  const totalFiltersCount = selectedFilters.reduce(
    (count, filter) => count + filter.selectedTokens.length, 
    0
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.title}>
          Filters
          {totalFiltersCount > 0 && (
            <Badge 
              appearance="filled" 
              className={styles.filtersCount}
            >
              {totalFiltersCount}
            </Badge>
          )}
        </Text>
        {totalFiltersCount > 0 && (
          <Button 
            size="small" 
            appearance="subtle"
            onClick={onClearFilters}
          >
            Clear all
          </Button>
        )}
      </div>

      <ActiveFilters 
        selectedFilters={selectedFilters}
        aggregationResults={aggregationResults}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={onClearFilters}
      />

      {selectedFilters.length > 0 && <Divider style={{ margin: '8px 0' }} />}
      
      {aggregationResults && aggregationResults.length > 0 ? (
        <Accordion collapsible>
          {aggregationResults.map(aggregation => (
            <AccordionItem 
              key={aggregation.field} 
              value={aggregation.field}
              className={styles.accordionItem}
            >
              <AccordionHeader className={styles.accordionHeader}>
                <Text weight="semibold">
                  {formatFilterField(aggregation.field)}
                </Text>
              </AccordionHeader>
              <AccordionPanel>
                <div className={styles.checkboxGroup}>
                  {aggregation.buckets.map(bucket => (
                    <div key={bucket.key} className={styles.checkboxItem}>
                      <Checkbox 
                        label={bucket.key}
                        checked={isFilterSelected(aggregation.field, bucket.aggregationFilterToken)}
                        onChange={(_, data) => handleFilterChange(
                          aggregation.field, 
                          bucket.aggregationFilterToken, 
                          !!data.checked
                        )}
                      />
                      <span className={styles.count}>({bucket.count})</span>
                    </div>
                  ))}
                </div>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className={styles.noFilters}>
          No filters available for the current search.
        </div>
      )}
    </div>
  );
};