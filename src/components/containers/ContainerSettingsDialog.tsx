// src/components/containers/ContainerSettingsDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Spinner,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  Input,
  Textarea,
  Text,
  TabList,
  Tab,
  Label,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Dropdown,
  Option as DropdownOption,
  shorthands,
  Persona,
  Badge,
  Tooltip,
  Divider,
  Switch,
  Field,
  Card,
  CardHeader,
  CardFooter
} from '@fluentui/react-components';
import { 
  PersonAdd20Regular, 
  Delete20Regular, 
  ArrowUpload20Regular, 
  DeleteDismiss20Regular,
  AddSquare20Regular,
  Edit20Regular,
  Checkmark20Regular,
  Dismiss20Regular,
  Dismiss24Regular,
  Info20Regular,
  Calendar20Regular,
  DocumentRegular,
  StorageRegular
} from '@fluentui/react-icons';
import { IColumnDefinition, IColumnCreateRequest, IContainer, ICustomProperties, ICustomProperty, IRecycleBinItem } from '../../api';
import { ContainerPermission, PermissionRequest } from '../../hooks/useContainers';
import { useContainerManagement } from '../../hooks/useContainerManagement';
import { formatFileSize, formatDate } from '../../utils/formatters';

const useStyles = makeStyles({
  dialogSurface: {
    width: '90vw',
    height: '90vh',
    maxWidth: '95vw',
    maxHeight: '95vh',
  },
  dialogBody: {
    height: '100%', 
    padding: 0,
    overflow: 'hidden',
    display: 'inline-block',
  },
  tabContent: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    height: '100%',
    overflow: 'auto'
  },
  containerCard: { 
    width: '80vw',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    marginBottom: tokens.spacingVerticalM,
  },
  formLabel: {
    fontWeight: tokens.fontWeightSemibold,
  },
  permissionsTable: {
    width: '100%',
    marginTop: tokens.spacingVerticalM,
  },
  addPermissionSection: {
    marginTop: tokens.spacingVerticalL,
    ...shorthands.padding(tokens.spacingVerticalM),
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  permissionRow: {
    alignItems: 'center',
  },
  roleChip: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'capitalize',
  },
  ownerChip: {
    backgroundColor: tokens.colorPaletteDarkOrangeBorderActive,
    color: tokens.colorNeutralForeground1,
  },
  writerChip: {
    backgroundColor: tokens.colorPaletteBlueBorderActive,
    color: tokens.colorNeutralForeground1,
  },
  readerChip: {
    backgroundColor: tokens.colorPaletteGreenBorderActive,
    color: tokens.colorNeutralForeground1,
  },
  propertyCard: {
    marginBottom: tokens.spacingVerticalS,
  },
  propertyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyName: {
    fontWeight: tokens.fontWeightSemibold,
  },
  propertyValue: {
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sectionActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM,
  },
  recycleBinActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  searchable: {
    marginLeft: tokens.spacingHorizontalXS,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding(tokens.spacingVerticalXL),
    color: tokens.colorNeutralForeground3,
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  formColumn: {
    flex: '1 1 250px',
    minWidth: 0,
  },
  cardContent: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
  },
  tabHeader: {
    ...shorthands.margin(0, 0, tokens.spacingVerticalM, 0),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addForm: {
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.margin(0, 0, tokens.spacingVerticalM, 0),
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    marginLeft: 'auto',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  },
  infoCard: {
    borderLeft: `4px solid ${tokens.colorBrandBackground}`,
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  infoLabel: {
    fontWeight: tokens.fontWeightSemibold,
    marginRight: '8px',
    width: '140px',
    color: tokens.colorNeutralForeground2,
  },
  infoValue: {
    fontWeight: tokens.fontWeightRegular,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  statsContainer: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  statCard: {
    flex: '1 1 200px',
    minWidth: '200px',
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
  },
  statValue: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
    marginBottom: tokens.spacingVerticalS,
  },
  statLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  }
});

interface ContainerSettingsDialogProps {
  isOpen: boolean;
  container: IContainer | null;
  onOpenChange: (open: boolean) => void;

  // Permissions methods
  getContainerPermissions: (containerId: string) => Promise<ContainerPermission[]>;
  updateContainerPermissions: (containerId: string, request: PermissionRequest) => Promise<void>;
  deleteContainerPermission: (containerId: string, permissionId: string) => Promise<void>;
  
  // Custom properties methods
  getContainerCustomProperties: (containerId: string) => Promise<ICustomProperties>;
  addContainerCustomProperty: (containerId: string, propertyKey: string, property: ICustomProperty) => Promise<void>;
  updateContainerCustomProperty: (containerId: string, propertyKey: string, property: ICustomProperty) => Promise<void>;
  deleteContainerCustomProperty: (containerId: string, propertyKey: string) => Promise<void>;
  
