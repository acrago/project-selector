import * as React from 'react';

interface PlaygroundMastheadContextValue {
  mastheadSlot: React.ReactNode;
  setMastheadSlot: (slot: React.ReactNode) => void;
}

const PlaygroundMastheadContext = React.createContext<PlaygroundMastheadContextValue | null>(null);

export const PlaygroundMastheadProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const [mastheadSlot, setMastheadSlot] = React.useState<React.ReactNode>(null);
  const value = React.useMemo(() => ({ mastheadSlot, setMastheadSlot }), [mastheadSlot]);
  return (
    <PlaygroundMastheadContext.Provider value={value}>
      {children}
    </PlaygroundMastheadContext.Provider>
  );
};

export const usePlaygroundMasthead = (): PlaygroundMastheadContextValue | null =>
  React.useContext(PlaygroundMastheadContext);
