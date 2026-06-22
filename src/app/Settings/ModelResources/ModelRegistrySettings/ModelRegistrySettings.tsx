import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const ModelRegistrySettings: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Model Resources - Model Registry Settings</Content>
    <Content component={ContentVariants.p}>
      Configure model registry connection and settings.
    </Content>
  </PageSection>
);

export { ModelRegistrySettings };
