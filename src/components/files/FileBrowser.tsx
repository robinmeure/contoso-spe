import React, { useState, useRef, useEffect } from 'react';
import type { GriffelStyle } from '@griffel/react';
import {
  makeStyles,
  tokens,
  Button,
  Spinner,
  TableColumnDefinition,
  DataGridCell,
  DataGridHeaderCell,
  Text,
  createTableColumn,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  DataGrid,
  DataGridBody,
  DataGridHeader,
  DataGridRow,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  TableRowId,
  mergeClasses,
  ProgressBar,
  Card,
  CardHeader,
  Badge,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  makeResetStyles,
  shorthands,
} from '@fluentui/react-components';
import {
  FolderRegular,
  ArrowDownloadRegular,
  OpenRegular,
  EditRegular,
  DeleteRegular,
  PeopleTeamRegular,
  FolderAddRegular,
  DocumentAddRegular,
  MoreHorizontalRegular,
  ArrowSortDownRegular,
  ArrowSortUpRegular,
  ChevronRight20Regular,
  PinGlobe20Regular,
  Settings20Regular,
  InfoRegular,
  ChevronDownRegular,
  Database24Regular,
  ArrowLeft20Regular,
} from '@fluentui/react-icons';
import { Icon } from '@fluentui/react';
import { getFileTypeIconProps, FileIconType, initializeFileTypeIcons } from '@fluentui/react-file-type-icons';
import { IContainer, useSPEClient } from '../../api';
// Import the interface instead of the implementation
import { IContainerService } from '../../services/interfaces/IContainerService';
import { NavigationItem } from '../../hooks/useFolderNavigation';
import { FileDetailsPanel } from './FileDetailsPanel';
import { CreateFolderDialog } from './CreateFolderDialog';
import { FileActionsDialog } from './FileActionsDialog';
import { FilePreviewDialog } from './FilePreviewDialog';
import { useFiles } from '../../hooks/useFiles';
import { CopilotChat } from '../copilot/CopilotChat';
import { ContainerSettingsDialog } from '../containers/ContainerSettingsDialog';
import { useContainers } from '../../hooks/useContainers';
// Import the type guards to check if an item is a file or folder
import { IDriveItem, isFileItem, isFolderItem } from '../../models/driveItem';


// Inject inline CSS for sharepoint-embedded-chat
const embeddedChatStyle = `
  #sharepoint-embedded-chat {
    border-radius: 0px 0px 3px 3px;
    width: 100%;
    height: 78vh;
    border: 0px;
  }
`;

const chatWrapperStyle = `
  #ChatWrapperId {
    border-radius: var(--borderRadiusMedium);
    box-shadow: var(--shadow4);
  }
`;

