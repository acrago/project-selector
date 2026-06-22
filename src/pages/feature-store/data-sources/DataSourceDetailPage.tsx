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
  Flex,
  FlexItem,
  Label,
  List,
  ListItem,
  PageSection,
  Panel,
  PanelMain,
  PanelMainBody,
  Popover,
  SearchInput,
  Skeleton,
  Stack,
  StackItem,
  Tab,
  TabContentBody,
  TabTitleText,
  Tabs,
  Title,
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
  OutlinedQuestionCircleIcon,
  WrenchIcon,
} from '@patternfly/react-icons';
import { 
  formatTimestamp,
  mockDataSources,
  mockFeatureServices,
  mockFeatureViews,
} from '../../../mockData/featureStore';

// Mock connected workbenches data
const mockConnectedWorkbenches = [
  { name: 'My application', project: 'Banking' },
  { name: 'example', project: 'demo' },
];

const mockProjectsWithoutWorkbenches = [
  { name: 'Project 3' },
  { name: 'Project 4' },
];

// Mock owner data for data sources
const getDataSourceOwner = (dataSourceId: string): string => {
  const owners: Record<string, string> = {
    'ds-001': 'acorvin@redhat.com',
    'ds-002': 'jsmith@redhat.com',
    'ds-003': 'mjones@redhat.com',
    'ds-004': 'acorvin@redhat.com',
  };
  return owners[dataSourceId] || 'unknown@redhat.com';
};

// Mock batch data source for StreamKafka data sources
const getBatchDataSource = (dataSourceId: string): string | null => {
  // For Kafka sources, return a related batch data source
  if (dataSourceId === 'ds-003') {
    return 'loan_table'; // Example batch source for transaction_stream
  }
  return null;
};

// Schema field interface for RequestSource
interface SchemaField {
  feature: string;
  valueType: string;
}

// Mock schema data for RequestSource data sources (table format)
const getRequestSourceSchemaFields = (dataSourceId: string): SchemaField[] => {
  const schemas: Record<string, SchemaField[]> = {
    'ds-005': [
      { feature: 'loan_amnt', valueType: 'INT64' },
      { feature: 'person_income', valueType: 'INT64' },
      { feature: 'application_channel', valueType: 'STRING' },
      { feature: 'time_of_day', valueType: 'INT64' },
    ],
  };
  return schemas[dataSourceId] || [];
};

// Mock interactive example JSON for RequestSource data sources
const getRequestSourceInteractiveExample = (dataSourceName: string, dataSourceId: string): string => {
  const schemaFields = getRequestSourceSchemaFields(dataSourceId);
  const schemaArray = schemaFields.map(field => ({
    name: field.feature,
    valueType: field.valueType,
  }));
  
  return JSON.stringify({
    type: 'REQUEST_SOURCE',
    dataSourceClassType: 'feast.data_source.RequestSource',
    requestDataOptions: {
      schema: schemaArray,
    },
    name: dataSourceName,
    project: 'credit_scoring_local',
  }, null, 2);
};

