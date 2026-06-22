import * as React from 'react';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { APIKey } from '../types';

interface DeleteAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: APIKey | null;
  onDelete: (apiKey: APIKey) => void;
}

const DeleteAPIKeyModal: React.FunctionComponent<DeleteAPIKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onDelete,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isDeleteEnabled = apiKey && deleteConfirmation === apiKey.name;

  React.useEffect(() => {
    if (!isOpen) {
      setDeleteConfirmation('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleDeleteConfirm = () => {
    if (!apiKey || !isDeleteEnabled) return;

    setIsDeleting(true);
    
    // Simulate deletion delay
    setTimeout(() => {
      onDelete(apiKey);
      setIsDeleting(false);
      onClose();
    }, 1000);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isDeleteEnabled) {
      handleDeleteConfirm();
    }
  };

  if (!apiKey) return null;

  return (
    <Modal
      id="delete-api-key-modal"
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="delete-api-key-modal-title"
      aria-describedby="delete-api-key-modal-description"
    >
      <ModalHeader
        title="Delete API key?"
        labelId="delete-api-key-modal-title"
      />
      <ModalBody id="delete-api-key-modal-description">
        <Alert
          id="delete-api-key-alert"
          variant="danger"
          title="This action cannot be undone"
          isInline
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          Deleting this API key will immediately revoke access for any applications currently using it.
        </Alert>
        
        <p style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          To confirm deletion, type the API key name below:
        </p>
        
        <p 
          id="api-key-name-display"
          style={{ 
            fontFamily: 'var(--pf-t--global--font--family--mono)',
            padding: 'var(--pf-t--global--spacer--sm)', 
            backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', 
            borderRadius: 'var(--pf-t--global--border--radius--small)',
            marginBottom: 'var(--pf-t--global--spacer--md)'
          }}
        >
          {apiKey.name}
        </p>
        
        <Form>
          <FormGroup 
            label="API key name" 
            isRequired 
            fieldId="delete-confirmation-input"
          >
            <TextInput
              id="delete-confirmation-input"
              value={deleteConfirmation}
              onChange={(_event, value) => setDeleteConfirmation(value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter API key name to confirm"
              isDisabled={isDeleting}
              aria-label="Type API key name to confirm deletion"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          id="confirm-delete-button"
          variant="danger"
          onClick={handleDeleteConfirm}
          isDisabled={!isDeleteEnabled}
          isLoading={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
        <Button
          id="cancel-delete-button"
          variant="link"
          onClick={onClose}
          isDisabled={isDeleting}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeleteAPIKeyModal };

