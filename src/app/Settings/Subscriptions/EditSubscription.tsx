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
import { SubscriptionForm } from './components/SubscriptionForm';
import { CreateSubscriptionForm, Subscription } from './types';
import { getSubscriptionById } from './mockData';

const EditSubscription: React.FunctionComponent = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();
  const subscription = subscriptionId ? getSubscriptionById(subscriptionId) : undefined;

  useDocumentTitle('Edit Subscription');

  const [formData, setFormData] = React.useState<CreateSubscriptionForm>(() => {
    if (!subscription) {
      return {
        name: '',
        displayName: '',
        description: '',
        priority: 5,
        owner: { groups: [] },
        modelRefs: [],
        billingMetadata: { organizationId: '', costCenter: '' },
      };
    }
    return {
      name: subscription.name,
      displayName: subscription.displayName,
      description: subscription.description || '',
      priority: subscription.priority,
      owner: subscription.owner,
      modelRefs: subscription.modelRefs,
      billingMetadata: subscription.billingMetadata || { organizationId: '', costCenter: '' },
    };
  });

  if (!subscription) {
    return (
      <PageSection>
        <Alert variant="danger" title="Subscription not found" id="edit-subscription-not-found-alert">
          The requested subscription could not be found.
        </Alert>
      </PageSection>
    );
  }

  const breadcrumb = (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/settings/subscriptions">Subscriptions</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/settings/subscriptions/${subscriptionId}`}>{subscription.displayName}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>Edit subscription</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );

  const handleFormDataChange = (data: CreateSubscriptionForm) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedSubscription: Subscription = {
      ...subscription,
      displayName: formData.displayName,
      description: formData.description,
      priority: formData.priority,
      owner: formData.owner,
      modelRefs: formData.modelRefs.filter((ref) => ref.name.trim() !== ''),
      billingMetadata: formData.billingMetadata,
    };

    console.log('Updated subscription:', updatedSubscription);
    navigate(`/settings/subscriptions/${subscriptionId}`);
  };

  const handleCancel = () => {
    navigate(`/settings/subscriptions/${subscriptionId}`);
  };

  return (
    <>
      {breadcrumb}
      <PageSection>
        <Content component={ContentVariants.h1} id="edit-subscription-title">Edit subscription</Content>
        <Content component={ContentVariants.p} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          Edit the subscription configuration for {subscription.displayName}.
        </Content>

        <SubscriptionForm
          formData={formData}
          onChange={handleFormDataChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditMode
          subscriptionId={subscriptionId}
        />
      </PageSection>
    </>
  );
};

export { EditSubscription };