// Determine data source connector type
const getDataSourceConnectorType = (sourceType: string): 'BatchData' | 'RequestSource' | 'StreamKafka' => {
  if (sourceType === 'Kafka') {
    return 'StreamKafka';
  }
  if (sourceType === 'Request') {
    return 'RequestSource';
  }
  // For now, treat all others as BatchData
  return 'BatchData';
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
 * DataSourceDetailPage Component
 * Displays detailed information about a specific data source with tabs for Details, Feature Views, and Schema (for RequestSource)
 */
export const DataSourceDetailPage: React.FC = () => {
  const { dataSourceId } = useParams<{ dataSourceId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [copied, setCopied] = useState(false);
  
  // Get feature store from URL params (for search, etc.)
  const selectedFeatureStore = searchParams.get('featureStore') || 'All feature stores';
  
  // Get the resource's actual feature store for breadcrumb TEXT (visual display)
  // Only use the actual value when resource is loaded, no default fallback
  
  // Global search state
  const [globalSearchValue, setGlobalSearchValue] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Find the data source by ID
  const dataSource = mockDataSources.find(ds => ds.id === dataSourceId);
  
  // Determine connector type
  const connectorType = dataSource ? getDataSourceConnectorType(dataSource.sourceType) : 'BatchData';
  
  // Get feature views that use this data source
  const featureViews = useMemo(() => {
    if (!dataSource) return [];
    return mockFeatureViews.filter(fv => fv.dataSourceId === dataSource.id);
  }, [dataSource]);

  // Get feature service consumers count for each feature view
  const getFeatureServiceConsumersCount = (featureViewId: string): number => {
    return mockFeatureServices.filter(fs => fs.featureViewIds.includes(featureViewId)).length;
  };


  // Handle tab selection
  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  // Handle copy code
  const handleCopyCode = () => {
    if (dataSource) {
      const codeSnippet = `from feast import DataSource

data_source = DataSource(
    name="${dataSource.name}",
    source_type="${dataSource.sourceType}",
    connection_url="${dataSource.connectionUrl}"
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
    
    // Search data sources
    const dataSourceResults: SearchResult[] = mockDataSources
      .filter(ds => 
        (selectedFeatureStore === 'All feature stores' || ds.featureStore === selectedFeatureStore) &&
        (ds.name.toLowerCase().includes(query) ||
        ds.description.toLowerCase().includes(query) ||
        ds.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .map(ds => ({
        id: ds.id,
        name: ds.name,
        description: ds.description,
        category: 'Data Sources' as const,
        featureStore: ds.featureStore,
        tags: ds.tags,
      }));
    
    return { results: dataSourceResults, total: dataSourceResults.length };
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

  if (!dataSource) {
    return (
      <PageSection>
        <Title headingLevel="h1">Data source not found</Title>
        <Content component="p">The requested data source could not be found.</Content>
        <Button variant="primary" onClick={() => navigate('/develop-train/feature-store/data-sources')}>
          Back to Data sources
        </Button>
      </PageSection>
    );
  }

  const owner = getDataSourceOwner(dataSource.id);
  const batchDataSource = getBatchDataSource(dataSource.id);
  const schemaFields = connectorType === 'RequestSource' ? getRequestSourceSchemaFields(dataSource.id) : [];
  const interactiveExample = connectorType === 'RequestSource' ? getRequestSourceInteractiveExample(dataSource.name, dataSource.id) : '';

  return (
    <>
      {/* Breadcrumb with Feature Store Icon */}
      <PageSection type="breadcrumb">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <span
                  onClick={() => navigate(`/develop-train/feature-store/data-sources${location.search}`)}
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
                  Data sources in
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
                  {dataSource?.featureStore ? (
                    dataSource.featureStore
                  ) : (
                    <Skeleton width="150px" height="1em" />
                  )}
                </span>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{dataSource.name}</BreadcrumbItem>
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
                <Title headingLevel="h1" size="2xl">{dataSource.name}</Title>
              </FlexItem>
              <FlexItem>
                <Label isCompact variant="filled" color="blue">
                  {connectorType === 'StreamKafka' ? 'StreamKafka' : connectorType === 'RequestSource' ? 'RequestSource' : 'BatchData'}
                </Label>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Content component="p">{dataSource.description}</Content>
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
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Data source detail tabs">
          <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab">
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                <Stack>
                  {/* Section 1: Data source connector */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <DescriptionList isHorizontal isCompact>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Data source connector</DescriptionListTerm>
                        <DescriptionListDescription>
                          {connectorType === 'StreamKafka' ? 'StreamKafka' : connectorType === 'RequestSource' ? 'RequestSource' : 'BatchData'}
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      {connectorType === 'BatchData' && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>File URL</DescriptionListTerm>
                          <DescriptionListDescription>
                            <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied" variant="inline-compact">
                              {dataSource.connectionUrl}
                            </ClipboardCopy>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      <DescriptionListGroup>
                        <DescriptionListTerm>Last modified</DescriptionListTerm>
                        <DescriptionListDescription>{formatTimestamp(dataSource.lastUpdated)}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Created</DescriptionListTerm>
                        <DescriptionListDescription>{formatTimestamp(dataSource.created)}</DescriptionListDescription>
                      </DescriptionListGroup>
                      {connectorType !== 'StreamKafka' && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Owner</DescriptionListTerm>
                          <DescriptionListDescription>{owner}</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                      {connectorType === 'StreamKafka' && batchDataSource && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>Batch data source</DescriptionListTerm>
                          <DescriptionListDescription>
                            <Button
                              variant="link"
                              isInline
                              onClick={() => {
                                const batchDs = mockDataSources.find(ds => ds.name === batchDataSource);
                                if (batchDs) {
                                  navigate(`/develop-train/feature-store/data-sources/${batchDs.id}`);
                                }
                              }}
                            >
                              {batchDataSource}
                            </Button>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      )}
                    </DescriptionList>
                  </StackItem>

                  {/* Section 2: Code Snippet */}
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
                              This snippet defines the current data source. Use it as a template to create similar resources.
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
                              id={connectorType === 'RequestSource' ? "copy-example-button" : "copy-code-button"}
                              textId={connectorType === 'RequestSource' ? "example-content" : "code-content"}
                              aria-label="Copy to clipboard"
                              onClick={() => {
                                if (connectorType === 'RequestSource') {
                                  navigator.clipboard.writeText(interactiveExample);
                                } else {
                                  handleCopyCode();
                                }
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              variant="plain"
                            >
                              {copied ? 'Copied!' : ''}
                            </ClipboardCopyButton>
                          </CodeBlockAction>
                        }
                      >
                        <CodeBlockCode id={connectorType === 'RequestSource' ? "example-content" : "code-content"}>
                          {connectorType === 'RequestSource' ? interactiveExample : `from feast import DataSource

data_source = DataSource(
    name="${dataSource.name}",
    source_type="${dataSource.sourceType}",
    connection_url="${dataSource.connectionUrl}"
)`}
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
                {/* Feature Views Table */}
                <div style={{ maxWidth: '800px' }}>
                  <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    Feature views
                  </Title>
                  <Table aria-label="Feature views table" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>Feature view</Th>
                        <Th>Feature service consumers</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {featureViews.length === 0 ? (
                        <Tr>
                          <Td colSpan={2}>
                            <Content component="p" style={{ textAlign: 'center', padding: 'var(--pf-t--global--spacer--lg)' }}>
                              No feature views found for this data source.
                            </Content>
                          </Td>
                        </Tr>
                      ) : (
                        featureViews.map((fv) => {
                          const consumerCount = getFeatureServiceConsumersCount(fv.id);
                          const consumingServices = mockFeatureServices.filter(fs => fs.featureViewIds.includes(fv.id));
                          return (
                            <Tr key={fv.id}>
                              <Td dataLabel="Feature view">
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => navigate(`/develop-train/feature-store/feature-views/${fv.id}`)}
                                >
                                  {fv.name}
                                </Button>
                              </Td>
                              <Td dataLabel="Feature service consumers">
                                {consumerCount > 0 ? (
                                  <Popover
                                    aria-label="Feature service consumers"
                                    hasAutoWidth
                                    showClose={true}
                                    bodyContent={
                                      <List isPlain style={{ fontSize: '14px' }}>
                                        {consumingServices.map((service, idx) => (
                                          <ListItem key={idx}>
                                            •{' '}
                                            <Button
                                              variant="link"
                                              isInline
                                              onClick={() => navigate(`/develop-train/feature-store/feature-services/${service.id}`)}
                                            >
                                              {service.name}
                                            </Button>
                                          </ListItem>
                                        ))}
                                      </List>
                                    }
                                  >
                                    <Button variant="link" isInline>
                                      {consumerCount} feature service{consumerCount !== 1 ? 's' : ''}
                                    </Button>
                                  </Popover>
                                ) : (
                                  <span>0 feature services</span>
                                )}
                              </Td>
                            </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                </div>
              </PageSection>
            </TabContentBody>
          </Tab>

          {/* Schema tab - only for RequestSource */}
          {connectorType === 'RequestSource' && (
            <Tab eventKey={2} title={<TabTitleText>Schema</TabTitleText>} aria-label="Schema tab">
              <TabContentBody>
                <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                  <div style={{ maxWidth: '800px' }}>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                      Schema
                    </Title>
                    <Table aria-label="Schema table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th>Feature</Th>
                          <Th>Value type</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {schemaFields.length === 0 ? (
                          <Tr>
                            <Td colSpan={2} dataLabel="No schema data">
                              <Content component="p">No schema data available</Content>
                            </Td>
                          </Tr>
                        ) : (
                          schemaFields.map((field, index) => (
                            <Tr key={index}>
                              <Td dataLabel="Feature">{field.feature}</Td>
                              <Td dataLabel="Value type">{field.valueType}</Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </div>
                </PageSection>
              </TabContentBody>
            </Tab>
          )}
        </Tabs>
      </PageSection>
    </>
  );
};

export default DataSourceDetailPage;
