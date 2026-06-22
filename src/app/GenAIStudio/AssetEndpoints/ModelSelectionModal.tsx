import React from 'react';
import {
  Button,
  Checkbox,
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  FlexItem,
  Icon,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Pagination,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  TextInput,
  Title,
  Tooltip
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@patternfly/react-table';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@patternfly/react-icons';
import { useFeatureFlags } from '../../utils/FeatureFlagsContext';

interface Model {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  availability: string;
  useCase: string;
  status?: 'active' | 'error';
}

export interface VectorStoreOption {
  id: string;
  name: string;
  provider: string;
  status: string;
  linkedModelName: string;
  domain: string;
}

export interface CollectionOption {
  id: string;
  collectionName: string;
  subtitle?: string;
  vectorStoreName: string;
  provider: string;
  embeddingModel: string;
  embeddingModelConnected?: boolean;
  embeddingDimension?: number;
  isRegistered: boolean;
  status?: 'active' | 'error';
  owner?: string;
  domain?: string;
}

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigure: () => void;
  selectedModels: Set<string>;
  onModelToggle: (modelId: string) => void;
  onSelectAll: () => void;
  filteredModels: Model[];
  filterBy: string;
  onFilterByChange: (value: string) => void;
  searchText: string;
  onSearchTextChange: (value: string) => void;
  isFilterDropdownOpen: boolean;
  onFilterDropdownToggle: (isOpen: boolean) => void;
  onNavigateToModels: () => void;
  showEmptyState?: boolean;
  selectedProject?: string;
  onProjectChange?: (project: string) => void;
  isProjectSelectOpen?: boolean;
  onProjectSelectOpenChange?: (isOpen: boolean) => void;
  onEmptyStateConfigure?: () => void;
  vectorStores?: VectorStoreOption[];
  selectedVectorStoreId?: string | null;
  onVectorStoreSelect?: (storeId: string | null) => void;
  collections?: CollectionOption[];
  selectedCollections?: Set<string>;
  onCollectionToggle?: (collectionId: string) => void;
  preSelectedCollectionId?: string | null;
  initialStep?: 1 | 2;
}

