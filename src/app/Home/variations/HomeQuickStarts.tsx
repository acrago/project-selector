import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Label,
  PageSection,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon,
} from '@patternfly/react-icons';
import HomeHint from '../HomeHint';

interface QuickStartProps {
  title: string;
  description: string;
  steps: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress?: number;
  isCompleted?: boolean;
}

const QuickStartCard: React.FunctionComponent<QuickStartProps> = ({
  title,
  description,
  steps,
  duration,
  difficulty,
  progress = 0,
  isCompleted = false,
}) => {
  const difficultyColors = {
    beginner: 'green',
    intermediate: 'orange',
    advanced: 'red',
  } as const;

  return (
    <Card style={{ height: '100%' }}>
      <CardHeader>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem>
            <CardTitle>{title}</CardTitle>
          </FlexItem>
          {isCompleted && (
            <FlexItem>
              <CheckCircleIcon color="var(--pf-v6-global--success-color--100)" />
            </FlexItem>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Flex gap={{ default: 'gapSm' }}>
              <FlexItem>
                <Label color={difficultyColors[difficulty]} isCompact>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </Label>
              </FlexItem>
              <FlexItem>
                <Label isCompact>{duration}</Label>
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <Content component="small">{description}</Content>
          </StackItem>
          <StackItem>
            <Content component="h6">Steps:</Content>
            <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              {steps.map((step, index) => (
                <li key={index}>
                  <Content component="small">{step}</Content>
                </li>
              ))}
            </ol>
          </StackItem>
          {progress > 0 && !isCompleted && (
            <StackItem>
              <Progress
                value={progress}
                title="Progress"
                measureLocation={ProgressMeasureLocation.outside}
              />
            </StackItem>
          )}
          <StackItem>
            <Button
              variant={isCompleted ? 'secondary' : 'primary'}
              icon={isCompleted ? <ArrowRightIcon /> : <PlayIcon />}
              iconPosition="end"
            >
              {isCompleted ? 'Review' : progress > 0 ? 'Continue' : 'Start'}
            </Button>
          </StackItem>
        </Stack>
      </CardBody>
    </Card>
  );
};

const HomeQuickStarts: React.FunctionComponent = () => {
  const quickStarts: QuickStartProps[] = [
    {
      title: 'Chat with a model',
      description: 'Deploy a validated model and start chatting in the AI Playground',
      steps: [
        'Deploy a validated model using kserve-vllm',
        'Chat with the model in AI Playground',
      ],
      duration: '10 min',
      difficulty: 'beginner',
      progress: 50,
    },
    {
      title: 'Chat with a MaaS model',
      description: 'Set up Model-as-a-Service and access models remotely',
      steps: [
        'Set up a MaaS subscription and assign models',
        'Chat with the model in AI Playground',
        'Grab endpoints/tokens for remote access',
      ],
      duration: '15 min',
      difficulty: 'beginner',
    },
    {
      title: 'Monitor a deployment',
      description: 'View platform and model performance metrics',
      steps: [
        'Deploy a model',
        'View metrics in Observe & Monitor',
      ],
      duration: '10 min',
      difficulty: 'beginner',
    },
    {
      title: 'Evaluate a model',
      description: 'Enable TrustyAI and configure bias and fairness monitors',
      steps: [
        'Enable TrustyAI service',
        'Configure metric storage',
        'Set up bias and fairness monitors',
      ],
      duration: '20 min',
      difficulty: 'intermediate',
    },
    {
      title: 'Build a RAG solution',
      description: 'Create a Retrieval-Augmented Generation application with AutoRAG',
      steps: [
        'Verify Model Serving connections',
        'Configure Vector Database',
        'Launch AutoRAG',
      ],
      duration: '25 min',
      difficulty: 'intermediate',
    },
    {
      title: 'Prepare data for RAG',
      description: 'Set up document ingestion and chunking pipelines',
      steps: [
        'Configure connection to Vector Database',
        'Enable pipeline server',
        'Run document ingestion pipeline',
      ],
      duration: '20 min',
      difficulty: 'intermediate',
    },
    {
      title: 'Evaluate a RAG solution',
      description: 'Benchmark your RAG application against a golden dataset',
      steps: [
        'Enable TrustyAI',
        'Configure RAG evaluation templates',
        'Run benchmarking jobs',
      ],
      duration: '25 min',
      difficulty: 'advanced',
    },
    {
      title: 'Generate training data',
      description: 'Use InstructLab to generate synthetic training data',
      steps: [
        'Provision Workbench with InstructLab tools',
        'Configure Teacher Model access',
        'Generate synthetic data',
      ],
      duration: '30 min',
      difficulty: 'advanced',
    },
    {
      title: 'Finetune a model',
      description: 'Set up distributed training for model finetuning',
      steps: [
        'Install CodeFlare/Ray',
        'Validate GPU quotas and Hardware Profiles',
        'Launch finetuning job',
      ],
      duration: '45 min',
      difficulty: 'advanced',
    },
  ];

  return (
    <>
      <HomeHint
        title="Get Started with Quick Start Guides"
        body={
          <div>
            <p>
              Follow these guided workflows to quickly experience the value of RHOAI. Each quick
              start is designed to help you accomplish real tasks and see results on Day 1.
            </p>
            <p>
              <strong>Tip:</strong> Start with beginner guides if you're new to the platform.
            </p>
          </div>
        }
        isDisplayed={true}
        homeHintKey="welcome-quickstarts"
      />
      <PageSection variant="secondary" hasBodyWrapper={false}>
        <Stack hasGutter>
          <StackItem>
            <Content component={ContentVariants.h1}>Quick Start Guides</Content>
            <Content component="small">
              Step-by-step tutorials to help you accomplish key tasks
            </Content>
          </StackItem>
          <StackItem>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 'var(--pf-v6-global--spacer--md)',
              }}
            >
              {quickStarts.map((quickStart, index) => (
                <QuickStartCard key={index} {...quickStart} />
              ))}
            </div>
          </StackItem>
        </Stack>
      </PageSection>
    </>
  );
};

export default HomeQuickStarts;



