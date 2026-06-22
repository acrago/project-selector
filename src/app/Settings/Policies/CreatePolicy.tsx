import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Content,
  ContentVariants,
  PageBreadcrumb,
  PageSection,
} from '@patternfly/react-core';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { PolicyForm } from './components/PolicyForm';
import { CreatePolicyFormData, Policy } from './types';

const CreatePolicy: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<CreatePolicyFormData>({
    name: '',
    displayName: '',
    description: '',
    subjects: {
      groups: [],
      users: [],
    },
    modelRefs: [],
  });

  useDocumentTitle('Create Policy');

  const breadcrumb = (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/settings/policies">Policies</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>Create policy</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );

  const handleFormDataChange = (data: CreatePolicyFormData) => {
    setFormData(data);
  };

  const generateIdFromName = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const policyId = generateIdFromName(formData.displayName);

    const newPolicy: Policy = {
      id: policyId,
      name: policyId,
      displayName: formData.displayName,
      description: formData.description,
      type: 'MaaSAuthPolicy',
      status: 'Active',
      targets: {
        groups: formData.subjects.groups.map((g) => g.name),
        users: formData.subjects.users.map((u) => u.name),
        serviceAccounts: [],
      },
      subjects: formData.subjects,
      modelRefs: formData.modelRefs,
      availableAssets: {
        models: formData.modelRefs,
      },
      limits: {},
      dateCreated: new Date(),
      createdBy: 'current-user',
    };

    navigate('/settings/policies', { state: { newPolicy } });
  };

  const handleCancel = () => {
    navigate('/settings/policies');
  };

  return (
    <>
      {breadcrumb}
      <PageSection>
        <Content component={ContentVariants.h1} id="create-policy-title">Create policy</Content>
        <Content component={ContentVariants.p} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Create a new authorization policy to control which groups and users can access AI model endpoints.
        </Content>

        <PolicyForm
          formData={formData}
          onChange={handleFormDataChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </PageSection>
    </>
  );
};

export { CreatePolicy };
