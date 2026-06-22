import * as React from 'react';
import {
  Alert,
  Badge,
  Button,
  Content,
  ContentVariants,
  DatePicker,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  PageSection,
  Radio,
} from '@patternfly/react-core';
import { Policy } from '../types';
import { getGroupById, getServiceAccountById, getUserById } from '../mockData';
import { getModelById, mockAPIKeys } from '@app/Settings/APIKeys/mockData';

interface PolicyDetailsTabProps {
  policy: Policy;
}

const PolicyDetailsTab: React.FunctionComponent<PolicyDetailsTabProps> = ({ policy }) => {
  const [isQuotaRenewalModalOpen, setIsQuotaRenewalModalOpen] = React.useState(false);
  const [isOverLimitModalOpen, setIsOverLimitModalOpen] = React.useState(false);
  const [quotaRenewalStartTime, setQuotaRenewalStartTime] = React.useState<'dateCreated' | Date>(
    policy.limits.quotaRenewalSchedule?.startTime || 'dateCreated'
  );
  const [overLimitBehavior, setOverLimitBehavior] = React.useState<'hard' | 'soft'>(
    policy.limits.overLimitBehavior || 'hard'
  );
  const [throttlePercentage, setThrottlePercentage] = React.useState(
    policy.limits.softThrottlePercentage || 50
  );
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Count how many API keys this policy applies to
  const getAppliedKeysCount = (): number => {
    return mockAPIKeys.filter(key => {
      // Check if key's owner matches any target
      const matchesGroups = policy.targets.groups.some(group => 
        key.owner.type === 'Group' && key.owner.name === group
      );
      const matchesUsers = policy.targets.users.some(user => 
        key.owner.type === 'User' && key.owner.name === user
      );
      const matchesServiceAccounts = policy.targets.serviceAccounts.some(sa => 
        key.owner.type === 'Service Account' && key.owner.name === sa
      );
      return matchesGroups || matchesUsers || matchesServiceAccounts;
    }).length;
  };

  const renderAssetsList = (assetIds: string[], getAssetFn: (id: string) => any | undefined, assetType: string) => {
    if (assetIds.includes('all')) {
      return <Badge isRead>All {assetType}</Badge>;
    }
    
    if (assetIds.length === 0) {
      return <span>No {assetType}</span>;
    }

    return (
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
        {assetIds.map(id => {
          const asset = getAssetFn(id);
          return asset ? (
            <FlexItem key={id}>{asset.name}</FlexItem>
          ) : (
            <FlexItem key={id}>{id}</FlexItem>
          );
        })}
      </Flex>
    );
  };

  const renderTargetsList = (targetIds: string[], getTargetFn: (id: string) => any | undefined, targetType: string) => {
    if (targetIds.length === 0) {
      return <span>No {targetType}</span>;
    }

    return (
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
        {targetIds.map(id => {
          const target = getTargetFn(id);
          return target ? (
            <FlexItem key={id}>{target.name}</FlexItem>
          ) : (
            <FlexItem key={id}>{id}</FlexItem>
          );
        })}
      </Flex>
    );
  };

  const renderLimits = () => {
    const hasLimits = policy.limits.tokenLimit || policy.limits.rateLimit || policy.limits.timeLimit;
    
    if (!hasLimits) {
      return <span>No limits configured</span>;
    }

    return (
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
        {policy.limits.tokenLimit && (
          <FlexItem>
            <strong>Token limit:</strong> {policy.limits.tokenLimit.amount.toLocaleString()} tokens per {policy.limits.tokenLimit.period}
          </FlexItem>
        )}
        {policy.limits.rateLimit && (
          <FlexItem>
            <strong>Rate limit:</strong> {policy.limits.rateLimit.amount.toLocaleString()} requests per {policy.limits.rateLimit.period}
          </FlexItem>
        )}
        {policy.limits.timeLimit && (
          <FlexItem>
            <strong>Time limit:</strong> {formatDate(policy.limits.timeLimit.start)} to {formatDate(policy.limits.timeLimit.end)}
          </FlexItem>
        )}
      </Flex>
    );
  };

  const isRateLimitPolicy = policy.type === 'RateLimitPolicy';

  const appliedKeysCount = getAppliedKeysCount();

  return (
    <PageSection>
      {policy.gitSource && (
        <Alert 
          variant="info" 
          isInline 
          title="This policy is managed in git"
          id="policy-git-managed-alert"
          style={{ marginBottom: '1rem' }}
        >
          This policy is managed in git. To make changes, please edit the policy in the{' '}
          <a href={policy.gitSource} target="_blank" rel="noopener noreferrer">
            Git source
          </a>{' '}
          because editing is disabled in-Console.
        </Alert>
      )}

      <Content component={ContentVariants.h2} id="policy-details-heading" style={{ marginTop: '1rem' }}>
        Policy details
      </Content>
      <DescriptionList columnModifier={{ default: '2Col' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>Name</DescriptionListTerm>
          <DescriptionListDescription>{policy.name}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Type</DescriptionListTerm>
          <DescriptionListDescription>
            <Badge id="policy-type-badge" isRead>{policy.type}</Badge>
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Description</DescriptionListTerm>
          <DescriptionListDescription>
            {policy.description || 'No description provided'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Status</DescriptionListTerm>
          <DescriptionListDescription>
            <Badge isRead={policy.status === 'Inactive'}>
              {policy.status}
            </Badge>
          </DescriptionListDescription>
        </DescriptionListGroup>

        {policy.gitSource && (
          <DescriptionListGroup>
            <DescriptionListTerm>Git source</DescriptionListTerm>
            <DescriptionListDescription>
              <a href={policy.gitSource} target="_blank" rel="noopener noreferrer" id="git-source-link">
                {policy.gitSource}
              </a>
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {!policy.gitSource && (
          <DescriptionListGroup>
            <DescriptionListTerm>Git source</DescriptionListTerm>
            <DescriptionListDescription>None</DescriptionListDescription>
          </DescriptionListGroup>
        )}

        <DescriptionListGroup>
          <DescriptionListTerm>Applied to keys</DescriptionListTerm>
          <DescriptionListDescription id="applied-keys-count">
            {appliedKeysCount} {appliedKeysCount === 1 ? 'key' : 'keys'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Date created</DescriptionListTerm>
          <DescriptionListDescription>
            {formatDate(policy.dateCreated)}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Created by</DescriptionListTerm>
          <DescriptionListDescription>
            {policy.createdBy}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <Divider style={{ marginTop: '2rem', marginBottom: '2rem' }} />

      {/* Available Assets Section */}
      <Content component={ContentVariants.h2} id="available-assets-heading">
        Available assets
      </Content>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
        These AI asset models are available under this policy.
      </div>
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>Models</DescriptionListTerm>
          <DescriptionListDescription>
            {renderAssetsList(policy.availableAssets.models, getModelById, 'models')}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <Divider style={{ marginTop: '2rem', marginBottom: '2rem' }} />

      {/* Limits Section */}
      <Content component={ContentVariants.h2} id="limits-heading">
        Limits
      </Content>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
        These limits apply to all API keys targeted by this policy.
      </div>
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>Configured limits</DescriptionListTerm>
          <DescriptionListDescription>
            {renderLimits()}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {isRateLimitPolicy && policy.limits.quotaRenewalSchedule && (
          <DescriptionListGroup>
            <DescriptionListTerm>Quota renewal schedule</DescriptionListTerm>
            <DescriptionListDescription>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span id="quota-renewal-schedule">
                  {policy.limits.quotaRenewalSchedule.startTime === 'dateCreated' 
                    ? 'Starts from date created' 
                    : `Starts ${formatDate(policy.limits.quotaRenewalSchedule.startTime as Date)}`}
                </span>
                <Button variant="link" isInline onClick={() => setIsQuotaRenewalModalOpen(true)} id="edit-quota-renewal-button">
                  Edit
                </Button>
              </div>
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {isRateLimitPolicy && policy.limits.overLimitBehavior && (
          <DescriptionListGroup>
            <DescriptionListTerm>Over-limit behavior</DescriptionListTerm>
            <DescriptionListDescription>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span id="over-limit-behavior">
                  {policy.limits.overLimitBehavior === 'hard' 
                    ? 'Hard (No additional tokens allowed)' 
                    : `Soft (Throttled to ${policy.limits.softThrottlePercentage}% of normal rate)`}
                </span>
                <Button variant="link" isInline onClick={() => setIsOverLimitModalOpen(true)} id="edit-over-limit-button">
                  Edit
                </Button>
              </div>
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>

      <Divider style={{ marginTop: '2rem', marginBottom: '2rem' }} />

      {/* Targets Section */}
      <Content component={ContentVariants.h2} id="targets-heading">
        Targets
      </Content>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
        This policy applies to the following groups, users, and service accounts.
      </div>
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>Groups</DescriptionListTerm>
          <DescriptionListDescription>
            {renderTargetsList(policy.targets.groups, getGroupById, 'groups')}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Users</DescriptionListTerm>
          <DescriptionListDescription>
            {renderTargetsList(policy.targets.users, getUserById, 'users')}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Service Accounts</DescriptionListTerm>
          <DescriptionListDescription>
            {renderTargetsList(policy.targets.serviceAccounts, getServiceAccountById, 'service accounts')}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      {/* Quota Renewal Schedule Modal */}
      <Modal
        variant="small"
        title="Quota renewal schedule"
        isOpen={isQuotaRenewalModalOpen}
        onClose={() => setIsQuotaRenewalModalOpen(false)}
        id="quota-renewal-modal"
      >
        <ModalHeader title="Quota renewal schedule" />
        <ModalBody>
          <Form>
            <FormGroup label="Start time">
              <Radio
                id="renewal-date-created"
                name="renewal-start"
                label="Date created"
                isChecked={quotaRenewalStartTime === 'dateCreated'}
                onChange={() => setQuotaRenewalStartTime('dateCreated')}
              />
              <Radio
                id="renewal-custom-date"
                name="renewal-start"
                label="Custom date"
                isChecked={quotaRenewalStartTime !== 'dateCreated'}
                onChange={() => setQuotaRenewalStartTime(new Date())}
              />
              {quotaRenewalStartTime !== 'dateCreated' && (
                <DatePicker
                  id="renewal-date-picker"
                  style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}
                  value={quotaRenewalStartTime instanceof Date ? quotaRenewalStartTime.toISOString().split('T')[0] : ''}
                  onChange={(_event, value) => {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                      setQuotaRenewalStartTime(date);
                    }
                  }}
                />
              )}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="primary" 
            onClick={() => {
              console.log('Saving quota renewal schedule:', quotaRenewalStartTime);
              setIsQuotaRenewalModalOpen(false);
            }}
            id="save-renewal-button"
          >
            Save
          </Button>
          <Button 
            variant="link" 
            onClick={() => setIsQuotaRenewalModalOpen(false)}
            id="cancel-renewal-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Over-limit Behavior Modal */}
      <Modal
        variant="small"
        title="Over-limit behavior"
        isOpen={isOverLimitModalOpen}
        onClose={() => setIsOverLimitModalOpen(false)}
        id="over-limit-modal"
      >
        <ModalHeader title="Over-limit behavior" />
        <ModalBody>
          <Form>
            <FormGroup label="Behavior when limit is exceeded">
              <Radio
                id="behavior-hard"
                name="over-limit-behavior"
                label="Hard"
                description="Do not allow any more tokens when limit is reached"
                isChecked={overLimitBehavior === 'hard'}
                onChange={() => setOverLimitBehavior('hard')}
              />
              <Radio
                id="behavior-soft"
                name="over-limit-behavior"
                label="Soft"
                description="Throttle requests when limit is reached"
                isChecked={overLimitBehavior === 'soft'}
                onChange={() => setOverLimitBehavior('soft')}
              />
              {overLimitBehavior === 'soft' && (
                <FormGroup label="Throttle percentage" fieldId="throttle-percentage" style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
                  <NumberInput
                    id="throttle-percentage"
                    value={throttlePercentage}
                    min={1}
                    max={100}
                    onMinus={() => setThrottlePercentage(Math.max(1, throttlePercentage - 10))}
                    onChange={(event) => {
                      const value = Number((event.target as HTMLInputElement).value);
                      if (!isNaN(value) && value >= 1 && value <= 100) {
                        setThrottlePercentage(value);
                      }
                    }}
                    onPlus={() => setThrottlePercentage(Math.min(100, throttlePercentage + 10))}
                    inputName="throttle"
                    inputAriaLabel="Throttle percentage"
                    minusBtnAriaLabel="Minus"
                    plusBtnAriaLabel="Plus"
                    unit="%"
                    widthChars={4}
                  />
                </FormGroup>
              )}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="primary" 
            onClick={() => {
              console.log('Saving over-limit behavior:', { overLimitBehavior, throttlePercentage });
              setIsOverLimitModalOpen(false);
            }}
            id="save-behavior-button"
          >
            Save
          </Button>
          <Button 
            variant="link" 
            onClick={() => setIsOverLimitModalOpen(false)}
            id="cancel-behavior-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </PageSection>
  );
};

export { PolicyDetailsTab };


