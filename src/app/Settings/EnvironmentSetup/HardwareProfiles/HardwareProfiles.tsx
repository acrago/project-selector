import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const HardwareProfiles: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Environment Setup - Hardware Profiles</Content>
    <Content component={ContentVariants.p}>
      Configure hardware resource profiles for workbenches and training jobs.
    </Content>
  </PageSection>
);

export { HardwareProfiles };
