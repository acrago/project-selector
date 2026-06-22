import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  AlertVariant,
  Badge,
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Pagination,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Tab,
  TabTitleText,
  Tabs,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import ReactECharts from 'echarts-for-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Chart, ChartArea, ChartAxis, ChartBar, ChartDonutUtilization, ChartGroup, ChartLegend, ChartLine, ChartPie, ChartStack, ChartVoronoiContainer } from '@patternfly/react-charts/victory';
import {
  ChartBarIcon,
  CheckCircleIcon,
  CubeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  FilterIcon,
  KeyIcon,
  OutlinedClockIcon,
  ServerIcon,
  TimesCircleIcon,
} from '@patternfly/react-icons';
import { useUserProfile } from '@app/utils/UserProfileContext';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';

// ============================================================================
// TYPES
// ============================================================================

type Priority = 'critical' | 'standard' | 'besteffort';

interface SubscriptionModel {
  name: string;
  description: string;
  project: string;
  tokenLimits: { per24Hour: number; perMinute: number };
  requestLimits: { perMinute: number };
}

interface Subscription {
  id: string;
  name: string;
  priority: Priority;
  totalTokens: number;
  usedTokens: number;
  burstTokens: number;
  burstUsed: number;
  tokensPerSecond: number;
  maxTokensPerSecond: number;
  models: string[];
  subscriptionModels: SubscriptionModel[];
  expiresAt?: string;
}

interface APIKey {
  id: string;
  name: string;
  subscriptionId: string;
  subscriptionName: string;
  tokensUsed: number;
  lastUsed: string;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
}

interface UsageBySubscription {
  name: string;
  tokens: number;
  priority: Priority;
}

interface TokensByModel {
  name: string;
  tokens: number;
  percentage: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Enterprise Subscription',
    priority: 'critical',
    totalTokens: 500000,
    usedTokens: 325000,
    burstTokens: 100000,
    burstUsed: 0,
    tokensPerSecond: 350,
    maxTokensPerSecond: 500,
    models: ['granite-3.0-instruct', 'llama-3.1-70b', 'mistral-large'],
    subscriptionModels: [
      { name: 'Granite 3.0 Instruct', description: 'High-performance model for enterprise workloads', project: 'ml-platform', tokenLimits: { per24Hour: 10000, perMinute: 5000 }, requestLimits: { perMinute: 500 } },
      { name: 'Llama 3.1 70B', description: 'Large language model for complex reasoning tasks', project: 'research-team', tokenLimits: { per24Hour: 50000, perMinute: 10000 }, requestLimits: { perMinute: 200 } },
      { name: 'Mistral Large', description: 'Multilingual model for diverse language tasks', project: 'external-providers', tokenLimits: { per24Hour: 25000, perMinute: 4000 }, requestLimits: { perMinute: 300 } },
    ],
    expiresAt: '2026-12-31',
  },
  {
    id: 'sub-2',
    name: 'Standard Subscription',
    priority: 'standard',
    totalTokens: 103030,
    usedTokens: 85000,
    burstTokens: 23000,
    burstUsed: 8000,
    tokensPerSecond: 100,
    maxTokensPerSecond: 750,
    models: ['granite-3.0-instruct', 'claude-3-sonnet'],
    subscriptionModels: [
      { name: 'Granite 3.0 Instruct', description: 'High-performance model for enterprise workloads', project: 'ml-platform', tokenLimits: { per24Hour: 5000, perMinute: 2000 }, requestLimits: { perMinute: 200 } },
      { name: 'Claude 3 Sonnet', description: 'Balanced model for analysis, coding, and creative tasks', project: 'external-providers', tokenLimits: { per24Hour: 1000, perMinute: 2000 }, requestLimits: { perMinute: 100 } },
    ],
    expiresAt: '2026-06-30',
  },
  {
    id: 'sub-3',
    name: 'Research Unlimited',
    priority: 'besteffort',
    totalTokens: 10000,
    usedTokens: 9800,
    burstTokens: 0,
    burstUsed: 0,
    tokensPerSecond: 100,
    maxTokensPerSecond: 100,
    models: ['granite-3.0-instruct'],
    subscriptionModels: [
      { name: 'Granite 3.0 Instruct', description: 'High-performance model for enterprise workloads', project: 'ml-platform', tokenLimits: { per24Hour: 500, perMinute: 200 }, requestLimits: { perMinute: 50 } },
    ],
    expiresAt: '2026-03-31',
  },
];

const mockAPIKeys: APIKey[] = [
  {
    id: 'key-1',
    name: 'production-app-key',
    subscriptionId: 'sub-1',
    subscriptionName: 'Enterprise Subscription',
    tokensUsed: 245000,
    lastUsed: '2026-01-27T10:30:00Z',
    status: 'active',
    createdAt: '2025-06-15T09:00:00Z',
  },
  {
    id: 'key-2',
    name: 'staging-app-key',
    subscriptionId: 'sub-1',
    subscriptionName: 'Enterprise Subscription',
    tokensUsed: 80000,
    lastUsed: '2026-01-27T09:15:00Z',
    status: 'active',
    createdAt: '2025-08-20T14:00:00Z',
  },
  {
    id: 'key-3',
    name: 'dev-testing-key',
    subscriptionId: 'sub-2',
    subscriptionName: 'Standard Subscription',
    tokensUsed: 65000,
    lastUsed: '2026-01-26T16:45:00Z',
    status: 'active',
    createdAt: '2025-09-10T11:00:00Z',
  },
  {
    id: 'key-4',
    name: 'ci-cd-pipeline-key',
    subscriptionId: 'sub-2',
    subscriptionName: 'Standard Subscription',
    tokensUsed: 20000,
    lastUsed: '2026-01-27T08:00:00Z',
    status: 'active',
    createdAt: '2025-10-05T10:00:00Z',
  },
  {
    id: 'key-5',
    name: 'personal-dev-key',
    subscriptionId: 'sub-3',
    subscriptionName: 'Research Unlimited',
    tokensUsed: 9800,
    lastUsed: '2026-01-27T11:00:00Z',
    status: 'active',
    createdAt: '2025-11-01T08:00:00Z',
  },
  {
    id: 'key-6',
    name: 'old-test-key',
    subscriptionId: 'sub-2',
    subscriptionName: 'Standard Subscription',
    tokensUsed: 1500,
    lastUsed: '2025-12-15T12:00:00Z',
    status: 'expired',
    createdAt: '2025-03-01T09:00:00Z',
  },
];

const mockUsageBySubscription: UsageBySubscription[] = [
  { name: 'Enterprise Subscription', tokens: 325000, priority: 'critical' },
  { name: 'Standard Subscription', tokens: 97000, priority: 'standard' },
  { name: 'Research Unlimited', tokens: 9800, priority: 'besteffort' },
];

const mockTokensByModel: TokensByModel[] = [
  { name: 'granite-3.0-instruct', tokens: 215000, percentage: 49.8 },
  { name: 'llama-3.1-70b', tokens: 125000, percentage: 28.9 },
  { name: 'mistral-large', tokens: 65000, percentage: 15.0 },
  { name: 'llama-3.1-8b', tokens: 26800, percentage: 6.2 },
];

// ============================================================================
// CLUSTER TAB MOCK DATA
// ============================================================================

const modelDeploymentData = [
  {
    deployment: 'mistral-7b-instruct-v2',
    project: 'KonText PTE',
    runtime: 'vLLM',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA A100 40GB',
    gpu: '50%',
    cpu: '67%',
    status: 'Running'
  },
  {
    deployment: 'stable-diffusion-xl-beta',
    project: 'AI Research',
    runtime: 'KServer',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA A100 40GB',
    gpu: '43%',
    cpu: '43%',
    status: 'Running'
  },
  {
    deployment: 'llama-70b-chat-v4',
    project: 'ML Production',
    runtime: 'Bind',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA A100 80GB',
    gpu: '100%',
    cpu: '67%',
    status: 'Scaling'
  },
  {
    deployment: 'mistral-7b-instruct-v2',
    project: 'AI Research',
    runtime: 'vLLM',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA V100 32GB',
    gpu: '100%',
    cpu: '86%',
    status: 'Failed'
  },
  {
    deployment: 'mistral-7b-instruct-v2',
    project: 'ML Production',
    runtime: 'vLLM',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA V100 32GB',
    gpu: '100%',
    cpu: '86%',
    status: 'Degraded'
  },
  {
    deployment: 'codellama-34b-instruct',
    project: 'KonText PTE',
    runtime: 'vLLM',
    requests: '156240',
    latency: '245.78',
    errorRate: '2.15%',
    hardwareProfile: 'NVIDIA A100 40GB',
    gpu: '75%',
    cpu: '55%',
    status: 'Running'
  },
  {
    deployment: 'whisper-large-v3',
    project: 'AI Research',
    runtime: 'KServer',
    requests: '89523',
    latency: '156.34',
    errorRate: '1.23%',
    hardwareProfile: 'NVIDIA T4 16GB',
    gpu: '62%',
    cpu: '48%',
    status: 'Running'
  },
  {
    deployment: 'falcon-180b',
    project: 'ML Production',
    runtime: 'vLLM',
    requests: '523641',
    latency: '312.45',
    errorRate: '4.56%',
    hardwareProfile: 'NVIDIA A100 80GB',
    gpu: '95%',
    cpu: '82%',
    status: 'Running'
  },
];

// ============================================================================
// QUOTAS & KEYS TAB COMPONENT
// ============================================================================

