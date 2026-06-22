import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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
  PageSection,
  PageSectionTypes,
  Popover,
  Select,
  SelectList,
  SelectOption,
  TextInput,
  Title,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { getDefaultYamlFromCatalog } from './mcpRuntimeMetadata';

interface EnvVar {
  key: string;
  value: string;
}

interface SecretMount {
  secretName: string;
  mountPath: string;
}

interface LabelOrAnnotation {
  key: string;
  value: string;
}

interface WizardData {
  newConnection: boolean;
  serverType: string;
  project: string;
  deploymentName: string;
  makeAvailableExternal: boolean;
  requireTokenAuth: boolean;
  useServiceAccount: boolean;
  serviceAccountName: string;
  createServiceAccount: boolean;
  roleToBind: string;
  containerImage: string;
  args: string[];
  secretMounts: SecretMount[];
  labels: LabelOrAnnotation[];
  annotations: LabelOrAnnotation[];
  envVars: EnvVar[];
  transportType: string;
}

export interface DeployMCPServerModalInitialState {
  containerImage?: string;
  mcpServerName?: string;
  version?: string;
  serverSlug?: string;
  deploymentName?: string;
}

export interface DeployMCPServerModalProps {
  /** When true, render inside a Modal over the current page instead of as a full-page wizard */
  embedInModal?: boolean;
  /** Initial state when embedInModal (replaces location.state) */
  initialLocationState?: DeployMCPServerModalInitialState;
  /** Called when the user closes the modal or cancels. When closing from the form (before deploy), receives current extraYaml so the parent can save it. */
  onClose?: (formState?: { extraYaml: string }) => void;
  /** Optional saved form state to restore when embedInModal (e.g. after user closed without deploying). */
  savedFormState?: { extraYaml?: string } | null;
  /** Called when deploy succeeds; receives the same state that would be passed to navigate. extraYaml is the optional freeform YAML from the simplified modal. fromEmbedModal tells the deployments page to skip the progress modal. */
  onDeploySuccess?: (state: { newDeployment: { id: string; userName: string; mcpServerName: string; version: string; created: string; status: string; endpoint: string; apiKey: string }; extraYaml?: string; fromEmbedModal?: boolean }) => void;
}

const getAnimationStyle = (isVisible: boolean) => ({
  opacity: isVisible ? 1 : 0,
  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
});

interface AnimatedStepContentProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const AnimatedStepContent: React.FunctionComponent<AnimatedStepContentProps> = ({
  title,
  description,
  children,
}) => {
  const [animationState, setAnimationState] = React.useState({
    header: false,
    description: false,
    content: false,
  });

  React.useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    timeouts.push(setTimeout(() => setAnimationState((prev) => ({ ...prev, header: true })), 50));
    timeouts.push(setTimeout(() => setAnimationState((prev) => ({ ...prev, description: true })), 150));
    timeouts.push(setTimeout(() => setAnimationState((prev) => ({ ...prev, content: true })), 250));
    return () => timeouts.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          ...getAnimationStyle(animationState.header),
        }}
      >
        {title}
      </h2>
      <p
        style={{
          marginBottom: '1.5rem',
          color: 'var(--pf-v5-global--Color--200)',
          ...getAnimationStyle(animationState.description),
        }}
      >
        {description}
      </p>
      <div style={getAnimationStyle(animationState.content)}>{children}</div>
    </div>
  );
};

