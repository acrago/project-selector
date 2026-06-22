import * as React from 'react';
import {
  ActionGroup,
  Alert,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  Checkbox,
  CodeBlock,
  CodeBlockCode,
  Content,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormGroupLabelHelp,
  FormSection,
  Icon,
  Label,
  LabelGroup,
  List,
  ListItem,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Popover,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Tab,
  TabTitleText,
  Tabs,
  TextArea,
  TextInput,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { AngleRightIcon, DownloadIcon, ExternalLinkAltIcon, InfoCircleIcon, OutlinedQuestionCircleIcon, PlayIcon } from '@patternfly/react-icons';
import {
  Table,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { CreatePolicyFormData } from '../types';
import { getRelatedSubscriptions, mockPolicies, mockSubjectGroups, mockSubjectUsers } from '../mockData';
import { mockMaaSModels, mockSubscriptions } from '@app/Settings/Subscriptions/mockData';

interface SchemaProperty {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
  children?: SchemaProperty[];
}

interface ResourceSchema {
  apiVersion: string;
  kind: string;
  description: string;
  properties: SchemaProperty[];
}

const maasAuthPolicySchema: ResourceSchema = {
  apiVersion: 'maas.opendatahub.io/v1alpha1',
  kind: 'MaaSAuthPolicy',
  description: 'Defines who (OIDC subjects/groups/userid) can access specific Models. Creates an AuthPolicy for the MaaS API that allows authenticated users to list their available subscriptions and validates access when model requests are made.',
  properties: [
    { name: 'apiVersion', type: 'string', description: 'APIVersion defines the versioned schema.', required: true },
    { name: 'kind', type: 'string', description: 'Kind is a string value representing the REST resource.', required: true },
    {
      name: 'metadata',
      type: 'object',
      description: 'Standard object metadata.',
      required: true,
      children: [
        { name: 'name', type: 'string', description: 'Unique identifier for this policy.', required: true },
        { name: 'namespace', type: 'string', description: 'Namespace where the policy is created.', required: true },
      ],
    },
    {
      name: 'annotation',
      type: 'object',
      description: 'Annotations for display metadata.',
      children: [
        { name: 'display-name', type: 'string', description: 'Human-readable display name for the policy.' },
        { name: 'display-description', type: 'string', description: 'Human-readable description of the policy.' },
      ],
    },
    {
      name: 'spec',
      type: 'object',
      description: 'Specification of the authorization policy.',
      required: true,
      children: [
        {
          name: 'modelRefs',
          type: 'array',
          description: 'List of MaaSModelRef names this policy grants access to.',
          required: true,
          children: [
            { name: '(string)', type: 'string', description: 'Name of the MaaSModelRef.' },
          ],
        },
        {
          name: 'subjects',
          type: 'object',
          description: 'Who has access. Uses OR logic — any match grants access.',
          required: true,
          children: [
            {
              name: 'groups',
              type: 'array',
              description: 'List of groups granted access.',
              children: [
                { name: 'name', type: 'string', description: 'Name of the group.' },
              ],
            },
            {
              name: 'users',
              type: 'array',
              description: 'List of individual users granted access.',
              children: [
                { name: 'name', type: 'string', description: 'User ID or service account name.' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'object',
      description: 'Status of the authorization policy.',
      children: [
        { name: 'phase', type: 'string', description: 'Current phase of the policy.', enum: ['Pending', 'Active', 'Failed'] },
      ],
    },
  ],
};

const maasSubscriptionSchema: ResourceSchema = {
  apiVersion: 'maas.opendatahub.io/v1alpha1',
  kind: 'MaaSSubscription',
  description: 'Defines a subscription plan with per-model token rate limits and quotas. Subscriptions are owned by specific groups and a user must have both an AuthPolicy and Subscription to access model endpoints.',
  properties: [
    { name: 'apiVersion', type: 'string', description: 'APIVersion defines the versioned schema.', required: true },
    { name: 'kind', type: 'string', description: 'Kind is a string value representing the REST resource.', required: true },
    {
      name: 'metadata',
      type: 'object',
      description: 'Standard object metadata.',
      required: true,
      children: [
        { name: 'name', type: 'string', description: 'Unique identifier for this subscription.', required: true },
        { name: 'namespace', type: 'string', description: 'Namespace where the subscription is created.', required: true },
      ],
    },
    {
      name: 'spec',
      type: 'object',
      description: 'Specification of the desired subscription behavior.',
      required: true,
      children: [
        {
          name: 'owner',
          type: 'object',
          description: 'Owner specification defining which groups own this subscription.',
          required: true,
          children: [
            {
              name: 'groups',
              type: 'array',
              description: 'List of groups that own and can use this subscription.',
              required: true,
            },
          ],
        },
        {
          name: 'modelRefs',
          type: 'array',
          description: 'List of models included in this subscription with per-model token rate limits.',
          required: true,
        },
      ],
    },
  ],
};

interface YamlSample {
  id: string;
  title: string;
  description: string;
  yaml: string;
}

const maasAuthPolicySamples: YamlSample[] = [
  {
    id: 'basic-auth-policy',
    title: 'Basic Authorization Policy',
    description: 'Simple policy granting model access to specific groups.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSAuthPolicy
metadata:
  name: basic-model-access
  namespace: opendatahub
annotation:
  display-name: "Basic Model Access"
  display-description: "Access policy for data science team"
spec:
  modelRefs:
    - granite-3b-instruct
  subjects:
    groups:
      - name: "data-scientists"
status:
  phase: Active`,
  },
  {
    id: 'enterprise-auth-policy',
    title: 'Enterprise Access Policy',
    description: 'Multi-model, multi-group access policy for enterprise use.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSAuthPolicy
metadata:
  name: acme-corp-enterprise-access
  namespace: opendatahub
annotation:
  display-name: "ACME Corp Enterprise Access"
  display-description: "Enterprise-wide access to premium AI models"
spec:
  modelRefs:
    - granite-3b-instruct
    - gpt-4-turbo
  subjects:
    groups:
      - name: "acme-corp-ai-users"
      - name: "acme-data-science"
    users:
      - name: "service-account-a"
status:
  phase: Active`,
  },
];

const maasSubscriptionSamples: YamlSample[] = [
  {
    id: 'basic-subscription',
    title: 'Basic Subscription',
    description: 'A simple subscription with one model and default rate limits.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: basic-subscription
  namespace: opendatahub
annotation:
  display-name: "Basic Subscription"
  display-description: "Basic access to AI models"
spec:
  owner:
    groups:
      - name: "data-scientists"
  modelRefs:
    - name: granite-3b-instruct
      tokenRateLimits:
        - limit: 10000
          window: 24h`,
  },
];

interface PolicyFormProps {
  formData: CreatePolicyFormData;
  onChange: (data: CreatePolicyFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
  policyId?: string;
}

const PolicyForm: React.FunctionComponent<PolicyFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditMode = false,
  policyId,
}) => {
  const [viewMode, setViewMode] = React.useState<'form' | 'yaml'>('form');
  const [yamlEditorContent, setYamlEditorContent] = React.useState<string>('');

  const [activeYamlTabKey, setActiveYamlTabKey] = React.useState<string>('authPolicy');
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState<boolean>(true);
  const [sidebarActiveTabKey, setSidebarActiveTabKey] = React.useState<number>(0);
  const [schemaBreadcrumb, setSchemaBreadcrumb] = React.useState<SchemaProperty[]>([]);
  const [currentSchemaView, setCurrentSchemaView] = React.useState<SchemaProperty | null>(null);

  // Groups select state
  const [selectedGroups, setSelectedGroups] = React.useState<string[]>(
    formData.subjects.groups.map((g) => g.name)
  );
  const [isGroupsSelectOpen, setIsGroupsSelectOpen] = React.useState(false);
  const [groupsInputValue, setGroupsInputValue] = React.useState('');
  const groupsTextInputRef = React.useRef<HTMLInputElement>(null);
  const groupsLabelHelpRef = React.useRef(null);
  const [customGroups, setCustomGroups] = React.useState<string[]>([]);
  const CREATE_NEW_GROUP = '__create_new_group__';

  // Users select state
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>(
    formData.subjects.users.map((u) => u.name)
  );
  const [isUsersSelectOpen, setIsUsersSelectOpen] = React.useState(false);
  const [usersInputValue, setUsersInputValue] = React.useState('');
  const usersTextInputRef = React.useRef<HTMLInputElement>(null);
  const usersLabelHelpRef = React.useRef(null);

  // Add Model modal state
  const [isAddModelModalOpen, setIsAddModelModalOpen] = React.useState(false);
  const [addModelSearchInput, setAddModelSearchInput] = React.useState('');
  const [modelsToAdd, setModelsToAdd] = React.useState<Set<string>>(new Set());
  const [addModelsSortIndex, setAddModelsSortIndex] = React.useState<number>(0);
  const [addModelsSortDirection, setAddModelsSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Optional subscription creation checkbox (create mode only)
  const [createMatchingSubscription, setCreateMatchingSubscription] = React.useState(!isEditMode);

  // Track initial values for change detection in edit mode
  const [initialModelRefs] = React.useState(() => [...formData.modelRefs]);
  const [initialGroupNames] = React.useState(() => formData.subjects.groups.map(g => g.name));
  const [initialUserNames] = React.useState(() => formData.subjects.users.map(u => u.name));

  const modelsChanged = React.useMemo(() => {
    const currentNames = [...formData.modelRefs].sort();
    const origNames = [...initialModelRefs].sort();
    return JSON.stringify(currentNames) !== JSON.stringify(origNames);
  }, [formData.modelRefs, initialModelRefs]);

  const groupsChanged = React.useMemo(() => {
    const currentNames = formData.subjects.groups.map(g => g.name).sort();
    const origNames = [...initialGroupNames].sort();
    return JSON.stringify(currentNames) !== JSON.stringify(origNames);
  }, [formData.subjects.groups, initialGroupNames]);

  const usersChanged = React.useMemo(() => {
    const currentNames = formData.subjects.users.map(u => u.name).sort();
    const origNames = [...initialUserNames].sort();
    return JSON.stringify(currentNames) !== JSON.stringify(origNames);
  }, [formData.subjects.users, initialUserNames]);

  const hasRelevantChanges = modelsChanged || groupsChanged || usersChanged;

  const relatedSubscriptions = policyId ? getRelatedSubscriptions(policyId) : [];

  // Resource Preview modal
  const [isResourcePreviewModalOpen, setIsResourcePreviewModalOpen] = React.useState(false);
  const [resourcePreviewMode, setResourcePreviewMode] = React.useState<'table' | 'yaml'>('table');
  const [yamlModalContent, setYamlModalContent] = React.useState<{ title: string; yaml: string }>({
    title: '',
    yaml: '',
  });

  const handleInputChange = (field: keyof CreatePolicyFormData, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  // --- Groups handlers ---
  const handleGroupSelect = (groupName: string) => {
    if (groupName === CREATE_NEW_GROUP) {
      const newGroupName = groupsInputValue.trim();
      if (newGroupName && !selectedGroups.includes(newGroupName)) {
        if (!mockSubjectGroups.some((g) => g.name === newGroupName) && !customGroups.includes(newGroupName)) {
          setCustomGroups((prev) => [...prev, newGroupName]);
        }
        setSelectedGroups((prev) => {
          const newGroups = [...prev, newGroupName];
          onChange({
            ...formData,
            subjects: {
              ...formData.subjects,
              groups: newGroups.map((name) => ({ name })),
            },
          });
          return newGroups;
        });
      }
      setGroupsInputValue('');
      return;
    }

    setSelectedGroups((prev) => {
      const newGroups = prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName];
      onChange({
        ...formData,
        subjects: {
          ...formData.subjects,
          groups: newGroups.map((name) => ({ name })),
        },
      });
      return newGroups;
    });
    setGroupsInputValue('');
  };

  const handleGroupRemove = (groupName: string) => {
    setSelectedGroups((prev) => {
      const newGroups = prev.filter((g) => g !== groupName);
      onChange({
        ...formData,
        subjects: {
          ...formData.subjects,
          groups: newGroups.map((name) => ({ name })),
        },
      });
      return newGroups;
    });
  };

  const handleGroupsInputChange = (value: string) => {
    setGroupsInputValue(value);
    if (!isGroupsSelectOpen) {
      setIsGroupsSelectOpen(true);
    }
  };

  const allAvailableGroups = React.useMemo(() => {
    const mockGroupNames = mockSubjectGroups.map((g) => g.name);
    const customGroupObjects = customGroups
      .filter((name) => !mockGroupNames.includes(name))
      .map((name) => ({ name }));
    return [...mockSubjectGroups, ...customGroupObjects];
  }, [customGroups]);

  const filteredGroups = React.useMemo(() => {
    const inputLower = groupsInputValue.toLowerCase().trim();
    const filtered = allAvailableGroups.filter((group) =>
      group.name.toLowerCase().includes(inputLower)
    );
    const hasExactMatch = allAvailableGroups.some(
      (g) => g.name.toLowerCase() === inputLower
    );
    const isAlreadySelected = selectedGroups.some(
      (g) => g.toLowerCase() === inputLower
    );
    const showCreateOption = inputLower && !hasExactMatch && !isAlreadySelected;
    return { filtered, showCreateOption };
  }, [groupsInputValue, allAvailableGroups, selectedGroups]);

  // --- Users handlers ---
  const handleUserSelect = (userName: string) => {
    setSelectedUsers((prev) => {
      const newUsers = prev.includes(userName)
        ? prev.filter((u) => u !== userName)
        : [...prev, userName];
      onChange({
        ...formData,
        subjects: {
          ...formData.subjects,
          users: newUsers.map((name) => ({ name })),
        },
      });
      return newUsers;
    });
    setUsersInputValue('');
  };

  const handleUserRemove = (userName: string) => {
    setSelectedUsers((prev) => {
      const newUsers = prev.filter((u) => u !== userName);
      onChange({
        ...formData,
        subjects: {
          ...formData.subjects,
          users: newUsers.map((name) => ({ name })),
        },
      });
      return newUsers;
    });
  };

  const handleUsersInputChange = (value: string) => {
    setUsersInputValue(value);
    if (!isUsersSelectOpen) {
      setIsUsersSelectOpen(true);
    }
  };

  const filteredUsers = React.useMemo(() => {
    const inputLower = usersInputValue.toLowerCase().trim();
    const filtered = mockSubjectUsers.filter((user) =>
      user.name.toLowerCase().includes(inputLower)
    );
    return filtered;
  }, [usersInputValue]);

  // --- Models handlers ---
  const addedModelIds = React.useMemo(() => {
    return new Set(formData.modelRefs);
  }, [formData.modelRefs]);

  const handleOpenAddModelModal = () => {
    setModelsToAdd(new Set(addedModelIds));
    setAddModelSearchInput('');
    setAddModelsSortIndex(0);
    setAddModelsSortDirection('asc');
    setIsAddModelModalOpen(true);
  };

  const handleCloseAddModelModal = () => {
    setIsAddModelModalOpen(false);
    setModelsToAdd(new Set());
    setAddModelSearchInput('');
  };

  const handleToggleModelToAdd = (modelId: string) => {
    setModelsToAdd((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const handleAddModels = () => {
    onChange({
      ...formData,
      modelRefs: Array.from(modelsToAdd),
    });
    handleCloseAddModelModal();
  };

  const filteredModelsForModal = React.useMemo(() => {
    let models = [...mockMaaSModels];

    if (addModelSearchInput.trim()) {
      const searchTerm = addModelSearchInput.toLowerCase();
      models = models.filter(
        (model) =>
          model.name.toLowerCase().includes(searchTerm) ||
          model.description.toLowerCase().includes(searchTerm) ||
          model.id.toLowerCase().includes(searchTerm)
      );
    }

    const sortedModels = [...models].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (addModelsSortIndex) {
        case 0:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 1:
          aValue = a.namespace.toLowerCase();
          bValue = b.namespace.toLowerCase();
          break;
        case 2:
          aValue = a.id.toLowerCase();
          bValue = b.id.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return addModelsSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return addModelsSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedModels;
  }, [addModelSearchInput, addModelsSortIndex, addModelsSortDirection]);

  const getModelPolicies = (modelId: string): string[] => {
    return mockPolicies
      .filter((p) => p.type === 'MaaSAuthPolicy' && p.modelRefs.includes(modelId))
      .map((p) => p.displayName);
  };

  const getAddModelsSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: addModelsSortIndex,
      direction: addModelsSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => {
      setAddModelsSortIndex(index);
      setAddModelsSortDirection(direction);
    },
    columnIndex,
  });

  const handleRemoveModel = (modelId: string) => {
    onChange({
      ...formData,
      modelRefs: formData.modelRefs.filter((ref) => ref !== modelId),
    });
  };

  const isFormValid = () => {
    const hasModels = formData.modelRefs.length > 0;
    const hasSubjects = formData.subjects.groups.length > 0 || formData.subjects.users.length > 0;
    return formData.displayName.trim() !== '' && hasSubjects && hasModels;
  };

  const generatePolicyId = (displayName: string): string => {
    if (!displayName) return 'my-policy';
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'my-policy';
  };

  const generateAuthPolicyYaml = (): string => {
    const policyName = generatePolicyId(formData.displayName);
    const modelRefsYaml = formData.modelRefs
      .map((ref) => `    - ${ref}`)
      .join('\n');

    const groupsYaml = formData.subjects.groups
      .map((g) => `      - name: "${g.name}"`)
      .join('\n');

    const usersYaml = formData.subjects.users
      .map((u) => `      - name: "${u.name}"`)
      .join('\n');

    let subjectsBlock = '';
    if (groupsYaml) {
      subjectsBlock += `    groups:\n${groupsYaml}`;
    }
    if (usersYaml) {
      if (subjectsBlock) subjectsBlock += '\n';
      subjectsBlock += `    users:\n${usersYaml}`;
    }

    return `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSAuthPolicy
metadata:
  name: ${policyName}
  namespace: opendatahub
annotation:
  display-name: "${formData.displayName || 'My Policy'}"
  display-description: "${formData.description || 'Policy created via OpenShift AI'}"
spec:
  modelRefs:
${modelRefsYaml || '    # No models selected'}
  subjects:
${subjectsBlock || '    # No subjects selected'}
status:
  phase: Pending`;
  };

  const generateSubscriptionYaml = (): string => {
    const policyName = generatePolicyId(formData.displayName);
    const modelRefsYaml = formData.modelRefs
      .map((ref) => `    - name: ${ref}\n      tokenRateLimits:\n        - limit: 10000\n          window: 24h`)
      .join('\n');

    const groupsYaml = formData.subjects.groups
      .map((g) => `      - name: "${g.name}"`)
      .join('\n');

    return `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: ${policyName}-subscription
  namespace: opendatahub
annotation:
  display-name: "${formData.displayName || 'My Policy'} Subscription"
  display-description: "Subscription for ${formData.displayName || 'policy'}"
spec:
  owner:
    groups:
${groupsYaml || '      # No groups selected'}
  modelRefs:
${modelRefsYaml || '    # No models selected'}`;
  };

  const handleViewYaml = (resourceType: string) => {
    let yaml = '';
    let title = '';

    switch (resourceType) {
      case 'authPolicy':
        title = 'MaaSAuthPolicy';
        yaml = generateAuthPolicyYaml();
        break;
      case 'subscription':
        title = 'MaaSSubscription';
        yaml = generateSubscriptionYaml();
        break;
      default:
        break;
    }

    setYamlModalContent({ title, yaml });
    setResourcePreviewMode('yaml');
  };

  const getResourcePreviewData = () => {
    const policyName = generatePolicyId(formData.displayName);
    const modelCount = formData.modelRefs.length;
    const subjectCount = formData.subjects.groups.length + formData.subjects.users.length;

    const resources: Array<{
      id: string;
      name: string;
      kind: string;
      description: string;
      yamlType: string;
    }> = [
      {
        id: 'authPolicy',
        name: policyName || 'my-policy',
        kind: 'MaaSAuthPolicy',
        description: `Authorizes ${subjectCount} subject${subjectCount !== 1 ? 's' : ''} to access ${modelCount} model${modelCount !== 1 ? 's' : ''}. Validates user identity when model requests are made through the API gateway.`,
        yamlType: 'authPolicy',
      },
    ];

    if (createMatchingSubscription) {
      resources.push({
        id: 'subscription',
        name: `${policyName || 'my-policy'}-subscription`,
        kind: 'MaaSSubscription',
        description: `Creates a subscription with default token rate limits for the selected group${formData.subjects.groups.length !== 1 ? 's' : ''} to access the models in this policy. Both a policy and subscription are needed to consume model endpoints.`,
        yamlType: 'subscription',
      });
    }

    return resources;
  };

  const handleViewModeChange = (mode: 'form' | 'yaml') => {
    if (mode === 'yaml') {
      setYamlEditorContent(generateAuthPolicyYaml());
    }
    setViewMode(mode);
  };

  const handleYamlEditorChange = (value: string) => {
    setYamlEditorContent(value);
  };

  const getModelById = (modelId: string) =>
    mockMaaSModels.find((m) => m.id === modelId);

  const getModelSubscriptions = (modelId: string): string[] => {
    return mockSubscriptions
      .filter((sub) => sub.modelRefs.some((ref) => ref.name === modelId))
      .map((sub) => sub.displayName);
  };

  const getChangedFieldsDescription = (): string => {
    const parts: string[] = [];
    if (modelsChanged) parts.push('models');
    if (groupsChanged) parts.push('groups');
    if (usersChanged) parts.push('users');
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
  };

  return (
    <>
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <ToggleGroup aria-label="View mode toggle" id="policy-view-mode-toggle">
            <ToggleGroupItem
              text="Form"
              buttonId="policy-view-form"
              isSelected={viewMode === 'form'}
              onChange={() => handleViewModeChange('form')}
            />
            <ToggleGroupItem
              text="YAML"
              buttonId="policy-view-yaml"
              isSelected={viewMode === 'yaml'}
              onChange={() => handleViewModeChange('yaml')}
            />
          </ToggleGroup>
        </FlexItem>
        <FlexItem>
          <Popover
            headerContent="Design note"
            bodyContent="This YAML editing experience may be descoped for 3.4 until we prioritize a more robust YAML editor that can be used Dashboard-wide in the future."
            position="right"
            id="policy-yaml-toggle-design-note-popover"
          >
            <Badge
              id="policy-yaml-toggle-design-note-badge"
              style={{ backgroundColor: '#F32BC4', color: '#ffffff', fontSize: '10px', cursor: 'pointer' }}
            >
              Design note <InfoCircleIcon style={{ marginLeft: '0.25rem' }} />
            </Badge>
          </Popover>
        </FlexItem>
      </Flex>

      {viewMode === 'form' ? (
        <Form id="policy-form" isWidthLimited style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
          <FormGroup label="Name" isRequired fieldId="policy-name">
            <div style={{ maxWidth: '75%' }}>
              <TextInput
                id="policy-name-input"
                value={formData.displayName}
                onChange={(_event, value) => handleInputChange('displayName', value)}
              />
            </div>
          </FormGroup>

          <FormGroup label="Description" fieldId="policy-description">
            <div style={{ maxWidth: '75%' }}>
              <TextArea
                id="policy-description-input"
                value={formData.description}
                onChange={(_event, value) => handleInputChange('description', value)}
                rows={2}
              />
            </div>
          </FormGroup>

          {/* Subjects: Groups */}
          <FormGroup
            label="Groups"
            fieldId="policy-subject-groups"
            labelHelp={
              <Popover
                triggerRef={groupsLabelHelpRef}
                headerContent="Groups"
                bodyContent={
                  <div>
                    Select existing groups from the list, or type the name of an OpenID Connect (OIDC) group and press <strong>Enter</strong> to add it.
                    Groups correspond to OIDC group claims from your identity provider. Any group name that matches an OIDC group claim can be used, even if it does not appear in the list.
                  </div>
                }
              >
                <FormGroupLabelHelp ref={groupsLabelHelpRef} aria-label="More info for groups field" aria-describedby="policy-subject-groups" />
              </Popover>
            }
          >
            <div style={{ maxWidth: '75%' }}>
              <Select
                id="policy-groups-select"
                isOpen={isGroupsSelectOpen}
                selected={selectedGroups}
                onSelect={(_event, value) => handleGroupSelect(value as string)}
                onOpenChange={(isOpen) => setIsGroupsSelectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="typeahead"
                    onClick={() => {
                      setIsGroupsSelectOpen(!isGroupsSelectOpen);
                      groupsTextInputRef.current?.focus();
                    }}
                    isExpanded={isGroupsSelectOpen}
                    isFullWidth
                    id="policy-groups-toggle"
                  >
                    <TextInputGroup isPlain>
                      <TextInputGroupMain
                        value={groupsInputValue}
                        onClick={() => setIsGroupsSelectOpen(!isGroupsSelectOpen)}
                        onChange={(_event, value) => handleGroupsInputChange(value)}
                        onKeyDown={(event: React.KeyboardEvent) => {
                          if (event.key === 'Enter' && filteredGroups.showCreateOption) {
                            event.preventDefault();
                            handleGroupSelect(CREATE_NEW_GROUP);
                          }
                        }}
                        autoComplete="off"
                        innerRef={groupsTextInputRef}
                        placeholder={selectedGroups.length === 0 ? "Select groups" : ""}
                        id="policy-groups-input"
                      >
                        {selectedGroups.length > 0 && (
                          <LabelGroup aria-label="Current group selections" numLabels={3}>
                            {selectedGroups.map((groupName) => (
                              <Label
                                key={groupName}
                                variant="outline"
                                id={`policy-group-label-${groupName}`}
                                onClose={(ev) => {
                                  ev.stopPropagation();
                                  handleGroupRemove(groupName);
                                }}
                              >
                                {groupName}
                              </Label>
                            ))}
                          </LabelGroup>
                        )}
                      </TextInputGroupMain>
                      <TextInputGroupUtilities>
                        {(selectedGroups.length > 0 || groupsInputValue) && (
                          <Button
                            variant="plain"
                            onClick={() => {
                              setGroupsInputValue('');
                              setSelectedGroups([]);
                              onChange({
                                ...formData,
                                subjects: { ...formData.subjects, groups: [] },
                              });
                              groupsTextInputRef.current?.focus();
                            }}
                            aria-label="Clear group input"
                            id="policy-groups-clear-button"
                          >
                            <TimesIcon />
                          </Button>
                        )}
                      </TextInputGroupUtilities>
                    </TextInputGroup>
                  </MenuToggle>
                )}
              >
                <SelectList id="policy-groups-list">
                  {filteredGroups.filtered.length === 0 && !filteredGroups.showCreateOption ? (
                    <SelectOption isDisabled>No results found</SelectOption>
                  ) : (
                    <>
                      {filteredGroups.filtered.map((group) => (
                        <SelectOption
                          key={group.name}
                          value={group.name}
                          isSelected={selectedGroups.includes(group.name)}
                          id={`policy-group-option-${group.name}`}
                        >
                          {group.name}
                        </SelectOption>
                      ))}
                      {filteredGroups.showCreateOption && (
                        <SelectOption
                          key={CREATE_NEW_GROUP}
                          value={CREATE_NEW_GROUP}
                          id="policy-group-option-create-new"
                        >
                          Add &quot;{groupsInputValue.trim()}&quot;
                        </SelectOption>
                      )}
                    </>
                  )}
                </SelectList>
              </Select>
            </div>
            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--xs)' }}>
              Select groups that will be granted access to the models in this policy. You can also add the name of an OIDC group.
            </Content>
          </FormGroup>

          {/* Subjects: Users */}
          <FormGroup
            label="Users"
            fieldId="policy-subject-users"
            labelHelp={
              <Popover
                triggerRef={usersLabelHelpRef}
                headerContent="Users"
                bodyContent={
                  <div>
                    Select individual users or service accounts that should have access to the models in this policy.
                  </div>
                }
              >
                <FormGroupLabelHelp ref={usersLabelHelpRef} aria-label="More info for users field" aria-describedby="policy-subject-users" />
              </Popover>
            }
          >
            <div style={{ maxWidth: '75%' }}>
              <Select
                id="policy-users-select"
                isOpen={isUsersSelectOpen}
                selected={selectedUsers}
                onSelect={(_event, value) => handleUserSelect(value as string)}
                onOpenChange={(isOpen) => setIsUsersSelectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="typeahead"
                    onClick={() => {
                      setIsUsersSelectOpen(!isUsersSelectOpen);
                      usersTextInputRef.current?.focus();
                    }}
                    isExpanded={isUsersSelectOpen}
                    isFullWidth
                    id="policy-users-toggle"
                  >
                    <TextInputGroup isPlain>
                      <TextInputGroupMain
                        value={usersInputValue}
                        onClick={() => setIsUsersSelectOpen(!isUsersSelectOpen)}
                        onChange={(_event, value) => handleUsersInputChange(value)}
                        autoComplete="off"
                        innerRef={usersTextInputRef}
                        placeholder={selectedUsers.length === 0 ? "Select users" : ""}
                        id="policy-users-input"
                      >
                        {selectedUsers.length > 0 && (
                          <LabelGroup aria-label="Current user selections" numLabels={3}>
                            {selectedUsers.map((userName) => (
                              <Label
                                key={userName}
                                variant="outline"
                                id={`policy-user-label-${userName}`}
                                onClose={(ev) => {
                                  ev.stopPropagation();
                                  handleUserRemove(userName);
                                }}
                              >
                                {userName}
                              </Label>
                            ))}
                          </LabelGroup>
                        )}
                      </TextInputGroupMain>
                      <TextInputGroupUtilities>
                        {(selectedUsers.length > 0 || usersInputValue) && (
                          <Button
                            variant="plain"
                            onClick={() => {
                              setUsersInputValue('');
                              setSelectedUsers([]);
                              onChange({
                                ...formData,
                                subjects: { ...formData.subjects, users: [] },
                              });
                              usersTextInputRef.current?.focus();
                            }}
                            aria-label="Clear user input"
                            id="policy-users-clear-button"
                          >
                            <TimesIcon />
                          </Button>
                        )}
                      </TextInputGroupUtilities>
                    </TextInputGroup>
                  </MenuToggle>
                )}
              >
                <SelectList id="policy-users-list">
                  {filteredUsers.length === 0 ? (
                    <SelectOption isDisabled>No results found</SelectOption>
                  ) : (
                    filteredUsers.map((user) => (
                      <SelectOption
                        key={user.name}
                        value={user.name}
                        isSelected={selectedUsers.includes(user.name)}
                        id={`policy-user-option-${user.name}`}
                      >
                        {user.name}
                      </SelectOption>
                    ))
                  )}
                </SelectList>
              </Select>
            </div>
            <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--xs)' }}>
              Select individual users or service accounts.
            </Content>
          </FormGroup>

          {/* Model Endpoints Section */}
          <FormSection title="Models">
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              Add models that subjects of this policy will be granted access to.
            </Content>

            {formData.modelRefs.length > 0 ? (
              <>
                <Table
                  aria-label="Models in policy"
                  id="policy-models-table"
                  variant="compact"
                >
                  <Thead>
                    <Tr>
                      <Th width={35}>Name</Th>
                      <Th width={15}>Project</Th>
                      <Th width={15}>Model ID</Th>
                      <Th width={20}>Subscriptions</Th>
                      <Th width={15} screenReaderText="Actions" />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {formData.modelRefs.map((modelRefId) => {
                      const modelData = getModelById(modelRefId);
                      const subs = getModelSubscriptions(modelRefId);
                      return (
                        <Tr key={modelRefId}>
                          <Td dataLabel="Name">
                            <div>
                              <strong>{modelData?.name || modelRefId}</strong>
                              <div style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '0.8125rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                {modelRefId}
                              </div>
                              {modelData?.description && (
                                <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  {modelData.description}
                                </div>
                              )}
                            </div>
                          </Td>
                          <Td dataLabel="Project">{modelData?.namespace || '-'}</Td>
                          <Td dataLabel="Model ID">
                            <code style={{ fontSize: '0.875rem' }}>{modelRefId}</code>
                          </Td>
                          <Td dataLabel="Subscriptions">
                            {subs.length > 0 ? (
                              subs.map((subName) => (
                                <div key={subName} style={{ fontSize: '0.875rem' }}>{subName}</div>
                              ))
                            ) : (
                              <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem' }}>None</span>
                            )}
                          </Td>
                          <Td dataLabel="Actions">
                            <Button
                              variant="secondary"
                              isDanger
                              onClick={() => handleRemoveModel(modelRefId)}
                              id={`remove-model-${modelRefId}`}
                            >
                              Remove
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
                <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    onClick={handleOpenAddModelModal}
                    id="policy-add-models-button"
                  >
                    Add models
                  </Button>
                </div>
              </>
            ) : (
              <div>
                <Button
                  variant="link"
                  icon={<PlusCircleIcon />}
                  onClick={handleOpenAddModelModal}
                  id="policy-add-models-button"
                >
                  Add models
                </Button>
              </div>
            )}
          </FormSection>

          {/* Optional subscription creation checkbox (create mode only) */}
          {!isEditMode && (
            <Checkbox
              id="create-matching-subscription-checkbox"
              isLabelWrapped
              label={
                <>
                  Create a matching subscription{' '}
                  <Popover
                    headerContent="Why create a subscription?"
                    bodyContent={
                      <div>
                        <p style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                          A <strong>policy</strong> (MaaSAuthPolicy) authorizes specific groups and users to access model endpoints, but it does not define rate limits or quotas on its own.
                        </p>
                        <p style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                          A <strong>subscription</strong> (MaaSSubscription) defines which models should be available with per-model token rate limits and billing metadata.
                        </p>
                        <p>
                          Both resources are needed in order to consume model endpoints through the API gateway.
                        </p>
                      </div>
                    }
                    position="right"
                    id="create-subscription-info-popover"
                  >
                    <Button
                      variant="plain"
                      aria-label="More info about subscriptions"
                      id="create-subscription-info-button"
                      style={{ padding: 0, verticalAlign: 'middle' }}
                    >
                      <OutlinedQuestionCircleIcon />
                    </Button>
                  </Popover>
                </>
              }
              isChecked={createMatchingSubscription}
              onChange={(_event, checked) => setCreateMatchingSubscription(checked)}
            />
          )}

          {/* Edit mode warning about subscriptions not auto-updating */}
          {isEditMode && hasRelevantChanges && (
            <Alert
              variant="warning"
              isInline
              title="Related subscriptions may need to be updated"
              id="edit-policy-subscription-warning"
              style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
            >
              <p>
                To avoid potential conflicts, subscriptions related to this policy will not be automatically updated with these changes.
                You will need to update the following subscriptions manually to match the modified {getChangedFieldsDescription()} in this policy.
              </p>
              {relatedSubscriptions.length > 0 && (
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }} style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                  {relatedSubscriptions.map((sub) => (
                    <FlexItem key={sub.id}>
                      <a
                        href={`/settings/subscriptions/${sub.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`subscription-warning-link-${sub.id}`}
                      >
                        {sub.name} ({sub.type}) <ExternalLinkAltIcon style={{ fontSize: '0.75em', marginLeft: '0.25rem' }} />
                      </a>
                    </FlexItem>
                  ))}
                </Flex>
              )}
            </Alert>
          )}

          {/* Add Models Modal */}
          <Modal
            variant={ModalVariant.large}
            isOpen={isAddModelModalOpen}
            onClose={handleCloseAddModelModal}
            aria-labelledby="policy-add-models-modal-title"
          >
            <ModalHeader title="Add models to policy" labelId="policy-add-models-modal-title" />
            <ModalBody>
              <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                Select model endpoints to grant access to through this policy.
              </Content>

              <Toolbar id="policy-add-models-toolbar" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <ToolbarContent style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <ToolbarItem>
                    <SearchInput
                      placeholder="Filter by name or description"
                      value={addModelSearchInput}
                      onChange={(_event, value) => setAddModelSearchInput(value)}
                      onClear={() => setAddModelSearchInput('')}
                      id="policy-add-models-search-input"
                      style={{ minWidth: '300px' }}
                    />
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>

              {filteredModelsForModal.length === 0 ? (
                <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', padding: 'var(--pf-t--global--spacer--lg)' }}>
                  No models match your search.
                </Content>
              ) : (
                <Table aria-label="Available models" id="policy-add-models-table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={30} sort={getAddModelsSortParams(0)}>Model name</Th>
                      <Th width={15} sort={getAddModelsSortParams(1)}>Project</Th>
                      <Th width={15} sort={getAddModelsSortParams(2)}>Model ID</Th>
                      <Th width={20}>Policies</Th>
                      <Th width={20} screenReaderText="Actions" />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredModelsForModal.map((model) => {
                      const isSelected = modelsToAdd.has(model.id);
                      const modelPolicies = getModelPolicies(model.id);
                      return (
                        <Tr key={model.id}>
                          <Td dataLabel="Model name">
                            <div>
                              <strong>{model.name}</strong>
                              {model.description && (
                                <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  {model.description}
                                </div>
                              )}
                            </div>
                          </Td>
                          <Td dataLabel="Project">{model.namespace}</Td>
                          <Td dataLabel="Model ID">
                            <code style={{ fontSize: '0.875rem' }}>{model.id}</code>
                          </Td>
                          <Td dataLabel="Policies">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                              {isSelected && (
                                <Label
                                  id={`policy-label-${model.id}`}
                                  color="green"
                                >
                                  {formData.displayName || 'This policy'}
                                </Label>
                              )}
                              {modelPolicies.length > 0 ? (
                                modelPolicies.map((polName) => (
                                  <div key={polName} style={{ fontSize: '0.875rem' }}>
                                    {polName}
                                  </div>
                                ))
                              ) : (
                                !isSelected && (
                                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem' }}>
                                    None
                                  </span>
                                )
                              )}
                            </div>
                          </Td>
                          <Td dataLabel="Actions">
                            <Button
                              variant={isSelected ? 'secondary' : 'link'}
                              onClick={() => handleToggleModelToAdd(model.id)}
                              id={`policy-add-model-action-${model.id}`}
                              isDanger={isSelected}
                            >
                              {isSelected ? 'Remove model' : 'Add model'}
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="primary"
                onClick={handleAddModels}
                id="policy-add-models-confirm-button"
              >
                Add models
              </Button>
              <Button variant="link" onClick={handleCloseAddModelModal} id="policy-add-models-cancel-button">
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          {/* Resource Preview Modal */}
          <Modal
            variant={ModalVariant.large}
            isOpen={isResourcePreviewModalOpen}
            onClose={() => {
              setIsResourcePreviewModalOpen(false);
              setResourcePreviewMode('table');
            }}
            aria-labelledby="policy-resource-preview-modal-title"
          >
            <ModalHeader
              title={resourcePreviewMode === 'table' ? 'Resource preview' : yamlModalContent.title}
              labelId="policy-resource-preview-modal-title"
            />
            <ModalBody>
              {resourcePreviewMode === 'table' ? (
                <>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    The following Kubernetes resources will be created automatically.
                    For advanced configuration or to make changes after creation, you can edit these resources
                    directly in the{' '}
                    <Button
                      variant="link"
                      isInline
                      component="a"
                      href="https://console-openshift-console.apps.example.com/k8s/ns/opendatahub/maas.opendatahub.io~v1alpha1~MaaSAuthPolicy"
                      target="_blank"
                      id="policy-openshift-console-link"
                    >
                      OpenShift Web Console
                      <Icon size="sm" style={{ marginLeft: '0.25rem' }}>
                        <ExternalLinkAltIcon />
                      </Icon>
                    </Button>
                    .
                  </Content>

                  <Table aria-label="Resources to be created" id="policy-resource-preview-table" variant="compact">
                    <Thead>
                      <Tr>
                        <Th width={25}>Name</Th>
                        <Th width={20}>Kind</Th>
                        <Th width={40}>Description</Th>
                        <Th width={15} screenReaderText="Actions" />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {getResourcePreviewData().map((resource) => (
                        <Tr key={resource.id}>
                          <Td dataLabel="Name">
                            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <FlexItem>
                                <Label
                                  color={resource.kind === 'MaaSAuthPolicy' ? 'orange' : 'teal'}
                                  isCompact
                                  id={`policy-resource-kind-label-${resource.id}`}
                                >
                                  {resource.kind === 'MaaSAuthPolicy' ? 'MAP' : 'MS'}
                                </Label>
                              </FlexItem>
                              <FlexItem>{resource.name}</FlexItem>
                            </Flex>
                          </Td>
                          <Td dataLabel="Kind">
                            {resource.kind}
                          </Td>
                          <Td dataLabel="Description">
                            <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                              {resource.description}
                            </span>
                          </Td>
                          <Td dataLabel="Actions">
                            <Button
                              variant="link"
                              onClick={() => handleViewYaml(resource.yamlType)}
                              id={`policy-view-yaml-${resource.id}`}
                            >
                              View YAML
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </>
              ) : (
                <>
                  <Button
                    variant="link"
                    isInline
                    onClick={() => setResourcePreviewMode('table')}
                    id="policy-return-to-preview-button"
                    style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                  >
                    <Icon size="sm" style={{ marginRight: '0.25rem' }}>
                      <AngleRightIcon style={{ transform: 'rotate(180deg)' }} />
                    </Icon>
                    Return to preview
                  </Button>
                  <CodeBlock id="policy-yaml-preview-codeblock">
                    <CodeBlockCode id="policy-yaml-preview-code">{yamlModalContent.yaml}</CodeBlockCode>
                  </CodeBlock>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="primary"
                onClick={() => {
                  setIsResourcePreviewModalOpen(false);
                  setResourcePreviewMode('table');
                }}
                id="policy-resource-preview-modal-close-button"
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>

          <ActionGroup>
            <Button
              variant="primary"
              onClick={onSubmit}
              isDisabled={!isFormValid()}
              id="policy-submit-button"
            >
              {isEditMode ? 'Save' : 'Create policy'}
            </Button>
            {!isEditMode && (
              <Button
                variant="secondary"
                onClick={() => {
                  setResourcePreviewMode('table');
                  setIsResourcePreviewModalOpen(true);
                }}
                id="policy-preview-resources-button"
              >
                Preview resources
              </Button>
            )}
            <Button variant="link" onClick={onCancel} id="policy-cancel-button">
              Cancel
            </Button>
          </ActionGroup>
        </Form>
      ) : (
        /* YAML Editor View */
        <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
          <Tabs
            activeKey={activeYamlTabKey}
            onSelect={(_event, tabKey) => {
              setActiveYamlTabKey(tabKey as string);
              setSchemaBreadcrumb([]);
              setCurrentSchemaView(null);
            }}
            id="policy-yaml-resource-tabs"
            aria-label="Resource YAML tabs"
            style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
          >
            <Tab
              eventKey="authPolicy"
              title={<TabTitleText>MaaSAuthPolicy</TabTitleText>}
              id="policy-yaml-tab-auth-policy"
            />
            <Tab
              eventKey="subscription"
              title={<TabTitleText>MaaSSubscription</TabTitleText>}
              id="policy-yaml-tab-subscription"
            />
          </Tabs>

          <Drawer isExpanded={isSidebarExpanded} isInline id="policy-yaml-editor-drawer">
            <DrawerContent
              panelContent={
                <DrawerPanelContent
                  isResizable
                  defaultSize="400px"
                  minSize="250px"
                  maxSize="600px"
                  id="policy-yaml-sidebar-panel"
                >
                  <DrawerHead>
                    <Title headingLevel="h3" size="lg">
                      {activeYamlTabKey === 'authPolicy' ? 'MaaSAuthPolicy' : 'MaaSSubscription'}
                    </Title>
                    <DrawerActions>
                      <DrawerCloseButton onClick={() => setIsSidebarExpanded(false)} />
                    </DrawerActions>
                  </DrawerHead>
                  <DrawerPanelBody>
                    <Tabs
                      activeKey={sidebarActiveTabKey}
                      onSelect={(_event, tabKey) => setSidebarActiveTabKey(tabKey as number)}
                      id="policy-sidebar-tabs"
                      aria-label="Schema and samples tabs"
                      isBox
                    >
                      <Tab eventKey={0} title={<TabTitleText>Schema</TabTitleText>} id="policy-sidebar-tab-schema">
                        <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
                          {schemaBreadcrumb.length > 0 && (
                            <Breadcrumb style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                              <BreadcrumbItem>
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => {
                                    setSchemaBreadcrumb([]);
                                    setCurrentSchemaView(null);
                                  }}
                                  id="policy-schema-breadcrumb-root"
                                >
                                  {activeYamlTabKey === 'authPolicy' ? 'MaaSAuthPolicy' : 'MaaSSubscription'}
                                </Button>
                              </BreadcrumbItem>
                              {schemaBreadcrumb.map((prop, index) => (
                                <BreadcrumbItem key={prop.name} isActive={index === schemaBreadcrumb.length - 1}>
                                  {index === schemaBreadcrumb.length - 1 ? (
                                    prop.name
                                  ) : (
                                    <Button
                                      variant="link"
                                      isInline
                                      onClick={() => {
                                        setSchemaBreadcrumb(schemaBreadcrumb.slice(0, index + 1));
                                        setCurrentSchemaView(schemaBreadcrumb[index]);
                                      }}
                                      id={`policy-schema-breadcrumb-${prop.name}`}
                                    >
                                      {prop.name}
                                    </Button>
                                  )}
                                </BreadcrumbItem>
                              ))}
                            </Breadcrumb>
                          )}

                          {(() => {
                            const schema = activeYamlTabKey === 'authPolicy'
                              ? maasAuthPolicySchema
                              : maasSubscriptionSchema;

                            const propsToShow = currentSchemaView?.children || schema.properties;
                            const description = currentSchemaView?.description || schema.description;

                            return (
                              <>
                                <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  {description}
                                </Content>
                                <List isPlain id="policy-schema-properties-list">
                                  {propsToShow.map((prop) => (
                                    <ListItem key={prop.name} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                                      <Flex alignItems={{ default: 'alignItemsFlexStart' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                        <FlexItem style={{ minWidth: '120px' }}>
                                          {prop.children ? (
                                            <Button
                                              variant="link"
                                              isInline
                                              onClick={() => {
                                                setSchemaBreadcrumb([...schemaBreadcrumb, prop]);
                                                setCurrentSchemaView(prop);
                                              }}
                                              id={`policy-schema-prop-link-${prop.name}`}
                                              style={{ fontWeight: 600 }}
                                            >
                                              {prop.name}
                                              <AngleRightIcon style={{ marginLeft: '0.25rem' }} />
                                            </Button>
                                          ) : (
                                            <span style={{ fontWeight: 600 }}>{prop.name}</span>
                                          )}
                                          {prop.required && (
                                            <span style={{ color: 'var(--pf-t--global--color--status--danger--default)', marginLeft: '0.25rem' }}>*</span>
                                          )}
                                        </FlexItem>
                                        <FlexItem>
                                          <Label isCompact color="blue" id={`policy-schema-type-${prop.name}`}>
                                            {prop.type}
                                          </Label>
                                        </FlexItem>
                                      </Flex>
                                      <div style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                        {prop.description}
                                      </div>
                                      {prop.enum && (
                                        <div style={{ marginTop: '0.25rem' }}>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                            Allowed values:{' '}
                                          </span>
                                          {prop.enum.map((val) => (
                                            <Label key={val} isCompact variant="outline" style={{ marginRight: '0.25rem' }}>
                                              {val}
                                            </Label>
                                          ))}
                                        </div>
                                      )}
                                    </ListItem>
                                  ))}
                                </List>
                              </>
                            );
                          })()}
                        </div>
                      </Tab>
                      <Tab eventKey={1} title={<TabTitleText>Samples</TabTitleText>} id="policy-sidebar-tab-samples">
                        <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
                          {(() => {
                            const samples = activeYamlTabKey === 'authPolicy'
                              ? maasAuthPolicySamples
                              : maasSubscriptionSamples;

                            return (
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                                {samples.map((sample) => (
                                  <FlexItem key={sample.id}>
                                    <Card isCompact id={`policy-sample-card-${sample.id}`}>
                                      <CardTitle>
                                        {sample.title}
                                      </CardTitle>
                                      <CardBody>
                                        <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                          {sample.description}
                                        </Content>
                                        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                                          <FlexItem>
                                            <Tooltip content="Load this sample into the editor">
                                              <Button
                                                variant="secondary"
                                                size="sm"
                                                icon={<PlayIcon />}
                                                onClick={() => setYamlEditorContent(sample.yaml)}
                                                id={`policy-sample-try-${sample.id}`}
                                              >
                                                Try it
                                              </Button>
                                            </Tooltip>
                                          </FlexItem>
                                          <FlexItem>
                                            <Tooltip content="Download this sample as a YAML file">
                                              <Button
                                                variant="plain"
                                                size="sm"
                                                icon={<DownloadIcon />}
                                                onClick={() => {
                                                  const blob = new Blob([sample.yaml], { type: 'text/yaml' });
                                                  const url = URL.createObjectURL(blob);
                                                  const a = document.createElement('a');
                                                  a.href = url;
                                                  a.download = `${sample.id}.yaml`;
                                                  a.click();
                                                  URL.revokeObjectURL(url);
                                                }}
                                                id={`policy-sample-download-${sample.id}`}
                                              />
                                            </Tooltip>
                                          </FlexItem>
                                        </Flex>
                                      </CardBody>
                                    </Card>
                                  </FlexItem>
                                ))}
                              </Flex>
                            );
                          })()}
                        </div>
                      </Tab>
                    </Tabs>
                  </DrawerPanelBody>
                </DrawerPanelContent>
              }
            >
              <DrawerContentBody style={{ paddingRight: 'var(--pf-t--global--spacer--lg)' }}>
                <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  <FlexItem>
                    {!isSidebarExpanded && (
                      <Button
                        variant="link"
                        onClick={() => setIsSidebarExpanded(true)}
                        icon={<OutlinedQuestionCircleIcon />}
                        id="policy-toggle-sidebar-button"
                      >
                        View sidebar
                      </Button>
                    )}
                  </FlexItem>
                </Flex>

                <CodeEditor
                  id="policy-yaml-editor"
                  isLineNumbersVisible
                  isLanguageLabelVisible
                  language={Language.yaml}
                  height="500px"
                  code={
                    activeYamlTabKey === 'authPolicy'
                      ? yamlEditorContent || generateAuthPolicyYaml()
                      : generateSubscriptionYaml()
                  }
                  onChange={(value) => {
                    if (activeYamlTabKey === 'authPolicy') {
                      handleYamlEditorChange(value);
                    }
                  }}
                />
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>

          <ActionGroup style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
            <Button
              variant="primary"
              onClick={onSubmit}
              id="policy-yaml-submit-button"
            >
              {isEditMode ? 'Save' : 'Apply YAMLs'}
            </Button>
            <Button variant="link" onClick={onCancel} id="policy-yaml-cancel-button">
              Cancel
            </Button>
          </ActionGroup>
        </div>
      )}
    </>
  );
};

export { PolicyForm };
