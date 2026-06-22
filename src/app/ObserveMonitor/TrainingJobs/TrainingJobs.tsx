import * as React from 'react';
import {
  Content,
  ContentVariants,
  PageSection,
} from '@patternfly/react-core';

const TrainingJobs: React.FunctionComponent = () => (
  <PageSection>
    <Content component={ContentVariants.h1}>Training Jobs</Content>
    <Content component={ContentVariants.p}>
      Monitor and track the progress of machine learning training jobs.
    </Content>
  </PageSection>
);

export { TrainingJobs };
