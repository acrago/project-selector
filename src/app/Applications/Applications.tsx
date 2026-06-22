import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const Applications: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Applications</Content>
    <Content component={ContentVariants.p}>
      Manage deployed applications and services in your environment.
    </Content>
  </PageSection>
);

export { Applications };
