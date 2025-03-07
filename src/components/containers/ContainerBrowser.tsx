// src/components/containers/ContainerBrowser.tsx
import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Spinner,
  Text,
  Card,
  CardHeader,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  TableCellLayout,
  Badge,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
} from '@fluentui/react-components';
import { 
  Add20Regular,
  FolderAdd20Regular,
  DataArea20Regular,
  Settings20Regular,
  ArrowRight20Regular,
  InfoRegular,
  Delete20Regular,
  Database24Regular,
} from '@fluentui/react-icons';
import { IContainer, useSPEClient } from '../../api';
import { useContainers } from '../../hooks/useContainers';
import { CreateContainerDialog } from './CreateContainerDialog';
import { ContainerSettingsDialog } from './ContainerSettingsDialog';
// Import the interface (not the implementation)
import { IContainerService } from '../../services/interfaces/IContainerService';

// Define styles using makeStyles
const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: tokens.spacingHorizontalM,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalL,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  card: {
    marginBottom: tokens.spacingVerticalL,
  },
  cardHeader: {
    padding: tokens.spacingVerticalS + ' ' + tokens.spacingHorizontalM,
  },
  metadataSection: {
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalM,
  },
  metadataTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalS,
  },
  metadataTable: {
    width: '100%',
  },
  badge: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: tokens.fontSizeBase200,
  },
  tableContainer: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  containerRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  containerRowSelected: {
    backgroundColor: tokens.colorSubtleBackground,
    '&:hover': {
      backgroundColor: tokens.colorSubtleBackgroundHover,
    },
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
  },
  centeredIcon: {
    fontSize: '48px',
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground3,
  },
});

interface ContainerBrowserProps {
  onContainerSelect: (container: IContainer | null) => void; // Update to allow null
  selectedContainer: IContainer | null;
}

