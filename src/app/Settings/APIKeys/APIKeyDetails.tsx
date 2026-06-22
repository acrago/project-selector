import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Content,
  ContentVariants,
  PageBreadcrumb,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { getAPIKeyById } from './mockData';
import { APIKeyDetailsTab } from './components/APIKeyDetailsTab';
import { APIKeyAssetsTab } from './components/APIKeyAssetsTab';
import { APIKeyMetricsTab } from './components/APIKeyMetricsTab';
import { APIKeyPoliciesTab } from './components/APIKeyPoliciesTab';
import { APIKeySettingsTab } from './components/APIKeySettingsTab';
import { APIKeyUsageTab } from './components/APIKeyUsageTab';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { APIKeyDetailsV34 } from './APIKeyDetailsV34';

type TabKey = 'details' | 'usage' | 'assets' | 'metrics' | 'policies' | 'settings';

const APIKeyDetails: React.FunctionComponent = () => {
  const { apiKeysVariation } = useFeatureFlags();

  if (apiKeysVariation === 'v34') {
    return <APIKeyDetailsV34 />;
  }

  return <APIKeyDetailsCurrent />;
};

const APIKeyDetailsCurrent: React.FunctionComponent = () => {
  const { keyId, tab } = useParams<{ keyId: string; tab?: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<TabKey>((tab as TabKey) || 'details');

  useDocumentTitle('API Key Details');

  const apiKey = keyId ? getAPIKeyById(keyId) : undefined;

  React.useEffect(() => {
    if (tab && ['details', 'usage', 'assets', 'metrics', 'policies', 'settings'].includes(tab)) {
      setActiveTabKey(tab as TabKey);
    }
  }, [tab]);

  const handleTabSelect = (
    _event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    const newTab = tabIndex as TabKey;
    setActiveTabKey(newTab);
    navigate(`/gen-ai-studio/api-keys/${keyId}/${newTab}`, { replace: true });
  };


  if (!apiKey) {
    return (
      <PageSection>
        <Alert variant="danger" title="API Key not found">
          The requested API key could not be found.
        </Alert>
      </PageSection>
    );
  }

  const breadcrumb = (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/gen-ai-studio/api-keys">API keys</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{apiKey.name}</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );

  return (
    <>
      {breadcrumb}
      <PageSection>
        <Content component={ContentVariants.h1}>{apiKey.name}</Content>
      </PageSection>

      <PageSection type="tabs">
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          aria-label="API Key details tabs"
          role="region"
        >
          <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab">
            <APIKeyDetailsTab apiKey={apiKey} />
          </Tab>
          <Tab 
            eventKey="usage" 
            title={<TabTitleText>Usage</TabTitleText>} 
            aria-label="Usage tab"
            isDisabled
          >
            <APIKeyUsageTab keyId={apiKey.id} />
          </Tab>
          <Tab 
            eventKey="assets" 
            title={<TabTitleText>Assets</TabTitleText>} 
            aria-label="Assets tab"
            isDisabled
          >
            <APIKeyAssetsTab apiKey={apiKey} />
          </Tab>
          <Tab 
            eventKey="metrics" 
            title={<TabTitleText>Metrics</TabTitleText>} 
            aria-label="Metrics tab"
            isDisabled
          >
            <APIKeyMetricsTab keyId={apiKey.id} />
          </Tab>
          <Tab 
            eventKey="policies" 
            title={<TabTitleText>Policies</TabTitleText>} 
            aria-label="Policies tab"
            isDisabled
          >
            <APIKeyPoliciesTab keyId={apiKey.id} />
          </Tab>
          <Tab 
            eventKey="settings" 
            title={<TabTitleText>Settings</TabTitleText>} 
            aria-label="Settings tab"
          >
            <APIKeySettingsTab apiKey={apiKey} />
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export { APIKeyDetails };
