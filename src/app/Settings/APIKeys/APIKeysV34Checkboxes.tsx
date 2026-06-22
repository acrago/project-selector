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
import { EllipsisVIcon } from '@patternfly/react-icons';
import { APIKeysIcon } from '@app/Home/icons';
import { mockApiKeysAdminV34, mockApiKeysEngineerV34 } from './mockDataV34';
import { ApiKeyStatusV34, ApiKeyV34 } from './typesV34';
import { CreateAPIKeyModalV34 } from './components/CreateAPIKeyModalV34';
import { useUserProfile } from '@app/utils/UserProfileContext';
import { addDynamicKey, getDynamicKeys } from './apiKeysStoreV34';

const ALL_STATUSES: ApiKeyStatusV34[] = ['active', 'revoked', 'expired'];
const DEFAULT_VISIBLE_STATUSES: ApiKeyStatusV34[] = ['active'];

const USERNAMES = ['abraren', 'ngrambich', 'cschumer', 'jsmith', 'mwilliams', 'klee', 'celtan', 'datascientist'];
const KEY_NAMES = [
  'Dev Testing', 'Staging Pipeline', 'Prod Inference', 'Batch Processing', 'Demo Key',
  'Internal Tool', 'Monitoring Agent', 'Load Testing', 'Sandbox', 'Integration Test',
  'Feature Preview', 'Training Runner', 'Data Export', 'Webhook Handler', 'Dashboard',
  'Alerting Service', 'CI Build', 'Model Eval', 'RAG Pipeline', 'Chatbot Backend',
  'Search Indexer', 'Embeddings Worker', 'Fine-tune Job', 'Gateway Proxy', 'Analytics',
  'Backup Service', 'Notification Bot', 'Log Collector', 'Cost Tracker', 'Health Check',
];
const STATUSES: ApiKeyStatusV34[] = ['active', 'active', 'active', 'active', 'active', 'revoked', 'expired'];

const generateExtraKeys = (count: number, startId: number): ApiKeyV34[] => {
  return Array.from({ length: count }, (_, i) => {
    const idx = startId + i;
    const status = STATUSES[idx % STATUSES.length];
    const created = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const expDays = [90, 180, 365, 0][idx % 4];
    const expiration = expDays ? new Date(created.getTime() + expDays * 86400000) : undefined;
    return {
      id: `key-gen-${idx}`,
      name: KEY_NAMES[idx % KEY_NAMES.length],
      description: idx % 3 === 0 ? `Auto-generated key #${idx}` : undefined,
      username: USERNAMES[idx % USERNAMES.length],
      keyPrefix: `sk-oai-g${String(idx).padStart(2, '0')}`,
      creationDate: created,
      expirationDate: expiration,
      status,
      lastUsedAt: status === 'active' ? new Date(Date.now() - Math.random() * 30 * 86400000) : undefined,
    };
  });
};

