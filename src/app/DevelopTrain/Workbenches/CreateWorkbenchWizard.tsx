import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  ExpandableSection,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  Gallery,
  HelperText,
  HelperTextItem,
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
  Stack,
  StackItem,
  Switch,
  TextInput,
  Tooltip,
  Wizard,
  WizardStep,
} from '@patternfly/react-core';
import { MultiTypeaheadSelect, MultiTypeaheadSelectOption } from '@patternfly/react-templates';
import { EllipsisVIcon, InfoCircleIcon, PlusCircleIcon, TrashIcon, WrenchIcon } from '@patternfly/react-icons';

type WorkspaceKind = {
  id: string;
  name: string;
  type: string;
  isLegacyV1: boolean;
  baseImage: string;
  usageCount: number;
  isActive: boolean;
  description?: string;
  hidden?: boolean;
  iconUrl?: string;
  logoUrl?: string;
  images?: Array<{ name: string; workspaces: number }>;
  podConfigs?: Array<{ name: string; workspaces: number }>;
};

import './CreateWorkbenchWizard.css';

export interface CreateWorkbenchFormData {
  kind: WorkspaceKind | undefined;
  imageConfig: string | undefined;
  podConfig: string | undefined;
  properties: {
    workspaceName: string;
    homeDirectory: string;
    volumes: Array<{ pvcName: string; mountPath: string; readOnly: boolean }>;
    secrets: Array<{ secretName: string; mountPath: string; defaultMode: number }>;
  };
}

interface CreateWorkbenchWizardProps {
  onClose: () => void;
  onCreate: (data: CreateWorkbenchFormData) => void;
  workspaceKinds: WorkspaceKind[];
}