export const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfigure,
  selectedModels,
  onModelToggle,
  onSelectAll,
  filteredModels,
  searchText,
  onSearchTextChange,
  onNavigateToModels,
  showEmptyState = false,
  onEmptyStateConfigure,
  collections = [],
  selectedCollections = new Set(),
  onCollectionToggle,
  preSelectedCollectionId = null,
  initialStep = 1,
}) => {
  const { flags } = useFeatureFlags();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [modelsPage, setModelsPage] = React.useState(1);
  const [collectionsPage, setCollectionsPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(6);
  const [collectionSearchText, setCollectionSearchText] = React.useState('');
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | undefined>(undefined);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | undefined>(undefined);
  const [modelTypes, setModelTypes] = React.useState<Record<string, string>>({});
  const [modelMaxTokens, setModelMaxTokens] = React.useState<Record<string, string>>({});
  const [openTypeDropdown, setOpenTypeDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setModelsPage(1);
      setCollectionsPage(1);
      setCollectionSearchText('');
      setActiveSortIndex(undefined);
      setActiveSortDirection(undefined);
      setModelTypes({});
      setModelMaxTokens({});
      setOpenTypeDropdown(null);
    }
  }, [isOpen, initialStep]);

  React.useEffect(() => {
    if (step === 2 && onCollectionToggle) {
      collections.forEach(c => {
        const shouldBeSelected = c.id === preSelectedCollectionId || c.isRegistered;
        const isCurrentlySelected = selectedCollections.has(c.id);
        if (shouldBeSelected && !isCurrentlySelected) {
          onCollectionToggle(c.id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const hasCollections = collections.length > 0;

  const inferenceModels = filteredModels;

  const filteredCollections = React.useMemo(() => {
    const connected = collections.filter(c => c.embeddingModelConnected !== false);
    if (!collectionSearchText.trim()) return connected;
    const search = collectionSearchText.toLowerCase();
    return connected.filter(c =>
      c.collectionName.toLowerCase().includes(search) ||
      c.vectorStoreName.toLowerCase().includes(search) ||
      c.embeddingModel.toLowerCase().includes(search)
    );
  }, [collections, collectionSearchText]);

  const paginatedModels = inferenceModels.slice(
    (modelsPage - 1) * perPage,
    modelsPage * perPage
  );
  const paginatedCollections = filteredCollections.slice(
    (collectionsPage - 1) * perPage,
    collectionsPage * perPage
  );

  const getSortParams = (columnIndex: number) => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
    },
    onSort: (_event: React.MouseEvent, index: number, direction: 'asc' | 'desc') => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const allModelsSelected = selectedModels.size === inferenceModels.length && inferenceModels.length > 0;
  const allCollectionsSelected = filteredCollections.length > 0 &&
    filteredCollections.every(c => selectedCollections.has(c.id));

  const renderStatusIcon = (status?: 'active' | 'error') => {
    if (status === 'error') {
      return <ExclamationCircleIcon color="var(--pf-t--global--icon--color--status--danger--default)" />;
    }
    return <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />;
  };

  const getModelType = (modelId: string) => modelTypes[modelId] || 'Inference';
  const getModelMaxTokens = (modelId: string) => modelMaxTokens[modelId] || '';

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={handleClose}
      id="model-selection-modal"
      style={{ width: '1100px' }}
    >
      <ModalHeader title="Configure playground" />
      <ModalBody>
        {showEmptyState ? (
          <EmptyState>
            <Icon status="warning" size="xl">
              <ExclamationCircleIcon />
            </Icon>
            <Title headingLevel="h4" size="lg" id="empty-state-title">
              Playground needs to be enabled
            </Title>
            <EmptyStateBody>
              The playground is not enabled for the selected project. Click the button below to configure and enable the playground.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={onEmptyStateConfigure} id="empty-state-configure-button">
                  Configure playground
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        ) : (
          <div>
            <Content component="p" style={{ marginBottom: '1.5rem' }} id="modal-subtitle">
              Choose the models you want to make available in this playground from your AI assets.
              You can add additional models by making them available from the{' '}
              <Button
                variant="link"
                isInline
                style={{ padding: 0, fontSize: 'inherit' }}
                onClick={onNavigateToModels}
                id="navigate-to-models-link"
              >
                Model Deployments page
              </Button>.
            </Content>

            <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }} id="modal-step-heading">
              {step === 1 ? 'Available models' : 'Add collections'}
            </Title>

            {step === 1 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ maxWidth: '300px', flex: 1 }}>
                      <SearchInput
                        placeholder="Find by name"
                        value={searchText}
                        onChange={(_e, value) => onSearchTextChange(value)}
                        onClear={() => onSearchTextChange('')}
                        id="model-search-input"
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 'var(--pf-t--global--font--size--sm)',
                        color: 'var(--pf-t--global--text--color--subtle)',
                      }}
                      id="models-selection-count"
                    >
                      {selectedModels.size} out of {inferenceModels.length} selected
                    </span>
                  </div>
                  <Pagination
                    itemCount={inferenceModels.length}
                    perPage={perPage}
                    page={modelsPage}
                    onSetPage={(_e, page) => setModelsPage(page)}
                    onPerPageSelect={(_e, pp) => { setPerPage(pp); setModelsPage(1); }}
                    variant="top"
                    isCompact
                    id="model-pagination"
                  />
                </div>

                <Table variant="compact" id="available-models-table">
                  <Thead>
                    <Tr>
                      <Th width={10} id="th-model-select">
                        <Checkbox
                          id="select-all-models-checkbox"
                          isChecked={allModelsSelected}
                          onChange={onSelectAll}
                        />
                      </Th>
                      <Th
                        width={25}
                        sort={getSortParams(0)}
                        info={{ tooltip: 'Name of the deployed model endpoint' }}
                        id="th-model-name"
                      >
                        Model name
                      </Th>
                      <Th
                        width={10}
                        sort={getSortParams(1)}
                        info={{ tooltip: 'Current availability status of the model' }}
                        id="th-model-status"
                      >
                        Status
                      </Th>
                      <Th width={20} sort={getSortParams(2)} id="th-model-usecase">
                        Use case
                      </Th>
                      <Th width={15} id="th-model-type">
                        Type
                      </Th>
                      <Th
                        width={15}
                        info={{ tooltip: 'Maximum number of tokens the model can generate per request' }}
                        id="th-model-max-tokens"
                      >
                        Max tokens
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedModels.map(model => {
                      const isSelected = selectedModels.has(model.id);
                      return (
                        <Tr key={model.id} id={`model-row-${model.id}`}>
                          <Td>
                            <Checkbox
                              id={`model-checkbox-${model.id}`}
                              isChecked={isSelected}
                              onChange={() => onModelToggle(model.id)}
                            />
                          </Td>
                          <Td dataLabel="Model name">
                            <span style={{ fontWeight: 600 }}>{model.displayName}</span>
                          </Td>
                          <Td dataLabel="Status">
                            {renderStatusIcon(model.status)}
                          </Td>
                          <Td dataLabel="Use case">{model.useCase}</Td>
                          <Td dataLabel="Type">
                            {isSelected ? (
                              <Select
                                id={`model-type-select-${model.id}`}
                                isOpen={openTypeDropdown === model.id}
                                onOpenChange={(open) => setOpenTypeDropdown(open ? model.id : null)}
                                onSelect={(_e, value) => {
                                  setModelTypes(prev => ({ ...prev, [model.id]: value as string }));
                                  setOpenTypeDropdown(null);
                                }}
                                selected={getModelType(model.id)}
                                toggle={(toggleRef) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setOpenTypeDropdown(openTypeDropdown === model.id ? null : model.id)}
                                    isExpanded={openTypeDropdown === model.id}
                                    style={{ width: '100%' }}
                                    id={`model-type-toggle-${model.id}`}
                                  >
                                    {getModelType(model.id)}
                                  </MenuToggle>
                                )}
                              >
                                <SelectList>
                                  <SelectOption value="Inference" id={`type-inference-${model.id}`}>Inference</SelectOption>
                                  <SelectOption value="Embedding" id={`type-embedding-${model.id}`}>Embedding</SelectOption>
                                </SelectList>
                              </Select>
                            ) : (
                              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>—</span>
                            )}
                          </Td>
                          <Td dataLabel="Max tokens">
                            {isSelected ? (
                              <TextInput
                                type="number"
                                value={getModelMaxTokens(model.id)}
                                onChange={(_e, value) => setModelMaxTokens(prev => ({ ...prev, [model.id]: value }))}
                                placeholder="—"
                                aria-label={`Max tokens for ${model.displayName}`}
                                id={`model-max-tokens-${model.id}`}
                              />
                            ) : (
                              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>—</span>
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>

                <Pagination
                  itemCount={inferenceModels.length}
                  perPage={perPage}
                  page={modelsPage}
                  onSetPage={(_e, page) => setModelsPage(page)}
                  onPerPageSelect={(_e, pp) => { setPerPage(pp); setModelsPage(1); }}
                  variant="bottom"
                  isCompact
                  id="model-pagination-bottom"
                />
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ maxWidth: '50%', flex: 1 }}>
                    <SearchInput
                      placeholder="Find by name"
                      value={collectionSearchText}
                      onChange={(_e, value) => setCollectionSearchText(value)}
                      onClear={() => setCollectionSearchText('')}
                      id="collection-search-input"
                    />
                  </div>
                  <Pagination
                    itemCount={filteredCollections.length}
                    perPage={perPage}
                    page={collectionsPage}
                    onSetPage={(_e, page) => setCollectionsPage(page)}
                    onPerPageSelect={(_e, pp) => { setPerPage(pp); setCollectionsPage(1); }}
                    variant="top"
                    isCompact
                    id="collection-pagination"
                  />
                </div>

                <Table variant="compact" id="collections-table">
                  <Thead>
                    <Tr>
                      <Th width={10} id="th-collection-select" style={{ verticalAlign: 'middle' }}>
                        <Checkbox
                          id="select-all-collections-checkbox"
                          isChecked={allCollectionsSelected}
                          onChange={() => {
                            if (onCollectionToggle) {
                              filteredCollections.forEach(c => {
                                const isSelected = selectedCollections.has(c.id);
                                if (allCollectionsSelected && isSelected) {
                                  onCollectionToggle(c.id);
                                } else if (!allCollectionsSelected && !isSelected) {
                                  onCollectionToggle(c.id);
                                }
                              });
                            }
                          }}
                        />
                      </Th>
                      <Th width={30} modifier="nowrap" id="th-collection-name" style={{ verticalAlign: 'middle' }}>
                        Collection name
                      </Th>
                      <Th width={25} modifier="nowrap" id="th-embedding-model" style={{ verticalAlign: 'middle' }}>
                        Embedding model
                      </Th>
                      <Th width={10} modifier="nowrap" id="th-collection-dimensions" style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                        Dimensions
                      </Th>
                      {flags.showVectorStoreTags && (
                      <Th width={15} modifier="nowrap" id="th-collection-labels" style={{ verticalAlign: 'middle' }}>
                        Labels
                      </Th>
                      )}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedCollections.map(collection => {
                      const isSelected = selectedCollections.has(collection.id);
                      return (
                        <Tr key={collection.id} id={`collection-row-${collection.id}`}>
                          <Td style={{ verticalAlign: 'middle' }}>
                            <Checkbox
                              id={`collection-checkbox-${collection.id}`}
                              isChecked={isSelected}
                              onChange={() => onCollectionToggle?.(collection.id)}
                            />
                          </Td>
                          <Td dataLabel="Collection name" modifier="truncate" style={{ verticalAlign: 'middle' }}>
                            <div>
                              <span style={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {collection.collectionName}
                              </span>
                              {collection.subtitle && (
                                <Tooltip content={collection.subtitle}>
                                  <span style={{ display: 'block', color: 'var(--pf-t--global--text--color--subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
                                    {collection.subtitle}
                                  </span>
                                </Tooltip>
                              )}
                            </div>
                          </Td>
                          <Td dataLabel="Embedding model" modifier="truncate" style={{ verticalAlign: 'middle' }}>
                            <div>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                <FlexItem>
                                  <span>{collection.embeddingModel}</span>
                                </FlexItem>
                                <FlexItem>
                                  <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />
                                </FlexItem>
                              </Flex>
                            </div>
                          </Td>
                          <Td dataLabel="Dimensions" modifier="nowrap" style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                            <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: 'var(--pf-t--global--font--size--sm)' }}>
                              {collection.embeddingDimension ? collection.embeddingDimension.toLocaleString('en-US') : '—'}
                            </span>
                          </Td>
                          {flags.showVectorStoreTags && (
                          <Td dataLabel="Labels" style={{ verticalAlign: 'middle' }}>
                            <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                              {collection.owner && (
                                <FlexItem>
                                  <Tooltip content="Owner">
                                    <Label color="blue" isCompact id={`modal-tag-owner-${collection.id}`}>{collection.owner}</Label>
                                  </Tooltip>
                                </FlexItem>
                              )}
                              {collection.domain && (
                                <FlexItem>
                                  <Tooltip content="Domain">
                                    <Label color="blue" isCompact id={`modal-tag-domain-${collection.id}`}>{collection.domain}</Label>
                                  </Tooltip>
                                </FlexItem>
                              )}
                            </Flex>
                          </Td>
                          )}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>

                <div
                  style={{
                    marginTop: '0.75rem',
                    fontSize: 'var(--pf-t--global--font--size--sm)',
                    color: 'var(--pf-t--global--text--color--subtle)',
                  }}
                  id="collections-selection-count"
                >
                  {selectedCollections.size} out of {filteredCollections.length} selected
                </div>
              </>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        {showEmptyState ? (
          <Button variant="link" onClick={handleClose} id="cancel-empty-state-button">
            Cancel
          </Button>
        ) : step === 1 && hasCollections ? (
          <>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              isDisabled={selectedModels.size === 0}
              id="select-collections-button"
            >
              Next select collections
            </Button>
            <Button variant="link" onClick={handleClose} id="cancel-model-selection-button">
              Cancel
            </Button>
          </>
        ) : step === 2 ? (
          <>
            <Button
              variant="secondary"
              icon={<ArrowLeftIcon />}
              onClick={() => setStep(1)}
              id="back-step-button"
            >
              Back to inference models
            </Button>
            <Button
              variant="primary"
              onClick={onConfigure}
              id="configure-playground-button"
            >
              Configure
            </Button>
            <Button variant="link" onClick={handleClose} id="cancel-collections-button">
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={onConfigure}
              isDisabled={selectedModels.size === 0}
              id="configure-playground-button"
            >
              Configure
            </Button>
            <Button variant="link" onClick={handleClose} id="cancel-model-selection-button">
              Cancel
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};
