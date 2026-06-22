import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { CheckIcon, ExternalLinkAltIcon, SearchIcon, WrenchIcon } from '@patternfly/react-icons';
import { 
  getFeatureCountForView, 
  getFeatureNamesForView, 
  getFeatureViewType,
  mockFeatureViews,
  mockFeatures,
} from '../../../mockData/featureStore';

// Mock owner and store type data for feature views
// Note: Feature names and counts are now obtained from shared utility functions (getFeatureNamesForView, getFeatureCountForView)
const getFeatureViewExtras = (featureViewId: string) => {
  const extras: Record<string, { owner: string; storeType: 'Online' | 'Offline' }> = {
    'fv-001': { owner: 'acorvin@redhat.com', storeType: 'Online' },
    'fv-002': { owner: 'jsmith@redhat.com', storeType: 'Offline' },
    'fv-003': { owner: 'acorvin@redhat.com', storeType: 'Online' },
    'fv-004': { owner: 'mjones@redhat.com', storeType: 'Offline' },
  };
  return extras[featureViewId] || { owner: 'unknown@redhat.com', storeType: 'Offline' as const };
};

// Note: getFeatureNamesForView, getFeatureCountForView, and getFeatureViewType are now imported from mockData/featureStore

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
 * FeatureViewsListPage Component
 * Displays a list of Feature Store feature views with search and filtering capabilities
 */
