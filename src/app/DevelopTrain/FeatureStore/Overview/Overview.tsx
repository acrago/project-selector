import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Content,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
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
  Tab,
  TabTitleText,
  Tabs,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  ExternalLinkAltIcon,
  TagIcon,
  WrenchIcon,
} from '@patternfly/react-icons';
import { mockEntities } from '../../../../mockData/entities';
import { FeatureStoreLineage } from '../../../../components/FeatureStoreLineage/FeatureStoreLineage';
import {
  PopularTag,
  RecentlyViewedResource,
  formatRelativeTime,
  mockDataSources,
  mockDatasets,
  mockFeatureServices,
  mockFeatureViews,
  mockFeatures,
  mockPopularTags,
  mockRecentlyViewed,
} from '../../../../mockData/featureStore';

// Mock connected workbenches data (reused from Entities page)
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

// Feature Store Overview Icon SVG
const FeatureStoreIcon = () => (
  <svg className="pf-v6-svg" viewBox="0 0 40 40" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em">
    <path d="M28.5,25.375c-.63568,0-1.22626.19312-1.72021.52051l-4.38898-4.38898c.77032-.96265,1.23419-2.18066,1.23419-3.50653s-.46387-2.54388-1.23419-3.50653l3.25592-3.25592c.39655.24078.85651.38745,1.35327.38745,1.44727,0,2.625-1.17773,2.625-2.625s-1.17773-2.625-2.625-2.625-2.625,1.17773-2.625,2.625c0,.49677.14667.95673.38745,1.35327l-3.25592,3.25592c-.96265-.77032-2.18066-1.23419-3.50653-1.23419s-2.54388.46387-3.50653,1.23419l-4.38898-4.38898c.32745-.49402.52051-1.08459.52051-1.72021,0-1.72266-1.40186-3.125-3.125-3.125s-3.125,1.40234-3.125,3.125,1.40186,3.125,3.125,3.125c.63568,0,1.22626-.19312,1.72021-.52051l4.38898,4.38898c-.77032.96265-1.23419,2.18066-1.23419,3.50653s.46387,2.54388,1.23419,3.50653l-3.25586,3.25586c-.39655-.24078-.85657-.38739-1.35333-.38739-1.44727,0-2.625,1.17773-2.625,2.625s1.17773,2.625,2.625,2.625,2.625-1.17773,2.625-2.625c0-.49677-.14661-.95679-.38739-1.35333l3.25586-3.25586c.96265.77032,2.18066,1.23419,3.50653,1.23419s2.54388-.46387,3.50653-1.23419l4.38898,4.38898c-.32745.49402-.52051,1.08459-.52051,1.72021,0,1.72266,1.40186,3.125,3.125,3.125s3.125-1.40234,3.125-3.125-1.40186-3.125-3.125-3.125ZM27,7.625c.7583,0,1.375.61719,1.375,1.375s-.6167,1.375-1.375,1.375-1.375-.61719-1.375-1.375.6167-1.375,1.375-1.375ZM5.625,7.5c0-1.03418.84131-1.875,1.875-1.875s1.875.84082,1.875,1.875-.84131,1.875-1.875,1.875-1.875-.84082-1.875-1.875ZM9,28.375c-.7583,0-1.375-.61719-1.375-1.375s.6167-1.375,1.375-1.375,1.375.61719,1.375,1.375-.6167,1.375-1.375,1.375ZM13.625,18c0-2.41211,1.9624-4.375,4.375-4.375s4.375,1.96289,4.375,4.375-1.9624,4.375-4.375,4.375-4.375-1.96289-4.375-4.375ZM28.5,30.375c-1.03369,0-1.875-.84082-1.875-1.875s.84131-1.875,1.875-1.875,1.875.84082,1.875,1.875-.84131,1.875-1.875,1.875Z"></path>
  </svg>
);

