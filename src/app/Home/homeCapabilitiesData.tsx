import * as React from 'react';
import { ChartLineIcon } from '@patternfly/react-icons';
import {
  AIAssetEndpointsIcon,
  AutoRAGIcon,
  DeploymentsIcon,
  EvaluationsIcon,
  ExperimentsIcon,
  FeatureStoreIcon,
  KnowledgeSourcesIcon,
  ModelCatalogIcon,
  ModelRegistryIcon,
  PipelinesIcon,
  PlaygroundIcon,
  PromptLabIcon,
  WorkbenchesIcon,
} from './icons';
import AiHubNavIcon from '../../images/icons/AiHubNavIcon';
import GenAiStudioNavIcon from '../../images/icons/GenAiStudioNavIcon';
import DevelopAndTrainNavIcon from '../../images/icons/DevelopAndTrainNavIcon';

export type CapabilityCategory = 'ai-hub' | 'gen-ai' | 'develop' | 'observe';

export type HomeCapabilityEntry = {
  title: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
  isNew?: boolean;
  category: CapabilityCategory;
  onClick?: () => void;
};

/** Task typeahead menu: copy and order match the home task-assistant design spec. */
export type TaskAssistantMenuItem = {
  id: string;
  title: string;
  category: CapabilityCategory;
  path?: string;
  onClick?: () => void;
};

/** Order matches the Task assistant expanded column cards and typeahead groups. */
export const buildTaskAssistantMenuItems = (showModal: (message: string) => void): TaskAssistantMenuItem[] => [
  {
    id: 'task-menu-ai-hub-models',
    title: 'Find, register, and deploy models',
    category: 'ai-hub',
    path: '/ai-hub/models/catalog',
  },
  {
    id: 'task-menu-ai-hub-mcp',
    title: 'Deploy and discover MCP servers',
    category: 'ai-hub',
    onClick: () => showModal('This page does not exist yet'),
  },
  {
    id: 'task-menu-gen-chat',
    title: 'Chat with models',
    category: 'gen-ai',
    path: '/gen-ai-studio/playground',
  },
  {
    id: 'task-menu-gen-assets',
    title: 'Browse available AI assets',
    category: 'gen-ai',
    path: '/gen-ai-studio/asset-endpoints',
  },
  {
    id: 'task-menu-gen-rag',
    title: 'Create RAG pipelines',
    category: 'gen-ai',
    path: '/gen-ai-studio/autorag',
  },
  {
    id: 'task-menu-gen-prompts',
    title: 'Create and manage AI prompts',
    category: 'gen-ai',
    path: '/gen-ai-studio/prompt-lab',
  },
  {
    id: 'task-menu-gen-api-keys',
    title: 'Manage API keys',
    category: 'gen-ai',
    onClick: () => showModal('This page does not exist yet'),
  },
  {
    id: 'task-menu-dev-features',
    title: 'Build reusable ML features',
    category: 'develop',
    path: '/develop-train/feature-store/overview',
  },
  {
    id: 'task-menu-dev-evaluate',
    title: 'Evaluate models',
    category: 'develop',
    path: '/develop-train/evaluations',
  },
  {
    id: 'task-menu-dev-runs',
    title: 'Track and compare training runs',
    category: 'develop',
    path: '/develop-train/experiments',
  },
  {
    id: 'task-menu-dev-workbenches',
    title: 'Code in workbenches',
    category: 'develop',
    onClick: () => showModal('This page does not exist yet'),
  },
  {
    id: 'task-menu-dev-jobs',
    title: 'Manage training jobs',
    category: 'develop',
    onClick: () => showModal('This page does not exist yet'),
  },
];

/** Which task menu rows appear in each expanded column (ids from `buildTaskAssistantMenuItems`). */
export const taskAssistantExpandedLinkIds: Record<
  'ai-hub' | 'gen-ai' | 'develop',
  readonly string[]
> = {
  'ai-hub': ['task-menu-ai-hub-models', 'task-menu-ai-hub-mcp'],
  'gen-ai': [
    'task-menu-gen-chat',
    'task-menu-gen-assets',
    'task-menu-gen-rag',
    'task-menu-gen-prompts',
    'task-menu-gen-api-keys',
  ],
  develop: [
    'task-menu-dev-features',
    'task-menu-dev-evaluate',
    'task-menu-dev-runs',
    'task-menu-dev-workbenches',
    'task-menu-dev-jobs',
  ],
};

export const taskAssistantExpandedColumnCopy: Record<
  'ai-hub' | 'gen-ai' | 'develop',
  { heading: string; description: string }
> = {
  'ai-hub': {
    heading: 'AI hub',
    description: 'Browse, manage, and deploy models and MCP servers.',
  },
  'gen-ai': {
    heading: 'Gen AI studio',
    description: 'Prototype, test, and manage models and applications.',
  },
  develop: {
    heading: 'Develop and train',
    description: 'Iterate in experiments and track results across runs.',
  },
};

export const categoryInfo: Record<
  CapabilityCategory,
  { label: string; icon: React.ReactNode; description: React.ReactNode }
