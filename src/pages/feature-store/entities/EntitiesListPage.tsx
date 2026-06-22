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
import { mockEntities } from '../../../mockData/entities';
import { formatTimestamp, mockFeatureViews } from '../../../mockData/featureStore';

// Get feature views for an entity (from mockFeatureViews data)
const getEntityFeatureViews = (entityId: string) => {
  return mockFeatureViews.filter(fv => fv.entityIds.includes(entityId));
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

// Mock search results with categories (matching the design)
interface SearchResult {
  id: string;
  name: string;
  description: string;
  category: 'Data Sources' | 'Features' | 'Feature Views' | 'Entities' | 'Datasets' | 'Feature Services';
  featureStore?: string;
  tags: string[];
}

const mockSearchResults: SearchResult[] = [
  {
    id: 'ds-001',
    name: 'dependents_registry_source',
    description: 'External or internal registry containing dependent-related data.',
    category: 'Data Sources',
    featureStore: 'Fraud detection',
    tags: ['domain=demographics', 'env=production'],
  },
  {
    id: 'f-001',
    name: 'local_type',
    description: 'Categorical indicator of the borrower\'s residential area type',
    category: 'Features',
    featureStore: 'Customer analytics',
    tags: ['domain=demographics', 'type=numeric'],
  },
  {
    id: 'f-002',
    name: 'social_media_usage_hours_per_day',
    description: 'Average number of hours per day the borrower spends on social media.',
    category: 'Features',
    featureStore: 'Product recommendations',
    tags: ['term=credit', 'type=numeric', 'env=production'],
  },
  {
    id: 'fv-001',
    name: 'personal_profile_view',
    description: 'Aggregated features from the user\'s personal and demographic data.',
    category: 'Feature Views',
    featureStore: 'Fraud detection',
    tags: ['domain=demographics', 'use_case=fraud'],
  },
];

// Utility function to highlight matching text
const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  // Handle tag search format
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
 * EntitiesListPage Component
 * Displays a list of Feature Store entities with search and filtering capabilities
 */
export const EntitiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Toolbar filter state
  const [selectedFilterAttribute, setSelectedFilterAttribute] = useState<string>('Entities');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState('');
  
  // Store multiple filter values as chips (using Set to prevent duplicates)
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({
    Entities: new Set(),
    Tags: new Set(),
    'Join key': new Set(),
    'Value type': new Set(),
    'Feature views': new Set(),
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

  // Format timestamp to match materialization format (e.g., "2025-04-08T05:56:27.719897Z")

  // Mock data for owner (would come from API in production)
  // Feature views count is calculated from actual data using getEntityFeatureViews
  const getEntityExtras = (entityId: string) => {
    const extras: Record<string, { owner: string }> = {
      'entity-001': { owner: 'acorvin@redhat.com' },
      'entity-002': { owner: 'acorvin@redhat.com' },
      'entity-003': { owner: 'jsmith@redhat.com' },
      'entity-004': { owner: 'acorvin@redhat.com' },
      'entity-005': { owner: 'mjones@redhat.com' },
    };
    const owner = extras[entityId]?.owner || 'unknown@redhat.com';
    // Calculate actual feature views count from data
    const featureViews = getEntityFeatureViews(entityId);
    return { owner, featureViewsCount: featureViews.length };
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some(filters => filters.size > 0);
  }, [activeFilters]);

  // Global search results grouped by category
  const globalSearchResults = useMemo(() => {
    if (!globalSearchValue.trim()) return { results: [], total: 0 };
    
    const query = globalSearchValue.toLowerCase();
    
    // Filter function for feature store
    const matchesFeatureStore = (itemFeatureStore: string | undefined) => {
      return selectedFeatureStore === 'All feature stores' || itemFeatureStore === selectedFeatureStore;
    };
    
    // Filter mock search results (Data Sources, Features, Feature Views) by feature store
    const filteredResults = mockSearchResults.filter(result => 
      matchesFeatureStore(result.featureStore) &&
      (result.name.toLowerCase().includes(query) ||
      result.description.toLowerCase().includes(query) ||
      result.tags.some(tag => tag.toLowerCase().includes(query)))
    );
    
    // Also search entities (filter by selected feature store)
    const entityResults: SearchResult[] = mockEntities
      .filter(entity => 
        matchesFeatureStore(entity.featureStore) &&
        (entity.name.toLowerCase().includes(query) ||
        entity.description.toLowerCase().includes(query) ||
        entity.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .map(entity => ({
        id: entity.id,
        name: entity.name,
        description: entity.description,
        category: 'Entities' as const,
        featureStore: entity.featureStore,
        tags: entity.tags,
      }));
    
    const allResults = [...filteredResults, ...entityResults];
    
    return { results: allResults, total: allResults.length };
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

  // Filter entities based on selected feature store and active filters
  const filteredEntities = useMemo(() => {
    // First filter by feature store
    let entities = mockEntities;
    if (selectedFeatureStore !== 'All feature stores') {
      entities = mockEntities.filter(entity => entity.featureStore === selectedFeatureStore);
    }
    
    // Then apply active filters
    if (!hasActiveFilters) {
      return entities;
    }
    
    return entities.filter(entity => {
      const extras = getEntityExtras(entity.id);
      
      // Check each filter category
      for (const [category, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.size === 0) continue;
        
        const matchesAny = Array.from(filterValues).some(filterValue => {
          const searchLower = filterValue.toLowerCase();
          switch (category) {
        case 'Entities':
          return entity.name.toLowerCase().includes(searchLower) ||
                 entity.description.toLowerCase().includes(searchLower);
        case 'Tags':
          return entity.tags.some(tag => tag.toLowerCase().includes(searchLower));
        case 'Join key':
          return entity.joinKey.toLowerCase().includes(searchLower);
        case 'Value type':
          return entity.valueType.toLowerCase().includes(searchLower);
        case 'Feature views':
          return extras.featureViewsCount.toString().includes(searchLower);
        case 'Created':
          return formatTimestamp(entity.created).toLowerCase().includes(searchLower);
        case 'Updated':
          return formatTimestamp(entity.lastUpdated).toLowerCase().includes(searchLower);
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
  const sortedEntities = useMemo(() => {
    if (activeSortIndex === null) return filteredEntities;
    
    const sorted = [...filteredEntities].sort((a, b) => {
      const extrasA = getEntityExtras(a.id);
      const extrasB = getEntityExtras(b.id);
      
      let compareA: string | number;
      let compareB: string | number;
      
      switch (activeSortIndex) {
        case 0: // Entities (name)
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 1: // Feature store
          compareA = a.featureStore.toLowerCase();
          compareB = b.featureStore.toLowerCase();
          break;
        case 3: // Join key
          compareA = a.joinKey.toLowerCase();
          compareB = b.joinKey.toLowerCase();
          break;
        case 4: // Value type
          compareA = a.valueType.toLowerCase();
          compareB = b.valueType.toLowerCase();
          break;
        case 5: // Feature views
          compareA = extrasA.featureViewsCount;
          compareB = extrasB.featureViewsCount;
          break;
        case 6: // Created
          compareA = new Date(a.created).getTime();
          compareB = new Date(b.created).getTime();
          break;
        case 7: // Updated
          compareA = new Date(a.lastUpdated).getTime();
          compareB = new Date(b.lastUpdated).getTime();
          break;
        case 8: // Owner
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
  }, [filteredEntities, activeSortIndex, activeSortDirection]);

  // Pagination logic
  const paginatedEntities = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return sortedEntities.slice(start, end);
  }, [sortedEntities, page, perPage]);

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  // Handle adding a filter value (prevents duplicates using Set)
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
      Entities: new Set(),
      Tags: new Set(),
      'Join key': new Set(),
      'Value type': new Set(),
      'Feature views': new Set(),
      Created: new Set(),
      Updated: new Set(),
      Owner: new Set(),
    });
    setFilterInputValue('');
    setPage(1);
  };

  // Handle navigation to entity detail page - pass selected feature store
  const handleEntityClick = (entityId: string) => {
    navigate(`/develop-train/feature-store/entities/${entityId}${location.search}`);
  };

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.category) {
      case 'Entities':
        handleEntityClick(result.id);
        break;
      case 'Feature Views':
        navigate(`/develop-train/feature-store/feature-views/${result.id}`);
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

  // Handle search input key press (Enter to add filter)
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
    'Entities',
    'Feature store',
    'Tags',
    'Join key',
    'Value type',
    'Feature views',
    'Created',
    'Updated',
    'Owner',
  ];

  // Help text for column headers
  const columnHelp: Record<string, string> = {
    'Join key': 'A join key is a unique identifier that links feature data to entities. It is used to join feature values with entity records during feature retrieval.',
    'Value type': 'The data type of the join key values (e.g., INT64, STRING). This determines how the key is stored and compared.',
    'Feature views': 'Feature views define how features are computed and served. Each entity can be associated with multiple feature views.',
  };

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
                  <div style={{ background: 'var(--pf-t--global--color--nonstatus--gray--default)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em"><path d="M28.125,9c0-1.99902-1.62598-3.625-3.625-3.625s-3.625,1.62598-3.625,3.625c0,1.78497,1.29919,3.26373,3,3.56177v2.43823c0,1.30957-1.06543,2.375-2.375,2.375h-6c-1.33502,0-2.53003.57721-3.375,1.48492v-8.29816c1.70081-.29803,3-1.77679,3-3.56177,0-1.99902-1.62598-3.625-3.625-3.625s-3.625,1.62598-3.625,3.625c0,1.78497,1.29919,3.26373,3,3.56177v14.87646c-1.70081.29803-3,1.77679-3,3.56177,0,1.99902,1.62598,3.625,3.625,3.625s3.625-1.62598,3.625-3.625c0-1.78497-1.29919-3.26373-3-3.56177v-3.43823c0-1.86133,1.51416-3.375,3.375-3.375h6c1.99902,0,3.625-1.62598,3.625-3.625v-2.43823c1.70081-.29803,3-1.77679,3-3.56177ZM9.125,7c0-1.30957,1.06543-2.375,2.375-2.375s2.375,1.06543,2.375,2.375-1.06543,2.375-2.375,2.375-2.375-1.06543-2.375-2.375ZM13.875,29c0,1.30957-1.06543,2.375-2.375,2.375s-2.375-1.06543-2.375-2.375,1.06543-2.375,2.375-2.375,2.375,1.06543,2.375,2.375ZM24.5,11.375c-1.30957,0-2.375-1.06543-2.375-2.375s1.06543-2.375,2.375-2.375,2.375,1.06543,2.375,2.375-1.06543,2.375-2.375,2.375Z"></path></svg>
                  </div>
              Entities
            </Title>
              </FlexItem>
              
              {/* Global Search Bar - Top Right aligned with header */}
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
                        // Delay to allow dropdown click
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
                          {/* Results count - centered */}
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
                                        // Only show tags that match the search query
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
              Select a feature store to view and manage its entities. Entities are collections of related features and can be mapped to your use case (for example, customers, products, transactions).
            </Content>
          </FlexItem>
          
          {/* Feature Store Dropdown + Workbench Link Row */}
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsLg' }} alignItems={{ default: 'alignItemsCenter' }}>
              {/* Feature Store Label + Dropdown */}
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
              
              {/* View Connected Workbenches Link with Icon - matching Overview page */}
              <FlexItem>
                <Popover
                  position="right"
                  aria-label="Connected workbenches"
                  headerContent="Connected workbenches"
                  showClose
                  minWidth="460px"
                  bodyContent={
                    <div>
                      {/* First section - Connected workbenches */}
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
                      
                      {/* Second section - Projects without workbenches */}
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

      {/* Toolbar Section - Added top margin for spacing */}
      <PageSection padding={{ default: 'noPadding' }} style={{ paddingLeft: 'var(--pf-t--global--spacer--lg)', paddingRight: 'var(--pf-t--global--spacer--lg)', marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Toolbar 
          id="entities-toolbar" 
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
                itemCount={sortedEntities.length}
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
        {sortedEntities.length === 0 ? (
          // Empty State
          <EmptyState variant={EmptyStateVariant.sm} icon={SearchIcon}>
            <Title headingLevel="h2" size="lg">
              No results found
            </Title>
            <EmptyStateBody>
              No entities match your filter criteria. Try adjusting your filters.
            </EmptyStateBody>
            <Button variant="link" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </EmptyState>
        ) : (
          <>
            {/* Data Table */}
            <Table aria-label="Entities table" variant="compact">
              <Thead>
                <Tr>
                  {columns.map((column, index) => (
                    <Th 
                      key={index} 
                      sort={getSortParams(index)}
                      info={columnHelp[column] ? {
                        popover: columnHelp[column],
                        ariaLabel: `${column} help`,
                        popoverProps: { headerContent: column }
                      } : undefined}
                    >
                      {column}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {paginatedEntities.map((entity) => {
                const extras = getEntityExtras(entity.id);
                const featureViews = getEntityFeatureViews(entity.id);
                return (
                  <Tr key={entity.id}>
                    {/* Entities Column - Name with Description */}
                    <Td dataLabel="Entities">
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                        <FlexItem>
                          <Button
                            variant="link"
                            isInline
                            onClick={() => handleEntityClick(entity.id)}
                          >
                            {entity.name}
                          </Button>
                        </FlexItem>
                        <FlexItem>
                          <Content component="small">
                            {entity.description}
                          </Content>
                        </FlexItem>
                      </Flex>
                    </Td>

                    {/* Feature Store Column */}
                    <Td dataLabel="Feature store">{entity.featureStore}</Td>

                    {/* Tags Column - Clickable to add filter (key=value format) */}
                    <Td dataLabel="Tags">
                      <LabelGroup numLabels={2}>
                        {entity.tags.map((tag, index) => (
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

                    {/* Join Key Column */}
                    <Td dataLabel="Join key">{entity.joinKey}</Td>

                    {/* Value Type Column */}
                    <Td dataLabel="Value type">{entity.valueType}</Td>

                    {/* Feature Views Column - Clickable with Popover (no header, 14px font, with close button) */}
                    <Td dataLabel="Feature views">
                      <Popover
                        aria-label="Feature views"
                        hasAutoWidth
                        showClose={true}
                        bodyContent={
                          featureViews.length > 0 ? (
                            <List isPlain style={{ fontSize: '14px' }}>
                              {featureViews.map((fv) => (
                                <ListItem key={fv.id}>
                                  •{' '}
                                  <Button
                                    variant="link"
                                    isInline
                                    onClick={() => navigate(`/develop-train/feature-store/feature-views/${fv.id}`)}
                                  >
                                    {fv.name}
                                  </Button>
                                </ListItem>
                              ))}
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
                        {extras.featureViewsCount} feature view{extras.featureViewsCount !== 1 ? 's' : ''}
                      </Button>
                      </Popover>
                    </Td>

                    {/* Created Column */}
                    <Td dataLabel="Created">{formatTimestamp(entity.created)}</Td>

                    {/* Updated Column */}
                    <Td dataLabel="Updated">{formatTimestamp(entity.lastUpdated)}</Td>

                    {/* Owner Column */}
                    <Td dataLabel="Owner">{extras.owner}</Td>
                  </Tr>
                );
              })}
              </Tbody>
            </Table>
            {/* Bottom Pagination */}
            <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
              <FlexItem>
                <Pagination
                  itemCount={sortedEntities.length}
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

export default EntitiesListPage;