// Custom SVG Icons for Resource Cards (black outline style)
const EntitiesIcon = () => (
  <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em">
    <path d="M28.125,9c0-1.99902-1.62598-3.625-3.625-3.625s-3.625,1.62598-3.625,3.625c0,1.78497,1.29919,3.26373,3,3.56177v2.43823c0,1.30957-1.06543,2.375-2.375,2.375h-6c-1.33502,0-2.53003.57721-3.375,1.48492v-8.29816c1.70081-.29803,3-1.77679,3-3.56177,0-1.99902-1.62598-3.625-3.625-3.625s-3.625,1.62598-3.625,3.625c0,1.78497,1.29919,3.26373,3,3.56177v14.87646c-1.70081.29803-3,1.77679-3,3.56177,0,1.99902,1.62598,3.625,3.625,3.625s3.625-1.62598,3.625-3.625c0-1.78497-1.29919-3.26373-3-3.56177v-3.43823c0-1.86133,1.51416-3.375,3.375-3.375h6c1.99902,0,3.625-1.62598,3.625-3.625v-2.43823c1.70081-.29803,3-1.77679,3-3.56177ZM9.125,7c0-1.30957,1.06543-2.375,2.375-2.375s2.375,1.06543,2.375,2.375-1.06543,2.375-2.375,2.375-2.375-1.06543-2.375-2.375ZM13.875,29c0,1.30957-1.06543,2.375-2.375,2.375s-2.375-1.06543-2.375-2.375,1.06543-2.375,2.375-2.375,2.375,1.06543,2.375,2.375ZM24.5,11.375c-1.30957,0-2.375-1.06543-2.375-2.375s1.06543-2.375,2.375-2.375,2.375,1.06543,2.375,2.375-1.06543,2.375-2.375,2.375Z"></path>
  </svg>
);

const DataSourcesIcon = () => (
  <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em">
    <path d="M22.8457,16.3933c.1934-.1118.3125-.3184.3125-.5415v-5.2344c0-.2231-.1191-.4297-.3125-.5415l-4.5332-2.6172c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2344c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835l4.5332-2.6172ZM14.0918,15.491v-4.5127l3.9082-2.2563,3.9082,2.2563v4.5127l-3.9082,2.2563-3.9082-2.2563Z M23.7832,28.5417l4.5332-2.6172c.1934-.1118.3125-.3184.3125-.5415v-5.2349c0-.2231-.1191-.4297-.3125-.5415l-4.5332-2.6172c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2349c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835ZM19.5625,25.0222v-4.5132l3.9082-2.2563,3.9082,2.2563v4.5132l-3.9082,2.2563s-3.9082-2.2563-3.9082-2.2563Z M12.8418,16.9895c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2349c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835l4.5332-2.6172c.1934-.1118.3125-.3184.3125-.5415v-5.2349c0-.2231-.1191-.4297-.3125-.5415,0,0-4.5332-2.6172-4.5332-2.6172ZM16.4375,25.0222l-3.9082,2.2563-3.9082-2.2563v-4.5132l3.9082-2.2563,3.9082,2.2563v4.5132Z M12,30.3752h-6.375V5.6252h6.375c.3452,0,.625-.2798.625-.625s-.2798-.625-.625-.625h-7c-.3452,0-.625.2798-.625.625v26c0,.3452.2798.625.625.625h7c.3452,0,.625-.2798.625-.625s-.2798-.625-.625-.625Z M31,4.3752h-7c-.3452,0-.625.2798-.625.625s.2798.625.625.625h6.375v24.75h-6.375c-.3452,0-.625.2798-.625.625s.2798.625.625.625h7c.3452,0,.625-.2798.625-.625V5.0002c0-.3452-.2798-.625-.625-.625Z"></path>
  </svg>
);

const DatasetsIcon = () => (
  <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em">
    <path d="M31,6.375H5c-.34521,0-.625.27979-.625.625v22c0,.34473.27979.625.625.625h26c.34521,0,.625-.28027.625-.625V7c0-.34521-.27979-.625-.625-.625ZM5.625,11.625h11.75v7.75H5.625v-7.75ZM18.625,11.625h11.75v7.75h-11.75v-7.75ZM30.375,7.625v2.75H5.625v-2.75h24.75ZM5.625,20.625h11.75v7.75H5.625v-7.75ZM18.625,28.375v-7.75h11.75v7.75h-11.75Z"></path>
  </svg>
);

