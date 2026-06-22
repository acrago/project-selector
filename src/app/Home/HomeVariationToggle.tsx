import * as React from 'react';
import {
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Label,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { CubeIcon, LayerGroupIcon, OutlinedLightbulbIcon, RocketIcon } from '@patternfly/react-icons';

export type HomeVariation = 'projects' | 'capabilities' | 'quickstarts' | 'illustrated-getting-started';

interface HomeVariationToggleProps {
  selectedVariation: HomeVariation;
  onVariationChange: (variation: HomeVariation) => void;
}

const HomeVariationToggle: React.FunctionComponent<HomeVariationToggleProps> = ({
  selectedVariation,
  onVariationChange,
}) => {
  return (
    <Card style={{ marginBottom: '1rem', background: 'var(--pf-v6-global--BackgroundColor--200)' }}>
      <CardBody>
        <Flex
          direction={{ default: 'column', md: 'row' }}
          alignItems={{ default: 'alignItemsFlexStart', md: 'alignItemsCenter' }}
          gap={{ default: 'gapMd' }}
        >
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem>
                <Content>
                  <small>
                    <strong>Home Page Variation:</strong>
                  </small>
                </Content>
              </FlexItem>
              <FlexItem>
                <Label color="blue" isCompact>
                  Prototype
                </Label>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <ToggleGroup aria-label="Home page variation selector">
              <ToggleGroupItem
                text={
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <CubeIcon />
                    </FlexItem>
                    <FlexItem>Projects</FlexItem>
                  </Flex>
                }
                buttonId="projects-toggle"
                isSelected={selectedVariation === 'projects'}
                onChange={() => onVariationChange('projects')}
              />
              <ToggleGroupItem
                text={
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <LayerGroupIcon />
                    </FlexItem>
                    <FlexItem>Capabilities</FlexItem>
                  </Flex>
                }
                buttonId="capabilities-toggle"
                isSelected={selectedVariation === 'capabilities'}
                onChange={() => onVariationChange('capabilities')}
              />
              <ToggleGroupItem
                text={
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <RocketIcon />
                    </FlexItem>
                    <FlexItem>Quick Starts</FlexItem>
                  </Flex>
                }
                buttonId="quickstarts-toggle"
                isSelected={selectedVariation === 'quickstarts'}
                onChange={() => onVariationChange('quickstarts')}
              />
              <ToggleGroupItem
                text={
                  <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <OutlinedLightbulbIcon />
                    </FlexItem>
                    <FlexItem>Illustrated Getting Started</FlexItem>
                  </Flex>
                }
                buttonId="illustrated-getting-started-toggle"
                isSelected={selectedVariation === 'illustrated-getting-started'}
                onChange={() => onVariationChange('illustrated-getting-started')}
              />
            </ToggleGroup>
          </FlexItem>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default HomeVariationToggle;

