import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  PageBreadcrumb,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  Tooltip,
} from '@patternfly/react-core';
import { EllipsisVIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { getSubscriptionById } from './mockData';
import { SubscriptionDetailsTab } from './components/SubscriptionDetailsTab';
import { SubscriptionYamlTab } from './components/SubscriptionYamlTab';
import { Subscription } from './types';

type TabKey = 'details' | 'yaml';

const SubscriptionDetails: React.FunctionComponent = () => {
  const { subscriptionId, tab } = useParams<{ subscriptionId: string; tab?: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<TabKey>((tab as TabKey) || 'details');
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);

  useDocumentTitle('Subscription Details');

  const initialSubscription = subscriptionId ? getSubscriptionById(subscriptionId) : undefined;
  const [subscription, setSubscription] = React.useState(initialSubscription);

  // Update local state when the subscription ID changes
  React.useEffect(() => {
    if (subscriptionId) {
      const sub = getSubscriptionById(subscriptionId);
      setSubscription(sub);
    }
  }, [subscriptionId]);

  // Handler for subscription changes from the details tab
  const handleSubscriptionChange = React.useCallback((updatedSubscription: Subscription) => {
    setSubscription(updatedSubscription);
    // In a real app, you would also persist this change to the backend
    console.log('Subscription updated:', updatedSubscription);
  }, []);

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
    navigate(`/settings/subscriptions/${subscriptionId}/${newTab}`, { replace: true });
  };

  if (!subscription) {
    return (
      <PageSection>
        <Alert variant="danger" title="Subscription not found" id="subscription-not-found-alert">
          The requested subscription could not be found.
        </Alert>
      </PageSection>
    );
  }

  const breadcrumb = (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/settings/subscriptions">Subscriptions</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{subscription.displayName}</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );

  const actionsDropdown = (
    <Dropdown
      isOpen={isActionsOpen}
      onSelect={() => setIsActionsOpen(false)}
      onOpenChange={(isOpen: boolean) => setIsActionsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="Subscription actions"
          variant="plain"
          onClick={() => setIsActionsOpen(!isActionsOpen)}
          isExpanded={isActionsOpen}
          id="subscription-actions-toggle"
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      popperProps={{ position: 'right' }}
    >
      <DropdownList>
        <DropdownItem
          key="edit"
          id="edit-subscription-action"
          onClick={() => {
            navigate(`/settings/subscriptions/${subscriptionId}/edit`);
          }}
        >
          Edit subscription
        </DropdownItem>
        <Divider component="li" key="separator" />
        <DropdownItem
          key="delete"
          onClick={() => console.log('Delete subscription:', subscriptionId)}
        >
          Delete subscription
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  return (
    <>
      {breadcrumb}
      <PageSection>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
          <FlexItem>
            <Content component={ContentVariants.h1} id="subscription-details-title">
              {subscription.displayName}
            </Content>
            {subscription.description && (
              <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: '0.25rem' }}>
                {subscription.description}
              </Content>
            )}
          </FlexItem>
          <FlexItem>
            {actionsDropdown}
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection type="tabs">
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          aria-label="Subscription details tabs"
          role="region"
          id="subscription-details-tabs"
        >
          <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab">
            <SubscriptionDetailsTab subscription={subscription} onSubscriptionChange={handleSubscriptionChange} />
          </Tab>
          <Tab
            eventKey="yaml"
            title={
              <Tooltip content="This tab is a stretch goal and may not make it for 3.4" id="yaml-tab-stretch-tooltip">
                <TabTitleText>
                  <span style={{ color: '#F32BC4' }}>
                    YAML <InfoCircleIcon style={{ marginLeft: '0.25rem', fontSize: '0.85em' }} />
                  </span>
                </TabTitleText>
              </Tooltip>
            }
            aria-label="YAML tab"
          >
            <SubscriptionYamlTab subscription={subscription} onSubscriptionChange={handleSubscriptionChange} />
          </Tab>
        </Tabs>
      </PageSection>
    </>
  );
};

export { SubscriptionDetails };
