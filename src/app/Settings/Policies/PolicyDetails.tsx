import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
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
import { getPolicyById } from './mockData';
import { PolicyDetailsTab } from './components/PolicyDetailsTab';
import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';

type TabKey = 'details' | 'yaml';

const PolicyDetails: React.FunctionComponent = () => {
  const { policyId, tab } = useParams<{ policyId: string; tab?: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<TabKey>((tab as TabKey) || 'details');

  useDocumentTitle('Policy Details');

  const policy = policyId ? getPolicyById(policyId) : undefined;

  React.useEffect(() => {
    if (tab && ['details', 'yaml'].includes(tab)) {
      setActiveTabKey(tab as TabKey);
    }
  }, [tab]);

  const handleTabSelect = (
    _event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    const newTab = tabIndex as TabKey;
    setActiveTabKey(newTab);
    navigate(`/settings/policies/${policyId}/${newTab}`, { replace: true });
  };

  if (!policy) {
    return (
      <PageSection>
        <Alert variant="danger" title="Policy not found">
          The requested policy could not be found.
        </Alert>
      </PageSection>
    );
  }

  const breadcrumb = (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/settings/policies">Policies</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{policy.name}</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );

  return (
    <>
      {breadcrumb}
      <PageSection>
        <Content component={ContentVariants.h1}>{policy.name}</Content>
        <Badge id={`policy-status-badge-${policy.id}`} isRead={policy.status === 'Inactive'}>
          {policy.status}
        </Badge>
      </PageSection>

      <PageSection type="tabs">
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          aria-label="Policy details tabs"
          role="region"
          id="policy-details-tabs"
        >
          <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab">
            <PolicyDetailsTab policy={policy} />
          </Tab>
          <Tab eventKey="yaml" title={<TabTitleText>YAML</TabTitleText>} aria-label="YAML tab">
            <PageSection>
              <CodeBlock id="policy-yaml-code">
                <CodeBlockCode>
                  {policy.yaml || '# No YAML available for this policy'}
                </CodeBlockCode>
              </CodeBlock>
            </PageSection>
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export { PolicyDetails };


