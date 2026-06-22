import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const FeatureStore: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Develop & Train - Feature Store</Content>
    <Content component={ContentVariants.p}>
      Manage and share features for machine learning models.
    </Content>
  </PageSection>
);

export { FeatureStore };
