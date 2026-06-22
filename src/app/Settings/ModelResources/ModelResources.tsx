import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const ModelResources: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Settings - Model Resources and Operations</Content>
    <Content component={ContentVariants.p}>
      Configure serving runtimes and model registry settings.
    </Content>
  </PageSection>
);

export { ModelResources };
