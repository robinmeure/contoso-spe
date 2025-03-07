// src/components/files/CreateFolderDialog.tsx

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Label,
} from '@fluentui/react-components';

interface CreateFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFolder: (folderName: string) => Promise<void>;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  isOpen,
  onOpenChange,
  onCreateFolder,
}) => {
  const [folderName, setFolderName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateFolder(folderName.trim());
      handleClose();
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleClose = () => {
    setFolderName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <Label htmlFor="folderName">Name</Label>
          <Input
            id="folderName"
            value={folderName}
            onChange={(_, data) => setFolderName(data.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button appearance="secondary" onClick={handleClose}>Cancel</Button>
          <Button 
            appearance="primary" 
            onClick={handleCreateFolder} 
            disabled={isCreating || !folderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};