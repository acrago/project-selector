import * as React from 'react';
import { Prompt, PromptVersion } from '../types';
import { mockPrompts } from '../mockData';

interface PromptLabContextValue {
  prompts: Prompt[];
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  addVersion: (promptId: string, version: PromptVersion) => void;
  deleteVersion: (promptId: string, versionId: string) => void;
  getPrompt: (id: string) => Prompt | undefined;
}

const PromptLabContext = React.createContext<PromptLabContextValue | undefined>(
  undefined
);

export const usePromptLab = (): PromptLabContextValue => {
  const context = React.useContext(PromptLabContext);
  if (!context) {
    throw new Error('usePromptLab must be used within a PromptLabProvider');
  }
  return context;
};

interface PromptLabProviderProps {
  children: React.ReactNode;
}

export const PromptLabProvider: React.FunctionComponent<PromptLabProviderProps> = ({
  children,
}) => {
  const [prompts, setPrompts] = React.useState<Prompt[]>(mockPrompts);

  const addPrompt = React.useCallback((prompt: Prompt) => {
    setPrompts((prev) => [...prev, prompt]);
  }, []);

  const updatePrompt = React.useCallback((id: string, updates: Partial<Prompt>) => {
    setPrompts((prev) =>
      prev.map((prompt) =>
        prompt.id === id ? { ...prompt, ...updates } : prompt
      )
    );
  }, []);

  const deletePrompt = React.useCallback((id: string) => {
    setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
  }, []);

  const addVersion = React.useCallback((promptId: string, version: PromptVersion) => {
    setPrompts((prev) =>
      prev.map((prompt) =>
        prompt.id === promptId
          ? {
              ...prompt,
              versions: [...prompt.versions, version],
              latestVersion: version.versionNumber,
              lastModified: new Date(),
            }
          : prompt
      )
    );
  }, []);

  const deleteVersion = React.useCallback((promptId: string, versionId: string) => {
    setPrompts((prev) =>
      prev.map((prompt) =>
        prompt.id === promptId
          ? {
              ...prompt,
              versions: prompt.versions.filter((v) => v.id !== versionId),
            }
          : prompt
      )
    );
  }, []);

  const getPrompt = React.useCallback(
    (id: string) => {
      return prompts.find((prompt) => prompt.id === id);
    },
    [prompts]
  );

  const value: PromptLabContextValue = {
    prompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    addVersion,
    deleteVersion,
    getPrompt,
  };

  return (
    <PromptLabContext.Provider value={value}>
      {children}
    </PromptLabContext.Provider>
  );
};

