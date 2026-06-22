import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { AngleDownIcon, AngleRightIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

export const useResourcesSection = (): React.ReactNode => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Mock resources data
  const resources = [
    {
      type: 'documentation',
      title: 'Red Hat OpenShift AI',
      subtitle: 'by Red Hat',
      description:
        'OpenShift AI provides an environment to develop, train, serve, test, and monitor AI/ML models on-premises or in the cloud.',
      link: 'https://docs.redhat.com/en/documentation/red_hat_openshift_ai',
    },
    {
      type: 'quickstart',
      title: 'Chat with a model',
      description: 'Deploy a validated model and start chatting in the AI Playground',
      steps: ['Deploy a validated model using kserve-vllm', 'Chat with the model in AI Playground'],
      duration: '10 min',
      difficulty: 'beginner' as const,
      link: '#',
    },
    {
      type: 'quickstart',
      title: 'Build a RAG solution',
      description: 'Create a Retrieval-Augmented Generation application with AutoRAG',
      steps: [
        'Verify Model Serving connections',
        'Configure Vector Database',
        'Launch AutoRAG',
      ],
      duration: '25 min',
      difficulty: 'intermediate' as const,
      link: '#',
    },
    {
      type: 'quickstart',
      title: 'Finetune a model',
      description: 'Set up distributed training for model finetuning',
      steps: [
        'Install CodeFlare/Ray',
        'Validate GPU quotas and Hardware Profiles',
        'Launch finetuning job',
      ],
      duration: '45 min',
      difficulty: 'advanced' as const,
      link: '#',
    },
  ];

  const difficultyColors = {
    beginner: 'green',
    intermediate: 'orange',
    advanced: 'red',
  } as const;

  const renderDocumentationCard = (resource: (typeof resources)[0]) => {
    if (resource.type !== 'documentation') return null;

    return (
      <Card style={{ height: '100%' }} data-testid="resource-card-rhoai-documentation">
        <CardHeader>
          <Title headingLevel="h4" id="home-resource-card-title-documentation">
            {resource.title}
          </Title>
        </CardHeader>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <LabelGroup>
                <Label color="orange">Documentation</Label>
              </LabelGroup>
            </StackItem>
            <StackItem>
              <Content>{resource.description}</Content>
            </StackItem>
          </Stack>
        </CardBody>
        <CardFooter>
          <Button
            variant="link"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
            component="a"
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="view-documentation"
          >
            View documentation
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderQuickStartCard = (resource: (typeof resources)[0], cardIndex: number) => {
    if (resource.type !== 'quickstart') return null;

    return (
      <Card style={{ height: '100%' }}>
        <CardHeader>
          <Title headingLevel="h4" id={`home-resource-card-title-quickstart-${cardIndex}`}>
            {resource.title}
          </Title>
        </CardHeader>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
              <LabelGroup>
                <Label color="blue">Quick start</Label>
                <Label color={difficultyColors[resource.difficulty!]}>
                  {resource.difficulty!.charAt(0).toUpperCase() + resource.difficulty!.slice(1)}
                </Label>
                <Label>{resource.duration}</Label>
              </LabelGroup>
            </StackItem>
            <StackItem>
              <Content>{resource.description}</Content>
            </StackItem>
          </Stack>
        </CardBody>
        <CardFooter>
          <Button variant="link" component="a" href={resource.link}>
            Start quick start
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <PageSection variant="secondary" hasBodyWrapper={false} data-testid="landing-page-resources">
      <Stack hasGutter>
        <StackItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }} flexWrap={{ default: 'wrap' }}>
            <FlexItem>
              <Button
                variant="plain"
                onClick={() => setIsExpanded((e) => !e)}
                aria-expanded={isExpanded}
                aria-controls="home-learning-resources-body"
                id="home-learning-resources-expand"
                icon={isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
              />
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }}>
              <Content
                component={ContentVariants.h2}
                id="home-learning-resources-title"
                className="rhoai-home-section-title-md"
              >
                Get oriented with learning resources
              </Content>
            </FlexItem>
          </Flex>
        </StackItem>
        {isExpanded && (
          <StackItem id="home-learning-resources-body">
            <Stack hasGutter>
              <StackItem>
                <Grid hasGutter>
                  {resources.map((resource, index) => (
                    <GridItem key={index} md={3} sm={6}>
                      {resource.type === 'documentation'
                        ? renderDocumentationCard(resource)
                        : renderQuickStartCard(resource, index)}
                    </GridItem>
                  ))}
                </Grid>
              </StackItem>
              <StackItem>
                <Button
                  data-testid="goto-learning-resources-link"
                  variant="link"
                  isInline
                  onClick={() => navigate('/learning-resources')}
                >
                  Go to <b>Learning Resources</b>
                </Button>
              </StackItem>
            </Stack>
          </StackItem>
        )}
      </Stack>
    </PageSection>
  );
};
