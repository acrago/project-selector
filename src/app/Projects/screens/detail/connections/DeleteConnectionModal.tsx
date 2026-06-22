import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { Connection } from './ConnectionsTable';

interface DeleteConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  connection: Connection | null;
}

export const DeleteConnectionModal: React.FunctionComponent<DeleteConnectionModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  connection,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting connection:', err);
      setError('Failed to delete connection. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!connection) {
    return null;
  }

  return (
    <Modal
      variant={ModalVariant.small}
      title="Delete connection?"
      isOpen={isOpen}
      onClose={handleClose}
      id="delete-connection-modal"
    >
      <ModalHeader title="Delete connection?" />
      <ModalBody>
        <p>
          The <strong>{connection.name}</strong> connection will be deleted and will no longer be
          available for use with workbenches and other resources. This action cannot be undone.
        </p>
        {error && (
          <p style={{ color: 'var(--pf-global--danger-color--100)', marginTop: 'var(--pf-global--spacer--md)' }}>
            {error}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          onClick={handleDelete}
          isDisabled={isDeleting}
          isLoading={isDeleting}
          id="confirm-delete-connection-button"
        >
          Delete
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={handleClose}
          isDisabled={isDeleting}
          id="cancel-delete-connection-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

