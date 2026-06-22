import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Content,
  DatePicker,
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  List,
  ListItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Pagination,
  Panel,
  PanelMain,
  PanelMainBody,
  Popover,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
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
import { ExternalLinkAltIcon, SearchIcon, WrenchIcon } from '@patternfly/react-icons';
import { mockFeatureServices, mockFeatureViews } from '../../../mockData/featureStore';

// Mock owner data for feature services
const getFeatureServiceExtras = (featureServiceId: string) => {
  const extras: Record<string, { owner: string }> = {
    'fs-001': { owner: 'acorvin@redhat.com' },
    'fs-002': { owner: 'jsmith@redhat.com' },
    'fs-003': { owner: 'acorvin@redhat.com' },
    'fs-004': { owner: 'mjones@redhat.com' },
  };
  return extras[featureServiceId] || { owner: 'unknown@redhat.com' };
};

// Mock connected workbenches data
const mockConnectedWorkbenches = [
  { name: 'My application', project: 'Banking' },
  { name: 'example', project: 'demo' },
];

const mockProjectsWithoutWorkbenches = [
  { name: 'Project 3' },
  { name: 'Project 4' },
];

// Mock search results with categories
interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: 'Data Sources' | 'Features' | 'Feature Views' | 'Entities' | 'Datasets' | 'Feature Services';
  featureStore?: string;
  tags: string[];
}

// Utility function to highlight matching text
const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  const tagMatch = query.match(/^(\w+)=(.+)$/);
  const searchTerm = tagMatch ? tagMatch[2] : query;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text;
  
  const before = text.slice(0, index);
  const match = text.slice(index, index + searchTerm.length);
  const after = text.slice(index + searchTerm.length);
  
  return (
    <>
      {before}
      <strong style={{ fontWeight: 700 }}>{match}</strong>
      {after}
    </>
  );
};

/**
 * FeatureServicesListPage Component
 * Displays a list of Feature Store feature services with search and filtering capabilities
 */
