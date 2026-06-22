import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { APIKey } from '../types';

interface RevokeAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: APIKey | null;
  onConfirm: (apiKey: APIKey) => void;
}

const RevokeAPIKeyModal: React.FunctionComponent<RevokeAPIKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    if (!apiKey) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    onConfirm(apiKey);
    setIsSubmitting(false);
    onClose();
  };

  if (!apiKey) return null;

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      id="revoke-api-key-modal"
      aria-labelledby="revoke-api-key-modal-title"
    >
      <ModalHeader title="Revoke API key?" labelId="revoke-api-key-modal-title" />
      <ModalBody>
        <Alert
          variant="warning"
          isInline
          title="This action is permanent and cannot be undone"
          customIcon={<ExclamationTriangleIcon />}
          id="revoke-api-key-warning-alert"
          style={{ marginBottom: '1rem' }}
        >
          Revoking this API key will immediately and permanently invalidate it. Any applications or
          services currently using this key will lose access.
        </Alert>

        <Content component={ContentVariants.p}>
          Are you sure you want to revoke the API key <strong>{apiKey.name}</strong>?
        </Content>

        <Content
          component={ContentVariants.p}
          style={{ marginTop: '0.5rem', color: 'var(--pf-t--global--text--color--subtle)' }}
        >
          The key will remain visible with an Expired status but can no longer be used for
          authentication.
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="danger"
          onClick={handleConfirm}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          id="revoke-key-confirm-button"
        >
          Revoke
        </Button>
        <Button variant="link" onClick={onClose} id="revoke-key-cancel-button">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { RevokeAPIKeyModal };
