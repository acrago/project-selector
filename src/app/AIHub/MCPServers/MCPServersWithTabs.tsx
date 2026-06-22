import * as React from 'react';
import {
  Flex,
  FlexItem,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from '@patternfly/react-core';
import { useLocation, useNavigate } from 'react-router-dom';
import { MCPCatalog } from './MCPCatalog';
import { MCPDeployments } from './MCPDeployments';
import { McpServersIcon } from '@app/Home/icons/McpServersIcon';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';

type MCPServersTab = 'catalog' | 'deployments';

const MCPServers: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flags } = useFeatureFlags();
  
  const usePersistentTabs = flags.persistentTabSelection;
  
  // Determine active tab from URL query parameter or localStorage (if enabled)
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab') as MCPServersTab | null;
  const [activeTabKey, setActiveTabKey] = React.useState<MCPServersTab>(() => {
    // Priority: URL param > localStorage (if persistent enabled) > default
    if (tabParam) return tabParam;
    if (usePersistentTabs) {
      const stored = localStorage.getItem('ai-hub-mcp-servers-active-tab') as MCPServersTab | null;
      if (stored) return stored;
    }
    return 'catalog';
  });

  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    const newTab = tabIndex as MCPServersTab;
    setActiveTabKey(newTab);
    if (usePersistentTabs) {
      localStorage.setItem('ai-hub-mcp-servers-active-tab', newTab);
    }
    navigate(`/ai-hub/mcp-servers?tab=${newTab}`, { replace: true });
  };

  // Sync state with URL parameter when present
  React.useEffect(() => {
    if (tabParam && tabParam !== activeTabKey) {
      setActiveTabKey(tabParam);
      if (usePersistentTabs) {
        localStorage.setItem('ai-hub-mcp-servers-active-tab', tabParam);
      }
    }
  }, [tabParam, activeTabKey, usePersistentTabs]);

  return (
    <>
      {/* Page Header and Tabs Section */}
      <PageSection>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          {/* Title Row */}
          <FlexItem>
            <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <McpServersIcon withBackground size={32} backgroundColor="#ece6ff" />
              MCP servers
            </Title>
          </FlexItem>
          
          {/* Tabs */}
          <FlexItem>
            <Tabs
              activeKey={activeTabKey}
              onSelect={handleTabClick}
              aria-label="MCP servers tabs"
              id="mcp-servers-tabs"
            >
              <Tab
                eventKey="catalog"
                title={<TabTitleText>Catalog</TabTitleText>}
                tabContentId="mcp-catalog-tab"
                id="mcp-catalog-tab-button"
              />
              <Tab
                eventKey="deployments"
                title={<TabTitleText>Deployments</TabTitleText>}
                tabContentId="mcp-deployments-tab"
                id="mcp-deployments-tab-button"
              />
            </Tabs>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Tab Content Section with Description */}
      <PageSection hasBodyWrapper={false} style={{ paddingTop: 0 }}>
        {activeTabKey === 'catalog' && (
          <p>Discover MCP servers provided by Red Hat certified partners and other providers that are available for your organization.</p>
        )}
        {activeTabKey === 'deployments' && (
          <p>Manage and view the health and performance of your deployed MCP servers.</p>
        )}
        
        {activeTabKey === 'catalog' && <MCPCatalog isTabContent={true} />}
        {activeTabKey === 'deployments' && <MCPDeployments isTabContent={true} />}
      </PageSection>
    </>
  );
};

export { MCPServers };
