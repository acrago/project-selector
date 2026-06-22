// MCP Server types for the AI Hub MCP Catalog

export interface MCPServerTool {
  name: string;
  description: string;
  readOnly: boolean;
  parameters: MCPToolParameter[];
}

export interface MCPToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
}

export interface MCPServer {
  id: number;
  slug: string;
  name: string;
  provider: string;
  description: string;
  deploymentMode: 'Remote' | 'Local';
  labels: string[];
  license: string;
  version: string;
  publishedDate: string;
  modifiedDate: string;
  location: string;
  sourceUrl: string;
  transportType: 'SSE' | 'stdio' | 'HTTP';
  tools: MCPServerTool[];
  // GitHub info for README fetching
  githubOwner: string;
  githubRepo: string;
  readmeFallback: string;
}

export interface MCPDeployment {
  id: string;
  name: string;
  project: string;
  projectType: string;
  servingRuntime: string;
  endpoints: string[];
  apiProtocol: 'SSE' | 'REST';
  lastDeployed: string;
  status: 'Active' | 'Failed' | 'Stopped' | 'Deploying';
}