const FeaturesIcon = () => (
  <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em">
    <path d="M31,27.625H5c-.34521,0-.625-.28027-.625-.625V9c0-.34473.27979-.625.625-.625h26c.34521,0,.625.28027.625.625v18c0,.34473-.27979.625-.625.625ZM5.625,26.375h24.75V9.625H5.625v16.75Z"></path>
  </svg>
);

const FeatureViewsIcon = () => (
  <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em">
    <path d="M25.625,22v-14c0-.34473-.27979-.625-.625-.625H5c-.34521,0-.625.28027-.625.625v14c0,.34473.27979.625.625.625h20c.34521,0,.625-.28027.625-.625ZM24.375,21.375H5.625v-12.75h18.75v12.75Z M28.625,25v-14c0-.34473-.27979-.625-.625-.625s-.625.28027-.625.625v13.375H8c-.34521,0-.625.28027-.625.625s.27979.625.625.625h20c.34521,0,.625-.28027.625-.625Z M31,13.375c-.34521,0-.625.28027-.625.625v13.375H11c-.34521,0-.625.28027-.625.625s.27979.625.625.625h20c.34521,0,.625-.28027.625-.625v-14c0-.34473-.27979-.625-.625-.625Z"></path>
  </svg>
);

const FeatureServicesIcon = () => (
  <svg className="pf-v6-svg" viewBox="0 0 36 36" fill="currentColor" aria-hidden="true" role="img" width="1em" height="1em">
    <path d="M16,7.375H5c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM15.375,15.375H5.625v-6.75h9.75v6.75Z M31,7.375h-11c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM30.375,15.375h-9.75v-6.75h9.75v6.75Z M16,19.375H5c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM15.375,27.375H5.625v-6.75h9.75v6.75Z M31,19.375h-11c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM30.375,27.375h-9.75v-6.75h9.75v6.75Z"></path>
  </svg>
);

/**
 * Feature Store Overview Page
 * Central dashboard for the Feature Store with metrics, popular tags, and recent activity
 */
