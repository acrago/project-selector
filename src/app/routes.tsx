import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { NotFound } from '@app/NotFound/NotFound';

// New components
import { PrototypeLauncher } from '@app/PrototypeLauncher/PrototypeLauncher';
import { Home } from '@app/Home/Home';
import HomePageVariations from '@app/Home/HomePageVariations';
import { Projects } from '@app/Projects/Projects';
import { ProjectDetail } from '@app/Projects/screens/detail/ProjectDetail';
import { Connections } from '@app/Connections/Connections';

// AIHub
import { Models } from '@app/AIHub/Models/Models';
import { Models as ModelsWithTabs } from '@app/AIHub/Models/ModelsWithTabs';
import { MCPServers as MCPServersWithTabs } from '@app/AIHub/MCPServers/MCPServersWithTabs';
import { Prompts } from '@app/AIHub/Models/Prompts';
import { ModelCatalog } from '@app/AIHub/Models/ModelCatalog';
import { ModelRegistry } from '@app/AIHub/Models/ModelRegistry';
import RegisterModel from '@app/AIHub/Models/RegisterModel';
import ModelDetails from '@app/AIHub/Models/ModelDetails';
import { Deployments } from '@app/AIHub/Deployments/Deployments';
import { DeployModelWizard } from '@app/AIHub/Deployments/DeployModelWizard';
import { MVPServers } from '@app/AIHub/MVPServers/MVPServers';
import { MCPServerDetails } from '@app/AIHub/MVPServers/MCPServerDetails';
import { SearchResults } from '@app/AIHub/MVPServers/SearchResults';
import { DeployMCPServerModal, MCPCatalog, MCPCatalogDetails, MCPDeployments } from '@app/AIHub/MCPServers';
import { CreateGuardrail } from '@app/AIHub/Guardrails/CreateGuardrail';
import { Guardrails } from '@app/AIHub/Guardrails/Guardrails';
import AIAssets from '@app/GenAIStudio/AssetEndpoints/AIAssets';
import EndpointModelDetails from '@app/GenAIStudio/AssetEndpoints/EndpointModelDetails';
import VectorStoreDetails from '@app/GenAIStudio/AssetEndpoints/VectorStoreDetails';

// GenAIStudio - imported from migrated src-3.0
import { Playground } from '@app/GenAIStudio/Playground/Playground';
import { ModelPlayground } from '@app/GenAIStudio/ModelPlayground/ModelPlayground';
import { MyAgents } from '@app/GenAIStudio/MyAgents/MyAgents';
import { PromptEngineering } from '@app/GenAIStudio/PromptEngineering/PromptEngineering';
import { KnowledgeSources } from '@app/GenAIStudio/KnowledgeSources/KnowledgeSources';
import { AutoRAG } from '@app/GenAIStudio/AutoRAG/AutoRAG';
import { PromptLab } from '@app/GenAIStudio/PromptLab/PromptLab';
import { PromptDetails } from '@app/GenAIStudio/PromptLab/PromptDetails';

// Observability - imported from migrated src-3.0
import { Tracing } from '@app/Observability/Tracing/Tracing';
import { RAG } from '@app/Observability/RAG/RAG';
import { Evaluations as ObservabilityEvaluations } from '@app/Observability/Evaluations/Evaluations';

// FeatureFlags - imported from migrated src-3.0
import { FeatureFlags } from '@app/FeatureFlags/FeatureFlags';

