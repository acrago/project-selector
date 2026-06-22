import * as React from 'react';
import { Content, PageSection, Stack, StackItem } from '@patternfly/react-core';
import {
  BrainIcon,
  ChartLineIcon,
  ClipboardListIcon,
  CodeIcon,
  CogIcon,
  CubesIcon,
  DatabaseIcon,
  FlaskIcon,
  RocketIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import CapabilityGroupVariation2Cards from './CapabilityGroupVariation2Cards';

const ProjectsCapabilitiesSection: React.FunctionComponent = () => {
  const capabilities: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    isNew?: boolean;
    category: 'ai-hub' | 'gen-ai' | 'develop' | 'observe';
  }> = [
    {
      title: 'Model Catalog',
      description: 'Browse and deploy pre-trained models from the AI Hub catalog',
      icon: <CubesIcon />,
      path: '/catalog',
      category: 'ai-hub',
    },
    {
      title: 'Model Registry',
      description: 'Register, version, and manage your trained models',
      icon: <DatabaseIcon />,
      path: '/modelRegistry',
      category: 'ai-hub',
    },
    {
      title: 'Deployments',
      description: 'Deploy and serve models for inference',
      icon: <RocketIcon />,
      path: '/deployments',
      category: 'ai-hub',
    },
    {
      title: 'Playground',
      description: 'Experiment with models and prompts in an interactive environment',
      icon: <CodeIcon />,
      path: '/playground',
      category: 'gen-ai',
      isNew: true,
    },
    {
      title: 'AutoRAG',
      description: 'Build and optimize RAG solutions with automated workflows',
      icon: <BrainIcon />,
      path: '/autorag',
      category: 'gen-ai',
      isNew: true,
    },
    {
      title: 'Knowledge Sources',
      description: 'Manage vector databases and knowledge bases for RAG',
      icon: <DatabaseIcon />,
      path: '/knowledge-sources',
      category: 'gen-ai',
      isNew: true,
    },
    {
      title: 'Workbenches',
      description: 'Create development environments with JupyterLab, VS Code, and more',
      icon: <FlaskIcon />,
      path: '/workbenches',
      category: 'develop',
    },
    {
      title: 'Pipelines',
      description: 'Build and orchestrate ML workflows and automation',
      icon: <ClipboardListIcon />,
      path: '/pipelines',
      category: 'develop',
    },
    {
      title: 'Experiments',
      description: 'Track and compare model training experiments',
      icon: <SearchIcon />,
      path: '/experiments',
      category: 'develop',
    },
    {
      title: 'Model Metrics',
      description: 'Monitor model performance and serving metrics',
      icon: <ChartLineIcon />,
      path: '/metrics',
      category: 'observe',
    },
    {
      title: 'Evaluations',
      description: 'Evaluate model quality, bias, and fairness',
      icon: <CogIcon />,
      path: '/evaluations',
      category: 'observe',
      isNew: true,
    },
    {
      title: 'Projects',
      description: 'Organize and manage your AI/ML workloads',
      icon: <CubesIcon />,
      path: '/projects',
      category: 'develop',
    },
  ];

  return (
    <PageSection variant="secondary" hasBodyWrapper={false} id="projects-capabilities-section">
      <Stack hasGutter>
        <StackItem>
          <Content component="h2">Explore Capabilities</Content>
          <Content component="small">
            Discover tools and services to build, deploy, and manage your AI/ML projects
          </Content>
        </StackItem>
        <StackItem>
          <CapabilityGroupVariation2Cards
            capabilities={capabilities}
            includeCategories={['ai-hub', 'gen-ai', 'develop']}
          />
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default ProjectsCapabilitiesSection;

