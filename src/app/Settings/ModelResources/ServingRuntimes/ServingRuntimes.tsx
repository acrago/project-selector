import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const ServingRuntimes: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Model Resources - Serving Runtimes</Content>
    <Content component={ContentVariants.p}>
      Configure and manage model serving runtime environments.
    </Content>
  </PageSection>
);

export { ServingRuntimes };
