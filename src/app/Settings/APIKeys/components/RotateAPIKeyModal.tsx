import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  InputGroup,
  InputGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { CheckIcon, CopyIcon, EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { APIKey } from '../types';

interface RotateAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: APIKey | null;
  onRotate: (apiKey: APIKey, newKeyValue: string) => void;
}

const RotateAPIKeyModal: React.FunctionComponent<RotateAPIKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onRotate,
}) => {
  const [isRotating, setIsRotating] = React.useState(false);
  const [showKeyDisplay, setShowKeyDisplay] = React.useState(false);
  const [generatedKey, setGeneratedKey] = React.useState('');
  const [isKeyVisible, setIsKeyVisible] = React.useState(false);
  const [isKeyCopied, setIsKeyCopied] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setIsRotating(false);
      setShowKeyDisplay(false);
      setGeneratedKey('');
      setIsKeyVisible(false);
      setIsKeyCopied(false);
    }
  }, [isOpen]);

  const generateAPIKey = (): string => {
    const prefix = 'sk-';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < 48; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const getMaskedKey = (key: string): string => {
    if (key.length <= 6) return key;
    return key.substring(0, 6) + '•'.repeat(key.length - 6);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setIsKeyCopied(true);
    setTimeout(() => setIsKeyCopied(false), 2000);
  };

  const handleRotateConfirm = async () => {
    if (!apiKey) return;
    setIsRotating(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newKey = generateAPIKey();
    setGeneratedKey(newKey);
    setShowKeyDisplay(true);
    setIsRotating(false);
    onRotate(apiKey, newKey);
  };

  const handleClose = () => {
    onClose();
  };

  if (!apiKey) return null;

  const formatDate = (date?: Date): string => {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (showKeyDisplay) {
    return (
      <Modal
        id="rotate-api-key-success-modal"
        variant={ModalVariant.medium}
        isOpen={isOpen}
        onClose={handleClose}
        aria-labelledby="rotate-api-key-success-title"
      >
        <ModalHeader title="Rotate API key" labelId="rotate-api-key-success-title" />
        <ModalBody>
          <Alert
            id="rotate-api-key-success-alert"
            variant="success"
            isInline
            title="New API key generated"
            style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}
          >
            Your previous key has been revoked. Copy your new key now — this is the only time it
            will be available.
          </Alert>

          <Content component={ContentVariants.h4} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
            Your new API key
          </Content>
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                readOnly
                type="text"
                id="rotated-api-key-display"
                value={isKeyVisible ? generatedKey : getMaskedKey(generatedKey)}
                style={{ backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}
              />
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant="control"
                aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                id="rotate-toggle-key-visibility-button"
              >
                {isKeyVisible ? <EyeSlashIcon /> : <EyeIcon />}
              </Button>
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant="control"
                aria-label={isKeyCopied ? 'Copied' : 'Copy to clipboard'}
                onClick={handleCopyKey}
                id="rotate-copy-api-key-button"
              >
                {isKeyCopied ? (
                  <CheckIcon color="var(--pf-t--global--icon--color--status--success--default)" />
                ) : (
                  <CopyIcon />
                )}
              </Button>
            </InputGroupItem>
          </InputGroup>

          <Content
            component={ContentVariants.h4}
            style={{
              marginTop: 'var(--pf-t--global--spacer--lg)',
              marginBottom: 'var(--pf-t--global--spacer--sm)',
            }}
          >
            Key details
          </Content>
          <DescriptionList isHorizontal columnModifier={{ default: '1Col' }}>
            <DescriptionListGroup>
              <DescriptionListTerm>Name</DescriptionListTerm>
              <DescriptionListDescription>{apiKey.name}</DescriptionListDescription>
            </DescriptionListGroup>
            {apiKey.description && (
              <DescriptionListGroup>
                <DescriptionListTerm>Description</DescriptionListTerm>
                <DescriptionListDescription>{apiKey.description}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>Owner</DescriptionListTerm>
              <DescriptionListDescription>
                {apiKey.owner.type}: {apiKey.owner.name}
              </DescriptionListDescription>
            </DescriptionListGroup>
            {apiKey.subscriptionName && (
              <DescriptionListGroup>
                <DescriptionListTerm>Subscription</DescriptionListTerm>
                <DescriptionListDescription>{apiKey.subscriptionName}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>Expiration</DescriptionListTerm>
              <DescriptionListDescription>
                {formatDate(apiKey.limits?.expirationDate)}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </ModalBody>
        <ModalFooter>
          <Button
            id="rotate-key-close-button"
            variant="primary"
            onClick={handleClose}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal
      id="rotate-api-key-modal"
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="rotate-api-key-modal-title"
      aria-describedby="rotate-api-key-modal-description"
    >
      <ModalHeader title="Rotate API key" labelId="rotate-api-key-modal-title" />
      <ModalBody id="rotate-api-key-modal-description">
        <Alert
          id="rotate-api-key-warning-alert"
          variant="warning"
          title="The current key will be revoked"
          isInline
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          A new key will be generated with the same name, permissions, and configuration.
          The current key will be immediately revoked. Any applications using the current key will
          need to be updated with the new key.
        </Alert>

        <DescriptionList isHorizontal columnModifier={{ default: '1Col' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>Name</DescriptionListTerm>
            <DescriptionListDescription>{apiKey.name}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Owner</DescriptionListTerm>
            <DescriptionListDescription>
              {apiKey.owner.type}: {apiKey.owner.name}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Expiration</DescriptionListTerm>
            <DescriptionListDescription>
              {formatDate(apiKey.limits?.expirationDate)}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </ModalBody>
      <ModalFooter>
        <Button
          id="confirm-rotate-button"
          variant="primary"
          onClick={handleRotateConfirm}
          isLoading={isRotating}
          isDisabled={isRotating}
        >
          {isRotating ? 'Rotating...' : 'Rotate key'}
        </Button>
        <Button
          id="cancel-rotate-button"
          variant="link"
          onClick={handleClose}
          isDisabled={isRotating}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { RotateAPIKeyModal };