import { Workbenches } from '@app/DevelopTrain/Workbenches/Workbenches';
import { WorkspaceTemplateDetails } from '@app/DevelopTrain/Workbenches/WorkspaceTemplateDetails';
import { CreateWorkbenchPage } from '@app/DevelopTrain/Workbenches/CreateWorkbenchPage';
import { Overview } from '@app/DevelopTrain/FeatureStore/Overview/Overview';
import { Entities, EntityDetailPage } from '@app/DevelopTrain/FeatureStore/Entities/Entities';
import { DataSourceDetailPage, DataSources } from '@app/DevelopTrain/FeatureStore/DataSources/DataSources';
import { DataSets, DatasetDetailPage } from '@app/DevelopTrain/FeatureStore/DataSets/DataSets';
import { FeatureDetailPage, Features } from '@app/DevelopTrain/FeatureStore/Features/Features';
import { FeatureViewDetailPage, FeatureViews } from '@app/DevelopTrain/FeatureStore/FeatureViews/FeatureViews';
import { FeatureServiceDetailPage, FeatureServices } from '@app/DevelopTrain/FeatureStore/FeatureServices/FeatureServices';
import { PipelineDefinitions } from '@app/DevelopTrain/Pipelines/PipelineDefinitions/PipelineDefinitions';
import { Runs } from '@app/DevelopTrain/Pipelines/Runs/Runs';
import { Artifacts } from '@app/DevelopTrain/Pipelines/Artifacts/Artifacts';
import { Executions } from '@app/DevelopTrain/Pipelines/Executions/Executions';
import { Evaluations } from '@app/DevelopTrain/Evaluations/Evaluations';
import { NewEvaluation } from '@app/DevelopTrain/Evaluations/NewEvaluation';
import { EvaluationCollections } from '@app/DevelopTrain/Evaluations/EvaluationCollections';
import { EvaluationBenchmarks } from '@app/DevelopTrain/Evaluations/EvaluationBenchmarks';
import { RunEvaluationForm } from '@app/DevelopTrain/Evaluations/RunEvaluationForm';
import EvaluationResults from '@app/DevelopTrain/Evaluations/EvaluationResults';
import { Experiments } from '@app/DevelopTrain/Experiments/Experiments';
import { MaaSDashboard } from '@app/ObserveMonitor/Dashboard/MaaSDashboard';
import { WorkloadMetrics } from '@app/ObserveMonitor/WorkloadMetrics/WorkloadMetrics';
import { TrainingJobs } from '@app/ObserveMonitor/TrainingJobs/TrainingJobs';
import { LearningResources } from '@app/LearningResources/LearningResources';
import { Enabled } from '@app/Applications/Enabled/Enabled';
import { Explore } from '@app/Applications/Explore/Explore';
import { ClusterSettings } from '@app/Settings/ClusterSettings/ClusterSettings';
import { StorageClasses } from '@app/Settings/ClusterSettings/StorageClasses/StorageClasses';
import { WorkbenchImages } from '@app/Settings/EnvironmentSetup/WorkbenchImages/WorkbenchImages';
import { HardwareProfiles } from '@app/Settings/EnvironmentSetup/HardwareProfiles/HardwareProfiles';
import { ConnectionTypes } from '@app/Settings/EnvironmentSetup/ConnectionTypes/ConnectionTypes';
import { ServingRuntimes } from '@app/Settings/ModelResources/ServingRuntimes/ServingRuntimes';
import { ModelRegistrySettings } from '@app/Settings/ModelResources/ModelRegistrySettings/ModelRegistrySettings';
import { ModelCatalogSettingsPage } from '@app/Settings/ModelResources/ModelCatalogSettings/ModelCatalogSettingsPage';
import { ManagingSource } from '@app/Settings/ModelResources/ModelCatalogSettings/ManagingSource/ManagingSource';
import { UserManagement } from '@app/Settings/UserManagement/UserManagement';
import { APIKeys } from '@app/Settings/APIKeys/APIKeys';
import { APIKeyDetails } from '@app/Settings/APIKeys/APIKeyDetails';
import { Policies } from '@app/Settings/Policies/Policies';
import { PolicyDetails } from '@app/Settings/Policies/PolicyDetails';
import { CreatePolicy } from '@app/Settings/Policies/CreatePolicy';
import { EditPolicy } from '@app/Settings/Policies/EditPolicy';
import { Subscriptions } from '@app/Settings/Subscriptions/Subscriptions';
import { SubscriptionDetails } from '@app/Settings/Subscriptions/SubscriptionDetails';
import { CreateSubscription } from '@app/Settings/Subscriptions/CreateSubscription';
import { EditSubscription } from '@app/Settings/Subscriptions/EditSubscription';
import { MCPResources } from '@app/Settings/MCPResources/MCPResources';
import { AddMCPSource } from '@app/Settings/MCPResources/AddMCPSource';
import { ManageMCPSource } from '@app/Settings/MCPResources/ManageMCPSource';
import { AuthCallbackHandler } from '@app/components/CommentingSystem';

