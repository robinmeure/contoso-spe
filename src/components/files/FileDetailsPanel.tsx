import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  makeStyles,
  tokens,
  Text,
  Card,
  CardHeader,
  shorthands,
  Divider,
  Avatar,
  Button,
  mergeClasses,
  TabList,
  Tab,
  Spinner,
} from '@fluentui/react-components';
import { 
  EditRegular, 
  ArrowDownloadRegular,
  OpenRegular,
  ShareRegular,
  DeleteRegular,
  TagRegular,
} from '@fluentui/react-icons';
import { IDriveItem, useSPEClient } from '../../api';

const useStyles = makeStyles({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.overflow('hidden'),
  },
  content: {
    ...shorthands.overflow('auto'),
    flexGrow: 1,
    padding: tokens.spacingHorizontalM,
  },
  field: {
    ...shorthands.margin('0', '0', '12px', '0'),
  },
  label: {
    display: 'block',
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    marginBottom: tokens.spacingVerticalXS,
  },
  value: {
    display: 'block',
    fontSize: tokens.fontSizeBase300,
    wordBreak: 'break-word',
  },
  thumbnail: {
    width: '100%',
    height: 'auto',
    maxHeight: '200px',
    objectFit: 'contain',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.margin(tokens.spacingVerticalS, '0', tokens.spacingVerticalL),
  },
  divider: {
    ...shorthands.margin(tokens.spacingVerticalM, '0'),
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  userAvatar: {
    fontSize: tokens.fontSizeBase200,
    width: '24px',
    height: '24px',
  },
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    ...shorthands.margin(tokens.spacingVerticalM, '0'),
  },
  metaTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.padding(tokens.spacingVerticalXXS, tokens.spacingHorizontalXS),
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    fontSize: tokens.fontSizeBase200,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  tabList: {
    ...shorthands.borderBottom(`1px solid ${tokens.colorNeutralStroke1}`),
  },
  propertyTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: tokens.fontSizeBase200,
  },
  propertyRow: {
    '& td': {
      padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXS}`,
      borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    '&:nth-child(odd)': {
      backgroundColor: tokens.colorNeutralBackground1,
    }
  },
  propertyKey: {
    color: tokens.colorNeutralForeground2,
    width: '40%',
  }
});

interface FileDetailsPanelProps {
  item: IDriveItem;
  driveId: string | null;
  onPreviewFile?: (item: IDriveItem) => void;
  onDownloadFile?: (item: IDriveItem) => void;
  onDeleteFile?: (item: IDriveItem) => void;
  onRenameFile?: (item: IDriveItem) => void;
}

const formatFileSize = (size: number | null | undefined): string => {
  if (typeof size !== 'number') return 'Unknown';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

// Format date to be more readable
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
};

// Get file extension
const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toUpperCase() || '';
};

// Get mime type from extension
const getMimeType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Common mime types
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

export const FileDetailsPanel: React.FC<FileDetailsPanelProps> = ({ 
  item, 
  driveId,
  onPreviewFile,
  onDownloadFile,
  onDeleteFile,
  onRenameFile
}) => {
  const styles = useStyles();
  const { getClient } = useSPEClient();
  const [selectedTab, setSelectedTab] = useState<string>('info');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);
  const thumbnailLoadedRef = useRef<string | null>(null);
  
  // Load thumbnail only when item or driveId changes
  useEffect(() => {
    // Reset state when item changes
    if (!item || !driveId || item.folder || !item.id) {
      setThumbnailUrl(null);
      return;
    }

    // Avoid reloading thumbnail for the same item
    if (thumbnailLoadedRef.current === item.id) {
      return;
    }

    const extension = (item.name?.split('.').pop() || '').toLowerCase();
    const supportedTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'pdf', 'mp4', 'mov'];
    
    if (!supportedTypes.includes(extension)) {
      setThumbnailUrl(null);
      return;
    }

    // Define async function inside to avoid dependency issues
    async function loadThumbnail() {
      try {
        setIsLoadingThumbnail(true);
        const client = await getClient();
        
        // Get thumbnail with size preference
        const thumbnailResponse = await client.getThumbnail(driveId!, item.id!, 'medium');
        
        // Extract URL from the response
        if (thumbnailResponse && 
            thumbnailResponse.value && 
            thumbnailResponse.value.length > 0 && 
            thumbnailResponse.value[0].medium && 
            thumbnailResponse.value[0].medium.url) {
          setThumbnailUrl(thumbnailResponse.value[0].medium.url);
          thumbnailLoadedRef.current = item.id; // Mark this thumbnail as loaded
        } else {
          console.warn('Thumbnail response did not contain expected URL format');
          setThumbnailUrl(null);
        }
      } catch (err) {
        console.error('Error loading thumbnail:', err);
        setThumbnailUrl(null);
      } finally {
        setIsLoadingThumbnail(false);
      }
    }

    // Call the function to load the thumbnail
    loadThumbnail();
    
  }, [driveId, item?.id, item?.folder, item?.name, getClient]);

  // If there's no item, return null
  if (!item) return null;

  // Format permissions for display
  const formatPermissions = (item: IDriveItem) => {
    // This would be expanded in a real application
    return item.shared ? 'Shared' : 'Private';
  };

  // Get file metadata for Properties tab
  const getFileProperties = () => {
    const properties = [
      { key: 'Name', value: item.name || 'Unknown' },
      { key: 'Type', value: item.folder ? 'Folder' : getFileExtension(item.name || '') },
      { key: 'Size', value: item.folder ? `${item.folder.childCount || 0} items` : formatFileSize(item.size) },
      { key: 'Created', value: formatDate(item.createdDateTime) },
      { key: 'Modified', value: formatDate(item.lastModifiedDateTime) },
      { key: 'Created by', value: item.createdBy?.user?.displayName || 'Unknown' },
      { key: 'Modified by', value: item.lastModifiedBy?.user?.displayName || 'Unknown' },
      { key: 'Path', value: item.parentReference?.path || '/' },
      { key: 'Permissions', value: formatPermissions(item) },
    ];

    if (!item.folder) {
      properties.push(
        { key: 'MIME Type', value: getMimeType(item.name || '') }
      );
    }

    return properties;
  };

  return (
    <Card className={styles.root}>
      <CardHeader header={
        <Text weight="semibold">{item.folder ? 'Folder Details' : 'File Details'}</Text>
      } />
      
      <TabList 
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value as string)}
        size="small"
        className={styles.tabList}
      >
        <Tab value="info">Info</Tab>
        <Tab value="properties">Properties</Tab>
      </TabList>
      
      <div className={styles.content}>
        {selectedTab === 'info' && (
          <>
            {/* Quick Actions */}
            <div className={styles.actionButtons}>
              {!item.folder && onPreviewFile && (
                <Button 
                  icon={<OpenRegular />} 
                  appearance="subtle"
                  onClick={() => onPreviewFile(item)}
                >
                  Preview
                </Button>
              )}
              {!item.folder && onDownloadFile && (
                <Button 
                  icon={<ArrowDownloadRegular />} 
                  appearance="subtle"
                  onClick={() => onDownloadFile(item)}
                >
                  Download
                </Button>
              )}
              {onRenameFile && (
                <Button 
                  icon={<EditRegular />} 
                  appearance="subtle"
                  onClick={() => onRenameFile(item)}
                >
                  Rename
                </Button>
              )}
              {onDeleteFile && (
                <Button 
                  icon={<DeleteRegular />} 
                  appearance="subtle"
                  onClick={() => onDeleteFile(item)}
                >
                  Delete
                </Button>
              )}
            </div>

            {/* Thumbnail for images, videos, PDFs */}
            {isLoadingThumbnail && (
              <div style={{ textAlign: 'center', padding: tokens.spacingVerticalM }}>
                <Spinner size="tiny" label="Loading thumbnail..." />
              </div>
            )}
            {thumbnailUrl && !isLoadingThumbnail && (
              <img src={thumbnailUrl} alt={item.name!} className={styles.thumbnail} />
            )}

            {/* Basic Info */}
            <div className={styles.field}>
              <Text className={styles.label}>Name</Text>
              <Text className={styles.value}>{item.name}</Text>
            </div>
            
            {!item.folder && (
              <div className={styles.field}>
                <Text className={styles.label}>Type</Text>
                <Text className={styles.value}>
                  {getFileExtension(item.name || '')} File
                </Text>
              </div>
            )}
            
            <div className={styles.field}>
              <Text className={styles.label}>
                {item.folder ? 'Contains' : 'Size'}
              </Text>
              <Text className={styles.value}>
                {item.folder ? 
                  `${item.folder.childCount || 0} items` : 
                  formatFileSize(item.size)}
              </Text>
            </div>

            <Divider className={styles.divider} />
            
            {/* Modification Info */}
            {item.lastModifiedDateTime && (
              <div className={styles.field}>
                <Text className={styles.label}>Last modified</Text>
                <Text className={styles.value}>
                  {formatDate(item.lastModifiedDateTime)}
                </Text>
              </div>
            )}
            
            {item.lastModifiedBy && (
              <div className={styles.field}>
                <Text className={styles.label}>Modified by</Text>
                <div className={styles.userName}>
                  <Avatar 
                    name={item.lastModifiedBy.user?.displayName || 'Unknown'} 
                    className={styles.userAvatar}
                    size={24}
                  />
                  <Text className={styles.value}>
                    {item.lastModifiedBy.user?.displayName}
                  </Text>
                </div>
              </div>
            )}
            
            {/* Tags - demo feature */}
            <div className={styles.field}>
              <Text className={styles.label}>Tags</Text>
              <div className={styles.metaTags}>
                {/* These would come from the API in a real application */}
                <span className={styles.tag}>
                  <TagRegular fontSize={12} />
                  <span>Document</span>
                </span>
                <span className={styles.tag}>
                  <TagRegular fontSize={12} />
                  <span>Project</span>
                </span>
                <Button 
                  appearance="transparent" 
                  size="small"
                  title="Add tag"
                >
                  + Add
                </Button>
              </div>
            </div>
          </>
        )}
        
        {selectedTab === 'properties' && (
          <table className={styles.propertyTable}>
            <tbody>
              {getFileProperties().map((prop, index) => (
                <tr key={index} className={styles.propertyRow}>
                  <td className={styles.propertyKey}>{prop.key}</td>
                  <td>{prop.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};