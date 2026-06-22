import * as React from 'react';
import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, PageSection, PageSectionTypes, Title } from '@patternfly/react-core';

import { CreateWorkbenchFormData, CreateWorkbenchWizard } from './CreateWorkbenchWizard';
import { initialWorkspaceKinds } from './Workbenches';
import './CreateWorkbenchPage.css';

export const CreateWorkbenchPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const createdWorkbenchStorageKey = 'rhoai.createWorkbench.created';

  const onCancel = React.useCallback(() => {
    navigate('/develop-train/workbenches');
  }, [navigate]);

  const onCreate = React.useCallback(
    (data: CreateWorkbenchFormData) => {
      // TODO: hook up to real create API
      // eslint-disable-next-line no-console
      console.log('Create workbench:', data);
      try {
        sessionStorage.setItem(createdWorkbenchStorageKey, JSON.stringify(data));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to store created workbench in sessionStorage', e);
      }
      navigate('/develop-train/workbenches');
    },
    [navigate]
  );

  return (
    <Fragment>
      <PageSection>
        <Breadcrumb>
          <BreadcrumbItem to="/develop-train/workbenches">Workbenches</BreadcrumbItem>
          <BreadcrumbItem isActive>Create workbench</BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1" size="2xl" style={{ marginTop: 'var(--pf-v6-global--spacer--md)' }}>
          Create workbench
        </Title>
        <p style={{ marginTop: 'var(--pf-v6-global--spacer--sm)', color: '#6a6e73' }}>
          Create a new workbench to work with models in your preferred IDE.
        </p>
      </PageSection>

      <PageSection
        hasBodyWrapper={false}
        type={PageSectionTypes.wizard}
        aria-label="Wizard container"
        className="create-workbench-page__wizard-section"
      >
        <div className="create-workbench-page__wizard">
          <CreateWorkbenchWizard workspaceKinds={initialWorkspaceKinds} onClose={onCancel} onCreate={onCreate} />
        </div>
      </PageSection>
    </Fragment>
  );
};

