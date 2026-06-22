import * as React from 'react';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  ExpandableSection,
  Form,
  FormGroup,
  FormHelperText,
  FormSelect,
  FormSelectOption,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Select,
  SelectList,
  SelectOption,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { CheckIcon, CopyIcon, EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { ApiKeyV34 } from '../typesV34';
import { mockMaaSModels, mockSubscriptions } from '../../Subscriptions/mockData';

interface CreateAPIKeyModalV34Props {
  isOpen: boolean;
  onClose: () => void;
  onKeyCreated: (key: ApiKeyV34) => void;
  currentUsername: string;
  maxExpirationDays?: number;
  simulateExpiryServerError?: number;
  modelDisplayStyle?: 'chips' | 'flat' | 'table';
}

const ALL_EXPIRATION_OPTIONS = [
  { value: '30d', label: '30 days', days: 30 },
  { value: '60d', label: '60 days', days: 60 },
  { value: '90d', label: '90 days', days: 90 },
  { value: '180d', label: '180 days', days: 180 },
  { value: '365d', label: '1 year', days: 365 },
  { value: 'custom', label: 'Custom (days)', days: 0 },
];

const CreateAPIKeyModalV34: React.FunctionComponent<CreateAPIKeyModalV34Props> = ({ isOpen, onClose, onKeyCreated, currentUsername, maxExpirationDays, simulateExpiryServerError, modelDisplayStyle = 'chips' }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showKeyDisplay, setShowKeyDisplay] = React.useState(false);
  const [generatedKey, setGeneratedKey] = React.useState('');
  const [isKeyVisible, setIsKeyVisible] = React.useState(false);
  const [isKeyCopied, setIsKeyCopied] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const expirationOptions = React.useMemo(() => {
    if (maxExpirationDays) {
      const filtered = ALL_EXPIRATION_OPTIONS.filter((opt) => opt.value === 'custom' || opt.days <= maxExpirationDays);
      return filtered;
    }
    return ALL_EXPIRATION_OPTIONS;
  }, [maxExpirationDays]);

  const defaultExpiration = React.useMemo(() => {
    if (maxExpirationDays) {
      const presets = expirationOptions.filter((opt) => opt.value !== 'custom');
      const best = presets[presets.length - 1];
      return best?.value ?? '30d';
    }
    return '30d';
  }, [maxExpirationDays, expirationOptions]);

  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    expiresIn: defaultExpiration,
  });

  const [customDays, setCustomDays] = React.useState<string>('');

  const activeSubscriptions = React.useMemo(() =>
    [...mockSubscriptions]
      .filter((s) => s.status === 'Active')
      .sort((a, b) => a.priority - b.priority),
  []);

  const [selectedSubscription, setSelectedSubscription] = React.useState<string>('');
  const [isSubscriptionOpen, setIsSubscriptionOpen] = React.useState(false);

  const selectedSubscriptionData = React.useMemo(() =>
    activeSubscriptions.find((s) => s.id === selectedSubscription),
  [activeSubscriptions, selectedSubscription]);

  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, expiresIn: defaultExpiration }));
  }, [defaultExpiration]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'expiresIn') setServerError(null);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateAPIKey = (): { key: string; prefix: string } => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'sk-oai-';
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return { key, prefix: key.substring(0, 10) };
  };

  const [createdKeyData, setCreatedKeyData] = React.useState<ApiKeyV34 | null>(null);

  const computeExpirationDate = (expiresIn: string, customDaysVal?: string): Date => {
    const days = expiresIn === 'custom' ? parseInt(customDaysVal || '0') : parseInt(expiresIn.replace('d', ''));
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  const getSelectedDays = (): number => {
    if (formData.expiresIn === 'custom') {
      return parseInt(customDays || '0');
    }
    const opt = ALL_EXPIRATION_OPTIONS.find((o) => o.value === formData.expiresIn);
    return opt?.days ?? 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setServerError(null);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const selectedDays = getSelectedDays();

    if (simulateExpiryServerError && selectedDays > simulateExpiryServerError) {
      setServerError(
        `Requested expiration exceeds maximum allowed (${simulateExpiryServerError} days). Select a shorter duration or enter a custom value and try again.`,
      );
      setIsSubmitting(false);
      return;
    }

    const { key, prefix } = generateAPIKey();
    setGeneratedKey(key);

    const resolvedSubscription = activeSubscriptions.find((s) => s.id === selectedSubscription);
    const newKey: ApiKeyV34 = {
      id: `key-${Date.now()}`,
      name: formData.name,
      description: formData.description || undefined,
      username: currentUsername,
      keyPrefix: prefix,
      creationDate: new Date(),
      expirationDate: computeExpirationDate(formData.expiresIn, customDays),
      status: 'active',
      subscriptionId: resolvedSubscription?.id,
      subscriptionName: resolvedSubscription?.displayName,
    };
    setCreatedKeyData(newKey);
    setShowKeyDisplay(true);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (createdKeyData) {
      onKeyCreated(createdKeyData);
    }
    setFormData({ name: '', description: '', expiresIn: defaultExpiration });
    setCustomDays('');
    setSelectedSubscription('');
    setIsSubscriptionOpen(false);
    setShowKeyDisplay(false);
    setGeneratedKey('');
    setIsKeyVisible(false);
    setIsKeyCopied(false);
    setCreatedKeyData(null);
    setServerError(null);
    onClose();
  };

  const getMaskedKey = (key: string): string => {
    if (key.length <= 10) return key;
    return key.substring(0, 10) + '•'.repeat(key.length - 10);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setIsKeyCopied(true);
    setTimeout(() => setIsKeyCopied(false), 2000);
  };

  const getExpirationLabel = (): string => {
    if (formData.expiresIn === 'custom') {
      return `${customDays} days`;
    }
    const opt = ALL_EXPIRATION_OPTIONS.find((o) => o.value === formData.expiresIn);
    return opt?.label ?? formData.expiresIn;
  };

  const isCustomValid = formData.expiresIn !== 'custom' || (parseInt(customDays) > 0 && parseInt(customDays) <= 365);
  const isSubscriptionValid = selectedSubscription !== '';
  const isFormValid = formData.name.trim() !== '' && isCustomValid && isSubscriptionValid;

  if (showKeyDisplay) {
    return (
      <Modal
        variant={ModalVariant.medium}
        isOpen={isOpen}
        onClose={handleClose}
        id="api-key-created-modal-v34"
      >
        <ModalHeader title="Create API key" />
        <ModalBody>
          <Alert
            variant="success"
            isInline
            title="API key created"
            id="key-created-success-alert-v34"
            style={{ marginBottom: '1.5rem' }}
          >
            This is the only time that this key will be available. Copy it now and store it securely.
          </Alert>

          <Content component={ContentVariants.h4} style={{ marginBottom: '0.5rem' }}>
            Your API key
          </Content>
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                readOnly
                type="text"
                id="generated-api-key-display-v34"
                value={isKeyVisible ? generatedKey : getMaskedKey(generatedKey)}
                style={{ backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}
              />
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant="control"
                aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                id="toggle-key-visibility-v34"
              >
                {isKeyVisible ? <EyeSlashIcon /> : <EyeIcon />}
              </Button>
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant="control"
                aria-label={isKeyCopied ? 'Copied' : 'Copy to clipboard'}
                onClick={handleCopyKey}
                id="copy-api-key-v34"
              >
                {isKeyCopied ? (
                  <CheckIcon color="var(--pf-t--global--icon--color--status--success--default)" />
                ) : (
                  <CopyIcon />
                )}
              </Button>
            </InputGroupItem>
          </InputGroup>

          <Content component={ContentVariants.h4} style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            Key details
          </Content>
          <DescriptionList isHorizontal columnModifier={{ default: '1Col' }}>
            <DescriptionListGroup>
              <DescriptionListTerm>Name</DescriptionListTerm>
              <DescriptionListDescription>{formData.name}</DescriptionListDescription>
            </DescriptionListGroup>
            {formData.description && (
              <DescriptionListGroup>
                <DescriptionListTerm>Description</DescriptionListTerm>
                <DescriptionListDescription>{formData.description}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            {createdKeyData?.subscriptionName && (
              <DescriptionListGroup>
                <DescriptionListTerm>Subscription</DescriptionListTerm>
                <DescriptionListDescription>{createdKeyData.subscriptionName}</DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>Expiration</DescriptionListTerm>
              <DescriptionListDescription>{getExpirationLabel()}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleClose} id="key-created-close-v34">
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={handleClose}
      id="create-api-key-modal-v34"
    >
      <ModalHeader title="Create API key" />
      <ModalBody>
        <Form id="create-api-key-form-v34">
          <FormGroup label="Name" isRequired fieldId="api-key-name-v34">
            <TextInput
              isRequired
              type="text"
              id="api-key-name-v34"
              value={formData.name}
              onChange={(_event, value) => handleInputChange('name', value)}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>A descriptive name for this API key</HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <FormGroup label="Description" fieldId="api-key-description-v34">
            <TextArea
              id="api-key-description-v34"
              value={formData.description}
              onChange={(_event, value) => handleInputChange('description', value)}
              rows={3}
            />
          </FormGroup>

          <FormGroup label="Subscription" isRequired fieldId="api-key-subscription-v34">
            <Select
              id="api-key-subscription-v34"
              isOpen={isSubscriptionOpen}
              selected={selectedSubscription}
              onSelect={(_event, value) => {
                setSelectedSubscription(value as string);
                setIsSubscriptionOpen(false);
              }}
              onOpenChange={(isOpen) => setIsSubscriptionOpen(isOpen)}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsSubscriptionOpen(!isSubscriptionOpen)}
                  isExpanded={isSubscriptionOpen}
                  isFullWidth
                  id="api-key-subscription-toggle-v34"
                >
                  {selectedSubscriptionData?.displayName ?? 'Select a subscription'}
                </MenuToggle>
              )}
            >
              <SelectList id="api-key-subscription-list-v34">
                {activeSubscriptions.map((sub) => (
                  <SelectOption
                    key={sub.id}
                    value={sub.id}
                    description={`${sub.name} · ${sub.modelRefs.length} model${sub.modelRefs.length !== 1 ? 's' : ''}`}
                    id={`subscription-option-${sub.id}`}
                  >
                    {sub.displayName}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
            {selectedSubscriptionData ? (
              <>
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      This key will be scoped to {selectedSubscriptionData.displayName}.
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
                {modelDisplayStyle === 'table' && (
                  <>
                    <Content component={ContentVariants.h4} style={{ marginTop: 'var(--pf-t--global--spacer--md)', marginBottom: 'var(--pf-t--global--spacer--xs)' }}>
                      Models
                    </Content>
                    <Content component={ContentVariants.small} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                      Models available through this subscription.
                    </Content>
                    <Table aria-label="Subscription models" variant="compact" id="subscription-models-table">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Token limits</Th>
                          <Th>Request limits</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedSubscriptionData.modelRefs.map((ref) => {
                          const tokenLimit = Array.isArray(ref.tokenRateLimits) ? ref.tokenRateLimits[0] : ref.tokenRateLimits;
                          const requestLimit = ref.requestRateLimits
                            ? (Array.isArray(ref.requestRateLimits) ? ref.requestRateLimits[0] : ref.requestRateLimits)
                            : null;
                          const model = mockMaaSModels.find((m) => m.id === ref.name);
                          return (
                            <Tr key={ref.name}>
                              <Td dataLabel="Name" id={`sub-model-${ref.name}`}>
                                <div>
                                  <strong>{model?.name ?? ref.name}</strong>
                                </div>
                                <div style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: 'var(--pf-t--global--font--size--xs)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  {ref.name}
                                </div>
                                {model?.description && (
                                  <div style={{ fontSize: 'var(--pf-t--global--font--size--xs)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                    {model.description}
                                  </div>
                                )}
                              </Td>
                              <Td dataLabel="Token limits">
                                {tokenLimit.limit.toLocaleString()} / {tokenLimit.window === '24h' ? '24 hours' : tokenLimit.window}
                              </Td>
                              <Td dataLabel="Request limits">
                                {requestLimit
                                  ? `${requestLimit.requests.toLocaleString()} / ${requestLimit.perAmount} ${requestLimit.perUnit}`
                                  : 'Unlimited'}
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </>
                )}
                {modelDisplayStyle === 'flat' && (
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        Models: {selectedSubscriptionData.modelRefs.map((ref) => {
                          const model = mockMaaSModels.find((m) => m.id === ref.name);
                          return model?.name ?? ref.name;
                        }).join(', ')}
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                )}
                {modelDisplayStyle === 'chips' && (
                  <>
                    <DescriptionList isCompact isHorizontal columnModifier={{ default: '1Col' }} style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Available models</DescriptionListTerm>
                        <DescriptionListDescription>
                          <LabelGroup aria-label="Available models" id="subscription-models-label-group">
                            {selectedSubscriptionData.modelRefs.map((ref) => {
                              const model = mockMaaSModels.find((m) => m.id === ref.name);
                              return (
                                <Label key={ref.name} variant="outline" id={`sub-model-label-${ref.name}`}>
                                  {model?.name ?? ref.name}
                                </Label>
                              );
                            })}
                          </LabelGroup>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                    <ExpandableSection
                      toggleTextCollapsed="Show rate limits and billing details"
                      toggleTextExpanded="Hide rate limits and billing details"
                      id="subscription-details-expandable"
                      style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}
                    >
                      <DescriptionList isCompact isHorizontal columnModifier={{ default: '1Col' }}>
                        {selectedSubscriptionData.modelRefs.map((ref) => {
                          const tokenLimit = Array.isArray(ref.tokenRateLimits) ? ref.tokenRateLimits[0] : ref.tokenRateLimits;
                          const model = mockMaaSModels.find((m) => m.id === ref.name);
                          return (
                            <DescriptionListGroup key={ref.name}>
                              <DescriptionListTerm>{model?.name ?? ref.name}</DescriptionListTerm>
                              <DescriptionListDescription>
                                {tokenLimit.limit.toLocaleString()} tokens / {tokenLimit.window}
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          );
                        })}
                        {selectedSubscriptionData.billingMetadata?.costCenter && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>Cost center</DescriptionListTerm>
                            <DescriptionListDescription>
                              {selectedSubscriptionData.billingMetadata.costCenter}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        )}
                        {selectedSubscriptionData.billingMetadata?.organizationId && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>Organization</DescriptionListTerm>
                            <DescriptionListDescription>
                              {selectedSubscriptionData.billingMetadata.organizationId}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        )}
                      </DescriptionList>
                    </ExpandableSection>
                  </>
                )}
              </>
            ) : (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>Select a subscription to scope this API key. The key will only work with models in the selected subscription.</HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>

          <FormGroup label="Expiration" fieldId="api-key-expires-in-v34">
            <FormSelect
              id="api-key-expires-in-v34"
              value={formData.expiresIn}
              onChange={(_event, value) => handleInputChange('expiresIn', value)}
              aria-label="Select expiration duration"
            >
              {expirationOptions.map((opt) => (
                <FormSelectOption key={opt.value} value={opt.value} label={opt.label} />
              ))}
            </FormSelect>
            {maxExpirationDays && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>Your administrator has set a maximum expiration of {maxExpirationDays} days.</HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
          {formData.expiresIn === 'custom' && (
            <FormGroup label="Number of days" isRequired fieldId="api-key-custom-days-v34">
              <TextInput
                isRequired
                type="number"
                id="api-key-custom-days-v34"
                value={customDays}
                onChange={(_event, value) => {
                  setCustomDays(value);
                  setServerError(null);
                }}
                min={1}
                max={365}
                placeholder="Enter number of days (1–365)"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>Enter a value between 1 and 365 days</HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          )}
        </Form>
        {serverError && (
          <Alert
            variant="danger"
            isInline
            title="Error creating API key"
            id="server-error-alert-v34"
            style={{ marginTop: '1rem' }}
          >
            {serverError}
          </Alert>
        )}
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!isFormValid || isSubmitting}
          id="create-key-submit-v34"
        >
          Create API key
        </Button>
        <Button variant="link" onClick={handleClose} id="create-key-cancel-v34">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { CreateAPIKeyModalV34 };