const Overview: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab state
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  
  // Feature Store context selector state - initialize from URL param if present
  const [selectedFeatureStore, setSelectedFeatureStore] = useState(() => {
    const featureStoreParam = searchParams.get('featureStore');
    return featureStoreParam || 'All feature stores';
  });
  const [isFeatureStoreOpen, setIsFeatureStoreOpen] = useState(false);
  
  // Update feature store selection when URL param changes
  useEffect(() => {
    const featureStoreParam = searchParams.get('featureStore');
    if (featureStoreParam) {
      setSelectedFeatureStore(featureStoreParam);
    }
  }, [searchParams]);
  
  // Global search state
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Pagination for recently viewed table
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  
  // Learn how to connect popover state
  const [isLearnPopoverOpen, setIsLearnPopoverOpen] = useState(false);
  
  // Get resource counts dynamically filtered by selected feature store
  const resourceCounts = useMemo(() => {
    if (selectedFeatureStore === 'All feature stores') {
      return {
        entities: mockEntities.length,
        dataSources: mockDataSources.length,
        datasets: mockDatasets.length,
        features: mockFeatures.length,
        featureViews: mockFeatureViews.length,
        featureServices: mockFeatureServices.length,
      };
    }
    
    return {
      entities: mockEntities.filter(e => e.featureStore === selectedFeatureStore).length,
      dataSources: mockDataSources.filter(ds => ds.featureStore === selectedFeatureStore).length,
      datasets: mockDatasets.filter(d => d.featureStore === selectedFeatureStore).length,
      features: mockFeatures.filter(f => f.featureStore === selectedFeatureStore).length,
      featureViews: mockFeatureViews.filter(fv => fv.featureStore === selectedFeatureStore).length,
      featureServices: mockFeatureServices.filter(fs => fs.featureStore === selectedFeatureStore).length,
    };
  }, [selectedFeatureStore]);
  
  // Resource summary cards data with PatternFly color backgrounds (round icons, black outline)
  // Colors are one degree lighter using brightness filter while maintaining the same color tone
  const resourceCards = [
    {
      id: 'entities',
      title: 'Entities',
      description: 'Entities are collections of related features and can be mapped to the domain of your use case.',
      count: resourceCounts.entities,
      link: '/develop-train/feature-store/entities',
      icon: <EntitiesIcon />,
      iconBg: 'var(--pf-t--global--color--nonstatus--gray--default)', // Gray default
    },
    {
      id: 'data-sources',
      title: 'Data sources',
      description: 'Data sources such as tables or data warehouses contain the raw data from which features are extracted.',
      count: resourceCounts.dataSources,
      link: '/develop-train/feature-store/data-sources',
      icon: <DataSourcesIcon />,
      iconBg: 'var(--pf-t--global--color--nonstatus--blue--default)', // Blue default
    },
    {
      id: 'datasets',
      title: 'Datasets',
      description: 'Datasets are point-in-time-correct snapshots of feature data used for training or validation.',
      count: resourceCounts.datasets,
      link: '/develop-train/feature-store/data-sets',
      icon: <DatasetsIcon />,
      iconBg: 'var(--pf-t--global--color--nonstatus--teal--default)', // Teal default
    },
    {
      id: 'features',
      title: 'Features',
      description: 'A feature is a single data value used in model training or inference.',
      count: resourceCounts.features,
      link: '/develop-train/feature-store/features',
      icon: <FeaturesIcon />,
      iconBg: 'var(--pf-t--global--color--nonstatus--orange--default)', // Orange default
    },
    {
      id: 'feature-views',
      title: 'Feature views',
      description: 'A feature view is a logical group of time-series feature data as it is found in a data source.',
      count: resourceCounts.featureViews,
      link: '/develop-train/feature-store/feature-views',
      icon: <FeatureViewsIcon />,
      iconBg: 'var(--pf-t--global--color--nonstatus--purple--default)', // Purple default
    },
    {
      id: 'feature-services',
      title: 'Feature services',
      description: 'A feature service is a logical group of features from one or more feature views.',
      count: resourceCounts.featureServices,
      link: '/develop-train/feature-store/feature-services',
      icon: <FeatureServicesIcon />,
      iconBg: 'var(--pf-t--global--color--nonstatus--green--default)', // Green default
    },
  ];
  
  // Global search results filtered by selected feature store
  const globalSearchResults = useMemo(() => {
    if (!globalSearchValue.trim()) return { results: [], total: 0 };
    
    const query = globalSearchValue.toLowerCase();
    const results: SearchResult[] = [];
    
    // Filter function for feature store
    const matchesFeatureStore = (itemFeatureStore: string) => {
      return selectedFeatureStore === 'All feature stores' || itemFeatureStore === selectedFeatureStore;
    };
    
    // Search entities
    mockEntities
      .filter(entity => 
        matchesFeatureStore(entity.featureStore) &&
        (entity.name.toLowerCase().includes(query) ||
        entity.description.toLowerCase().includes(query) ||
        entity.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .forEach(entity => {
        results.push({
          id: entity.id,
          name: entity.name,
          description: entity.description,
          category: 'Entities',
          featureStore: entity.featureStore,
          tags: entity.tags,
        });
      });
    
    // Search data sources
    mockDataSources
      .filter(ds => 
        matchesFeatureStore(ds.featureStore) &&
        (ds.name.toLowerCase().includes(query) ||
        ds.description.toLowerCase().includes(query) ||
        ds.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .forEach(ds => {
        results.push({
          id: ds.id,
          name: ds.name,
          description: ds.description,
          category: 'Data Sources',
          featureStore: ds.featureStore,
          tags: ds.tags,
        });
      });
    
    // Search features
    mockFeatures
      .filter(f => 
        matchesFeatureStore(f.featureStore) &&
        (f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .forEach(f => {
        results.push({
          id: f.id,
          name: f.name,
          description: f.description,
          category: 'Features',
          featureStore: f.featureStore,
          tags: f.tags,
        });
      });
    
    // Search feature views
    mockFeatureViews
      .filter(fv => 
        matchesFeatureStore(fv.featureStore) &&
        (fv.name.toLowerCase().includes(query) ||
        fv.description.toLowerCase().includes(query) ||
        fv.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .forEach(fv => {
        results.push({
          id: fv.id,
          name: fv.name,
          description: fv.description,
          category: 'Feature Views',
          featureStore: fv.featureStore,
          tags: fv.tags,
        });
      });
    
    return { results, total: results.length };
  }, [globalSearchValue, selectedFeatureStore]);
  
  // Group search results by category
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
  
  // Filtered recently viewed resources based on selected feature store
  const filteredRecentlyViewed = useMemo(() => {
    if (selectedFeatureStore === 'All feature stores') {
      return mockRecentlyViewed;
    }
    return mockRecentlyViewed.filter(r => r.featureStore === selectedFeatureStore);
  }, [selectedFeatureStore]);
  
  // Paginated recently viewed resources
  const paginatedRecentlyViewed = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return filteredRecentlyViewed.slice(start, end);
  }, [page, perPage, filteredRecentlyViewed]);
  
  // Filtered popular tags based on selected feature store
  const filteredPopularTags = useMemo(() => {
    if (selectedFeatureStore === 'All feature stores') {
      return mockPopularTags;
    }
    
    // Filter feature views within each tag to only show those from the selected feature store
    return mockPopularTags.map(tag => {
      const filteredFeatureViews = tag.featureViews.filter(fvName => {
        const fv = mockFeatureViews.find(f => f.name === fvName);
        return fv && fv.featureStore === selectedFeatureStore;
      });
      return {
        ...tag,
        featureViews: filteredFeatureViews,
        totalCount: filteredFeatureViews.length,
      };
    }).filter(tag => tag.featureViews.length > 0);
  }, [selectedFeatureStore]);
  
  // Handle click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
      default:
        break;
    }
    setIsSearchDropdownOpen(false);
    setGlobalSearchValue('');
  };
  
  // Handle feature view link click from popular tags
  const handleFeatureViewClick = (featureViewName: string) => {
    const fv = mockFeatureViews.find(f => f.name === featureViewName);
    if (fv) {
      navigate(`/develop-train/feature-store/feature-views/${fv.id}`);
    }
  };
  
  // Handle resource link click from recently viewed table
  const handleResourceClick = (resource: RecentlyViewedResource) => {
    switch (resource.resourceType) {
      case 'Entity':
        navigate(`/develop-train/feature-store/entities/${resource.id}`);
        break;
      case 'Data source':
        navigate(`/develop-train/feature-store/data-sources/${resource.id}`);
        break;
      case 'Dataset':
        navigate(`/develop-train/feature-store/data-sets/${resource.id}`);
        break;
      case 'Feature':
        navigate(`/develop-train/feature-store/features/${resource.id}`);
        break;
      case 'Feature View':
        navigate(`/develop-train/feature-store/feature-views/${resource.id}`);
        break;
      case 'Feature Service':
        navigate(`/develop-train/feature-store/feature-services/${resource.id}`);
        break;
      default:
        break;
    }
  };
  
  // Render workbench popover content - matches the design exactly
  const renderWorkbenchPopoverContent = () => {
    const featureStoreName = selectedFeatureStore === 'All feature stores' 
      ? <strong>All feature stores</strong> 
      : <strong>{selectedFeatureStore}</strong>;
    
    return (
      <div>
        {/* First section - Connected workbenches */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            Workbenches already connected to the {featureStoreName} feature store:
          </div>
          <List style={{ marginLeft: '8px' }}>
            {mockConnectedWorkbenches.map((wb, index) => (
              <ListItem key={index} style={{ fontSize: '14px' }}>
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
            Projects that can access the {featureStoreName} feature store but do not have connected workbenches:
          </div>
          <List style={{ marginLeft: '8px' }}>
            {mockProjectsWithoutWorkbenches.map((proj, index) => (
              <ListItem key={index} style={{ fontSize: '14px' }}>
                <Button variant="link" isInline style={{ fontWeight: 600 }}>{proj.name}</Button>
                {' '}project
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    );
  };
  
  // Render integration instructions popover content
  const renderLearnPopoverContent = () => (
    <div style={{ maxWidth: '400px', fontSize: '14px' }}>
      <p style={{ marginBottom: '12px' }}>
        To connect a feature store to a workbench, the workbench must belong to a project that has permission to access the feature store.
      </p>
      <p style={{ marginBottom: '12px' }}>
        To see which projects have the required permissions, click <strong>View connected workbenches</strong>.
      </p>
      <p style={{ margin: 0 }}>
        In a compatible project, create or edit a workbench and select the desired feature store in the <strong>Feature stores</strong> field.
      </p>
    </div>
  );
  
  return (
    <>
      {/* Header Section */}
  <PageSection style={{ paddingBottom: 0 }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                background: 'var(--pf-t--global--color--nonstatus--gray--default)', 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                <FeatureStoreIcon />
              </div>
              Feature store overview
            </Title>
          </FlexItem>
          <FlexItem>
            {/* Global Search Bar - matching Entities page style */}
            <div ref={searchContainerRef} style={{ position: 'relative', width: '350px' }}>
              <Tooltip
                content="Search by name, description, or tag (e.g., team=platform)"
                position="top"
                triggerRef={searchContainerRef}
              >
                <SearchInput
                  id="feature-store-overview-global-search"
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
              
              {/* Search Dropdown - matching Entities page style */}
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
                                  {result.tags && result.tags.length > 0 && (() => {
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
        
        <Content component="p" style={{ marginTop: '12px' }}>
          The feature store is a centralized catalog for managing, storing, and serving features, ensuring your models have reliable access to consistent data from prototyping to production. To consume and manage resources from feature store, you must integrate it with your workbenches.{' '}
          <Popover
            aria-label="Integration instructions"
            headerContent="Integration instructions"
            bodyContent={renderLearnPopoverContent()}
            isVisible={isLearnPopoverOpen}
            shouldOpen={() => setIsLearnPopoverOpen(true)}
            shouldClose={() => setIsLearnPopoverOpen(false)}
            showClose
          >
            <Button variant="link" isInline>Learn how to connect</Button>
          </Popover>.
        </Content>
        
        {/* Feature Store Dropdown and View Connected Workbenches */}
        <Flex style={{ marginTop: '24px' }} alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapLg' }}>
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem>
                <span style={{ fontWeight: 400 }}>Feature store</span>
              </FlexItem>
              <FlexItem>
                <Select
                  id="feature-store-overview-dropdown"
                  isOpen={isFeatureStoreOpen}
                  onOpenChange={(isOpen) => setIsFeatureStoreOpen(isOpen)}
                  onSelect={(_event, value) => {
                    const newValue = value as string;
                    setSelectedFeatureStore(newValue);
                    setIsFeatureStoreOpen(false);
                    setPage(1); // Reset pagination when feature store changes
                    // Update URL parameter for cross-navigation consistency
                    if (newValue === 'All feature stores') {
                      searchParams.delete('featureStore');
                    } else {
                      searchParams.set('featureStore', newValue);
                    }
                    setSearchParams(searchParams, { replace: true });
                  }}
                  selected={selectedFeatureStore}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      id="feature-store-overview-toggle"
                      ref={toggleRef}
                      onClick={() => setIsFeatureStoreOpen(!isFeatureStoreOpen)}
                      isExpanded={isFeatureStoreOpen}
                      style={{ minWidth: '200px' }}
                    >
                      {selectedFeatureStore}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value="All feature stores">All feature stores</SelectOption>
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
              aria-label="View connected workbenches"
              headerContent="Connected workbenches"
              bodyContent={renderWorkbenchPopoverContent()}
              position="right"
              showClose
              minWidth="460px"
            >
              <Button variant="link" icon={<WrenchIcon />}>
                View connected workbenches
              </Button>
            </Popover>
          </FlexItem>
        </Flex>
        
        {/* Tabs */}
        <Tabs
          activeKey={activeTabKey}
          onSelect={(_event, tabIndex) => setActiveTabKey(tabIndex)}
          style={{ marginTop: '24px', marginBottom: 0 }}
        >
          <Tab eventKey={0} title={<TabTitleText>Metrics</TabTitleText>} />
          <Tab eventKey={1} title={<TabTitleText>Lineage</TabTitleText>} />
        </Tabs>
      </PageSection>
      
      {/* Metrics Tab Content */}
      {activeTabKey === 0 && (
        <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 350px)' }}>
          {/* Resource Summary Cards - max 4 per row */}
          <Grid hasGutter style={{ marginBottom: '32px' }}>
            {resourceCards.map((card) => (
              <GridItem key={card.id} sm={12} md={6} lg={3}>
                <Card isCompact style={{ height: '100%' }}>
                  <CardTitle>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                      <FlexItem>
                        <div style={{ 
                          background: card.iconBg, 
                          borderRadius: '50%', 
                          width: '40px', 
                          height: '40px', 
                          fontSize: '32px',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#151515', // Black icons
                        }}>
                          {card.icon}
                        </div>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ 
                          fontWeight: 500, 
                          fontSize: 'var(--pf-t--global--font--size--heading--h4)',
                          fontFamily: 'RedHatDisplay, "Red Hat Display", "Overpass", overpass, helvetica, arial, sans-serif'
                        }}>{card.title}</span>
                      </FlexItem>
                    </Flex>
                  </CardTitle>
                  <CardBody style={{ display: 'flex', flexDirection: 'column' }}>
                    <Content component="p" style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '12px', flex: 1 }}>
                      {card.description}
                    </Content>
                    <div style={{ 
                      fontSize: 'var(--pf-t--global--font--size--heading--2xl)', 
                      fontWeight: 500, 
                      textAlign: 'left',
                      fontFamily: 'RedHatDisplay, "Red Hat Display", "Overpass", overpass, helvetica, arial, sans-serif'
                    }}>{card.count}</div>
                  </CardBody>
                  <CardFooter>
                    <Button 
                      variant="link" 
                      isInline 
                      onClick={() => {
                        // Pass feature store selection via URL parameter for cross-navigation consistency
                        const featureStoreParam = selectedFeatureStore !== 'All feature stores' 
                          ? `?featureStore=${encodeURIComponent(selectedFeatureStore)}` 
                          : '';
                        navigate(`${card.link}${featureStoreParam}`);
                      }}
                    >
                      Go to <strong>{card.title}</strong>
                    </Button>
                  </CardFooter>
                </Card>
              </GridItem>
            ))}
          </Grid>
          
          {/* Popular Tags Section */}
          <div style={{ marginBottom: '32px' }}>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '16px' }}>
              Discover feature views by popular tags
            </Title>
            {filteredPopularTags.length === 0 ? (
              <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                No popular tags found for {selectedFeatureStore}.
              </Content>
            ) : (
            <Grid hasGutter>
              {filteredPopularTags.map((tagData: PopularTag, index: number) => (
                <GridItem key={index} md={6} lg={3}>
                  <Card isCompact style={{ height: '100%' }}>
                    <CardTitle>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <FlexItem>
                          <TagIcon style={{ color: 'var(--pf-t--global--icon--color--regular)' }} />
                        </FlexItem>
                        <FlexItem>
                          <span style={{ 
                            fontWeight: 500, 
                            fontSize: 'var(--pf-t--global--font--size--heading--h4)',
                            fontFamily: 'RedHatDisplay, "Red Hat Display", "Overpass", overpass, helvetica, arial, sans-serif'
                          }}>{tagData.tagKey} = {tagData.tagValue}</span>
                        </FlexItem>
                      </Flex>
                    </CardTitle>
                    <CardBody>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '8px' }}>
                        Feature views:
                      </div>
                      <List isPlain>
                        {tagData.featureViews.slice(0, 5).map((fvName, fvIndex) => (
                          <ListItem key={fvIndex}>
                            <Button 
                              variant="link" 
                              isInline 
                              onClick={() => handleFeatureViewClick(fvName)}
                              style={{ fontSize: '0.875rem' }}
                            >
                              {fvName}
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                    <CardFooter>
                      <Button 
                        variant="link" 
                        isInline
                        onClick={() => navigate(`/develop-train/feature-store/feature-views?tag=${tagData.tagKey}=${tagData.tagValue}`)}
                      >
                        View all ({tagData.totalCount})
                      </Button>
                    </CardFooter>
                  </Card>
                </GridItem>
              ))}
            </Grid>
            )}
          </div>
          
          {/* Recently Viewed Resources - Plain table without card */}
          <div>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '16px' }}>
              Recently viewed resources
            </Title>
            
            {/* Top Pagination */}
            <Toolbar style={{ paddingLeft: 0, paddingRight: 0 }}>
              <ToolbarContent>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={filteredRecentlyViewed.length}
                    page={page}
                    perPage={perPage}
                    onSetPage={(_event, newPage) => setPage(newPage)}
                    onPerPageSelect={(_event, newPerPage) => {
                      setPerPage(newPerPage);
                      setPage(1);
                    }}
                    perPageOptions={[
                      { title: '10', value: 10 },
                      { title: '20', value: 20 },
                      { title: '50', value: 50 },
                    ]}
                    variant="top"
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            
            <Table aria-label="Recently viewed resources table" variant="compact">
              <Thead>
                <Tr>
                  <Th>Resource name</Th>
                  <Th>Resource type</Th>
                  <Th>Feature store</Th>
                  <Th>Last viewed</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedRecentlyViewed.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                      <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                        No recently viewed resources for {selectedFeatureStore}.
    </Content>
                    </Td>
                  </Tr>
                ) : (
                  paginatedRecentlyViewed.map((resource: RecentlyViewedResource) => (
                    <Tr key={resource.id}>
                      <Td dataLabel="Resource name">
                        <Button 
                          variant="link" 
                          isInline 
                          onClick={() => handleResourceClick(resource)}
                        >
                          {resource.name}
                        </Button>
                      </Td>
                      <Td dataLabel="Resource type">{resource.resourceType}</Td>
                      <Td dataLabel="Feature store">
                        {resource.featureStore}
                      </Td>
                      <Td dataLabel="Last viewed">{formatRelativeTime(resource.lastViewed)}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
            
            {/* Bottom Pagination */}
            <Toolbar style={{ paddingLeft: 0, paddingRight: 0 }}>
              <ToolbarContent>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={filteredRecentlyViewed.length}
                    page={page}
                    perPage={perPage}
                    onSetPage={(_event, newPage) => setPage(newPage)}
                    onPerPageSelect={(_event, newPerPage) => {
                      setPerPage(newPerPage);
                      setPage(1);
                    }}
                    perPageOptions={[
                      { title: '10', value: 10 },
                      { title: '20', value: 20 },
                      { title: '50', value: 50 },
                    ]}
                    variant="bottom"
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </div>
        </PageSection>
      )}
      
      {/* Lineage Tab Content - Full Bleed Layout */}
      {activeTabKey === 1 && (
        <PageSection 
          style={{ 
            backgroundColor: 'var(--pf-t--global--background--color--primary--default)', 
            minHeight: 'calc(100vh - 350px)',
            padding: 0, // Remove default padding for full bleed
            margin: 0, // Remove default margin
          }}
        >
          <FeatureStoreLineage selectedFeatureStore={selectedFeatureStore} />
        </PageSection>
      )}
    </>
);
};

export { Overview };
