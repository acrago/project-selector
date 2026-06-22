import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const Explore: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Applications - Explore</Content>
    <Content component={ContentVariants.p}>
      Discover and explore available applications that can be deployed in your environment.
    </Content>
  </PageSection>
);

export { Explore };