const APIKeysV34Checkboxes: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const isAdmin = userProfile === 'AI Admin';

  const getInitialKeys = React.useCallback(() => {
    const mock = isAdmin ? mockApiKeysAdminV34 : mockApiKeysEngineerV34;
    const base = [...getDynamicKeys(), ...mock];
    const extraCount = Math.max(0, 40 - base.length);
    return [...base, ...generateExtraKeys(extraCount, 100)];
  }, [isAdmin]);

  const [apiKeys, setApiKeys] = React.useState<ApiKeyV34[]>(getInitialKeys);

  React.useEffect(() => {
    setApiKeys(getInitialKeys());
  }, [getInitialKeys]);

  const { isOpen: isCreateModalOpen, open: openCreateModal, close: closeCreateModal } = useModalFromURL('create');
  const [isPageActionsOpen, setIsPageActionsOpen] = React.useState(false);
  const [openKebabMenus, setOpenKebabMenus] = React.useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = React.useState('');
  const [ownerFilter, setOwnerFilter] = React.useState('');

  // Row selection
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());

  // Status filter
  const [statusFilters, setStatusFilters] = React.useState<Set<ApiKeyStatusV34>>(new Set(DEFAULT_VISIBLE_STATUSES));
  const [isStatusFilterOpen, setIsStatusFilterOpen] = React.useState(false);

  // Pagination
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);

  // Toast alerts
  const [toastAlerts, setToastAlerts] = React.useState<React.ReactElement[]>([]);

  // Sorting
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc'>('desc');

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

  const filteredApiKeys = React.useMemo(() => {
    let result = apiKeys;

    if (statusFilters.size < ALL_STATUSES.length) {
      result = result.filter((key) => statusFilters.has(key.status));
    }

    if (isAdmin && ownerFilter.trim()) {
      const filterLower = ownerFilter.toLowerCase();
      result = result.filter((key) => key.username.toLowerCase().includes(filterLower));
    }

    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter((key) =>
        key.name.toLowerCase().includes(searchLower) ||
        (key.description && key.description.toLowerCase().includes(searchLower)) ||
        key.username.toLowerCase().includes(searchLower),
      );
    }

    if (activeSortIndex !== null) {
      result = [...result].sort((a, b) => {
        let aVal: string | number | undefined;
        let bVal: string | number | undefined;

        switch (activeSortIndex) {
          case 0: aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
          case 1: aVal = a.status; bVal = b.status; break;
          case 2: aVal = a.username.toLowerCase(); bVal = b.username.toLowerCase(); break;
          case 3: aVal = a.creationDate.getTime(); bVal = b.creationDate.getTime(); break;
          case 4: aVal = a.expirationDate?.getTime() ?? Infinity; bVal = b.expirationDate?.getTime() ?? Infinity; break;
          default: return 0;
        }

        if (aVal === undefined || bVal === undefined) return 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const cmp = aVal.localeCompare(bVal);
          return activeSortDirection === 'asc' ? cmp : -cmp;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return activeSortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  }, [apiKeys, searchValue, ownerFilter, isAdmin, statusFilters, activeSortIndex, activeSortDirection]);

  const paginatedApiKeys = React.useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredApiKeys.slice(start, start + perPage);
  }, [filteredApiKeys, page, perPage]);

  React.useEffect(() => {
    setPage(1);
  }, [searchValue, statusFilters, ownerFilter]);

  // Selection helpers
  const selectableOnPage = paginatedApiKeys.filter((k) => k.status === 'active');
  const allPageSelected = selectableOnPage.length > 0 && selectableOnPage.every((k) => selectedKeys.has(k.id));

  const handleSelectAll = (isSelected: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (isSelected) {
        selectableOnPage.forEach((k) => next.add(k.id));
      } else {
        selectableOnPage.forEach((k) => next.delete(k.id));
      }
      return next;
    });
  };

  const handleSelectRow = (id: string, isSelected: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (isSelected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const getCurrentUsername = (): string => {
    switch (userProfile) {
      case 'AI Admin': return 'admin';
      case 'AI Engineer': return 'celtan';
      case 'Data Scientist': return 'datascientist';
      default: return 'user';
    }
  };

  const handleKeyCreated = (newKey: ApiKeyV34) => {
    addDynamicKey(newKey);
    setApiKeys((prev) => [newKey, ...prev]);
    addToast(`API key "${newKey.name}" created`);
  };

  const toggleKebabMenu = (id: string) => {
    setOpenKebabMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const getStatusLabel = (status: ApiKeyStatusV34) => {
    const statusMap: Record<ApiKeyStatusV34, { color: 'green' | 'red' | 'purple'; label: string }> = {
      active: { color: 'green', label: 'Active' },
      expired: { color: 'red', label: 'Expired' },
      revoked: { color: 'purple', label: 'Revoked' },
    };
    const { color, label } = statusMap[status];

    if (status === 'revoked') {
      return (
        <Popover
          aria-label="Revoked status information"
          headerContent="Revoked API key"
          bodyContent="This API key has been revoked and can no longer be used for authentication."
        >
          <Label id={`status-cb-${status}`} color={color} style={{ cursor: 'pointer' }}>{label}</Label>
        </Popover>
      );
    }
    return <Label id={`status-cb-${status}`} color={color}>{label}</Label>;
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRowClick = (keyId: string) => {
    navigate(`/gen-ai-studio/api-keys/${keyId}`);
  };

  const removeToastAlert = (alertKey: React.Key) => {
    setToastAlerts((prev) => prev.filter((a) => a.key !== alertKey));
  };

  const addToast = (title: string) => {
    const alertKey = `toast-${Date.now()}`;
    const newAlert = (
      <Alert
        id={`api-key-toast-cb-${alertKey}`}
        variant={AlertVariant.success}
        title={title}
        timeout
        actionClose={<AlertActionCloseButton id={`close-toast-cb-${alertKey}`} onClose={() => removeToastAlert(alertKey)} />}
        onTimeout={() => removeToastAlert(alertKey)}
        key={alertKey}
      />
    );
    setToastAlerts((prev) => [newAlert, ...prev]);
  };

  const handleRevokeSingle = (apiKey: ApiKeyV34) => {
    setApiKeys((prev) =>
      prev.map((k) => (k.id === apiKey.id ? { ...k, status: 'revoked' as ApiKeyStatusV34 } : k)),
    );
    addToast(`API key "${apiKey.name}" revoked`);
  };

  const handleRevokeSelected = () => {
    const count = selectedKeys.size;
    setApiKeys((prev) =>
      prev.map((k) => (selectedKeys.has(k.id) ? { ...k, status: 'revoked' as ApiKeyStatusV34 } : k)),
    );
    setSelectedKeys(new Set());
    addToast(`${count} API key(s) revoked`);
  };

  const handleStatusFilterSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    const status = value as ApiKeyStatusV34;
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) { next.delete(status); } else { next.add(status); }
      return next;
    });
  };

  return (
    <PageSection>
      <AlertGroup isToast isLiveRegion hasAnimations id="api-keys-toast-cb">
        {toastAlerts}
      </AlertGroup>

      <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <APIKeysIcon withBackground size={24} />
        </FlexItem>
        <FlexItem>
          <Content component={ContentVariants.h1} id="api-keys-page-title-cb">API keys</Content>
        </FlexItem>
      </Flex>
      <Content component={ContentVariants.p}>
        Manage API keys used to authenticate with AI model endpoints.
      </Content>

      <Toolbar id="api-keys-toolbar-cb" style={{ marginTop: '1rem' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <Select
                id="api-keys-status-filter-cb"
                isOpen={isStatusFilterOpen}
                selected={Array.from(statusFilters)}
                onSelect={handleStatusFilterSelect}
                onOpenChange={(isOpen) => setIsStatusFilterOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                    isExpanded={isStatusFilterOpen}
                    id="api-keys-status-filter-toggle-cb"
                  >
                    Status
                    {statusFilters.size < ALL_STATUSES.length && (
                      <Badge isRead id="status-filter-badge-cb" style={{ marginLeft: '0.5rem' }}>
                        {statusFilters.size}
                      </Badge>
                    )}
                  </MenuToggle>
                )}
              >
                <SelectList id="api-keys-status-filter-list-cb">
                  {ALL_STATUSES.map((status) => (
                    <SelectOption
                      key={status}
                      value={status}
                      hasCheckbox
                      isSelected={statusFilters.has(status)}
                      id={`status-filter-cb-${status}`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
            {isAdmin && (
              <ToolbarItem>
                <SearchInput
                  id="api-keys-owner-filter-cb"
                  aria-label="Filter by owner"
                  placeholder="Filter by owner"
                  value={ownerFilter}
                  onChange={(_event, value) => setOwnerFilter(value)}
                  onClear={() => setOwnerFilter('')}
                  style={{ width: '180px' }}
                />
              </ToolbarItem>
            )}
            <ToolbarItem>
              <SearchInput
                id="api-keys-search-cb"
                aria-label="Search API keys"
                placeholder="Search"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
                style={{ width: '200px' }}
              />
            </ToolbarItem>
          </ToolbarGroup>
          <ToolbarItem>
            <Button variant="primary" onClick={() => openCreateModal()} id="create-api-key-button-cb">
              Create API key
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              isOpen={isPageActionsOpen}
              onOpenChange={(isOpen) => setIsPageActionsOpen(isOpen)}
              popperProps={{ position: 'right' }}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsPageActionsOpen(!isPageActionsOpen)}
                  variant="plain"
                  aria-label="Page actions"
                  isExpanded={isPageActionsOpen}
                  id="page-actions-toggle-cb"
                >
                  <EllipsisVIcon />
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem
                  key="revoke-selected"
                  onClick={() => {
                    handleRevokeSelected();
                    setIsPageActionsOpen(false);
                  }}
                  isDanger
                  isDisabled={selectedKeys.size === 0}
                  id="revoke-selected-action-cb"
                >
                  {selectedKeys.size > 0 ? `Revoke ${selectedKeys.size} selected` : 'Revoke selected'}
                </DropdownItem>
              </DropdownList>
            </Dropdown>
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
              id="api-keys-pagination-top-cb"
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="API Keys table" id="api-keys-table-cb">
        <Thead>
          <Tr>
            <Th
              select={{
                onSelect: (_event, isSelected) => handleSelectAll(isSelected),
                isSelected: allPageSelected,
                isHeaderSelectDisabled: selectableOnPage.length === 0,
              }}
              id="select-all-cb"
            />
            <Th sort={getSortParams(0)}>Name</Th>
            <Th sort={getSortParams(1)}>Status</Th>
            <Th sort={getSortParams(2)}>Owner</Th>
            <Th sort={getSortParams(3)}>Created</Th>
            <Th sort={getSortParams(4)}>Expiration</Th>
            <Th screenReaderText="Actions" />
          </Tr>
        </Thead>
        <Tbody>
          {paginatedApiKeys.map((apiKey, rowIndex) => (
            <Tr key={apiKey.id}>
              <Td
                select={{
                  rowIndex,
                  onSelect: (_event, isSelected) => handleSelectRow(apiKey.id, isSelected),
                  isSelected: selectedKeys.has(apiKey.id),
                  isDisabled: apiKey.status !== 'active',
                }}
                id={`select-row-cb-${apiKey.id}`}
              />
              <Td dataLabel="Name">
                <div>
                  <Button
                    variant="link"
                    isInline
                    onClick={() => handleRowClick(apiKey.id)}
                    id={`api-key-link-cb-${apiKey.id}`}
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
              <Td dataLabel="Status">{getStatusLabel(apiKey.status)}</Td>
              <Td dataLabel="Owner">{apiKey.username}</Td>
              <Td dataLabel="Created">{formatDate(apiKey.creationDate)}</Td>
              <Td dataLabel="Expiration">
                {apiKey.expirationDate ? formatDate(apiKey.expirationDate) : 'Never'}
              </Td>
              <Td isActionCell>
                <Dropdown
                  isOpen={openKebabMenus.has(apiKey.id)}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setOpenKebabMenus((prev) => {
                        const next = new Set(prev);
                        next.delete(apiKey.id);
                        return next;
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
                      id={`api-key-actions-cb-${apiKey.id}`}
                    >
                      <EllipsisVIcon />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem
                      key="revoke"
                      onClick={() => {
                        handleRevokeSingle(apiKey);
                        toggleKebabMenu(apiKey.id);
                      }}
                      id={`revoke-key-cb-${apiKey.id}`}
                      isDisabled={apiKey.status !== 'active'}
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
        id="api-keys-pagination-bottom-cb"
      />

      <CreateAPIKeyModalV34
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onKeyCreated={handleKeyCreated}
        currentUsername={getCurrentUsername()}
      />

    </PageSection>
  );
};

export { APIKeysV34Checkboxes };
