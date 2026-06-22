import * as React from 'react';

export interface MCPServerVisibility {
  id: string;
  name: string;
  enabled: boolean;
}

interface MCPCatalogContextType {
  mcpServerVisibility: MCPServerVisibility[];
  setMcpServerVisibility: React.Dispatch<React.SetStateAction<MCPServerVisibility[]>>;
  isServerEnabled: (serverId: string) => boolean;
  toggleServerVisibility: (serverId: string) => void;
}

const defaultMcpServers: MCPServerVisibility[] = [
  { id: 'servicenow-mcp-server', name: 'ServiceNow', enabled: true },
  { id: 'splunk-mcp-server', name: 'Splunk', enabled: true },
  { id: 'mcp-kubernetes-server', name: 'Kubernetes', enabled: true },
  { id: 'slack-mcp-server', name: 'Slack', enabled: true },
  { id: 'salesforce-mcp-server', name: 'Salesforce', enabled: true },
  { id: 'dynatrace-mcp-server', name: 'Dynatrace', enabled: true },
  { id: 'github-mcp-server', name: 'GitHub', enabled: true },
  { id: 'postgres-mcp-server', name: 'PostgreSQL', enabled: true },
  { id: 'zapier-mcp-server', name: 'Zapier', enabled: true },
];

const MCPCatalogContext = React.createContext<MCPCatalogContextType>({
  mcpServerVisibility: defaultMcpServers,
  setMcpServerVisibility: () => {},
  isServerEnabled: () => true,
  toggleServerVisibility: () => {},
});

export const MCPCatalogProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const [mcpServerVisibility, setMcpServerVisibility] = React.useState<MCPServerVisibility[]>(defaultMcpServers);

  const isServerEnabled = React.useCallback((serverId: string): boolean => {
    const server = mcpServerVisibility.find(s => s.id === serverId);
    return server?.enabled ?? true;
  }, [mcpServerVisibility]);

  const toggleServerVisibility = React.useCallback((serverId: string) => {
    setMcpServerVisibility(prev =>
      prev.map(server =>
        server.id === serverId ? { ...server, enabled: !server.enabled } : server
      )
    );
  }, []);

  const value = React.useMemo(() => ({
    mcpServerVisibility,
    setMcpServerVisibility,
    isServerEnabled,
    toggleServerVisibility,
  }), [mcpServerVisibility, isServerEnabled, toggleServerVisibility]);

  return (
    <MCPCatalogContext.Provider value={value}>
      {children}
    </MCPCatalogContext.Provider>
  );
};

export const useMCPCatalog = (): MCPCatalogContextType => {
  const context = React.useContext(MCPCatalogContext);
  if (!context) {
    throw new Error('useMCPCatalog must be used within an MCPCatalogProvider');
  }
  return context;
};

export { MCPCatalogContext };
