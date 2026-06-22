import * as React from 'react';

export interface FeatureFlags {
  showProjectWorkspaceDropdowns: boolean;
  agentBuilderMode: boolean;
  deploy: boolean;
  
  // Layout flags
  enableIDELayout: boolean;
  enableWorkflowLayout: boolean;
  
  // Agent Builder flags
  enableAgentTemplates: boolean;
  enableGuardrails: boolean;
  enableEvaluation: boolean;
  enableTracing: boolean;
  
  // MVP Mode flags
  enableMVPMode: boolean;
  enableKnowledge: boolean;
  enableMCP: boolean;
  enableGuardrailsCatalog: boolean;
  enableAdvancedPromptEngineering: boolean;
  enableAdvancedAgentManagement: boolean;
  showMcpFilters: boolean;
  showMcpConnectionUrl: boolean;
  mcpLifecycleOperatorNotInstalled: boolean;
  
  // Navigation flags
  showDiscoverAssets: boolean;
  
  // Data persistence
  persistData: boolean;
  
  // Table columns
  showModelDescriptions: boolean;
  
  // View switchers
  enableCardTableViewSwitcher: boolean;
  
  // Model pages
  enableModelDescriptionPages: boolean;
  
  // MCP pages
  enableMcpDetailsPage: boolean;
  
  // 3.5 Features
  enablePromptRegistry: boolean;
  
  // Model Catalog/Registry
  enableModelCatalogRegistry: boolean;
  
  // Navigation mode
  persistentTabSelection: boolean;
  
  // Playground features
  firstTimePlayground: boolean;
  
  // Model catalog features
  modelPerformanceInCatalog: boolean;
  
  // Gen AI Studio page access
  enableModelPlaygroundPage: boolean;
  enableMyAgentsPage: boolean;
  enablePromptEngineeringPage: boolean;
  enableKnowledgeSourcesPage: boolean;
  enableAutoRAG: boolean;
  
  // Guardrails
  guardrailUnavailableInCluster: boolean;
  
  // Discussions
  enableDiscussions: boolean;

  // Modifiable nav (apollo-style: reorder, add/remove, persist to localStorage)
  customNav: boolean;

  // Temporary release gates (restore by setting to true)
  showVectorStoreTags: boolean;
  showReasoningLevel: boolean;

  // MCP deploy modal: when on, show success message; when off, show failed deployment message (for prototype)
  successfulMcpDeployment: boolean;

  // Gen AI Studio 3.5 — Multimodal (RHAIRFE-913)
  enableMultimodalCapabilities: boolean;
  enableMultimodalInput: boolean;
  enableMultimodalOutput: boolean;

  // Gen AI Studio 3.5 — Playground Tracing (RHOAIUX-2173)
  enablePlaygroundTracing: boolean;
}

interface AgentBuilderState {
  selectedModel: string;
  selectedMcpServers: string[];
  selectedKnowledgeSources: string[];
  selectedGuardrails: {
    input: string | null;
    output: string | null;
  };
}

export type DashboardVariation = 'v1-echarts' | 'v2-patternfly' | 'v3-empty' | 'v4-table';
export type ApiKeysVariation = 'current' | 'v34' | 'v34-models-flat' | 'v34-models-table' | 'v34-scroll-preview' | 'v34-revoke-filter' | 'v34-checkboxes' | 'v34-expiry-limit' | 'v34-expiry-fallback';
export type McpDeploymentFlow = 'wizard' | 'modal';

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  defaultFlags: FeatureFlags;
  hasOverriddenFlags: boolean;
  updateFlag: (key: keyof FeatureFlags, value: boolean) => void;
  enableAllLayoutFlags: () => void;
  disableAllLayoutFlags: () => void;
  enableAllMVPFlags: () => void;
  disableAllMVPFlags: () => void;
  resetFlags: () => void;
  agentBuilder: AgentBuilderState;
  updateAgentBuilder: (updates: Partial<AgentBuilderState>) => void;
  selectedProject: string;
  setSelectedProject: (project: string) => void;
  dashboardVariation: DashboardVariation;
  setDashboardVariation: (v: DashboardVariation) => void;
  apiKeysVariation: ApiKeysVariation;
  setApiKeysVariation: (v: ApiKeysVariation) => void;
  mcpDeploymentFlow: McpDeploymentFlow;
  setMcpDeploymentFlow: (v: McpDeploymentFlow) => void;
}

