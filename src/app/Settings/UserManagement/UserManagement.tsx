import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const UserManagement: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Settings - User Management</Content>
    <Content component={ContentVariants.p}>
      Manage user access, permissions, and administrative settings.
    </Content>
  </PageSection>
);

export { UserManagement };