export const ContainerBrowser: React.FC<ContainerBrowserProps> = ({ 
  onContainerSelect,
  selectedContainer
}) => {
  const styles = useStyles();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);
  const [editingContainer, setEditingContainer] = useState<IContainer | null>(null);
  const [containerToDelete, setContainerToDelete] = useState<IContainer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  
  const { getClient } = useSPEClient();
  
  // Create a container service that implements IContainerService and delegates to the SharePointEmbeddedClient
  const containerService: IContainerService = {
    getContainers: async () => {
      const client = await getClient();
      return client.getContainers();
    },
    getContainer: async (containerId) => {
      const client = await getClient();
      return client.getContainer(containerId);
    },
    createContainer: async (container) => {
      const client = await getClient();
      return client.createContainer(container);
    },
    deleteContainer: async (containerId) => {
      const client = await getClient();
      return client.deleteContainer(containerId);
    },
    updateContainerDetails: async (containerId, details) => {
      const client = await getClient();
      return client.updateContainerDetails(containerId, details);
    },
    getContainerPermissions: async (containerId) => {
      const client = await getClient();
      return client.getContainerPermissions(containerId);
    },
    updateContainerPermissions: async (containerId, permissions) => {
      const client = await getClient();
      return client.updateContainerPermissions(containerId, permissions);
    },
    deleteContainerPermission: async (containerId, permissionId) => {
      const client = await getClient();
      return client.deleteContainerPermission(containerId, permissionId);
    },
    getContainerCustomProperties: async (containerId) => {
      const client = await getClient();
      return client.getContainerCustomProperties(containerId);
    },
    updateContainerCustomProperty: async (containerId, propertyKey, property) => {
      const client = await getClient();
      return client.updateContainerCustomProperty(containerId, propertyKey, property);
    },
    deleteContainerCustomProperty: async (containerId, propertyKey) => {
      const client = await getClient();
      return client.deleteContainerCustomProperty(containerId, propertyKey);
    },
    getContainerColumns: async (containerId) => {
      const client = await getClient();
      return client.getContainerColumns(containerId);
    },
    createContainerColumn: async (containerId, column) => {
      const client = await getClient();
      return client.createContainerColumn(containerId, column);
    },
    updateContainerColumn: async (containerId, columnId, column) => {
      const client = await getClient();
      return client.updateContainerColumn(containerId, columnId, column);
    },
    deleteContainerColumn: async (containerId, columnId) => {
      const client = await getClient();
      return client.deleteContainerColumn(containerId, columnId);
    },
    // Add missing recycle bin methods
    getRecycleBinItems: async (containerId) => {
      const client = await getClient();
      return client.getRecycleBinItems(containerId);
    },
    restoreRecycleBinItem: async (containerId, itemId) => {
      const client = await getClient();
      return client.restoreRecycleBinItem(containerId, itemId);
    },
    permanentlyDeleteRecycleBinItem: async (containerId, itemId) => {
      const client = await getClient();
      return client.permanentlyDeleteRecycleBinItem(containerId, itemId);
    }
  };
  
  // Use custom hook for container operations
  const { 
    containers, 
    loading, 
    error, 
    loadContainers, 
    createContainer, 
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
    updateContainerDetails
  } = useContainers(containerService);

  // Fetch containers on initial load - only run once
  useEffect(() => {
    loadContainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContainerClick = (container: IContainer) => {
    onContainerSelect(container);
  };

  const openContainerSettings = (container: IContainer) => {
    setEditingContainer(container);
    setIsSettingsDialogOpen(true);
  };

  // Recycle bin operations
  const getRecycleBinItems = async (containerId: string) => {
    try {
      const client = await getClient();
      return await client.getRecycleBinItems(containerId);
    } catch (error) {
      console.error('Failed to get recycle bin items:', error);
      throw error;
    }
  };

  const restoreRecycleBinItem = async (containerId: string, itemId: string) => {
    try {
      const client = await getClient();
      await client.restoreRecycleBinItem(containerId, itemId);
    } catch (error) {
      console.error('Failed to restore recycle bin item:', error);
      throw error;
    }
  };

  const permanentlyDeleteRecycleBinItem = async (containerId: string, itemId: string) => {
    try {
      const client = await getClient();
      await client.permanentlyDeleteRecycleBinItem(containerId, itemId);
    } catch (error) {
      console.error('Failed to permanently delete recycle bin item:', error);
      throw error;
    }
  };

  const handleOpenDeleteDialog = (container: IContainer, e: React.MouseEvent) => {
    e.stopPropagation();
    setContainerToDelete(container);
    setIsDeleteDialogOpen(true);
  };

  const deleteContainer = async () => {
    if (!containerToDelete) return;
    
    try {
      const client = await getClient();
      await client.deleteContainer(containerToDelete.id);
      
      // Refresh containers list after deletion
      await loadContainers();
      
      // If the deleted container was selected, clear selection
      if (selectedContainer && selectedContainer.id === containerToDelete.id) {
        onContainerSelect(null);
      }
      
      setIsDeleteDialogOpen(false);
      setContainerToDelete(null);
    } catch (error) {
      console.error('Failed to delete container:', error);
      // You might want to show an error message to the user here
    }
  };

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text className={styles.title}>
          <Database24Regular />
          Containers
        </Text>
        <div className={styles.actionButtons}>
        <Button
          appearance="primary"
          icon={<Add20Regular />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create Container
        </Button>
        <Button
            icon={<InfoRegular />}
            appearance="subtle"
            onClick={() => setShowMetadata(!showMetadata)}
            aria-label="Toggle Metadata"
            title="Toggle Response Metadata"
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spinner size="medium" label="Loading containers..." />
        </div>
      ) : containers.length === 0 ? (
        <div className={styles.emptyState}>
          <FolderAdd20Regular className={styles.centeredIcon} />
          <Text weight="semibold">No containers</Text>
          <Text size={200} style={{ marginTop: tokens.spacingVerticalS }}>
            Create a container to get started
          </Text>
          <Button 
            appearance="primary"
            icon={<Add20Regular />}
            style={{ marginTop: tokens.spacingVerticalL }}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Container
          </Button>
          
        </div>
      ) : (
        <Card className={styles.card}>
          <CardHeader 
            className={styles.cardHeader}
            header={
              <Text weight="semibold">
                <Badge appearance="filled" size="small" style={{ marginRight: tokens.spacingHorizontalS }}>
                  {containers.length}
                </Badge>
                Available Containers
              </Text>
            }
          />

          <div className={styles.tableContainer}>
            <Table aria-label="Containers table" size="medium">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Display Name</TableHeaderCell>
                  <TableHeaderCell>Container ID</TableHeaderCell>
                  <TableHeaderCell>Type ID</TableHeaderCell>
                  <TableHeaderCell>Created Date</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow 
                    key={container.id}
                    className={`${styles.containerRow} ${selectedContainer?.id === container.id ? styles.containerRowSelected : ''}`}
                    onClick={() => handleContainerClick(container)}
                  >
                    <TableCell>
                      <TableCellLayout media={<DataArea20Regular />}>
                        {container.displayName}
                      </TableCellLayout>
                    </TableCell>
                    <TableCell>
                      <Text size={200} font="monospace">
                        {container.id.substring(0, 15)}...
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text size={200} font="monospace">
                        {container.containerTypeId ? container.containerTypeId.substring(0, 8) + '...' : 'N/A'}
                      </Text>
                    </TableCell>
                    <TableCell>
                      {container.createdDateTime ? formatDate(container.createdDateTime) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        icon={<Settings20Regular />}
                        appearance="subtle"
                        aria-label="Container Settings"
                        onClick={(e) => {
                          e.stopPropagation();
                          openContainerSettings(container);
                        }}
                      />
                      <Button
                        icon={<Delete20Regular />}
                        appearance="subtle"
                        aria-label="Delete Container"
                        onClick={(e) => handleOpenDeleteDialog(container, e)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {showMetadata && (        
          <div className={styles.metadataSection}>
            <Text className={styles.metadataTitle}>Response Metadata</Text>
            <pre style={{ 
              backgroundColor: tokens.colorNeutralBackground3, 
              padding: tokens.spacingHorizontalM,
              borderRadius: tokens.borderRadiusMedium,
              fontSize: tokens.fontSizeBase200,
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify({
                "@odata.context": "https://graph.microsoft.com/v1.0/storage/fileStorage/containers",
                "@odata.count": containers.length,
                "value": containers.map(c => ({
                  "@odata.type": "#microsoft.graph.fileStorageContainer",
                  "id": c.id,
                  "displayName": c.displayName,
                  "containerTypeId": c.containerTypeId || "e2756c4d-fa33-4452-9c36-2325686e1082",
                  "createdDateTime": c.createdDateTime || new Date().toISOString()
                }))
              }, null, 2)}
            </pre>
          </div>
           )}
        </Card>
      )}

      <CreateContainerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateContainer={createContainer}
      />

      {isSettingsDialogOpen && editingContainer && (
        <ContainerSettingsDialog
          isOpen={isSettingsDialogOpen}
          container={editingContainer}
          onOpenChange={setIsSettingsDialogOpen}
          getContainerPermissions={getContainerPermissions}
          updateContainerPermissions={updateContainerPermissions}
          deleteContainerPermission={deleteContainerPermission}
          getContainerCustomProperties={getContainerCustomProperties}
          addContainerCustomProperty={addContainerCustomProperty}
          updateContainerCustomProperty={updateContainerCustomProperty}
          deleteContainerCustomProperty={deleteContainerCustomProperty}
          getContainerColumns={getContainerColumns}
          createContainerColumn={createContainerColumn}
          updateContainerColumn={updateContainerColumn}
          deleteContainerColumn={deleteContainerColumn}
          updateContainerDetails={updateContainerDetails}
          getRecycleBinItems={getRecycleBinItems}
          restoreRecycleBinItem={restoreRecycleBinItem}
          permanentlyDeleteRecycleBinItem={permanentlyDeleteRecycleBinItem}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(e, data) => setIsDeleteDialogOpen(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Container</DialogTitle>
            <DialogContent>
              Are you sure you want to delete container "{containerToDelete?.displayName}"? 
              This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button 
                appearance="secondary" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                appearance="primary" 
                onClick={deleteContainer}
                style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
              >
                Delete
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};