import { APIKey, APIKeyMetrics, APIKeyUsageEntry, ClusterConfig, Model, Policy, Subscription } from './types';

// Cluster configuration for API key expiration limits
export const mockClusterConfig: ClusterConfig = {
  maxApiKeyExpirationDays: 365, // Maximum 1 year
};

// Available subscriptions (matching the IDs from Subscriptions area)
export const mockSubscriptions: Subscription[] = [
  {
    id: 'enterprise-tier',
    name: 'Enterprise Subscription',
    description: 'High-priority subscription for enterprise AI workloads with premium rate limits',
    tier: 'Enterprise',
    models: ['gpt-oss-20b', 'granite-3.1b', 'llama-7b', 'codellama-13b', 'mistral-7b'],
  },
  {
    id: 'standard-tier',
    name: 'Standard Subscription',
    description: 'Standard access tier for general AI development workloads',
    tier: 'Standard',
    models: ['granite-3.1b', 'llama-7b', 'mistral-7b'],
  },
  {
    id: 'research-unlimited',
    name: 'Research Unlimited',
    description: 'Unlimited access for research team with no rate limits',
    tier: 'Research',
    models: ['codellama-13b', 'mistral-7b', 'llama-7b'],
  },
  {
    id: 'dev-sandbox',
    name: 'Developer Sandbox',
    description: 'Low-priority sandbox for experimentation and development',
    tier: 'Developer',
    models: ['granite-3.1b', 'mistral-7b'],
  },
];

// Available models
export const mockModels: Model[] = [
  { id: 'gpt-oss-20b', name: 'GPT-OSS 20B', endpoint: 'https://api.example.com/models/gpt-oss-20b/v1' },
  { id: 'granite-3.1b', name: 'Granite 3.1B', endpoint: 'https://api.example.com/models/granite-3.1b/v1' },
  { id: 'llama-7b', name: 'Llama 7B', endpoint: 'https://api.example.com/models/llama-7b/v1' },
  { id: 'codellama-13b', name: 'CodeLlama 13B', endpoint: 'https://api.example.com/models/codellama-13b/v1' },
  { id: 'mistral-7b', name: 'Mistral 7B', endpoint: 'https://api.example.com/models/mistral-7b/v1' },
];

// Available policies
export const mockPolicies: Policy[] = [
  { id: 'devs-rate-limit-standard', name: 'Developer Rate Limit Standard', description: 'Standard rate limiting for development teams: 1000 requests/minute, 50K tokens/minute', type: 'RateLimitPolicy' },
  { id: 'devs-budget-standard', name: 'Developer Budget Standard', description: 'Monthly budget cap of $500 for development API usage', type: 'RateLimitPolicy' },
  { id: 'prod-rate-limit-high', name: 'Production Rate Limit High', description: 'High throughput for production workloads: 10K requests/minute, 500K tokens/minute', type: 'RateLimitPolicy' },
  { id: 'security-data-classification', name: 'Security Data Classification', description: 'Restricts access to models based on data classification levels', type: 'AuthPolicy' },
  { id: 'compliance-audit-logging', name: 'Compliance Audit Logging', description: 'Enhanced logging for compliance and audit requirements', type: 'AuthPolicy' },
  { id: 'cost-optimization', name: 'Cost Optimization Policy', description: 'Automatic model selection based on cost-effectiveness for the task', type: 'DNSPolicy' },
];

// Mock users for admin owner search
export const mockUsers: { id: string; name: string; displayName: string }[] = [
  { id: 'user-1', name: 'abraren', displayName: 'Abraham Renner' },
  { id: 'user-2', name: 'ngrambich', displayName: 'Natalie Grambich' },
  { id: 'user-3', name: 'cschumer', displayName: 'Chris Schumer' },
  { id: 'user-4', name: 'jsmith', displayName: 'Jordan Smith' },
  { id: 'user-5', name: 'mwilliams', displayName: 'Morgan Williams' },
  { id: 'user-6', name: 'klee', displayName: 'Kevin Lee' },
  { id: 'user-7', name: 'celtan', displayName: 'Celtan' },
  { id: 'user-8', name: 'datascientist', displayName: 'Dana Scientist' },
  { id: 'user-9', name: 'admin', displayName: 'Admin User' },
];

