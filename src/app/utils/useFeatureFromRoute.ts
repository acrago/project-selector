import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { findFeatureForRoute } from './designData';

interface UseFeatureFromRouteResult {
  featureId: string | null;
  featureLabel: string | null;
}

export function useFeatureFromRoute(): UseFeatureFromRouteResult {
  const location = useLocation();

  return useMemo(() => {
    const mapping = findFeatureForRoute(location.pathname);
    if (mapping) {
      return { featureId: mapping.featureId, featureLabel: mapping.featureLabel };
    }
    return { featureId: null, featureLabel: null };
  }, [location.pathname]);
}
