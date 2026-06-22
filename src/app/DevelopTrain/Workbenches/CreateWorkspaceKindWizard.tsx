import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  Divider,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalVariant,
  NumberInput,
  Select,
  SelectList,
  SelectOption,
  Switch,
  TextArea,
  TextInput,
  Title,
  Wizard,
  WizardHeader,
  WizardStep,
} from '@patternfly/react-core';
import { 
  CubesIcon, 
  DatabaseIcon, 
  KeyIcon, 
  PlusCircleIcon, 
  ServerIcon,
  TimesIcon
} from '@patternfly/react-icons';

import './CreateWorkspaceKindWizard.css';

interface CreateWorkspaceKindWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for dropdowns
const availableImages = [
  { value: 'quay.io/org/jupyter-minimal:latest', label: 'Jupyter Minimal (Latest)' },
  { value: 'quay.io/org/jupyter-datascience:latest', label: 'Jupyter Data Science (Latest)' },
  { value: 'quay.io/org/jupyter-pytorch:2.1', label: 'Jupyter PyTorch 2.1' },
  { value: 'quay.io/org/jupyter-tensorflow:2.14', label: 'Jupyter TensorFlow 2.14' },
  { value: 'quay.io/org/vscode-python:latest', label: 'VS Code Python (Latest)' },
  { value: 'quay.io/org/rstudio:latest', label: 'RStudio (Latest)' },
];

const availableProjects = [
  { value: 'all', label: 'All Projects (Platform-wide)' },
  { value: 'ml-platform', label: 'ml-platform' },
  { value: 'ds-team-a', label: 'ds-team-a' },
  { value: 'ds-team-b', label: 'ds-team-b' },
  { value: 'research-lab', label: 'research-lab' },
];

const connectionTypes = [
  { id: 's3-bucket', label: 'S3 Bucket', description: 'Object storage connection' },
  { id: 'database', label: 'Database', description: 'SQL/NoSQL database connection' },
  { id: 'git-credential', label: 'Git Credential', description: 'Source control authentication' },
  { id: 'api-key', label: 'API Key', description: 'External service API keys' },
  { id: 'custom-secret', label: 'Custom Secret', description: 'User-defined secrets' },
];

const storageClasses = [
  { value: 'fast-ssd', label: 'Fast SSD (gp3)', description: 'High-performance SSD storage' },
  { value: 'standard-hdd', label: 'Standard HDD', description: 'Cost-effective standard storage' },
  { value: 'archive', label: 'Archive Storage', description: 'Long-term archival storage' },
];

