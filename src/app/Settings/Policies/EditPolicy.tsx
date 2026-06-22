import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
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
import { getPolicyById } from './mockData';

const EditPolicy: React.FunctionComponent = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const navigate = useNavigate();
  const policy = policyId ? getPolicyById(policyId) : undefined;

  useDocumentTitle('Edit Policy');

  const [formData, setFormData] = React.useState<CreatePolicyFormData>(() => {
    if (!policy) {
      return {
        name: '',
        displayName: '',
        description: '',
        subjects: { groups: [], users: [] },
        modelRefs: [],
      };
    }
    return {
      name: policy.name,
      displayName: policy.displayName,
      description: policy.description || '',
      subjects: policy.subjects,
      modelRefs: policy.modelRefs,
    };
  });

  if (!policy) {
    return (
      <PageSection>
        <Alert variant="danger" title="Policy not found" id="edit-policy-not-found-alert">
          The requested policy could not be found.
        </Alert>
      </PageSection>
    );
  }

  const breadcrumb = (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/settings/policies">Policies</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/settings/policies/${policyId}`}>{policy.displayName}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>Edit policy</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );

  const handleFormDataChange = (data: CreatePolicyFormData) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedPolicy: Policy = {
      ...policy,
      displayName: formData.displayName,
      description: formData.description,
      subjects: formData.subjects,
      modelRefs: formData.modelRefs,
      targets: {
        groups: formData.subjects.groups.map((g) => g.name),
        users: formData.subjects.users.map((u) => u.name),
        serviceAccounts: [],
      },
      availableAssets: {
        models: formData.modelRefs,
      },
    };

    console.log('Updated policy:', updatedPolicy);
    navigate(`/settings/policies/${policyId}`);
  };

  const handleCancel = () => {
    navigate(`/settings/policies/${policyId}`);
  };

  return (
    <>
      {breadcrumb}
      <PageSection>
        <Content component={ContentVariants.h1} id="edit-policy-title">Edit policy</Content>
        <Content component={ContentVariants.p} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Edit the authorization policy configuration for {policy.displayName}.
        </Content>

        <PolicyForm
          formData={formData}
          onChange={handleFormDataChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditMode
          policyId={policyId}
        />
      </PageSection>
    </>
  );
};

export { EditPolicy };
