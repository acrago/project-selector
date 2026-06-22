import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const Executions: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Pipelines - Executions</Content>
    <Content component={ContentVariants.p}>
      Monitor pipeline execution details and performance metrics.
    </Content>
  </PageSection>
);

export { Executions };
