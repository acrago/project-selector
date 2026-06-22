import React, { useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Pagination,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
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
  EllipsisVIcon,
  FilterIcon
} from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

interface RegisteredModel {
  id: number;
  name: string;
  description?: string;
  labels: string[];
  lastModified: string;
  owner: string;
}

// Mock data for registered models
const mockModels: RegisteredModel[] = [
  {
    id: 106,
    name: 'granite-8b-code-base-1.4.0',
    description: 'Granite-8B-Code-Base is a decoder-only code model designed for code generative tasks (e.g., code generation, code explanation, code fixing, etc.). It is trained from scratch with a two-phase training strategy. In phase 1, our model is trained on 4 trillion tokens sourced from 116 programming languages, guaranteeing a comprehensive understanding of programming languages and syntax. In phase 2, our model is trained on 500 billion tokens with a carefully designed mixture of high-quality data from code and natural language domains to improve the models\' ability to reason and follow instructions.',
    labels: [],
    lastModified: '2025-09-29T17:00:52.169Z',
    owner: 'stmccart@redhat.com'
  },
  {
    id: 108,
    name: 'granite-7b-redhat-lab-1.4.0',
    description: 'LAB: Large-scale Alignment for chatBots is a novel synthetic data-based alignment tuning method for LLMs from IBM Research. Granite-7b-lab is a Granite-7b-base derivative model trained with the LAB methodology, using Mixtral-8x7b-Instruct as a teacher model.',
    labels: ['text-generation'],
    lastModified: '2025-09-29T13:41:49.170Z',
    owner: 'stmccart@redhat.com'
  },
  {
    id: 140,
    name: 'Mistral-7B-Instruct-v0.3-quantized.w4a16-1.5.0',
    description: 'Similarly to Mistral-7B-Instruct-v0.3, this models is intended for assistant-like chat. Quantized version of Mistral-7B-Instruct-v0.3. It achieves an average score of 65.08 on the OpenLLM benchmark (version 1), whereas the unquantized model achieves 66.42.',
    labels: ['inference', 'text-generation'],
    lastModified: '2025-09-12T14:34:33.040Z',
    owner: 'cbucur@redhat.com'
  },
  {
    id: 128,
    name: 'yolo-finetuned-drones',
    description: '',
    labels: [],
    lastModified: '2025-09-08T16:17:24.304Z',
    owner: 'mcaimi@redhat.com'
  },
  {
    id: 110,
    name: 'mmortari-demo20250903-modelSourceFromDSP-model',
    description: '',
    labels: [],
    lastModified: '2025-09-05T08:47:43.418Z',
    owner: 'pipeline-author'
  },
  {
    id: 100,
    name: 'granite-7b-starter-1.4.0',
    description: 'The Granite-7b-starter is the fourth member of the IBM Granite model series and is based on the Granite-7b-base model tuned using a combination of open source instruction datasets. It outperforms most similarly-sized open models including Mistral-7B-Instruct-v0.2 and Llama-2-7b-chat on a variety of downstream tasks.',
    labels: ['text-generation'],
    lastModified: '2025-08-30T14:22:11.331Z',
    owner: 'stmccart@redhat.com'
  }
];

