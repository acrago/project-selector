import * as React from 'react';
import { 
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  SearchInput,
  Title
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
  CheckIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  SortAlphaDownIcon,
  SortAlphaUpIcon,
  TableIcon,
  ThIcon
} from '@patternfly/react-icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { mcpServerLogos } from './mcpServerLogos';

// Logo component to handle SVG content directly
const Logo: React.FunctionComponent<{ 
  svgContent: string; 
  alt: string; 
  style?: React.CSSProperties 
}> = ({ svgContent, alt, style }) => {
  // Convert SVG content to data URI
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  
  return (
    <img 
      src={dataUri} 
      alt={alt}
      style={style}
    />
  );
};

const SearchResults: React.FunctionComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { flags } = useFeatureFlags();
  const searchQuery = searchParams.get('q') || '';
  const viewType = searchParams.get('view') || 'grid';
  
  useDocumentTitle(`Search Results: ${searchQuery}`);

  const [searchValue, setSearchValue] = React.useState(searchQuery);
  const [playgroundServers, setPlaygroundServers] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<string>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Load playground servers from localStorage
  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('playgroundMcpServers') || '[]');
    setPlaygroundServers(stored);
  }, []);

  // Mock server data (same as MVPServers)
  const servers = [
    {
      id: 1,
      slug: "mcp-kubernetes-server",
      name: "Kubernetes MCP Server",
      provider: "feiskyer",
      type: "AVAILABLE",
      logo: mcpServerLogos['mcp-kubernetes-server'],
      description: "Python-powered server that translates natural language into kubectl actions and provides cluster introspection to agents. Gives AI agents the ability to query pod health, describe resources, or perform dry-run actions across OpenShift or Kubernetes clusters.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Community",
      providerType: "Community",
      version: "0.1.11",
      lastUsed: "1/15/2025",
      agentCount: 8,
      tags: ["kubernetes", "infrastructure", "kubectl", "cluster-management"],
      isAdded: true
    },
    {
      id: 2,
      slug: "slack-mcp-server",
      name: "Slack MCP Server",
      provider: "korotovsky",
      type: "AVAILABLE",
      logo: mcpServerLogos['slack-mcp-server'],
      description: "MIT-licensed server that lets AI agents post, read threads, DM users, and trigger Slack workflows; supports stdio + SSE, proxy mode, and fine-grained token scopes. Instant DevOps productivity tool.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Community",
      providerType: "Community",
      version: "1.4.2",
      lastUsed: "1/15/2025",
      agentCount: 12,
      tags: ["slack", "communication", "workflows", "devops"],
      isAdded: true
    },
    {
      id: 3,
      slug: "postgres-mcp-server",
      name: "PostgreSQL MCP Server",
      provider: "punkpeye",
      type: "AVAILABLE",
      logo: mcpServerLogos['postgres-mcp-server'],
      description: "Access PostgreSQL databases with secure authentication. Execute queries, manage schemas, analyze data, and perform database administration tasks through natural language interactions.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Community",
      providerType: "Community",
      version: "0.5.0",
      lastUsed: "1/14/2025",
      agentCount: 6,
      tags: ["postgresql", "database", "sql", "data-analysis"],
      isAdded: false
    },
    {
      id: 4,
      slug: "github-mcp-server",
      name: "GitHub MCP Server",
      provider: "modelcontextprotocol",
      type: "AVAILABLE",
      logo: mcpServerLogos['github-mcp-server'],
      description: "Official GitHub MCP server enabling AI agents to interact with GitHub repositories, issues, pull requests, and project management features through authenticated API access.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Official",
      providerType: "Official",
      version: "0.4.0",
      lastUsed: "1/15/2025",
      agentCount: 18,
      tags: ["github", "git", "version-control", "project-management"],
      isAdded: true
    },
    {
      id: 5,
      slug: "salesforce-mcp-server",
      name: "Salesforce MCP Server",
      provider: "Salesforce",
      type: "AVAILABLE",
      logo: mcpServerLogos['salesforce-mcp-server'],
      description: "Enterprise-grade Salesforce integration allowing AI agents to access CRM data, manage leads, opportunities, accounts, and automate sales processes through secure API connections.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Enterprise",
      providerType: "Enterprise",
      version: "2.1.0",
      lastUsed: "1/14/2025",
      agentCount: 3,
      tags: ["salesforce", "crm", "sales", "enterprise"],
      isAdded: false
    },
    {
      id: 6,
      slug: "dynatrace-mcp-server",
      name: "Dynatrace MCP Server",
      provider: "Dynatrace",
      type: "AVAILABLE",
      logo: mcpServerLogos['dynatrace-mcp-server'],
      description: "Advanced observability platform integration enabling AI agents to query application performance metrics, analyze user sessions, detect anomalies, and troubleshoot production issues.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Enterprise",
      providerType: "Enterprise",
      version: "1.8.5",
      lastUsed: "1/13/2025",
      agentCount: 9,
      tags: ["dynatrace", "monitoring", "apm", "observability"],
      isAdded: true
    },
    {
      id: 7,
      slug: "servicenow-mcp-server",
      name: "ServiceNow MCP Server",
      provider: "ServiceNow",
      type: "AVAILABLE",
      logo: mcpServerLogos['servicenow-mcp-server'],
      description: "Enterprise service management platform integration allowing AI agents to create incidents, manage workflows, access knowledge base, and automate IT service delivery processes.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Enterprise",
      providerType: "Enterprise",
      version: "3.2.1",
      lastUsed: "1/12/2025",
      agentCount: 5,
      tags: ["servicenow", "itsm", "workflows", "enterprise"],
      isAdded: false
    },
    {
      id: 8,
      slug: "splunk-mcp-server",
      name: "Splunk MCP Server",
      provider: "Splunk",
      type: "AVAILABLE",
      logo: mcpServerLogos['splunk-mcp-server'],
      description: "Security and observability platform integration enabling AI agents to search machine data, analyze logs, create dashboards, and perform security investigations.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Enterprise",
      providerType: "Enterprise",
      version: "2.4.0",
      lastUsed: "1/11/2025",
      agentCount: 7,
      tags: ["splunk", "security", "logs", "analysis"],
      isAdded: true
    }
  ];

  // Filter servers based on search query
  const filteredServers = servers.filter(server => 
    server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    server.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServerClick = (serverSlug: string) => {
    navigate(`/ai-assets/mvp-servers/${serverSlug}`);
  };

  const handlePlaygroundAction = (serverName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click navigation
    
    const currentServers = JSON.parse(localStorage.getItem('playgroundMcpServers') || '[]');
    
    if (playgroundServers.includes(serverName)) {
      // Remove from playground
      const updatedServers = currentServers.filter((name: string) => name !== serverName);
      localStorage.setItem('playgroundMcpServers', JSON.stringify(updatedServers));
      setPlaygroundServers(updatedServers);
    } else {
      // Add to playground and navigate
      if (!currentServers.includes(serverName)) {
        currentServers.push(serverName);
        localStorage.setItem('playgroundMcpServers', JSON.stringify(currentServers));
      }
      setPlaygroundServers(currentServers);
      // Navigate to playground with the server parameter
      navigate(`/gen-ai-studio/playground?addServer=${encodeURIComponent(serverName)}`);
    }
  };

  const handleSearchSubmit = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value.trim(), view: viewType });
    }
  };

  const handleViewToggle = (newViewType: string) => {
    setSearchParams({ q: searchQuery, view: newViewType });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const getSortedServers = (serversToSort: typeof filteredServers) => {
    const sorted = [...serversToSort].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'version':
          aValue = a.version;
          bValue = b.version;
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return null;
    }
    return sortDirection === 'asc' ? <SortAlphaUpIcon /> : <SortAlphaDownIcon />;
  };

    const renderGridView = () => (
    <Grid hasGutter>
      {getSortedServers(filteredServers).map((server) => (
        <GridItem key={server.id} lg={4} md={6} sm={12}>
          <Card 
            isFullHeight
            onClick={() => handleServerClick(server.slug)}
            style={{ 
              cursor: 'pointer'
            }}
          >
            <CardHeader>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Flex direction={{ default: 'column' }}>
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                        <FlexItem>
                          <Logo 
                            svgContent={server.logo} 
                            alt={`${server.name} logo`}
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '4px',
                              marginRight: '0.5rem'
                            }}
                          />
                        </FlexItem>
                        <FlexItem>
                          <CardTitle>
                            <Title headingLevel="h2" size="lg">{server.name}</Title>
                          </CardTitle>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </CardHeader>
            <CardBody style={{ paddingTop: 0, paddingBottom: '0.5rem', flexGrow: 1 }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <div 
                        style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: server.statusColor
                        }}
                        title={`Status: ${server.status}`}
                      />
                    </FlexItem>
                    <FlexItem>
                      <Badge 
                        style={{ 
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          backgroundColor: '#f5f5f5',
                          color: '#333',
                          borderRadius: '1rem'
                        }}
                      >
                        AVAILABLE
                      </Badge>
                    </FlexItem>
                  </Flex>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                  {server.description}
                </p>
              </div>
            </CardBody>

            {!flags.agentBuilderMode && (
              <CardFooter>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    {server.isAdded ? (
                      <Button variant="secondary" isBlock icon={<CheckIcon />}>
                        Added to Workspace
                      </Button>
                    ) : (
                      <Button variant="primary" isBlock icon={<PlusIcon />}>
                        Add to Workspace
                      </Button>
                    )}
                  </FlexItem>
                  <FlexItem>
                    <Button 
                      variant={playgroundServers.includes(server.name) ? "secondary" : "tertiary"}
                      isBlock 
                      icon={<PlayIcon />}
                      onClick={(event) => handlePlaygroundAction(server.name, event)}
                    >
                      {playgroundServers.includes(server.name) ? "In Playground" : "Try in Playground"}
                    </Button>
                  </FlexItem>
                </Flex>
              </CardFooter>
            )}
          </Card>
        </GridItem>
      ))}
    </Grid>
  );

  const renderTableView = () => (
    <div style={{ overflowX: 'auto' }}>
      <Table aria-label="Search results table">
        <Thead>
          <Tr>
            <Th 
              width={30}
              sort={{
                sortBy: { index: 0, direction: sortBy === 'name' ? sortDirection : undefined },
                onSort: () => handleSort('name'),
                columnIndex: 0
              }}
            >
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>Name</FlexItem>
                <FlexItem>{getSortIcon('name')}</FlexItem>
              </Flex>
            </Th>
            <Th 
              width={15}
              sort={{
                sortBy: { index: 1, direction: sortBy === 'status' ? sortDirection : undefined },
                onSort: () => handleSort('status'),
                columnIndex: 1
              }}
            >
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>Status</FlexItem>
                <FlexItem>{getSortIcon('status')}</FlexItem>
              </Flex>
            </Th>
            <Th 
              width={15}
              sort={{
                sortBy: { index: 2, direction: sortBy === 'version' ? sortDirection : undefined },
                onSort: () => handleSort('version'),
                columnIndex: 2
              }}
            >
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>Version</FlexItem>
                <FlexItem>{getSortIcon('version')}</FlexItem>
              </Flex>
            </Th>
            <Th 
              width={40} 
              modifier="wrap"
              sort={{
                sortBy: { index: 3, direction: sortBy === 'description' ? sortDirection : undefined },
                onSort: () => handleSort('description'),
                columnIndex: 3
              }}
            >
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>Description</FlexItem>
                <FlexItem>{getSortIcon('description')}</FlexItem>
              </Flex>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {getSortedServers(filteredServers).map((server) => (
            <Tr 
              key={server.id}
              onClick={() => handleServerClick(server.slug)}
              style={{ cursor: 'pointer' }}
            >
              <Td dataLabel="Name">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem'
                }}>
                  <Logo 
                    svgContent={server.logo} 
                    alt={`${server.name} logo`}
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '0.875rem'
                  }}>{server.name}</span>
                </div>
              </Td>
              <Td dataLabel="Status">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: server.statusColor
                    }}
                    title={`Status: ${server.status}`}
                  />
                  <span style={{ fontSize: '0.875rem' }}>{server.status}</span>
                </div>
              </Td>
              <Td dataLabel="Version">
                <span style={{ fontSize: '0.875rem' }}>v{server.version}</span>
              </Td>
              <Td dataLabel="Description">
                <span style={{ fontSize: '0.875rem' }}>{server.description}</span>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );

  const renderEmptyState = () => (
    <EmptyState>
      <div style={{ textAlign: 'center' }}>
        <SearchIcon style={{ fontSize: '2rem', color: '#6B7280', marginBottom: '1rem' }} />
        <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
          No servers found
        </Title>
      </div>
      <EmptyStateBody>
        No MCP servers match your search for &quot;{searchQuery}&quot;. 
        Try adjusting your search terms or browse all available servers.
      </EmptyStateBody>
      <Button 
        variant="link" 
        onClick={() => navigate('/ai-assets/mvp-servers')}
      >
        Browse all servers
      </Button>
    </EmptyState>
  );

  return (
    <>
      {/* Header */}
      <PageSection>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
          <FlexItem>
            <div>
              <Title headingLevel="h1" size="2xl">
                Search Results for &quot;{searchQuery}&quot;
              </Title>
              <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
                Found <span style={{ fontWeight: 'bold' }}>{filteredServers.length}</span> of{' '}
                <span style={{ fontWeight: 'bold' }}>{servers.length}</span> MCP servers
              </p>
            </div>
          </FlexItem>
          <FlexItem>
                         <SearchInput
               placeholder="Search servers..."
               value={searchValue}
               onChange={(_event, value) => setSearchValue(value)}
               onSearch={(_event, value) => handleSearchSubmit(value)}
               onKeyDown={(event) => {
                 if (event.key === 'Enter') {
                   handleSearchSubmit(searchValue);
                 }
               }}
               onClear={() => {
                 setSearchValue('');
                 setSearchParams({});
                 navigate('/ai-assets/mvp-servers');
               }}
             />
          </FlexItem>
        </Flex>
      </PageSection>

      {/* View Toggle */}
      <PageSection style={{ paddingTop: '0.5rem', paddingBottom: '1rem' }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Button 
              variant="link" 
              onClick={() => navigate('/ai-assets/mvp-servers')}
              style={{ paddingLeft: 0 }}
            >
              ← Back to all servers
            </Button>
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsXs' }}>
              <FlexItem>
                <Button
                  variant={viewType === 'grid' ? 'primary' : 'secondary'}
                  icon={<ThIcon />}
                  onClick={() => handleViewToggle('grid')}
                />
              </FlexItem>
              <FlexItem>
                <Button
                  variant={viewType === 'table' ? 'primary' : 'secondary'}
                  icon={<TableIcon />}
                  onClick={() => handleViewToggle('table')}
                />
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Search Results */}
      <PageSection>
        {filteredServers.length === 0 ? (
          renderEmptyState()
        ) : (
          viewType === 'grid' ? renderGridView() : renderTableView()
        )}
      </PageSection>
    </>
  );
};

export { SearchResults }; 