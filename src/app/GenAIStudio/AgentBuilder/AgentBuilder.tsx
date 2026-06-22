import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  ExpandableSection,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  Grid,
  GridItem,
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
  MultipleFileUpload,
  MultipleFileUploadMain,
  MultipleFileUploadStatus,
  MultipleFileUploadStatusItem,
  PageSection,
  Pagination,
  Progress,
  Select,
  SelectList,
  SelectOption,
  Slider,
  Spinner,
  Switch,
  TextArea,
  TextInput,
  Title,
  Tooltip
} from '@patternfly/react-core';
import { 
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@patternfly/react-table';
import { 
  ChartLineIcon,
  CheckCircleIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EllipsisVIcon,
  FileIcon,
  FilterIcon,
  FolderOpenIcon,
  LockIcon,
  LockOpenIcon,
  OutlinedFolderIcon,
  ToolsIcon
} from '@patternfly/react-icons';
import Chatbot, {
  ChatbotDisplayMode,
} from "@patternfly/chatbot/dist/dynamic/Chatbot";
import ChatbotContent from "@patternfly/chatbot/dist/dynamic/ChatbotContent";
import ChatbotWelcomePrompt from "@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt";
import ChatbotFooter, {
  ChatbotFootnote,
} from "@patternfly/chatbot/dist/dynamic/ChatbotFooter";
import MessageBar from "@patternfly/chatbot/dist/dynamic/MessageBar";
import MessageBox from "@patternfly/chatbot/dist/dynamic/MessageBox";
import Message, {
  MessageProps,
} from "@patternfly/chatbot/dist/dynamic/Message";


import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { IDELayout } from './layouts/IDELayout';
import { WorkflowLayout } from './layouts/WorkflowLayout';
import { mcpServerLogos } from '@app/AIHub/MVPServers/mcpServerLogos';
import EmptyPlaygroundSvg from '@app/assets/empty-playground.svg';
import { mockAPIKeys } from '@app/Settings/APIKeys/mockData';
import '@app/app.css';

// Interfaces
interface PlaygroundModel {
  id: string;
  name: string;
  slug: string;
  endpoint: string;
  token: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolResponses?: {
    name: string;
    content: string;
    status?: 'success' | 'error' | 'loading';
  }[];
  referencedFiles?: File[];
}

interface MCPServer {
  id: number;
  slug: string;
  name: string;
  provider: string;
  type: string;
  logo: string;
  description: string;
  status: string;
  statusColor: string;
  isAdded: boolean;
}

interface Tool {
  name: string;
  description: string;
}

// Create simple avatar representations for Agent Builder
const userAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%230066cc'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='white' font-family='sans-serif' font-size='14'%3EU%3C/text%3E%3C/svg%3E";
const agentAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%238b5cf6'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='white' font-family='sans-serif' font-size='14'%3EA%3C/text%3E%3C/svg%3E";

const agentFootnoteProps = {
  label: "Agent uses AI. Check for mistakes.",
  popover: {
    title: "Verify agent responses",
    description: `While this AI agent strives for accuracy, AI is experimental and can make mistakes. We cannot guarantee that all information provided by the agent is up to date or without error. You should always verify responses using reliable sources, especially for crucial information and decision making.`,
    cta: {
      label: "Dismiss",
      onClick: () => {
        console.log("Dismissed agent footnote popover");
      },
    },
  },
};



const AgentBuilder: React.FunctionComponent = () => {
  useDocumentTitle("AI Playground");

  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [selectedServerForAuth, setSelectedServerForAuth] = useState<string>('');
  const [oauthForms, setOAuthForms] = useState<Record<string, {clientId: string; clientSecret: string; redirectUri: string}>>({});
  const [authenticatedServers, setAuthenticatedServers] = useState<Set<string>>(new Set());
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [mcpSortBy, setMcpSortBy] = useState<{index: number; direction: 'asc' | 'desc'}>({
    index: 0, // Default sort by Name
    direction: 'asc'
  });
  
  // Agent configuration form state
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    selectedModel: 'llama-3.1-8b-instruct',
    temperature: 0.6,
    topP: 0.9,
    maxTokens: 2700,
    repetition: 1.0,
    streaming: true,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
    knowledgeSources: [] as string[],
    mcpServers: [] as string[],
    inputGuardrail: '',
    outputGuardrail: '',
    evaluationMetrics: [] as string[]
  });

  // Chat state for testing the agent
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMcpServers, setSelectedMcpServers] = useState<string[]>(() => {
    // Initialize from localStorage if available and persist flag is enabled
    try {
      if (flags.persistData) {
      const saved = localStorage.getItem('playgroundMcpServers');
      return saved ? JSON.parse(saved) : [];
      }
      return [];
    } catch {
      return [];
    }
  });
  const [, setMcpServersLastModified] = useState<Date>(new Date());

  // PatternFly Chatbot state
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(false);
  const [announcement, setAnnouncement] = useState<string>();
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  // Save selectedMcpServers to localStorage when it changes (if persist flag is enabled)
  useEffect(() => {
    if (flags.persistData) {
    localStorage.setItem('playgroundMcpServers', JSON.stringify(selectedMcpServers));
    }
  }, [selectedMcpServers, flags.persistData]);

  // Auto-scroll to the latest message
  React.useEffect(() => {
    // don't scroll the first load
    if (chatHistory.length > 0) {
      scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);


  
  // Tools modal state
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [selectedServerForTools, setSelectedServerForTools] = useState<MCPServer | null>(null);
  
  // Tool toggle state - load from localStorage (if persist flag is enabled)
  const [enabledTools, setEnabledTools] = useState<Record<string, Record<string, boolean>>>(() => {
    if (flags.persistData) {
    const saved = localStorage.getItem('enabledMcpTools');
    return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Model select dropdown state
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  
  // API key select dropdown state
  const [isApiKeySelectOpen, setIsApiKeySelectOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState('Playground (free)');
  
  // Project select dropdown state
  const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);
  
  // Kebab menu dropdown state
  const [isKebabMenuOpen, setIsKebabMenuOpen] = useState(false);
  
  // Model selection modal state
  const [isModelSelectionModalOpen, setIsModelSelectionModalOpen] = useState(false);
  const [selectedModelsForPlayground, setSelectedModelsForPlayground] = useState<Set<string>>(new Set());
  const [isModalFilterDropdownOpen, setIsModalFilterDropdownOpen] = useState(false);
  const [modalFilterBy, setModalFilterBy] = useState('name');
  const [modalSearchText, setModalSearchText] = useState('');
  
  // Status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [configProgress, setConfigProgress] = useState(0);
  const [currentConfigStep, setCurrentConfigStep] = useState(0);
  const [configSteps] = useState([
    { label: 'Verifying model details', completed: false },
    { label: 'Checking model compatibility', completed: false },
    { label: 'Checking for available MCP servers', completed: false },
    { label: 'Validating your configuration', completed: false }
  ]);
  
  // MCP table responsive state
  const [mcpTableWidth, setMcpTableWidth] = useState<number>(0);
  const [mcpRowKebabStates, setMcpRowKebabStates] = useState<Record<string, boolean>>({});
  
  // Tool response expandable state
  const [toolResponseExpandedStates, setToolResponseExpandedStates] = useState<Record<string, boolean>>({});
  
  // RAG on/off state
  const [isRagEnabled, setIsRagEnabled] = useState<boolean>(true);
  
  // Track when files were last uploaded to only show labels on new messages
  
  // Kebab menu handlers
  const handleConfigure = () => {
    setIsKebabMenuOpen(false);
    // Open model selection modal directly in playground
    setIsModelSelectionModalOpen(true);
    // Start with no models selected - let user choose
    setSelectedModelsForPlayground(new Set());
  };
  
  const handleDelete = () => {
    setIsKebabMenuOpen(false);
    // TODO: Implement delete functionality
    console.log('Delete clicked');
  };

  // Model selection modal handlers
  const handleModelSelectionToggle = (modelId: string) => {
    setSelectedModelsForPlayground(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const handleConfigurePlaygroundModal = () => {
    // Close model selection modal and open status modal
    setIsModelSelectionModalOpen(false);
    setIsStatusModalOpen(true);
    setConfigProgress(0);
    setCurrentConfigStep(0);
    
    // Start the auto-configuration process
    startAutoConfiguration();
  };

  const startAutoConfiguration = () => {
    const steps = [
      { delay: 1000, progress: 25, message: 'Verifying model details' },
      { delay: 1500, progress: 50, message: 'Checking model compatibility' },
      { delay: 2000, progress: 75, message: 'Checking for available MCP servers' },
      { delay: 1000, progress: 100, message: 'Validating your configuration' }
    ];

    let currentStep = 0;
    const processStep = () => {
      if (currentStep < steps.length) {
        setTimeout(() => {
          setConfigProgress(steps[currentStep].progress);
          setCurrentConfigStep(currentStep);
          currentStep++;
          processStep();
        }, steps[currentStep].delay);
      } else {
        // Configuration complete - save selected models to localStorage
        setTimeout(() => {
          // Get the full model details for selected models
          const allPossibleModels = [
            { 
              id: '1',
              name: 'llama-3.1-8b-instruct',
              slug: 'llama-3-1-8b-instruct',
              endpoint: 'http://llama-3-1-8b.demo-namespace.svc.cluster.local:8080/v1',
              token: 'sk-internal-token-123'
            },
            { 
              id: '2',
              name: 'granite-7b-code',
              slug: 'granite-7b-code',
              endpoint: 'http://granite-7b-code.demo-namespace.svc.cluster.local:8080/v1',
              token: 'sk-internal-granite-789'
            },
            { 
              id: '3',
              name: 'mistral-7b-instruct',
              slug: 'mistral-7b-instruct',
              endpoint: 'http://mistral-7b.demo-namespace.svc.cluster.local:8080/v1',
              token: 'sk-internal-mistral-abc'
            },
            { 
              id: '4',
              name: 'gpt-oss-120b-FP8-Dynamic',
              slug: 'gpt-oss-120b-fp8-dynamic',
              endpoint: 'http://gpt-oss-120b.demo-namespace.svc.cluster.local:8080/v1',
              token: 'sk-internal-gpt-oss-120b-xyz'
            }
          ];

          // Only save non-default models (granite and gpt) to localStorage
          const selectedModelDetails = allPossibleModels.filter(model => 
            selectedModelsForPlayground.has(model.id) && 
            (model.name === 'granite-7b-code' || model.name === 'gpt-oss-120b-FP8-Dynamic')
          );

          // Update localStorage with selected non-default models
          localStorage.setItem('playgroundModels', JSON.stringify(selectedModelDetails));

          setIsStatusModalOpen(false);
          setConfigProgress(0);
          setCurrentConfigStep(0);
          console.log('Configuration complete with models:', Array.from(selectedModelsForPlayground));
        }, 1000);
      }
    };

    processStep();
  };

  const handleCancelModelSelection = () => {
    setIsModelSelectionModalOpen(false);
    setSelectedModelsForPlayground(new Set());
    // Reset search when closing modal
    setModalSearchText('');
    setModalFilterBy('name');
  };
  
  // MCP row kebab menu handlers
  const handleMcpRowKebabToggle = (serverSlug: string, isOpen: boolean) => {
    setMcpRowKebabStates(prev => ({ ...prev, [serverSlug]: isOpen }));
  };
  
  // Tool response expandable handlers
  const handleToolResponseToggle = (toolId: string) => {
    setToolResponseExpandedStates(prev => ({ 
      ...prev, 
      [toolId]: !prev[toolId] 
    }));
  };
  
  
  // MCP table resize observer
  const mcpTableRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mcpTableRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMcpTableWidth(entry.contentRect.width);
      }
    });
    
    resizeObserver.observe(mcpTableRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);
  
  // Helper function to get models available in playground
  const getAvailableModels = useCallback(() => {
    // Default models that are always available (pre-registered)
    const defaultModels = [
      { value: 'llama-3.1-8b-instruct', label: 'llama-3.1-8b-instruct' },
      { value: 'mistral-7b-instruct', label: 'mistral-7b-instruct' }
    ];
    
    // Get models that have been explicitly added to playground from localStorage
    const playgroundModels = JSON.parse(localStorage.getItem('playgroundModels') || '[]');
    
    // Only include granite, gpt, and Pixtral models if they were explicitly added through config flow
    const addedModels = playgroundModels
      .filter((model: PlaygroundModel) => model.name === 'granite-7b-code' || model.name === 'gpt-oss-120b-FP8-Dynamic' || model.name === 'Pixtral-Large-Instruct-2411-hf-quantized.w8a8')
      .map((model: PlaygroundModel) => ({
        value: model.name,
        label: model.name
      }));
    
    // Combine default models with added models
    return [...defaultModels, ...addedModels];
  }, []); // Empty dependency array since this function only depends on localStorage
  
  // Handle model selection when project changes or when localStorage models change
  useEffect(() => {
    const availableModels = getAvailableModels();
    const currentModel = agentConfig.selectedModel;
    
    // Check if current model is still available
    const isCurrentModelAvailable = availableModels.some(model => model.value === currentModel);
    
    if (!isCurrentModelAvailable && availableModels.length > 0) {
      // Switch to the first available model
      setAgentConfig(prev => ({ 
        ...prev, 
        selectedModel: availableModels[0].value 
      }));
    }
  }, [selectedProject, agentConfig.selectedModel, getAvailableModels]);

  // Listen for localStorage changes to update available models
  useEffect(() => {
    const handleStorageChange = () => {
      // Re-evaluate available models when localStorage changes
      const availableModels = getAvailableModels();
      const currentModel = agentConfig.selectedModel;
      
      const isCurrentModelAvailable = availableModels.some(model => model.value === currentModel);
      
      if (!isCurrentModelAvailable && availableModels.length > 0) {
        setAgentConfig(prev => ({ 
          ...prev, 
          selectedModel: availableModels[0].value 
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [agentConfig.selectedModel, getAvailableModels]);

  // Clear playground models on component mount to reset to default state
  // But only if not navigating with a preselected model
  useEffect(() => {
    const navigationState = location.state as { 
      preselectedModel?: string; 
      modelEndpoint?: string; 
      modelToken?: string;
    } | null;
    
    // Only clear localStorage if not coming from a "Try in playground" navigation
    if (!navigationState?.preselectedModel) {
      localStorage.removeItem('playgroundModels');
      localStorage.removeItem('modelsWithEndpoints');
      console.log('Cleared playground models - reverted to default state');
    } else {
      console.log('Preserving playground models - navigated with preselected model:', navigationState.preselectedModel);
    }
  }, [location.state]); // Include location.state dependency



  // Resize handlers removed - now using PatternFly Drawer's built-in resizing

  // Save selected MCP servers to localStorage (if persist flag is enabled)
  useEffect(() => {
    if (flags.persistData) {
    try {
      localStorage.setItem('playgroundMcpServers', JSON.stringify(selectedMcpServers));
    } catch {
      // Ignore localStorage errors
    }
    }
  }, [selectedMcpServers, flags.persistData]);

  // Clear localStorage data when persistData flag is turned off
  useEffect(() => {
    if (!flags.persistData) {
      try {
        localStorage.removeItem('playgroundMcpServers');
        localStorage.removeItem('enabledMcpTools');
        // Reset state to default values
        setSelectedMcpServers([]);
        setEnabledTools({});
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [flags.persistData]);

  // MCP servers data (same as catalog)
  const mcpServers = useMemo(() => [
    {
      id: 1,
      slug: "mcp-kubernetes-server",
      name: "Kubernetes MCP Server",
      provider: "feiskyer",
      type: "PUBLIC",
      logo: mcpServerLogos['mcp-kubernetes-server'],
      description: "Python-powered server that translates natural language into kubectl actions and provides cluster introspection to agents. Gives AI agents the ability to query pod health, describe resources, or perform dry-run actions across OpenShift or Kubernetes clusters.",
      status: "Available",
      statusColor: "#3E8635",
      isAdded: false
    },
    {
      id: 2,
      slug: "slack-mcp-server",
      name: "Slack MCP Server",
      provider: "korotovsky",
      type: "PUBLIC",
      logo: mcpServerLogos['slack-mcp-server'],
      description: "MIT-licensed server that lets AI agents post, read threads, DM users, and trigger Slack workflows; supports stdio + SSE, proxy mode, and fine-grained token scopes. Instant DevOps productivity tool.",
      status: "Available",
      statusColor: "#3E8635",
      isAdded: false
    },
    {
      id: 3,
      slug: "servicenow-mcp-server",
      name: "ServiceNow MCP Server",
      provider: "echelon-ai-labs",
      type: "PUBLIC",
      logo: mcpServerLogos['servicenow-mcp-server'],
      description: "Open-source repo and certified Store app; AI can query, create, or update incidents, change requests, catalog items, etc., with full OAuth support. Automates ticket triage and change-management chatbots.",
      status: "Available",
      statusColor: "#3E8635",
      isAdded: false
    },
    {
      id: 4,
      slug: "salesforce-mcp-server",
      name: "Salesforce MCP Server",
      provider: "tsmztech",
      type: "PUBLIC",
      logo: mcpServerLogos['salesforce-mcp-server'],
      description: "CLI-installable server that exposes SOQL querying, record CRUD, Apex code access, and schema introspection. lets support or sales assistants pull account context, open cases, and update opportunities directly from AI prompts.",
      status: "Available",
      statusColor: "#3E8635",
      isAdded: false
    },
    {
      id: 5,
      slug: "splunk-mcp-server",
      name: "Splunk MCP Server",
      provider: "livehybrid",
      type: "PUBLIC",
      logo: mcpServerLogos['splunk-mcp-server'],
      description: "FastMCP-based tool that runs SPL queries, returns logs/metrics, and auto-scrubs sensitive data. Enables an AI SRE bot to explain spikes, correlate incidents, or draft post-mortems using live Splunk data.",
      status: "Available",
      statusColor: "#3E8635",
      isAdded: false
    },
    {
      id: 6,
      slug: "dynatrace-mcp-server",
      name: "Dynatrace MCP Server",
      provider: "dynatrace-oss",
      type: "PUBLIC",
      logo: mcpServerLogos['dynatrace-mcp-server'],
      description: "Official Dynatrace-OSS project exposing DQL queries, problem feeds, and vulnerability data. Gives agents real-time service health, letting them recommend rollbacks or capacity fixes inside OpenShift.",
      status: "Available",
      statusColor: "#3E8635",
      isAdded: false
    },
    {
      id: 7,
      slug: "github-mcp-server",
      name: "GitHub MCP Server",
      provider: "github",
      type: "PUBLIC",
      logo: mcpServerLogos['github-mcp-server'],
      description: "GitHub-maintained server for listing repos, issues, PRs, commits and creating comments/branches. Fuels coding copilots that can open PRs, draft release notes, or review diffs while respecting repo permissions.",
      status: "Available",
      statusColor: "#3E8635",
      isAdded: false
    },
    {
      id: 8,
      slug: "postgres-mcp-server",
      name: "PostgreSQL MCP Server",
      provider: "modelcontextprotocol",
      type: "PUBLIC",
      logo: mcpServerLogos['postgres-mcp-server'],
      description: "Read-only SQL querying with schema discovery, run in a container or as a Node service. Ideal for healthcare/finance use-cases that need tight RBAC, audit trails, and deterministic queries against clinical or financial databases.",
      status: "Available",
      statusColor: "#3E8635",
      isAdded: false
    },
    {
      id: 9,
      slug: "zapier-mcp-server",
      name: "Zapier",
      provider: "zapier",
      type: "PUBLIC",
      logo: mcpServerLogos['zapier-mcp-server'],
      description: "Hosted server that unlocks 7,000-plus SaaS actions via Zapier without writing glue code. Swiss-army-knife for quick PoCs: one endpoint gives agents access to calendars, Jira, NetSuite, etc., under Zapier's enterprise security model.",
      status: "Unavailable",
      statusColor: "#C9190B",
      isAdded: false
    }
  ], []); // Empty dependency array since this is static data





  // Handle incoming server from "Try in Playground" button
  useEffect(() => {
    const serverToAdd = searchParams.get('addServer');
    if (serverToAdd && !selectedMcpServers.includes(serverToAdd)) {
      setSelectedMcpServers(prev => [...prev, serverToAdd]);
      // Clear the URL parameter after adding the server
      setSearchParams(params => {
        params.delete('addServer');
        return params;
      });
    }
  }, [searchParams, selectedMcpServers, setSearchParams]);

  // Check for existing tokens on component mount
  useEffect(() => {
    const authenticatedServersList: string[] = [];
    mcpServers.forEach(server => {
      const existingToken = sessionStorage.getItem(`mcp-token-${server.name}`);
      if (existingToken) {
        authenticatedServersList.push(server.name);
      }
    });
    if (authenticatedServersList.length > 0) {
      setAuthenticatedServers(new Set(authenticatedServersList));
    }
  }, [mcpServers]);

  // Accordion toggle handler
  const onToggle = (id: string) => {
    const index = expandedSections.indexOf(id);
    const newExpanded = [...expandedSections];
    if (index >= 0) {
      newExpanded.splice(index, 1);
    } else {
      newExpanded.push(id);
    }
    setExpandedSections(newExpanded);
  };

  // File upload handlers
  const handleFileDrop = (_event: unknown, files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
    // Removed filesLastUploadedTime state
  };

  const handleFileRemove = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  // Helper function to get current form for a server
  const getCurrentForm = (serverName: string) => {
    return oauthForms[serverName] || {
      clientId: '',
      clientSecret: '',
      redirectUri: 'https://your-app.com/oauth/callback'
    };
  };

  // OAuth handlers
  const handleLockClick = (serverName: string) => {
    setSelectedServerForAuth(serverName);
    
    // Load any existing token for this server from sessionStorage
    const existingToken = sessionStorage.getItem(`mcp-token-${serverName}`);
    if (existingToken) {
      setOAuthForms(prev => ({
        ...prev,
        [serverName]: {
          ...getCurrentForm(serverName),
          clientSecret: existingToken
        }
      }));
      // Mark as authenticated if token exists
      setAuthenticatedServers(prev => new Set([...Array.from(prev), serverName]));
    }
    
    setIsOAuthModalOpen(true);
  };

  const handleOAuthFormChange = (field: string, value: string) => {
    setOAuthForms(prev => ({
      ...prev,
      [selectedServerForAuth]: {
        ...getCurrentForm(selectedServerForAuth),
        [field]: value
      }
    }));
  };

  const handleOAuthSubmit = () => {
    // Save the access token for this server for the browser session
    const currentForm = getCurrentForm(selectedServerForAuth);
    if (currentForm.clientSecret) {
      // Validate that the token is exactly 'mytoken'
      if (currentForm.clientSecret === 'mytoken') {
      // Store the access token in sessionStorage (clears on page refresh)
      sessionStorage.setItem(`mcp-token-${selectedServerForAuth}`, currentForm.clientSecret);
      
      // Mark the server as authenticated
      setAuthenticatedServers(prev => new Set([...Array.from(prev), selectedServerForAuth]));
      
      setIsOAuthModalOpen(false);
      // Don't clear the form - keep the token value
      } else {
        // Store invalid token with special prefix to track failed authentication
        sessionStorage.setItem(`mcp-token-${selectedServerForAuth}`, `INVALID:${currentForm.clientSecret}`);
        
        setIsOAuthModalOpen(false);
        // Don't mark as authenticated - this will trigger failure message on next query
      }
    }
  };

  const handleOAuthCancel = () => {
    setIsOAuthModalOpen(false);
    // Don't clear the form - keep the current values
  };

  const handleOAuthClear = () => {
    // Clear the access token field and remove from sessionStorage
    setOAuthForms(prev => ({
      ...prev,
      [selectedServerForAuth]: {
        ...getCurrentForm(selectedServerForAuth),
        clientSecret: ''
      }
    }));
    // Remove from sessionStorage
    sessionStorage.removeItem(`mcp-token-${selectedServerForAuth}`);
    // Mark as not authenticated
    setAuthenticatedServers(prev => {
      const newSet = new Set(Array.from(prev));
      newSet.delete(selectedServerForAuth);
      return newSet;
    });
  };

  // Code generation functions


  /* Removed unused function generateMcpConnectionsConfig  
  const generateMcpConnectionsConfig = (): string => {
    if (selectedMcpServers.length === 0) {
      return JSON.stringify({
        "mcp_servers": [],
        "message": "No MCP servers selected"
      }, null, 2);
    }

    const serverConfigs = selectedMcpServers.map(serverName => {
      // Find the server slug for this server name
      const server = mcpServers.find(s => s.name === serverName);
      const serverSlug = server?.slug || serverName.toLowerCase().replace(/\s+/g, '-');
      
      // Get excluded tools for this server
      const availableTools = getServerTools(serverSlug);
      const excludedTools = availableTools.filter(tool => !isToolEnabled(serverSlug, tool.name));
      const enabledTools = availableTools.filter(tool => isToolEnabled(serverSlug, tool.name));

      // Base configuration for each server
      const baseConfig = {
        "name": serverName,
        "slug": serverSlug,
        "enabled_tools": enabledTools.map(tool => tool.name),
        "excluded_tools": excludedTools.map(tool => tool.name)
      };

      // Add server-specific configuration
      switch (serverName) {
        case 'Airtable':
          return {
            ...baseConfig,
            "connection": {
              "type": "stdio",
              "command": "npx",
              "args": ["-y", "airtable-mcp-server"],
              "env": {
                "AIRTABLE_API_KEY": "your_actual_api_key_here"
              }
            },
            "example_usage": {
              "tool": "list_records",
              "parameters": {
                    "baseId": "your_base_id",
                    "tableId": "your_table_id",
                    "maxRecords": 10
              }
            }
          };

        case 'Google Search':
          return {
            ...baseConfig,
            "connection": {
              "type": "stdio", 
              "command": "npx",
              "args": ["-y", "google-search-mcp-server"],
              "env": {
                "GOOGLE_API_KEY": "your_google_api_key",
                "SEARCH_ENGINE_ID": "your_search_engine_id"
              }
            },
            "example_usage": {
              "tool": "search",
              "parameters": {
                    "query": "latest AI developments",
                    "max_results": 5
              }
            }
          };

        case 'Zapier':
          return {
            ...baseConfig,
            "connection": {
              "type": "stdio",
              "command": "npx",
              "args": ["-y", "zapier-mcp-server"],
              "env": {
                "ZAPIER_API_KEY": "your_zapier_api_key"
              }
            },
            "example_usage": {
              "tool": "list_zaps",
              "parameters": {}
            }
          };

        case 'GitHub':
          return {
            ...baseConfig,
            "connection": {
              "type": "stdio",
              "command": "npx", 
              "args": ["-y", "github-mcp-server"],
              "env": {
                "GITHUB_TOKEN": "your_github_token"
              }
            },
            "example_usage": {
              "tool": "create_repository",
              "parameters": {
                "name": "my-new-repo",
                "description": "A new repository created via MCP"
              }
            }
          };

        case 'Slack':
          return {
            ...baseConfig,
            "connection": {
              "type": "stdio",
              "command": "npx",
              "args": ["-y", "slack-mcp-server"],
              "env": {
                "SLACK_BOT_TOKEN": "your_slack_bot_token"
              }
            },
            "example_usage": {
              "tool": "send_message",
              "parameters": {
                "channel": "#general",
                "text": "Hello from MCP!"
              }
            }
          };

        default:
          return {
            ...baseConfig,
            "connection": {
              "type": "stdio",
              "command": "npx",
              "args": ["-y", serverSlug],
              "env": {
                "API_KEY": "your_api_key_here"
              }
            },
            "example_usage": {
              "tool": "example_tool",
              "parameters": {}
            }
          };
      }
    });

    return JSON.stringify({
      "mcp_configuration": {
        "version": "1.0",
        "servers": serverConfigs
      }
    }, null, 2);
  };
  */

  const generatePythonCode = (): string => {
    const mcpEndpoints = selectedMcpServers.length > 0 
      ? selectedMcpServers.map(serverName => `    # ${serverName} - Selected in playground
    # Endpoint: http://localhost:3001/mcp/${serverName.toLowerCase().replace(/\s+/g, '-')}
    # Authentication: Bearer token required`).join('\n')
      : '    # No MCP servers selected in playground';

    return `# Llama Stack Configuration
# This is a Llama Stack configuration with relevant endpoints based on your selections
# in the playground. This code shows how to set up an agent with your chosen model,
# tools, and safety configurations.
#
# For help getting Llama Stack running locally, consult the Llama Stack documentation:
# https://llama-stack.readthedocs.io/en/latest/

from llama_stack_client import LlamaStackClient, Agent, AgentEventLogger
from rich.pretty import pprint

# =============================================================================
# INFERENCE ENDPOINTS CONFIGURATION
# =============================================================================
# These are the model inference endpoints based on your playground selections

# Primary Model Endpoint (Selected: ${agentConfig.selectedModel})
INFERENCE_HOST = "localhost"
INFERENCE_PORT = "5001" 
MODEL_ENDPOINT = f"http://{INFERENCE_HOST}:{INFERENCE_PORT}/v1/chat/completions"

# Model Configuration Parameters (from playground settings)
MODEL_CONFIG = {
    "model": "${agentConfig.selectedModel}",
    "temperature": ${agentConfig.temperature},
    "max_tokens": ${agentConfig.maxTokens},
    "frequency_penalty": ${agentConfig.frequencyPenalty},
    "presence_penalty": ${agentConfig.presencePenalty}
}

# =============================================================================
# MCP SERVER ENDPOINTS CONFIGURATION  
# =============================================================================
# These are the Model Context Protocol server endpoints for your selected tools

# MCP Servers Selected in Playground:
${mcpEndpoints}

# MCP Connection Configuration
MCP_SERVERS = [
${selectedMcpServers.map(serverName => `    {
        "name": "${serverName}",
        "endpoint": "stdio://npx -y ${serverName.toLowerCase().replace(/\s+/g, '-')}",
        "env": {
            "API_KEY": "your_${serverName.toLowerCase().replace(/\s+/g, '_')}_api_key"
        }
    }`).join(',\n')}
]

# =============================================================================
# LLAMA STACK CLIENT SETUP
# =============================================================================

# Initialize the Llama Stack client with your local server
client = LlamaStackClient(base_url=f"http://{INFERENCE_HOST}:{INFERENCE_PORT}")

# Create agent with your playground configuration
agent = Agent(
    client,
    # Model from your selection: ${agentConfig.selectedModel}
    model="${agentConfig.selectedModel}",
    
    # System prompt from playground (customize as needed)
    instructions="${agentConfig.systemPrompt || 'You are a helpful AI assistant with access to various tools and knowledge sources.'}",
    
    # Tools configuration (includes selected MCP servers)
    tools=[
        # Built-in RAG tool for knowledge search
        {
            "name": "builtin::rag/knowledge_search",
            "args": {"vector_db_ids": ${JSON.stringify(agentConfig.knowledgeSources)}},
        },
        # Built-in code interpreter
        "builtin::code_interpreter",
${selectedMcpServers.map(serverName => `        # ${serverName} tools (configured via MCP)
        "mcp::${serverName.toLowerCase().replace(/\s+/g, '_')}"`).join(',\n')}
    ],
    
    # Safety configuration (optional but recommended)
    input_shields=["${agentConfig.inputGuardrail || 'llama_guard'}"],
    output_shields=["${agentConfig.outputGuardrail || 'llama_guard'}"],
    
    # Inference control parameters
    max_infer_iters=5,
    sampling_params={
        "strategy": {"type": "top_p", "temperature": ${agentConfig.temperature}, "top_p": 0.95},
        "max_tokens": ${agentConfig.maxTokens},
    },
)

# =============================================================================
# USAGE EXAMPLE
# =============================================================================

# Create a session for conversation tracking
session_id = agent.create_session("playground_session")

# Example: Send a message to your configured agent
response = agent.create_turn(
    messages=[{"role": "user", "content": "Hello! Can you help me with my task?"}],
    session_id=session_id,
)

# Print the response
pprint(f"Agent Response: {response.output_message.content}")

# Example: Stream agent responses for real-time interaction
print("\\n--- Streaming Example ---")
for log in AgentEventLogger().log(response):
    log.print()`;
  };

  /* Removed unused function generateEnvironmentConfig
  const generateEnvironmentConfig = (): string => {
    return `# Agent Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${agentConfig.name || 'ai-agent'}-config
  namespace: ai-agents
data:
  # Model Configuration
  LLAMA_STACK_HOST: "localhost"
  LLAMA_STACK_PORT: "5001"
  MODEL_NAME: "${agentConfig.selectedModel}"
  
  # Agent Settings
  AGENT_NAME: "${agentConfig.name || 'AI Agent'}"
  AGENT_DESCRIPTION: "${agentConfig.description || 'AI assistant'}"
  AGENT_INSTRUCTIONS: "${agentConfig.systemPrompt || 'You are a helpful assistant'}"
  MAX_INFER_ITERS: "5"
  
  # Sampling Parameters
  TEMPERATURE: "${agentConfig.temperature}"
  TOP_P: "0.95"
  MAX_TOKENS: "${agentConfig.maxTokens}"
  FREQUENCY_PENALTY: "${agentConfig.frequencyPenalty}"
  PRESENCE_PENALTY: "${agentConfig.presencePenalty}"
  
  # Safety Configuration
  INPUT_SHIELDS: "${agentConfig.inputGuardrail || 'llama_guard'}"
  OUTPUT_SHIELDS: "${agentConfig.outputGuardrail || 'llama_guard'}"
  
  # Tool Configuration
  ENABLE_RAG: "${agentConfig.knowledgeSources.length > 0 ? 'true' : 'false'}"
  VECTOR_DB_IDS: "${agentConfig.knowledgeSources.join(',')}"
  ENABLE_CODE_INTERPRETER: "true"
  MCP_SERVERS: "${agentConfig.mcpServers.join(',')}"
  
  # Deployment Settings
  REPLICAS: "3"
  MEMORY_LIMIT: "4Gi"
  CPU_LIMIT: "2000m"
  
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${agentConfig.name || 'ai-agent'}
  namespace: ai-agents
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${agentConfig.name || 'ai-agent'}
  template:
    metadata:
      labels:
        app: ${agentConfig.name || 'ai-agent'}
    spec:
      containers:
      - name: agent
        image: registry.redhat.io/ubi8/python-39:latest
        ports:
        - containerPort: 8080
        env:
        - name: LLAMA_STACK_HOST
          valueFrom:
            configMapKeyRef:
              name: ${agentConfig.name || 'ai-agent'}-config
              key: LLAMA_STACK_HOST
        - name: LLAMA_STACK_PORT
          valueFrom:
            configMapKeyRef:
              name: ${agentConfig.name || 'ai-agent'}-config
              key: LLAMA_STACK_PORT
        resources:
          limits:
            memory: "4Gi"
            cpu: "2000m"
          requests:
            memory: "2Gi"
            cpu: "1000m"`;
  };
  */

  // Chat functionality for testing the agent
  const generateId = () => {
    const id = Date.now() + Math.random();
    return id.toString();
  };

  const handleSendMessage = (message: string | number) => {
    setIsSendButtonDisabled(true);
    
    // Convert message to string if it's a number
    const messageText = typeof message === 'string' ? message : message.toString();

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Debug: Check RAG and file conditions
    console.log('RAG enabled:', isRagEnabled);
    console.log('Uploaded files:', uploadedFiles.length, uploadedFiles.map(f => f.name));
    
    // Make announcement to assistive devices
    setAnnouncement(`Message from User: ${messageText}. Agent is processing...`);

    // Simulate agent response based on current configuration
    setTimeout(() => {
      let toolResponses: { name: string; content: string; status: 'success' | 'error' | 'loading' }[] = [];
      
      // Main agent response content
      const responseContent = agentConfig.name 
        ? `Hello! I'm ${agentConfig.name}. ${agentConfig.systemPrompt ? `I'm configured to: ${agentConfig.systemPrompt.slice(0, 100)}${agentConfig.systemPrompt.length > 100 ? '...' : ''}` : 'I\'m ready to help you!'} Using model: ${agentConfig.selectedModel}. Your message: "${userMessage.content}"`
        : `Hello! Using ${agentConfig.selectedModel}. This is a simulated response to: "${userMessage.content}". Configure me in the settings to customize my behavior!`;
      
      
      
      // Generate tool responses only for authenticated MCP servers
      if (selectedMcpServers.length > 0) {
        // Separate authenticated, unauthenticated, and failed authentication servers
        const authenticatedServers = selectedMcpServers.filter(serverName => {
          const token = sessionStorage.getItem(`mcp-token-${serverName}`);
          return token && !token.startsWith('INVALID:');
        });
        
        const failedAuthServers = selectedMcpServers.filter(serverName => {
          const token = sessionStorage.getItem(`mcp-token-${serverName}`);
          return token && token.startsWith('INVALID:');
        });
        
        const unauthenticatedServers = selectedMcpServers.filter(serverName => 
          !sessionStorage.getItem(`mcp-token-${serverName}`)
        );
        
        // Generate tool responses only for authenticated servers
        toolResponses = authenticatedServers.map(serverName => {
          
          // Generate realistic mock data based on server type
          let mockContent = '';
          
          switch (serverName) {
            case 'GitHub MCP Server':
              mockContent = `{
  "repository": "microsoft/vscode",
  "stars": 162847,
  "forks": 28654,
  "language": "TypeScript",
  "description": "Visual Studio Code",
  "latest_release": "1.95.0",
  "open_issues": 5234,
  "contributors": 1892,
  "license": "MIT"
}`;
              break;
            case 'Slack MCP Server':
              mockContent = `{
  "channel": "#engineering-team",
  "message_sent": true,
  "timestamp": "2025-01-15T10:30:45Z",
  "message_id": "ts1736937045.000100",
  "recipients": 23,
  "status": "delivered"
}`;
              break;
            case 'Salesforce MCP Server':
              mockContent = `{
  "lead_id": "00Q8c00001KxYzGEAV",
  "status": "Qualified",
  "company": "Acme Corporation",
  "email": "john.doe@acme.com",
  "phone": "+1-555-0123",
  "score": 85,
  "last_activity": "2025-01-15T09:15:30Z",
  "assigned_to": "Sarah Johnson"
}`;
              break;
            case 'Dynatrace MCP Server':
              mockContent = `{
  "service": "user-authentication-api",
  "availability": 99.97,
  "response_time_p95": 245,
  "error_rate": 0.03,
  "throughput": 1247,
  "alerts": 0,
  "status": "healthy",
  "last_deployment": "2025-01-14T16:22:15Z"
}`;
              break;
            case 'ServiceNow MCP Server':
              mockContent = `{
  "incident_number": "INC0012345",
  "state": "In Progress",
  "priority": "2 - High",
  "category": "Software",
  "assigned_to": "IT Support Team",
  "created": "2025-01-15T08:45:12Z",
  "description": "User unable to access application",
  "estimated_resolution": "2025-01-15T14:00:00Z"
}`;
              break;
            case 'Splunk MCP Server':
              mockContent = `{
  "query": "index=main source=app.log error",
  "events_found": 47,
  "time_range": "last 24 hours",
  "top_errors": [
    "Connection timeout: 23 occurrences",
    "Authentication failed: 15 occurrences",
    "Rate limit exceeded: 9 occurrences"
  ]
}`;
              break;
            case 'Zapier MCP Server':
              mockContent = `{
  "workflow_id": "zap_12345",
  "trigger": "New email in Gmail",
  "actions": [
    "Create Slack message",
    "Update Google Sheets row"
  ],
  "status": "success",
  "next_run": "2025-01-15T11:00:00Z"
}`;
              break;
            case 'PostgreSQL MCP Server':
              mockContent = `{
  "query": "SELECT COUNT(*) FROM users WHERE created_at > '2025-01-01'",
  "result": [
    {"count": 1247}
  ],
  "rows_affected": 1,
  "database": "production_db",
  "connection_pool": "healthy"
}`;
              break;
            default:
              mockContent = `{
  "tool": "${serverName}",
  "status": "success",
  "result": "Operation completed successfully"
}`;
          }
          
          return {
            name: `${serverName} Tool`,
            content: mockContent,
            status: 'success' as const
          };
        });
        
        // Add connection failed cards for servers with invalid tokens
        failedAuthServers.forEach(serverName => {
          toolResponses.push({
            name: `${serverName} Connection`,
            content: `<strong>Connection failed:</strong> Invalid access token. Click the lock icon and enter your access token. Hint: enter mytoken`,
            status: 'error' as const
          });
        });
        
        // Add authentication required cards for unauthenticated servers
        unauthenticatedServers.forEach(serverName => {
          toolResponses.push({
            name: `${serverName} Authentication`,
            content: `<strong>Authentication required:</strong> Click the lock icon and enter your access token. Hint: enter mytoken`,
            status: 'loading' as const
          });
        });
        
        console.log('Generated tool responses:', toolResponses);
        console.log('Authenticated servers:', authenticatedServers);
        console.log('Unauthenticated servers:', unauthenticatedServers);
      }

      const agentMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        toolResponses: toolResponses.length > 0 ? toolResponses : undefined,
        referencedFiles: isRagEnabled && uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
      };
      setChatHistory(prev => [...prev, agentMessage]);
      setAnnouncement(`Message from Agent: ${responseContent}`);
      setIsTyping(false);
      setIsSendButtonDisabled(false);
    }, 1000 + Math.random() * 2000); // Simulate variable response time
  };

  // Convert ChatMessage to MessageProps format for PatternFly Chatbot
  const convertToMessageProps = (): MessageProps[] => {
    return chatHistory.map((message) => {
      console.log('Converting message:', message.id, 'toolResponses:', message.toolResponses);
      if (message.toolResponses) {
        console.log('Tool responses detail:', JSON.stringify(message.toolResponses, null, 2));
      }
      
      // Note: Tool responses are now handled by the Card-based UI components
      // The old markdown-based tool response display has been removed to prevent duplicates
      

      const messageProps = {
        id: message.id,
        role: message.role === 'user' ? ('user' as const) : ('bot' as const),
        content: message.content,
        name: message.role === 'user' ? 'User' : agentConfig.name || 'Agent',
        avatar: message.role === 'user' ? userAvatar : agentAvatar,
        timestamp: message.timestamp.toLocaleString(),
        avatarProps: { isBordered: true },
          ...(message.role !== 'user' && {
            actions: {
              positive: { onClick: () => console.log("Good response") },
              negative: { onClick: () => console.log("Bad response") },
              copy: { onClick: () => console.log("Copy") },
            }
          })
        };
      
      if (message.toolResponses) {
        console.log('MessageProps with toolResponses:', JSON.stringify(messageProps, null, 2));
      }
      
      return messageProps;
      });
  };

  const handleAddMcpServer = (serverName: string) => {
    if (selectedMcpServers.includes(serverName)) {
      // Remove server and clear chat history to avoid stale tool responses
      setSelectedMcpServers(prev => prev.filter(name => name !== serverName));
      setChatHistory([]);
    } else {
      // Add server
      setSelectedMcpServers(prev => [...prev, serverName]);
    }
    // Track when MCP servers were modified
    setMcpServersLastModified(new Date());
  };

  const handleMcpSort = (columnIndex: number) => {
    setMcpSortBy(prevSort => ({
      index: columnIndex,
      direction: prevSort.index === columnIndex && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewTools = (server: MCPServer) => {
    setSelectedServerForTools(server);
    setIsToolsModalOpen(true);
  };


  const isToolEnabled = (serverSlug: string, toolName: string) => {
    return enabledTools[serverSlug]?.[toolName] ?? true; // Default to enabled
  };

  // Helper function to clean up server names for playground display
  const getDisplayName = (serverName: string) => {
    return serverName.replace(/\s*MCP\s*Server$/i, '').trim();
  };

  // Helper function to count enabled tools for a server
  const getEnabledToolsCount = (serverSlug: string) => {
    const tools = getServerTools(serverSlug);
    return tools.filter(tool => isToolEnabled(serverSlug, tool.name)).length;
  };

  // Helper function to filter MCP servers based on selected project
  const filterMcpServersByProject = (servers: MCPServer[]) => {
    // Show all MCP servers regardless of project for playground
    return servers;
  };


  // Filter models for the modal based on search text and filter type
  const getFilteredModalModels = () => {
    // Define the same models as above but with full details for the modal
    const allPossibleModels = [
      { 
        id: '1',
        name: 'llama-3.1-8b-instruct',
        useCase: 'General chat',
        description: 'Meta Llama 3.1 8B parameter model optimized for instruction following',
        llsStatus: 'registered'
      },
      { 
        id: '2',
        name: 'granite-7b-code',
        useCase: 'Code generation',
        description: 'IBM Granite 7B model specialized for code generation tasks',
        llsStatus: 'not-registered'
      },
      { 
        id: '3',
        name: 'mistral-7b-instruct',
        useCase: 'Multilingual, Reasoning',
        description: 'Mistral 7B instruction-tuned model for general purpose tasks',
        llsStatus: 'registered'
      },
      { 
        id: '4',
        name: 'gpt-oss-120b-FP8-Dynamic',
        useCase: 'Text generation',
        description: 'For production, general purpose, high reasoning use cases that fit into a single 80GB GPU (like NVIDIA H100 or AMD MI300X) (117B parameters with 5.1B active parameters)',
        llsStatus: 'not-registered'
      },
      { 
        id: '5',
        name: 'Pixtral-Large-Instruct-2411-hf-quantized.w8a8',
        useCase: 'Vision, Multimodal',
        description: 'This model was obtained by quantizing the weights of neuralmagic/Pixtral-Large-Instruct-2411-hf to INT8 data type, ready for inference with vLLM >= 0.5.2.',
        llsStatus: 'not-registered'
      }
    ];

    // Show all 5 models for configuration
    let filteredModels = allPossibleModels;

    // Apply search filter
    if (modalSearchText.trim()) {
      const searchLower = modalSearchText.toLowerCase();
      filteredModels = filteredModels.filter(model => {
        if (modalFilterBy === 'name') {
          return model.name.toLowerCase().includes(searchLower);
        } else if (modalFilterBy === 'useCase') {
          return model.useCase.toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    return filteredModels;
  };

  // Helper function to sort MCP servers
  const sortMcpServers = (servers: MCPServer[]) => {
    return [...servers].sort((a, b) => {
      let aValue, bValue;
      
      if (mcpSortBy.index === 0) { // Name column
        aValue = getDisplayName(a.name).toLowerCase();
        bValue = getDisplayName(b.name).toLowerCase();
        return mcpSortBy.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (mcpSortBy.index === 1) { // Selected column
        aValue = selectedMcpServers.includes(a.name) ? 1 : 0;
        bValue = selectedMcpServers.includes(b.name) ? 1 : 0;
        return mcpSortBy.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });
  };



  // Helper functions to determine tool privileges
  const writeTools = new Set([
    'k8s_apply', 'k8s_create', 'k8s_scale', 'k8s_expose', 'k8s_patch', 'k8s_cordon', 'k8s_drain',
    'send_message', 'send_direct_message', 'trigger_workflow',
    'create_incident', 'update_incident', 'create_change_request', 'update_change_request', 'create_catalog_item', 'assign_task',
    'create_record', 'update_record', 'execute_apex',
    'create_alert', 'export_data',
    'create_dashboard',
    'create_repository', 'create_issue', 'update_issue', 'create_pull_request', 'create_branch', 'create_comment',
    'trigger_zap'
  ]);

  const isDestructiveTool = (toolName: string) => {
    return toolName === 'k8s_delete' || toolName === 'delete_record';
  };

  const isReadWriteTool = (toolName: string) => {
    return writeTools.has(toolName);
  };



  // Helper function to sort tools by privilege level
  const sortToolsByPrivilege = (tools: Tool[]) => {
    return [...tools].sort((a, b) => {
      const aIsDestructive = isDestructiveTool(a.name);
      const bIsDestructive = isDestructiveTool(b.name);
      const aIsReadWrite = isReadWriteTool(a.name);
      const bIsReadWrite = isReadWriteTool(b.name);
      
      // Destructive tools first
      if (aIsDestructive && !bIsDestructive) return -1;
      if (!aIsDestructive && bIsDestructive) return 1;
      
      // If both or neither are destructive, check read/write access
      if (aIsReadWrite && !bIsReadWrite && !bIsDestructive) return -1;
      if (!aIsReadWrite && bIsReadWrite && !aIsDestructive) return 1;
      
      // If same privilege level, maintain alphabetical order
      return a.name.localeCompare(b.name);
    });
  };

  const renderAgentTestChat = () => {
    return (
      <div style={{ 
        backgroundColor: "white",
        height: "100%",
        display: "flex",
        flexDirection: "column",
          flex: 1,
        minHeight: 0
      } as CSSProperties}>
        <Chatbot displayMode={ChatbotDisplayMode.embedded}>
          <ChatbotContent>
            <MessageBox announcement={announcement}>
              {chatHistory.length === 0 ? (
                <div style={{ marginTop: 'auto' }}>
                <ChatbotWelcomePrompt
                  title={`Hello! ${agentConfig.name ? `I'm ${agentConfig.name}` : ''}`}
                    description="Welcome to the chat playground"
                  />
                  <div style={{ 
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    <div style={{ 
                      flexShrink: 0,
                      height: '48px',
                      width: '48px'
                    }}>
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="40" height="40" rx="20" fill="white"/>
                        <rect x="4" y="4" width="40" height="40" rx="20" stroke="url(#paint0_radial_1337_25275)" strokeWidth="8"/>
                        <g clipPath="url(#clip0_1337_25275)">
                          <path d="M31.0798 24.6339L26.3698 23.6339L25.3698 18.9239C25.3348 18.7489 25.1798 18.6289 25.0048 18.6289C24.8298 18.6289 24.6748 18.7539 24.6398 18.9239L23.6398 23.6339L18.9298 24.6339C18.7548 24.6689 18.6348 24.8239 18.6348 24.9989C18.6348 25.1739 18.7598 25.3289 18.9298 25.3639L23.6398 26.3639L24.6398 31.0739C24.6748 31.2489 24.8298 31.3689 25.0048 31.3689C25.1798 31.3689 25.3348 31.2439 25.3698 31.0739L26.3698 26.3639L31.0798 25.3639C31.2548 25.3289 31.3748 25.1739 31.3748 24.9989C31.3748 24.8239 31.2498 24.6689 31.0798 24.6339Z" fill="#151515"/>
                          <path d="M18.9999 21.8748C19.1749 21.8748 19.3299 21.7498 19.3649 21.5798L19.7499 19.7548L21.5749 19.3698C21.7499 19.3348 21.8699 19.1798 21.8699 19.0048C21.8699 18.8298 21.7449 18.6748 21.5749 18.6398L19.7499 18.2548L19.3649 16.4298C19.3299 16.2548 19.1749 16.1348 18.9999 16.1348C18.8249 16.1348 18.6699 16.2598 18.6349 16.4298L18.2499 18.2548L16.4249 18.6398C16.2499 18.6748 16.1299 18.8298 16.1299 19.0048C16.1299 19.1798 16.2549 19.3348 16.4249 19.3698L18.2499 19.7548L18.6349 21.5798C18.6699 21.7548 18.8249 21.8748 18.9999 21.8748Z" fill="#1B0D33"/>
                        </g>
                        <defs>
                          <radialGradient id="paint0_radial_1337_25275" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 24) rotate(34.5085) scale(29.1247)">
                            <stop offset="0.533661" stopColor="#F9A8A8"/>
                            <stop offset="0.70674" stopColor="#3D2785"/>
                            <stop offset="0.870204" stopColor="#1B0D33"/>
                          </radialGradient>
                          <clipPath id="clip0_1337_25275">
                            <rect width="16" height="16" fill="white" transform="translate(16 16)"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Label variant="outline" color="grey">
                          {agentConfig.selectedModel || 'No model selected'}
                        </Label>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: 'var(--pf-v5-global--Color--300)',
                          fontFamily: 'monospace'
                        }}>
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ 
                        textAlign: 'left', 
                        color: 'var(--pf-v5-global--Color--200)',
                        fontSize: '0.875rem'
                      }}>
                        Send a message to test your configuration
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {convertToMessageProps().map((message, index) => {
                    const originalMessage = chatHistory[index];
                    const isLastMessage = index === convertToMessageProps().length - 1;
                    
                      return (
                        <React.Fragment key={message.id}>
                        {isLastMessage && <div ref={scrollToBottomRef}></div>}
                          <Message {...message} />
                        {/* Render referenced documents */}
                        {originalMessage?.role === 'assistant' && originalMessage?.referencedFiles && originalMessage.referencedFiles.length > 0 && (
                          <div style={{ marginTop: '0.5rem', marginLeft: '3rem' }}>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                              {originalMessage.referencedFiles.map((file, fileIndex) => (
                                <FlexItem key={`doc-${message.id}-${fileIndex}`}>
                                  <Label variant="outline" color="grey">
                                    <FileIcon style={{ marginRight: '0.25rem' }} />
                                    Referenced: {file.name}
                                  </Label>
                                </FlexItem>
                              ))}
                            </Flex>
                          </div>
                        )}
                        
                        {/* Render tool response cards after assistant messages */}
                        {originalMessage?.role === 'assistant' && originalMessage?.toolResponses && (
                          <div style={{ marginTop: '1rem', marginLeft: '3rem' }}>
                            {originalMessage.toolResponses.map((tool, toolIndex) => {
                              // Show simplified card for authentication/error messages
                              if (tool.status === 'error' || tool.status === 'loading') {
                                return (
                                  <Card 
                                    key={`tool-${message.id}-${toolIndex}`}
                                    isCompact
                                    style={{ margin: '0.5rem 0' }}
                                  >
                                    <CardBody>
                                      <ExpandableSection 
                                        toggleText={`Tool response: ${tool.name}`}
                                        isExpanded={toolResponseExpandedStates[`${message.id}-${toolIndex}`] ?? true}
                                        onToggle={() => handleToolResponseToggle(`${message.id}-${toolIndex}`)}
                                        isIndented
                                      >
                                        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ padding: '0.5rem 0' }}>
                                          <FlexItem>
                                            <Button
                                              variant="plain"
                                              icon={(() => {
                                                const serverName = tool.name.replace(/ (Connection|Authentication)$/, '');
                                                const isServerAuthenticated = authenticatedServers.has(serverName) && sessionStorage.getItem(`mcp-token-${serverName}`) === 'mytoken';
                                                return isServerAuthenticated ? <LockOpenIcon /> : <LockIcon />;
                                              })()}
                                              onClick={() => {
                                                // Extract server name from tool name (remove ' Connection' or ' Authentication')
                                                const serverName = tool.name.replace(/ (Connection|Authentication)$/, '');
                                                handleLockClick(serverName);
                                              }}
                                              aria-label={`Configure ${tool.name.replace(/ (Connection|Authentication)$/, '')}`}
                                              style={{ 
                                                padding: '0.25rem', 
                                                minWidth: 'auto',
                                                color: (() => {
                                                  const serverName = tool.name.replace(/ (Connection|Authentication)$/, '');
                                                  const isServerAuthenticated = authenticatedServers.has(serverName) && sessionStorage.getItem(`mcp-token-${serverName}`) === 'mytoken';
                                                  return isServerAuthenticated ? '#28a745' : '#6a6e73';
                                                })()
                                              }}
                                            />
                                          </FlexItem>
                                          <FlexItem>
                                            <div 
                                              style={{ 
                                                fontSize: '0.875rem', 
                                                color: '#6a6e73', 
                                                lineHeight: '1.4'
                                              }}
                                              dangerouslySetInnerHTML={{ __html: tool.content.replace(/lock icon/g, 'lock icon') }}
                                            />
                                          </FlexItem>
                                        </Flex>
                                      </ExpandableSection>
                                    </CardBody>
                                  </Card>
                                );
                              }
                              
                              // Show full card for successful tool responses
                              return (
                                <Card 
                                  key={`tool-${message.id}-${toolIndex}`}
                                  isCompact
                                  style={{ margin: '0.5rem 0' }}
                                >
                                  <CardBody>
                                    <ExpandableSection 
                                      toggleText={`Tool response: ${tool.name}`}
                                      isExpanded={toolResponseExpandedStates[`${message.id}-${toolIndex}`] ?? true}
                                      onToggle={() => handleToolResponseToggle(`${message.id}-${toolIndex}`)}
                                      isIndented
                                    >
                                      <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ 
                                          fontSize: '0.875rem', 
                                          color: '#6a6e73',
                                          marginBottom: '0.5rem'
                                        }}>
                                          Thought for 3 seconds
                                        </div>
                                      </div>
                                      
                                      <Card isCompact>
                                        <CardHeader>
                                          <CardTitle>
                                            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                              <FlexItem>
                                                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                                                  <FlexItem grow={{ default: 'grow' }}>
                                                    <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                                                      <FlexItem>
                                                        <ToolsIcon />
                                                      </FlexItem>
                                                      <FlexItem>
                                                        {tool.name}
                                                      </FlexItem>
                                                    </Flex>
                                                  </FlexItem>
                                                  <FlexItem>
                                                    <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ fontSize: '12px', fontWeight: 400 }}>
                                                      <FlexItem>Execution time:</FlexItem>
                                                      <FlexItem>{(Math.random() * 2 + 0.5).toFixed(2)} seconds</FlexItem>
                                                    </Flex>
                                                  </FlexItem>
                                                </Flex>
                                              </FlexItem>
                                              <FlexItem>
                                                <Button 
                                                  variant="plain" 
                                                  icon={<CopyIcon />}
                                                  aria-label="Copy tool response to clipboard"
                                                />
                                              </FlexItem>
                                            </Flex>
                                          </CardTitle>
                                        </CardHeader>
                                        <Divider />
                                        <CardBody>
                                          <DescriptionList>
                                            <DescriptionListGroup>
                                              <DescriptionListTerm>Parameters</DescriptionListTerm>
                                              <DescriptionListDescription>
                                                <Flex direction={{ default: 'column' }}>
                                                  <FlexItem>
                                                    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                                                      <FlexItem>
                                                        <Label variant="outline" color="blue">type</Label>
                                                      </FlexItem>
                                                      <FlexItem>
                                                        <Label variant="outline" color="blue">properties</Label>
                                                      </FlexItem>
                                                      <FlexItem>
                                                        <Label variant="outline" color="blue">label</Label>
                                                      </FlexItem>
                                                    </Flex>
                                                  </FlexItem>
                                                </Flex>
                                              </DescriptionListDescription>
                                            </DescriptionListGroup>
                                            <DescriptionListGroup>
                                              <DescriptionListTerm>Response</DescriptionListTerm>
                                              <DescriptionListDescription>
                                                {tool.content}
                                              </DescriptionListDescription>
                                            </DescriptionListGroup>
                                          </DescriptionList>
                                        </CardBody>
                                      </Card>
                                    </ExpandableSection>
                                  </CardBody>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                        </React.Fragment>
                      );
                  })}
                  {isTyping && (
                    <Message
                      id="typing-indicator"
                      role="bot"
                      content="Agent is typing..."
                      name={agentConfig.name || 'Agent'}
                      avatar={agentAvatar}
                      timestamp={new Date().toLocaleString()}
                      isLoading={true}
                      avatarProps={{ isBordered: true }}
                    />
                  )}
                </>
              )}
            </MessageBox>
          </ChatbotContent>
          <ChatbotFooter>
            <MessageBar
              onSendMessage={handleSendMessage}
              isSendButtonDisabled={isSendButtonDisabled || isTyping}
              hasAttachButton={true}
              alwayShowSendButton={true}
            />
            <ChatbotFootnote {...agentFootnoteProps} />
          </ChatbotFooter>
        </Chatbot>
      </div>
    );
  };

  // Agent Configuration sub-tab render functions
  const renderAgentInfo = () => {
    return (
        <Form>
          <FormGroup label="Model" fieldId="model-select">
            <Select
              isOpen={isModelSelectOpen}
              selected={agentConfig.selectedModel || 'Select a model'}
              onSelect={(_event, value) => {
                setAgentConfig(prev => ({ ...prev, selectedModel: value as string }));
                setIsModelSelectOpen(false);
              }}
              onOpenChange={(isOpen) => setIsModelSelectOpen(isOpen)}
              id="model-select"
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsModelSelectOpen(!isModelSelectOpen)}
                  isExpanded={isModelSelectOpen}
                  style={{ width: '100%' }}
                >
                  {agentConfig.selectedModel || 'Select a model'}
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                {getAvailableModels().map(model => (
                  <SelectOption key={model.value} value={model.value}>
                    {model.label}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
            </FormGroup>

          <FormGroup label="API key" fieldId="api-key-select">
            <Select
              isOpen={isApiKeySelectOpen}
              selected={selectedApiKey}
              onSelect={(_event, value) => {
                setSelectedApiKey(value as string);
                setIsApiKeySelectOpen(false);
              }}
              onOpenChange={(isOpen) => setIsApiKeySelectOpen(isOpen)}
              id="api-key-select"
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsApiKeySelectOpen(!isApiKeySelectOpen)}
                  isExpanded={isApiKeySelectOpen}
                  style={{ width: '100%' }}
                >
                  {selectedApiKey}
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                <SelectOption key="playground-free" value="Playground (free)">
                  Playground (free)
                </SelectOption>
                {mockAPIKeys
                  .filter(key => key.status === 'Active')
                  .map(key => (
                    <SelectOption key={key.id} value={key.name}>
                      {key.name}
                    </SelectOption>
                  ))}
              </SelectList>
            </Select>
          </FormGroup>

          <FormGroup label="System Prompt" fieldId="system-prompt">
            <TextArea
              id="system-prompt"
              name="system-prompt"
              value={agentConfig.systemPrompt}
              onChange={(_event, value) => setAgentConfig(prev => ({ ...prev, systemPrompt: value }))}
              placeholder="Enter system instructions for the agent"
              rows={8}
            />
          </FormGroup>

          {/* Model Parameters */}
          <FormGroup label="Temperature" fieldId="temperature">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <Slider
                  value={agentConfig.temperature}
                  onChange={(_event, value) => setAgentConfig(prev => ({ ...prev, temperature: value as number }))}
                  min={0}
                  max={1}
                  step={0.01}
                  hasTooltipOverThumb
                  showBoundaries={false}
                  id="temperature-slider"
                />
              </div>
              <div style={{ 
                minWidth: '60px',
                height: '36px',
                border: '1px solid #d2d2d2',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {agentConfig.temperature.toFixed(2)}
              </div>
            </div>
          </FormGroup>

          <FormGroup label="Top P" fieldId="top-p">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <Slider
                  value={agentConfig.topP}
                  onChange={(_event, value) => setAgentConfig(prev => ({ ...prev, topP: value as number }))}
                  min={0}
                  max={1}
                  step={0.01}
                  hasTooltipOverThumb
                  showBoundaries={false}
                  id="top-p-slider"
                />
              </div>
              <div style={{ 
                minWidth: '60px',
                height: '36px',
                border: '1px solid #d2d2d2',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {agentConfig.topP.toFixed(2)}
              </div>
            </div>
          </FormGroup>

          <FormGroup label="Max token" fieldId="max-token">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <Slider
                  value={agentConfig.maxTokens}
                  onChange={(_event, value) => setAgentConfig(prev => ({ ...prev, maxTokens: value as number }))}
                  min={1}
                  max={4000}
                  step={50}
                  hasTooltipOverThumb
                  showBoundaries={false}
                  id="max-token-slider"
                />
              </div>
              <div style={{ 
                minWidth: '60px',
                height: '36px',
                border: '1px solid #d2d2d2',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {agentConfig.maxTokens}
              </div>
            </div>
          </FormGroup>

          <FormGroup label="Repetition" fieldId="repetition">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <Slider
                  value={agentConfig.repetition}
                  onChange={(_event, value) => setAgentConfig(prev => ({ ...prev, repetition: value as number }))}
                  min={0}
                  max={2}
                  step={0.01}
                  hasTooltipOverThumb
                  showBoundaries={false}
                  id="repetition-slider"
                />
              </div>
              <div style={{ 
                minWidth: '60px',
                height: '36px',
                border: '1px solid #d2d2d2',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {agentConfig.repetition.toFixed(1)}
              </div>
            </div>
          </FormGroup>

          <FormGroup label="Streaming" fieldId="streaming">
            <Switch
              id="streaming-switch"
              label={agentConfig.streaming ? "On" : "Off"}
              isChecked={agentConfig.streaming}
              onChange={(_event, checked) => setAgentConfig(prev => ({ ...prev, streaming: checked }))}
              aria-label="Enable streaming"
            />
          </FormGroup>
        </Form>
    );
  };

  const renderKnowledgeSources = () => {
    return (
      <div>
        <MultipleFileUpload
          onFileDrop={handleFileDrop}
          dropzoneProps={{
            accept: {
              'application/pdf': ['.pdf'],
              'text/plain': ['.txt'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
            }
          }}
        >
          <MultipleFileUploadMain
            titleIcon={<FolderOpenIcon />}
            titleText="Drag and drop files here"
            titleTextSeparator="or"
            infoText="Supported formats: PDF, TXT, DOCX"
          />
          {uploadedFiles.length > 0 && (
            <MultipleFileUploadStatus>
              {uploadedFiles.map((file, index) => (
                <MultipleFileUploadStatusItem
                  key={index}
                  file={file}
                  onClearClick={() => handleFileRemove(file)}
                />
              ))}
            </MultipleFileUploadStatus>
          )}
        </MultipleFileUpload>
      </div>
    );
  };

  // Function to get tools data for a server by slug
  const getServerTools = (serverSlug: string) => {
    const serverToolsData: Record<string, Tool[]> = {
      'mcp-kubernetes-server': [
        { name: 'k8s_get', description: 'Get resources by name, label selector, or all resources in a namespace' },
        { name: 'k8s_describe', description: 'Describe a Kubernetes resource' },
        { name: 'k8s_list', description: 'List resources in a namespace or across all namespaces' },
        { name: 'k8s_logs', description: 'Print the logs for a container in a pod' },
        { name: 'k8s_top', description: 'Display resource (CPU/memory) usage for nodes or pods' },
        { name: 'k8s_events', description: 'List events in a namespace' },
        { name: 'k8s_apply', description: 'Apply a configuration to a resource by file name or stdin' },
        { name: 'k8s_create', description: 'Create a resource from a file or from stdin' },
        { name: 'k8s_scale', description: 'Scale a resource' },
        { name: 'k8s_expose', description: 'Expose a resource as a new Kubernetes service' },
        { name: 'k8s_rollout_status', description: 'Show the status of the rollout' },
        { name: 'k8s_exec_command', description: 'Execute a command in a container' },
        { name: 'k8s_port_forward', description: 'Forward one or more local ports to a pod' },
        { name: 'k8s_cordon', description: 'Mark a node as unschedulable' },
        { name: 'k8s_drain', description: 'Drain a node in preparation for maintenance' },
        { name: 'k8s_patch', description: 'Update fields of a resource' },
        { name: 'k8s_delete', description: 'Delete resources by name, label selector, or all resources in a namespace' }
      ],
      'slack-mcp-server': [
        { name: 'send_message', description: 'Send a message to a Slack channel or user' },
        { name: 'read_channel_history', description: 'Read recent messages from a Slack channel' },
        { name: 'send_direct_message', description: 'Send a direct message to a user' },
        { name: 'list_channels', description: 'List available channels' },
        { name: 'get_user_info', description: 'Get information about a Slack user' },
        { name: 'trigger_workflow', description: 'Trigger a Slack workflow' },
        { name: 'search_messages', description: 'Search for messages across channels' }
      ],
      'servicenow-mcp-server': [
        { name: 'create_incident', description: 'Create a new ServiceNow incident' },
        { name: 'update_incident', description: 'Update an existing incident' },
        { name: 'query_incidents', description: 'Query incidents based on criteria' },
        { name: 'create_change_request', description: 'Create a new change request' },
        { name: 'update_change_request', description: 'Update an existing change request' },
        { name: 'query_change_requests', description: 'Query change requests based on criteria' },
        { name: 'create_catalog_item', description: 'Create a service catalog item' },
        { name: 'query_catalog_items', description: 'Query service catalog items' },
        { name: 'assign_task', description: 'Assign a task to a user or group' }
      ],
      'salesforce-mcp-server': [
        { name: 'query_records', description: 'Query Salesforce records using SOQL' },
        { name: 'create_record', description: 'Create a new record in Salesforce' },
        { name: 'update_record', description: 'Update an existing Salesforce record' },
        { name: 'delete_record', description: 'Delete a Salesforce record' },
        { name: 'describe_object', description: 'Get metadata about a Salesforce object' },
        { name: 'execute_apex', description: 'Execute Apex code' },
        { name: 'search_records', description: 'Search records using SOSL' }
      ],
      'splunk-mcp-server': [
        { name: 'run_search', description: 'Execute a Splunk search query' },
        { name: 'get_search_results', description: 'Retrieve results from a completed search job' },
        { name: 'create_alert', description: 'Create a new Splunk alert' },
        { name: 'list_indexes', description: 'List available Splunk indexes' },
        { name: 'export_data', description: 'Export search results to various formats' }
      ],
      'dynatrace-mcp-server': [
        { name: 'query_dql', description: 'Execute DQL (Dynatrace Query Language) queries' },
        { name: 'get_problems', description: 'Retrieve current and historical problems' },
        { name: 'get_vulnerabilities', description: 'Get security vulnerability data' },
        { name: 'get_metrics', description: 'Retrieve performance metrics' },
        { name: 'get_entities', description: 'Query monitored entities' },
        { name: 'create_dashboard', description: 'Create a new Dynatrace dashboard' }
      ],
      'github-mcp-server': [
        { name: 'list_repositories', description: 'List repositories for the authenticated user' },
        { name: 'create_repository', description: 'Create a new repository' },
        { name: 'get_repository', description: 'Get details about a repository' },
        { name: 'list_issues', description: 'List issues for a repository' },
        { name: 'create_issue', description: 'Create a new issue' },
        { name: 'update_issue', description: 'Update an existing issue' },
        { name: 'list_pull_requests', description: 'List pull requests for a repository' },
        { name: 'create_pull_request', description: 'Create a new pull request' },
        { name: 'list_commits', description: 'List commits for a repository' },
        { name: 'create_branch', description: 'Create a new branch' },
        { name: 'create_comment', description: 'Create a comment on an issue or PR' }
      ],
      'postgres-mcp-server': [
        { name: 'execute_query', description: 'Execute a read-only SQL query' },
        { name: 'describe_table', description: 'Get table schema and metadata' },
        { name: 'list_tables', description: 'List all tables in the database' },
        { name: 'list_schemas', description: 'List all schemas in the database' },
        { name: 'get_table_stats', description: 'Get statistics about table data' }
      ],
      'zapier-mcp-server': [
        { name: 'trigger_zap', description: 'Trigger a Zapier automation' },
        { name: 'list_apps', description: 'List available Zapier app integrations' },
        { name: 'search_actions', description: 'Search for available actions across apps' },
        { name: 'get_app_info', description: 'Get information about a specific app' },
        { name: 'test_connection', description: 'Test connection to an integrated service' }
      ]
    };
    
    return serverToolsData[serverSlug] || [];
  };


  // Handle preselected model and MCP server from navigation state
  useEffect(() => {
    const navigationState = location.state as { 
      preselectedModel?: string; 
      modelEndpoint?: string; 
      modelToken?: string;
      preselectedMCP?: string; // Legacy single server support
      preselectedMCPs?: string[]; // New multiple servers support
    } | null;
    
    // Handle preselected model
    if (navigationState?.preselectedModel) {
      const availableModels = getAvailableModels();
      const isModelAvailable = availableModels.some(model => model.value === navigationState.preselectedModel);
      
      if (isModelAvailable) {
        setAgentConfig(prev => ({ 
          ...prev, 
          selectedModel: navigationState.preselectedModel! 
        }));
      }
    }
    
    // Handle preselected MCP servers (multiple or single)
    const serversToPreselect = navigationState?.preselectedMCPs || 
                              (navigationState?.preselectedMCP ? [navigationState.preselectedMCP] : []);
    
    if (serversToPreselect.length > 0) {
      const availableServers = filterMcpServersByProject(mcpServers);
      const availableServerNames = availableServers.map(server => server.name);
      
      // Filter to only include servers that are available in the current project
      const validServersToPreselect = serversToPreselect.filter(serverName => 
        availableServerNames.includes(serverName)
      );
      
      if (validServersToPreselect.length > 0) {
        setSelectedMcpServers(prev => {
          // Add all valid servers that aren't already selected
          const newServers = validServersToPreselect.filter(serverName => !prev.includes(serverName));
          return newServers.length > 0 ? [...prev, ...newServers] : prev;
        });
      }
    }
    
    // Clear the navigation state to prevent re-applying on subsequent renders
    if (navigationState?.preselectedModel || navigationState?.preselectedMCP || navigationState?.preselectedMCPs) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state, getAvailableModels, mcpServers]);

  const renderMCPServers = () => {
    const filteredServers = filterMcpServersByProject(mcpServers);
    const sortedServers = sortMcpServers(filteredServers);
    const isNarrow = mcpTableWidth > 0 && mcpTableWidth < 325;
    
    return (
      <div ref={mcpTableRef} style={{ padding: '0.5rem 0' }}>
        <Table 
          aria-label="MCP Servers table" 
          variant="compact"
          style={{
            '--pf-v6-c-table--BorderColor': 'transparent',
            '--pf-v6-c-table__tr--BorderColor': 'transparent'
          } as CSSProperties}
        >
          <Thead>
            <Tr>
              <Th 
                width={15}
                sort={{
                  sortBy: { index: mcpSortBy.index, direction: mcpSortBy.direction },
                  onSort: (_event, index) => handleMcpSort(index),
                  columnIndex: 0
                }}
              >
                <CheckIcon />
              </Th>
              <Th 
                width={isNarrow ? 70 : 50}
                sort={{
                  sortBy: { index: mcpSortBy.index, direction: mcpSortBy.direction },
                  onSort: (_event, index) => handleMcpSort(index),
                  columnIndex: 1
                }}
              >
                Name
              </Th>
              {!isNarrow && <Th width={35}>Tools</Th>}
              {isNarrow ? (
                <Th width={15}>Actions</Th>
              ) : (
                <Th width={15}>Config</Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {sortedServers.map((server) => (
              <Tr key={server.id}>
                <Td>
                  <Checkbox
                    id={`server-${server.slug}`}
                    isChecked={selectedMcpServers.includes(server.name)}
                    onChange={() => handleAddMcpServer(server.name)}
                    aria-label={`Select ${server.name}`}
                  />
                </Td>
                <Td>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    minWidth: 0
                  }}>
                    <span style={{ 
                      whiteSpace: 'nowrap',
                      overflow: 'visible',
                      minWidth: 0,
                      flex: 1
                    }}>
                      {getDisplayName(server.name)}
                    </span>
                  </div>
                </Td>
                {!isNarrow && (
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                    <Tooltip content={`View ${getEnabledToolsCount(server.slug)} ${server.name} tools`}>
                      <Button
                          variant="link"
                        onClick={() => handleViewTools(server)}
                        aria-label={`View ${getEnabledToolsCount(server.slug)} ${server.name} tools`}
                          style={{ padding: '0', minWidth: 'auto', fontSize: 'inherit' }}
                        >
                          {getEnabledToolsCount(server.slug)}
                        </Button>
                    </Tooltip>
            </div>
                </Td>
                )}
                <Td>
                  {isNarrow ? (
                    <Dropdown
                      isOpen={mcpRowKebabStates[server.slug] || false}
                      onSelect={() => handleMcpRowKebabToggle(server.slug, false)}
                      onOpenChange={(isOpen: boolean) => handleMcpRowKebabToggle(server.slug, isOpen)}
                      popperProps={{
                        position: 'right'
                      }}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          aria-label={`${server.name} actions`}
                          variant="plain"
                          onClick={() => handleMcpRowKebabToggle(server.slug, !mcpRowKebabStates[server.slug])}
                          isExpanded={mcpRowKebabStates[server.slug] || false}
                        >
                          <EllipsisVIcon />
                        </MenuToggle>
                      )}
                      shouldFocusToggleOnSelect
                    >
                      <DropdownList>
                        <DropdownItem key="tools" onClick={() => handleViewTools(server)}>
                          View Tools ({getEnabledToolsCount(server.slug)})
                        </DropdownItem>
                        <DropdownItem key="configure" onClick={() => handleLockClick(server.name)}>
                          Configure
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  ) : (
                  <Tooltip content={`Configure ${server.name}`}>
                    <Button
                      variant="plain"
                      icon={(() => {
                        const isServerAuthenticated = authenticatedServers.has(server.name) && sessionStorage.getItem(`mcp-token-${server.name}`) === 'mytoken';
                        return isServerAuthenticated ? <LockOpenIcon /> : <LockIcon />;
                      })()}
                      onClick={() => handleLockClick(server.name)}
                      aria-label={`Configure ${server.name}`}
                      style={{ 
                        padding: '0.25rem', 
                        minWidth: 'auto',
                        color: (() => {
                          const isServerAuthenticated = authenticatedServers.has(server.name) && sessionStorage.getItem(`mcp-token-${server.name}`) === 'mytoken';
                          return isServerAuthenticated ? '#28a745' : undefined;
                        })()
                      }}
                    />
                  </Tooltip>
                  )}
                </Td>
              </Tr>
        ))}
          </Tbody>
        </Table>
      </div>
    );
  };



  const renderTracing = () => {
    return (
      <EmptyState 
        titleText="Agent Execution Tracing" 
        headingLevel="h4" 
        icon={ChartLineIcon}
      >
        <EmptyStateBody>
                Monitor and trace agent execution, view call flows, and analyze performance metrics.
        </EmptyStateBody>
      </EmptyState>
    );
  };

  const renderToolsModal = () => {
    if (!selectedServerForTools) return null;
    
    const tools = sortToolsByPrivilege(getServerTools(selectedServerForTools.slug));
    
    return (
      <Modal
        variant={ModalVariant.large}
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
      >
        <ModalHeader title={`${selectedServerForTools.name} - Tools`} />
        <ModalBody>
          <Title headingLevel="h3" size="lg">
            Available tools on the {selectedServerForTools.name}
          </Title>
        </ModalBody>
        <ModalBody>
          {tools.length === 0 ? (
            <EmptyState 
              titleText="No tools available" 
              headingLevel="h4" 
              icon={ToolsIcon}
            >
              <EmptyStateBody>
                This server doesn&apos;t have any tools configured.
              </EmptyStateBody>
            </EmptyState>
          ) : (
            <Flex direction={{ default: 'column' }}>
              {tools.map((tool, index) => (
                <React.Fragment key={index}>
                  <Flex 
                    alignItems={{ default: 'alignItemsCenter' }}
                    gap={{ default: 'gapMd' }}
                  >
                    <FlexItem flex={{ default: 'flexNone' }} style={{ width: '300px' }}>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <FlexItem>
                          <Content className={`pf-v6-u-font-family-monospace pf-v6-u-font-weight-bold`}>
                        {tool.name}
                          </Content>
                        </FlexItem>
                      {isDestructiveTool(tool.name) && (
                          <FlexItem>
                            <Label color="red" isCompact>destructive</Label>
                          </FlexItem>
                      )}
                      {isReadWriteTool(tool.name) && !isDestructiveTool(tool.name) && (
                          <FlexItem>
                            <Label color="blue" isCompact>read/write</Label>
                          </FlexItem>
                        )}
                      </Flex>
                    </FlexItem>
                    <FlexItem grow={{ default: 'grow' }}>
                      <Content>
                      {tool.description}
                      </Content>
                    </FlexItem>
                  </Flex>
                  {index < tools.length - 1 && (
                    <Divider />
                  )}
                </React.Fragment>
              ))}
            </Flex>
          )}
        </ModalBody>
      </Modal>
    );
  };

  // Model selection modal renderer
  const renderModelSelectionModal = () => {
    return (
      <Modal
        variant={ModalVariant.large}
        title="Configure playground"
        isOpen={isModelSelectionModalOpen}
        onClose={handleCancelModelSelection}
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl">
            Configure playground
          </Title>
        </ModalHeader>
        <ModalBody>
          <div style={{ marginBottom: '1.5rem' }}>
            <p>
              Choose the models you want to make available in this playground from your AI available assets. You can add additional models by making them available from the{' '}
              <Button 
                variant="link" 
                isInline 
                style={{ padding: 0, fontSize: 'inherit' }}
                onClick={() => navigate('/ai-assets/models')}
              >
                Model deployments page
              </Button>
              .
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            {/* Filter and Selection Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Checkbox 
                id="select-all-models"
                isChecked={selectedModelsForPlayground.size === getFilteredModalModels().length && getFilteredModalModels().length > 0}
                onChange={() => {
                  const availableModels = getFilteredModalModels();
                  if (selectedModelsForPlayground.size === availableModels.length) {
                    setSelectedModelsForPlayground(new Set());
                  } else {
                    setSelectedModelsForPlayground(new Set(availableModels.map(m => m.id)));
                  }
                }}
              />
              
              <Dropdown
                isOpen={isModalFilterDropdownOpen}
                onSelect={(event, value) => {
                  setModalFilterBy(value as string);
                  setIsModalFilterDropdownOpen(false);
                }}
                onOpenChange={(isOpen) => setIsModalFilterDropdownOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsModalFilterDropdownOpen(!isModalFilterDropdownOpen)}
                    isExpanded={isModalFilterDropdownOpen}
                    icon={<FilterIcon />}
                    style={{ minWidth: '120px' }}
                  >
                    {modalFilterBy === 'name' ? 'Name' : 'Use Case'}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem value="name">Name</DropdownItem>
                  <DropdownItem value="useCase">Use Case</DropdownItem>
                </DropdownList>
              </Dropdown>
              
              <div style={{ width: '200px' }}>
                <TextInput
                  type="search"
                  placeholder={modalFilterBy === 'name' ? 'Filter by name' : 'Filter by use case...'}
                  value={modalSearchText}
                  onChange={(_event, value) => setModalSearchText(value)}
                />
              </div>
              
              <span style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                {selectedModelsForPlayground.size} of {getFilteredModalModels().length} items selected
              </span>
              
              <div style={{ marginLeft: 'auto' }}>
                <Pagination
                  itemCount={getFilteredModalModels().length}
                  perPage={5}
                  page={1}
                  onSetPage={() => {}}
                  onPerPageSelect={() => {}}
                  isCompact
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '1rem' }}>
              Available models
            </Title>
            
            <Table variant="compact">
              <Thead>
                <Tr>
                  <Th width={10}></Th>
                  <Th>Model deployment name</Th>
                  <Th>Description</Th>
                  <Th>Use Case</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {getFilteredModalModels()
                  .slice(0, 5)
                  .map((model) => (
                  <Tr key={model.id}>
                    <Td>
                      <Checkbox
                        id={`model-${model.id}`}
                        isChecked={selectedModelsForPlayground.has(model.id)}
                        onChange={() => handleModelSelectionToggle(model.id)}
                      />
                    </Td>
                    <Td>{model.name}</Td>
                    <Td style={{ maxWidth: '300px' }}>
                      <div style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {model.description}
                      </div>
                    </Td>
                    <Td>{model.useCase}</Td>
                    <Td>
                      <Label color="green" icon={<CheckCircleIcon />}>
                        Active
                      </Label>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="primary" 
            onClick={handleConfigurePlaygroundModal}
            isDisabled={selectedModelsForPlayground.size === 0}
          >
            Configure
          </Button>
          <Button variant="link" onClick={handleCancelModelSelection}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  // Status modal renderer
  const renderStatusModal = () => {
    return (
      <Modal
        variant={ModalVariant.medium}
        title="Configuring playground"
        isOpen={isStatusModalOpen}
        onClose={configProgress === 100 ? () => setIsStatusModalOpen(false) : undefined}
        disableFocusTrap={true}
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl">
            Configuring playground
          </Title>
        </ModalHeader>
        <ModalBody>
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '1rem', color: '#6a6e73', marginBottom: '2rem' }}>
              Please wait while we automatically configure your playground
            </p>
          </div>

          {/* Completed steps */}
          <div style={{ marginBottom: '2rem' }}>
            {configSteps.map((step, index) => (
              <div key={index} style={{ marginBottom: '0.75rem' }}>
                {index < currentConfigStep ? (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      <CheckCircleIcon style={{ color: '#3E8635' }} />
                    </FlexItem>
                    <FlexItem>
                      <span style={{ color: '#6a6e73' }}>{step.label}</span>
                    </FlexItem>
                  </Flex>
                ) : index === currentConfigStep ? (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      <Spinner size="sm" />
                    </FlexItem>
                    <FlexItem>
                      <span style={{ color: '#151515', fontWeight: '500' }}>{step.label}</span>
                    </FlexItem>
                  </Flex>
                ) : (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      <span style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        backgroundColor: '#f0f0f0',
                        display: 'inline-block'
                      }}></span>
                    </FlexItem>
                    <FlexItem>
                      <span style={{ color: '#6a6e73' }}>{step.label}</span>
                    </FlexItem>
                  </Flex>
                )}
              </div>
            ))}
          </div>

          {/* Progress status */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#151515', 
              marginBottom: '1rem',
              fontWeight: '500'
            }}>
              Checking for LLM models deployed in this project - 2 minutes remaining
            </p>
            
            <Progress 
              value={configProgress}
              size="lg"
            />
          </div>
        </ModalBody>
      </Modal>
    );
  };

  // OAuth modal renderer
  const renderOAuthModal = () => {
    if (!selectedServerForAuth) return null;
    
    return (
      <Modal
        variant={ModalVariant.medium}
        isOpen={isOAuthModalOpen}
        onClose={handleOAuthCancel}
      >
        <ModalHeader 
          title={`Configure ${selectedServerForAuth}`}
        />
        <ModalBody>
          <Form onSubmit={(e) => { e.preventDefault(); handleOAuthSubmit(); }}>
            <FormSection>
              <FormGroup
                label="Access Token"
                isRequired
                fieldId="oauth-access-token"
              >
                <TextInput
                  id="oauth-access-token"
                  type="password"
                  value={getCurrentForm(selectedServerForAuth).clientSecret}
                  onChange={(_event, value) => handleOAuthFormChange('clientSecret', value)}
                  placeholder="Enter your access token"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && getCurrentForm(selectedServerForAuth).clientSecret) {
                      e.preventDefault();
                      handleOAuthSubmit();
                    }
                  }}
                />
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>The access token for authorizing this server</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            </FormSection>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Button 
                  variant="tertiary" 
                  onClick={handleOAuthClear}
                  isDisabled={!getCurrentForm(selectedServerForAuth).clientSecret}
                >
                  Clear
                </Button>
              </FlexItem>
              <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Button variant="secondary" onClick={handleOAuthCancel}>
                    Cancel
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button 
                    variant="primary" 
                    onClick={handleOAuthSubmit}
                    isDisabled={!getCurrentForm(selectedServerForAuth).clientSecret}
                  >
                    Configure
                  </Button>
                </FlexItem>
              </Flex>
            </Flex>
          </Form>
        </ModalBody>
      </Modal>
    );
  };

  const renderAgentConfiguration = () => {
    return (
              <Drawer isInline isExpanded style={{ height: 'calc(100vh - 200px)' }}>
        <DrawerContent
          panelContent={
            <DrawerPanelContent isResizable style={{ height: '100%' }}>
              <DrawerContentBody style={{ height: '100%', overflowY: 'auto' }}>
                
                <Accordion asDefinitionList={false} displaySize="lg">
                  <AccordionItem isExpanded={expandedSections.includes('agent-info')}>
                  <AccordionToggle
                      onClick={() => onToggle('agent-info')}
                      id="agent-info"
                  >
                    Model details
                  </AccordionToggle>
                  <AccordionContent
                    id="agent-info-content"
                  >
                    {renderAgentInfo()}
                  </AccordionContent>
                </AccordionItem>

                  <AccordionItem isExpanded={expandedSections.includes('knowledge-sources')}>
                  <AccordionToggle
                      onClick={() => onToggle('knowledge-sources')}
                      id="knowledge-sources"
                  >
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>RAG</FlexItem>
                      <FlexItem>
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                          style={{ display: 'inline-block' }}
                        >
                          <Switch
                            id="rag-toggle"
                            isChecked={isRagEnabled}
                            onChange={(_event, checked) => {
                              setIsRagEnabled(checked);
                            }}
                            aria-label="Enable RAG"
                          />
                        </div>
                      </FlexItem>
                    </Flex>
                  </AccordionToggle>
                  <AccordionContent
                    id="knowledge-sources-content"
                  >
                    {renderKnowledgeSources()}
                  </AccordionContent>
                </AccordionItem>

                  <AccordionItem isExpanded={expandedSections.includes('mcp-servers')}>
                  <AccordionToggle
                      onClick={() => onToggle('mcp-servers')}
                      id="mcp-servers"
                  >
                      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                        <FlexItem>MCP Servers</FlexItem>
                      {selectedMcpServers.length > 0 && (
                          <FlexItem>
                            <Label variant="filled" color="blue">{selectedMcpServers.length}</Label>
                          </FlexItem>
                        )}
                      </Flex>
                  </AccordionToggle>
                  <AccordionContent
                    id="mcp-servers-content"
                  >
                    {renderMCPServers()}
                  </AccordionContent>
                </AccordionItem>
                

                {flags.enableTracing && (
                    <AccordionItem isExpanded={expandedSections.includes('tracing')}>
                    <AccordionToggle
                        onClick={() => onToggle('tracing')}
                        id="tracing"
                    >
                        Tracing & Observability
                    </AccordionToggle>
                    <AccordionContent
                      id="tracing-content"
                    >
                      {renderTracing()}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
              </DrawerContentBody>
            </DrawerPanelContent>
          }
        >
          <DrawerContentBody style={{ height: '100%' }}>
            {renderAgentTestChat()}
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    );
  };

  // Code modal renderer
  const renderCodeModal = () => {
    return (
      <Modal
        variant={ModalVariant.large}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      >
        <ModalHeader title="Current Playground Configuration"/>
        <ModalBody>
            <Grid hasGutter>
              <GridItem span={12}>
                <CodeEditor
                  code={generatePythonCode()}
                  language={Language.python}
                  height="400px"
                  isReadOnly
                  isLanguageLabelVisible
                  isCopyEnabled
                  copyButtonAriaLabel="Copy Llama Stack configuration to clipboard"
                  copyButtonToolTipText="Copy to clipboard"
                  copyButtonSuccessTooltipText="Configuration copied to clipboard"
                />
              </GridItem>
            </Grid>
        </ModalBody>
      </Modal>
    );
  };

  // Main content renderer
  const renderContent = () => {
    // Show empty state when firstTimePlayground flag is enabled
    if (flags.firstTimePlayground) {
      return (
    <>
      {/* Header */}
      <PageSection>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <Flex gap={{ default: 'gapLg' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
                <Title headingLevel="h1" size="xl">Playground</Title>
            </FlexItem>
                
                {/* Project Selector */}
                {flags.showProjectWorkspaceDropdowns && (
                  <FlexItem>
                    <InputGroup>
                      <InputGroupItem>
                        <div className="pf-v6-c-input-group__text">
                          <OutlinedFolderIcon /> Project
                        </div>
                      </InputGroupItem>
                      <InputGroupItem>
                        <Select
                          isOpen={isProjectSelectOpen}
                          selected={selectedProject}
                          onSelect={(_event, value) => {
                            setSelectedProject(value as string);
                            setIsProjectSelectOpen(false);
                          }}
                          onOpenChange={(isOpen) => setIsProjectSelectOpen(isOpen)}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setIsProjectSelectOpen(!isProjectSelectOpen)}
                              isExpanded={isProjectSelectOpen}
                              style={{ width: '200px' }}
                            >
                              {selectedProject}
                            </MenuToggle>
                          )}
                          shouldFocusToggleOnSelect
                        >
                          <SelectList>
                            <SelectOption value="Project X">Project X</SelectOption>
                            <SelectOption value="Project Y">Project Y</SelectOption>
                          </SelectList>
                        </Select>
                      </InputGroupItem>
                    </InputGroup>
                  </FlexItem>
                )}

          </Flex>
          
          {/* Action buttons in top right */}
              <FlexItem>
                <Flex gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Button 
              variant="secondary"
              onClick={() => setIsCodeModalOpen(true)}
              icon={<CodeIcon />}
            >
              View code
            </Button>
                  </FlexItem>
                  <FlexItem>
                    <Dropdown
                      isOpen={isKebabMenuOpen}
                      onSelect={() => setIsKebabMenuOpen(false)}
                      onOpenChange={(isOpen: boolean) => setIsKebabMenuOpen(isOpen)}
                      popperProps={{
                        position: 'right'
                      }}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          aria-label="kebab dropdown toggle"
                          variant="plain"
                          onClick={() => setIsKebabMenuOpen(!isKebabMenuOpen)}
                          isExpanded={isKebabMenuOpen}
                        >
                          <EllipsisVIcon />
                        </MenuToggle>
                      )}
                      shouldFocusToggleOnSelect
                    >
                      <DropdownList>
                        <DropdownItem key="configure" onClick={handleConfigure}>
                          Configure
                        </DropdownItem>
                        <DropdownItem key="delete" onClick={handleDelete}>
                          Delete
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </FlexItem>
                </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

          <Divider component="div"/>
          
          {/* Empty State */}
          <PageSection padding={{ default: 'noPadding' }} isFilled style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', padding: '3rem 2rem' }}>
              <div 
                style={{ 
                  maxWidth: '500px', 
                  width: '100%', 
                  height: 'auto',
                  margin: '3rem auto 3rem'
                }} 
                dangerouslySetInnerHTML={{ __html: EmptyPlaygroundSvg }}
              />
              
              <Title headingLevel="h2" size="xl" style={{ marginBottom: '1rem' }}>
                Enable playground
              </Title>
              
              <p style={{ 
                fontSize: '1rem', 
                color: '#6a6e73', 
                marginBottom: '2rem',
                lineHeight: '1.5'
              }}>
                Create a playground to chat with the generative models deployed in this project. Experiment with model output using a simple RAG simulation, custom prompt and MCP servers.
              </p>
              
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => {
                  // Open model selection modal directly in playground
                  setIsModelSelectionModalOpen(true);
                  // Pre-select the default models (llama, mistral, and pixtral)
                  setSelectedModelsForPlayground(new Set(['1', '3', '5'])); // IDs for llama-3.1-8b-instruct, mistral-7b-instruct, and Pixtral-Large-Instruct
                }}
                style={{ marginBottom: '2rem' }}
              >
                Configure playground
              </Button>
            </div>
          </PageSection>
        </>
      );
    }

    return (
      <>
      {/* Header */}
      <PageSection>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <Flex gap={{ default: 'gapLg' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
            <Title headingLevel="h1" size="xl">Playground</Title>
            </FlexItem>

      {/* Project Selector */}
      {flags.showProjectWorkspaceDropdowns && (
              <FlexItem>
                  <InputGroup>
                    <InputGroupItem>
                      <div className="pf-v6-c-input-group__text">
                        <OutlinedFolderIcon /> Project
                      </div>
                    </InputGroupItem>
                    <InputGroupItem>
                      <Select
                        isOpen={isProjectSelectOpen}
                        selected={selectedProject}
                        onSelect={(_event, value) => {
                          setSelectedProject(value as string);
                          setIsProjectSelectOpen(false);
                        }}
                        onOpenChange={(isOpen) => setIsProjectSelectOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsProjectSelectOpen(!isProjectSelectOpen)}
                            isExpanded={isProjectSelectOpen}
                            style={{ width: '200px' }}
                          >
                            {selectedProject}
                          </MenuToggle>
                        )}
                        shouldFocusToggleOnSelect
                      >
                        <SelectList>
                          <SelectOption value="Project X">Project X</SelectOption>
                          <SelectOption value="Project Y">Project Y</SelectOption>
                        </SelectList>
                      </Select>
                    </InputGroupItem>
                  </InputGroup>
              </FlexItem>
            )}

          </Flex>
          
          {/* Action buttons in top right */}
          <FlexItem>
            <Flex gap={{ default: 'gapSm' }}>
              <FlexItem>
                <Button 
                  variant="secondary"
                  onClick={() => setIsCodeModalOpen(true)}
                  icon={<CodeIcon />}
                >
                  View code
                </Button>
              </FlexItem>
              <FlexItem>
                <Dropdown
                  isOpen={isKebabMenuOpen}
                  onSelect={() => setIsKebabMenuOpen(false)}
                  onOpenChange={(isOpen: boolean) => setIsKebabMenuOpen(isOpen)}
                  popperProps={{
                    position: 'right'
                  }}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      aria-label="kebab dropdown toggle"
                      variant="plain"
                      onClick={() => setIsKebabMenuOpen(!isKebabMenuOpen)}
                      isExpanded={isKebabMenuOpen}
                    >
                      <EllipsisVIcon />
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <DropdownList>
                    <DropdownItem key="configure" onClick={handleConfigure}>
                      Configure
                    </DropdownItem>
                    <DropdownItem key="delete" onClick={handleDelete}>
                      Delete
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      <Divider component="div"/>
      {/* Main Content - Agent Configuration */}
      <PageSection padding={{ default: 'noPadding' }} isFilled>
        {renderAgentConfiguration()}
      </PageSection>
    </>
    );
  };

  // Conditionally render with different layouts (keeping existing feature flag support)
  if (flags.enableIDELayout) {
    return (
      <>
        <IDELayout>
          {renderContent()}
        </IDELayout>
        {renderCodeModal()}
      </>
    );
  }

  if (flags.enableWorkflowLayout) {
    return (
      <>
        <WorkflowLayout>
          {renderContent()}
        </WorkflowLayout>
        {renderCodeModal()}
      </>
    );
  }

  // Default layout
  return (
    <>
      {renderContent()}
      {renderCodeModal()}
      {renderToolsModal()}
      {renderOAuthModal()}
      {renderModelSelectionModal()}
      {renderStatusModal()}
    </>
  );
};

export { AgentBuilder }; 