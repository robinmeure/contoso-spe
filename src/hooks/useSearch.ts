// src/hooks/useSearch.ts

import { useState } from 'react';

export interface UseSearchResult {
  searchQuery: string;
  isGlobalSearch: boolean;
  setSearchQuery: (query: string) => void;
  setIsGlobalSearch: (isGlobal: boolean) => void;
  handleSearch: (query: string, isGlobal: boolean) => void;
}

export function useSearch(): UseSearchResult {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGlobalSearch, setIsGlobalSearch] = useState<boolean>(false);

  const handleSearch = (query: string, isGlobal: boolean) => {
    setSearchQuery(query);
    setIsGlobalSearch(isGlobal);
  };

  return {
    searchQuery,
    isGlobalSearch,
    setSearchQuery,
    setIsGlobalSearch,
    handleSearch
  };
}