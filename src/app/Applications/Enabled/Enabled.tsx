import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const Enabled: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Applications - Enabled</Content>
    <Content component={ContentVariants.p}>
      View and manage currently enabled applications in your environment.
    </Content>
  </PageSection>
);

export { Enabled };
