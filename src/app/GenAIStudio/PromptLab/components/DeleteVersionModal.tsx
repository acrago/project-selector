import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { PromptVersion } from '../types';

interface DeleteVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  version: PromptVersion | null;
}

export const DeleteVersionModal: React.FunctionComponent<DeleteVersionModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  version,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting version:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      id="delete-version-modal"
    >
      <ModalHeader title="Delete version?" titleIconVariant="warning" />
      <ModalBody>
        <p>
          Are you sure you want to delete version <strong>{version?.versionNumber}</strong>? This action
          cannot be undone.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          onClick={handleDelete}
          isDisabled={isDeleting}
          isLoading={isDeleting}
          id="confirm-delete-version-button"
        >
          Delete version
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={onClose}
          isDisabled={isDeleting}
          id="cancel-delete-version-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