// Mock service accounts for search
export const mockServiceAccounts: { id: string; name: string; description: string }[] = [
  { id: 'sa-1', name: 'ci-pipeline-bot', description: 'CI/CD automation service account' },
  { id: 'sa-2', name: 'ml-training-runner', description: 'ML training job executor' },
  { id: 'sa-3', name: 'model-serving-agent', description: 'Model serving automation' },
  { id: 'sa-4', name: 'data-pipeline-worker', description: 'Data pipeline processing service' },
  { id: 'sa-5', name: 'monitoring-collector', description: 'Metrics and logs collector' },
  { id: 'sa-6', name: 'backup-automation', description: 'Scheduled backup service' },
  { id: 'sa-7', name: 'api-gateway-proxy', description: 'API gateway proxy service' },
  { id: 'sa-8', name: 'notification-service', description: 'Alert and notification handler' },
];

// Mock API keys for AI Engineer view (only their own keys)
export const mockAPIKeysAIEngineer: APIKey[] = [
  {
    id: 'key-0',
    name: 'Personal Key',
    description: 'Personal development and testing key for local experiments',
    apiKey: 'sk-personal0123456789abcdefghijklmn',
    status: 'Active',
    subscriptionId: 'standard-tier',
    subscriptionName: 'Standard Subscription',
    owner: { type: 'User', name: 'celtan' },
    dateCreated: new Date('2025-10-01T08:00:00Z'),
    dateLastUsed: new Date('2026-01-25T09:15:00Z'),
    limits: {
      tokenRateLimit: 10000,
      requestRateLimit: 100,
      budgetLimit: 100,
      expirationDate: new Date('2026-01-20T08:00:00Z'),
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b'],
    },
  },
  {
    id: 'key-2',
    name: 'Dark Net Key',
    description: "I'm gonna put this all over the place you can't stop me.",
    apiKey: 'sk-abcdef1234567890abcdef1234567890',
    status: 'AdminRevoked',
    subscriptionId: 'enterprise-tier',
    subscriptionName: 'Enterprise Subscription',
    owner: { type: 'User', name: 'celtan' },
    dateCreated: new Date('2025-10-12T10:30:00Z'),
    dateLastUsed: new Date('2026-01-25T10:30:00Z'),
    limits: {
      tokenRateLimit: 500000,
      requestRateLimit: 10000,
      budgetLimit: 2000,
      expirationDate: new Date('2026-01-10T08:15:00Z'),
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b', 'granite-3.1b', 'mistral-7b'],
    },
  },
  {
    id: 'key-5',
    name: 'Playground',
    description: 'Key for interactive playground testing and demos',
    apiKey: 'sk-playground0987654321fedcbafedcba',
    status: 'Active',
    subscriptionId: 'enterprise-tier',
    subscriptionName: 'Enterprise Subscription',
    owner: { type: 'User', name: 'celtan' },
    dateCreated: new Date('2025-10-10T14:00:00Z'),
    dateLastUsed: new Date('2026-01-25T14:00:00Z'),
    limits: {
      tokenRateLimit: 100000,
      requestRateLimit: 2000,
      budgetLimit: 1000,
      expirationDate: undefined,
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b', 'granite-3.1b', 'llama-7b'],
    },
  },
  {
    id: 'key-13',
    name: 'Ye Olden Key',
    description: 'Keeping this key around for good luck',
    apiKey: 'sk-devtest0987654321abcdefghijklmno',
    status: 'Expired',
    subscriptionId: 'dev-sandbox',
    subscriptionName: 'Developer Sandbox',
    owner: { type: 'User', name: 'celtan' },
    dateCreated: new Date('2021-06-15T11:00:00Z'),
    dateLastUsed: new Date('2021-12-20T11:00:00Z'),
    limits: {
      tokenRateLimit: 25000,
      requestRateLimit: 500,
      budgetLimit: 250,
      expirationDate: new Date('2021-12-20T11:00:00Z'),
    },
    assets: {
      modelEndpoints: ['granite-3.1b', 'mistral-7b'],
    },
  },
  {
    id: 'key-14',
    name: 'Experimental Features',
    description: 'Testing new model capabilities',
    apiKey: 'sk-experimental123456789abcdefghij',
    status: 'Expired',
    subscriptionId: 'standard-tier',
    subscriptionName: 'Standard Subscription',
    owner: { type: 'User', name: 'celtan' },
    dateCreated: new Date('2026-01-20T09:00:00Z'),
    dateLastUsed: new Date('2026-01-25T14:30:00Z'),
    limits: {
      tokenRateLimit: 15000,
      requestRateLimit: 300,
      budgetLimit: 150,
      expirationDate: new Date('2026-02-20T09:00:00Z'),
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b', 'llama-7b'],
    },
  },
  {
    id: 'key-15',
    name: 'Legacy Batch Processing',
    description: 'Old batch job key - no longer in active use',
    apiKey: 'sk-batchproc987654321abcdefghijklm',
    status: 'Inactive',
    subscriptionId: 'dev-sandbox',
    subscriptionName: 'Developer Sandbox',
    owner: { type: 'User', name: 'celtan' },
    dateCreated: new Date('2025-05-10T10:00:00Z'),
    dateLastUsed: new Date('2025-09-15T16:45:00Z'),
    limits: {
      tokenRateLimit: 20000,
      requestRateLimit: 400,
      budgetLimit: 200,
      expirationDate: new Date('2026-05-10T10:00:00Z'),
    },
    assets: {
      modelEndpoints: ['granite-3.1b'],
    },
  },
  {
    id: 'key-16',
    name: 'Model Serving Automation',
    description: 'Service account key for automated model deployment and serving tasks',
    apiKey: 'sk-modelserving123456789abcdefghij',
    status: 'Active',
    subscriptionId: 'enterprise-tier',
    subscriptionName: 'Enterprise Subscription',
    owner: { type: 'Service Account', name: 'model-serving-agent' },
    dateCreated: new Date('2025-12-01T10:00:00Z'),
    dateLastUsed: new Date('2026-01-28T15:30:00Z'),
    limits: {
      tokenRateLimit: 80000,
      requestRateLimit: 1600,
      budgetLimit: 800,
      expirationDate: new Date('2026-12-01T10:00:00Z'),
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b', 'granite-3.1b', 'llama-7b'],
    },
  },
];

