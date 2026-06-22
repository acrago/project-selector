import * as React from 'react';
import {
  Badge,
  Button,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  NumberInput,
  PageSection,
  Popover,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  TextArea,
  TextInput,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { InfoCircleIcon, MinusCircleIcon, PencilAltIcon, PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import { useNavigate } from 'react-router-dom';
import { useVariantFlags } from '@app/utils/VariantFlagsContext';
import { ModelRef, Subscription } from '../types';
import { getModelById, getRelatedPolicies, mockMaaSModels, mockOwnerGroups, mockSubscriptions } from '../mockData';

interface SubscriptionDetailsTabProps {
  subscription: Subscription;
  onSubscriptionChange?: (subscription: Subscription) => void;
}

const SubscriptionDetailsTab: React.FunctionComponent<SubscriptionDetailsTabProps> = ({ subscription, onSubscriptionChange }) => {
  const navigate = useNavigate();
  const { isVariantFlagEnabled } = useVariantFlags();
  const inlineEditingEnabled = isVariantFlagEnabled('subscriptionDetails', 'inlineEditing');

  const relatedPolicies = getRelatedPolicies(subscription.id);

  // State for Add Model modal
  const [isAddModelModalOpen, setIsAddModelModalOpen] = React.useState(false);
  const [addModelSearchInput, setAddModelSearchInput] = React.useState('');
  const [modelsToAdd, setModelsToAdd] = React.useState<Set<string>>(new Set());
  const [addModelsSortIndex, setAddModelsSortIndex] = React.useState<number>(0);
  const [addModelsSortDirection, setAddModelsSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // State for Edit Token Limit modal
  const [isEditTokenLimitModalOpen, setIsEditTokenLimitModalOpen] = React.useState(false);
  const [editingModelIndex, setEditingModelIndex] = React.useState<number | null>(null);
  const [editTokenLimits, setEditTokenLimits] = React.useState<Array<{
    limit: number;
    perAmount: number;
    perUnit: 'minute' | 'hour' | 'day';
  }>>([{ limit: 0, perAmount: 1, perUnit: 'minute' }]);
  const [editTokenUnitSelectOpen, setEditTokenUnitSelectOpen] = React.useState<number | null>(null);

  // Track initial values for change detection (edit mode warning)
  const [_initialModelRefs] = React.useState(() => subscription.modelRefs.map(r => r.name));
  const [_initialGroups] = React.useState(() => subscription.owner.groups.map(g => g.name));

  // State for hover effects on limit links
  const [hoveredLimitLink, setHoveredLimitLink] = React.useState<string | null>(null);

  // State for inline editing of display name and description
  const [isEditingDisplayName, setIsEditingDisplayName] = React.useState(false);
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [editDisplayNameValue, setEditDisplayNameValue] = React.useState(subscription.displayName);
  const [editDescriptionValue, setEditDescriptionValue] = React.useState(subscription.description || '');

  // State for groups editing
  const [isEditingGroups, setIsEditingGroups] = React.useState(false);
  const [editGroupsValue, setEditGroupsValue] = React.useState<string[]>(
    subscription.owner.groups.map((g) => g.name)
  );
  const [isGroupsSelectOpen, setIsGroupsSelectOpen] = React.useState(false);
  const [groupsInputValue, setGroupsInputValue] = React.useState('');
  const groupsTextInputRef = React.useRef<HTMLInputElement>(null);
  const [customGroups, setCustomGroups] = React.useState<string[]>([]);
  const CREATE_NEW_GROUP = '__create_new_group__';

  // Rate limit time unit options
  const rateLimitUnitOptions = [
    { label: 'minutes', value: 'minute' },
    { label: 'hours', value: 'hour' },
    { label: 'days', value: 'day' },
  ];

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to parse legacy window format (e.g., "24h") to perAmount and perUnit
  const parseWindowToAmountUnit = (window: string): { perAmount: number; perUnit: 'minute' | 'hour' | 'day' } => {
    const match = window.match(/^(\d+)([mhd])$/);
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === 'm') return { perAmount: amount, perUnit: 'minute' };
      if (unit === 'h') return { perAmount: amount, perUnit: 'hour' };
      if (unit === 'd') return { perAmount: amount, perUnit: 'day' };
    }
    return { perAmount: 1, perUnit: 'minute' };
  };

  // Get all models and track which are already added
  const addedModelIds = React.useMemo(() => {
    return new Set(subscription.modelRefs.map((ref) => ref.name));
  }, [subscription.modelRefs]);

  // All models available to show in the modal
  const allModelsForModal = mockMaaSModels;

  // Handle opening Add Model modal
  const handleOpenAddModelModal = () => {
    setModelsToAdd(new Set(addedModelIds));
    setAddModelSearchInput('');
    setAddModelsSortIndex(0);
    setAddModelsSortDirection('asc');
    setIsAddModelModalOpen(true);
  };

  // Handle closing Add Model modal
  const handleCloseAddModelModal = () => {
    setIsAddModelModalOpen(false);
    setModelsToAdd(new Set());
    setAddModelSearchInput('');
  };

  // Handle toggling a model in the add models modal
  const handleToggleModelToAdd = (modelId: string) => {
    setModelsToAdd((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  // Handle confirming model selection from the modal
  const handleAddModels = () => {
    const newModelRefs: ModelRef[] = Array.from(modelsToAdd).map((modelId) => {
      const existingRef = subscription.modelRefs.find((ref) => ref.name === modelId);
      if (existingRef) {
        return existingRef;
      }
      return {
        name: modelId,
        tokenRateLimits: { limit: 0, window: '24h' },
        requestRateLimits: { requests: 0, perAmount: 1, perUnit: 'minute' },
      };
    });

    if (onSubscriptionChange) {
      onSubscriptionChange({
        ...subscription,
        modelRefs: newModelRefs,
      });
    }

    handleCloseAddModelModal();
  };

  // Filter and sort models based on search input and sort settings
  const filteredModelsForModal = React.useMemo(() => {
    let models = [...allModelsForModal];

    if (addModelSearchInput.trim()) {
      const searchTerm = addModelSearchInput.toLowerCase();
      models = models.filter(
        (model) =>
          model.name.toLowerCase().includes(searchTerm) ||
          model.description.toLowerCase().includes(searchTerm) ||
          model.id.toLowerCase().includes(searchTerm)
      );
    }

    const sortedModels = [...models].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (addModelsSortIndex) {
        case 0:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 1:
          aValue = a.namespace.toLowerCase();
          bValue = b.namespace.toLowerCase();
          break;
        case 2:
          aValue = a.id.toLowerCase();
          bValue = b.id.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return addModelsSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return addModelsSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedModels;
  }, [allModelsForModal, addModelSearchInput, addModelsSortIndex, addModelsSortDirection]);

  // Get subscriptions that a model belongs to
  const getModelSubscriptions = (modelId: string): string[] => {
    return mockSubscriptions
      .filter((sub) => sub.modelRefs.some((ref) => ref.name === modelId))
      .map((sub) => sub.displayName);
  };

  // Sort params for Add Models table
  const getAddModelsSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: addModelsSortIndex,
      direction: addModelsSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => {
      setAddModelsSortIndex(index);
      setAddModelsSortDirection(direction);
    },
    columnIndex,
  });

  // Handle removing a model
  const handleRemoveModel = (index: number) => {
    if (onSubscriptionChange) {
      onSubscriptionChange({
        ...subscription,
        modelRefs: subscription.modelRefs.filter((_, i) => i !== index),
      });
    }
  };

  // Handle opening Edit Token Limit modal
  const handleOpenEditTokenLimitModal = (index: number) => {
    const modelRef = subscription.modelRefs[index];
    setEditingModelIndex(index);

    const tokenLimits = Array.isArray(modelRef.tokenRateLimits)
      ? modelRef.tokenRateLimits
      : [modelRef.tokenRateLimits];

    setEditTokenLimits(tokenLimits.map(tl => ({
      limit: tl.limit,
      perAmount: tl.perAmount ?? parseWindowToAmountUnit(tl.window).perAmount,
      perUnit: tl.perUnit ?? parseWindowToAmountUnit(tl.window).perUnit,
    })));

    setIsEditTokenLimitModalOpen(true);
  };

  // Handle closing Edit Token Limit modal
  const handleCloseEditTokenLimitModal = () => {
    setIsEditTokenLimitModalOpen(false);
    setEditingModelIndex(null);
    setEditTokenUnitSelectOpen(null);
  };

  // Handle saving token limit edits
  const handleSaveTokenLimitEdit = () => {
    if (editingModelIndex === null || !onSubscriptionChange) return;

    const updatedRefs = [...subscription.modelRefs];

    const tokenLimitsForStorage = editTokenLimits.map(tl => ({
      limit: tl.limit,
      window: `${tl.perAmount}${tl.perUnit === 'minute' ? 'm' : tl.perUnit === 'hour' ? 'h' : 'd'}`,
      perAmount: tl.perAmount,
      perUnit: tl.perUnit,
    }));

    updatedRefs[editingModelIndex] = {
      ...updatedRefs[editingModelIndex],
      tokenRateLimits: tokenLimitsForStorage.length === 1 ? tokenLimitsForStorage[0] : tokenLimitsForStorage,
    };

    onSubscriptionChange({ ...subscription, modelRefs: updatedRefs });
    handleCloseEditTokenLimitModal();
  };

  // Add a new token limit
  const handleAddTokenLimit = () => {
    setEditTokenLimits([...editTokenLimits, { limit: 0, perAmount: 1, perUnit: 'minute' }]);
  };

  // Remove a token limit
  const handleRemoveTokenLimit = (index: number) => {
    setEditTokenLimits(editTokenLimits.filter((_, i) => i !== index));
  };

  // Update a token limit
  const handleUpdateTokenLimit = (index: number, field: string, value: any) => {
    const updated = [...editTokenLimits];
    updated[index] = { ...updated[index], [field]: value };
    setEditTokenLimits(updated);
  };

  // Get row actions for each model
  const getModelRowActions = (index: number): IAction[] => [
    {
      title: 'Edit token limits',
      onClick: () => handleOpenEditTokenLimitModal(index),
    },
    {
      isSeparator: true,
    },
    {
      title: 'Remove',
      onClick: () => handleRemoveModel(index),
    },
  ];

  // Handle saving display name inline edit
  const handleSaveDisplayName = () => {
    if (onSubscriptionChange) {
      onSubscriptionChange({
        ...subscription,
        displayName: editDisplayNameValue,
      });
    }
    setIsEditingDisplayName(false);
  };

  // Handle saving description inline edit
  const handleSaveDescription = () => {
    if (onSubscriptionChange) {
      onSubscriptionChange({
        ...subscription,
        description: editDescriptionValue,
      });
    }
    setIsEditingDescription(false);
  };

  // Handle starting display name edit
  const handleStartEditDisplayName = () => {
    setEditDisplayNameValue(subscription.displayName);
    setIsEditingDisplayName(true);
  };

  // Handle starting description edit
  const handleStartEditDescription = () => {
    setEditDescriptionValue(subscription.description || '');
    setIsEditingDescription(true);
  };

  // Handle starting groups edit
  const handleStartEditGroups = () => {
    setEditGroupsValue([]); // Start with empty selection - existing groups shown above
    setIsEditingGroups(true);
  };

  // Handle saving groups edit
  const handleSaveGroups = () => {
    if (onSubscriptionChange) {
      // Merge new groups with existing ones
      const existingGroupNames = subscription.owner.groups.map((g) => g.name);
      const allGroupNames = [...existingGroupNames, ...editGroupsValue.filter((g) => !existingGroupNames.includes(g))];
      onSubscriptionChange({
        ...subscription,
        owner: {
          groups: allGroupNames.map((name) => ({ name })),
        },
      });
    }
    setIsEditingGroups(false);
    setGroupsInputValue('');
    setIsGroupsSelectOpen(false);
  };

  // Handle selecting a group from the dropdown
  const handleGroupSelect = (groupName: string) => {
    if (groupName === CREATE_NEW_GROUP) {
      const newGroupName = groupsInputValue.trim();
      if (newGroupName && !editGroupsValue.includes(newGroupName)) {
        if (!mockOwnerGroups.some((g) => g.name === newGroupName) && !customGroups.includes(newGroupName)) {
          setCustomGroups((prev) => [...prev, newGroupName]);
        }
        setEditGroupsValue((prev) => [...prev, newGroupName]);
      }
      setGroupsInputValue('');
      return;
    }

    setEditGroupsValue((prev) => {
      if (prev.includes(groupName)) {
        return prev.filter((g) => g !== groupName);
      }
      return [...prev, groupName];
    });
    setGroupsInputValue('');
  };

  // Handle removing a group from the selected list
  const handleGroupRemove = (groupName: string) => {
    setEditGroupsValue((prev) => prev.filter((g) => g !== groupName));
  };

  // Handle input change for groups search
  const handleGroupsInputChange = (value: string) => {
    setGroupsInputValue(value);
    if (!isGroupsSelectOpen) {
      setIsGroupsSelectOpen(true);
    }
  };

  // Combine mock groups with custom-created groups
  const allAvailableGroups = React.useMemo(() => {
    const mockGroupNames = mockOwnerGroups.map((g) => g.name);
    const customGroupObjects = customGroups
      .filter((name) => !mockGroupNames.includes(name))
      .map((name) => ({ name }));
    return [...mockOwnerGroups, ...customGroupObjects];
  }, [customGroups]);

  // Filter groups based on search input, excluding already-assigned groups
  const filteredGroups = React.useMemo(() => {
    const inputLower = groupsInputValue.toLowerCase().trim();
    const existingGroupNames = subscription.owner.groups.map((g) => g.name.toLowerCase());
    
    // Filter out groups that are already assigned to the subscription or already selected in the form
    const filtered = allAvailableGroups.filter((group) => {
      const groupLower = group.name.toLowerCase();
      const matchesSearch = groupLower.includes(inputLower);
      const isAlreadyAssigned = existingGroupNames.includes(groupLower);
      const isAlreadySelected = editGroupsValue.some((g) => g.toLowerCase() === groupLower);
      return matchesSearch && !isAlreadyAssigned && !isAlreadySelected;
    });

    const hasExactMatch = allAvailableGroups.some(
      (g) => g.name.toLowerCase() === inputLower
    );
    const isAlreadySelected = editGroupsValue.some(
      (g) => g.toLowerCase() === inputLower
    );
    const isAlreadyAssigned = existingGroupNames.includes(inputLower);
    const showCreateOption = inputLower && !hasExactMatch && !isAlreadySelected && !isAlreadyAssigned;

    return { filtered, showCreateOption };
  }, [groupsInputValue, allAvailableGroups, editGroupsValue, subscription.owner.groups]);

  // Get row actions for each group in the table
  const getGroupRowActions = (groupName: string): IAction[] => [
    {
      title: 'Remove',
      onClick: () => {
        if (onSubscriptionChange) {
          onSubscriptionChange({
            ...subscription,
            owner: {
              groups: subscription.owner.groups.filter((g) => g.name !== groupName),
            },
          });
        }
      },
    },
  ];

  const renderOwnerGroups = (): React.ReactNode => {
    const groups = subscription.owner.groups;
    if (groups.length === 0) {
      return <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>No groups assigned</span>;
    }

    return (
      <Table aria-label="Groups table" variant="compact" id="subscription-groups-table">
        <Thead>
          <Tr>
            <Th>Name</Th>
            {inlineEditingEnabled && <Th screenReaderText="Actions" />}
          </Tr>
        </Thead>
        <Tbody>
          {groups.map((group) => (
            <Tr key={group.name}>
              <Td dataLabel="Name">{group.name}</Td>
              {inlineEditingEnabled && (
                <Td isActionCell>
                  <ActionsColumn items={getGroupRowActions(group.name)} />
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  // Helper to convert window format (e.g., "24h") to readable label
  const formatWindowLabel = (window: string): string => {
    const match = window.match(/^(\d+)([mhd])$/);
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === 'm') return `${amount} minutes`;
      if (unit === 'h') return `${amount} hours`;
      if (unit === 'd') return `${amount} days`;
    }
    return window;
  };

  // Format token limit for display
  const formatTokenLimit = (modelRef: ModelRef): React.ReactNode => {
    const limits = Array.isArray(modelRef.tokenRateLimits)
      ? modelRef.tokenRateLimits
      : [modelRef.tokenRateLimits];

    const formatted = limits.map((tl, index) => {
      let text: string;
      if (tl.limit === 0) {
        text = 'Unlimited';
      } else if (tl.perAmount && tl.perUnit) {
        text = `${tl.limit.toLocaleString()} / ${tl.perAmount} ${tl.perUnit}s`;
      } else {
        text = `${tl.limit.toLocaleString()} / ${formatWindowLabel(tl.window)}`;
      }
      return <div key={index}>{text}</div>;
    });

    return <>{formatted}</>;
  };

  return (
    <PageSection>
      {/* Details Section */}
      <Content component={ContentVariants.h2} id="subscription-details-heading" style={{ marginTop: '1rem' }}>
        Details
      </Content>
      <DescriptionList columnModifier={{ default: '2Col' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>
            {inlineEditingEnabled ? (
              <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>Display name</FlexItem>
                {!isEditingDisplayName && (
                  <FlexItem>
                    <Button
                      variant="link"
                      icon={<PencilAltIcon />}
                      iconPosition="end"
                      onClick={handleStartEditDisplayName}
                      id="edit-display-name-button"
                      aria-label="Edit display name"
                    >
                      Edit
                    </Button>
                  </FlexItem>
                )}
              </Flex>
            ) : (
              'Display name'
            )}
          </DescriptionListTerm>
          <DescriptionListDescription id="subscription-display-name">
            {inlineEditingEnabled && isEditingDisplayName ? (
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <TextInput
                    id="edit-display-name-input"
                    value={editDisplayNameValue}
                    onChange={(_event, value) => setEditDisplayNameValue(value)}
                    aria-label="Edit display name"
                    style={{ maxWidth: '400px' }}
                  />
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="primary"
                    onClick={handleSaveDisplayName}
                    id="save-display-name-button"
                    size="sm"
                  >
                    Save
                  </Button>
                </FlexItem>
              </Flex>
            ) : (
              subscription.displayName
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>
            {inlineEditingEnabled ? (
              <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>Description</FlexItem>
                {!isEditingDescription && (
                  <FlexItem>
                    <Button
                      variant="link"
                      icon={<PencilAltIcon />}
                      iconPosition="end"
                      onClick={handleStartEditDescription}
                      id="edit-description-button"
                      aria-label="Edit description"
                    >
                      Edit
                    </Button>
                  </FlexItem>
                )}
              </Flex>
            ) : (
              'Description'
            )}
          </DescriptionListTerm>
          <DescriptionListDescription id="subscription-description">
            {inlineEditingEnabled && isEditingDescription ? (
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <TextArea
                    id="edit-description-input"
                    value={editDescriptionValue}
                    onChange={(_event, value) => setEditDescriptionValue(value)}
                    aria-label="Edit description"
                    style={{ maxWidth: '400px' }}
                    rows={3}
                  />
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="primary"
                    onClick={handleSaveDescription}
                    id="save-description-button"
                    size="sm"
                  >
                    Save
                  </Button>
                </FlexItem>
              </Flex>
            ) : (
              subscription.description || <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>No description</span>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Name</DescriptionListTerm>
          <DescriptionListDescription id="subscription-name">{subscription.name}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Date created</DescriptionListTerm>
          <DescriptionListDescription id="subscription-date-created">
            {formatDate(subscription.dateCreated)}
          </DescriptionListDescription>
        </DescriptionListGroup>

      </DescriptionList>

      {/* Groups Section */}
      <Content component={ContentVariants.h2} id="groups-heading" style={{ marginTop: '3rem' }}>
        Groups
      </Content>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
        Users in these groups are able to access this subscription.
      </div>
      {renderOwnerGroups()}

      {/* Add/Edit groups section */}
      {inlineEditingEnabled ? (
        isEditingGroups ? (
          <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
            <div style={{ maxWidth: '600px', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              <Select
                id="subscription-groups-select"
                isOpen={isGroupsSelectOpen}
                selected={editGroupsValue}
                onSelect={(_event, value) => handleGroupSelect(value as string)}
                onOpenChange={(isOpen) => setIsGroupsSelectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="typeahead"
                    onClick={() => {
                      setIsGroupsSelectOpen(!isGroupsSelectOpen);
                      groupsTextInputRef.current?.focus();
                    }}
                    isExpanded={isGroupsSelectOpen}
                    isFullWidth
                    id="subscription-groups-toggle"
                  >
                    <TextInputGroup isPlain>
                      <TextInputGroupMain
                        value={groupsInputValue}
                        onClick={() => setIsGroupsSelectOpen(!isGroupsSelectOpen)}
                        onChange={(_event, value) => handleGroupsInputChange(value)}
                        onKeyDown={(event: React.KeyboardEvent) => {
                          if (event.key === 'Enter' && filteredGroups.showCreateOption) {
                            event.preventDefault();
                            handleGroupSelect(CREATE_NEW_GROUP);
                          }
                        }}
                        autoComplete="off"
                        innerRef={groupsTextInputRef}
                        placeholder={editGroupsValue.length === 0 ? "Find group by name" : ""}
                        id="subscription-groups-input"
                      >
                        {editGroupsValue.length > 0 && (
                          <LabelGroup aria-label="Current selections" numLabels={3}>
                            {editGroupsValue.map((groupName) => (
                              <Label
                                key={groupName}
                                variant="outline"
                                id={`subscription-group-label-${groupName}`}
                                onClose={(ev) => {
                                  ev.stopPropagation();
                                  handleGroupRemove(groupName);
                                }}
                              >
                                {groupName}
                              </Label>
                            ))}
                          </LabelGroup>
                        )}
                      </TextInputGroupMain>
                      <TextInputGroupUtilities>
                        {(editGroupsValue.length > 0 || groupsInputValue) && (
                          <Button
                            variant="plain"
                            onClick={() => {
                              setGroupsInputValue('');
                              setEditGroupsValue([]);
                            }}
                            aria-label="Clear input"
                            id="subscription-groups-clear-button"
                          >
                            <TimesIcon />
                          </Button>
                        )}
                      </TextInputGroupUtilities>
                    </TextInputGroup>
                  </MenuToggle>
                )}
              >
                <SelectList id="subscription-groups-list">
                  {filteredGroups.filtered.length === 0 && !filteredGroups.showCreateOption ? (
                    <SelectOption isDisabled>No results found</SelectOption>
                  ) : (
                    <>
                      {filteredGroups.filtered.map((group) => (
                        <SelectOption
                          key={group.name}
                          value={group.name}
                          isSelected={editGroupsValue.includes(group.name)}
                          id={`subscription-group-option-${group.name}`}
                        >
                          {group.name}
                        </SelectOption>
                      ))}
                      {filteredGroups.showCreateOption && (
                        <SelectOption
                          key={CREATE_NEW_GROUP}
                          value={CREATE_NEW_GROUP}
                          id="subscription-group-option-create-new"
                        >
                          Add "{groupsInputValue.trim()}"
                        </SelectOption>
                      )}
                    </>
                  )}
                </SelectList>
              </Select>
            </div>
            <Button
              variant="primary"
              onClick={handleSaveGroups}
              id="save-groups-button"
              size="sm"
            >
              Save
            </Button>
          </div>
        ) : (
          <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
            <Button
              variant="link"
              icon={<PlusCircleIcon />}
              onClick={handleStartEditGroups}
              id="add-groups-button"
            >
              Add groups
            </Button>
          </div>
        )
      ) : null}

      {/* Models Section */}
      <Content component={ContentVariants.h2} id="models-heading" style={{ marginTop: '3rem' }}>
        Models
      </Content>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
        Models that subscribers will be able to use.
      </div>

      {subscription.modelRefs.length > 0 ? (
        <>
          <Table aria-label="Models table" variant="compact" id="subscription-models-table">
            <Thead>
              <Tr>
                <Th width={35}>Name</Th>
                <Th width={15}>Project</Th>
                <Th width={30}>Token limits</Th>
                {inlineEditingEnabled && <Th screenReaderText="Actions" />}
              </Tr>
            </Thead>
            <Tbody>
              {subscription.modelRefs.map((modelRef, index) => {
                const modelData = getModelById(modelRef.name);
                return (
                  <Tr key={modelRef.name}>
                    <Td dataLabel="Name">
                      <div>
                        <strong>{modelData?.name || modelRef.name}</strong>
                        <div style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '0.8125rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {modelRef.name}
                        </div>
                        {modelData?.description && (
                          <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                            {modelData.description}
                          </div>
                        )}
                      </div>
                    </Td>
                    <Td dataLabel="Project">{modelData?.namespace || '-'}</Td>
                    <Td dataLabel="Token limits">
                      {inlineEditingEnabled ? (
                        <Button
                          variant="link"
                          isInline
                          onClick={() => handleOpenEditTokenLimitModal(index)}
                          onMouseEnter={() => setHoveredLimitLink(`token-${modelRef.name}`)}
                          onMouseLeave={() => setHoveredLimitLink(null)}
                          style={{
                            textDecoration: hoveredLimitLink === `token-${modelRef.name}` ? 'underline' : 'none',
                          }}
                          id={`edit-token-limit-link-${modelRef.name}`}
                        >
                          {formatTokenLimit(modelRef)}
                        </Button>
                      ) : (
                        formatTokenLimit(modelRef)
                      )}
                    </Td>
                    {inlineEditingEnabled && (
                      <Td isActionCell>
                        <ActionsColumn items={getModelRowActions(index)} />
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          {inlineEditingEnabled && (
            <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
              <Button
                variant="link"
                icon={<PlusCircleIcon />}
                onClick={handleOpenAddModelModal}
                id="add-models-button"
              >
                Add models
              </Button>
            </div>
          )}
        </>
      ) : (
        <div>
          {inlineEditingEnabled && (
            <Button
              variant="link"
              icon={<PlusCircleIcon />}
              onClick={handleOpenAddModelModal}
              id="add-models-button"
            >
              Add models
            </Button>
          )}
        </div>
      )}

      {/* Related Policies Section */}
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} style={{ marginTop: '3rem' }}>
        <Content component={ContentVariants.h2} id="related-policies-heading" style={{ marginBottom: 0 }}>
          Related policies
        </Content>
        <Popover
          headerContent="Design note"
          bodyContent="These policy links might be external links to the OCP Web Console's policy details page instead of in-app navigation."
          position="right"
          id="policies-design-note-popover"
        >
          <Badge
            id="policies-design-note-badge"
            style={{ backgroundColor: '#F32BC4', color: '#ffffff', fontSize: '10px', cursor: 'pointer' }}
          >
            Design note <InfoCircleIcon style={{ marginLeft: '0.25rem' }} />
          </Badge>
        </Popover>
      </Flex>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: '1rem' }}>
        Policies that are associated with this subscription or its models.
      </div>

      {relatedPolicies.length > 0 ? (
        <>
          <Table aria-label="Related policies table" variant="compact" id="subscription-related-policies-table">
            <Thead>
              <Tr>
                <Th width={70}>Name</Th>
                <Th width={30}>Type</Th>
              </Tr>
            </Thead>
            <Tbody>
              {relatedPolicies.map((policy) => (
                <Tr key={policy.id}>
                  <Td dataLabel="Name">
                    <div>
                      <Button
                        variant="link"
                        isInline
                        onClick={() => navigate(`/settings/policies/${policy.id}`)}
                        id={`related-policy-link-${policy.id}`}
                      >
                        {policy.name}
                      </Button>
                      {policy.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {policy.description}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td dataLabel="Type">{policy.type}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      ) : (
        <div style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
          No policies are associated with this subscription. A MaaSAuthPolicy is needed alongside this subscription to authorize groups to access the included models.
        </div>
      )}

      {/* Add Models Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isAddModelModalOpen}
        onClose={handleCloseAddModelModal}
        aria-labelledby="add-models-modal-title"
      >
        <ModalHeader title="Add models to subscription" labelId="add-models-modal-title" />
        <ModalBody>
          <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Select model endpoints that are available as a service to add to this subscription.
          </Content>

          <Toolbar id="add-models-toolbar" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <ToolbarContent style={{ paddingLeft: 0, paddingRight: 0 }}>
              <ToolbarItem>
                <SearchInput
                  placeholder="Filter by name or description"
                  value={addModelSearchInput}
                  onChange={(_event, value) => setAddModelSearchInput(value)}
                  onClear={() => setAddModelSearchInput('')}
                  id="add-models-search-input"
                  style={{ minWidth: '300px' }}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>

          {filteredModelsForModal.length === 0 ? (
            <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', padding: 'var(--pf-t--global--spacer--lg)' }}>
              No models match your search.
            </Content>
          ) : (
            <Table aria-label="Available models" id="add-models-table" variant="compact">
              <Thead>
                <Tr>
                  <Th width={30} sort={getAddModelsSortParams(0)}>Model name</Th>
                  <Th width={15} sort={getAddModelsSortParams(1)}>Project</Th>
                  <Th width={15} sort={getAddModelsSortParams(2)}>Model ID</Th>
                  <Th width={20}>Subscriptions</Th>
                  <Th width={20} screenReaderText="Actions" />
                </Tr>
              </Thead>
              <Tbody>
                {filteredModelsForModal.map((model) => {
                  const isSelected = modelsToAdd.has(model.id);
                  const modelSubscriptions = getModelSubscriptions(model.id);
                  return (
                    <Tr key={model.id}>
                      <Td dataLabel="Model name">
                        <div>
                          <strong>{model.name}</strong>
                          {model.description && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                              {model.description}
                            </div>
                          )}
                        </div>
                      </Td>
                      <Td dataLabel="Project">{model.namespace}</Td>
                      <Td dataLabel="Model ID">
                        <code style={{ fontSize: '0.875rem' }}>{model.id}</code>
                      </Td>
                      <Td dataLabel="Subscriptions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          {isSelected && (
                            <Label
                              id={`subscription-label-${model.id}`}
                              color="green"
                            >
                              {subscription.displayName || 'This subscription'}
                            </Label>
                          )}
                          {modelSubscriptions.length > 0 ? (
                            modelSubscriptions.map((subName) => (
                              <div key={subName} style={{ fontSize: '0.875rem' }}>
                                {subName}
                              </div>
                            ))
                          ) : (
                            !isSelected && (
                              <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem' }}>
                                None
                              </span>
                            )
                          )}
                        </div>
                      </Td>
                      <Td dataLabel="Actions">
                        <Button
                          variant={isSelected ? 'secondary' : 'link'}
                          onClick={() => handleToggleModelToAdd(model.id)}
                          id={`add-model-action-${model.id}`}
                          isDanger={isSelected}
                        >
                          {isSelected ? 'Remove model' : 'Add model'}
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={handleAddModels}
            id="add-models-confirm-button"
          >
            Add models
          </Button>
          <Button variant="link" onClick={handleCloseAddModelModal} id="add-models-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Token Limit Modal */}
      <Modal
        variant={ModalVariant.medium}
        isOpen={isEditTokenLimitModalOpen}
        onClose={handleCloseEditTokenLimitModal}
        aria-labelledby="edit-token-limit-modal-title"
      >
        <ModalHeader
          title={`Edit token limits: ${editingModelIndex !== null ? getModelById(subscription.modelRefs[editingModelIndex]?.name)?.name || subscription.modelRefs[editingModelIndex]?.name : ''}`}
          labelId="edit-token-limit-modal-title"
        />
        <ModalBody>
          <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Set limits on the number of tokens that can be consumed.
          </Content>
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            {editTokenLimits.map((tokenLimit, index) => (
              <FlexItem key={index}>
                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }}>
                  <FlexItem>
                    <NumberInput
                      id={`edit-token-limit-input-${index}`}
                      value={tokenLimit.limit}
                      onMinus={() => handleUpdateTokenLimit(index, 'limit', Math.max(0, tokenLimit.limit - 1000))}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 0;
                        handleUpdateTokenLimit(index, 'limit', value);
                      }}
                      onPlus={() => handleUpdateTokenLimit(index, 'limit', tokenLimit.limit + 1000)}
                      inputName={`token-limit-${index}`}
                      inputAriaLabel={`Token limit ${index + 1} amount`}
                      minusBtnAriaLabel="Decrease token limit"
                      plusBtnAriaLabel="Increase token limit"
                      min={0}
                    />
                  </FlexItem>
                  <FlexItem>tokens per</FlexItem>
                  <FlexItem>
                    <NumberInput
                      id={`edit-token-amount-input-${index}`}
                      value={tokenLimit.perAmount}
                      onMinus={() => handleUpdateTokenLimit(index, 'perAmount', Math.max(1, tokenLimit.perAmount - 1))}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 1;
                        handleUpdateTokenLimit(index, 'perAmount', Math.max(1, value));
                      }}
                      onPlus={() => handleUpdateTokenLimit(index, 'perAmount', tokenLimit.perAmount + 1)}
                      inputName={`token-period-amount-${index}`}
                      inputAriaLabel={`Token limit ${index + 1} time period amount`}
                      minusBtnAriaLabel="Decrease time period"
                      plusBtnAriaLabel="Increase time period"
                      min={1}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Select
                      id={`edit-token-unit-select-${index}`}
                      isOpen={editTokenUnitSelectOpen === index}
                      selected={tokenLimit.perUnit}
                      onSelect={(_event, value) => {
                        handleUpdateTokenLimit(index, 'perUnit', value as 'minute' | 'hour' | 'day');
                        setEditTokenUnitSelectOpen(null);
                      }}
                      onOpenChange={(isOpen) => setEditTokenUnitSelectOpen(isOpen ? index : null)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setEditTokenUnitSelectOpen(editTokenUnitSelectOpen === index ? null : index)}
                          isExpanded={editTokenUnitSelectOpen === index}
                          id={`edit-token-unit-toggle-${index}`}
                        >
                          {rateLimitUnitOptions.find((opt) => opt.value === tokenLimit.perUnit)?.label || 'minute'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {rateLimitUnitOptions.map((option) => (
                          <SelectOption key={option.value} value={option.value} id={`edit-token-unit-option-${index}-${option.value}`}>
                            {option.label}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="plain"
                      aria-label={`Remove token limit ${index + 1}`}
                      onClick={() => handleRemoveTokenLimit(index)}
                      id={`remove-token-limit-button-${index}`}
                      isDisabled={editTokenLimits.length === 1}
                    >
                      <MinusCircleIcon />
                    </Button>
                  </FlexItem>
                </Flex>
              </FlexItem>
            ))}
            <FlexItem>
              <Button
                variant="link"
                icon={<PlusCircleIcon />}
                onClick={handleAddTokenLimit}
                id="add-token-limit-button"
              >
                Add token rate limit
              </Button>
            </FlexItem>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleSaveTokenLimitEdit} id="edit-token-limit-save-button">
            Save
          </Button>
          <Button variant="link" onClick={handleCloseEditTokenLimitModal} id="edit-token-limit-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

    </PageSection>
  );
};

export { SubscriptionDetailsTab };
