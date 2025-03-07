import { IColumnDefinition } from "./column";

// Container-related interfaces
export interface IContainer {
  id: string;
  displayName: string;
  description?: string;
  containerTypeId: string;
  containerTypeDisplayName?: string;
  externalGroupId?: string;
  permissions?: Array<any>; // Can be improved with a proper Permission interface
  customProperties?: ICustomProperties;
  viewpoint?: {
    effectiveRole?: string;
  };
  drive?: {
    id: string;
    webUrl?: string;
    createdDateTime?: string;
    description?: string;
    driveType?: string;
    lastModifiedDateTime?: string;
    name?: string;
    createdBy?: {
      user?: {
        displayName?: string;
      };
    };
    lastModifiedBy?: {
      user?: {
        displayName?: string;
      };
    };
    quota?: {
      deleted?: number;
      remaining?: number;
      state?: string;
      total?: number;
      used?: number;
    };
  };
  recycleBin?: any; // Can be improved with proper recycleBin interface
  status?: string; // Can be improved with proper enum type
  createdDateTime: string;
  storageUsedInBytes?: number;
  assignedSensitivityLabel?: {
    labelId: string;
    displayName?: string;
  };
  owners?: Array<{
    id?: string;
    displayName?: string;
    userPrincipalName?: string;
  }>;
  columns?: Array<IColumnDefinition>; // Now using the proper IColumnDefinition interface
  itemMajorVersionLimit?: number;
  isItemVersioningEnabled?: boolean;
  ownershipType?: string;
  lockState?: string;
  settings?: {
    isOcrEnabled?: boolean;
    itemMajorVersionLimit?: number;
    isItemVersioningEnabled?: boolean;
  };
}

export interface IContainerClientCreateRequest {
  displayName: string;
  description?: string;
}

export interface ICustomProperty {
  value: string | boolean | number;
  isSearchable?: boolean;
}

export interface ICustomProperties {
  [key: string]: ICustomProperty;
}

export interface IRecycleBinItem {
  id: string;
  name: string;
  size: number;
  deletedDateTime: string;
  title?: string;
  deletedBy?: {
    user?: {
      displayName: string;
      id: string;
      userPrincipalName: string;
    };
  };
}