// Custom GitHubIcon based on the provided SVG values
const GitHubIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    display="block"
    className={className}
    style={style}
  >
    <path 
      d="M6.77889 14.9999H11.5938C12.6162 14.9999 13.3728 14.3436 13.9211 13.5283C14.4714 12.71 14.8793 11.638 15.1961 10.5875C15.5592 9.38351 16.0165 7.86674 15.9995 6.64477C15.991 6.02748 15.8622 5.40417 15.4636 4.93124C15.0503 4.44087 14.4256 4.2026 13.6254 4.2026H13.1916C12.8184 4.17148 12.4946 3.92276 12.3697 3.56318L11.936 2.31371C11.663 1.52708 10.9239 1 10.0939 1H9.23663L9.22114 1.00006H4.4062C3.38378 1.00006 2.62719 1.65641 2.07891 2.47169C1.52859 3.29001 1.12069 4.36198 0.803872 5.41253C0.440784 6.61649 -0.0164514 8.13326 0.000455415 9.35523C0.00899617 9.97252 0.137844 10.5958 0.536424 11.0688C0.949698 11.5591 1.57443 11.7974 2.37461 11.7974H2.8084C3.18159 11.8285 3.50544 12.0772 3.63026 12.4368L4.06399 13.6863C4.33704 14.4729 5.07612 15 5.90608 15H6.76338C6.76855 15 6.77372 15 6.77889 14.9999ZM7.77534 6.65792L8.0257 5.87203C8.15212 5.4752 8.51962 5.20589 8.93472 5.20589H9.46421C9.3917 5.33608 9.33322 5.47609 9.29105 5.62418C9.02949 6.54282 8.62995 7.94131 8.22459 9.34234L7.97431 10.128C7.84789 10.5248 7.48039 10.7941 7.06529 10.7941H6.53579C6.6083 10.6639 6.66678 10.5239 6.70895 10.3758C6.9705 9.45723 7.37 8.05887 7.77534 6.65792ZM7.52454 11.7392C7.39824 12.1671 7.2841 12.5504 7.16311 12.8883C7.02668 13.2694 6.89317 13.5582 6.74854 13.7632C6.66221 13.8855 6.49575 13.9999 6.12413 13.9999C6.12151 13.9999 6.11889 14 6.11627 14H5.90608C5.50003 14 5.13845 13.7421 5.00486 13.3573L4.57113 12.1078C4.53341 11.9992 4.4868 11.8954 4.43229 11.7974H4.8318C4.8699 11.7974 4.9078 11.7963 4.94546 11.7941L7.06529 11.7941C7.22255 11.7941 7.37648 11.7752 7.52454 11.7392ZM11.4289 3.89218C11.4666 4.00084 11.5132 4.10455 11.5677 4.2026H11.1682C11.1301 4.2026 11.0922 4.20371 11.0545 4.2059L8.93472 4.2059C8.77745 4.2059 8.62353 4.22481 8.47546 4.26079C8.60176 3.83287 8.7159 3.4496 8.83689 3.11166C8.97332 2.73061 9.10684 2.44177 9.25146 2.23683C9.33779 2.11449 9.50425 2.00005 9.87587 2.00005L9.88372 1.99999H10.0939C10.5 1.99999 10.8616 2.25786 10.9952 2.64271L11.4289 3.89218ZM1.75748 5.70223C2.06577 4.67999 2.43925 3.7233 2.90473 3.03115C3.37224 2.33597 3.86586 2.00005 4.4062 2.00005H8.23064C8.10425 2.23835 7.99671 2.5013 7.89926 2.77348C7.76184 3.15729 7.63428 3.58978 7.50273 4.03582L7.47356 4.1347C6.89556 6.09246 6.15673 8.67597 5.75096 10.101C5.63358 10.5133 5.25841 10.7974 4.8318 10.7974H2.37461C1.77299 10.7974 1.46751 10.6251 1.29712 10.423C1.11203 10.2033 1.00376 9.85209 0.996696 9.34134C0.982388 8.30722 1.37998 6.95398 1.75748 5.70223ZM13.0953 12.9689C12.6278 13.664 12.1341 13.9999 11.5938 13.9999H7.76936C7.89575 13.7617 8.00329 13.4987 8.10074 13.2265C8.23816 12.8427 8.36572 12.4102 8.49727 11.9642L8.52645 11.8653C9.10445 9.90754 9.84327 7.32403 10.249 5.89895C10.3664 5.48671 10.7416 5.20259 11.1682 5.20259H13.6254C14.227 5.20259 14.5325 5.37487 14.7029 5.57705C14.888 5.79666 14.9962 6.14791 15.0033 6.65866C15.0176 7.69278 14.62 9.04602 14.2425 10.2978C13.9342 11.32 13.5608 12.2767 13.0953 12.9689Z" 
      fill="currentColor"
    />
  </svg>
);

type CSSProperties = Required<Pick<React.CSSProperties, 
  | 'display' 
  | 'flexDirection' 
  | 'height' 
  | 'padding' 
  | 'alignItems' 
  | 'justifyContent' 
  | 'marginBottom'
  | 'gap'
  | 'fontSize'
  | 'fontWeight'
  | 'color'
  | 'textAlign'
  | 'width'
  | 'border'
  | 'borderRadius'
  | 'overflow'
  | 'backgroundColor'
  | 'boxShadow'
  | 'transition'
  | 'cursor'
  | 'flexGrow'
  | 'minHeight'
  | 'maxHeight'
  | 'fontFamily'
