export type PolicyType = 'AuthPolicy' | 'RateLimitPolicy' | 'TLSPolicy' | 'DNSPolicy' | 'MaaSAuthPolicy';

export interface SubjectGroup {
  name: string;
}

export interface SubjectUser {
  name: string;
}

export interface Policy {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: PolicyType;
  status: 'Active' | 'Inactive';
  gitSource?: string;
  targets: {
    groups: string[];
    users: string[];
    serviceAccounts: string[];
  };
  subjects: {
    groups: SubjectGroup[];
    users: SubjectUser[];
  };
  modelRefs: string[];
  availableAssets: {
    models: string[];
  };
  limits: {
    tokenLimit?: {
      amount: number;
      period: 'minute' | 'hour' | 'day';
    };
    rateLimit?: {
      amount: number;
      period: 'minute' | 'hour' | 'day';
    };
    timeLimit?: {
      start: Date;
      end: Date;
    };
    quotaRenewalSchedule?: {
      startTime: 'dateCreated' | Date;
    };
    overLimitBehavior?: 'hard' | 'soft';
    softThrottlePercentage?: number;
  };
  dateCreated: Date;
  createdBy: string;
  yaml?: string;
}

export interface CreatePolicyFormData {
  name: string;
  displayName: string;
  description: string;
  subjects: {
    groups: SubjectGroup[];
    users: SubjectUser[];
  };
  modelRefs: string[];
}

export interface CreatePolicyForm {
  name: string;
  description: string;
  availableAssets: {
    models: string[];
  };
  limits: {
    tokenLimit?: {
      amount: number;
      period: 'minute' | 'hour' | 'day';
    };
    rateLimit?: {
      amount: number;
      period: 'minute' | 'hour' | 'day';
    };
    timeLimit?: {
      start: Date;
      end: Date;
    } | null;
  };
  targets: {
    groups: string[];
    users: string[];
    serviceAccounts: string[];
  };
}

