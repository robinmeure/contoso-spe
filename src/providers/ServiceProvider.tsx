// src/providers/ServiceProvider.tsx
import React, { createContext, useContext } from 'react';
import { IContainerService } from '../services/interfaces/IContainerService';
import { IFileService } from '../services/interfaces/IFileService';
import { ISearchService } from '../services/interfaces/ISearchService';

/**
 * Context type for all application services
 * Following the Dependency Inversion Principle by depending on abstractions
 */
interface ServiceContextType {
  containerService: IContainerService;
  fileService: IFileService;
  searchService: ISearchService;
}

/**
 * Service context
 */
const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

/**
 * Props for ServiceProvider component
 */
interface ServiceProviderProps {
  children: React.ReactNode;
  services: ServiceContextType;
}

/**
 * Service Provider component
 * Provides access to all application services through React Context
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({ 
  children, 
  services 
}) => {
  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

/**
 * Hook to access services
 * This allows components to get their dependencies without knowing their implementations
 */
export const useServices = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};