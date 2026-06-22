import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const PipelineDefinitions: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Pipelines - Pipeline Definitions</Content>
    <Content component={ContentVariants.p}>
      Create and manage machine learning pipeline definitions.
    </Content>
  </PageSection>
);

export { PipelineDefinitions };
