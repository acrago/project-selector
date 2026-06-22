import { ApiKeyV34 } from './typesV34';

const dynamicKeys: ApiKeyV34[] = [];

export const addDynamicKey = (key: ApiKeyV34): void => {
  dynamicKeys.unshift(key);
};

export const getDynamicKeys = (): ApiKeyV34[] => [...dynamicKeys];

export const findDynamicKey = (id: string): ApiKeyV34 | undefined =>
  dynamicKeys.find((k) => k.id === id);

export const revokeDynamicKey = (id: string): void => {
  const key = dynamicKeys.find((k) => k.id === id);
  if (key) {
    key.status = 'revoked';
  }
};
