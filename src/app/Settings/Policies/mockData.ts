import { Policy } from './types';

// Available groups for policy targeting
export const mockGroups = [
  { id: 'dev-team', name: 'Development Team' },
  { id: 'qa-team', name: 'QA Team' },
  { id: 'data-science-team', name: 'Data Science Team' },
  { id: 'ml-engineers', name: 'ML Engineers' },
  { id: 'platform-team', name: 'Platform Team' },
  { id: 'research-team', name: 'Research Team' },
  { id: 'acme-corp-ai-users', name: 'ACME Corp AI Users' },
  { id: 'acme-data-science', name: 'ACME Data Science' },
];

// Available subject groups for MaaSAuthPolicy (OIDC group claims)
export const mockSubjectGroups = [
  { name: 'acme-corp-ai-users' },
  { name: 'acme-data-science' },
  { name: 'enterprise-users' },
  { name: 'research-team' },
  { name: 'dev-team' },
  { name: 'premium-users' },
];

// Available subject users for MaaSAuthPolicy
export const mockSubjectUsers = [
  { name: 'service-account-a' },
  { name: 'john.doe' },
  { name: 'jane.smith' },
  { name: 'bob.johnson' },
  { name: 'alice.williams' },
];

// Available users for policy targeting
export const mockUsers = [
  { id: 'john.doe', name: 'John Doe' },
  { id: 'jane.smith', name: 'Jane Smith' },
  { id: 'bob.johnson', name: 'Bob Johnson' },
  { id: 'alice.williams', name: 'Alice Williams' },
  { id: 'charlie.brown', name: 'Charlie Brown' },
];

// Available service accounts for policy targeting
export const mockServiceAccounts = [
  { id: 'prod-service-account', name: 'Production Service Account' },
  { id: 'dev-service-account', name: 'Development Service Account' },
  { id: 'ci-cd-service-account', name: 'CI/CD Service Account' },
  { id: 'monitoring-service-account', name: 'Monitoring Service Account' },
];

