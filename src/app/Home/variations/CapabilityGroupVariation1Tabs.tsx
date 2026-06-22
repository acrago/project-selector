import * as React from 'react';
import {
  Badge,
  Grid,
  GridItem,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { CapabilityCard } from './CapabilityCardVariations';

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

interface CapabilityGroupVariation1TabsProps {
  capabilities: CapabilityData[];
}

const categoryLabels: Record<CapabilityCategory, string> = {
  'ai-hub': 'AI Hub',
  'gen-ai': 'Generative AI Studio',
  'develop': 'Develop & Train',
  'observe': 'Observe & Monitor',
};

const CapabilityGroupVariation1Tabs: React.FunctionComponent<
  CapabilityGroupVariation1TabsProps
> = ({ capabilities }) => {
  // Initialize activeTabKey from localStorage or default to 'ai-hub'
  const getInitialTabKey = (): CapabilityCategory => {
    const stored = localStorage.getItem('homeCapabilitiesTabKey');
    const validCategories: CapabilityCategory[] = ['ai-hub', 'gen-ai', 'develop', 'observe'];
    if (stored && validCategories.includes(stored as CapabilityCategory)) {
      return stored as CapabilityCategory;
    }
    return 'ai-hub';
  };

  const [activeTabKey, setActiveTabKey] = React.useState<CapabilityCategory>(getInitialTabKey);

  // Save activeTabKey to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('homeCapabilitiesTabKey', activeTabKey);
  }, [activeTabKey]);

  // Group capabilities by category
  const groupedCapabilities: Record<CapabilityCategory, CapabilityData[]> = {
    'ai-hub': capabilities.filter((c) => c.category === 'ai-hub'),
    'gen-ai': capabilities.filter((c) => c.category === 'gen-ai'),
    develop: capabilities.filter((c) => c.category === 'develop'),
    observe: capabilities.filter((c) => c.category === 'observe'),
  };

  // Count new items per category
  const newCounts: Record<CapabilityCategory, number> = {
    'ai-hub': groupedCapabilities['ai-hub'].filter((c) => c.isNew).length,
    'gen-ai': groupedCapabilities['gen-ai'].filter((c) => c.isNew).length,
    develop: groupedCapabilities.develop.filter((c) => c.isNew).length,
    observe: groupedCapabilities.observe.filter((c) => c.isNew).length,
  };

  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    setActiveTabKey(tabIndex as CapabilityCategory);
  };

  return (
    <Tabs
      activeKey={activeTabKey}
      onSelect={handleTabClick}
      aria-label="Capability categories"
      isFilled
    >
      {(Object.keys(groupedCapabilities) as CapabilityCategory[]).map((category) => (
        <Tab
          key={category}
          eventKey={category}
          title={
            <TabTitleText>
              {categoryLabels[category]}
              {newCounts[category] > 0 && (
                <>
                  {' '}
                  <Badge isRead>{newCounts[category]} new</Badge>
                </>
              )}
            </TabTitleText>
          }
        >
          <div data-testid={`capability-group-${category}`}>
            <Grid hasGutter sm={6} md={4} lg={3}>
              {groupedCapabilities[category].map((capability) => (
                <GridItem key={capability.title}>
                  <CapabilityCard capability={capability} layout="editorial" />
                </GridItem>
              ))}
            </Grid>
          </div>
        </Tab>
      ))}
    </Tabs>
  );
};

export default CapabilityGroupVariation1Tabs;



