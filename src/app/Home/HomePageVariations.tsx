import * as React from 'react';
import { PageSection } from '@patternfly/react-core';
import HomeVariationToggle, { HomeVariation } from './HomeVariationToggle';
import HomeProjects from './variations/HomeProjects';
import HomeCapabilities from './variations/HomeCapabilities';
import HomeQuickStarts from './variations/HomeQuickStarts';
import HomeIllustratedGettingStarted from './variations/HomeIllustratedGettingStarted';

const HomePageVariations: React.FunctionComponent = () => {
  const [selectedVariation, setSelectedVariation] = React.useState<HomeVariation>('projects');

  const renderVariation = () => {
    switch (selectedVariation) {
      case 'projects':
        return <HomeProjects />;
      case 'capabilities':
        return <HomeCapabilities />;
      case 'quickstarts':
        return <HomeQuickStarts />;
      case 'illustrated-getting-started':
        return <HomeIllustratedGettingStarted />;
      default:
        return <HomeProjects />;
    }
  };

  return (
    <div data-testid="home-page-variations">
      <PageSection variant="default" hasBodyWrapper={false}>
        <HomeVariationToggle
          selectedVariation={selectedVariation}
          onVariationChange={setSelectedVariation}
        />
      </PageSection>
      {renderVariation()}
    </div>
  );
};

export default HomePageVariations;

