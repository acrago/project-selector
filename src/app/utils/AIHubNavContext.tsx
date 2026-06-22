import * as React from 'react';

// Simplified context - only supporting 2-level tabs with full access
export type AIHubNavVariation = '2-level-tabs';
export type AIHubUserAccess = 'full';

export interface AIHubNavigationVariation {
  variation: AIHubNavVariation;
  access: AIHubUserAccess;
}

// Fixed to tabs with full access
const FIXED_VARIATION: AIHubNavigationVariation = {
  variation: '2-level-tabs',
  access: 'full',
};

interface AIHubNavContextType {
  selectedVariation: AIHubNavigationVariation;
}

const AIHubNavContext = React.createContext<AIHubNavContextType | undefined>(undefined);

export const AIHubNavProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = React.useMemo(
    () => ({
      selectedVariation: FIXED_VARIATION,
    }),
    [],
  );

  return <AIHubNavContext.Provider value={value}>{children}</AIHubNavContext.Provider>;
};

export const useAIHubNav = (): AIHubNavContextType => {
  const context = React.useContext(AIHubNavContext);
  if (!context) {
    throw new Error('useAIHubNav must be used within AIHubNavProvider');
  }
  return context;
};