// Mock API keys for AI Admin view (all users' keys)
export const mockAPIKeysAdmin: APIKey[] = [
  {
    id: 'key-0',
    name: 'Personal Key',
    description: 'Personal development and testing key for local experiments',
    apiKey: 'sk-personal0123456789abcdefghijklmn',
    status: 'Active',
    subscriptionId: 'standard-tier',
    subscriptionName: 'Standard Subscription',
    owner: { type: 'User', name: 'abraren' },
    dateCreated: new Date('2025-10-01T08:00:00Z'),
    dateLastUsed: new Date('2026-01-25T09:15:00Z'),
    limits: {
      tokenRateLimit: 10000,
      requestRateLimit: 100,
      budgetLimit: 100,
      expirationDate: new Date('2026-01-20T08:00:00Z'),
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b'],
    },
  },
  {
    id: 'key-2',
    name: 'Production Workloads',
    description: 'High-throughput key for production customer-facing applications',
    apiKey: 'sk-abcdef1234567890abcdef1234567890',
    status: 'Active',
    subscriptionId: 'enterprise-tier',
    subscriptionName: 'Enterprise Subscription',
    owner: { type: 'User', name: 'ngrambich' },
    dateCreated: new Date('2025-10-12T10:30:00Z'),
    dateLastUsed: new Date('2026-01-25T10:30:00Z'),
    limits: {
      tokenRateLimit: 500000,
      requestRateLimit: 10000,
      budgetLimit: 2000,
      expirationDate: new Date('2026-01-10T08:15:00Z'),
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b', 'granite-3.1b', 'mistral-7b'],
    },
  },
  {
    id: 'key-3',
    name: 'Research Project',
    description: 'Key for ML research team experiments with code generation models',
    apiKey: 'sk-fedcba0987654321fedcba0987654321',
    status: 'Expired',
    subscriptionId: 'research-unlimited',
    subscriptionName: 'Research Unlimited',
    owner: { type: 'User', name: 'cschumer' },
    dateCreated: new Date('2025-10-12T10:30:00Z'),
    dateLastUsed: new Date('2026-01-25T10:30:00Z'),
    limits: {
      tokenRateLimit: 25000,
      requestRateLimit: 500,
      budgetLimit: 200,
      expirationDate: new Date('2026-01-18T14:20:00Z'),
    },
    assets: {
      modelEndpoints: ['codellama-13b', 'mistral-7b'],
    },
  },
  {
    id: 'key-4',
    name: 'Legacy Integration',
    description: 'Deprecated key from old integration - pending removal',
    apiKey: 'sk-expired123456789abcdefghijklmno',
    status: 'Expired',
    subscriptionId: 'dev-sandbox',
    subscriptionName: 'Developer Sandbox',
    owner: { type: 'User', name: 'jsmith' },
    dateCreated: new Date('2024-08-10T10:00:00Z'),
    dateLastUsed: new Date('2026-01-25T08:45:00Z'),
    limits: {
      tokenRateLimit: 15000,
      requestRateLimit: 300,
      budgetLimit: 150,
      expirationDate: new Date('2024-09-10T10:00:00Z'),
    },
    assets: {
      modelEndpoints: ['llama-7b'],
    },
  },
  {
    id: 'key-5',
    name: 'Playground',
    description: 'Key for interactive playground testing and demos',
    apiKey: 'sk-playground0987654321fedcbafedcba',
    status: 'Active',
    subscriptionId: 'enterprise-tier',
    subscriptionName: 'Enterprise Subscription',
    owner: { type: 'User', name: 'abraren' },
    dateCreated: new Date('2025-10-10T14:00:00Z'),
    dateLastUsed: new Date('2026-01-25T14:00:00Z'),
    limits: {
      tokenRateLimit: 100000,
      requestRateLimit: 2000,
      budgetLimit: 1000,
      expirationDate: undefined,
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b', 'granite-3.1b', 'llama-7b'],
    },
  },
  {
    id: 'key-6',
    name: 'Customer Support Bot',
    description: 'Key associated with deleted tier - requires reassignment',
    apiKey: 'sk-orphaned0987654321abcdefghijklmn',
    status: 'Active',
    subscriptionId: undefined,
    subscriptionName: undefined,
    owner: { type: 'User', name: 'mwilliams' },
    dateCreated: new Date('2021-07-07T10:00:00Z'),
    dateLastUsed: new Date('2022-07-07T14:30:00Z'),
    limits: {
      tokenRateLimit: 30000,
      requestRateLimit: 600,
      budgetLimit: 300,
      expirationDate: new Date('2026-03-15T10:00:00Z'),
    },
    assets: {
      modelEndpoints: ['granite-3.1b'],
    },
  },
  {
    id: 'key-7',
    name: 'CI/CD Pipeline',
    description: 'Service account key for automated testing and deployments',
    apiKey: 'sk-cicd0987654321abcdefghijklmnopqr',
    status: 'AdminRevoked',
    subscriptionId: 'enterprise-tier',
    subscriptionName: 'Enterprise Subscription',
    owner: { type: 'Service Account', name: 'ci-pipeline-bot' },
    dateCreated: new Date('2025-08-20T10:00:00Z'),
    dateLastUsed: new Date('2026-01-25T14:30:00Z'),
    limits: {
      tokenRateLimit: 50000,
      requestRateLimit: 1000,
      budgetLimit: 500,
      expirationDate: new Date('2026-08-20T10:00:00Z'),
    },
    assets: {
      modelEndpoints: ['granite-3.1b', 'codellama-13b'],
    },
  },
  {
    id: 'key-8',
    name: 'Data Pipeline Key',
    description: 'Service account for ETL and data processing workflows',
    apiKey: 'sk-datapipe123456789abcdefghijklmn',
    status: 'Active',
    subscriptionId: 'enterprise-tier',
    subscriptionName: 'Enterprise Subscription',
    owner: { type: 'Service Account', name: 'data-pipeline-worker' },
    dateCreated: new Date('2025-09-15T09:00:00Z'),
    dateLastUsed: new Date('2026-01-28T11:30:00Z'),
    limits: {
      tokenRateLimit: 75000,
      requestRateLimit: 1500,
      budgetLimit: 750,
      expirationDate: new Date('2026-09-15T09:00:00Z'),
    },
    assets: {
      modelEndpoints: ['granite-3.1b', 'llama-7b'],
    },
  },
  {
    id: 'key-9',
    name: 'ML Training Runner',
    description: 'Automated model training and fine-tuning jobs',
    apiKey: 'sk-mltraining987654321abcdefghijklm',
    status: 'Active',
    subscriptionId: 'research-unlimited',
    subscriptionName: 'Research Unlimited',
    owner: { type: 'Service Account', name: 'ml-training-runner' },
    dateCreated: new Date('2025-11-01T14:00:00Z'),
    dateLastUsed: new Date('2026-01-27T16:45:00Z'),
    limits: {
      tokenRateLimit: 200000,
      requestRateLimit: 5000,
      budgetLimit: 2000,
      expirationDate: undefined,
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b', 'codellama-13b', 'mistral-7b'],
    },
  },
  {
    id: 'key-10',
    name: 'Analytics Dashboard',
    description: 'Key for internal analytics and reporting dashboard',
    apiKey: 'sk-analytics0987654321fedcbaabcdef',
    status: 'Active',
    subscriptionId: 'standard-tier',
    subscriptionName: 'Standard Subscription',
    owner: { type: 'User', name: 'klee' },
    dateCreated: new Date('2025-12-05T10:00:00Z'),
    dateLastUsed: new Date('2026-01-28T09:00:00Z'),
    limits: {
      tokenRateLimit: 20000,
      requestRateLimit: 400,
      budgetLimit: 200,
      expirationDate: new Date('2026-06-05T10:00:00Z'),
    },
    assets: {
      modelEndpoints: ['granite-3.1b'],
    },
  },
  {
    id: 'key-11',
    name: 'Chatbot Integration',
    description: 'Customer-facing chatbot powered by LLM',
    apiKey: 'sk-chatbot123456789fedcbaabcdefghi',
    status: 'Active',
    subscriptionId: 'enterprise-tier',
    subscriptionName: 'Enterprise Subscription',
    owner: { type: 'User', name: 'ngrambich' },
    dateCreated: new Date('2025-11-20T08:30:00Z'),
    dateLastUsed: new Date('2026-01-28T14:20:00Z'),
    limits: {
      tokenRateLimit: 150000,
      requestRateLimit: 3000,
      budgetLimit: 1500,
      expirationDate: new Date('2026-05-20T08:30:00Z'),
    },
    assets: {
      modelEndpoints: ['gpt-oss-20b', 'mistral-7b'],
    },
  },
  {
    id: 'key-12',
    name: 'Code Review Assistant',
    description: 'Automated code review and suggestion tool',
    apiKey: 'sk-codereview098765432fedcbaabcdef',
    status: 'Inactive',
    subscriptionId: 'dev-sandbox',
    subscriptionName: 'Developer Sandbox',
    owner: { type: 'User', name: 'cschumer' },
    dateCreated: new Date('2025-06-15T11:00:00Z'),
    dateLastUsed: new Date('2025-10-01T09:30:00Z'),
    limits: {
      tokenRateLimit: 30000,
      requestRateLimit: 600,
      budgetLimit: 300,
      expirationDate: new Date('2026-06-15T11:00:00Z'),
    },
    assets: {
      modelEndpoints: ['codellama-13b'],
    },
  },
];

