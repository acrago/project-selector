import type { MCPDeployment, MCPServer } from './types';

// Import logos from src/assets/mcp-servers/ (raw-loader returns SVG content as string)
import ServiceNowLogoRaw from '@app/assets/mcp-servers/ServiceNow.svg';
import SplunkLogoRaw from '@app/assets/mcp-servers/Splunk.svg';
import DynatraceLogoRaw from '@app/assets/mcp-servers/dynatrace.svg';
import GitHubLogoRaw from '@app/assets/mcp-servers/github.svg';
import KubernetesLogoRaw from '@app/assets/mcp-servers/Kubernetes.svg';
import PostgreSQLLogoRaw from '@app/assets/mcp-servers/Postgresql.svg';
import SalesforceLogoRaw from '@app/assets/mcp-servers/Salesforce.svg';
import SlackLogoRaw from '@app/assets/mcp-servers/Slack.svg';
import ZapierLogoRaw from '@app/assets/mcp-servers/zapier.svg';

// Convert raw SVG content to data URI for use in img src
const toDataUri = (svgContent: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svgContent)}`;

// Logo mapping by slug
export const mcpCatalogLogos: Record<string, string> = {
  'servicenow': toDataUri(ServiceNowLogoRaw),
  'splunk': toDataUri(SplunkLogoRaw),
  'dynatrace': toDataUri(DynatraceLogoRaw),
  'github': toDataUri(GitHubLogoRaw),
  'kubernetes': toDataUri(KubernetesLogoRaw),
  'postgresql': toDataUri(PostgreSQLLogoRaw),
  'salesforce': toDataUri(SalesforceLogoRaw),
  'slack': toDataUri(SlackLogoRaw),
  'zapier': toDataUri(ZapierLogoRaw),
};

// Mock MCP Servers data
export const mcpServers: MCPServer[] = [
  {
    id: 1,
    slug: 'servicenow',
    name: 'ServiceNow MCP Server',
    provider: 'echelon-ai-labs',
    description: 'Open-source repo and certified Store app; AI can query, create, or update incidents, change requests, catalog items, etc., with full OAuth support.',
    deploymentMode: 'Remote',
    labels: ['Verified source', 'Red Hat partner', 'SAST'],
    license: 'Apache-2.0',
    version: '2.1.0',
    publishedDate: 'Dec 15, 2024',
    modifiedDate: 'Jan 10, 2025',
    location: 'us-east-1',
    sourceUrl: 'https://github.com/echelon-ai-labs/servicenow-mcp-server',
    transportType: 'SSE',
    githubOwner: 'echelon-ai-labs',
    githubRepo: 'servicenow-mcp-server',
    readmeFallback: `# ServiceNow MCP Server

A Model Completion Protocol (MCP) server implementation for ServiceNow, allowing Claude to interact with ServiceNow instances.

## Overview

This project implements an MCP server that enables Claude to connect to ServiceNow instances, retrieve data, and perform actions through the ServiceNow API. It serves as a bridge between Claude and ServiceNow, allowing for seamless integration.

## Features

- Connect to ServiceNow instances using various authentication methods (Basic, OAuth, API Key)
- Query ServiceNow records and tables
- Create, update, and delete ServiceNow records
- Execute ServiceNow scripts and workflows
- Access and query the ServiceNow Service Catalog
- Analyze and optimize the ServiceNow Service Catalog
- Debug mode for troubleshooting
- Support for both stdio and Server-Sent Events (SSE) communication

## Installation

### Prerequisites

- Python 3.11 or higher
- A ServiceNow instance with appropriate access credentials

### Setup

1. Clone this repository:

\`\`\`bash
git clone https://github.com/echelon-ai-labs/servicenow-mcp.git
cd servicenow-mcp
\`\`\`

2. Create a virtual environment and install the package:

\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
pip install -e .
\`\`\`

3. Create a \`.env\` file with your ServiceNow credentials:

\`\`\`bash
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
SERVICENOW_AUTH_TYPE=basic  # or oauth, api_key
\`\`\`

## Usage

### Standard (stdio) Mode

To start the MCP server:

\`\`\`bash
python -m servicenow_mcp.cli
\`\`\`

Or with environment variables:

\`\`\`bash
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com SERVICENOW_USERNAME=your-username SERVICENOW_PASSWORD=your-password python -m servicenow_mcp.cli
\`\`\`

### Server-Sent Events (SSE) Mode

The ServiceNow MCP server can also run as a web server using Server-Sent Events (SSE) for communication, which allows for more flexible integration options.

#### Starting the SSE Server

You can start the SSE server using the provided CLI:

\`\`\`bash
python -m servicenow_mcp.cli --sse --port 8000
\`\`\`

This will start the server on http://localhost:8000 with SSE support enabled.
`,
    tools: [
      {
        name: 'create_incident',
        description: 'Create a new incident ticket',
        readOnly: false,
        parameters: [
          { name: 'short_description', type: 'string', required: true, description: 'Brief summary of the incident' },
          { name: 'description', type: 'string', required: false, description: 'Detailed description of the incident' },
          { name: 'priority', type: 'string', required: false, description: 'Priority level (1-5)' },
          { name: 'urgency', type: 'string', required: false, description: 'Urgency level (1-3)' },
          { name: 'assignment_group', type: 'string', required: false, description: 'Assignment group name or sys_id' },
        ],
      },
      {
        name: 'update_incident',
        description: 'Update an existing incident',
        readOnly: false,
        parameters: [
          { name: 'incident_id', type: 'string', required: true, description: 'Incident number or sys_id' },
          { name: 'state', type: 'string', required: false, description: 'New incident state' },
          { name: 'work_notes', type: 'string', required: false, description: 'Work notes to add' },
          { name: 'resolution_notes', type: 'string', required: false, description: 'Resolution notes' },
        ],
      },
      {
        name: 'create_change_request',
        description: 'Create a new change request',
        readOnly: false,
        parameters: [
          { name: 'short_description', type: 'string', required: true, description: 'Brief summary of the change' },
          { name: 'description', type: 'string', required: false, description: 'Detailed description of the change' },
          { name: 'justification', type: 'string', required: false, description: 'Business justification' },
          { name: 'risk', type: 'string', required: false, description: 'Risk assessment' },
          { name: 'impact', type: 'string', required: false, description: 'Impact level' },
        ],
      },
      {
        name: 'request_catalog_item',
        description: 'Request a service catalog item',
        readOnly: false,
        parameters: [
          { name: 'catalog_item_id', type: 'string', required: true, description: 'Catalog item sys_id' },
          { name: 'variables', type: 'object', required: false, description: 'Variable values for the request' },
          { name: 'special_instructions', type: 'string', required: false, description: 'Special instructions' },
        ],
      },
      {
        name: 'search_incidents',
        description: 'Search for existing incidents',
        readOnly: true,
        parameters: [
          { name: 'query', type: 'string', required: false, description: 'Search query text' },
          { name: 'state', type: 'string', required: false, description: 'Incident state filter' },
          { name: 'assigned_to', type: 'string', required: false, description: 'Assigned user filter' },
          { name: 'limit', type: 'number', required: false, description: 'Maximum number of results' },
        ],
      },
      {
        name: 'get_catalog_items',
        description: 'Get available service catalog items',
        readOnly: true,
        parameters: [
          { name: 'category', type: 'string', required: false, description: 'Catalog category filter' },
          { name: 'keyword', type: 'string', required: false, description: 'Search keyword' },
        ],
      },
      {
        name: 'get_user_tickets',
        description: 'Get tickets assigned to or opened by a user',
        readOnly: true,
        parameters: [
          { name: 'user_id', type: 'string', required: false, description: 'User sys_id or username' },
          { name: 'ticket_type', type: 'string', required: false, description: 'Type of tickets to retrieve' },
        ],
      },
      {
        name: 'get_knowledge_articles',
        description: 'Search knowledge base articles',
        readOnly: true,
        parameters: [
          { name: 'query', type: 'string', required: false, description: 'Search query' },
          { name: 'category', type: 'string', required: false, description: 'Article category' },
        ],
      },
      {
        name: 'get_cmdb_ci',
        description: 'Get configuration item details from CMDB',
        readOnly: true,
        parameters: [
          { name: 'ci_id', type: 'string', required: false, description: 'Configuration item sys_id' },
          { name: 'name', type: 'string', required: false, description: 'CI name to search' },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'splunk',
    name: 'Splunk MCP Server',
    provider: 'livehybrid',
    description: 'FastMCP-based tool that runs SPL queries, returns logs/metrics, and auto-scrubs sensitive data. Enables an AI SRE bot to explain spikes.',
    deploymentMode: 'Remote',
    labels: ['Verified source', 'SAST'],
    license: 'MIT',
    version: '1.3.1',
    publishedDate: 'Nov 20, 2024',
    modifiedDate: 'Jan 14, 2025',
    location: 'us-west-2',
    sourceUrl: 'https://github.com/livehybrid/splunk-mcp-server',
    transportType: 'SSE',
    githubOwner: 'livehybrid',
    githubRepo: 'splunk-mcp-server',
    readmeFallback: '# Splunk MCP Server\n\nThis server allows AI agents to query Splunk for logs, metrics, and security events.',
    tools: [
      {
        name: 'run_spl_query',
        description: 'Execute an SPL query against Splunk',
        readOnly: true,
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'SPL query string' },
          { name: 'earliest', type: 'string', required: false, description: 'Earliest time boundary' },
          { name: 'latest', type: 'string', required: false, description: 'Latest time boundary' },
        ],
      },
      {
        name: 'get_saved_searches',
        description: 'List saved searches in Splunk',
        readOnly: true,
        parameters: [
          { name: 'app', type: 'string', required: false, description: 'Filter by app context' },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: 'dynatrace',
    name: 'Dynatrace MCP Server',
    provider: 'dynatrace-oss',
    description: 'Official Dynatrace-OSS project exposing DQL queries, problem feeds, and vulnerability data. Gives agents real-time service health.',
    deploymentMode: 'Remote',
    labels: ['Verified source', 'Red Hat partner'],
    license: 'Apache-2.0',
    version: '2.0.4',
    publishedDate: 'Oct 5, 2024',
    modifiedDate: 'Jan 14, 2025',
    location: 'eu-central-1',
    sourceUrl: 'https://github.com/dynatrace-oss/dynatrace-mcp-server',
    transportType: 'SSE',
    githubOwner: 'dynatrace-oss',
    githubRepo: 'dynatrace-mcp-server',
    readmeFallback: '# Dynatrace MCP Server\n\nOfficial Dynatrace OSS MCP server for monitoring and observability queries.',
    tools: [
      {
        name: 'query_dql',
        description: 'Execute a DQL query for metrics and logs',
        readOnly: true,
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'DQL query string' },
          { name: 'timeframe', type: 'string', required: false, description: 'Time range for query' },
        ],
      },
      {
        name: 'get_problems',
        description: 'Retrieve active problems from Dynatrace',
        readOnly: true,
        parameters: [
          { name: 'status', type: 'string', required: false, description: 'Filter by problem status' },
          { name: 'severity', type: 'string', required: false, description: 'Filter by severity level' },
        ],
      },
    ],
  },
  {
    id: 4,
    slug: 'github',
    name: 'GitHub MCP Server',
    provider: 'github',
    description: 'GitHub-maintained server for listing repos, issues, PRs, commits and creating comments/branches. Fuels coding copilots.',
    deploymentMode: 'Remote',
    labels: ['Verified source', 'Read only tools'],
    license: 'MIT',
    version: '1.2.5',
    publishedDate: 'Sep 1, 2024',
    modifiedDate: 'Jan 15, 2025',
    location: 'global',
    sourceUrl: 'https://github.com/github/github-mcp-server',
    transportType: 'SSE',
    githubOwner: 'modelcontextprotocol',
    githubRepo: 'servers',
    readmeFallback: '# GitHub MCP Server\n\nOfficial GitHub MCP server for repository, issue, and PR management.',
    tools: [
      {
        name: 'list_repos',
        description: 'List repositories for a user or organization',
        readOnly: true,
        parameters: [
          { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
          { name: 'type', type: 'string', required: false, description: 'Filter by repo type' },
        ],
      },
      {
        name: 'get_issue',
        description: 'Get details of a specific issue',
        readOnly: true,
        parameters: [
          { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
          { name: 'repo', type: 'string', required: true, description: 'Repository name' },
          { name: 'issue_number', type: 'number', required: true, description: 'Issue number' },
        ],
      },
      {
        name: 'create_issue',
        description: 'Create a new issue in a repository',
        readOnly: false,
        parameters: [
          { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
          { name: 'repo', type: 'string', required: true, description: 'Repository name' },
          { name: 'title', type: 'string', required: true, description: 'Issue title' },
          { name: 'body', type: 'string', required: false, description: 'Issue body' },
        ],
      },
    ],
  },
  {
    id: 5,
    slug: 'kubernetes',
    name: 'Kubernetes MCP Server',
    provider: 'feiskyer',
    description: 'Python-powered server that translates natural language into kubectl actions and provides cluster introspection to agents.',
    deploymentMode: 'Local',
    labels: ['Verified source', 'SAST'],
    license: 'Apache-2.0',
    version: '0.1.11',
    publishedDate: 'Nov 1, 2024',
    modifiedDate: 'Jan 15, 2025',
    location: 'in-cluster',
    sourceUrl: 'https://github.com/feiskyer/mcp-kubernetes-server',
    transportType: 'stdio',
    githubOwner: 'feiskyer',
    githubRepo: 'mcp-kubernetes-server',
    readmeFallback: '# Kubernetes MCP Server\n\nMCP server for Kubernetes cluster management and introspection.',
    tools: [
      {
        name: 'get_pods',
        description: 'List pods in a namespace',
        readOnly: true,
        parameters: [
          { name: 'namespace', type: 'string', required: false, description: 'Kubernetes namespace' },
          { name: 'label_selector', type: 'string', required: false, description: 'Label selector filter' },
        ],
      },
      {
        name: 'describe_resource',
        description: 'Get detailed info about a Kubernetes resource',
        readOnly: true,
        parameters: [
          { name: 'kind', type: 'string', required: true, description: 'Resource kind' },
          { name: 'name', type: 'string', required: true, description: 'Resource name' },
          { name: 'namespace', type: 'string', required: false, description: 'Namespace' },
        ],
      },
      {
        name: 'apply_manifest',
        description: 'Apply a Kubernetes manifest',
        readOnly: false,
        parameters: [
          { name: 'manifest', type: 'object', required: true, description: 'YAML/JSON manifest' },
          { name: 'dry_run', type: 'boolean', required: false, description: 'Dry run mode' },
        ],
      },
    ],
  },
  {
    id: 6,
    slug: 'postgresql',
    name: 'PostgreSQL MCP Server',
    provider: 'modelcontextprotocol',
    description: 'Read-only SQL querying with schema discovery, run in a container or as a Node service. Ideal for healthcare/finance use-cases.',
    deploymentMode: 'Local',
    labels: ['Verified source', 'Read only tools', 'SAST'],
    license: 'MIT',
    version: '1.0.8',
    publishedDate: 'Aug 15, 2024',
    modifiedDate: 'Jan 15, 2025',
    location: 'in-cluster',
    sourceUrl: 'https://github.com/modelcontextprotocol/servers',
    transportType: 'stdio',
    githubOwner: 'modelcontextprotocol',
    githubRepo: 'servers',
    readmeFallback: '# PostgreSQL MCP Server\n\nRead-only PostgreSQL MCP server for safe database querying.',
    tools: [
      {
        name: 'query',
        description: 'Execute a read-only SQL query',
        readOnly: true,
        parameters: [
          { name: 'sql', type: 'string', required: true, description: 'SQL query to execute' },
          { name: 'params', type: 'array', required: false, description: 'Query parameters' },
        ],
      },
      {
        name: 'describe_table',
        description: 'Get schema information for a table',
        readOnly: true,
        parameters: [
          { name: 'table_name', type: 'string', required: true, description: 'Table name' },
          { name: 'schema', type: 'string', required: false, description: 'Schema name' },
        ],
      },
    ],
  },
  {
    id: 7,
    slug: 'salesforce',
    name: 'Salesforce MCP Server',
    provider: 'tsmztech',
    description: 'CLI-installable server that exposes SOQL querying, record CRUD, Apex code access, and schema introspection.',
    deploymentMode: 'Remote',
    labels: ['Verified source', 'SAST'],
    license: 'MIT',
    version: '1.8.3',
    publishedDate: 'Oct 10, 2024',
    modifiedDate: 'Jan 14, 2025',
    location: 'us-east-1',
    sourceUrl: 'https://github.com/tsmztech/salesforce-mcp-server',
    transportType: 'SSE',
    githubOwner: 'tsmztech',
    githubRepo: 'salesforce-mcp-server',
    readmeFallback: '# Salesforce MCP Server\n\nMCP server for Salesforce CRM operations and SOQL queries.',
    tools: [
      {
        name: 'query_soql',
        description: 'Execute a SOQL query',
        readOnly: true,
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'SOQL query string' },
        ],
      },
      {
        name: 'create_record',
        description: 'Create a new Salesforce record',
        readOnly: false,
        parameters: [
          { name: 'object_type', type: 'string', required: true, description: 'Salesforce object type' },
          { name: 'fields', type: 'object', required: true, description: 'Field values' },
        ],
      },
      {
        name: 'update_record',
        description: 'Update an existing Salesforce record',
        readOnly: false,
        parameters: [
          { name: 'object_type', type: 'string', required: true, description: 'Salesforce object type' },
          { name: 'record_id', type: 'string', required: true, description: 'Record ID' },
          { name: 'fields', type: 'object', required: true, description: 'Field values to update' },
        ],
      },
    ],
  },
  {
    id: 8,
    slug: 'slack',
    name: 'Slack MCP Server',
    provider: 'korotovsky',
    description: 'MIT-licensed server that lets AI agents post, read threads, DM users, and trigger Slack workflows; supports stdio + SSE.',
    deploymentMode: 'Remote',
    labels: ['Verified source'],
    license: 'MIT',
    version: '1.4.2',
    publishedDate: 'Sep 20, 2024',
    modifiedDate: 'Jan 15, 2025',
    location: 'global',
    sourceUrl: 'https://github.com/korotovsky/slack-mcp-server',
    transportType: 'SSE',
    githubOwner: 'korotovsky',
    githubRepo: 'slack-mcp-server',
    readmeFallback: '# Slack MCP Server\n\nMCP server for Slack messaging and workflow automation.',
    tools: [
      {
        name: 'send_message',
        description: 'Send a message to a Slack channel',
        readOnly: false,
        parameters: [
          { name: 'channel', type: 'string', required: true, description: 'Channel ID or name' },
          { name: 'text', type: 'string', required: true, description: 'Message text' },
          { name: 'thread_ts', type: 'string', required: false, description: 'Thread timestamp for replies' },
        ],
      },
      {
        name: 'get_channel_history',
        description: 'Get message history from a channel',
        readOnly: true,
        parameters: [
          { name: 'channel', type: 'string', required: true, description: 'Channel ID' },
          { name: 'limit', type: 'number', required: false, description: 'Number of messages' },
        ],
      },
    ],
  },
  {
    id: 9,
    slug: 'zapier',
    name: 'Zapier MCP Server',
    provider: 'zapier',
    description: 'Hosted server that unlocks 7,000+ SaaS actions via Zapier without writing glue code. Swiss-army-knife for quick PoCs.',
    deploymentMode: 'Remote',
    labels: ['Red Hat partner'],
    license: 'Proprietary',
    version: '3.2.1',
    publishedDate: 'Jul 1, 2024',
    modifiedDate: 'Jan 15, 2025',
    location: 'global',
    sourceUrl: 'https://github.com/zapier/zapier-mcp',
    transportType: 'HTTP',
    githubOwner: 'zapier',
    githubRepo: 'zapier-mcp',
    readmeFallback: '# Zapier MCP Server\n\nConnect to 7,000+ apps through Zapier\'s MCP integration.',
    tools: [
      {
        name: 'trigger_zap',
        description: 'Trigger a Zapier Zap',
        readOnly: false,
        parameters: [
          { name: 'zap_id', type: 'string', required: true, description: 'Zap identifier' },
          { name: 'data', type: 'object', required: false, description: 'Data to pass to the Zap' },
        ],
      },
      {
        name: 'list_zaps',
        description: 'List available Zaps',
        readOnly: true,
        parameters: [
          { name: 'folder', type: 'string', required: false, description: 'Filter by folder' },
        ],
      },
    ],
  },
];

// Mock MCP Deployments data
export const mcpDeployments: MCPDeployment[] = [
  {
    id: '1',
    name: 'GitHub MCP - Production',
    project: 'Project X',
    projectType: 'MCP serving enabled',
    servingRuntime: 'MCP Runtime v1.2',
    endpoints: ['https://github-mcp.project-x.apps.cluster.example.com/sse'],
    apiProtocol: 'SSE',
    lastDeployed: 'Today',
    status: 'Active',
  },
  {
    id: '2',
    name: 'ServiceNow MCP - Staging',
    project: 'Project X',
    projectType: 'MCP serving enabled',
    servingRuntime: 'MCP Runtime v1.2',
    endpoints: ['https://servicenow-mcp.project-x.apps.cluster.example.com/sse'],
    apiProtocol: 'SSE',
    lastDeployed: '2 days ago',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Kubernetes MCP - Dev',
    project: 'Project Y',
    projectType: 'MCP serving enabled',
    servingRuntime: 'MCP Runtime v1.1',
    endpoints: ['http://kubernetes-mcp.project-y.svc:8080/sse'],
    apiProtocol: 'SSE',
    lastDeployed: '1 week ago',
    status: 'Stopped',
  },
];