const DeployMCPServerModal: React.FunctionComponent<DeployMCPServerModalProps> = ({
  embedInModal = false,
  initialLocationState: propsInitialState,
  onClose: propsOnClose,
  onDeploySuccess: propsOnDeploySuccess,
  savedFormState: propsSavedFormState,
}) => {
  useDocumentTitle(embedInModal ? undefined : 'Deploy MCP server');
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedProject } = useFeatureFlags();

  const locationState = embedInModal
    ? (propsInitialState ?? {})
    : (location.state as DeployMCPServerModalInitialState | undefined) ?? {};
  const initialContainerImage = locationState?.containerImage ?? '';
  const initialMcpServerName = locationState?.mcpServerName;
  const initialVersion = locationState?.version;
  const serverSlug = locationState?.serverSlug;
  const initialDeploymentName = locationState?.deploymentName;

  const namePlaceholder =
    initialMcpServerName
      ? `${initialMcpServerName.toLowerCase().replace(/\s+/g, '-')}-deployment`
      : 'servicenow-mcp-deployment';

  const savedExtraYaml = embedInModal && propsSavedFormState?.extraYaml != null ? propsSavedFormState.extraYaml : '';
  const initialExtraYaml =
    savedExtraYaml !== ''
      ? savedExtraYaml
      : serverSlug
        ? getDefaultYamlFromCatalog(serverSlug)
        : '';
  const initialProject = embedInModal
    ? (['Project X', 'Project Y'].includes(selectedProject) ? selectedProject : 'Project X')
    : selectedProject;

  const [wizardData, setWizardData] = React.useState<WizardData>({
    newConnection: false,
    serverType: 'MCP SSE server',
    project: initialProject,
    deploymentName: initialDeploymentName ?? (initialMcpServerName ? `${initialMcpServerName.toLowerCase().replace(/\s+/g, '-')}-deployment` : 'servicenow-mcp-v1'),
    makeAvailableExternal: false,
    requireTokenAuth: false,
    useServiceAccount: true,
    serviceAccountName: 'default',
    createServiceAccount: false,
    roleToBind: 'view',
    containerImage: initialContainerImage,
    args: [],
    secretMounts: [],
    labels: [],
    annotations: [],
    envVars: [],
    transportType: 'http',
  });
  const [isProjectOpen, setIsProjectOpen] = React.useState(false);
  const [isTransportSelectOpen, setIsTransportSelectOpen] = React.useState(false);
  const [isRoleSelectOpen, setIsRoleSelectOpen] = React.useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = React.useState(false);
  const [extraYaml, setExtraYaml] = React.useState(initialExtraYaml);
  type DeployPhase = 'form' | 'deploying' | 'success';
  const [deployPhase, setDeployPhase] = React.useState<DeployPhase>('form');
  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  };

  const handleClose = () => {
    if (embedInModal && propsOnClose) {
      setDeployPhase('form');
      if (deployPhase === 'form') {
        propsOnClose({ extraYaml });
      } else {
        propsOnClose();
      }
      return;
    }
    if (serverSlug) {
      navigate(`/ai-hub/mcp/catalog/${serverSlug}`);
    } else {
      navigate(-1);
    }
  };

  const buildDeployState = () => {
    const mcpServerName =
      initialMcpServerName ||
      (() => {
        const imagePart = wizardData.containerImage.split('/').pop()?.split(':')[0] || '';
        return imagePart ? imagePart.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'MCP Server';
      })();
    const version =
      initialVersion ||
      (() => {
        const parts = wizardData.containerImage.split(':');
        return parts.length > 1 ? parts[1] : '1.0.0';
      })();

    const deploymentName = wizardData.deploymentName?.trim() || `${mcpServerName} deployment`;
    const nameSlug = deploymentName.toLowerCase().replace(/\s+/g, '-');
    const endpointPort = 8080;
    const endpoint = `${nameSlug}:${endpointPort}`;
    const apiKey = `sk-${nameSlug}-${Date.now().toString(36)}`;

    return {
      newDeployment: {
        id: `new-${Date.now()}`,
        userName: deploymentName,
        mcpServerName,
        version,
        created: new Date().toISOString(),
        status: 'Running',
        endpoint,
        apiKey,
      },
    };
  };

  const handleDeploy = () => {
    const state = buildDeployState();
    if (embedInModal && propsOnDeploySuccess && propsOnClose) {
      const stateWithExtra = { ...state, extraYaml: extraYaml.trim() || undefined };
      const payload = {
        ...stateWithExtra,
        fromEmbedModal: true,
        newDeployment: { ...stateWithExtra.newDeployment, status: 'Pending' as const },
      };
      propsOnDeploySuccess(payload);
      propsOnClose();
      return;
    }
    navigate('/ai-hub/mcp/deployments', { state });
  };

  const handleReset = () => {
    if (embedInModal) {
      setExtraYaml(serverSlug ? getDefaultYamlFromCatalog(serverSlug) : '');
      updateWizardData({ project: initialProject });
    }
  };

  const addEnvVar = () => {
    updateWizardData({ envVars: [...wizardData.envVars, { key: '', value: '' }] });
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...wizardData.envVars];
    updated[index] = { ...updated[index], [field]: value };
    updateWizardData({ envVars: updated });
  };

  const removeEnvVar = (index: number) => {
    updateWizardData({ envVars: wizardData.envVars.filter((_, i) => i !== index) });
  };

  const addArg = () => updateWizardData({ args: [...wizardData.args, ''] });
  const updateArg = (index: number, value: string) => {
    const updated = [...wizardData.args];
    updated[index] = value;
    updateWizardData({ args: updated });
  };
  const removeArg = (index: number) => updateWizardData({ args: wizardData.args.filter((_, i) => i !== index) });

  const addSecretMount = () => updateWizardData({ secretMounts: [...wizardData.secretMounts, { secretName: '', mountPath: '' }] });
  const updateSecretMount = (index: number, field: 'secretName' | 'mountPath', value: string) => {
    const updated = [...wizardData.secretMounts];
    updated[index] = { ...updated[index], [field]: value };
    updateWizardData({ secretMounts: updated });
  };
  const removeSecretMount = (index: number) => updateWizardData({ secretMounts: wizardData.secretMounts.filter((_, i) => i !== index) });

  const addLabel = () => updateWizardData({ labels: [...wizardData.labels, { key: '', value: '' }] });
  const updateLabel = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...wizardData.labels];
    updated[index] = { ...updated[index], [field]: value };
    updateWizardData({ labels: updated });
  };
  const removeLabel = (index: number) => updateWizardData({ labels: wizardData.labels.filter((_, i) => i !== index) });

  const addAnnotation = () => updateWizardData({ annotations: [...wizardData.annotations, { key: '', value: '' }] });
  const updateAnnotation = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...wizardData.annotations];
    updated[index] = { ...updated[index], [field]: value };
    updateWizardData({ annotations: updated });
  };
  const removeAnnotation = (index: number) => updateWizardData({ annotations: wizardData.annotations.filter((_, i) => i !== index) });

  // Step 1: Source and deployment configuration
  const sourceAndDeploymentStep = (
    <Form>
      <FormGroup label="OCI image URI" isRequired>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              The container image to deploy. Must be a valid image reference (e.g. quay.io/org/servicenow-mcp:1.0.0).
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        <TextInput
          id="deploy-mcp-server-container-image"
          value={wizardData.containerImage}
          isDisabled
          placeholder="quay.io/org/servicenow-mcp:1.0.0"
          aria-label="OCI image URI"
        />
      </FormGroup>

      <FormGroup label="Project" isRequired>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              This is the Red Hat OpenShift AI project where the MCP server will be available.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        <Select
          id="deploy-mcp-server-project-select"
          isOpen={isProjectOpen}
          selected={wizardData.project}
          onSelect={(_event, value) => {
            updateWizardData({ project: value as string });
            setIsProjectOpen(false);
          }}
          onOpenChange={(isOpen) => setIsProjectOpen(isOpen)}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setIsProjectOpen(!isProjectOpen)}
              isExpanded={isProjectOpen}
              style={{ width: '100%' }}
              aria-label="Project"
            >
              {wizardData.project || 'Select target project'}
            </MenuToggle>
          )}
        >
          <SelectList>
            <SelectOption value="Project X">Project X</SelectOption>
            <SelectOption value="Project Y">Project Y</SelectOption>
          </SelectList>
        </Select>
      </FormGroup>

      <FormGroup label="Name">
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Name this deployment for your own reference.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        <TextInput
          id="deploy-mcp-server-name"
          value={wizardData.deploymentName}
          onChange={(_event, value) => updateWizardData({ deploymentName: value })}
          placeholder={namePlaceholder}
          aria-label="Name"
        />
      </FormGroup>
    </Form>
  );

  // Step 2: Service account
  const serviceAccountStep = (
    <Form>
      <FormGroup>
        <Checkbox
          id="deploy-mcp-server-use-sa"
          label="Use a service account"
          isChecked={wizardData.useServiceAccount}
          onChange={(_event, checked) => updateWizardData({ useServiceAccount: checked })}
          aria-label="Use a service account"
        />
      </FormGroup>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: wizardData.useServiceAccount ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease-out',
          overflow: 'hidden',
        }}
      >
        <div style={{ minHeight: 0, overflow: 'hidden' }}>
          <FormGroup label="Service account name">
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  The service account the MCP server pod will run as. Must exist in the selected project.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
            <TextInput
              id="deploy-mcp-server-service-account"
              value={wizardData.serviceAccountName}
              onChange={(_event, value) => updateWizardData({ serviceAccountName: value })}
              placeholder="default"
              aria-label="Service account name"
            />
          </FormGroup>

          <FormGroup style={{ marginTop: '1rem' }}>
            <Checkbox
              id="deploy-mcp-server-create-sa"
              label="Create service account if it does not exist"
              isChecked={wizardData.createServiceAccount}
              onChange={(_event, checked) => updateWizardData({ createServiceAccount: checked })}
              aria-label="Create service account if it does not exist"
            />
          </FormGroup>

          {wizardData.createServiceAccount && (
            <FormGroup label="Role to bind" style={{ marginTop: '1rem' }}>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    ClusterRole to bind to the new service account. Determines what API access the MCP server has.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
              <Select
                id="deploy-mcp-server-role-select"
                isOpen={isRoleSelectOpen}
                selected={wizardData.roleToBind}
                onSelect={(_event, value) => {
                  updateWizardData({ roleToBind: value as string });
                  setIsRoleSelectOpen(false);
                }}
                onOpenChange={(isOpen) => setIsRoleSelectOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsRoleSelectOpen(!isRoleSelectOpen)}
                    isExpanded={isRoleSelectOpen}
                    style={{ width: '100%' }}
                    aria-label="Role to bind"
                  >
                    {wizardData.roleToBind}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="view">view</SelectOption>
                  <SelectOption value="edit">edit</SelectOption>
                  <SelectOption value="admin">admin</SelectOption>
                </SelectList>
              </Select>
            </FormGroup>
          )}
        </div>
      </div>
    </Form>
  );

  // Step 3: Transport
  const transportStep = (
    <Form>
      <FormGroup label="Transport type">
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              The transport protocol used by the MCP server.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        <Select
          id="deploy-mcp-server-transport-select"
          isOpen={isTransportSelectOpen}
          selected={wizardData.transportType}
          onSelect={(_event, value) => {
            updateWizardData({ transportType: value as string });
            setIsTransportSelectOpen(false);
          }}
          onOpenChange={(isOpen) => setIsTransportSelectOpen(isOpen)}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              onClick={() => setIsTransportSelectOpen(!isTransportSelectOpen)}
              isExpanded={isTransportSelectOpen}
              style={{ width: '100%' }}
              aria-label="Transport type"
            >
              {wizardData.transportType === 'http' ? 'streamable http' : wizardData.transportType}
            </MenuToggle>
          )}
        >
          <SelectList>
            <SelectOption value="stdio">stdio</SelectOption>
            <SelectOption value="http">streamable http</SelectOption>
            <SelectOption value="sse">sse</SelectOption>
          </SelectList>
        </Select>
      </FormGroup>
    </Form>
  );

  // Step 3: Environment variables
  const envVarsStep = (
    <Form>
      <FormGroup label="Environment variables">
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Optional environment variables to pass to the MCP server at runtime.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        {wizardData.envVars.map((envVar, index) => (
          <Flex key={`env-var-${index}`} gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsFlexEnd' }} style={{ marginBottom: '0.5rem' }}>
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                id={`deploy-mcp-env-key-${index}`}
                value={envVar.key}
                onChange={(_event, value) => updateEnvVar(index, 'key', value)}
                placeholder="Key"
                aria-label={`Environment variable key ${index + 1}`}
              />
            </FlexItem>
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                id={`deploy-mcp-env-value-${index}`}
                value={envVar.value}
                onChange={(_event, value) => updateEnvVar(index, 'value', value)}
                placeholder="Value"
                aria-label={`Environment variable value ${index + 1}`}
              />
            </FlexItem>
            <FlexItem>
              <Button
                variant="plain"
                onClick={() => removeEnvVar(index)}
                aria-label={`Remove environment variable ${index + 1}`}
                id={`deploy-mcp-env-remove-${index}`}
              >
                <TrashIcon />
              </Button>
            </FlexItem>
          </Flex>
        ))}
        <div style={{ marginTop: '1rem' }}>
          <Button
            variant="link"
            isInline
            onClick={addEnvVar}
            id="deploy-mcp-env-add"
          >
            <PlusIcon style={{ marginRight: '0.25rem' }} />
            Add variable
          </Button>
        </div>
      </FormGroup>
    </Form>
  );

  // Step 4: Advanced configuration (Args, Secret mounts, Labels, Annotations)
  const advancedStep = (
    <Form>
      <FormGroup label="Container arguments">
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Optional arguments passed to the container entrypoint.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        {wizardData.args.map((arg, index) => (
          <Flex key={`arg-${index}`} gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsFlexEnd' }} style={{ marginBottom: '0.5rem' }}>
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                id={`deploy-mcp-arg-${index}`}
                value={arg}
                onChange={(_event, value) => updateArg(index, value)}
                placeholder="Argument"
                aria-label={`Container argument ${index + 1}`}
              />
            </FlexItem>
            <FlexItem>
              <Button
                variant="plain"
                onClick={() => removeArg(index)}
                aria-label={`Remove argument ${index + 1}`}
                id={`deploy-mcp-arg-remove-${index}`}
              >
                <TrashIcon />
              </Button>
            </FlexItem>
          </Flex>
        ))}
        <div style={{ marginTop: '1rem' }}>
          <Button variant="link" isInline onClick={addArg} id="deploy-mcp-arg-add">
            <PlusIcon style={{ marginRight: '0.25rem' }} />
            Add argument
          </Button>
        </div>
      </FormGroup>

      <FormGroup label="Secret mounts">
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Mount secrets as volumes. Specify the secret name and the mount path in the container.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        {wizardData.secretMounts.map((mount, index) => (
          <Flex key={`secret-${index}`} gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsFlexEnd' }} style={{ marginBottom: '0.5rem' }}>
            <FlexItem>
              <TextInput
                id={`deploy-mcp-secret-name-${index}`}
                value={mount.secretName}
                onChange={(_event, value) => updateSecretMount(index, 'secretName', value)}
                placeholder="Secret name"
                aria-label={`Secret name ${index + 1}`}
                style={{ minWidth: '140px' }}
              />
            </FlexItem>
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                id={`deploy-mcp-secret-path-${index}`}
                value={mount.mountPath}
                onChange={(_event, value) => updateSecretMount(index, 'mountPath', value)}
                placeholder="/path/to/mount"
                aria-label={`Mount path ${index + 1}`}
              />
            </FlexItem>
            <FlexItem>
              <Button
                variant="plain"
                onClick={() => removeSecretMount(index)}
                aria-label={`Remove secret mount ${index + 1}`}
                id={`deploy-mcp-secret-remove-${index}`}
              >
                <TrashIcon />
              </Button>
            </FlexItem>
          </Flex>
        ))}
        <div style={{ marginTop: '1rem' }}>
          <Button variant="link" isInline onClick={addSecretMount} id="deploy-mcp-secret-add">
            <PlusIcon style={{ marginRight: '0.25rem' }} />
            Add secret mount
          </Button>
        </div>
      </FormGroup>

      <FormGroup label="Labels">
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Labels applied to the deployment and pods for identification and selection.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        {wizardData.labels.map((label, index) => (
          <Flex key={`label-${index}`} gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsFlexEnd' }} style={{ marginBottom: '0.5rem' }}>
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                id={`deploy-mcp-label-key-${index}`}
                value={label.key}
                onChange={(_event, value) => updateLabel(index, 'key', value)}
                placeholder="Key"
                aria-label={`Label key ${index + 1}`}
              />
            </FlexItem>
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                id={`deploy-mcp-label-value-${index}`}
                value={label.value}
                onChange={(_event, value) => updateLabel(index, 'value', value)}
                placeholder="Value"
                aria-label={`Label value ${index + 1}`}
              />
            </FlexItem>
            <FlexItem>
              <Button
                variant="plain"
                onClick={() => removeLabel(index)}
                aria-label={`Remove label ${index + 1}`}
                id={`deploy-mcp-label-remove-${index}`}
              >
                <TrashIcon />
              </Button>
            </FlexItem>
          </Flex>
        ))}
        <div style={{ marginTop: '1rem' }}>
          <Button variant="link" isInline onClick={addLabel} id="deploy-mcp-label-add">
            <PlusIcon style={{ marginRight: '0.25rem' }} />
            Add label
          </Button>
        </div>
      </FormGroup>

      <FormGroup label="Annotations">
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              Annotations for metadata. Not used for selection but can store configuration.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
        {wizardData.annotations.map((ann, index) => (
          <Flex key={`ann-${index}`} gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsFlexEnd' }} style={{ marginBottom: '0.5rem' }}>
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                id={`deploy-mcp-annotation-key-${index}`}
                value={ann.key}
                onChange={(_event, value) => updateAnnotation(index, 'key', value)}
                placeholder="Key"
                aria-label={`Annotation key ${index + 1}`}
              />
            </FlexItem>
            <FlexItem grow={{ default: 'grow' }}>
              <TextInput
                id={`deploy-mcp-annotation-value-${index}`}
                value={ann.value}
                onChange={(_event, value) => updateAnnotation(index, 'value', value)}
                placeholder="Value"
                aria-label={`Annotation value ${index + 1}`}
              />
            </FlexItem>
            <FlexItem>
              <Button
                variant="plain"
                onClick={() => removeAnnotation(index)}
                aria-label={`Remove annotation ${index + 1}`}
                id={`deploy-mcp-annotation-remove-${index}`}
              >
                <TrashIcon />
              </Button>
            </FlexItem>
          </Flex>
        ))}
        <div style={{ marginTop: '1rem' }}>
          <Button variant="link" isInline onClick={addAnnotation} id="deploy-mcp-annotation-add">
            <PlusIcon style={{ marginRight: '0.25rem' }} />
            Add annotation
          </Button>
        </div>
      </FormGroup>
    </Form>
  );

  // Step 5: Summary
  const summaryStep = (
    <>
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>OCI image URI</DescriptionListTerm>
          <DescriptionListDescription>{wizardData.containerImage || 'Not specified'}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Transport type</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.transportType === 'http' ? 'streamable http' : wizardData.transportType}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Project</DescriptionListTerm>
          <DescriptionListDescription>{wizardData.project}</DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Deployment name</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.deploymentName || 'Not specified'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup>
          <DescriptionListTerm>Service account</DescriptionListTerm>
          <DescriptionListDescription>
            {wizardData.useServiceAccount
              ? wizardData.serviceAccountName
              : 'Default (project default)'}
          </DescriptionListDescription>
        </DescriptionListGroup>

        {wizardData.useServiceAccount && wizardData.createServiceAccount && (
          <DescriptionListGroup>
            <DescriptionListTerm>Role to bind</DescriptionListTerm>
            <DescriptionListDescription>{wizardData.roleToBind}</DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.envVars.some((ev) => ev.key.trim() || ev.value.trim()) && (
          <DescriptionListGroup>
            <DescriptionListTerm>Environment variables</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.envVars
                .filter((ev) => ev.key.trim() || ev.value.trim())
                .map((ev) => `${ev.key}=${ev.value}`)
                .join(', ')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.args.some((a) => a.trim()) && (
          <DescriptionListGroup>
            <DescriptionListTerm>Arguments</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.args.filter((a) => a.trim()).join(', ')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.secretMounts.some((s) => s.secretName.trim() || s.mountPath.trim()) && (
          <DescriptionListGroup>
            <DescriptionListTerm>Secret mounts</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.secretMounts
                .filter((s) => s.secretName.trim() || s.mountPath.trim())
                .map((s) => `${s.secretName} → ${s.mountPath}`)
                .join('; ')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.labels.some((l) => l.key.trim() || l.value.trim()) && (
          <DescriptionListGroup>
            <DescriptionListTerm>Labels</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.labels
                .filter((l) => l.key.trim() || l.value.trim())
                .map((l) => `${l.key}=${l.value}`)
                .join(', ')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}

        {wizardData.annotations.some((a) => a.key.trim() || a.value.trim()) && (
          <DescriptionListGroup>
            <DescriptionListTerm>Annotations</DescriptionListTerm>
            <DescriptionListDescription>
              {wizardData.annotations
                .filter((a) => a.key.trim() || a.value.trim())
                .map((a) => `${a.key}=${a.value}`)
                .join(', ')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
      </DescriptionList>

    </>
  );

  const wizardContent = (
    <Wizard onClose={handleClose} id="deploy-mcp-server-wizard">
          <WizardStep
            name="Source and deployment"
            id="deploy-mcp-source-step"
            body={{ hasNoPadding: false }}
          >
            <AnimatedStepContent
              title="Source and deployment"
              description="Configure the MCP server source and where it will be deployed."
            >
              {sourceAndDeploymentStep}
            </AnimatedStepContent>
          </WizardStep>

          <WizardStep
            name="Service account"
            id="deploy-mcp-service-account-step"
            body={{ hasNoPadding: false }}
          >
            <AnimatedStepContent
              title="Service account"
              description="Optionally configure a service account for the MCP server pod."
            >
              {serviceAccountStep}
            </AnimatedStepContent>
          </WizardStep>

          <WizardStep
            name="Transport"
            id="deploy-mcp-transport-step"
            body={{ hasNoPadding: false }}
          >
            <AnimatedStepContent
              title="Transport"
              description="Configure the transport type for the MCP server."
            >
              {transportStep}
            </AnimatedStepContent>
          </WizardStep>

          <WizardStep
            name="Environment variables"
            id="deploy-mcp-env-step"
            body={{ hasNoPadding: false }}
          >
            <AnimatedStepContent
              title="Environment variables"
              description="Add optional environment variables for the MCP server."
            >
              {envVarsStep}
            </AnimatedStepContent>
          </WizardStep>

          <WizardStep
            name="Advanced"
            id="deploy-mcp-advanced-step"
            body={{ hasNoPadding: false }}
          >
            <AnimatedStepContent
              title="Advanced configuration"
              description="Optional container arguments, secret mounts, labels, and annotations."
            >
              {advancedStep}
            </AnimatedStepContent>
          </WizardStep>

          <WizardStep
            name="Summary"
            id="deploy-mcp-summary-step"
            footer={{ nextButtonText: 'Deploy', onNext: handleDeploy }}
            body={{ hasNoPadding: false }}
          >
            <AnimatedStepContent
              title="Summary"
              description="Review your configuration before deploying."
            >
              {summaryStep}
            </AnimatedStepContent>
          </WizardStep>
        </Wizard>
  );

  if (embedInModal) {
    return (
      <>
        <Modal
          variant={ModalVariant.medium}
          isOpen
          onClose={handleClose}
          id="deploy-mcp-server-embed-modal"
          aria-label="Deploy MCP server"
        >
          <ModalHeader title="Deploy MCP server" />
          <ModalBody>
            <Form>
              <FormGroup
                label="OCI image"
                labelHelp={
                  <Popover
                    bodyContent="This is the container image that was selected from the MCP catalog. Return to the catalog to change this selection."
                    id="deploy-mcp-modal-oci-image-popover"
                    aria-label="OCI image information"
                  >
                    <FormGroupLabelHelp aria-label="More info for OCI image field" aria-describedby="deploy-mcp-modal-container-image" id="deploy-mcp-modal-oci-image-help" />
                  </Popover>
                }
                isRequired
              >
                <div style={{ maxWidth: '75%' }}>
                  <TextInput
                    id="deploy-mcp-modal-container-image"
                    value={wizardData.containerImage}
                    isDisabled
                    aria-label="OCI image URI"
                  />
                </div>
              </FormGroup>
              <FormGroup label="Project" isRequired fieldId="deploy-mcp-modal-project">
                <div style={{ maxWidth: '75%' }}>
                  <Select
                    id="deploy-mcp-modal-project-select"
                    isOpen={isProjectOpen}
                    selected={wizardData.project}
                    onSelect={(_event, value) => {
                      updateWizardData({ project: value as string });
                      setIsProjectOpen(false);
                    }}
                    onOpenChange={(isOpen) => setIsProjectOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setIsProjectOpen(!isProjectOpen)}
                        isExpanded={isProjectOpen}
                        style={{ width: '100%' }}
                        aria-label="Project"
                      >
                        {wizardData.project}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="Project X">Project X</SelectOption>
                      <SelectOption value="Project Y">Project Y</SelectOption>
                    </SelectList>
                  </Select>
                </div>
              </FormGroup>
              <FormGroup
                label="Configuration (YAML)"
                fieldId="deploy-mcp-modal-extra-yaml"
                labelHelp={
                  <Popover
                    bodyContent="Prefilled from catalog metadata when available; you can adjust before deploying. This block is the spec fragment only (not the full CRD); it is merged into the MCPServer resource—image and project are set by the form. For more options, see the server documentation on the details page."
                    id="deploy-mcp-modal-extra-yaml-popover"
                    aria-label="Configuration YAML information"
                  >
                    <FormGroupLabelHelp aria-label="More info for Configuration (YAML) field" aria-describedby="deploy-mcp-modal-extra-yaml" id="deploy-mcp-modal-extra-yaml-help" />
                  </Popover>
                }
              >
                {serverSlug && getDefaultYamlFromCatalog(serverSlug) !== '' && (
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        Catalog supplies a production-ready template (secretKeyRef, dedicated SA). Edit as needed.
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                )}
                <CodeEditor
                  id="deploy-mcp-modal-extra-yaml"
                  isLineNumbersVisible
                  isMinimapVisible={false}
                  language={Language.yaml}
                  height="320px"
                  code={extraYaml}
                  onCodeChange={setExtraYaml}
                  aria-label="Configuration YAML"
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Flex
              id="deploy-mcp-server-embed-modal-footer"
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
              style={{ width: '100%' }}
            >
              <FlexItem>
                <Flex gap={{ default: 'gapMd' }}>
                  <FlexItem>
                    <Button variant="primary" onClick={handleDeploy} id="deploy-mcp-modal-deploy">
                      Deploy
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button variant="link" onClick={handleClose} id="deploy-mcp-modal-close-link" aria-label="Close deploy modal">
                      Close
                    </Button>
                  </FlexItem>
                </Flex>
              </FlexItem>
              <FlexItem>
                <Button variant="secondary" onClick={handleReset} id="deploy-mcp-modal-reset">
                  Reset
                </Button>
              </FlexItem>
            </Flex>
          </ModalFooter>
        </Modal>
        <Modal
          variant={ModalVariant.small}
          isOpen={isDocsModalOpen}
          onClose={() => setIsDocsModalOpen(false)}
          id="deploy-mcp-docs-coming-soon-modal"
        >
          <ModalHeader title="Coming soon" />
          <ModalBody>Documentation for configuring the MCP gateway will be available soon.</ModalBody>
          <ModalFooter>
            <Button variant="primary" onClick={() => setIsDocsModalOpen(false)} id="deploy-mcp-docs-modal-close">
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  }

  return (
    <>
      <PageSection>
        <Title headingLevel="h1" size="2xl">
          Deploy MCP server
        </Title>
      </PageSection>
      <PageSection hasBodyWrapper={false} type={PageSectionTypes.wizard} aria-label="Deploy MCP server wizard">
        {wizardContent}
      </PageSection>

      <Modal
        variant={ModalVariant.small}
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        id="deploy-mcp-docs-coming-soon-modal"
      >
        <ModalHeader title="Coming soon" />
        <ModalBody>Documentation for configuring the MCP gateway will be available soon.</ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsDocsModalOpen(false)} id="deploy-mcp-docs-modal-close">
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { DeployMCPServerModal };