// Legacy export for backward compatibility (defaults to AI Engineer view)
export const mockAPIKeys: APIKey[] = mockAPIKeysAIEngineer;

// Generate mock metrics data
const generateMetricsOverTime = (days: number): { timestamp: Date; value: number }[] => {
  const data: { timestamp: Date; value: number }[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const value = Math.floor(Math.random() * 1000) + 100; // Random requests between 100-1100
    data.push({ timestamp, value });
  }
  return data;
};

// Mock metrics for each API key
export const mockMetrics: Record<string, APIKeyMetrics> = {
  'key-0': {
    totalRequests: 5423,
    successRate: 99.1,
    totalTokens: 234890,
    totalCost: 23.49,
    requestsOverTime: generateMetricsOverTime(30),
  },
  'key-1': {
    totalRequests: 45892,
    successRate: 98.2,
    totalTokens: 2340567,
    totalCost: 234.56,
    requestsOverTime: generateMetricsOverTime(30),
  },
  'key-2': {
    totalRequests: 158234,
    successRate: 99.7,
    totalTokens: 8923456,
    totalCost: 892.34,
    requestsOverTime: generateMetricsOverTime(30),
  },
  'key-3': {
    totalRequests: 12456,
    successRate: 97.8,
    totalTokens: 567890,
    totalCost: 56.79,
    requestsOverTime: generateMetricsOverTime(30),
  },
  'key-4': {
    totalRequests: 8234,
    successRate: 96.5,
    totalTokens: 423456,
    totalCost: 42.34,
    requestsOverTime: generateMetricsOverTime(30),
  },
  'key-5': {
    totalRequests: 15678,
    successRate: 99.5,
    totalTokens: 789234,
    totalCost: 78.92,
    requestsOverTime: generateMetricsOverTime(30),
  },
  'key-6': {
    totalRequests: 3421,
    successRate: 98.8,
    totalTokens: 145678,
    totalCost: 14.57,
    requestsOverTime: generateMetricsOverTime(30),
  },
};