export const RegistryModelsTab: React.FunctionComponent = () => {
  const navigate = useNavigate();
  
  // State
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterAttribute, setFilterAttribute] = useState<'name' | 'keyword' | 'owner' | 'labels'>('keyword');
  const [filterInput, setFilterInput] = useState('');
  const [splitButtonDropdownOpen, setSplitButtonDropdownOpen] = useState(false);
  const [registerKebabMenuOpen, setRegisterKebabMenuOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    name: string[];
    keyword: string[];
    owner: string[];
    labels: string[];
  }>({
    name: [],
    keyword: [],
    owner: [],
    labels: []
  });
  const [sortBy, setSortBy] = useState<'name' | 'modified'>('modified');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [openKebabMenus, setOpenKebabMenus] = useState<Set<number>>(new Set());
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

  // Filter options for dropdown
  const filterOptions = [
    { value: 'name', label: 'Name' },
    { value: 'keyword', label: 'Keyword' },
    { value: 'owner', label: 'Owner' },
    { value: 'labels', label: 'Labels' }
  ];

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = mockModels;

    // Apply active filters
    filtered = filtered.filter(model => {
      const matchesNameFilters = activeFilters.name.length === 0 || 
        activeFilters.name.some(filter => 
          model.name.toLowerCase().includes(filter.toLowerCase())
        );

      const matchesKeywordFilters = activeFilters.keyword.length === 0 || 
        activeFilters.keyword.some(filter => 
          model.name.toLowerCase().includes(filter.toLowerCase()) ||
          (model.description && model.description.toLowerCase().includes(filter.toLowerCase()))
        );

      const matchesOwnerFilters = activeFilters.owner.length === 0 || 
        activeFilters.owner.some(filter => 
          model.owner.toLowerCase().includes(filter.toLowerCase())
        );

      const matchesLabelsFilters = activeFilters.labels.length === 0 || 
        activeFilters.labels.some(filter => 
          model.labels.some(label => label.toLowerCase().includes(filter.toLowerCase()))
        );

      return matchesNameFilters && matchesKeywordFilters && matchesOwnerFilters && matchesLabelsFilters;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'modified':
          comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [activeFilters, sortBy, sortDirection]);

  // Pagination
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedModels = filteredAndSortedModels.slice(startIndex, endIndex);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  // Filter management functions
  const addFilter = (filterType: 'name' | 'keyword' | 'owner' | 'labels', value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: [...prev[filterType], value]
    }));
    setFilterInput('');
    setCurrentPage(1);
  };

  const removeFilter = (filterType: 'name' | 'keyword' | 'owner' | 'labels', value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].filter(f => f !== value)
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setActiveFilters({
      name: [],
      keyword: [],
      owner: [],
      labels: []
    });
    setCurrentPage(1);
  };

  // Get placeholder text based on selected filter
  const getFilterPlaceholder = () => {
    switch (filterAttribute) {
      case 'name':
        return 'Filter by name';
      case 'owner':
        return 'Filter by owner';
      case 'labels':
        return 'Filter by labels';
      default:
        return 'Filter by keyword';
    }
  };

  // Sorting handler
  const handleSort = (column: 'name' | 'modified') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Kebab menu toggle
  const toggleKebabMenu = (modelId: number) => {
    setOpenKebabMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (_id: number) => {
    setIsFeatureModalOpen(true);
    setOpenKebabMenus(new Set());
  };

  const handleArchiveModel = (_id: number) => {
    setIsFeatureModalOpen(true);
    setOpenKebabMenus(new Set());
  };

  const handleModelNameClick = () => {
    setIsFeatureModalOpen(true);
  };

  return (
    <>
      {/* Toolbar */}
      <Toolbar>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <InputGroup>
                <InputGroupItem>
                  <Dropdown
                    isOpen={filterDropdownOpen}
                    onOpenChange={(isOpen) => setFilterDropdownOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                        aria-label="Filter attribute selector"
                        isExpanded={filterDropdownOpen}
                        style={{
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          minWidth: '120px'
                        }}
                        id="models-filter-toggle"
                      >
                        <FilterIcon style={{ marginRight: '0.5rem' }} />
                        {filterOptions.find(opt => opt.value === filterAttribute)?.label || 'Keyword'}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {filterOptions.map((option) => (
                        <DropdownItem key={option.value} onClick={() => {
                          setFilterAttribute(option.value as 'name' | 'keyword' | 'owner' | 'labels');
                          setFilterInput('');
                        }}>
                          {option.label}
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </Dropdown>
                </InputGroupItem>
                <InputGroupItem isFill>
                  <SearchInput
                    placeholder={getFilterPlaceholder()}
                    value={filterInput}
                    onChange={(_event, value) => setFilterInput(value)}
                    onSearch={() => {
                      if (filterInput.trim()) {
                        addFilter(filterAttribute, filterInput.trim());
                      }
                    }}
                    onClear={() => setFilterInput('')}
                    style={{ 
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      minWidth: '300px'
                    }}
                    data-testid="registered-model-table-search"
                    id="models-search-input"
                  />
                </InputGroupItem>
              </InputGroup>
            </ToolbarItem>
          </ToolbarGroup>

          {/* Split Button for Register/Archive Model */}
          <ToolbarGroup>
            <ToolbarItem>
              <div style={{ display: 'flex' }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    navigate('/ai-hub/models/registry/new-model');
                  }}
                  style={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRight: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                  id="register-model-button"
                >
                  Register model
                </Button>
                <Dropdown
                  isOpen={splitButtonDropdownOpen}
                  onOpenChange={(isOpen) => setSplitButtonDropdownOpen(isOpen)}
                  popperProps={{ position: 'right'}}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setSplitButtonDropdownOpen(!splitButtonDropdownOpen)}
                      variant="primary"
                      aria-label="Split button dropdown toggle"
                      style={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0
                      }}
                      id="register-model-dropdown-toggle"
                    />
                  )}
                >
                  <DropdownList>
                    <DropdownItem
                      key="register-new-model"
                      onClick={() => {
                        setSplitButtonDropdownOpen(false);
                        console.log('Register new model clicked');
                      }}
                    >
                      Register new model
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </div>
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={registerKebabMenuOpen}
                onOpenChange={(isOpen) => setRegisterKebabMenuOpen(isOpen)}
                popperProps={{ position: 'right'}}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setRegisterKebabMenuOpen(!registerKebabMenuOpen)}
                    variant="plain"
                    isExpanded={registerKebabMenuOpen}
                    aria-label="Register model actions menu"
                    id="register-model-kebab-toggle"
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem
                    key="view-archived-models"
                    onClick={() => {
                      setRegisterKebabMenuOpen(false);
                      console.log('View archived models clicked');
                    }}
                  >
                    View archived models
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
          </ToolbarGroup>

          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={filteredAndSortedModels.length}
              page={currentPage}
              perPage={perPage}
              onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
              onPerPageSelect={(_, perPage) => {
                setPerPage(perPage);
                setCurrentPage(1);
              }}
              variant="top"
              isCompact
              perPageOptions={[
                { title: '5', value: 5 },
                { title: '10', value: 10 },
                { title: '20', value: 20 },
                { title: '50', value: 50 }
              ]}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {/* Active Filters Row */}
      {(activeFilters.name.length > 0 || activeFilters.keyword.length > 0 || activeFilters.owner.length > 0 || activeFilters.labels.length > 0) && (
        <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
          <LabelGroup
            categoryName="Active filters"
            isClosable={false}
            numLabels={activeFilters.name.length + activeFilters.keyword.length + activeFilters.owner.length + activeFilters.labels.length}
          >
            {activeFilters.name.map(filter => (
              <Label 
                key={`name-${filter}`}
                variant="outline"
                onClose={() => removeFilter('name', filter)}
              >
                Name: {filter}
              </Label>
            ))}
            {activeFilters.keyword.map(filter => (
              <Label 
                key={`keyword-${filter}`}
                variant="outline"
                onClose={() => removeFilter('keyword', filter)}
              >
                Keyword: {filter}
              </Label>
            ))}
            {activeFilters.owner.map(filter => (
              <Label 
                key={`owner-${filter}`}
                variant="outline"
                onClose={() => removeFilter('owner', filter)}
              >
                Owner: {filter}
              </Label>
            ))}
            {activeFilters.labels.map(filter => (
              <Label 
                key={`labels-${filter}`}
                variant="outline"
                onClose={() => removeFilter('labels', filter)}
              >
                Label: {filter}
              </Label>
            ))}
          </LabelGroup>
          <Button variant="link" onClick={clearAllFilters} style={{ marginTop: '0.5rem' }}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Table */}
      <Table>
        <Thead>
          <Tr>
            <Th
              sort={{
                sortBy: sortBy === 'name' ? { index: 1, direction: sortDirection } : {},
                onSort: () => handleSort('name'),
                columnIndex: 1
              }}
              modifier="wrap"
            >
              Model name
            </Th>
            <Th modifier="wrap">Labels</Th>
            <Th
              sort={{
                sortBy: sortBy === 'modified' ? { index: 3, direction: sortDirection } : {},
                onSort: () => handleSort('modified'),
                columnIndex: 3
              }}
              modifier="wrap"
            >
              Last modified
            </Th>
            <Th 
              sort={{
                sortBy: { index: 4, direction: 'asc' },
                onSort: () => {},
                columnIndex: 4
              }} 
              modifier="wrap"
            >
              Owner
            </Th>
            <Th modifier="wrap" style={{ width: '60px' }}>
              {/* Actions column header - empty */}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedModels.map((model) => (
            <Tr key={model.id}>
              <Td dataLabel="Model name" style={{ textAlign: 'left', maxWidth: '300px', width: '300px' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-start', 
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  width: '100%',
                  maxWidth: '300px'
                }}>
                  <div style={{ width: '100%', textAlign: 'left' }}>
                    <Button
                      variant="link"
                      onClick={handleModelNameClick}
                      style={{ 
                        fontWeight: 'bold', 
                        padding: 0, 
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        display: 'block',
                        width: '100%',
                        minWidth: 0,
                        textDecoration: 'none'
                      }}
                    >
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        width: '100%'
                      }}>
                        {model.name}
                      </span>
                    </Button>
                  </div>
                  {model.description && (
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#6A6E73', 
                      marginTop: '0.125rem',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textAlign: 'left',
                      width: '100%'
                    }}>
                      {model.description}
                    </div>
                  )}
                </div>
              </Td>
              <Td dataLabel="Labels">
                {model.labels.length > 0 ? (
                  <div className="pf-v6-c-label-group">
                    <div className="pf-v6-c-label-group__main">
                      <ul className="pf-v6-c-label-group__list" aria-label="Label group category" role="list">
                        {model.labels.map((label, index) => (
                          <li key={index} className="pf-v6-c-label-group__list-item">
                            <Label variant="filled" color="blue" className="pf-v6-c-label">
                              {label}
                            </Label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <span>-</span>
                )}
              </Td>
              <Td dataLabel="Last modified">
                <time className="pf-v6-c-timestamp pf-m-help-text">
                  {formatDate(model.lastModified)}
                </time>
              </Td>
              <Td dataLabel="Owner">
                <div className="pf-v6-c-content">
                  {model.owner}
                </div>
              </Td>
              <Td dataLabel="Actions" style={{ textAlign: 'right', width: '60px' }}>
              <Dropdown
                  isOpen={openKebabMenus.has(model.id)}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setOpenKebabMenus(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(model.id);
                        return newSet;
                      });
                    }
                  }}
                  popperProps={{ position: 'right'}}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => toggleKebabMenu(model.id)}
                      variant="plain"
                      aria-label={`Actions for ${model.name}`}
                      isExpanded={openKebabMenus.has(model.id)}
                    >
                      <EllipsisVIcon />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem 
                      key="view-details"
                      onClick={() => handleViewDetails(model.id)}
                    >
                      View details
                    </DropdownItem>
                    <DropdownItem 
                      key="archive-model"
                      onClick={() => handleArchiveModel(model.id)}
                    >
                      Archive model
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Bottom Pagination */}
      <Pagination
        itemCount={filteredAndSortedModels.length}
        page={currentPage}
        perPage={perPage}
        onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
        variant="bottom"
        style={{ marginTop: '1rem' }}
        perPageOptions={[
          { title: '5', value: 5 },
          { title: '10', value: 10 },
          { title: '20', value: 20 },
          { title: '50', value: 50 }
        ]}
      />

      {/* Feature Not Available Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
      >
        <ModalHeader title="Not shown" />
        <ModalBody>
          This feature is not yet implemented in the prototype.
        </ModalBody>
        <ModalFooter>
          <Button key="ok" variant="primary" onClick={() => setIsFeatureModalOpen(false)}>
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

