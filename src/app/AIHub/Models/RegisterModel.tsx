import React, { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Form,
  FormGroup,
  FormSection,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Radio,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextArea,
  TextInput,
  Title
} from '@patternfly/react-core';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import WandIcon from '@app/assets/wand-icon.svg';
import { Link, useNavigate } from 'react-router-dom';

const RegisterModel: React.FunctionComponent = () => {
  useDocumentTitle('Register model');
  const navigate = useNavigate();

  // Form state
  const [modelName, setModelName] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  const [versionName, setVersionName] = useState('');
  const [versionDescription, setVersionDescription] = useState('');
  const [sourceModelFormat, setSourceModelFormat] = useState('');
  const [sourceModelFormatVersion, setSourceModelFormatVersion] = useState('');
  const [locationType, setLocationType] = useState<'object-storage' | 'uri' | null>('object-storage');
  const [endpoint, setEndpoint] = useState('');
  const [bucket, setBucket] = useState('');
  const [region, setRegion] = useState('');
  const [path, setPath] = useState('');
  const [uri, setUri] = useState('');
  
  // Modal state
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

  const handleCancel = () => {
    navigate('/ai-hub/models/registry');
  };

  const handleRegister = () => {
    setIsFeatureModalOpen(true);
  };

  const handleAutofillClick = () => {
    setIsFeatureModalOpen(true);
  };

  const handleObjectStorageClick = () => {
    setLocationType(locationType === 'object-storage' ? null : 'object-storage');
  };

  const handleUriClick = () => {
    setLocationType(locationType === 'uri' ? null : 'uri');
  };

  const isFormValid = modelName.trim() !== '' && versionName.trim() !== '' && 
    ((locationType === 'uri' && uri.trim() !== '') || (locationType === 'object-storage' && endpoint.trim() !== '' && bucket.trim() !== '' && path.trim() !== ''));

  return (
    <>
      <PageSection variant="default">
        <Breadcrumb>
<BreadcrumbItem>
            <Link to="/ai-hub/registry">Model registry - registry</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            Register model
          </BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      <PageSection>
        <Stack hasGutter>
          <StackItem>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <Title headingLevel="h1" size="2xl" style={{ marginBottom: '0.75rem' }}>
                  Register model
                </Title>
                <Stack hasGutter>
                  <StackItem>
                    Create a new model and register the first version of your new model.
                  </StackItem>
                </Stack>
              </div>
            </div>
          </StackItem>
        </Stack>
      </PageSection>

      <PageSection isFilled>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <PageSection isFilled style={{ padding: 0 }}>
            <div style={{ maxWidth: '800px', width: '100%' }}>
              <Form>
              <Stack hasGutter>
                <StackItem style={{ marginBottom: '2rem' }}>
                  <FormGroup>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Model registry</strong>
                    </div>
                    <div>registry</div>
                  </FormGroup>
                </StackItem>

                <StackItem>
                  <FormSection
                    title="Model details"
                    titleElement="div"
                  >
                    <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)', marginBottom: '1rem' }}>
                      Provide general details that apply to all versions of this model.
                    </div>
                    
                    <FormGroup
                      label="Model name"
                      isRequired
                      fieldId="model-name"
                    >
                      <TextInput
                        isRequired
                        type="text"
                        id="model-name"
                        name="model-name"
                        value={modelName}
                        onChange={(_event, value) => setModelName(value)}
                      />
                    </FormGroup>

                    <FormGroup
                      label="Model description"
                      fieldId="model-description"
                    >
                      <TextArea
                        type="text"
                        id="model-description"
                        name="model-description"
                        value={modelDescription}
                        onChange={(_event, value) => setModelDescription(value)}
                      />
                    </FormGroup>
                  </FormSection>

                  <FormSection
                    title="Version details"
                    titleElement="div"
                  >
                    <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)', marginBottom: '1rem' }}>
                      Configure details for the first version of this model.
                    </div>

                    <FormGroup
                      label="Version name"
                      isRequired
                      fieldId="version-name"
                    >
                      <TextInput
                        isRequired
                        type="text"
                        id="version-name"
                        name="version-name"
                        value={versionName}
                        onChange={(_event, value) => setVersionName(value)}
                      />
                    </FormGroup>

                    <FormGroup
                      label="Version description"
                      fieldId="version-description"
                    >
                      <TextArea
                        type="text"
                        id="version-description"
                        name="version-description"
                        value={versionDescription}
                        onChange={(_event, value) => setVersionDescription(value)}
                      />
                    </FormGroup>

                    <FormGroup
                      label="Source model format"
                      fieldId="source-model-format"
                    >
                      <TextInput
                        type="text"
                        id="source-model-format"
                        name="source-model-format"
                        placeholder="Example, tensorflow"
                        value={sourceModelFormat}
                        onChange={(_event, value) => setSourceModelFormat(value)}
                      />
                    </FormGroup>

                    <FormGroup
                      label="Source model format version"
                      fieldId="source-model-format-version"
                    >
                      <TextInput
                        type="text"
                        id="source-model-format-version"
                        name="source-model-format-version"
                        placeholder="Example, 1"
                        value={sourceModelFormatVersion}
                        onChange={(_event, value) => setSourceModelFormatVersion(value)}
                      />
                    </FormGroup>
                  </FormSection>

                  <FormSection
                    title="Model location"
                    titleElement="div"
                    style={{ marginBottom: '4rem' }}
                  >
                    <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)', marginBottom: '1rem' }}>
                      Specify the model location by providing either the object storage details or the URI.
                    </div>

                    <Split hasGutter>
                      <SplitItem isFilled>
                        <Radio
                          isChecked={locationType === 'object-storage'}
                          name="location-type-object-storage"
                          onChange={handleObjectStorageClick}
                          label="Object storage"
                          id="location-type-object-storage"
                        />
                      </SplitItem>
                      <SplitItem>
                        <Button
                          variant="link"
                          icon={
                            <div 
                              style={{ width: '1em', height: '1em' }}
                              dangerouslySetInnerHTML={{ __html: WandIcon }}
                            />
                          }
                          iconPosition="start"
                          onClick={handleAutofillClick}
                          data-testid="object-storage-autofill-button"
                        >
                          Autofill from connection
                        </Button>
                      </SplitItem>
                    </Split>

                    {locationType === 'object-storage' && (
                      <>
                        <FormGroup
                          label="Endpoint"
                          isRequired
                          fieldId="location-endpoint"
                          style={{ marginLeft: '2rem' }}
                        >
                          <TextInput
                            isRequired
                            type="text"
                            id="location-endpoint"
                            name="location-endpoint"
                            value={endpoint}
                            onChange={(_event, value) => setEndpoint(value)}
                          />
                        </FormGroup>

                        <FormGroup
                          label="Bucket"
                          isRequired
                          fieldId="location-bucket"
                          style={{ marginLeft: '2rem' }}
                        >
                          <TextInput
                            isRequired
                            type="text"
                            id="location-bucket"
                            name="location-bucket"
                            value={bucket}
                            onChange={(_event, value) => setBucket(value)}
                          />
                        </FormGroup>

                        <FormGroup
                          label="Region"
                          fieldId="location-region"
                          style={{ marginLeft: '2rem' }}
                        >
                          <TextInput
                            type="text"
                            id="location-region"
                            name="location-region"
                            value={region}
                            onChange={(_event, value) => setRegion(value)}
                          />
                        </FormGroup>

                        <FormGroup
                          label="Path"
                          isRequired
                          fieldId="location-path"
                          style={{ marginLeft: '2rem' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontSize: '1rem', color: '#151515' }}>/</span>
                            <TextInput
                              isRequired
                              type="text"
                              id="location-path"
                              name="location-path"
                              value={path}
                              onChange={(_event, value) => setPath(value)}
                              style={{ flex: 1 }}
                            />
                          </div>
                          <HelperText>
                            <HelperTextItem>
                              Enter a path to a model or folder. This path cannot point to a root folder.
                            </HelperTextItem>
                          </HelperText>
                        </FormGroup>
                      </>
                    )}

                    <Split hasGutter style={{ marginBottom: locationType === 'uri' ? '0.5rem' : '3rem' }}>
                      <SplitItem isFilled>
                        <Radio
                          isChecked={locationType === 'uri'}
                          name="location-type-uri"
                          onChange={handleUriClick}
                          label="URI"
                          id="location-type-uri"
                        />
                      </SplitItem>
                    </Split>

                    {locationType === 'uri' && (
                      <FormGroup
                        label="URI"
                        isRequired
                        fieldId="location-uri"
                        style={{ marginLeft: '2rem', marginTop: '-0.5rem' }}
                      >
                        <TextInput
                          isRequired
                          type="text"
                          id="location-uri"
                          name="location-uri"
                          placeholder="s3://bucket-name/path/to/model"
                          value={uri}
                          onChange={(_event, value) => setUri(value)}
                        />
                      </FormGroup>
                    )}
                  </FormSection>
                </StackItem>
              </Stack>
            </Form>
            </div>
          </PageSection>

          <PageSection 
            variant="default" 
            isFilled={false} 
            style={{ 
              position: 'sticky',
              bottom: 0,
              zIndex: 100,
              backgroundColor: 'white',
              borderTop: '1px solid #d2d2d2',
              marginTop: 'auto'
            }}
          >
            <Stack hasGutter>
              <StackItem>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button
                    variant="primary"
                    onClick={handleRegister}
                    isDisabled={!isFormValid}
                    id="create-button"
                    data-testid="create-button"
                  >
                    Register model
                  </Button>
                  <Button
                    variant="link"
                    onClick={handleCancel}
                    id="cancel-button"
                  >
                    Cancel
                  </Button>
                </div>
              </StackItem>
            </Stack>
          </PageSection>
        </div>
      </PageSection>

      {/* Feature Not Available Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
      >
        <ModalHeader title="Not shown" />
        <ModalBody>
          <p>This interaction is out of scope for this prototype.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsFeatureModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default RegisterModel;
