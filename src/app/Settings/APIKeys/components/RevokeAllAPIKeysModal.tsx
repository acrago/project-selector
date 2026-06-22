import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ApiKeyV34 } from '../typesV34';

export type RevokePreviewMode = 'capped' | 'scrollable';

const PREVIEW_CAP = 10;

interface RevokeAllAPIKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (username: string) => void;
  allKeys: ApiKeyV34[];
  isAdmin: boolean;
  currentUsername: string;
  previewMode?: RevokePreviewMode;
}

const RevokeAllAPIKeysModal: React.FunctionComponent<RevokeAllAPIKeysModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  allKeys,
  isAdmin,
  currentUsername,
  previewMode = 'capped',
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [searchedUsername, setSearchedUsername] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);

  const targetUsername = isAdmin ? searchedUsername : currentUsername;

  const matchingKeys = React.useMemo(() => {
    if (!targetUsername) return [];
    return allKeys.filter(
      (k) => k.username.toLowerCase() === targetUsername.toLowerCase(),
    );
  }, [allKeys, targetUsername]);

  const handleSearchKeys = () => {
    setSearchedUsername(username.trim());
    setShowAll(false);
  };

  const activeKeys = React.useMemo(() => {
    return [...matchingKeys]
      .filter((k) => k.status === 'active')
      .sort((a, b) => {
        const aTime = a.lastUsedAt?.getTime() ?? 0;
        const bTime = b.lastUsedAt?.getTime() ?? 0;
        return bTime - aTime;
      });
  }, [matchingKeys]);

  const isCapped = previewMode === 'capped' && !showAll;
  const displayedKeys = isCapped
    ? activeKeys.slice(0, PREVIEW_CAP)
    : activeKeys;

  const remainingCount = activeKeys.length - (isCapped ? PREVIEW_CAP : activeKeys.length);

  const isConfirmEnabled = isAdmin
    ? searchedUsername.length > 0 && activeKeys.length > 0
    : username.trim().toLowerCase() === currentUsername.toLowerCase();

  const handleConfirm = async () => {
    if (!isConfirmEnabled) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onConfirm(targetUsername);
    setIsSubmitting(false);
    setUsername('');
    onClose();
  };

  const handleClose = () => {
    setUsername('');
    setSearchedUsername('');
    setShowAll(false);
    onClose();
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusLabel = (status: string) => {
    const colorMap: Record<string, 'green' | 'red' | 'purple'> = {
      active: 'green',
      expired: 'red',
      revoked: 'purple',
    };
    return (
      <Label color={colorMap[status] || 'grey'} isCompact id={`revoke-modal-status-${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Label>
    );
  };

  const keysTable = (
    <Table
      aria-label={`API keys for ${searchedUsername}`}
      variant="compact"
      id="revoke-modal-keys-table"
    >
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Status</Th>
          <Th>Last used</Th>
          <Th>Expiration</Th>
        </Tr>
      </Thead>
      <Tbody>
        {displayedKeys.map((key) => (
          <Tr key={key.id}>
            <Td dataLabel="Name">{key.name}</Td>
            <Td dataLabel="Status">{getStatusLabel(key.status)}</Td>
            <Td dataLabel="Last used">{formatDate(key.lastUsedAt)}</Td>
            <Td dataLabel="Expiration">{key.expirationDate ? formatDate(key.expirationDate) : 'Never'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={handleClose}
      id="revoke-all-api-keys-modal"
      aria-labelledby="revoke-all-api-keys-modal-title"
    >
      <ModalHeader
        title={isAdmin ? 'Revoke all active keys for a single user?' : 'Revoke all your active keys?'}
        titleIconVariant="warning"
        labelId="revoke-all-api-keys-modal-title"
      />
      <ModalBody>
        <Content component={ContentVariants.p}>
          {isAdmin
            ? 'Enter a username to view their API keys. All active keys for this user will be permanently invalidated. This action cannot be undone.'
            : 'All of your active API keys will be permanently invalidated. Applications or services using these keys will immediately lose access.'}
        </Content>

        <Content
          component={ContentVariants.p}
          style={{ color: 'var(--pf-t--global--text--color--subtle)' }}
        >
          Revoked keys will remain visible with a Revoked status but can no longer be used for authentication.
        </Content>

        <Form id="revoke-all-form">
          <FormGroup
            label={isAdmin ? 'Enter username to revoke their keys' : `Type "${currentUsername}" to confirm`}
            isRequired
            fieldId="revoke-all-username"
          >
            {isAdmin ? (
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    isRequired
                    type="text"
                    id="revoke-all-username"
                    value={username}
                    onChange={(_event, value) => setUsername(value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchKeys();
                      }
                    }}
                    placeholder="Enter username"
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <Button
                    variant="control"
                    aria-label="Search keys"
                    onClick={handleSearchKeys}
                    isDisabled={!username.trim()}
                    id="revoke-modal-search-button"
                  >
                    <SearchIcon />
                  </Button>
                </InputGroupItem>
              </InputGroup>
            ) : (
              <TextInput
                isRequired
                type="text"
                id="revoke-all-username"
                value={username}
                onChange={(_event, value) => setUsername(value)}
                placeholder={currentUsername}
              />
            )}
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  {isAdmin
                    ? searchedUsername
                      ? activeKeys.length > 0
                        ? `${activeKeys.length} active key(s) found for ${searchedUsername}`
                        : `No active keys found for "${searchedUsername}"`
                      : 'Enter a username and click search to view their keys'
                    : username.trim().toLowerCase() === currentUsername.toLowerCase()
                      ? 'All your active keys will be permanently revoked'
                      : 'Type your username exactly to confirm'}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </Form>

        {isAdmin && activeKeys.length > 0 && (
          <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
            <Content component={ContentVariants.h4} id="revoke-modal-keys-heading">
              {isCapped
                ? `Most recently used active keys for ${searchedUsername}`
                : `All active keys for ${searchedUsername}`}
            </Content>

            {showAll || previewMode === 'scrollable' ? (
              <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
                {keysTable}
              </div>
            ) : (
              keysTable
            )}

            {previewMode === 'capped' && remainingCount > 0 && !showAll && (
              <Button
                variant="link"
                isInline
                onClick={() => setShowAll(true)}
                id="revoke-modal-show-all-button"
                style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
              >
                Show all {activeKeys.length} active keys
              </Button>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          variant="danger"
          onClick={handleConfirm}
          isLoading={isSubmitting}
          isDisabled={isSubmitting || !isConfirmEnabled}
          id="revoke-all-confirm-button"
        >
          Permanently revoke all keys
        </Button>
        <Button variant="link" onClick={handleClose} id="revoke-all-cancel-button">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { RevokeAllAPIKeysModal };
