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

interface DisableAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: APIKey | null;
  onConfirm: (apiKey: APIKey) => void;
}

const DisableAPIKeyModal: React.FunctionComponent<DisableAPIKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    if (!apiKey) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onConfirm(apiKey);
    setIsSubmitting(false);
    onClose();
  };

  if (!apiKey) return null;

  return (
    <Modal
      variant={ModalVariant.small}
      title="Disable API key"
      isOpen={isOpen}
      onClose={onClose}
      id="disable-api-key-modal"
    >
      <ModalHeader title="Disable API key" />
      <ModalBody>
        <Alert
          variant="warning"
          isInline
          title="This action may affect running applications"
          customIcon={<ExclamationTriangleIcon />}
          style={{ marginBottom: '1rem' }}
        >
          Any applications or services currently using this API key will lose access immediately.
        </Alert>

        <Content component={ContentVariants.p}>
          Are you sure you want to disable the API key <strong>{apiKey.name}</strong>?
        </Content>

        <Content component={ContentVariants.p} style={{ marginTop: '0.5rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
          You can re-enable this key at any time from the API keys list.
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleConfirm}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
          id="disable-key-confirm-button"
        >
          Disable
        </Button>
        <Button variant="link" onClick={onClose} id="disable-key-cancel-button">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DisableAPIKeyModal };
