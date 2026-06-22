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
  LabelGroup,
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
  mockDatasets,
  mockFeatureServices,
  mockFeatureViews,
  mockFeatures,
} from '../../../mockData/featureStore';
import { mockEntities } from '../../../mockData/entities';

// Mock connected workbenches data
const mockConnectedWorkbenches = [
  { name: 'My application', project: 'Banking' },
  { name: 'example', project: 'demo' },
];

const mockProjectsWithoutWorkbenches = [
  { name: 'Project 3' },
  { name: 'Project 4' },
];

// Mock dataset storage and format data
const getDatasetStorage = (datasetId: string): { storage: string; fileFormat: string; path?: string } => {
  const storageData: Record<string, { storage: string; fileFormat: string; path?: string }> = {
    'dataset-001': { storage: 'File Based Storage', fileFormat: 'Parquet', path: 's3://feature-store-bucket/datasets/customer_training_2024.parquet' },
    'dataset-002': { storage: 'File Based Storage', fileFormat: 'Parquet', path: 's3://feature-store-bucket/datasets/fraud_validation_q4.parquet' },
    'dataset-003': { storage: 'File Based Storage', fileFormat: 'Parquet', path: 's3://feature-store-bucket/datasets/product_inference_batch.parquet' },
    'dataset-004': { storage: 'File Based Storage', fileFormat: 'Parquet', path: 's3://feature-store-bucket/datasets/driver_performance_snapshot.parquet' },
  };
  return storageData[datasetId] || { storage: 'File Based Storage', fileFormat: 'Parquet' };
};

