import * as React from 'react';
import { useLocation } from 'react-router-dom';

// Define variant flag categories and their options
export interface VariantFlagOption {
  id: string;
  label: string;
  description?: string;
}

export interface VariantFlagCategory {
  id: string;
  label: string;
  options: VariantFlagOption[];
  // Paths that should show this category in the dropdown
  pathPatterns: RegExp[];
}

// Define all variant flag categories
export const variantFlagCategories: VariantFlagCategory[] = [
  {
    id: 'subscriptionDetails',
    label: 'Subscription details',
    options: [
      {
        id: 'inlineEditing',
        label: 'Inline editing',
        description: 'Enable inline editing for display name, description, groups, and models on the details page',
      },
    ],
    pathPatterns: [/^\/settings\/subscriptions\/[^/]+/],
  },
];

// Type for storing enabled variant flags
export interface VariantFlags {
  subscriptionDetails: {
    inlineEditing: boolean;
  };
}

const defaultVariantFlags: VariantFlags = {
  subscriptionDetails: {
    inlineEditing: false,
  },
};

interface VariantFlagsContextType {
  variantFlags: VariantFlags;
  toggleVariantFlag: (categoryId: string, optionId: string) => void;
  isVariantFlagEnabled: (categoryId: string, optionId: string) => boolean;
  getActiveCategories: () => VariantFlagCategory[];
  hasActiveCategories: () => boolean;
}

const VariantFlagsContext = React.createContext<VariantFlagsContextType | undefined>(undefined);

export const VariantFlagsProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  const [variantFlags, setVariantFlags] = React.useState<VariantFlags>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('variantFlags');
    return saved ? { ...defaultVariantFlags, ...JSON.parse(saved) } : defaultVariantFlags;
  });

  const toggleVariantFlag = React.useCallback((categoryId: string, optionId: string) => {
    setVariantFlags((prev) => {
      const newFlags = { ...prev };
      if (categoryId in newFlags) {
        const category = newFlags[categoryId as keyof VariantFlags];
        if (typeof category === 'object' && optionId in category) {
          (category as Record<string, boolean>)[optionId] = !(category as Record<string, boolean>)[optionId];
        }
      }
      localStorage.setItem('variantFlags', JSON.stringify(newFlags));
      return newFlags;
    });
  }, []);

  const isVariantFlagEnabled = React.useCallback((categoryId: string, optionId: string): boolean => {
    if (categoryId in variantFlags) {
      const category = variantFlags[categoryId as keyof VariantFlags];
      if (typeof category === 'object' && optionId in category) {
        return (category as Record<string, boolean>)[optionId];
      }
    }
    return false;
  }, [variantFlags]);

  const getActiveCategories = React.useCallback((): VariantFlagCategory[] => {
    const currentPath = location.pathname;
    return variantFlagCategories.filter((category) =>
      category.pathPatterns.some((pattern) => pattern.test(currentPath))
    );
  }, [location.pathname]);

  const hasActiveCategories = React.useCallback((): boolean => {
    return getActiveCategories().length > 0;
  }, [getActiveCategories]);

  const contextValue = React.useMemo(
    () => ({
      variantFlags,
      toggleVariantFlag,
      isVariantFlagEnabled,
      getActiveCategories,
      hasActiveCategories,
    }),
    [variantFlags, toggleVariantFlag, isVariantFlagEnabled, getActiveCategories, hasActiveCategories]
  );

  return (
    <VariantFlagsContext.Provider value={contextValue}>
      {children}
    </VariantFlagsContext.Provider>
  );
};

export const useVariantFlags = (): VariantFlagsContextType => {
  const context = React.useContext(VariantFlagsContext);
  if (context === undefined) {
    throw new Error('useVariantFlags must be used within a VariantFlagsProvider');
  }
  return context;
};
