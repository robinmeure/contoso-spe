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
  Select,
  Option,
  shorthands,
  Persona,
  Badge,
  Tooltip,
  Menu,
  MenuTrigger,
  MenuItem,
  MenuPopover,
  MenuList,
  Divider,
  Switch,
  Field
} from '@fluentui/react-components';
import { 
  PersonAdd20Regular, 
  Delete20Regular, 
  ArrowUpload20Regular, 
  DeleteDismiss20Regular,
  MoreHorizontal20Regular,
  AddSquare20Regular,
  Edit20Regular,
  Checkmark20Regular,
  Dismiss20Regular
} from '@fluentui/react-icons';
import { IColumnDefinition, IColumnCreateRequest, IContainer, ICustomProperties, ICustomProperty, IRecycleBinItem } from '../../api';
import { ContainerPermission, PermissionRequest } from '../../hooks/useContainers';
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
  },
  tabContent: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalS),
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
    display: 'flex',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    marginBottom: tokens.spacingVerticalS,
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
  recycleBinActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  searchable: {
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding(tokens.spacingVerticalXL),
    color: tokens.colorNeutralForeground3,
  }
});

interface ContainerSettingsDialogProps {
  isOpen: boolean;
  container: IContainer | null;
  onOpenChange: (open: boolean) => void;
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
    permissions: boolean;
    properties: boolean;
    columns: boolean;
    recycleBin: boolean;
  }>({
    permissions: false,
    properties: false,
    columns: false,
    recycleBin: false,
  });
  const [newPermission, setNewPermission] = useState({
    email: '',
    role: 'reader'
  });

  // Load container data when dialog opens or tab changes
  useEffect(() => {
    if (isOpen && container) {
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
  }, [isOpen, container, selectedTab]);

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
      
      // Update local state with new container details
      onOpenChange(false); // Close dialog to refresh container list
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

  if (!container) return null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(_, data) => onOpenChange(data.open)}
      modalType="modal"
    >
      <DialogSurface className={styles.dialogSurface}>
        <DialogTitle>Container Settings: {container.displayName}</DialogTitle>
        <TabList 
            selectedValue={selectedTab}
            onTabSelect={(_, data) => setSelectedTab(data.value as string)}
          >
            <Tab value="general">General</Tab>
            <Tab value="permissions">Permissions</Tab>
            <Tab value="properties">Properties</Tab>
            <Tab value="columns">Columns</Tab>
            <Tab value="recycleBin">Recycle Bin</Tab>
          </TabList>
        <DialogBody>
         
        <div className={styles.dialogBody}>
          {selectedTab === "general" && (
            <div className={styles.tabContent}>
              <div className={styles.formField}>
                <Label htmlFor="container-name" className={styles.formLabel}>Name</Label>
                {editMode.general ? (
                  <Input 
                    id="container-name"
                    value={editingDetails.displayName}
                    onChange={(_, data) => setEditingDetails(prev => ({ ...prev, displayName: data.value }))}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Input 
                      id="container-name"
                      value={container.displayName}
                      readOnly
                    />
                    <Button
                      icon={<Edit20Regular />}
                      appearance="subtle"
                      onClick={() => {
                        setEditMode(prev => ({ ...prev, general: true }));
                        setEditingDetails({
                          displayName: container.displayName,
                          description: container.description || ''
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              <div className={styles.formField}>
                <Label htmlFor="container-description" className={styles.formLabel}>Description</Label>
                {editMode.general ? (
                  <Textarea 
                    id="container-description"
                    value={editingDetails.description}
                    onChange={(_, data) => setEditingDetails(prev => ({ ...prev, description: data.value }))}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                    <Textarea 
                      id="container-description"
                      value={container.description || ''}
                      readOnly
                    />
                  </div>
                )}
              </div>
              {editMode.general && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <Button 
                    appearance="secondary"
                    onClick={() => setEditMode(prev => ({ ...prev, general: false }))}
                  >
                    Cancel
                  </Button>
                  <Button 
                    appearance="primary"
                    icon={<Checkmark20Regular />}
                    onClick={handleUpdateDetails}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
              <div className={styles.formField}>
                <Label htmlFor="container-id" className={styles.formLabel}>ID</Label>
                <Input 
                  id="container-id"
                  value={container.id}
                  readOnly
                />
              </div>
              {container.drive && (
                <div className={styles.formField}>
                  <Label htmlFor="drive-id" className={styles.formLabel}>Drive ID</Label>
                  <Input 
                    id="drive-id"
                    value={container.drive.id}
                    readOnly
                  />
                </div>
              )}
            </div>
          )}
          
          {selectedTab === "permissions" && (
            <div className={styles.tabContent}>
              {loading.permissions ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" />
                  <Text>Loading permissions...</Text>
                </div>
              ) : (
                <>
                  <Table className={styles.permissionsTable}>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>User/Group</TableHeaderCell>
                        <TableHeaderCell>Role</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {containerPermissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} style={{ textAlign: 'center' }}>
                            No permissions found
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
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                  
                  <div className={styles.addPermissionSection}>
                    <Text weight="semibold">Add New Permission</Text>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'flex-end' }}>
                      <div className={styles.formField} style={{ flex: 1, margin: 0 }}>
                        <Label htmlFor="email">User Email</Label>
                        <Input 
                          id="email"
                          value={newPermission.email}
                          onChange={(_, data) => setNewPermission({...newPermission, email: data.value})}
                        />
                      </div>
                      <div className={styles.formField} style={{ width: '120px', margin: 0 }}>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          id="role"
                          value={newPermission.role}
                          onChange={(_, data) => setNewPermission({...newPermission, role: data.value})}
                        >
                          <Option value="reader">Reader</Option>
                          <Option value="writer">Writer</Option>
                          <Option value="owner">Owner</Option>
                        </Select>
                      </div>
                      <Button 
                        icon={<PersonAdd20Regular />}
                        onClick={handleAddPermission}
                        disabled={loading.permissions || !newPermission.email.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedTab === "properties" && (
            <div className={styles.tabContent}>
              {loading.properties ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" />
                  <Text>Loading custom properties...</Text>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Text weight="semibold" size={400}>Custom Properties</Text>
                    <Button 
                      icon={<AddSquare20Regular />}
                      onClick={() => setEditMode(prev => ({ ...prev, customProperty: true }))}
                    >
                      Add Property
                    </Button>
                  </div>
                  
                  {editMode.customProperty && (
                    <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: tokens.colorNeutralBackground2 }}>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                        <Field label="Property Name">
                          <Input 
                            value={newProperty.key}
                            onChange={(_, data) => setNewProperty(prev => ({ ...prev, key: data.value }))}
                          />
                        </Field>
                        <Field label="Property Value">
                          <Input 
                            value={newProperty.value}
                            onChange={(_, data) => setNewProperty(prev => ({ ...prev, value: data.value }))}
                          />
                        </Field>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Switch 
                          label="Make this property searchable"
                          checked={newProperty.isSearchable}
                          onChange={(_, data) => setNewProperty(prev => ({ ...prev, isSearchable: data.checked }))}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button 
                            appearance="secondary"
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
                            Add Property
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '12px' }}>
                    {customProperties && Object.entries(customProperties).length > 0 ? (
                      Object.entries(customProperties).map(([key, property]) => (
                        <div key={key} className={styles.propertyCard}>
                          <div>
                            <div className={styles.propertyName}>
                              {key}
                              {property.isSearchable && (
                                <Tooltip content="This property is searchable" relationship="label">
                                  <Badge className={styles.searchable} appearance="outline" size="small">searchable</Badge>
                                </Tooltip>
                              )}
                            </div>
                            <div className={styles.propertyValue}>
                              <Tooltip content={formatPropertyValue(property)} relationship={'label'}>
                                <Text>{formatPropertyValue(property)}</Text>
                              </Tooltip>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Button
                              icon={<Edit20Regular />}
                              appearance="subtle"
                              onClick={() => {
                                setNewProperty({
                                  key,
                                  value: String(property.value),
                                  isSearchable: property.isSearchable || false
                                });
                                setEditMode(prev => ({ ...prev, customProperty: true }));
                              }}
                            />
                            <Button
                              icon={<Delete20Regular />}
                              appearance="subtle"
                              onClick={() => handleDeleteProperty(key)}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <Text size={400}>No custom properties available</Text>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === "columns" && (
            <div className={styles.tabContent}>
              {loading.columns ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" />
                  <Text>Loading columns...</Text>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Text weight="semibold" size={400}>Custom Columns</Text>
                    <Button 
                      icon={<AddSquare20Regular />}
                      onClick={() => setEditMode(prev => ({ ...prev, column: true }))}
                    >
                      Add Column
                    </Button>
                  </div>

                  {editMode.column && (
                    <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: tokens.colorNeutralBackground2 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                        <Field label="Display Name" required>
                          <Input 
                            value={newColumn.displayName}
                            onChange={(_, data) => setNewColumn(prev => ({ ...prev, displayName: data.value }))}
                          />
                        </Field>
                        <Field label="Internal Name" required>
                          <Input 
                            value={newColumn.name}
                            onChange={(_, data) => setNewColumn(prev => ({ ...prev, name: data.value }))}
                          />
                        </Field>
                        <Field label="Description">
                          <Input 
                            value={newColumn.description}
                            onChange={(_, data) => setNewColumn(prev => ({ ...prev, description: data.value }))}
                          />
                        </Field>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <Switch 
                            label="Required"
                            checked={newColumn.required}
                            onChange={(_, data) => setNewColumn(prev => ({ ...prev, required: data.checked }))}
                          />
                          <Switch 
                            label="Multi-line"
                            checked={newColumn.text?.allowMultipleLines}
                            onChange={(_, data) => setNewColumn(prev => ({ 
                              ...prev, 
                              text: { ...prev.text!, allowMultipleLines: data.checked }
                            }))}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button 
                          appearance="secondary"
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
                          disabled={!newColumn.name.trim() || !newColumn.displayName?.trim()}
                        >
                          Add Column
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Display Name</TableHeaderCell>
                        <TableHeaderCell>Internal Name</TableHeaderCell>
                        <TableHeaderCell>Type</TableHeaderCell>
                        <TableHeaderCell>Required</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {columns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className={styles.emptyState}>
                              <Text>No columns defined for this container</Text>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        columns.map((column) => (
                          <TableRow key={column.id}>
                            <TableCell>{column.displayName}</TableCell>
                            <TableCell>{column.name}</TableCell>
                            <TableCell>
                              {column.text ? 'Text' : 'Other'}
                              {column.text?.allowMultipleLines && ' (Multi-line)'}
                            </TableCell>
                            <TableCell>{column.required ? 'Yes' : 'No'}</TableCell>
                            <TableCell>
                              <div className={styles.recycleBinActions}>
                                <Button
                                  icon={<Edit20Regular />}
                                  appearance="subtle"
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
                                <Button
                                  icon={<Delete20Regular />}
                                  appearance="subtle"
                                  onClick={() => handleDeleteColumn(column.id)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {selectedTab === "recycleBin" && (
            <div className={styles.tabContent}>
              {loading.recycleBin ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner size="medium" />
                  <Text>Loading recycle bin items...</Text>
                </div>
              ) : (
                <div>
                  <Text weight="semibold" size={400}>Recycle Bin</Text>
                  <Text as="p" size={200} block>
                    Recently deleted items that can be restored or permanently deleted.
                  </Text>
                  
                  <Table style={{ marginTop: '16px' }}>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Name</TableHeaderCell>
                        <TableHeaderCell>Deleted By</TableHeaderCell>
                        <TableHeaderCell>Deleted Date</TableHeaderCell>
                        <TableHeaderCell>Size</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recycleBinItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                            <div className={styles.emptyState}>
                              <Text>Recycle bin is empty</Text>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        recycleBinItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              {item.deletedBy?.user?.displayName || 'Unknown user'}
                            </TableCell>
                            <TableCell>
                              {formatDate(item.deletedDateTime)}
                            </TableCell>
                            <TableCell>{formatFileSize(item.size)}</TableCell>
                            <TableCell>
                              <div className={styles.recycleBinActions}>
                                <Tooltip content="Restore" relationship={'description'}>
                                  <Button 
                                    icon={<ArrowUpload20Regular />} 
                                    appearance="subtle"
                                    onClick={() => handleRestoreItem(item.id)}
                                    aria-label="Restore item"
                                  />
                                </Tooltip>
                                <Tooltip content="Delete permanently" relationship={'label'}>
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
              )}
            </div>
          )}
        </div>
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};