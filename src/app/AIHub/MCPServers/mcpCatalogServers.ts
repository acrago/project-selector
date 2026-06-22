/**
 * Shared MCP catalog server data used by both the MCP Catalog view and AI Asset Endpoints.
 * Single source of truth for MCP servers available in the organization.
 */
import { mcpServerLogos } from './mcpServerLogos';

export interface MCPCatalogServerEntry {
  id: number;
  slug: string;
  name: string;
  provider: string;
  type: string;
  logo: string;
  description: string;
  status: string;
  statusColor: string;
  models: string;
  deployment: string;
  providerType: string;
  version: string;
  lastUsed: string;
  agentCount: number;
  tags: string[];
  isAdded: boolean;
  hasWriteCapabilities: boolean;
  hasDestructiveCapabilities: boolean;
  license: string;
  transports: string[];
  requiresAccess?: boolean;
  streamableEndpoint: string;
  streamableToken: string;
}

/** Slug to endpoint path segment mapping */
const slugToPath: Record<string, string> = {
  'mcp-kubernetes-server': 'kubernetes',
  'slack-mcp-server': 'slack',
  'servicenow-mcp-server': 'servicenow',
  'salesforce-mcp-server': 'salesforce',
  'splunk-mcp-server': 'splunk',
  'dynatrace-mcp-server': 'dynatrace',
  'github-mcp-server': 'github',
  'postgres-mcp-server': 'postgres',
  'zapier-mcp-server': 'zapier',
};

const baseUrl = 'https://api.demo.openshift.ai/mcp';

/** Canonical list of MCP servers from the catalog - used by MCP Catalog and AI Asset Endpoints */
export const mcpCatalogServers: Omit<MCPCatalogServerEntry, 'streamableEndpoint' | 'streamableToken'>[] = [
  {
    id: 3,
    slug: 'servicenow-mcp-server',
    name: 'ServiceNow',
    provider: 'echelon-ai-labs',
    type: 'AVAILABLE',
    logo: mcpServerLogos['servicenow-mcp-server'],
    description: 'Automate incident management by creating, updating, and querying ServiceNow tickets and change requests.',
    status: 'available',
    statusColor: '#3E8635',
    models: 'Universal',
    deployment: 'Community',
    providerType: 'Community',
    version: '2.1.0',
    lastUsed: '1/15/2025',
    agentCount: 6,
    tags: ['servicenow', 'itsm', 'tickets', 'incident-management'],
    isAdded: true,
    hasWriteCapabilities: true,
    hasDestructiveCapabilities: false,
    license: 'MIT',
    transports: ['stdio', 'SSE'],
  },
  {
    id: 5,
    slug: 'splunk-mcp-server',
    name: 'Splunk',
    provider: 'livehybrid',
    type: 'AVAILABLE',
    logo: mcpServerLogos['splunk-mcp-server'],
    description: 'Query logs and metrics with SPL to analyze incidents, explain anomalies, and draft post-mortems.',
    status: 'available',
    statusColor: '#3E8635',
    models: 'Universal',
    deployment: 'Community',
    providerType: 'Community',
    version: '1.3.1',
    lastUsed: '1/14/2025',
    agentCount: 5,
    tags: ['splunk', 'observability', 'logs', 'security'],
    isAdded: true,
    hasWriteCapabilities: false,
    hasDestructiveCapabilities: false,
    license: 'MIT',
    transports: ['stdio'],
  },
  {
    id: 1,
    slug: 'mcp-kubernetes-server',
    name: 'Kubernetes',
    provider: 'feiskyer',
    type: 'AVAILABLE',
    logo: mcpServerLogos['mcp-kubernetes-server'],
    description: 'Control and inspect Kubernetes clusters using natural language queries for health, resources, and deployments.',
    status: 'available',
    statusColor: '#3E8635',
    models: 'Universal',
    deployment: 'Community',
    providerType: 'Community',
    version: '0.1.11',
    lastUsed: '1/15/2025',
    agentCount: 8,
    tags: ['kubernetes', 'infrastructure', 'kubectl', 'cluster-management'],
    isAdded: true,
    hasWriteCapabilities: true,
    hasDestructiveCapabilities: true,
    license: 'MIT',
    transports: ['stdio', 'SSE'],
  },
  {
    id: 2,
    slug: 'slack-mcp-server',
    name: 'Slack',
    provider: 'korotovsky',
    type: 'AVAILABLE',
    logo: mcpServerLogos['slack-mcp-server'],
    description: 'Post messages, read threads, and trigger workflows to automate DevOps team communications in Slack.',
    status: 'available',
    statusColor: '#3E8635',
    models: 'Universal',
    deployment: 'Community',
    providerType: 'Community',
    version: '1.4.2',
    lastUsed: '1/15/2025',
    agentCount: 12,
    tags: ['slack', 'collaboration', 'chatops', 'workflows'],
    isAdded: false,
    hasWriteCapabilities: false,
    hasDestructiveCapabilities: false,
    license: 'MIT',
    transports: ['stdio', 'http-streaming'],
  },
  {
    id: 4,
    slug: 'salesforce-mcp-server',
    name: 'Salesforce',
    provider: 'tsmztech',
    type: 'AVAILABLE',
    logo: mcpServerLogos['salesforce-mcp-server'],
    description: 'Access CRM data with SOQL queries to retrieve accounts, cases, and opportunities for AI.',
    status: 'available',
    statusColor: '#3E8635',
    models: 'Universal',
    deployment: 'Community',
    providerType: 'Community',
    version: '1.8.3',
    lastUsed: '1/14/2025',
    agentCount: 9,
    tags: ['salesforce', 'crm', 'soql', 'customer-support'],
    isAdded: false,
    hasWriteCapabilities: true,
    hasDestructiveCapabilities: false,
    license: 'MIT',
    transports: ['stdio', 'SSE'],
  },
  {
    id: 6,
    slug: 'dynatrace-mcp-server',
    name: 'Dynatrace',
    provider: 'dynatrace-oss',
    type: 'AVAILABLE',
    logo: mcpServerLogos['dynatrace-mcp-server'],
    description: 'Monitor service health in real-time with DQL queries and vulnerability feeds for proactive recommendations.',
    status: 'available',
    statusColor: '#3E8635',
    models: 'Universal',
    deployment: 'Community',
    providerType: 'Community',
    version: '2.0.4',
    lastUsed: '1/14/2025',
    agentCount: 4,
    tags: ['dynatrace', 'monitoring', 'apm', 'vulnerability'],
    isAdded: false,
    hasWriteCapabilities: false,
    hasDestructiveCapabilities: false,
    license: 'MIT',
    transports: ['stdio', 'SSE'],
  },
  {
    id: 7,
    slug: 'github-mcp-server',
    name: 'GitHub',
    provider: 'github',
    type: 'AVAILABLE',
    logo: mcpServerLogos['github-mcp-server'],
    description: 'Manage repositories, issues, and pull requests while automating code reviews, releases, and developer workflows.',
    status: 'available',
    statusColor: '#3E8635',
    models: 'Universal',
    deployment: 'Official',
    providerType: 'Official',
    version: '1.2.5',
    lastUsed: '1/15/2025',
    agentCount: 15,
    tags: ['github', 'git', 'repositories', 'development'],
    isAdded: true,
    hasWriteCapabilities: true,
    hasDestructiveCapabilities: true,
    license: 'Apache-2.0',
    transports: ['stdio', 'SSE', 'http-streaming'],
  },
  {
    id: 8,
    slug: 'postgres-mcp-server',
    name: 'PostgreSQL',
    provider: 'modelcontextprotocol',
    type: 'ACCESS REQUIRED',
    logo: mcpServerLogos['postgres-mcp-server'],
    description: 'Execute read-only SQL queries with audit trails for secure access to healthcare and financial databases.',
    status: 'unavailable',
    statusColor: '#F0AB00',
    models: 'Universal',
    deployment: 'Official',
    providerType: 'Official',
    version: '1.0.8',
    lastUsed: '1/15/2025',
    agentCount: 7,
    tags: ['postgresql', 'database', 'sql', 'healthcare'],
    isAdded: false,
    requiresAccess: true,
    hasWriteCapabilities: false,
    hasDestructiveCapabilities: false,
    license: 'MIT',
    transports: ['stdio'],
  },
  {
    id: 9,
    slug: 'zapier-mcp-server',
    name: 'Zapier',
    provider: 'zapier',
    type: 'ACCESS REQUIRED',
    logo: mcpServerLogos['zapier-mcp-server'],
    description: 'Connect to 7,000+ SaaS applications instantly without code for calendars, tickets, and enterprise workflows.',
    status: 'unavailable',
    statusColor: '#F0AB00',
    models: 'Universal',
    deployment: 'Hosted',
    providerType: 'Commercial',
    version: '3.2.1',
    lastUsed: '1/15/2025',
    agentCount: 11,
    tags: ['zapier', 'automation', 'integration', 'saas'],
    isAdded: true,
    requiresAccess: true,
    hasWriteCapabilities: true,
    hasDestructiveCapabilities: false,
    license: 'MIT',
    transports: ['http-streaming'],
  },
];

