import { Subscription } from './types';

// Generate YAML for a subscription
const generateSubscriptionYAML = (subscription: Subscription): string => {
  const modelRefsYAML = subscription.modelRefs.map(ref => {
    const tokenLimit = Array.isArray(ref.tokenRateLimits) ? ref.tokenRateLimits[0] : ref.tokenRateLimits;
    return `    - name: ${ref.name}
      tokenRateLimits:
        limit: ${tokenLimit.limit}
        window: ${tokenLimit.window}`;
  }).join('\n');

  const groupsYAML = subscription.owner.groups.map(g => `      - name: "${g.name}"`).join('\n');

  return `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: ${subscription.name}
  namespace: opendatahub
spec:
  displayName: "${subscription.displayName}"
  priority: ${subscription.priority}
  owner:
    groups:
${groupsYAML}
  modelRefs:
${modelRefsYAML}
status:
  phase: ${subscription.status}`;
};

// Available groups (shared with Tiers for consistency)
export const mockOwnerGroups = [
  { name: 'acme-corp-ai-users' },
  { name: 'acme-data-science' },
  { name: 'enterprise-users' },
  { name: 'research-team' },
  { name: 'dev-team' },
  { name: 'premium-users' },
];

// Available models (MaaSModel references)
export const mockMaaSModels = [
  { id: 'granite-3b-instruct', name: 'IBM Granite 3B Instruct', provider: 'Internal', namespace: 'ai-models', description: 'Lightweight instruction-following model optimized for enterprise tasks' },
  { id: 'llama-3-1-8b-instruct', name: 'Llama 3.1 8B Instruct', provider: 'Internal', namespace: 'ai-models', description: 'General-purpose instruction-tuned model with strong reasoning capabilities' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'External', namespace: 'external-providers', description: 'High-performance model for complex reasoning and code generation' },
  { id: 'mistral-7b-instruct', name: 'Mistral 7B Instruct', provider: 'Internal', namespace: 'ai-models', description: 'Efficient instruction model with strong multilingual support' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'External', namespace: 'external-providers', description: 'Balanced model for analysis, coding, and creative tasks' },
  // Unaffiliated models - available but not assigned to any subscription
  { id: 'codellama-34b', name: 'Code Llama 34B', provider: 'Internal', namespace: 'dev-tools', description: 'Specialized model for code generation, completion, and debugging across multiple programming languages' },
  { id: 'gemma-2-9b', name: 'Gemma 2 9B', provider: 'Internal', namespace: 'research-models', description: 'Compact open-weights model for research and experimentation' },
];

// Mock subscriptions based on the MaaSSubscription CRD spec
export const mockSubscriptions: Subscription[] = [
  {
    id: 'enterprise-tier',
    name: 'enterprise-tier',
    displayName: 'Enterprise Subscription',
    description: 'Subscription for enterprise AI workloads with high rate limits',
    priority: 4, // 1–10 scale (higher = higher priority); demo uses 1–4 across four subscriptions
    status: 'Active',
    owner: {
      groups: [
        { name: 'acme-corp-ai-users' },
        { name: 'enterprise-users' },
      ],
    },
    modelRefs: [
      {
        name: 'granite-3b-instruct',
        tokenRateLimits: { limit: 100000, window: '24h' },
        billingRate: { perToken: 0.000001 },
      },
      {
        name: 'gpt-4-turbo',
        tokenRateLimits: { limit: 50000, window: '24h' },
        billingRate: { perToken: 0.00003 },
      },
      {
        name: 'llama-3-1-8b-instruct',
        tokenRateLimits: { limit: 200000, window: '24h' },
        billingRate: { perToken: 0.000001 },
      },
    ],
    billingMetadata: {
      organizationId: 'acme-corp',
      costCenter: 'ai-r-and-d',
      labels: {
        contract: 'enterprise-2024',
        department: 'research',
      },
    },
    dateCreated: new Date('2026-01-15T10:00:00Z'),
    createdBy: 'platform-admin',
  },
  {
    id: 'standard-tier',
    name: 'standard-tier',
    displayName: 'Standard Subscription',
    description: 'Standard access tier for general AI development workloads',
    priority: 2,
    status: 'Active',
    owner: {
      groups: [
        { name: 'dev-team' },
        { name: 'acme-data-science' },
      ],
    },
    modelRefs: [
      {
        name: 'granite-3b-instruct',
        tokenRateLimits: { limit: 25000, window: '24h' },
        billingRate: { perToken: 0.000001 },
      },
      {
        name: 'mistral-7b-instruct',
        tokenRateLimits: { limit: 25000, window: '24h' },
        billingRate: { perToken: 0.0000015 },
      },
    ],
    billingMetadata: {
      organizationId: 'acme-corp',
      costCenter: 'engineering',
    },
    dateCreated: new Date('2026-01-10T14:30:00Z'),
    createdBy: 'admin',
  },
  {
    id: 'research-unlimited',
    name: 'research-unlimited',
    displayName: 'Research Unlimited',
    description: 'Unlimited access for research team with no rate limits',
    priority: 3,
    status: 'Active',
    owner: {
      groups: [
        { name: 'research-team' },
      ],
    },
    modelRefs: [
      {
        name: 'granite-3b-instruct',
        tokenRateLimits: { limit: 1000000, window: '24h' },
      },
      {
        name: 'gpt-4-turbo',
        tokenRateLimits: { limit: 500000, window: '24h' },
        billingRate: { perToken: 0.00003 },
      },
      {
        name: 'claude-3-sonnet',
        tokenRateLimits: { limit: 500000, window: '24h' },
        billingRate: { perToken: 0.000015 },
      },
      {
        name: 'llama-3-1-8b-instruct',
        tokenRateLimits: { limit: 1000000, window: '24h' },
      },
      {
        name: 'mistral-7b-instruct',
        tokenRateLimits: { limit: 1000000, window: '24h' },
      },
    ],
    billingMetadata: {
      organizationId: 'acme-corp',
      costCenter: 'research',
      labels: {
        project: 'ai-research-2026',
      },
    },
    dateCreated: new Date('2026-01-05T09:00:00Z'),
    createdBy: 'platform-admin',
  },
  {
    id: 'premium-external',
    name: 'premium-external',
    displayName: 'Premium External Models',
    description: 'Access to external AI providers (OpenAI, Anthropic) for premium users',
    priority: 1,
    status: 'Pending',
    owner: {
      groups: [
        { name: 'premium-users' },
      ],
    },
    modelRefs: [
      {
        name: 'gpt-4-turbo',
        tokenRateLimits: { limit: 100000, window: '24h' },
        billingRate: { perToken: 0.00003 },
      },
      {
        name: 'claude-3-sonnet',
        tokenRateLimits: { limit: 100000, window: '24h' },
        billingRate: { perToken: 0.000015 },
      },
    ],
    billingMetadata: {
      organizationId: 'acme-corp',
      costCenter: 'premium-ai',
      labels: {
        tier: 'premium',
      },
    },
    dateCreated: new Date('2026-01-25T16:00:00Z'),
    createdBy: 'platform-admin',
  },
];

