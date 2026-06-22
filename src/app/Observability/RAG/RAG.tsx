import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const RAG: React.FunctionComponent = () => {
  useDocumentTitle("RAG");
  return (
    <PageSection hasBodyWrapper={false}>
      <Title headingLevel="h1" size="lg">
        RAG Page Title
      </Title>
    </PageSection>
  );
}

export { RAG }; 