export const FeatureViewsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Toolbar filter state
  const [selectedFilterAttribute, setSelectedFilterAttribute] = useState<string>('Feature view');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState('');
  
  // Store multiple filter values as chips
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({
    'Feature view': new Set(),
    Tags: new Set(),
    Features: new Set(),
    Created: new Set(),
    Updated: new Set(),
    Owner: new Set(),
    'Store type': new Set(),
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
    
    const featureViewResults: SearchResult[] = mockFeatureViews
      .filter(fv => 
        matchesFeatureStore(fv.featureStore) &&
        (fv.name.toLowerCase().includes(query) ||
        fv.description.toLowerCase().includes(query) ||
        fv.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .map(fv => ({
        id: fv.id,
        name: fv.name,
        description: fv.description,
        category: 'Feature Views' as const,
        featureStore: fv.featureStore,
        tags: fv.tags,
      }));
    
    return { results: featureViewResults, total: featureViewResults.length };
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

  // Filter feature views based on selected feature store and active filters
  const filteredFeatureViews = useMemo(() => {
    let featureViews = mockFeatureViews;
    if (selectedFeatureStore !== 'All feature stores') {
      featureViews = mockFeatureViews.filter(fv => fv.featureStore === selectedFeatureStore);
    }
    
    if (!hasActiveFilters) {
      return featureViews;
    }
    
    return featureViews.filter(fv => {
      const extras = getFeatureViewExtras(fv.id);
      
      for (const [category, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.size === 0) continue;
        
        const matchesAny = Array.from(filterValues).some(filterValue => {
          const searchLower = filterValue.toLowerCase();
          switch (category) {
            case 'Feature view':
              return fv.name.toLowerCase().includes(searchLower) ||
                     fv.description.toLowerCase().includes(searchLower);
            case 'Tags':
              return fv.tags.some(tag => tag.toLowerCase().includes(searchLower));
            case 'Features':
              return getFeatureCountForView(fv.id).toString().includes(searchLower);
            case 'Created':
              return fv.created.toLowerCase().includes(searchLower);
            case 'Updated':
              return fv.lastUpdated.toLowerCase().includes(searchLower);
            case 'Owner':
              return extras.owner.toLowerCase().includes(searchLower);
            case 'Store type':
              return extras.storeType.toLowerCase().includes(searchLower);
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
  const sortedFeatureViews = useMemo(() => {
    if (activeSortIndex === null) return filteredFeatureViews;
    
    const sorted = [...filteredFeatureViews].sort((a, b) => {
      const extrasA = getFeatureViewExtras(a.id);
      const extrasB = getFeatureViewExtras(b.id);
      
      let compareA: string | number;
      let compareB: string | number;
      
      switch (activeSortIndex) {
        case 0: // Feature view (name)
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 1: // Feature store
          compareA = a.featureStore.toLowerCase();
          compareB = b.featureStore.toLowerCase();
          break;
        case 3: // Features
          compareA = getFeatureCountForView(a.id);
          compareB = getFeatureCountForView(b.id);
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
        case 7: // Store type
          compareA = extrasA.storeType.toLowerCase();
          compareB = extrasB.storeType.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (compareA < compareB) return activeSortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return activeSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredFeatureViews, activeSortIndex, activeSortDirection]);

  // Pagination logic
  const paginatedFeatureViews = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return sortedFeatureViews.slice(start, end);
  }, [sortedFeatureViews, page, perPage]);

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
      'Feature view': new Set(),
      Tags: new Set(),
      Features: new Set(),
      Created: new Set(),
      Updated: new Set(),
      Owner: new Set(),
      'Store type': new Set(),
    });
    setFilterInputValue('');
    setPage(1);
  };

  // Handle navigation to feature view detail page - preserve query params
  const handleFeatureViewClick = (featureViewId: string) => {
    navigate(`/develop-train/feature-store/feature-views/${featureViewId}${location.search}`);
  };

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.category) {
      case 'Feature Views':
        handleFeatureViewClick(result.id);
        break;
      case 'Entities':
        navigate(`/develop-train/feature-store/entities/${result.id}`);
        break;
      case 'Data Sources':
        navigate(`/develop-train/feature-store/data-sources/${result.id}`);
        break;
      case 'Features':
        navigate(`/develop-train/feature-store/features/${result.id}`);
        break;
      case 'Datasets':
        navigate(`/develop-train/feature-store/data-sets/${result.id}`);
        break;
      case 'Feature Services':
        navigate(`/develop-train/feature-store/feature-services/${result.id}`);
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
    'Feature view',
    'Feature store',
    'Tags',
    'Features',
    'Created',
    'Updated',
    'Owner',
    'Store type',
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
                  <div style={{ background: 'var(--pf-t--global--color--nonstatus--purple--default)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em"><path d="M25.625,22v-14c0-.34473-.27979-.625-.625-.625H5c-.34521,0-.625.28027-.625.625v14c0,.34473.27979.625.625.625h20c.34521,0,.625-.28027.625-.625ZM24.375,21.375H5.625v-12.75h18.75v12.75Z M28.625,25v-14c0-.34473-.27979-.625-.625-.625s-.625.28027-.625.625v13.375H8c-.34521,0-.625.28027-.625.625s.27979.625.625.625h20c.34521,0,.625-.28027.625-.625Z M31,13.375c-.34521,0-.625.28027-.625.625v13.375H11c-.34521,0-.625.28027-.625.625s.27979.625.625.625h20c.34521,0,.625-.28027.625-.625v-14c0-.34473-.27979-.625-.625-.625Z"></path></svg>
                  </div>
                  Feature views
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
              Logical groups of time-series feature data.
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
          id="feature-views-toolbar" 
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
                itemCount={sortedFeatureViews.length}
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
        {sortedFeatureViews.length === 0 ? (
          <EmptyState variant={EmptyStateVariant.sm} icon={SearchIcon}>
            <Title headingLevel="h2" size="lg">
              No results found
            </Title>
            <EmptyStateBody>
              No feature views match your filter criteria. Try adjusting your filters.
            </EmptyStateBody>
            <Button variant="link" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </EmptyState>
        ) : (
          <>
            <Table aria-label="Feature views table" variant="compact">
              <Thead>
                <Tr>
                  {columns.map((column, index) => (
                    <Th 
                      key={index} 
                      sort={getSortParams(index)}
                    >
                      {column}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {paginatedFeatureViews.map((featureView) => {
                  const extras = getFeatureViewExtras(featureView.id);
                  // Use actual feature names from mockFeatures (source of truth)
                  const featureNames = getFeatureNamesForView(featureView.id);
                  const actualFeatureCount = getFeatureCountForView(featureView.id);
                  return (
                    <Tr key={featureView.id}>
                      {/* Feature view Column - Name with Description and Type Label */}
                      <Td dataLabel="Feature view">
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                          <FlexItem>
                            <Button
                              variant="link"
                              isInline
                              onClick={() => handleFeatureViewClick(featureView.id)}
                            >
                              {featureView.name}
                            </Button>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small">
                              {featureView.description}
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Label isCompact variant="filled" color="blue" style={{ marginTop: '4px' }}>
                              {getFeatureViewType(featureView)}
                            </Label>
                          </FlexItem>
                        </Flex>
                      </Td>

                      {/* Feature Store Column */}
                      <Td dataLabel="Feature store">{featureView.featureStore}</Td>

                      {/* Tags Column */}
                      <Td dataLabel="Tags">
                        <LabelGroup numLabels={2}>
                          {featureView.tags.map((tag, index) => (
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

                      {/* Features Column - Count with Popover */}
                      <Td dataLabel="Features">
                        <Popover
                          aria-label="Features"
                          hasAutoWidth
                          showClose={true}
                          bodyContent={
                            featureNames.length > 0 ? (
                              <List isPlain style={{ fontSize: '14px' }}>
                                {featureNames.map((featureName, idx) => {
                                  const feature = mockFeatures.find(f => f.name === featureName);
                                  return (
                                    <ListItem key={idx}>
                                      •{' '}
                                      <Button
                                        variant="link"
                                        isInline
                                        onClick={() => feature && navigate(`/develop-train/feature-store/features/${feature.id}`)}
                                      >
                                        {featureName}
                                      </Button>
                                    </ListItem>
                                  );
                                })}
                              </List>
                            ) : (
                              <Content component="small" style={{ fontSize: '14px' }}>No features associated</Content>
                            )
                          }
                        >
                          <Button
                            variant="link"
                            isInline
                          >
                            {actualFeatureCount} feature{actualFeatureCount !== 1 ? 's' : ''}
                          </Button>
                        </Popover>
                      </Td>

                      {/* Created Column */}
                      <Td dataLabel="Created">{featureView.created}</Td>

                      {/* Updated Column */}
                      <Td dataLabel="Updated">{featureView.lastUpdated}</Td>

                      {/* Owner Column */}
                      <Td dataLabel="Owner">{extras.owner}</Td>

                      {/* Store type Column - Label with check icon */}
                      <Td dataLabel="Store type">
                        {(() => {
                          const isOnline = extras.storeType === 'Online';
                          return (
                            <Label 
                              variant="outline" 
                              isCompact
                              color={isOnline ? 'green' : 'blue'}
                              icon={
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: '#000000', // Black background
                                  marginRight: '2px',
                                  marginLeft: '2px',
                                  flexShrink: 0,
                                  alignSelf: 'center'
                                }}>
                                  <CheckIcon style={{ color: '#FFFFFF', fontSize: '8px' }} />
                                </div>
                              }
                            >
                              {extras.storeType}
                            </Label>
                          );
                        })()}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
            <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
              <FlexItem>
                <Pagination
                  itemCount={sortedFeatureViews.length}
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

export default FeatureViewsListPage;

