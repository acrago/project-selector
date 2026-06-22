import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const KnowledgeSources: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Knowledge Sources</Content>
    <Content component={ContentVariants.p}>
      Manage knowledge bases and data sources for your AI applications.
    </Content>
  </PageSection>
);

export { KnowledgeSources };