// Populate YAML for each subscription
mockSubscriptions.forEach(subscription => {
  subscription.yaml = generateSubscriptionYAML(subscription);
});

/** Prototype: update priority in shared mock so list/detail/playground stay consistent. */
export function updateMockSubscriptionPriority(id: string, priority: number): void {
  const sub = mockSubscriptions.find((s) => s.id === id);
  if (sub) {
    sub.priority = priority;
    sub.yaml = generateSubscriptionYAML(sub);
  }
}

// Utility functions
export const getSubscriptionById = (id: string): Subscription | undefined =>
  mockSubscriptions.find(s => s.id === id);

export const getModelById = (id: string) =>
  mockMaaSModels.find(m => m.id === id);

export const getGroupByName = (name: string) =>
  mockOwnerGroups.find(g => g.name === name);

// Get priority label from priority number (1–10 scale; higher value = higher priority)
export const getPriorityLabel = (priority: number): string => {
  if (priority >= 9) return 'Highest';
  if (priority >= 7) return 'High';
  if (priority >= 5) return 'Standard';
  if (priority === 4) return 'Elevated';
  if (priority === 3) return 'Fair';
  if (priority === 2) return 'Basic';
  if (priority === 1) return 'Minimal';
  return 'Standard';
};

export interface RelatedPolicy {
  id: string;
  name: string;
  description: string;
  type: 'MaaS Auth Policy' | 'Token Rate Limit Policy';
}

export const mockRelatedPolicies: Record<string, RelatedPolicy[]> = {
  'enterprise-tier': [
    { id: 'acme-corp-enterprise-access', name: 'A MaaS Policy', description: 'My Policy Description', type: 'MaaS Auth Policy' },
    { id: 'enterprise-token-rate-limit', name: 'Enterprise Token Rate Limits', description: 'Token rate limits for enterprise subscription users with high throughput allowance', type: 'Token Rate Limit Policy' },
  ],
  'standard-tier': [
    { id: 'standard-token-rate-limit', name: 'Standard Token Rate Limits', description: 'Token rate limits for standard subscription tier with moderate throughput', type: 'Token Rate Limit Policy' },
  ],
  'research-unlimited': [
    { id: 'research-maas-auth', name: 'Research Team MaaS Auth', description: 'SSO authentication policy for research team members accessing AI models', type: 'MaaS Auth Policy' },
  ],
  'premium-external': [
    { id: 'prod-rate-limit-high', name: 'Production Rate Limit High', description: 'High throughput for production workloads: 10K requests/minute, 500K tokens/minute', type: 'Token Rate Limit Policy' },
  ],
};

export const getRelatedPolicies = (subscriptionId: string): RelatedPolicy[] =>
  mockRelatedPolicies[subscriptionId] || [];
