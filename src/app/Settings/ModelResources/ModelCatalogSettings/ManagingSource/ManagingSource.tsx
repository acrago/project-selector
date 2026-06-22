import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PageSection,
  PageBreadcrumb,
  Breadcrumb,
  BreadcrumbItem,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  ExpandableSection,
  FileUpload,
  FileUploadHelperText,
  Form,
  FormGroup,
  FormHelperText,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Button,
  Radio,
  TextArea,
  TextInput,
  Title,
  ActionGroup,
} from '@patternfly/react-core';
import { CubesIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon, InfoCircleIcon, UndoIcon } from '@patternfly/react-icons';

const MODEL_CATALOG_SETTINGS_PATH = '/settings/model-resources/model-catalog-settings';

const ManagingSource: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId');
  const sourceTypeFromList = searchParams.get('sourceType') || 'Hugging Face';
  const isEditMode = Boolean(sourceId);

  const [name, setName] = React.useState<string>(() => (sourceId ? 'Hugging Face admin user 1' : ''));
  const [sourceType, setSourceType] = React.useState<'hugging-face' | 'yaml'>('hugging-face');
  const [organization, setOrganization] = React.useState<string>('');
  const [accessToken, setAccessToken] = React.useState<string>('');
  const [isTokenFieldVisible, setIsTokenFieldVisible] = React.useState<boolean>(() => !sourceId);
  const [isTokenConfigured, setIsTokenConfigured] = React.useState<boolean>(() => Boolean(sourceId));
  const [isRemoveTokenModalOpen, setIsRemoveTokenModalOpen] = React.useState<boolean>(false);
  const [isReplaceTokenModalOpen, setIsReplaceTokenModalOpen] = React.useState<boolean>(false);
  const [showTokenValue, setShowTokenValue] = React.useState<boolean>(false);
  const [isModelVisibilityExpanded, setIsModelVisibilityExpanded] = React.useState<boolean>(false);
  const [includedModels, setIncludedModels] = React.useState<string>('');
  const [excludedModels, setExcludedModels] = React.useState<string>('');

  const [wasTokenCleared, setWasTokenCleared] = React.useState<boolean>(false);

  const [yamlFilename, setYamlFilename] = React.useState<string>('');
  const [yamlContent, setYamlContent] = React.useState<string>('');
  const [yamlLoading, setYamlLoading] = React.useState<boolean>(false);

  const handleYamlFileInputChange = (_event: unknown, file: File) => {
    setYamlFilename(file.name);
  };

  const handleYamlDataChange = (_event: unknown, value: string) => {
    setYamlContent(value);
  };

  const handleYamlTextChange = (_event: React.ChangeEvent<HTMLTextAreaElement>, value: string) => {
    setYamlContent(value);
  };

  const handleYamlClear = () => {
    setYamlFilename('');
    setYamlContent('');
  };

  const handleYamlReadStarted = () => {
    setYamlLoading(true);
  };

  const handleYamlReadFinished = () => {
    setYamlLoading(false);
  };

  const handleClearToken = () => {
    setIsTokenFieldVisible(true);
    setIsTokenConfigured(false);
    setAccessToken('');
    setWasTokenCleared(true);
  };

  const handleSave = () => {
    // If in default status (token configured, field not visible), navigate to source table
    if (isTokenConfigured && !isTokenFieldVisible) {
      navigate(MODEL_CATALOG_SETTINGS_PATH);
      return;
    }
    
    if (wasTokenCleared) {
      if (accessToken && accessToken.trim() !== '') {
        // User has entered a new token value, show replace token modal
        setIsReplaceTokenModalOpen(true);
      } else {
        // Token field is empty, show remove token modal
        setIsRemoveTokenModalOpen(true);
      }
    } else if (accessToken) {
      // Save the token (do nothing for now as per requirements)
      setIsTokenConfigured(true);
      setIsTokenFieldVisible(false);
    }
  };

  const handleRemoveToken = () => {
    setIsTokenConfigured(false);
    setAccessToken('');
    setIsTokenFieldVisible(false);
    setIsRemoveTokenModalOpen(false);
    setWasTokenCleared(false);
    navigate(MODEL_CATALOG_SETTINGS_PATH);
  };

  const handleDiscardRemoveToken = () => {
    setIsTokenConfigured(true);
    setAccessToken('');
    setIsTokenFieldVisible(false);
    setIsRemoveTokenModalOpen(false);
    setWasTokenCleared(false);
  };

  const handleReplaceToken = () => {
    setIsReplaceTokenModalOpen(false);
    setWasTokenCleared(false);
    navigate(MODEL_CATALOG_SETTINGS_PATH);
  };

  const handleDiscardReplaceToken = () => {
    setIsTokenConfigured(true);
    setAccessToken('');
    setIsTokenFieldVisible(false);
    setIsReplaceTokenModalOpen(false);
    setWasTokenCleared(false);
  };

  const handleRestoreToken = () => {
    setIsTokenConfigured(true);
    setAccessToken('');
    setIsTokenFieldVisible(false);
    setWasTokenCleared(false);
  };

  const handlePreview = () => {
    // Preview functionality (do nothing for now)
  };

  const handleCancel = () => {
    navigate(MODEL_CATALOG_SETTINGS_PATH);
  };

  const breadcrumb = (
    <PageBreadcrumb>
      <Breadcrumb>
        <BreadcrumbItem to={MODEL_CATALOG_SETTINGS_PATH}>Model catalog settings</BreadcrumbItem>
        <BreadcrumbItem isActive>{isEditMode ? 'Manage source' : 'Add source'}</BreadcrumbItem>
      </Breadcrumb>
    </PageBreadcrumb>
  );

  return (
    <>
      {breadcrumb}
      <PageSection>
        <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          {isEditMode ? 'Manage source' : 'Add source'}
        </Title>
        <Content
          component={ContentVariants.p}
          style={{
            color: 'var(--pf-t--global--color--text--secondary)',
            marginBottom: 'var(--pf-t--global--spacer--lg)',
          }}
        >
          Configure your source and preview how it will appear in the model catalog.
        </Content>

        <Grid hasGutter style={{ marginTop: 0 }}>
          <GridItem
            span={12}
            md={7}
            style={{
              paddingRight: 'var(--pf-t--global--spacer--xl)',
              borderRight: '1px solid var(--pf-t--global--border--color--default)',
            }}
          >
            <Form style={{ maxWidth: '600px' }}>
            <FormGroup label="Name" isRequired fieldId="name-field">
              <TextInput
                id="name-field"
                value={name}
                onChange={(_event, value) => setName(value)}
                aria-label="Name"
              />
            </FormGroup>

            <FormGroup label="Source type" isRequired fieldId="source-type-field">
              {isEditMode ? (
                <div style={{ padding: 'var(--pf-t--global--spacer--form-element--vertical--spacer) 0' }}>
                  {sourceTypeFromList}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--pf-t--global--spacer--xl)', alignItems: 'center' }}>
                  <Radio
                    id="source-type-hugging-face"
                    name="source-type"
                    label="Hugging Face repository"
                    isChecked={sourceType === 'hugging-face'}
                    onChange={() => setSourceType('hugging-face')}
                  />
                  <Radio
                    id="source-type-yaml"
                    name="source-type"
                    label="YAML file"
                    isChecked={sourceType === 'yaml'}
                    onChange={() => setSourceType('yaml')}
                  />
                </div>
              )}
            </FormGroup>

            {(!isEditMode && sourceType === 'yaml') ? (
              <FormGroup
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>Upload a YAML file *</span>
                    <Button
                      variant="link"
                      isInline
                      icon={<InfoCircleIcon />}
                      iconPosition="right"
                      onClick={() => {}}
                    >
                      View expected file format
                    </Button>
                  </div>
                }
                fieldId="yaml-upload-field"
              >
                <FileUpload
                  id="yaml-file-upload"
                  type="text"
                  value={yamlContent}
                  filename={yamlFilename}
                  filenamePlaceholder="Drag and drop a file or upload one"
                  onFileInputChange={handleYamlFileInputChange}
                  onDataChange={handleYamlDataChange}
                  onTextChange={handleYamlTextChange}
                  onReadStarted={handleYamlReadStarted}
                  onReadFinished={handleYamlReadFinished}
                  onClearClick={handleYamlClear}
                  isLoading={yamlLoading}
                  allowEditingUploadedText
                  browseButtonText="Upload"
                  clearButtonText="Clear"
                  aria-label="YAML file content"
                  dropzoneProps={{
                    accept: {
                      'application/x-yaml': ['.yaml', '.yml'],
                      'text/yaml': ['.yaml', '.yml'],
                      'text/plain': ['.yaml', '.yml'],
                    },
                  }}
                >
                  <FileUploadHelperText>
                    <HelperText>
                      <HelperTextItem>Accepted formats: YAML (.yaml, .yml)</HelperTextItem>
                    </HelperText>
                  </FileUploadHelperText>
                </FileUpload>
              </FormGroup>
            ) : (
              <>
            <FormGroup
              label="Organization"
              isRequired
              fieldId="organization-field"
            >
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="default" style={{ color: 'var(--pf-t--global--color--text--secondary)', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    Limiting each Hugging Face source to a single organization helps prevent performance issues when loading large model sets.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
              <TextInput
                id="organization-field"
                value={organization}
                onChange={(_event, value) => setOrganization(value)}
                placeholder="Example: Google/"
                aria-label="Organization"
              />
            </FormGroup>

            <FormGroup
              label="Access token"
              fieldId="access-token-field"
            >
              {isEditMode && !isTokenFieldVisible && isTokenConfigured ? (
                <>
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem variant="default" style={{ color: 'var(--pf-t--global--color--text--secondary)', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                        To fetch metadata for private or gated models, enter a fine-grained Hugging Face access token. The token must allow read access to the relevant repositories, including your namespace and public repos that you can access.
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                  <TextInput
                    id="access-token-default"
                    type="text"
                    value="*********"
                    readOnlyVariant="default"
                    aria-label="Access token"
                    tabIndex={-1}
                    style={{
                      marginBottom: 'var(--pf-t--global--spacer--md)',
                      height: '24px',
                      minHeight: '24px',
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                      cursor: 'default',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: 'var(--pf-t--global--spacer--form-element--vertical--spacer) 0', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    <InfoCircleIcon style={{ color: 'var(--pf-global--palette--purple-600)', marginTop: '0.25rem', flexShrink: 0 }} />
                    <span>The access token is hidden. To replace or remove it, clear the token.</span>
                  </div>
                  <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                    <Button
                      variant="link"
                      onClick={handleClearToken}
                    >
                      Clear token
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem variant="default" style={{ color: 'var(--pf-t--global--color--text--secondary)', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                        To fetch metadata for private or gated models, enter a fine-grained Hugging Face access token. The token must allow read access to the relevant repositories, including your namespace and public repos that you can access.
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                  <InputGroup>
                    <InputGroupItem isFill>
                      <TextInput
                        id="access-token-input"
                        type={showTokenValue ? 'text' : 'password'}
                        value={accessToken}
                        onChange={(_event, value) => setAccessToken(value)}
                        placeholder="Enter access token"
                        aria-label="Access token"
                      />
                    </InputGroupItem>
                    <InputGroupItem>
                      <Button
                        variant="plain"
                        onClick={() => setShowTokenValue(!showTokenValue)}
                        aria-label={showTokenValue ? 'Hide token' : 'Show token'}
                        icon={showTokenValue ? <EyeSlashIcon /> : <EyeIcon />}
                      />
                    </InputGroupItem>
                  </InputGroup>
                  {isEditMode && wasTokenCleared && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                      <InfoCircleIcon style={{ color: 'var(--pf-t--global--color--info--default)', marginTop: '0.25rem', flexShrink: 0 }} />
                      <span style={{ color: 'var(--pf-t--global--color--text--default)', fontSize: 'var(--pf-t--global--FontSize--sm)' }}>
                        The original token has been cleared.
                      </span>
                    </div>
                  )}
                  <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      variant="link"
                      isDisabled={!accessToken || accessToken.trim() === ''}
                      onClick={() => {
                        // Validate token functionality - to be implemented
                      }}
                    >
                      Validate
                    </Button>
                    {isEditMode && (
                      <Button
                        variant="link"
                        icon={<UndoIcon />}
                        iconPosition="left"
                        onClick={handleRestoreToken}
                      >
                        Restore token
                      </Button>
                    )}
                  </div>
                </>
              )}
            </FormGroup>
              </>
            )}

            <div style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
              <ExpandableSection
                toggleText="Model visibility"
                onToggle={(_, isExpanded) => setIsModelVisibilityExpanded(isExpanded)}
                isExpanded={isModelVisibilityExpanded}
              >
                <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <p style={{ marginBottom: 'var(--pf-t--global--spacer--lg)', color: 'var(--pf-t--global--color--text--secondary)' }}>
                    Manage which models from the allowed organization Google are accessible to users in the OpenShift AI model catalog.
                  </p>

                  <FormGroup
                    label="Included models"
                    fieldId="included-models-field"
                    style={{ marginBottom: 'var(--pf-t--global--spacer--xl)' }}
                  >
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem variant="default" style={{ color: 'var(--pf-t--global--color--text--secondary)', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                          Enter the names of models to include from this source. These models will appear in the model catalog.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                    <TextArea
                      id="included-models-input"
                      value={includedModels}
                      onChange={(_event, value) => setIncludedModels(value)}
                      placeholder="Example: Llama*, Llama-3.1-8B-Instruct"
                      aria-label="Included models"
                      rows={3}
                    />
                  </FormGroup>

                  <FormGroup
                    label="Excluded models"
                    fieldId="excluded-models-field"
                  >
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem variant="default" style={{ color: 'var(--pf-t--global--color--text--secondary)', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                          Enter the names of models to exclude from this source. These models will not appear in the model catalog.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                    <TextArea
                      id="excluded-models-input"
                      value={excludedModels}
                      onChange={(_event, value) => setExcludedModels(value)}
                      placeholder="Example: Llama*, Llama-3.1-8B-Instruct"
                      aria-label="Excluded models"
                      rows={3}
                    />
                  </FormGroup>
                </div>
              </ExpandableSection>
            </div>

            <ActionGroup style={{ marginTop: 'var(--pf-t--global--spacer--xl)' }}>
              <Button variant="primary" onClick={handleSave}>
                Save
              </Button>
              <Button variant="secondary" onClick={handlePreview}>
                Preview
              </Button>
              <Button variant="link" onClick={handleCancel}>
                Cancel
              </Button>
            </ActionGroup>
          </Form>
          </GridItem>

          <GridItem span={12} md={5} style={{ paddingLeft: 'var(--pf-t--global--spacer--xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
              <Title headingLevel="h2" size="lg" style={{ margin: 0 }}>
                Model catalog preview
              </Title>
              <Button variant="secondary" isDisabled>
                Preview
              </Button>
            </div>
            <EmptyState variant={EmptyStateVariant.lg} icon={CubesIcon}>
              <EmptyStateBody>
                <Title headingLevel="h3" size="lg">
                  Preview models
                </Title>
                <p style={{ marginTop: 'var(--pf-t--global--spacer--sm)', marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                  To view the models from this source that will appear in the model catalog with your current configuration, complete all required fields, then click Preview.
                </p>
                <Button variant="link" isDisabled>
                  Preview
                </Button>
              </EmptyStateBody>
            </EmptyState>
          </GridItem>
        </Grid>
      </PageSection>

      <Modal
        variant={ModalVariant.small}
        title="Remove token"
        isOpen={isRemoveTokenModalOpen}
        onClose={() => {
          setIsRemoveTokenModalOpen(false);
          setWasTokenCleared(false);
        }}
        aria-labelledby="remove-token-modal-title"
      >
        <ModalHeader title="Remove token" labelId="remove-token-modal-title" />
        <ModalBody>
          <p>
            Do you want to remove the token? The metadata of all associated models linked to this token will no longer be accessible in the model catalog.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={handleRemoveToken}>
            Remove token
          </Button>
          <Button 
            variant="link" 
            onClick={() => {
              setIsRemoveTokenModalOpen(false);
              setWasTokenCleared(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        variant={ModalVariant.small}
        title="Replace existing token"
        isOpen={isReplaceTokenModalOpen}
        onClose={() => {
          setIsReplaceTokenModalOpen(false);
        }}
        aria-labelledby="replace-token-modal-title"
      >
        <ModalHeader title="Replace existing token" labelId="replace-token-modal-title" />
        <ModalBody>
          <p>
            Do you want to replace the existing token? The metadata of all associated models linked to the existing token will no longer be accessible in the model catalog.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleReplaceToken}>
            Replace token
          </Button>
          <Button 
            variant="link" 
            onClick={() => {
              setIsReplaceTokenModalOpen(false);
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { ManagingSource };
