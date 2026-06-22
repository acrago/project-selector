import * as React from 'react';
import { 
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  PageSection,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Title,
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
  CheckIcon,
  CubeIcon,
  FilterIcon,
  OutlinedFolderIcon,
  PlayIcon,
  PlusIcon,
  ServerIcon,
  SortAlphaDownIcon,
  SortAlphaUpIcon,
  TableIcon,
  ThIcon
} from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { mcpServerLogos } from './mcpServerLogos';

// Logo component to handle SVG content or special icon identifiers
const Logo: React.FunctionComponent<{ 
  svgContent: string; 
  alt: string; 
  style?: React.CSSProperties 
}> = ({ svgContent, alt, style }) => {
  // Handle special icon identifiers
  if (svgContent === 'cube-icon') {
    return (
      <CubeIcon 
        style={{
          ...style,
          color: '#6A6E73',
          fontSize: '16px',
          width: '16px',
          height: '16px'
        }}
        aria-label={alt}
      />
    );
  }
  
  // Convert SVG content to data URI for regular SVG content
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  
  return (
    <img 
      src={dataUri} 
      alt={alt}
      style={style}
    />
  );
};

const MVPServers: React.FunctionComponent = () => {
  useDocumentTitle("MCP Servers");

  const { flags } = useFeatureFlags();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');

  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState('Demo project');
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);
  const [playgroundServers, setPlaygroundServers] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<string>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [animationState, setAnimationState] = React.useState({
    header: false,
    mainContent: false,
    filters: false,
    viewToggle: false,
    serverContent: false,
    serverItems: [] as number[]
  });

  // Animation effect on component mount
  React.useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, header: true })), 100));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, mainContent: true })), 300));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, filters: true })), 500));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, viewToggle: true })), 700));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, serverContent: true })), 900));

    // Animate individual server items after content section appears
    servers.forEach((_, index) => {
      timeouts.push(setTimeout(() => 
        setAnimationState(prev => ({ 
          ...prev, 
          serverItems: [...prev.serverItems, index] 
        })), 1100 + (index * 100)
      ));
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load playground servers from localStorage
  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('playgroundMcpServers') || '[]');
    setPlaygroundServers(stored);
  }, []);

  const getAnimationStyle = (isVisible: boolean) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  });

  const getServerItemAnimationStyle = (index: number) => ({
    opacity: animationState.serverItems.includes(index) ? 1 : 0,
    transform: animationState.serverItems.includes(index) ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
  });

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

  const handleServerClick = (serverSlug: string) => {
    navigate(`/ai-assets/mvp-servers/${serverSlug}`);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const getSortedServers = () => {
    const sortedServers = [...servers].sort((a, b) => {
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

    return sortedServers;
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return null;
    }
    return sortDirection === 'asc' ? <SortAlphaUpIcon /> : <SortAlphaDownIcon />;
  };




  // Mock data for MCP servers
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
      tags: ["slack", "collaboration", "chatops", "workflows"],
      isAdded: false
    },
    {
      id: 3,
      slug: "servicenow-mcp-server",
      name: "ServiceNow MCP Server",
      provider: "echelon-ai-labs",
      type: "AVAILABLE",
      logo: mcpServerLogos['servicenow-mcp-server'],
      description: "Open-source repo and certified Store app; AI can query, create, or update incidents, change requests, catalog items, etc., with full OAuth support. Automates ticket triage and change-management chatbots.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Community",
      providerType: "Community",
      version: "2.1.0",
      lastUsed: "1/15/2025",
      agentCount: 6,
      tags: ["servicenow", "itsm", "tickets", "incident-management"],
      isAdded: true
    },
    {
      id: 4,
      slug: "salesforce-mcp-server",
      name: "Salesforce MCP Server",
      provider: "tsmztech",
      type: "AVAILABLE",
      logo: mcpServerLogos['salesforce-mcp-server'],
      description: "CLI-installable server that exposes SOQL querying, record CRUD, Apex code access, and schema introspection. Lets support or sales assistants pull account context, open cases, and update opportunities directly from AI prompts.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Community",
      providerType: "Community",
      version: "1.8.3",
      lastUsed: "1/14/2025",
      agentCount: 9,
      tags: ["salesforce", "crm", "soql", "customer-support"],
      isAdded: false
    },
    {
      id: 5,
      slug: "splunk-mcp-server",
      name: "Splunk MCP Server",
      provider: "livehybrid",
      type: "AVAILABLE",
      logo: mcpServerLogos['splunk-mcp-server'],
      description: "FastMCP-based tool that runs SPL queries, returns logs/metrics, and auto-scrubs sensitive data. Enables an AI SRE bot to explain spikes, correlate incidents, or draft post-mortems using live Splunk data.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Community",
      providerType: "Community",
      version: "1.3.1",
      lastUsed: "1/14/2025",
      agentCount: 5,
      tags: ["splunk", "observability", "logs", "security"],
      isAdded: true
    },
    {
      id: 6,
      slug: "dynatrace-mcp-server",
      name: "Dynatrace MCP Server",
      provider: "dynatrace-oss",
      type: "AVAILABLE",
      logo: mcpServerLogos['dynatrace-mcp-server'],
      description: "Official Dynatrace-OSS project exposing DQL queries, problem feeds, and vulnerability data. Gives agents real-time service health, letting them recommend rollbacks or capacity fixes inside OpenShift.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Community",
      providerType: "Community",
      version: "2.0.4",
      lastUsed: "1/14/2025",
      agentCount: 4,
      tags: ["dynatrace", "monitoring", "apm", "vulnerability"],
      isAdded: false
    },
    {
      id: 7,
      slug: "github-mcp-server",
      name: "GitHub MCP Server",
      provider: "github",
      type: "AVAILABLE",
      logo: mcpServerLogos['github-mcp-server'],
      description: "GitHub-maintained server for listing repos, issues, PRs, commits and creating comments/branches. Fuels coding copilots that can open PRs, draft release notes, or review diffs while respecting repo permissions.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Official",
      providerType: "Official",
      version: "1.2.5",
      lastUsed: "1/15/2025",
      agentCount: 15,
      tags: ["github", "git", "repositories", "development"],
      isAdded: true
    },
    {
      id: 8,
      slug: "postgres-mcp-server",
      name: "PostgreSQL MCP Server",
      provider: "modelcontextprotocol",
      type: "AVAILABLE",
      logo: mcpServerLogos['postgres-mcp-server'],
      description: "Read-only SQL querying with schema discovery, run in a container or as a Node service. Ideal for healthcare/finance use-cases that need tight RBAC, audit trails, and deterministic queries against clinical or financial databases.",
      status: "Available",
      statusColor: "#3E8635",
      models: "Universal",
      deployment: "Official",
      providerType: "Official",
      version: "1.0.8",
      lastUsed: "1/15/2025",
      agentCount: 7,
      tags: ["postgresql", "database", "sql", "healthcare"],
      isAdded: false
    },
    {
      id: 9,
      slug: "zapier-mcp-server",
      name: "Zapier GitHub MCP",
      provider: "zapier",
      type: "AVAILABLE",
      logo: mcpServerLogos['zapier-mcp-server'],
      description: "Hosted server that unlocks 7,000-plus SaaS actions via Zapier without writing glue code. Swiss-army-knife for quick PoCs: one endpoint gives agents access to calendars, Jira, NetSuite, etc., under Zapier's enterprise security model.",
      status: "Unavailable",
      statusColor: "#C9190B",
      models: "Universal",
      deployment: "Hosted",
      providerType: "Commercial",
      version: "3.2.1",
      lastUsed: "1/15/2025",
      agentCount: 11,
      tags: ["zapier", "automation", "integration", "saas"],
      isAdded: true
    }
  ];

  return (
    <>
      {/* Header with Project and Workspace Selectors */}
      {flags.showProjectWorkspaceDropdowns && (
        <PageSection padding={{ default: 'noPadding' }} style={getAnimationStyle(animationState.header)}>
          <Toolbar>
            <ToolbarContent style={{ padding: '1rem' }}>
              <ToolbarGroup>
                <ToolbarItem>
                  <InputGroup>
                    <InputGroupItem>
                      <div className="pf-v6-c-input-group__text">
                        <OutlinedFolderIcon /> Project
                      </div>
                    </InputGroupItem>
                    <InputGroupItem>
                      <Select
                        isOpen={isProjectSelectOpen}
                        selected={selectedProject}
                        onSelect={(_event, value) => {
                          setSelectedProject(value as string);
                          setIsProjectSelectOpen(false);
                        }}
                        onOpenChange={(isOpen) => setIsProjectSelectOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsProjectSelectOpen(!isProjectSelectOpen)}
                            isExpanded={isProjectSelectOpen}
                            style={{ width: '200px' }}
                          >
                            {selectedProject}
                          </MenuToggle>
                        )}
                        shouldFocusToggleOnSelect
                      >
                        <SelectList>
                          <SelectOption value="Demo project">Demo project</SelectOption>
                          <SelectOption value="AI Research Project">AI Research Project</SelectOption>
                          <SelectOption value="Production Models">Production Models</SelectOption>
                        </SelectList>
                      </Select>
                    </InputGroupItem>
                  </InputGroup>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </PageSection>
      )}

      {/* Main Content */}
      <PageSection style={getAnimationStyle(animationState.mainContent)}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
          <FlexItem>
            <div>
              <Title headingLevel="h1" size="2xl">Available MCP Servers</Title>
              <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
                Browse <span style={{ fontWeight: 'bold' }}>{servers.length}</span> of{' '}
                <span style={{ fontWeight: 'bold' }}>{servers.length}</span> MCP servers available in <span style={{ fontWeight: 'bold' }}>demo-namespace</span>
              </p>
            </div>
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <SearchInput
                  placeholder="Search servers..."
                  value={searchValue}
                  onChange={(_event, value) => setSearchValue(value)}
                  onSearch={(_event, value) => {
                    if (value.trim()) {
                      navigate(`/ai-assets/mvp-servers/search?q=${encodeURIComponent(value.trim())}`);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && searchValue.trim()) {
                      navigate(`/ai-assets/mvp-servers/search?q=${encodeURIComponent(searchValue.trim())}`);
                    }
                  }}
                  onClear={() => setSearchValue('')}
                />
              </FlexItem>

            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Filters and Controls */}
      <PageSection style={{ paddingTop: '0.5rem', ...getAnimationStyle(animationState.filters) }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          {flags.showMcpFilters && (
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Filters:</span>
                </FlexItem>
                <FlexItem>
                  <Button variant="control" icon={<ServerIcon />}>
                    Server Type
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="control" icon={<FilterIcon />}>
                    Deployment
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="control" icon={<FilterIcon />}>
                    Model Types
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="control" icon={<FilterIcon />}>
                    Status
                  </Button>
                </FlexItem>
              </Flex>
            </FlexItem>
          )}
        </Flex>

        {/* View Toggle */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', ...getAnimationStyle(animationState.viewToggle) }}>
          <Flex spaceItems={{ default: 'spaceItemsXs' }}>
            <FlexItem>
              <Button
                variant={activeTabKey === 0 ? 'primary' : 'secondary'}
                icon={<ThIcon />}
                onClick={() => setActiveTabKey(0)}
              />
            </FlexItem>
            <FlexItem>
              <Button
                variant={activeTabKey === 1 ? 'primary' : 'secondary'}
                icon={<TableIcon />}
                onClick={() => setActiveTabKey(1)}
              />
            </FlexItem>
          </Flex>
        </div>
      </PageSection>

      {/* MCP Servers Content */}
      <PageSection style={getAnimationStyle(animationState.serverContent)}>
        {activeTabKey === 0 ? (
          // Grid View
          <Grid hasGutter>
            {servers.map((server, index) => (
              <GridItem key={server.id} lg={4} md={6} sm={12} style={getServerItemAnimationStyle(index)}>
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
                              {server.type}
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
        ) : (
          // Table View
          <div style={{ 
            overflowX: 'auto'
          }}>
            <Table aria-label="MCP Servers table">
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
                {getSortedServers().map((server, index) => (
                  <Tr 
                    key={server.id}
                    onClick={() => handleServerClick(server.slug)}
                    style={{ cursor: 'pointer', ...getServerItemAnimationStyle(index) }}
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
                      <span style={{ fontSize: '0.875rem' }}>{server.version}</span>
                    </Td>
                    <Td dataLabel="Description">
                      <p style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)', margin: 0, wordWrap: 'break-word' }}>
                        {server.description}
                      </p>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        )}
      </PageSection>
    </>
  );
};

export { MVPServers }; 