const QuotasAndKeysTab: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardVariation } = useFeatureFlags();

  const createGaugeOption = (subscription: typeof mockSubscriptions[0]) => {
    const percent = (subscription.usedTokens / subscription.totalTokens) * 100;
    let gaugeColor = '#4CB140'; // green
    if (percent >= 90) gaugeColor = '#C9190B'; // red
    else if (percent >= 70) gaugeColor = '#F0AB00'; // yellow

    return {
      tooltip: {
        formatter: `<strong>${subscription.name}</strong><br/>
          Usage: ${subscription.usedTokens.toLocaleString()} / ${subscription.totalTokens.toLocaleString()} tokens<br/>
          Throughput: ${subscription.tokensPerSecond} / ${subscription.maxTokensPerSecond} tok/s`,
      },
      series: [
        {
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          splitNumber: 5,
          radius: '90%',
          center: ['50%', '55%'],
          itemStyle: {
            color: gaugeColor,
          },
          progress: {
            show: true,
            roundCap: true,
            width: 14,
          },
          pointer: {
            show: false,
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 14,
              color: [[1, 'rgba(180, 180, 180, 0.2)']],
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          title: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            fontSize: 24,
            fontWeight: 'bold',
            formatter: `${percent.toFixed(0)}%`,
            offsetCenter: [0, '-10%'],
            color: gaugeColor,
          },
          data: [{ value: percent }],
        },
      ],
    };
  };

  if (dashboardVariation === 'v3-empty' || mockSubscriptions.length === 0) {
    return (
      <EmptyState titleText="No subscriptions" id="subscriptions-empty-state">
        <EmptyStateBody>
          No subscriptions have been created yet. Create a subscription to start managing token access for your models.
        </EmptyStateBody>
        <Button variant="primary" onClick={() => navigate('/settings/subscriptions')} id="create-subscription-empty-btn">
          Go to Subscriptions
        </Button>
      </EmptyState>
    );
  }

  if (dashboardVariation === 'v4-table') {
    return (
      <Grid hasGutter>
        <GridItem span={12}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Title headingLevel="h2" size="lg" id="subscriptions-title">
                Subscriptions
              </Title>
            </FlexItem>
            <FlexItem>
              <Button
                variant="link"
                onClick={() => navigate('/settings/subscriptions')}
                id="manage-subscriptions-button"
              >
                Manage subscriptions
              </Button>
            </FlexItem>
          </Flex>
        </GridItem>
        <GridItem span={12}>
          <Card id="v4-subscriptions-table-card">
            <CardBody>
              <Table aria-label="Subscriptions" id="v4-subscriptions-table">
                <Thead>
                  <Tr>
                    <Th>Subscription</Th>
                    <Th>Usage</Th>
                    <Th>Used</Th>
                    <Th>Remaining</Th>
                    <Th>Throughput</Th>
                    <Th>Models</Th>
                    <Th>Expires</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockSubscriptions.map((subscription) => {
                    const percent = Math.round((subscription.usedTokens / subscription.totalTokens) * 100);
                    const remaining = subscription.totalTokens - subscription.usedTokens;
                    return (
                      <Tr key={subscription.id} id={`v4-sub-usage-row-${subscription.id}`}>
                        <Td dataLabel="Subscription"><Button variant="link" isInline onClick={() => navigate(`/settings/subscriptions/${subscription.id}`)} id={`v4-sub-link-${subscription.id}`}>{subscription.name}</Button></Td>
                        <Td dataLabel="Usage">{percent}%</Td>
                        <Td dataLabel="Used">{subscription.usedTokens.toLocaleString()}</Td>
                        <Td dataLabel="Remaining">{remaining.toLocaleString()}</Td>
                        <Td dataLabel="Throughput">{subscription.tokensPerSecond} / {subscription.maxTokensPerSecond} tok/s</Td>
                        <Td dataLabel="Models">{subscription.models.length}</Td>
                        <Td dataLabel="Expires">{subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : '—'}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    );
  }

  return (
    <Grid hasGutter>
      <GridItem span={12}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h2" size="lg" id="subscriptions-title">
              Subscription Usage
            </Title>
          </FlexItem>
          <FlexItem>
            <Button
              variant="link"
              onClick={() => navigate('/settings/subscriptions')}
              id="manage-subscriptions-button"
            >
              Manage subscriptions
            </Button>
          </FlexItem>
        </Flex>
        <Content component={ContentVariants.p} style={{ marginBottom: '16px' }}>
          Real-time quota status per subscription. Critical subscriptions are never preempted, Standard are preempted after Best Effort.
        </Content>
      </GridItem>

      {/* Gauge Cards Row */}
      {mockSubscriptions.map((subscription) => {
        const priorityColor = subscription.priority === 'critical' ? 'red' : 
                              subscription.priority === 'standard' ? 'blue' : 'grey';
        const priorityLabel = subscription.priority === 'critical' ? 'Critical' : 
                              subscription.priority === 'standard' ? 'Standard' : 'Best Effort';
        
        return (
          <GridItem key={subscription.id} span={12} md={4}>
            <Card id={`gauge-card-${subscription.id}`}>
              <CardHeader>
                <CardTitle>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <strong>{subscription.name}</strong>
                    </FlexItem>
                    <FlexItem>
                      <Label color={priorityColor} isCompact>{priorityLabel}</Label>
                    </FlexItem>
                  </Flex>
                </CardTitle>
              </CardHeader>
              <CardBody style={{ paddingTop: 0 }}>
                {dashboardVariation === 'v2-patternfly' ? (
                  <div id={`pf-gauge-${subscription.id}`}>
                    <ChartDonutUtilization
                      data={{ x: 'Used', y: Math.round((subscription.usedTokens / subscription.totalTokens) * 100) }}
                      height={160}
                      width={250}
                      thresholds={[{ value: 70, color: '#F0AB00' }, { value: 90, color: '#C9190B' }]}
                    />
                  </div>
                ) : (
                  <ReactECharts option={createGaugeOption(subscription)} style={{ height: '160px' }} />
                )}
                <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      {subscription.usedTokens.toLocaleString()} used / {(subscription.totalTokens - subscription.usedTokens).toLocaleString()} remaining
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      Throughput: {subscription.tokensPerSecond} of {subscription.maxTokensPerSecond} tok/s limit
                    </Content>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        );
      })}


    </Grid>
  );
};

// ============================================================================
// CREDITS & USAGE TAB COMPONENT
// ============================================================================

const CreditsAndUsageTab: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const { dashboardVariation } = useFeatureFlags();
  // Filter states
  const [selectedDuration, setSelectedDuration] = useState<string>('7days');
  const [isDurationSelectOpen, setIsDurationSelectOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<string>('all');
  const [isSubscriptionSelectOpen, setIsSubscriptionSelectOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const [apiKeySearchValue, setApiKeySearchValue] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [v4Page, setV4Page] = useState(1);
  const [v4PerPage, setV4PerPage] = useState(10);
  const [tokenGrouping, setTokenGrouping] = useState<'user' | 'subscription' | 'model'>('user');
  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('desc');

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex ?? undefined,
      direction: activeSortDirection,
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
      setV4Page(1);
    },
    columnIndex,
  });

  const durationOptions = [
    { value: '1hour', label: 'Last 1 hour' },
    { value: '24hours', label: 'Last 24 hours' },
    { value: '3days', label: 'Last 3 days' },
    { value: '7days', label: 'Last 7 days' },
    { value: '1month', label: 'Last 1 month' },
  ];

  const subscriptionOptions = [
    { value: 'all', label: 'All subscriptions' },
    ...mockSubscriptions.map(s => ({ value: s.id, label: s.name })),
  ];

  const userOptions = [
    { value: 'all', label: 'All users' },
    { value: 'alice.johnson', label: 'alice.johnson' },
    { value: 'bob.martinez', label: 'bob.martinez' },
    { value: 'carol.chen', label: 'carol.chen' },
    { value: 'david.kim', label: 'david.kim' },
    { value: 'emma.wright', label: 'emma.wright' },
  ];

  const modelOptions = [
    { value: 'all', label: 'All models' },
    { value: 'granite-3.0-instruct', label: 'granite-3.0-instruct' },
    { value: 'llama-3.1-70b', label: 'llama-3.1-70b' },
    { value: 'mistral-large', label: 'mistral-large' },
    { value: 'llama-3.1-8b', label: 'llama-3.1-8b' },
  ];

  const handleDurationSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (typeof value === 'string') {
      setSelectedDuration(value);
      setIsDurationSelectOpen(false);
    }
  };

  const handleSubscriptionSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (typeof value === 'string') {
      setSelectedSubscription(value);
      setIsSubscriptionSelectOpen(false);
    }
  };

  const handleUserSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (typeof value === 'string') {
      setSelectedUser(value);
      setIsUserSelectOpen(false);
    }
  };

  const handleModelSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (typeof value === 'string') {
      setSelectedModel(value);
      setIsModelSelectOpen(false);
    }
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleExportConfirm = () => {
    const rows = [
      ['User', 'Subscription', 'Model', 'Tokens', 'Requests', 'Rate Limited'].join(','),
      ...attributionData.map(r => [r.user, r.subscription, r.model, r.tokens, r.requests, r.rateLimited].join(',')),
    ];
    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usage-export-${selectedDuration}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const filteredAPIKeys = mockAPIKeys.filter(key => 
    apiKeySearchValue === '' || 
    key.name.toLowerCase().includes(apiKeySearchValue.toLowerCase()) ||
    key.subscriptionName.toLowerCase().includes(apiKeySearchValue.toLowerCase())
  );

  const totalBudget = mockSubscriptions.reduce((sum, sub) => sum + sub.totalTokens, 0);
  const usedTokens = mockSubscriptions.reduce((sum, sub) => sum + sub.usedTokens, 0);
  const usagePercent = (usedTokens / totalBudget) * 100;
  const showWarning = usagePercent >= 80;

  const analyticsMetrics = {
    totalRequests: 24417,
    totalTokens: 14300000,
    totalErrors: 73,
    activeUsers: 29,
    successRate: 99.7,
  };

  const attributionData = isAdmin ? [
    { user: 'alice.johnson', subscription: 'Enterprise Subscription', model: 'granite-3.0-instruct', tokens: 4200000, requests: 3100, rateLimited: 12 },
    { user: 'alice.johnson', subscription: 'Enterprise Subscription', model: 'llama-3.1-70b', tokens: 4700000, requests: 3300, rateLimited: 5 },
    { user: 'alice.johnson', subscription: 'Enterprise Subscription', model: 'mistral-large', tokens: 890000, requests: 720, rateLimited: 0 },
    { user: 'bob.martinez', subscription: 'Enterprise Subscription', model: 'granite-3.0-instruct', tokens: 2000000, requests: 5400, rateLimited: 23 },
    { user: 'bob.martinez', subscription: 'Enterprise Subscription', model: 'llama-3.1-70b', tokens: 1500000, requests: 2100, rateLimited: 8 },
    { user: 'bob.martinez', subscription: 'Standard Subscription', model: 'mistral-large', tokens: 450000, requests: 980, rateLimited: 41 },
    { user: 'carol.chen', subscription: 'Standard Subscription', model: 'granite-3.0-instruct', tokens: 730000, requests: 4200, rateLimited: 67 },
    { user: 'carol.chen', subscription: 'Standard Subscription', model: 'mistral-large', tokens: 370000, requests: 3700, rateLimited: 34 },
    { user: 'carol.chen', subscription: 'Standard Subscription', model: 'llama-3.1-8b', tokens: 210000, requests: 1500, rateLimited: 15 },
    { user: 'david.kim', subscription: 'Enterprise Subscription', model: 'llama-3.1-70b', tokens: 1200000, requests: 3000, rateLimited: 2 },
    { user: 'david.kim', subscription: 'Enterprise Subscription', model: 'granite-3.0-instruct', tokens: 980000, requests: 2400, rateLimited: 0 },
    { user: 'emma.wright', subscription: 'Research Unlimited', model: 'granite-3.0-instruct', tokens: 3579000, requests: 51, rateLimited: 189 },
    { user: 'frank.lopez', subscription: 'Enterprise Subscription', model: 'granite-3.0-instruct', tokens: 1850000, requests: 4100, rateLimited: 7 },
    { user: 'frank.lopez', subscription: 'Enterprise Subscription', model: 'llama-3.1-70b', tokens: 2300000, requests: 1800, rateLimited: 3 },
    { user: 'grace.patel', subscription: 'Standard Subscription', model: 'granite-3.0-instruct', tokens: 620000, requests: 3300, rateLimited: 52 },
    { user: 'grace.patel', subscription: 'Standard Subscription', model: 'llama-3.1-8b', tokens: 340000, requests: 2100, rateLimited: 28 },
    { user: 'henry.zhao', subscription: 'Enterprise Subscription', model: 'mistral-large', tokens: 1100000, requests: 1600, rateLimited: 1 },
    { user: 'henry.zhao', subscription: 'Enterprise Subscription', model: 'granite-3.0-instruct', tokens: 760000, requests: 2800, rateLimited: 0 },
    { user: 'iris.nakamura', subscription: 'Research Unlimited', model: 'granite-3.0-instruct', tokens: 95000, requests: 420, rateLimited: 112 },
    { user: 'james.oconnor', subscription: 'Standard Subscription', model: 'granite-3.0-instruct', tokens: 510000, requests: 1900, rateLimited: 19 },
    { user: 'james.oconnor', subscription: 'Standard Subscription', model: 'mistral-large', tokens: 280000, requests: 1200, rateLimited: 9 },
    { user: 'kate.singh', subscription: 'Enterprise Subscription', model: 'llama-3.1-70b', tokens: 3100000, requests: 2600, rateLimited: 4 },
    { user: 'kate.singh', subscription: 'Enterprise Subscription', model: 'granite-3.0-instruct', tokens: 1400000, requests: 3500, rateLimited: 0 },
    { user: 'liam.weber', subscription: 'Research Unlimited', model: 'granite-3.0-instruct', tokens: 180000, requests: 890, rateLimited: 76 },
    { user: 'mia.ross', subscription: 'Standard Subscription', model: 'llama-3.1-8b', tokens: 420000, requests: 1700, rateLimited: 22 },
  ] : [
    { user: 'You (current user)', subscription: 'Enterprise Subscription', model: 'granite-3.0-instruct', tokens: 4200000, requests: 3100, rateLimited: 12 },
    { user: 'You (current user)', subscription: 'Enterprise Subscription', model: 'llama-3.1-70b', tokens: 4700000, requests: 3300, rateLimited: 5 },
  ];

  // Token consumption trends (time-series line chart)
  const tokenTrendsChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Total Tokens', 'Total Requests'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Jan 13', 'Jan 15', 'Jan 17', 'Jan 19', 'Jan 21', 'Jan 23', 'Jan 25', 'Jan 27'],
      axisLabel: { color: '#6a6e73', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6a6e73', formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v }
    },
    series: [
      {
        name: 'Total Tokens',
        type: 'line',
        data: [180000, 850000, 220000, 150000, 320000, 180000, 720000, 550000],
        smooth: true,
        lineStyle: { color: '#06c', width: 2 },
        itemStyle: { color: '#06c' },
        areaStyle: { color: 'rgba(0, 102, 204, 0.1)' }
      },
      {
        name: 'Total Requests',
        type: 'line',
        data: [1800, 8500, 2200, 1500, 3200, 1800, 7200, 5500],
        smooth: true,
        lineStyle: { color: '#4CB140', width: 2 },
        itemStyle: { color: '#4CB140' }
      }
    ]
  };

  // Token consumption by model (stacked area chart)
  const modelTokenTrendsChartOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['granite-3.0-instruct', 'llama-3.1-70b', 'mistral-large', 'llama-3.1-8b'],
      bottom: 0,
      textStyle: { fontSize: 9 }
    },
    grid: { left: '3%', right: '4%', bottom: '20%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Jan 13', 'Jan 15', 'Jan 17', 'Jan 19', 'Jan 21', 'Jan 23', 'Jan 25', 'Jan 27'],
      axisLabel: { color: '#6a6e73', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6a6e73', formatter: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v }
    },
    series: [
      { name: 'granite-3.0-instruct', type: 'line', stack: 'Total', areaStyle: { opacity: 0.6 }, data: [50000, 200000, 80000, 40000, 120000, 60000, 250000, 180000], itemStyle: { color: '#06c' } },
      { name: 'llama-3.1-70b', type: 'line', stack: 'Total', areaStyle: { opacity: 0.6 }, data: [40000, 180000, 50000, 35000, 80000, 40000, 150000, 120000], itemStyle: { color: '#4CB140' } },
      { name: 'mistral-large', type: 'line', stack: 'Total', areaStyle: { opacity: 0.6 }, data: [30000, 150000, 40000, 30000, 60000, 35000, 120000, 90000], itemStyle: { color: '#F0AB00' } },
      { name: 'llama-3.1-8b', type: 'line', stack: 'Total', areaStyle: { opacity: 0.6 }, data: [20000, 120000, 25000, 20000, 40000, 25000, 80000, 60000], itemStyle: { color: '#8B8D8F' } },
    ]
  };

  // Bar chart for Tokens by Subscription
  const barChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: mockUsageBySubscription.map((item) => item.name),
    },
    yAxis: {
      type: 'value',
      name: 'Tokens',
      axisLabel: {
        formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toLocaleString(),
      },
    },
    series: [
      {
        name: 'Tokens Used',
        type: 'bar',
        data: mockUsageBySubscription.map((item) => ({
          value: item.tokens,
          itemStyle: {
            color:
              item.priority === 'critical' ? '#C9190B' : item.priority === 'standard' ? '#0066CC' : '#6A6E73',
          },
        })),
        barWidth: '50%',
      },
    ],
  };

  // Pie chart for Tokens by Model
  const pieChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} tokens ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Tokens by Model',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: mockTokensByModel.map((item, index) => ({
          value: item.tokens,
          name: item.name,
          itemStyle: {
            color: ['#0066CC', '#4CB140', '#F0AB00', '#6A6E73'][index % 4],
          },
        })),
      },
    ],
  };

  // Aggregate tokens per user, stacked by model
  const userModelData = useMemo(() => {
    const users = [...new Set(attributionData.map(r => r.user))];
    const models = [...new Set(attributionData.map(r => r.model))];
    const userTotalMap = new Map<string, number>();
    attributionData.forEach(r => userTotalMap.set(r.user, (userTotalMap.get(r.user) || 0) + r.tokens));
    const sortedUsers = users.sort((a, b) => (userTotalMap.get(a) || 0) - (userTotalMap.get(b) || 0));
    return { users: sortedUsers, models };
  }, [attributionData]);

  const modelColors = ['#06c', '#4CB140', '#F0AB00', '#8B8D8F', '#A18FFF'];

  const userTokensChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: userModelData.models, bottom: 0, textStyle: { fontSize: 10 }, itemGap: 16 },
    grid: { left: '25%', right: '8%', bottom: 50, top: '3%', containLabel: false },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v },
    },
    yAxis: {
      type: 'category',
      data: userModelData.users,
      axisLabel: { fontSize: 10 },
    },
    series: userModelData.models.map((model, idx) => ({
      name: model,
      type: 'bar',
      stack: 'total',
      data: userModelData.users.map(user => {
        const row = attributionData.find(r => r.user === user && r.model === model);
        return row ? row.tokens : 0;
      }),
      itemStyle: { color: modelColors[idx % modelColors.length] },
    })),
  };

  // API key tokens bar chart
  const apiKeySubscriptions = [...new Set(mockAPIKeys.map(k => k.subscriptionName))];
  const sortedAPIKeys = [...mockAPIKeys].sort((a, b) => a.tokensUsed - b.tokensUsed);
  const subscriptionColors: Record<string, string> = {
    'Enterprise Subscription': '#06c',
    'Standard Subscription': '#4CB140',
    'Research Unlimited': '#F0AB00',
  };

  const apiKeyChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: apiKeySubscriptions, bottom: 0, textStyle: { fontSize: 10 }, itemGap: 16 },
    grid: { left: '25%', right: '8%', bottom: 50, top: '3%', containLabel: false },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v },
    },
    yAxis: {
      type: 'category',
      data: sortedAPIKeys.map(k => k.name),
      axisLabel: { fontSize: 10 },
    },
    series: apiKeySubscriptions.map(sub => ({
      name: sub,
      type: 'bar',
      stack: 'total',
      data: sortedAPIKeys.map(k => k.subscriptionName === sub ? k.tokensUsed : 0),
      itemStyle: { color: subscriptionColors[sub] || '#8B8D8F' },
    })),
  };

  if (dashboardVariation === 'v3-empty') {
    return (
      <EmptyState titleText="No usage data" id="usage-empty-state">
        <EmptyStateBody>
          No token consumption data is available yet. Usage data will appear here once models start receiving requests through MaaS subscriptions.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  if (dashboardVariation === 'v4-table') {
    return (
      <Grid hasGutter>
        {/* Box Metrics */}
        <GridItem span={12}>
          <Flex gap={{ default: 'gapMd' }}>
            <FlexItem flex={{ default: 'flex_1' }}>
              <Card isCompact id="v4-total-tokens-card">
                <CardBody>
                  <Content component={ContentVariants.small}>Total Tokens (approx)</Content>
                  <Title headingLevel="h3" size="xl">{(analyticsMetrics.totalTokens / 1000000).toFixed(1)}M</Title>
                </CardBody>
              </Card>
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }}>
              <Card isCompact id="v4-total-requests-card">
                <CardBody>
                  <Content component={ContentVariants.small}>Total Requests</Content>
                  <Title headingLevel="h3" size="xl">{analyticsMetrics.totalRequests.toLocaleString()}</Title>
                </CardBody>
              </Card>
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }}>
              <Card isCompact id="v4-total-errors-card">
                <CardBody>
                  <Content component={ContentVariants.small}>Total Errors</Content>
                  <Title headingLevel="h3" size="xl">{analyticsMetrics.totalErrors}</Title>
                </CardBody>
              </Card>
            </FlexItem>
            {isAdmin && (
              <FlexItem flex={{ default: 'flex_1' }}>
                <Card isCompact id="v4-active-users-card">
                  <CardBody>
                    <Content component={ContentVariants.small}>Active Users</Content>
                    <Title headingLevel="h3" size="xl">{analyticsMetrics.activeUsers}</Title>
                  </CardBody>
                </Card>
              </FlexItem>
            )}
            <FlexItem flex={{ default: 'flex_1' }}>
              <Card isCompact id="v4-success-rate-card">
                <CardBody>
                  <Content component={ContentVariants.small}>Success Rate</Content>
                  <Title headingLevel="h3" size="xl">{analyticsMetrics.successRate}%</Title>
                </CardBody>
              </Card>
            </FlexItem>
          </Flex>
        </GridItem>

        {/* Token Consumption */}
        <GridItem span={12}>
          <Card id="v4-token-consumption-card">
            <CardHeader>
              <CardTitle>Token Consumption</CardTitle>
            </CardHeader>
            <CardBody>
              <Toolbar id="v4-usage-toolbar">
                <ToolbarContent>
                  <ToolbarItem>
                    <ToggleGroup aria-label="Token consumption grouping" id="v4-token-grouping-toggle">
                      <ToggleGroupItem
                        text="By User"
                        buttonId="v4-group-by-user"
                        isSelected={tokenGrouping === 'user'}
                        onChange={() => { setTokenGrouping('user'); setV4Page(1); setActiveSortIndex(null); }}
                      />
                      <ToggleGroupItem
                        text="By Subscription"
                        buttonId="v4-group-by-subscription"
                        isSelected={tokenGrouping === 'subscription'}
                        onChange={() => { setTokenGrouping('subscription'); setV4Page(1); setActiveSortIndex(null); }}
                      />
                      <ToggleGroupItem
                        text="By Model"
                        buttonId="v4-group-by-model"
                        isSelected={tokenGrouping === 'model'}
                        onChange={() => { setTokenGrouping('model'); setV4Page(1); setActiveSortIndex(null); }}
                      />
                    </ToggleGroup>
                  </ToolbarItem>
                  <ToolbarGroup variant="action-group-plain" align={{ default: 'alignEnd' }}>
                    <ToolbarItem>
                      <Select isOpen={isDurationSelectOpen} selected={selectedDuration} onSelect={handleDurationSelect} onOpenChange={setIsDurationSelectOpen}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (<MenuToggle ref={toggleRef} onClick={() => setIsDurationSelectOpen(!isDurationSelectOpen)} isExpanded={isDurationSelectOpen} id="v4-duration-toggle" style={{ minWidth: '160px' }}>{durationOptions.find(o => o.value === selectedDuration)?.label}</MenuToggle>)}>
                        <SelectList>{durationOptions.map(o => <SelectOption key={o.value} value={o.value} isSelected={selectedDuration === o.value}>{o.label}</SelectOption>)}</SelectList>
                      </Select>
                    </ToolbarItem>
                    <ToolbarItem>
                      <Button variant="secondary" onClick={handleExportClick} id="v4-export-btn" icon={<ExternalLinkAltIcon />}>Export CSV</Button>
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarContent>
              </Toolbar>
              {(() => {
                const sortRows = <T extends Record<string, unknown>>(rows: T[], nameKey: string): T[] => {
                  if (activeSortIndex === null) return rows;
                  const sorted = [...rows].sort((a, b) => {
                    const keys = [nameKey, 'tokens', 'requests', 'rateLimited'];
                    const key = keys[activeSortIndex];
                    const aVal = a[key];
                    const bVal = b[key];
                    if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal);
                    return (aVal as number) - (bVal as number);
                  });
                  return activeSortDirection === 'desc' ? sorted.reverse() : sorted;
                };

                if (tokenGrouping === 'user') {
                  const grouped = new Map<string, { tokens: number; requests: number; rateLimited: number }>();
                  attributionData.forEach(row => {
                    const existing = grouped.get(row.user) || { tokens: 0, requests: 0, rateLimited: 0 };
                    existing.tokens += row.tokens;
                    existing.requests += row.requests;
                    existing.rateLimited += row.rateLimited;
                    grouped.set(row.user, existing);
                  });
                  const rows = sortRows(
                    [...grouped.entries()].map(([user, data]) => ({ user, ...data })),
                    'user'
                  );
                  const paginated = rows.slice((v4Page - 1) * v4PerPage, v4Page * v4PerPage);
                  return (
                    <>
                      <Table aria-label="Token consumption by user" id="v4-user-table">
                        <Thead>
                          <Tr>
                            <Th sort={getSortParams(0)}>User</Th>
                            <Th sort={getSortParams(1)}>Tokens</Th>
                            <Th sort={getSortParams(2)}>Requests</Th>
                            <Th sort={getSortParams(3)}>Rate Limited</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {paginated.map((row, index) => (
                            <Tr key={row.user} id={`v4-user-row-${index}`}>
                              <Td dataLabel="User">{row.user}</Td>
                              <Td dataLabel="Tokens">{(row.tokens / 1000000).toFixed(1)}M</Td>
                              <Td dataLabel="Requests">{row.requests.toLocaleString()}</Td>
                              <Td dataLabel="Rate Limited">{row.rateLimited.toLocaleString()}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      <Pagination
                        itemCount={rows.length}
                        perPage={v4PerPage}
                        page={v4Page}
                        onSetPage={(_event, page) => setV4Page(page)}
                        onPerPageSelect={(_event, perPage) => { setV4PerPage(perPage); setV4Page(1); }}
                        id="v4-pagination"
                      />
                    </>
                  );
                }

                if (tokenGrouping === 'subscription') {
                  const grouped = new Map<string, { tokens: number; requests: number; rateLimited: number }>();
                  attributionData.forEach(row => {
                    const existing = grouped.get(row.subscription) || { tokens: 0, requests: 0, rateLimited: 0 };
                    existing.tokens += row.tokens;
                    existing.requests += row.requests;
                    existing.rateLimited += row.rateLimited;
                    grouped.set(row.subscription, existing);
                  });
                  const rows = sortRows(
                    [...grouped.entries()].map(([subscription, data]) => ({ subscription, ...data })),
                    'subscription'
                  );
                  const paginated = rows.slice((v4Page - 1) * v4PerPage, v4Page * v4PerPage);
                  return (
                    <>
                      <Table aria-label="Token consumption by subscription" id="v4-subscription-table">
                        <Thead>
                          <Tr>
                            <Th sort={getSortParams(0)}>Subscription</Th>
                            <Th sort={getSortParams(1)}>Tokens</Th>
                            <Th sort={getSortParams(2)}>Requests</Th>
                            <Th sort={getSortParams(3)}>Rate Limited</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {paginated.map((row, index) => (
                            <Tr key={row.subscription} id={`v4-sub-row-${index}`}>
                              <Td dataLabel="Subscription">{row.subscription}</Td>
                              <Td dataLabel="Tokens">{(row.tokens / 1000000).toFixed(1)}M</Td>
                              <Td dataLabel="Requests">{row.requests.toLocaleString()}</Td>
                              <Td dataLabel="Rate Limited">{row.rateLimited.toLocaleString()}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                      <Pagination
                        itemCount={rows.length}
                        perPage={v4PerPage}
                        page={v4Page}
                        onSetPage={(_event, page) => setV4Page(page)}
                        onPerPageSelect={(_event, perPage) => { setV4PerPage(perPage); setV4Page(1); }}
                        id="v4-sub-pagination"
                      />
                    </>
                  );
                }

                const grouped = new Map<string, { tokens: number; requests: number; rateLimited: number }>();
                attributionData.forEach(row => {
                  const existing = grouped.get(row.model) || { tokens: 0, requests: 0, rateLimited: 0 };
                  existing.tokens += row.tokens;
                  existing.requests += row.requests;
                  existing.rateLimited += row.rateLimited;
                  grouped.set(row.model, existing);
                });
                const rows = sortRows(
                  [...grouped.entries()].map(([model, data]) => ({ model, ...data })),
                  'model'
                );
                const paginated = rows.slice((v4Page - 1) * v4PerPage, v4Page * v4PerPage);
                return (
                  <>
                    <Table aria-label="Token consumption by model" id="v4-model-table">
                      <Thead>
                        <Tr>
                          <Th sort={getSortParams(0)}>Model</Th>
                          <Th sort={getSortParams(1)}>Tokens</Th>
                          <Th sort={getSortParams(2)}>Requests</Th>
                          <Th sort={getSortParams(3)}>Rate Limited</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {paginated.map((row, index) => (
                          <Tr key={row.model} id={`v4-model-row-${index}`}>
                            <Td dataLabel="Model">{row.model}</Td>
                            <Td dataLabel="Tokens">{(row.tokens / 1000000).toFixed(1)}M</Td>
                            <Td dataLabel="Requests">{row.requests.toLocaleString()}</Td>
                            <Td dataLabel="Rate Limited">{row.rateLimited.toLocaleString()}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    <Pagination
                      itemCount={rows.length}
                      perPage={v4PerPage}
                      page={v4Page}
                      onSetPage={(_event, page) => setV4Page(page)}
                      onPerPageSelect={(_event, perPage) => { setV4PerPage(perPage); setV4Page(1); }}
                      id="v4-model-pagination"
                    />
                  </>
                );
              })()}
            </CardBody>
          </Card>
        </GridItem>

        {/* Export Modal */}
        <Modal
          variant={ModalVariant.small}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          id="v4-export-modal"
          aria-labelledby="v4-export-modal-title"
        >
          <ModalHeader title="Export usage data" labelId="v4-export-modal-title" />
          <ModalBody>
            <Alert variant={AlertVariant.info} title="Data may be an approximate" isInline id="v4-export-alert" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              This export provides usage data for internal cost attribution.
              Token counts may have some data loss and are not yet suitable as a complete billing record.
            </Alert>
            <Content component={ContentVariants.p}>
              The CSV will include token consumption broken down by user, subscription, and model
              for the selected time range.
            </Content>
          </ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={handleExportConfirm}>Download CSV</Button>
            <Button variant="link" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Grid>
    );
  }

  const renderFilterSelect = (
    id: string,
    isOpen: boolean,
    setIsOpen: (v: boolean) => void,
    selected: string,
    onSelect: (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => void,
    options: { value: string; label: string }[],
    minWidth: string
  ) => (
    <Select
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={setIsOpen}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
          id={`${id}-toggle`}
          style={{ minWidth }}
        >
          {options.find(o => o.value === selected)?.label || 'Select'}
        </MenuToggle>
      )}
    >
      <SelectList>
        {options.map((option) => (
          <SelectOption key={option.value} value={option.value} isSelected={selected === option.value}>
            {option.label}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );

  return (
    <Grid hasGutter>
      {/* Filters Toolbar */}
      <GridItem span={12}>
        <Toolbar id="usage-toolbar">
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              {isAdmin && (
                <ToolbarItem>
                  {renderFilterSelect('user-filter', isUserSelectOpen, setIsUserSelectOpen, selectedUser, handleUserSelect, userOptions, '180px')}
                </ToolbarItem>
              )}
              <ToolbarItem>
                {renderFilterSelect('subscription-filter', isSubscriptionSelectOpen, setIsSubscriptionSelectOpen, selectedSubscription, handleSubscriptionSelect, subscriptionOptions, '180px')}
              </ToolbarItem>
              <ToolbarItem>
                {renderFilterSelect('model-filter', isModelSelectOpen, setIsModelSelectOpen, selectedModel, handleModelSelect, modelOptions, '200px')}
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup variant="action-group-plain" align={{ default: 'alignEnd' }}>
              <ToolbarItem>
                {renderFilterSelect('duration-filter', isDurationSelectOpen, setIsDurationSelectOpen, selectedDuration, handleDurationSelect, durationOptions, '160px')}
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  variant="secondary"
                  onClick={handleExportClick}
                  id="export-usage-btn"
                  icon={<ExternalLinkAltIcon />}
                >
                  Export CSV
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </GridItem>

      {/* Token Usage Warning */}
      {showWarning && (
        <GridItem span={12}>
          <Alert
            variant={AlertVariant.warning}
            title="Token usage at 80% threshold"
            isInline
            id="budget-warning-alert"
          >
            Your organization has used {usagePercent.toFixed(1)}% of total allocated tokens. Consider reviewing
            API key usage to identify high-consuming applications.
          </Alert>
        </GridItem>
      )}

      {/* Box Metrics Row */}
      <GridItem span={12}>
        <Flex gap={{ default: 'gapMd' }}>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Card isCompact id="total-tokens-card">
              <CardBody>
                <Content component={ContentVariants.small}>Total Tokens (approx)</Content>
                <Title headingLevel="h3" size="xl">{(analyticsMetrics.totalTokens / 1000000).toFixed(1)}M</Title>
              </CardBody>
            </Card>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Card isCompact id="total-requests-card">
              <CardBody>
                <Content component={ContentVariants.small}>Total Requests</Content>
                <Title headingLevel="h3" size="xl">{analyticsMetrics.totalRequests.toLocaleString()}</Title>
              </CardBody>
            </Card>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Card isCompact id="total-errors-card">
              <CardBody>
                <Content component={ContentVariants.small}>Total Errors</Content>
                <Title headingLevel="h3" size="xl">{analyticsMetrics.totalErrors}</Title>
              </CardBody>
            </Card>
          </FlexItem>
          {isAdmin && (
            <FlexItem flex={{ default: 'flex_1' }}>
              <Card isCompact id="active-users-card">
                <CardBody>
                  <Content component={ContentVariants.small}>Active Users</Content>
                  <Title headingLevel="h3" size="xl">{analyticsMetrics.activeUsers}</Title>
                </CardBody>
              </Card>
            </FlexItem>
          )}
          <FlexItem flex={{ default: 'flex_1' }}>
            <Card isCompact id="success-rate-card">
              <CardBody>
                <Content component={ContentVariants.small}>Success Rate</Content>
                <Title headingLevel="h3" size="xl">{analyticsMetrics.successRate}%</Title>
              </CardBody>
            </Card>
          </FlexItem>
        </Flex>
      </GridItem>

      {/* Token Consumption Charts */}
      <GridItem span={6}>
        <Card id="token-trends-card">
          <CardHeader>
            <CardTitle>Token Consumption Trends</CardTitle>
          </CardHeader>
          <CardBody>
            {dashboardVariation === 'v2-patternfly' ? (
              <div id="pf-token-trends-chart">
                <Chart
                  height={250}
                  width={600}
                  containerComponent={<ChartVoronoiContainer />}
                  legendData={[{ name: 'Total Tokens' }, { name: 'Total Requests' }]}
                  legendPosition="bottom"
                  padding={{ bottom: 75, left: 75, right: 50, top: 20 }}
                >
                  <ChartAxis />
                  <ChartAxis dependentAxis tickFormat={(t: number) => t >= 1000 ? `${(t / 1000).toFixed(0)}K` : `${t}`} />
                  <ChartGroup>
                    <ChartLine
                      data={[
                        { x: 'Jan 13', y: 180000 }, { x: 'Jan 15', y: 850000 },
                        { x: 'Jan 17', y: 220000 }, { x: 'Jan 19', y: 150000 },
                        { x: 'Jan 21', y: 320000 }, { x: 'Jan 23', y: 180000 },
                        { x: 'Jan 25', y: 720000 }, { x: 'Jan 27', y: 550000 },
                      ]}
                      style={{ data: { stroke: '#06c' } }}
                    />
                    <ChartLine
                      data={[
                        { x: 'Jan 13', y: 1800 }, { x: 'Jan 15', y: 8500 },
                        { x: 'Jan 17', y: 2200 }, { x: 'Jan 19', y: 1500 },
                        { x: 'Jan 21', y: 3200 }, { x: 'Jan 23', y: 1800 },
                        { x: 'Jan 25', y: 7200 }, { x: 'Jan 27', y: 5500 },
                      ]}
                      style={{ data: { stroke: '#4CB140' } }}
                    />
                  </ChartGroup>
                </Chart>
              </div>
            ) : (
              <ReactECharts option={tokenTrendsChartOption} style={{ height: '250px' }} />
            )}
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card id="model-token-trends-card">
          <CardHeader>
            <CardTitle>Token Consumption by Model</CardTitle>
          </CardHeader>
          <CardBody>
            {dashboardVariation === 'v2-patternfly' ? (
              <div id="pf-model-token-trends-chart">
                <Chart
                  height={250}
                  width={600}
                  containerComponent={<ChartVoronoiContainer />}
                  legendData={[
                    { name: 'granite-3.0-instruct' }, { name: 'llama-3.1-70b' },
                    { name: 'mistral-large' }, { name: 'llama-3.1-8b' },
                  ]}
                  legendPosition="bottom"
                  padding={{ bottom: 75, left: 75, right: 50, top: 20 }}
                >
                  <ChartAxis />
                  <ChartAxis dependentAxis tickFormat={(t: number) => t >= 1000 ? `${(t / 1000).toFixed(0)}K` : `${t}`} />
                  <ChartStack>
                    <ChartArea
                      data={[
                        { x: 'Jan 13', y: 50000 }, { x: 'Jan 15', y: 200000 },
                        { x: 'Jan 17', y: 80000 }, { x: 'Jan 19', y: 40000 },
                        { x: 'Jan 21', y: 120000 }, { x: 'Jan 23', y: 60000 },
                        { x: 'Jan 25', y: 250000 }, { x: 'Jan 27', y: 180000 },
                      ]}
                      style={{ data: { fill: '#06c', fillOpacity: 0.6 } }}
                    />
                    <ChartArea
                      data={[
                        { x: 'Jan 13', y: 40000 }, { x: 'Jan 15', y: 180000 },
                        { x: 'Jan 17', y: 50000 }, { x: 'Jan 19', y: 35000 },
                        { x: 'Jan 21', y: 80000 }, { x: 'Jan 23', y: 40000 },
                        { x: 'Jan 25', y: 150000 }, { x: 'Jan 27', y: 120000 },
                      ]}
                      style={{ data: { fill: '#4CB140', fillOpacity: 0.6 } }}
                    />
                    <ChartArea
                      data={[
                        { x: 'Jan 13', y: 30000 }, { x: 'Jan 15', y: 150000 },
                        { x: 'Jan 17', y: 40000 }, { x: 'Jan 19', y: 30000 },
                        { x: 'Jan 21', y: 60000 }, { x: 'Jan 23', y: 35000 },
                        { x: 'Jan 25', y: 120000 }, { x: 'Jan 27', y: 90000 },
                      ]}
                      style={{ data: { fill: '#F0AB00', fillOpacity: 0.6 } }}
                    />
                    <ChartArea
                      data={[
                        { x: 'Jan 13', y: 20000 }, { x: 'Jan 15', y: 120000 },
                        { x: 'Jan 17', y: 25000 }, { x: 'Jan 19', y: 20000 },
                        { x: 'Jan 21', y: 40000 }, { x: 'Jan 23', y: 25000 },
                        { x: 'Jan 25', y: 80000 }, { x: 'Jan 27', y: 60000 },
                      ]}
                      style={{ data: { fill: '#8B8D8F', fillOpacity: 0.6 } }}
                    />
                  </ChartStack>
                </Chart>
              </div>
            ) : (
              <ReactECharts option={modelTokenTrendsChartOption} style={{ height: '250px' }} />
            )}
          </CardBody>
        </Card>
      </GridItem>
      {/* Usage Attribution */}
      <GridItem span={12} style={{ marginTop: '24px' }}>
        <Divider />
      </GridItem>
      <GridItem span={12}>
        <Title headingLevel="h2" size="lg" id="attribution-title">
          Usage Attribution
        </Title>
        <Content component={ContentVariants.p} style={{ marginBottom: '16px' }}>
          Token consumption by subscription, user, and model for internal cost attribution.
        </Content>
      </GridItem>
      <GridItem span={6}>
        <Card id="usage-by-subscription-card">
          <CardHeader>
            <CardTitle>Tokens by Subscription</CardTitle>
          </CardHeader>
          <CardBody>
            {dashboardVariation === 'v2-patternfly' ? (
              <div id="pf-usage-by-subscription-chart">
                <Chart
                  height={300}
                  width={600}
                  padding={{ bottom: 50, left: 75, right: 50, top: 20 }}
                  colorScale={mockUsageBySubscription.map(item =>
                    item.priority === 'critical' ? '#C9190B' : item.priority === 'standard' ? '#0066CC' : '#6A6E73'
                  )}
                >
                  <ChartAxis />
                  <ChartAxis dependentAxis tickFormat={(t: number) => t >= 1000 ? `${(t / 1000).toFixed(0)}K` : `${t}`} />
                  <ChartGroup>
                    {mockUsageBySubscription.map((item, idx) => (
                      <ChartBar key={idx} data={[{ x: item.name, y: item.tokens }]} />
                    ))}
                  </ChartGroup>
                </Chart>
              </div>
            ) : (
              <ReactECharts option={barChartOption} style={{ height: '300px' }} />
            )}
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card id="tokens-by-model-card">
          <CardHeader>
            <CardTitle>Tokens by Model</CardTitle>
          </CardHeader>
          <CardBody>
            {dashboardVariation === 'v2-patternfly' ? (
              <div id="pf-tokens-by-model-chart">
                <ChartPie
                  data={mockTokensByModel.map(item => ({ x: item.name, y: item.tokens }))}
                  height={300}
                  width={350}
                  colorScale={['#0066CC', '#4CB140', '#F0AB00', '#6A6E73']}
                  legendData={mockTokensByModel.map(item => ({ name: `${item.name}: ${item.percentage}%` }))}
                  legendPosition="bottom"
                  padding={{ bottom: 100, left: 20, right: 20, top: 20 }}
                />
              </div>
            ) : (
              <ReactECharts option={pieChartOption} style={{ height: '300px' }} />
            )}
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={12}>
        <Card id="attribution-card">
          <CardHeader>
            <CardTitle>{isAdmin ? 'Token Consumption by User' : 'Your Token Consumption'}</CardTitle>
          </CardHeader>
          <CardBody>
            {isAdmin && (
              dashboardVariation === 'v2-patternfly' ? (
                <div id="pf-user-tokens-chart" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                  <Chart
                    height={Math.max(180, userModelData.users.length * 40 + 30)}
                    width={600}
                    horizontal
                    legendData={userModelData.models.map(m => ({ name: m }))}
                    legendPosition="bottom"
                    padding={{ bottom: 75, left: 150, right: 50, top: 20 }}
                  >
                    <ChartAxis />
                    <ChartAxis dependentAxis tickFormat={(t: number) => t >= 1000000 ? `${(t / 1000000).toFixed(1)}M` : t >= 1000 ? `${(t / 1000).toFixed(0)}K` : `${t}`} />
                    <ChartStack>
                      {userModelData.models.map((model, idx) => (
                        <ChartBar
                          key={model}
                          data={userModelData.users.map(user => ({
                            x: user,
                            y: attributionData.find(r => r.user === user && r.model === model)?.tokens || 0,
                          }))}
                          style={{ data: { fill: modelColors[idx % modelColors.length] } }}
                        />
                      ))}
                    </ChartStack>
                  </Chart>
                </div>
              ) : (
                <ReactECharts option={userTokensChartOption} style={{ height: `${Math.max(230, userModelData.users.length * 40 + 80)}px`, marginBottom: 'var(--pf-t--global--spacer--md)' }} />
              )
            )}
            <Table aria-label="Token consumption attribution table" id="attribution-table">
              <Thead>
                <Tr>
                  {isAdmin && <Th>User</Th>}
                  <Th>Subscription</Th>
                  <Th>Model</Th>
                  <Th>Tokens</Th>
                  <Th>Requests</Th>
                  <Th>Rate Limited</Th>
                </Tr>
              </Thead>
              <Tbody>
                {attributionData.map((row, index) => (
                  <Tr key={index} id={`attribution-row-${index}`}>
                    {isAdmin && <Td dataLabel="User">{row.user}</Td>}
                    <Td dataLabel="Subscription">{row.subscription}</Td>
                    <Td dataLabel="Model">{row.model}</Td>
                    <Td dataLabel="Tokens">{(row.tokens / 1000000).toFixed(1)}M</Td>
                    <Td dataLabel="Requests">{row.requests.toLocaleString()}</Td>
                    <Td dataLabel="Rate Limited">{row.rateLimited.toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </GridItem>

      {/* API Key Usage */}
      <GridItem span={12} style={{ marginTop: '24px' }}>
        <Divider />
      </GridItem>
      <GridItem span={12}>
        <Title headingLevel="h2" size="lg" id="api-keys-title">
          API Key Usage
        </Title>
        <Content component={ContentVariants.p} style={{ marginBottom: '16px' }}>
          Token consumption per API key. Sorted by usage to help identify high-consuming keys.
        </Content>
      </GridItem>
      <GridItem span={12}>
        <Card id="api-keys-card">
          <CardHeader>
            <CardTitle>Tokens by API Key</CardTitle>
          </CardHeader>
          <CardBody>
            {dashboardVariation === 'v2-patternfly' ? (
              <div id="pf-api-key-chart" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                <Chart
                  height={Math.max(180, mockAPIKeys.length * 40 + 30)}
                  width={600}
                  horizontal
                  legendData={apiKeySubscriptions.map(s => ({ name: s }))}
                  legendPosition="bottom"
                  padding={{ bottom: 75, left: 150, right: 50, top: 20 }}
                >
                  <ChartAxis />
                  <ChartAxis dependentAxis tickFormat={(t: number) => t >= 1000 ? `${(t / 1000).toFixed(0)}K` : `${t}`} />
                  <ChartStack>
                    {apiKeySubscriptions.map((sub, idx) => (
                      <ChartBar
                        key={sub}
                        data={sortedAPIKeys.map(k => ({
                          x: k.name,
                          y: k.subscriptionName === sub ? k.tokensUsed : 0,
                        }))}
                        style={{ data: { fill: subscriptionColors[sub] || modelColors[idx % modelColors.length] } }}
                      />
                    ))}
                  </ChartStack>
                </Chart>
              </div>
            ) : (
              <ReactECharts option={apiKeyChartOption} style={{ height: `${Math.max(230, mockAPIKeys.length * 40 + 80)}px`, marginBottom: 'var(--pf-t--global--spacer--md)' }} />
            )}
            <Toolbar id="api-keys-toolbar">
              <ToolbarContent>
                <ToolbarItem>
                  <SearchInput
                    placeholder="Search by name or subscription"
                    value={apiKeySearchValue}
                    onChange={(_event, value) => setApiKeySearchValue(value)}
                    onClear={() => setApiKeySearchValue('')}
                    id="api-keys-search"
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Table aria-label="API Keys table" id="api-keys-table">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Subscription</Th>
                  <Th>Status</Th>
                  <Th>Tokens Used</Th>
                  <Th>Last Used</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAPIKeys.map((key) => (
                  <Tr key={key.id} id={`api-key-row-${key.id}`}>
                    <Td dataLabel="Name">
                      <Button variant="link" isInline id={`api-key-link-${key.id}`}>
                        {key.name}
                      </Button>
                    </Td>
                    <Td dataLabel="Subscription">{key.subscriptionName}</Td>
                    <Td dataLabel="Status">
                      <Label
                        color={key.status === 'active' ? 'green' : key.status === 'expired' ? 'grey' : 'red'}
                        icon={key.status === 'active' ? <CheckCircleIcon /> : key.status === 'expired' ? <OutlinedClockIcon /> : <TimesCircleIcon />}
                      >
                        {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                      </Label>
                    </Td>
                    <Td dataLabel="Tokens Used">{key.tokensUsed.toLocaleString()}</Td>
                    <Td dataLabel="Last Used">
                      {new Date(key.lastUsed).toLocaleString()}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </GridItem>

      {/* Export CSV Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        id="export-modal"
        aria-labelledby="export-modal-title"
        aria-describedby="export-modal-body"
      >
        <ModalHeader title="Export usage data" labelId="export-modal-title" />
        <ModalBody id="export-modal-body">
          <Alert variant={AlertVariant.info} title="Data may be an approximate" isInline id="export-showback-alert" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            This export provides usage data for internal cost attribution.
            Token counts may have some data loss and are not yet suitable as a complete billing record.
          </Alert>
          <Content component={ContentVariants.p}>
            The CSV will include token consumption broken down by user, subscription, and model
            for the selected time range.
          </Content>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleExportConfirm} id="export-confirm-btn">
            Download CSV
          </Button>
          <Button variant="link" onClick={() => setIsExportModalOpen(false)} id="export-cancel-btn">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Grid>
  );
};

// ============================================================================
// CLUSTER TAB COMPONENT (Admin Only)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ClusterTab: React.FC = () => {
  // Chart options for cluster-wide utilizations
  const createUtilizationChartOption = (data: number[], color: string) => ({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'],
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d2d2d2' } },
      axisLabel: { color: '#6a6e73' }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: '#6a6e73' },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [{
      data: data,
      type: 'line',
      areaStyle: { opacity: 0.3, color: color },
      lineStyle: { color: color, width: 2 },
      itemStyle: { color: color },
      smooth: true
    }],
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true }
  });

  // Chart options for resource usage by project (stacked area)
  const createProjectUsageChartOption = (_title: string) => ({
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['KonText PTE', 'AI Research', 'ML Production'],
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 11, color: '#6a6e73' }
    },
    xAxis: {
      type: 'category',
      data: ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM'],
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d2d2d2' } },
      axisLabel: { color: '#6a6e73', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 60,
      axisLabel: { formatter: '{value}%', color: '#6a6e73', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [
      {
        name: 'KonText PTE',
        type: 'line',
        stack: 'Total',
        areaStyle: { opacity: 0.8 },
        emphasis: { focus: 'series' },
        data: [15, 18, 20, 22, 25, 28],
        itemStyle: { color: '#06c' },
        lineStyle: { width: 0 }
      },
      {
        name: 'AI Research',
        type: 'line',
        stack: 'Total',
        areaStyle: { opacity: 0.8 },
        emphasis: { focus: 'series' },
        data: [12, 14, 16, 18, 15, 17],
        itemStyle: { color: '#8bc1f7' },
        lineStyle: { width: 0 }
      },
      {
        name: 'ML Production',
        type: 'line',
        stack: 'Total',
        areaStyle: { opacity: 0.8 },
        emphasis: { focus: 'series' },
        data: [8, 10, 12, 10, 12, 14],
        itemStyle: { color: '#bde2b9' },
        lineStyle: { width: 0 }
      }
    ],
    grid: { left: '3%', right: '4%', bottom: '18%', top: '10%', containLabel: true }
  });

  return (
    <Grid hasGutter>
      {/* Overview Section Header */}
      <GridItem span={12}>
        <Title headingLevel="h2" size="lg" id="cluster-overview-title">Overview</Title>
        <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          Key cluster metrics and health indicators at a glance
        </Content>
      </GridItem>

      {/* Overview metrics - Combined Card */}
      <GridItem span={12}>
        <Card isCompact id="overview-metrics-card">
          <CardBody>
            <Flex>
              {/* System Health */}
              <FlexItem flex={{ default: 'flex_1' }}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>System health</Content>
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h3" size="2xl">100%</Title>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      3/3 nodes healthy
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <Label color="green" icon={<CheckCircleIcon />} id="system-health-status-label">
                      Healthy
                    </Label>
                  </FlexItem>
                  <FlexItem>
                    <Button 
                      variant="link" 
                      isInline 
                      component="a"
                      href="#"
                      target="_blank"
                      icon={<ExternalLinkAltIcon />}
                      iconPosition="end"
                      id="view-in-openshift-link"
                    >
                      View in OpenShift
                    </Button>
                  </FlexItem>
                </Flex>
              </FlexItem>

              <Divider orientation={{ default: 'vertical' }} />

              {/* Active Models */}
              <FlexItem flex={{ default: 'flex_1' }}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>Active models</Content>
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h3" size="2xl">4</Title>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      Models currently deployed
                    </Content>
                  </FlexItem>
                </Flex>
              </FlexItem>

              <Divider orientation={{ default: 'vertical' }} />

              {/* GPU Utilization */}
              <FlexItem flex={{ default: 'flex_1' }}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>GPU utilization</Content>
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h3" size="2xl">100%</Title>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      24 of 24 GPUs utilized
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <Button 
                      variant="link" 
                      isInline
                      id="gpu-view-details-link"
                    >
                      View details
                    </Button>
                  </FlexItem>
                </Flex>
              </FlexItem>

              <Divider orientation={{ default: 'vertical' }} />

              {/* Success Rate */}
              <FlexItem flex={{ default: 'flex_1' }}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>Success rate</Content>
                  </FlexItem>
                  <FlexItem>
                    <Title headingLevel="h3" size="2xl">99.2%</Title>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      Request success rate
                    </Content>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </GridItem>

      {/* Cluster-wide Utilizations */}
      <GridItem span={12} style={{ marginTop: '24px' }}>
        <Title headingLevel="h2" size="lg" id="cluster-utilizations-title">Cluster-wide Utilizations</Title>
        <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          Monitor total cluster capacity and current usage across all resources
        </Content>
      </GridItem>
      <GridItem span={12}>
        <Card id="cluster-utilization-card">
          <CardBody>
            <Grid hasGutter>
              {/* GPU Utilization Chart */}
              <GridItem span={12} md={6}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>GPU</Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>77% available of 80 GPUs</Content>
                  </FlexItem>
                  <FlexItem>
                    <ReactECharts
                      option={createUtilizationChartOption([65, 72, 78, 85, 77, 77], '#06c')}
                      style={{ height: '160px' }}
                    />
                  </FlexItem>
                </Flex>
              </GridItem>
              {/* Memory Utilization Chart */}
              <GridItem span={12} md={6}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>Memory</Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>2,048 GB available of 3,677 GB</Content>
                  </FlexItem>
                  <FlexItem>
                    <ReactECharts
                      option={createUtilizationChartOption([35, 38, 42, 45, 48, 44], '#8bc1f7')}
                      style={{ height: '160px' }}
                    />
                  </FlexItem>
                </Flex>
              </GridItem>
              {/* CPU Utilization Chart */}
              <GridItem span={12} md={6}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>CPU</Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>77% available of 80 cores</Content>
                  </FlexItem>
                  <FlexItem>
                    <ReactECharts
                      option={createUtilizationChartOption([60, 65, 70, 68, 72, 75], '#06c')}
                      style={{ height: '160px' }}
                    />
                  </FlexItem>
                </Flex>
              </GridItem>
              {/* Network Utilization Chart */}
              <GridItem span={12} md={6}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>Network</Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>3.8 Mbps In</Content>
                  </FlexItem>
                  <FlexItem>
                    <ReactECharts
                      option={{
                        tooltip: { trigger: 'axis' },
                        xAxis: {
                          type: 'category',
                          data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'],
                          boundaryGap: false,
                          axisLine: { lineStyle: { color: '#d2d2d2' } },
                          axisLabel: { color: '#6a6e73' }
                        },
                        yAxis: {
                          type: 'value',
                          min: 0,
                          max: 30,
                          axisLabel: { color: '#6a6e73' },
                          splitLine: { lineStyle: { color: '#f0f0f0' } }
                        },
                        series: [{
                          data: [8, 12, 15, 18, 14, 16],
                          type: 'line',
                          areaStyle: { opacity: 0.3, color: '#8bc1f7' },
                          lineStyle: { color: '#8bc1f7', width: 2 },
                          itemStyle: { color: '#8bc1f7' },
                          smooth: true
                        }],
                        grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true }
                      }}
                      style={{ height: '160px' }}
                    />
                  </FlexItem>
                </Flex>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </GridItem>

      {/* Resource Usage by Project */}
      <GridItem span={12} style={{ marginTop: '24px' }}>
        <Title headingLevel="h2" size="lg" id="resource-usage-title">Resource Usage by Project</Title>
        <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          Compare resource consumption across different projects over time
        </Content>
      </GridItem>
      <GridItem span={12}>
        <Card id="resource-usage-card">
          <CardBody>
            <Grid hasGutter>
              {/* GPU Usage by Project */}
              <GridItem span={12} md={4}>
                <Card isPlain>
                  <CardHeader>
                    <CardTitle>
                      <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>GPU Usage</Content>
                    </CardTitle>
                  </CardHeader>
                  <CardBody style={{ paddingTop: 0 }}>
                    <ReactECharts
                      option={createProjectUsageChartOption('GPU Usage')}
                      style={{ height: '200px' }}
                    />
                  </CardBody>
                </Card>
              </GridItem>
              {/* CPU Usage by Project */}
              <GridItem span={12} md={4}>
                <Card isPlain>
                  <CardHeader>
                    <CardTitle>
                      <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>CPU Usage</Content>
                    </CardTitle>
                  </CardHeader>
                  <CardBody style={{ paddingTop: 0 }}>
                    <ReactECharts
                      option={createProjectUsageChartOption('CPU Usage')}
                      style={{ height: '200px' }}
                    />
                  </CardBody>
                </Card>
              </GridItem>
              {/* Memory Usage by Project */}
              <GridItem span={12} md={4}>
                <Card isPlain>
                  <CardHeader>
                    <CardTitle>
                      <Content component={ContentVariants.small} style={{ fontWeight: 600 }}>Memory Usage</Content>
                    </CardTitle>
                  </CardHeader>
                  <CardBody style={{ paddingTop: 0 }}>
                    <ReactECharts
                      option={createProjectUsageChartOption('Memory Usage')}
                      style={{ height: '200px' }}
                    />
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      </GridItem>

      {/* Cluster Details */}
      <GridItem span={12} style={{ marginTop: '24px' }}>
        <Title headingLevel="h2" size="lg" id="cluster-details-title">Cluster Details</Title>
        <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          View technical configuration and infrastructure details
        </Content>
      </GridItem>
      <GridItem span={12} md={6}>
        <Card id="cluster-details-card">
          <CardBody>
            <DescriptionList isCompact>
              <DescriptionListGroup>
                <DescriptionListTerm>Provider</DescriptionListTerm>
                <DescriptionListDescription>AWS</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>OpenShift version</DescriptionListTerm>
                <DescriptionListDescription>2.24.0</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Channel</DescriptionListTerm>
                <DescriptionListDescription>fast</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>API server</DescriptionListTerm>
                <DescriptionListDescription>https://api.cluster-c8khh8.z84hh8.sandbox.opentlc.com</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
            <Button 
              variant="link" 
              isInline 
              component="a"
              href="#"
              target="_blank"
              icon={<ExternalLinkAltIcon />}
              iconPosition="end"
              id="view-settings-link"
              style={{ marginTop: '16px' }}
            >
              View settings
            </Button>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

// ============================================================================
// MODELS TAB COMPONENT (Admin + AI Engineer)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ModelsTab: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isModelsSelectOpen, setIsModelsSelectOpen] = useState(false);
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);
  const [isDeploymentsExpanded, setIsDeploymentsExpanded] = useState(true);
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(true);

  // Get unique model names for filter
  const modelNames = useMemo(() => {
    return [...new Set(modelDeploymentData.map(d => d.deployment))];
  }, []);

  const filteredDeployments = useMemo(() => {
    return modelDeploymentData.filter((deployment) => {
      const matchesSearch = searchValue === '' || 
        deployment.deployment.toLowerCase().includes(searchValue.toLowerCase()) ||
        deployment.project.toLowerCase().includes(searchValue.toLowerCase());
      const matchesModel = selectedModels.length === 0 || selectedModels.includes(deployment.deployment);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(deployment.status);
      return matchesSearch && matchesModel && matchesStatus;
    });
  }, [searchValue, selectedModels, selectedStatuses]);

  const getStatusLabel = (status: string, index: number) => {
    switch (status) {
      case 'Running':
        return <Label color="green" icon={<CheckCircleIcon />} id={`status-running-${index}`}>Running</Label>;
      case 'Scaling':
        return <Label color="yellow" icon={<ExclamationTriangleIcon />} id={`status-scaling-${index}`}>Scaling</Label>;
      case 'Failed':
        return <Label color="red" icon={<ExclamationCircleIcon />} id={`status-failed-${index}`}>Failed</Label>;
      case 'Degraded':
        return <Label color="orange" icon={<ExclamationCircleIcon />} id={`status-degraded-${index}`}>Degraded</Label>;
      default:
        return <Label id={`status-unknown-${index}`}>{status}</Label>;
    }
  };

  const onModelSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (typeof value === 'string') {
      setSelectedModels((prev) =>
        prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
      );
    }
  };

  const onStatusSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (typeof value === 'string') {
      setSelectedStatuses((prev) =>
        prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
      );
    }
  };

  // Performance chart configurations
  const timeLabels = ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM'];

  const createMultiLineChartOption = (title: string, yAxisLabel: string, seriesData: { name: string; data: number[]; color: string }[]) => ({
    tooltip: { trigger: 'axis' },
    legend: {
      data: seriesData.map(s => s.name),
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 10, color: '#6a6e73' },
      type: 'scroll',
      pageButtonPosition: 'end'
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d2d2d2' } },
      axisLabel: { color: '#6a6e73', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6a6e73', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: seriesData.map(s => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      lineStyle: { color: s.color, width: 2 },
      itemStyle: { color: s.color },
      showSymbol: false
    })),
    grid: { left: '3%', right: '4%', bottom: '22%', top: '10%', containLabel: true }
  });

  return (
    <Grid hasGutter>
      {/* Filters Toolbar */}
      <GridItem span={12}>
        <Toolbar id="models-toolbar">
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                <Select
                  isOpen={isModelsSelectOpen}
                  selected={selectedModels}
                  onSelect={onModelSelect}
                  onOpenChange={(isOpen) => setIsModelsSelectOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsModelsSelectOpen(!isModelsSelectOpen)}
                      isExpanded={isModelsSelectOpen}
                      icon={<FilterIcon />}
                      id="models-filter-toggle"
                    >
                      Models {selectedModels.length > 0 && <Badge isRead>{selectedModels.length}</Badge>}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    {modelNames.map((model) => (
                      <SelectOption
                        key={model}
                        value={model}
                        hasCheckbox
                        isSelected={selectedModels.includes(model)}
                      >
                        {model}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                <Select
                  isOpen={isStatusSelectOpen}
                  selected={selectedStatuses}
                  onSelect={onStatusSelect}
                  onOpenChange={(isOpen) => setIsStatusSelectOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsStatusSelectOpen(!isStatusSelectOpen)}
                      isExpanded={isStatusSelectOpen}
                      id="status-filter-toggle"
                    >
                      Filter by models {selectedStatuses.length > 0 && <Badge isRead>{selectedStatuses.length}</Badge>}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    {['Running', 'Scaling', 'Failed', 'Degraded'].map((status) => (
                      <SelectOption
                        key={status}
                        value={status}
                        hasCheckbox
                        isSelected={selectedStatuses.includes(status)}
                      >
                        {status}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                <SearchInput
                  placeholder="Search models"
                  value={searchValue}
                  onChange={(_event, value) => setSearchValue(value)}
                  onClear={() => setSearchValue('')}
                  id="models-search-input"
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </GridItem>

      {/* Model Deployments Section - Expandable */}
      <GridItem span={12}>
        <Card id="model-deployments-card" isExpanded={isDeploymentsExpanded}>
          <CardHeader
            onExpand={() => setIsDeploymentsExpanded(!isDeploymentsExpanded)}
            isToggleRightAligned
            toggleButtonProps={{
              id: 'model-deployments-toggle',
              'aria-label': 'Toggle model deployments',
              'aria-expanded': isDeploymentsExpanded
            }}
          >
            <CardTitle>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <Title headingLevel="h2" size="lg" id="model-deployments-title">Model deployments</Title>
                </FlexItem>
                <FlexItem>
                  <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Active model deployments with real-time performance and resource metrics
                  </Content>
                </FlexItem>
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <Table aria-label="Model deployments table" variant="compact" id="model-deployments-table">
                <Thead>
                  <Tr>
                    <Th sort={{ sortBy: { index: 0, direction: 'asc' }, onSort: () => {}, columnIndex: 0 }}>Model deployment</Th>
                    <Th sort={{ sortBy: { index: 1, direction: 'asc' }, onSort: () => {}, columnIndex: 1 }}>Project</Th>
                    <Th sort={{ sortBy: { index: 2, direction: 'asc' }, onSort: () => {}, columnIndex: 2 }}>Runtime</Th>
                    <Th sort={{ sortBy: { index: 3, direction: 'asc' }, onSort: () => {}, columnIndex: 3 }}>Total r...</Th>
                    <Th sort={{ sortBy: { index: 4, direction: 'asc' }, onSort: () => {}, columnIndex: 4 }}>P90 E...</Th>
                    <Th sort={{ sortBy: { index: 5, direction: 'asc' }, onSort: () => {}, columnIndex: 5 }}>Error r...</Th>
                    <Th sort={{ sortBy: { index: 6, direction: 'asc' }, onSort: () => {}, columnIndex: 6 }}>Hardware profile</Th>
                    <Th sort={{ sortBy: { index: 7, direction: 'asc' }, onSort: () => {}, columnIndex: 7 }}>GPU u...</Th>
                    <Th sort={{ sortBy: { index: 8, direction: 'asc' }, onSort: () => {}, columnIndex: 8 }}>CPU u...</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredDeployments.map((deployment, index) => (
                    <Tr key={`${deployment.deployment}-${deployment.project}-${index}`} id={`deployment-row-${index}`}>
                      <Td dataLabel="Model deployment">
                        <Button variant="link" isInline id={`deployment-link-${index}`}>
                          {deployment.deployment}
                        </Button>
                      </Td>
                      <Td dataLabel="Project">{deployment.project}</Td>
                      <Td dataLabel="Runtime">{deployment.runtime}</Td>
                      <Td dataLabel="Total requests">{parseInt(deployment.requests).toLocaleString()}</Td>
                      <Td dataLabel="P90 Latency">{deployment.latency}</Td>
                      <Td dataLabel="Error rate">{deployment.errorRate}</Td>
                      <Td dataLabel="Hardware profile">{deployment.hardwareProfile}</Td>
                      <Td dataLabel="GPU utilization">{deployment.gpu}</Td>
                      <Td dataLabel="CPU utilization">{deployment.cpu}</Td>
                      <Td dataLabel="Status">{getStatusLabel(deployment.status, index)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </CardExpandableContent>
        </Card>
      </GridItem>

      {/* Performance Metrics Section - Expandable */}
      <GridItem span={12}>
        <Card id="performance-metrics-card" isExpanded={isPerformanceExpanded}>
          <CardHeader
            onExpand={() => setIsPerformanceExpanded(!isPerformanceExpanded)}
            isToggleRightAligned
            toggleButtonProps={{
              id: 'performance-metrics-toggle',
              'aria-label': 'Toggle performance metrics',
              'aria-expanded': isPerformanceExpanded
            }}
          >
            <CardTitle>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <Title headingLevel="h2" size="lg" id="performance-metrics-title">Performance metrics</Title>
                </FlexItem>
                <FlexItem>
                  <Content component={ContentVariants.small} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Real-time metrics for request handling, latency, throughput, and resource utilization
                  </Content>
                </FlexItem>
              </Flex>
            </CardTitle>
          </CardHeader>
          <CardExpandableContent>
            <CardBody>
              <Grid hasGutter>
                {/* Request Queue Length */}
                <GridItem span={12} md={6}>
                  <Card isPlain>
                    <CardHeader>
                      <CardTitle>
                        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>Request queue length</Content>
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <ReactECharts
                        option={createMultiLineChartOption('Request queue length', '', [
                          { name: 'mistral-7b-instruct-v2', data: [5, 8, 12, 10, 7, 6], color: '#06c' },
                          { name: 'stable-diffusion-xl-beta', data: [3, 5, 7, 8, 6, 4], color: '#8bc1f7' },
                          { name: 'llama-70b-chat-v4', data: [2, 4, 5, 6, 4, 3], color: '#bde2b9' },
                          { name: 'codellama-34b-instruct', data: [4, 6, 9, 7, 5, 4], color: '#f4b678' }
                        ])}
                        style={{ height: '200px' }}
                      />
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Replica Count */}
                <GridItem span={12} md={6}>
                  <Card isPlain>
                    <CardHeader>
                      <CardTitle>
                        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>Replica count</Content>
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <ReactECharts
                        option={createMultiLineChartOption('Replica count', '', [
                          { name: 'mistral-7b-instruct-v2', data: [2, 3, 4, 4, 3, 2], color: '#06c' },
                          { name: 'stable-diffusion-xl-beta', data: [1, 2, 3, 3, 2, 2], color: '#8bc1f7' },
                          { name: 'llama-70b-chat-v4', data: [1, 1, 2, 2, 2, 1], color: '#bde2b9' },
                          { name: 'codellama-34b-instruct', data: [2, 2, 3, 3, 2, 2], color: '#f4b678' }
                        ])}
                        style={{ height: '200px' }}
                      />
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Request Latency */}
                <GridItem span={12} md={6}>
                  <Card isPlain>
                    <CardHeader>
                      <CardTitle>
                        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>Request latency</Content>
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <ReactECharts
                        option={createMultiLineChartOption('Request latency', 'ms', [
                          { name: 'mistral-7b-instruct-v2', data: [150, 180, 200, 190, 170, 160], color: '#06c' },
                          { name: 'stable-diffusion-xl-beta', data: [200, 220, 250, 240, 230, 210], color: '#8bc1f7' },
                          { name: 'llama-70b-chat-v4', data: [280, 300, 350, 320, 310, 290], color: '#bde2b9' },
                          { name: 'codellama-34b-instruct', data: [180, 200, 230, 210, 195, 185], color: '#f4b678' }
                        ])}
                        style={{ height: '200px' }}
                      />
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Time to First Token (TTFT) */}
                <GridItem span={12} md={6}>
                  <Card isPlain>
                    <CardHeader>
                      <CardTitle>
                        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>Time to First Token (TTFT)</Content>
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <ReactECharts
                        option={createMultiLineChartOption('TTFT', 'ms', [
                          { name: 'mistral-7b-instruct-v2', data: [100, 120, 150, 140, 130, 110], color: '#06c' },
                          { name: 'stable-diffusion-xl-beta', data: [180, 200, 250, 230, 210, 190], color: '#8bc1f7' },
                          { name: 'llama-70b-chat-v4', data: [350, 400, 450, 420, 380, 360], color: '#bde2b9' },
                          { name: 'codellama-34b-instruct', data: [150, 170, 200, 180, 165, 155], color: '#f4b678' }
                        ])}
                        style={{ height: '200px' }}
                      />
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Token Generation Rate */}
                <GridItem span={12} md={6}>
                  <Card isPlain>
                    <CardHeader>
                      <CardTitle>
                        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>Token Generation Rate</Content>
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <ReactECharts
                        option={createMultiLineChartOption('Token Generation Rate', 'tok/s', [
                          { name: 'mistral-7b-instruct-v2', data: [30, 32, 35, 33, 31, 30], color: '#06c' },
                          { name: 'stable-diffusion-xl-beta', data: [25, 28, 30, 28, 26, 25], color: '#8bc1f7' },
                          { name: 'llama-70b-chat-v4', data: [15, 18, 20, 18, 16, 15], color: '#bde2b9' },
                          { name: 'codellama-34b-instruct', data: [22, 25, 28, 26, 24, 22], color: '#f4b678' }
                        ])}
                        style={{ height: '200px' }}
                      />
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Throughput */}
                <GridItem span={12} md={6}>
                  <Card isPlain>
                    <CardHeader>
                      <CardTitle>
                        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>Throughput (requests/sec)</Content>
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <ReactECharts
                        option={createMultiLineChartOption('Throughput', 'req/s', [
                          { name: 'mistral-7b-instruct-v2', data: [45, 50, 55, 52, 48, 46], color: '#06c' },
                          { name: 'stable-diffusion-xl-beta', data: [30, 35, 40, 38, 33, 31], color: '#8bc1f7' },
                          { name: 'llama-70b-chat-v4', data: [20, 25, 30, 28, 24, 22], color: '#bde2b9' },
                          { name: 'codellama-34b-instruct', data: [35, 40, 45, 42, 38, 36], color: '#f4b678' }
                        ])}
                        style={{ height: '200px' }}
                      />
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Response Time Distribution - Full Width */}
                <GridItem span={12}>
                  <Card isPlain>
                    <CardHeader>
                      <CardTitle>
                        <Content component={ContentVariants.p} style={{ fontWeight: 600 }}>Response Time Distribution</Content>
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <ReactECharts
                        option={{
                          tooltip: { trigger: 'axis' },
                          xAxis: {
                            type: 'category',
                            data: ['0-100ms', '100-200ms', '200-300ms', '300-400ms', '400-500ms', '500-600ms', '600ms+'],
                            axisLine: { lineStyle: { color: '#d2d2d2' } },
                            axisLabel: { color: '#6a6e73', fontSize: 11 }
                          },
                          yAxis: {
                            type: 'value',
                            axisLabel: { color: '#6a6e73', fontSize: 11 },
                            splitLine: { lineStyle: { color: '#f0f0f0' } }
                          },
                          series: [{
                            type: 'bar',
                            data: [
                              { value: 120, itemStyle: { color: '#06c' } },
                              { value: 280, itemStyle: { color: '#8bc1f7' } },
                              { value: 450, itemStyle: { color: '#bde2b9' } },
                              { value: 380, itemStyle: { color: '#f4b678' } },
                              { value: 220, itemStyle: { color: '#c9190b' } },
                              { value: 150, itemStyle: { color: '#a30000' } },
                              { value: 80, itemStyle: { color: '#7d1007' } }
                            ],
                            barWidth: '60%'
                          }],
                          grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true }
                        }}
                        style={{ height: '200px' }}
                      />
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </CardBody>
          </CardExpandableContent>
        </Card>
      </GridItem>
    </Grid>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const MaaSDashboard: React.FC = () => {
  const { userProfile } = useUserProfile();
  
  // Determine if user is admin
  const isAdmin = userProfile === 'AI Admin';
  
  const location = useLocation();
  
  // Default tab based on role: Admin starts on Cluster, others start on Models
  const getDefaultTab = () => {
    // Check URL hash first
    const hash = location.hash.replace('#', '');
    const validTabs = ['cluster', 'models', 'quotas', 'credits'];
    if (hash && validTabs.includes(hash)) {
      // Non-admin users can't access cluster tab
      if (!isAdmin && hash === 'cluster') {
        return 'models';
      }
      return hash;
    }
    return 'credits';
  };
  
  const [selectedTab, setSelectedTab] = useState<string>(getDefaultTab());
  const previousProfileRef = React.useRef(userProfile);

  // Handle URL hash changes (both from React Router and direct hash changes)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['cluster', 'models', 'quotas', 'credits'];
      if (hash && validTabs.includes(hash)) {
        if (!isAdmin && hash === 'cluster') {
          setSelectedTab('models');
        } else {
          setSelectedTab(hash);
        }
      }
    };
    
    // Check hash on mount and when location changes
    handleHashChange();
    
    // Also listen for hashchange events (for browser back/forward)
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [location.hash, isAdmin]);

  // When profile changes, update the tab accordingly
  useEffect(() => {
    if (previousProfileRef.current !== userProfile) {
      previousProfileRef.current = userProfile;
      
      if (userProfile !== 'AI Admin') {
        if (selectedTab === 'cluster') {
          setSelectedTab('models');
        }
      } else if (userProfile === 'AI Admin') {
        // When switching to AI Admin, show Cluster tab (unless hash specifies otherwise)
        const hash = location.hash.replace('#', '');
        if (!hash || !['cluster', 'models', 'quotas', 'credits'].includes(hash)) {
          setSelectedTab('cluster');
        }
      }
    }
  }, [userProfile, selectedTab, location.hash]);

  // Handle tab selection
  const handleTabSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, eventKey: string | number) => {
    const newTab = eventKey as string;
    if (newTab === 'cluster' && userProfile !== 'AI Admin') {
      return;
    }
    setSelectedTab(newTab);
  };

  return (
    <>
      {/* Sticky Header Section with Title and Tabs */}
      <PageSection 
        variant="default" 
        id="maas-dashboard-header"
        stickyOnBreakpoint={{ default: 'top' }}
        style={{ paddingBottom: 0 }}
      >
        <Title headingLevel="h1" id="maas-dashboard-title">
          Dashboard
        </Title>
        <Content component={ContentVariants.p}>
          {isAdmin 
            ? 'Monitor cluster health, model deployments, subscriptions, and token usage.'
            : 'Monitor your model deployments, subscriptions, and token usage.'
          }
        </Content>
        {/* Horizontal Tabs - just the tab bar */}
        <Tabs
          activeKey={selectedTab}
          onSelect={handleTabSelect}
          id="maas-dashboard-tabs"
          style={{ marginTop: '16px' }}
        >
          {/* Cluster Tab - Admin Only */}
          {isAdmin && (
            <Tab eventKey="cluster" title={<TabTitleText><Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}><ServerIcon /><span>Cluster</span></Flex></TabTitleText>} id="cluster-tab" />
          )}
          {/* Models Tab */}
          <Tab eventKey="models" title={<TabTitleText><Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}><CubeIcon /><span>Models</span></Flex></TabTitleText>} id="models-tab" />
          {/* Subscriptions Tab */}
          <Tab eventKey="quotas" title={<TabTitleText><Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}><KeyIcon /><span>Subscriptions</span></Flex></TabTitleText>} id="quotas-keys-tab" />
          {/* Usage Tab - Available to all users, admin sees full view, non-admin sees scoped view */}
          <Tab eventKey="credits" title={<TabTitleText><Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}><ChartBarIcon /><span>Usage</span></Flex></TabTitleText>} id="credits-usage-tab" />
        </Tabs>
      </PageSection>

      {/* Scrollable Content Section */}
      <PageSection isFilled id="maas-dashboard-content">
        {/* Cluster Tab Content - Not in scope */}
        {isAdmin && selectedTab === 'cluster' && (
          <EmptyState titleText="Not part of MaaS Observability" id="cluster-empty-state">
            <EmptyStateBody>The Cluster tab is outside the scope of MaaS Observability and is not covered in this prototype.</EmptyStateBody>
          </EmptyState>
        )}
        {/* Models Tab Content - Not in scope */}
        {selectedTab === 'models' && (
          <EmptyState titleText="Not part of MaaS Observability" id="models-empty-state">
            <EmptyStateBody>The Models tab is outside the scope of MaaS Observability and is not covered in this prototype.</EmptyStateBody>
          </EmptyState>
        )}
        {/* Subscriptions Tab Content */}
        {selectedTab === 'quotas' && <QuotasAndKeysTab />}
        {/* Usage Tab Content */}
        {selectedTab === 'credits' && <CreditsAndUsageTab isAdmin={isAdmin} />}
      </PageSection>
    </>
  );
};

export { MaaSDashboard };