export const CreateWorkbenchWizard: React.FunctionComponent<CreateWorkbenchWizardProps> = ({
  onClose,
  onCreate,
  workspaceKinds,
}) => {
  const [data, setData] = useState<CreateWorkbenchFormData>({
    kind: undefined,
    imageConfig: undefined,
    podConfig: undefined,
    properties: {
      workspaceName: '',
      homeDirectory: '/home/jovyan/work',
      volumes: [],
      secrets: [],
    },
  });

  const [, setCurrentStepIndex] = useState(0);
  const [selectedKindId, setSelectedKindId] = useState<string>('');
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [selectedPodConfigId, setSelectedPodConfigId] = useState<string>('');

  // Properties step UI state (Kubeflow parity)
  const [isVolumesExpanded, setIsVolumesExpanded] = useState(false);
  const [isSecretsExpanded, setIsSecretsExpanded] = useState(false);

  // Volumes modals state
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
  const [isDetachVolumeModalOpen, setIsDetachVolumeModalOpen] = useState(false);
  const [volumeEditIndex, setVolumeEditIndex] = useState<number | null>(null);
  const [volumeDeleteIndex, setVolumeDeleteIndex] = useState<number | null>(null);
  const [volumeDropdownOpenIndex, setVolumeDropdownOpenIndex] = useState<number | null>(null);
  const [volumeForm, setVolumeForm] = useState<{ pvcName: string; mountPath: string; readOnly: boolean }>({
    pvcName: '',
    mountPath: '',
    readOnly: false,
  });

  // Secrets modals state
  const [isAttachSecretsModalOpen, setIsAttachSecretsModalOpen] = useState(false);
  const [isCreateSecretModalOpen, setIsCreateSecretModalOpen] = useState(false);
  const [isRemoveSecretModalOpen, setIsRemoveSecretModalOpen] = useState(false);
  const [secretDropdownOpenIndex, setSecretDropdownOpenIndex] = useState<number | null>(null);
  const [secretDeleteIndex, setSecretDeleteIndex] = useState<number | null>(null);

  const DEFAULT_SECRET_MODE = 420; // 0644
  const [attachSelectedSecrets, setAttachSelectedSecrets] = useState<string[]>([]);
  const [attachSecretsMountPath, setAttachSecretsMountPath] = useState('');
  const [attachSecretsDefaultMode, setAttachSecretsDefaultMode] = useState((DEFAULT_SECRET_MODE).toString(8));
  const [attachSecretsModeError, setAttachSecretsModeError] = useState<string | null>(null);
  const [attachSecretsDuplicateError, setAttachSecretsDuplicateError] = useState<string | null>(null);

  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretPairs, setNewSecretPairs] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [createSecretError, setCreateSecretError] = useState<string | null>(null);

  // Mock existing secrets list (until wired to real API) — mirrors Kubeflow's dropdown UX
  const availableSecrets = useMemo(
    () => [
      { name: 'aws-credentials', type: 'Opaque', immutable: false, canMount: true, mounts: ['wb-1', 'wb-3'] },
      { name: 'huggingface-token', type: 'Opaque', immutable: true, canMount: true, mounts: ['wb-2'] },
      { name: 'gcp-service-account', type: 'Opaque', immutable: false, canMount: false, mounts: [] },
      { name: 'postgres-connection', type: 'Opaque', immutable: false, canMount: true, mounts: ['wb-4', 'wb-5', 'wb-6'] },
      { name: 's3-readonly', type: 'Opaque', immutable: false, canMount: true, mounts: [] },
    ],
    []
  );

  const existingSecretKeys = useMemo(() => {
    const keys = new Set<string>();
    data.properties.secrets.forEach((s) => {
      keys.add(`${s.secretName}:${s.mountPath}`);
    });
    return keys;
  }, [data.properties.secrets]);

  const attachSecretOptions = useMemo<MultiTypeaheadSelectOption[]>(
    () =>
      availableSecrets.map((secret) => ({
        content: secret.name,
        value: secret.name,
        isDisabled: !secret.canMount,
        description: (
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <Stack>
                <StackItem>
                  <LabelGroup>
                    <Label isCompact>Type: {secret.type}</Label>
                    {secret.immutable && <Label isCompact>Immutable</Label>}
                    {!secret.canMount && <Label isCompact>Unmountable</Label>}
                  </LabelGroup>
                </StackItem>
                {secret.mounts.length > 0 && (
                  <StackItem style={{ marginLeft: '1.25ch', marginTop: '0.25rem' }}>
                    <Flex gap={{ default: 'gapXs' }}>
                      <FlexItem>Mounted to:</FlexItem>
                      <FlexItem>
                        <LabelGroup isCompact>
                          {secret.mounts.slice(0, 5).map((m) => (
                            <Label
                              key={m}
                              isCompact
                              variant="outline"
                              icon={
                                <WrenchIcon
                                  style={{
                                    color: 'var(--pf-v6-global--palette--teal-300, teal)',
                                    fontSize: '0.75rem',
                                  }}
                                />
                              }
                            >
                              {m}
                            </Label>
                          ))}
                          {secret.mounts.length > 5 && (
                            <Label isCompact variant="outline">
                              +{secret.mounts.length - 5} more
                            </Label>
                          )}
                        </LabelGroup>
                      </FlexItem>
                    </Flex>
                  </StackItem>
                )}
              </Stack>
            </FlexItem>
            <FlexItem>
              <Tooltip
                content={
                  <div>
                    <div>Created at: —</div>
                    <div>Updated at: —</div>
                  </div>
                }
              >
                <InfoCircleIcon />
              </Tooltip>
            </FlexItem>
          </Flex>
        ),
      })),
    [availableSecrets]
  );

  const handleKindSelect = useCallback(
    (kind: WorkspaceKind) => {
      setData((prev) => ({
        ...prev,
        kind,
        imageConfig: undefined,
        podConfig: undefined,
      }));
    },
    []
  );

  const handleKindChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const selectedId = event.currentTarget.id;
      setSelectedKindId(selectedId);
      const availableKinds = workspaceKinds.filter((kind) => !kind.hidden);
      const kind = availableKinds.find((k) => {
        const kId = k.id.replace(/ /g, '-');
        return kId === selectedId.replace('selectable-actions-item-', '');
      });
      if (kind) {
        handleKindSelect(kind);
      }
    },
    [workspaceKinds, handleKindSelect]
  );

  const handleImageSelect = useCallback((imageName: string) => {
    setData((prev) => ({
      ...prev,
      imageConfig: imageName,
    }));
  }, []);

  const handleImageChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const selectedId = event.currentTarget.id;
      setSelectedImageId(selectedId);
      const image = data.kind?.images?.find((img) => {
        const imgId = img.name.replace(/ /g, '-');
        return imgId === selectedId.replace('selectable-actions-item-', '');
      });
      if (image) {
        handleImageSelect(image.name);
      }
    },
    [data.kind?.images, handleImageSelect]
  );

  const handlePodConfigSelect = useCallback(
    (podConfigName: string | undefined) => {
      if (podConfigName) {
        setData((prev) => ({
          ...prev,
          podConfig: podConfigName,
        }));
      }
    },
    []
  );

  const handlePodConfigChange = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const selectedId = event.currentTarget.id;
      setSelectedPodConfigId(selectedId);
      const podConfigId = selectedId.replace('pod-config-selectable-', '');
      const properCaseName = podConfigId.charAt(0).toUpperCase() + podConfigId.slice(1);
      handlePodConfigSelect(properCaseName);
    },
    [handlePodConfigSelect]
  );

  const canGoToNextStep = useCallback(
    (stepIndex: number): boolean => {
      switch (stepIndex) {
        case 0: // KindSelection
          return !!data.kind;
        case 1: // ImageSelection
          return !!data.imageConfig;
        case 2: // PodConfigSelection
          return !!data.podConfig;
        case 3: // Properties
          return !!data.properties.workspaceName.trim();
        default:
          return false;
      }
    },
    [data]
  );

  const handleStepChange = useCallback(
    (_event: React.MouseEvent<HTMLButtonElement>, currentStep: any) => {
      const stepIds = ['step-kind-selection', 'step-image-selection', 'step-pod-config-selection', 'step-properties'];
      const stepId = currentStep?.id || currentStep?.name;
      const newIndex = stepIds.findIndex((id) => id === stepId);
      if (newIndex !== -1) {
        setCurrentStepIndex(newIndex);
      }
    },
    []
  );

  const handleSave = useCallback(() => onCreate(data), [data, onCreate]);

  const availableKinds = workspaceKinds.filter((kind) => !kind.hidden);

  useEffect(() => {
    if (!isAttachSecretsModalOpen) {
      return;
    }
    setAttachSelectedSecrets([]);
    setAttachSecretsMountPath('');
    setAttachSecretsDefaultMode((DEFAULT_SECRET_MODE).toString(8));
    setAttachSecretsModeError(null);
    setAttachSecretsDuplicateError(null);
  }, [isAttachSecretsModalOpen, DEFAULT_SECRET_MODE]);

  return (
    <Wizard onStepChange={handleStepChange} isVisitRequired onClose={onClose}>
        {/* Step 1: Workbench Template Selection */}
        <WizardStep
          name="Workbench Template"
          id="step-kind-selection"
          body={{ hasNoPadding: false }}
          footer={{ nextButtonText: 'Next', isNextDisabled: !canGoToNextStep(0) }}
        >
          <Gallery hasGutter aria-label="Selectable workbench template cards">
            {availableKinds.map((kind) => {
              const kindId = kind.id.replace(/ /g, '-');
              const selectableActionId = `selectable-actions-item-${kindId}`;
              
              return (
                <Card
                  key={kind.id}
                  isCompact
                  isSelectable
                  id={kindId}
                  isSelected={selectedKindId === selectableActionId}
                  onClick={() => {
                    const syntheticEvent = {
                      currentTarget: { id: selectableActionId }
                    } as React.FormEvent<HTMLInputElement>;
                    handleKindChange(syntheticEvent);
                  }}
                >
                  <CardHeader
                    selectableActions={{
                      selectableActionId: selectableActionId,
                      selectableActionAriaLabelledby: kindId,
                      name: 'workspace-kind-selection',
                      variant: 'single',
                      onChange: handleKindChange,
                      hasNoOffset: true,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', width: '100%' }}>
                      {(kind.logoUrl || kind.iconUrl) && (
                        <img
                          src={kind.logoUrl || kind.iconUrl}
                          alt={`${kind.name} logo`}
                          style={{ width: '54px', height: '54px', objectFit: 'contain', display: 'block' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <CardTitle>{kind.name}</CardTitle>
                      <div style={{ fontSize: '0.875rem', color: '#6a6e73', marginTop: '0.25rem' }}>{kind.description}</div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </Gallery>
        </WizardStep>

        {/* Step 2: Image Selection */}
        <WizardStep
          name="Image"
          id="step-image-selection"
          body={{ hasNoPadding: false }}
          footer={{ 
            nextButtonText: 'Next', 
            isNextDisabled: !canGoToNextStep(1),
          }}
        >
          <Gallery hasGutter aria-label="Selectable image cards">
            {data.kind?.images?.map((image) => {
              const imageId = image.name.replace(/ /g, '-');
              const selectableActionId = `selectable-actions-item-${imageId}`;
              
              return (
                <Card
                  key={image.name}
                  isCompact
                  isSelectable
                  id={imageId}
                  isSelected={selectedImageId === selectableActionId}
                  onClick={() => {
                    const syntheticEvent = {
                      currentTarget: { id: selectableActionId }
                    } as React.FormEvent<HTMLInputElement>;
                    handleImageChange(syntheticEvent);
                  }}
                >
                  <CardHeader
                    selectableActions={{
                      selectableActionId: selectableActionId,
                      selectableActionAriaLabelledby: imageId,
                      name: 'image-selection',
                      variant: 'single',
                      onChange: handleImageChange,
                      hasNoOffset: true,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', width: '100%' }}>
                      {(data.kind?.logoUrl || data.kind?.iconUrl) && (
                        <img
                          src={data.kind?.logoUrl || data.kind?.iconUrl}
                          alt={`${data.kind?.name || 'Workspace'} logo`}
                          style={{ width: '54px', height: '54px', objectFit: 'contain', display: 'block' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <CardTitle>{image.name}</CardTitle>
                      <div style={{ fontSize: '0.875rem', color: '#6a6e73', marginTop: '0.25rem' }}>{image.name}</div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </Gallery>
        </WizardStep>

        {/* Step 3: Pod Config Selection */}
        <WizardStep
          name="Pod Config"
          id="step-pod-config-selection"
          body={{ hasNoPadding: false }}
          footer={{ 
            nextButtonText: 'Next', 
            isNextDisabled: !canGoToNextStep(2),
          }}
        >
          <Gallery hasGutter aria-label="Selectable pod config cards">
            {(() => {
              const podConfigDetails: Record<string, { title: string; subtitle: string; cpu: string; memory: string }> = {
                'Tiny': { title: 'Tiny CPU', subtitle: 'Pod with 0.1 CPU, 128Mb RAM', cpu: '100m', memory: '128Mi' },
                'Small': { title: 'Small CPU', subtitle: 'Pod with 0.5 CPU, 512Mb RAM', cpu: '500m', memory: '512Mi' },
                'Standard': { title: 'Small CPU', subtitle: 'Pod with 0.5 CPU, 512Mb RAM', cpu: '500m', memory: '512Mi' },
                'Medium': { title: 'Medium CPU', subtitle: 'Pod with 2 CPU, 4GB RAM', cpu: '2', memory: '4Gi' },
                'Large': { title: 'Large CPU', subtitle: 'Pod with 4 CPU, 8GB RAM', cpu: '4', memory: '8Gi' },
              };

              const defaultConfigs = [
                { name: 'Tiny', workspaces: 0 },
                { name: 'Small', workspaces: 0 },
                { name: 'Medium', workspaces: 0 },
                { name: 'Large', workspaces: 0 }
              ];

              return defaultConfigs.map((podConfig) => {
                const podConfigId = `pod-config-card-${podConfig.name.replace(/ /g, '-').toLowerCase()}`;
                const selectableActionId = `pod-config-selectable-${podConfig.name.replace(/ /g, '-').toLowerCase()}`;
                const details = podConfigDetails[podConfig.name] || {
                  title: podConfig.name,
                  subtitle: `Pod config: ${podConfig.name}`,
                  cpu: '-',
                  memory: '-'
                };

                return (
                  <Card
                    key={podConfig.name}
                    isCompact
                    isSelectable
                    id={podConfigId}
                    isSelected={selectedPodConfigId === selectableActionId}
                    onClick={() => {
                      const syntheticEvent = {
                        currentTarget: { id: selectableActionId }
                      } as React.FormEvent<HTMLInputElement>;
                      handlePodConfigChange(syntheticEvent);
                    }}
                  >
                    <CardHeader
                      selectableActions={{
                        selectableActionId: selectableActionId,
                        selectableActionAriaLabelledby: podConfigId,
                        name: 'pod-config-selection',
                        variant: 'single',
                        onChange: handlePodConfigChange,
                        hasNoOffset: true,
                      }}
                    >
                      <CardTitle>{details.title}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <div style={{ marginBottom: '1.5rem' }}>{details.subtitle}</div>
                      <DescriptionList isHorizontal isCompact>
                        <DescriptionListGroup>
                          <DescriptionListTerm>CPU</DescriptionListTerm>
                          <DescriptionListDescription>{details.cpu}</DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Memory</DescriptionListTerm>
                          <DescriptionListDescription>{details.memory}</DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </CardBody>
                  </Card>
                );
              });
            })()}
          </Gallery>
        </WizardStep>

        {/* Step 4: Properties */}
        <WizardStep
          name="Properties"
          id="step-properties"
          body={{ hasNoPadding: false }}
          footer={{
            nextButtonText: 'Create',
            onNext: handleSave,
            isNextDisabled: !canGoToNextStep(3),
          }}
        >
          <div style={{ padding: 'var(--pf-v6-global--spacer--lg)', maxWidth: 960 }}>
                <Form id="create-workbench-properties-form">
                  <FormGroup label="Workspace Name" isRequired fieldId="workspace-name">
                    <TextInput
                      isRequired
                      type="text"
                      id="workspace-name"
                      name="workspace-name"
                      value={data.properties.workspaceName}
                      onChange={(_event, value) =>
                        setData((prev) => ({
                          ...prev,
                          properties: { ...prev.properties, workspaceName: value },
                        }))
                      }
                    />
                  </FormGroup>

                  <Divider />

                  <ExpandableSection
                    toggleText="Volumes"
                    onToggle={() => setIsVolumesExpanded((prev) => !prev)}
                    isExpanded={isVolumesExpanded}
                    isIndented
                  >
                    {isVolumesExpanded && (
                      <Form>
                        <FormGroup label="Home Directory" fieldId="home-directory">
                          <TextInput
                            type="text"
                            id="home-directory"
                            name="home-directory"
                            value={data.properties.homeDirectory}
                            onChange={(_event, value) =>
                              setData((prev) => ({
                                ...prev,
                                properties: { ...prev.properties, homeDirectory: value },
                              }))
                            }
                            placeholder="/home/jovyan/work"
                          />
                        </FormGroup>

                        <FormGroup fieldId="volumes-table" style={{ marginTop: '1rem' }}>
                          {data.properties.volumes.length > 0 && (
                            <table className="pf-v6-c-table pf-m-compact" aria-label="Volumes table">
                              <thead className="pf-v6-c-table__thead">
                                <tr className="pf-v6-c-table__tr">
                                  <th className="pf-v6-c-table__th">PVC Name</th>
                                  <th className="pf-v6-c-table__th">Mount Path</th>
                                  <th className="pf-v6-c-table__th">Read-only Access</th>
                                  <th className="pf-v6-c-table__th" aria-label="Actions" />
                                </tr>
                              </thead>
                              <tbody className="pf-v6-c-table__tbody">
                                {data.properties.volumes.map((v, index) => (
                                  <tr className="pf-v6-c-table__tr" key={`${v.pvcName}-${v.mountPath}-${index}`}>
                                    <td className="pf-v6-c-table__td">{v.pvcName}</td>
                                    <td className="pf-v6-c-table__td">{v.mountPath}</td>
                                    <td className="pf-v6-c-table__td">{v.readOnly ? 'Enabled' : 'Disabled'}</td>
                                    <td className="pf-v6-c-table__td pf-m-action">
                                      <Dropdown
                                        isOpen={volumeDropdownOpenIndex === index}
                                        onSelect={() => setVolumeDropdownOpenIndex(null)}
                                        toggle={(toggleRef) => (
                                          <MenuToggle
                                            ref={toggleRef}
                                            isExpanded={volumeDropdownOpenIndex === index}
                                            onClick={() =>
                                              setVolumeDropdownOpenIndex(volumeDropdownOpenIndex === index ? null : index)
                                            }
                                            variant="plain"
                                            aria-label="Volumes actions"
                                          >
                                            <EllipsisVIcon />
                                          </MenuToggle>
                                        )}
                                      >
                                        <DropdownList>
                                          <DropdownItem
                                            onClick={() => {
                                              setVolumeForm(v);
                                              setVolumeEditIndex(index);
                                              setIsVolumeModalOpen(true);
                                            }}
                                          >
                                            Edit
                                          </DropdownItem>
                                          <DropdownItem
                                            onClick={() => {
                                              setVolumeDeleteIndex(index);
                                              setIsDetachVolumeModalOpen(true);
                                            }}
                                          >
                                            Detach
                                          </DropdownItem>
                                        </DropdownList>
                                      </Dropdown>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}

                          <Button
                            variant="secondary"
                            onClick={() => {
                              setVolumeForm({ pvcName: '', mountPath: '', readOnly: false });
                              setVolumeEditIndex(null);
                              setIsVolumeModalOpen(true);
                            }}
                            style={{ marginTop: '0.5rem', width: 'fit-content' }}
                          >
                            Create Volume
                          </Button>
                        </FormGroup>
                      </Form>
                    )}
                  </ExpandableSection>

                  {!isVolumesExpanded && (
                    <div className="pf-v6-u-pl-xl pf-v6-u-pt-sm">
                      <div>Workspace volumes enable your project data to persist.</div>
                      <div className="pf-v6-u-font-size-sm pf-v6-u-pb-md">
                        <strong>{data.properties.volumes.length} added</strong>
                      </div>
                    </div>
                  )}

                  <ExpandableSection
                    toggleText="Secrets"
                    onToggle={() => setIsSecretsExpanded((prev) => !prev)}
                    isExpanded={isSecretsExpanded}
                    isIndented
                  >
                    {isSecretsExpanded && (
                      <FormGroup fieldId="secrets-table" style={{ marginTop: '1rem' }}>
                        {data.properties.secrets.length > 0 && (
                          <table className="pf-v6-c-table pf-m-compact" aria-label="Secrets table">
                            <thead className="pf-v6-c-table__thead">
                              <tr className="pf-v6-c-table__tr">
                                <th className="pf-v6-c-table__th">Secret Name</th>
                                <th className="pf-v6-c-table__th">Mount Path</th>
                                <th className="pf-v6-c-table__th">Default Mode</th>
                                <th className="pf-v6-c-table__th" aria-label="Actions" />
                              </tr>
                            </thead>
                            <tbody className="pf-v6-c-table__tbody">
                              {data.properties.secrets.map((s, index) => (
                                <tr className="pf-v6-c-table__tr" key={`${s.secretName}-${s.mountPath}-${index}`}>
                                  <td className="pf-v6-c-table__td">{s.secretName}</td>
                                  <td className="pf-v6-c-table__td">{s.mountPath}</td>
                                  <td className="pf-v6-c-table__td">{(s.defaultMode ?? DEFAULT_SECRET_MODE).toString(8)}</td>
                                  <td className="pf-v6-c-table__td pf-m-action">
                                    <Dropdown
                                      isOpen={secretDropdownOpenIndex === index}
                                      onSelect={() => setSecretDropdownOpenIndex(null)}
                                      toggle={(toggleRef) => (
                                        <MenuToggle
                                          ref={toggleRef}
                                          isExpanded={secretDropdownOpenIndex === index}
                                          onClick={() =>
                                            setSecretDropdownOpenIndex(secretDropdownOpenIndex === index ? null : index)
                                          }
                                          variant="plain"
                                          aria-label="Secrets actions"
                                        >
                                          <EllipsisVIcon />
                                        </MenuToggle>
                                      )}
                                    >
                                      <DropdownList>
                                        <DropdownItem
                                          onClick={() => {
                                            setSecretDeleteIndex(index);
                                            setIsRemoveSecretModalOpen(true);
                                          }}
                                        >
                                          Remove
                                        </DropdownItem>
                                      </DropdownList>
                                    </Dropdown>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          <Button variant="secondary" onClick={() => setIsAttachSecretsModalOpen(true)}>
                            Attach Existing Secrets
                          </Button>
                          <Button variant="secondary" onClick={() => setIsCreateSecretModalOpen(true)}>
                            Create New Secret
                          </Button>
                        </div>
                      </FormGroup>
                    )}
                  </ExpandableSection>

                  {!isSecretsExpanded && (
                    <div className="pf-v6-u_pl-xl pf-v6-u-mt-sm">
                      <div>Secrets enable your project to securely access and manage credentials.</div>
                      <div className="pf-v6-u-font-size-sm">
                        <strong>{data.properties.secrets.length} added</strong>
                      </div>
                    </div>
                  )}
                </Form>
          </div>

          {/* Volumes: create/edit */}
          <Modal
            isOpen={isVolumeModalOpen}
            onClose={() => setIsVolumeModalOpen(false)}
            variant={ModalVariant.small}
            aria-label="Volume modal"
          >
            <ModalHeader
              title={volumeEditIndex !== null ? 'Edit Volume' : 'Create Volume'}
              description="Add a volume and optionally connect it with an existing workspace."
            />
            <ModalBody>
              <Form>
                <FormGroup label="PVC Name" isRequired fieldId="pvc-name">
                  <TextInput
                    isRequired
                    type="text"
                    id="pvc-name"
                    value={volumeForm.pvcName}
                    onChange={(_e, val) => setVolumeForm((prev) => ({ ...prev, pvcName: val }))}
                  />
                </FormGroup>
                <FormGroup label="Mount Path" isRequired fieldId="mount-path">
                  <TextInput
                    isRequired
                    type="text"
                    id="mount-path"
                    value={volumeForm.mountPath}
                    onChange={(_e, val) => setVolumeForm((prev) => ({ ...prev, mountPath: val }))}
                  />
                </FormGroup>
                <FormGroup fieldId="readonly-access" className="pf-v6-u-pt-lg">
                  <Switch
                    id="readonly-access-switch"
                    label="Enable read-only access"
                    isChecked={volumeForm.readOnly}
                    onChange={() => setVolumeForm((prev) => ({ ...prev, readOnly: !prev.readOnly }))}
                  />
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  if (!volumeForm.pvcName || !volumeForm.mountPath) {
                    return;
                  }
                  setData((prev) => {
                    const volumes = [...prev.properties.volumes];
                    if (volumeEditIndex !== null) {
                      volumes[volumeEditIndex] = volumeForm;
                    } else {
                      volumes.push(volumeForm);
                    }
                    return { ...prev, properties: { ...prev.properties, volumes } };
                  });
                  setIsVolumeModalOpen(false);
                  setVolumeEditIndex(null);
                }}
                isDisabled={!volumeForm.pvcName || !volumeForm.mountPath}
              >
                {volumeEditIndex !== null ? 'Save' : 'Create'}
              </Button>
              <Button variant="link" onClick={() => setIsVolumeModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* Volumes: detach */}
          <Modal
            isOpen={isDetachVolumeModalOpen}
            onClose={() => setIsDetachVolumeModalOpen(false)}
            variant={ModalVariant.small}
            aria-label="Detach volume modal"
          >
            <ModalHeader
              title="Detach Volume?"
              description="The volume and all of its resources will be detached from the workspace."
            />
            <ModalFooter>
              <Button
                variant="danger"
                onClick={() => {
                  if (volumeDeleteIndex === null) {
                    return;
                  }
                  setData((prev) => ({
                    ...prev,
                    properties: {
                      ...prev.properties,
                      volumes: prev.properties.volumes.filter((_, i) => i !== volumeDeleteIndex),
                    },
                  }));
                  setIsDetachVolumeModalOpen(false);
                  setVolumeDeleteIndex(null);
                }}
              >
                Detach
              </Button>
              <Button variant="link" onClick={() => setIsDetachVolumeModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* Secrets: attach */}
          <Modal
            isOpen={isAttachSecretsModalOpen}
            onClose={() => setIsAttachSecretsModalOpen(false)}
            variant={ModalVariant.medium}
            aria-label="Attach existing secrets modal"
          >
            <ModalHeader title="Attach Existing Secrets" />
            <ModalBody>
              {attachSecretsDuplicateError && (
                <Alert variant={AlertVariant.danger} isInline title="Error">
                  {attachSecretsDuplicateError}
                </Alert>
              )}
              <Form>
                <FormGroup label="Secret" fieldId="secret-select">
                  <MultiTypeaheadSelect
                    initialOptions={attachSecretOptions}
                    menuHeight="15rem"
                    isScrollable
                    id="secret-select"
                    placeholder={
                      attachSelectedSecrets.length === 0
                        ? 'Select a secret'
                        : `${attachSelectedSecrets.length} selected`
                    }
                    noOptionsFoundMessage={(filter) => `No secret was found for "${filter}"`}
                    onSelectionChange={(_ev, selections) => {
                      setAttachSelectedSecrets(selections as string[]);
                      setAttachSecretsDuplicateError(null);
                    }}
                  />
                </FormGroup>
                <FormGroup label="Mount Path" isRequired fieldId="secret-mount-path">
                  <TextInput
                    isRequired
                    id="secret-mount-path"
                    value={attachSecretsMountPath}
                    onChange={(_e, val) => setAttachSecretsMountPath(val)}
                  />
                </FormGroup>
                <FormGroup label="Default Mode" isRequired fieldId="secret-default-mode">
                  <TextInput
                    isRequired
                    id="secret-default-mode"
                    value={attachSecretsDefaultMode}
                    onChange={(_e, val) => {
                      if (val.length > 3) {
                        return;
                      }
                      setAttachSecretsDefaultMode(val);
                      setAttachSecretsModeError(null);
                      setAttachSecretsDuplicateError(null);
                    }}
                    placeholder={(DEFAULT_SECRET_MODE).toString(8)}
                  />
                  {(attachSecretsModeError ||
                    (attachSecretsDefaultMode.length > 0 && attachSecretsDefaultMode.length < 3)) && (
                    <HelperText>
                      <HelperTextItem variant="error">
                        Must be a valid UNIX file system permission value (i.e. 644)
                      </HelperTextItem>
                    </HelperText>
                  )}
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  if (attachSelectedSecrets.length === 0 || !attachSecretsMountPath.trim()) {
                    return;
                  }
                  if (attachSecretsDefaultMode.length !== 3 || !/^[0-7]{3}$/.test(attachSecretsDefaultMode)) {
                    setAttachSecretsModeError('Invalid default mode');
                    return;
                  }

                  const mode = parseInt(attachSecretsDefaultMode, 8);
                  const mountPath = attachSecretsMountPath.trim().replace(/\/+$/, '');

                  // Duplicate detection (Kubeflow parity)
                  const duplicates: string[] = [];
                  attachSelectedSecrets.forEach((secretName) => {
                    const key = `${secretName}:${mountPath}`;
                    if (existingSecretKeys.has(key)) {
                      duplicates.push(secretName);
                    }
                  });
                  if (duplicates.length > 0) {
                    const secretList = duplicates.join(', ');
                    setAttachSecretsDuplicateError(
                      `The following secret${duplicates.length > 1 ? 's are' : ' is'} already mounted to "${mountPath}": ${secretList}`
                    );
                    return;
                  }

                  setData((prev) => ({
                    ...prev,
                    properties: {
                      ...prev.properties,
                      secrets: [
                        ...prev.properties.secrets,
                        ...attachSelectedSecrets.map((secretName) => ({ secretName, mountPath, defaultMode: mode })),
                      ],
                    },
                  }));
                  setIsAttachSecretsModalOpen(false);
                  setAttachSelectedSecrets([]);
                  setAttachSecretsMountPath('');
                  setAttachSecretsDefaultMode((DEFAULT_SECRET_MODE).toString(8));
                  setAttachSecretsModeError(null);
                  setAttachSecretsDuplicateError(null);
                }}
                isDisabled={!attachSecretsMountPath.trim() || attachSelectedSecrets.length === 0}
              >
                Attach
              </Button>
              <Button variant="link" onClick={() => setIsAttachSecretsModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* Secrets: create */}
          <Modal
            isOpen={isCreateSecretModalOpen}
            onClose={() => setIsCreateSecretModalOpen(false)}
            variant={ModalVariant.medium}
            aria-label="Create secret modal"
          >
            <ModalHeader title="Create Secret" />
            <ModalBody>
              {createSecretError && (
                <HelperText>
                  <HelperTextItem variant="error">{createSecretError}</HelperTextItem>
                </HelperText>
              )}
              <Form>
                <FormGroup
                  label="Secret name"
                  isRequired
                  fieldId="new-secret-name"
                >
                  <TextInput
                    isRequired
                    id="new-secret-name"
                    value={newSecretName}
                    onChange={(_e, val) => {
                      setNewSecretName(val);
                      setCreateSecretError(null);
                    }}
                  />
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem variant="default">
                        Must start and end with a letter or number. Valid characters include lowercase letters, numbers, and hyphens (-).
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                </FormGroup>

                <FormGroup label="Secret type" isRequired fieldId="secret-type">
                  <Select
                    isOpen={false}
                    selected="Opaque"
                    onSelect={() => undefined}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        id="secret-type-toggle"
                        isFullWidth
                        isDisabled
                        aria-label="Secret type"
                      >
                        Opaque
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="Opaque">Opaque</SelectOption>
                    </SelectList>
                  </Select>
                </FormGroup>

                <Divider />

                {newSecretPairs.map((pair, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
                    <FormGroup label="Key" isRequired fieldId={`secret-key-${idx}`} style={{ flex: 1 }}>
                      <TextInput
                        isRequired
                        id={`secret-key-${idx}`}
                        value={pair.key}
                        onChange={(_e, val) => {
                          setNewSecretPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, key: val } : p)));
                          setCreateSecretError(null);
                        }}
                      />
                    </FormGroup>
                    <FormGroup label="Value" isRequired fieldId={`secret-value-${idx}`} style={{ flex: 1 }}>
                      <TextInput
                        isRequired
                        id={`secret-value-${idx}`}
                        value={pair.value}
                        onChange={(_e, val) => {
                          setNewSecretPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, value: val } : p)));
                          setCreateSecretError(null);
                        }}
                      />
                    </FormGroup>
                    <Button
                      variant="plain"
                      aria-label="Remove key/value pair"
                      icon={<TrashIcon />}
                      isDisabled={newSecretPairs.length === 1}
                      onClick={() => setNewSecretPairs((prev) => prev.filter((_, i) => i !== idx))}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    onClick={() => setNewSecretPairs((prev) => [...prev, { key: '', value: '' }])}
                    style={{ paddingLeft: 0, marginTop: '0.5rem', width: 'fit-content' }}
                  >
                    Add key/value pair
                  </Button>
                </div>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  if (!newSecretName.trim()) {
                    setCreateSecretError('Secret name is required');
                    return;
                  }
                  for (let i = 0; i < newSecretPairs.length; i++) {
                    const p = newSecretPairs[i];
                    if (!p.key.trim() || !p.value.trim()) {
                      setCreateSecretError('All key/value pairs must be filled in');
                      return;
                    }
                  }

                  setData((prev) => ({
                    ...prev,
                    properties: {
                      ...prev.properties,
                      secrets: [
                        ...prev.properties.secrets,
                        {
                          secretName: newSecretName.trim(),
                          mountPath: `/secrets/${newSecretName.trim()}`,
                          defaultMode: DEFAULT_SECRET_MODE,
                        },
                      ],
                    },
                  }));

                  setIsCreateSecretModalOpen(false);
                  setNewSecretName('');
                  setNewSecretPairs([{ key: '', value: '' }]);
                  setCreateSecretError(null);
                }}
                isDisabled={!newSecretName.trim()}
              >
                Create
              </Button>
              <Button variant="link" onClick={() => setIsCreateSecretModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* Secrets: remove */}
          <Modal
            isOpen={isRemoveSecretModalOpen}
            onClose={() => setIsRemoveSecretModalOpen(false)}
            variant={ModalVariant.small}
            aria-label="Remove secret modal"
          >
            <ModalHeader title="Remove Secret?" description="The secret will be removed from the workspace." />
            <ModalFooter>
              <Button
                variant="danger"
                onClick={() => {
                  if (secretDeleteIndex === null) {
                    return;
                  }
                  setData((prev) => ({
                    ...prev,
                    properties: {
                      ...prev.properties,
                      secrets: prev.properties.secrets.filter((_, i) => i !== secretDeleteIndex),
                    },
                  }));
                  setIsRemoveSecretModalOpen(false);
                  setSecretDeleteIndex(null);
                }}
              >
                Remove
              </Button>
              <Button variant="link" onClick={() => setIsRemoveSecretModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </WizardStep>
    </Wizard>
  );
};
