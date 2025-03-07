// src/components/search/SearchBar.tsx
import React, { useState, type ChangeEvent } from 'react';
import { 
  makeStyles,
  tokens,
  SearchBox,
  Switch,
  Text,
  type SwitchOnChangeData,
  shorthands,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  searchContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalM),
    width: '100%',
  } as const,
  searchBox: {
    flexGrow: 1,
    fontSize: tokens.fontSizeBase200,
    height: '32px',
  } as const,
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
    flexShrink: 0,
  } as const,
  switchLabel: {
    fontSize: tokens.fontSizeBase200,
  } as const,
});

interface SearchBarProps {
  onSearch: (query: string, global: boolean) => void;
  isGlobalSearch: boolean;
  setIsGlobalSearch: (global: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch,
  isGlobalSearch,
  setIsGlobalSearch
}) => {
  const styles = useStyles();
  const [query, setQuery] = useState<string>('');

  const handleSearch = (newValue: string) => {
    setQuery(newValue);
    onSearch(newValue, isGlobalSearch);
  };

  const handleGlobalSearchToggle = (ev: ChangeEvent<HTMLInputElement>, data: SwitchOnChangeData) => {
    setIsGlobalSearch(data.checked);
    onSearch(query, data.checked);
  };

  return (
    <div className={styles.searchContainer}>
      <SearchBox
        className={styles.searchBox}
        value={query}
        placeholder="Search files and folders..."
        onChange={(e, data) => handleSearch(data.value)}
        size="small"
      />
      <div className={styles.switchContainer}>
        <Text className={styles.switchLabel}>Global</Text>
        <Switch 
          checked={isGlobalSearch}
          onChange={handleGlobalSearchToggle}
        />
      </div>
    </div>
  );
};