import { IColumnDefinition } from "./column";

// Container-related interfaces
export interface IContainer {
  id: string;
  displayName: string;
  description?: string;
  containerTypeId: string;
  containerTypeDisplayName?: string;
  externalGroupId?: string;
  permissions?: Array<{
    id: string;
    roles: string[];
    grantedToV2?: {
      user?: { displayName: string; email?: string; userPrincipalName?: string };
      group?: { displayName: string; email?: string };
    };
  }>;
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
  recycleBin?: {
    items?: IRecycleBinItem[];
  };
  status?: 'active' | 'inactive' | string;
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

export interface ContainerPermission {
  id: string;
  roles: string[];
  grantedToV2: {
    user?: {
      displayName: string;
      email: string;
      userPrincipalName: string;
    };
    group?: {
      displayName: string;
      email?: string;
    };
  };
}

export interface PermissionRequest {
  roles: string[];
  recipients: {
    email: string;
  }[];
}

