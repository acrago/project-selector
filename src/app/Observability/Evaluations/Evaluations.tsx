import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const Evaluations: React.FunctionComponent = () => {
  useDocumentTitle("Evaluations");
  return (
    <PageSection hasBodyWrapper={false}>
      <Title headingLevel="h1" size="lg">
        Evaluations Page Title
      </Title>
    </PageSection>
  );
}

export { Evaluations }; 