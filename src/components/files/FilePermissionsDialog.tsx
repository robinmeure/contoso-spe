import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  makeStyles,
  tokens,
  Spinner,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
  Input,
  Select,
  Persona,
  Option,
  Avatar,
  Badge,
  Divider,
  TabList,
  Tab,
  Menu,
  MenuList,
  MenuItem,
  MenuTrigger,
  MenuPopover
} from '@fluentui/react-components';
import {
  PeopleTeamRegular,
  LinkRegular,
  CopyRegular,
  DeleteRegular,
  MoreHorizontalRegular,
  SearchRegular,
  AddRegular,
  DocumentRegular
} from '@fluentui/react-icons';
import { useSPEClient } from '../../api';
import { IDriveItem } from '../../models/driveItem';

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  icon: {
    fontSize: tokens.fontSizeBase600,
    color: tokens.colorBrandForeground1,
  },
  permissionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  permissionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  permissionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  addSection: {
    marginTop: tokens.spacingVerticalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  formRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    alignItems: 'center',
  },
  formInput: {
    flex: 1,
  },
  tabList: {
    marginBottom: tokens.spacingVerticalM,
  },
  linkSection: {
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalM,
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacingVerticalS,
  },
  linkInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  noPermissions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXL,
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
  },
  noPermissionsIcon: {
    fontSize: '32px',
    marginBottom: tokens.spacingVerticalM,
  },
  badge: {
    marginLeft: tokens.spacingHorizontalS,
  },
  roleSelect: {
    width: '200px',
  }
});

// Define interface for permission objects
interface Permission {
  id: string;
  roles: string[];
  shareId?: string;
  hasPassword?: boolean;
  link?: {
    webUrl: string;
    type: string;
    scope: string;
    preventsDownload?: boolean;
    application?: {
      id: string;
      displayName: string;
    };
  };
  grantedToIdentities?: {
    user?: {
      id: string;
      displayName: string;
      email?: string;
    };
    group?: {
      id: string;
      displayName: string;
    };
  }[];
  grantedToIdentitiesV2?: {
    user?: {
      id: string;
      displayName: string;
      email?: string;
    };
    siteUser?: {
      id: string;
      displayName: string;
      loginName: string;
      email?: string;
    };
    group?: {
      id: string;
      displayName: string;
    };
  }[];
  grantedTo?: {
    user?: {
      id: string;
      displayName: string;
      email?: string;
    };
    group?: {
      id: string;
      displayName: string;
    };
  };
  grantedToV2?: {
    user?: {
      id: string;
      displayName: string;
      email?: string;
    };
    siteUser?: {
      id: string;
      displayName: string;
      loginName: string;
      email?: string;
    };
    group?: {
      id: string;
      displayName: string;
    };
  };
  inheritedFrom?: {
    driveId: string;
    id: string;
    path: string;
  };
}

interface FilePermissionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: IDriveItem | null;
  driveId: string | null;
}

