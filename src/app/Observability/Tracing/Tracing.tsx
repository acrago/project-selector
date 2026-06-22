import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const Tracing: React.FunctionComponent = () => {
  useDocumentTitle("Tracing");
  return (
    <PageSection hasBodyWrapper={false}>
      <Title headingLevel="h1" size="lg">
        Tracing Page Title
      </Title>
    </PageSection>
  );
}

export { Tracing }; 