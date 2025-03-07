import React from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  makeStyles,
  tokens,
  Button,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  dialogSurface: {
    width: '90vw',
    height: '90vh',
    maxWidth: '95vw',
    maxHeight: '95vh',
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: tokens.spacingVerticalS,
    paddingTop: tokens.spacingVerticalS,
    minHeight: '40px',
  },
  dialogBody: {
    height: 'calc(100% - 40px)', // Reduce title height to give more space to content
    padding: 0,
    overflow: 'hidden',
  },
  iframe: {
    width: '80vw',
    height: '80vh',
    border: 'none',
  }
});

interface FilePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
  fileName: string;
}

export const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  isOpen,
  onOpenChange,
  previewUrl,
  fileName,
}) => {
  const styles = useStyles();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(event, data) => onOpenChange(data.open)}
      modalType="modal"
    >
      <DialogSurface className={styles.dialogSurface}>
        <DialogTitle className={styles.dialogTitle}>
          File Preview - {fileName}
          <Button
            appearance="subtle"
            icon={<DismissRegular />}
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          />
        </DialogTitle>
        <DialogBody className={styles.dialogBody}>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className={styles.iframe}
              title={`Preview of ${fileName}`}
              sandbox="allow-scripts allow-same-origin allow-forms"
              referrerPolicy="no-referrer"
            />
          ) : (
            <DialogContent>No preview available</DialogContent>
          )}
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};