export const FilePermissionsDialog: React.FC<FilePermissionsDialogProps> = ({
  isOpen,
  onOpenChange,
  item,
  driveId,
}) => {
  const styles = useStyles();
  const { getClient } = useSPEClient();
  
  // State
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('people');
  
  // State for adding new permission
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('read');
  const [addingPermission, setAddingPermission] = useState<boolean>(false);
  
  // State for managing sharing link
  const [sharingLink, setSharingLink] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  // Load permissions when the dialog opens
  useEffect(() => {
    if (isOpen && item && item.id && driveId) {
      loadPermissions();
    }
  }, [isOpen, item, driveId]);
  
  const loadPermissions = async () => {
    if (!item?.id || !driveId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const client = await getClient();
      const permissionsList = await client.getDriveItemPermissions(driveId, item.id);
      setPermissions(permissionsList);
      
      // Get sharing link if available
      const linkPermission = permissionsList.find(p => p.link);
      if (linkPermission?.link?.webUrl) {
        setSharingLink(linkPermission.link.webUrl);
      }
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError('Failed to load permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding a new permission
  const handleAddPermission = async () => {
    if (!item?.id || !driveId || !email.trim()) return;
    
    setAddingPermission(true);
    setError(null);
    
    try {
      const client = await getClient();
      
      // Prepare permission object with correct format
      const permission = {
        requireSignIn: true,
        sendInvitation: false,
        roles: [role],
        recipients: [
          {
            email: email.trim()
          }
        ],
        message: ""
      };
      
      await client.addDriveItemPermission(driveId, item.id, permission);
      
      // Refresh permissions list
      await loadPermissions();
      
      // Reset form
      setEmail('');
      setRole('read');
    } catch (err) {
      console.error('Error adding permission:', err);
      setError('Failed to add permission. Please verify the email address and try again.');
    } finally {
      setAddingPermission(false);
    }
  };
  
  // Handle removing a permission
  const handleRemovePermission = async (permissionId: string) => {
    if (!item?.id || !driveId) return;
    
    try {
      const client = await getClient();
      await client.removeDriveItemPermission(driveId, item.id, permissionId);
      
      // Refresh permissions list
      await loadPermissions();
    } catch (err) {
      console.error('Error removing permission:', err);
      setError('Failed to remove permission. Please try again.');
    }
  };
  
  // Handle creating a sharing link
  const handleCreateSharingLink = async (type: 'view' | 'edit') => {
    if (!item?.id || !driveId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const client = await getClient();
      
      // Use the dedicated createSharingLink method with the appropriate parameters
      const result = await client.createSharingLink(
        driveId, 
        item.id, 
        type,
        'organization' // You can make this configurable later if needed
      );
      
      if (result && result.link && result.link.webUrl) {
        setSharingLink(result.link.webUrl);
      }
      
      // Refresh permissions list to show the new link in the permissions list
      await loadPermissions();
    } catch (err) {
      console.error('Error creating sharing link:', err);
      setError('Failed to create sharing link. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle copying link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharingLink).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      },
      () => {
        setError('Failed to copy link to clipboard');
      }
    );
  };
  
  // Helper to get display name from permission object
  const getDisplayName = (permission: Permission) => {
    // First check grantedToIdentitiesV2 array
    if (permission.grantedToIdentitiesV2?.length) {
      const identity = permission.grantedToIdentitiesV2[0];
      if (identity.siteUser?.displayName) return identity.siteUser.displayName;
      if (identity.user?.displayName) return identity.user.displayName;
      if (identity.group?.displayName) return identity.group.displayName;
    }
    
    // Then try grantedToIdentities array
    if (permission.grantedToIdentities?.length) {
      const identity = permission.grantedToIdentities[0];
      if (identity.user?.displayName) return identity.user.displayName;
      if (identity.group?.displayName) return identity.group.displayName;
    }
    
    // Check for granted user/group name (older format)
    if (permission.grantedToV2?.user?.displayName) {
      return permission.grantedToV2.user.displayName;
    } else if (permission.grantedToV2?.group?.displayName) {
      return permission.grantedToV2.group.displayName;
    } else if (permission.grantedToV2?.siteUser?.displayName) {
      return permission.grantedToV2.siteUser.displayName;
    } else if (permission.grantedTo?.user?.displayName) {
      return permission.grantedTo.user.displayName;
    } else if (permission.grantedTo?.group?.displayName) {
      return permission.grantedTo.group.displayName;
    }
    
    // For link-based permissions
    if (permission.link?.application?.displayName) {
      return permission.link.application.displayName;
    } else if (permission.link) {
      return permission.link.type === 'edit' ? 'Edit Link' : 'View Link';
    }
    
    return 'Unknown User';
  };
  
  // Helper to translate role to display text
  const getRoleDisplayText = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No access';
    
    // Use the most permissive role
    if (roles.includes('owner')) return 'Owner';
    if (roles.includes('write')) return 'Can edit';
    if (roles.includes('read')) return 'Can view';
    
    return roles[0]; // Return first role as fallback
  };
  
  // Is the permission inherited from parent?
  const isInherited = (permission: Permission) => {
    return !!permission.inheritedFrom;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            <div className={styles.header}>
              <PeopleTeamRegular className={styles.icon} />
              <Text size={500} weight="semibold">
                Manage Permissions
              </Text>
            </div>
          </DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {item && (
              <div>
                <Persona 
                  name={item.name || 'File'}
                  secondaryText={`Sharing settings for this ${item.folder ? 'folder' : 'file'}`}
                  avatar={{ 
                    icon: item.folder ? <PeopleTeamRegular /> : <DocumentRegular /> 
                  }}
                />
              </div>
            )}
            
            <TabList 
              selectedValue={selectedTab}
              onTabSelect={(_, data) => setSelectedTab(data.value as string)}
              className={styles.tabList}
            >
              <Tab value="people">People</Tab>
              <Tab value="link">Sharing Link</Tab>
            </TabList>
            
            {selectedTab === 'people' ? (
              <>
                <Text weight="semibold" size={300}>People with Access</Text>
                
                {loading ? (
                  <Spinner label="Loading permissions..." />
                ) : error ? (
                  <Text color="error">{error}</Text>
                ) : permissions.length === 0 ? (
                  <div className={styles.noPermissions}>
                    <PeopleTeamRegular className={styles.noPermissionsIcon} />
                    <Text weight="semibold">No permissions found</Text>
                    <Text size={200}>
                      This item has not been shared with anyone yet.
                    </Text>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Name</TableHeaderCell>
                        <TableHeaderCell>Permission</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div className={styles.permissionInfo}>
                              <Avatar 
                                name={getDisplayName(permission)} 
                                color="colorful"
                              />
                              <div>
                                <Text weight="semibold">{getDisplayName(permission)}</Text>
                                {isInherited(permission) && (
                                  <Badge 
                                    appearance="outline" 
                                    color="informative" 
                                    className={styles.badge}
                                  >
                                    Inherited
                                  </Badge>
                                )}
                                {permission.link && (
                                  <Badge 
                                    appearance="outline" 
                                    color="brand" 
                                    className={styles.badge}
                                  >
                                    Link
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleDisplayText(permission.roles)}</TableCell>
                          <TableCell>
                            {!isInherited(permission) && (
                              <Menu>
                                <MenuTrigger>
                                  <Button 
                                    icon={<MoreHorizontalRegular />}
                                    appearance="subtle"
                                  />
                                </MenuTrigger>
                                <MenuPopover>
                                  <MenuList>
                                    <MenuItem 
                                      icon={<DeleteRegular />}
                                      onClick={() => handleRemovePermission(permission.id)}
                                    >
                                      Remove Permission
                                    </MenuItem>
                                  </MenuList>
                                </MenuPopover>
                              </Menu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                <Divider />
                
                <div className={styles.addSection}>
                  <Text weight="semibold" size={300}>Add People</Text>
                  <div className={styles.formRow}>
                    <Input 
                      placeholder="Enter email addresses"
                      value={email}
                      onChange={(_, data) => setEmail(data.value)}
                      className={styles.formInput}
                      contentBefore={<SearchRegular />}
                    />
                    <Select 
                      value={role}
                      onChange={(_, data) => data.value && setRole(data.value)}
                      className={styles.roleSelect}
                    >
                      <Option value="read">Can view</Option>
                      <Option value="write">Can edit</Option>
                    </Select>
                    <Button 
                      appearance="primary"
                      icon={<AddRegular />}
                      onClick={handleAddPermission}
                      disabled={!email.trim() || addingPermission}
                    >
                      {addingPermission ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <Text weight="semibold" size={300}>Sharing Link</Text>
                
                <div className={styles.linkSection}>
                  {sharingLink ? (
                    <>
                      <Text>Anyone with this link can access this {item?.folder ? 'folder' : 'file'}.</Text>
                      <div className={styles.linkRow}>
                        <Input 
                          value={sharingLink} 
                          readOnly
                          className={styles.formInput}
                          contentBefore={<LinkRegular />}
                        />
                        <Button 
                          icon={<CopyRegular />} 
                          onClick={handleCopyLink}
                        >
                          {copySuccess ? 'Copied!' : 'Copy Link'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <Text>Create a link to share this {item?.folder ? 'folder' : 'file'}.</Text>
                      <div style={{ marginTop: tokens.spacingVerticalM, display: 'flex', gap: tokens.spacingHorizontalM }}>
                        <Button 
                          onClick={() => handleCreateSharingLink('view')}
                          disabled={loading}
                        >
                          Create View Link
                        </Button>
                        <Button 
                          onClick={() => handleCreateSharingLink('edit')}
                          disabled={loading}
                        >
                          Create Edit Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};