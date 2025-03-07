// src/components/files/FileActionsDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  Label,
  Text,
} from '@fluentui/react-components';
import { IDriveItem } from '../../api';

type DialogType = 'rename' | 'delete' | null;

interface FileActionsDialogProps {
  dialogType: DialogType;
  item: IDriveItem | null;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const FileActionsDialog: React.FC<FileActionsDialogProps> = ({
  dialogType,
  item,
  onClose,
  onRename,
  onDelete,
}) => {
  const [newName, setNewName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Set initial name when item changes or dialog opens
  useEffect(() => {
    if (item && dialogType === 'rename') {
      setNewName(item.name || '');
    }
  }, [item, dialogType]);

  const handleRename = async () => {
    if (!newName.trim()) return;
    
    setIsProcessing(true);
    try {
      await onRename(newName.trim());
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!item) return null;

  const isOpen = dialogType !== null;
  const isFolder = 'folder' in item && Boolean((item as any).folder);
  const itemType = isFolder ? 'Folder' : 'File';

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onClose()}>
      <DialogSurface>
        {dialogType === 'rename' && (
          <>
            <DialogTitle>Rename {itemType}</DialogTitle>
            <DialogContent>
              <Label htmlFor="itemName">New Name</Label>
              <Input
                id="itemName"
                value={newName}
                onChange={(_, data) => setNewName(data.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onClose} disabled={isProcessing}>Cancel</Button>
              <Button 
                appearance="primary" 
                onClick={handleRename} 
                disabled={isProcessing || !newName.trim() || newName === item.name}
              >
                Rename
              </Button>
            </DialogActions>
          </>
        )}

        {dialogType === 'delete' && (
          <>
            <DialogTitle>Delete {itemType}</DialogTitle>
            <DialogContent>
              <Text>
                Are you sure you want to delete "{item.name}"?
                {isFolder && ' This will delete all contents within this folder.'}
              </Text>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onClose} disabled={isProcessing}>Cancel</Button>
              <Button 
                appearance="primary" 
                onClick={handleDelete} 
                disabled={isProcessing}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </DialogSurface>
    </Dialog>
  );
};