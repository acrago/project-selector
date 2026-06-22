import React from 'react';
import { createRoot } from 'react-dom/client';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormGroupLabelHelp,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  NumberInput,
  PageSection,
  PageSectionTypes,
  Radio,
  Select,
  SelectList,
  SelectOption,
  TextArea,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { mockTiers } from '../../Settings/Tiers/mockData';
import { ViewMode, YAMLViewToggle } from '../../AIAssets/Deployments/components/YAMLViewToggle';
import { YAMLEditorDrawer } from '../../AIAssets/Deployments/components/YAMLEditorDrawer';
import { FORM_FIELD_LABELS_WITH_YAML_HELP, YAMLHelpDrawer } from '../../AIAssets/Deployments/components/YAMLHelpDrawer';
import { UnmappedFieldsSection } from '../../AIAssets/Deployments/components/UnmappedFieldsSection';
import { WizardData, formDataToYAML, useDebouncedSync, yamlToFormData } from '../../AIAssets/Deployments/utils/yamlSync';
import {
  UnmappedField,
  YAMLError,
  findFieldLine,
  getDocumentByKind,
  parseYAML,
  parseYamlDocuments,
  replaceDocumentByKind,
  validateRequiredFields,
  validateYAMLSyntax
} from '../../AIAssets/Deployments/utils/yamlParser';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { CodeIcon, HelpIcon, RedoIcon } from '@patternfly/react-icons';
import { useFeatureFlags } from '../../utils/FeatureFlagsContext';