export const FeatureServicesListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Toolbar filter state
  const [selectedFilterAttribute, setSelectedFilterAttribute] = useState<string>('Feature service');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState('');
  
  // Store multiple filter values as chips
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({
    'Feature service': new Set(),
    Tags: new Set(),
    'Feature Views': new Set(),
    Created: new Set(),
    Updated: new Set(),
    Owner: new Set(),
  });

  // Global search state
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Feature Store context selector state - controlled by URL query param
  const [selectedFeatureStore, setSelectedFeatureStore] = useState(() => {
    const featureStoreParam = searchParams.get('featureStore');
    return featureStoreParam || 'All feature stores';
  });
  const [isFeatureStoreOpen, setIsFeatureStoreOpen] = useState(false);

  // Sync dropdown state from URL param whenever it changes
  useEffect(() => {
    const featureStoreParam = searchParams.get('featureStore');
    setSelectedFeatureStore(featureStoreParam || 'All feature stores');
  }, [searchParams]);

  // Sorting state
  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some(filters => filters.size > 0);
  }, [activeFilters]);

  // Global search results grouped by category
  const globalSearchResults = useMemo(() => {
    if (!globalSearchValue.trim()) return { results: [], total: 0 };
    
    const query = globalSearchValue.toLowerCase();
    
    const matchesFeatureStore = (itemFeatureStore: string | undefined) => {
      return selectedFeatureStore === 'All feature stores' || itemFeatureStore === selectedFeatureStore;
    };
    
    const featureServiceResults: SearchResult[] = mockFeatureServices
      .filter(fs => 
        matchesFeatureStore(fs.featureStore) &&
        (fs.name.toLowerCase().includes(query) ||
        fs.description.toLowerCase().includes(query) ||
        fs.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .map(fs => ({
        id: fs.id,
        name: fs.name,
        description: fs.description,
        category: 'Feature Services' as const,
        featureStore: fs.featureStore,
        tags: fs.tags,
      }));
    
    return { results: featureServiceResults, total: featureServiceResults.length };
  }, [globalSearchValue, selectedFeatureStore]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    globalSearchResults.results.forEach(result => {
      if (!groups[result.category]) {
        groups[result.category] = [];
      }
      groups[result.category].push(result);
    });
    return groups;
  }, [globalSearchResults]);

  // Filter feature services based on selected feature store and active filters
  const filteredFeatureServices = useMemo(() => {
    let featureServices = mockFeatureServices;
    if (selectedFeatureStore !== 'All feature stores') {
      featureServices = mockFeatureServices.filter(fs => fs.featureStore === selectedFeatureStore);
    }
    
    if (!hasActiveFilters) {
      return featureServices;
    }
    
    return featureServices.filter(fs => {
      const extras = getFeatureServiceExtras(fs.id);
      
      for (const [category, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.size === 0) continue;
        
        const matchesAny = Array.from(filterValues).some(filterValue => {
          const searchLower = filterValue.toLowerCase();
          switch (category) {
            case 'Feature service':
              return fs.name.toLowerCase().includes(searchLower) ||
                     fs.description.toLowerCase().includes(searchLower);
            case 'Tags':
              return fs.tags.some(tag => tag.toLowerCase().includes(searchLower));
            case 'Feature Views':
              return fs.featureViewIds.length.toString().includes(searchLower);
            case 'Created':
              return fs.created.toLowerCase().includes(searchLower);
            case 'Updated':
              return fs.lastUpdated.toLowerCase().includes(searchLower);
            case 'Owner':
              return extras.owner.toLowerCase().includes(searchLower);
            default:
              return true;
          }
        });
        
        if (!matchesAny) return false;
      }
      
      return true;
    });
  }, [activeFilters, hasActiveFilters, selectedFeatureStore]);

  // Sorting logic
  const sortedFeatureServices = useMemo(() => {
    if (activeSortIndex === null) return filteredFeatureServices;
    
    const sorted = [...filteredFeatureServices].sort((a, b) => {
      const extrasA = getFeatureServiceExtras(a.id);
      const extrasB = getFeatureServiceExtras(b.id);
      
      let compareA: string | number;
      let compareB: string | number;
      
      switch (activeSortIndex) {
        case 0: // Feature service (name)
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 1: // Feature store
          compareA = a.featureStore.toLowerCase();
          compareB = b.featureStore.toLowerCase();
          break;
        case 3: // Feature Views
          compareA = a.featureViewIds.length;
          compareB = b.featureViewIds.length;
          break;
        case 4: // Created
          compareA = new Date(a.created).getTime();
          compareB = new Date(b.created).getTime();
          break;
        case 5: // Updated
          compareA = new Date(a.lastUpdated).getTime();
          compareB = new Date(b.lastUpdated).getTime();
          break;
        case 6: // Owner
          compareA = extrasA.owner.toLowerCase();
          compareB = extrasB.owner.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (compareA < compareB) return activeSortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return activeSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredFeatureServices, activeSortIndex, activeSortDirection]);

  // Pagination logic
  const paginatedFeatureServices = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return sortedFeatureServices.slice(start, end);
  }, [sortedFeatureServices, page, perPage]);

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  // Handle adding a filter value
  const addFilterValue = (value?: string) => {
    const valueToAdd = value || filterInputValue.trim();
    if (valueToAdd) {
      setActiveFilters(prev => {
        const newSet = new Set(prev[selectedFilterAttribute]);
        newSet.add(valueToAdd);
        return {
          ...prev,
          [selectedFilterAttribute]: newSet
        };
      });
      setFilterInputValue('');
      setPage(1);
    }
  };

  // Handle adding tag filter from table click
  const addTagFilter = (tag: string) => {
    setActiveFilters(prev => {
      const newSet = new Set(prev['Tags']);
      newSet.add(tag);
      return {
        ...prev,
        Tags: newSet
      };
    });
    setPage(1);
  };

  // Handle removing a single filter chip
  const onDeleteChip = (category: string, chip: string) => {
    setActiveFilters(prev => {
      const newSet = new Set(prev[category]);
      newSet.delete(chip);
      return {
        ...prev,
        [category]: newSet
      };
    });
    setPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      'Feature service': new Set(),
      Tags: new Set(),
      'Feature Views': new Set(),
      Created: new Set(),
      Updated: new Set(),
      Owner: new Set(),
    });
    setFilterInputValue('');
    setPage(1);
  };

  // Handle navigation to feature service detail page
  const handleFeatureServiceClick = (featureServiceId: string) => {
    navigate(`/develop-train/feature-store/feature-services/${featureServiceId}${location.search}`);
  };

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.category) {
      case 'Feature Services':
        handleFeatureServiceClick(result.id);
        break;
      case 'Entities':
        navigate(`/develop-train/feature-store/entities/${result.id}`);
        break;
      case 'Data Sources':
        navigate(`/develop-train/feature-store/data-sources/${result.id}`);
        break;
      case 'Feature Views':
        navigate(`/develop-train/feature-store/feature-views/${result.id}`);
        break;
      case 'Features':
        navigate(`/develop-train/feature-store/features/${result.id}`);
        break;
      case 'Datasets':
        navigate(`/develop-train/feature-store/data-sets/${result.id}`);
        break;
    }
    setIsSearchDropdownOpen(false);
    setGlobalSearchValue('');
  };

  // Handle search input key press
  const handleFilterKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addFilterValue();
    }
  };

  // Sorting handler
  const getSortParams = (columnIndex: number): ThProps['sort'] => {
    // Tags column (index 2) is not sortable
    if (columnIndex === 2) return undefined;
    
    return {
      sortBy: {
        index: activeSortIndex ?? undefined,
        direction: activeSortDirection,
      },
      onSort: (_event, index, direction) => {
        setActiveSortIndex(index);
        setActiveSortDirection(direction);
      },
      columnIndex,
    };
  };

  // Column definitions
  const columns = [
    'Feature service',
    'Feature store',
    'Tags',
    'Feature Views',
    'Created',
    'Updated',
    'Owner',
  ];

  return (
    <>
      {/* Page Header Section */}
      <PageSection>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          {/* Top Row: Title + Global Search */}
          <FlexItem>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
              <FlexItem>
                <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ background: 'var(--pf-t--global--color--nonstatus--green--default)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em"><path d="M16,7.375H5c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM15.375,15.375H5.625v-6.75h9.75v6.75Z M31,7.375h-11c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM30.375,15.375h-9.75v-6.75h9.75v6.75Z M16,19.375H5c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM15.375,27.375H5.625v-6.75h9.75v6.75Z M31,19.375h-11c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM30.375,27.375h-9.75v-6.75h9.75v6.75Z"></path></svg>
                  </div>
                  Feature services
                </Title>
              </FlexItem>
              
              {/* Global Search Bar */}
              <FlexItem>
                <div ref={searchContainerRef} style={{ position: 'relative', width: '350px' }}>
                  <Tooltip
                    content="Search by name, description, or tag (e.g., team=platform)"
                    position="top"
                    triggerRef={searchContainerRef}
                  >
                    <SearchInput
                      aria-label="Global search"
                      placeholder="Search by name, description, or tag (e.g., team=platform)"
                      value={globalSearchValue}
                      onChange={(_event, value) => {
                        setGlobalSearchValue(value);
                        setIsSearchDropdownOpen(value.trim().length > 0);
                      }}
                      onFocus={() => {
                        if (globalSearchValue.trim()) {
                          setIsSearchDropdownOpen(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setIsSearchDropdownOpen(false), 200);
                      }}
                      onClear={() => {
                        setGlobalSearchValue('');
                        setIsSearchDropdownOpen(false);
                      }}
                    />
                  </Tooltip>
                  
                  {/* Search Dropdown */}
                  {isSearchDropdownOpen && globalSearchValue.trim().length > 0 && (
                    <Panel
                      variant="raised"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        width: '420px',
                        maxHeight: '450px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        marginTop: '4px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <PanelMain>
                        <PanelMainBody style={{ padding: '16px 0' }}>
                          <div style={{ textAlign: 'center', marginBottom: '16px', padding: '0 16px' }}>
                            <span style={{ color: 'var(--pf-t--global--text--color--link--default)', textDecoration: 'none' }}>
                              {globalSearchResults.total} results from {selectedFeatureStore}
                            </span>
                          </div>
                          
                          <Divider />
                          
                          {globalSearchResults.total === 0 ? (
                            <Content component="p" style={{ padding: '16px' }}>No results found</Content>
                          ) : (
                            Object.entries(groupedResults).map(([category, results], categoryIndex) => (
                              <div key={category}>
                                {categoryIndex > 0 && <Divider />}
                                <div style={{ padding: '0 16px' }}>
                                  <Content component="small" style={{ color: '#6a6e73', fontWeight: 600, marginTop: '12px', marginBottom: '8px', display: 'block' }}>
                                    {category}
                                  </Content>
                                  {results.map((result) => (
                                    <div
                                      key={result.id}
                                      style={{
                                        padding: '8px 0',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => handleSearchResultClick(result)}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }}
                                    >
                                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                        <FlexItem>
                                          <span style={{ fontWeight: 400 }}>
                                            {highlightMatch(result.name, globalSearchValue)}
                                          </span>
                                        </FlexItem>
                                        {result.featureStore && (
                                          <FlexItem>
                                            <Label isCompact variant="outline" color="blue">{result.featureStore}</Label>
                                          </FlexItem>
                                        )}
                                      </Flex>
                                      <Content component="small" style={{ color: '#6a6e73', display: 'block', marginTop: '4px' }}>
                                        {highlightMatch(result.description, globalSearchValue)}
                                      </Content>
                                      {result.tags.length > 0 && (() => {
                                        const matchingTags = result.tags.filter(tag => 
                                          tag.toLowerCase().includes(globalSearchValue.toLowerCase())
                                        );
                                        return matchingTags.length > 0 ? (
                                          <Flex spaceItems={{ default: 'spaceItemsXs' }} style={{ marginTop: '8px' }}>
                                            {matchingTags.map((tag, idx) => (
                                              <FlexItem key={idx}>
                                                <Label color="blue" isCompact>
                                                  {highlightMatch(tag, globalSearchValue)}
                                                </Label>
                                              </FlexItem>
                                            ))}
                                          </Flex>
                                        ) : null;
                                      })()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </PanelMainBody>
                      </PanelMain>
                    </Panel>
                  )}
                </div>
              </FlexItem>
            </Flex>
          </FlexItem>
          
          {/* Description */}
          <FlexItem>
            <Content component="p">
              API endpoints for serving features in production.
            </Content>
          </FlexItem>
          
          {/* Feature Store Dropdown + Workbench Link Row */}
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsLg' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <span style={{ fontWeight: 400 }}>Feature store</span>
                  </FlexItem>
                  <FlexItem>
                    <Select
                      aria-label="Select feature store"
                      isOpen={isFeatureStoreOpen}
                      selected={selectedFeatureStore}
                      onSelect={(_event, value) => {
                        const newValue = value as string;
                        setSelectedFeatureStore(newValue);
                        setIsFeatureStoreOpen(false);
                        if (newValue === 'All feature stores') {
                          searchParams.delete('featureStore');
                        } else {
                          searchParams.set('featureStore', newValue);
                        }
                        setSearchParams(searchParams, { replace: true });
                      }}
                      onOpenChange={(isOpen) => setIsFeatureStoreOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsFeatureStoreOpen(!isFeatureStoreOpen)}
                          isExpanded={isFeatureStoreOpen}
                          style={{ minWidth: '180px' }}
                        >
                          {selectedFeatureStore}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        <SelectOption value="All feature stores" isSelected={selectedFeatureStore === 'All feature stores'}>
                          All feature stores
                        </SelectOption>
                        <SelectOption value="Fraud detection">Fraud detection</SelectOption>
                        <SelectOption value="Customer analytics">Customer analytics</SelectOption>
                        <SelectOption value="Product recommendations">Product recommendations</SelectOption>
                      </SelectList>
                    </Select>
                  </FlexItem>
                </Flex>
              </FlexItem>
              
              <FlexItem>
                <Popover
                  position="right"
                  aria-label="Connected workbenches"
                  headerContent="Connected workbenches"
                  showClose
                  minWidth="460px"
                  bodyContent={
                    <div>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                          Workbenches already connected to the {selectedFeatureStore === 'All feature stores' ? <strong>All feature stores</strong> : <strong>{selectedFeatureStore}</strong>} feature store:
                        </div>
                        <List style={{ marginLeft: '8px' }}>
                          {mockConnectedWorkbenches.map((wb, idx) => (
                            <ListItem key={idx} style={{ fontSize: '14px' }}>
                              <Button variant="link" isInline icon={<ExternalLinkAltIcon />} iconPosition="end" style={{ fontWeight: 600 }}>{wb.name}</Button>
                              {' '}in{' '}
                              <Button variant="link" isInline style={{ fontWeight: 600 }}>{wb.project}</Button>
                              {' '}project
                            </ListItem>
                          ))}
                        </List>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                          Projects that can access the {selectedFeatureStore === 'All feature stores' ? <strong>All feature stores</strong> : <strong>{selectedFeatureStore}</strong>} feature store but do not have connected workbenches:
                        </div>
                        <List style={{ marginLeft: '8px' }}>
                          {mockProjectsWithoutWorkbenches.map((project, idx) => (
                            <ListItem key={idx} style={{ fontSize: '14px' }}>
                              <Button variant="link" isInline style={{ fontWeight: 600 }}>{project.name}</Button>
                              {' '}project
                            </ListItem>
                          ))}
                        </List>
                      </div>
                    </div>
                  }
                >
                  <Button variant="link" icon={<WrenchIcon />}>
                    View connected workbenches
                  </Button>
                </Popover>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Toolbar Section */}
      <PageSection padding={{ default: 'noPadding' }} style={{ paddingLeft: 'var(--pf-t--global--spacer--lg)', paddingRight: 'var(--pf-t--global--spacer--lg)', marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Toolbar 
          id="feature-services-toolbar" 
          clearAllFilters={clearAllFilters}
        >
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                <Select
                  aria-label="Select filter attribute"
                  isOpen={isFilterDropdownOpen}
                  selected={selectedFilterAttribute}
                  onSelect={(_event, value) => {
                    setSelectedFilterAttribute(value as string);
                    setIsFilterDropdownOpen(false);
                  }}
                  onOpenChange={(isOpen) => setIsFilterDropdownOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      isExpanded={isFilterDropdownOpen}
                      style={{ width: '150px' }}
                    >
                      {selectedFilterAttribute}
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <SelectList>
                    {columns.map((column) => (
                      <SelectOption 
                        key={column} 
                        value={column}
                        isSelected={selectedFilterAttribute === column}
                      >
                        {column}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                {selectedFilterAttribute === 'Created' || selectedFilterAttribute === 'Updated' ? (
                  <DatePicker
                    aria-label={`Filter by ${selectedFilterAttribute}`}
                    placeholder="Select date"
                    onChange={(_event, value) => {
                      if (value) {
                        addFilterValue(value);
                      }
                    }}
                    style={{ minWidth: '250px' }}
                  />
                ) : (
                  <TextInput
                    type="text"
                    aria-label={`Filter by ${selectedFilterAttribute}`}
                    placeholder={`Filter by ${selectedFilterAttribute.toLowerCase()}`}
                    value={filterInputValue}
                    onChange={(_event, value) => setFilterInputValue(value)}
                    onKeyDown={handleFilterKeyPress}
                    style={{ minWidth: '250px' }}
                  />
                )}
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarItem variant="pagination" style={{ marginLeft: 'auto' }}>
              <Pagination
                itemCount={sortedFeatureServices.length}
                perPage={perPage}
                page={page}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                variant="top"
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
          
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <ToolbarContent>
              <ToolbarGroup>
                {Object.entries(activeFilters).map(([category, chipsSet]) => {
                  const chips = Array.from(chipsSet);
                  return chips.length > 0 ? (
                    <ToolbarItem key={category}>
                      <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Content component="small" style={{ fontWeight: 'bold' }}>{category}:</Content>
                        </FlexItem>
                        <FlexItem>
                          <LabelGroup categoryName={category} numLabels={10}>
                            {chips.map((chip, index) => (
                              <Label
                                key={`${category}-${chip}-${index}`}
                                color="blue"
                                onClose={() => onDeleteChip(category, chip)}
                              >
                                {chip}
                              </Label>
                            ))}
                          </LabelGroup>
                        </FlexItem>
                      </Flex>
                    </ToolbarItem>
                  ) : null;
                })}
                <ToolbarItem>
                  <Button variant="link" onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          )}
        </Toolbar>
      </PageSection>

      {/* Table Section */}
      <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 350px)' }}>
        {sortedFeatureServices.length === 0 ? (
          <EmptyState variant={EmptyStateVariant.sm} icon={SearchIcon}>
            <Title headingLevel="h2" size="lg">
              No results found
            </Title>
            <EmptyStateBody>
              No feature services match your filter criteria. Try adjusting your filters.
            </EmptyStateBody>
            <Button variant="link" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </EmptyState>
        ) : (
          <>
            <Table aria-label="Feature services table" variant="compact">
              <Thead>
                <Tr>
                  <Th sort={getSortParams(0)}>Feature service</Th>
                  <Th sort={getSortParams(1)}>Feature store</Th>
                  <Th sort={getSortParams(2)}>Tags</Th>
                  <Th 
                    sort={getSortParams(3)}
                    info={{
                      popover: 'The number of feature views included in this feature service. Feature views group related features and define how they\'re fetched from the source data.',
                      ariaLabel: 'Feature Views help',
                      popoverProps: { headerContent: 'Feature Views' }
                    }}
                  >
                    Feature Views
                  </Th>
                  <Th sort={getSortParams(4)}>Created</Th>
                  <Th sort={getSortParams(5)}>Updated</Th>
                  <Th sort={getSortParams(6)}>Owner</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedFeatureServices.map((featureService) => {
                  const extras = getFeatureServiceExtras(featureService.id);
                  const featureViewNames = featureService.featureViewIds.map(fvId => {
                    const fv = mockFeatureViews.find(f => f.id === fvId);
                    return fv?.name || fvId;
                  });
                  return (
                    <Tr key={featureService.id}>
                      {/* Feature service Column - Name with Description */}
                      <Td dataLabel="Feature service">
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                          <FlexItem>
                            <Button
                              variant="link"
                              isInline
                              onClick={() => handleFeatureServiceClick(featureService.id)}
                            >
                              {featureService.name}
                            </Button>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small">
                              {featureService.description}
                            </Content>
                          </FlexItem>
                        </Flex>
                      </Td>

                      {/* Feature Store Column */}
                      <Td dataLabel="Feature store">{featureService.featureStore}</Td>

                      {/* Tags Column */}
                      <Td dataLabel="Tags">
                        <LabelGroup numLabels={2}>
                          {featureService.tags.map((tag, index) => (
                            <Label 
                              key={index} 
                              color="blue"
                              onClick={() => addTagFilter(tag)}
                              style={{ cursor: 'pointer' }}
                            >
                              {tag}
                            </Label>
                          ))}
                        </LabelGroup>
                      </Td>

                      {/* Feature Views Column - Count with Popover */}
                      <Td dataLabel="Feature Views">
                        <Popover
                          aria-label="Feature views"
                          hasAutoWidth
                          showClose={true}
                          bodyContent={
                            featureViewNames.length > 0 ? (
                              <List isPlain style={{ fontSize: '14px' }}>
                                {featureViewNames.map((viewName, idx) => {
                                  const fvId = featureService.featureViewIds[idx];
                                  return (
                                    <ListItem key={idx}>
                                      •{' '}
                                      <Button
                                        variant="link"
                                        isInline
                                        onClick={() => navigate(`/develop-train/feature-store/feature-views/${fvId}`)}
                                      >
                                        {viewName}
                                      </Button>
                                    </ListItem>
                                  );
                                })}
                              </List>
                            ) : (
                              <Content component="small" style={{ fontSize: '14px' }}>No feature views associated</Content>
                            )
                          }
                        >
                          <Button
                            variant="link"
                            isInline
                          >
                            {featureService.featureViewIds.length} feature view{featureService.featureViewIds.length !== 1 ? 's' : ''}
                          </Button>
                        </Popover>
                      </Td>

                      {/* Created Column */}
                      <Td dataLabel="Created">{featureService.created}</Td>

                      {/* Updated Column */}
                      <Td dataLabel="Updated">{featureService.lastUpdated}</Td>

                      {/* Owner Column */}
                      <Td dataLabel="Owner">{extras.owner}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
              <FlexItem>
                <Pagination
                  itemCount={sortedFeatureServices.length}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant="bottom"
                  isCompact
                />
              </FlexItem>
            </Flex>
          </>
        )}
      </PageSection>
    </>
  );
};

export default FeatureServicesListPage;

