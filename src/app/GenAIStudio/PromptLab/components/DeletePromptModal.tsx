import * as React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { Prompt } from '../types';

interface DeletePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  prompt: Prompt | null;
}

export const DeletePromptModal: React.FunctionComponent<DeletePromptModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  prompt,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting prompt:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      id="delete-prompt-modal"
    >
      <ModalHeader title="Delete prompt?" titleIconVariant="warning" />
      <ModalBody>
        <p>
          Are you sure you want to delete <strong>{prompt?.name}</strong>? This action cannot be undone
          and will permanently remove the prompt and all its versions.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          onClick={handleDelete}
          isDisabled={isDeleting}
          isLoading={isDeleting}
          id="confirm-delete-prompt-button"
        >
          Delete
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={onClose}
          isDisabled={isDeleting}
          id="cancel-delete-prompt-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

