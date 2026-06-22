import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const WorkbenchImages: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Environment Setup - Workbench Images</Content>
    <Content component={ContentVariants.p}>
      Manage container images available for workbench environments.
    </Content>
  </PageSection>
);

export { WorkbenchImages };
