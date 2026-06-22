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
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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
import { 
  Feature,
  formatTimestamp,
  getFeatureCountForView,
  getFeatureNamesForView,
  getFeatureViewType,
  mockDataSources,
  mockFeatureServices,
  mockFeatureViews,
  mockFeatures,
} from '../../../mockData/featureStore';
import { Entity, mockEntities } from '../../../mockData/entities';
import { FeatureStoreLineage } from '../../../components/FeatureStoreLineage/FeatureStoreLineage';

// Mock connected workbenches data
const mockConnectedWorkbenches = [
  { name: 'My application', project: 'Banking' },
  { name: 'example', project: 'demo' },
];

const mockProjectsWithoutWorkbenches = [
  { name: 'Project 3' },
  { name: 'Project 4' },
];

// Mock materialization jobs
interface MaterializationJob {
  id: string;
  interval: string;
  created: string;
  updated: string;
}

const getMaterializationJobs = (featureViewId: string): MaterializationJob[] => {
  const jobs: Record<string, MaterializationJob[]> = {
    'fv-001': [
      { id: 'mat-001', interval: '1990-01-01 to 2025-04-02', created: '2025-04-08T05:56:27.719897Z', updated: '2025-04-09T10:22:46.659795Z' },
      { id: 'mat-002', interval: '1992-01-01 to 2020-04-02', created: '2025-04-08T10:00:26.472252Z', updated: '2025-04-09T00:00:00Z' },
    ],
    'fv-002': [
      { id: 'mat-003', interval: '1992-03-01 to 2020-03-02', created: '2025-04-08T10:00:26.472252Z', updated: '2025-04-09T00:00:00Z' },
    ],
    'fv-003': [
      { id: 'mat-004', interval: '1990-01-01 to 2025-04-02', created: '2025-04-08T05:56:27.719897Z', updated: '2025-04-09T10:22:46.659795Z' },
    ],
  };
  return jobs[featureViewId] || [];
};

// Mock transformation code
const getTransformationCode = (featureViewId: string): string => {
  const codes: Record<string, string> = {
    'fv-001': `def transform_transactions(df):
    """Transform transaction data into aggregated features"""
    return df.groupby('customer_id').agg({
        'amount': ['sum', 'mean', 'max'],
        'transaction_date': 'count'
    }).reset_index()`,
    'fv-002': `def transform_products(df):
    """Transform product catalog into similarity scores"""
    return df.apply(calculate_similarity, axis=1)`,
    'fv-003': `def transform_customer(df):
    """Transform customer data into churn indicators"""
    return df.apply(calculate_churn_probability, axis=1)`,
  };
  return codes[featureViewId] || `def transform(df):
    """Default transformation"""
    return df`;
};

// Transformation input types
interface RequestDataSourceInput {
  type: 'request';
  name: string;
  schema: Array<{ key: string; type: string }>;
}

interface FeatureViewProjectionInput {
  type: 'featureview';
  name: string;
  features: Array<{ feature: string; type: string }>;
}

type TransformationInput = RequestDataSourceInput | FeatureViewProjectionInput;

// Mock transformation inputs
const getTransformationInputs = (featureViewId: string): TransformationInput[] => {
  const inputs: Record<string, TransformationInput[]> = {
    'fv-001': [
      {
        type: 'request',
        name: 'application_add',
        schema: [
          { key: '0', type: '{"name":"loan_amnt","valueType":"INT64"}' }
        ]
      },
      {
        type: 'featureview',
        name: 'credit_history',
        features: [
          { feature: 'credit_card_due', type: 'INT64' },
          { feature: 'mortage_due', type: 'INT64' }
        ]
      }
    ],
    'fv-002': [
      {
        type: 'featureview',
        name: 'product_catalog',
        features: [
          { feature: 'product_similarity_score', type: 'FLOAT64' }
        ]
      }
    ],
    'fv-003': [
      {
        type: 'request',
        name: 'customer_request',
        schema: [
          { key: '0', type: '{"name":"customer_id","valueType":"STRING"}' }
        ]
      }
    ],
  };
  return inputs[featureViewId] || [];
};

// Schema table row interface
interface SchemaRow {
  column: string;
  type: 'ENTITY' | 'FEATURE';
  dataType: string;
  description: string;
}

// Get feature view schema as table data
const getFeatureViewSchemaTable = (featureViewId: string, entities: Entity[], features: Feature[]): SchemaRow[] => {
  const rows: SchemaRow[] = [];
  
  // Add entity rows
  const featureView = mockFeatureViews.find(fv => fv.id === featureViewId);
  if (featureView) {
    featureView.entityIds.forEach(entityId => {
      const entity = entities.find(e => e.id === entityId);
      if (entity) {
        rows.push({
          column: entity.name,
          type: 'ENTITY',
          dataType: entity.valueType,
          description: entity.description,
        });
      }
    });
  }
  
  // Add feature rows
  const featureNames = getFeatureNamesForView(featureViewId);
  featureNames.forEach(featureName => {
    const feature = features.find(f => f.name === featureName && f.featureViewId === featureViewId);
    if (feature) {
      rows.push({
        column: feature.name,
        type: 'FEATURE',
        dataType: feature.valueType,
        description: feature.description,
      });
    }
  });
  
  return rows;
};

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
 * FeatureViewDetailPage Component
 * Displays detailed information about a specific feature view with tabs for Details, Lineage, Feature services, Materialization, and Transformation
 */
