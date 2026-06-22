import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Content,
  ContentVariants,
  DatePicker,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { CreatePolicyForm } from '../types';
import { mockGroups, mockServiceAccounts, mockUsers } from '../mockData';
import { mockModels } from '@app/Settings/APIKeys/mockData';
import { AIAssetSelect, AssetOption } from '@app/Settings/APIKeys/components/AIAssetSelect';

interface CreatePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePolicyModal: React.FunctionComponent<CreatePolicyModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<CreatePolicyForm>({
    name: '',
    description: '',
    availableAssets: {
      models: ['all'],
    },
    limits: {
      tokenLimit: undefined,
      rateLimit: undefined,
      timeLimit: null,
    },
    targets: {
      groups: [],
      users: [],
      serviceAccounts: [],
    },
  });

  const [tokenLimitEnabled, setTokenLimitEnabled] = React.useState(false);
  const [rateLimitEnabled, setRateLimitEnabled] = React.useState(false);
  const [timeLimitEnabled, setTimeLimitEnabled] = React.useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parentField: string, field: string, value: any) => {
    setFormData(prev => {
      const parentObj = prev[parentField as keyof CreatePolicyForm] as any;
      return {
        ...prev,
        [parentField]: {
          ...parentObj,
          [field]: value,
        },
      };
    });
  };

  const handleLimitChange = (limitType: 'tokenLimit' | 'rateLimit', field: 'amount' | 'period', value: any) => {
    setFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [limitType]: {
          ...prev.limits[limitType],
          [field]: value,
        },
      },
    }));
  };

  const handleTimeLimitChange = (field: 'start' | 'end', date: Date | null | undefined) => {
    setFormData(prev => {
      const currentTimeLimit = prev.limits.timeLimit || { start: new Date(), end: new Date() };
      return {
        ...prev,
        limits: {
          ...prev.limits,
          timeLimit: {
            ...currentTimeLimit,
            [field]: date || new Date(),
          },
        },
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate new policy ID
    const policyId = formData.name.toLowerCase().replace(/\s+/g, '-');
    
    // Navigate to the new policy details page
    navigate(`/settings/policies/${policyId}`);
    onClose();
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.targets.groups.length + formData.targets.users.length + formData.targets.serviceAccounts.length > 0;
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      description: '',
      availableAssets: {
        models: ['all'],
      },
      limits: {
        tokenLimit: undefined,
        rateLimit: undefined,
        timeLimit: null,
      },
      targets: {
        groups: [],
        users: [],
        serviceAccounts: [],
      },
    });
    setTokenLimitEnabled(false);
    setRateLimitEnabled(false);
    setTimeLimitEnabled(false);
    onClose();
  };

  // Prepare asset options for the select components
  const modelOptions: AssetOption[] = [
    { id: 'all', name: 'All models', description: 'Grant access to all models' },
    ...mockModels.map(model => ({
      id: model.id,
      name: model.name,
      description: model.id
    }))
  ];

  const groupOptions: AssetOption[] = mockGroups.map(group => ({
    id: group.id,
    name: group.name
  }));

  const userOptions: AssetOption[] = mockUsers.map(user => ({
    id: user.id,
    name: user.name
  }));

  const serviceAccountOptions: AssetOption[] = mockServiceAccounts.map(sa => ({
    id: sa.id,
    name: sa.name
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="create-policy-modal-title"
      aria-describedby="create-policy-modal-body"
      ouiaId="CreatePolicyModal"
      appendTo={document.body}
      className="pf-m-md"
    >
      <ModalHeader title="Create policy" labelId="create-policy-modal-title" />
      <ModalBody id="create-policy-modal-body">
        <Form>
          {/* Basic Information */}
          <FormGroup label="Name" isRequired>
            <TextInput
              id="policy-name-input"
              value={formData.name}
              onChange={(_event, value) => handleInputChange('name', value)}
              placeholder="Enter a descriptive name for this policy"
              isDisabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup label="Description">
            <TextArea
              id="policy-description-input"
              value={formData.description}
              onChange={(_event, value) => handleInputChange('description', value)}
              placeholder="Describe the policy's purpose"
              rows={3}
              isDisabled={isSubmitting}
            />
          </FormGroup>


          {/* Targets */}
          <Content component={ContentVariants.h3} style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            Targets
          </Content>

          <FormGroup label="Groups">
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  This policy will apply to all users in these groups.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
            <AIAssetSelect
              options={groupOptions}
              selected={formData.targets.groups}
              onSelect={(selectedIds) => handleNestedInputChange('targets', 'groups', selectedIds)}
              placeholder="Select groups"
              ariaLabel="Groups selection"
              id="policy-groups-select"
              isDisabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup label="Users">
            <AIAssetSelect
              options={userOptions}
              selected={formData.targets.users}
              onSelect={(selectedIds) => handleNestedInputChange('targets', 'users', selectedIds)}
              placeholder="Select users"
              ariaLabel="Users selection"
              id="policy-users-select"
              isDisabled={isSubmitting}
            />
          </FormGroup>

          <FormGroup label="Service Accounts">
            <AIAssetSelect
              options={serviceAccountOptions}
              selected={formData.targets.serviceAccounts}
              onSelect={(selectedIds) => handleNestedInputChange('targets', 'serviceAccounts', selectedIds)}
              placeholder="Select service accounts"
              ariaLabel="Service accounts selection"
              id="policy-service-accounts-select"
              isDisabled={isSubmitting}
            />
          </FormGroup>


          {/* Available Assets */}
          <Content component={ContentVariants.h3} style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            AI assets
          </Content>

          <FormGroup label="Models">
            <AIAssetSelect
              options={modelOptions}
              selected={formData.availableAssets.models}
              onSelect={(selectedIds) => handleNestedInputChange('availableAssets', 'models', selectedIds)}
              placeholder="Select models"
              ariaLabel="Models selection"
              id="policy-models-select"
              isDisabled={isSubmitting}
            />
          </FormGroup>

          {/* Limits */}
          <Content component={ContentVariants.h3} style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            Limits
          </Content>

          {/* Token Limit */}
          <FormGroup>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <input
                  type="checkbox"
                  id="token-limit-enabled"
                  checked={tokenLimitEnabled}
                  onChange={(e) => setTokenLimitEnabled(e.target.checked)}
                  disabled={isSubmitting}
                  style={{ cursor: 'pointer' }}
                />
              </FlexItem>
              <FlexItem>
                <label htmlFor="token-limit-enabled" style={{ cursor: 'pointer' }}>
                  Token limit
                </label>
              </FlexItem>
            </Flex>
          </FormGroup>

          {tokenLimitEnabled && (
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsFlexEnd' }}>
              <FlexItem flex={{ default: 'flex_1' }}>
                <FormGroup label="Amount">
                  <NumberInput
                    id="token-limit-amount"
                    value={formData.limits.tokenLimit?.amount || 0}
                    onMinus={() => {
                      const current = formData.limits.tokenLimit?.amount || 0;
                      handleLimitChange('tokenLimit', 'amount', Math.max(0, current - 1000));
                    }}
                    onChange={(event) => {
                      const value = parseInt((event.target as HTMLInputElement).value) || 0;
                      handleLimitChange('tokenLimit', 'amount', value);
                    }}
                    onPlus={() => {
                      const current = formData.limits.tokenLimit?.amount || 0;
                      handleLimitChange('tokenLimit', 'amount', current + 1000);
                    }}
                    inputName="token-limit-amount"
                    inputAriaLabel="Token limit amount"
                    minusBtnAriaLabel="Decrease token limit"
                    plusBtnAriaLabel="Increase token limit"
                    min={0}
                    isDisabled={isSubmitting}
                  />
                </FormGroup>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <FormGroup label="Per">
                  <select
                    id="token-limit-period"
                    value={formData.limits.tokenLimit?.period || 'minute'}
                    onChange={(e) => handleLimitChange('tokenLimit', 'period', e.target.value as 'minute' | 'hour' | 'day')}
                    disabled={isSubmitting}
                    style={{ 
                      width: '100%', 
                      padding: '0.375rem 0.75rem', 
                      border: '1px solid #d2d2d2', 
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="minute">Minute</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                  </select>
                </FormGroup>
              </FlexItem>
            </Flex>
          )}

          {/* Rate Limit */}
          <FormGroup>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <input
                  type="checkbox"
                  id="rate-limit-enabled"
                  checked={rateLimitEnabled}
                  onChange={(e) => setRateLimitEnabled(e.target.checked)}
                  disabled={isSubmitting}
                  style={{ cursor: 'pointer' }}
                />
              </FlexItem>
              <FlexItem>
                <label htmlFor="rate-limit-enabled" style={{ cursor: 'pointer' }}>
                  Rate limit
                </label>
              </FlexItem>
            </Flex>
          </FormGroup>

          {rateLimitEnabled && (
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsFlexEnd' }}>
              <FlexItem flex={{ default: 'flex_1' }}>
                <FormGroup label="Amount">
                  <NumberInput
                    id="rate-limit-amount"
                    value={formData.limits.rateLimit?.amount || 0}
                    onMinus={() => {
                      const current = formData.limits.rateLimit?.amount || 0;
                      handleLimitChange('rateLimit', 'amount', Math.max(0, current - 100));
                    }}
                    onChange={(event) => {
                      const value = parseInt((event.target as HTMLInputElement).value) || 0;
                      handleLimitChange('rateLimit', 'amount', value);
                    }}
                    onPlus={() => {
                      const current = formData.limits.rateLimit?.amount || 0;
                      handleLimitChange('rateLimit', 'amount', current + 100);
                    }}
                    inputName="rate-limit-amount"
                    inputAriaLabel="Rate limit amount"
                    minusBtnAriaLabel="Decrease rate limit"
                    plusBtnAriaLabel="Increase rate limit"
                    min={0}
                    isDisabled={isSubmitting}
                  />
                </FormGroup>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <FormGroup label="Per">
                  <select
                    id="rate-limit-period"
                    value={formData.limits.rateLimit?.period || 'minute'}
                    onChange={(e) => handleLimitChange('rateLimit', 'period', e.target.value as 'minute' | 'hour' | 'day')}
                    disabled={isSubmitting}
                    style={{ 
                      width: '100%', 
                      padding: '0.375rem 0.75rem', 
                      border: '1px solid #d2d2d2', 
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="minute">Minute</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                  </select>
                </FormGroup>
              </FlexItem>
            </Flex>
          )}

          {/* Time Limit */}
          <FormGroup>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <input
                  type="checkbox"
                  id="time-limit-enabled"
                  checked={timeLimitEnabled}
                  onChange={(e) => setTimeLimitEnabled(e.target.checked)}
                  disabled={isSubmitting}
                  style={{ cursor: 'pointer' }}
                />
              </FlexItem>
              <FlexItem>
                <label htmlFor="time-limit-enabled" style={{ cursor: 'pointer' }}>
                  Time limit
                </label>
              </FlexItem>
            </Flex>
          </FormGroup>

          {timeLimitEnabled && (
            <Flex spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem flex={{ default: 'flex_1' }}>
                <FormGroup label="Start time">
                  <DatePicker
                    id="time-limit-start"
                    value={formData.limits.timeLimit?.start ? formData.limits.timeLimit.start.toISOString().split('T')[0] : ''}
                    onChange={(_event, str, date) => handleTimeLimitChange('start', date)}
                    placeholder="Select start date"
                    isDisabled={isSubmitting}
                  />
                </FormGroup>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <FormGroup label="End time">
                  <DatePicker
                    id="time-limit-end"
                    value={formData.limits.timeLimit?.end ? formData.limits.timeLimit.end.toISOString().split('T')[0] : ''}
                    onChange={(_event, str, date) => handleTimeLimitChange('end', date)}
                    placeholder="Select end date"
                    isDisabled={isSubmitting}
                  />
                </FormGroup>
              </FlexItem>
            </Flex>
          )}

        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="create"
          variant="primary"
          onClick={handleSubmit}
          isDisabled={!isFormValid() || isSubmitting}
          isLoading={isSubmitting}
          id="create-policy-submit-button"
        >
          {isSubmitting ? 'Creating...' : 'Create policy'}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={handleClose}
          isDisabled={isSubmitting}
          id="create-policy-cancel-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { CreatePolicyModal };