> = {
  'ai-hub': {
    label: 'AI hub',
    icon: <AiHubNavIcon />,
    description: (
      <>
        Discover, manage and deploy models
        <br />
        with <strong>AI hub</strong>
      </>
    ),
  },
  'gen-ai': {
    label: 'Gen AI studio',
    icon: <GenAiStudioNavIcon />,
    description: (
      <>
        Build and experiment with generative AI
        <br />
        with <strong>Gen AI studio</strong>
      </>
    ),
  },
  develop: {
    label: 'Develop and train',
    icon: <DevelopAndTrainNavIcon />,
    description: (
      <>
        Create and train AI/ML models
        <br />
        with <strong>Develop and train</strong>
      </>
    ),
  },
  observe: {
    label: 'Observe & Monitor',
    icon: <DevelopAndTrainNavIcon />,
    description: (
      <>
        Monitor and evaluate model performance
        <br />
        with <strong>Observe & Monitor</strong>
      </>
    ),
  },
};

export const buildHomeCapabilities = (showModal: (message: string) => void): HomeCapabilityEntry[] => [
  {
    title: 'Model Catalog',
    description: 'Browse and deploy pre-trained models from the AI Hub catalog',
    icon: <ModelCatalogIcon withBackground size={32} />,
    path: '/ai-hub/models/catalog',
    category: 'ai-hub',
  },
  {
    title: 'Model Registry',
    description: 'Register, version, and manage your trained models',
    icon: <ModelRegistryIcon withBackground size={32} />,
    path: '/ai-hub/models/registry',
    category: 'ai-hub',
  },
  {
    title: 'Deployments',
    description: 'Deploy and serve models for inference',
    icon: <DeploymentsIcon withBackground size={32} />,
    path: '/ai-hub/models/deployments',
    category: 'ai-hub',
  },
  {
    title: 'AI asset endpoints',
    description: 'Access and manage endpoints for deployed AI models and services',
    icon: <AIAssetEndpointsIcon withBackground size={32} />,
    path: '/gen-ai-studio/asset-endpoints',
    category: 'gen-ai',
  },
  {
    title: 'Playground',
    description: 'Experiment with models and prompts in an interactive environment',
    icon: <PlaygroundIcon withBackground size={32} />,
    path: '/gen-ai-studio/playground',
    category: 'gen-ai',
    isNew: true,
  },
  {
    title: 'Prompt lab',
    description: 'Engineer and test prompts with advanced tooling',
    icon: <PromptLabIcon withBackground size={32} />,
    path: '/gen-ai-studio/prompt-lab',
    category: 'gen-ai',
    isNew: true,
  },
  {
    title: 'AutoRAG',
    description: 'Build and optimize RAG solutions with automated workflows',
    icon: <AutoRAGIcon withBackground size={32} />,
    path: '/gen-ai-studio/autorag',
    category: 'gen-ai',
    isNew: true,
  },
  {
    title: 'Knowledge Sources',
    description: 'Manage vector databases and knowledge bases for RAG',
    icon: <KnowledgeSourcesIcon withBackground size={32} />,
    onClick: () => showModal('This page does not exist yet'),
    category: 'gen-ai',
    isNew: true,
  },
  {
    title: 'Workbenches',
    description: 'Create development environments with JupyterLab, VS Code, and more',
    icon: <WorkbenchesIcon withBackground size={32} />,
    onClick: () => showModal('This page does not exist yet'),
    category: 'develop',
  },
  {
    title: 'Feature store',
    description: 'Manage and share features for ML models',
    icon: <FeatureStoreIcon withBackground size={32} />,
    path: '/develop-train/feature-store/overview',
    category: 'develop',
  },
  {
    title: 'Pipelines',
    description: 'Build and orchestrate ML workflows and automation',
    icon: <PipelinesIcon withBackground size={32} />,
    path: '/develop-train/pipelines/definitions',
    category: 'develop',
  },
  {
    title: 'Experiments',
    description: 'Track and compare model training experiments',
    icon: <ExperimentsIcon withBackground size={32} />,
    path: '/develop-train/experiments',
    category: 'develop',
  },
  {
    title: 'Evaluations',
    description: 'Evaluate model quality, bias, and fairness',
    icon: <EvaluationsIcon withBackground size={32} />,
    path: '/develop-train/evaluations',
    category: 'develop',
    isNew: true,
  },
  {
    title: 'Model Metrics',
    description: 'Monitor model performance and serving metrics',
    icon: <ChartLineIcon />,
    path: '/metrics',
    category: 'observe',
  },
];

export const groupCapabilitiesByCategory = (
  capabilities: HomeCapabilityEntry[]
): Record<CapabilityCategory, HomeCapabilityEntry[]> => ({
  'ai-hub': capabilities.filter((c) => c.category === 'ai-hub'),
  'gen-ai': capabilities.filter((c) => c.category === 'gen-ai'),
  develop: capabilities.filter((c) => c.category === 'develop'),
  observe: capabilities.filter((c) => c.category === 'observe'),
});
