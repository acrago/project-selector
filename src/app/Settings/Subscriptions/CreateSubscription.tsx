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
import { SubscriptionForm } from './components/SubscriptionForm';
import { CreateSubscriptionForm, Subscription } from './types';


const CreateSubscription: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<CreateSubscriptionForm>({
    name: '',
    displayName: '',
    description: '',
    priority: 5,
    owner: {
      groups: [],
    },
    modelRefs: [],
    billingMetadata: {
      organizationId: '',
      costCenter: '',
    },
  });

  useDocumentTitle('Create Subscription');

  const breadcrumb = (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/settings/subscriptions">Subscriptions</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>Create subscription</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );

  const handleFormDataChange = (data: CreateSubscriptionForm) => {
    setFormData(data);
  };

  // Generate ID from display name (lowercase, hyphenated)
  const generateIdFromName = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate subscription ID from display name
    const subscriptionId = generateIdFromName(formData.displayName);

    // Build the new subscription object
    const newSubscription: Subscription = {
      id: subscriptionId,
      name: subscriptionId,
      displayName: formData.displayName,
      description: formData.description,
      priority: formData.priority,
      status: 'Active',
      owner: formData.owner,
      modelRefs: formData.modelRefs.filter((ref) => ref.name.trim() !== ''),
      billingMetadata: formData.billingMetadata,
      dateCreated: new Date(),
      createdBy: 'current-user',
    };

    // Navigate back to the subscriptions list, passing the new subscription via state
    navigate('/settings/subscriptions', { state: { newSubscription } });
  };

  const handleCancel = () => {
    navigate('/settings/subscriptions');
  };

  return (
    <>
      {breadcrumb}
      <PageSection>
        <Content component={ContentVariants.h1}>Create subscription</Content>
        <Content component={ContentVariants.p} style={{ marginTop: '0.5rem' }}>
          Create a new subscription to control access and entitlements to AI model endpoints.
        </Content>

        <SubscriptionForm
          formData={formData}
          onChange={handleFormDataChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </PageSection>
    </>
  );
};

export { CreateSubscription };
