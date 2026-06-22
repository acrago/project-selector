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
import { ModelCatalog } from './ModelCatalog';
import { ModelRegistry } from './ModelRegistry';
import { Deployments } from '../Deployments/Deployments';
import { ModelsIcon } from '@app/Home/icons/ModelsIcon';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';

type ModelsTab = 'catalog' | 'registry' | 'deployments';

/** Project options used under AI Hub → Models (catalog, registry, deployments). */
const MODELS_HUB_PROJECT_IDS = ['All projects', 'Project X', 'Project Y'];

const Models: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  
  // Check if catalog/registry is enabled
  const showCatalogRegistry = flags.enableModelCatalogRegistry;
  const usePersistentTabs = flags.persistentTabSelection;
  
  // Determine active tab from URL query parameter or localStorage (if enabled)
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab') as ModelsTab | null;
  const [activeTabKey, setActiveTabKey] = React.useState<ModelsTab>(() => {
    // Priority: URL param > localStorage (if persistent enabled) > default
    if (tabParam) return tabParam;
    if (usePersistentTabs) {
      const stored = localStorage.getItem('ai-hub-models-active-tab') as ModelsTab | null;
      if (stored && (showCatalogRegistry || stored === 'deployments')) return stored;
    }
    return showCatalogRegistry ? 'catalog' : 'deployments';
  });

  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    const newTab = tabIndex as ModelsTab;
    setActiveTabKey(newTab);
    if (usePersistentTabs) {
      localStorage.setItem('ai-hub-models-active-tab', newTab);
    }
    navigate(`/ai-hub/models?tab=${newTab}`, { replace: true });
  };

  // Sync state with URL parameter when present
  React.useEffect(() => {
    if (tabParam && tabParam !== activeTabKey) {
      setActiveTabKey(tabParam);
      if (usePersistentTabs) {
        localStorage.setItem('ai-hub-models-active-tab', tabParam);
      }
    }
  }, [tabParam, activeTabKey, usePersistentTabs]);

  // Default project for /ai-hub/models: Project X. The shared selectedProject may be
  // "AI Platform Team" (global default) or another label from other areas; this hub only offers X/Y.
  React.useEffect(() => {
    if (!MODELS_HUB_PROJECT_IDS.includes(selectedProject)) {
      setSelectedProject('Project X');
    }
  }, [selectedProject, setSelectedProject]);

  return (
    <>
      {/* Page Header and Tabs Section */}
      <PageSection>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          {/* Title Row */}
          <FlexItem>
            <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ModelsIcon withBackground size={32} backgroundColor="#ece6ff" />
              {showCatalogRegistry ? 'Models' : 'Model deployments'}
            </Title>
          </FlexItem>
          
          {/* Tabs - Only show when catalog/registry is enabled */}
          {showCatalogRegistry && (
            <FlexItem>
              <Tabs
                activeKey={activeTabKey}
                onSelect={handleTabClick}
                aria-label="Models tabs"
                id="models-tabs"
              >
                <Tab
                  eventKey="catalog"
                  title={<TabTitleText>Catalog</TabTitleText>}
                  tabContentId="models-catalog-tab"
                  id="models-catalog-tab-button"
                />
                <Tab
                  eventKey="registry"
                  title={<TabTitleText>Registry</TabTitleText>}
                  tabContentId="models-registry-tab"
                  id="models-registry-tab-button"
                />
                <Tab
                  eventKey="deployments"
                  title={<TabTitleText>Deployments</TabTitleText>}
                  tabContentId="models-deployments-tab"
                  id="models-deployments-tab-button"
                />
              </Tabs>
            </FlexItem>
          )}
        </Flex>
      </PageSection>

      {/* Tab Content Section with Description */}
      <PageSection hasBodyWrapper={false} style={{ paddingTop: 0 }}>
        {showCatalogRegistry && activeTabKey === 'catalog' && (
          <p>Discover models provided by Red Hat and other providers that are available for your organization to register, deploy, and customize.</p>
        )}
        {showCatalogRegistry && activeTabKey === 'registry' && (
          <p>Select a model registry to view and manage your registered models. Model registries provide a structured and organized way to store, share, version, deploy, and track models.</p>
        )}
        {activeTabKey === 'deployments' && (
          <p>Manage and view the health and performance of your deployed models.</p>
        )}
        
        {showCatalogRegistry && activeTabKey === 'catalog' && <ModelCatalog isTabContent={true} />}
        {showCatalogRegistry && activeTabKey === 'registry' && <ModelRegistry isTabContent={true} />}
        {activeTabKey === 'deployments' && <Deployments isTabContent={true} />}
      </PageSection>
    </>
  );
};

export { Models };
