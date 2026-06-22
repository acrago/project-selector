import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Content,
  ContentVariants,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
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
  ActionsColumn,
  IAction,
  Table,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { FilterIcon, InfoCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { mockMaaSModels, mockSubscriptions } from './mockData';
import { ModelRef, Subscription } from './types';

const Subscriptions: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filterDropdownOpen, setFilterDropdownOpen] = React.useState(false);
  const [, setFilterAttribute] = React.useState<'keyword'>('keyword');
  const [filterInput, setFilterInput] = React.useState('');
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | null>(null);
  
  // Unaffiliated models modal state
  const [isUnaffiliatedModelsModalOpen, setIsUnaffiliatedModelsModalOpen] = React.useState(false);
  const [modelSubscriptionAssignments, setModelSubscriptionAssignments] = React.useState<Record<string, string[]>>({});
  const [openSelectMenus, setOpenSelectMenus] = React.useState<Record<string, boolean>>({});
  
  // Local copy of subscriptions for updating model counts (mockup - not persisted)
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([...mockSubscriptions]);

  // Check for newly created subscription passed via navigation state
  React.useEffect(() => {
    const state = location.state as { newSubscription?: Subscription } | null;
    if (state?.newSubscription) {
      // Add the new subscription if it doesn't already exist
      setSubscriptions((prev) => {
        const exists = prev.some((s) => s.id === state.newSubscription!.id);
        if (exists) {
          return prev;
        }
        return [...prev, state.newSubscription!];
      });
      // Clear the state so it doesn't re-add on subsequent renders
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);
  
  // Calculate which models are not affiliated with any subscription
  const getUnaffiliatedModels = React.useCallback(() => {
    const affiliatedModelIds = new Set<string>();
    subscriptions.forEach(subscription => {
      subscription.modelRefs.forEach(ref => {
        affiliatedModelIds.add(ref.name);
      });
    });
    
    return mockMaaSModels.filter(model => !affiliatedModelIds.has(model.id));
  }, [subscriptions]);
  
  const unaffiliatedModels = getUnaffiliatedModels();
  const hasUnaffiliatedModels = unaffiliatedModels.length > 0;
  
  // Check if there are pending changes in the modal
  const hasPendingChanges = Object.keys(modelSubscriptionAssignments).length > 0 &&
    Object.values(modelSubscriptionAssignments).some(arr => arr.length > 0);
  
  // Handle opening the unaffiliated models modal
  const handleOpenUnaffiliatedModelsModal = () => {
    setModelSubscriptionAssignments({});
    setOpenSelectMenus({});
    setIsUnaffiliatedModelsModalOpen(true);
  };
  
  // Handle closing the modal
  const handleCloseUnaffiliatedModelsModal = () => {
    setIsUnaffiliatedModelsModalOpen(false);
    setModelSubscriptionAssignments({});
    setOpenSelectMenus({});
  };
  
  // Handle subscription selection for a model (multi-select toggle)
  const handleSubscriptionSelect = (modelId: string, subscriptionId: string) => {
    setModelSubscriptionAssignments(prev => {
      const currentSelections = prev[modelId] || [];
      const isSelected = currentSelections.includes(subscriptionId);
      
      if (isSelected) {
        // Remove from selections
        return {
          ...prev,
          [modelId]: currentSelections.filter(id => id !== subscriptionId)
        };
      } else {
        // Add to selections
        return {
          ...prev,
          [modelId]: [...currentSelections, subscriptionId]
        };
      }
    });
  };
  
  // Get display text for selected subscriptions
  const getSelectedSubscriptionsText = (modelId: string): string => {
    const selectedIds = modelSubscriptionAssignments[modelId] || [];
    if (selectedIds.length === 0) {
      return 'Add to subscription';
    }
    if (selectedIds.length === 1) {
      const subscriptionName = subscriptions.find(s => s.id === selectedIds[0])?.displayName;
      return `Add to: ${subscriptionName}`;
    }
    return `Add to: ${selectedIds.length} subscriptions`;
  };
  
  // Toggle select menu open state
  const toggleSelectMenu = (modelId: string, isOpen: boolean) => {
    setOpenSelectMenus(prev => ({
      ...prev,
      [modelId]: isOpen
    }));
  };
  
  // Handle saving the assignments
  const handleSaveAssignments = () => {
    // Create a deep copy of subscriptions to update
    const updatedSubscriptions = subscriptions.map(sub => ({
      ...sub,
      modelRefs: [...sub.modelRefs]
    }));
    
    // Add models to their assigned subscriptions (now handles multiple subscriptions per model)
    Object.entries(modelSubscriptionAssignments).forEach(([modelId, subscriptionIds]) => {
      subscriptionIds.forEach(subscriptionId => {
        if (subscriptionId) {
          const subscription = updatedSubscriptions.find(s => s.id === subscriptionId);
          if (subscription) {
            // Check if model is already in the subscription (shouldn't happen but just in case)
            const alreadyExists = subscription.modelRefs.some(ref => ref.name === modelId);
            if (!alreadyExists) {
              // Add the model with default rate limits
              const newModelRef: ModelRef = {
                name: modelId,
                tokenRateLimits: { limit: 10000, window: '24h' }
              };
              subscription.modelRefs.push(newModelRef);
            }
          }
        }
      });
    });
    
    setSubscriptions(updatedSubscriptions);
    handleCloseUnaffiliatedModelsModal();
  };

  const getOwnerGroupsSummary = (subscription: Subscription): React.ReactNode => {
    const groups = subscription.owner.groups;
    if (groups.length === 0) {
      return <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>No groups</span>;
    }

    return (
      <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <Badge id={`subscription-groups-${subscription.id}`} isRead>
            {groups.length} {groups.length === 1 ? 'Group' : 'Groups'}
          </Badge>
        </FlexItem>
      </Flex>
    );
  };

  const getModelsSummary = (subscription: Subscription): React.ReactNode => {
    const models = subscription.modelRefs;
    if (models.length === 0) {
      return <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>No models</span>;
    }

    return (
      <Badge id={`subscription-models-${subscription.id}`} isRead>
        {models.length} {models.length === 1 ? 'Model' : 'Models'}
      </Badge>
    );
  };

  const rowActions = (subscription: Subscription): IAction[] => [
    {
      title: 'View details',
      onClick: () => navigate(`/settings/subscriptions/${subscription.id}`),
    },
    {
      title: 'Edit subscription',
      onClick: () => navigate(`/settings/subscriptions/${subscription.id}/edit`),
    },
    { isSeparator: true },
    {
      title: 'Delete subscription',
      onClick: () => {
        console.log('Delete subscription:', subscription.id);
      },
    },
  ];

  const handleCreateSubscription = () => {
    navigate('/settings/subscriptions/create');
  };

  const handleRowClick = (subscription: Subscription) => {
    navigate(`/settings/subscriptions/${subscription.id}`);
  };

  const getSortableRowValues = (subscription: Subscription): (string | number)[] => {
    return [
      subscription.displayName.toLowerCase(), // Column 0: Name
      subscription.owner.groups.length, // Column 1: Owner groups
      subscription.modelRefs.length, // Column 2: Models
      subscription.priority, // Column 3: Priority
    ];
  };

  const getSortedSubscriptions = (subscriptionsToSort: Subscription[]) => {
    if (activeSortIndex === null || activeSortDirection === null) {
      // Default sort by name (ascending)
      return [...subscriptionsToSort].sort((a, b) => 
        a.displayName.toLowerCase().localeCompare(b.displayName.toLowerCase())
      );
    }

    return [...subscriptionsToSort].sort((a, b) => {
      const aValue = getSortableRowValues(a)[activeSortIndex];
      const bValue = getSortableRowValues(b)[activeSortIndex];

      if (aValue < bValue) {
        return activeSortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return activeSortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getFilteredSubscriptions = () => {
    if (!filterInput.trim()) {
      return subscriptions;
    }

    const searchTerm = filterInput.toLowerCase();
    return subscriptions.filter(subscription => {
      return subscription.displayName.toLowerCase().includes(searchTerm) ||
             subscription.name.toLowerCase().includes(searchTerm) ||
             (subscription.description && subscription.description.toLowerCase().includes(searchTerm));
    });
  };

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex || 0,
      direction: activeSortDirection || 'asc',
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const filteredSubscriptions = getSortedSubscriptions(getFilteredSubscriptions());

  return (
    <PageSection>
      <Content component={ContentVariants.h1}>Subscriptions</Content>
      <Content component={ContentVariants.p}>
        Subscriptions control access and entitlements to AI model endpoints that are available as a service.
      </Content>
      
      <Toolbar id="subscriptions-toolbar" style={{ marginTop: '1rem' }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <InputGroup>
                <InputGroupItem>
                  <Dropdown
                    isOpen={filterDropdownOpen}
                    onSelect={() => setFilterDropdownOpen(false)}
                    onOpenChange={(isOpen: boolean) => setFilterDropdownOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                        isExpanded={filterDropdownOpen}
                        id="subscription-filter-toggle"
                        icon={<FilterIcon />}
                        style={{
                          minWidth: '120px',
                          borderRight: 'none',
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                      >
                        Keyword
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem 
                        key="keyword"
                        onClick={() => {
                          setFilterAttribute('keyword');
                          setFilterInput('');
                        }}
                      >
                        Keyword
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </InputGroupItem>
                <InputGroupItem isFill>
                  <SearchInput
                    placeholder="Filter by name or description"
                    value={filterInput}
                    onChange={(_event, value) => setFilterInput(value)}
                    onClear={() => setFilterInput('')}
                    id="subscription-search-input"
                    style={{ 
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      minWidth: '300px'
                    }}
                  />
                </InputGroupItem>
              </InputGroup>
            </ToolbarItem>
            <ToolbarItem>
              <Button 
                variant="primary" 
                onClick={handleCreateSubscription}
                id="create-subscription-button"
              >
                Create subscription
              </Button>
            </ToolbarItem>
            {hasUnaffiliatedModels && (
              <ToolbarItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                  <Label
                    color="grey"
                    variant="outline"
                    icon={<PlusIcon />}
                    onClick={handleOpenUnaffiliatedModelsModal}
                    id="pending-models-label"
                    style={{ cursor: 'pointer' }}
                  >
                    {unaffiliatedModels.length} pending model{unaffiliatedModels.length > 1 ? 's' : ''}
                  </Label>
                  <Popover
                    headerContent="Design note"
                    bodyContent="Showing pending models is a stretch goal and might not make it for 3.4."
                    position="bottom"
                    id="pending-models-design-note-popover"
                  >
                    <Label
                      id="pending-models-design-note-badge"
                      color="purple"
                      variant="filled"
                      isCompact
                      icon={<InfoCircleIcon />}
                      style={{ cursor: 'pointer' }}
                    >
                      Design note
                    </Label>
                  </Popover>
                </Flex>
              </ToolbarItem>
            )}
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="Subscriptions table" id="subscriptions-table">
        <Thead>
          <Tr>
            <Th sort={getSortParams(0)}>Name</Th>
            <Th sort={getSortParams(1)}>Groups</Th>
            <Th sort={getSortParams(2)}>Models</Th>
            <Th sort={getSortParams(3)} textCenter>Priority</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredSubscriptions.map((subscription) => (
            <Tr key={subscription.id}>
              <Td dataLabel="Name">
                <div>
                  <Button 
                    variant="link" 
                    isInline
                    id={`subscription-name-${subscription.id}`}
                    onClick={() => handleRowClick(subscription)}
                  >
                    {subscription.displayName}
                  </Button>
                  {subscription.description && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                      {subscription.description}
                    </div>
                  )}
                </div>
              </Td>
              <Td dataLabel="Groups">
                {getOwnerGroupsSummary(subscription)}
              </Td>
              <Td dataLabel="Models">
                {getModelsSummary(subscription)}
              </Td>
              <Td dataLabel="Priority" textCenter>
                <strong id={`subscription-priority-value-${subscription.id}`}>{subscription.priority}</strong>
              </Td>
              <Td isActionCell>
                <ActionsColumn items={rowActions(subscription)} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Unaffiliated Models Modal */}
      <Modal
        variant={ModalVariant.medium}
        isOpen={isUnaffiliatedModelsModalOpen}
        onClose={handleCloseUnaffiliatedModelsModal}
        aria-labelledby="unaffiliated-models-modal-title"
        aria-describedby="unaffiliated-models-modal-body"
      >
        <ModalHeader
          title="Pending models"
          labelId="unaffiliated-models-modal-title"
        />
        <ModalBody id="unaffiliated-models-modal-body">
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginBottom: '0.5rem' }}>
            <Popover
              headerContent="Design note"
              bodyContent="Showing pending models is a stretch goal and might not make it for 3.4. The implementation may be deferred to a later release."
              position="right"
              id="pending-models-modal-design-note-popover"
            >
              <Label
                id="pending-models-modal-design-note-badge"
                color="purple"
                variant="filled"
                isCompact
                icon={<InfoCircleIcon />}
                style={{ cursor: 'pointer' }}
              >
                Design note
              </Label>
            </Popover>
          </Flex>
          <Content component={ContentVariants.p} style={{ marginBottom: '1.5rem' }}>
            These model endpoints are available as a service but are not currently included in any subscription. 
            Add them to a subscription to make them accessible to users.
          </Content>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {unaffiliatedModels.map((model) => (
              <div
                key={model.id}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                  borderRadius: 'var(--pf-t--global--border--radius--small)'
                }}
              >
                <div>
                  <strong>{model.name}</strong>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    {model.provider} • {model.id}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '0.25rem' }}>
                    Project: {model.namespace}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '0.75rem' }}>
                  {model.description}
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <Select
                    id={`subscription-select-${model.id}`}
                    isOpen={openSelectMenus[model.id] || false}
                    selected={modelSubscriptionAssignments[model.id] || []}
                    onSelect={(_event, value) => handleSubscriptionSelect(model.id, value as string)}
                    onOpenChange={(isOpen) => toggleSelectMenu(model.id, isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => toggleSelectMenu(model.id, !openSelectMenus[model.id])}
                        isExpanded={openSelectMenus[model.id] || false}
                        style={{ minWidth: '250px' }}
                        id={`subscription-toggle-${model.id}`}
                      >
                        {getSelectedSubscriptionsText(model.id)}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      {subscriptions.map((subscription) => (
                        <SelectOption
                          key={subscription.id}
                          value={subscription.id}
                          id={`subscription-option-${model.id}-${subscription.id}`}
                          hasCheckbox
                          isSelected={(modelSubscriptionAssignments[model.id] || []).includes(subscription.id)}
                        >
                          {subscription.displayName}
                        </SelectOption>
                      ))}
                    </SelectList>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            key="save"
            variant="primary"
            onClick={handleSaveAssignments}
            isDisabled={!hasPendingChanges}
            id="save-model-assignments-button"
          >
            Save
          </Button>
          <Button
            key="close"
            variant="secondary"
            onClick={handleCloseUnaffiliatedModelsModal}
            id="close-unaffiliated-models-modal-button"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </PageSection>
  );
};

export { Subscriptions };
