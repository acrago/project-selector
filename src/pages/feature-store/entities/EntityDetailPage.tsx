import React, { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ClipboardCopy,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Content,
  DatePicker,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
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
  Skeleton,
  Stack,
  StackItem,
  Tab,
  TabContentBody,
  TabTitleText,
  Tabs,
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
import { 
  ExternalLinkAltIcon, 
  OutlinedQuestionCircleIcon,
  WrenchIcon,
} from '@patternfly/react-icons';
import { mockEntities } from '../../../mockData/entities';
import { formatTimestamp } from '../../../mockData/featureStore';

// Mock feature views data for the entity
interface FeatureView {
  id: string;
  name: string;
  description: string;
  featuresCount: number;
  featureServiceConsumers: number;
  tags: string[];
  lastUpdated: string;
}

const mockFeatureViewsData: Record<string, FeatureView[]> = {
  'entity-001': [
    {
      id: 'fv-001',
      name: 'customer_features_v1',
      description: 'Description of this feature view',
      featuresCount: 5,
      featureServiceConsumers: 3,
      tags: ['team=analytics', 'use_case=customer-segmentation'],
      lastUpdated: '2024-01-15T08:30:00Z',
    },
    {
      id: 'fv-002',
      name: 'customer_demographics',
      description: 'Description of this feature view',
      featuresCount: 8,
      featureServiceConsumers: 2,
      tags: ['team=analytics', 'use_case=personalization'],
      lastUpdated: '2024-02-20T10:15:00Z',
    },
  ],
  'entity-002': [
    {
      id: 'fv-003',
      name: 'product_catalog_view',
      description: 'Description of this feature view',
      featuresCount: 12,
      featureServiceConsumers: 4,
      tags: ['team=catalog', 'use_case=recommendations'],
      lastUpdated: '2024-03-10T12:00:00Z',
    },
  ],
  'entity-003': [
    {
      id: 'fv-004',
      name: 'credit_history',
      description: 'Description of this feature view',
      featuresCount: 2,
      featureServiceConsumers: 2,
      tags: ['team=analytics', 'use_case=customer-segmentation'],
      lastUpdated: '2024-01-20T23:33:00Z',
    },
    {
      id: 'fv-005',
      name: 'zipcode',
      description: 'Description of this feature view',
      featuresCount: 1,
      featureServiceConsumers: 1,
      tags: ['team=analytics', 'use_case=customer-segmentation'],
      lastUpdated: '2024-01-20T23:33:00Z',
    },
    {
      id: 'fv-006',
      name: 'transaction_fraud_features',
      description: 'Description of this feature view',
      featuresCount: 15,
      featureServiceConsumers: 5,
      tags: ['team=fraud', 'use_case=fraud-detection'],
      lastUpdated: '2024-04-05T09:20:00Z',
    },
  ],
  'entity-004': [
    {
      id: 'fv-007',
      name: 'driver_performance_view',
      description: 'Description of this feature view',
      featuresCount: 10,
      featureServiceConsumers: 3,
      tags: ['team=logistics', 'use_case=driver-management'],
      lastUpdated: '2024-05-12T11:45:00Z',
    },
  ],
  'entity-005': [
    {
      id: 'fv-008',
      name: 'order_features',
      description: 'Description of this feature view',
      featuresCount: 7,
      featureServiceConsumers: 2,
      tags: ['team=e-commerce', 'use_case=fulfillment'],
      lastUpdated: '2024-06-15T14:30:00Z',
    },
    {
      id: 'fv-009',
      name: 'fulfillment_tracking',
      description: 'Description of this feature view',
      featuresCount: 4,
      featureServiceConsumers: 1,
      tags: ['team=e-commerce', 'use_case=tracking'],
      lastUpdated: '2024-07-20T16:00:00Z',
    },
  ],
};

// Mock connected workbenches data (same as EntitiesListPage)
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
 * EntityDetailPage Component
 * Displays detailed information about a specific entity with tabs for Details and Feature Views
 */
export const EntityDetailPage: React.FC = () => {
  const { entityId } = useParams<{ entityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [copied, setCopied] = useState(false);
  
  // Get feature store from URL params (for search, etc.)
  const selectedFeatureStore = searchParams.get('featureStore') || 'All feature stores';
  
  // Get the resource's actual feature store for breadcrumb TEXT (visual display)
  // Only use the actual value when resource is loaded, no default fallback
  
  // Feature Views tab state
  const [selectedFilter, setSelectedFilter] = useState('Feature view');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Feature Views tab filter state (same pattern as Entities list)
  const [filterInputValue, setFilterInputValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({
    'Feature view': new Set(),
    'Tags': new Set(),
    'Updated': new Set(),
  });
  
  // Sorting state for Feature Views table
  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  // Global search state
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Find the entity by ID
  const entity = mockEntities.find(e => e.id === entityId);
  const featureViews = entityId ? mockFeatureViewsData[entityId] || [] : [];

  // Format date to match design (e.g., "Jan 2020, 23:33 UTC")
  // Format timestamp to match materialization format (e.g., "2025-04-08T05:56:27.719897Z")

  // Handle tab selection
  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  // Handle copy code
  const handleCopyCode = () => {
    if (entity) {
      navigator.clipboard.writeText(entity.usageCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Global search results
  const globalSearchResults = useMemo(() => {
    if (!globalSearchValue.trim()) return { results: [], total: 0 };
    
    const query = globalSearchValue.toLowerCase();
    const filteredResults = mockSearchResults.filter(result => 
      result.name.toLowerCase().includes(query) ||
      result.description.toLowerCase().includes(query) ||
      result.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    // Also search entities
    const entityResults: SearchResult[] = mockEntities
      .filter(entity => 
        entity.name.toLowerCase().includes(query) ||
        entity.description.toLowerCase().includes(query) ||
        entity.tags.some(tag => tag.toLowerCase().includes(query))
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
  }, [globalSearchValue]);

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

  // Handle search result click
  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.category) {
      case 'Entities':
        navigate(`/develop-train/feature-store/entities/${result.id}`);
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

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(activeFilters).some(filters => filters.size > 0);
  }, [activeFilters]);

  // Filter feature views based on active filters
  const filteredFeatureViews = useMemo(() => {
    if (!hasActiveFilters) return featureViews;
    
    return featureViews.filter(fv => {
      // Check each filter category
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
            case 'Updated':
              return formatTimestamp(fv.lastUpdated).toLowerCase().includes(searchLower);
            default:
              return true;
          }
        });
        
        if (!matchesAny) return false;
      }
      
      return true;
    });
  }, [featureViews, activeFilters, hasActiveFilters]);

  // Sort feature views
  const sortedFeatureViews = useMemo(() => {
    if (activeSortIndex === null) return filteredFeatureViews;
    
    const sorted = [...filteredFeatureViews].sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;
      
      switch (activeSortIndex) {
        case 0: // Feature View name
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 1: // Features count
          compareA = a.featuresCount;
          compareB = b.featuresCount;
          break;
        case 2: // Feature services
          compareA = a.featureServiceConsumers;
          compareB = b.featureServiceConsumers;
          break;
        case 3: // Tags (sort by first tag alphabetically)
          compareA = a.tags.length > 0 ? a.tags[0].toLowerCase() : '';
          compareB = b.tags.length > 0 ? b.tags[0].toLowerCase() : '';
          break;
        case 4: // Updated
          compareA = new Date(a.lastUpdated).getTime();
          compareB = new Date(b.lastUpdated).getTime();
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

  // Pagination
  const paginatedFeatureViews = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return sortedFeatureViews.slice(start, end);
  }, [sortedFeatureViews, page, perPage]);

  // Sorting handler - all columns are sortable including Tags
  const getSortParams = (columnIndex: number): ThProps['sort'] => {
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

  // Column help text
  const columnHelp: Record<string, string> = {
    'Features': 'The number of individual features defined within this feature view.',
    'Feature services': 'The number of feature services that consume features from this view.',
  };

  // Handle adding a filter value
  const addFilterValue = (value?: string) => {
    const valueToAdd = value || filterInputValue.trim();
    if (valueToAdd) {
      setActiveFilters(prev => {
        const newSet = new Set(prev[selectedFilter]);
        newSet.add(valueToAdd);
        return {
          ...prev,
          [selectedFilter]: newSet
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
      'Tags': new Set(),
      'Updated': new Set(),
    });
    setFilterInputValue('');
    setPage(1);
  };

  // Handle filter key press
  const handleFilterKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addFilterValue();
    }
  };

  // Mock features data for popover
  const mockFeaturesData: Record<string, string[]> = {
    'fv-001': ['age', 'income', 'credit_score', 'account_balance', 'tenure'],
    'fv-002': ['gender', 'location', 'occupation', 'education', 'marital_status', 'dependents', 'home_ownership', 'employment_type'],
    'fv-003': ['price', 'category', 'brand', 'rating', 'stock_level', 'discount', 'views', 'purchases', 'returns', 'reviews', 'shipping_cost', 'weight'],
    'fv-004': ['credit_limit', 'balance'],
    'fv-005': ['zipcode'],
    'fv-006': ['amount', 'merchant', 'category', 'location', 'time', 'device', 'ip_address', 'card_type', 'frequency', 'velocity', 'risk_score', 'fraud_flag', 'anomaly_score', 'geo_distance', 'time_since_last'],
    'fv-007': ['trips_completed', 'rating', 'cancellation_rate', 'acceptance_rate', 'earnings', 'hours_online', 'surge_trips', 'complaints', 'compliments', 'vehicle_age'],
    'fv-008': ['total_amount', 'item_count', 'shipping_method', 'payment_method', 'discount_applied', 'loyalty_points', 'delivery_estimate'],
    'fv-009': ['status', 'carrier', 'tracking_number', 'estimated_delivery'],
  };

  // Mock feature services data for popover
  const mockFeatureServicesData: Record<string, string[]> = {
    'fv-001': ['customer_churn_service', 'customer_segmentation_service', 'personalization_service'],
    'fv-002': ['demographics_service', 'targeting_service'],
    'fv-003': ['recommendation_service', 'inventory_service', 'pricing_service', 'analytics_service'],
    'fv-004': ['credit_risk_service', 'loan_approval_service'],
    'fv-005': ['location_service'],
    'fv-006': ['fraud_detection_service', 'risk_assessment_service', 'transaction_monitoring_service', 'alert_service', 'compliance_service'],
    'fv-007': ['driver_matching_service', 'incentive_service', 'performance_service'],
    'fv-008': ['order_tracking_service', 'fulfillment_service'],
    'fv-009': ['delivery_tracking_service'],
  };

  if (!entity) {
    return (
      <PageSection>
        <Title headingLevel="h1">Entity not found</Title>
        <Content component="p">The requested entity could not be found.</Content>
        <Button variant="primary" onClick={() => navigate('/develop-train/feature-store/entities')}>
          Back to Entities
        </Button>
      </PageSection>
    );
  }

  return (
    <>
      {/* Breadcrumb with Feature Store Icon */}
      <PageSection type="breadcrumb">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <span
                  onClick={() => navigate(`/develop-train/feature-store/entities${location.search}`)}
                  style={{ 
                    color: 'var(--pf-t--global--text--color--link--default)',
                    borderBottom: '1px solid var(--pf-t--global--text--color--link--default)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    paddingBottom: '1px'
                  }}
                >
                  Entities in
                  <svg 
                    className="pf-v6-svg" 
                    viewBox="0 0 40 40" 
                    fill="currentColor" 
                    aria-hidden="true" 
                    role="img" 
                    width="1.2em" 
                    height="1.2em"
                  >
                    <path d="M28.5,25.375c-.63568,0-1.22626.19312-1.72021.52051l-4.38898-4.38898c.77032-.96265,1.23419-2.18066,1.23419-3.50653s-.46387-2.54388-1.23419-3.50653l3.25592-3.25592c.39655.24078.85651.38745,1.35327.38745,1.44727,0,2.625-1.17773,2.625-2.625s-1.17773-2.625-2.625-2.625-2.625,1.17773-2.625,2.625c0,.49677.14667.95673.38745,1.35327l-3.25592,3.25592c-.96265-.77032-2.18066-1.23419-3.50653-1.23419s-2.54388.46387-3.50653,1.23419l-4.38898-4.38898c.32745-.49402.52051-1.08459.52051-1.72021,0-1.72266-1.40186-3.125-3.125-3.125s-3.125,1.40234-3.125,3.125,1.40186,3.125,3.125,3.125c.63568,0,1.22626-.19312,1.72021-.52051l4.38898,4.38898c-.77032.96265-1.23419,2.18066-1.23419,3.50653s.46387,2.54388,1.23419,3.50653l-3.25586,3.25586c-.39655-.24078-.85657-.38739-1.35333-.38739-1.44727,0-2.625,1.17773-2.625,2.625s1.17773,2.625,2.625,2.625,2.625-1.17773,2.625-2.625c0-.49677-.14661-.95679-.38739-1.35333l3.25586-3.25586c.96265.77032,2.18066,1.23419,3.50653,1.23419s2.54388-.46387,3.50653-1.23419l4.38898,4.38898c-.32745.49402-.52051,1.08459-.52051,1.72021,0,1.72266,1.40186,3.125,3.125,3.125s3.125-1.40234,3.125-3.125-1.40186-3.125-3.125-3.125ZM27,7.625c.7583,0,1.375.61719,1.375,1.375s-.6167,1.375-1.375,1.375-1.375-.61719-1.375-1.375.6167-1.375,1.375-1.375ZM5.625,7.5c0-1.03418.84131-1.875,1.875-1.875s1.875.84082,1.875,1.875-.84131,1.875-1.875,1.875-1.875-.84082-1.875-1.875ZM9,28.375c-.7583,0-1.375-.61719-1.375-1.375s.6167-1.375,1.375-1.375,1.375.61719,1.375,1.375-.6167,1.375-1.375,1.375ZM13.625,18c0-2.41211,1.9624-4.375,4.375-4.375s4.375,1.96289,4.375,4.375-1.9624,4.375-4.375,4.375-4.375-1.96289-4.375-4.375ZM28.5,30.375c-1.03369,0-1.875-.84082-1.875-1.875s.84131-1.875,1.875-1.875,1.875.84082,1.875,1.875-.84131,1.875-1.875,1.875Z" />
                  </svg>
                  {entity?.featureStore ? (
                    entity.featureStore
                  ) : (
                    <Skeleton width="150px" height="1em" />
                  )}
                </span>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{entity.name}</BreadcrumbItem>
            </Breadcrumb>
          </FlexItem>
          
          {/* Global Search Bar - Top Right */}
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
              {/* Search Dropdown - matching Entities list page style */}
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
      </PageSection>

      {/* Page Header */}
      <PageSection>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">{entity.name}</Title>
          </FlexItem>
          <FlexItem>
            <Content component="p">{entity.description}</Content>
          </FlexItem>
          <FlexItem>
            {/* View Connected Workbenches Link with Icon - matching Overview page */}
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
      </PageSection>

      {/* Tabs */}
      <PageSection type="tabs">
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Entity detail tabs">
          <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab">
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                {/* Use Stack with large gap for spacing between sections */}
                <Stack>
                  {/* Section 1: Basic Info (no title) - Join key, Value type */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <DescriptionList isHorizontal isCompact>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Join key</DescriptionListTerm>
                        <DescriptionListDescription>{entity.joinKey}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Value type</DescriptionListTerm>
                        <DescriptionListDescription>{entity.valueType}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </StackItem>

                  {/* Section 2: Data Source */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      Data source
                    </Title>
                    <DescriptionList isHorizontal isCompact>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Source type</DescriptionListTerm>
                        <DescriptionListDescription>{entity.sourceType}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>File URL</DescriptionListTerm>
                        <DescriptionListDescription>
                          <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied" variant="inline-compact">
                            {entity.fileUrl}
                          </ClipboardCopy>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Created date</DescriptionListTerm>
                        <DescriptionListDescription>{formatTimestamp(entity.created)}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Last modified date</DescriptionListTerm>
                        <DescriptionListDescription>{formatTimestamp(entity.lastUpdated)}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </StackItem>

                  {/* Section 3: Tags */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      Tags
                    </Title>
                    <LabelGroup numLabels={10}>
                      {entity.tags.map((tag, index) => (
                        <Label key={index} color="blue">{tag}</Label>
                      ))}
                    </LabelGroup>
                  </StackItem>

                  {/* Section 4: Code Snippet */}
                  <StackItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Title headingLevel="h3" size="md">
                          Code snippet
                        </Title>
                      </FlexItem>
                      <FlexItem>
                        <Popover
                          aria-label="Code snippet help"
                          headerContent="How to use this code snippet?"
                          bodyContent={
                            <Content component="p">
                              This snippet defines the current entity. Use it as a template to create similar resources.
                              <br /><br />
                              For updates or advanced configuration options, view the documentation.
                            </Content>
                          }
                          showClose
                        >
                          <Button variant="plain" aria-label="Code snippet help">
                            <OutlinedQuestionCircleIcon />
                          </Button>
                        </Popover>
                      </FlexItem>
                    </Flex>
                    <div style={{ maxWidth: '800px', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                      <CodeBlock
                        actions={
                          <CodeBlockAction>
                            <ClipboardCopyButton
                              id="copy-code-button"
                              textId="code-content"
                              aria-label="Copy to clipboard"
                              onClick={handleCopyCode}
                              variant="plain"
                            >
                              {copied ? 'Copied!' : ''}
                            </ClipboardCopyButton>
                          </CodeBlockAction>
                        }
                      >
                        <CodeBlockCode id="code-content">
                          {entity.usageCode}
                        </CodeBlockCode>
                      </CodeBlock>
                    </div>
                  </StackItem>
                </Stack>
              </PageSection>
            </TabContentBody>
          </Tab>

          <Tab eventKey={1} title={<TabTitleText>Feature views</TabTitleText>} aria-label="Feature views tab">
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                {/* Toolbar - same pattern as Entities list */}
                <Toolbar id="feature-views-toolbar" clearAllFilters={clearAllFilters}>
                  <ToolbarContent>
                    <ToolbarGroup variant="filter-group">
                      <ToolbarItem>
                        <Select
                          aria-label="Select filter attribute"
                          isOpen={isFilterOpen}
                          selected={selectedFilter}
                          onSelect={(_event, value) => {
                            setSelectedFilter(value as string);
                            setIsFilterOpen(false);
                          }}
                          onOpenChange={(isOpen) => setIsFilterOpen(isOpen)}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setIsFilterOpen(!isFilterOpen)}
                              isExpanded={isFilterOpen}
                              style={{ width: '150px' }}
                            >
                              {selectedFilter}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            <SelectOption value="Feature view">Feature view</SelectOption>
                            <SelectOption value="Tags">Tags</SelectOption>
                            <SelectOption value="Updated">Updated</SelectOption>
                          </SelectList>
                        </Select>
                      </ToolbarItem>
                      <ToolbarItem>
                        {selectedFilter === 'Updated' ? (
                          <DatePicker
                            aria-label="Filter by Updated"
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
                            aria-label={`Filter by ${selectedFilter}`}
                            placeholder={`Filter by ${selectedFilter.toLowerCase()}`}
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
                        onSetPage={(_event, newPage) => setPage(newPage)}
                        onPerPageSelect={(_event, newPerPage) => {
                          setPerPage(newPerPage);
                          setPage(1);
                        }}
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

                {/* Feature Views Table */}
                <Table aria-label="Feature views table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th sort={getSortParams(0)}>Feature view</Th>
                      <Th 
                        sort={getSortParams(1)}
                        info={{
                          popover: columnHelp['Features'],
                          ariaLabel: 'Features help',
                          popoverProps: { headerContent: 'Features' }
                        }}
                      >
                        Features
                      </Th>
                      <Th 
                        sort={getSortParams(2)}
                        info={{
                          popover: columnHelp['Feature services'],
                          ariaLabel: 'Feature services help',
                          popoverProps: { headerContent: 'Feature services' }
                        }}
                      >
                        Feature services
                      </Th>
                      <Th sort={getSortParams(3)}>Tags</Th>
                      <Th sort={getSortParams(4)}>Updated</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedFeatureViews.map((fv) => {
                      const features = mockFeaturesData[fv.id] || [];
                      const featureServices = mockFeatureServicesData[fv.id] || [];
                      return (
                        <Tr key={fv.id}>
                          {/* Feature View Column */}
                          <Td dataLabel="Feature view">
                            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                              <FlexItem>
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => navigate(`/develop-train/feature-store/feature-views/${fv.id}`)}
                                >
                                  {fv.name}
                                </Button>
                              </FlexItem>
                              <FlexItem>
                                <Content component="small">{fv.description}</Content>
                              </FlexItem>
                            </Flex>
                          </Td>

                          {/* Features Column - with popover */}
                          <Td dataLabel="Features">
                            <Popover
                              aria-label="Features list"
                              hasAutoWidth
                              showClose={true}
                              bodyContent={
                                features.length > 0 ? (
                                  <List isPlain style={{ fontSize: '14px' }}>
                                    {features.map((feature, idx) => (
                                      <ListItem key={idx}>
                                        •{' '}
                                        <Button 
                                          variant="link" 
                                          isInline
                                          onClick={() => navigate(`/develop-train/feature-store/features/${feature}`)}
                                        >
                                          {feature}
                                        </Button>
                                      </ListItem>
                                    ))}
                                  </List>
                                ) : (
                                  <Content component="small" style={{ fontSize: '14px' }}>No features defined</Content>
                                )
                              }
                            >
                              <Button variant="link" isInline>
                                {fv.featuresCount}
                              </Button>
                            </Popover>
                          </Td>

                          {/* Feature Services Column - with popover */}
                          <Td dataLabel="Feature services">
                            <Popover
                              aria-label="Feature services list"
                              hasAutoWidth
                              showClose={true}
                              bodyContent={
                                featureServices.length > 0 ? (
                                  <List isPlain style={{ fontSize: '14px' }}>
                                    {featureServices.map((service, idx) => (
                                      <ListItem key={idx}>
                                        •{' '}
                                        <Button 
                                          variant="link" 
                                          isInline
                                          onClick={() => navigate(`/develop-train/feature-store/feature-services/${service}`)}
                                        >
                                          {service}
                                        </Button>
                                      </ListItem>
                                    ))}
                                  </List>
                                ) : (
                                  <Content component="small" style={{ fontSize: '14px' }}>No feature services consuming</Content>
                                )
                              }
                            >
                              <Button variant="link" isInline>
                                {fv.featureServiceConsumers}
                              </Button>
                            </Popover>
                          </Td>

                          {/* Tags Column - clickable to add as filter */}
                          <Td dataLabel="Tags">
                            <LabelGroup numLabels={2}>
                              {fv.tags.map((tag, index) => (
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

                          {/* Updated Column */}
                          <Td dataLabel="Updated">{formatTimestamp(fv.lastUpdated)}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>

                {/* Bottom Pagination */}
                <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <FlexItem>
                    <Pagination
                      itemCount={sortedFeatureViews.length}
                      perPage={perPage}
                      page={page}
                      onSetPage={(_event, newPage) => setPage(newPage)}
                      onPerPageSelect={(_event, newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                      }}
                      variant="bottom"
                      isCompact
                    />
                  </FlexItem>
                </Flex>
              </PageSection>
            </TabContentBody>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export default EntityDetailPage;