const CreateWorkspaceKindWizard: React.FunctionComponent<CreateWorkspaceKindWizardProps> = ({
  isOpen,
  onClose,
}) => {
  // Step 1: Basic Information
  const [name, setName] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [projectScope, setProjectScope] = React.useState('all');

  // Step 2: Image Configuration
  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);
  const [imagePullPolicy, setImagePullPolicy] = React.useState('IfNotPresent');
  const [enforceVersions, setEnforceVersions] = React.useState(false);
  const [isImageSelectOpen, setIsImageSelectOpen] = React.useState(false);

  // Step 3: Pod Configuration
  const [cpuRequest, setCpuRequest] = React.useState(1);
  const [cpuLimit, setCpuLimit] = React.useState(4);
  const [memoryRequest, setMemoryRequest] = React.useState(2);
  const [memoryLimit, setMemoryLimit] = React.useState(8);
  const [gpuCount, setGpuCount] = React.useState(0);
  const [gpuType, setGpuType] = React.useState('nvidia.com/gpu');
  const [enableTshirtSizing, setEnableTshirtSizing] = React.useState(true);
  const [allowedSizes, setAllowedSizes] = React.useState<string[]>(['small', 'medium', 'large']);
  const [nodeAffinity, setNodeAffinity] = React.useState('');
  const [tolerations, setTolerations] = React.useState('');

  // Step 4: Connections & Security
  const [allowedConnectionTypes, setAllowedConnectionTypes] = React.useState<string[]>([]);
  const [mandatoryEnvVars, setMandatoryEnvVars] = React.useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);
  const [enableLegacySecrets, setEnableLegacySecrets] = React.useState(true);

  // Step 5: Volumes & Storage
  const [selectedStorageClasses, setSelectedStorageClasses] = React.useState<string[]>(['fast-ssd']);
  const [defaultMountPath, setDefaultMountPath] = React.useState('/home/jovyan/work');
  const [enableLegacyPvcSupport, setEnableLegacyPvcSupport] = React.useState(true);
  const [defaultPvcSize, setDefaultPvcSize] = React.useState(10);

  const handleImageSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined
  ) => {
    const imageValue = value as string;
    if (selectedImages.includes(imageValue)) {
      setSelectedImages(selectedImages.filter((img) => img !== imageValue));
    } else {
      setSelectedImages([...selectedImages, imageValue]);
    }
  };

  const removeImage = (imageToRemove: string) => {
    setSelectedImages(selectedImages.filter((img) => img !== imageToRemove));
  };

  const toggleConnectionType = (typeId: string) => {
    if (allowedConnectionTypes.includes(typeId)) {
      setAllowedConnectionTypes(allowedConnectionTypes.filter((t) => t !== typeId));
    } else {
      setAllowedConnectionTypes([...allowedConnectionTypes, typeId]);
    }
  };

  const toggleStorageClass = (storageClass: string) => {
    if (selectedStorageClasses.includes(storageClass)) {
      setSelectedStorageClasses(selectedStorageClasses.filter((sc) => sc !== storageClass));
    } else {
      setSelectedStorageClasses([...selectedStorageClasses, storageClass]);
    }
  };

  const addEnvVar = () => {
    setMandatoryEnvVars([...mandatoryEnvVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    setMandatoryEnvVars(mandatoryEnvVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...mandatoryEnvVars];
    updated[index][field] = newValue;
    setMandatoryEnvVars(updated);
  };

  const toggleSize = (size: string) => {
    if (allowedSizes.includes(size)) {
      setAllowedSizes(allowedSizes.filter((s) => s !== size));
    } else {
      setAllowedSizes([...allowedSizes, size]);
    }
  };

  const handleSave = () => {
    // Here you would typically send the data to an API
    // eslint-disable-next-line no-console
    console.log('Creating Workbench Template:', {
      name,
      displayName,
      description,
      projectScope,
      selectedImages,
      imagePullPolicy,
      enforceVersions,
      cpuRequest,
      cpuLimit,
      memoryRequest,
      memoryLimit,
      gpuCount,
      gpuType,
      enableTshirtSizing,
      allowedSizes,
      nodeAffinity,
      tolerations,
      allowedConnectionTypes,
      mandatoryEnvVars,
      enableLegacySecrets,
      selectedStorageClasses,
      defaultMountPath,
      enableLegacyPvcSupport,
      defaultPvcSize,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.large}
      aria-labelledby="create-workspace-kind-wizard-title"
      aria-describedby="create-workspace-kind-wizard-description"
      appendTo={document.body}
      className="create-workspace-kind-wizard-modal"
    >
      <Wizard
        header={
          <WizardHeader
            title="Create workbench template"
            titleId="create-workspace-kind-wizard-title"
            description="Create a new workbench template that defines governance policies for workbenches"
            descriptionId="create-workspace-kind-wizard-description"
            closeButtonAriaLabel="Close wizard"
            onClose={onClose}
          />
        }
        onClose={onClose}
        isVisitRequired
      >
            {/* Step 1: Basic Information & Governance */}
            <WizardStep
              name="Basic Information"
              id="step-basic-info"
              body={{ hasNoPadding: false }}
              footer={{ nextButtonText: 'Next' }}
            >
              <div style={{ padding: '2rem' }}>
                <Title headingLevel="h2" style={{ marginBottom: '0.5rem' }}>Basic Information</Title>
                <p style={{ marginBottom: '1.5rem', color: '#6a6e73' }}>
                  Define template identity and governance. This information helps users identify and select the appropriate workbench template for their needs. The template name and scope define who can use this configuration.
                </p>

                <Form id="create-workspace-kind-step1-form">
                  <FormGroup
                    label="Name"
                    isRequired
                    fieldId="workspace-kind-name"
                  >
                    <TextInput
                      isRequired
                      type="text"
                      id="workspace-kind-name"
                      name="workspace-kind-name"
                      value={name}
                      onChange={(_event, value) => setName(value)}
                      placeholder="e.g., gpu-standard-v2"
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>Unique identifier for the template. Use lowercase letters, numbers, and hyphens.</HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup
                    label="Display Name"
                    isRequired
                    fieldId="workspace-kind-display-name"
                  >
                    <TextInput
                      isRequired
                      type="text"
                      id="workspace-kind-display-name"
                      name="workspace-kind-display-name"
                      value={displayName}
                      onChange={(_event, value) => setDisplayName(value)}
                      placeholder="e.g., GPU Standard Template v2"
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>User-friendly name displayed in the UI.</HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup
                    label="Description"
                    fieldId="workspace-kind-description"
                  >
                    <TextArea
                      id="workspace-kind-description"
                      name="workspace-kind-description"
                      value={description}
                      onChange={(_event, value) => setDescription(value)}
                      placeholder="e.g., Standard profile for ML training with GPU acceleration. Recommended for teams working on deep learning projects."
                      rows={3}
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>Explain who should use this template and its primary use case.</HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup
                    label="Owner/Project Scope"
                    fieldId="workspace-kind-scope"
                  >
                    <FormSelect
                      id="workspace-kind-scope"
                      value={projectScope}
                      onChange={(_event, value) => setProjectScope(value)}
                    >
                      {availableProjects.map((project) => (
                        <FormSelectOption
                          key={project.value}
                          value={project.value}
                          label={project.label}
                        />
                      ))}
                    </FormSelect>
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>Limit this template to specific projects or make it available platform-wide.</HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>
                </Form>
              </div>
            </WizardStep>

            {/* Step 2: Image Configuration */}
            <WizardStep
              name="Image Configuration"
              id="step-image-config"
              body={{ hasNoPadding: false }}
              footer={{ nextButtonText: 'Next' }}
            >
              <div style={{ padding: '2rem' }}>
                <Title headingLevel="h2" style={{ marginBottom: '0.5rem' }}>Image Configuration</Title>
                <p style={{ marginBottom: '1.5rem', color: '#6a6e73' }}>
                  Configure software environment. Define which container images are approved for this workbench template. This bridges legacy Workbench Images to the new Image Config.
                </p>

                <Form id="create-workspace-kind-step2-form">
                  <FormGroup
                    label="Approved Base Images"
                    isRequired
                    fieldId="approved-images"
                  >
                    <Select
                      id="approved-images-select"
                      isOpen={isImageSelectOpen}
                      onOpenChange={(isOpen) => setIsImageSelectOpen(isOpen)}
                      onSelect={handleImageSelect}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsImageSelectOpen(!isImageSelectOpen)}
                          isExpanded={isImageSelectOpen}
                          style={{ width: '100%' }}
                          id="approved-images-toggle"
                        >
                          {selectedImages.length > 0
                            ? `${selectedImages.length} image(s) selected`
                            : 'Select approved images'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList id="approved-images-list">
                        {availableImages.map((image) => (
                          <SelectOption
                            key={image.value}
                            value={image.value}
                            hasCheckbox
                            isSelected={selectedImages.includes(image.value)}
                            id={`image-option-${image.value}`}
                          >
                            {image.label}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                    {selectedImages.length > 0 && (
                      <div style={{ marginTop: 'var(--pf-v6-global--spacer--sm)' }}>
                        <LabelGroup id="selected-images-labels">
                          {selectedImages.map((img) => (
                            <Label
                              key={img}
                              onClose={() => removeImage(img)}
                              color="blue"
                              id={`selected-image-label-${img}`}
                            >
                              {availableImages.find((i) => i.value === img)?.label || img}
                            </Label>
                          ))}
                        </LabelGroup>
                      </div>
                    )}
                  </FormGroup>

                  <FormGroup
                    label="Image Pull Policy"
                    fieldId="image-pull-policy"
                  >
                    <FormSelect
                      id="image-pull-policy"
                      value={imagePullPolicy}
                      onChange={(_event, value) => setImagePullPolicy(value)}
                    >
                      <FormSelectOption value="Always" label="Always - Always pull the latest image" />
                      <FormSelectOption value="IfNotPresent" label="IfNotPresent - Use cached if available" />
                      <FormSelectOption value="Never" label="Never - Only use local cached images" />
                    </FormSelect>
                  </FormGroup>

                  <FormGroup fieldId="enforce-versions">
                    <Checkbox
                      id="enforce-versions"
                      label="Enforce software version restrictions"
                      description="When enabled, users can only use specific versions of Jupyter, VS Code, etc."
                      isChecked={enforceVersions}
                      onChange={(_event, checked) => setEnforceVersions(checked)}
                    />
                  </FormGroup>
                </Form>
              </div>
            </WizardStep>

            {/* Step 3: Pod Configuration */}
            <WizardStep
              name="Pod Configuration"
              id="step-pod-config"
              body={{ hasNoPadding: false }}
              footer={{ nextButtonText: 'Next' }}
            >
              <div style={{ padding: '2rem' }}>
                <Title headingLevel="h2" style={{ marginBottom: '0.5rem' }}>Pod Configuration</Title>
                <p style={{ marginBottom: '1.5rem', color: '#6a6e73' }}>
                  Configure hardware resources. Define resource limits and hardware requirements. This bridges legacy Hardware Profiles to the new Pod Config.
                </p>

                <Form id="create-workspace-kind-step3-form">
                  <Title headingLevel="h4" id="resource-limits-title">Resource Requests & Limits</Title>
                  
                  <Grid hasGutter id="resource-grid">
                    <GridItem span={6}>
                      <Card id="cpu-card">
                        <CardTitle>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} id="cpu-card-header">
                            <FlexItem>
                              <ServerIcon />
                            </FlexItem>
                            <FlexItem>CPU Configuration</FlexItem>
                          </Flex>
                        </CardTitle>
                        <CardBody>
                          <FormGroup label="CPU Request (cores)" fieldId="cpu-request">
                            <NumberInput
                              value={cpuRequest}
                              onMinus={() => setCpuRequest(Math.max(0.5, cpuRequest - 0.5))}
                              onPlus={() => setCpuRequest(cpuRequest + 0.5)}
                              onChange={(event) => setCpuRequest(Number((event.target as HTMLInputElement).value))}
                              min={0.5}
                              max={cpuLimit}
                              id="cpu-request-input"
                            />
                          </FormGroup>
                          <FormGroup label="CPU Limit (cores)" fieldId="cpu-limit">
                            <NumberInput
                              value={cpuLimit}
                              onMinus={() => setCpuLimit(Math.max(cpuRequest, cpuLimit - 0.5))}
                              onPlus={() => setCpuLimit(cpuLimit + 0.5)}
                              onChange={(event) => setCpuLimit(Number((event.target as HTMLInputElement).value))}
                              min={cpuRequest}
                              max={64}
                              id="cpu-limit-input"
                            />
                          </FormGroup>
                        </CardBody>
                      </Card>
                    </GridItem>

                    <GridItem span={6}>
                      <Card id="memory-card">
                        <CardTitle>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} id="memory-card-header">
                            <FlexItem>
                              <CubesIcon />
                            </FlexItem>
                            <FlexItem>Memory Configuration</FlexItem>
                          </Flex>
                        </CardTitle>
                        <CardBody>
                          <FormGroup label="Memory Request (GB)" fieldId="memory-request">
                            <NumberInput
                              value={memoryRequest}
                              onMinus={() => setMemoryRequest(Math.max(1, memoryRequest - 1))}
                              onPlus={() => setMemoryRequest(memoryRequest + 1)}
                              onChange={(event) => setMemoryRequest(Number((event.target as HTMLInputElement).value))}
                              min={1}
                              max={memoryLimit}
                              id="memory-request-input"
                            />
                          </FormGroup>
                          <FormGroup label="Memory Limit (GB)" fieldId="memory-limit">
                            <NumberInput
                              value={memoryLimit}
                              onMinus={() => setMemoryLimit(Math.max(memoryRequest, memoryLimit - 1))}
                              onPlus={() => setMemoryLimit(memoryLimit + 1)}
                              onChange={(event) => setMemoryLimit(Number((event.target as HTMLInputElement).value))}
                              min={memoryRequest}
                              max={256}
                              id="memory-limit-input"
                            />
                          </FormGroup>
                        </CardBody>
                      </Card>
                    </GridItem>

                    <GridItem span={12}>
                      <Card id="gpu-card">
                        <CardTitle>GPU Configuration</CardTitle>
                        <CardBody>
                          <Grid hasGutter id="gpu-config-grid">
                            <GridItem span={6}>
                              <FormGroup label="GPU Count" fieldId="gpu-count">
                                <NumberInput
                                  value={gpuCount}
                                  onMinus={() => setGpuCount(Math.max(0, gpuCount - 1))}
                                  onPlus={() => setGpuCount(gpuCount + 1)}
                                  onChange={(event) => setGpuCount(Number((event.target as HTMLInputElement).value))}
                                  min={0}
                                  max={8}
                                  id="gpu-count-input"
                                />
                              </FormGroup>
                            </GridItem>
                            <GridItem span={6}>
                              <FormGroup label="GPU Type" fieldId="gpu-type">
                                <FormSelect
                                  id="gpu-type"
                                  value={gpuType}
                                  onChange={(_event, value) => setGpuType(value)}
                                  isDisabled={gpuCount === 0}
                                >
                                  <FormSelectOption value="nvidia.com/gpu" label="NVIDIA GPU" />
                                  <FormSelectOption value="amd.com/gpu" label="AMD GPU" />
                                  <FormSelectOption value="intel.com/gpu" label="Intel GPU" />
                                </FormSelect>
                              </FormGroup>
                            </GridItem>
                          </Grid>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>

                  <Divider id="tshirt-divider" />

                  <Title headingLevel="h4" id="tshirt-sizing-title">T-Shirt Sizing</Title>
                  
                  <FormGroup fieldId="enable-tshirt-sizing">
                    <Switch
                      id="enable-tshirt-sizing"
                      label={enableTshirtSizing ? "Enable preset size options" : "Preset sizes disabled"}
                      isChecked={enableTshirtSizing}
                      onChange={(_event, checked) => setEnableTshirtSizing(checked)}
                    />
                  </FormGroup>

                  {enableTshirtSizing && (
                    <FormGroup label="Allowed Sizes" fieldId="allowed-sizes">
                      <Flex id="allowed-sizes-flex">
                        <FlexItem>
                          <Checkbox
                            id="size-small"
                            label="Small (2 CPU, 4GB RAM)"
                            isChecked={allowedSizes.includes('small')}
                            onChange={() => toggleSize('small')}
                          />
                        </FlexItem>
                        <FlexItem>
                          <Checkbox
                            id="size-medium"
                            label="Medium (4 CPU, 8GB RAM)"
                            isChecked={allowedSizes.includes('medium')}
                            onChange={() => toggleSize('medium')}
                          />
                        </FlexItem>
                        <FlexItem>
                          <Checkbox
                            id="size-large"
                            label="Large (8 CPU, 16GB RAM)"
                            isChecked={allowedSizes.includes('large')}
                            onChange={() => toggleSize('large')}
                          />
                        </FlexItem>
                        <FlexItem>
                          <Checkbox
                            id="size-xlarge"
                            label="X-Large (16 CPU, 32GB RAM)"
                            isChecked={allowedSizes.includes('xlarge')}
                            onChange={() => toggleSize('xlarge')}
                          />
                        </FlexItem>
                      </Flex>
                    </FormGroup>
                  )}

                  <Divider id="node-affinity-divider" />

                  <Title headingLevel="h4" id="node-scheduling-title">Node Scheduling</Title>

                  <FormGroup label="Node Affinity" fieldId="node-affinity">
                    <TextInput
                      id="node-affinity"
                      value={nodeAffinity}
                      onChange={(_event, value) => setNodeAffinity(value)}
                      placeholder="e.g., gpu-node-pool"
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>Ensure workloads run on specific node pools (e.g., GPU nodes only).</HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup label="Tolerations" fieldId="tolerations">
                    <TextInput
                      id="tolerations"
                      value={tolerations}
                      onChange={(_event, value) => setTolerations(value)}
                      placeholder="e.g., nvidia.com/gpu=present:NoSchedule"
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>Allow pods to be scheduled on tainted nodes.</HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>
                </Form>
              </div>
            </WizardStep>

            {/* Step 4: Connections & Security */}
            <WizardStep
              name="Connections & Security"
              id="step-connections"
              body={{ hasNoPadding: false }}
              footer={{ nextButtonText: 'Next' }}
            >
              <div style={{ padding: '2rem' }}>
                <Title headingLevel="h2" style={{ marginBottom: '0.5rem' }}>Connections & Security</Title>
                <p style={{ marginBottom: '1.5rem', color: '#6a6e73' }}>
                  Configure connections and security. Transition from environment variables to structured Connection Types. This addresses security gaps by controlling how secrets are accessed.
                </p>

                <Form id="create-workspace-kind-step4-form">
                  <Title headingLevel="h4" id="connection-types-title">
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem><KeyIcon /></FlexItem>
                      <FlexItem>Allowed Connection Types</FlexItem>
                    </Flex>
                  </Title>

                  <FormGroup fieldId="allowed-connection-types">
                    <Grid hasGutter={false} id="connection-types-grid">
                      {connectionTypes.map((type) => (
                        <GridItem span={6} key={type.id}>
                          <Card
                            isSelectable
                            isSelected={allowedConnectionTypes.includes(type.id)}
                            onClick={() => toggleConnectionType(type.id)}
                            id={`connection-type-card-${type.id}`}
                          >
                            <CardBody>
                              <Checkbox
                                id={`connection-type-${type.id}`}
                                label={type.label}
                                description={type.description}
                                isChecked={allowedConnectionTypes.includes(type.id)}
                                onChange={() => toggleConnectionType(type.id)}
                              />
                            </CardBody>
                          </Card>
                        </GridItem>
                      ))}
                    </Grid>
                  </FormGroup>

                  <Divider id="env-vars-divider" />

                  <Title headingLevel="h4" id="mandatory-env-vars-title">Mandatory Environment Variables</Title>
                  <HelperText id="env-vars-helper">
                    <HelperTextItem>
                      Pre-define variables that are injected automatically and cannot be overridden by end users.
                    </HelperTextItem>
                  </HelperText>

                  {mandatoryEnvVars.map((envVar, index) => (
                    <Grid hasGutter key={index} id={`env-var-row-${index}`}>
                      <GridItem span={5}>
                        <FormGroup label={index === 0 ? 'Variable Name' : undefined} fieldId={`env-key-${index}`}>
                          <TextInput
                            id={`env-key-${index}`}
                            value={envVar.key}
                            onChange={(_event, value) => updateEnvVar(index, 'key', value)}
                            placeholder="VARIABLE_NAME"
                          />
                        </FormGroup>
                      </GridItem>
                      <GridItem span={5}>
                        <FormGroup label={index === 0 ? 'Value' : undefined} fieldId={`env-value-${index}`}>
                          <TextInput
                            id={`env-value-${index}`}
                            value={envVar.value}
                            onChange={(_event, value) => updateEnvVar(index, 'value', value)}
                            placeholder="value"
                          />
                        </FormGroup>
                      </GridItem>
                      <GridItem span={2}>
                        <FormGroup label={index === 0 ? ' ' : undefined} fieldId={`env-remove-${index}`}>
                          <Button
                            variant="plain"
                            onClick={() => removeEnvVar(index)}
                            isDisabled={mandatoryEnvVars.length === 1}
                            id={`remove-env-var-${index}`}
                          >
                            <TimesIcon />
                          </Button>
                        </FormGroup>
                      </GridItem>
                    </Grid>
                  ))}

                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    onClick={addEnvVar}
                    id="add-env-var-button"
                  >
                    Add environment variable
                  </Button>

                  <Divider id="secrets-divider" />

                  <Title headingLevel="h4" id="secrets-integration-title">Secrets Integration</Title>

                  <FormGroup fieldId="enable-legacy-secrets">
                    <Switch
                      id="enable-legacy-secrets"
                      label={enableLegacySecrets ? "Enable legacy secrets support" : "Legacy secrets disabled"}
                      isChecked={enableLegacySecrets}
                      onChange={(_event, checked) => setEnableLegacySecrets(checked)}
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          Allow mapping of legacy secrets to the new Connection model during migration.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>
                </Form>
              </div>
            </WizardStep>

            {/* Step 5: Volumes & Storage */}
            <WizardStep
              name="Volumes & Storage"
              id="step-volumes"
              body={{ hasNoPadding: false }}
              footer={{
                nextButtonText: 'Create Workbench Template',
                onNext: handleSave,
              }}
            >
              <div style={{ padding: '2rem' }}>
                <Title headingLevel="h2" style={{ marginBottom: '0.5rem' }}>Volumes & Storage</Title>
                <p style={{ marginBottom: '1.5rem', color: '#6a6e73' }}>
                  Configure volumes and storage. Define storage requirements and migration support for persistent volumes. This addresses the "unknowns" regarding PVCs and Volumes.
                </p>

                <Form id="create-workspace-kind-step5-form">
                  <Title headingLevel="h4" id="storage-classes-title">
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem><DatabaseIcon /></FlexItem>
                      <FlexItem>Approved Storage Classes</FlexItem>
                    </Flex>
                  </Title>

                  <FormGroup fieldId="storage-classes">
                    <Grid hasGutter id="storage-classes-grid">
                      {storageClasses.map((sc) => (
                        <GridItem span={4} key={sc.value}>
                          <Card
                            isSelectable
                            isSelected={selectedStorageClasses.includes(sc.value)}
                            onClick={() => toggleStorageClass(sc.value)}
                            id={`storage-class-card-${sc.value}`}
                          >
                            <CardBody>
                              <Checkbox
                                id={`storage-class-${sc.value}`}
                                label={sc.label}
                                description={sc.description}
                                isChecked={selectedStorageClasses.includes(sc.value)}
                                onChange={() => toggleStorageClass(sc.value)}
                              />
                            </CardBody>
                          </Card>
                        </GridItem>
                      ))}
                    </Grid>
                  </FormGroup>

                  <Divider id="mount-paths-divider" />

                  <Title headingLevel="h4" id="mount-config-title">Mount Configuration</Title>

                  <FormGroup label="Default Mount Path" fieldId="default-mount-path">
                    <TextInput
                      id="default-mount-path"
                      value={defaultMountPath}
                      onChange={(_event, value) => setDefaultMountPath(value)}
                      placeholder="/home/jovyan/work"
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          Specify where user data (PVCs) should be mounted by default for consistency across the organization.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>

                  <FormGroup label="Default PVC Size (GB)" fieldId="default-pvc-size">
                    <NumberInput
                      value={defaultPvcSize}
                      onMinus={() => setDefaultPvcSize(Math.max(1, defaultPvcSize - 5))}
                      onPlus={() => setDefaultPvcSize(defaultPvcSize + 5)}
                      onChange={(event) => setDefaultPvcSize(Number((event.target as HTMLInputElement).value))}
                      min={1}
                      max={500}
                      id="default-pvc-size-input"
                    />
                  </FormGroup>

                  <Divider id="migration-support-divider" />

                  <Title headingLevel="h4" id="migration-support-title">Migration Support</Title>

                  <FormGroup fieldId="enable-legacy-pvc-support">
                    <Switch
                      id="enable-legacy-pvc-support"
                      label={enableLegacyPvcSupport ? "Enable Legacy PVC Support" : "Legacy PVC support disabled"}
                      isChecked={enableLegacyPvcSupport}
                      onChange={(_event, checked) => setEnableLegacyPvcSupport(checked)}
                    />
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          Ensures existing user data from legacy workbenches can mount to the new V2 container correctly.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>

                  {enableLegacyPvcSupport && (
                    <Alert
                      variant="success"
                      isInline
                      title="Legacy PVC migration enabled"
                      id="legacy-pvc-alert"
                    >
                      Existing persistent volume claims from legacy V1 workbenches will be automatically mapped to new V2 workspaces during migration.
                    </Alert>
                  )}
                </Form>
              </div>
            </WizardStep>
      </Wizard>
    </Modal>
  );
};

export default CreateWorkspaceKindWizard;

