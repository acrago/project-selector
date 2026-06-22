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
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
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
  NumberInput,
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
  ActionsColumn,
  IAction,
  Table,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ExclamationCircleIcon, MinusCircleIcon, PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { CreateSubscriptionForm, ModelRef } from '../types';
import { getModelById, getRelatedPolicies, mockMaaSModels, mockOwnerGroups, mockSubscriptions } from '../mockData';

// Schema definitions for the sidebar
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

// Schema data for MaaSSubscription
const maasSubscriptionSchema: ResourceSchema = {
  apiVersion: 'maas.opendatahub.io/v1alpha1',
  kind: 'MaaSSubscription',
  description: 'Defines a subscription plan with per-model token rate limits and quotas, as well as billing information. Subscriptions are owned by specific groups and a user must have both permission to access that model from both an AuthPolicy and Subscription perspective.',
  properties: [
    {
      name: 'apiVersion',
      type: 'string',
      description: 'APIVersion defines the versioned schema of this representation of an object.',
      required: true,
    },
    {
      name: 'kind',
      type: 'string',
      description: 'Kind is a string value representing the REST resource this object represents.',
      required: true,
    },
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
      name: 'annotation',
      type: 'object',
      description: 'Annotations for display metadata.',
      children: [
        { name: 'display-name', type: 'string', description: 'Human-readable display name for the subscription.' },
        { name: 'display-description', type: 'string', description: 'Human-readable description of the subscription.' },
      ],
    },
    {
      name: 'spec',
      type: 'object',
      description: 'Specification of the desired subscription behavior.',
      required: true,
      children: [
        {
          name: 'priority',
          type: 'integer',
          description:
            'Relative priority for this subscription (1–10). Higher values are treated as higher priority (for example, default subscription selection when a user has multiple subscriptions).',
          required: true,
        },
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
              children: [
                { name: 'name', type: 'string', description: 'Name of the group.', required: true },
              ],
            },
          ],
        },
        {
          name: 'modelRefs',
          type: 'array',
          description: 'List of models included in this subscription with per-model token rate limits.',
          required: true,
          children: [
            { name: 'name', type: 'string', description: 'Name/ID of the MaaSModelRef.', required: true },
            {
              name: 'tokenRateLimits',
              type: 'array',
              description: 'Token rate limits for this model. Can also use a ref to an existing TokenRateLimit.',
              children: [
                { name: 'limit', type: 'integer', description: 'Maximum number of tokens allowed in the window.' },
                { name: 'window', type: 'string', description: 'Time window for the limit (e.g., "2m", "24h").', enum: ['1m', '2m', '1h', '24h', '7d'] },
                { name: 'ref', type: 'string', description: 'Reference to an existing TokenRateLimit resource.' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Schema for MaaSAuthPolicy
const maasAuthPolicySchema: ResourceSchema = {
  apiVersion: 'maas.opendatahub.io/v1alpha1',
  kind: 'MaaSAuthPolicy',
  description: 'Defines who (OIDC subjects/groups) can access specific Models. Creates an AuthPolicy for the MaaS API that allows authenticated users to list their available subscriptions and validates access when model requests are made.',
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
          description: 'Who has access. Uses OR logic - any match grants access.',
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

// Schema for MaaSModelRef
const maasModelRefSchema: ResourceSchema = {
  apiVersion: 'maas.opendatahub.io/v1alpha1',
  kind: 'MaaSModelRef',
  description: 'Represents an AI/ML model endpoint—either internal (KServe/llmisvc) or external (OpenAI, etc.). Creates HTTPRoute for the model endpoint and an AuthPolicy that validates requests.',
  properties: [
    { name: 'apiVersion', type: 'string', description: 'APIVersion defines the versioned schema.', required: true },
    { name: 'kind', type: 'string', description: 'Kind is a string value representing the REST resource.', required: true },
    {
      name: 'metadata',
      type: 'object',
      description: 'Standard object metadata.',
      required: true,
      children: [
        { name: 'name', type: 'string', description: 'Unique identifier for this model reference.', required: true },
        { name: 'namespace', type: 'string', description: 'Namespace where the model reference is created.', required: true },
      ],
    },
    {
      name: 'annotations',
      type: 'object',
      description: 'Annotations for display metadata and model information.',
      children: [
        { name: 'displayName', type: 'string', description: 'Human-readable display name for the model.' },
        { name: 'description', type: 'string', description: 'Description of the model capabilities.' },
        { name: 'contextWindow', type: 'string', description: 'Context window size (e.g., "8192").' },
      ],
    },
    {
      name: 'spec',
      type: 'object',
      description: 'Specification of the model reference.',
      required: true,
      children: [
        {
          name: 'modelRef',
          type: 'object',
          description: 'Reference to the backing model. Kind determines which fields are available.',
          required: true,
          children: [
            { name: 'kind', type: 'string', description: 'Type of the backing model.', required: true, enum: ['llmisvc', 'ExternalModel'] },
            { name: 'name', type: 'string', description: 'Name of the backing model resource.', required: true },
            { name: 'namespace', type: 'string', description: 'Namespace of the backing model. Defaults to same namespace as MaaSModelRef.' },
          ],
        },
      ],
    },
    {
      name: 'status',
      type: 'object',
      description: 'Status of the model reference.',
      children: [
        { name: 'phase', type: 'string', description: 'Current phase of the model.', enum: ['Pending', 'Ready', 'Unhealthy', 'Failed'] },
        { name: 'endpoint', type: 'string', description: 'The resolved endpoint URL for the model.' },
        {
          name: 'conditions',
          type: 'array',
          description: 'Current conditions of the model.',
          children: [
            { name: 'type', type: 'string', description: 'Type of condition (e.g., Ready).' },
            { name: 'status', type: 'string', description: 'Status of the condition (True/False/Unknown).' },
          ],
        },
      ],
    },
  ],
};

// Sample definitions
interface YamlSample {
  id: string;
  title: string;
  description: string;
  yaml: string;
}

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
  {
    id: 'enterprise-subscription',
    title: 'Enterprise Subscription with Multiple Models',
    description: 'An enterprise-grade subscription with multiple models and tiered rate limits.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: enterprise-tier
  namespace: opendatahub
annotation:
  display-name: "Enterprise Subscription"
  display-description: "Full access to enterprise AI models with premium limits"
spec:
  owner:
    groups:
      - name: "acme-corp-ai-users"
  modelRefs:
    - name: granite-3b-instruct
      tokenRateLimits:
        - limit: 100000
          window: 24h
    - name: gpt-4-turbo
      tokenRateLimits:
        - limit: 2000
          window: 2m
    - name: gpt-4-advance
      tokenRateLimits:
        ref: custom-rate-limit`,
  },
  {
    id: 'multi-group-subscription',
    title: 'Multi-Group Subscription',
    description: 'A subscription shared across multiple groups with different rate limits per model.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: shared-ai-access
  namespace: opendatahub
annotation:
  display-name: "Shared AI Access"
  display-description: "Shared access for multiple teams"
spec:
  owner:
    groups:
      - name: "acme-corp-ai-users"
      - name: "acme-data-science"
  modelRefs:
    - name: granite-3b-instruct
      tokenRateLimits:
        - limit: 50000
          window: 1h
        - limit: 500000
          window: 24h`,
  },
];

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
  # Who has access (OR logic - any match grants access)
  subjects:
    groups:
      - name: "acme-corp-ai-users"
      - name: "acme-data-science"
status:
  phase: Active`,
  },
];

const maasModelRefSamples: YamlSample[] = [
  {
    id: 'internal-model',
    title: 'Internal KServe Model',
    description: 'Reference to an internal model served via KServe/llmisvc.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSModelRef
metadata:
  name: granite-3b-instruct
  namespace: opendatahub
annotations:
  displayName: "IBM Granite 3B Instruct"
  description: "Lightweight instruction-following model"
  contextWindow: "8192"
spec:
  modelRef:
    kind: llmisvc
    name: granite-3b-instruct
    namespace: llm
status:
  phase: Ready
  endpoint: "https://granite-3b.llm.svc.cluster.local/v1"
  conditions:
    - type: Ready
      status: "True"`,
  },
  {
    id: 'external-model',
    title: 'External Model (OpenAI)',
    description: 'Reference to an external model endpoint like OpenAI or Azure.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSModelRef
metadata:
  name: gpt-4-turbo
  namespace: opendatahub
annotations:
  displayName: "GPT-4 Turbo"
  description: "OpenAI GPT-4 Turbo - High capability reasoning model"
  contextWindow: "128000"
spec:
  modelRef:
    kind: ExternalModel
    name: gpt-4-turbo-external
status:
  phase: Ready
  endpoint: "https://api.openai.com/v1"
  conditions:
    - type: Ready
      status: "True"`,
  },
  {
    id: 'pending-model',
    title: 'Pending Model Reference',
    description: 'A model reference that is still being provisioned.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSModelRef
metadata:
  name: llama-70b-instruct
  namespace: opendatahub
annotations:
  displayName: "Llama 70B Instruct"
  description: "Large language model for complex reasoning tasks"
  contextWindow: "8192"
spec:
  modelRef:
    kind: llmisvc
    name: llama-70b-instruct
    namespace: llm
status:
  phase: Pending
  conditions:
    - type: Ready
      status: "False"`,
  },
];

interface SubscriptionFormProps {
  formData: CreateSubscriptionForm;
  onChange: (data: CreateSubscriptionForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
  subscriptionId?: string;
}

const SubscriptionForm: React.FunctionComponent<SubscriptionFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isEditMode = false,
  subscriptionId,
}) => {
  // View mode state: 'form' or 'yaml'
  const [viewMode, setViewMode] = React.useState<'form' | 'yaml'>('form');
  const [yamlEditorContent, setYamlEditorContent] = React.useState<string>('');
  
  // YAML Editor enhanced state
  const [activeYamlTabKey, setActiveYamlTabKey] = React.useState<string>('subscription');
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState<boolean>(true);
  const [sidebarActiveTabKey, setSidebarActiveTabKey] = React.useState<number>(0);
  const [schemaBreadcrumb, setSchemaBreadcrumb] = React.useState<SchemaProperty[]>([]);
  const [currentSchemaView, setCurrentSchemaView] = React.useState<SchemaProperty | null>(null);
  const [selectedTokenLimitModel, setSelectedTokenLimitModel] = React.useState<string>('');

  const [selectedGroups, setSelectedGroups] = React.useState<string[]>(
    formData.owner.groups.map((g) => g.name)
  );
  const [isGroupsSelectOpen, setIsGroupsSelectOpen] = React.useState(false);
  const [groupsInputValue, setGroupsInputValue] = React.useState('');
  const groupsTextInputRef = React.useRef<HTMLInputElement>(null);
  const groupsLabelHelpRef = React.useRef(null);
  const priorityLabelHelpRef = React.useRef<HTMLButtonElement>(null);


  const priorityConflict = React.useMemo(() => {
    const otherSubs = mockSubscriptions.filter(
      (s) => !(isEditMode && subscriptionId && s.id === subscriptionId),
    );
    const match = otherSubs.find((s) => s.priority === formData.priority);
    if (!match) return null;

    const usedPriorities = new Set(otherSubs.map((s) => s.priority));
    let suggestion: number | null = null;
    for (let n = formData.priority + 1; n <= 10; n++) {
      if (!usedPriorities.has(n)) {
        suggestion = n;
        break;
      }
    }
    if (suggestion === null) {
      for (let n = formData.priority - 1; n >= 1; n--) {
        if (!usedPriorities.has(n)) {
          suggestion = n;
          break;
        }
      }
    }

    return { conflictName: match.displayName, suggestion };
  }, [formData.priority, isEditMode, subscriptionId]);
  
  // Track custom groups created by the user (not in mockOwnerGroups)
  const [customGroups, setCustomGroups] = React.useState<string[]>([]);
  
  // Constant for identifying the "create new" option
  const CREATE_NEW_GROUP = '__create_new_group__';

  // State for Add Model modal
  const [isAddModelModalOpen, setIsAddModelModalOpen] = React.useState(false);
  const [addModelSearchInput, setAddModelSearchInput] = React.useState('');
  const [modelsToAdd, setModelsToAdd] = React.useState<Set<string>>(new Set());
  const [addModelsSortIndex, setAddModelsSortIndex] = React.useState<number>(0); // Default sort by model name
  const [addModelsSortDirection, setAddModelsSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // State for Edit Token Limit modal
  const [isEditTokenLimitModalOpen, setIsEditTokenLimitModalOpen] = React.useState(false);
  const [editingModelIndex, setEditingModelIndex] = React.useState<number | null>(null);

  // State for optional policy creation checkbox (create mode only)
  const [createMatchingPolicy, setCreateMatchingPolicy] = React.useState(!isEditMode);

  // Track initial values for change detection in edit mode
  const [initialModelNames] = React.useState(() => formData.modelRefs.map(r => r.name));
  const [initialGroupNames] = React.useState(() => formData.owner.groups.map(g => g.name));

  // Detect if models or groups changed (for edit mode warning)
  const modelsChanged = React.useMemo(() => {
    const currentNames = formData.modelRefs.map(r => r.name).sort();
    const origNames = [...initialModelNames].sort();
    return JSON.stringify(currentNames) !== JSON.stringify(origNames);
  }, [formData.modelRefs, initialModelNames]);

  const groupsChanged = React.useMemo(() => {
    const currentNames = formData.owner.groups.map(g => g.name).sort();
    const origNames = [...initialGroupNames].sort();
    return JSON.stringify(currentNames) !== JSON.stringify(origNames);
  }, [formData.owner.groups, initialGroupNames]);

  const hasRelevantChanges = modelsChanged || groupsChanged;

  const relatedPolicies = subscriptionId ? getRelatedPolicies(subscriptionId) : [];

  // State for Resource Preview modal
  const [isResourcePreviewModalOpen, setIsResourcePreviewModalOpen] = React.useState(false);
  const [resourcePreviewMode, setResourcePreviewMode] = React.useState<'table' | 'yaml'>('table');
  const [yamlModalContent, setYamlModalContent] = React.useState<{ title: string; yaml: string }>({
    title: '',
    yaml: '',
  });
  
  // Token limits - array of limits
  const [editTokenLimits, setEditTokenLimits] = React.useState<Array<{
    limit: number;
    perAmount: number;
    perUnit: 'minute' | 'hour' | 'day';
  }>>([{ limit: 0, perAmount: 1, perUnit: 'minute' }]);
  const [editTokenUnitSelectOpen, setEditTokenUnitSelectOpen] = React.useState<number | null>(null);

  const handleInputChange = (field: keyof CreateSubscriptionForm, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  const handleGroupSelect = (groupName: string) => {
    // Handle "Create new" option
    if (groupName === CREATE_NEW_GROUP) {
      const newGroupName = groupsInputValue.trim();
      if (newGroupName && !selectedGroups.includes(newGroupName)) {
        // Add to custom groups if not already in mock data
        if (!mockOwnerGroups.some((g) => g.name === newGroupName) && !customGroups.includes(newGroupName)) {
          setCustomGroups((prev) => [...prev, newGroupName]);
        }
        // Add to selected groups
        setSelectedGroups((prev) => {
          const newGroups = [...prev, newGroupName];
          onChange({
            ...formData,
            owner: {
              groups: newGroups.map((name) => ({ name })),
            },
          });
          return newGroups;
        });
      }
      setGroupsInputValue('');
      return;
    }

    // Regular group selection toggle
    setSelectedGroups((prev) => {
      const newGroups = prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName];

      // Update form data
      onChange({
        ...formData,
        owner: {
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
        owner: {
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

  // Combine mock groups with custom-created groups
  const allAvailableGroups = React.useMemo(() => {
    const mockGroupNames = mockOwnerGroups.map((g) => g.name);
    const customGroupObjects = customGroups
      .filter((name) => !mockGroupNames.includes(name))
      .map((name) => ({ name }));
    return [...mockOwnerGroups, ...customGroupObjects];
  }, [customGroups]);

  const filteredGroups = React.useMemo(() => {
    const inputLower = groupsInputValue.toLowerCase().trim();
    const filtered = allAvailableGroups.filter((group) =>
      group.name.toLowerCase().includes(inputLower)
    );
    
    // Check if we should show "Create new" option:
    // - User has typed something
    // - No exact match exists in available groups
    // - Not already selected
    const hasExactMatch = allAvailableGroups.some(
      (g) => g.name.toLowerCase() === inputLower
    );
    const isAlreadySelected = selectedGroups.some(
      (g) => g.toLowerCase() === inputLower
    );
    const showCreateOption = inputLower && !hasExactMatch && !isAlreadySelected;
    
    return { filtered, showCreateOption };
  }, [groupsInputValue, allAvailableGroups, selectedGroups]);

  // Get all models and track which are already added
  const addedModelIds = React.useMemo(() => {
    return new Set(formData.modelRefs.map((ref) => ref.name));
  }, [formData.modelRefs]);

  // All models available to show in the modal
  const allModelsForModal = mockMaaSModels;

  // Handle opening Add Model modal
  const handleOpenAddModelModal = () => {
    // Initialize with already-added models so they appear as selected
    setModelsToAdd(new Set(addedModelIds));
    setAddModelSearchInput('');
    setAddModelsSortIndex(0);
    setAddModelsSortDirection('asc');
    setIsAddModelModalOpen(true);
  };

  // Handle closing Add Model modal
  const handleCloseAddModelModal = () => {
    setIsAddModelModalOpen(false);
    setModelsToAdd(new Set());
    setAddModelSearchInput('');
  };

  // Handle toggling a model in the add models modal
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

  // Handle confirming model selection from the modal
  const handleAddModels = () => {
    // Build the new modelRefs array based on what's selected
    const newModelRefs: ModelRef[] = Array.from(modelsToAdd).map((modelId) => {
      // Preserve existing model ref data if it exists
      const existingRef = formData.modelRefs.find((ref) => ref.name === modelId);
      if (existingRef) {
        return existingRef;
      }
      // Create new model ref for newly added models
      return {
        name: modelId,
        tokenRateLimits: { limit: 0, window: '24h' },
        requestRateLimits: { requests: 0, perAmount: 1, perUnit: 'minute' },
      };
    });
    
    onChange({
      ...formData,
      modelRefs: newModelRefs,
    });
    
    handleCloseAddModelModal();
  };

  // Filter and sort models based on search input and sort settings
  const filteredModelsForModal = React.useMemo(() => {
    let models = [...allModelsForModal];
    
    // Apply search filter
    if (addModelSearchInput.trim()) {
      const searchTerm = addModelSearchInput.toLowerCase();
      models = models.filter(
        (model) =>
          model.name.toLowerCase().includes(searchTerm) ||
          model.description.toLowerCase().includes(searchTerm) ||
          model.id.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    const sortedModels = [...models].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      switch (addModelsSortIndex) {
        case 0: // Model name
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 1: // Project
          aValue = a.namespace.toLowerCase();
          bValue = b.namespace.toLowerCase();
          break;
        case 2: // Model ID
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
  }, [allModelsForModal, addModelSearchInput, addModelsSortIndex, addModelsSortDirection]);

  // Get subscriptions that a model belongs to
  const getModelSubscriptions = (modelId: string): string[] => {
    return mockSubscriptions
      .filter((sub) => sub.modelRefs.some((ref) => ref.name === modelId))
      .map((sub) => sub.displayName);
  };

  // Sort params for Add Models table
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

  // Handle removing a model
  const handleRemoveModel = (index: number) => {
    onChange({
      ...formData,
      modelRefs: formData.modelRefs.filter((_, i) => i !== index),
    });
  };

  // Helper to parse legacy window format (e.g., "24h") to perAmount and perUnit
  const parseWindowToAmountUnit = (window: string): { perAmount: number; perUnit: 'minute' | 'hour' | 'day' } => {
    const match = window.match(/^(\d+)([mhd])$/);
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === 'm') return { perAmount: amount, perUnit: 'minute' };
      if (unit === 'h') return { perAmount: amount, perUnit: 'hour' };
      if (unit === 'd') return { perAmount: amount, perUnit: 'day' };
    }
    return { perAmount: 1, perUnit: 'minute' };
  };

  // Handle opening Edit Token Limit modal
  const handleOpenEditTokenLimitModal = (index: number) => {
    const modelRef = formData.modelRefs[index];
    setEditingModelIndex(index);
    
    // Handle token limits - convert from legacy format if needed
    const tokenLimits = Array.isArray(modelRef.tokenRateLimits) 
      ? modelRef.tokenRateLimits 
      : [modelRef.tokenRateLimits];
    
    setEditTokenLimits(tokenLimits.map(tl => ({
      limit: tl.limit,
      perAmount: tl.perAmount ?? parseWindowToAmountUnit(tl.window).perAmount,
      perUnit: tl.perUnit ?? parseWindowToAmountUnit(tl.window).perUnit,
    })));
    
    setIsEditTokenLimitModalOpen(true);
  };

  // Handle closing Edit Token Limit modal
  const handleCloseEditTokenLimitModal = () => {
    setIsEditTokenLimitModalOpen(false);
    setEditingModelIndex(null);
    setEditTokenUnitSelectOpen(null);
  };

  // Handle saving token limit edits
  const handleSaveTokenLimitEdit = () => {
    if (editingModelIndex === null) return;
    
    const updatedRefs = [...formData.modelRefs];
    
    // Convert token limits back to storage format
    const tokenLimitsForStorage = editTokenLimits.map(tl => ({
      limit: tl.limit,
      window: `${tl.perAmount}${tl.perUnit === 'minute' ? 'm' : tl.perUnit === 'hour' ? 'h' : 'd'}`,
      perAmount: tl.perAmount,
      perUnit: tl.perUnit,
    }));
    
    updatedRefs[editingModelIndex] = {
      ...updatedRefs[editingModelIndex],
      tokenRateLimits: tokenLimitsForStorage.length === 1 ? tokenLimitsForStorage[0] : tokenLimitsForStorage,
    };
    
    onChange({ ...formData, modelRefs: updatedRefs });
    handleCloseEditTokenLimitModal();
  };

  // Add a new token limit
  const handleAddTokenLimit = () => {
    setEditTokenLimits([...editTokenLimits, { limit: 0, perAmount: 1, perUnit: 'minute' }]);
  };

  // Remove a token limit
  const handleRemoveTokenLimit = (index: number) => {
    setEditTokenLimits(editTokenLimits.filter((_, i) => i !== index));
  };

  // Update a token limit
  const handleUpdateTokenLimit = (index: number, field: string, value: any) => {
    const updated = [...editTokenLimits];
    updated[index] = { ...updated[index], [field]: value };
    setEditTokenLimits(updated);
  };

  // Get row actions for each model
  const getModelRowActions = (index: number): IAction[] => [
    {
      title: 'Edit token limits',
      onClick: () => handleOpenEditTokenLimitModal(index),
    },
    {
      isSeparator: true,
    },
    {
      title: 'Remove',
      onClick: () => handleRemoveModel(index),
    },
  ];

  // Format token limit for display
  const formatTokenLimit = (modelRef: ModelRef): React.ReactNode => {
    const limits = Array.isArray(modelRef.tokenRateLimits) 
      ? modelRef.tokenRateLimits 
      : [modelRef.tokenRateLimits];
    
    const formatted = limits.map((tl, index) => {
      let text: string;
      if (tl.limit === 0) {
        text = 'Unlimited';
      } else if (tl.perAmount && tl.perUnit) {
        text = `${tl.limit.toLocaleString()} / ${tl.perAmount} ${tl.perUnit}s`;
      } else {
        const windowLabel = windowOptions.find((opt) => opt.value === tl.window)?.label || tl.window;
        text = `${tl.limit.toLocaleString()} / ${windowLabel}`;
      }
      return <div key={index}>{text}</div>;
    });
    
    return <>{formatted}</>;
  };

  const isFormValid = () => {
    const hasModels = formData.modelRefs.length > 0 && formData.modelRefs.some((ref) => ref.name.trim() !== '');
    const priorityValid = !priorityConflict;
    return formData.displayName.trim() !== '' && formData.owner.groups.length > 0 && hasModels && priorityValid;
  };

  // Generate subscription ID from display name
  const generateSubscriptionId = (displayName: string): string => {
    if (!displayName) return 'my-subscription';
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'my-subscription';
  };

  // Generate YAML for MaaSSubscription
  const generateSubscriptionYaml = (): string => {
    const subscriptionId = generateSubscriptionId(formData.displayName);
    const modelRefsYaml = formData.modelRefs
      .filter((ref) => ref.name)
      .map((ref) => {
        const limits = Array.isArray(ref.tokenRateLimits) ? ref.tokenRateLimits : [ref.tokenRateLimits];
        const tokenLimitsYaml = limits
          .map((tl) => {
            const window = tl.perAmount && tl.perUnit 
              ? `${tl.perAmount}${tl.perUnit === 'minute' ? 'm' : tl.perUnit === 'hour' ? 'h' : 'd'}`
              : tl.window;
            return `        - limit: ${tl.limit}\n          window: ${window}`;
          })
          .join('\n');
        return `    - name: ${ref.name}\n      tokenRateLimits:\n${tokenLimitsYaml}`;
      })
      .join('\n');

    const groupsYaml = formData.owner.groups
      .map((g) => `      - name: "${g.name}"`)
      .join('\n');

    return `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: ${subscriptionId}
  namespace: opendatahub
annotation:
  display-name: "${formData.displayName || 'My Subscription'}"
  display-description: "${formData.description || 'Subscription created via OpenShift AI'}"
spec:
  priority: ${formData.priority}
  owner:
    groups:
${groupsYaml || '      # No groups selected'}
  modelRefs:
${modelRefsYaml || '    # No models added'}`;
  };

  // Generate YAML for MaaSAuthPolicy
  const generateAuthPolicyYaml = (): string => {
    const subscriptionId = generateSubscriptionId(formData.displayName);
    const modelRefsYaml = formData.modelRefs
      .filter((ref) => ref.name)
      .map((ref) => `    - ${ref.name}`)
      .join('\n');

    const groupsYaml = formData.owner.groups
      .map((g) => `      - name: "${g.name}"`)
      .join('\n');

    return `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSAuthPolicy
metadata:
  name: ${subscriptionId}-auth
  namespace: opendatahub
annotation:
  display-name: "${formData.displayName || 'My Subscription'} Access Policy"
  display-description: "Access policy for ${formData.displayName || 'subscription'}"
spec:
  modelRefs:
${modelRefsYaml || '    # No models added'}
  # Who has access (OR logic - any match grants access)
  subjects:
    groups:
${groupsYaml || '      # No groups selected'}
status:
  phase: Pending`;
  };

  // Generate YAML for MaaSModelRef
  const generateModelRefYaml = (modelRef: typeof formData.modelRefs[0]): string => {
    const modelData = getModelById(modelRef.name);
    const displayName = modelData?.name || modelRef.name;
    const description = modelData?.description || 'AI model endpoint';
    
    return `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSModelRef
metadata:
  name: ${modelRef.name}
  namespace: opendatahub
annotations:
  displayName: "${displayName}"
  description: "${description}"
  contextWindow: "8192"
spec:
  # Model reference - Kind determines which fields are available
  modelRef:
    kind: llmisvc  # llmisvc | ExternalModel
    name: ${modelRef.name}
    namespace: llm  # Optional, defaults to same namespace as MaaSModelRef
status:
  phase: Ready
  endpoint: "https://${modelRef.name}.llm.svc.cluster.local/v1"
  conditions:
    - type: Ready
      status: "True"`;
  };

  // Handle viewing YAML within the resource preview modal
  const handleViewYaml = (resourceType: string, modelRef?: typeof formData.modelRefs[0]) => {
    let yaml = '';
    let title = '';

    switch (resourceType) {
      case 'subscription':
        title = 'MaaSSubscription';
        yaml = generateSubscriptionYaml();
        break;
      case 'authPolicy':
        title = 'MaaSAuthPolicy';
        yaml = generateAuthPolicyYaml();
        break;
      case 'modelRef':
        if (modelRef) {
          title = `MaaSModelRef: ${modelRef.name}`;
          yaml = generateModelRefYaml(modelRef);
        }
        break;
      default:
        break;
    }

    setYamlModalContent({ title, yaml });
    setResourcePreviewMode('yaml');
  };

  // Get resource preview data
  const getResourcePreviewData = () => {
    const subscriptionId = generateSubscriptionId(formData.displayName);
    const modelCount = formData.modelRefs.filter((ref) => ref.name).length;
    const groupCount = formData.owner.groups.length;

    const resources: Array<{
      id: string;
      name: string;
      kind: string;
      description: string;
      yamlType: string;
      modelRef?: typeof formData.modelRefs[0];
    }> = [
      {
        id: 'subscription',
        name: subscriptionId || 'my-subscription',
        kind: 'MaaSSubscription',
        description: `Defines this subscription with access for ${groupCount} group${groupCount !== 1 ? 's' : ''} to ${modelCount} model${modelCount !== 1 ? 's' : ''}. Controls which models are included and their rate limits.`,
        yamlType: 'subscription',
      },
    ];

    if (createMatchingPolicy) {
      resources.push({
        id: 'authPolicy',
        name: `${subscriptionId || 'my-subscription'}-auth`,
        kind: 'MaaSAuthPolicy',
        description: `Authorizes members of the selected group${groupCount !== 1 ? 's' : ''} to access the models in this subscription. Also creates a backing AuthPolicy that lets users query their available subscriptions.`,
        yamlType: 'authPolicy',
      });
    }

    return resources;
  };

  // Window options for the select
  const windowOptions = [
    { label: '1 minute', value: '1m' },
    { label: '1 hour', value: '1h' },
    { label: '24 hours', value: '24h' },
    { label: '7 days', value: '7d' },
  ];

  // Rate limit time unit options
  const rateLimitUnitOptions = [
    { label: 'minutes', value: 'minute' },
    { label: 'hours', value: 'hour' },
    { label: 'days', value: 'day' },
  ];

  // State for hover effects on limit links
  const [hoveredLimitLink, setHoveredLimitLink] = React.useState<string | null>(null);

  // Handle view mode toggle
  const handleViewModeChange = (mode: 'form' | 'yaml') => {
    if (mode === 'yaml') {
      // Generate fresh YAML from current form data when switching to YAML view
      setYamlEditorContent(generateSubscriptionYaml());
    }
    setViewMode(mode);
  };

  // Handle YAML editor content change
  const handleYamlEditorChange = (value: string) => {
    setYamlEditorContent(value);
  };

  return (
    <>
      {/* View Mode Toggle Group */}
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <FlexItem>
          <ToggleGroup aria-label="View mode toggle" id="subscription-view-mode-toggle">
            <ToggleGroupItem
              text="Form"
              buttonId="subscription-view-form"
              isSelected={viewMode === 'form'}
              onChange={() => handleViewModeChange('form')}
            />
            <ToggleGroupItem
              text="YAML"
              buttonId="subscription-view-yaml"
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
            id="yaml-toggle-design-note-popover"
          >
            <Badge
              id="yaml-toggle-design-note-badge"
              style={{ backgroundColor: '#F32BC4', color: '#ffffff', fontSize: '10px', cursor: 'pointer' }}
            >
              Design note <InfoCircleIcon style={{ marginLeft: '0.25rem' }} />
            </Badge>
          </Popover>
        </FlexItem>
      </Flex>

      {viewMode === 'form' ? (
        <Form id="subscription-form" isWidthLimited style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
          <FormGroup label="Name" isRequired fieldId="subscription-name">
        <div style={{ maxWidth: '75%' }}>
          <TextInput
            id="subscription-name-input"
            value={formData.displayName}
            onChange={(_event, value) => handleInputChange('displayName', value)}
          />
        </div>
      </FormGroup>

      <FormGroup label="Description" fieldId="subscription-description">
        <div style={{ maxWidth: '75%' }}>
          <TextArea
            id="subscription-description-input"
            value={formData.description}
            onChange={(_event, value) => handleInputChange('description', value)}
            rows={2}
          />
        </div>
      </FormGroup>

      <FormGroup
        label="Priority"
        isRequired
        fieldId="subscription-priority"
        labelHelp={
          <Popover
            triggerRef={priorityLabelHelpRef}
            headerContent="Priority"
            bodyContent={
              <div>
                Use a whole number from <strong>1</strong> (lowest) to <strong>10</strong> (highest). When a user can access multiple subscriptions, the system can use priority to pick a default (for example, when creating an API key without choosing a subscription). If two subscriptions share the same priority, the cluster may surface a warning so administrators can resolve the tie.
              </div>
            }
            id="subscription-priority-popover"
          >
            <FormGroupLabelHelp
              ref={priorityLabelHelpRef}
              aria-label="More info for priority field"
              aria-describedby="subscription-priority"
            />
          </Popover>
        }
      >
        <div style={{ maxWidth: '200px' }}>
          <NumberInput
            id="subscription-priority-input"
            value={formData.priority}
            min={1}
            max={10}
            onMinus={() => handleInputChange('priority', Math.max(1, formData.priority - 1))}
            onPlus={() => handleInputChange('priority', Math.min(10, formData.priority + 1))}
            onChange={(event) => {
              const raw = (event.target as HTMLInputElement).value;
              const parsed = parseInt(raw, 10);
              if (Number.isNaN(parsed)) {
                handleInputChange('priority', 1);
              } else {
                handleInputChange('priority', Math.max(1, Math.min(10, parsed)));
              }
            }}
            inputName="subscription-priority"
            inputAriaLabel="Subscription priority"
            minusBtnAriaLabel="Decrease priority"
            plusBtnAriaLabel="Increase priority"
            minusBtnProps={{ isDisabled: formData.priority <= 1 }}
            plusBtnProps={{ isDisabled: formData.priority >= 10 }}
            widthChars={2}
          />
        </div>
        {priorityConflict ? (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant="error" icon={<ExclamationCircleIcon />} id="subscription-priority-conflict">
                  Priority {formData.priority} is already used by <strong>{priorityConflict.conflictName}</strong>.
                  {priorityConflict.suggestion !== null
                    ? ` The next available priority is ${priorityConflict.suggestion}.`
                    : ' All priorities are currently in use.'}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
        ) : (
          <Content
            component="small"
            style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--xs)' }}
            id="subscription-priority-helper"
          >
            Higher numbers rank above lower numbers when resolving defaults across multiple subscriptions.
          </Content>
        )}
      </FormGroup>

      <FormGroup 
        label="Groups" 
        fieldId="subscription-owner-groups" 
        isRequired
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
            <FormGroupLabelHelp ref={groupsLabelHelpRef} aria-label="More info for groups field" aria-describedby="subscription-owner-groups" />
          </Popover>
        }
      >
        <div style={{ maxWidth: '75%' }}>
          <Select
            id="subscription-groups-select"
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
                id="subscription-groups-toggle"
              >
                <TextInputGroup isPlain>
                  <TextInputGroupMain
                    value={groupsInputValue}
                    onClick={() => setIsGroupsSelectOpen(!isGroupsSelectOpen)}
                    onChange={(_event, value) => handleGroupsInputChange(value)}
                    onKeyDown={(event: React.KeyboardEvent) => {
                      // When Enter is pressed and there's input that would show "Create new" option
                      if (event.key === 'Enter' && filteredGroups.showCreateOption) {
                        event.preventDefault();
                        handleGroupSelect(CREATE_NEW_GROUP);
                      }
                    }}
                    autoComplete="off"
                    innerRef={groupsTextInputRef}
                    placeholder={selectedGroups.length === 0 ? "Select groups" : ""}
                    id="subscription-groups-input"
                  >
                    {selectedGroups.length > 0 && (
                      <LabelGroup aria-label="Current selections" numLabels={3}>
                        {selectedGroups.map((groupName) => (
                          <Label
                            key={groupName}
                            variant="outline"
                            id={`subscription-group-label-${groupName}`}
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
                            owner: { groups: [] },
                          });
                          groupsTextInputRef.current?.focus();
                        }}
                        aria-label="Clear input"
                        id="subscription-groups-clear-button"
                      >
                        <TimesIcon />
                      </Button>
                    )}
                  </TextInputGroupUtilities>
                </TextInputGroup>
              </MenuToggle>
            )}
          >
            <SelectList id="subscription-groups-list">
              {filteredGroups.filtered.length === 0 && !filteredGroups.showCreateOption ? (
                <SelectOption isDisabled>No results found</SelectOption>
              ) : (
                <>
                  {filteredGroups.filtered.map((group) => (
                    <SelectOption
                      key={group.name}
                      value={group.name}
                      isSelected={selectedGroups.includes(group.name)}
                      id={`subscription-group-option-${group.name}`}
                    >
                      {group.name}
                    </SelectOption>
                  ))}
                  {filteredGroups.showCreateOption && (
                    <SelectOption
                      key={CREATE_NEW_GROUP}
                      value={CREATE_NEW_GROUP}
                      id="subscription-group-option-create-new"
                    >
                      Add "{groupsInputValue.trim()}"
                    </SelectOption>
                  )}
                </>
              )}
            </SelectList>
          </Select>
        </div>
        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--xs)' }}>
          Select groups that will be able to access this subscription. You can also add the name of an OIDC group.
        </Content>
      </FormGroup>

      {/* Model Endpoints Section */}
      <FormSection
        title={
          <>
            Models{' '}
            <span className="pf-v6-c-form__label-required" aria-hidden="true">&#42;</span>
          </>
        }
      >
        <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          Add models that subscribers will be able to use.
        </Content>

        {formData.modelRefs.length > 0 && formData.modelRefs.some((ref) => ref.name) ? (
          <>
            <Table 
              aria-label="Models in subscription" 
              id="subscription-models-table" 
              variant="compact"
            >
              <Thead>
                <Tr>
                  <Th width={35}>Name</Th>
                  <Th width={15}>Project</Th>
                  <Th width={30}>Token limits</Th>
                  <Th screenReaderText="Actions" />
                </Tr>
              </Thead>
              <Tbody>
                {formData.modelRefs
                  .filter((ref) => ref.name)
                  .map((modelRef, index) => {
                    const modelData = getModelById(modelRef.name);
                    return (
                      <Tr key={modelRef.name}>
                        <Td dataLabel="Name">
                          <div>
                            <strong>{modelData?.name || modelRef.name}</strong>
                            <div style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: '0.8125rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                              {modelRef.name}
                            </div>
                            {modelData?.description && (
                              <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                {modelData.description}
                              </div>
                            )}
                          </div>
                        </Td>
                        <Td dataLabel="Project">{modelData?.namespace || '-'}</Td>
                        <Td dataLabel="Token limits">
                          <Button
                            variant="link"
                            isInline
                            onClick={() => handleOpenEditTokenLimitModal(index)}
                            onMouseEnter={() => setHoveredLimitLink(`token-${modelRef.name}`)}
                            onMouseLeave={() => setHoveredLimitLink(null)}
                            style={{
                              textDecoration: hoveredLimitLink === `token-${modelRef.name}` ? 'underline' : 'none',
                            }}
                            id={`edit-token-limit-link-${modelRef.name}`}
                          >
                            {formatTokenLimit(modelRef)}
                          </Button>
                        </Td>
                        <Td isActionCell>
                          <ActionsColumn items={getModelRowActions(index)} />
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
                id="add-models-button"
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
              id="add-models-button"
            >
              Add models
            </Button>
          </div>
        )}
      </FormSection>

      {/* Optional policy creation checkbox (create mode only) */}
      {!isEditMode && (
        <Checkbox
          id="create-matching-policy-checkbox"
          isLabelWrapped
          label={
            <>
              Create a matching authorization policy{' '}
              <Popover
                headerContent="Why create a policy?"
                bodyContent={
                  <div>
                    <p style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      A <strong>subscription</strong> (MaaSSubscription) defines which models should be available to certain groups on request, but it does not grant access to those models on its own.
                    </p>
                    <p style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                      A <strong>policy</strong> (MaaSAuthPolicy) is a separate resource that authorizes specific groups to be able to access model endpoints through the API gateway.
                    </p>
                    <p>
                      Both resources are needed in order to consume model endpoints through the API gateway.
                    </p>
                  </div>
                }
                position="right"
                id="create-policy-info-popover"
              >
                <Button
                  variant="plain"
                  aria-label="More info about access policies"
                  id="create-policy-info-button"
                  style={{ padding: 0, verticalAlign: 'middle' }}
                >
                  <OutlinedQuestionCircleIcon />
                </Button>
              </Popover>
            </>
          }
          isChecked={createMatchingPolicy}
          onChange={(_event, checked) => setCreateMatchingPolicy(checked)}
        />
      )}

      {/* Edit mode warning about policies not auto-updating */}
      {isEditMode && hasRelevantChanges && (
        <Alert
          variant="warning"
          isInline
          title="Related policies may need to be updated"
          id="edit-subscription-policy-warning"
          style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
        >
          <p>
            To avoid potential conflicts, policies related to this subscription will not be automatically updated with these changes.
            You will need to update the following policies manually to match the modified {modelsChanged && groupsChanged ? 'models and groups' : modelsChanged ? 'models' : 'groups'} in this subscription.
          </p>
          {relatedPolicies.length > 0 && (
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }} style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
              {relatedPolicies.map((policy) => (
                <FlexItem key={policy.id}>
                  <a
                    href={`/settings/policies/${policy.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`policy-warning-link-${policy.id}`}
                  >
                    {policy.name} ({policy.type}) <ExternalLinkAltIcon style={{ fontSize: '0.75em', marginLeft: '0.25rem' }} />
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
        aria-labelledby="add-models-modal-title"
      >
        <ModalHeader title="Add models to subscription" labelId="add-models-modal-title" />
        <ModalBody>
          <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Select model endpoints that are available as a service to add to this subscription.
          </Content>

          <Toolbar id="add-models-toolbar" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <ToolbarContent style={{ paddingLeft: 0, paddingRight: 0 }}>
              <ToolbarItem>
                <SearchInput
                  placeholder="Filter by name or description"
                  value={addModelSearchInput}
                  onChange={(_event, value) => setAddModelSearchInput(value)}
                  onClear={() => setAddModelSearchInput('')}
                  id="add-models-search-input"
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
            <Table aria-label="Available models" id="add-models-table" variant="compact">
              <Thead>
                <Tr>
                  <Th width={30} sort={getAddModelsSortParams(0)}>Model name</Th>
                  <Th width={15} sort={getAddModelsSortParams(1)}>Project</Th>
                  <Th width={15} sort={getAddModelsSortParams(2)}>Model ID</Th>
                  <Th width={20}>Subscriptions</Th>
                  <Th width={20} screenReaderText="Actions" />
                </Tr>
              </Thead>
              <Tbody>
                {filteredModelsForModal.map((model) => {
                  const isSelected = modelsToAdd.has(model.id);
                  const modelSubscriptions = getModelSubscriptions(model.id);
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
                      <Td dataLabel="Subscriptions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          {isSelected && (
                            <Label
                              id={`subscription-label-${model.id}`}
                              color="green"
                            >
                              {formData.displayName || 'This subscription'}
                            </Label>
                          )}
                          {modelSubscriptions.length > 0 ? (
                            modelSubscriptions.map((subName) => (
                              <div key={subName} style={{ fontSize: '0.875rem' }}>
                                {subName}
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
                          id={`add-model-action-${model.id}`}
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
            id="add-models-confirm-button"
          >
            Add models
          </Button>
          <Button variant="link" onClick={handleCloseAddModelModal} id="add-models-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Token Limit Modal */}
      <Modal
        variant={ModalVariant.medium}
        isOpen={isEditTokenLimitModalOpen}
        onClose={handleCloseEditTokenLimitModal}
        aria-labelledby="edit-token-limit-modal-title"
      >
        <ModalHeader
          title={`Edit token limits: ${editingModelIndex !== null ? getModelById(formData.modelRefs[editingModelIndex]?.name)?.name || formData.modelRefs[editingModelIndex]?.name : ''}`}
          labelId="edit-token-limit-modal-title"
        />
        <ModalBody>
          <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Set limits on the number of tokens that can be consumed.
          </Content>
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            {editTokenLimits.map((tokenLimit, index) => (
              <FlexItem key={index}>
                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }}>
                  <FlexItem>
                    <NumberInput
                      id={`edit-token-limit-input-${index}`}
                      value={tokenLimit.limit}
                      onMinus={() => handleUpdateTokenLimit(index, 'limit', Math.max(0, tokenLimit.limit - 1000))}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 0;
                        handleUpdateTokenLimit(index, 'limit', value);
                      }}
                      onPlus={() => handleUpdateTokenLimit(index, 'limit', tokenLimit.limit + 1000)}
                      inputName={`token-limit-${index}`}
                      inputAriaLabel={`Token limit ${index + 1} amount`}
                      minusBtnAriaLabel="Decrease token limit"
                      plusBtnAriaLabel="Increase token limit"
                      min={0}
                    />
                  </FlexItem>
                  <FlexItem>tokens per</FlexItem>
                  <FlexItem>
                    <NumberInput
                      id={`edit-token-amount-input-${index}`}
                      value={tokenLimit.perAmount}
                      onMinus={() => handleUpdateTokenLimit(index, 'perAmount', Math.max(1, tokenLimit.perAmount - 1))}
                      onChange={(event) => {
                        const value = parseInt((event.target as HTMLInputElement).value) || 1;
                        handleUpdateTokenLimit(index, 'perAmount', Math.max(1, value));
                      }}
                      onPlus={() => handleUpdateTokenLimit(index, 'perAmount', tokenLimit.perAmount + 1)}
                      inputName={`token-period-amount-${index}`}
                      inputAriaLabel={`Token limit ${index + 1} time period amount`}
                      minusBtnAriaLabel="Decrease time period"
                      plusBtnAriaLabel="Increase time period"
                      min={1}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Select
                      id={`edit-token-unit-select-${index}`}
                      isOpen={editTokenUnitSelectOpen === index}
                      selected={tokenLimit.perUnit}
                      onSelect={(_event, value) => {
                        handleUpdateTokenLimit(index, 'perUnit', value as 'minute' | 'hour' | 'day');
                        setEditTokenUnitSelectOpen(null);
                      }}
                      onOpenChange={(isOpen) => setEditTokenUnitSelectOpen(isOpen ? index : null)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setEditTokenUnitSelectOpen(editTokenUnitSelectOpen === index ? null : index)}
                          isExpanded={editTokenUnitSelectOpen === index}
                          id={`edit-token-unit-toggle-${index}`}
                        >
                          {rateLimitUnitOptions.find((opt) => opt.value === tokenLimit.perUnit)?.label || 'minute'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {rateLimitUnitOptions.map((option) => (
                          <SelectOption key={option.value} value={option.value} id={`edit-token-unit-option-${index}-${option.value}`}>
                            {option.label}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="plain"
                      aria-label={`Remove token limit ${index + 1}`}
                      onClick={() => handleRemoveTokenLimit(index)}
                      id={`remove-token-limit-button-${index}`}
                      isDisabled={editTokenLimits.length === 1}
                    >
                      <MinusCircleIcon />
                    </Button>
                  </FlexItem>
                </Flex>
              </FlexItem>
            ))}
            <FlexItem>
              <Button
                variant="link"
                icon={<PlusCircleIcon />}
                onClick={handleAddTokenLimit}
                id="add-token-limit-button"
              >
                Add token rate limit
              </Button>
            </FlexItem>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleSaveTokenLimitEdit} id="edit-token-limit-save-button">
            Save
          </Button>
          <Button variant="link" onClick={handleCloseEditTokenLimitModal} id="edit-token-limit-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Preview Resources Button removed from here - moved to ActionGroup footer */}

      {/* Resource Preview Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isResourcePreviewModalOpen}
        onClose={() => {
          setIsResourcePreviewModalOpen(false);
          setResourcePreviewMode('table');
        }}
        aria-labelledby="resource-preview-modal-title"
      >
        <ModalHeader
          title={resourcePreviewMode === 'table' ? 'Resource preview' : yamlModalContent.title}
          labelId="resource-preview-modal-title"
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
                  href="https://console-openshift-console.apps.example.com/k8s/ns/opendatahub/maas.opendatahub.io~v1alpha1~MaaSSubscription"
                  target="_blank"
                  id="openshift-console-link"
                >
                  OpenShift Web Console
                  <Icon size="sm" style={{ marginLeft: '0.25rem' }}>
                    <ExternalLinkAltIcon />
                  </Icon>
                </Button>
                .
              </Content>

              <Table aria-label="Resources to be created" id="resource-preview-table" variant="compact">
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
                              color={resource.kind === 'MaaSSubscription' ? 'teal' : 'orange'}
                              isCompact
                              id={`resource-kind-label-${resource.id}`}
                            >
                              {resource.kind === 'MaaSSubscription' ? 'MS' : 'MAP'}
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
                          onClick={() => handleViewYaml(resource.yamlType, resource.modelRef)}
                          id={`view-yaml-${resource.id}`}
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
                id="return-to-preview-button"
                style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
              >
                <Icon size="sm" style={{ marginRight: '0.25rem' }}>
                  <AngleRightIcon style={{ transform: 'rotate(180deg)' }} />
                </Icon>
                Return to preview
              </Button>
              <CodeBlock id="yaml-preview-codeblock">
                <CodeBlockCode id="yaml-preview-code">{yamlModalContent.yaml}</CodeBlockCode>
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
            id="resource-preview-modal-close-button"
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
              id="subscription-submit-button"
            >
              {isEditMode ? 'Save' : 'Create subscription'}
            </Button>
            {!isEditMode && (
              <Button
                variant="secondary"
                onClick={() => {
                  setResourcePreviewMode('table');
                  setIsResourcePreviewModalOpen(true);
                }}
                id="preview-resources-button"
              >
                Preview resources
              </Button>
            )}
            <Button variant="link" onClick={onCancel} id="subscription-cancel-button">
              Cancel
            </Button>
          </ActionGroup>
        </Form>
      ) : (
        /* YAML Editor View with Tabs and Sidebar */
        <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
          {/* Resource Tabs */}
          {(() => {
            const modelsWithLimits = formData.modelRefs.filter((ref) => {
              const limits = Array.isArray(ref.tokenRateLimits) ? ref.tokenRateLimits : [ref.tokenRateLimits];
              return ref.name && limits.some((tl) => tl.limit > 0);
            });
            
            return (
              <Tabs
                activeKey={activeYamlTabKey}
                onSelect={(_event, tabKey) => {
                  setActiveYamlTabKey(tabKey as string);
                  // Reset schema view when switching tabs
                  setSchemaBreadcrumb([]);
                  setCurrentSchemaView(null);
                }}
                id="yaml-resource-tabs"
                aria-label="Resource YAML tabs"
                style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
              >
                <Tab
                  eventKey="subscription"
                  title={<TabTitleText>MaaSSubscription</TabTitleText>}
                  id="yaml-tab-subscription"
                />
                <Tab
                  eventKey="authPolicy"
                  title={<TabTitleText>MaaSAuthPolicy</TabTitleText>}
                  id="yaml-tab-auth-policy"
                />
                {modelsWithLimits.length > 0 && (
                  <Tab
                    eventKey={`modelRef-${modelsWithLimits[0].name}`}
                    title={<TabTitleText>MaaSModelRef{modelsWithLimits.length > 1 ? ` (${modelsWithLimits.length})` : `: ${modelsWithLimits[0].name}`}</TabTitleText>}
                    id="yaml-tab-model-ref"
                  />
                )}
              </Tabs>
            );
          })()}

          {/* Drawer with Editor and Sidebar */}
          <Drawer isExpanded={isSidebarExpanded} isInline id="yaml-editor-drawer">
            <DrawerContent
              panelContent={
                <DrawerPanelContent
                  isResizable
                  defaultSize="400px"
                  minSize="250px"
                  maxSize="600px"
                  id="yaml-sidebar-panel"
                >
                  <DrawerHead>
                    <Title headingLevel="h3" size="lg">
                      {activeYamlTabKey === 'subscription'
                        ? 'MaaSSubscription'
                        : activeYamlTabKey === 'authPolicy'
                        ? 'MaaSAuthPolicy'
                        : 'MaaSModelRef'}
                    </Title>
                    <DrawerActions>
                      <DrawerCloseButton onClick={() => setIsSidebarExpanded(false)} />
                    </DrawerActions>
                  </DrawerHead>
                  <DrawerPanelBody>
                    {/* Sidebar Tabs: Schema and Samples */}
                    <Tabs
                      activeKey={sidebarActiveTabKey}
                      onSelect={(_event, tabKey) => setSidebarActiveTabKey(tabKey as number)}
                      id="sidebar-tabs"
                      aria-label="Schema and samples tabs"
                      isBox
                    >
                      <Tab eventKey={0} title={<TabTitleText>Schema</TabTitleText>} id="sidebar-tab-schema">
                        <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
                          {/* Schema Breadcrumb */}
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
                                  id="schema-breadcrumb-root"
                                >
                                  {activeYamlTabKey === 'subscription'
                                    ? 'MaaSSubscription'
                                    : activeYamlTabKey === 'authPolicy'
                                    ? 'MaaSAuthPolicy'
                                    : 'TokenRateLimitPolicy'}
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
                                      id={`schema-breadcrumb-${prop.name}`}
                                    >
                                      {prop.name}
                                    </Button>
                                  )}
                                </BreadcrumbItem>
                              ))}
                            </Breadcrumb>
                          )}

                          {/* Schema Content */}
                          {(() => {
                            const schema =
                              activeYamlTabKey === 'subscription'
                                ? maasSubscriptionSchema
                                : activeYamlTabKey === 'authPolicy'
                                ? maasAuthPolicySchema
                                : maasModelRefSchema;

                            const propsToShow = currentSchemaView?.children || schema.properties;
                            const description = currentSchemaView?.description || schema.description;

                            return (
                              <>
                                <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                  {description}
                                </Content>
                                <List isPlain id="schema-properties-list">
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
                                              id={`schema-prop-link-${prop.name}`}
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
                                          <Label isCompact color="blue" id={`schema-type-${prop.name}`}>
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
                      <Tab eventKey={1} title={<TabTitleText>Samples</TabTitleText>} id="sidebar-tab-samples">
                        <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
                          {(() => {
                            const samples =
                              activeYamlTabKey === 'subscription'
                                ? maasSubscriptionSamples
                                : activeYamlTabKey === 'authPolicy'
                                ? maasAuthPolicySamples
                                : maasModelRefSamples;

                            return (
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                                {samples.map((sample) => (
                                  <FlexItem key={sample.id}>
                                    <Card isCompact id={`sample-card-${sample.id}`}>
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
                                                id={`sample-try-${sample.id}`}
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
                                                id={`sample-download-${sample.id}`}
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
                {/* Toolbar with sidebar toggle and model selector */}
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  <FlexItem>
                    {/* Model selector for MaaSModelRef tab */}
                    {activeYamlTabKey.startsWith('modelRef-') && (() => {
                      const modelsWithLimits = formData.modelRefs.filter((ref) => {
                        const limits = Array.isArray(ref.tokenRateLimits) ? ref.tokenRateLimits : [ref.tokenRateLimits];
                        return ref.name && limits.some((tl) => tl.limit > 0);
                      });
                      
                      if (modelsWithLimits.length > 1) {
                        // Initialize selected model if not set
                        const currentModel = selectedTokenLimitModel || modelsWithLimits[0]?.name || '';
                        
                        return (
                          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                            <FlexItem>
                              <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                                Model:
                              </Content>
                            </FlexItem>
                            <FlexItem>
                              <ToggleGroup aria-label="Select model for rate limit policy" id="token-limit-model-selector">
                                {modelsWithLimits.map((modelRef) => (
                                  <ToggleGroupItem
                                    key={modelRef.name}
                                    text={getModelById(modelRef.name)?.name || modelRef.name}
                                    buttonId={`model-toggle-${modelRef.name}`}
                                    isSelected={currentModel === modelRef.name || (!selectedTokenLimitModel && modelRef.name === modelsWithLimits[0]?.name)}
                                    onChange={() => setSelectedTokenLimitModel(modelRef.name)}
                                  />
                                ))}
                              </ToggleGroup>
                            </FlexItem>
                          </Flex>
                        );
                      }
                      return null;
                    })()}
                  </FlexItem>
                  <FlexItem>
                    {/* Sidebar Toggle Button when collapsed */}
                    {!isSidebarExpanded && (
                      <Button
                        variant="link"
                        onClick={() => setIsSidebarExpanded(true)}
                        icon={<OutlinedQuestionCircleIcon />}
                        id="toggle-sidebar-button"
                      >
                        View sidebar
                      </Button>
                    )}
                  </FlexItem>
                </Flex>
                
                {/* YAML Editor */}
                <CodeEditor
                  id="subscription-yaml-editor"
                  isLineNumbersVisible
                  isLanguageLabelVisible
                  language={Language.yaml}
                  height="500px"
                  code={
                    activeYamlTabKey === 'subscription'
                      ? yamlEditorContent || generateSubscriptionYaml()
                      : activeYamlTabKey === 'authPolicy'
                      ? generateAuthPolicyYaml()
                      : (() => {
                          // For TokenRateLimitPolicy tab
                          const modelsWithLimits = formData.modelRefs.filter((ref) => {
                            const limits = Array.isArray(ref.tokenRateLimits) ? ref.tokenRateLimits : [ref.tokenRateLimits];
                            return ref.name && limits.some((tl) => tl.limit > 0);
                          });
                          const modelName = selectedTokenLimitModel || modelsWithLimits[0]?.name || '';
                          const modelRef = formData.modelRefs.find((ref) => ref.name === modelName);
                          return modelRef ? generateModelRefYaml(modelRef) : '';
                        })()
                  }
                  onChange={(value) => {
                    if (activeYamlTabKey === 'subscription') {
                      handleYamlEditorChange(value);
                    }
                    // For other tabs, we'd need to parse and update the appropriate data
                  }}
                />
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>

          <ActionGroup style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
            <Button
              variant="primary"
              onClick={onSubmit}
              id="subscription-yaml-submit-button"
            >
              {isEditMode ? 'Save' : 'Apply YAMLs'}
            </Button>
            <Button variant="link" onClick={onCancel} id="subscription-yaml-cancel-button">
              Cancel
            </Button>
          </ActionGroup>
        </div>
      )}
    </>
  );
};

export { SubscriptionForm };