// Mock policies
export const mockPolicies: Policy[] = [
  {
    id: 'devs-rate-limit-standard',
    name: 'Developer Rate Limit Standard',
    displayName: 'Developer Rate Limit Standard',
    description: 'Standard rate limiting for development teams: 1000 requests/minute, 50K tokens/minute',
    type: 'RateLimitPolicy',
    status: 'Active',
    gitSource: 'https://github.com/company/policies/blob/main/dev-rate-limit-standard.yaml',
    targets: {
      groups: ['dev-team', 'qa-team'],
      users: ['john.doe'],
      serviceAccounts: ['dev-service-account'],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['all'],
    },
    limits: {
      tokenLimit: {
        amount: 50000,
        period: 'minute',
      },
      rateLimit: {
        amount: 1000,
        period: 'minute',
      },
      quotaRenewalSchedule: {
        startTime: 'dateCreated',
      },
      overLimitBehavior: 'hard',
    },
    dateCreated: new Date('2025-01-10T10:00:00Z'),
    createdBy: 'admin',
    yaml: `apiVersion: kuadrant.io/v1beta2
kind: RateLimitPolicy
metadata:
  name: developer-rate-limit-standard
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: api-route
  limits:
    "per-minute":
      rates:
        - limit: 1000
          duration: 1
          unit: minute
      counters:
        - tokens
    "token-limit":
      rates:
        - limit: 50000
          duration: 1
          unit: minute`,
  },
  {
    id: 'devs-budget-standard',
    name: 'Developer Budget Standard',
    displayName: 'Developer Budget Standard',
    description: 'Monthly budget cap of $500 for development API usage',
    type: 'RateLimitPolicy',
    status: 'Active',
    targets: {
      groups: ['dev-team'],
      users: [],
      serviceAccounts: [],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['all'],
    },
    limits: {
      timeLimit: {
        start: new Date('2025-01-01T00:00:00Z'),
        end: new Date('2025-12-31T23:59:59Z'),
      },
      quotaRenewalSchedule: {
        startTime: new Date('2025-01-01T00:00:00Z'),
      },
      overLimitBehavior: 'soft',
      softThrottlePercentage: 50,
    },
    dateCreated: new Date('2025-01-05T14:30:00Z'),
    createdBy: 'admin',
    yaml: `apiVersion: kuadrant.io/v1beta2
kind: RateLimitPolicy
metadata:
  name: developer-budget-standard
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: api-route
  limits:
    "monthly-budget":
      rates:
        - limit: 500000
          duration: 720
          unit: hour`,
  },
  {
    id: 'prod-rate-limit-high',
    name: 'Production Rate Limit High',
    displayName: 'Production Rate Limit High',
    description: 'High throughput for production workloads: 10K requests/minute, 500K tokens/minute',
    type: 'RateLimitPolicy',
    status: 'Active',
    gitSource: 'https://github.com/company/policies/blob/main/prod-rate-limit-high.yaml',
    targets: {
      groups: ['platform-team'],
      users: [],
      serviceAccounts: ['prod-service-account'],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['gpt-oss-20b', 'granite-3.1b'],
    },
    limits: {
      tokenLimit: {
        amount: 500000,
        period: 'minute',
      },
      rateLimit: {
        amount: 10000,
        period: 'minute',
      },
      quotaRenewalSchedule: {
        startTime: 'dateCreated',
      },
      overLimitBehavior: 'hard',
    },
    dateCreated: new Date('2025-01-08T09:15:00Z'),
    createdBy: 'platform-admin',
    yaml: `apiVersion: kuadrant.io/v1beta2
kind: RateLimitPolicy
metadata:
  name: production-rate-limit-high
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: prod-api-route
  limits:
    "per-minute":
      rates:
        - limit: 10000
          duration: 1
          unit: minute
    "token-limit":
      rates:
        - limit: 500000
          duration: 1
          unit: minute`,
  },
  {
    id: 'security-data-classification',
    name: 'Security Data Classification',
    displayName: 'Security Data Classification',
    description: 'Restricts access to models based on data classification levels',
    type: 'AuthPolicy',
    status: 'Active',
    targets: {
      groups: ['dev-team', 'ml-engineers'],
      users: ['jane.smith', 'bob.johnson'],
      serviceAccounts: [],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['granite-3.1b', 'llama-7b'],
    },
    limits: {},
    dateCreated: new Date('2025-01-12T16:45:00Z'),
    createdBy: 'security-admin',
    yaml: `apiVersion: kuadrant.io/v1beta2
kind: AuthPolicy
metadata:
  name: security-data-classification
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: api-route
  rules:
    authorization:
      "data-classification":
        opa:
          rego: |
            allow {
              input.context.request.http.headers["x-data-classification"] == "public"
            }`,
  },
  {
    id: 'compliance-audit-logging',
    name: 'Compliance Audit Logging',
    displayName: 'Compliance Audit Logging',
    description: 'Enhanced logging for compliance and audit requirements',
    type: 'AuthPolicy',
    status: 'Active',
    targets: {
      groups: ['platform-team'],
      users: [],
      serviceAccounts: ['prod-service-account', 'monitoring-service-account'],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['all'],
    },
    limits: {
      timeLimit: {
        start: new Date('2025-01-01T00:00:00Z'),
        end: new Date('2026-01-01T00:00:00Z'),
      },
    },
    dateCreated: new Date('2025-01-15T11:20:00Z'),
    createdBy: 'compliance-admin',
    yaml: `apiVersion: kuadrant.io/v1beta2
kind: AuthPolicy
metadata:
  name: compliance-audit-logging
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: api-route
  rules:
    authentication:
      "jwt-auth":
        jwt:
          issuerUrl: https://auth.example.com`,
  },
  {
    id: 'cost-optimization',
    name: 'Cost Optimization Policy',
    displayName: 'Cost Optimization Policy',
    description: 'Automatic model selection based on cost-effectiveness for the task',
    type: 'DNSPolicy',
    status: 'Inactive',
    targets: {
      groups: ['data-science-team', 'research-team'],
      users: ['alice.williams'],
      serviceAccounts: [],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['all'],
    },
    limits: {
      tokenLimit: {
        amount: 100000,
        period: 'day',
      },
      rateLimit: {
        amount: 2000,
        period: 'hour',
      },
    },
    dateCreated: new Date('2025-01-18T13:10:00Z'),
    createdBy: 'admin',
    yaml: `apiVersion: kuadrant.io/v1alpha1
kind: DNSPolicy
metadata:
  name: cost-optimization-policy
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: api-gateway
  loadBalancing:
    weighted:
      defaultWeight: 100
      custom:
        - value: low-cost-region
          weight: 200`,
  },
  {
    id: 'tls-security-policy',
    name: 'TLS Security Policy',
    displayName: 'TLS Security Policy',
    description: 'Enforces TLS 1.3 and modern cipher suites for all API connections',
    type: 'TLSPolicy',
    status: 'Active',
    targets: {
      groups: ['platform-team'],
      users: [],
      serviceAccounts: ['prod-service-account'],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['all'],
    },
    limits: {},
    dateCreated: new Date('2025-01-20T10:00:00Z'),
    createdBy: 'security-admin',
    yaml: `apiVersion: kuadrant.io/v1alpha1
kind: TLSPolicy
metadata:
  name: tls-security-policy
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: Gateway
    name: api-gateway
  tls:
    minVersion: "1.3"
    cipherSuites:
      - TLS_AES_128_GCM_SHA256
      - TLS_AES_256_GCM_SHA384`,
  },
  {
    id: 'acme-corp-enterprise-access',
    name: 'acme-corp-enterprise-access',
    displayName: 'ACME Corp Enterprise Access',
    description: 'Enterprise-wide access policy for ACME Corp AI users',
    type: 'MaaSAuthPolicy',
    status: 'Active',
    targets: {
      groups: ['acme-corp-ai-users', 'acme-data-science'],
      users: [],
      serviceAccounts: [],
    },
    subjects: {
      groups: [{ name: 'acme-corp-ai-users' }, { name: 'acme-data-science' }],
      users: [],
    },
    modelRefs: ['granite-3b-instruct', 'gpt-4-turbo'],
    availableAssets: {
      models: ['granite-3b-instruct', 'gpt-4-turbo'],
    },
    limits: {},
    dateCreated: new Date('2025-01-22T09:00:00Z'),
    createdBy: 'admin',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSAuthPolicy
metadata:
  name: acme-corp-enterprise-access
  namespace: opendatahub
annotation:
  display-name: "ACME Corp Enterprise Access"
  display-description: "Enterprise-wide access policy for ACME Corp AI users"
spec:
  modelRefs:
    - granite-3b-instruct
    - gpt-4-turbo
  subjects:
    groups:
      - name: "acme-corp-ai-users"
      - name: "acme-data-science"
status:
  phase: Active`,
  },
  {
    id: 'enterprise-token-rate-limit',
    name: 'Enterprise Token Rate Limits',
    displayName: 'Enterprise Token Rate Limits',
    description: 'Token rate limits for enterprise subscription users with high throughput allowance',
    type: 'RateLimitPolicy',
    status: 'Active',
    targets: {
      groups: ['acme-corp-ai-users', 'enterprise-users'],
      users: [],
      serviceAccounts: [],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['granite-3b-instruct', 'gpt-4-turbo', 'llama-3-1-8b-instruct'],
    },
    limits: {
      tokenLimit: {
        amount: 100000,
        period: 'day',
      },
      rateLimit: {
        amount: 5000,
        period: 'minute',
      },
      quotaRenewalSchedule: {
        startTime: 'dateCreated',
      },
      overLimitBehavior: 'soft',
      softThrottlePercentage: 25,
    },
    dateCreated: new Date('2025-01-25T14:00:00Z'),
    createdBy: 'platform-admin',
    yaml: `apiVersion: kuadrant.io/v1beta2
kind: RateLimitPolicy
metadata:
  name: enterprise-token-rate-limit
  namespace: opendatahub
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: enterprise-api-route
  limits:
    "daily-token-limit":
      rates:
        - limit: 100000
          duration: 24
          unit: hour
      counters:
        - tokens
    "per-minute":
      rates:
        - limit: 5000
          duration: 1
          unit: minute`,
  },
  {
    id: 'research-maas-auth',
    name: 'research-maas-auth',
    displayName: 'Research Team MaaS Auth',
    description: 'SSO authentication policy for research team members accessing AI models',
    type: 'MaaSAuthPolicy',
    status: 'Active',
    targets: {
      groups: ['research-team'],
      users: [],
      serviceAccounts: [],
    },
    subjects: {
      groups: [{ name: 'research-team' }],
      users: [],
    },
    modelRefs: ['granite-3b-instruct', 'gpt-4-turbo', 'claude-3-sonnet', 'llama-3-1-8b-instruct', 'mistral-7b-instruct'],
    availableAssets: {
      models: ['all'],
    },
    limits: {},
    dateCreated: new Date('2025-01-28T10:30:00Z'),
    createdBy: 'security-admin',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSAuthPolicy
metadata:
  name: research-maas-auth
  namespace: opendatahub
spec:
  modelRefs:
    - granite-3b-instruct
    - gpt-4-turbo
    - claude-3-sonnet
    - llama-3-1-8b-instruct
    - mistral-7b-instruct
  subjects:
    groups:
      - name: "research-team"
status:
  phase: Active`,
  },
  {
    id: 'standard-token-rate-limit',
    name: 'Standard Token Rate Limits',
    displayName: 'Standard Token Rate Limits',
    description: 'Token rate limits for standard subscription tier with moderate throughput',
    type: 'RateLimitPolicy',
    status: 'Active',
    targets: {
      groups: ['dev-team', 'acme-data-science'],
      users: [],
      serviceAccounts: [],
    },
    subjects: { groups: [], users: [] },
    modelRefs: [],
    availableAssets: {
      models: ['granite-3b-instruct', 'mistral-7b-instruct'],
    },
    limits: {
      tokenLimit: {
        amount: 25000,
        period: 'day',
      },
      rateLimit: {
        amount: 1000,
        period: 'minute',
      },
      quotaRenewalSchedule: {
        startTime: 'dateCreated',
      },
      overLimitBehavior: 'hard',
    },
    dateCreated: new Date('2025-01-30T09:00:00Z'),
    createdBy: 'admin',
    yaml: `apiVersion: kuadrant.io/v1beta2
kind: RateLimitPolicy
metadata:
  name: standard-token-rate-limit
  namespace: opendatahub
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: standard-api-route
  limits:
    "daily-token-limit":
      rates:
        - limit: 25000
          duration: 24
          unit: hour
      counters:
        - tokens
    "per-minute":
      rates:
        - limit: 1000
          duration: 1
          unit: minute`,
  },
];

// Utility functions
export const getPolicyById = (id: string): Policy | undefined => 
  mockPolicies.find(p => p.id === id);

export const getGroupById = (id: string) => 
  mockGroups.find(g => g.id === id);

export const getUserById = (id: string) => 
  mockUsers.find(u => u.id === id);

export const getServiceAccountById = (id: string) => 
  mockServiceAccounts.find(sa => sa.id === id);

export interface RelatedSubscription {
  id: string;
  name: string;
  description: string;
  type: 'MaaS Subscription';
}

export const mockRelatedSubscriptions: Record<string, RelatedSubscription[]> = {
  'acme-corp-enterprise-access': [
    { id: 'enterprise-tier', name: 'Enterprise Subscription', description: 'Subscription for enterprise AI workloads with high rate limits', type: 'MaaS Subscription' },
  ],
  'research-maas-auth': [
    { id: 'research-unlimited', name: 'Research Unlimited', description: 'Unlimited access for research team with no rate limits', type: 'MaaS Subscription' },
  ],
};

export const getRelatedSubscriptions = (policyId: string): RelatedSubscription[] =>
  mockRelatedSubscriptions[policyId] || [];
