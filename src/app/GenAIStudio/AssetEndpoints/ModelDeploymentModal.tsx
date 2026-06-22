import React from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Content,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  NumberInput,
  Select,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextArea,
  TextInput,
  Title,
  Tooltip,
  Truncate
} from '@patternfly/react-core';
import {
  InfoCircleIcon,
  PlusIcon
} from '@patternfly/react-icons';

interface ModelDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: () => void;
  selectedProject: string;
}

export const ModelDeploymentModal: React.FunctionComponent<ModelDeploymentModalProps> = ({
  isOpen,
  onClose,
  onDeploy,
  selectedProject
}) => {
  // Form state
  const [deploymentName, setDeploymentName] = React.useState('');
  const [servingRuntime, setServingRuntime] = React.useState('');
  const [isServingRuntimeOpen, setIsServingRuntimeOpen] = React.useState(false);
  const [modelFramework, setModelFramework] = React.useState('');
  const [isModelFrameworkOpen, setIsModelFrameworkOpen] = React.useState(false);
  const [deploymentMode, setDeploymentMode] = React.useState('Advanced');
  const [isDeploymentModeOpen, setIsDeploymentModeOpen] = React.useState(false);
  const [minReplicas, setMinReplicas] = React.useState(1);
  const [maxReplicas, setMaxReplicas] = React.useState(1);
  const [modelServerSize, setModelServerSize] = React.useState('Small');
  const [isModelServerSizeOpen, setIsModelServerSizeOpen] = React.useState(false);
  const [accelerator, setAccelerator] = React.useState('None');
  const [isAcceleratorOpen, setIsAcceleratorOpen] = React.useState(false);
  const [enableModelRoute, setEnableModelRoute] = React.useState(false);
  const [enableTokenAuth, setEnableTokenAuth] = React.useState(false);
  const [connectionType, setConnectionType] = React.useState('');
  const [isConnectionTypeOpen, setIsConnectionTypeOpen] = React.useState(false);
  const [runtimeArguments, setRuntimeArguments] = React.useState('');

  const resetForm = () => {
    setDeploymentName('');
    setServingRuntime('');
    setModelFramework('');
    setDeploymentMode('Advanced');
    setMinReplicas(1);
    setMaxReplicas(1);
    setModelServerSize('Small');
    setAccelerator('None');
    setEnableModelRoute(false);
    setEnableTokenAuth(false);
    setConnectionType('');
    setRuntimeArguments('');
    // Removed environmentVariables state
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDeploy = () => {
    onDeploy();
    resetForm();
  };

  const isFormValid = () => {
    return deploymentName.trim() !== '' && servingRuntime !== '';
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title="Deploy model"
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalHeader>
        <Title headingLevel="h1" size="xl">
          Deploy model
        </Title>
        <div className="pf-v6-c-modal-box__description">
          Configure properties for deploying your model
        </div>
        </ModalHeader>
        <ModalBody>
          <Alert 
            variant="info" 
            title="Endpoint configuration"
            style={{ marginBottom: '1.5rem' }}
          >
            Check &apos;Make deployed models available through an external route&apos; in order to display an endpoint in the AI available endpoints view.
          </Alert>
          <Form>
          <FormSection title="Model deployment" titleElement="div">
            <FormGroup label="Project" fieldId="project">
              <Content component="p">{selectedProject}</Content>
            </FormGroup>
            
            <FormGroup 
              label="Model name" 
              fieldId="inference-service-name"
              isRequired
            >
              <TextInput
                id="inference-service-name"
                name="inference-service-name"
                value={deploymentName}
                onChange={(_event, value) => setDeploymentName(value)}
                isRequired
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    This is the name of the inference service created when the model is deployed
                  </HelperTextItem>
                  <HelperTextItem>
                    <Button variant="link" isInline>
                      Edit resource name
                    </Button>{' '}
                    <Tooltip content="More info">
                      <Button variant="plain" aria-label="More info">
                        <InfoCircleIcon />
                      </Button>
                    </Tooltip>
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>

            <FormGroup 
              label="Serving runtime" 
              fieldId="serving-runtime-template-selection"
              isRequired
            >
              <Select
                id="serving-runtime-template-selection"
                isOpen={isServingRuntimeOpen}
                selected={servingRuntime}
                onSelect={(_event, value) => {
                  setServingRuntime(value as string);
                  setIsServingRuntimeOpen(false);
                }}
                onOpenChange={(isOpen) => setIsServingRuntimeOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsServingRuntimeOpen(!isServingRuntimeOpen)}
                    isExpanded={isServingRuntimeOpen}
                    style={{ width: '100%' }}
                  >
                    {servingRuntime || 'Select one'}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="runtime1">Runtime 1</SelectOption>
                  <SelectOption value="runtime2">Runtime 2</SelectOption>
                </SelectList>
              </Select>
            </FormGroup>

            <FormGroup 
              label="Model framework (name - version)" 
              fieldId="inference-service-framework-selection"
              isRequired
            >
              <Select
                id="inference-service-framework-selection"
                isOpen={isModelFrameworkOpen}
                selected={modelFramework}
                onSelect={(_event, value) => {
                  setModelFramework(value as string);
                  setIsModelFrameworkOpen(false);
                }}
                onOpenChange={(isOpen) => setIsModelFrameworkOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsModelFrameworkOpen(!isModelFrameworkOpen)}
                    isExpanded={isModelFrameworkOpen}
                    isDisabled
                    style={{ width: '100%' }}
                  >
                    <Truncate content="No frameworks available to select" />
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="framework1">Framework 1</SelectOption>
                </SelectList>
              </Select>
            </FormGroup>

            <FormGroup 
              label="Deployment mode" 
              fieldId="deployment-mode"
              isRequired
            >
              <Select
                id="deployment-mode"
                isOpen={isDeploymentModeOpen}
                selected={deploymentMode}
                onSelect={(_event, value) => {
                  setDeploymentMode(value as string);
                  setIsDeploymentModeOpen(false);
                }}
                onOpenChange={(isOpen) => setIsDeploymentModeOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsDeploymentModeOpen(!isDeploymentModeOpen)}
                    isExpanded={isDeploymentModeOpen}
                    style={{ width: '100%' }}
                  >
                    <Truncate content={deploymentMode} />
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="Advanced">Advanced</SelectOption>
                  <SelectOption value="Basic">Basic</SelectOption>
                </SelectList>
              </Select>
            </FormGroup>

            <FormGroup 
              label="Number of model server replicas to deploy" 
              fieldId="model-server-replicas"
              isRequired
            >
              <Flex>
                <FlexItem>
                  <FormGroup label="Minimum replicas" fieldId="min-replicas">
                    <NumberInput
                      value={minReplicas}
                      min={1}
                      max={maxReplicas}
                      onMinus={() => setMinReplicas(Math.max(1, minReplicas - 1))}
                      onPlus={() => setMinReplicas(Math.min(maxReplicas, minReplicas + 1))}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 1;
                        setMinReplicas(Math.max(1, Math.min(maxReplicas, value)));
                      }}
                      inputName="min-replicas"
                      inputAriaLabel="Minimum replicas"
                      minusBtnAriaLabel="Minus"
                      plusBtnAriaLabel="Plus"
                      plusBtnProps={{ isDisabled: minReplicas >= maxReplicas }}
                      minusBtnProps={{ isDisabled: minReplicas <= 1 }}
                    />
                  </FormGroup>
                </FlexItem>
                <FlexItem>
                  <FormGroup label="Maximum replicas" fieldId="max-replicas">
                    <NumberInput
                      value={maxReplicas}
                      min={minReplicas}
                      onMinus={() => setMaxReplicas(Math.max(minReplicas, maxReplicas - 1))}
                      onPlus={() => setMaxReplicas(maxReplicas + 1)}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 1;
                        setMaxReplicas(Math.max(minReplicas, value));
                      }}
                      inputName="max-replicas"
                      inputAriaLabel="Maximum replicas"
                      minusBtnAriaLabel="Minus"
                      plusBtnAriaLabel="Plus"
                      minusBtnProps={{ isDisabled: maxReplicas <= minReplicas }}
                    />
                  </FormGroup>
                </FlexItem>
              </Flex>
            </FormGroup>

            <FormGroup 
              label="Model server size" 
              fieldId="model-server-size-selection"
              isRequired
            >
              <Stack hasGutter>
                <StackItem>
                  <Select
                    id="model-server-size-selection"
                    isOpen={isModelServerSizeOpen}
                    selected={modelServerSize}
                    onSelect={(_event, value) => {
                      setModelServerSize(value as string);
                      setIsModelServerSizeOpen(false);
                    }}
                    onOpenChange={(isOpen) => setIsModelServerSizeOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setIsModelServerSizeOpen(!isModelServerSizeOpen)}
                        isExpanded={isModelServerSizeOpen}
                        style={{ width: '100%' }}
                      >
                        <Truncate content={modelServerSize} />
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="Small">Small</SelectOption>
                      <SelectOption value="Medium">Medium</SelectOption>
                      <SelectOption value="Large">Large</SelectOption>
                    </SelectList>
                  </Select>
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        <Truncate content="Limits: 2 CPU, 8GiB Memory Requests: 1 CPU, 4GiB Memory" />
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                </StackItem>
                <Stack hasGutter>
                  <StackItem>
                    <FormGroup 
                      label="Accelerator" 
                      fieldId="modal-notebook-accelerator"
                    >
                      <Select
                        id="modal-notebook-accelerator"
                        isOpen={isAcceleratorOpen}
                        selected={accelerator}
                        onSelect={(_event, value) => {
                          setAccelerator(value as string);
                          setIsAcceleratorOpen(false);
                        }}
                        onOpenChange={(isOpen) => setIsAcceleratorOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsAcceleratorOpen(!isAcceleratorOpen)}
                            isExpanded={isAcceleratorOpen}
                            style={{ width: '100%' }}
                          >
                            <Truncate content={accelerator} />
                          </MenuToggle>
                        )}
                      >
                        <SelectList>
                          <SelectOption value="None">None</SelectOption>
                          <SelectOption value="GPU">GPU</SelectOption>
                        </SelectList>
                      </Select>
                    </FormGroup>
                  </StackItem>
                </Stack>
              </Stack>
            </FormGroup>

            <Stack hasGutter>
              <StackItem>
                <FormGroup label="Model route" fieldId="alt-form-checkbox-route">
                  <Checkbox
                    id="alt-form-checkbox-route"
                    label="Make deployed models available through an external route"
                    isChecked={enableModelRoute}
                    onChange={(_event, checked) => setEnableModelRoute(checked)}
                  />
                </FormGroup>
              </StackItem>
              <StackItem>
                <FormGroup label="Token authentication" fieldId="alt-form-checkbox-auth">
                  <Stack hasGutter>
                    <StackItem>
                      <Checkbox
                        id="alt-form-checkbox-auth"
                        label="Require token authentication"
                        isChecked={enableTokenAuth}
                        onChange={(_event, checked) => setEnableTokenAuth(checked)}
                      />
                    </StackItem>
                  </Stack>
                </FormGroup>
              </StackItem>
            </Stack>
          </FormSection>

          <FormSection title="Source model location" titleElement="div">
            <FormGroup>
              <Stack hasGutter>
                <FormSection>
                    <FormGroup 
                      label="Connection type" 
                      fieldId="connection-type"
                      isRequired
                    >
                      <Select
                        id="connection-type"
                        isOpen={isConnectionTypeOpen}
                        selected={connectionType}
                        onSelect={(_event, value) => {
                          setConnectionType(value as string);
                          setIsConnectionTypeOpen(false);
                        }}
                        onOpenChange={(isOpen) => setIsConnectionTypeOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsConnectionTypeOpen(!isConnectionTypeOpen)}
                            isExpanded={isConnectionTypeOpen}
                            style={{ width: '100%' }}
                          >
                            {connectionType || 'Select a type, or search by keyword or category'}
                          </MenuToggle>
                        )}
                      >
                        <SelectList>
                          <SelectOption 
                            value="OCI compliant registry - v1"
                            description={
                              <div>
                                <div>
                                  <Truncate content="Connect to an OCI-compliant container registry, enabling integration with containerized applications and services. Use this connection type to pull and manage container images and artifacts that adhere to the Open Container Initiative (OCI) standards, ensuring compatibility with OCI-compliant tools and workflows." />
                                </div>
                                <div>
                                  <Truncate content="Category: Container registry" />
                                </div>
                              </div>
                            }
                          >
                            OCI compliant registry - v1
                          </SelectOption>
                          <SelectOption 
                            value="S3 compatible object storage - v1"
                            description={
                              <div>
                                <div>
                                  <Truncate content="Connect to storage systems that are compatible with Amazon S3, enabling integration with other S3-compatible services and applications." />
                                </div>
                                <div>
                                  <Truncate content="Category: Object storage" />
                                </div>
                              </div>
                            }
                          >
                            S3 compatible object storage - v1
                          </SelectOption>
                          <SelectOption 
                            value="URI - v1"
                            description={
                              <div>
                                <div>
                                  <Truncate content="Establish connections by using Uniform Resource Identifiers (URIs) to access various data sources." />
                                </div>
                                <div>
                                  <Truncate content="Category: URI" />
                                </div>
                              </div>
                            }
                          >
                            URI - v1
                          </SelectOption>
                        </SelectList>
                      </Select>
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem>
                            <Button variant="link" isDisabled>
                              <InfoCircleIcon style={{ marginRight: '0.25rem' }} />
                              View details
                            </Button>
                          </HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    </FormGroup>
                </FormSection>
              </Stack>
            </FormGroup>
          </FormSection>

          <FormSection title="Configuration parameters" titleElement="div">
            <FormGroup 
              label="Additional serving runtime arguments"
              fieldId="serving-runtime-arguments"
            >
              <TextArea
                id="serving-runtime-arguments"
                value={runtimeArguments}
                onChange={(_event, value) => setRuntimeArguments(value)}
                placeholder="--arg&#10;--arg2=value2&#10;--arg3 value3"
                style={{ height: '71px' }}
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    Overwriting the runtime&apos;s predefined listening port or model location will likely result in a failed deployment.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>

            <FormGroup 
              label="Additional environment variables"
              fieldId="serving-runtime-environment-variables"
            >
              <Stack hasGutter>
                <Button variant="link" isInline>
                  <PlusIcon style={{ marginRight: '0.25rem' }} />
                  Add variable
                </Button>
              </Stack>
            </FormGroup>
          </FormSection>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Stack hasGutter style={{ flex: '1 1 auto' }}>
          <StackItem>
            <Flex>
              <FlexItem>
                <Button 
                  variant="primary" 
                  onClick={handleDeploy}
                  isDisabled={!isFormValid()}
                >
                  Deploy
                </Button>
              </FlexItem>
              <FlexItem>
                <Button variant="link" onClick={handleClose}>
                  Cancel
                </Button>
              </FlexItem>
            </Flex>
          </StackItem>
        </Stack>
      </ModalFooter>
    </Modal>
  );
};