// Get policies applied to an API key
export const getAPIKeyPolicies = (keyId: string): Policy[] => {
  switch (keyId) {
    case 'key-0':
      return [mockPolicies[0]]; // dev-rate-limit
    case 'key-1':
      return [mockPolicies[0], mockPolicies[1], mockPolicies[3]]; // dev-rate-limit, dev-budget, security
    case 'key-2':
      return [mockPolicies[2], mockPolicies[4], mockPolicies[5]]; // prod-rate-limit, audit-logging, cost-optimization
    case 'key-3':
      return [mockPolicies[0], mockPolicies[1]]; // dev-rate-limit, dev-budget
    case 'key-4':
      return []; // no policies (expired)
    case 'key-5':
      return [mockPolicies[0]]; // dev-rate-limit
    case 'key-6':
      return []; // no policies (orphaned)
    default:
      return [];
  }
};

// Utility functions for getting data by ID
export const getModelById = (id: string): Model | undefined => mockModels.find(m => m.id === id);
export const getAPIKeyById = (id: string): APIKey | undefined => mockAPIKeys.find(k => k.id === id);
export const getSubscriptionById = (id: string): Subscription | undefined => mockSubscriptions.find(s => s.id === id);

// Generate mock usage data for an API key
export const generateMockUsageData = (keyId: string): APIKeyUsageEntry[] => {
  const actions = ['API Call', 'Chat Completion', 'Text Generation', 'Embedding Request'];
  const models = ['gpt-oss-20b', 'granite-3.1b', 'llama-7b', 'codellama-13b', 'mistral-7b'];
  const endpoints = ['/v1/chat/completions', '/v1/completions', '/v1/embeddings'];
  const statusCodes = [200, 200, 200, 200, 200, 201, 400, 429, 500]; // Weighted towards success
  
  const entries: APIKeyUsageEntry[] = [];
  const now = new Date();
  
  // Generate 20 random usage entries over the last 7 days
  for (let i = 0; i < 20; i++) {
    const hoursAgo = Math.floor(Math.random() * 168); // Up to 7 days
    const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    entries.push({
      id: `usage-${keyId}-${i}`,
      timestamp,
      action: actions[Math.floor(Math.random() * actions.length)],
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      statusCode: statusCodes[Math.floor(Math.random() * statusCodes.length)],
      tokensUsed: Math.floor(Math.random() * 5000) + 100,
      model: models[Math.floor(Math.random() * models.length)],
    });
  }
  
  // Sort by timestamp descending (most recent first)
  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