// Icons
import {
  createAiHubNavIcon,
  createApplicationsNavIcon,
  createDevelopAndTrainNavIcon,
  createFontAwesomeIcon,
  createGenAiStudioNavIcon,
  createHomeNavIcon,
  createLearningResourcesNavIcon,
  createObserveAndMonitorNavIcon,
  createProjectsNavIcon,
  createSettingsNavIcon,
} from '@app/utils/IconHelper';
import { createConnectionsIcon } from '@app/Connections/ConnectionsIcon';

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  element: React.ReactElement;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
  icon?: React.ComponentType;
  featureFlag?: keyof import('@app/utils/FeatureFlagsContext').FeatureFlags;
  hideWhenFlag?: keyof import('@app/utils/FeatureFlagsContext').FeatureFlags; // Hide nav item when this flag is on
  noVersionDate?: boolean; // Show "Future" chip next to nav item
  tbd?: boolean; // Indicates the feature might not be included in upcoming releases
  new?: boolean; // Indicates a new feature being introduced
  updated?: boolean; // Show "Updated" (pink) badge next to nav item
  old?: boolean; // Show "Old" (pink) badge next to nav item
  inProgress?: boolean; // Shows WIP badge in the nav
}

export interface IAppRouteGroup {
  label: string;
  routes: AppRouteConfig[];
  icon?: React.ComponentType;
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

// Redirect to Workbench Templates tab on Workbenches page
const WorkspaceTemplatesRedirect: React.FunctionComponent = () => {
  return <Navigate to="/develop-train/workbenches?tab=templates" replace />;
};

const routes: AppRouteConfig[] = [
  {
    element: <PrototypeLauncher />,
    exact: true,
    path: '/prototype-launcher',
    title: 'RHOAI Prototype | Launcher',
  },
  {
    element: <Home />,
    exact: true,
    label: 'Home',
    path: '/',
    title: 'RHOAI Prototype | Home',
    icon: createHomeNavIcon(),
  },
  {
    element: <Projects />,
    exact: true,
    label: 'Projects',
    path: '/projects',
    title: 'RHOAI Prototype | Projects',
    icon: createProjectsNavIcon(),
  },
  {
    element: <ProjectDetail />,
    exact: true,
    path: '/projects/:projectId',
    title: 'RHOAI Prototype | Project Detail',
  },
  {
    element: <Connections />,
    exact: true,
    // label: 'Connections', // Hidden from nav - to be activated later
    path: '/connections',
    title: 'RHOAI Prototype | Connections',
    icon: createConnectionsIcon(),
  },
  {
    element: <ProjectDetail />,
    exact: true,
    path: '/projects/:projectId',
    title: 'RHOAI Prototype | Project Details',
  },
  {
    label: 'AI hub',
    icon: createAiHubNavIcon(),
    routes: [
      {
        label: 'Models',
        routes: [
          {
            element: <ModelCatalog />,
            exact: true,
            label: 'Catalog',
            path: '/ai-hub/models/catalog',
            title: 'RHOAI Prototype | AI Hub - Model Catalog',
          },
          {
            element: <ModelRegistry />,
            exact: true,
            label: 'Registry',
            path: '/ai-hub/models/registry',
            title: 'RHOAI Prototype | AI Hub - Model Registry',
          },
          {
            element: <Deployments />,
            exact: true,
            label: 'Deployments',
            path: '/ai-hub/models/deployments',
            title: 'RHOAI Prototype | AI Hub - Model Deployments',
          },
        ],
      },
      {
        label: 'MCP servers',
        routes: [
          {
            element: <MCPCatalog />,
            exact: true,
            label: 'Catalog',
            path: '/ai-hub/mcp/catalog',
            title: 'RHOAI Prototype | AI Hub - MCP Catalog',
          },
          {
            element: <MCPDeployments />,
            exact: true,
            label: 'Deployments',
            path: '/ai-hub/mcp/deployments',
            title: 'RHOAI Prototype | AI Hub - MCP Deployments',
            hideWhenFlag: 'mcpLifecycleOperatorNotInstalled',
          },
        ],
      },
    ],
  },
  {
    label: 'Gen AI studio',
    icon: createGenAiStudioNavIcon(),
    routes: [
      {
        element: <AIAssets />,
        exact: true,
        label: 'AI asset endpoints',
        path: '/gen-ai-studio/asset-endpoints',
        title: 'RHOAI Prototype | Gen AI Studio - AI Asset Endpoints',
        updated: true,
      },
      {
        element: <Playground />,
        exact: true,
        label: 'Playground',
        path: '/gen-ai-studio/playground',
        title: 'RHOAI Prototype | Gen AI Studio - Playground',
      },
      {
        element: <ModelPlayground />,
        exact: true,
        label: 'Model playground',
        path: '/gen-ai-studio/model-playground',
        title: 'RHOAI Prototype | Gen AI Studio - Model Playground',
        featureFlag: 'enableModelPlaygroundPage',
      },
      {
        element: <MyAgents />,
        exact: true,
        label: 'My agents',
        path: '/gen-ai-studio/my-agents',
        title: 'RHOAI Prototype | Gen AI Studio - My Agents',
        featureFlag: 'enableMyAgentsPage',
      },
      {
        element: <PromptEngineering />,
        exact: true,
        label: 'Prompt engineering',
        path: '/gen-ai-studio/prompt-engineering',
        title: 'RHOAI Prototype | Gen AI Studio - Prompt Engineering',
        featureFlag: 'enablePromptEngineeringPage',
      },
      {
        element: <KnowledgeSources />,
        exact: true,
        label: 'Knowledge sources',
        path: '/gen-ai-studio/knowledge-sources',
        title: 'RHOAI Prototype | Gen AI Studio - Knowledge Sources',
        featureFlag: 'enableKnowledgeSourcesPage',
      },
      {
        element: <AutoRAG />,
        exact: true,
        label: 'AutoRAG',
        path: '/gen-ai-studio/autorag',
        title: 'RHOAI Prototype | Gen AI Studio - AutoRAG',
        featureFlag: 'enableAutoRAG',
        new: true,
      },
      {
        element: <PromptLab />,
        exact: true,
        label: 'Prompt management',
        path: '/gen-ai-studio/prompt-lab',
        title: 'RHOAI Prototype | Gen AI Studio - Prompt Management',
      },
      {
        element: <APIKeys />,
        exact: true,
        label: 'API keys',
        path: '/gen-ai-studio/api-keys',
        title: 'RHOAI Prototype | Gen AI Studio - API Keys',
        updated: true,
      },
      {
        element: <APIKeyDetails />,
        exact: true,
        path: '/gen-ai-studio/api-keys/:keyId',
        title: 'RHOAI Prototype | Gen AI Studio - API Key Details',
      },
      {
        element: <APIKeyDetails />,
        exact: true,
        path: '/gen-ai-studio/api-keys/:keyId/:tab',
        title: 'RHOAI Prototype | Gen AI Studio - API Key Details',
      },
    ],
  },
  {
    label: 'Develop & train',
    icon: createDevelopAndTrainNavIcon(),
    routes: [
        {
          element: <Workbenches />,
          exact: true,
          label: 'Workbenches',
          path: '/develop-train/workbenches',
          title: 'RHOAI Prototype | Develop & Train - Workbenches',
        },
        {
          element: <CreateWorkbenchPage />,
          exact: true,
          path: '/develop-train/workbenches/create',
          title: 'RHOAI Prototype | Create workbench',
        },
        {
          element: <WorkspaceTemplateDetails />,
          exact: true,
          path: '/develop-train/workbenches/templates/:workspaceKindId',
          title: 'RHOAI Prototype | Workspace Template Details',
        },
      {
        label: 'Feature store',
        routes: [
          {
            element: <Overview />,
            exact: true,
            label: 'Overview',
            path: '/develop-train/feature-store/overview',
            title: 'RHOAI Prototype | Feature Store - Overview',
          },
          {
            element: <Entities />,
            exact: true,
            label: 'Entities',
            path: '/develop-train/feature-store/entities',
            title: 'RHOAI Prototype | Feature Store - Entities',
          },
          {
            element: <EntityDetailPage />,
            exact: true,
            path: '/develop-train/feature-store/entities/:entityId',
            title: 'RHOAI Prototype | Feature Store - Entity Details',
          },
          {
            element: <DataSources />,
            exact: true,
            label: 'Data sources',
            path: '/develop-train/feature-store/data-sources',
            title: 'RHOAI Prototype | Feature Store - Data Sources',
          },
          {
            element: <DataSourceDetailPage />,
            exact: true,
            path: '/develop-train/feature-store/data-sources/:dataSourceId',
            title: 'RHOAI Prototype | Feature Store - Data Source Details',
          },
          {
            element: <DataSets />,
            exact: true,
            label: 'Data sets',
            path: '/develop-train/feature-store/data-sets',
            title: 'RHOAI Prototype | Feature Store - Data Sets',
          },
          {
            element: <DatasetDetailPage />,
            exact: true,
            path: '/develop-train/feature-store/data-sets/:datasetId',
            title: 'RHOAI Prototype | Feature Store - Dataset Details',
          },
          {
            element: <Features />,
            exact: true,
            label: 'Features',
            path: '/develop-train/feature-store/features',
            title: 'RHOAI Prototype | Feature Store - Features',
          },
          {
            element: <FeatureDetailPage />,
            exact: true,
            path: '/develop-train/feature-store/features/:featureId',
            title: 'RHOAI Prototype | Feature Store - Feature Details',
          },
          {
            element: <FeatureViews />,
            exact: true,
            label: 'Feature views',
            path: '/develop-train/feature-store/feature-views',
            title: 'RHOAI Prototype | Feature Store - Feature Views',
          },
          {
            element: <FeatureViewDetailPage />,
            exact: true,
            path: '/develop-train/feature-store/feature-views/:featureViewId',
            title: 'RHOAI Prototype | Feature Store - Feature View Details',
          },
          {
            element: <FeatureServices />,
            exact: true,
            label: 'Feature services',
            path: '/develop-train/feature-store/feature-services',
            title: 'RHOAI Prototype | Feature Store - Feature Services',
          },
          {
            element: <FeatureServiceDetailPage />,
            exact: true,
            path: '/develop-train/feature-store/feature-services/:featureServiceId',
            title: 'RHOAI Prototype | Feature Store - Feature Service Details',
          },
        ],
      },
      {
        label: 'Pipelines',
        routes: [
          {
            element: <PipelineDefinitions />,
            exact: true,
            label: 'Pipeline definitions',
            path: '/develop-train/pipelines/definitions',
            title: 'RHOAI Prototype | Pipelines - Definitions',
          },
          {
            element: <Runs />,
            exact: true,
            label: 'Runs',
            path: '/develop-train/pipelines/runs',
            title: 'RHOAI Prototype | Pipelines - Runs',
          },
          {
            element: <Artifacts />,
            exact: true,
            label: 'Artifacts',
            path: '/develop-train/pipelines/artifacts',
            title: 'RHOAI Prototype | Pipelines - Artifacts',
          },
          {
            element: <Executions />,
            exact: true,
            label: 'Executions',
            path: '/develop-train/pipelines/executions',
            title: 'RHOAI Prototype | Pipelines - Executions',
          },
        ],
      },
      {
        element: <Evaluations />,
        exact: true,
        label: 'Evaluations',
        path: '/develop-train/evaluations',
        title: 'RHOAI Prototype | Develop & Train - Evaluations',
        updated: true,
      },
      {
        element: <NewEvaluation />,
        exact: true,
        path: '/develop-train/evaluations/new',
        title: 'RHOAI Prototype | Develop & Train - New Evaluation',
      },
      {
        element: <EvaluationCollections />,
        exact: true,
        path: '/develop-train/evaluations/collections',
        title: 'RHOAI Prototype | Develop & Train - Evaluation Collections',
      },
      {
        element: <EvaluationBenchmarks />,
        exact: true,
        path: '/develop-train/evaluations/benchmarks',
        title: 'RHOAI Prototype | Develop & Train - Standardized Benchmarks',
      },
      {
        element: <RunEvaluationForm />,
        exact: true,
        path: '/develop-train/evaluations/run',
        title: 'RHOAI 3.1 Console | Develop & Train - Run Evaluation',
      },
      {
        element: <EvaluationResults />,
        exact: true,
        path: '/develop-train/evaluations/:id/results',
        title: 'RHOAI Prototype | Develop & Train - Evaluation Results',
      },
      {
        element: <Experiments />,
        exact: true,
        label: 'Experiments',
        path: '/develop-train/experiments',
        title: 'RHOAI Prototype | Develop & Train - Experiments',
      },
      {
        element: <TrainingJobs />,
        exact: true,
        label: 'Training jobs',
        path: '/develop-train/training-jobs',
        title: 'RHOAI Prototype | Develop & Train - Training Jobs',
      },
    ],
  },
  {
    label: 'Observe & monitor',
    icon: createObserveAndMonitorNavIcon(),
    routes: [
      {
        element: <MaaSDashboard />,
        exact: true,
        label: 'Dashboard',
        path: '/observe-monitor/dashboard',
        title: 'RHOAI Prototype | Observe & Monitor - MaaS Dashboard',
        new: true,
      },
      {
        element: <WorkloadMetrics />,
        exact: true,
        label: 'Workload metrics',
        path: '/observe-monitor/workload-metrics',
        title: 'RHOAI Prototype | Observe & Monitor - Workload Metrics',
      },
    ],
  },
  {
    element: <LearningResources />,
    exact: true,
    label: 'Learning resources',
    path: '/learning-resources',
    title: 'RHOAI Prototype | Learning Resources',
    icon: createLearningResourcesNavIcon(),
  },
  {
    label: 'Applications',
    icon: createApplicationsNavIcon(),
    routes: [
      {
        element: <Enabled />,
        exact: true,
        label: 'Enabled',
        path: '/applications/enabled',
        title: 'RHOAI Prototype | Applications - Enabled',
      },
      {
        element: <Explore />,
        exact: true,
        label: 'Explore',
        path: '/applications/explore',
        title: 'RHOAI Prototype | Applications - Explore',
      },
    ],
  },
  {
    label: 'Settings',
    icon: createSettingsNavIcon(),
    routes: [
      {
        label: 'Cluster settings',
        routes: [
          {
            element: <ClusterSettings />,
            exact: true,
            label: 'General settings',
            path: '/settings/cluster/general',
            title: 'RHOAI Prototype | Cluster Settings - General',
          },
          {
            element: <StorageClasses />,
            exact: true,
            label: 'Storage classes',
            path: '/settings/cluster/storage-classes',
            title: 'RHOAI Prototype | Cluster Settings - Storage Classes',
          },
        ],
      },
      {
        label: 'Environment setup',
        routes: [
          {
            element: <WorkbenchImages />,
            exact: true,
            label: 'Workbench images',
            path: '/settings/environment/workbench-images',
            title: 'RHOAI Prototype | Environment Setup - Workbench Images',
          },
          {
            element: <HardwareProfiles />,
            exact: true,
            label: 'Hardware profiles',
            path: '/settings/environment/hardware-profiles',
            title: 'RHOAI Prototype | Environment Setup - Hardware Profiles',
          },
          {
            element: <ConnectionTypes />,
            exact: true,
            label: 'Connection types',
            path: '/settings/environment/connection-types',
            title: 'RHOAI Prototype | Environment Setup - Connection Types',
          },
          {
            element: <WorkspaceTemplatesRedirect />,
            exact: true,
            label: 'Workbench templates',
            path: '/settings/environment/workspace-templates',
            title: 'RHOAI Prototype | Environment Setup - Workbench Templates',
            noVersionDate: true,
          },
        ],
      },
      {
        label: 'Model resources and operations',
        routes: [
          {
            element: <ServingRuntimes />,
            exact: true,
            label: 'Serving runtimes',
            path: '/settings/model-resources/serving-runtimes',
            title: 'RHOAI Prototype | Model Resources - Serving Runtimes',
          },
          {
            element: <ModelRegistrySettings />,
            exact: true,
            label: 'Model registry settings',
            path: '/settings/model-resources/registry-settings',
            title: 'RHOAI Prototype | Model Resources - Registry Settings',
          },
        ],
      },
      {
        label: 'MCP resources',
        routes: [
          {
            element: <MCPResources />,
            exact: true,
            label: 'MCP catalog settings',
            path: '/settings/mcp-resources/settings',
            title: 'RHOAI Prototype | MCP Resources - Settings',
          },
          {
            element: <ModelCatalogSettingsPage />,
            exact: true,
            label: 'Model catalog settings',
            path: '/settings/model-resources/model-catalog-settings',
            title: 'RHOAI 3.1 Console | Model Catalog Settings',
          },
        ],
      },
      {
        element: <UserManagement />,
        exact: true,
        label: 'User management',
        path: '/settings/user-management',
        title: 'RHOAI Prototype | Settings - User Management',
      },
      {
        element: <Subscriptions />,
        exact: true,
        label: 'Subscriptions',
        path: '/settings/subscriptions',
        title: 'RHOAI Prototype | Settings - Subscriptions',
        new: true,
      },
      {
        element: <Policies />,
        exact: true,
        label: 'Policies',
        path: '/settings/policies',
        title: 'RHOAI Prototype | Settings - Policies',
        tbd: true,
      },
    ],
  },
  {
    element: <HomePageVariations />,
    exact: true,
    label: 'Home page variations',
    path: '/home-variations',
    title: 'RHOAI Prototype | Home Page Variations',
    icon: createFontAwesomeIcon('fa-light fa-table-cells-large'),
  },
  // Additional routes not in navigation
  {
    element: <DeployModelWizard />,
    exact: true,
    path: '/ai-hub/models/deployments/deploy',
    title: 'RHOAI Prototype | Deploy Model',
  },
  {
    element: <ModelsWithTabs />,
    exact: true,
    path: '/ai-hub/models',
    title: 'RHOAI Prototype | AI Hub - Models',
  },
  {
    element: <MCPServersWithTabs />,
    exact: true,
    path: '/ai-hub/mcp-servers',
    title: 'RHOAI Prototype | AI Hub - MCP Servers',
  },
  {
    element: <Prompts />,
    exact: true,
    path: '/ai-hub/prompts',
    title: 'RHOAI Prototype | AI Hub - Prompts',
  },
  {
    element: <MCPCatalogDetails />,
    exact: true,
    path: '/ai-hub/mcp/catalog/:serverSlug',
    title: 'RHOAI Prototype | MCP Server Details',
  },
  {
    element: <DeployMCPServerModal />,
    exact: true,
    path: '/ai-hub/mcp/deploy',
    title: 'RHOAI Prototype | Deploy MCP Server',
  },
  {
    element: <AddMCPSource />,
    exact: true,
    path: '/settings/mcp-resources/add-source',
    title: 'RHOAI Prototype | Add MCP Source',
  },
  {
    element: <ManageMCPSource />,
    exact: true,
    path: '/settings/mcp-resources/manage/:sourceId',
    title: 'RHOAI Prototype | Manage MCP Source',
  },
  {
    element: <PromptDetails />,
    exact: true,
    path: '/gen-ai-studio/prompt-lab/:promptId',
    title: 'RHOAI Prototype | Gen AI Studio - Prompt Details',
  },
  {
    element: <RegisterModel />,
    exact: true,
    path: '/ai-hub/models/registry/new-model',
    title: 'RHOAI Prototype | Register Model',
  },
  {
    element: <ModelDetails />,
    exact: true,
    path: '/ai-assets/models/:modelSlug',
    title: 'RHOAI Prototype | Model Details',
  },
  {
    element: <Models />,
    exact: true,
    path: '/ai-assets/models',
    title: 'RHOAI Prototype | Models',
  },
  {
    element: <MVPServers />,
    exact: true,
    path: '/ai-assets/mvp-servers',
    title: 'RHOAI Prototype | MCP Servers',
  },
  {
    element: <MCPServerDetails />,
    exact: true,
    path: '/ai-assets/mvp-servers/:serverSlug',
    title: 'RHOAI Prototype | MCP Server Details',
  },
  {
    element: <SearchResults />,
    exact: true,
    path: '/ai-assets/mvp-servers/search',
    title: 'RHOAI Prototype | Search Results',
  },
  {
    element: <CreateGuardrail />,
    exact: true,
    path: '/ai-assets/guardrails/create',
    title: 'RHOAI Prototype | Create Guardrail',
  },
  {
    element: <Guardrails />,
    exact: true,
    path: '/ai-assets/guardrails',
    title: 'RHOAI Prototype | Guardrails',
  },
  {
    element: <Tracing />,
    exact: true,
    path: '/observability/tracing',
    title: 'RHOAI Prototype | Observability - Tracing',
  },
  {
    element: <RAG />,
    exact: true,
    path: '/observability/rag',
    title: 'RHOAI Prototype | Observability - RAG',
  },
  {
    element: <ObservabilityEvaluations />,
    exact: true,
    path: '/observability/evaluations',
    title: 'RHOAI Prototype | Observability - Evaluations',
  },
  {
    element: <FeatureFlags />,
    exact: true,
    path: '/feature-flags',
    title: 'RHOAI Prototype | Feature Flags',
  },
  {
    element: <CreatePolicy />,
    exact: true,
    path: '/settings/policies/create',
    title: 'RHOAI Prototype | Settings - Create Policy',
  },
  {
    element: <EditPolicy />,
    exact: true,
    path: '/settings/policies/:policyId/edit',
    title: 'RHOAI Prototype | Settings - Edit Policy',
  },
  {
    element: <PolicyDetails />,
    exact: true,
    path: '/settings/policies/:policyId',
    title: 'RHOAI Prototype | Settings - Policy Details',
  },
  {
    element: <PolicyDetails />,
    exact: true,
    path: '/settings/policies/:policyId/:tab',
    title: 'RHOAI Prototype | Settings - Policy Details',
  },
  {
    element: <CreateSubscription />,
    exact: true,
    path: '/settings/subscriptions/create',
    title: 'RHOAI Prototype | Settings - Create Subscription',
  },
  {
    element: <EditSubscription />,
    exact: true,
    path: '/settings/subscriptions/:subscriptionId/edit',
    title: 'RHOAI Prototype | Settings - Edit Subscription',
  },
  {
    element: <SubscriptionDetails />,
    exact: true,
    path: '/settings/subscriptions/:subscriptionId',
    title: 'RHOAI Prototype | Settings - Subscription Details',
  },
  {
    element: <SubscriptionDetails />,
    exact: true,
    path: '/settings/subscriptions/:subscriptionId/:tab',
    title: 'RHOAI Prototype | Settings - Subscription Details',
  },
  {
    element: <VectorStoreDetails />,
    exact: true,
    path: '/gen-ai-studio/asset-endpoints/vector-stores/:storeId',
    title: 'RHOAI 3.5 Console | Gen AI Studio - Vector Store Details',
  },
  {
    element: <EndpointModelDetails />,
    exact: true,
    path: '/gen-ai-studio/asset-endpoints/:modelSlug',
    title: 'RHOAI Prototype | Gen AI Studio - Endpoint Model Details',
  },
  {
    element: <AuthCallbackHandler />,
    exact: true,
    path: '/auth/gitlab/callback',
    title: 'RHOAI | GitLab Authentication',
  },
  {
    element: <ManagingSource />,
    exact: true,
    // No label - this route is not shown in navigation, only accessible via direct link
    path: '/settings/model-resources/model-catalog-settings/managing-source',
    title: 'RHOAI 3.1 Console | Model Catalog Settings - Managing Source',
  },
];

/** One nav-visible item for the modifiable nav (apollo-style). */
export interface AvailableNavItem {
  id: string;
  path: string;
  displayName: string;
  icon?: React.ComponentType;
  /** Top-level group label (L1), e.g. "AI hub", "Settings". */
  parentLabel?: string;
  /** Top-level group icon, e.g. the AI hub icon. */
  parentIcon?: React.ComponentType;
  /** Sub-group label (L2) within the parent, e.g. "Models", "MCP servers". */
  subGroupLabel?: string;
}

/** Flatten filtered routes to a list of available nav items (path = id), preserving
 *  the full hierarchy: L1 section (parentLabel + parentIcon) and L2 sub-group (subGroupLabel). */
export function buildAvailableNavItems(routeList: AppRouteConfig[]): AvailableNavItem[] {
  const out: AvailableNavItem[] = [];
  const visit = (
    list: AppRouteConfig[],
    sectionLabel?: string,
    sectionIcon?: React.ComponentType,
    subGroupLabel?: string,
  ) => {
    list.forEach((r) => {
      if ('routes' in r && r.routes) {
        if (!sectionLabel) {
          visit(r.routes, r.label, r.icon);
        } else {
          visit(r.routes, sectionLabel, sectionIcon, r.label);
        }
      } else if ('path' in r && 'label' in r && r.label) {
        out.push({
          id: r.path,
          path: r.path,
          displayName: r.label,
          icon: r.icon,
          parentLabel: sectionLabel,
          parentIcon: sectionIcon,
          subGroupLabel,
        });
      }
    });
  };
  visit(routeList);
  return out;
}

const filterRoutesByFlags = (routes: AppRouteConfig[], flags: any): AppRouteConfig[] => {
  return routes.map((route) => {
    if ('routes' in route && route.routes) {
      // This is a group, recursively filter its routes
      const filteredSubRoutes = filterRoutesByFlags(route.routes, flags);
      // Only include the group if it has at least one visible route
      if (filteredSubRoutes.length > 0) {
        return { ...route, routes: filteredSubRoutes };
      }
      return null;
    } else if ('element' in route) {
      // This is a route, check if it should be shown
      if (route.hideWhenFlag && flags[route.hideWhenFlag]) {
        return null;
      }
      if (route.featureFlag) {
        return flags[route.featureFlag] ? route : null;
      }
      return route;
    }
    return route;
  }).filter((route): route is AppRouteConfig => route !== null);
};

const flattenRoutes = (routes: AppRouteConfig[]): IAppRoute[] => {
  const flattened: IAppRoute[] = [];
  
  routes.forEach((route) => {
    if ('routes' in route && route.routes) {
      // This is a group, recursively flatten its routes
      flattened.push(...flattenRoutes(route.routes));
    } else if ('element' in route) {
      // This is a route, add it directly
      flattened.push(route);
    }
  });
  
  return flattened;
};

const flattenedRoutes: IAppRoute[] = flattenRoutes(routes);

const AppRoutes = (): React.ReactElement => {
  // This component doesn't use feature flags for routing - that's handled in AppLayout
  // We keep all routes available so direct navigation works
  return (
    <Routes>
      {flattenedRoutes.map(({ path, element }, idx) => (
        <Route path={path} element={element} key={idx} />
      ))}
      <Route element={<NotFound />} />
    </Routes>
  );
};

export { AppRoutes, routes, filterRoutesByFlags, ModelsWithTabs, MCPServersWithTabs, Prompts };
