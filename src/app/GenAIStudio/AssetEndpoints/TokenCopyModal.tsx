import React from 'react';
import {
  Button,
  CodeBlock,
  CodeBlockCode,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Title
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';

interface TokenCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenType: string;
  token: string;
}

export const TokenCopyModal: React.FC<TokenCopyModalProps> = ({
  isOpen,
  onClose,
  tokenType,
  token
}) => {
  return (
    <Modal
      variant={ModalVariant.small}
      title="Token Copied"
      isOpen={isOpen}
      onClose={onClose}
      id="token-copy-modal"
    >
      <ModalHeader>
        <Title headingLevel="h2" size="xl" id="token-copy-title">
          <CheckCircleIcon className="pf-v5-u-mr-sm pf-v5-u-success-color-100" />
          {tokenType} Copied
        </Title>
      </ModalHeader>
      <ModalBody>
        <div className="pf-v5-u-mb-md">
          The {tokenType.toLowerCase()} has been copied to your clipboard.
        </div>
        <CodeBlock>
          <CodeBlockCode id="token-code-block">{token}</CodeBlockCode>
        </CodeBlock>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose} id="token-copy-close-button">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