/** All boolean flags default to off; designers opt in per toggle. */
const defaultFlags: FeatureFlags = {
  showProjectWorkspaceDropdowns: true,
  agentBuilderMode: true,
  deploy: false,

  enableIDELayout: false,
  enableWorkflowLayout: false,

  enableAgentTemplates: true,
  enableGuardrails: false,
  enableEvaluation: false,
  enableTracing: false,

  enableMVPMode: true,
  enableKnowledge: false,
  enableMCP: true,
  enableGuardrailsCatalog: false,
  enableAdvancedPromptEngineering: false,
  enableAdvancedAgentManagement: false,
  showMcpFilters: false,
  showMcpConnectionUrl: true,
  mcpLifecycleOperatorNotInstalled: false,

  showDiscoverAssets: false,

  persistData: false,

  showModelDescriptions: true,

  enableCardTableViewSwitcher: false,

  enableModelDescriptionPages: false,

  enableMcpDetailsPage: false,

  enablePromptRegistry: false,

  enableModelCatalogRegistry: true,

  persistentTabSelection: true,

  firstTimePlayground: false,

  modelPerformanceInCatalog: false,

  enableModelPlaygroundPage: false,
  enableMyAgentsPage: false,
  enablePromptEngineeringPage: false,
  enableKnowledgeSourcesPage: false,
  enableAutoRAG: false,

  guardrailUnavailableInCluster: false,

  enableDiscussions: false,

  customNav: false,

  successfulMcpDeployment: true,

  showVectorStoreTags: false,
  showReasoningLevel: false,

  enableMultimodalCapabilities: false,
  enableMultimodalInput: false,
  enableMultimodalOutput: false,

  enablePlaygroundTracing: false,
};

/** Removed from schema; strip from persisted localStorage so old keys do not linger */
const LEGACY_FEATURE_FLAG_KEYS = [
  'displayMode',
  'enableModelPlaygroundCard',
  'enablePromptEngineeringCard',
  'enableMyAgentsCard',
  'enableEvals',
  'enableGenerateApiKey',
  'deploymentWizardYAMLViewer',
] as const;

function stripLegacyFeatureFlags(raw: Record<string, unknown>): void {
  for (const key of LEGACY_FEATURE_FLAG_KEYS) {
    delete raw[key];
  }
}

/**
 * Bump this date to force-reset every user's localStorage feature flags back to defaults.
 * Saved flags with a _lastModified older than this (or missing) are discarded on load.
 */
const FEATURE_FLAGS_FORCE_RESET_DATE = '2026-04-27';

function isStaleLocalStorage(raw: Record<string, unknown>): boolean {
  const lastModified = raw._lastModified;
  if (typeof lastModified !== 'string') return true;
  return lastModified < FEATURE_FLAGS_FORCE_RESET_DATE;
}

function saveFeatureFlags(flags: FeatureFlags): void {
  localStorage.setItem(
    'featureFlags',
    JSON.stringify({ ...flags, _lastModified: new Date().toISOString() }),
  );
}

const defaultAgentBuilder: AgentBuilderState = {
  selectedModel: 'Claude 3 Opus',
  selectedMcpServers: [],
  selectedKnowledgeSources: [],
  selectedGuardrails: {
    input: null,
    output: null,
  },
};

const FeatureFlagsContext = React.createContext<FeatureFlagsContextType | undefined>(undefined);