export const FeatureViewDetailPage: React.FC = () => {
  const { featureViewId } = useParams<{ featureViewId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [copied, setCopied] = useState(false);
  
  // Get feature store from URL params (for search, lineage, etc.)
  const selectedFeatureStore = searchParams.get('featureStore') || 'All feature stores';
  
  // Get the resource's actual feature store for breadcrumb TEXT (visual display)
  // Only use the actual value when resource is loaded, no default fallback
  
  
  // Schema tab state
  const [schemaPage, setSchemaPage] = useState(1);
  const [schemaPerPage, setSchemaPerPage] = useState(10);
  const [selectedSchemaFilterAttribute, setSelectedSchemaFilterAttribute] = useState<string>('Columns');
  const [isSchemaFilterDropdownOpen, setIsSchemaFilterDropdownOpen] = useState(false);
  const [schemaFilterInputValue, setSchemaFilterInputValue] = useState('');
  const [schemaActiveFilters, setSchemaActiveFilters] = useState<Record<string, Set<string>>>({
    'Columns': new Set(),
    'Type': new Set(),
    'Data Type': new Set(),
    'Description': new Set(),
  });
  const [schemaActiveSortIndex, setSchemaActiveSortIndex] = useState<number | null>(null);
  const [schemaActiveSortDirection, setSchemaActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  // Feature Services tab state
  const [fsPage, setFsPage] = useState(1);
  const [fsPerPage, setFsPerPage] = useState(10);
  const [fsSelectedFilterAttribute, setFsSelectedFilterAttribute] = useState<string>('Feature service');
  const [isFsFilterDropdownOpen, setIsFsFilterDropdownOpen] = useState(false);
  const [fsFilterInputValue, setFsFilterInputValue] = useState('');
  const [fsActiveFilters, setFsActiveFilters] = useState<Record<string, Set<string>>>({
    'Feature service': new Set(),
    'Tags': new Set(),
    'Features': new Set(),
  });
  const [fsActiveSortIndex, setFsActiveSortIndex] = useState<number | null>(null);
  const [fsActiveSortDirection, setFsActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  // Global search state
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Find the feature view by ID
  const featureView = mockFeatureViews.find(fv => fv.id === featureViewId);
  
  // Get related data
  const dataSource = featureView ? mockDataSources.find(ds => ds.id === featureView.dataSourceId) : null;
  const entities = featureView ? mockEntities.filter(e => featureView.entityIds.includes(e.id)) : [];
  const featureServices = featureView ? mockFeatureServices.filter(fs => fs.featureViewIds.includes(featureView.id)) : [];
  const materializationJobs = featureView ? getMaterializationJobs(featureView.id) : [];
  const transformationCode = featureView ? getTransformationCode(featureView.id) : '';
  const transformationInputs = featureView ? getTransformationInputs(featureView.id) : [];
  const allSchemaTable = featureView ? getFeatureViewSchemaTable(featureView.id, entities, mockFeatures) : [];
  
  // Check if any schema filters are active
  const hasActiveSchemaFilters = useMemo(() => {
    return Object.values(schemaActiveFilters).some(filters => filters.size > 0);
  }, [schemaActiveFilters]);
  
  // Filter schema table based on active filters
  const filteredSchemaTable = useMemo(() => {
    if (!hasActiveSchemaFilters) {
      return allSchemaTable;
    }
    
    return allSchemaTable.filter(row => {
      for (const [category, filterValues] of Object.entries(schemaActiveFilters)) {
        if (filterValues.size === 0) continue;
        
        const matchesAny = Array.from(filterValues).some(filterValue => {
          const searchLower = filterValue.toLowerCase();
          switch (category) {
            case 'Columns':
              return row.column.toLowerCase().includes(searchLower);
            case 'Type':
              return row.type.toLowerCase().includes(searchLower);
            case 'Data Type':
              return row.dataType.toLowerCase().includes(searchLower);
            case 'Description':
              return row.description.toLowerCase().includes(searchLower);
            default:
              return true;
          }
        });
        
        if (!matchesAny) return false;
      }
      
      return true;
    });
  }, [allSchemaTable, schemaActiveFilters, hasActiveSchemaFilters]);

  // Sort schema table
  const sortedSchemaTable = useMemo(() => {
    if (schemaActiveSortIndex === null) return filteredSchemaTable;
    
    return [...filteredSchemaTable].sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;
      
      switch (schemaActiveSortIndex) {
        case 0: // Columns
          compareA = a.column.toLowerCase();
          compareB = b.column.toLowerCase();
          break;
        case 1: // Type
          compareA = a.type.toLowerCase();
          compareB = b.type.toLowerCase();
          break;
        case 2: // Data Type
          compareA = a.dataType.toLowerCase();
          compareB = b.dataType.toLowerCase();
          break;
        case 3: // Description
          compareA = a.description.toLowerCase();
          compareB = b.description.toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (compareA < compareB) return schemaActiveSortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return schemaActiveSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSchemaTable, schemaActiveSortIndex, schemaActiveSortDirection]);
  
  // Paginate sorted schema table
  const paginatedSchemaTable = useMemo(() => {
    const start = (schemaPage - 1) * schemaPerPage;
    const end = start + schemaPerPage;
    return sortedSchemaTable.slice(start, end);
  }, [sortedSchemaTable, schemaPage, schemaPerPage]);

  // Schema sort params
  const getSchemaSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: schemaActiveSortIndex ?? undefined,
      direction: schemaActiveSortDirection,
    },
    onSort: (_event, index, direction) => {
      setSchemaActiveSortIndex(index);
      setSchemaActiveSortDirection(direction);
    },
    columnIndex,
  });
  
  // Handle schema filter operations
  const addSchemaFilterValue = (value?: string) => {
    const valueToAdd = value || schemaFilterInputValue.trim();
    if (valueToAdd) {
      setSchemaActiveFilters(prev => {
        const newSet = new Set(prev[selectedSchemaFilterAttribute]);
        newSet.add(valueToAdd);
        return {
          ...prev,
          [selectedSchemaFilterAttribute]: newSet
        };
      });
      setSchemaFilterInputValue('');
      setSchemaPage(1);
    }
  };
  
  const onDeleteSchemaChip = (category: string, chip: string) => {
    setSchemaActiveFilters(prev => {
      const newSet = new Set(prev[category]);
      newSet.delete(chip);
      return {
        ...prev,
        [category]: newSet
      };
    });
    setSchemaPage(1);
  };
  
  const clearAllSchemaFilters = () => {
    setSchemaActiveFilters({
      'Columns': new Set(),
      'Type': new Set(),
      'Data Type': new Set(),
      'Description': new Set(),
    });
    setSchemaFilterInputValue('');
    setSchemaPage(1);
  };

  // Feature Services filtering and sorting
  const hasActiveFsFilters = useMemo(() => {
    return Object.values(fsActiveFilters).some(filters => filters.size > 0);
  }, [fsActiveFilters]);

  const filteredFeatureServices = useMemo(() => {
    if (!hasActiveFsFilters) {
      return featureServices;
    }
    
    return featureServices.filter(fs => {
      for (const [category, filterValues] of Object.entries(fsActiveFilters)) {
        if (filterValues.size === 0) continue;
        
        const matchesAny = Array.from(filterValues).some(filterValue => {
          const searchLower = filterValue.toLowerCase();
          switch (category) {
            case 'Feature service':
              return fs.name.toLowerCase().includes(searchLower) ||
                     fs.description.toLowerCase().includes(searchLower);
            case 'Tags':
              return fs.tags.some(tag => tag.toLowerCase().includes(searchLower));
            case 'Features':
              const fsFeatureCount = fs.featureViewIds.reduce((sum, fvId) => 
                sum + getFeatureCountForView(fvId), 0
              );
              return fsFeatureCount.toString().includes(searchLower);
            default:
              return true;
          }
        });
        
        if (!matchesAny) return false;
      }
      
      return true;
    });
  }, [featureServices, fsActiveFilters, hasActiveFsFilters, featureView]);

  const sortedFeatureServices = useMemo(() => {
    if (fsActiveSortIndex === null) return filteredFeatureServices;
    
    return [...filteredFeatureServices].sort((a, b) => {
      let compareA: string | number;
      let compareB: string | number;
      
      switch (fsActiveSortIndex) {
        case 0: // Feature service
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 1: // Tags
          compareA = a.tags.join(',').toLowerCase();
          compareB = b.tags.join(',').toLowerCase();
          break;
        case 2: // Features
          compareA = a.featureViewIds.reduce((sum, fvId) => sum + getFeatureCountForView(fvId), 0);
          compareB = b.featureViewIds.reduce((sum, fvId) => sum + getFeatureCountForView(fvId), 0);
          break;
        case 3: // Updated
          compareA = new Date(a.lastUpdated).getTime();
          compareB = new Date(b.lastUpdated).getTime();
          break;
        default:
          return 0;
      }
      
      if (compareA < compareB) return fsActiveSortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return fsActiveSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredFeatureServices, fsActiveSortIndex, fsActiveSortDirection, featureView]);

  const paginatedFeatureServices = useMemo(() => {
    const start = (fsPage - 1) * fsPerPage;
    const end = start + fsPerPage;
    return sortedFeatureServices.slice(start, end);
  }, [sortedFeatureServices, fsPage, fsPerPage]);

  const getFsSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: fsActiveSortIndex ?? undefined,
      direction: fsActiveSortDirection,
    },
    onSort: (_event, index, direction) => {
      setFsActiveSortIndex(index);
      setFsActiveSortDirection(direction);
    },
    columnIndex,
  });

  const addFsFilterValue = (value?: string) => {
    const valueToAdd = value || fsFilterInputValue.trim();
    if (valueToAdd) {
      setFsActiveFilters(prev => {
        const newSet = new Set(prev[fsSelectedFilterAttribute]);
        newSet.add(valueToAdd);
        return {
          ...prev,
          [fsSelectedFilterAttribute]: newSet
        };
      });
      setFsFilterInputValue('');
      setFsPage(1);
    }
  };

  const onDeleteFsChip = (category: string, chip: string) => {
    setFsActiveFilters(prev => {
      const newSet = new Set(prev[category]);
      newSet.delete(chip);
      return {
        ...prev,
        [category]: newSet
      };
    });
    setFsPage(1);
  };

  const clearAllFsFilters = () => {
    setFsActiveFilters({
      'Feature service': new Set(),
      'Tags': new Set(),
      'Features': new Set(),
    });
    setFsFilterInputValue('');
    setFsPage(1);
  };

  const handleFsFilterKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addFsFilterValue();
    }
  };
  
  const handleSchemaFilterKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addSchemaFilterValue();
    }
  };

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
    if (featureView) {
      const codeSnippet = `from feast import FeatureView, Entity, Feature

feature_view = FeatureView(
    name="${featureView.name}",
    entities=[Entity(name="${entities[0]?.name || 'entity'}")],
    features=[Feature(name="feature_name", dtype=ValueType.FLOAT)]
)`;
      navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Global search results
  const globalSearchResults = useMemo(() => {
    if (!globalSearchValue.trim()) return { results: [], total: 0 };
    
    const query = globalSearchValue.toLowerCase();
    
    // Search feature views
    const featureViewResults: SearchResult[] = mockFeatureViews
      .filter(fv => 
        (selectedFeatureStore === 'All feature stores' || fv.featureStore === selectedFeatureStore) &&
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

  // Handle schema column click navigation
  const handleSchemaColumnClick = (row: SchemaRow) => {
    if (row.type === 'ENTITY') {
      const entity = entities.find(e => e.name === row.column);
      if (entity) {
        navigate(`/develop-train/feature-store/entities/${entity.id}`);
      }
    } else if (row.type === 'FEATURE') {
      const feature = mockFeatures.find(f => f.name === row.column && f.featureViewId === featureView?.id);
      if (feature) {
        navigate(`/develop-train/feature-store/features/${feature.id}`);
      }
    }
  };

  if (!featureView) {
    return (
      <PageSection>
        <Title headingLevel="h1">Feature view not found</Title>
        <Content component="p">The requested feature view could not be found.</Content>
        <Button variant="primary" onClick={() => navigate('/develop-train/feature-store/feature-views')}>
          Back to Feature views
        </Button>
      </PageSection>
    );
  }

  const viewType = getFeatureViewType(featureView);

  return (
    <>
      {/* Breadcrumb with Feature Store Icon */}
      <PageSection type="breadcrumb">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <span
                  onClick={() => navigate(`/develop-train/feature-store/feature-views${location.search}`)}
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
                  Feature views in
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
                  {featureView?.featureStore ? (
                    featureView.featureStore
                  ) : (
                    <Skeleton width="150px" height="1em" />
                  )}
                </span>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{featureView.name}</BreadcrumbItem>
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
      </PageSection>

      {/* Page Header */}
      <PageSection>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Title headingLevel="h1" size="2xl">{featureView.name}</Title>
              </FlexItem>
              <FlexItem>
                <Label isCompact variant="filled" color="blue">
                  {viewType}
                </Label>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Content component="p">{featureView.description}</Content>
          </FlexItem>
          <FlexItem>
            {/* View Connected Workbenches Link with Icon */}
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
      </PageSection>

      {/* Tabs */}
      <PageSection type="tabs">
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Feature view detail tabs">
          <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab">
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                <Stack>
                  {/* Section 1: Overview */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      Overview
                    </Title>
                    <div style={{ maxWidth: '800px' }}>
                      <DescriptionList isHorizontal isCompact>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Created at</DescriptionListTerm>
                          <DescriptionListDescription>{formatTimestamp(featureView.created)}</DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </div>
                  </StackItem>

                  {/* Section 2: Data source */}
                  {dataSource && (
                    <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                      <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                        Data source
                      </Title>
                      <div style={{ maxWidth: '800px' }}>
                        <Table aria-label="Data source table" variant="compact">
                          <Thead>
                            <Tr>
                              <Th>Source type</Th>
                              <Th>Data source</Th>
                              <Th>File URL</Th>
                              <Th>Created Date</Th>
                              <Th>Last Modified Date</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td dataLabel="Source type">{dataSource.sourceType}</Td>
                              <Td dataLabel="Data source">
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => navigate(`/develop-train/feature-store/data-sources/${dataSource.id}`)}
                                >
                                  {dataSource.name}
                                </Button>
                              </Td>
                              <Td dataLabel="File URL">
                                <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied" variant="inline-compact">
                                  {dataSource.connectionUrl}
                                </ClipboardCopy>
                              </Td>
                              <Td dataLabel="Created Date">{formatTimestamp(dataSource.created)}</Td>
                              <Td dataLabel="Last Modified Date">{formatTimestamp(dataSource.lastUpdated)}</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </div>
                    </StackItem>
                  )}

                  {/* Section 3: Entities */}
                  {entities.length > 0 && (
                    <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                      <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                        Entities
                      </Title>
                      <div style={{ maxWidth: '800px' }}>
                        <DescriptionList isCompact>
                          {entities.map((entity) => (
                            <DescriptionListGroup 
                              key={entity.id}
                              style={{ 
                                borderBottom: '1px solid var(--pf-t--global--border--color--default)'
                              }}
                            >
                              <DescriptionListTerm>{''}</DescriptionListTerm>
                              <DescriptionListDescription>
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => navigate(`/develop-train/feature-store/entities/${entity.id}`)}
                                >
                                  {entity.name}
                                </Button>
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          ))}
                        </DescriptionList>
                      </div>
                    </StackItem>
                  )}

                  {/* Section 4: Tags */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      Tags
                    </Title>
                    <div style={{ maxWidth: '800px' }}>
                      <LabelGroup numLabels={10}>
                        {featureView.tags.map((tag, index) => (
                          <Label key={index} color="blue">{tag}</Label>
                        ))}
                      </LabelGroup>
                    </div>
                  </StackItem>

                  {/* Section 5: Code Snippet */}
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
                              This snippet defines the current feature view. Use it as a template to create similar resources.
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
                          {`from feast import FeatureView, Entity, Feature

feature_view = FeatureView(
    name="${featureView.name}",
    entities=[Entity(name="${entities[0]?.name || 'entity'}")],
    features=[Feature(name="feature_name", dtype=ValueType.FLOAT)]
)`}
                        </CodeBlockCode>
                      </CodeBlock>
                    </div>
                  </StackItem>
                </Stack>
              </PageSection>
            </TabContentBody>
          </Tab>

          <Tab eventKey={1} title={<TabTitleText>Lineage</TabTitleText>} aria-label="Lineage tab">
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                <Stack>
                  {/* Lineage Section */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      Lineage
                    </Title>
                    <div 
                      style={{ 
                        height: '500px', 
                        minHeight: '500px',
                        width: '100%', 
                        position: 'relative', 
                        overflow: 'hidden',
                      }}
                      className="lineage-container"
                    >
                      <style>{`
                        .lineage-container > div {
                          height: 100% !important;
                          min-height: 100% !important;
                          max-height: 100% !important;
                        }
                      `}</style>
                      <FeatureStoreLineage 
                        selectedFeatureStore={selectedFeatureStore} 
                        hideEmptyStates={true}
                        rootNodeId={featureView ? `featureview-${featureView.id}` : undefined}
                      />
                    </div>
                  </StackItem>
                  
                  {/* Schema Section */}
                  <StackItem>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      Schema
                    </Title>
                    
                    {/* Schema Filter Toolbar */}
                    <PageSection padding={{ default: 'noPadding' }} style={{ paddingLeft: 0, paddingRight: 0, marginTop: 'var(--pf-t--global--spacer--md)', marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                      <Toolbar 
                        id="schema-toolbar" 
                        clearAllFilters={clearAllSchemaFilters}
                      >
                        <ToolbarContent>
                          <ToolbarGroup variant="filter-group">
                            <ToolbarItem>
                              <Select
                                aria-label="Select filter attribute"
                                isOpen={isSchemaFilterDropdownOpen}
                                selected={selectedSchemaFilterAttribute}
                                onSelect={(_event, value) => {
                                  setSelectedSchemaFilterAttribute(value as string);
                                  setIsSchemaFilterDropdownOpen(false);
                                }}
                                onOpenChange={(isOpen) => setIsSchemaFilterDropdownOpen(isOpen)}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setIsSchemaFilterDropdownOpen(!isSchemaFilterDropdownOpen)}
                                    isExpanded={isSchemaFilterDropdownOpen}
                                    style={{ width: '150px' }}
                                  >
                                    {selectedSchemaFilterAttribute}
                                  </MenuToggle>
                                )}
                                shouldFocusToggleOnSelect
                              >
                                <SelectList>
                                  <SelectOption value="Columns">Columns</SelectOption>
                                  <SelectOption value="Type">Type</SelectOption>
                                  <SelectOption value="Data Type">Data Type</SelectOption>
                                  <SelectOption value="Description">Description</SelectOption>
                                </SelectList>
                              </Select>
                            </ToolbarItem>
                            <ToolbarItem>
                              <TextInput
                                type="text"
                                aria-label={`Filter by ${selectedSchemaFilterAttribute}`}
                                placeholder={`Filter by ${selectedSchemaFilterAttribute.toLowerCase()}`}
                                value={schemaFilterInputValue}
                                onChange={(_event, value) => setSchemaFilterInputValue(value)}
                                onKeyDown={handleSchemaFilterKeyPress}
                                style={{ minWidth: '250px' }}
                              />
                            </ToolbarItem>
                          </ToolbarGroup>
                          <ToolbarItem variant="pagination" style={{ marginLeft: 'auto' }}>
                            <Pagination
                              itemCount={sortedSchemaTable.length}
                              perPage={schemaPerPage}
                              page={schemaPage}
                              onSetPage={(_event, newPage) => setSchemaPage(newPage)}
                              onPerPageSelect={(_event, newPerPage) => {
                                setSchemaPerPage(newPerPage);
                                setSchemaPage(1);
                              }}
                              variant="top"
                              isCompact
                            />
                          </ToolbarItem>
                        </ToolbarContent>
                        
                        {/* Active Filter Chips */}
                        {hasActiveSchemaFilters && (
                          <ToolbarContent>
                            <ToolbarGroup>
                              {Object.entries(schemaActiveFilters).map(([category, chipsSet]) => {
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
                                              onClose={() => onDeleteSchemaChip(category, chip)}
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
                                <Button variant="link" onClick={clearAllSchemaFilters}>
                                  Clear all filters
                                </Button>
                              </ToolbarItem>
                            </ToolbarGroup>
                          </ToolbarContent>
                        )}
                      </Toolbar>
                    </PageSection>
                    
                    {/* Schema Table */}
                    <Table aria-label="Schema table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th sort={getSchemaSortParams(0)}>Columns</Th>
                          <Th sort={getSchemaSortParams(1)}>Type</Th>
                          <Th sort={getSchemaSortParams(2)}>Data Type</Th>
                          <Th sort={getSchemaSortParams(3)}>Description</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {paginatedSchemaTable.length === 0 ? (
                          <Tr>
                            <Td colSpan={4} dataLabel="No schema data">
                              <Content component="p">No schema data available</Content>
                            </Td>
                          </Tr>
                        ) : (
                          paginatedSchemaTable.map((row, index) => (
                            <Tr key={index}>
                              <Td dataLabel="Columns">
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => handleSchemaColumnClick(row)}
                                  style={{ padding: 0 }}
                                >
                                  {row.column}
                                </Button>
                              </Td>
                              <Td dataLabel="Type">{row.type}</Td>
                              <Td dataLabel="Data Type">{row.dataType}</Td>
                              <Td dataLabel="Description">
                                <Content component="small" style={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {row.description}
                                </Content>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                    
                    {/* Bottom Pagination */}
                    <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                      <FlexItem>
                        <Pagination
                          itemCount={sortedSchemaTable.length}
                          perPage={schemaPerPage}
                          page={schemaPage}
                          onSetPage={(_event, newPage) => setSchemaPage(newPage)}
                          onPerPageSelect={(_event, newPerPage) => {
                            setSchemaPerPage(newPerPage);
                            setSchemaPage(1);
                          }}
                          variant="bottom"
                          isCompact
                        />
                      </FlexItem>
                    </Flex>
                  </StackItem>
                </Stack>
              </PageSection>
            </TabContentBody>
          </Tab>

          <Tab 
            eventKey={2} 
            title={
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <TabTitleText>Feature services</TabTitleText>
                </FlexItem>
                <FlexItem>
                  <Popover
                    aria-label="Feature services help"
                    headerContent="Feature services"
                    bodyContent={
                      <Content component="p">
                        Feature services that include this feature view. These services expose features for online serving.
                      </Content>
                    }
                    showClose
                  >
                    <Button variant="plain" aria-label="Feature services help" style={{ padding: 0 }}>
                      <OutlinedQuestionCircleIcon />
                    </Button>
                  </Popover>
                </FlexItem>
              </Flex>
            } 
            aria-label="Feature services tab"
          >
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                {/* Feature Services Filter Toolbar */}
                <PageSection padding={{ default: 'noPadding' }} style={{ paddingLeft: 0, paddingRight: 0, marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                  <Toolbar 
                    id="fs-toolbar" 
                    clearAllFilters={clearAllFsFilters}
                  >
                    <ToolbarContent>
                      <ToolbarGroup variant="filter-group">
                        <ToolbarItem>
                          <Select
                            aria-label="Select filter attribute"
                            isOpen={isFsFilterDropdownOpen}
                            selected={fsSelectedFilterAttribute}
                            onSelect={(_event, value) => {
                              setFsSelectedFilterAttribute(value as string);
                              setIsFsFilterDropdownOpen(false);
                            }}
                            onOpenChange={(isOpen) => setIsFsFilterDropdownOpen(isOpen)}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                              <MenuToggle
                                ref={toggleRef}
                                onClick={() => setIsFsFilterDropdownOpen(!isFsFilterDropdownOpen)}
                                isExpanded={isFsFilterDropdownOpen}
                                style={{ width: '150px' }}
                              >
                                {fsSelectedFilterAttribute}
                              </MenuToggle>
                            )}
                            shouldFocusToggleOnSelect
                          >
                            <SelectList>
                              <SelectOption value="Feature service">Feature service</SelectOption>
                              <SelectOption value="Tags">Tags</SelectOption>
                              <SelectOption value="Features">Features</SelectOption>
                            </SelectList>
                          </Select>
                        </ToolbarItem>
                        <ToolbarItem>
                          <TextInput
                            type="text"
                            aria-label={`Filter by ${fsSelectedFilterAttribute}`}
                            placeholder={`Filter by ${fsSelectedFilterAttribute.toLowerCase()}`}
                            value={fsFilterInputValue}
                            onChange={(_event, value) => setFsFilterInputValue(value)}
                            onKeyDown={handleFsFilterKeyPress}
                            style={{ minWidth: '250px' }}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarItem variant="pagination" style={{ marginLeft: 'auto' }}>
                        <Pagination
                          itemCount={sortedFeatureServices.length}
                          perPage={fsPerPage}
                          page={fsPage}
                          onSetPage={(_event, newPage) => setFsPage(newPage)}
                          onPerPageSelect={(_event, newPerPage) => {
                            setFsPerPage(newPerPage);
                            setFsPage(1);
                          }}
                          variant="top"
                          isCompact
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                    
                    {/* Active Filter Chips */}
                    {hasActiveFsFilters && (
                      <ToolbarContent>
                        <ToolbarGroup>
                          {Object.entries(fsActiveFilters).map(([category, chipsSet]) => {
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
                                          onClose={() => onDeleteFsChip(category, chip)}
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
                            <Button variant="link" onClick={clearAllFsFilters}>
                              Clear all filters
                            </Button>
                          </ToolbarItem>
                        </ToolbarGroup>
                      </ToolbarContent>
                    )}
                  </Toolbar>
                </PageSection>

                <Table aria-label="Feature services table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th sort={getFsSortParams(0)}>Feature service</Th>
                      <Th sort={getFsSortParams(1)}>Tags</Th>
                      <Th sort={getFsSortParams(2)}>Features</Th>
                      <Th sort={getFsSortParams(3)}>Updated</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedFeatureServices.length === 0 ? (
                      <Tr>
                        <Td colSpan={4} dataLabel="No feature services">
                          <Content component="p">No feature services available</Content>
                        </Td>
                      </Tr>
                    ) : (
                      paginatedFeatureServices.map((fs) => (
                        <Tr key={fs.id}>
                          <Td dataLabel="Feature service">
                            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                              <FlexItem>
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => navigate(`/develop-train/feature-store/feature-services/${fs.id}`)}
                                >
                                  {fs.name}
                                </Button>
                              </FlexItem>
                              <FlexItem>
                                <Content component="small">{fs.description}</Content>
                              </FlexItem>
                            </Flex>
                          </Td>
                          <Td dataLabel="Tags">
                            {fs.tags.length > 0 ? (
                              <LabelGroup numLabels={3}>
                                {fs.tags.map((tag, index) => (
                                  <Label 
                                    key={index} 
                                    color="blue" 
                                    isCompact
                                    onClick={() => {
                                      setFsSelectedFilterAttribute('Tags');
                                      addFsFilterValue(tag);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {tag}
                                  </Label>
                                ))}
                              </LabelGroup>
                            ) : (
                              <span>--</span>
                            )}
                          </Td>
                          <Td dataLabel="Features">
                            <Popover
                              aria-label="Features"
                              hasAutoWidth
                              showClose={true}
                              bodyContent={
                                (() => {
                                  const allFeatureNames: string[] = [];
                                  fs.featureViewIds.forEach(fvId => {
                                    const featureNames = getFeatureNamesForView(fvId);
                                    allFeatureNames.push(...featureNames);
                                  });
                                  return allFeatureNames.length > 0 ? (
                                    <List isPlain style={{ fontSize: '14px' }}>
                                      {allFeatureNames.map((featureName, idx) => {
                                        const feature = mockFeatures.find(f => f.name === featureName && fs.featureViewIds.includes(f.featureViewId));
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
                                  );
                                })()
                              }
                            >
                              <Button variant="link" isInline>
                                {fs.featureViewIds.reduce((sum, fvId) => sum + getFeatureCountForView(fvId), 0)} feature{fs.featureViewIds.reduce((sum, fvId) => sum + getFeatureCountForView(fvId), 0) !== 1 ? 's' : ''}
                              </Button>
                            </Popover>
                          </Td>
                          <Td dataLabel="Updated">{formatTimestamp(fs.lastUpdated)}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>

                {/* Bottom Pagination */}
                <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <FlexItem>
                    <Pagination
                      itemCount={sortedFeatureServices.length}
                      perPage={fsPerPage}
                      page={fsPage}
                      onSetPage={(_event, newPage) => setFsPage(newPage)}
                      onPerPageSelect={(_event, newPerPage) => {
                        setFsPerPage(newPerPage);
                        setFsPage(1);
                      }}
                      variant="bottom"
                      isCompact
                    />
                  </FlexItem>
                </Flex>
              </PageSection>
            </TabContentBody>
          </Tab>

          <Tab 
            eventKey={3} 
            title={
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <TabTitleText>Materialization</TabTitleText>
                </FlexItem>
                <FlexItem>
                  <Popover
                    aria-label="Materialization help"
                    headerContent="Materialization"
                    bodyContent={
                      <Content component="p">
                        Materialization jobs that pre-compute and store feature values for this feature view. These jobs run on a schedule to keep features up-to-date.
                      </Content>
                    }
                    showClose
                  >
                    <Button variant="plain" aria-label="Materialization help" style={{ padding: 0 }}>
                      <OutlinedQuestionCircleIcon />
                    </Button>
                  </Popover>
                </FlexItem>
              </Flex>
            } 
            aria-label="Materialization tab"
          >
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                {materializationJobs.length === 0 ? (
                  <EmptyState variant={EmptyStateVariant.sm}>
                    <Title headingLevel="h2" size="lg">
                      No materialization jobs
                    </Title>
                    <EmptyStateBody>
                      No materialization jobs are scheduled. To create and manage these jobs, schedule corresponding cron jobs in OpenShift.
                    </EmptyStateBody>
                  </EmptyState>
                ) : (
                  <div style={{ maxWidth: '800px' }}>
                    <Table aria-label="Materialization jobs table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th>Materialization interval</Th>
                          <Th>Created</Th>
                          <Th>Updated</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {materializationJobs.map((job) => (
                          <Tr key={job.id}>
                            <Td dataLabel="Materialization interval">{job.interval}</Td>
                            <Td dataLabel="Created">{formatTimestamp(job.created)}</Td>
                            <Td dataLabel="Updated">{formatTimestamp(job.updated)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                )}
              </PageSection>
            </TabContentBody>
          </Tab>

          <Tab 
            eventKey={4} 
            title={
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <TabTitleText>Transformation</TabTitleText>
                </FlexItem>
                <FlexItem>
                  <Popover
                    aria-label="Transformation help"
                    headerContent="Transformation"
                    bodyContent={
                      <Content component="p">
                        The transformation logic applied to this feature view. This includes the Python code and the input data sources or feature views used.
                      </Content>
                    }
                    showClose
                  >
                    <Button variant="plain" aria-label="Transformation help" style={{ padding: 0 }}>
                      <OutlinedQuestionCircleIcon />
                    </Button>
                  </Popover>
                </FlexItem>
              </Flex>
            } 
            aria-label="Transformation tab"
          >
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                <Stack>
                  {/* Top: Transformation Code */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      Transformation
                    </Title>
                    <div style={{ maxWidth: '800px' }}>
                      <CodeBlock>
                        <CodeBlockCode id="transformation-code">
                          {transformationCode}
                        </CodeBlockCode>
                      </CodeBlock>
                    </div>
                  </StackItem>

                  {/* Bottom: Inputs Section */}
                  <StackItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      <FlexItem>
                        <Title headingLevel="h3" size="md">
                          Inputs
                        </Title>
                      </FlexItem>
                      <FlexItem>
                        <Popover
                          aria-label="Inputs help"
                          headerContent="Inputs"
                          bodyContent={
                            <Content component="p">
                              Inputs for this transformation include request data sources and feature view projections.
                            </Content>
                          }
                          showClose
                        >
                          <Button variant="plain" aria-label="Inputs help">
                            <OutlinedQuestionCircleIcon />
                          </Button>
                        </Popover>
                      </FlexItem>
                    </Flex>
                    <div style={{ maxWidth: '800px' }}>
                      {transformationInputs.map((input, index) => {
                        if (input.type === 'request') {
                          const ds = mockDataSources.find(d => d.name === input.name);
                          return (
                            <div key={`request-${index}`} style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                                <FlexItem>
                                  <Content component="p" style={{ fontWeight: 600, margin: 0 }}>
                                    Request data source
                                  </Content>
                                </FlexItem>
                                <FlexItem>
                                  <Button
                                    variant="link"
                                    isInline
                                    onClick={() => {
                                      if (ds) {
                                        navigate(`/develop-train/feature-store/data-sources/${ds.id}`);
                                      }
                                    }}
                                  >
                                    {input.name}
                                  </Button>
                                </FlexItem>
                              </Flex>
                              <Table aria-label="Request data source schema" variant="compact" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <colgroup>
                                  <col style={{ width: '25%' }} />
                                  <col style={{ width: '25%' }} />
                                  <col style={{ width: '50%' }} />
                                </colgroup>
                                <Thead>
                                  <Tr>
                                    <Th>Key</Th>
                                    <Th>Type</Th>
                                    <Th>Description</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {input.schema.map((item, idx) => (
                                    <Tr key={idx}>
                                      <Td dataLabel="Key">{item.key}</Td>
                                      <Td dataLabel="Type">{item.type}</Td>
                                      <Td dataLabel="Description">
                                        {ds ? ds.description : '--'}
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </div>
                          );
                        } else if (input.type === 'featureview') {
                          const fv = mockFeatureViews.find(f => f.name === input.name);
                          return (
                            <div key={`featureview-${index}`} style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
                              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                                <FlexItem>
                                  <Content component="p" style={{ fontWeight: 600, margin: 0 }}>
                                    Feature view
                                  </Content>
                                </FlexItem>
                                <FlexItem>
                                  <Button
                                    variant="link"
                                    isInline
                                    onClick={() => {
                                      if (fv) {
                                        navigate(`/develop-train/feature-store/feature-views/${fv.id}`);
                                      }
                                    }}
                                  >
                                    {input.name}
                                  </Button>
                                </FlexItem>
                              </Flex>
                              <Table aria-label="Feature view projections" variant="compact" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <colgroup>
                                  <col style={{ width: '25%' }} />
                                  <col style={{ width: '25%' }} />
                                  <col style={{ width: '50%' }} />
                                </colgroup>
                                <Thead>
                                  <Tr>
                                    <Th>Feature</Th>
                                    <Th>Type</Th>
                                    <Th>Description</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {input.features.map((feature, idx) => {
                                    const featureObj = mockFeatures.find(f => f.name === feature.feature && f.featureViewId === fv?.id);
                                    return (
                                      <Tr key={idx}>
                                        <Td dataLabel="Feature">{feature.feature}</Td>
                                        <Td dataLabel="Type">{feature.type}</Td>
                                        <Td dataLabel="Description">
                                          {featureObj ? featureObj.description : '--'}
                                        </Td>
                                      </Tr>
                                    );
                                  })}
                                </Tbody>
                              </Table>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </StackItem>
                </Stack>
              </PageSection>
            </TabContentBody>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export default FeatureViewDetailPage;
