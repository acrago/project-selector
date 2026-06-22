import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModalFromURL } from '@app/utils/useModalFromURL';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertVariant,
  Badge,
  Button,
  Content,
  ContentVariants,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  PageSection,
  Pagination,
  Popover,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { EllipsisVIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { APIKeysIcon } from '@app/Home/icons';
import { mockAPIKeysAIEngineer, mockAPIKeysAdmin } from './mockData';
import { APIKey, APIKeyStatus } from './types';
import { CreateAPIKeyModal, RevokeAPIKeyModal } from './components';
import { useUserProfile } from '@app/utils/UserProfileContext';
import { useVariantFlags } from '@app/utils/VariantFlagsContext';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { APIKeysV34 } from './APIKeysV34';
import { APIKeysV34Checkboxes } from './APIKeysV34Checkboxes';

const ALL_STATUSES: APIKeyStatus[] = ['Active', 'Expired', 'Disabled', 'Inactive', 'AdminRevoked'];
const DEFAULT_VISIBLE_STATUSES: APIKeyStatus[] = ['Active', 'Expired', 'Disabled', 'Inactive', 'AdminRevoked'];

const APIKeysCurrent: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const { isVariantFlagEnabled } = useVariantFlags();
  const showSubscriptions = isVariantFlagEnabled('apiKeys', 'showSubscriptions');
  const isAdmin = userProfile === 'AI Admin';
  
  // Use different mock data based on user profile
  const initialApiKeys = isAdmin ? mockAPIKeysAdmin : mockAPIKeysAIEngineer;
  const [apiKeys, setApiKeys] = React.useState<APIKey[]>(initialApiKeys);
  
  // Update API keys when user profile changes
  React.useEffect(() => {
    setApiKeys(isAdmin ? mockAPIKeysAdmin : mockAPIKeysAIEngineer);
  }, [isAdmin]);
  const { isOpen: isCreateModalOpen, open: openCreateModal, close: closeCreateModal } = useModalFromURL('create');
  const [isRevokeModalOpen, setIsRevokeModalOpen] = React.useState(false);
  const [selectedAPIKeyForRevoke, setSelectedAPIKeyForRevoke] = React.useState<APIKey | null>(null);
  const [openKebabMenus, setOpenKebabMenus] = React.useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = React.useState('');
  
  // Status filter state (default: hide Expired/revoked keys)
  const [statusFilters, setStatusFilters] = React.useState<Set<APIKeyStatus>>(new Set(DEFAULT_VISIBLE_STATUSES));
  const [isStatusFilterOpen, setIsStatusFilterOpen] = React.useState(false);
  
  // Pagination state
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  
  // Toast alerts state
  const [toastAlerts, setToastAlerts] = React.useState<React.ReactElement[]>([]);
  
  // Sorting state
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Sort handler
  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex ?? undefined,
      direction: activeSortDirection,
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  // Filter and sort API keys
  const filteredApiKeys = React.useMemo(() => {
    let result = apiKeys;
    
    // Apply status filter
    if (statusFilters.size < ALL_STATUSES.length) {
      result = result.filter((apiKey) => statusFilters.has(apiKey.status));
    }
    
    // Apply search filter
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter((apiKey) => {
        return (
          apiKey.name.toLowerCase().includes(searchLower) ||
          (apiKey.description && apiKey.description.toLowerCase().includes(searchLower)) ||
          apiKey.owner.name.toLowerCase().includes(searchLower) ||
          (apiKey.subscriptionName && apiKey.subscriptionName.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Apply sorting
    if (activeSortIndex !== null) {
      result = [...result].sort((a, b) => {
        let aValue: string | number | Date | undefined;
        let bValue: string | number | Date | undefined;
        
        switch (activeSortIndex) {
          case 0:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 1:
            aValue = a.status.toLowerCase();
            bValue = b.status.toLowerCase();
            break;
          case 2:
            aValue = a.owner.name.toLowerCase();
            bValue = b.owner.name.toLowerCase();
            break;
          case 3:
            if (showSubscriptions) {
              aValue = (a.subscriptionName || '').toLowerCase();
              bValue = (b.subscriptionName || '').toLowerCase();
            } else {
              aValue = a.dateCreated.getTime();
              bValue = b.dateCreated.getTime();
            }
            break;
          case 4:
            if (showSubscriptions) {
              aValue = a.dateCreated.getTime();
              bValue = b.dateCreated.getTime();
            } else {
              aValue = a.limits?.expirationDate?.getTime() ?? Infinity;
              bValue = b.limits?.expirationDate?.getTime() ?? Infinity;
            }
            break;
          case 5:
            if (showSubscriptions) {
              aValue = a.limits?.expirationDate?.getTime() ?? Infinity;
              bValue = b.limits?.expirationDate?.getTime() ?? Infinity;
            } else {
              aValue = a.dateLastUsed?.getTime() ?? 0;
              bValue = b.dateLastUsed?.getTime() ?? 0;
            }
            break;
          case 6:
            if (showSubscriptions) {
              aValue = a.dateLastUsed?.getTime() ?? 0;
              bValue = b.dateLastUsed?.getTime() ?? 0;
            }
            break;
          default:
            return 0;
        }
        
        if (aValue === undefined || bValue === undefined) return 0;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return activeSortDirection === 'asc' ? comparison : -comparison;
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return activeSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }
    
    return result;
  }, [apiKeys, searchValue, statusFilters, activeSortIndex, activeSortDirection, showSubscriptions]);

  // Paginated keys
  const paginatedApiKeys = React.useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return filteredApiKeys.slice(startIndex, startIndex + perPage);
  }, [filteredApiKeys, page, perPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilters]);

  const onSearchChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setSearchValue(value);
  };

  const onSearchClear = () => {
    setSearchValue('');
  };

  const toggleKebabMenu = (id: string) => {
    setOpenKebabMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusLabel = (status: APIKeyStatus) => {
    const statusMap: Record<APIKeyStatus, { color: 'green' | 'red' | 'grey' | 'orange' | 'purple'; label: string }> = {
      Active: { color: 'green', label: 'Active' },
      Expired: { color: 'red', label: 'Expired' },
      Disabled: { color: 'grey', label: 'Disabled' },
      Inactive: { color: 'orange', label: 'Inactive' },
      AdminRevoked: { color: 'purple', label: 'Admin revoked' },
    };
    const { color, label } = statusMap[status];
    
    if (status === 'AdminRevoked') {
      return (
        <Popover
          aria-label="Admin revoked status information"
          headerContent="Admin revoked API key"
          bodyContent="This API key has been revoked by an administrator. Only an administrator can restore it."
        >
          <Label 
            id={`status-${status.toLowerCase()}`} 
            color={color}
            style={{ cursor: 'pointer' }}
          >
            {label}
          </Label>
        </Popover>
      );
    }
    
    return <Label id={`status-${status.toLowerCase()}`} color={color}>{label}</Label>;
  };

  const formatCreationDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatExpirationDate = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatLastUsedDate = (date?: Date): string => {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isInactiveMoreThan30Days = (date?: Date): boolean => {
    if (!date) return false;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  };

  const handleRowClick = (keyId: string) => {
    navigate(`/gen-ai-studio/api-keys/${keyId}`);
  };

  const removeToastAlert = (alertKey: React.Key) => {
    setToastAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.key !== alertKey));
  };

  const handleRevokeAPIKey = (apiKey: APIKey) => {
    setSelectedAPIKeyForRevoke(apiKey);
    setIsRevokeModalOpen(true);
  };

  const handleRevokeConfirmed = (apiKey: APIKey) => {
    setApiKeys((prevKeys) =>
      prevKeys.map((key) => {
        if (key.id === apiKey.id) {
          return { ...key, status: 'Expired' as APIKeyStatus };
        }
        return key;
      })
    );
    
    const alertKey = `revoke-alert-${Date.now()}`;
    const newAlert = (
      <Alert
        id={`api-key-revoked-toast-${apiKey.id}`}
        variant={AlertVariant.success}
        title={`API key "${apiKey.name}" revoked`}
        timeout
        actionClose={
          <AlertActionCloseButton
            id={`close-revoke-toast-${apiKey.id}`}
            onClose={() => removeToastAlert(alertKey)}
          />
        }
        onTimeout={() => removeToastAlert(alertKey)}
        key={alertKey}
      />
    );
    setToastAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
  };

  const handleStatusFilterSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    const status = value as APIKeyStatus;
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const handleCreateAPIKey = () => {
    openCreateModal();
  };

  return (
    <PageSection>
      <AlertGroup isToast isLiveRegion hasAnimations id="api-keys-toast-alert-group">
        {toastAlerts}
      </AlertGroup>
      <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <APIKeysIcon withBackground size={24} />
        </FlexItem>
        <FlexItem>
          <Content component={ContentVariants.h1} id="api-keys-page-title">API keys</Content>
        </FlexItem>
      </Flex>
      <Content component={ContentVariants.p}>
        Manage API keys that can be used to access AI asset endpoints.
      </Content>
      
      <Toolbar id="api-keys-toolbar" style={{ marginTop: '1rem' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <Select
                id="api-keys-status-filter"
                isOpen={isStatusFilterOpen}
                selected={Array.from(statusFilters)}
                onSelect={handleStatusFilterSelect}
                onOpenChange={(isOpen) => setIsStatusFilterOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                    isExpanded={isStatusFilterOpen}
                    id="api-keys-status-filter-toggle"
                  >
                    Status
                    {statusFilters.size < ALL_STATUSES.length && (
                      <Badge isRead id="status-filter-badge" style={{ marginLeft: '0.5rem' }}>
                        {statusFilters.size}
                      </Badge>
                    )}
                  </MenuToggle>
                )}
              >
                <SelectList id="api-keys-status-filter-list">
                  {ALL_STATUSES.map((status) => (
                    <SelectOption
                      key={status}
                      value={status}
                      hasCheckbox
                      isSelected={statusFilters.has(status)}
                      id={`status-filter-option-${status.toLowerCase()}`}
                    >
                      {status === 'AdminRevoked' ? 'Admin revoked' : status}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
            <ToolbarItem style={{ width: '300px' }}>
              <SearchInput
                id="api-keys-search"
                aria-label="Filter API keys"
                placeholder="Filter by keyword"
                value={searchValue}
                onChange={onSearchChange}
                onClear={onSearchClear}
              />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem>
            <Button 
              variant="primary" 
              onClick={handleCreateAPIKey}
              id="create-api-key-button"
            >
              Create API key
            </Button>
          </ToolbarItem>
          <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={filteredApiKeys.length}
              perPage={perPage}
              page={page}
              onSetPage={(_event, newPage) => setPage(newPage)}
              onPerPageSelect={(_event, newPerPage) => {
                setPerPage(newPerPage);
                setPage(1);
              }}
              perPageOptions={[
                { title: '10', value: 10 },
                { title: '20', value: 20 },
                { title: '50', value: 50 },
              ]}
              id="api-keys-pagination-top"
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="API Keys table" id="api-keys-table">
            <Thead>
              <Tr>
                <Th sort={getSortParams(0)}>Name</Th>
                <Th sort={getSortParams(1)}>Status</Th>
                <Th sort={getSortParams(2)}>Owner</Th>
                {showSubscriptions && <Th sort={getSortParams(3)}>Subscription</Th>}
                <Th sort={getSortParams(showSubscriptions ? 4 : 3)}>Created</Th>
                <Th sort={getSortParams(showSubscriptions ? 5 : 4)}>Expiration</Th>
                <Th sort={getSortParams(showSubscriptions ? 6 : 5)}>Last invoked</Th>
                <Th screenReaderText="Actions" />
              </Tr>
            </Thead>
            <Tbody>
              {paginatedApiKeys.map((apiKey) => (
                <Tr key={apiKey.id}>
                  <Td dataLabel="Name">
                    <div>
                      <Button 
                        variant="link" 
                        isInline 
                        onClick={() => handleRowClick(apiKey.id)}
                        id={`api-key-link-${apiKey.id}`}
                      >
                        {apiKey.name}
                      </Button>
                      {apiKey.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {apiKey.description}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td dataLabel="Status">
                    {getStatusLabel(apiKey.status)}
                  </Td>
                  <Td dataLabel="Owner">
                    {apiKey.owner.type === 'Service Account' 
                      ? `Service Account: ${apiKey.owner.name}`
                      : isAdmin 
                        ? `User: ${apiKey.owner.name}`
                        : apiKey.owner.name
                    }
                  </Td>
                  {showSubscriptions && (
                    <Td dataLabel="Subscription">
                      {apiKey.subscriptionName || (
                        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>—</span>
                      )}
                    </Td>
                  )}
                  <Td dataLabel="Created">
                    {formatCreationDate(apiKey.dateCreated)}
                  </Td>
                  <Td dataLabel="Expiration">
                    {apiKey.limits?.expirationDate ? (
                      formatExpirationDate(apiKey.limits.expirationDate)
                    ) : (
                      <Popover
                        aria-label="No expiration warning"
                        headerContent="No expiration set"
                        bodyContent="This API key has no expiration date and will remain active indefinitely. Consider setting an expiration date for security purposes."
                      >
                        <Button
                          variant="link"
                          isInline
                          id={`no-expiration-warning-${apiKey.id}`}
                          icon={<ExclamationTriangleIcon color="var(--pf-t--global--icon--color--status--warning--default)" />}
                          style={{ textDecoration: 'none' }}
                        >
                          Never
                        </Button>
                      </Popover>
                    )}
                  </Td>
                  <Td dataLabel="Last invoked">
                    {isInactiveMoreThan30Days(apiKey.dateLastUsed) && apiKey.status !== 'Expired' ? (
                      <Popover
                        aria-label="Inactive key warning"
                        headerContent="Inactive API key"
                        bodyContent="This API key has not been invoked in more than 30 days. Consider deleting it if it's no longer being used."
                      >
                        <Button
                          variant="link"
                          isInline
                          id={`inactive-warning-${apiKey.id}`}
                          icon={<ExclamationTriangleIcon color="var(--pf-t--global--icon--color--status--warning--default)" />}
                          style={{ textDecoration: 'none' }}
                        >
                          {formatLastUsedDate(apiKey.dateLastUsed)}
                        </Button>
                      </Popover>
                    ) : (
                      formatLastUsedDate(apiKey.dateLastUsed)
                    )}
                  </Td>
                  <Td isActionCell>
                    <Dropdown
                      isOpen={openKebabMenus.has(apiKey.id)}
                      onOpenChange={(isOpen) => {
                        if (!isOpen) {
                          setOpenKebabMenus((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(apiKey.id);
                            return newSet;
                          });
                        }
                      }}
                      popperProps={{ position: 'right' }}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => toggleKebabMenu(apiKey.id)}
                          variant="plain"
                          aria-label={`Actions for ${apiKey.name}`}
                          isExpanded={openKebabMenus.has(apiKey.id)}
                          id={`api-key-actions-${apiKey.id}`}
                        >
                          <EllipsisVIcon />
                        </MenuToggle>
                      )}
                    >
                      <DropdownList>
                        <DropdownItem
                          key="revoke"
                          onClick={() => {
                            handleRevokeAPIKey(apiKey);
                            toggleKebabMenu(apiKey.id);
                          }}
                          id={`revoke-key-${apiKey.id}`}
                          isDisabled={apiKey.status === 'Expired'}
                          isDanger
                        >
                          Revoke
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

      <Pagination
        itemCount={filteredApiKeys.length}
        perPage={perPage}
        page={page}
        onSetPage={(_event, newPage) => setPage(newPage)}
        onPerPageSelect={(_event, newPerPage) => {
          setPerPage(newPerPage);
          setPage(1);
        }}
        perPageOptions={[
          { title: '10', value: 10 },
          { title: '20', value: 20 },
          { title: '50', value: 50 },
        ]}
        variant="bottom"
        id="api-keys-pagination-bottom"
      />

      <CreateAPIKeyModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
      />

      <RevokeAPIKeyModal
        isOpen={isRevokeModalOpen}
        onClose={() => {
          setIsRevokeModalOpen(false);
          setSelectedAPIKeyForRevoke(null);
        }}
        apiKey={selectedAPIKeyForRevoke}
        onConfirm={handleRevokeConfirmed}
      />
    </PageSection>
  );
};

const APIKeys: React.FunctionComponent = () => {
  const { apiKeysVariation } = useFeatureFlags();

  if (apiKeysVariation === 'v34') {
    return <APIKeysV34 key="v34" simulateExpiryServerError={90} />;
  }

  if (apiKeysVariation === 'v34-models-flat') {
    return <APIKeysV34 key="v34-models-flat" simulateExpiryServerError={90} modelDisplayStyle="flat" />;
  }

  if (apiKeysVariation === 'v34-models-table') {
    return <APIKeysV34 key="v34-models-table" simulateExpiryServerError={90} modelDisplayStyle="table" />;
  }

  if (apiKeysVariation === 'v34-expiry-limit') {
    return <APIKeysV34 key="v34-expiry-limit" maxExpirationDays={90} />;
  }

  if (apiKeysVariation === 'v34-expiry-fallback') {
    return <APIKeysV34 key="v34-expiry-fallback" simulateExpiryServerError={90} />;
  }

  if (apiKeysVariation === 'v34-scroll-preview') {
    return <APIKeysV34 key="v34-scroll-preview" revokePreviewMode="scrollable" />;
  }

  if (apiKeysVariation === 'v34-revoke-filter') {
    return <APIKeysV34 key="v34-revoke-filter" />;
  }

  if (apiKeysVariation === 'v34-checkboxes') {
    return <APIKeysV34Checkboxes />;
  }

  return <APIKeysCurrent />;
};

export { APIKeys };