// Mock source feature service for datasets
const getSourceFeatureService = (datasetId: string): string | null => {
  // Find a feature service that might be related to this dataset's entity
  const dataset = mockDatasets.find(d => d.id === datasetId);
  if (!dataset) return null;
  
  // Find feature services that might be related (simplified - in real app, this would be based on actual relationships)
  const relatedService = mockFeatureServices.find(fs => fs.featureStore === dataset.featureStore);
  return relatedService ? relatedService.name : null;
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
 * DatasetDetailPage Component
 * Displays detailed information about a specific dataset with tabs for Details and Features
 */
export const DatasetDetailPage: React.FC = () => {
  const { datasetId } = useParams<{ datasetId: string }>();
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

  // Find the dataset by ID
  const dataset = mockDatasets.find(d => d.id === datasetId);
  
  // Get related entity
  const entity = dataset ? mockEntities.find(e => e.id === dataset.entityId) : null;
  
  // Get features related to this dataset's entity
  const features = useMemo(() => {
    if (!dataset || !entity) return [];
    return mockFeatures.filter(f => f.entityId === dataset.entityId && f.featureStore === dataset.featureStore);
  }, [dataset, entity]);
  
  // Get storage info
  const storageInfo = dataset ? getDatasetStorage(dataset.id) : null;
  const sourceFeatureService = dataset ? getSourceFeatureService(dataset.id) : null;


  // Handle tab selection
  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  // Handle copy code
  const handleCopyCode = () => {
    if (dataset) {
      const codeSnippet = `from feast import Dataset

dataset = Dataset(
    name="${dataset.name}",
    entity_id="${dataset.entityId}",
    snapshot_date="${dataset.snapshotDate}"
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
    
    // Search datasets
    const datasetResults: SearchResult[] = mockDatasets
      .filter(d => 
        (selectedFeatureStore === 'All feature stores' || d.featureStore === selectedFeatureStore) &&
        (d.name.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.tags.some(tag => tag.toLowerCase().includes(query)))
      )
      .map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        category: 'Datasets' as const,
        featureStore: d.featureStore,
        tags: d.tags,
      }));
    
    return { results: datasetResults, total: datasetResults.length };
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


  if (!dataset) {
    return (
      <PageSection>
        <Title headingLevel="h1">Dataset not found</Title>
        <Content component="p">The requested dataset could not be found.</Content>
        <Button variant="primary" onClick={() => navigate('/develop-train/feature-store/data-sets')}>
          Back to Datasets
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
                  onClick={() => navigate(`/develop-train/feature-store/data-sets${location.search}`)}
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
                  Datasets in
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
                  {dataset?.featureStore ? (
                    dataset.featureStore
                  ) : (
                    <Skeleton width="150px" height="1em" />
                  )}
                </span>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{dataset.name}</BreadcrumbItem>
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
            <Title headingLevel="h1" size="2xl">{dataset.name}</Title>
          </FlexItem>
          <FlexItem>
            <Content component="p">{dataset.description}</Content>
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
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Dataset detail tabs">
          <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab">
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                <Stack>
                  {/* Section 1: Source feature service */}
                  {sourceFeatureService && (
                    <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                      <DescriptionList isHorizontal isCompact>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Source feature service</DescriptionListTerm>
                          <DescriptionListDescription>
                            <Button
                              variant="link"
                              isInline
                              onClick={() => {
                                const service = mockFeatureServices.find(fs => fs.name === sourceFeatureService);
                                if (service) {
                                  navigate(`/develop-train/feature-store/feature-services/${service.id}`);
                                }
                              }}
                            >
                              {sourceFeatureService}
                            </Button>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </StackItem>
                  )}

                  {/* Section 2: Storage */}
                  {storageInfo && (
                    <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                      <DescriptionList isHorizontal isCompact>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Storage</DescriptionListTerm>
                          <DescriptionListDescription>{storageInfo.storage}</DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>File format</DescriptionListTerm>
                          <DescriptionListDescription>{storageInfo.fileFormat}</DescriptionListDescription>
                        </DescriptionListGroup>
                        {storageInfo.path && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>Path</DescriptionListTerm>
                            <DescriptionListDescription>
                              <ClipboardCopy isReadOnly hoverTip="Copy" clickTip="Copied" variant="inline-compact">
                                {storageInfo.path}
                              </ClipboardCopy>
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        )}
                      </DescriptionList>
                    </StackItem>
                  )}

                  {/* Section 3: Dates */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <DescriptionList isHorizontal isCompact>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Last modified</DescriptionListTerm>
                        <DescriptionListDescription>{formatTimestamp(dataset.created)}</DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Created</DescriptionListTerm>
                        <DescriptionListDescription>{formatTimestamp(dataset.created)}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </StackItem>

                  {/* Section 4: Tags */}
                  <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      Tags
                    </Title>
                    <LabelGroup numLabels={10}>
                      {dataset.tags.map((tag, index) => (
                        <Label key={index} color="blue">{tag}</Label>
                      ))}
                    </LabelGroup>
                  </StackItem>

                  {/* Section 5: Join keys */}
                  {entity && (
                    <StackItem style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}>
                      <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                        Join keys
                      </Title>
                      <div style={{ maxWidth: '800px' }}>
                        <Table aria-label="Join keys table" variant="compact">
                          <Thead>
                            <Tr>
                              <Th>Name</Th>
                              <Th>Value type</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td dataLabel="Name">{entity.joinKey}</Td>
                              <Td dataLabel="Value type">{entity.valueType}</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </div>
                    </StackItem>
                  )}

                  {/* Section 6: Code Snippet */}
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
                              This snippet defines the current dataset. Use it as a template to create similar resources.
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
                          {`from feast import Dataset

dataset = Dataset(
    name="${dataset.name}",
    entity_id="${dataset.entityId}",
    snapshot_date="${dataset.snapshotDate}"
)`}
                        </CodeBlockCode>
                      </CodeBlock>
                    </div>
                  </StackItem>
                </Stack>
              </PageSection>
            </TabContentBody>
          </Tab>

          <Tab eventKey={1} title={<TabTitleText>Features</TabTitleText>} aria-label="Features tab">
            <TabContentBody>
              <PageSection style={{ backgroundColor: 'var(--pf-t--global--background--color--primary--default)', minHeight: 'calc(100vh - 300px)', paddingTop: 'var(--pf-t--global--spacer--xl)' }}>
                <div style={{ maxWidth: '800px' }}>
                  <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    Features
                  </Title>
                  <Table aria-label="Features table" variant="compact">
                    <Thead>
                      <Tr>
                        <Th>Feature</Th>
                        <Th>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                            <FlexItem>Feature view</FlexItem>
                            <FlexItem>
                              <Popover
                                aria-label="Feature view help"
                                headerContent="Feature view"
                                bodyContent={
                                  <Content component="p">
                                    The feature view this feature was retrieved from when the dataset was created. Feature views group related features and define how they're fetched from the source data.
                                  </Content>
                                }
                                showClose
                              >
                                <Button variant="plain" aria-label="Feature view help" style={{ padding: 0 }}>
                                  <OutlinedQuestionCircleIcon />
                                </Button>
                              </Popover>
                            </FlexItem>
                          </Flex>
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {features.length === 0 ? (
                        <Tr>
                          <Td colSpan={2} dataLabel="No features">
                            <Content component="p">No features available</Content>
                          </Td>
                        </Tr>
                      ) : (
                        features.map((feature) => {
                          const featureView = mockFeatureViews.find(fv => fv.id === feature.featureViewId);
                          return (
                            <Tr key={feature.id}>
                              <Td dataLabel="Feature">
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => navigate(`/develop-train/feature-store/features/${feature.id}`)}
                                >
                                  {feature.name}
                                </Button>
                              </Td>
                              <Td dataLabel="Feature view">
                                {featureView ? (
                                  <Button
                                    variant="link"
                                    isInline
                                    onClick={() => navigate(`/develop-train/feature-store/feature-views/${featureView.id}`)}
                                  >
                                    {featureView.name}
                                  </Button>
                                ) : (
                                  <span>--</span>
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
        </Tabs>
      </PageSection>
    </>
  );
};

export default DatasetDetailPage;