  // Column methods
  getContainerColumns: (containerId: string) => Promise<IColumnDefinition[]>;
  createContainerColumn: (containerId: string, column: IColumnCreateRequest) => Promise<IColumnDefinition>;
  updateContainerColumn: (containerId: string, columnId: string, column: Partial<IColumnCreateRequest>) => Promise<IColumnDefinition>;
  deleteContainerColumn: (containerId: string, columnId: string) => Promise<void>;
  
  // Container details
  updateContainerDetails?: (containerId: string, details: {displayName?: string, description?: string}) => Promise<IContainer>;

  // Recycle bin
  getRecycleBinItems?: (containerId: string) => Promise<IRecycleBinItem[]>;
  restoreRecycleBinItem?: (containerId: string, itemId: string) => Promise<void>;
  permanentlyDeleteRecycleBinItem?: (containerId: string, itemId: string) => Promise<void>;
}

export const ContainerSettingsDialog: React.FC<ContainerSettingsDialogProps> = ({
  isOpen,
  container,
  onOpenChange,
  getContainerPermissions,
  updateContainerPermissions,
  deleteContainerPermission,
  getContainerCustomProperties,
  addContainerCustomProperty,
  updateContainerCustomProperty,
  deleteContainerCustomProperty,
  getContainerColumns,
  createContainerColumn,
  updateContainerColumn,
  deleteContainerColumn,
  updateContainerDetails,
  getRecycleBinItems,
  restoreRecycleBinItem,
  permanentlyDeleteRecycleBinItem
}) => {
  const styles = useStyles();
  
  // Use the enhanced container management hook
  const { 
    fetchContainerDetails, 
    isLoading: isContainerLoading, 
    error: containerError 
  } = useContainerManagement();
  
  const [containerDetails, setContainerDetails] = useState<IContainer | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("general");
  const [containerPermissions, setContainerPermissions] = useState<ContainerPermission[]>([]);
  const [customProperties, setCustomProperties] = useState<ICustomProperties | null>(null);
  const [columns, setColumns] = useState<IColumnDefinition[]>([]);
  const [recycleBinItems, setRecycleBinItems] = useState<IRecycleBinItem[]>([]);
  const [editMode, setEditMode] = useState({
    general: false,
    customProperty: false,
    column: false
  });
  const [editingDetails, setEditingDetails] = useState<{
    displayName: string;
    description: string;
  }>({ displayName: '', description: '' });
  const [newProperty, setNewProperty] = useState<{
    key: string;
    value: string;
    isSearchable: boolean;
  }>({
    key: '',
    value: '',
    isSearchable: false
  });
  const [newColumn, setNewColumn] = useState<IColumnCreateRequest>({
    name: '',
    description: '',
    enforceUniqueValues: false,
    hidden: false,
    indexed: false,
    text: {
      allowMultipleLines: false,
      appendChangesToExistingText: false,
      linesForEditing: 0,
      maxLength: 255
    }
  });
  const [loading, setLoading] = useState<{
    container: boolean;
    permissions: boolean;
    properties: boolean;
    columns: boolean;
    recycleBin: boolean;
  }>({
    container: false,
    permissions: false,
    properties: false,
    columns: false,
    recycleBin: false,
  });
  const [newPermission, setNewPermission] = useState({
    email: '',
    role: 'reader'
  });

  // Fetch detailed container information when dialog opens or container changes
  useEffect(() => {
    const loadContainerDetails = async () => {
      if (!container || !isOpen) return;
      
      // Prevent refetching if we already have details for this container
      if (containerDetails && containerDetails.id === container.id) return;
      
      try {
        setLoading(prev => ({ ...prev, container: true }));
        const details = await fetchContainerDetails(container.id);
        setContainerDetails(details);
      } catch (error) {
        console.error('Error loading container details:', error);
      } finally {
        setLoading(prev => ({ ...prev, container: false }));
      }
    };
    
    loadContainerDetails();
  }, [container?.id, isOpen, fetchContainerDetails]);

  // Load container data when dialog opens or tab changes
  useEffect(() => {
    if (isOpen && container) {
      // Only load these when switching to their respective tabs to avoid unnecessary calls
      if (selectedTab === 'general' || selectedTab === 'permissions') {
        loadPermissions(container.id);
      }
      if (selectedTab === 'properties') {
        loadCustomProperties(container.id);
      }
      if (selectedTab === 'columns') {
        loadColumns(container.id);
      }
      if (selectedTab === 'recycleBin') {
        loadRecycleBinItems(container.id);
      }
    }
  }, [isOpen, container?.id, selectedTab]);

  const loadPermissions = async (containerId: string) => {
    setLoading(prev => ({ ...prev, permissions: true }));
    try {
      const permissions = await getContainerPermissions(containerId);
      setContainerPermissions(permissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(prev => ({ ...prev, permissions: false }));
    }
  };

  const loadCustomProperties = async (containerId: string) => {
    if (!getContainerCustomProperties) return;
    
    setLoading(prev => ({ ...prev, properties: true }));
    try {
      const properties = await getContainerCustomProperties(containerId);
      setCustomProperties(properties);
    } catch (error) {
      console.error('Error loading custom properties:', error);
    } finally {
      setLoading(prev => ({ ...prev, properties: false }));
    }
  };

  const loadColumns = async (containerId: string) => {
    if (!getContainerColumns) return;
    
    setLoading(prev => ({ ...prev, columns: true }));
    try {
      const cols = await getContainerColumns(containerId);
      setColumns(cols);
    } catch (error) {
      console.error('Error loading columns:', error);
    } finally {
      setLoading(prev => ({ ...prev, columns: false }));
    }
  };

  const loadRecycleBinItems = async (containerId: string) => {
    if (!getRecycleBinItems) return;
    
    setLoading(prev => ({ ...prev, recycleBin: true }));
    try {
      const items = await getRecycleBinItems(containerId);
      setRecycleBinItems(items);
    } catch (error) {
      console.error('Error loading recycle bin items:', error);
    } finally {
      setLoading(prev => ({ ...prev, recycleBin: false }));
    }
  };

  // Update container info after metadata changes
  const refreshContainerInfo = async () => {
    if (!container) return;
    
    try {
      setLoading(prev => ({ ...prev, container: true }));
      const updatedContainer = await fetchContainerDetails(container.id);
      setContainerDetails(updatedContainer);
    } catch (error) {
      console.error('Error refreshing container info:', error);
    } finally {
      setLoading(prev => ({ ...prev, container: false }));
    }
  };

  const handleAddPermission = async () => {
    if (!container || !newPermission.email.trim()) return;
    
    try {
      // Create permission request object
      const permissionRequest: PermissionRequest = {
        roles: [newPermission.role],
        recipients: [
          {
            email: newPermission.email
          }
        ]
      };
      
      await updateContainerPermissions(container.id, permissionRequest);
      
      // Reload permissions to show the updated list
      await loadPermissions(container.id);
      
      // Reset form
      setNewPermission({
        email: '',
        role: 'reader'
      });
    } catch (error) {
      console.error('Error adding permission:', error);
    }
  };

  const handleRestoreItem = async (itemId: string) => {
    if (!container || !restoreRecycleBinItem) return;
    
    try {
      await restoreRecycleBinItem(container.id, itemId);
      // Reload recycle bin items
      await loadRecycleBinItems(container.id);
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const handlePermanentDelete = async (itemId: string) => {
    if (!container || !permanentlyDeleteRecycleBinItem) return;

    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      try {
        await permanentlyDeleteRecycleBinItem(container.id, itemId);
        // Reload recycle bin items
        await loadRecycleBinItems(container.id);
      } catch (error) {
        console.error('Error permanently deleting item:', error);
      }
    }
  };

  // General Settings
  const handleUpdateDetails = async () => {
    if (!container || !updateContainerDetails) return;
    
    try {
      const updated = await updateContainerDetails(container.id, {
        displayName: editingDetails.displayName,
        description: editingDetails.description
      });
      
      // Refresh container data after update
      await refreshContainerInfo();
      setEditMode({ ...editMode, general: false });
    } catch (error) {
      console.error('Error updating container details:', error);
    }
  };

  // Permissions
  const handleDeletePermission = async (permissionId: string) => {
    if (!container || !deleteContainerPermission) return;
    
    if (window.confirm('Are you sure you want to remove this permission?')) {
      try {
        await deleteContainerPermission(container.id, permissionId);
        await loadPermissions(container.id);
      } catch (error) {
        console.error('Error deleting permission:', error);
      }
    }
  };

  // Custom Properties
  const handleAddProperty = async () => {
    if (!container || !addContainerCustomProperty || !newProperty.key.trim()) return;
    
    try {
      await addContainerCustomProperty(container.id, newProperty.key, {
        value: newProperty.value,
        isSearchable: newProperty.isSearchable
      });
      
      // Reload properties
      await loadCustomProperties(container.id);
      
      // Reset form
      setNewProperty({
        key: '',
        value: '',
        isSearchable: false
      });
    } catch (error) {
      console.error('Error adding custom property:', error);
    }
  };

  const handleUpdateProperty = async (key: string, property: ICustomProperty) => {
    if (!container || !updateContainerCustomProperty) return;
    
    try {
      await updateContainerCustomProperty(container.id, key, property);
      await loadCustomProperties(container.id);
    } catch (error) {
      console.error('Error updating custom property:', error);
    }
  };

  const handleDeleteProperty = async (key: string) => {
    if (!container || !deleteContainerCustomProperty) return;
    
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteContainerCustomProperty(container.id, key);
        await loadCustomProperties(container.id);
      } catch (error) {
        console.error('Error deleting custom property:', error);
      }
    }
  };

  // Columns
  const handleAddColumn = async () => {
    if (!container || !createContainerColumn) return;
    
    try {
      const columnRequest: IColumnCreateRequest = {
        name: newColumn.name,
        description: newColumn.description,
        enforceUniqueValues: false,
        hidden: false,
        indexed: false,
        text: {
          allowMultipleLines: newColumn.text?.allowMultipleLines || false,
          appendChangesToExistingText: false,
          linesForEditing: newColumn.text?.allowMultipleLines ? 6 : 0,
          maxLength: 255
        }
      };
      
      await createContainerColumn(container.id, columnRequest);
      await loadColumns(container.id);
      
      // Reset form
      setNewColumn({
        name: '',
        description: '',
        enforceUniqueValues: false,
        hidden: false,
        indexed: false,
        text: {
          allowMultipleLines: false,
          appendChangesToExistingText: false,
          linesForEditing: 0,
          maxLength: 255
        }
      });
      setEditMode(prev => ({ ...prev, column: false }));
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  const handleUpdateColumn = async (columnId: string, updates: Partial<IColumnCreateRequest>) => {
    if (!container || !updateContainerColumn) return;
    
    try {
      await updateContainerColumn(container.id, columnId, updates);
      await loadColumns(container.id);
    } catch (error) {
      console.error('Error updating column:', error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!container || !deleteContainerColumn) return;
    
    if (window.confirm('Are you sure you want to delete this column?')) {
      try {
        await deleteContainerColumn(container.id, columnId);
        await loadColumns(container.id);
      } catch (error) {
        console.error('Error deleting column:', error);
      }
    }
  };

  // Helper to get display name and initials
  const getNameInfo = (permission: ContainerPermission) => {
    if (permission.grantedToV2?.user) {
      return {
        displayName: permission.grantedToV2.user.displayName,
        email: permission.grantedToV2.user.email || permission.grantedToV2.user.userPrincipalName,
        isUser: true,
      };
    } else if (permission.grantedToV2?.group) {
      return {
        displayName: permission.grantedToV2.group.displayName,
        email: permission.grantedToV2.group.email || '',
        isUser: false,
      };
    } else {
      return {
        displayName: 'Unknown',
        email: '',
        isUser: false,
      };
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 1).toUpperCase();
    }
    
    return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
  };

  // Helper to get role badge class
  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return styles.ownerChip;
      case 'writer':
        return styles.writerChip;
      case 'reader':
        return styles.readerChip;
      default:
        return '';
    }
  };

  // Format a property value for display
  const formatPropertyValue = (property: ICustomProperty) => {
    if (typeof property.value === 'boolean') {
      return property.value ? 'True' : 'False';
    }
    return String(property.value);
  };

  // Use containerDetails for rendering if available, otherwise fall back to container
  const displayContainer = containerDetails || container;
  
  if (!displayContainer) return null;

  // Calculate storage usage percentage if quota info is available
  const storageUsagePercentage = displayContainer.drive?.quota?.used && displayContainer.drive.quota.total 
    ? Math.round((displayContainer.drive.quota.used / displayContainer.drive.quota.total) * 100)
    : null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(_, data) => onOpenChange(data.open)}
      modalType="modal"
    >
      <DialogSurface className={styles.dialogSurface}>
        <DialogTitle>
          <div className={styles.dialogTitle}>
            <span>Container Settings: {displayContainer.displayName}</span>
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className={styles.closeButton}
            />
          </div>
        </DialogTitle>
        <TabList 
          selectedValue={selectedTab}
          onTabSelect={(_, data) => setSelectedTab(data.value as string)}
          appearance="subtle"
        >
          <Tab value="general">General</Tab>
          <Tab value="permissions">Permissions</Tab>
          <Tab value="properties">Properties</Tab>
          <Tab value="columns">Columns</Tab>
          <Tab value="recycleBin">Recycle Bin</Tab>
        </TabList>
        <DialogBody className={styles.dialogBody}>
          {/* General tab content */}
          {selectedTab === "general" && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <Text weight="semibold" size={500}>Container Information</Text>
              </div>
              {loading.container ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" label="Loading container details..." />
                </div>
              ) : (
                <>
                <div className={styles.containerCard}>
                  <Card>
                    
                      <div className={styles.formField}>
                        <Field 
                          label="Name" 
                          required
                          validationState={editMode.general && !editingDetails.displayName.trim() ? "error" : undefined}
                          validationMessage={editMode.general && !editingDetails.displayName.trim() ? "Name is required" : undefined}
                        >
                          {editMode.general ? (
                            <Input 
                              value={editingDetails.displayName}
                              onChange={(_, data) => setEditingDetails(prev => ({ ...prev, displayName: data.value }))}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Input 
                                value={displayContainer.displayName}
                                readOnly
                                appearance="outline"
                              />
                              <Button
                                icon={<Edit20Regular />}
                                appearance="subtle"
                                aria-label="Edit container name"
                                onClick={() => {
                                  setEditMode(prev => ({ ...prev, general: true }));
                                  setEditingDetails({
                                    displayName: displayContainer.displayName,
                                    description: displayContainer.description || ''
                                  });
                                }}
                              />
                            </div>
                          )}
                        </Field>
                      </div>

                      <div className={styles.formField}>
                        <Field 
                          label="Description"
                        >
                          {editMode.general ? (
                            <Textarea 
                              resize="vertical"
                              value={editingDetails.description}
                              onChange={(_, data) => setEditingDetails(prev => ({ ...prev, description: data.value }))}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                              <Textarea 
                                appearance="outline"
                                resize="vertical"
                                value={displayContainer.description || ''}
                                readOnly
                              />
                            </div>
                          )}
                        </Field>
                      </div>

                      {editMode.general && (
                        <div className={styles.sectionActions}>
                          <Button 
                            appearance="secondary"
                            icon={<Dismiss20Regular />}
                            onClick={() => setEditMode(prev => ({ ...prev, general: false }))}
                          >
                            Cancel
                          </Button>
                          <Button 
                            appearance="primary"
                            icon={<Checkmark20Regular />}
                            onClick={handleUpdateDetails}
                            disabled={!editingDetails.displayName.trim()}
                          >
                            Save Changes
                          </Button>
                        </div>
                      )}
                      
                      <Divider style={{ margin: '16px 0' }} />

                      <div className={styles.infoGrid}>
                        <Card className={styles.infoCard}>
                          <CardHeader header={<Text weight="semibold">Identifiers</Text>} />
                          <div className={styles.cardContent}>
                            <div className={styles.infoItem}>
                              <span className={styles.infoLabel}>Container ID:</span>
                              <span className={styles.infoValue}>{displayContainer.id}</span>
                            </div>
                          </div>
                        </Card>

                        <Card className={styles.infoCard}>
                          <CardHeader header={<Text weight="semibold">Timestamps</Text>} />
                          <div className={styles.cardContent}>
                            {displayContainer.createdDateTime && (
                              <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Created:</span>
                                <span className={styles.infoValue}>
                                  {formatDate(displayContainer.createdDateTime)}
                                </span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>

                      {displayContainer.drive?.quota && (
                        <>
                          <div className={styles.statsContainer}>
                            <div className={styles.statCard}>
                              <div className={styles.statValue}>
                                {formatFileSize(displayContainer.drive.quota.used || 0)}
                              </div>
                              <div className={styles.statLabel}>
                                <StorageRegular style={{ marginRight: '4px' }} />
                                Storage Used
                              </div>
                            </div>
                            <div className={styles.statCard}>
                              <div className={styles.statValue}>
                                {formatFileSize(displayContainer.drive.quota.total || 0)}
                              </div>
                              <div className={styles.statLabel}>
                                <StorageRegular style={{ marginRight: '4px' }} />
                                Total Storage
                              </div>
                            </div>
                            <div className={styles.statCard}>
                              <div className={styles.statValue}>
                                {displayContainer.drive.quota.state || 'Normal'}
                              </div>
                              <div className={styles.statLabel}>
                                <Info20Regular style={{ marginRight: '4px' }} />
                                Quota Status
                              </div>
                            </div>
                          </div>

                          {storageUsagePercentage !== null && (
                            <div style={{ marginTop: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <Text size={200} weight="semibold">Storage Usage</Text>
                                <Text size={200}>{storageUsagePercentage}%</Text>
                              </div>
                              <div 
                                style={{ 
                                  height: '8px', 
                                  width: '100%', 
                                  backgroundColor: tokens.colorNeutralBackground4,
                                  borderRadius: tokens.borderRadiusMedium,
                                  overflow: 'hidden'
                                }}
                              >
                                <div 
                                  style={{
                                    height: '100%',
                                    width: `${storageUsagePercentage}%`,
                                    backgroundColor: storageUsagePercentage > 90 
                                      ? tokens.colorPaletteRedForeground1 
                                      : storageUsagePercentage > 70 
                                        ? tokens.colorPaletteYellowForeground1 
                                        : tokens.colorPaletteGreenForeground1
                                  }}
                                />
                              </div>
                              
                              <div style={{ marginTop: '8px' }}>
                                <Text size={200}>
                                  {formatFileSize(displayContainer.drive.quota.remaining || 0)} remaining of {formatFileSize(displayContainer.drive.quota.total || 0)}
                                </Text>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {displayContainer.drive?.driveType && (
                        <div className={styles.infoItem} style={{ marginTop: '16px' }}>
                          <span className={styles.infoLabel}>Drive Type:</span>
                          <Badge appearance="filled" color="informative">
                            {displayContainer.drive.driveType}
                          </Badge>
                        </div>
                      )}
                   
                  </Card> 
                  </div>               
                </>
              )}
            </div>
          )}
          
          {/* Permissions tab content */}
          {selectedTab === "permissions" && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <Text weight="semibold" size={500}>User & Group Permissions</Text>
              </div>
              {loading.permissions ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" label="Loading permissions..." />
                </div>
              ) : (
                <Card>
                  <Table className={styles.permissionsTable} size="medium">
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>User/Group</TableHeaderCell>
                        <TableHeaderCell>Role</TableHeaderCell>
                        <TableHeaderCell style={{ width: '40px' }}>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {containerPermissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                            <Text size={200}>No permissions found</Text>
                          </TableCell>
                        </TableRow>
                      ) : (
                        containerPermissions.map((permission) => {
                          const { displayName, email, isUser } = getNameInfo(permission);
                          const initials = getInitials(displayName);
                          
                          return (
                            <TableRow key={permission.id} className={styles.permissionRow}>
                              <TableCell>
                                <Persona
                                  name={displayName}
                                  secondaryText={email}
                                  avatar={{ 
                                    color: 'colorful',
                                    initials: initials
                                  }}
                                  presence={{
                                    status: isUser ? 'available' : 'offline',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {permission.roles.map((role, index) => (
                                    <span 
                                      key={index} 
                                      className={`${styles.roleChip} ${getRoleBadgeClass(role)}`}
                                    >
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Tooltip content="Remove permission" relationship="label">
                                  <Button
                                    icon={<Delete20Regular />}
                                    appearance="subtle"
                                    aria-label="Remove permission"
                                    onClick={() => handleDeletePermission(permission.id)}
                                  />
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  
                  <CardFooter>
                    <div style={{ width: '100%' }}>
                      <Divider style={{ margin: '8px 0 16px' }} />
                      <Text weight="semibold" size={300} block>Add New Permission</Text>
                      <div className={styles.formRow} style={{ marginTop: '12px' }}>
                        <div className={styles.formColumn}>
                          <Field 
                            label="User or Group Email" 
                            required
                            validationState={!newPermission.email.trim() ? "none" : undefined}
                          >
                            <Input 
                              placeholder="Enter email address"
                              value={newPermission.email}
                              onChange={(_, data) => setNewPermission({...newPermission, email: data.value})}
                            />
                          </Field>
                        </div>
                        <div className={styles.formColumn}>
                          <Field label="Access Level" required>
                            <Dropdown
                              value={newPermission.role}
                              onOptionSelect={(_, data) => setNewPermission({...newPermission, role: data.optionValue as string})}
                            >
                              <DropdownOption value="reader">Reader</DropdownOption>
                              <DropdownOption value="writer">Writer</DropdownOption>
                              <DropdownOption value="owner">Owner</DropdownOption>
                            </Dropdown>
                          </Field>
                        </div>
                        <div style={{ alignSelf: 'flex-end' }}>
                          <Button 
                            icon={<PersonAdd20Regular />}
                            appearance="primary"
                            onClick={handleAddPermission}
                            disabled={loading.permissions || !newPermission.email.trim()}
                          >
                            Add Permission
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}

          {/* Properties tab content */}
          {selectedTab === "properties" && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <Text weight="semibold" size={500}>Custom Properties</Text>
                <Button 
                  icon={<AddSquare20Regular />}
                  appearance="primary"
                  onClick={() => setEditMode(prev => ({ ...prev, customProperty: true }))}
                >
                  Add Property
                </Button>
              </div>
              
              {loading.properties ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" label="Loading custom properties..." />
                </div>
              ) : (
                <>
                  {editMode.customProperty && (
                    <Card className={styles.addForm}>
                      <CardHeader 
                        header={<Text weight="semibold">{newProperty.key ? `Edit Property: ${newProperty.key}` : 'Add New Property'}</Text>} 
                      />
                      <div className={styles.cardContent}>
                        <div className={styles.formRow}>
                          <div className={styles.formColumn}>
                            <Field 
                              label="Property Name" 
                              required
                              validationState={!newProperty.key.trim() ? "warning" : undefined}
                              validationMessage={!newProperty.key.trim() ? "Property name is required" : undefined}
                            >
                              <Input 
                                value={newProperty.key}
                                placeholder="Enter property name"
                                onChange={(_, data) => setNewProperty(prev => ({ ...prev, key: data.value }))}
                              />
                            </Field>
                          </div>
                          <div className={styles.formColumn}>
                            <Field 
                              label="Property Value" 
                              required
                              validationState={!newProperty.value.trim() ? "warning" : undefined}
                              validationMessage={!newProperty.value.trim() ? "Property value is required" : undefined}
                            >
                              <Input 
                                value={newProperty.value}
                                placeholder="Enter property value"
                                onChange={(_, data) => setNewProperty(prev => ({ ...prev, value: data.value }))}
                              />
                            </Field>
                          </div>
                        </div>
                        
                        <Field>
                          <Switch 
                            label="Make this property searchable"
                            checked={newProperty.isSearchable}
                            onChange={(_, data) => setNewProperty(prev => ({ ...prev, isSearchable: data.checked }))}
                          />
                        </Field>
                        
                        <div className={styles.sectionActions}>
                          <Button 
                            appearance="secondary"
                            icon={<Dismiss20Regular />}
                            onClick={() => {
                              setEditMode(prev => ({ ...prev, customProperty: false }));
                              setNewProperty({ key: '', value: '', isSearchable: false });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            appearance="primary"
                            icon={<Checkmark20Regular />}
                            onClick={handleAddProperty}
                            disabled={!newProperty.key.trim() || !newProperty.value.trim()}
                          >
                            {newProperty.key ? 'Update Property' : 'Add Property'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  <div style={{ marginTop: '16px' }}>
                    {customProperties && Object.entries(customProperties).length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                        {Object.entries(customProperties).map(([key, property]) => (
                          <Card key={key} className={styles.propertyCard}>
                            <CardHeader 
                              header={
                                <div className={styles.propertyName}>
                                  {key}
                                  {property.isSearchable && (
                                    <Badge className={styles.searchable} appearance="filled" color="brand" shape="rounded">
                                      Searchable
                                    </Badge>
                                  )}
                                </div>
                              }
                              action={
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <Tooltip content="Edit property" relationship="label">
                                    <Button
                                      icon={<Edit20Regular />}
                                      appearance="subtle"
                                      aria-label="Edit property"
                                      onClick={() => {
                                        setNewProperty({
                                          key,
                                          value: String(property.value),
                                          isSearchable: property.isSearchable || false
                                        });
                                        setEditMode(prev => ({ ...prev, customProperty: true }));
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip content="Delete property" relationship="label">
                                    <Button
                                      icon={<Delete20Regular />}
                                      appearance="subtle"
                                      aria-label="Delete property"
                                      onClick={() => handleDeleteProperty(key)}
                                    />
                                  </Tooltip>
                                </div>
                              }
                            />
                            <div className={styles.cardContent}>
                              <Tooltip content={formatPropertyValue(property)} relationship="label">
                                <Text block>{formatPropertyValue(property)}</Text>
                              </Tooltip>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <div className={styles.emptyState}>
                          <Text size={400}>No custom properties available</Text>
                          <Text size={200} block style={{ marginTop: '8px' }}>
                            Click "Add Property" to create a new custom property for this container.
                          </Text>
                        </div>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Columns tab content */}
          {selectedTab === "columns" && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <Text weight="semibold" size={500}>Custom Columns</Text>
                <Button 
                  icon={<AddSquare20Regular />}
                  appearance="primary"
                  onClick={() => setEditMode(prev => ({ ...prev, column: true }))}
                >
                  Add Column
                </Button>
              </div>
              
              {loading.columns ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" label="Loading columns..." />
                </div>
              ) : (
                <>
                  {editMode.column && (
                    <Card className={styles.addForm}>
                      <CardHeader 
                        header={<Text weight="semibold">{newColumn.name ? `Edit Column: ${newColumn.displayName || newColumn.name}` : 'Add New Column'}</Text>}
                      />
                      <div className={styles.cardContent}>
                        <div className={styles.formRow}>
                          <div className={styles.formColumn}>
                            <Field 
                              label="Display Name" 
                              required
                              validationState={!newColumn.displayName?.trim() ? "warning" : undefined}
                              validationMessage={!newColumn.displayName?.trim() ? "Display name is required" : undefined}
                            >
                              <Input 
                                value={newColumn.displayName || ''}
                                placeholder="Enter display name"
                                onChange={(_, data) => setNewColumn(prev => ({ ...prev, displayName: data.value }))}
                              />
                            </Field>
                          </div>
                          <div className={styles.formColumn}>
                            <Field 
                              label="Internal Name" 
                              required
                              validationState={!newColumn.name?.trim() ? "warning" : undefined}
                              validationMessage={!newColumn.name?.trim() ? "Internal name is required" : undefined}
                            >
                              <Input 
                                value={newColumn.name}
                                placeholder="Enter internal name"
                                onChange={(_, data) => setNewColumn(prev => ({ ...prev, name: data.value }))}
                              />
                            </Field>
                          </div>
                        </div>
                        
                        <div className={styles.formRow}>
                          <div className={styles.formColumn}>
                            <Field 
                              label="Description"
                              hint="Optional description for this column"
                            >
                              <Input 
                                value={newColumn.description || ''}
                                placeholder="Enter optional description"
                                onChange={(_, data) => setNewColumn(prev => ({ ...prev, description: data.value }))}
                              />
                            </Field>
                          </div>
                          <div className={styles.formColumn}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <Field>
                                <Switch 
                                  label="Required Field"
                                  checked={newColumn.required || false}
                                  onChange={(_, data) => setNewColumn(prev => ({ ...prev, required: data.checked }))}
                                />
                              </Field>
                              <Field>
                                <Switch 
                                  label="Allow Multiple Lines"
                                  checked={newColumn.text?.allowMultipleLines || false}
                                  onChange={(_, data) => setNewColumn(prev => ({ 
                                    ...prev, 
                                    text: { 
                                      ...prev.text!, 
                                      allowMultipleLines: data.checked,
                                      linesForEditing: data.checked ? 6 : 0
                                    }
                                  }))}
                                />
                              </Field>
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.sectionActions}>
                          <Button 
                            appearance="secondary"
                            icon={<Dismiss20Regular />}
                            onClick={() => {
                              setEditMode(prev => ({ ...prev, column: false }));
                              setNewColumn({
                                name: '',
                                description: '',
                                enforceUniqueValues: false,
                                hidden: false,
                                indexed: false,
                                text: {
                                  allowMultipleLines: false,
                                  appendChangesToExistingText: false,
                                  linesForEditing: 0,
                                  maxLength: 255
                                }
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            appearance="primary"
                            icon={<Checkmark20Regular />}
                            onClick={handleAddColumn}
                            disabled={!newColumn.name?.trim() || !newColumn.displayName?.trim()}
                          >
                            {newColumn? 'Update Column' : 'Add Column'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                  
                  <Card style={{ marginTop: '16px' }}>
                    <Table size="medium">
                      <TableHeader>
                        <TableRow>
                          <TableHeaderCell>Display Name</TableHeaderCell>
                          <TableHeaderCell>Internal Name</TableHeaderCell>
                          <TableHeaderCell>Type</TableHeaderCell>
                          <TableHeaderCell>Required</TableHeaderCell>
                          <TableHeaderCell style={{ width: '80px' }}>Actions</TableHeaderCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {columns.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <div className={styles.emptyState}>
                                <Text size={400}>No columns defined for this container</Text>
                                <Text size={200} block style={{ marginTop: '8px' }}>
                                  Click "Add Column" to create a new column for this container.
                                </Text>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          columns.map((column) => (
                            <TableRow key={column.id}>
                              <TableCell>{column.displayName || column.name}</TableCell>
                              <TableCell>{column.name}</TableCell>
                              <TableCell>
                                <Badge appearance="outline">
                                  {column.text ? 'Text' : 'Other'}
                                  {column.text?.allowMultipleLines && ' (Multi-line)'}
                                </Badge>
                              </TableCell>
                              <TableCell>{column.required ? 'Yes' : 'No'}</TableCell>
                              <TableCell>
                                <div className={styles.recycleBinActions}>
                                  <Tooltip content="Edit column" relationship="label">
                                    <Button
                                      icon={<Edit20Regular />}
                                      appearance="subtle"
                                      aria-label="Edit column"
                                      onClick={() => {
                                        setNewColumn({
                                          name: column.name,
                                          displayName: column.displayName,
                                          description: column.description,
                                          required: column.required,
                                          text: column.text                                          
                                        });
                                        setEditMode(prev => ({ ...prev, column: true }));
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip content="Delete column" relationship="label">
                                    <Button
                                      icon={<Delete20Regular />}
                                      appearance="subtle"
                                      aria-label="Delete column"
                                      onClick={() => handleDeleteColumn(column.id)}
                                    />
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Recycle Bin tab content */}
          {selectedTab === "recycleBin" && (
            <div className={styles.tabContent}>
              <div className={styles.tabHeader}>
                <Text weight="semibold" size={500}>Recycle Bin</Text>
              </div>
              
              {loading.recycleBin ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" label="Loading recycle bin items..." />
                </div>
              ) : (
                <Card>
                  <div className={styles.cardContent}>
                    <Text as="p" size={200} block>
                      Items in the recycle bin can be restored or permanently deleted within the retention period.
                    </Text>
                    
                    <Table size="medium" style={{ marginTop: '16px' }}>
                      <TableHeader>
                        <TableRow>
                          <TableHeaderCell>Name</TableHeaderCell>
                          <TableHeaderCell>Deleted By</TableHeaderCell>
                          <TableHeaderCell>Deleted Date</TableHeaderCell>
                          <TableHeaderCell>Size</TableHeaderCell>
                          <TableHeaderCell style={{ width: '80px' }}>Actions</TableHeaderCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recycleBinItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5}>
                              <div className={styles.emptyState}>
                                <Text size={400}>Recycle bin is empty</Text>
                                <Text size={200} block style={{ marginTop: '8px' }}>
                                  Deleted items will appear here
                                </Text>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          recycleBinItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                <Persona
                                  name={item.deletedBy?.user?.displayName || 'Unknown user'}
                                  presence={{ status: 'offline' }}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {formatDate(item.deletedDateTime)}
                              </TableCell>
                              <TableCell>{formatFileSize(item.size)}</TableCell>
                              <TableCell>
                                <div className={styles.recycleBinActions}>
                                  <Tooltip content="Restore item" relationship="label">
                                    <Button 
                                      icon={<ArrowUpload20Regular />} 
                                      appearance="subtle"
                                      onClick={() => handleRestoreItem(item.id)}
                                      aria-label="Restore item"
                                    />
                                  </Tooltip>
                                  <Tooltip content="Delete permanently" relationship="label">
                                    <Button 
                                      icon={<DeleteDismiss20Regular />} 
                                      appearance="subtle"
                                      onClick={() => handlePermanentDelete(item.id)}
                                      aria-label="Delete permanently"
                                    />
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <CardFooter>
                    <Text size={200} weight="medium">
                      Items in the recycle bin count toward your storage quota
                    </Text>
                  </CardFooter>
                </Card>
              )}
            </div>
          )}
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};