import * as React from 'react';
import {
  Card,
  CardHeader,
  Content,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  ChartLineIcon,
} from '@patternfly/react-icons';
import { CapabilityCard } from './CapabilityCardVariations';
import AiHubNavIcon from '../../../images/icons/AiHubNavIcon';
import GenAiStudioNavIcon from '../../../images/icons/GenAiStudioNavIcon';
import DevelopAndTrainNavIcon from '../../../images/icons/DevelopAndTrainNavIcon';

type CapabilityCategory = 'ai-hub' | 'gen-ai' | 'develop' | 'observe';

interface CapabilityData {
  title: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
  category: CapabilityCategory;
  isNew?: boolean;
  onClick?: () => void;
}

interface CapabilityGroupVariation2CardsProps {
  capabilities: CapabilityData[];
  includeCategories?: CapabilityCategory[];
}

const categoryInfo: Record<
  CapabilityCategory,
  { label: string; icon: React.ReactNode; description: React.ReactNode }
> = {
  'ai-hub': {
    label: 'AI Hub',
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
    label: 'Develop & Train',
    icon: <DevelopAndTrainNavIcon />,
    description: (
      <>
        Create and train AI/ML models
        <br />
        with <strong>Develop & train</strong>
      </>
    ),
  },
  observe: {
    label: 'Observe & Monitor',
    icon: <ChartLineIcon />,
    description: (
      <>
        Monitor and evaluate model performance
        <br />
        with <strong>Observe & Monitor</strong>
      </>
    ),
  },
};

const CapabilityGroupVariation2Cards: React.FunctionComponent<
  CapabilityGroupVariation2CardsProps
> = ({ capabilities, includeCategories }) => {
  // Determine which categories to display
  const categoriesToShow: CapabilityCategory[] = includeCategories || [
    'ai-hub',
    'gen-ai',
    'develop',
    'observe',
  ];

  // Initialize selectedCategory from localStorage or default to null (none selected)
  const getInitialCategory = (): CapabilityCategory | null => {
    const stored = localStorage.getItem('homeCapabilitiesSelectedCategory');
    if (stored === 'null' || stored === null) {
      return null;
    }
    if (stored && categoriesToShow.includes(stored as CapabilityCategory)) {
      return stored as CapabilityCategory;
    }
    return null;
  };

  const [selectedCategory, setSelectedCategory] =
    React.useState<CapabilityCategory | null>(getInitialCategory);

  // Save selectedCategory to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('homeCapabilitiesSelectedCategory', selectedCategory || 'null');
  }, [selectedCategory]);

  // Toggle selection: if clicking the same category, deselect it
  const handleCategoryClick = (category: CapabilityCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Group capabilities by category
  const groupedCapabilities: Record<CapabilityCategory, CapabilityData[]> = {
    'ai-hub': capabilities.filter((c) => c.category === 'ai-hub'),
    'gen-ai': capabilities.filter((c) => c.category === 'gen-ai'),
    develop: capabilities.filter((c) => c.category === 'develop'),
    observe: capabilities.filter((c) => c.category === 'observe'),
  };

  // Calculate grid column span based on number of categories
  const gridColumnSpan = categoriesToShow.length === 3 ? 4 : 3;

  return (
    <Stack hasGutter>
      <StackItem>
        <Grid hasGutter>
          {categoriesToShow.map((category) => (
            <GridItem key={category} sm={6} md={gridColumnSpan}>
              <Card
                isClickable
                isClicked={selectedCategory === category}
                isFullHeight
                variant={selectedCategory === category ? 'default' : 'secondary'}
                data-testid={`category-selector-${category}`}
              >
                <CardHeader
                  selectableActions={{
                    onClickAction: () => handleCategoryClick(category),
                    selectableActionAriaLabelledby: `category-label-${category}`,
                  }}
                >
                  <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                    <FlexItem>
                      <div
                        style={{
                          fontSize: '24px',
                          minWidth: '24px',
                        }}
                      >
                        {categoryInfo[category].icon}
                      </div>
                    </FlexItem>
                    <FlexItem flex={{ default: 'flex_1' }}>
                      <Content id={`category-label-${category}`} isEditorial>
                        {categoryInfo[category].description}
                      </Content>
                    </FlexItem>
                  </Flex>
                </CardHeader>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </StackItem>
      {selectedCategory && (
        <StackItem>
          <div data-testid={`capability-group-${selectedCategory}`}>
            <Grid hasGutter sm={6} md={4} lg={3}>
              {groupedCapabilities[selectedCategory].map((capability) => (
                <GridItem key={capability.title}>
                  <CapabilityCard capability={capability} layout="editorial" />
                </GridItem>
              ))}
            </Grid>
          </div>
        </StackItem>
      )}
    </Stack>
  );
};

export default CapabilityGroupVariation2Cards;

