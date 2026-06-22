import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

interface RevokeAllByFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  targetUsername: string;
  activeKeyCount: number;
}

const RevokeAllByFilterModal: React.FunctionComponent<RevokeAllByFilterModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetUsername,
  activeKeyCount,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    if (activeKeyCount === 0) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onConfirm();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      id="revoke-all-by-filter-modal"
      aria-labelledby="revoke-all-by-filter-modal-title"
    >
      <ModalHeader
        title={`Revoke all active keys for ${targetUsername}?`}
        titleIconVariant="warning"
        labelId="revoke-all-by-filter-modal-title"
      />
      <ModalBody>
        <Content component={ContentVariants.p}>
          All {activeKeyCount} active API key{activeKeyCount !== 1 ? 's' : ''} for
          {' '}<strong>{targetUsername}</strong> will be permanently invalidated. Applications or
          services using these keys will immediately lose access.
        </Content>

        <Content
          component={ContentVariants.p}
          style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
        >
          This action cannot be undone. Revoked keys will remain visible with a Revoked status
          but can no longer be used for authentication.
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="danger"
          onClick={handleConfirm}
          isLoading={isSubmitting}
          isDisabled={isSubmitting || activeKeyCount === 0}
          id="revoke-all-by-filter-confirm-button"
        >
          Permanently revoke {activeKeyCount} key{activeKeyCount !== 1 ? 's' : ''}
        </Button>
        <Button variant="link" onClick={onClose} id="revoke-all-by-filter-cancel-button">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { RevokeAllByFilterModal };
