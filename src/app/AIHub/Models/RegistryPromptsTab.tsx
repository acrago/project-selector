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

interface RegisteredPrompt {
  id: number;
  name: string;
  description?: string;
  labels: string[];
  lastModified: string;
  owner: string;
  version: string;
}

// Mock data for registered prompts
const mockPrompts: RegisteredPrompt[] = [
  {
    id: 1,
    name: 'product-description-generator',
    description: 'Generate compelling product descriptions for e-commerce listings based on product features and target audience.',
    labels: ['marketing', 'e-commerce'],
    lastModified: '2025-12-01T10:30:00.000Z',
    owner: 'jdoe@redhat.com',
    version: '1.2.0'
  },
  {
    id: 2,
    name: 'code-review-assistant',
    description: 'Provide detailed code review feedback focusing on best practices, security, and performance.',
    labels: ['development', 'code-quality'],
    lastModified: '2025-11-28T14:15:00.000Z',
    owner: 'asmith@redhat.com',
    version: '2.0.1'
  },
  {
    id: 3,
    name: 'customer-support-responder',
    description: '',
    labels: ['support', 'customer-service'],
    lastModified: '2025-11-25T09:45:00.000Z',
    owner: 'mjohnson@redhat.com',
    version: '1.5.0'
  },
  {
    id: 4,
    name: 'technical-documentation-writer',
    description: 'Generate clear and comprehensive technical documentation for software APIs and features.',
    labels: ['documentation'],
    lastModified: '2025-11-20T16:20:00.000Z',
    owner: 'bwilson@redhat.com',
    version: '1.0.3'
  },
  {
    id: 5,
    name: 'sentiment-analyzer',
    description: 'Analyze text sentiment and categorize as positive, negative, or neutral with confidence scores.',
    labels: ['analytics', 'nlp'],
    lastModified: '2025-11-15T11:00:00.000Z',
    owner: 'edavis@redhat.com',
    version: '1.1.0'
  }
];

export const RegistryPromptsTab: React.FunctionComponent = () => {
  // State
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterAttribute, setFilterAttribute] = useState<'name' | 'keyword' | 'owner' | 'labels'>('keyword');
  const [filterInput, setFilterInput] = useState('');
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

  // Filter and sort prompts
  const filteredAndSortedPrompts = useMemo(() => {
    let filtered = mockPrompts;

    // Apply active filters
    filtered = filtered.filter(prompt => {
      const matchesNameFilters = activeFilters.name.length === 0 || 
        activeFilters.name.some(filter => 
          prompt.name.toLowerCase().includes(filter.toLowerCase())
        );

      const matchesKeywordFilters = activeFilters.keyword.length === 0 || 
        activeFilters.keyword.some(filter => 
          prompt.name.toLowerCase().includes(filter.toLowerCase()) ||
          (prompt.description && prompt.description.toLowerCase().includes(filter.toLowerCase()))
        );

      const matchesOwnerFilters = activeFilters.owner.length === 0 || 
        activeFilters.owner.some(filter => 
          prompt.owner.toLowerCase().includes(filter.toLowerCase())
        );

      const matchesLabelsFilters = activeFilters.labels.length === 0 || 
        activeFilters.labels.some(filter => 
          prompt.labels.some(label => label.toLowerCase().includes(filter.toLowerCase()))
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
  const paginatedPrompts = filteredAndSortedPrompts.slice(startIndex, endIndex);

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
  const toggleKebabMenu = (promptId: number) => {
    setOpenKebabMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (_id: number) => {
    setIsFeatureModalOpen(true);
    setOpenKebabMenus(new Set());
  };

  const handleArchivePrompt = (_id: number) => {
    setIsFeatureModalOpen(true);
    setOpenKebabMenus(new Set());
  };

  const handlePromptNameClick = () => {
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
                        id="prompts-filter-toggle"
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
                    data-testid="registered-prompt-table-search"
                    id="prompts-search-input"
                  />
                </InputGroupItem>
              </InputGroup>
            </ToolbarItem>
          </ToolbarGroup>

          <ToolbarGroup>
            <ToolbarItem>
              <Button
                variant="primary"
                onClick={() => setIsFeatureModalOpen(true)}
                id="register-prompt-button"
              >
                Register prompt
              </Button>
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
                    aria-label="Register prompt actions menu"
                    id="register-prompt-kebab-toggle"
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem
                    key="view-archived-prompts"
                    onClick={() => {
                      setRegisterKebabMenuOpen(false);
                      console.log('View archived prompts clicked');
                    }}
                  >
                    View archived prompts
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
          </ToolbarGroup>

          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={filteredAndSortedPrompts.length}
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
              Prompt name
            </Th>
            <Th modifier="wrap">Version</Th>
            <Th modifier="wrap">Labels</Th>
            <Th
              sort={{
                sortBy: sortBy === 'modified' ? { index: 4, direction: sortDirection } : {},
                onSort: () => handleSort('modified'),
                columnIndex: 4
              }}
              modifier="wrap"
            >
              Last modified
            </Th>
            <Th 
              sort={{
                sortBy: { index: 5, direction: 'asc' },
                onSort: () => {},
                columnIndex: 5
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
          {paginatedPrompts.map((prompt) => (
            <Tr key={prompt.id}>
              <Td dataLabel="Prompt name" style={{ textAlign: 'left', maxWidth: '300px', width: '300px' }}>
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
                      onClick={handlePromptNameClick}
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
                        {prompt.name}
                      </span>
                    </Button>
                  </div>
                  {prompt.description && (
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
                      {prompt.description}
                    </div>
                  )}
                </div>
              </Td>
              <Td dataLabel="Version">
                <span>{prompt.version}</span>
              </Td>
              <Td dataLabel="Labels">
                {prompt.labels.length > 0 ? (
                  <div className="pf-v6-c-label-group">
                    <div className="pf-v6-c-label-group__main">
                      <ul className="pf-v6-c-label-group__list" aria-label="Label group category" role="list">
                        {prompt.labels.map((label, index) => (
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
                  {formatDate(prompt.lastModified)}
                </time>
              </Td>
              <Td dataLabel="Owner">
                <div className="pf-v6-c-content">
                  {prompt.owner}
                </div>
              </Td>
              <Td dataLabel="Actions" style={{ textAlign: 'right', width: '60px' }}>
              <Dropdown
                  isOpen={openKebabMenus.has(prompt.id)}
                  onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setOpenKebabMenus(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(prompt.id);
                        return newSet;
                      });
                    }
                  }}
                  popperProps={{ position: 'right'}}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => toggleKebabMenu(prompt.id)}
                      variant="plain"
                      aria-label={`Actions for ${prompt.name}`}
                      isExpanded={openKebabMenus.has(prompt.id)}
                    >
                      <EllipsisVIcon />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem 
                      key="view-details"
                      onClick={() => handleViewDetails(prompt.id)}
                    >
                      View details
                    </DropdownItem>
                    <DropdownItem 
                      key="archive-prompt"
                      onClick={() => handleArchivePrompt(prompt.id)}
                    >
                      Archive prompt
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
        itemCount={filteredAndSortedPrompts.length}
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

