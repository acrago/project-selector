import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const ConnectionTypes: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Environment Setup - Connection Types</Content>
    <Content component={ContentVariants.p}>
      Configure external connection types and data source connections.
    </Content>
  </PageSection>
);

export { ConnectionTypes };