/** AI Asset Endpoints MCPServer format */
export interface AssetEndpointMCPServer {
  id: string;
  name: string;
  status: string;
  statusColor: string;
  version: string;
  description: string;
  logo: string;
  slug: string;
  streamableEndpoint?: string;
  streamableToken?: string;
}

const tokenBySlug: Record<string, string> = {
  'mcp-kubernetes-server': 'sk-k8s-stream-token-abc123',
  'slack-mcp-server': 'sk-slack-stream-token-def456',
  'servicenow-mcp-server': 'sk-servicenow-stream-token-jkl012',
  'salesforce-mcp-server': 'sk-salesforce-stream-token-mno345',
  'splunk-mcp-server': 'sk-splunk-stream-token-pqr678',
  'dynatrace-mcp-server': 'sk-dynatrace-stream-token-ghi789',
  'github-mcp-server': 'sk-github-stream-token-stu901',
  'postgres-mcp-server': 'sk-postgres-stream-token-vwx234',
  'zapier-mcp-server': 'sk-zapier-stream-token-yzab567',
};

/**
 * Converts MCP catalog servers to AI Asset Endpoints format.
 * Use this when rendering the MCP servers table in the AI asset endpoints view.
 */
export function getMCPServersForAssetEndpoints(): AssetEndpointMCPServer[] {
  return mcpCatalogServers.map((server) => {
    const path = slugToPath[server.slug] ?? server.slug.replace(/-mcp-server$/, '').replace(/^mcp-/, '');
    const streamableEndpoint = `${baseUrl}/${path}/stream`;
    const status = server.status === 'available' ? 'Available' : 'Unavailable';
    const statusColor = server.status === 'available' ? '#3E8635' : '#C9190B';
    return {
      id: String(server.id),
      name: `${server.name} MCP Server`,
      status,
      statusColor,
      version: server.version,
      description: server.description,
      logo: server.logo,
      slug: server.slug,
      streamableEndpoint,
      streamableToken: tokenBySlug[server.slug],
    };
  });
}
