import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  PageSection,
} from '@patternfly/react-core';
import { APIKey } from '../types';
import { DeleteAPIKeyModal } from './DeleteAPIKeyModal';
import { RotateAPIKeyModal } from './RotateAPIKeyModal';

interface APIKeySettingsTabProps {
  apiKey: APIKey;
}

const APIKeySettingsTab: React.FunctionComponent<APIKeySettingsTabProps> = ({ apiKey }) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isRotateModalOpen, setIsRotateModalOpen] = React.useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    navigate('/gen-ai-studio/api-keys');
  };

  const handleRotateClick = () => {
    setIsRotateModalOpen(true);
  };

  const handleRotateConfirm = () => {
    // Key has been rotated — in a real app, the detail page would refetch
  };

  return (
    <>
      <PageSection>
        <Content component={ContentVariants.h2} id="settings-heading" style={{ marginTop: '1rem' }}>
          Settings
        </Content>
        <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
          Manage settings for this API key.
        </div>

        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <Alert
              id="rotate-key-alert"
              variant="warning"
              isInline
              title="Rotate API key"
              actionLinks={
                <Button
                  id="rotate-api-key-button"
                  variant="secondary"
                  onClick={handleRotateClick}
                  isDisabled={apiKey.status === 'Expired' || apiKey.status === 'AdminRevoked'}
                >
                  Rotate key
                </Button>
              }
            >
              Generate a new key while keeping the same name, permissions, and configuration. The current key will be immediately revoked.
            </Alert>
          </FlexItem>
          <FlexItem>
            <Alert
              id="danger-zone-alert"
              variant="danger"
              isInline
              title="Delete API key"
              actionLinks={
                <Button 
                  id="delete-api-key-button"
                  variant="danger"
                  onClick={handleDeleteClick}
                >
                  Delete API key
                </Button>
              }
            >
              Permanently delete this API key. This action cannot be undone and will immediately revoke access for any applications using this key.
            </Alert>
          </FlexItem>
        </Flex>
      </PageSection>

      <DeleteAPIKeyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        apiKey={apiKey}
        onDelete={handleDeleteConfirm}
      />

      <RotateAPIKeyModal
        isOpen={isRotateModalOpen}
        onClose={() => setIsRotateModalOpen(false)}
        apiKey={apiKey}
        onRotate={handleRotateConfirm}
      />
    </>
  );
};

export { APIKeySettingsTab };
