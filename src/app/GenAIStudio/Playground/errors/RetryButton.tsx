import React from 'react';
import { AlertActionLink } from '@patternfly/react-core';

interface RetryButtonProps {
  onRetry: () => void;
  retryCount?: number;
}

export const RetryButton: React.FC<RetryButtonProps> = ({ onRetry, retryCount = 0 }) => (
  <AlertActionLink onClick={onRetry}>
    {retryCount > 0 ? 'Retry again' : 'Retry'}
  </AlertActionLink>
);
