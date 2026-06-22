export interface Tier {
  id: string;
  name: string;
  status: string;
}

export const mockTiers: Tier[] = [
  { id: 'tier-1', name: 'Tier 1', status: 'Active' },
  { id: 'tier-2', name: 'Tier 2', status: 'Active' },
  { id: 'tier-3', name: 'Tier 3', status: 'Active' },
  { id: 'premium', name: 'Premium', status: 'Active' },
  { id: 'production', name: 'Production', status: 'Active' },
];
