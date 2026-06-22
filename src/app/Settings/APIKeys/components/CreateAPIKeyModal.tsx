import * as React from 'react';
import {
  Alert,
  Button,
  CalendarMonth,
  Checkbox,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Dropdown,
  DropdownItem,
  DropdownList,
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
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Popover,
  Select,
  SelectList,
  SelectOption,
  TextArea,
  TextInput,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { CheckIcon, CopyIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon, OutlinedCalendarAltIcon, OutlinedClockIcon, TimesIcon } from '@patternfly/react-icons';
import { mockClusterConfig, mockServiceAccounts, mockSubscriptions, mockUsers } from '../mockData';
import { useUserProfile } from '@app/utils/UserProfileContext';
import { useVariantFlags } from '@app/utils/VariantFlagsContext';

interface CreateAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAPIKeyModal: React.FunctionComponent<CreateAPIKeyModalProps> = ({ isOpen, onClose }) => {
  const { userProfile } = useUserProfile();
  const { isVariantFlagEnabled } = useVariantFlags();
  const showSubscriptions = isVariantFlagEnabled('apiKeys', 'showSubscriptions');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showKeyDisplay, setShowKeyDisplay] = React.useState(false);
  const [generatedKey, setGeneratedKey] = React.useState('');
  const [isKeyVisible, setIsKeyVisible] = React.useState(false);
  const [isKeyCopied, setIsKeyCopied] = React.useState(false);
  const [showDateCorrectedAlert, setShowDateCorrectedAlert] = React.useState(false);
  const [noExpiration, setNoExpiration] = React.useState(false);
  
  const isAdmin = userProfile === 'AI Admin';

  // Owner type state — admin starts unselected, non-admin defaults to 'User'
  const [ownerType, setOwnerType] = React.useState<'User' | 'Service Account' | null>(isAdmin ? null : 'User');
  const [isOwnerTypeSelectOpen, setIsOwnerTypeSelectOpen] = React.useState(false);

  // User search state (admin only)
  const [userInputValue, setUserInputValue] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
  const [isUserSelectOpen, setIsUserSelectOpen] = React.useState(false);
  const [userFocusedItemIndex, setUserFocusedItemIndex] = React.useState<number | null>(null);
  const userTextInputRef = React.useRef<HTMLInputElement>(null);

  // Service account search state
  const [serviceAccountInputValue, setServiceAccountInputValue] = React.useState('');
  const [selectedServiceAccount, setSelectedServiceAccount] = React.useState<string | null>(null);
  const [isServiceAccountSelectOpen, setIsServiceAccountSelectOpen] = React.useState(false);
  const [serviceAccountFocusedItemIndex, setServiceAccountFocusedItemIndex] = React.useState<number | null>(null);
  const serviceAccountTextInputRef = React.useRef<HTMLInputElement>(null);
  
  // Get current username based on profile
  const getCurrentUsername = (): string => {
    switch (userProfile) {
      case 'AI Admin':
        return 'admin';
      case 'AI Engineer':
        return 'celtan';
      case 'Data Scientist':
        return 'datascientist';
      default:
        return 'user';
    }
  };
  
  // Filter users based on search (admin only)
  const filteredUsers = React.useMemo(() => {
    if (!userInputValue) return mockUsers;
    return mockUsers.filter(u =>
      u.name.toLowerCase().includes(userInputValue.toLowerCase()) ||
      u.displayName.toLowerCase().includes(userInputValue.toLowerCase())
    );
  }, [userInputValue]);

  // Filter service accounts based on search
  const filteredServiceAccounts = React.useMemo(() => {
    if (!serviceAccountInputValue) return mockServiceAccounts;
    return mockServiceAccounts.filter(sa => 
      sa.name.toLowerCase().includes(serviceAccountInputValue.toLowerCase()) ||
      sa.description.toLowerCase().includes(serviceAccountInputValue.toLowerCase())
    );
  }, [serviceAccountInputValue]);
  
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    expirationDate: '',
    expirationTime: '',
    subscriptionId: '',
  });

  // Date/time picker state
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [isTimeOpen, setIsTimeOpen] = React.useState(false);

  // Calculate max expiration date from cluster config
  const maxExpirationDate = React.useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + mockClusterConfig.maxApiKeyExpirationDays);
    return date;
  }, []);

  // Format date for display (YYYY-MM-DD)
  const formatDateForDisplay = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse date from display format (YYYY-MM-DD) to Date object
  const parseDateFromDisplay = (dateStr: string): Date | null => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const [year, month, day] = parts;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (isNaN(date.getTime())) return null;
    return date;
  };

  // Validate and auto-correct expiration date on blur
  const handleExpirationBlur = () => {
    if (!formData.expirationDate) return;
    
    const enteredDate = parseDateFromDisplay(formData.expirationDate);
    if (!enteredDate) return;
    
    // Parse time if available
    let hours = 23;
    let minutes = 59;
    if (formData.expirationTime) {
      const timeParts = formData.expirationTime.split(':');
      if (timeParts.length === 2) {
        hours = parseInt(timeParts[0]) || 0;
        minutes = parseInt(timeParts[1]) || 0;
      }
    }
    enteredDate.setHours(hours, minutes, 0, 0);
    
    // Check if date exceeds max
    if (enteredDate > maxExpirationDate) {
      // Auto-correct to max date and time
      setFormData(prev => ({
        ...prev,
        expirationDate: formatDateForDisplay(maxExpirationDate),
        expirationTime: `${String(maxExpirationDate.getHours()).padStart(2, '0')}:${String(maxExpirationDate.getMinutes()).padStart(2, '0')}`,
      }));
      setShowDateCorrectedAlert(true);
    } else {
      setShowDateCorrectedAlert(false);
    }
  };

  // Initialize subscription (expiration date is intentionally left blank)
  React.useEffect(() => {
    // Default to first subscription if user has subscriptions
    if (mockSubscriptions.length > 0 && !formData.subscriptionId) {
      setFormData(prev => ({
        ...prev,
        subscriptionId: mockSubscriptions[0].id,
      }));
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateAPIKey = (): string => {
    const prefix = 'sk-';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < 48; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate new API key
    const newKey = generateAPIKey();
    
    setGeneratedKey(newKey);
    setShowKeyDisplay(true);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      description: '',
      expirationDate: '',
      expirationTime: '',
      subscriptionId: mockSubscriptions.length > 0 ? mockSubscriptions[0].id : '',
    });
    setIsCalendarOpen(false);
    setIsTimeOpen(false);
    setShowKeyDisplay(false);
    setGeneratedKey('');
    setIsKeyVisible(false);
    setIsKeyCopied(false);
    setShowDateCorrectedAlert(false);
    setNoExpiration(false);
    // Reset owner state
    setOwnerType(isAdmin ? null : 'User');
    setIsOwnerTypeSelectOpen(false);
    setUserInputValue('');
    setSelectedUser(null);
    setIsUserSelectOpen(false);
    setUserFocusedItemIndex(null);
    setServiceAccountInputValue('');
    setSelectedServiceAccount(null);
    setIsServiceAccountSelectOpen(false);
    setServiceAccountFocusedItemIndex(null);
    onClose();
  };

  // Date/time picker handlers
  const onToggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
    setIsTimeOpen(false);
  };

  const onToggleTime = () => {
    setIsTimeOpen(!isTimeOpen);
    setIsCalendarOpen(false);
  };

  const onSelectCalendar = (_event: React.MouseEvent<HTMLButtonElement, MouseEvent>, newValueDate: Date) => {
    const newValue = formatDateForDisplay(newValueDate);
    setFormData(prev => ({ ...prev, expirationDate: newValue }));
    setIsCalendarOpen(false);
    // Set default time if not already set
    if (!formData.expirationTime) {
      setFormData(prev => ({ ...prev, expirationTime: '23:59' }));
    }
  };

  const onSelectTime = (ev: React.MouseEvent<Element, MouseEvent> | undefined) => {
    const selectedTime = ev?.currentTarget?.textContent as string;
    setFormData(prev => ({ ...prev, expirationTime: selectedTime }));
    setIsTimeOpen(false);
  };

  // Generate time options (every hour from 00:00 to 23:00, plus 23:59)
  const timeOptions = [
    ...Array.from(new Array(24), (_, i) => `${String(i).padStart(2, '0')}:00`),
    '23:59',
  ];

  const getSelectedSubscription = () => {
    return mockSubscriptions.find(sub => sub.id === formData.subscriptionId);
  };

  // Get display value for expiration
  const getExpirationDisplayValue = (): string => {
    if (!formData.expirationDate) {
      return '';
    }
    return `${formData.expirationDate} ${formData.expirationTime || ''}`.trim();
  };

  // Format expiration for summary display
  const formatExpirationForDisplay = (): string => {
    if (!formData.expirationDate) return '';
    const dateParts = formData.expirationDate.split('-');
    if (dateParts.length !== 3) return formData.expirationDate;
    const [year, month, day] = dateParts;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return formData.expirationTime ? `${dateStr} at ${formData.expirationTime}` : dateStr;
  };

  const isFormValid = () => {
    const hasName = formData.name.trim() !== '';
    const hasExpiration = noExpiration || formData.expirationDate.trim() !== '';

    let hasValidOwner = false;
    if (isAdmin) {
      if (ownerType === 'User' && selectedUser !== null) hasValidOwner = true;
      if (ownerType === 'Service Account' && selectedServiceAccount !== null) hasValidOwner = true;
    } else {
      hasValidOwner = ownerType === 'User' || (ownerType === 'Service Account' && selectedServiceAccount !== null);
    }

    return hasName && hasValidOwner && hasExpiration;
  };
  
  const getOwnerDisplayValue = (): string => {
    if (ownerType === 'User') {
      return isAdmin ? `User: ${selectedUser || ''}` : `User: ${getCurrentUsername()} (self)`;
    }
    return `Service Account: ${selectedServiceAccount || ''}`;
  };

  // Mask the API key to show only first 6 characters
  const getMaskedKey = (key: string): string => {
    if (key.length <= 6) return key;
    return key.substring(0, 6) + '•'.repeat(key.length - 6);
  };

  // Handle copying the API key
  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setIsKeyCopied(true);
    setTimeout(() => setIsKeyCopied(false), 2000);
  };

  // If key has been generated, show one-time display
  if (showKeyDisplay) {
    return (
      <Modal
        variant={ModalVariant.medium}
        title="Create API key"
        isOpen={isOpen}
        onClose={handleClose}
        id="api-key-created-modal"
      >
        <ModalHeader title="Create API key" />
        <ModalBody>
          <Alert
            variant="success"
            isInline
            title="API key created"
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
                id="generated-api-key-display"
                value={isKeyVisible ? generatedKey : getMaskedKey(generatedKey)}
                style={{ backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}
              />
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant="control"
                aria-label={isKeyVisible ? 'Hide API key' : 'Show API key'}
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                id="toggle-key-visibility-button"
              >
                {isKeyVisible ? <EyeSlashIcon /> : <EyeIcon />}
              </Button>
            </InputGroupItem>
            <InputGroupItem>
              <Button
                variant="control"
                aria-label={isKeyCopied ? 'Copied' : 'Copy to clipboard'}
                onClick={handleCopyKey}
                id="copy-api-key-button"
              >
                {isKeyCopied ? <CheckIcon color="var(--pf-t--global--icon--color--status--success--default)" /> : <CopyIcon />}
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
            <DescriptionListGroup>
              <DescriptionListTerm>Owner</DescriptionListTerm>
              <DescriptionListDescription>{getOwnerDisplayValue()}</DescriptionListDescription>
            </DescriptionListGroup>
            {showSubscriptions && getSelectedSubscription() && (
              <DescriptionListGroup>
                <DescriptionListTerm>Subscription</DescriptionListTerm>
                <DescriptionListDescription>
                  {getSelectedSubscription()?.name}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
            <DescriptionListGroup>
              <DescriptionListTerm>Expiration</DescriptionListTerm>
              <DescriptionListDescription>
                {noExpiration ? (
                  <Label id="no-expiration-label" color="orange" icon={<ExclamationTriangleIcon />}>
                    Never
                  </Label>
                ) : formData.expirationDate ? (
                  formatExpirationForDisplay()
                ) : (
                  '—'
                )}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleClose} id="key-created-close-button">
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  // Show create form
  return (
    <Modal
      variant={ModalVariant.medium}
      title="Create API key"
      isOpen={isOpen}
      onClose={handleClose}
      id="create-api-key-modal"
    >
      <ModalHeader title="Create API key" />
      <ModalBody>
        <Form id="create-api-key-form">
          <FormGroup label="Name" isRequired fieldId="api-key-name">
            <TextInput
              isRequired
              type="text"
              id="api-key-name"
              name="api-key-name"
              value={formData.name}
              onChange={(_event, value) => handleInputChange('name', value)}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>A descriptive name for this API key</HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <FormGroup label="Description (optional)" fieldId="api-key-description">
            <TextArea
              id="api-key-description"
              name="api-key-description"
              value={formData.description}
              onChange={(_event, value) => handleInputChange('description', value)}
              rows={3}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>Optional description of how this key will be used</HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <FormGroup label="Owner" isRequired fieldId="api-key-owner">
            {isAdmin ? (
              <>
                <Select
                  id="api-key-owner-type"
                  isOpen={isOwnerTypeSelectOpen}
                  selected={ownerType}
                  onSelect={(_event, value) => {
                    const newOwnerType = value as 'User' | 'Service Account';
                    setOwnerType(newOwnerType);
                    if (newOwnerType === 'User') {
                      setSelectedServiceAccount(null);
                      setServiceAccountInputValue('');
                    } else {
                      setSelectedUser(null);
                      setUserInputValue('');
                    }
                    setIsOwnerTypeSelectOpen(false);
                  }}
                  onOpenChange={(isOpen) => setIsOwnerTypeSelectOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsOwnerTypeSelectOpen(!isOwnerTypeSelectOpen)}
                      isExpanded={isOwnerTypeSelectOpen}
                      isFullWidth
                      id="api-key-owner-type-toggle"
                    >
                      {ownerType ?? 'Select an owner type'}
                    </MenuToggle>
                  )}
                  popperProps={{ appendTo: () => document.body }}
                >
                  <SelectList>
                    <SelectOption value="User" id="owner-type-user">
                      User
                    </SelectOption>
                    <SelectOption value="Service Account" id="owner-type-service-account">
                      Service Account
                    </SelectOption>
                  </SelectList>
                </Select>

                {ownerType === 'User' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Select
                      id="user-select"
                      isOpen={isUserSelectOpen}
                      selected={selectedUser}
                      onSelect={(_event, value) => {
                        const selected = mockUsers.find(u => u.id === value);
                        if (selected) {
                          setSelectedUser(selected.name);
                          setUserInputValue('');
                          setIsUserSelectOpen(false);
                          setUserFocusedItemIndex(null);
                        }
                      }}
                      onOpenChange={(isOpen) => setIsUserSelectOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          variant="typeahead"
                          aria-label="User typeahead select"
                          onClick={() => setIsUserSelectOpen(!isUserSelectOpen)}
                          isExpanded={isUserSelectOpen}
                          isFullWidth
                          id="user-select-toggle"
                        >
                          <TextInputGroup isPlain>
                            <TextInputGroupMain
                              value={selectedUser || userInputValue}
                              onClick={() => setIsUserSelectOpen(!isUserSelectOpen)}
                              onChange={(_event, value) => {
                                setUserInputValue(value);
                                setSelectedUser(null);
                                setIsUserSelectOpen(true);
                              }}
                              autoComplete="off"
                              innerRef={userTextInputRef}
                              placeholder="Find by name"
                              id="user-search"
                              aria-controls="user-listbox"
                            />
                            <TextInputGroupUtilities>
                              {(selectedUser || userInputValue) && (
                                <Button
                                  variant="plain"
                                  onClick={() => {
                                    setSelectedUser(null);
                                    setUserInputValue('');
                                    userTextInputRef.current?.focus();
                                  }}
                                  aria-label="Clear user selection"
                                  id="user-clear-button"
                                >
                                  <TimesIcon aria-hidden />
                                </Button>
                              )}
                            </TextInputGroupUtilities>
                          </TextInputGroup>
                        </MenuToggle>
                      )}
                      popperProps={{ appendTo: () => document.body }}
                    >
                      <SelectList id="user-listbox">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user, index) => (
                            <SelectOption
                              key={user.id}
                              value={user.id}
                              id={`user-option-${user.id}`}
                              description={user.displayName}
                              isFocused={userFocusedItemIndex === index}
                            >
                              {user.name}
                            </SelectOption>
                          ))
                        ) : (
                          <SelectOption isDisabled id="no-users-option">
                            No results found
                          </SelectOption>
                        )}
                      </SelectList>
                    </Select>
                  </div>
                )}

                {ownerType === 'Service Account' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Select
                      id="service-account-select"
                      isOpen={isServiceAccountSelectOpen}
                      selected={selectedServiceAccount}
                      onSelect={(_event, value) => {
                        const selected = mockServiceAccounts.find(sa => sa.id === value);
                        if (selected) {
                          setSelectedServiceAccount(selected.name);
                          setServiceAccountInputValue('');
                          setIsServiceAccountSelectOpen(false);
                          setServiceAccountFocusedItemIndex(null);
                        }
                      }}
                      onOpenChange={(isOpen) => setIsServiceAccountSelectOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          variant="typeahead"
                          aria-label="Service account typeahead select"
                          onClick={() => setIsServiceAccountSelectOpen(!isServiceAccountSelectOpen)}
                          isExpanded={isServiceAccountSelectOpen}
                          isFullWidth
                          id="service-account-toggle"
                        >
                          <TextInputGroup isPlain>
                            <TextInputGroupMain
                              value={selectedServiceAccount || serviceAccountInputValue}
                              onClick={() => setIsServiceAccountSelectOpen(!isServiceAccountSelectOpen)}
                              onChange={(_event, value) => {
                                setServiceAccountInputValue(value);
                                setSelectedServiceAccount(null);
                                setIsServiceAccountSelectOpen(true);
                              }}
                              autoComplete="off"
                              innerRef={serviceAccountTextInputRef}
                              placeholder="Find by name"
                              id="service-account-search"
                              aria-controls="service-account-listbox"
                            />
                            <TextInputGroupUtilities>
                              {(selectedServiceAccount || serviceAccountInputValue) && (
                                <Button
                                  variant="plain"
                                  onClick={() => {
                                    setSelectedServiceAccount(null);
                                    setServiceAccountInputValue('');
                                    serviceAccountTextInputRef.current?.focus();
                                  }}
                                  aria-label="Clear service account selection"
                                  id="service-account-clear-button"
                                >
                                  <TimesIcon aria-hidden />
                                </Button>
                              )}
                            </TextInputGroupUtilities>
                          </TextInputGroup>
                        </MenuToggle>
                      )}
                      popperProps={{ appendTo: () => document.body }}
                    >
                      <SelectList id="service-account-listbox">
                        {filteredServiceAccounts.length > 0 ? (
                          filteredServiceAccounts.map((sa, index) => (
                            <SelectOption
                              key={sa.id}
                              value={sa.id}
                              id={`sa-option-${sa.id}`}
                              description={sa.description}
                              isFocused={serviceAccountFocusedItemIndex === index}
                            >
                              {sa.name}
                            </SelectOption>
                          ))
                        ) : (
                          <SelectOption isDisabled id="no-service-accounts-option">
                            No results found
                          </SelectOption>
                        )}
                      </SelectList>
                    </Select>
                  </div>
                )}

                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      {ownerType === null && 'Choose whether this key is owned by a user or a service account'}
                      {ownerType === 'User' && 'Select a user to own this API key'}
                      {ownerType === 'Service Account' && 'Select a service account to own this API key'}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </>
            ) : (
              <>
                <Select
                  id="api-key-owner-type"
                  isOpen={isOwnerTypeSelectOpen}
                  selected={ownerType}
                  onSelect={(_event, value) => {
                    const newOwnerType = value as 'User' | 'Service Account';
                    setOwnerType(newOwnerType);
                    if (newOwnerType === 'User') {
                      setSelectedServiceAccount(null);
                      setServiceAccountInputValue('');
                    }
                    setIsOwnerTypeSelectOpen(false);
                  }}
                  onOpenChange={(isOpen) => setIsOwnerTypeSelectOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsOwnerTypeSelectOpen(!isOwnerTypeSelectOpen)}
                      isExpanded={isOwnerTypeSelectOpen}
                      isFullWidth
                      id="api-key-owner-type-toggle"
                    >
                      {ownerType === 'User' ? `User: ${getCurrentUsername()} (self)` : 'Service Account'}
                    </MenuToggle>
                  )}
                  popperProps={{ appendTo: () => document.body }}
                >
                  <SelectList>
                    <SelectOption value="User" id="owner-type-user">
                      {`User: ${getCurrentUsername()} (self)`}
                    </SelectOption>
                    <SelectOption value="Service Account" id="owner-type-service-account">
                      Service Account
                    </SelectOption>
                  </SelectList>
                </Select>

                {ownerType === 'Service Account' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Select
                      id="service-account-select"
                      isOpen={isServiceAccountSelectOpen}
                      selected={selectedServiceAccount}
                      onSelect={(_event, value) => {
                        const selected = mockServiceAccounts.find(sa => sa.id === value);
                        if (selected) {
                          setSelectedServiceAccount(selected.name);
                          setServiceAccountInputValue('');
                          setIsServiceAccountSelectOpen(false);
                          setServiceAccountFocusedItemIndex(null);
                        }
                      }}
                      onOpenChange={(isOpen) => setIsServiceAccountSelectOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          variant="typeahead"
                          aria-label="Service account typeahead select"
                          onClick={() => setIsServiceAccountSelectOpen(!isServiceAccountSelectOpen)}
                          isExpanded={isServiceAccountSelectOpen}
                          isFullWidth
                          id="service-account-toggle"
                        >
                          <TextInputGroup isPlain>
                            <TextInputGroupMain
                              value={selectedServiceAccount || serviceAccountInputValue}
                              onClick={() => setIsServiceAccountSelectOpen(!isServiceAccountSelectOpen)}
                              onChange={(_event, value) => {
                                setServiceAccountInputValue(value);
                                setSelectedServiceAccount(null);
                                setIsServiceAccountSelectOpen(true);
                              }}
                              autoComplete="off"
                              innerRef={serviceAccountTextInputRef}
                              placeholder="Find by name"
                              id="service-account-search"
                              aria-controls="service-account-listbox"
                            />
                            <TextInputGroupUtilities>
                              {(selectedServiceAccount || serviceAccountInputValue) && (
                                <Button
                                  variant="plain"
                                  onClick={() => {
                                    setSelectedServiceAccount(null);
                                    setServiceAccountInputValue('');
                                    serviceAccountTextInputRef.current?.focus();
                                  }}
                                  aria-label="Clear service account selection"
                                  id="service-account-clear-button"
                                >
                                  <TimesIcon aria-hidden />
                                </Button>
                              )}
                            </TextInputGroupUtilities>
                          </TextInputGroup>
                        </MenuToggle>
                      )}
                      popperProps={{ appendTo: () => document.body }}
                    >
                      <SelectList id="service-account-listbox">
                        {filteredServiceAccounts.length > 0 ? (
                          filteredServiceAccounts.map((sa, index) => (
                            <SelectOption
                              key={sa.id}
                              value={sa.id}
                              id={`sa-option-${sa.id}`}
                              description={sa.description}
                              isFocused={serviceAccountFocusedItemIndex === index}
                            >
                              {sa.name}
                            </SelectOption>
                          ))
                        ) : (
                          <SelectOption isDisabled id="no-service-accounts-option">
                            No results found
                          </SelectOption>
                        )}
                      </SelectList>
                    </Select>
                  </div>
                )}

                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      {ownerType === 'User'
                        ? 'This API key will be owned by you'
                        : 'Select a service account to own this API key'
                      }
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </>
            )}
          </FormGroup>

          {showSubscriptions && mockSubscriptions.length > 0 && (
            <FormGroup label="Subscription" isRequired fieldId="api-key-subscription">
              <FormSelect
                id="api-key-subscription"
                value={formData.subscriptionId}
                onChange={(_event, value) => handleInputChange('subscriptionId', value)}
                aria-label="Select subscription"
              >
                {mockSubscriptions.map((subscription) => (
                  <FormSelectOption
                    key={subscription.id}
                    value={subscription.id}
                    label={subscription.name}
                  />
                ))}
              </FormSelect>
            </FormGroup>
          )}

          <FormGroup label="Expiration" fieldId="api-key-expiration">
            <Checkbox
              label="No expiration"
              id="no-expiration-checkbox"
              isChecked={noExpiration}
              onChange={(_event, checked) => {
                setNoExpiration(checked);
                if (checked) {
                  setFormData(prev => ({ ...prev, expirationDate: '', expirationTime: '' }));
                  setShowDateCorrectedAlert(false);
                  setIsCalendarOpen(false);
                  setIsTimeOpen(false);
                }
              }}
              body={noExpiration ? undefined : (
                <Popover
                  position="bottom"
                  bodyContent={
                    <CalendarMonth
                      date={formData.expirationDate ? parseDateFromDisplay(formData.expirationDate) || undefined : undefined}
                      onChange={onSelectCalendar}
                      rangeStart={new Date()}
                      validators={[(date: Date) => date <= maxExpirationDate]}
                    />
                  }
                  showClose={false}
                  isVisible={isCalendarOpen}
                  hasNoPadding
                  hasAutoWidth
                  onHide={() => setIsCalendarOpen(false)}
                >
                  <InputGroup>
                    <InputGroupItem>
                      <TextInput
                        isRequired
                        type="text"
                        id="api-key-expiration"
                        aria-label="Expiration date and time"
                        value={getExpirationDisplayValue()}
                        onChange={(_event, value) => {
                          setShowDateCorrectedAlert(false);
                          const parts = value.split(' ');
                          if (parts.length >= 1) {
                            handleInputChange('expirationDate', parts[0]);
                          }
                          if (parts.length >= 2) {
                            handleInputChange('expirationTime', parts[1]);
                          }
                        }}
                        onBlur={handleExpirationBlur}
                        placeholder="YYYY-MM-DD HH:MM"
                      />
                    </InputGroupItem>
                    <InputGroupItem>
                      <Button
                        variant="control"
                        aria-label="Toggle the calendar"
                        onClick={onToggleCalendar}
                        icon={<OutlinedCalendarAltIcon />}
                        id="expiration-calendar-button"
                      />
                    </InputGroupItem>
                    <InputGroupItem>
                      <Dropdown
                        onSelect={onSelectTime}
                        isOpen={isTimeOpen}
                        onOpenChange={(isOpen: boolean) => setIsTimeOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={onToggleTime}
                            isExpanded={isTimeOpen}
                            aria-label="Time picker"
                            id="expiration-time-toggle"
                          >
                            <OutlinedClockIcon />
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          {timeOptions.map((time) => (
                            <DropdownItem key={time} id={`time-option-${time.replace(':', '-')}`}>
                              {time}
                            </DropdownItem>
                          ))}
                        </DropdownList>
                      </Dropdown>
                    </InputGroupItem>
                  </InputGroup>
                </Popover>
              )}
            />
            {noExpiration && (
              <Alert
                variant="warning"
                isInline
                isPlain
                title="API keys without an expiration date can be a security risk."
                id="no-expiration-warning-alert"
              />
            )}
            {showDateCorrectedAlert && (
              <Alert
                variant="info"
                isInline
                isPlain
                title="The maximum allowed expiration is 1 year. Contact your administrator if you need a longer expiration."
                id="expiration-date-corrected-alert"
              />
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!isFormValid() || isSubmitting}
          id="create-key-submit-button"
        >
          Create API key
        </Button>
        <Button variant="link" onClick={handleClose} id="create-key-cancel-button">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { CreateAPIKeyModal };