const DeployModelWizard: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProject } = useFeatureFlags();

  /** Escape hatch mode: form-only flow, empty YAML editor, manual edit option (3.4 MVP). */
  const is34MVP = (location.state as { deployMode?: string } | null)?.deployMode === '3.4-mvp';
  useDocumentTitle(is34MVP ? 'Deploy model - ESCAPE HATCH' : 'Deploy model');

  // YAML Editor state
  const [viewMode, setViewMode] = React.useState<ViewMode>('form');
  const [yamlContent, setYamlContent] = React.useState<string>('');
  const [yamlErrors, setYamlErrors] = React.useState<YAMLError[]>([]);
  const [unmappedFields, setUnmappedFields] = React.useState<UnmappedField[]>([]);
  const [isYAMLSyncing, setIsYAMLSyncing] = React.useState<boolean>(false);
  const [isInitialYAMLLoaded, setIsInitialYAMLLoaded] = React.useState<boolean>(false);
  const [initialYAML, setInitialYAML] = React.useState<string>('');
  /** When true, form is the master and YAML is a read-only mirror (initial state when not in edit mode). */
  const [, setFormIsMaster] = React.useState<boolean>(true);
  /** When true, user has clicked "Edit YAML" and the YAML editor is editable. */
  const [yamlEditingEnabled, setYamlEditingEnabled] = React.useState<boolean>(false);
  const [isEditYAMLWarningModalOpen, setIsEditYAMLWarningModalOpen] = React.useState<boolean>(false);
  const [isReturnToFormModalOpen, setIsReturnToFormModalOpen] = React.useState<boolean>(false);
  const [isCancelWarningModalOpen, setIsCancelWarningModalOpen] = React.useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = React.useState<boolean>(false);
  const [isHelpDrawerOpen, setIsHelpDrawerOpen] = React.useState<boolean>(false);
  const [helpDrawerScrollToFormField, setHelpDrawerScrollToFormField] = React.useState<string | undefined>(undefined);
  const [scrollToYAMLLine, setScrollToYAMLLine] = React.useState<number | undefined>(undefined);
  const [wizardStepIndex, setWizardStepIndex] = React.useState<number>(1);
  /** Viewing existing deployment YAML (read-only until "Enter Manual Edit Mode"). */
  const [isViewingExisting, setIsViewingExisting] = React.useState<boolean>(false);
  /** When set, form is hidden and user must edit in YAML (e.g. Edit on unparseable deployment). */
  const [customConfigBanner, setCustomConfigBanner] = React.useState<string | null>(null);

  const [wizardData, setWizardData] = React.useState<WizardData>({
    modelLocation: '',
    connectionName: '',
    modelUri: '',
    createConnection: false,
    connectionNameNew: '',
    connectionDescription: '',
    accessType: '',
    secretDetails: '',
    registryUri: '',
    accessKey: '',
    secretKey: '',
    endpoint: '',
    region: '',
    bucket: '',
    clusterStorageName: '',
    modelPath: '',
    modelType: '',
    project: selectedProject || 'my_project_xyz',
    modelDeploymentName: '',
    description: '',
    hardwareProfile: '',
    modelFormat: '',
    servingRuntimeOption: 'auto',
    servingRuntime: '',
    numberOfReplicas: 1,
    makeAvailableExternal: false,
    requireTokenAuth: false,
    includeRuntimeArgs: false,
    applyEnvVars: false,
    makeAvailableAsAIAsset: false,
    makeAvailableGlobally: false,
    selectedTiers: [],
    customTierNames: '',
    useLegacyMode: false,
    llmdEnabled: 'no',
    publishAsAIAssetEndpoint: false,
    publishAsMaaS: false,
    gatewaySelection: '',
  });

  // State for dropdowns
  const [isModelLocationOpen, setIsModelLocationOpen] = React.useState(false);
  const [isConnectionNameOpen, setIsConnectionNameOpen] = React.useState(false);
  const [isModelTypeOpen, setIsModelTypeOpen] = React.useState(false);
  const [isHardwareProfileOpen, setIsHardwareProfileOpen] = React.useState(false);
  const [isModelFormatOpen, setIsModelFormatOpen] = React.useState(false);
  const [isServingRuntimeOpen, setIsServingRuntimeOpen] = React.useState(false);
  const [isGatewaySelectionOpen, setIsGatewaySelectionOpen] = React.useState(false);
  const [isNimImageOpen, setIsNimImageOpen] = React.useState(false);
  const [nimImage, setNimImage] = React.useState('');
  const [nimStorageOption, setNimStorageOption] = React.useState<'ephemeral' | 'deploy-existing' | 'new-pvc' | 'existing-pvc'>('ephemeral');
  const [isNimDeployOptionOpen, setIsNimDeployOptionOpen] = React.useState(false);
  const [nimStorageSize, setNimStorageSize] = React.useState(50);
  const [nimNewPvcName, setNimNewPvcName] = React.useState('');
  const [nimExistingStorageName, setNimExistingStorageName] = React.useState('');
  const [nimModelPath, setNimModelPath] = React.useState('/model-store');
  const [nimNewPvcSubPath, setNimNewPvcSubPath] = React.useState('');
  const [isExistingNimPvcOpen, setIsExistingNimPvcOpen] = React.useState(false);
  const [existingNimPvc, setExistingNimPvc] = React.useState('nim4-pvc');

  // One-way sync: Form → YAML when form is master. When in manual edit mode, do not overwrite YAML.
  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => {
      const newData = { ...prev, ...updates };
      if (!yamlEditingEnabled && !isYAMLSyncing && isInitialYAMLLoaded && !is34MVP) {
        const inferenceServiceYAML = formDataToYAML(newData);
        setYamlContent((current) => replaceDocumentByKind(current, 'InferenceService', inferenceServiceYAML));
        validateYAML(inferenceServiceYAML);
      }
      return newData;
    });
  };
  
  // Reset wizard data to initial state (used by reset modal)
  const resetWizardData = React.useCallback(() => {
    const defaultWizardData: WizardData = {
      modelLocation: '',
      connectionName: '',
      modelUri: '',
      createConnection: false,
      connectionNameNew: '',
      connectionDescription: '',
      accessType: '',
      secretDetails: '',
      registryUri: '',
      accessKey: '',
      secretKey: '',
      endpoint: '',
      region: '',
      bucket: '',
      clusterStorageName: '',
      modelPath: '',
      modelType: '',
      project: selectedProject || 'my_project_xyz',
      modelDeploymentName: '',
      description: '',
      hardwareProfile: '',
      modelFormat: '',
      servingRuntimeOption: 'auto',
      servingRuntime: '',
      numberOfReplicas: 1,
      makeAvailableExternal: false,
      requireTokenAuth: false,
      includeRuntimeArgs: false,
      applyEnvVars: false,
      makeAvailableAsAIAsset: false,
      makeAvailableGlobally: false,
      selectedTiers: [],
      customTierNames: '',
      useLegacyMode: false,
      llmdEnabled: 'no',
      publishAsAIAssetEndpoint: false,
      publishAsMaaS: false,
      gatewaySelection: '',
    };
    return defaultWizardData;
  }, [selectedProject]);

  // Initialize YAML from form data on mount or load from edit mode / view existing
  React.useEffect(() => {
    if (!isInitialYAMLLoaded) {
      const state = location.state as { deployMode?: string; editMode?: boolean; isViewingExisting?: boolean; yamlContent?: string } | null;
      const editState = state?.editMode;
      const editYAML = state?.yamlContent;
      const viewingExisting = state?.isViewingExisting === true;

      if (viewingExisting && editYAML) {
        // View YAML: start in YAML tab, read-only, show "Enter Manual Edit Mode"
        setIsViewingExisting(true);
        setYamlContent(editYAML);
        setInitialYAML(editYAML);
        setFormIsMaster(false);
        setViewMode('yaml');
        setYamlErrors([]);
        validateYAML(editYAML);
      } else if (editState && editYAML) {
        // Edit: try to parse and load into form; if unparseable, redirect to YAML view with banner
        setYamlContent(editYAML);
        setInitialYAML(editYAML);
        setFormIsMaster(false);

        const inferenceServiceRaw = getDocumentByKind(editYAML, 'InferenceService');
        const docToSync = inferenceServiceRaw ?? editYAML;
        const parsed = parseYAML(docToSync);

        if (parsed.data) {
          const requiredErrors = validateRequiredFields(parsed.data, docToSync);
          if (requiredErrors.length > 0) {
            setCustomConfigBanner('This deployment contains custom configurations and must be edited in YAML.');
            setViewMode('yaml');
            setYamlErrors(requiredErrors);
          } else {
            const result = yamlToFormData(docToSync, wizardData);
            if (result.formUpdates) {
              setWizardData((prev) => ({ ...prev, ...result.formUpdates }));
            }
            setUnmappedFields(result.unmappedFields);
            validateYAML(docToSync);
            setViewMode('form');
          }
        } else {
          setCustomConfigBanner('This deployment contains custom configurations and must be edited in YAML.');
          setViewMode('yaml');
          if (parsed.error) {
            setYamlErrors([parsed.error]);
          }
        }
      } else if ((location.state as { deployMode?: string } | null)?.deployMode === '3.4-mvp') {
        // 3.4 MVP: YAML editor shows empty state (no template)
        setYamlContent('');
        setInitialYAML('');
        setFormIsMaster(true);
      } else {
        // Normal initialization: form is the master, YAML is a read-only mirror
        const defaultYAML = formDataToYAML(wizardData);
        setYamlContent(defaultYAML);
        setInitialYAML(defaultYAML);
        setFormIsMaster(true);
      }
      
      setIsInitialYAMLLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3.4 MVP has no split view; normalize to YAML if somehow viewMode is split.
  React.useEffect(() => {
    if (is34MVP && viewMode === 'split') {
      setViewMode('yaml');
    }
  }, [is34MVP, viewMode]);

  // Auto-select MaaS gateway when Publish as MaaS is checked
  React.useEffect(() => {
    if (wizardData.publishAsMaaS && wizardData.gatewaySelection !== 'MaaS gateway') {
      updateWizardData({ gatewaySelection: 'MaaS gateway' });
    }
  }, [wizardData.publishAsMaaS]);

  // Auto-fill model deployment name for Generative models
  React.useEffect(() => {
    if (wizardData.modelType === 'Generative AI model (including LLMs and multimodal models)' && !wizardData.modelDeploymentName) {
      updateWizardData({ modelDeploymentName: 'granite-8b-starter-v1' });
    }
  }, [wizardData.modelType]);

  // Ensure Auto-select is always default when switching legacy mode
  React.useEffect(() => {
    if (wizardData.servingRuntimeOption !== 'auto') {
      updateWizardData({ servingRuntimeOption: 'auto' });
    }
  }, [wizardData.useLegacyMode]);

  // Validate YAML
  const validateYAML = React.useCallback((yamlString: string) => {
    if (yamlString.trim() === '') {
      setYamlErrors([]);
      return;
    }
    const syntaxErrors = validateYAMLSyntax(yamlString);
    if (syntaxErrors.length > 0) {
      setYamlErrors(syntaxErrors);
      return;
    }

    const parsed = parseYAML(yamlString);
    if (parsed.data) {
      const requiredErrors = validateRequiredFields(parsed.data, yamlString);
      setYamlErrors(requiredErrors);
    } else if (parsed.error) {
      setYamlErrors([parsed.error]);
    } else {
      setYamlErrors([]);
    }
  }, []);

  // Debounced YAML change handler: sync form with InferenceService document in full YAML
  const debouncedYAMLChange = useDebouncedSync(
    React.useCallback((yamlString: string) => {
      setIsYAMLSyncing(true);
      const documents = parseYamlDocuments(yamlString);
      const inferenceServiceRaw = getDocumentByKind(yamlString, 'InferenceService');
      // Never validate the full multi-doc string (causes error at ---). Use InferenceService doc or first doc only.
      const docToSync = inferenceServiceRaw ?? (documents.length > 0 ? documents[0].raw : yamlString);
      const result = yamlToFormData(docToSync, wizardData);

      if (result.formUpdates) {
        setWizardData((prev) => ({ ...prev, ...result.formUpdates }));
      }

      setUnmappedFields(result.unmappedFields);
      validateYAML(docToSync);
      setIsYAMLSyncing(false);
    }, [wizardData, validateYAML]),
    400
  );

  const handleYAMLChange = (yamlString: string) => {
    setYamlContent(yamlString);
    debouncedYAMLChange(yamlString);
  };

  const handleResetYAML = () => {
    setIsResetModalOpen(true);
  };

  const confirmResetYAML = () => {
    setIsYAMLSyncing(true);
    setYamlContent(initialYAML);
    const inferenceServiceRaw = getDocumentByKind(initialYAML, 'InferenceService');
    const docToSync = inferenceServiceRaw ?? initialYAML;
    const result = yamlToFormData(docToSync, wizardData);
    if (result.formUpdates) {
      setWizardData((prev) => ({ ...prev, ...result.formUpdates }));
    }
    setUnmappedFields(result.unmappedFields);
    validateYAML(docToSync);
    setIsResetModalOpen(false);
    setIsYAMLSyncing(false);
  };

  const handleCopyYAML = () => {
    // Copy feedback is handled in the component
  };

  const handleDownloadYAML = () => {
    // Download feedback is handled in the component
  };

  const handleEditInYAML = () => {
    setViewMode('yaml');
  };

  const handleCustomFieldClick = (field: UnmappedField) => {
    // 3.4 MVP has no split; show YAML view and scroll to the field line.
    setViewMode(is34MVP ? 'yaml' : 'split');
    const line = findFieldLine(yamlContent, field.path);
    setScrollToYAMLLine(line);
  };

  const handleOpenHelp = () => {
    setIsHelpDrawerOpen(!isHelpDrawerOpen);
  };

  const handleOpenHelpDrawer = (formFieldLabel?: string) => {
    if (formFieldLabel) {
      setHelpDrawerScrollToFormField(formFieldLabel);
    }
    setIsHelpDrawerOpen(true);
  };

  const handleCloseHelpDrawer = () => {
    setIsHelpDrawerOpen(false);
    setHelpDrawerScrollToFormField(undefined);
  };

  const formGroupLabelsWithHelp = new Set([
    ...FORM_FIELD_LABELS_WITH_YAML_HELP,
    'Number of replicas to deploy',
    'Model access',
    'Token authentication',
    'Configuration parameters',
    'Model availability',
  ]);

  const renderFormGroupLabelHelp = (label: string) =>
    formGroupLabelsWithHelp.has(label) ? (
      <FormGroupLabelHelp
        aria-label={`Help with YAML for ${label}`}
        onClick={() => handleOpenHelpDrawer(label)}
        id={`form-help-${label.replace(/\s+/g, '-').toLowerCase()}`}
      />
    ) : undefined;

  const handleClose = () => {
    // Navigate back to deployments list
    navigate('/ai-hub/models/deployments');
  };

  const handleDeploy = () => {
    // In manual edit mode, payload is the code editor string only. When form is master, yamlContent is synced from form.
    const deployPayload = yamlContent;
    // Add deployment logic here (e.g. API call with deployPayload)
    console.log('Model deployed successfully', { yamlPayload: deployPayload });
    navigate('/ai-hub/models/deployments');
  };

  // Step 1: Source model
  const sourceModelStep = (
    <Form>
      <FormGroup label="Model location" labelHelp={renderFormGroupLabelHelp('Model location')} isRequired>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>Where is the model you want to deploy located?</HelperTextItem>
          </HelperText>
        </FormHelperText>
        <Select
          id="deploy-wizard-model-location"
          isOpen={isModelLocationOpen}
          selected={wizardData.modelLocation}
          onSelect={(_event, value) => {
            const loc = value as string;
            if (loc === 'NVIDIA NIM catalog') {
              updateWizardData({ modelLocation: loc, modelType: 'NVIDIA NIM', modelDeploymentName: nimImage ? `${nimImage.toLowerCase().replace(/\s+/g, '-')}-deployment` : '' });
            } else {
              updateWizardData({ modelLocation: loc, ...(wizardData.modelType === 'NVIDIA NIM' ? { modelType: '', modelDeploymentName: '' } : {}) });
            }
            setIsModelLocationOpen(false);
          }}
          onOpenChange={(isOpen) => setIsModelLocationOpen(isOpen)}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setIsModelLocationOpen(!isModelLocationOpen)}
              isExpanded={isModelLocationOpen}
              style={{ width: '100%' }}
            >
              {wizardData.modelLocation || 'Select an option'}
            </MenuToggle>
          )}
        >
          <SelectList>
            <SelectOption id="model-location-existing-connection" value="Existing connection">Existing connection</SelectOption>
            <SelectOption id="model-location-uri" value="URI">URI</SelectOption>
            <SelectOption id="model-location-oci" value="OCI compliant registry">OCI compliant registry</SelectOption>
            <SelectOption id="model-location-cluster-storage" value="Cluster storage">Cluster storage</SelectOption>
            <SelectOption id="model-location-s3" value="S3 object storage">S3 object storage</SelectOption>
            <SelectOption id="model-location-nvidia-nim" value="NVIDIA NIM catalog">NVIDIA NIM catalog</SelectOption>
          </SelectList>
        </Select>
      </FormGroup>

      {/* Conditional fields based on model location */}
      {wizardData.modelLocation === 'Existing connection' && (
        <FormGroup label="Connection name" isRequired>
          <Select
            id="deploy-wizard-connection-name"
            isOpen={isConnectionNameOpen}
            selected={wizardData.connectionName}
            onSelect={(_event, value) => {
              updateWizardData({ connectionName: value as string });
              setIsConnectionNameOpen(false);
            }}
            onOpenChange={(isOpen) => setIsConnectionNameOpen(isOpen)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsConnectionNameOpen(!isConnectionNameOpen)}
                isExpanded={isConnectionNameOpen}
                style={{ width: '100%' }}
              >
                {wizardData.connectionName || 'Select an option'}
              </MenuToggle>
            )}
          >
            <SelectList>
              <SelectOption id="connection-aws-1" value="aws-connection-1">aws-connection-1</SelectOption>
              <SelectOption id="connection-s3-models" value="s3-bucket-models">s3-bucket-models</SelectOption>
              <SelectOption id="connection-azure-prod" value="azure-storage-prod">azure-storage-prod</SelectOption>
              <SelectOption id="connection-gcs-ml" value="gcs-ml-models">gcs-ml-models</SelectOption>
            </SelectList>
          </Select>
        </FormGroup>
      )}

      {wizardData.modelLocation === 'URI' && (
        <>
          <FormGroup label="Model location URI" isRequired>
            <TextInput
              value={wizardData.modelUri}
              onChange={(_event, value) => updateWizardData({ modelUri: value })}
              placeholder="Enter the model location URI"
            />
          </FormGroup>
          <FormGroup>
            <Checkbox
              id="create-connection-uri"
              label="Create a connection to this location"
              isChecked={wizardData.createConnection}
              onChange={(_event, checked) => updateWizardData({ createConnection: checked })}
            />
          </FormGroup>
          {wizardData.createConnection && (
            <>
              <FormGroup label="Connection name">
                <TextInput
                  value={wizardData.connectionNameNew}
                  onChange={(_event, value) => updateWizardData({ connectionNameNew: value })}
                />
              </FormGroup>
              <FormGroup label="Connection description">
                <TextInput
                  value={wizardData.connectionDescription}
                  onChange={(_event, value) => updateWizardData({ connectionDescription: value })}
                />
              </FormGroup>
            </>
          )}
        </>
      )}

      {wizardData.modelLocation === 'OCI compliant registry' && (
        <>
          <FormGroup label="Secret details">
            <TextInput
              value={wizardData.secretDetails}
              onChange={(_event, value) => updateWizardData({ secretDetails: value })}
            />
          </FormGroup>
          <FormGroup label="Full URL / Registry URI">
            <TextInput
              value={wizardData.registryUri}
              onChange={(_event, value) => updateWizardData({ registryUri: value })}
            />
          </FormGroup>
          <FormGroup>
            <Checkbox
              id="create-connection-oci"
              label="Create a connection to this location"
              isChecked={wizardData.createConnection}
              onChange={(_event, checked) => updateWizardData({ createConnection: checked })}
            />
          </FormGroup>
          {wizardData.createConnection && (
            <>
              <FormGroup label="Connection name">
                <TextInput
                  value={wizardData.connectionNameNew}
                  onChange={(_event, value) => updateWizardData({ connectionNameNew: value })}
                />
              </FormGroup>
              <FormGroup label="Connection description">
                <TextInput
                  value={wizardData.connectionDescription}
                  onChange={(_event, value) => updateWizardData({ connectionDescription: value })}
                />
              </FormGroup>
              <FormGroup label="Access type">
                <TextInput
                  value={wizardData.accessType}
                  onChange={(_event, value) => updateWizardData({ accessType: value })}
                />
              </FormGroup>
            </>
          )}
        </>
      )}

      {wizardData.modelLocation === 'S3 object storage' && (
        <>
          <FormGroup label="Access key">
            <TextInput
              value={wizardData.accessKey}
              onChange={(_event, value) => updateWizardData({ accessKey: value })}
            />
          </FormGroup>
          <FormGroup label="Secret key">
            <TextInput
              type="password"
              value={wizardData.secretKey}
              onChange={(_event, value) => updateWizardData({ secretKey: value })}
            />
          </FormGroup>
          <FormGroup label="Endpoint">
            <TextInput
              value={wizardData.endpoint}
              onChange={(_event, value) => updateWizardData({ endpoint: value })}
            />
          </FormGroup>
          <FormGroup label="Region">
            <TextInput
              value={wizardData.region}
              onChange={(_event, value) => updateWizardData({ region: value })}
            />
          </FormGroup>
          <FormGroup label="Bucket">
            <TextInput
              value={wizardData.bucket}
              onChange={(_event, value) => updateWizardData({ bucket: value })}
            />
          </FormGroup>
          <FormGroup>
            <Checkbox
              id="create-connection-s3"
              label="Create a connection to this location"
              isChecked={wizardData.createConnection}
              onChange={(_event, checked) => updateWizardData({ createConnection: checked })}
            />
          </FormGroup>
          {wizardData.createConnection && (
            <>
              <FormGroup label="Connection name">
                <TextInput
                  value={wizardData.connectionNameNew}
                  onChange={(_event, value) => updateWizardData({ connectionNameNew: value })}
                />
              </FormGroup>
              <FormGroup label="Connection description">
                <TextInput
                  value={wizardData.connectionDescription}
                  onChange={(_event, value) => updateWizardData({ connectionDescription: value })}
                />
              </FormGroup>
              <FormGroup label="Access type">
                <TextInput
                  value={wizardData.accessType}
                  onChange={(_event, value) => updateWizardData({ accessType: value })}
                />
              </FormGroup>
            </>
          )}
        </>
      )}

      {wizardData.modelLocation === 'Cluster storage' && (
        <>
          <FormGroup label="Cluster storage name">
            <TextInput
              value={wizardData.clusterStorageName}
              onChange={(_event, value) => updateWizardData({ clusterStorageName: value })}
            />
          </FormGroup>
          <FormGroup label="Model path">
            <TextInput
              value={wizardData.modelPath}
              onChange={(_event, value) => updateWizardData({ modelPath: value })}
              placeholder="pvc://mystorage/"
            />
          </FormGroup>
        </>
      )}

      {wizardData.modelLocation === 'NVIDIA NIM catalog' && (
        <FormGroup label="NIM image" isRequired>
          <Select
            id="deploy-wizard-nim-image"
            isOpen={isNimImageOpen}
            selected={nimImage}
            onSelect={(_event, value) => {
              const img = value as string;
              const slug = img.toLowerCase().replace(/\s+/g, '-');
              setNimImage(img);
              setIsNimImageOpen(false);
              updateWizardData({ modelDeploymentName: `${slug}-deployment` });
              setNimNewPvcName(`${slug}-pvc`);
            }}
            onOpenChange={(isOpen) => setIsNimImageOpen(isOpen)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsNimImageOpen(!isNimImageOpen)}
                isExpanded={isNimImageOpen}
                style={{ width: '100%' }}
                id="deploy-wizard-nim-image-toggle"
              >
                {nimImage || 'Select a NIM image'}
              </MenuToggle>
            )}
          >
            <SelectList>
              <SelectOption id="nim-image-1" value="NIM 1">NIM 1</SelectOption>
              <SelectOption id="nim-image-2" value="NIM 2">NIM 2</SelectOption>
              <SelectOption id="nim-image-3" value="NIM 3">NIM 3</SelectOption>
              <SelectOption id="nim-image-4" value="NIM 4">NIM 4</SelectOption>
            </SelectList>
          </Select>
        </FormGroup>
      )}

      <FormGroup label="Model type" labelHelp={renderFormGroupLabelHelp('Model type')} isRequired>
        <Select
          id="deploy-wizard-model-type"
          isOpen={isModelTypeOpen}
          selected={wizardData.modelType}
          onSelect={(_event, value) => {
            updateWizardData({ modelType: value as string });
            setIsModelTypeOpen(false);
          }}
          onOpenChange={(isOpen) => setIsModelTypeOpen(isOpen)}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setIsModelTypeOpen(!isModelTypeOpen)}
              isExpanded={isModelTypeOpen}
              isDisabled={wizardData.modelLocation === 'NVIDIA NIM catalog'}
              style={{ width: '100%' }}
            >
              {wizardData.modelType || 'Select'}
            </MenuToggle>
          )}
        >
          <SelectList>
            <SelectOption id="model-type-predictive" value="Predictive model">Predictive model</SelectOption>
            <SelectOption id="model-type-generative" value="Generative AI model (including LLMs and multimodal models)">
              Generative AI model (including LLMs and multimodal models)
            </SelectOption>
          </SelectList>
        </Select>
      </FormGroup>

      {wizardData.modelType === 'Generative AI model (including LLMs and multimodal models)' && (
        <FormGroup>
          <Checkbox
            id="deploy-wizard-legacy-mode"
            label={<span style={{ fontWeight: 'bold' }}>Use legacy deployment mode</span>}
            description="Deploy this model using a serving runtime and inference server. This deployment method does not support MaaS."
            isChecked={wizardData.useLegacyMode}
            onChange={(_event, checked) => updateWizardData({ useLegacyMode: checked })}
          />
        </FormGroup>
      )}
    </Form>
  );

  // Step 2: Model deployment
  const modelDeploymentStep = (
    <Form>
      <FormGroup label="Project" labelHelp={renderFormGroupLabelHelp('Project')}>
        <TextInput value={wizardData.project} isDisabled />
      </FormGroup>

      <FormGroup label="Model deployment name" labelHelp={renderFormGroupLabelHelp('Model deployment name')} isRequired>
        <TextInput
          value={wizardData.modelDeploymentName}
          onChange={(_event, value) => updateWizardData({ modelDeploymentName: value })}
          placeholder={
            wizardData.modelType === 'Generative AI model (including LLMs and multimodal models)' 
              ? 'granite-8b-starter-v1' 
              : 'loan-default-predictor-278482'
          }
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              This is the name of the inference service created when the model is deployed.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup label="Description" labelHelp={renderFormGroupLabelHelp('Description')}>
        <TextArea
          value={wizardData.description}
          onChange={(_event, value) => updateWizardData({ description: value })}
          resizeOrientation="vertical"
        />
      </FormGroup>

      <FormGroup label="Hardware profile" labelHelp={renderFormGroupLabelHelp('Hardware profile')} isRequired>
        <Select
          id="deploy-wizard-hardware-profile"
          isOpen={isHardwareProfileOpen}
          selected={wizardData.hardwareProfile}
          onSelect={(_event, value) => {
            updateWizardData({ hardwareProfile: value as string });
            setIsHardwareProfileOpen(false);
          }}
          onOpenChange={(isOpen) => setIsHardwareProfileOpen(isOpen)}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setIsHardwareProfileOpen(!isHardwareProfileOpen)}
              isExpanded={isHardwareProfileOpen}
              style={{ width: '100%' }}
            >
              {wizardData.hardwareProfile || 'Select'}
            </MenuToggle>
          )}
        >
          <SelectList>
            <SelectOption id="hardware-default" value="default">default</SelectOption>
            <SelectOption id="hardware-small" value="Small">Small</SelectOption>
            <SelectOption id="hardware-medium" value="Medium">Medium</SelectOption>
            <SelectOption id="hardware-large" value="Large">Large</SelectOption>
            <SelectOption id="hardware-gpu-1x" value="GPU (1x)">GPU (1x)</SelectOption>
            <SelectOption id="hardware-gpu-2x" value="GPU (2x)">GPU (2x)</SelectOption>
            <SelectOption id="hardware-high-perf" value="High performance">High performance</SelectOption>
            <SelectOption id="hardware-standard" value="Standard">Standard</SelectOption>
          </SelectList>
        </Select>
        <Button variant="link" isInline style={{ paddingLeft: 0, marginTop: '0.5rem' }}>
          View profile details
        </Button>
      </FormGroup>

      {wizardData.modelLocation !== 'NVIDIA NIM catalog' && wizardData.modelType !== 'Generative AI model (including LLMs and multimodal models)' && (
        <FormGroup label="Model format" labelHelp={renderFormGroupLabelHelp('Model format')}>
          <Select
            id="deploy-wizard-model-format"
            isOpen={isModelFormatOpen}
            selected={wizardData.modelFormat}
            onSelect={(_event, value) => {
              updateWizardData({ modelFormat: value as string });
              setIsModelFormatOpen(false);
            }}
            onOpenChange={(isOpen) => setIsModelFormatOpen(isOpen)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsModelFormatOpen(!isModelFormatOpen)}
                isExpanded={isModelFormatOpen}
                style={{ width: '100%' }}
              >
                {wizardData.modelFormat || 'Select'}
              </MenuToggle>
            )}
          >
            <SelectList>
              <SelectOption id="format-onnx" value="onnx - 1">onnx - 1</SelectOption>
              <SelectOption id="format-pytorch" value="pytorch">pytorch</SelectOption>
              <SelectOption id="format-tensorflow" value="tensorflow">tensorflow</SelectOption>
              <SelectOption id="format-sklearn" value="sklearn">sklearn</SelectOption>
              <SelectOption id="format-openvino" value="openvino">openvino</SelectOption>
              {wizardData.modelType !== 'Predictive model' && (
                <SelectOption id="format-vllm" value="vllm">vllm</SelectOption>
              )}
              <SelectOption id="format-caikit" value="caikit">caikit</SelectOption>
            </SelectList>
          </Select>
        </FormGroup>
      )}

      {wizardData.modelLocation === 'NVIDIA NIM catalog' && (
        <>
          <FormGroup label="Storage and deployment option" labelHelp={renderFormGroupLabelHelp('Storage and deployment option')} isRequired>
            <Select
              id="nim-deploy-option-select"
              isOpen={isNimDeployOptionOpen}
              selected={nimStorageOption}
              onSelect={(_event, value) => {
                setNimStorageOption(value as 'ephemeral' | 'deploy-existing' | 'new-pvc' | 'existing-pvc');
                setIsNimDeployOptionOpen(false);
              }}
              onOpenChange={(isOpen) => setIsNimDeployOptionOpen(isOpen)}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsNimDeployOptionOpen(!isNimDeployOptionOpen)}
                  isExpanded={isNimDeployOptionOpen}
                  isFullWidth
                  id="nim-deploy-option-toggle"
                >
                  {nimStorageOption === 'ephemeral' && 'Download NIM image to ephemeral storage'}
                  {nimStorageOption === 'deploy-existing' && 'Deploy a stored NIM image'}
                  {nimStorageOption === 'new-pvc' && 'Download NIM image and create new cluster storage'}
                  {nimStorageOption === 'existing-pvc' && 'Download NIM image and store in existing cluster storage'}
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                <SelectOption id="nim-deploy-opt-ephemeral" value="ephemeral">Download NIM image to ephemeral storage</SelectOption>
                <SelectOption id="nim-deploy-opt-deploy-existing" value="deploy-existing">Deploy a stored NIM image</SelectOption>
                <SelectOption id="nim-deploy-opt-new-pvc" value="new-pvc">Download NIM image and create new cluster storage</SelectOption>
                <SelectOption id="nim-deploy-opt-existing-pvc" value="existing-pvc">Download NIM image and store in existing cluster storage</SelectOption>
              </SelectList>
            </Select>
          </FormGroup>

          {/* Option 1: Ephemeral — only storage size */}
          {nimStorageOption === 'ephemeral' && (
            <div style={{ marginLeft: 'var(--pf-t--global--spacer--xl)' }}>
              <FormGroup label="NVIDIA NIM storage size" isRequired>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <Button variant="control" onClick={() => setNimStorageSize(Math.max(1, nimStorageSize - 1))} aria-label="Decrease storage size" id="nim-storage-size-minus">−</Button>
                  <TextInput id="nim-storage-size-input" type="number" value={nimStorageSize} onChange={(_event, value) => setNimStorageSize(Math.max(1, parseInt(value) || 1))} aria-label="NVIDIA NIM storage size" style={{ width: '80px', textAlign: 'center' }} />
                  <Button variant="control" onClick={() => setNimStorageSize(nimStorageSize + 1)} aria-label="Increase storage size" id="nim-storage-size-plus">+</Button>
                  <span style={{ marginLeft: 'var(--pf-t--global--spacer--sm)', fontWeight: 400 }}>GiB</span>
                </div>
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      The NIM image will be downloaded to a temporary PVC that is automatically deleted when the deployment is removed.
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            </div>
          )}

          {/* Option 2: Deploy existing — select PVC, show NIM image for verification */}
          {nimStorageOption === 'deploy-existing' && (
            <div style={{ marginLeft: 'var(--pf-t--global--spacer--xl)' }}>
              <FormGroup label="NIM image" fieldId="nim-image-verify">
                <span id="nim-image-verify">{nimImage || 'Not selected'}</span>
              </FormGroup>
              <FormGroup label="Existing cluster storage where the image is located" fieldId="existing-nim-pvc-select">
                <Select
                  id="existing-nim-pvc-select"
                  isOpen={isExistingNimPvcOpen}
                  selected={existingNimPvc}
                  onSelect={(_event, value) => { setExistingNimPvc(value as string); setIsExistingNimPvcOpen(false); }}
                  onOpenChange={(isOpen) => setIsExistingNimPvcOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle ref={toggleRef} onClick={() => setIsExistingNimPvcOpen(!isExistingNimPvcOpen)} isExpanded={isExistingNimPvcOpen} isFullWidth id="existing-nim-pvc-toggle">{existingNimPvc}</MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <SelectList>
                    <SelectOption id="existing-nim-pvc-1" value="nim1-pvc">nim1-pvc</SelectOption>
                    <SelectOption id="existing-nim-pvc-4" value="nim4-pvc">nim4-pvc</SelectOption>
                  </SelectList>
                </Select>
              </FormGroup>
            </div>
          )}

          {/* Option 3: New cluster storage — name + storage size */}
          {nimStorageOption === 'new-pvc' && (
            <div style={{ marginLeft: 'var(--pf-t--global--spacer--xl)' }}>
              <FormGroup label="Cluster storage name" isRequired fieldId="nim-new-pvc-name">
                <TextInput
                  id="nim-new-pvc-name"
                  value={nimNewPvcName}
                  onChange={(_event, value) => setNimNewPvcName(value)}
                  aria-label="Cluster storage name"
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>This cluster storage can be reused for future deployments of this NIM image.</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>

              <FormGroup label="Model path" fieldId="nim-model-path">
                <TextInput
                  id="nim-model-path"
                  value={nimModelPath}
                  onChange={(_event, value) => setNimModelPath(value)}
                  aria-label="Model path"
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>Path within the container where model files will be mounted.</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>

              <FormGroup label="Subpath" fieldId="nim-new-pvc-subpath">
                <TextInput
                  id="nim-new-pvc-subpath"
                  value={nimNewPvcSubPath}
                  onChange={(_event, value) => setNimNewPvcSubPath(value)}
                  aria-label="Subpath"
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>Optional: Subdirectory within the PVC. Use this if you have multiple models stored in the same PVC. Leave blank to use the root of the PVC.</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>

              <FormGroup label="NVIDIA NIM storage size" isRequired>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <Button variant="control" onClick={() => setNimStorageSize(Math.max(1, nimStorageSize - 1))} aria-label="Decrease storage size" id="nim-storage-size-minus-new">−</Button>
                  <TextInput id="nim-storage-size-input-new" type="number" value={nimStorageSize} onChange={(_event, value) => setNimStorageSize(Math.max(1, parseInt(value) || 1))} aria-label="NVIDIA NIM storage size" style={{ width: '80px', textAlign: 'center' }} />
                  <Button variant="control" onClick={() => setNimStorageSize(nimStorageSize + 1)} aria-label="Increase storage size" id="nim-storage-size-plus-new">+</Button>
                  <span style={{ marginLeft: 'var(--pf-t--global--spacer--sm)', fontWeight: 400 }}>GiB</span>
                </div>
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      Specify the size of the PVC. Make sure it is larger than the NIM image size specified by NVIDIA.
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            </div>
          )}

          {/* Option 4: Existing PVC — select PVC + model path + subpath */}
          {nimStorageOption === 'existing-pvc' && (
            <div style={{ marginLeft: 'var(--pf-t--global--spacer--xl)' }}>
              <FormGroup label="Cluster storage name" fieldId="nim-existing-storage-name">
                <TextInput
                  id="nim-existing-storage-name"
                  value={nimExistingStorageName}
                  onChange={(_event, value) => setNimExistingStorageName(value)}
                  aria-label="Cluster storage name"
                />
              </FormGroup>

              <FormGroup label="Model path" fieldId="nim-model-path-ep">
                <TextInput
                  id="nim-model-path-ep"
                  value={nimModelPath}
                  onChange={(_event, value) => setNimModelPath(value)}
                  aria-label="Model path"
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>Path within the container where model files will be mounted.</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>

              <FormGroup label="Subpath" fieldId="nim-subpath-ep">
                <TextInput
                  id="nim-subpath-ep"
                  value={nimNewPvcSubPath}
                  onChange={(_event, value) => setNimNewPvcSubPath(value)}
                  aria-label="Subpath"
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>Optional: Subdirectory within the PVC. Use this if you have multiple models stored in the same PVC. Leave blank to use the root of the PVC.</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            </div>
          )}
        </>
      )}

      {wizardData.modelLocation !== 'NVIDIA NIM catalog' && (
      <FormGroup label="Deployment resource" labelHelp={renderFormGroupLabelHelp('Deployment resource')} isRequired>
        <Radio
          id="auto-select-runtime"
          name="serving-runtime-option"
          label={
            <>
              <strong>Automatic selection:</strong> Automatically select the best resource for my model based on model type,
              model format and hardware profile.
            </>
          }
          isChecked={wizardData.servingRuntimeOption === 'auto'}
          onChange={() => updateWizardData({ servingRuntimeOption: 'auto' })}
        />
        {wizardData.servingRuntimeOption === 'auto' && (
          <div style={{ marginLeft: '1.75rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            <TextInput 
              value={wizardData.useLegacyMode ? "vLLM NVIDIA GPU ServingRuntime for KServe" : "vLLM NVIDIA GPU config"} 
              isDisabled 
            />
          </div>
        )}

        <Radio
          id="manual-select-runtime"
          name="serving-runtime-option"
          label={
            <>
              <strong>Manual selection:</strong> Manually select a resource from a list of preconfigured and custom options.
            </>
          }
          isChecked={wizardData.servingRuntimeOption === 'manual'}
          onChange={() => updateWizardData({ servingRuntimeOption: 'manual' })}
        />
        {wizardData.servingRuntimeOption === 'manual' && (
          <div style={{ marginLeft: '1.75rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            <Select
              id="deploy-wizard-serving-runtime"
              isOpen={isServingRuntimeOpen}
              selected={wizardData.servingRuntime}
              onSelect={(_event, value) => {
                updateWizardData({ servingRuntime: value as string });
                setIsServingRuntimeOpen(false);
              }}
              onOpenChange={(isOpen) => setIsServingRuntimeOpen(isOpen)}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsServingRuntimeOpen(!isServingRuntimeOpen)}
                  isExpanded={isServingRuntimeOpen}
                  style={{ width: '100%' }}
                  id="serving-runtime-toggle"
                >
                  {wizardData.servingRuntime || 'Select a deployment configuration'}
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                {wizardData.llmdEnabled === 'yes' && !wizardData.useLegacyMode && (
                  <SelectOption id="runtime-distributed-llmd" value="Distributed inference with llm-d">
                    Distributed inference with llm-d
                  </SelectOption>
                )}
                {wizardData.useLegacyMode ? (
                  <>
                    {wizardData.modelType !== 'Generative AI model (including LLMs and multimodal models)' && (
                      <>
                        <SelectOption id="runtime-openvino" value="OpenVINO Model Server">OpenVINO Model Server</SelectOption>
                        <SelectOption id="runtime-caikit" value="Caikit Standalone ServingRuntime">
                          Caikit Standalone ServingRuntime
                        </SelectOption>
                        <SelectOption id="runtime-tgis" value="TGIS Standalone ServingRuntime">
                          TGIS Standalone ServingRuntime
                        </SelectOption>
                      </>
                    )}
                    {wizardData.modelType === 'Generative AI model (including LLMs and multimodal models)' && (
                      <>
                        <SelectOption id="runtime-vllm-intel-gaudi" value="vLLM Intel Gaudi Accelerator ServingRuntime for KServe">
                          vLLM Intel Gaudi Accelerator ServingRuntime for KServe
                        </SelectOption>
                        <SelectOption id="runtime-vllm-nvidia-kserve" value="vLLM NVIDIA GPU ServingRuntime for KServe">
                          vLLM NVIDIA GPU ServingRuntime for KServe
                        </SelectOption>
                        <SelectOption id="runtime-vllm-spyre-x86" value="vLLM Spyre on x86 ServingRuntime for KServe">
                          vLLM Spyre on x86 ServingRuntime for KServe
                        </SelectOption>
                        <SelectOption id="runtime-vllm-amd-gpu" value="vLLM AMD GPU ServingRuntime for KServe">
                          vLLM AMD GPU ServingRuntime for KServe
                        </SelectOption>
                        <SelectOption id="runtime-vllm-cpu-ppc" value="vLLM CPU (ppc64le/s390x) ServingRuntime for KServe">
                          vLLM CPU (ppc64le/s390x) ServingRuntime for KServe
                        </SelectOption>
                        <SelectOption id="runtime-vllm-cpu-amd64" value="vLLM CPU (amd64- EXPERIMENTAL) ServingRuntime for KServe">
                          vLLM CPU (amd64- EXPERIMENTAL) ServingRuntime for KServe
                        </SelectOption>
                        <SelectOption id="runtime-vllm-spyre-s390x" value="vLLM Spyre s390x ServingRuntime for KServe">
                          vLLM Spyre s390x ServingRuntime for KServe
                        </SelectOption>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <SelectOption id="config-vllm-nvidia" value="vLLM NVIDIA GPU config">
                      vLLM NVIDIA GPU config
                    </SelectOption>
                    <SelectOption id="config-vllm-intel-gaudi" value="vLLM Intel Gaudi Accelerator config">
                      vLLM Intel Gaudi Accelerator config
                    </SelectOption>
                    <SelectOption id="config-vllm-spyre-x86" value="vLLM Spyre on x86 config">
                      vLLM Spyre on x86 config
                    </SelectOption>
                    <SelectOption id="config-vllm-amd" value="vLLM AMD GPU config">
                      vLLM AMD GPU config
                    </SelectOption>
                    <SelectOption id="config-vllm-cpu-ppc" value="vLLM CPU (ppc64le/s390x) config">
                      vLLM CPU (ppc64le/s390x) config
                    </SelectOption>
                    <SelectOption id="config-vllm-cpu-amd64" value="vLLM CPU (amd 64-EXPERIMENTAL) config">
                      vLLM CPU (amd 64-EXPERIMENTAL) config
                    </SelectOption>
                    <SelectOption id="config-vllm-spyre-s390x" value="vLLM Spyre s390x config">
                      vLLM Spyre s390x config
                    </SelectOption>
                  </>
                )}
              </SelectList>
            </Select>
          </div>
        )}
      </FormGroup>
      )}

      <FormGroup label="Number of replicas to deploy" labelHelp={renderFormGroupLabelHelp('Number of replicas to deploy')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="plain"
            onClick={() =>
              updateWizardData({ numberOfReplicas: Math.max(1, wizardData.numberOfReplicas - 1) })
            }
          >
            -
          </Button>
          <NumberInput
            value={wizardData.numberOfReplicas}
            min={1}
            onMinus={() =>
              updateWizardData({ numberOfReplicas: Math.max(1, wizardData.numberOfReplicas - 1) })
            }
            onChange={(event) => {
              const value = Number((event.target as HTMLInputElement).value);
              if (!isNaN(value) && value >= 1) {
                updateWizardData({ numberOfReplicas: value });
              }
            }}
            onPlus={() => updateWizardData({ numberOfReplicas: wizardData.numberOfReplicas + 1 })}
            inputName="replicas"
            inputAriaLabel="Number of replicas"
            minusBtnAriaLabel="Minus"
            plusBtnAriaLabel="Plus"
            widthChars={4}
          />
          <Button
            variant="plain"
            onClick={() => updateWizardData({ numberOfReplicas: wizardData.numberOfReplicas + 1 })}
          >
            +
          </Button>
        </div>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>Non-production models typically require only one replica.</HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </Form>
  );

  // Step 3: Advanced settings
  const advancedSettingsStep = (
    <Form>
      {wizardData.modelLocation !== 'NVIDIA NIM catalog' && (wizardData.modelType !== 'Predictive model' && !wizardData.useLegacyMode) && (
        <FormGroup label="Model availability" labelHelp={renderFormGroupLabelHelp('Model availability')}>
          <Checkbox
            id="publish-as-ai-asset-endpoint"
            label="Publish as AI asset endpoint"
            isChecked={wizardData.publishAsAIAssetEndpoint}
            onChange={(_event, checked) => updateWizardData({ publishAsAIAssetEndpoint: checked })}
          />
          <Checkbox
            id="publish-as-maas"
            label="Publish as MaaS"
            isChecked={wizardData.publishAsMaaS}
            onChange={(_event, checked) => updateWizardData({ publishAsMaaS: checked })}
          />
        </FormGroup>
      )}

      {wizardData.modelLocation !== 'NVIDIA NIM catalog' && wizardData.modelType === 'Generative AI model (including LLMs and multimodal models)' && wizardData.useLegacyMode && (
        <FormGroup label="Model availability" labelHelp={renderFormGroupLabelHelp('Model availability')}>
          <Checkbox
            id="publish-as-ai-asset-endpoint-legacy"
            label="Publish as AI asset endpoint"
            isChecked={wizardData.publishAsAIAssetEndpoint}
            onChange={(_event, checked) => updateWizardData({ publishAsAIAssetEndpoint: checked })}
          />
        </FormGroup>
      )}

      {wizardData.modelLocation !== 'NVIDIA NIM catalog' && !wizardData.useLegacyMode && wizardData.modelType !== 'Predictive model' && (
        <FormGroup label="Gateway selection" labelHelp={renderFormGroupLabelHelp('Gateway selection')}>
          <label htmlFor="gateway-select" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 'normal' }}>
            Select the gateway through which users can access the model deployment
          </label>
          <Select
            id="gateway-select"
            isOpen={isGatewaySelectionOpen}
            selected={wizardData.gatewaySelection}
            onSelect={(_event, value) => {
              if (!wizardData.publishAsMaaS) {
                updateWizardData({ gatewaySelection: value as string });
              }
              setIsGatewaySelectionOpen(false);
            }}
            onOpenChange={(isOpen) => {
              if (!wizardData.publishAsMaaS) {
                setIsGatewaySelectionOpen(isOpen);
              }
            }}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => {
                  if (!wizardData.publishAsMaaS) {
                    setIsGatewaySelectionOpen(!isGatewaySelectionOpen);
                  }
                }}
                isExpanded={isGatewaySelectionOpen}
                style={{ width: '100%' }}
                isDisabled={wizardData.publishAsMaaS}
              >
                {wizardData.publishAsMaaS ? wizardData.gatewaySelection : (wizardData.gatewaySelection || 'Select')}
              </MenuToggle>
            )}
          >
            <SelectList>
              <SelectOption id="gateway-default" value="openshift-ai-inference (Default)">
                openshift-ai-inference (Default)
              </SelectOption>
              <SelectOption id="gateway-local-1" value="Local gateway 1">
                Local gateway 1
              </SelectOption>
              <SelectOption id="gateway-local-2" value="Local gateway 2">
                Local gateway 2
              </SelectOption>
              <SelectOption id="gateway-global-1" value="Global gateway 1">
                Global gateway 1
              </SelectOption>
              <SelectOption id="gateway-global-2" value="Global gateway 2">
                Global gateway 2
              </SelectOption>
              <SelectOption id="gateway-maas" value="MaaS gateway">
                MaaS gateway
              </SelectOption>
            </SelectList>
          </Select>
        </FormGroup>
      )}

      {(wizardData.modelLocation === 'NVIDIA NIM catalog' || wizardData.useLegacyMode || wizardData.modelType === 'Predictive model') && (
        <FormGroup label="Model access" labelHelp={renderFormGroupLabelHelp('Model access')}>
          <Checkbox
            id="make-available-external"
            label="Make this model available through an external route"
            isChecked={wizardData.makeAvailableExternal}
            onChange={(_event, checked) => updateWizardData({ makeAvailableExternal: checked })}
          />
        </FormGroup>
      )}

      {(wizardData.modelLocation === 'NVIDIA NIM catalog' || (wizardData.useLegacyMode || !wizardData.publishAsMaaS) || wizardData.modelType === 'Predictive model') && (
        <FormGroup label="Token authentication" labelHelp={renderFormGroupLabelHelp('Token authentication')}>
          <Checkbox
            id="require-token-auth"
            label="Require token authentication"
            description="Requiring token authentication provides added security if you make your model available to users outside of your cluster."
            isChecked={wizardData.requireTokenAuth}
            onChange={(_event, checked) => updateWizardData({ requireTokenAuth: checked })}
          />
          {!wizardData.requireTokenAuth && (
            <Alert
              id="security-warning-alert"
              variant="warning"
              isInline
              title="Making models available by external routes without requiring authorization can lead to security vulnerabilities."
              style={{ marginTop: '1rem' }}
            />
          )}
        </FormGroup>
      )}

      <FormGroup label="Configuration parameters" labelHelp={renderFormGroupLabelHelp('Configuration parameters')}>
        <Checkbox
          id="include-runtime-args"
          label="Include additional runtime arguments"
          isChecked={wizardData.includeRuntimeArgs}
          onChange={(_event, checked) => updateWizardData({ includeRuntimeArgs: checked })}
        />
        <Checkbox
          id="apply-env-vars"
          label="Apply additional serving runtime environment variables"
          isChecked={wizardData.applyEnvVars}
          onChange={(_event, checked) => updateWizardData({ applyEnvVars: checked })}
        />
      </FormGroup>

      <UnmappedFieldsSection
        unmappedFields={unmappedFields}
        onEditInYAML={handleEditInYAML}
        onFieldClick={handleCustomFieldClick}
      />
    </Form>
  );

  // Step 4: Summary
  const summaryStep = (
    <>
      <DescriptionList isHorizontal>
        {/* Source model details */}
        <DescriptionListGroup>
          <DescriptionListTerm>Model location</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.modelLocation || 'Not specified'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {wizardData.modelLocation === 'NVIDIA NIM catalog' && (
          <DescriptionListGroup>
            <DescriptionListTerm>NIM image</DescriptionListTerm>
            <DescriptionListDescription>
              {nimImage || 'Not specified'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.modelLocation === 'Existing connection' && (
          <DescriptionListGroup>
            <DescriptionListTerm>Connection name</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.connectionName || 'Not specified'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.modelLocation === 'URI' && (
          <DescriptionListGroup>
            <DescriptionListTerm>Model URI</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.modelUri || 'Not specified'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.modelLocation === 'Cluster storage' && (
          <>
            <DescriptionListGroup>
              <DescriptionListTerm>Cluster storage name</DescriptionListTerm>
              <DescriptionListDescription>
                {wizardData.clusterStorageName || 'Not specified'}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Model path</DescriptionListTerm>
              <DescriptionListDescription>
                {wizardData.modelPath || 'Not specified'}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </>
        )}

        <DescriptionListGroup>
          <DescriptionListTerm>Model type</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.modelType || 'Not specified'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {/* Model deployment details */}
        <DescriptionListGroup>
          <DescriptionListTerm>Project</DescriptionListTerm>
          <DescriptionListDescription>{wizardData.project}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Model deployment name</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.modelDeploymentName || 'Not specified'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {wizardData.description && (
          <DescriptionListGroup>
            <DescriptionListTerm>Description</DescriptionListTerm>
            <DescriptionListDescription>{wizardData.description}</DescriptionListDescription>
          </DescriptionListGroup>
        )}

        <DescriptionListGroup>
          <DescriptionListTerm>Hardware profile</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.hardwareProfile || 'Not specified'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {wizardData.modelLocation !== 'NVIDIA NIM catalog' && wizardData.modelFormat && (
          <DescriptionListGroup>
            <DescriptionListTerm>Model format</DescriptionListTerm>
            <DescriptionListDescription>{wizardData.modelFormat}</DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.modelLocation !== 'NVIDIA NIM catalog' && (
          <DescriptionListGroup>
            <DescriptionListTerm>Serving runtime</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.servingRuntimeOption === 'auto'
                ? 'Auto-selected: OpenVINO Model Server'
                : wizardData.servingRuntime || 'Not specified'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.modelLocation === 'NVIDIA NIM catalog' && (
          <>
            <DescriptionListGroup>
              <DescriptionListTerm>Storage and deployment option</DescriptionListTerm>
              <DescriptionListDescription>
                {nimStorageOption === 'ephemeral' && 'Download NIM image to ephemeral storage'}
                {nimStorageOption === 'deploy-existing' && 'Deploy a stored NIM image'}
                {nimStorageOption === 'new-pvc' && 'Download NIM image and create new cluster storage'}
                {nimStorageOption === 'existing-pvc' && 'Download NIM image and store in existing cluster storage'}
              </DescriptionListDescription>
            </DescriptionListGroup>

            {/* Ephemeral: storage size only */}
            {nimStorageOption === 'ephemeral' && (
              <DescriptionListGroup>
                <DescriptionListTerm>NVIDIA NIM storage size</DescriptionListTerm>
                <DescriptionListDescription>{nimStorageSize} GiB</DescriptionListDescription>
              </DescriptionListGroup>
            )}

            {/* Deploy existing: NIM image + PVC */}
            {nimStorageOption === 'deploy-existing' && (
              <>
                <DescriptionListGroup>
                  <DescriptionListTerm>NIM image</DescriptionListTerm>
                  <DescriptionListDescription>{nimImage || 'Not selected'}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Existing cluster storage where the image is located</DescriptionListTerm>
                  <DescriptionListDescription>{existingNimPvc}</DescriptionListDescription>
                </DescriptionListGroup>
              </>
            )}

            {/* New reusable PVC: name + model path + size */}
            {nimStorageOption === 'new-pvc' && (
              <>
                <DescriptionListGroup>
                  <DescriptionListTerm>Cluster storage name</DescriptionListTerm>
                  <DescriptionListDescription>{nimNewPvcName}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Model path</DescriptionListTerm>
                  <DescriptionListDescription>{nimModelPath || 'Not specified'}</DescriptionListDescription>
                </DescriptionListGroup>
                {nimNewPvcSubPath && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Subpath</DescriptionListTerm>
                    <DescriptionListDescription>{nimNewPvcSubPath}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                <DescriptionListGroup>
                  <DescriptionListTerm>NVIDIA NIM storage size</DescriptionListTerm>
                  <DescriptionListDescription>{nimStorageSize} GiB</DescriptionListDescription>
                </DescriptionListGroup>
              </>
            )}

            {/* Existing PVC: model path + subpath */}
            {nimStorageOption === 'existing-pvc' && (
              <>
                <DescriptionListGroup>
                  <DescriptionListTerm>Cluster storage name</DescriptionListTerm>
                  <DescriptionListDescription>{nimExistingStorageName || 'Not specified'}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Model path</DescriptionListTerm>
                  <DescriptionListDescription>{nimModelPath || 'Not specified'}</DescriptionListDescription>
                </DescriptionListGroup>
                {nimNewPvcSubPath && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Subpath</DescriptionListTerm>
                    <DescriptionListDescription>{nimNewPvcSubPath}</DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </>
            )}
          </>
        )}

        <DescriptionListGroup>
          <DescriptionListTerm>Number of replicas</DescriptionListTerm>
          <DescriptionListDescription>{wizardData.numberOfReplicas}</DescriptionListDescription>
        </DescriptionListGroup>

        {/* Advanced settings */}
        {wizardData.modelLocation !== 'NVIDIA NIM catalog' && (wizardData.publishAsAIAssetEndpoint || wizardData.publishAsMaaS) && (
          <DescriptionListGroup>
            <DescriptionListTerm>Model availability</DescriptionListTerm>
            <DescriptionListDescription>
              {[
                wizardData.publishAsAIAssetEndpoint && 'Publish as AI asset endpoint',
                wizardData.publishAsMaaS && 'Publish as MaaS'
              ].filter(Boolean).join(', ')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.modelLocation !== 'NVIDIA NIM catalog' && !wizardData.useLegacyMode && (
          <DescriptionListGroup>
            <DescriptionListTerm>Gateway selection</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.gatewaySelection}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        <DescriptionListGroup>
          <DescriptionListTerm>External route</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.makeAvailableExternal ? 'Yes' : 'No'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Token authentication</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.requireTokenAuth ? 'Required' : 'Not required'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {wizardData.includeRuntimeArgs && (
          <DescriptionListGroup>
            <DescriptionListTerm>Runtime arguments</DescriptionListTerm>
            <DescriptionListDescription>Enabled</DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.applyEnvVars && (
          <DescriptionListGroup>
            <DescriptionListTerm>Environment variables</DescriptionListTerm>
            <DescriptionListDescription>Enabled</DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.makeAvailableAsAIAsset && (
          <>
            <DescriptionListGroup>
              <DescriptionListTerm>Available as AI asset</DescriptionListTerm>
              <DescriptionListDescription>Yes</DescriptionListDescription>
            </DescriptionListGroup>
            {(wizardData.selectedTiers.length > 0 || wizardData.customTierNames) && (
              <DescriptionListGroup>
                <DescriptionListTerm>Tiers</DescriptionListTerm>
                <DescriptionListDescription>
                  {wizardData.selectedTiers
                    .filter((t) => t !== 'Custom...')
                    .map((id) => mockTiers.find((t) => t.id === id)?.name ?? id)
                    .concat(wizardData.customTierNames ? [wizardData.customTierNames] : [])
                    .join(', ') || 'Not specified'}
                </DescriptionListDescription>
              </DescriptionListGroup>
            )}
          </>
        )}

        {wizardData.makeAvailableGlobally && (
          <DescriptionListGroup>
            <DescriptionListTerm>Available globally</DescriptionListTerm>
            <DescriptionListDescription>Yes</DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>
    </>
  );

  const isDrawerOpen = viewMode === 'split';
  const drawerViewMode = 'split';

  // Get step name with badge for Advanced options
  const getAdvancedOptionsStepName = () => {
    if (unmappedFields.length > 0) {
      return (
        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>Advanced options</FlexItem>
          <FlexItem>
            <Badge id="advanced-options-unmapped-badge">{unmappedFields.length}</Badge>
          </FlexItem>
        </Flex>
      );
    }
    return 'Advanced options';
  };

  // Render YAML editor content for YAML view mode (same tabbed UI as drawer)
  const yamlViewCodeEditorRef = React.useRef<HTMLDivElement>(null);

  // Check if YAML has been modified from initial state
  const hasYAMLChanged = React.useMemo(() => {
    if (!isInitialYAMLLoaded || !initialYAML) return false;
    return yamlContent.trim() !== initialYAML.trim();
  }, [yamlContent, initialYAML, isInitialYAMLLoaded]);

  React.useEffect(() => {
    // Use a small timeout to ensure CodeEditor is fully rendered
    const timeoutId = setTimeout(() => {
      if (yamlViewCodeEditorRef.current) {
        const controlsContainer = yamlViewCodeEditorRef.current.querySelector('.pf-v6-c-code-editor__controls');
        
        if (controlsContainer) {
          // Check if reset button container already exists
          const resetButtonContainer = controlsContainer.querySelector('#yaml-view-reset-button-container');
          
          if (hasYAMLChanged && !resetButtonContainer) {
            // Create container for reset button
            const container = document.createElement('div');
            container.id = 'yaml-view-reset-button-container';
            controlsContainer.appendChild(container);
            
            // Render React button with tooltip into container
            const root = createRoot(container);
            root.render(
              <Tooltip content="Reset YAML">
                <Button
                  variant="plain"
                  icon={<RedoIcon />}
                  onClick={handleResetYAML}
                  aria-label="Reset YAML"
                  id="yaml-view-reset-button"
                />
              </Tooltip>
            );
            
            // Store root for cleanup
            (container as any)._reactRoot = root;
          } else if (!hasYAMLChanged && resetButtonContainer) {
            // Remove reset button if YAML hasn't changed
            const root = (resetButtonContainer as any)._reactRoot;
            if (root) {
              // Use setTimeout to defer unmount until after current render
              setTimeout(() => root.unmount(), 0);
            }
            resetButtonContainer.remove();
          }

          // Inject help button into controls area (next to Copy, Download, Upload) for YAML and split views
          if (viewMode === 'yaml' || viewMode === 'split') {
            const helpButtonContainer = controlsContainer.querySelector('#yaml-view-help-button-container');
            
            if (!helpButtonContainer) {
              // Create container for help button
              const container = document.createElement('div');
              container.id = 'yaml-view-help-button-container';
              controlsContainer.appendChild(container);
              
              // Render React button with tooltip into container
              const root = createRoot(container);
              root.render(
                <Tooltip content="Help with YAML">
                  <Button
                    variant="plain"
                    icon={<HelpIcon />}
                    onClick={handleOpenHelp}
                    aria-label="Help with YAML"
                    id="yaml-view-help-button"
                  />
                </Tooltip>
              );

              // Store root reference for cleanup
              (container as any)._reactRoot = root;
            }
          }
        }
      }
    }, 100); // Small delay to ensure CodeEditor is rendered
    
    return () => {
      clearTimeout(timeoutId);
      // Defer cleanup to avoid unmounting during render
      setTimeout(() => {
        // Cleanup reset button and help button if they exist
        if (yamlViewCodeEditorRef.current) {
          const controlsContainer = yamlViewCodeEditorRef.current.querySelector('.pf-v6-c-code-editor__controls');
          if (controlsContainer) {
            const resetButtonContainer = controlsContainer.querySelector('#yaml-view-reset-button-container');
            if (resetButtonContainer) {
              const root = (resetButtonContainer as any)._reactRoot;
              if (root) {
                root.unmount();
              }
              if (resetButtonContainer.parentNode) {
                resetButtonContainer.parentNode.removeChild(resetButtonContainer);
              }
            }
            const helpButtonContainer = controlsContainer.querySelector('#yaml-view-help-button-container');
            if (helpButtonContainer) {
              const root = (helpButtonContainer as any)._reactRoot;
              if (root) {
                root.unmount();
              }
              if (helpButtonContainer.parentNode) {
                helpButtonContainer.parentNode.removeChild(helpButtonContainer);
              }
            }
          }
        }
      }, 0);
    };
  }, [handleResetYAML, hasYAMLChanged, viewMode, handleOpenHelp]);

  const renderYAMLEditorContent = (fillContainer = false) => {
    const isYamlView = viewMode === 'yaml';
    const showEmptyState = is34MVP && yamlContent.trim() === '' && !yamlEditingEnabled;

    return (
      <div
        style={{
          ...(isYamlView ? { padding: 0 } : { padding: '1rem' }),
          display: 'flex',
          flexDirection: 'column',
          ...(isYamlView
            ? { minHeight: 'calc(100vh - 200px)', height: 'calc(100vh - 200px)' }
            : fillContainer
              ? { flex: 1, minHeight: 0 }
              : { height: 'calc(100vh - 250px)' }),
        }}
      >
        {!yamlEditingEnabled && (
          <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginBottom: '1rem', flexShrink: 0, padding: isYamlView ? '1rem 1rem 0' : undefined }}>
            <Button
              variant="primary"
              onClick={() => setIsEditYAMLWarningModalOpen(true)}
              id="yaml-view-enter-manual-edit-mode-button"
              aria-label="Enter Manual Edit Mode"
            >
              Enter Manual Edit Mode
            </Button>
          </Flex>
        )}
        {yamlEditingEnabled && (
          <Alert
            variant="info"
            isInline
            title="Manual Edit Mode Active"
            style={{ marginBottom: '1rem', flexShrink: 0 }}
            id="yaml-view-manual-mode-banner"
          />
        )}
        {yamlErrors.length > 0 && (
          <Alert
            variant="danger"
            isInline
            title="YAML validation errors"
            style={{ marginBottom: '1rem', flexShrink: 0 }}
            id="yaml-view-error-alert"
          >
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {yamlErrors.map((error, index) => (
                <li key={index}>
                  Line {error.line}: {error.message}
                </li>
              ))}
            </ul>
          </Alert>
        )}
        <div
          ref={yamlViewCodeEditorRef}
          style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}
          className={showEmptyState ? 'yaml-editor-empty-state' : undefined}
        >
          <style>
            {showEmptyState ? `
              .yaml-editor-empty-state .monaco-editor,
              .yaml-editor-empty-state .view-lines {
                visibility: hidden !important;
              }
            ` : ''}
          </style>
          <CodeEditor
            isDarkTheme={false}
            isLineNumbersVisible={true}
            isReadOnly={!yamlEditingEnabled}
            isMinimapVisible={false}
            isLanguageLabelVisible={true}
            isCopyEnabled={true}
            isDownloadEnabled={true}
            isUploadEnabled={yamlEditingEnabled}
            copyButtonAriaLabel="Copy YAML to clipboard"
            downloadButtonAriaLabel="Download YAML"
            uploadButtonAriaLabel="Upload YAML file"
            code={yamlContent}
            onChange={yamlEditingEnabled ? handleYAMLChange : undefined}
            language={Language.yaml}
            height="100%"
            className="pf-m-full-height"
            id="yaml-view-code-editor"
          />
          {showEmptyState && (
            <div style={{
              position: 'absolute',
              top: '48px',
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
              zIndex: 1
            }}>
              <EmptyState
                titleText="Auto-generated YAML unavailable"
                icon={CodeIcon}
                headingLevel="h2"
              >
                <EmptyStateBody>
                  YAML generation is currently supported only for the LLM-d serving runtime. Select the LLM-d runtime to generate a preview, or manually enter your YAML configuration.
                </EmptyStateBody>
              </EmptyState>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Point of no return: when in manual YAML mode, switching back to form discards manual changes
  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === 'form' && yamlEditingEnabled) {
      setIsReturnToFormModalOpen(true);
    } else {
      setViewMode(mode);
    }
  };

  const confirmReturnToForm = () => {
    setViewMode('form');
    setYamlEditingEnabled(false);
    setYamlErrors([]);
    if (is34MVP) {
      setWizardData(resetWizardData());
      setYamlContent('');
      setInitialYAML('');
    } else {
      setYamlContent(formDataToYAML(wizardData));
    }
    setIsReturnToFormModalOpen(false);
  };

  return (
    <>
      <PageSection>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {is34MVP ? 'Deploy model - ESCAPE HATCH' : 'Deploy model'}
            </Title>
          </FlexItem>
          {wizardStepIndex === 2 && 
           wizardData.modelType === 'Generative AI model (including LLMs and multimodal models)' && 
           !wizardData.useLegacyMode && (
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <span style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'monospace', color: '#2c3e50' }}>llm-d enabled</span>
                </FlexItem>
                <FlexItem>
                  <div className="custom-llmd-toggle">
                    <style>
                      {`
                        .custom-llmd-toggle .pf-v5-c-toggle-group__button {
                          font-family: 'Courier New', Courier, monospace !important;
                          font-weight: 600 !important;
                          font-size: 13px !important;
                          padding: 6px 16px !important;
                          border: 2px solid #34495e !important;
                          background-color: #ecf0f1 !important;
                          color: #2c3e50 !important;
                          transition: all 0.2s ease !important;
                        }
                        .custom-llmd-toggle .pf-v5-c-toggle-group__button:hover {
                          background-color: #d5dbdb !important;
                          border-color: #2c3e50 !important;
                        }
                        .custom-llmd-toggle .pf-v5-c-toggle-group__button.pf-m-selected {
                          background-color: #27ae60 !important;
                          border-color: #229954 !important;
                          color: #ffffff !important;
                          font-weight: 700 !important;
                        }
                        .custom-llmd-toggle .pf-v5-c-toggle-group__button.pf-m-selected:hover {
                          background-color: #229954 !important;
                          border-color: #1e8449 !important;
                        }
                      `}
                    </style>
                    <ToggleGroup aria-label="llm-d enabled toggle">
                      <ToggleGroupItem
                        text="Yes"
                        buttonId="llmd-enabled-yes"
                        isSelected={wizardData.llmdEnabled === 'yes'}
                        onChange={() => updateWizardData({ llmdEnabled: 'yes' })}
                      />
                      <ToggleGroupItem
                        text="No"
                        buttonId="llmd-enabled-no"
                        isSelected={wizardData.llmdEnabled === 'no'}
                        onChange={() => updateWizardData({ llmdEnabled: 'no' })}
                      />
                    </ToggleGroup>
                  </div>
                </FlexItem>
              </Flex>
            </FlexItem>
          )}
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
              <YAMLViewToggle
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                hideFormOption={isViewingExisting || customConfigBanner != null}
                formOptionDisabled={is34MVP ? false : yamlEditingEnabled}
                hideSplitOption={is34MVP || isViewingExisting || customConfigBanner != null}
              />
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection
        hasBodyWrapper={false}
        type={PageSectionTypes.wizard}
        aria-label={is34MVP ? 'Deploy model - ESCAPE HATCH wizard' : 'Deploy model wizard'}
      >
        {viewMode === 'form' && !customConfigBanner ? (
          <YAMLHelpDrawer
            isOpen={isHelpDrawerOpen}
            onClose={handleCloseHelpDrawer}
            scrollToFormField={helpDrawerScrollToFormField}
          >
            <Wizard
              onClose={handleClose}
              startIndex={wizardStepIndex}
              onStepChange={(_event, currentStep) => {
                const stepIdToIndex: Record<string, number> = {
                  'source-model-step': 1,
                  'model-deployment-step': 2,
                  'advanced-options-step': 3,
                  'summary-step': 4,
                };
                const idx = currentStep?.id ? stepIdToIndex[currentStep.id as string] : 1;
                if (idx) setWizardStepIndex(idx);
              }}
            >
            <WizardStep
              name="Source model"
              id="source-model-step"
              body={{ hasNoPadding: false }}
            >
              <div style={{ padding: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Source model</h2>
                <p style={{ marginBottom: '1.5rem', color: 'var(--pf-v5-global--Color--200)' }}>
                  Tell us about the model you want to deploy
                </p>
                {sourceModelStep}
              </div>
            </WizardStep>

            <WizardStep
              name="Model deployment"
              id="model-deployment-step"
              body={{ hasNoPadding: false }}
            >
              <div style={{ padding: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Model deployment</h2>
                {modelDeploymentStep}
              </div>
            </WizardStep>

            <WizardStep
              name={getAdvancedOptionsStepName()}
              id="advanced-options-step"
              body={{ hasNoPadding: false }}
            >
              <div style={{ padding: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Advanced settings (optional)
                </h2>
                {advancedSettingsStep}
              </div>
            </WizardStep>

            <WizardStep
              name="Summary"
              id="summary-step"
              footer={{ 
                nextButtonText: 'Deploy', 
                onNext: handleDeploy,
                isNextDisabled: yamlErrors.length > 0
              }}
              body={{ hasNoPadding: false }}
            >
              <div style={{ padding: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Summary</h2>
                {summaryStep}
              </div>
            </WizardStep>
          </Wizard>
          </YAMLHelpDrawer>
        ) : viewMode === 'yaml' ? (
          <YAMLHelpDrawer
            isOpen={isHelpDrawerOpen}
            onClose={handleCloseHelpDrawer}
            scrollToFormField={helpDrawerScrollToFormField}
          >
            <div style={{ padding: '1rem', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', minHeight: 0 }} id="yaml-full-screen-view">
              {customConfigBanner && (
                <Alert
                  variant="warning"
                  isInline
                  title={customConfigBanner}
                  style={{ marginBottom: '1rem', flexShrink: 0 }}
                  id="custom-config-banner"
                />
              )}
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {renderYAMLEditorContent(true)}
              </div>
              {yamlEditingEnabled ? (
                <Flex justifyContent={{ default: 'justifyContentFlexStart' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--pf-v5-global--BorderColor--100)', flexShrink: 0 }}>
                  <FlexItem>
                    <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                      <Button
                        variant="link"
                        onClick={() => {
                          if (isViewingExisting) {
                            if (yamlContent.trim() === '') {
                              handleClose();
                            } else {
                              setIsCancelWarningModalOpen(true);
                            }
                          } else if (is34MVP) {
                            if (yamlContent.trim() === '') {
                              handleClose();
                            } else {
                              setIsCancelWarningModalOpen(true);
                            }
                          } else {
                            setIsReturnToFormModalOpen(true);
                          }
                        }}
                        id="yaml-full-screen-cancel-button"
                      >
                        {is34MVP || isViewingExisting ? 'Cancel' : 'Return to form'}
                      </Button>
                      {isViewingExisting ? (
                        <Button
                          variant="primary"
                          onClick={handleClose}
                          isDisabled={yamlErrors.length > 0}
                          id="yaml-full-screen-save-button"
                        >
                          Save changes
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={handleDeploy}
                          isDisabled={yamlErrors.length > 0}
                          id="yaml-full-screen-deploy-button"
                        >
                          Deploy
                        </Button>
                      )}
                    </Flex>
                  </FlexItem>
                </Flex>
              ) : null}
            </div>
          </YAMLHelpDrawer>
        ) : (
          <YAMLHelpDrawer
            isOpen={isHelpDrawerOpen}
            onClose={handleCloseHelpDrawer}
            scrollToFormField={helpDrawerScrollToFormField}
          >
            <YAMLEditorDrawer
              isOpen={isDrawerOpen}
              viewMode={drawerViewMode}
              yamlContent={yamlContent}
              yamlErrors={yamlErrors}
              onYAMLChange={handleYAMLChange}
              onReset={handleResetYAML}
              onCopy={handleCopyYAML}
              onDownload={handleDownloadYAML}
              showResetButton={hasYAMLChanged}
              onOpenHelp={handleOpenHelp}
              scrollToLine={scrollToYAMLLine}
              onScrollToLineComplete={() => setScrollToYAMLLine(undefined)}
              isReadOnly={!yamlEditingEnabled}
              onEditYAML={() => setIsEditYAMLWarningModalOpen(true)}
              editYAMLButtonLabel={is34MVP ? 'Enter Manual Edit Mode' : 'Edit YAML'}
            >
              <div
                style={
                  yamlEditingEnabled && viewMode === 'split'
                    ? {
                        opacity: 0.6,
                        pointerEvents: 'none' as const,
                        position: 'relative',
                        minHeight: '100%',
                      }
                    : undefined
                }
                id={yamlEditingEnabled && viewMode === 'split' ? 'form-side-disabled' : undefined}
              >
              <Wizard
                onClose={handleClose}
                startIndex={wizardStepIndex}
                onStepChange={(_event, currentStep) => {
                  const stepIdToIndex: Record<string, number> = {
                    'source-model-step': 1,
                    'model-deployment-step': 2,
                    'advanced-options-step': 3,
                    'summary-step': 4,
                  };
                  const idx = currentStep?.id ? stepIdToIndex[currentStep.id as string] : 1;
                  if (idx) setWizardStepIndex(idx);
                }}
              >
                <WizardStep
                  name="Source model"
                  id="source-model-step"
                  body={{ hasNoPadding: false }}
                >
                  {viewMode === 'split' ? (
                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Source model</h2>
                      <p style={{ marginBottom: '1.5rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        Tell us about the model you want to deploy
                      </p>
                      {sourceModelStep}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Source model</h2>
                      <p style={{ marginBottom: '1.5rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        Tell us about the model you want to deploy
                      </p>
                      {sourceModelStep}
                    </div>
                  )}
                </WizardStep>

                <WizardStep
                  name="Model deployment"
                  id="model-deployment-step"
                  body={{ hasNoPadding: false }}
                >
                  {viewMode === 'split' ? (
                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Model deployment</h2>
                      {modelDeploymentStep}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Model deployment</h2>
                      {modelDeploymentStep}
                    </div>
                  )}
                </WizardStep>

                <WizardStep
                  name={getAdvancedOptionsStepName()}
                  id="advanced-options-step"
                  body={{ hasNoPadding: false }}
                >
                  {viewMode === 'split' ? (
                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Advanced settings (optional)
                      </h2>
                      {advancedSettingsStep}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Advanced settings (optional)
                      </h2>
                      {advancedSettingsStep}
                    </div>
                  )}
                </WizardStep>

                <WizardStep
                  name="Summary"
                  id="summary-step"
                  footer={{
                    nextButtonText: 'Deploy',
                    onNext: handleDeploy,
                    isNextDisabled: yamlErrors.length > 0
                  }}
                  body={{ hasNoPadding: false }}
                >
                  {viewMode === 'split' ? (
                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Summary</h2>
                      {summaryStep}
                    </div>
                  ) : (
                    <div style={{ padding: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Summary</h2>
                      {summaryStep}
                    </div>
                  )}
                </WizardStep>
            </Wizard>
              </div>
            </YAMLEditorDrawer>
          </YAMLHelpDrawer>
        )}
      </PageSection>
      
      {/* PatternFly Warning Modal (Modal + ModalHeader titleIconVariant="warning" + ModalBody + ModalFooter): opened when user clicks "Edit YAML" */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isEditYAMLWarningModalOpen}
        onClose={() => setIsEditYAMLWarningModalOpen(false)}
        id="edit-yaml-warning-modal"
        aria-labelledby="edit-yaml-warning-modal-title"
        aria-describedby="edit-yaml-warning-modal-body"
      >
        <ModalHeader
          title="Switch to manual YAML editor?"
          titleIconVariant="warning"
          labelId="edit-yaml-warning-modal-title"
        />
        <ModalBody id="edit-yaml-warning-modal-body">
          By entering manual edit mode, you will be able to modify the YAML directly. However, you will no longer be able to use the guided form, and any manual changes will be lost if you try to return to the form.
        </ModalBody>
        <ModalFooter>
          <Button
            variant="danger"
            onClick={() => {
              setYamlEditingEnabled(true);
              setYamlErrors([]);
              if (is34MVP) {
                setYamlContent('');
                setViewMode('yaml');
              } else if (isViewingExisting) {
                setViewMode('yaml');
              } else {
                setViewMode('split');
              }
              setIsEditYAMLWarningModalOpen(false);
            }}
            id="edit-yaml-warning-confirm-button"
          >
            Switch to Manual Mode
          </Button>
          <Button
            variant="link"
            onClick={() => setIsEditYAMLWarningModalOpen(false)}
            id="edit-yaml-warning-cancel-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Return to form confirmation (point of no return: manual changes will be lost) */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isReturnToFormModalOpen}
        onClose={() => setIsReturnToFormModalOpen(false)}
        id="return-to-form-modal"
        aria-labelledby="return-to-form-modal-title"
        aria-describedby="return-to-form-modal-body"
      >
        <ModalHeader
          title="Return to form?"
          titleIconVariant="warning"
          labelId="return-to-form-modal-title"
        />
        <ModalBody id="return-to-form-modal-body">
          {is34MVP
            ? 'All YAML changes will be removed and the form will start in an empty state. Do you want to continue?'
            : 'Your manual YAML changes will be lost. The form will show the last state it had before you switched to manual mode. Do you want to continue?'}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="danger"
            onClick={confirmReturnToForm}
            id="return-to-form-confirm-button"
          >
            Return to Form
          </Button>
          <Button
            variant="link"
            onClick={() => setIsReturnToFormModalOpen(false)}
            id="return-to-form-cancel-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Escape hatch: Cancel with unsaved changes – nothing will be saved */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isCancelWarningModalOpen}
        onClose={() => setIsCancelWarningModalOpen(false)}
        id="cancel-warning-modal"
        aria-labelledby="cancel-warning-modal-title"
        aria-describedby="cancel-warning-modal-body"
      >
        <ModalHeader
          title="Discard changes?"
          titleIconVariant="warning"
          labelId="cancel-warning-modal-title"
        />
        <ModalBody id="cancel-warning-modal-body">
          Your changes will not be saved. This is a breaking change. Do you want to leave?
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              setIsCancelWarningModalOpen(false);
              handleClose();
            }}
            id="cancel-warning-confirm-button"
          >
            Leave
          </Button>
          <Button
            variant="link"
            onClick={() => setIsCancelWarningModalOpen(false)}
            id="cancel-warning-cancel-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        variant={ModalVariant.small}
        title="Revert YAML"
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        id="reset-yaml-modal"
      >
        <ModalHeader>
          <Title headingLevel="h2" size="lg" id="reset-yaml-modal-title">
            Revert YAML
          </Title>
        </ModalHeader>
        <ModalBody id="reset-yaml-modal-body">
          Discard your changes and revert to the original YAML?
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={confirmResetYAML}
            id="reset-yaml-confirm-button"
          >
            Revert
          </Button>
          <Button
            variant="link"
            onClick={() => setIsResetModalOpen(false)}
            id="reset-yaml-cancel-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      
    </>
  );
};

export { DeployModelWizard };

