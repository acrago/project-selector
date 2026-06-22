import * as React from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  TextArea,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CubeIcon,
  LockIcon,
  ServerIcon,
  ShieldAltIcon,
  ToolsIcon
} from '@patternfly/react-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { useUserProfile } from '@app/utils/UserProfileContext';
import { useMCPCatalog } from '@app/utils/MCPCatalogContext';
import { mcpCatalogServers } from './mcpCatalogServers';
import { MCPCatalogIcon } from '@app/Home/icons';

// Brand colors for generic circular icons
const brandColors: Record<string, string> = {
  'kubernetes': '#336ce6',
  'github': '#181717',
  'postgres': '#336791',
  'salesforce': '#00A1E0',
  'slack': '#4A154B',
  'zapier': '#FF4A00'
};

// Logo component to handle SVG content, file paths, or special icon identifiers
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
  
  // Handle generic circular icon identifiers (format: 'generic-icon-{brand}' or 'generic-icon-{brand}:{color}')
  if (svgContent.startsWith('generic-icon-')) {
    const parts = svgContent.replace('generic-icon-', '').split(':');
    const brand = parts[0];
    const color = parts[1] || brandColors[brand] || '#6A6E73';
    const size = style?.width || style?.height || '32px';
    const sizeValue = typeof size === 'string' ? size : `${size}px`;
    
    return (
      <div
        style={{
          ...style,
          width: sizeValue,
          height: sizeValue,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        aria-label={alt}
        role="img"
      />
    );
  }
  
  // Check if content is inline SVG (raw-loader returns SVG as string, includes <svg or <?xml)
  const isInlineSVG = svgContent.includes('<svg') || svgContent.includes('<?xml');
  
  // Handle inline SVG content (from raw-loader)
  if (isInlineSVG) {
    const dataUri = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    return (
      <img 
        src={dataUri} 
        alt={alt}
        style={style}
      />
    );
  }
  
  // Handle imported SVG files as URLs (if webpack config changes)
  return (
    <img 
      src={svgContent} 
      alt={alt}
      style={style}
    />
  );
};

interface MCPCatalogProps {
  isTabContent?: boolean;
}

const MCPCatalog: React.FunctionComponent<MCPCatalogProps> = ({ isTabContent = false }) => {
  useDocumentTitle("MCP Servers");

  const { selectedProject } = useFeatureFlags();
  const { userProfile } = useUserProfile();
  const { isServerEnabled } = useMCPCatalog();
  const navigate = useNavigate();

  const [activeCategoryTab, setActiveCategoryTab] = React.useState<number>(0); // 0: All, 1: Certified Partners, 2: Community
  const [sortBy] = React.useState<string>('name');
  const [sortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = React.useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = React.useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage] = React.useState(10);
  
  // Filter state
  const [filters, setFilters] = React.useState<{
    labels: string[];
    deploymentMode: string[];
    status: string[];
    license: string[];
    version: string[];
    tags: string[];
    transports: string[];
    verifiedSource: boolean | null;
    secureEndpoint: boolean | null;
    sast: boolean | null;
    readOnlyTools: boolean | null;
  }>({
    labels: [],
    deploymentMode: [],
    status: [],
    license: [],
    version: [],
    tags: [],
    transports: [],
    verifiedSource: null,
    secureEndpoint: null,
    sast: null,
    readOnlyTools: null
  });
  const [integratedSearchText, setIntegratedSearchText] = React.useState<string>('');
  const [addServerModalOpen, setAddServerModalOpen] = React.useState<boolean>(false);
  const [transportSelectOpen, setTransportSelectOpen] = React.useState<boolean>(false);
  const [deploymentSelectOpen, setDeploymentSelectOpen] = React.useState<boolean>(false);
  const [redHatPartnerSelectOpen, setRedHatPartnerSelectOpen] = React.useState<boolean>(false);
  const [labelSearch, setLabelSearch] = React.useState<string>('');
  const [showAllLabels, setShowAllLabels] = React.useState<boolean>(false);
  const [newServerForm, setNewServerForm] = React.useState({
    name: '',
    description: '',
    tags: '',
    provider: '',
    version: '',
    license: '',
    transportType: '',
    deploymentMode: '',
    location: '',
    sourceUrl: '',
    homepage: '',
    iconColor: '',
    iconPath: '',
    redHatPartner: false,
    toolsBlacklist: ''
  });

  const handleServerClick = (serverSlug: string) => {
    navigate(`/ai-hub/mcp/catalog/${serverSlug}`);
  };

  const removeFilter = (filterType: string, value: string) => {
    setFilters(prev => {
      const currentValue = prev[filterType as keyof typeof prev];
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [filterType]: currentValue.filter(item => item !== value)
        };
      }
      return prev;
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      labels: [], deploymentMode: [], status: [],
      license: [], version: [], tags: [], transports: [],
      verifiedSource: null, secureEndpoint: null, sast: null, readOnlyTools: null
    });
    setIntegratedSearchText('');
    setCurrentPage(1);
  };

  const toggleDeploymentModeFilter = (mode: string) => {
    setFilters(prev => {
      const deploymentMode = prev.deploymentMode.includes(mode)
        ? prev.deploymentMode.filter(m => m !== mode)
        : [...prev.deploymentMode, mode];
      return { ...prev, deploymentMode };
    });
    setCurrentPage(1);
  };

  const toggleLicenseFilter = (license: string) => {
    setFilters(prev => {
      const licenseFilters = prev.license.includes(license)
        ? prev.license.filter(l => l !== license)
        : [...prev.license, license];
      return { ...prev, license: licenseFilters };
    });
    setCurrentPage(1);
  };

  const toggleTagFilter = (tag: string) => {
    setFilters(prev => {
      const tagFilters = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: tagFilters };
    });
    setCurrentPage(1);
  };

  const toggleTransportFilter = (transport: string) => {
    setFilters(prev => {
      const transportFilters = prev.transports.includes(transport)
        ? prev.transports.filter(t => t !== transport)
        : [...prev.transports, transport];
      return { ...prev, transports: transportFilters };
    });
    setCurrentPage(1);
  };

  const toggleBooleanFilter = (filterName: 'verifiedSource' | 'secureEndpoint' | 'sast' | 'readOnlyTools', value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: prev[filterName] === value ? null : value
    }));
    setCurrentPage(1);
  };

  // Apply filters to servers
  const getFilteredServers = () => {
    const searchLower = integratedSearchText.trim().toLowerCase();
    return servers.filter(server => {
      // First check if server is enabled in MCP Catalog Settings
      const isEnabledInSettings = isServerEnabled(server.slug);
      if (!isEnabledInSettings) {
        return false;
      }

      const matchesIntegratedSearch = searchLower === '' ||
        server.name.toLowerCase().includes(searchLower) ||
        server.description.toLowerCase().includes(searchLower) ||
        (server.tags && server.tags.some(tag => tag.toLowerCase().includes(searchLower)));

      const matchesLabelsFilters = filters.labels.length === 0 ||
        filters.labels.some(filter =>
          server.tags && server.tags.some(tag =>
            tag.toLowerCase().includes(filter.toLowerCase())
          )
        );

      const matchesDeploymentModeFilters = filters.deploymentMode.length === 0 ||
        filters.deploymentMode.some(mode => {
          if (mode === 'remote') {
            return server.slug === 'github-mcp-server' ||
                   server.slug === 'slack-mcp-server' ||
                   server.slug === 'zapier-mcp-server' ||
                   server.slug === 'splunk-mcp-server';
          } else if (mode === 'local') {
            return server.slug !== 'github-mcp-server' &&
                   server.slug !== 'slack-mcp-server' &&
                   server.slug !== 'zapier-mcp-server' &&
                   server.slug !== 'splunk-mcp-server';
          }
          return false;
        });

      const matchesStatusFilters = filters.status.length === 0 ||
        filters.status.some(statusFilter => {
          if (statusFilter === 'available') {
            return server.status === 'available';
          } else if (statusFilter === 'unavailable') {
            return server.status === 'unavailable';
          }
          return false;
        });

      const matchesLicenseFilters = filters.license.length === 0 ||
        filters.license.some(licenseFilter =>
          server.license && server.license.toLowerCase() === licenseFilter.toLowerCase()
        );

      const matchesVersionFilters = filters.version.length === 0 ||
        filters.version.some(versionFilter =>
          server.version.toLowerCase().includes(versionFilter.toLowerCase())
        );

      const matchesTagFilters = filters.tags.length === 0 ||
        filters.tags.some(tagFilter =>
          server.tags && server.tags.some(tag => tag.toLowerCase().includes(tagFilter.toLowerCase()))
        );

      const matchesTransportFilters = filters.transports.length === 0 ||
        filters.transports.some(transportFilter => {
          const serverTransports = (server as any).transports || [];
          const filterLower = transportFilter.toLowerCase();

          // Check if any of the server's supported transports match the filter
          return serverTransports.some((transport: string) =>
            transport.toLowerCase() === filterLower
          );
        });

      const matchesVerifiedSourceFilter = filters.verifiedSource === null ||
        (filters.verifiedSource === true && 
         server.slug !== 'splunk-mcp-server' && 
         server.slug !== 'github-mcp-server' && 
         server.slug !== 'slack-mcp-server' && 
         server.slug !== 'zapier-mcp-server');

      const matchesSecureEndpointFilter = filters.secureEndpoint === null ||
        (filters.secureEndpoint === true && (server as any).secureEndpoint === true);

      const matchesSastFilter = filters.sast === null ||
        (filters.sast === true && 
         server.slug !== 'splunk-mcp-server' && 
         server.slug !== 'github-mcp-server' && 
         server.slug !== 'slack-mcp-server' && 
         server.slug !== 'zapier-mcp-server');

      const matchesReadOnlyToolsFilter = filters.readOnlyTools === null ||
        (filters.readOnlyTools === true && 
         !server.hasWriteCapabilities && 
         !server.hasDestructiveCapabilities && 
         server.slug !== 'dynatrace-mcp-server' && 
         server.slug !== 'postgres-mcp-server');

      return matchesIntegratedSearch && matchesLabelsFilters &&
             matchesDeploymentModeFilters && matchesStatusFilters &&
             matchesLicenseFilters && matchesVersionFilters && matchesTagFilters &&
             matchesTransportFilters && matchesVerifiedSourceFilter && matchesSecureEndpointFilter &&
             matchesSastFilter && matchesReadOnlyToolsFilter;
    });
  };

  const getSortedServers = () => {
    const filteredServers = getFilteredServers();
    
    // Always prioritize ServiceNow and Splunk in the top row
    const priorityServers = filteredServers.filter(server => 
      server.slug === 'servicenow-mcp-server' || server.slug === 'splunk-mcp-server'
    );
    const otherServers = filteredServers.filter(server => 
      server.slug !== 'servicenow-mcp-server' && server.slug !== 'splunk-mcp-server'
    );
    
    // Sort priority servers: ServiceNow first, then Splunk
    const sortedPriorityServers = priorityServers.sort((a, b) => {
      if (a.slug === 'servicenow-mcp-server') return -1;
      if (b.slug === 'servicenow-mcp-server') return 1;
      if (a.slug === 'splunk-mcp-server') return -1;
      if (b.slug === 'splunk-mcp-server') return 1;
      return 0;
    });
    
    // Sort other servers normally
    const sortedOtherServers = [...otherServers].sort((a, b) => {
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
        case 'license':
          aValue = (a.license || '').toLowerCase();
          bValue = (b.license || '').toLowerCase();
          break;
        case 'deployment':
          aValue = isRemote(a) ? 'remote' : 'local';
          bValue = isRemote(b) ? 'remote' : 'local';
          break;
        case 'verified':
          aValue = hasVerifiedSource(a) ? 'yes' : 'no';
          bValue = hasVerifiedSource(b) ? 'yes' : 'no';
          break;
        case 'sast':
          aValue = hasSast(a) ? 'yes' : 'no';
          bValue = hasSast(b) ? 'yes' : 'no';
          break;
        case 'readOnlyTools':
          aValue = hasReadOnlyTools(a) ? 'yes' : 'no';
          bValue = hasReadOnlyTools(b) ? 'yes' : 'no';
          break;
        case 'partner':
          aValue = isRedHatPartner(a) ? 'yes' : 'no';
          bValue = isRedHatPartner(b) ? 'yes' : 'no';
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

    return [...sortedPriorityServers, ...sortedOtherServers];
  };

  const getPaginatedServers = () => {
    const sortedServers = getSortedServers();
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return sortedServers.slice(start, end);
  };

  const getRedHatCertifiedPartners = () => {
    return getFilteredServers()
      .filter(server =>
        server.slug === 'servicenow-mcp-server' ||
        server.slug === 'splunk-mcp-server' ||
        server.slug === 'dynatrace-mcp-server'
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const getRedHatCommunityServers = () => {
    return getFilteredServers()
      .filter(server =>
        server.slug !== 'servicenow-mcp-server' &&
        server.slug !== 'splunk-mcp-server' &&
        server.slug !== 'dynatrace-mcp-server'
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Render server card
  const renderServerCard = (server: typeof servers[0], index: number) => (
    <GridItem key={server.id} lg={4} md={6} sm={12}>
      <Card 
        isFullHeight
        onClick={() => handleServerClick(server.slug)}
        style={{ 
          cursor: 'pointer'
        }}
      >
        <CardHeader style={{ paddingBottom: '1rem' }}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Logo 
                svgContent={server.logo} 
                alt={`${server.name} logo`}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '4px'
                }}
              />
            </FlexItem>
            {(server.slug === 'github-mcp-server' || 
              server.slug === 'slack-mcp-server' || server.slug === 'zapier-mcp-server' || 
              server.slug === 'splunk-mcp-server') && (
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
                  Remote
                </Badge>
              </FlexItem>
            )}
          </Flex>
        </CardHeader>
        <CardBody style={{ paddingTop: 0, paddingBottom: '0.5rem', flexGrow: 1 }}>
          <Link
            to={`/ai-hub/mcp/catalog/${server.slug}`}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              fontSize: '0.875rem', 
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              padding: '0.25rem 0',
              textAlign: 'left',
              height: 'auto',
              lineHeight: '1.2',
              textDecoration: 'underline',
              display: 'block'
            }}
          >
            {server.name}
          </Link>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--pf-v5-global--Color--200)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.4'
            }}>
              {server.description}
            </p>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {server.slug !== 'splunk-mcp-server' && server.slug !== 'github-mcp-server' && 
             server.slug !== 'slack-mcp-server' && server.slug !== 'zapier-mcp-server' && (
              <>
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <ShieldAltIcon style={{ color: '#3E8635', fontSize: '14px' }} />
                  </FlexItem>
                  <FlexItem>
                    <span style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                      Verified source
                    </span>
                  </FlexItem>
                </Flex>
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <CheckCircleIcon style={{ color: '#3E8635', fontSize: '14px' }} />
                  </FlexItem>
                  <FlexItem>
                    <span style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                      SAST
                    </span>
                  </FlexItem>
                </Flex>
              </>
            )}
            {!server.hasWriteCapabilities && !server.hasDestructiveCapabilities && server.slug !== 'dynatrace-mcp-server' && server.slug !== 'postgres-mcp-server' && (
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <ToolsIcon style={{ color: '#3E8635', fontSize: '14px' }} />
                </FlexItem>
                <FlexItem>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Read only tools
                  </span>
                </FlexItem>
              </Flex>
            )}
            {(server.slug === 'servicenow-mcp-server' || server.slug === 'splunk-mcp-server' || server.slug === 'dynatrace-mcp-server') && (
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <CheckCircleIcon style={{ color: '#3E8635', fontSize: '14px' }} />
                </FlexItem>
                <FlexItem>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Red Hat partner
                  </span>
                </FlexItem>
              </Flex>
            )}
            {(server.slug === 'servicenow-mcp-server' || 
              server.slug === 'dynatrace-mcp-server' || server.slug === 'mcp-kubernetes-server' || 
              server.slug === 'postgres-mcp-server' || server.slug === 'salesforce-mcp-server') && (
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <ServerIcon style={{ color: '#3E8635', fontSize: '14px' }} />
                </FlexItem>
                <FlexItem>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Local to cluster
                  </span>
                </FlexItem>
              </Flex>
            )}
          </div>

        </CardBody>

        <CardFooter>
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            {server.requiresAccess && userProfile === 'AI Engineer' && 
             server.slug !== 'postgres-mcp-server' && server.slug !== 'zapier-mcp-server' &&
             server.slug !== 'splunk-mcp-server' && server.slug !== 'dynatrace-mcp-server' && (
              <FlexItem flex={{ default: 'flex_1' }}>
                <Button 
                  variant="secondary"
                  isBlock
                  icon={<LockIcon />}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsRequestAccessModalOpen(true);
                  }}
                >
                  Request access
                </Button>
              </FlexItem>
            )}
          </Flex>
        </CardFooter>
      </Card>
    </GridItem>
  );

  // Helper functions to determine metadata values
  const isRemote = (server: typeof servers[0]) => {
    return server.slug === 'github-mcp-server' || 
           server.slug === 'slack-mcp-server' || 
           server.slug === 'zapier-mcp-server' || 
           server.slug === 'splunk-mcp-server';
  };

  const hasVerifiedSource = (server: typeof servers[0]) => {
    return server.slug !== 'splunk-mcp-server' && 
           server.slug !== 'github-mcp-server' && 
           server.slug !== 'slack-mcp-server' && 
           server.slug !== 'zapier-mcp-server';
  };

  const hasSast = (server: typeof servers[0]) => {
    return hasVerifiedSource(server);
  };

  const hasReadOnlyTools = (server: typeof servers[0]) => {
    return !server.hasWriteCapabilities && 
           !server.hasDestructiveCapabilities && 
           server.slug !== 'dynatrace-mcp-server' && 
           server.slug !== 'postgres-mcp-server';
  };

  const isRedHatPartner = (server: typeof servers[0]) => {
    return server.slug === 'servicenow-mcp-server' || 
           server.slug === 'splunk-mcp-server' || 
           server.slug === 'dynatrace-mcp-server';
  };




  // Determine if servers should require access based on user profile
  const isAdminUser = userProfile === 'AI Admin';

  // MCP servers from shared catalog - single source of truth with AI Asset Endpoints
  const [baseServers, setBaseServers] = React.useState(() => [...mcpCatalogServers]);

  const servers = React.useMemo(() => {
    return baseServers.map(server => {
      // For Splunk and Dynatrace servers, require access when Project Y is selected
      if ((server.slug === 'splunk-mcp-server' || server.slug === 'dynatrace-mcp-server') && selectedProject === 'Project Y') {
        return {
          ...server,
          type: "ACCESS REQUIRED",
          status: "unavailable",
          statusColor: "#F0AB00",
          requiresAccess: true
        };
      }
      
      // For PostgreSQL and Zapier servers, adjust access based on user role
      if ((server.slug === 'postgres-mcp-server' || server.slug === 'zapier-mcp-server') && !isAdminUser) {
        // AI Engineer - requires access
        return {
          ...server,
          type: "ACCESS REQUIRED",
          status: "unavailable",
          statusColor: "#F0AB00",
          requiresAccess: true
        };
      } else if ((server.slug === 'postgres-mcp-server' || server.slug === 'zapier-mcp-server') && isAdminUser) {
        // AI Admin - has access
        return {
          ...server,
          type: "AVAILABLE",
          status: "available",
          statusColor: "#3E8635",
          requiresAccess: false
        };
      }
      return server;
    });
  }, [baseServers, isAdminUser, selectedProject]);

  // Get all unique tags/labels from servers
  const allLabels = React.useMemo(() => {
    const labelSet = new Set<string>();
    servers.forEach(server => {
      if (server.tags && Array.isArray(server.tags)) {
        server.tags.forEach(tag => labelSet.add(tag));
      }
    });
    return Array.from(labelSet).sort();
  }, [servers]);

  // Filter labels based on search
  const getFilteredLabels = React.useCallback(() => {
    if (!labelSearch.trim()) {
      return allLabels;
    }
    const searchLower = labelSearch.toLowerCase();
    return allLabels.filter(label => label.toLowerCase().includes(searchLower));
  }, [allLabels, labelSearch]);

  const filteredLabels = getFilteredLabels();
  const displayedLabels = showAllLabels ? filteredLabels : filteredLabels.slice(0, 5);

  return (
    <>
      <PageSection isFilled style={{ padding: 0 }}>
        {/* Header - Only show when not tab content */}
        {!isTabContent && (
        <div style={{ padding: '1rem', paddingBottom: '0' }}>
          <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: '#daf2f2', borderRadius: '20px', padding: '4px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MCPCatalogIcon size={32} />
            </div>
            MCP catalog
          </Title>
          <p style={{ color: '#6A6E73', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Discover MCP servers provided by Red Hat certified partners and other providers that are available for your organization.
          </p>
        </div>
        )}

        <Sidebar>
          <SidebarPanel 
            width={{ default: 'width_25' }}
            style={{ 
              borderRight: '1px solid #d2d2d2',
              flex: '0 0 240px',
              maxWidth: '240px'
            }}
          >
            {/* Filter Sidebar */}
            <div style={{ padding: '0 1rem 1rem 1rem' }}>
              {/* Deployment Mode Filter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Deployment mode
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Checkbox
                    id="sidebar-filter-remote"
                    label="Remote"
                    isChecked={filters.deploymentMode.includes('remote')}
                    onChange={() => toggleDeploymentModeFilter('remote')}
                  />
                  <Checkbox
                    id="sidebar-filter-local"
                    label="Local"
                    isChecked={filters.deploymentMode.includes('local')}
                    onChange={() => toggleDeploymentModeFilter('local')}
                  />
                </div>
              </div>

              <Divider style={{ marginBottom: '1rem' }} />

              {/* Transports Filter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Supported transports
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['SSE', 'http-streaming'].map(transport => (
                    <Checkbox
                      key={transport}
                      id={`transport-${transport}`}
                      label={transport}
                      isChecked={filters.transports.includes(transport)}
                      onChange={() => toggleTransportFilter(transport)}
                    />
                  ))}
                </div>
              </div>

              <Divider style={{ marginBottom: '1rem' }} />

              {/* License Filter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  License
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['MIT', 'Apache-2.0'].map(license => (
                    <Checkbox
                      key={license}
                      id={`license-${license}`}
                      label={license}
                      isChecked={filters.license.includes(license)}
                      onChange={() => toggleLicenseFilter(license)}
                    />
                  ))}
                </div>
              </div>

              <Divider style={{ marginBottom: '1rem' }} />

              {/* Labels Filter */}
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Labels
                </Title>
                <SearchInput
                  placeholder="Search for labels"
                  value={labelSearch}
                  onChange={(_event, value) => setLabelSearch(value)}
                  onClear={() => setLabelSearch('')}
                  style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}
                />
                {displayedLabels.map(label => (
                  <div key={label} style={{ marginBottom: '0.5rem' }}>
                    <Checkbox
                      id={`label-${label}`}
                      label={label}
                      isChecked={filters.tags.includes(label)}
                      onChange={() => toggleTagFilter(label)}
                    />
                  </div>
                ))}
                {filteredLabels.length > 5 && (
                  <Button 
                    variant="link" 
                    isInline 
                    style={{ fontSize: '0.875rem', padding: 0 }}
                    onClick={() => setShowAllLabels(!showAllLabels)}
                  >
                    {showAllLabels ? 'Show less' : 'Show more'}
                  </Button>
                )}
              </div>

              <Divider style={{ marginBottom: '1rem' }} />

              {/* Boolean Filters */}
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Security & Verification
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Checkbox
                    id="filter-verified-source"
                    label="Verified source"
                    isChecked={filters.verifiedSource === true}
                    onChange={() => toggleBooleanFilter('verifiedSource', filters.verifiedSource === true ? null : true)}
                  />
                  <Checkbox
                    id="filter-secure-endpoint"
                    label="Secure endpoint"
                    isChecked={filters.secureEndpoint === true}
                    onChange={() => toggleBooleanFilter('secureEndpoint', filters.secureEndpoint === true ? null : true)}
                  />
                  <Checkbox
                    id="filter-sast"
                    label="SAST"
                    isChecked={filters.sast === true}
                    onChange={() => toggleBooleanFilter('sast', filters.sast === true ? null : true)}
                  />
                  <Checkbox
                    id="filter-read-only-tools"
                    label="Read only tools"
                    isChecked={filters.readOnlyTools === true}
                    onChange={() => toggleBooleanFilter('readOnlyTools', filters.readOnlyTools === true ? null : true)}
                  />
                </div>
              </div>
            </div>
          </SidebarPanel>

          <SidebarContent style={{ overflow: 'hidden', width: '100%', minWidth: 0 }}>
            {/* Filters and Controls */}
            <div style={{ padding: '1.5rem', paddingTop: '0.5rem' }}>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <SearchInput
                  id="mcp-catalog-integrated-search"
                  placeholder="Search by name, keyword, or description..."
                  value={integratedSearchText}
                  onChange={(_event, value) => {
                    setIntegratedSearchText(value);
                    setCurrentPage(1);
                  }}
                  onClear={() => setIntegratedSearchText('')}
                  style={{ minWidth: '300px' }}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>

            {/* Active Filters - below the filter bar */}
            {(integratedSearchText.trim() !== '' || filters.labels.length > 0 ||
              filters.deploymentMode.length > 0 || filters.status.length > 0 ||
              filters.license.length > 0 || filters.version.length > 0 ||
              filters.tags.length > 0 || filters.transports.length > 0 ||
              filters.verifiedSource !== null || filters.secureEndpoint !== null || filters.sast !== null || filters.readOnlyTools !== null) && (
              <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: 'fit-content' }}>
                <LabelGroup
                  categoryName="Active filters"
                  isClosable={false}
                  numLabels={
                    (integratedSearchText.trim() !== '' ? 1 : 0) + filters.labels.length +
                    filters.deploymentMode.length + filters.status.length +
                    filters.license.length + filters.version.length +
                    filters.tags.length + filters.transports.length +
                    (filters.verifiedSource !== null ? 1 : 0) + (filters.secureEndpoint !== null ? 1 : 0) +
                    (filters.sast !== null ? 1 : 0) + (filters.readOnlyTools !== null ? 1 : 0)
                  }
                >
                  {integratedSearchText.trim() !== '' && (
                    <Label
                      key="integrated-search"
                      variant="outline"
                      onClose={() => setIntegratedSearchText('')}
                    >
                      Search: {integratedSearchText.trim()}
                    </Label>
                  )}
                  {filters.labels.map(filter => (
                    <Label
                      key={`labels-${filter}`}
                      variant="outline"
                      onClose={() => removeFilter('labels', filter)}
                    >
                      {filter}
                    </Label>
                  ))}
                  {filters.deploymentMode.map(filter => (
                    <Label
                      key={`deploymentMode-${filter}`}
                      variant="outline"
                      onClose={() => removeFilter('deploymentMode', filter)}
                    >
                      {filter}
                    </Label>
                  ))}
                  {filters.status.map(filter => (
                    <Label
                      key={`status-${filter}`}
                      variant="outline"
                      onClose={() => removeFilter('status', filter)}
                    >
                      {filter}
                    </Label>
                  ))}
                  {filters.license.map(filter => (
                    <Label
                      key={`license-${filter}`}
                      variant="outline"
                      onClose={() => removeFilter('license', filter)}
                    >
                      License: {filter}
                    </Label>
                  ))}
                  {filters.version.map(filter => (
                    <Label
                      key={`version-${filter}`}
                      variant="outline"
                      onClose={() => removeFilter('version', filter)}
                    >
                      Version: {filter}
                    </Label>
                  ))}
                  {filters.tags.map(filter => (
                    <Label
                      key={`tags-${filter}`}
                      variant="outline"
                      onClose={() => removeFilter('tags', filter)}
                    >
                      Tag: {filter}
                    </Label>
                  ))}
                  {filters.transports.map(filter => (
                    <Label
                      key={`transports-${filter}`}
                      variant="outline"
                      onClose={() => removeFilter('transports', filter)}
                    >
                      Transport: {filter}
                    </Label>
                  ))}
                  {filters.verifiedSource !== null && (
                    <Label
                      variant="outline"
                      onClose={() => toggleBooleanFilter('verifiedSource', null)}
                    >
                      Verified source
                    </Label>
                  )}
                  {filters.secureEndpoint !== null && (
                    <Label
                      variant="outline"
                      onClose={() => toggleBooleanFilter('secureEndpoint', null)}
                    >
                      Secure endpoint
                    </Label>
                  )}
                  {filters.sast !== null && (
                    <Label
                      variant="outline"
                      onClose={() => toggleBooleanFilter('sast', null)}
                    >
                      SAST
                    </Label>
                  )}
                  {filters.readOnlyTools !== null && (
                    <Label
                      variant="outline"
                      onClose={() => toggleBooleanFilter('readOnlyTools', null)}
                    >
                      Read only tools
                    </Label>
                  )}
                </LabelGroup>
                </div>
                <Button variant="link" onClick={clearAllFilters}>
                  Reset all filters
                </Button>
              </div>
            )}

              {/* Category Switcher */}
              {!integratedSearchText.trim() && (
                <ToggleGroup
                  style={{
                    marginBottom: '1.5rem',
                    marginTop: '1rem'
                  }}
                  aria-label="Server category filter"
                >
                  <ToggleGroupItem
                    buttonId="all-servers"
                    isSelected={activeCategoryTab === 0}
                    text="All servers"
                    onClick={() => setActiveCategoryTab(0)}
                  />
                  <ToggleGroupItem
                    buttonId="certified-partners"
                    isSelected={activeCategoryTab === 1}
                    text="Red Hat Certified Partners"
                    onClick={() => setActiveCategoryTab(1)}
                  />
                  <ToggleGroupItem
                    buttonId="community-servers"
                    isSelected={activeCategoryTab === 2}
                    text="Other MCP servers"
                    onClick={() => setActiveCategoryTab(2)}
                  />
                </ToggleGroup>
              )}

              {/* MCP Servers Content */}
        {/* Grid View - categories when not searching, flat list for search results */}
        {integratedSearchText.trim() !== '' ? (
          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <Grid hasGutter>
              {getPaginatedServers().map((server, index) => renderServerCard(server, index))}
            </Grid>
          </div>
        ) : (
          <>
            {(activeCategoryTab === 0 || activeCategoryTab === 1) && getRedHatCertifiedPartners().length > 0 && (
              <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <Title headingLevel="h2" size="lg" style={{ marginBottom: '0.5rem' }}>
                  Red Hat Certified Partners
                </Title>
                <p style={{ color: '#6A6E73', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  MCP servers from Red Hat certified partners with verified integration and support.
                </p>
                <Grid hasGutter>
                  {getRedHatCertifiedPartners().map((server, index) => renderServerCard(server, index))}
                </Grid>
              </div>
            )}
            {(activeCategoryTab === 0 || activeCategoryTab === 2) && getRedHatCommunityServers().length > 0 && (
              <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <Title headingLevel="h2" size="lg" style={{ marginBottom: '0.5rem' }}>
                  Other MCP servers
                </Title>
                <p style={{ color: '#6A6E73', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  A broad collection of community and third-party MCP servers available for integration.
                </p>
                <Grid hasGutter>
                  {getRedHatCommunityServers().map((server, index) => renderServerCard(server, index))}
                </Grid>
              </div>
            )}
          </>
        )}
            </div>
          </SidebarContent>
        </Sidebar>
      </PageSection>
      
      {/* Request Access Modal */}
      <Modal
        isOpen={isRequestAccessModalOpen}
        onClose={() => setIsRequestAccessModalOpen(false)}
        aria-labelledby="request-access-modal-title"
        variant="small"
      >
        <ModalHeader
          title="Request Access"
          labelId="request-access-modal-title"
        />
        <ModalBody>
          Coming soon
        </ModalBody>
      </Modal>

      {/* Add MCP Server Modal */}
      <Modal
        isOpen={addServerModalOpen}
        onClose={() => {
          setAddServerModalOpen(false);
          setNewServerForm({
            name: '',
            description: '',
            tags: '',
            provider: '',
            version: '',
            license: '',
            transportType: '',
            deploymentMode: '',
            location: '',
            sourceUrl: '',
            homepage: '',
            iconColor: '',
            iconPath: '',
            redHatPartner: false,
            toolsBlacklist: ''
          });
        }}
        aria-labelledby="add-server-modal-title"
        variant="large"
      >
        <ModalHeader
          title="Add MCP server to catalog"
          labelId="add-server-modal-title"
        />
        <ModalBody>
          <Grid hasGutter>
            {/* Name */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_name</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    isRequired
                    id="server-name"
                    value={newServerForm.name}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, name: value })}
                    placeholder="Enter server name"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Description */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_description</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextArea
                    isRequired
                    id="server-description"
                    value={newServerForm.description}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, description: value })}
                    placeholder="Enter server description"
                    rows={3}
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Tags */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_tags</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-tags"
                    value={newServerForm.tags}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, tags: value })}
                    placeholder="Enter tags separated by commas (e.g., kubernetes, infrastructure)"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Provider */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_provider</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-provider"
                    value={newServerForm.provider}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, provider: value })}
                    placeholder="Enter provider name"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Version */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_version</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-version"
                    value={newServerForm.version}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, version: value })}
                    placeholder="e.g., 1.0.0"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* License */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_license</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-license"
                    value={newServerForm.license}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, license: value })}
                    placeholder="e.g., MIT, Apache-2.0"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Transport type */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_transport_type</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <Select
                    id="server-transport"
                    isOpen={transportSelectOpen}
                    selected={newServerForm.transportType}
                    onSelect={(_event, value) => {
                      setNewServerForm({ ...newServerForm, transportType: value as string });
                      setTransportSelectOpen(false);
                    }}
                    onOpenChange={(isOpen) => setTransportSelectOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setTransportSelectOpen(!transportSelectOpen)}
                        isExpanded={transportSelectOpen}
                      >
                        {newServerForm.transportType || 'Select transport type'}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="stdio">stdio</SelectOption>
                      <SelectOption value="SSE">SSE</SelectOption>
                      <SelectOption value="HTTP">HTTP</SelectOption>
                      <SelectOption value="streaming">streaming</SelectOption>
                    </SelectList>
                  </Select>
                </GridItem>
              </Grid>
            </GridItem>

            {/* Deployment mode */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_deployment_mode</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <Select
                    id="server-deployment"
                    isOpen={deploymentSelectOpen}
                    selected={newServerForm.deploymentMode}
                    onSelect={(_event, value) => {
                      setNewServerForm({ ...newServerForm, deploymentMode: value as string });
                      setDeploymentSelectOpen(false);
                    }}
                    onOpenChange={(isOpen) => setDeploymentSelectOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setDeploymentSelectOpen(!deploymentSelectOpen)}
                        isExpanded={deploymentSelectOpen}
                      >
                        {newServerForm.deploymentMode || 'Select deployment mode'}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="Remote">Remote</SelectOption>
                      <SelectOption value="Local to cluster">Local to cluster</SelectOption>
                    </SelectList>
                  </Select>
                </GridItem>
              </Grid>
            </GridItem>

            {/* Location */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_location</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-location"
                    value={newServerForm.location}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, location: value })}
                    placeholder="OCI image or remote URL (e.g., quay.io/user/image:tag or https://example.com)"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Source URL */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_source_url</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-source-url"
                    value={newServerForm.sourceUrl}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, sourceUrl: value })}
                    placeholder="https://github.com/user/repo"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Homepage */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>mcp_server_homepage</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-homepage"
                    value={newServerForm.homepage}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, homepage: value })}
                    placeholder="https://example.com"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Icon Color */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>icon_color</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-icon-color"
                    value={newServerForm.iconColor}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, iconColor: value })}
                    placeholder="e.g., #336ce6"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Icon Path */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>icon_path</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-icon-path"
                    value={newServerForm.iconPath}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, iconPath: value })}
                    placeholder="Enter icon path or URL"
                  />
                </GridItem>
              </Grid>
            </GridItem>

            {/* Red Hat Partner */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>red_hat_partner</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <Select
                    id="server-red-hat-partner"
                    isOpen={redHatPartnerSelectOpen}
                    selected={newServerForm.redHatPartner ? 'true' : 'false'}
                    onSelect={(_event, value) => {
                      setNewServerForm({ ...newServerForm, redHatPartner: value === 'true' });
                      setRedHatPartnerSelectOpen(false);
                    }}
                    onOpenChange={(isOpen) => setRedHatPartnerSelectOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setRedHatPartnerSelectOpen(!redHatPartnerSelectOpen)}
                        isExpanded={redHatPartnerSelectOpen}
                      >
                        {newServerForm.redHatPartner ? 'true' : 'false'}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="false">false</SelectOption>
                      <SelectOption value="true">true</SelectOption>
                    </SelectList>
                  </Select>
                </GridItem>
              </Grid>
            </GridItem>

            {/* Tools Blacklist */}
            <GridItem span={12}>
              <Grid hasGutter>
                <GridItem span={4}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <code style={{ fontSize: '0.875rem', color: '#6b7280' }}>tools_blacklist</code>
                  </div>
                </GridItem>
                <GridItem span={8}>
                  <TextInput
                    id="server-tools-blacklist"
                    value={newServerForm.toolsBlacklist}
                    onChange={(_event, value) => setNewServerForm({ ...newServerForm, toolsBlacklist: value })}
                    placeholder="Enter tool names separated by commas (e.g., tool1, tool2, tool3)"
                  />
                </GridItem>
              </Grid>
            </GridItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button
            key="cancel"
            variant="link"
            onClick={() => {
              setAddServerModalOpen(false);
              setNewServerForm({
                name: '',
                description: '',
                tags: '',
                provider: '',
                version: '',
                license: '',
                transportType: '',
                deploymentMode: '',
                location: '',
                sourceUrl: '',
                homepage: '',
                iconColor: '',
                iconPath: '',
                redHatPartner: false,
                toolsBlacklist: ''
              });
            }}
          >
            Cancel
          </Button>
          <Button
            key="submit"
            variant="primary"
            onClick={() => {
              // Generate slug from name
              const slug = newServerForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-mcp-server';
              
              // Generate unique ID (use timestamp to ensure uniqueness)
              const newId = Math.max(...baseServers.map(s => s.id), 0) + 1;
              
              // Parse tags from comma-separated string
              const tags = newServerForm.tags
                ? newServerForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                : [];
              
              // Determine logo
              let logo: string;
              if (newServerForm.iconPath) {
                logo = newServerForm.iconPath;
              } else if (newServerForm.iconColor) {
                // Create a generic icon identifier based on the first part of the name
                // Store the color in a custom format that can be parsed
                const brandKey = newServerForm.name.toLowerCase().replace(/\s+/g, '-').split('-')[0];
                logo = `generic-icon-${brandKey}:${newServerForm.iconColor}`;
              } else {
                logo = 'cube-icon';
              }
              
              // Determine isLocal from deploymentMode
              const isLocal = newServerForm.deploymentMode === 'Local to cluster';
              
              // Create new server object
              const newServer = {
                id: newId,
                slug: slug,
                name: newServerForm.name,
                provider: newServerForm.provider || 'Unknown',
                type: "AVAILABLE" as const,
                logo: logo,
                description: newServerForm.description,
                status: "available" as const,
                statusColor: "#3E8635",
                models: "Universal" as const,
                deployment: newServerForm.deploymentMode || "Community",
                providerType: newServerForm.redHatPartner ? "Red Hat Partner" : "Community",
                version: newServerForm.version || "1.0.0",
                lastUsed: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
                agentCount: 0,
                tags: tags,
                isAdded: false,
                hasWriteCapabilities: false,
                hasDestructiveCapabilities: false,
                isLocal: isLocal,
                deploymentMode: newServerForm.deploymentMode || 'Remote',
                transports: [newServerForm.transportType || 'stdio'],
                location: newServerForm.location || '',
                sourceUrl: newServerForm.sourceUrl || '',
                homepage: newServerForm.homepage || '',
                license: newServerForm.license || ''
              };
              
              // Add the new server to the list and calculate which page it will appear on
              setBaseServers(prev => {
                const updatedServers = [...prev, newServer];
                
                // Calculate which page the new server will appear on after sorting
                // Use the same sorting logic as getSortedServers
                const priorityServers = updatedServers.filter(s => 
                  s.slug === 'servicenow-mcp-server' || s.slug === 'splunk-mcp-server'
                );
                const otherServers = updatedServers.filter(s => 
                  s.slug !== 'servicenow-mcp-server' && s.slug !== 'splunk-mcp-server'
                );
                
                const sortedPriorityServers = priorityServers.sort((a, b) => {
                  if (a.slug === 'servicenow-mcp-server') return -1;
                  if (b.slug === 'servicenow-mcp-server') return 1;
                  if (a.slug === 'splunk-mcp-server') return -1;
                  if (b.slug === 'splunk-mcp-server') return 1;
                  return 0;
                });
                
                const sortedOtherServers = [...otherServers].sort((a, b) => {
                  const aValue = a.name.toLowerCase();
                  const bValue = b.name.toLowerCase();
                  if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                  if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                  return 0;
                });
                
                const sortedServers = [...sortedPriorityServers, ...sortedOtherServers];
                const newServerIndex = sortedServers.findIndex(s => s.id === newId);
                
                // Calculate which page it will be on (1-indexed)
                if (newServerIndex >= 0) {
                  const targetPage = Math.floor(newServerIndex / perPage) + 1;
                  setTimeout(() => {
                    setCurrentPage(targetPage);
                  }, 0);
                }
                
                return updatedServers;
              });
              
              // Close modal and reset form
              setAddServerModalOpen(false);
              setNewServerForm({
                name: '',
                description: '',
                tags: '',
                provider: '',
                version: '',
                license: '',
                transportType: '',
                deploymentMode: '',
                location: '',
                sourceUrl: '',
                homepage: '',
                iconColor: '',
                iconPath: '',
                redHatPartner: false,
                toolsBlacklist: ''
              });
            }}
            isDisabled={!newServerForm.name || !newServerForm.description}
          >
            Add server
          </Button>
        </ModalFooter>
      </Modal>

      {/* Feature Not Available Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
      >
        <ModalHeader title="Coming soon" />
        <ModalBody>
          <p>This interaction is out of scope for this prototype.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsFeatureModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { MCPCatalog }; 