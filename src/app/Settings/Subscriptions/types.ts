// Types based on MaaSSubscription CRD from the 3.4 architecture
// Reference: plan-subscriptions.md

export interface TokenRateLimit {
  limit: number; // Token limit for this model
  window: string; // Time window (e.g., "24h", "2m") - legacy format
  perAmount?: number; // Time amount (e.g., 1, 5, 10)
  perUnit?: 'minute' | 'hour' | 'day'; // Time unit
}

export interface BillingRate {
  perToken: number; // Cost per token
}

export interface RequestRateLimit {
  requests: number; // Number of requests allowed
  perAmount: number; // Time amount (e.g., 1, 5, 10)
  perUnit: 'minute' | 'hour' | 'day'; // Time unit
}

export interface ModelRef {
  name: string; // Model name (references MaaSModel)
  tokenRateLimits: TokenRateLimit | TokenRateLimit[]; // Single limit or array of limits
  requestRateLimits?: RequestRateLimit | RequestRateLimit[]; // Single limit or array of limits
  billingRate?: BillingRate;
}

export interface BillingMetadata {
  organizationId?: string;
  costCenter?: string;
  labels?: Record<string, string>;
}

export interface OwnerGroup {
  name: string;
}

export type SubscriptionStatus = 'Active' | 'Pending' | 'Inactive';

export interface Subscription {
  id: string;
  name: string; // metadata.name
  displayName: string; // spec.displayName
  description?: string;
  priority: number; // 1–10; higher = higher priority; used when resolving defaults across multiple subscriptions.
  status: SubscriptionStatus;
  owner: {
    groups: OwnerGroup[];
  };
  modelRefs: ModelRef[];
  billingMetadata?: BillingMetadata;
  dateCreated: Date;
  createdBy: string;
  yaml?: string; // Generated YAML representation
}

export interface CreateSubscriptionForm {
  name: string;
  displayName: string;
  description?: string;
  priority: number;
  owner: {
    groups: OwnerGroup[];
  };
  modelRefs: ModelRef[];
  billingMetadata?: BillingMetadata;
}