>>;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    //height: '100%',
    padding: tokens.spacingHorizontalM,
  } satisfies GriffelStyle,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalL,
  } satisfies GriffelStyle,
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  } satisfies GriffelStyle,
  card: {
    marginBottom: tokens.spacingVerticalL,
  } satisfies GriffelStyle,
  cardHeader: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  } satisfies GriffelStyle,
  fileContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: '0',
  } satisfies GriffelStyle,
  detailsList: {
    overflowY: 'auto',
    height: '100%',
  } satisfies GriffelStyle,
  iconCell: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    transition: 'color 0.2s ease',
    ':hover': {
      color: tokens.colorBrandForeground1,
    },
  } satisfies GriffelStyle,
  icon: {
    fontSize: tokens.fontSizeBase500,
  } satisfies GriffelStyle,
  folderIcon: {
    color: tokens.colorPaletteDarkOrangeForeground2,
  } satisfies GriffelStyle,
  fileIcon: {
    color: tokens.colorPaletteBlueBackground2,
  } satisfies GriffelStyle,
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
    height: '100%',
    textAlign: 'center',
    color: tokens.colorNeutralForeground2,
  } satisfies GriffelStyle,
  actionButtons: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  } satisfies GriffelStyle,
  splitPanel: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    gap: tokens.spacingHorizontalL,
  } satisfies GriffelStyle,
  filesList: {
    flexGrow: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  } satisfies GriffelStyle,
  detailsPanel: {
    width: '300px',
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    paddingLeft: tokens.spacingHorizontalM,
  } satisfies GriffelStyle,
  dataGrid: {
    height: '100%',
    overflowY: 'auto',
  } satisfies GriffelStyle,
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  } satisfies GriffelStyle,
  sortIcon: {
    fontSize: tokens.fontSizeBase300,
  } satisfies GriffelStyle,
  breadcrumbContainer: {
    boxShadow: tokens.shadow4,
    marginBottom: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
  } satisfies GriffelStyle,
  breadcrumbItem: {
    fontWeight: tokens.fontWeightSemibold,
    cursor: 'pointer',
    ':hover': {
      textDecoration: 'underline',
    },
  } satisfies GriffelStyle,
  currentBreadcrumb: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  } satisfies GriffelStyle,
  progressContainer: {
    padding: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  } satisfies GriffelStyle,
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalXS,
  } satisfies GriffelStyle,
  hidden: {
    display: 'none',
  } satisfies GriffelStyle,
  copilotPanel: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minHeight: '0',
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  } satisfies GriffelStyle,
  copilotPanelContent:
  {
  //  height: '100%',
    minWidth: '100%',
    maxWidth: '100%',
    width: '100%',
    overflow: 'auto',
  }, 
  copilotButton: {
    color: tokens.colorBrandForeground1,
    ':hover': {
      color: tokens.colorBrandForeground2,
    },
  } satisfies GriffelStyle,
  copilotIcon: {
    fontSize: tokens.fontSizeBase600,
  } satisfies GriffelStyle,
  dataRow: {
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
      cursor: 'pointer',
    },
  } satisfies GriffelStyle,
  metadataCard: {
    marginTop: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground1,
  } satisfies GriffelStyle,
  metadataSection: {
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalM,
  } satisfies GriffelStyle,
  metadataTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    marginBottom: tokens.spacingVerticalS,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  } satisfies GriffelStyle,
  preContainer: {
    backgroundColor: tokens.colorNeutralBackground3, 
    padding: tokens.spacingHorizontalM,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
    overflow: 'auto',
    maxHeight: '200px',
    fontFamily: 'monospace',
  } satisfies GriffelStyle,
  tableContainer: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  } satisfies GriffelStyle,
  centeredIcon: {
    fontSize: '48px',
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground3,
  } satisfies GriffelStyle,
});

