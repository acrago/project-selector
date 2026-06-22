import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const EnvironmentSetup: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Settings - Environment Setup</Content>
    <Content component={ContentVariants.p}>
      Configure workbench images, hardware profiles, and connection types.
    </Content>
  </PageSection>
);

export { EnvironmentSetup };
