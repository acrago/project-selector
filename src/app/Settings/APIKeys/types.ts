export type APIKeyStatus = 'Active' | 'Expired' | 'Disabled' | 'Inactive' | 'AdminRevoked';

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  tier: string;
  models: string[];
}

export interface APIKey {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  status: APIKeyStatus;
  subscriptionId?: string;
  subscriptionName?: string;
  owner: {
    type: 'User' | 'Group' | 'Service Account';
    name: string;
  };
  dateCreated: Date;
  dateLastUsed?: Date;
  limits?: {
    tokenRateLimit?: number; // tokens per minute
    requestRateLimit?: number; // requests per minute
    budgetLimit?: number;
    expirationDate?: Date;
  };
  assets: {
    modelEndpoints: string[];
  };
}

// Cluster configuration for expiration limits
export interface ClusterConfig {
  maxApiKeyExpirationDays: number;
}

export interface Model {
  id: string;
  name: string;
  endpoint: string;
}

export type PolicyType = 'AuthPolicy' | 'RateLimitPolicy' | 'TLSPolicy' | 'DNSPolicy';

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
}

export interface MetricData {
  timestamp: Date;
  value: number;
}

export interface APIKeyMetrics {
  totalRequests: number;
  successRate: number;
  totalTokens: number;
  totalCost: number;
  requestsOverTime: MetricData[];
}

export type TimeRange = '24h' | '7d' | '30d';

export interface CreateAPIKeyForm {
  name: string;
  description?: string;
  subscriptionId?: string;
  owner: {
    type: 'User' | 'Group' | 'Service Account';
    name: string;
  };
  limits?: {
    tokenRateLimit?: number;
    requestRateLimit?: number;
    budgetLimit?: number;
    expirationDate?: Date;
  };
  assets: {
    modelEndpoints: string[];
  };
}

// Usage/Activity log entry for API keys
export interface APIKeyUsageEntry {
  id: string;
  timestamp: Date;
  action: string;
  endpoint?: string;
  statusCode?: number;
  tokensUsed?: number;
  model?: string;
}