interface FileBrowserProps {
  driveId: string | null;
  folderId: string;
  searchQuery: string;
  isGlobalSearch: boolean;
  onFolderNavigate: (item: IDriveItem, newBreadcrumbs: NavigationItem[]) => void;
  breadcrumbs: NavigationItem[];
  onItemSelect: (item: IDriveItem | null) => void;
  selectedItem: IDriveItem | null;
  onBreadcrumbNavigate?: (item: NavigationItem, index: number) => void;
  onNavigateToContainers: () => void; // Add this new prop
}

initializeFileTypeIcons();

export const FileBrowser: React.FC<FileBrowserProps> = ({
  driveId,
  folderId,
  onFolderNavigate,
  breadcrumbs,
  onItemSelect,
  selectedItem,
  onBreadcrumbNavigate,
  onNavigateToContainers,
}) => {
  const styles = useStyles();
  const { getClient } = useSPEClient();
  
  // State for preview dialog
  const [previewDialogOpen, setPreviewDialogOpen] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');

  // State for Copilot sidebar
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  
  // State for metadata section
  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  // UI state
  const [sortedFiles, setSortedFiles] = useState<IDriveItem[]>([]);
  const [sortKey, setSortKey] = useState<string>('name');
  const [isSortedDescending, setIsSortedDescending] = useState<boolean>(false);
  
  // Dialog state
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState<boolean>(false);
  const [fileActionDialogType, setFileActionDialogType] = useState<'rename' | 'delete' | null>(null);
  const [actionTargetItem, setActionTargetItem] = useState<IDriveItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add upload progress state
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadTotal, setUploadTotal] = useState<number>(0);
  const [uploadCurrent, setUploadCurrent] = useState<number>(0);

  const [currentContainer, setCurrentContainer] = useState<IContainer | null>(null); // Add this new state

  // Use the files hook to manage file operations
  const { 
      files, 
      loading, 
      error, 
      loadFiles, 
      navigateToFolder: getUpdatedBreadcrumbs,
      createFolder,
      deleteFile,
  } = useFiles();

  // Effect to load files when driveId or folderId changes
  useEffect(() => {
    if (driveId) {
      loadFiles(driveId, folderId);
      
      // Load container details when driveId changes
      const getContainer = async (containerId: string) => {
        try {
          const client = await getClient();
          const container = await client.getContainer(containerId);
          setCurrentContainer(container);
        } catch (err) {
          console.error('Error loading container details:', err);
          setCurrentContainer(null);
        }
      };
      
      // Call getContainer with the driveId
      getContainer(driveId);
    } else {
      setCurrentContainer(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveId, folderId]); // Intentionally exclude loadFiles from dependencies to prevent infinite loops

  // Toggle Copilot sidebar
  const toggleCopilot = () => {
    setIsCopilotOpen(!isCopilotOpen);
  };

  // Handle item click (folder navigation or file selection)
  const handleItemClick = (item: IDriveItem) => {
    if (isFolderItem(item)) {
      // Navigate to folder
      if (driveId && item.id) {
        const newBreadcrumbs = getUpdatedBreadcrumbs(item, breadcrumbs);
        onFolderNavigate(item, newBreadcrumbs);
      }
    } else {
      // Select file
      onItemSelect(item);
    }
  };

  // Format file size
  const formatFileSize = (size: number | undefined | null): string => {
    if (size === undefined || size === null) return 'Unknown';
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };


  // Get file icon based on file name // Enhanced getFileIcon function with more specific file type detection
  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      return <FolderRegular className={styles.folderIcon} style={{ marginRight: '8px' }} />;
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Use the extension directly with getFileTypeIconProps
    // This will automatically map to the correct icon based on Office UI Fabric's icon set
    const iconProps = getFileTypeIconProps({ 
      extension, 
      size: 16, 
      imageFileType: 'svg' 
    });
    
    return <Icon {...iconProps} style={{ marginRight: '8px' }} />;
  };

  // Handle download file
  const handleDownloadFile = async (item: IDriveItem, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!item.id || !driveId) return;

    try {
      const client = await getClient();
      const stream = await client.getContentStream(driveId, item.id);
      
      // Create a blob from the stream
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          chunks.push(value);
        }
        done = readerDone;
      }
      
      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err: any) {
      console.error('Error downloading file:', err);
    }
  };

  // Updated preview file function
  const handlePreviewFile = async (item: IDriveItem, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!item.id || !driveId) return;

    try {
      const client = await getClient();
      const url = await client.getPreviewUrl(driveId, item.id);
      
      // Set the preview URL and filename for the dialog
      setPreviewUrl(url.toString());
      setPreviewFileName(item.name || 'File Preview');
      
      // Open the preview dialog
      setPreviewDialogOpen(true);
    } catch (err: any) {
      console.error('Error previewing file:', err);
      
      // Show error in dialog
      setPreviewUrl(null);
      setPreviewFileName(item.name || 'File Preview');
      setPreviewDialogOpen(true);
    }
  };

  // Handle rename item
  const handleRenameItem = async (newName: string) => {
    if (!actionTargetItem?.id || !driveId || !newName.trim()) return;
    
    try {
      const client = await getClient();
      await client.renameItem(driveId, actionTargetItem.id, newName.trim());
      
      loadFiles(driveId, folderId);
      // If the renamed item was selected, clear the selection
      if (selectedItem?.id === actionTargetItem.id) {
        onItemSelect(null);
      }
    } catch (err: any) {
      console.error('Error renaming item:', err);
    }
  };

  // Handle create folder
  const handleCreateFolder = async (folderName: string) => {
    if (!driveId || !folderName.trim()) return;
    
    await createFolder(driveId, folderId, folderName.trim());
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!actionTargetItem?.id || !driveId) return;
    
    try {
      await deleteFile(driveId, actionTargetItem.id);
      
      // If the deleted item was selected, clear the selection
      if (selectedItem?.id === actionTargetItem.id) {
        onItemSelect(null);
      }
    } catch (err: any) {
      console.error('Error deleting item:', err);
    }
  };

  // Handle file upload with progress
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length || !driveId) return;
    
    try {
      const client = await getClient();
      
      // Setup for progress tracking
      setIsUploading(true);
      setUploadTotal(files.length);
      setUploadCurrent(0);
      
      // Upload each selected file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadFileName(file.name);
        setUploadCurrent(i + 1);
        
        // For small files, progress will just jump from 0 to 100
        // For large files, the client.uploadFile method will report progress
        setUploadProgress(0);
        
        try {
          await client.uploadFile(driveId, file, folderId, (progress: number) => {
            setUploadProgress(progress);
          });
        } catch (fileErr: any) {
          console.error(`Error uploading ${file.name}:`, fileErr);
        }
      }
      
      loadFiles(driveId, folderId);
      // Reset upload state
      setIsUploading(false);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading files:', err);
      setIsUploading(false);
    }
  };

  // Define columns for DataGrid
  const columns: TableColumnDefinition<IDriveItem>[] = [
    createTableColumn<IDriveItem>({
      columnId: 'name',
      compare: (a, b) => (a.name || '').localeCompare(b.name || ''),
      renderHeaderCell: () => {
        const isSorted = sortKey === 'name';
        return (
          <DataGridHeaderCell 
            onClick={() => handleSort('name')}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.headerContent}>
              Name
              {isSorted && (
                isSortedDescending 
                  ? <ArrowSortDownRegular className={styles.sortIcon} />
                  : <ArrowSortUpRegular className={styles.sortIcon} />
              )}
            </span>
          </DataGridHeaderCell>
        );
      },
      renderCell: (item) => (
        <DataGridCell>
          <span className={styles.iconCell}>
            {getFileIcon(item.name || '', isFolderItem(item))}
            {item.name}
          </span>
        </DataGridCell>
      ),
    }),
    createTableColumn<IDriveItem>({
      columnId: 'lastModifiedDateTime',
      compare: (a, b) => {
        const aDate = a.lastModifiedDateTime ? new Date(a.lastModifiedDateTime).getTime() : 0;
        const bDate = b.lastModifiedDateTime ? new Date(b.lastModifiedDateTime).getTime() : 0;
        return aDate - bDate;
      },
      renderHeaderCell: () => {
        const isSorted = sortKey === 'lastModifiedDateTime';
        return (
          <DataGridHeaderCell 
            onClick={() => handleSort('lastModifiedDateTime')}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.headerContent}>
              Modified
              {isSorted && (
                isSortedDescending 
                  ? <ArrowSortDownRegular className={styles.sortIcon} />
                  : <ArrowSortUpRegular className={styles.sortIcon} />
              )}
            </span>
          </DataGridHeaderCell>
        );
      },
      renderCell: (item) => (
        <DataGridCell>
          {item.lastModifiedDateTime && new Date(item.lastModifiedDateTime).toLocaleDateString()}
        </DataGridCell>
      ),
    }),
    createTableColumn<IDriveItem>({
      columnId: 'size',
      compare: (a, b) => {
        const aSize = isFolderItem(a) ? (a.folder.childCount || 0) : (isFileItem(a) ? (a.size || 0) : 0);
        const bSize = isFolderItem(b) ? (b.folder.childCount || 0) : (isFileItem(b) ? (b.size || 0) : 0);
        return aSize - bSize;
      },
      renderHeaderCell: () => {
        const isSorted = sortKey === 'size';
        return (
          <DataGridHeaderCell 
            onClick={() => handleSort('size')}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.headerContent}>
              Size
              {isSorted && (
                isSortedDescending 
                  ? <ArrowSortDownRegular className={styles.sortIcon} />
                  : <ArrowSortUpRegular className={styles.sortIcon} />
              )}
            </span>
          </DataGridHeaderCell>
        );
      },
      renderCell: (item) => (
        <DataGridCell>
          {isFolderItem(item) 
            ? `${item.folder.childCount || 0} items` 
            : isFileItem(item) ? formatFileSize(item.size) : 'Unknown'}
        </DataGridCell>
      ),
    }),
    createTableColumn<IDriveItem>({
      columnId: 'actions',
      renderHeaderCell: () => <DataGridHeaderCell>Actions</DataGridHeaderCell>,
      renderCell: (item) => (
        <DataGridCell>
          <Menu>
            <MenuTrigger>
              <Button
                icon={<MoreHorizontalRegular />}
                appearance="subtle"
                onClick={e => e.stopPropagation()}
              />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {!isFolderItem(item) && (
                  <>
                    <MenuItem 
                      icon={<ArrowDownloadRegular />}
                      onClick={(e) => handleDownloadFile(item, e)}
                    >
                      Download
                    </MenuItem>
                    <MenuItem 
                      icon={<OpenRegular />}
                      onClick={(e) => handlePreviewFile(item, e)}
                    >
                      Preview
                    </MenuItem>
                  </>
                )}
                <MenuItem 
                  icon={<EditRegular />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionTargetItem(item);
                    setFileActionDialogType('rename');
                  }}
                >
                  Rename
                </MenuItem>
                <MenuItem 
                  icon={<PeopleTeamRegular />}
                  onClick={(e) => {
                    e.stopPropagation();
                    /* Implement permissions dialog */
                  }}
                >
                  Permissions
                </MenuItem>
                <MenuItem 
                  icon={<DeleteRegular />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionTargetItem(item);
                    setFileActionDialogType('delete');
                  }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </DataGridCell>
      ),
    }),
  ];

  // Handle sorting
  const handleSort = (columnId: string) => {
    setSortKey(columnId);
    if (columnId === sortKey) {
      setIsSortedDescending(!isSortedDescending);
    } else {
      setIsSortedDescending(false);
    }
  };

  // Update sorted items when items or sort preferences change
  useEffect(() => {
    let sorted = [...files];
    const column = columns.find(col => col.columnId === sortKey);
    if (column?.compare) {
      sorted.sort((a, b) => {
        const result = column.compare!(a, b);
        return isSortedDescending ? -result : result;
      });
    }
    setSortedFiles(sorted);
  }, [files, sortKey, isSortedDescending]);

  return (
    <div className={styles.root}>
      {/* Include the style tag with our embedded chat styles */}
      <style dangerouslySetInnerHTML={{ __html: embeddedChatStyle }} />
      <style dangerouslySetInnerHTML={{ __html: chatWrapperStyle }} />
      <div className={styles.header}>
        <Text className={styles.title}>
          <FolderRegular />
          Files
        </Text>
        <div className={styles.actionButtons}>
          <Button
            icon={<FolderAddRegular />}
            onClick={() => setNewFolderDialogOpen(true)}
          >
            New Folder
          </Button>
          <Button
            appearance="primary"
            icon={<DocumentAddRegular />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
          </Button>
          <Button
            icon={<InfoRegular />}
            appearance="subtle"
            onClick={() => setShowMetadata(!showMetadata)}
            aria-label="Toggle Metadata"
            title="Toggle Response Metadata"
          />
          <Button
            icon={<GitHubIcon className={styles.copilotIcon} />}
            appearance="subtle"
            className={styles.copilotButton}
            onClick={toggleCopilot}
            aria-label="Open Copilot"
            title="Open Copilot"
          />
        </div>
      </div>

      {/* Upload Progress Bar */}
      <div className={mergeClasses(styles.progressContainer, !isUploading && styles.hidden)}>
        <div className={styles.progressText}>
          <Text>Uploading: {uploadFileName}</Text>
          <Text>{uploadCurrent} of {uploadTotal}</Text>
        </div>
        <ProgressBar 
          value={uploadProgress / 100}
          thickness="medium"
          color="brand"
        />
      </div>
      {/* Breadcrumbs navigation */}
      <div className={styles.breadcrumbContainer}>
        <Breadcrumb aria-label="Navigation breadcrumbs">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && (
                <BreadcrumbDivider>
                  <ChevronRight20Regular />
                </BreadcrumbDivider>
              )}
              <BreadcrumbItem
                className={`${styles.breadcrumbItem} ${index === breadcrumbs.length - 1 ? styles.currentBreadcrumb : ''}`}
                onClick={() => {
                  // Use the onBreadcrumbNavigate prop if available
                  if (onBreadcrumbNavigate) {
                    onBreadcrumbNavigate(item, index);
                  } else {
                    // Fall back to previous behavior if onBreadcrumbNavigate is not provided
                    const navigationItem = files.find(i => i.id === item.id);
                    if (navigationItem) {
                      handleItemClick(navigationItem);
                    } else if (index === 0 && driveId) {
                      // If it's the root container/drive
                      loadFiles(driveId, 'root');
                    }
                  }
                }}
              >
                {item.name}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </Breadcrumb>
      </div>

      <div className={styles.splitPanel}>
        <div className={styles.filesList}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Spinner size="medium" label="Loading files..." />
            </div>
          ) : !driveId ? (
            <div className={styles.emptyState}>
              <Database24Regular className={styles.centeredIcon} />
              <Text weight="semibold">No Container Selected</Text>
              <Text size={200} style={{ marginTop: tokens.spacingVerticalS }}>
                Please select a container to view its files
              </Text>
              <Button
                appearance="primary"
                icon={<ArrowLeft20Regular />}
                onClick={onNavigateToContainers}
                style={{ marginTop: tokens.spacingVerticalL }}
              >
                Select a Container
              </Button>
            </div>
          ) : files.length === 0 ? (
            <div className={styles.emptyState}>
              <FolderAddRegular className={styles.centeredIcon} />
              <Text weight="semibold">No Files in This Container</Text>
              <Text size={200} style={{ marginTop: tokens.spacingVerticalS }}>
                Upload a file or create a folder to get started
              </Text>
              <div style={{ marginTop: tokens.spacingVerticalL, display: 'flex', gap: tokens.spacingHorizontalS }}>
                <Button
                  icon={<FolderAddRegular />}
                  onClick={() => setNewFolderDialogOpen(true)}
                >
                  New Folder
                </Button>
                <Button
                  appearance="primary"
                  icon={<DocumentAddRegular />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload File
                </Button>
              </div>
            </div>
          ) : (
            <Card className={styles.card}>
              <CardHeader
                className={styles.cardHeader}
                header={
                  <Text weight="semibold">
                    <Badge appearance="filled" size="small" style={{ marginRight: tokens.spacingHorizontalS }}>
                      {files.length}
                    </Badge>
                    Files
                  </Text>
                }
              />
              <div className={styles.tableContainer}>
                <DataGrid
                  items={sortedFiles}
                  columns={columns}
                  getRowId={(item: IDriveItem) => item.id as TableRowId}
                  className={styles.dataGrid}
                  onSelectionChange={(e, data) => {
                    // Convert Set to Array to access first item
                    const selectedIds = Array.from(data.selectedItems);
                    const selectedItem = sortedFiles.find(item => item.id === selectedIds[0]);
                    if (selectedItem) {
                      handleItemClick(selectedItem);
                    }
                  }}
                  selectionMode="single"
                >
                  <DataGridHeader>
                    <DataGridRow>
                      {({ renderHeaderCell }) => renderHeaderCell()}
                    </DataGridRow>
                  </DataGridHeader>
                  <DataGridBody<IDriveItem>>
                    {({ item, rowId }) => (
                      <DataGridRow<IDriveItem>
                        key={rowId}
                        onClick={() => handleItemClick(item)}
                        className={styles.dataRow}
                      >
                        {({ renderCell }) => renderCell(item)}
                      </DataGridRow>
                    )}
                  </DataGridBody>
                </DataGrid>
              </div>

              {showMetadata && (
                <div className={styles.metadataSection}>
                  <Text className={styles.metadataTitle}>Response Metadata</Text>
                  <pre className={styles.preContainer}>
                    {JSON.stringify({
                      "@odata.context": `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children`,
                      "@odata.count": files.length,
                      "value": files.map(file => ({
                        "@odata.type": isFolderItem(file) ? "#microsoft.graph.folder" : "#microsoft.graph.file",
                        "id": file.id,
                        "name": file.name,
                        "size": isFileItem(file) ? file.size : undefined,
                        "lastModifiedDateTime": file.lastModifiedDateTime,
                        ...(isFolderItem(file) ? { 
                          "folder": { 
                            "childCount": file.folder.childCount 
                          } 
                        } : isFileItem(file) ? {
                          "file": {
                            "mimeType": file.file.mimeType || "application/octet-stream"
                          }
                        } : {})
                      }))
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </Card>
          )}
        </div>
        
        {/* File details panel */}
        {selectedItem && !isCopilotOpen && (
          <div className={styles.detailsPanel}>
            <FileDetailsPanel item={selectedItem} driveId={driveId} />
          </div>
        )}

        {/* Copilot Panel */}
        {isCopilotOpen && (
          <div className={styles.copilotPanel}>
            <div className={styles.copilotPanelContent}>
                <div className='sharepoint-embedded-chat'>
                  <CopilotChat container={currentContainer!} />
                  </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        isOpen={newFolderDialogOpen}
        onOpenChange={setNewFolderDialogOpen}
        onCreateFolder={handleCreateFolder}
      />
      
      <FileActionsDialog
        dialogType={fileActionDialogType}
        item={actionTargetItem}
        onClose={() => {
          setFileActionDialogType(null);
          setActionTargetItem(null);
        }}
        onRename={handleRenameItem}
        onDelete={handleDeleteItem}
      />

      {/* File Preview Dialog */}
      <FilePreviewDialog
        isOpen={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        previewUrl={previewUrl}
        fileName={previewFileName}
      />

      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        onChange={handleFileUpload}
      />

      
    </div>
  );
};