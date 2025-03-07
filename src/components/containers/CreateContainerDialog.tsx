// src/components/containers/CreateContainerDialog.tsx

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
  DialogContent,
  Input,
  Textarea,
  Text,
  Field,
} from '@fluentui/react-components';
import { IContainerClientCreateRequest } from '../../api';

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    minWidth: '400px',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  formLabel: {
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalXS,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
    padding: `${tokens.spacingVerticalS} 0`,
  },
  dialogActions: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    columnGap: tokens.spacingHorizontalM,
  },
  dialogTitle: {
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL} ${tokens.spacingVerticalS}`,
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
});

interface CreateContainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateContainer: (container: IContainerClientCreateRequest) => Promise<void>;
}

export const CreateContainerDialog: React.FC<CreateContainerDialogProps> = ({
  open,
  onOpenChange,
  onCreateContainer,
}) => {
  const styles = useStyles();
  const [newContainer, setNewContainer] = useState<IContainerClientCreateRequest>({
    displayName: '',
    description: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Reset form when dialog opens or closes
  useEffect(() => {
    if (open) {
      // If dialog is opening, initialize with empty values
      setNewContainer({ displayName: '', description: '' });
      setFormError(null);
      setLoading(false);
    }
  }, [open]);

  const handleCreateContainer = async () => {
    if (!newContainer.displayName.trim()) {
      setFormError('Container name is required');
      return;
    }
    
    setFormError(null);
    setLoading(true);
    
    try {
      await onCreateContainer(newContainer);
      
      // Reset form and close dialog
      setNewContainer({ displayName: '', description: '' });
      onOpenChange(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create container');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewContainer({ displayName: '', description: '' });
    setFormError(null);
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(_, data) => onOpenChange(data.open)}
    >
      <DialogSurface>
        <DialogTitle className={styles.dialogTitle}>Create New Container</DialogTitle>
        
        <DialogContent className={styles.dialogContent}>
          <Field 
            label={{ children: 'Container Name', className: styles.formLabel }}
            required
            validationState={formError && !newContainer.displayName.trim() ? "error" : "none"}
            validationMessage={formError && !newContainer.displayName.trim() ? "Container name is required" : undefined}
            className={styles.formField}
            size="large"
          >
            <Input 
              value={newContainer.displayName}
              onChange={(_, data) => setNewContainer({...newContainer, displayName: data.value})}
              placeholder="Enter container name"
              autoFocus
              appearance="filled-darker"
              size="medium"
            />
          </Field>
          
          <Field 
            label={{ children: 'Description', className: styles.formLabel }}
            className={styles.formField}
            hint={{ children: "Optional description for your container" }}
            size="large"
          >
            <Textarea 
              value={newContainer.description || ''}
              onChange={(_, data) => setNewContainer({...newContainer, description: data.value})}
              placeholder="Enter optional description"
              resize="vertical"
              appearance="filled-darker"
              size="medium"
              style={{ minHeight: '100px' }}
            />
          </Field>
          
          {formError && newContainer.displayName.trim() && (
            <Text className={styles.errorText}>{formError}</Text>
          )}
        </DialogContent>
        
        <DialogActions className={styles.dialogActions}>
          <Button 
            appearance="secondary" 
            onClick={handleClose} 
            disabled={loading}
            size="medium"
          >
            Cancel
          </Button>
          <Button 
            appearance="primary" 
            onClick={handleCreateContainer} 
            disabled={loading}
            size="medium"
          >
            {loading ? <Spinner size="tiny" style={{ marginRight: tokens.spacingHorizontalXS }} /> : null}
            Create Container
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};