export const FeatureFlagsProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = React.useState<FeatureFlags>(() => {
    const saved = localStorage.getItem('featureFlags');
    const parsed = saved ? (JSON.parse(saved) as Record<string, unknown>) : {};

    let baseFlags: FeatureFlags;

    if (saved && isStaleLocalStorage(parsed)) {
      localStorage.removeItem('featureFlags');
      baseFlags = { ...defaultFlags };
    } else {
      stripLegacyFeatureFlags(parsed);
      delete parsed._lastModified;
      baseFlags = saved ? ({ ...defaultFlags, ...parsed } as FeatureFlags) : { ...defaultFlags };
    }

    // URL parameter overrides still apply after a force-reset
    const urlParams = new URLSearchParams(window.location.search);
    const persistentTabParam = urlParams.get('persistentTabs');
    if (persistentTabParam !== null) {
      baseFlags.persistentTabSelection = persistentTabParam === 'true' || persistentTabParam === '1';
    }

    return baseFlags;
  });

  const [hasOverriddenFlags, setHasOverriddenFlags] = React.useState(() => !!localStorage.getItem('featureFlags'));

  const [agentBuilder, setAgentBuilder] = React.useState<AgentBuilderState>(() => {
    // Load from localStorage if available, otherwise use defaults
    const saved = localStorage.getItem('agentBuilderState');
    return saved ? { ...defaultAgentBuilder, ...JSON.parse(saved) } : defaultAgentBuilder;
  });

  const [selectedProject, setSelectedProjectState] = React.useState<string>(() => {
    const saved = localStorage.getItem('selectedProject');
    return saved ? JSON.parse(saved) : 'AI Platform Team';
  });

  const [dashboardVariation, setDashboardVariationState] = React.useState<DashboardVariation>('v4-table');
  const setDashboardVariation = React.useCallback((v: DashboardVariation) => {
    setDashboardVariationState(v);
  }, []);

  const [apiKeysVariation, setApiKeysVariationState] = React.useState<ApiKeysVariation>('v34-models-flat');
  const setApiKeysVariation = React.useCallback((v: ApiKeysVariation) => {
    setApiKeysVariationState(v);
  }, []);

  const [mcpDeploymentFlow, setMcpDeploymentFlowState] = React.useState<McpDeploymentFlow>(() => {
    const saved = localStorage.getItem('mcpDeploymentFlow');
    return (saved === 'wizard' || saved === 'modal' ? saved : 'modal') as McpDeploymentFlow;
  });
  const setMcpDeploymentFlow = React.useCallback((v: McpDeploymentFlow) => {
    setMcpDeploymentFlowState(v);
    localStorage.setItem('mcpDeploymentFlow', v);
  }, []);

  const updateFlag = React.useCallback((key: keyof FeatureFlags, value: boolean) => {
    setFlags(prev => {
      const newFlags = { ...prev, [key]: value };
      saveFeatureFlags(newFlags);
      return newFlags;
    });
    setHasOverriddenFlags(true);
  }, []);

  const updateAgentBuilder = React.useCallback((updates: Partial<AgentBuilderState>) => {
    setAgentBuilder(prev => {
      const newState = { ...prev, ...updates };
      // Persist to localStorage
      localStorage.setItem('agentBuilderState', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const setSelectedProject = React.useCallback((project: string) => {
    setSelectedProjectState(project);
    // Persist to localStorage
    localStorage.setItem('selectedProject', JSON.stringify(project));
  }, []);

  const enableAllLayoutFlags = React.useCallback(() => {
    setFlags(prev => {
      const newFlags = { 
        ...prev, 
        enableIDELayout: true,
        enableWorkflowLayout: true,
        enableMVPMode: true
      };
      saveFeatureFlags(newFlags);
      return newFlags;
    });
    setHasOverriddenFlags(true);
  }, []);

  const disableAllLayoutFlags = React.useCallback(() => {
    setFlags(prev => {
      const newFlags = { 
        ...prev, 
        enableIDELayout: false,
        enableWorkflowLayout: false,
        enableMVPMode: false
      };
      saveFeatureFlags(newFlags);
      return newFlags;
    });
    setHasOverriddenFlags(true);
  }, []);

  const enableAllMVPFlags = React.useCallback(() => {
    setFlags(prev => {
      const newFlags = { 
        ...prev, 
        enableKnowledge: true,
        enableMCP: true,
        enableGuardrailsCatalog: true,
        enableAdvancedPromptEngineering: true,
        enableAdvancedAgentManagement: true,
      };
      saveFeatureFlags(newFlags);
      return newFlags;
    });
    setHasOverriddenFlags(true);
  }, []);

  const disableAllMVPFlags = React.useCallback(() => {
    setFlags(prev => {
      const newFlags = { 
        ...prev, 
        enableKnowledge: false,
        enableMCP: false,
        enableGuardrailsCatalog: false,
        enableAdvancedPromptEngineering: false,
        enableAdvancedAgentManagement: false,
      };
      saveFeatureFlags(newFlags);
      return newFlags;
    });
    setHasOverriddenFlags(true);
  }, []);

  const resetFlags = React.useCallback(() => {
    setFlags(defaultFlags);
    localStorage.removeItem('featureFlags');
    setHasOverriddenFlags(false);
  }, []);

  const contextValue = React.useMemo(() => ({
    flags,
    defaultFlags,
    hasOverriddenFlags,
    updateFlag,
    enableAllLayoutFlags,
    disableAllLayoutFlags,
    enableAllMVPFlags,
    disableAllMVPFlags,
    resetFlags,
    agentBuilder,
    updateAgentBuilder,
    selectedProject,
    setSelectedProject,
    dashboardVariation,
    setDashboardVariation,
    apiKeysVariation,
    setApiKeysVariation,
    mcpDeploymentFlow,
    setMcpDeploymentFlow,
  }), [flags, hasOverriddenFlags, updateFlag, enableAllLayoutFlags, disableAllLayoutFlags, enableAllMVPFlags, disableAllMVPFlags, resetFlags, agentBuilder, updateAgentBuilder, selectedProject, setSelectedProject, dashboardVariation, setDashboardVariation, apiKeysVariation, setApiKeysVariation, mcpDeploymentFlow, setMcpDeploymentFlow]);

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = React.useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}; 