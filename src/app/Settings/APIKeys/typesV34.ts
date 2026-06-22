export type ApiKeyStatusV34 = 'active' | 'revoked' | 'expired';

export interface ApiKeyV34 {
  id: string;
  name: string;
  description?: string;
  username: string;
  groups?: string[];
  keyPrefix: string;
  creationDate: Date;
  expirationDate?: Date;
  status: ApiKeyStatusV34;
  lastUsedAt?: Date;
  subscriptionId?: string;
  subscriptionName?: string;
}
