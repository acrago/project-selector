import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Content,
  Flex,
  FlexItem,
  Label,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';

export type CapabilityCardLayout = 'icon-top' | 'icon-side' | 'minimal' | 'editorial';

interface CapabilityData {
  title: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
  isNew?: boolean;
  category: 'ai-hub' | 'gen-ai' | 'develop' | 'observe';
  onClick?: () => void;
}

interface CapabilityCardProps {
  capability: CapabilityData;
  layout: CapabilityCardLayout;
}

const categoryColors = {
  'ai-hub': 'blue',
  'gen-ai': 'purple',
  develop: 'green',
  observe: 'orange',
} as const;

const categoryLabels = {
  'ai-hub': 'AI Hub',
  'gen-ai': 'Gen AI Studio',
  develop: 'Develop & Train',
  observe: 'Observe & Monitor',
};

// Variation 1: Icon at top, description centered, large and prominent
export const CapabilityCardIconTop: React.FunctionComponent<CapabilityCardProps> = ({
  capability,
}) => {
  const navigate = useNavigate();
  const { description, icon, path, isNew, category, title, onClick } = capability;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <Card style={{ height: '100%', textAlign: 'center' }}>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <div
              style={{
                fontSize: '48px',
                color: `var(--pf-v6-global--palette--${categoryColors[category]}-400)`,
                marginBottom: '1rem',
              }}
            >
              {icon}
            </div>
          </StackItem>
          <StackItem>
            <Flex
              justifyContent={{ default: 'justifyContentCenter' }}
              gap={{ default: 'gapSm' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>
                <Label color="grey" variant="outline" isCompact>
                  {categoryLabels[category]}
                </Label>
              </FlexItem>
              {isNew && (
                <FlexItem>
                  <Label color="blue" isCompact>
                    New
                  </Label>
                </FlexItem>
              )}
            </Flex>
          </StackItem>
          <StackItem>
            <Content>{description}</Content>
          </StackItem>
        </Stack>
      </CardBody>
      <CardFooter>
        <Button variant="link" onClick={handleClick} isInline>
          Go to <b>{title}</b>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Variation 2: Icon on side, description flows naturally, left-aligned
export const CapabilityCardIconSide: React.FunctionComponent<CapabilityCardProps> = ({
  capability,
}) => {
  const navigate = useNavigate();
  const { description, icon, path, isNew, category, title, onClick } = capability;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <Card style={{ height: '100%' }}>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsFlexStart' }}>
              <FlexItem>
                <div
                  style={{
                    fontSize: '36px',
                    color: `var(--pf-v6-global--palette--${categoryColors[category]}-400)`,
                    minWidth: '36px',
                  }}
                >
                  {icon}
                </div>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <Stack hasGutter>
                  <StackItem>
                    <Flex gap={{ default: 'gapSm' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                        <Label color="grey" variant="outline" isCompact>
                          {categoryLabels[category]}
                        </Label>
                      </FlexItem>
                      {isNew && (
                        <FlexItem>
                          <Label color="blue" isCompact>
                            New
                          </Label>
                        </FlexItem>
                      )}
                    </Flex>
                  </StackItem>
                  <StackItem>
                    <Content>{description}</Content>
                  </StackItem>
                </Stack>
              </FlexItem>
            </Flex>
          </StackItem>
        </Stack>
      </CardBody>
      <CardFooter>
        <Button variant="link" onClick={handleClick} isInline>
          Go to <b>{title}</b>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Variation 3: Minimal - just description with small icon, very clean
export const CapabilityCardMinimal: React.FunctionComponent<CapabilityCardProps> = ({
  capability,
}) => {
  const navigate = useNavigate();
  const { description, icon, path, isNew, category, title, onClick } = capability;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <Card
      style={{
        height: '100%',
        borderLeft: `4px solid var(--pf-v6-global--palette--${categoryColors[category]}-300)`,
      }}
    >
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <Flex gap={{ default: 'gapSm' }}>
                  <FlexItem>
                    <Label color="grey" variant="outline" isCompact>
                      {categoryLabels[category]}
                    </Label>
                  </FlexItem>
                  {isNew && (
                    <FlexItem>
                      <Label color="blue" isCompact>
                        New
                      </Label>
                    </FlexItem>
                  )}
                </Flex>
              </FlexItem>
              <FlexItem>
                <div
                  style={{
                    fontSize: '24px',
                    color: `var(--pf-v6-global--palette--${categoryColors[category]}-400)`,
                  }}
                >
                  {icon}
                </div>
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <Content>{description}</Content>
          </StackItem>
        </Stack>
      </CardBody>
      <CardFooter>
        <Button variant="link" onClick={handleClick} isInline>
          Go to <b>{title}</b>
        </Button>
      </CardFooter>
    </Card>
  );
};

// Variation 4: Editorial - minimal with larger text, icon-first
export const CapabilityCardEditorial: React.FunctionComponent<CapabilityCardProps> = ({
  capability,
}) => {
  const navigate = useNavigate();
  const { description, icon, path, isNew, category, title, onClick } = capability;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <Card
      style={{
        height: '100%',
        borderLeft: `4px solid var(--pf-v6-global--palette--${categoryColors[category]}-300)`,
      }}
    >
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <div
                  style={{
                    fontSize: '24px',
                    color: `var(--pf-v6-global--palette--${categoryColors[category]}-400)`,
                  }}
                >
                  {icon}
                </div>
              </FlexItem>
              <FlexItem>
                <Flex gap={{ default: 'gapSm' }}>
                  <FlexItem>
                    <Label color="grey" variant="outline" isCompact>
                      {categoryLabels[category]}
                    </Label>
                  </FlexItem>
                  {isNew && (
                    <FlexItem>
                      <Label color="blue" isCompact>
                        New
                      </Label>
                    </FlexItem>
                  )}
                </Flex>
              </FlexItem>
            </Flex>
          </StackItem>
          <StackItem>
            <Content isEditorial>{description}</Content>
          </StackItem>
        </Stack>
      </CardBody>
      <CardFooter>
        <Button variant="link" onClick={handleClick} isInline>
          Go to <b>{title}</b>
        </Button>
      </CardFooter>
    </Card>
  );
};

export const CapabilityCard: React.FunctionComponent<CapabilityCardProps> = ({
  capability,
  layout,
}) => {
  switch (layout) {
    case 'icon-top':
      return <CapabilityCardIconTop capability={capability} layout={layout} />;
    case 'icon-side':
      return <CapabilityCardIconSide capability={capability} layout={layout} />;
    case 'minimal':
      return <CapabilityCardMinimal capability={capability} layout={layout} />;
    case 'editorial':
      return <CapabilityCardEditorial capability={capability} layout={layout} />;
    default:
      return <CapabilityCardIconTop capability={capability} layout={layout} />;
  }
};

