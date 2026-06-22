import * as React from 'react';

const STORAGE_KEY_OPEN = 'contextPanel_open';
const STORAGE_KEY_TAB = 'contextPanel_activeTab';
const VALID_TABS = ['discussions', 'details', 'journeys', 'history', 'sources', 'more'];

export interface ContextPanelContextType {
  contextPanelOpen: boolean;
  setContextPanelOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openToDiscussions: () => void;
}

const ContextPanelContext = React.createContext<ContextPanelContextType | undefined>(undefined);

export function useContextPanel(): ContextPanelContextType {
  const ctx = React.useContext(ContextPanelContext);
  if (ctx === undefined) {
    throw new Error('useContextPanel must be used within ContextPanelProvider');
  }
  return ctx;
}

interface ContextPanelProviderProps {
  children: React.ReactNode;
  defaultTab?: string;
  isDiscussionsEnabled?: boolean;
}

export const ContextPanelProvider: React.FunctionComponent<ContextPanelProviderProps> = ({
  children,
  defaultTab = 'details',
  isDiscussionsEnabled = false,
}) => {
  const [contextPanelOpen, setContextPanelOpen] = React.useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_OPEN) === 'true';
  });

  const [activeTab, setActiveTab] = React.useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_TAB);
    return stored && VALID_TABS.includes(stored) ? stored : defaultTab;
  });

  /** Tracks prior enableDiscussions so we open to Discussions on first load and when the flag turns on */
  const discussionsFlagPrevRef = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    if (!isDiscussionsEnabled) {
      discussionsFlagPrevRef.current = false;
      return;
    }
    const shouldOpenToDiscussions =
      discussionsFlagPrevRef.current === null || discussionsFlagPrevRef.current === false;
    if (shouldOpenToDiscussions) {
      setContextPanelOpen(true);
      setActiveTab('discussions');
    }
    discussionsFlagPrevRef.current = true;
  }, [isDiscussionsEnabled]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPEN, String(contextPanelOpen));
  }, [contextPanelOpen]);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TAB, activeTab);
  }, [activeTab]);

  const openToDiscussions = React.useCallback(() => {
    setContextPanelOpen(true);
    setActiveTab('discussions');
  }, []);

  const value = React.useMemo<ContextPanelContextType>(
    () => ({
      contextPanelOpen,
      setContextPanelOpen,
      activeTab,
      setActiveTab,
      openToDiscussions,
    }),
    [contextPanelOpen, activeTab, openToDiscussions]
  );

  return (
    <ContextPanelContext.Provider value={value}>
      {children}
    </ContextPanelContext.Provider>
  );
};
