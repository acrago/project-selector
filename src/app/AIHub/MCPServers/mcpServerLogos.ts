// Import logo files from assets
import ServiceNowLogo from '@app/assets/mcp-servers/ServiceNow.svg';
import SplunkLogo from '@app/assets/mcp-servers/Splunk.svg';
import DynatraceLogo from '@app/assets/mcp-servers/dynatrace.svg';
import GitHubLogo from '@app/assets/mcp-servers/github.svg';
import KubernetesLogo from '@app/assets/mcp-servers/Kubernetes.svg';
import PostgreSQLLogo from '@app/assets/mcp-servers/Postgresql.svg';
import SalesforceLogo from '@app/assets/mcp-servers/Salesforce.svg';
import SlackLogo from '@app/assets/mcp-servers/Slack.svg';
import ZapierLogo from '@app/assets/mcp-servers/zapier.svg';
import MCPLogo from '@app/assets/mcp-servers/MCP.svg';

// Maps server slugs to logo file paths
// All logos are actual SVG files from the assets folder
export const mcpServerLogos: Record<string, string> = {
  'mcp-kubernetes-server': KubernetesLogo,
  'slack-mcp-server': SlackLogo,
  'servicenow-mcp-server': ServiceNowLogo,
  'salesforce-mcp-server': SalesforceLogo,
  'splunk-mcp-server': SplunkLogo,
  'dynatrace-mcp-server': DynatraceLogo,
  'github-mcp-server': GitHubLogo,
  'postgres-mcp-server': PostgreSQLLogo,
  'zapier-mcp-server': ZapierLogo,
  'default': MCPLogo,
};
