import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Checkbox,
  ClipboardCopy,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
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
  ModalBody,
  ModalHeader,
  ModalVariant,
  PageSection,
  Popover,
  SearchInput,
  Skeleton,
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
  CheckCircleIcon,
  CopyIcon,
  CubeIcon,
  EllipsisVIcon,
  ExternalLinkAltIcon,
  GithubIcon,
  InfoCircleIcon,
  OutlinedClockIcon,
  PaperPlaneIcon,
  PlusCircleIcon,
  RobotIcon,
  ToolsIcon,
  UserIcon,
} from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { useUserProfile } from '@app/utils/UserProfileContext';
import { DeployMCPServerModal } from './DeployMCPServerModal';
import { mcpServerLogos } from './mcpServerLogos';

// Brand colors for generic circular icons
const brandColors: Record<string, string> = {
  'kubernetes': '#336ce6',
  'github': '#181717',
  'postgres': '#336791',
  'salesforce': '#00A1E0',
  'slack': '#4A154B',
  'zapier': '#FF4A00'
};

// Logo component to handle SVG content or special icon identifiers
const Logo: React.FunctionComponent<{ 
  svgContent: string; 
  alt: string; 
  style?: React.CSSProperties 
}> = ({ svgContent, alt, style }) => {
  // Handle special icon identifiers
  if (svgContent === 'cube-icon') {
    return (
      <CubeIcon 
        style={{
          ...style,
          color: '#9CA3AF',
          fontSize: style?.width || '16px',
          width: style?.width || '16px',
          height: style?.height || '16px'
        }}
        aria-label={alt}
      />
    );
  }
  
  // Handle generic circular icon identifiers (format: 'generic-icon-{brand}')
  if (svgContent.startsWith('generic-icon-')) {
    const brand = svgContent.replace('generic-icon-', '');
    const color = brandColors[brand] || '#6A6E73';
    const size = style?.width || style?.height || '32px';
    const sizeValue = typeof size === 'string' ? size : `${size}px`;
    
    return (
      <div
        style={{
          ...style,
          width: sizeValue,
          height: sizeValue,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
        aria-label={alt}
        role="img"
      />
    );
  }
  
  // Check if content is inline SVG (raw-loader returns SVG as string, includes <svg or <?xml)
  const isInlineSVG = svgContent.includes('<svg') || svgContent.includes('<?xml');
  
  // Handle inline SVG content
  if (isInlineSVG) {
    const dataUri = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    return (
      <img 
        src={dataUri} 
        alt={alt}
        style={style}
      />
    );
  }
  
  // Handle imported SVG files as URLs
  return (
    <img 
      src={svgContent} 
      alt={alt}
      style={style}
    />
  );
};

// Interfaces
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolResponses?: string[];
}

type MCPCatalogDetailsProps = Record<string, never>;

const MCPCatalogDetails: React.FunctionComponent<MCPCatalogDetailsProps> = () => {
  const { serverSlug } = useParams<{ serverSlug: string }>();
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();
  const [toolPageIndex, setToolPageIndex] = React.useState(0);
  const [toolsFilterValue, setToolsFilterValue] = React.useState('');
  const [expandedTools, setExpandedTools] = React.useState<Set<string>>(new Set());
  const [excludedTools, setExcludedTools] = React.useState<Set<string>>(new Set());
  const [toolsLoading, setToolsLoading] = React.useState(true);
  
  // OAuth state
  const [isOAuthModalOpen, setIsOAuthModalOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [oauthForm, setOAuthForm] = React.useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://your-app.com/oauth/callback'
  });
  const [animationState, setAnimationState] = React.useState({
    header: false,
    playground: false,
    divider: false,
    about: false,
    tools: false,
    connect: false,
    details: false
  });
  
  // Drawer and chat state
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isAddingProject, setIsAddingProject] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState('');
  const [newProjectPermission, setNewProjectPermission] = React.useState('User token');
  const [showTypeahead, setShowTypeahead] = React.useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = React.useState<number | null>(null);
  const [editProjectName, setEditProjectName] = React.useState('');
  const [editProjectPermission, setEditProjectPermission] = React.useState('');
  const [showEditTypeahead, setShowEditTypeahead] = React.useState(false);
  const [openKebabIndex, setOpenKebabIndex] = React.useState<number | null>(null);
  const [deployButtonPopoverVisible, setDeployButtonPopoverVisible] = React.useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = React.useState(false);
  const [savedDeployFormByServer, setSavedDeployFormByServer] = React.useState<Record<string, { extraYaml: string }>>({});
  const [copiedEndpointItems, setCopiedEndpointItems] = React.useState<Set<string>>(new Set());
  const [projectsList, setProjectsList] = React.useState([
    {
      name: 'Project Z',
      permission: 'Service account',
      dateAdded: '1 minute ago'
    },
    {
      name: 'Project X',
      permission: 'Service account',
      dateAdded: '8 days ago'
    }
  ]);
  
  const availableProjects = ['Project X', 'Project Y', 'Project Z', 'Global'];
  const filteredProjects = React.useMemo(() => 
    availableProjects.filter(project => 
      project.toLowerCase().includes(newProjectName.toLowerCase())
    ), [newProjectName]
  );
  const filteredEditProjects = React.useMemo(() => 
    availableProjects.filter(project => 
      project.toLowerCase().includes(editProjectName.toLowerCase())
    ), [editProjectName]
  );
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  
  // Model and knowledge source selection state
  const [selectedModel, setSelectedModel] = React.useState('gpt-4o');
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = React.useState<string[]>([]);
  const [expandedAccordions, setExpandedAccordions] = React.useState<string[]>([]);
  
  const { flags, mcpDeploymentFlow } = useFeatureFlags();

  // Animation effect on component mount
  React.useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, header: true })), 50));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, playground: true })), 150));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, divider: true })), 250));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, about: true })), 350));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, tools: true })), 450));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, connect: true })), 400));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, details: true })), 500));

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const getAnimationStyle = (isVisible: boolean) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
  });

  const toggleToolExpansion = (toolName: string) => {
    setExpandedTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolName)) {
        newSet.delete(toolName);
      } else {
        newSet.add(toolName);
      }
      return newSet;
    });
  };

  const handleCopyEndpointWithFeedback = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpointItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      setCopiedEndpointItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
  };

  const generateEndpointUrl = (projectName: string) => {
    const serverSlug = server?.slug || 'mcp-server';
    const projectSlug = projectName.toLowerCase().replace(/\s+/g, '-');
    return `${serverSlug}.${projectSlug}.svc.cluster.local:8080`;
  };

  const generateApiKey = (projectName: string) => {
    // Generate a consistent "API key" based on project name for demo purposes
    const baseKey = `mcp_${projectName.toLowerCase().replace(/\s+/g, '_')}`;
    return `${baseKey}_${Math.random().toString(36).substring(2, 15)}`;
  };

  // Chat functionality
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate agent response with MCP server context
    setTimeout(() => {
      const modelName = selectedModel.replace('-', ' ').toUpperCase();
      const knowledgeSourceInfo = selectedKnowledgeSources.length > 0 
        ? ` I&apos;m using knowledge sources: ${selectedKnowledgeSources.join(', ')}.`
        : ' No additional knowledge sources selected.';
      
      let toolResponses: string[] = [];
      
      // Check if server is authenticated before generating tool responses
      // Note: Tool responses are generated only at message creation time and stored with each message.
      // Existing messages are never modified when authentication status changes.
      if (server && server.tools && server.tools.length > 0) {
        // Check both isAuthenticated state AND if a token actually exists in sessionStorage
        if (isAuthenticated && server.name && sessionStorage.getItem(`mcp-token-${server.name}`)) {
          // Generate 1-2 tool responses based on the server's available tools
          const availableTools = server.tools.slice(0, 2);
          toolResponses = availableTools.map(tool => {
          // Generate mock tool response based on server type
          switch (server.name) {
            case 'Airtable':
              return `<div style="font-family: monospace; font-size: 0.75rem; line-height: 1.3;">
<div style="margin-bottom: 8px;">
<strong>Tool:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${tool.name}</code>
</div>
<div style="margin-bottom: 8px;">
<strong>Parameters:</strong>
<ul style="margin: 4px 0; padding-left: 16px;">
<li>baseId: <code>"appXY123ABC"</code></li>
<li>tableId: <code>"tblProject456"</code></li>
<li>maxRecords: <code>10</code></li>
</ul>
</div>
<div style="margin-bottom: 8px;">
<strong>Response:</strong> Successfully retrieved 3 records from Airtable
</div>
<div style="color: #059669; font-weight: bold;">
<strong>Execution Time:</strong> 0.24s
</div>
</div>`;
            case 'GitHub':
              return `<div style="font-family: monospace; font-size: 0.75rem; line-height: 1.3;">
<div style="margin-bottom: 8px;">
<strong>Tool:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${tool.name}</code>
</div>
<div style="margin-bottom: 8px;">
<strong>Parameters:</strong>
<ul style="margin: 4px 0; padding-left: 16px;">
<li>repository: <code>"owner/repo"</code></li>
<li>query: <code>"is:open is:pr"</code></li>
</ul>
</div>
<div style="margin-bottom: 8px;">
<strong>Response:</strong> Found 12 open pull requests
</div>
<div style="color: #059669; font-weight: bold;">
<strong>Execution Time:</strong> 0.18s
</div>
</div>`;
                         case 'PostgreSQL':
               return `<div style="font-family: monospace; font-size: 0.75rem; line-height: 1.3;">
<div style="margin-bottom: 8px;">
<strong>Tool:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${tool.name}</code>
</div>
<div style="margin-bottom: 8px;">
<strong>Parameters:</strong>
<ul style="margin: 4px 0; padding-left: 16px;">
<li>query: <code>"SELECT * FROM users WHERE active = true"</code></li>
</ul>
</div>
<div style="margin-bottom: 8px;">
<strong>Response:</strong> Query executed successfully, returned 47 rows
</div>
<div style="color: #059669; font-weight: bold;">
<strong>Execution Time:</strong> 0.31s
</div>
</div>`;
             case 'Slack':
               return `<div style="font-family: monospace; font-size: 0.75rem; line-height: 1.3;">
<div style="margin-bottom: 8px;">
<strong>Tool:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${tool.name}</code>
</div>
<div style="margin-bottom: 8px;">
<strong>Parameters:</strong>
<ul style="margin: 4px 0; padding-left: 16px;">
<li>channel: <code>"#general"</code></li>
<li>message: <code>"Hello team!"</code></li>
</ul>
</div>
<div style="margin-bottom: 8px;">
<strong>Response:</strong> Message sent successfully to #general channel
</div>
<div style="color: #059669; font-weight: bold;">
<strong>Execution Time:</strong> 0.16s
</div>
</div>`;
             case 'Kubernetes':
               return `<div style="font-family: monospace; font-size: 0.75rem; line-height: 1.3;">
<div style="margin-bottom: 8px;">
<strong>Tool:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${tool.name}</code>
</div>
<div style="margin-bottom: 8px;">
<strong>Parameters:</strong>
<ul style="margin: 4px 0; padding-left: 16px;">
<li>namespace: <code>"default"</code></li>
<li>resource: <code>"pods"</code></li>
</ul>
</div>
<div style="margin-bottom: 8px;">
<strong>Response:</strong> Retrieved 12 pods in default namespace
</div>
<div style="color: #059669; font-weight: bold;">
<strong>Execution Time:</strong> 0.28s
</div>
</div>`;
             case 'MCP Network':
               return `<div style="font-family: monospace; font-size: 0.75rem; line-height: 1.3;">
<div style="margin-bottom: 8px;">
<strong>Tool:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${tool.name}</code>
</div>
<div style="margin-bottom: 8px;">
<strong>Parameters:</strong>
<ul style="margin: 4px 0; padding-left: 16px;">
<li>interface: <code>"eth0"</code></li>
<li>action: <code>"get_status"</code></li>
</ul>
</div>
<div style="margin-bottom: 8px;">
<strong>Response:</strong> Network interface status: UP, 1Gbps, 0% packet loss
</div>
<div style="color: #059669; font-weight: bold;">
<strong>Execution Time:</strong> 0.12s
</div>
</div>`;
             default:
               return `<div style="font-family: monospace; font-size: 0.75rem; line-height: 1.3;">
<div style="margin-bottom: 8px;">
<strong>Tool:</strong> <code style="background: #f3f4f6; padding: 2px 4px; border-radius: 2px;">${tool.name}</code>
</div>
<div style="margin-bottom: 8px;">
<strong>Response:</strong> Tool executed successfully with ${server.name}
</div>
<div style="color: #059669; font-weight: bold;">
<strong>Execution Time:</strong> 0.21s
</div>
</div>`;
          }
          });
        } else {
          // Server is not authenticated - create authentication required message
          toolResponses = [`<div style="font-family: monospace; font-size: 0.875rem; line-height: 1.4; padding: 1rem; background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 0.375rem; color: #92400e;">
<div style="margin-bottom: 8px; font-weight: bold;">
🔒 Authorize tools
</div>
<div style="font-size: 0.75rem; color: #78716c;">
Please authenticate this server to enable tool access.
</div>
</div>`];
        }
      }
      
      const responseContent = server 
        ? (isAuthenticated && server.name && sessionStorage.getItem(`mcp-token-${server.name}`))
          ? `Hello! I&apos;m ${modelName} testing the ${server.name} server.${knowledgeSourceInfo} This is a simulated response to: "${userMessage.content}". I&apos;ve used the available tools to help process your request.`
          : `Hello! I&apos;m ${modelName} responding to: "${userMessage.content}".${knowledgeSourceInfo} However, I cannot access the ${server.name} server tools because authentication is required.`
        : `Hello! I&apos;m ${modelName} responding to: "${userMessage.content}".${knowledgeSourceInfo}`;

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        toolResponses: toolResponses.length > 0 ? toolResponses : undefined
      };
      setChatHistory(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setChatHistory([]);
  };

  const handleOAuthFormChange = (field: string, value: string) => {
    setOAuthForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOAuthSubmit = () => {
    // Save the access token for this server for the browser session
    if (oauthForm.clientSecret && server?.name) {
      // Store the access token in sessionStorage (clears on page refresh)
      sessionStorage.setItem(`mcp-token-${server.name}`, oauthForm.clientSecret);
      
      // Mark the server as authenticated
      setIsAuthenticated(true);
      
      setIsOAuthModalOpen(false);
      // Don't clear the form - keep the token value
    }
  };

  const handleOAuthCancel = () => {
    setIsOAuthModalOpen(false);
    // Don't clear the form - keep the current values
  };

  const handleOAuthClear = () => {
    // Clear the access token field and remove from sessionStorage
    setOAuthForm(prev => ({
      ...prev,
      clientSecret: ''
    }));
    // Remove from sessionStorage
    if (server?.name) {
      sessionStorage.removeItem(`mcp-token-${server.name}`);
    }
    // Mark as not authenticated
    setIsAuthenticated(false);
  };

  // Define write tools that require read/write permissions
  const writeTools = new Set([
    'k8s_create',
    'k8s_apply', 
    'k8s_expose',
    'k8s_run',
    'k8s_set_resources',
    'k8s_set_image',
    'k8s_set_env',
    'k8s_rollout_undo',
    'k8s_rollout_restart',
    'k8s_rollout_pause',
    'k8s_rollout_resume',
    'k8s_scale',
    'k8s_autoscale',
    'k8s_cordon',
    'k8s_uncordon',
    'k8s_drain',
    'k8s_taint',
    'k8s_untaint',
    'k8s_exec_command',
    'k8s_port_forward',
    'k8s_cp',
    'k8s_patch',
    'k8s_label',
    'k8s_annotate'
  ]);

  // Define ServiceNow write tools that require read/write permissions
  const servicenowWriteTools = new Set([
    'create_incident',
    'update_incident',
    'create_change_request',
    'request_catalog_item'
  ]);

  // Define Dynatrace write tools that require read/write permissions
  const dynatraceWriteTools = new Set([
    'create_maintenance_window'
  ]);

  // Define GitHub write tools that require read/write permissions
  const githubWriteTools = new Set([
    'create_issue',
    'create_pull_request',
    'create_branch',
    'add_comment'
  ]);

  // Define Postgres write tools that require read/write permissions
  // Note: execute_query can perform write operations in unrestricted mode
  const postgresWriteTools = new Set([
    'execute_query'
  ]);

  // Define Salesforce write tools that require read/write permissions
  const salesforceWriteTools = new Set([
    'create_case',
    'update_opportunity',
    'execute_apex'
  ]);

  // Define Slack write tools that require read/write permissions
  // Note: Slack tools are read-only, so this set is empty
  const slackWriteTools = new Set<string>([]);

  // Define Zapier write tools that require read/write permissions
  const zapierWriteTools = new Set([
    'trigger_zap',
    'execute_action',
    'create_calendar_event',
    'create_jira_ticket',
    'send_slack_message',
    'update_spreadsheet',
    'send_email',
    'create_crm_record',
    'webhook_trigger'
  ]);

  useDocumentTitle('MCP Server Details');

  // Mock data for the selected server (in a real app, this would come from an API)
  const servers = [
    {
      id: 1,
      slug: 'mcp-kubernetes-server',
      name: 'Kubernetes',
      displayName: '@feiskyer/mcp-kubernetes-server',
      description: 'Python-powered server that translates natural language into kubectl actions and provides cluster introspection to agents. Gives AI agents the ability to query pod health, describe resources, or perform dry-run actions across OpenShift or Kubernetes clusters.',
      logo: mcpServerLogos['mcp-kubernetes-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 26,
      callCount: '42.1k',
      successRate: '98.76%',
      publishedDate: '5/11/2025',
      modifiedDate: '1/15/2025',
      homepage: 'https://pypi.org/project/mcp-kubernetes-server/',
      sourceUrl: 'https://github.com/feiskyer/mcp-kubernetes-server',
      provider: 'feiskyer',
      version: '0.1.11',
      license: 'MIT',
      tags: ['kubernetes', 'infrastructure', 'kubectl', 'cluster-management'],
      transport: 'SSE',
      transportType: 'http-streaming',
      deploymentMode: 'Local to cluster',
      location: 'quay.io/feiskyer/mcp-kubernetes-server:0.1.11',
      deployedFrom: {
        branch: 'main',
        commit: 'a7b9c15'
      },
      isLocal: true,
      connectionUrl: 'k8s-mcp-server.demo-namespace.svc.cluster.local:8080',
      role: 'default-mcp',
      podId: 'k8s-mcp-server-6c8b7d9f4e-k2m9x',
      tools: [
        {
          name: 'k8s_get',
          description: 'Get resources by name, label selector, or all resources in a namespace',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of Kubernetes resource (pods, services, deployments, etc.)' },
            { name: 'name', type: 'string', required: false, description: 'Name of the resource' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace to query' },
            { name: 'label_selector', type: 'string', required: false, description: 'Label selector to filter resources' },
            { name: 'all_namespaces', type: 'boolean', required: false, description: 'Query across all namespaces' }
          ]
        },
        {
          name: 'k8s_describe',
          description: 'Describe a Kubernetes resource',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of Kubernetes resource' },
            { name: 'name', type: 'string', required: true, description: 'Name of the resource' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the resource' }
          ]
        },
        {
          name: 'k8s_list',
          description: 'List resources in a namespace or across all namespaces',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of Kubernetes resource' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace to list resources from' },
            { name: 'all_namespaces', type: 'boolean', required: false, description: 'List across all namespaces' }
          ]
        },
        {
          name: 'k8s_logs',
          description: 'Print the logs for a container in a pod',
          parameters: [
            { name: 'pod_name', type: 'string', required: true, description: 'Name of the pod' },
            { name: 'container', type: 'string', required: false, description: 'Container name (for multi-container pods)' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the pod' },
            { name: 'follow', type: 'boolean', required: false, description: 'Follow log output' },
            { name: 'tail', type: 'integer', required: false, description: 'Number of lines to show from the end' }
          ]
        },
        {
          name: 'k8s_top',
          description: 'Display resource (CPU/memory) usage for nodes or pods',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Resource type (nodes or pods)' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace for pods (ignored for nodes)' },
            { name: 'all_namespaces', type: 'boolean', required: false, description: 'Show pods from all namespaces' }
          ]
        },
        {
          name: 'k8s_events',
          description: 'List events in a namespace',
          parameters: [
            { name: 'namespace', type: 'string', required: false, description: 'Namespace to list events from' },
            { name: 'all_namespaces', type: 'boolean', required: false, description: 'List events from all namespaces' }
          ]
        },
        {
          name: 'k8s_apply',
          description: 'Apply a configuration to a resource by file name or stdin',
          parameters: [
            { name: 'filename', type: 'string', required: false, description: 'Path to the configuration file' },
            { name: 'content', type: 'string', required: false, description: 'YAML/JSON content to apply' },
            { name: 'namespace', type: 'string', required: false, description: 'Target namespace' },
            { name: 'dry_run', type: 'boolean', required: false, description: 'Perform a dry run' }
          ]
        },
        {
          name: 'k8s_create',
          description: 'Create a resource from a file or from stdin',
          parameters: [
            { name: 'filename', type: 'string', required: false, description: 'Path to the configuration file' },
            { name: 'content', type: 'string', required: false, description: 'YAML/JSON content to create' },
            { name: 'namespace', type: 'string', required: false, description: 'Target namespace' }
          ]
        },
        {
          name: 'k8s_scale',
          description: 'Scale a resource',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of resource to scale' },
            { name: 'name', type: 'string', required: true, description: 'Name of the resource' },
            { name: 'replicas', type: 'integer', required: true, description: 'Number of replicas' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the resource' }
          ]
        },
        {
          name: 'k8s_expose',
          description: 'Expose a resource as a new Kubernetes service',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of resource to expose' },
            { name: 'name', type: 'string', required: true, description: 'Name of the resource' },
            { name: 'port', type: 'integer', required: true, description: 'Port to expose' },
            { name: 'target_port', type: 'integer', required: false, description: 'Target port on the resource' },
            { name: 'service_type', type: 'string', required: false, description: 'Type of service (ClusterIP, NodePort, LoadBalancer)' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the resource' }
          ]
        },
        {
          name: 'k8s_rollout_status',
          description: 'Show the status of the rollout',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of resource (deployment, daemonset, statefulset)' },
            { name: 'name', type: 'string', required: true, description: 'Name of the resource' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the resource' }
          ]
        },
        {
          name: 'k8s_exec_command',
          description: 'Execute a command in a container',
          parameters: [
            { name: 'pod_name', type: 'string', required: true, description: 'Name of the pod' },
            { name: 'command', type: 'string', required: true, description: 'Command to execute' },
            { name: 'container', type: 'string', required: false, description: 'Container name (for multi-container pods)' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the pod' },
            { name: 'stdin', type: 'boolean', required: false, description: 'Pass stdin to the container' },
            { name: 'tty', type: 'boolean', required: false, description: 'Allocate a TTY' }
          ]
        },
        {
          name: 'k8s_port_forward',
          description: 'Forward one or more local ports to a pod',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of resource (pod, service, deployment)' },
            { name: 'name', type: 'string', required: true, description: 'Name of the resource' },
            { name: 'ports', type: 'array', required: true, description: 'Port mappings (e.g., ["8080:80", "9090:9090"])' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the resource' },
            { name: 'address', type: 'string', required: false, description: 'Address to bind to (default: localhost)' }
          ]
        },
        {
          name: 'k8s_cordon',
          description: 'Mark a node as unschedulable',
          parameters: [
            { name: 'node_name', type: 'string', required: true, description: 'Name of the node to cordon' }
          ]
        },
        {
          name: 'k8s_drain',
          description: 'Drain a node in preparation for maintenance',
          parameters: [
            { name: 'node_name', type: 'string', required: true, description: 'Name of the node to drain' },
            { name: 'force', type: 'boolean', required: false, description: 'Force drain even if there are pods not managed by a controller' },
            { name: 'ignore_daemonsets', type: 'boolean', required: false, description: 'Ignore DaemonSet-managed pods' },
            { name: 'delete_local_data', type: 'boolean', required: false, description: 'Delete pods using local storage' },
            { name: 'timeout', type: 'integer', required: false, description: 'Timeout for drain operation in seconds' }
          ]
        },
        {
          name: 'k8s_patch',
          description: 'Update fields of a resource',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of resource to patch' },
            { name: 'name', type: 'string', required: true, description: 'Name of the resource' },
            { name: 'patch', type: 'object', required: true, description: 'Patch data in JSON format' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the resource' }
          ]
        },
        {
          name: 'k8s_delete',
          description: 'Delete resources by name, label selector, or all resources in a namespace',
          parameters: [
            { name: 'resource_type', type: 'string', required: true, description: 'Type of resource to delete' },
            { name: 'name', type: 'string', required: false, description: 'Name of the resource to delete' },
            { name: 'namespace', type: 'string', required: false, description: 'Namespace of the resource' },
            { name: 'label_selector', type: 'string', required: false, description: 'Label selector for bulk deletion' },
            { name: 'all_namespaces', type: 'boolean', required: false, description: 'Delete from all namespaces' },
            { name: 'force', type: 'boolean', required: false, description: 'Force deletion' },
            { name: 'grace_period', type: 'integer', required: false, description: 'Grace period for deletion in seconds' }
          ]
        }
      ],
      readme: `# mcp-kubernetes-server

The mcp-kubernetes-server is a server implementing the Model Context Protocol (MCP) to enable AI assistants (such as Claude, Cursor, and GitHub Copilot) to interact with Kubernetes clusters. It acts as a bridge, translating natural language requests from these assistants into Kubernetes operations and returning the results.

It allows AI assistants to:

- Query Kubernetes resources
- Execute kubectl commands
- Manage Kubernetes clusters through natural language interactions
- Diagnose and interpret the states of Kubernetes resources

## How It Works

The mcp-kubernetes-server acts as an intermediary between AI assistants (that support the Model Context Protocol) and your Kubernetes cluster. It receives natural language requests from these assistants, translates them into kubectl commands or direct Kubernetes API calls, and executes them against the target cluster. The server then processes the results and returns a structured response, enabling seamless interaction with your Kubernetes environment via the AI assistant.

## How To Install

### Prerequisites

Before installing mcp-kubernetes-server, ensure you have the following:

- A working Kubernetes cluster.
- A kubeconfig file correctly configured to access your Kubernetes cluster (the server requires this file for interaction).
- The kubectl command-line tool installed and in your system's PATH (used by the server to execute many Kubernetes commands).
- The helm command-line tool installed and in your system's PATH (used by the server for Helm chart operations).
- Python >= 3.11, if you plan to install and run the server directly using uvx (without Docker).

### Docker

Get your kubeconfig file for your Kubernetes cluster and setup in the mcpServers (replace src path with your kubeconfig path):

\`\`\`json
{
  "mcpServers": {
    "kubernetes": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--mount", "type=bind,src=/home/username/.kube/config,dst=/home/mcp/.kube/config",
        "ghcr.io/feiskyer/mcp-kubernetes-server"
      ]
    }
  }
}
\`\`\`

### UVX

To run the server using uvx (a tool included with uv, the Python packager), first ensure uv is installed:

1. Install uv
2. Install kubectl
3. Install helm

Config your MCP servers in Claude Desktop, Cursor, ChatGPT Copilot, Github Copilot and other supported AI clients, e.g.

\`\`\`json
{
  "mcpServers": {
    "kubernetes": {
      "command": "uvx",
      "args": [
        "mcp-kubernetes-server"
      ],
      "env": {
        "KUBECONFIG": "<your-kubeconfig-path>"
      }
    }
  }
}
\`\`\`

## MCP Server Options

### Environment Variables

The server supports various environment variables for configuration.

### Command line arguments

The server supports command line arguments for fine-grained control.

## Usage

Once the mcp-kubernetes-server is installed and configured in your AI client (using the JSON snippets provided in the 'How to install' section for Docker or UVX), you can start interacting with your Kubernetes cluster through natural language. For example, you can ask:

- What is the status of my Kubernetes cluster?
- What is wrong with my nginx pod?

**Verifying the server:** If you're running the server with stdio transport (common for uvx direct execution), the AI client will typically start and manage the server process. For sse or streamable-http transports, the server runs independently. You would have started it manually (e.g., \`uvx mcp-kubernetes-server --transport sse\`) and should see output in your terminal indicating it's running (e.g., \`INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)\`). You can also check for any error messages in the server terminal if the AI client fails to connect.

## Available Tools

The mcp-kubernetes-server provides a comprehensive set of tools for interacting with Kubernetes clusters, categorized by operation type:

- **Command Tools**: Execute kubectl commands
- **Read Tools**: Query and retrieve Kubernetes resources
- **Write Tools**: Create and update Kubernetes resources
- **Delete Tools**: Remove Kubernetes resources

## Development

How to run the project locally:

\`\`\`bash
uv run -m src.mcp_kubernetes_server.main
\`\`\`

How to inspect MCP server requests and responses:

\`\`\`bash
npx @modelcontextprotocol/inspector uv run -m src.mcp_kubernetes_server.main
\`\`\`

## Troubleshooting

Here are some common issues and their solutions when working with mcp-kubernetes-server:

### Issue: mcp-kubernetes-server cannot connect to the Kubernetes cluster or reports authentication errors.

**Solution:**

- Ensure your kubeconfig file is correctly configured and points to the intended cluster.
- Verify that the path to your kubeconfig file is correctly specified in the mcpServers configuration (for Docker, ensure the mount path is correct; for uvx, ensure the KUBECONFIG environment variable is set correctly).
- Check that the credentials in your kubeconfig have the necessary permissions to perform operations on the cluster. You can test this with kubectl directly (e.g., \`kubectl get pods\`).

### Issue: kubectl or helm commands return an error like "command not found" or are disabled.

**Solution:**

- If running via uvx, ensure kubectl and/or helm are installed on your system and available in your PATH. Refer to the "Prerequisites" section for installation guidance.
- If you see a message like "Write operations are not allowed" or "Delete operations are not allowed", the server might have been started with flags like \`--disable-kubectl\`, \`--disable-helm\`, \`--disable-write\`, or \`--disable-delete\`. Check the server's startup command and the "MCP Server Options" section in the README for details on these flags.

### Issue: How can I see the raw requests and responses between my AI client and the mcp-kubernetes-server?

**Solution:**

You can use the \`@modelcontextprotocol/inspector\` tool as mentioned in the "Development" section: \`npx @modelcontextprotocol/inspector uv run -m src.mcp_kubernetes_server.main\`. This will show you the MCP messages being exchanged.

### Issue: The server starts but the AI client cannot connect.

**Solution:**

- If using stdio transport (default for uvx direct execution), ensure your AI client is configured to launch the mcp-kubernetes-server command correctly.
- If using sse or streamable-http transport, ensure the host and port configured in the mcp-kubernetes-server (e.g., \`--host 0.0.0.0 --port 8000\`) are reachable from where your AI client is running. Check for firewall rules or network configuration issues. Also, verify the AI client is configured with the correct URL for the server.

## Contribution

This project is open source, available on GitHub at feiskyer/mcp-kubernetes-server and licensed under the Apache License.

If you would like to contribute to the project, please follow these guidelines:

1. Fork the repository and clone it to your local machine.
2. Create a new branch for your changes.
3. Make your changes and commit them with a descriptive commit message.
4. Push your changes to your forked repository.
5. Open a pull request to the main repository.

## License

The project is licensed under the Apache License 2.0. See the LICENSE file for more details.`
    },
    {
      id: 2,
      slug: 'slack-mcp-server',
      name: 'Slack',
      displayName: 'slack-mcp-server',
      description: 'MIT-licensed server that lets AI agents post, read threads, DM users, and trigger Slack workflows; supports stdio + SSE, proxy mode, and fine-grained token scopes. Instant DevOps productivity tool.',
      logo: mcpServerLogos['slack-mcp-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 7,
      callCount: '28.5k',
      successRate: '99.14%',
      publishedDate: '1/12/2025',
      modifiedDate: '1/14/2025',
      homepage: 'https://github.com/korotovsky/slack-mcp-server',
      sourceUrl: 'https://github.com/korotovsky/slack-mcp-server',
      provider: 'korotovsky',
      version: '1.4.2',
      license: 'MIT',
      tags: ['slack', 'collaboration', 'chatops', 'workflows'],
      transport: 'SSE',
      transportType: ['http-streaming'],
      deploymentMode: 'Remote',
      location: 'https://github.com/korotovsky/slack-mcp-server',
      deployedFrom: {
        branch: 'main',
        commit: 'f8e2d41'
      },
      isLocal: false,
      connectionUrl: 'slack-mcp-server.demo-namespace.svc.cluster.local:8080',
      role: 'default-mcp',
      podId: 'slack-mcp-server-8d9c7e2f1a-h5n8m',
      tools: [
        {
          name: 'send_message',
          description: 'Send a message to a Slack channel or user',
          parameters: [
            { name: 'channel', type: 'string', required: true, description: 'Channel ID or name to send message to' },
            { name: 'text', type: 'string', required: true, description: 'Message text content' },
            { name: 'thread_ts', type: 'string', required: false, description: 'Timestamp of parent message to reply in thread' }
          ]
        },
        {
          name: 'read_channel_history',
          description: 'Read recent messages from a Slack channel',
          parameters: [
            { name: 'channel', type: 'string', required: true, description: 'Channel ID or name to read from' },
            { name: 'limit', type: 'number', required: false, description: 'Number of messages to retrieve (max 100)' },
            { name: 'oldest', type: 'string', required: false, description: 'Oldest timestamp to include' }
          ]
        },
        {
          name: 'send_direct_message',
          description: 'Send a direct message to a user',
          parameters: [
            { name: 'user', type: 'string', required: true, description: 'User ID or username to send DM to' },
            { name: 'text', type: 'string', required: true, description: 'Message text content' }
          ]
        },
        {
          name: 'list_channels',
          description: 'List available channels',
          parameters: [
            { name: 'types', type: 'string', required: false, description: 'Channel types to include (public_channel,private_channel,im,mpim)' },
            { name: 'limit', type: 'number', required: false, description: 'Number of channels to return' }
          ]
        },
        {
          name: 'get_user_info',
          description: 'Get information about a Slack user',
          parameters: [
            { name: 'user', type: 'string', required: true, description: 'User ID or username' }
          ]
        },
        {
          name: 'trigger_workflow',
          description: 'Trigger a Slack workflow',
          parameters: [
            { name: 'workflow_id', type: 'string', required: true, description: 'Workflow ID to trigger' },
            { name: 'inputs', type: 'object', required: false, description: 'Input parameters for the workflow' }
          ]
        },
        {
          name: 'search_messages',
          description: 'Search for messages across channels',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query' },
            { name: 'sort', type: 'string', required: false, description: 'Sort order: score, timestamp' },
            { name: 'count', type: 'number', required: false, description: 'Number of results to return' }
          ]
        }
      ],
      readme: `# Slack MCP Server

Model Context Protocol (MCP) server for Slack Workspaces. The most powerful MCP Slack server — supports Stdio, SSE and HTTP transports, proxy settings, DMs, Group DMs, Smart History fetch (by date or count), may work via OAuth or in complete stealth mode with no permissions and scopes in Workspace 😏.

## Important

We need your support! Each month, over 30,000 engineers visit this repository, and more than 9,000 are already using it.

If you appreciate the work our contributors have put into this project, please consider giving the repository a star.

This feature-rich Slack MCP Server has:

- **Stealth and OAuth Modes**: Run the server without requiring additional permissions or bot installations (stealth mode), or use secure OAuth tokens for access without needing to refresh or extract tokens from the browser (OAuth mode).
- **Enterprise Workspaces Support**: Possibility to integrate with Enterprise Slack setups.
- **Channel and Thread Support with #Name @Lookup**: Fetch messages from channels and threads, including activity messages, and retrieve channels using their names (e.g., #general) as well as their IDs.
- **Smart History**: Fetch messages with pagination by date (d1, 7d, 1m) or message count.
- **Search Messages**: Search messages in channels, threads, and DMs using various filters like date, user, and content.
- **Safe Message Posting**: The conversations_add_message tool is disabled by default for safety. Enable it via an environment variable, with optional channel restrictions.
- **DM and Group DM support**: Retrieve direct messages and group direct messages.
- **Embedded user information**: Embed user information in messages, for better context.
- **Cache support**: Cache users and channels for faster access.
- **Stdio/SSE/HTTP Transports & Proxy Support**: Use the server with any MCP client that supports Stdio, SSE or HTTP transports, and configure it to route outgoing requests through a proxy if needed.

## Tools

### 1. conversations_history

Get messages from the channel (or DM) by channel_id, the last row/column in the response is used as 'cursor' parameter for pagination if not empty

**Parameters:**

- **channel_id** (string, required): - channel_id (string): ID of the channel in format Cxxxxxxxxxx or its name starting with #... or @... aka #general or @username_dm.
- **include_activity_messages** (boolean, default: false): If true, the response will include activity messages such as channel_join or channel_leave. Default is boolean false.
- **cursor** (string, optional): Cursor for pagination. Use the value of the last row and column in the response as next_cursor field returned from the previous request.
- **limit** (string, default: "1d"): Limit of messages to fetch in format of maximum ranges of time (e.g. 1d - 1 day, 1w - 1 week, 30d - 30 days, 90d - 90 days which is a default limit for free tier history) or number of messages (e.g. 50). Must be empty when 'cursor' is provided.

### 2. conversations_replies

Get a thread of messages posted to a conversation by channelID and thread_ts, the last row/column in the response is used as cursor parameter for pagination if not empty.

**Parameters:**

- **channel_id** (string, required): ID of the channel in format Cxxxxxxxxxx or its name starting with #... or @... aka #general or @username_dm.
- **thread_ts** (string, required): Unique identifier of either a thread's parent message or a message in the thread. ts must be the timestamp in format 1234567890.123456 of an existing message with 0 or more replies.
- **include_activity_messages** (boolean, default: false): If true, the response will include activity messages such as 'channel_join' or 'channel_leave'. Default is boolean false.
- **cursor** (string, optional): Cursor for pagination. Use the value of the last row and column in the response as next_cursor field returned from the previous request.
- **limit** (string, default: "1d"): Limit of messages to fetch in format of maximum ranges of time (e.g. 1d - 1 day, 1w - 1 week, 30d - 30 days, 90d - 90 days which is a default limit for free tier history) or number of messages (e.g. 50). Must be empty when 'cursor' is provided.

### 3. conversations_add_message

Add a message to a public channel, private channel, or direct message (DM, or IM) conversation by channel_id and thread_ts.

**Note:** Posting messages is disabled by default for safety. To enable, set the SLACK_MCP_ADD_MESSAGE_TOOL environment variable. If set to a comma-separated list of channel IDs, posting is enabled only for those specific channels. See the Environment Variables section below for details.

**Parameters:**

- **channel_id** (string, required): ID of the channel in format Cxxxxxxxxxx or its name starting with #... or @... aka #general or @username_dm.
- **thread_ts** (string, optional): Unique identifier of either a thread's parent message or a message in the thread_ts must be the timestamp in format 1234567890.123456 of an existing message with 0 or more replies. Optional, if not provided the message will be added to the channel itself, otherwise it will be added to the thread.
- **payload** (string, required): Message payload in specified content_type format. Example: 'Hello, world!' for text/plain or '# Hello, world!' for text/markdown.
- **content_type** (string, default: "text/markdown"): Content type of the message. Default is 'text/markdown'. Allowed values: 'text/markdown', 'text/plain'.

### 4. conversations_search_messages

Search messages in a public channel, private channel, or direct message (DM, or IM) conversation using filters. All filters are optional, if not provided then search_query is required.

**Note:** This tool is not available when using bot tokens (xoxb-*). Bot tokens cannot use the search.messages API.

**Parameters:**

- **search_query** (string, optional): Search query to filter messages. Example: 'marketing report' or full URL of Slack message e.g. 'https://slack.com/archives/C1234567890/p1234567890123456', then the tool will return a single message matching given URL, herewith all other parameters will be ignored.
- **filter_in_channel** (string, optional): Filter messages in a specific channel by its ID or name. Example: C1234567890 or #general. If not provided, all channels will be searched.
- **filter_in_im_or_mpim** (string, optional): Filter messages in a direct message (DM) or multi-person direct message (MPIM) conversation by its ID or name. Example: D1234567890 or @username_dm. If not provided, all DMs and MPIMs will be searched.
- **filter_users_with** (string, optional): Filter messages with a specific user by their ID or display name in threads and DMs. Example: U1234567890 or @username. If not provided, all threads and DMs will be searched.
- **filter_users_from** (string, optional): Filter messages from a specific user by their ID or display name. Example: U1234567890 or @username. If not provided, all users will be searched.
- **filter_date_before** (string, optional): Filter messages sent before a specific date in format YYYY-MM-DD. Example: 2023-10-01, July, Yesterday or Today. If not provided, all dates will be searched.
- **filter_date_after** (string, optional): Filter messages sent after a specific date in format YYYY-MM-DD. Example: 2023-10-01, July, Yesterday or Today. If not provided, all dates will be searched.
- **filter_date_on** (string, optional): Filter messages sent on a specific date in format YYYY-MM-DD. Example: 2023-10-01, July, Yesterday or Today. If not provided, all dates will be searched.
- **filter_date_during** (string, optional): Filter messages sent during a specific period in format YYYY-MM-DD. Example: July, Yesterday or Today. If not provided, all dates will be searched.
- **filter_threads_only** (boolean, default: false): If true, the response will include only messages from threads. Default is boolean false.
- **cursor** (string, default: ""): Cursor for pagination. Use the value of the last row and column in the response as next_cursor field returned from the previous request.
- **limit** (number, default: 20): The maximum number of items to return. Must be an integer between 1 and 100.

### 5. channels_list

Get list of channels

**Parameters:**

- **channel_types** (string, required): Comma-separated channel types. Allowed values: mpim, im, public_channel, private_channel. Example: public_channel,private_channel,im
- **sort** (string, optional): Type of sorting. Allowed values: popularity - sort by number of members/participants in each channel.
- **limit** (number, default: 100): The maximum number of items to return. Must be an integer between 1 and 1000 (maximum 999).
- **cursor** (string, optional): Cursor for pagination. Use the value of the last row and column in the response as next_cursor field returned from the previous request.

## Resources

The Slack MCP Server exposes two special directory resources for easy access to workspace metadata:

### 1. slack://<workspace>/channels — Directory of Channels

Fetches a CSV directory of all channels in the workspace, including public channels, private channels, DMs, and group DMs.

- **URI**: slack://<workspace>/channels
- **Format**: text/csv
- **Fields**:
  - id: Channel ID (e.g., C1234567890)
  - name: Channel name (e.g., #general, @username_dm)
  - topic: Channel topic (if any)
  - purpose: Channel purpose/description
  - memberCount: Number of members in the channel

### 2. slack://<workspace>/users — Directory of Users

Fetches a CSV directory of all users in the workspace.

- **URI**: slack://<workspace>/users
- **Format**: text/csv
- **Fields**:
  - userID: User ID (e.g., U1234567890)
  - userName: Slack username (e.g., john)
  - realName: User's real name (e.g., John Doe)

## Setup Guide

### Authentication Setup

The server supports multiple authentication methods:

- **Stealth Mode**: Run without requiring additional permissions or bot installations using browser tokens (xoxc- and xoxd-)
- **OAuth Mode**: Use secure OAuth tokens (xoxp-) for access without needing to refresh or extract tokens from the browser
- **Bot Token**: Use bot tokens (xoxb-) for limited access (invited channels only, no search)

### Installation

Install the server using your preferred method (npm, go, docker, etc.)

### Configuration and Usage

Configure environment variables as needed for your setup. See the Environment Variables section below for details.

## Environment Variables (Quick Reference)

| Variable | Required? | Default | Description |
|----------|-----------|---------|-------------|
| SLACK_MCP_XOXC_TOKEN | Yes* | nil | Slack browser token (xoxc-...) |
| SLACK_MCP_XOXD_TOKEN | Yes* | nil | Slack browser cookie d (xoxd-...) |
| SLACK_MCP_XOXP_TOKEN | Yes* | nil | User OAuth token (xoxp-...) — alternative to xoxc/xoxd |
| SLACK_MCP_XOXB_TOKEN | Yes* | nil | Bot token (xoxb-...) — alternative to xoxp/xoxc/xoxd. Bot has limited access (invited channels only, no search) |
| SLACK_MCP_PORT | No | 13080 | Port for the MCP server to listen on |
| SLACK_MCP_HOST | No | 127.0.0.1 | Host for the MCP server to listen on |
| SLACK_MCP_API_KEY | No | nil | Bearer token for SSE and HTTP transports |
| SLACK_MCP_PROXY | No | nil | Proxy URL for outgoing requests |
| SLACK_MCP_USER_AGENT | No | nil | Custom User-Agent (for Enterprise Slack environments) |
| SLACK_MCP_CUSTOM_TLS | No | nil | Send custom TLS-handshake to Slack servers based on SLACK_MCP_USER_AGENT or default User-Agent. (for Enterprise Slack environments) |
| SLACK_MCP_SERVER_CA | No | nil | Path to CA certificate |
| SLACK_MCP_SERVER_CA_TOOLKIT | No | nil | Inject HTTPToolkit CA certificate to root trust-store for MitM debugging |
| SLACK_MCP_SERVER_CA_INSECURE | No | false | Trust all insecure requests (NOT RECOMMENDED) |
| SLACK_MCP_ADD_MESSAGE_TOOL | No | nil | Enable message posting via conversations_add_message by setting it to true for all channels, a comma-separated list of channel IDs to whitelist specific channels, or use ! before a channel ID to allow all except specified ones, while an empty value disables posting by default. |
| SLACK_MCP_ADD_MESSAGE_MARK | No | nil | When the conversations_add_message tool is enabled, any new message sent will automatically be marked as read. |
| SLACK_MCP_ADD_MESSAGE_UNFURLING | No | nil | Enable to let Slack unfurl posted links or set comma-separated list of domains e.g. github.com,slack.com to whitelist unfurling only for them. If text contains whitelisted and unknown domain unfurling will be disabled for security reasons. |
| SLACK_MCP_USERS_CACHE | No | ~/Library/Caches/slack-mcp-server/users_cache.json (macOS)<br>~/.cache/slack-mcp-server/users_cache.json (Linux)<br>%LocalAppData%/slack-mcp-server/users_cache.json (Windows) | Path to the users cache file. Used to cache Slack user information to avoid repeated API calls on startup. |
| SLACK_MCP_CHANNELS_CACHE | No | ~/Library/Caches/slack-mcp-server/channels_cache_v2.json (macOS)<br>~/.cache/slack-mcp-server/channels_cache_v2.json (Linux)<br>%LocalAppData%/slack-mcp-server/channels_cache_v2.json (Windows) | Path to the channels cache file. Used to cache Slack channel information to avoid repeated API calls on startup. |
| SLACK_MCP_LOG_LEVEL | No | info | Log-level for stdout or stderr. Valid values are: debug, info, warn, error, panic and fatal |

*You need one of: xoxp (user), xoxb (bot), or both xoxc/xoxd tokens for authentication.

## Limitations matrix & Cache

| Users Cache | Channels Cache | Limitations |
|-------------|----------------|-------------|
| ❌ | ❌ | No cache, No LLM context enhancement with user data, tool channels_list will be fully not functional. Tools conversations_* will have limited capabilities and you won't be able to search messages by @userHandle or #channel-name, getting messages by @userHandle or #channel-name won't be available either. |
| ✅ | ❌ | No channels cache, tool channels_list will be fully not functional. Tools conversations_* will have limited capabilities and you won't be able to search messages by @userHandle or #channel-name, getting messages by @userHandle or #channel-name won't be available either. |
| ✅ | ✅ | No limitations, fully functional Slack MCP Server. |

## Debugging Tools

\`\`\`bash
# Run the inspector with stdio transport
npx @modelcontextprotocol/inspector go run mcp/mcp-server.go --transport stdio

# View logs
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
\`\`\`

## Security

- Never share API tokens
- Keep .env files secure and private

## License

Licensed under MIT - see LICENSE file. This is not an official Slack product.`
    },
    {
      id: 3,
      slug: 'servicenow-mcp-server',
      name: 'ServiceNow',
      displayName: 'servicenow-mcp-server',
      description: 'Open-source repo and certified Store app; AI can query, create, or update incidents, change requests, catalog items, etc., with full OAuth support. Automates ticket triage and change-management chatbots.',
      logo: mcpServerLogos['servicenow-mcp-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 9,
      callCount: '35.7k',
      successRate: '97.83%',
      publishedDate: '1/8/2025',
      modifiedDate: '1/13/2025',
      homepage: 'https://store.servicenow.com/store/app/5eeda18f1b996a10229141d1b24bcbfc',
      sourceUrl: 'https://github.com/echelon-ai-labs/servicenow-mcp',
      provider: 'echelon-ai-labs',
      version: '2.1.0',
      license: 'Apache-2.0',
      tags: ['servicenow', 'itsm', 'tickets', 'incident-management'],
      transport: 'SSE',
      transportType: 'http-streaming',
      deploymentMode: 'Local to cluster',
      location: 'quay.io/echelon-ai-labs/servicenow-mcp:2.1.0',
      deployedFrom: {
        branch: 'main',
        commit: '3c8d5e7'
      },
      isLocal: true,
      connectionUrl: 'servicenow-mcp-server.demo-namespace.svc.cluster.local:8080',
      role: 'default-mcp',
      podId: 'servicenow-mcp-server-4f7a9b2c8e-m3q9p',
      tools: [
        {
          name: 'create_incident',
          description: 'Create a new incident ticket',
          parameters: [
            { name: 'short_description', type: 'string', required: true, description: 'Brief summary of the incident' },
            { name: 'description', type: 'string', required: false, description: 'Detailed description of the incident' },
            { name: 'priority', type: 'string', required: false, description: 'Priority level (1-5)' },
            { name: 'urgency', type: 'string', required: false, description: 'Urgency level (1-3)' },
            { name: 'assignment_group', type: 'string', required: false, description: 'Assignment group name or sys_id' }
          ]
        },
        {
          name: 'search_incidents',
          description: 'Search for existing incidents',
          parameters: [
            { name: 'query', type: 'string', required: false, description: 'Search query text' },
            { name: 'state', type: 'string', required: false, description: 'Incident state filter' },
            { name: 'assigned_to', type: 'string', required: false, description: 'Assigned user filter' },
            { name: 'limit', type: 'number', required: false, description: 'Maximum number of results' }
          ]
        },
        {
          name: 'update_incident',
          description: 'Update an existing incident',
          parameters: [
            { name: 'incident_id', type: 'string', required: true, description: 'Incident number or sys_id' },
            { name: 'state', type: 'string', required: false, description: 'New incident state' },
            { name: 'work_notes', type: 'string', required: false, description: 'Work notes to add' },
            { name: 'resolution_notes', type: 'string', required: false, description: 'Resolution notes' }
          ]
        },
        {
          name: 'create_change_request',
          description: 'Create a new change request',
          parameters: [
            { name: 'short_description', type: 'string', required: true, description: 'Brief summary of the change' },
            { name: 'description', type: 'string', required: false, description: 'Detailed description of the change' },
            { name: 'justification', type: 'string', required: false, description: 'Business justification' },
            { name: 'risk', type: 'string', required: false, description: 'Risk assessment' },
            { name: 'impact', type: 'string', required: false, description: 'Impact level' }
          ]
        },
        {
          name: 'get_catalog_items',
          description: 'List available service catalog items',
          parameters: [
            { name: 'category', type: 'string', required: false, description: 'Catalog category filter' },
            { name: 'search', type: 'string', required: false, description: 'Search term for catalog items' }
          ]
        },
        {
          name: 'request_catalog_item',
          description: 'Request a service catalog item',
          parameters: [
            { name: 'catalog_item_id', type: 'string', required: true, description: 'Catalog item sys_id' },
            { name: 'variables', type: 'object', required: false, description: 'Variable values for the request' },
            { name: 'special_instructions', type: 'string', required: false, description: 'Special instructions' }
          ]
        },
        {
          name: 'get_user_tickets',
          description: 'Get tickets assigned to or requested by a user',
          parameters: [
            { name: 'user_id', type: 'string', required: true, description: 'User sys_id or username' },
            { name: 'type', type: 'string', required: false, description: 'Ticket type filter (incident, task, request)' },
            { name: 'state', type: 'string', required: false, description: 'State filter' }
          ]
        },
        {
          name: 'get_knowledge_articles',
          description: 'Search knowledge base articles',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query for knowledge articles' },
            { name: 'limit', type: 'number', required: false, description: 'Maximum number of results' }
          ]
        },
        {
          name: 'get_cmdb_ci',
          description: 'Get Configuration Item details from CMDB',
          parameters: [
            { name: 'ci_name', type: 'string', required: false, description: 'Configuration Item name' },
            { name: 'ci_id', type: 'string', required: false, description: 'Configuration Item sys_id' },
            { name: 'ci_class', type: 'string', required: false, description: 'CI class filter' }
          ]
        }
      ],
      readme: `# ServiceNow MCP Server

A Model Completion Protocol (MCP) server implementation for ServiceNow, allowing Claude to interact with ServiceNow instances.

## Overview

This project implements an MCP server that enables Claude to connect to ServiceNow instances, retrieve data, and perform actions through the ServiceNow API. It serves as a bridge between Claude and ServiceNow, allowing for seamless integration.

## Features

- Connect to ServiceNow instances using various authentication methods (Basic, OAuth, API Key)
- Query ServiceNow records and tables
- Create, update, and delete ServiceNow records
- Execute ServiceNow scripts and workflows
- Access and query the ServiceNow Service Catalog
- Analyze and optimize the ServiceNow Service Catalog
- Debug mode for troubleshooting
- Support for both stdio and Server-Sent Events (SSE) communication

## Installation

### Prerequisites

- Python 3.11 or higher
- A ServiceNow instance with appropriate access credentials

### Setup

1. Clone this repository:

\`\`\`bash
git clone https://github.com/echelon-ai-labs/servicenow-mcp.git
cd servicenow-mcp
\`\`\`

2. Create a virtual environment and install the package:

\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
pip install -e .
\`\`\`

3. Create a \`.env\` file with your ServiceNow credentials:

\`\`\`
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
SERVICENOW_AUTH_TYPE=basic  # or oauth, api_key
\`\`\`

## Usage

### Standard (stdio) Mode

To start the MCP server:

\`\`\`bash
python -m servicenow_mcp.cli
\`\`\`

Or with environment variables:

\`\`\`bash
SERVICENOW_INSTANCE_URL=https://your-instance.service-now.com SERVICENOW_USERNAME=your-username SERVICENOW_PASSWORD=your-password SERVICENOW_AUTH_TYPE=basic python -m servicenow_mcp.cli
\`\`\`

### Server-Sent Events (SSE) Mode

The ServiceNow MCP server can also run as a web server using Server-Sent Events (SSE) for communication, which allows for more flexible integration options.

#### Starting the SSE Server

You can start the SSE server using the provided CLI:

\`\`\`bash
servicenow-mcp-sse --instance-url=https://your-instance.service-now.com --username=your-username --password=your-password
\`\`\`

By default, the server will listen on 0.0.0.0:8080. You can customize the host and port:

\`\`\`bash
servicenow-mcp-sse --host=127.0.0.1 --port=8000
\`\`\`

#### Connecting to the SSE Server

The SSE server exposes two main endpoints:

- \`/sse\` - The SSE connection endpoint
- \`/messages/\` - The endpoint for sending messages to the server

## Tool Packaging (Optional)

To manage the number of tools exposed to the language model (especially in environments with limits), the ServiceNow MCP server supports loading subsets of tools called "packages". This is controlled via the \`MCP_TOOL_PACKAGE\` environment variable.

### Configuration

- **Environment Variable**: Set the \`MCP_TOOL_PACKAGE\` environment variable to the name of the desired package.
  \`\`\`bash
  export MCP_TOOL_PACKAGE=catalog_builder
  \`\`\`
- **Package Definitions**: The available packages and the tools they include are defined in \`config/tool_packages.yaml\`. You can customize this file to create your own packages.

### Available Packages (Default)

The default \`config/tool_packages.yaml\` includes the following role-based packages:

- **service_desk**: Tools for incident handling and basic user/knowledge lookup
- **catalog_builder**: Tools for creating and managing service catalog items, categories, variables, and related scripting (UI Policies, User Criteria)
- **change_coordinator**: Tools for managing the change request lifecycle, including tasks and approvals
- **knowledge_author**: Tools for creating and managing knowledge bases, categories, and articles
- **platform_developer**: Tools for server-side scripting (Script Includes), workflow development, and deployment (Changesets)
- **system_administrator**: Tools for user/group management and viewing system logs
- **agile_management**: Tools for managing user stories, epics, scrum tasks, and projects
- **full**: Includes all available tools (default)
- **none**: Includes no tools (except list_tool_packages)

## Available Tools

Note: The availability of the following tools depends on the loaded tool package (see Tool Packaging section above). By default (full package), all tools are available.

### Incident Management Tools
- create_incident - Create a new incident in ServiceNow
- update_incident - Update an existing incident in ServiceNow
- add_comment - Add a comment to an incident in ServiceNow
- resolve_incident - Resolve an incident in ServiceNow
- list_incidents - List incidents from ServiceNow

### Service Catalog Tools
- list_catalog_items - List service catalog items from ServiceNow
- get_catalog_item - Get a specific service catalog item from ServiceNow
- list_catalog_categories - List service catalog categories from ServiceNow
- create_catalog_category - Create a new service catalog category in ServiceNow
- update_catalog_category - Update an existing service catalog category in ServiceNow
- move_catalog_items - Move catalog items between categories in ServiceNow
- create_catalog_item_variable - Create a new variable (form field) for a catalog item
- list_catalog_item_variables - List all variables for a catalog item
- update_catalog_item_variable - Update an existing variable for a catalog item
- list_catalogs - List service catalogs from ServiceNow

### Catalog Optimization Tools
- get_optimization_recommendations - Get recommendations for optimizing the service catalog
- update_catalog_item - Update a service catalog item

### Change Management Tools
- create_change_request - Create a new change request in ServiceNow
- update_change_request - Update an existing change request
- list_change_requests - List change requests with filtering options
- get_change_request_details - Get detailed information about a specific change request
- add_change_task - Add a task to a change request
- submit_change_for_approval - Submit a change request for approval
- approve_change - Approve a change request
- reject_change - Reject a change request

### Agile Management Tools
- Story Management: create_story, update_story, list_stories, create_story_dependency, delete_story_dependency
- Epic Management: create_epic, update_epic, list_epics
- Scrum Task Management: create_scrum_task, update_scrum_task, list_scrum_tasks
- Project Management: create_project, update_project, list_projects

### Workflow Management Tools
- list_workflows, get_workflow, create_workflow, update_workflow, delete_workflow

### Script Include Management Tools
- list_script_includes, get_script_include, create_script_include, update_script_include, delete_script_include

### Changeset Management Tools
- list_changesets, get_changeset_details, create_changeset, update_changeset, commit_changeset, publish_changeset, add_file_to_changeset

### Knowledge Base Management Tools
- create_knowledge_base, list_knowledge_bases, create_category, create_article, update_article, publish_article, list_articles, get_article

### User Management Tools
- create_user, update_user, get_user, list_users, create_group, update_group, add_group_members, remove_group_members, list_groups

### UI Policy Tools
- create_ui_policy - Creates a ServiceNow UI Policy, typically for a Catalog Item
- create_ui_policy_action - Creates an action associated with a UI Policy to control variable states (visibility, mandatory, etc.)

## Integration with Claude Desktop

To configure the ServiceNow MCP server in Claude Desktop:

Edit the Claude Desktop configuration file at \`~/Library/Application Support/Claude/claude_desktop_config.json\` (macOS) or the appropriate path for your OS:

\`\`\`json
{
  "mcpServers": {
    "ServiceNow": {
      "command": "/Users/yourusername/dev/servicenow-mcp/.venv/bin/python",
      "args": [
        "-m",
        "servicenow_mcp.cli"
      ],
      "env": {
        "SERVICENOW_INSTANCE_URL": "https://your-instance.service-now.com",
        "SERVICENOW_USERNAME": "your-username",
        "SERVICENOW_PASSWORD": "your-password",
        "SERVICENOW_AUTH_TYPE": "basic"
      }
    }
  }
}
\`\`\`

Restart Claude Desktop to apply the changes.

## Example Usage with Claude

Below are some example natural language queries you can use with Claude to interact with ServiceNow via the MCP server:

### Incident Management Examples
- "Create a new incident for a network outage in the east region"
- "Update the priority of incident INC0010001 to high"
- "List all high priority incidents assigned to the Network team"

### Service Catalog Examples
- "Show me all items in the service catalog"
- "Create a new category called 'Cloud Services' in the service catalog"
- "List all hardware catalog items"

### Change Management Examples
- "Create a change request for server maintenance to apply security patches tomorrow night"
- "Approve the database upgrade change with comment: implementation plan looks thorough"
- "Show me all emergency changes scheduled for this week"

### Agile Management Examples
- "Create a new user story for implementing a new reporting dashboard"
- "List all user stories assigned to the Data Analytics team"
- "Create a new epic called 'Data Analytics Initiatives'"

### Knowledge Base Examples
- "Create a new knowledge base for the IT department"
- "Write an article about VPN setup in the Network Troubleshooting category"
- "Find knowledge articles containing 'password reset' in the IT knowledge base"

### User Management Examples
- "Create a new user Dr. Alice Radiology in the Radiology department"
- "Assign the ITIL role to Bob so he can approve change requests"
- "List all users in the Radiology department"

## Authentication Methods

### Basic Authentication
\`\`\`
SERVICENOW_AUTH_TYPE=basic
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
\`\`\`

### OAuth Authentication
\`\`\`
SERVICENOW_AUTH_TYPE=oauth
SERVICENOW_CLIENT_ID=your-client-id
SERVICENOW_CLIENT_SECRET=your-client-secret
SERVICENOW_TOKEN_URL=https://your-instance.service-now.com/oauth_token.do
\`\`\`

### API Key Authentication
\`\`\`
SERVICENOW_AUTH_TYPE=api_key
SERVICENOW_API_KEY=your-api-key
\`\`\`

## Development

### Documentation

Additional documentation is available in the \`docs\` directory:

- Catalog Integration - Detailed information about the Service Catalog integration
- Catalog Optimization - Detailed plan for catalog optimization features
- Change Management - Detailed information about the Change Management tools
- Workflow Management - Detailed information about the Workflow Management tools
- Changeset Management - Detailed information about the Changeset Management tools

### Troubleshooting

#### Common Errors with Change Management Tools

1. **Error: \`argument after ** must be a mapping, not CreateChangeRequestParams\`**
   - This error occurs when you pass a \`CreateChangeRequestParams\` object instead of a dictionary to the \`create_change_request\` function.
   - Solution: Make sure you're passing a dictionary with the parameters, not a Pydantic model object.

2. **Error: \`Missing required parameter 'type'\`**
   - This error occurs when you don't provide all required parameters for creating a change request.
   - Solution: Make sure to include all required parameters. For \`create_change_request\`, both \`short_description\` and \`type\` are required.

3. **Error: \`Invalid value for parameter 'type'\`**
   - This error occurs when you provide an invalid value for the \`type\` parameter.
   - Solution: Use one of the valid values: "normal", "standard", or "emergency".

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Repository

https://github.com/echelon-ai-labs/servicenow-mcp`
    },
    {
      id: 4,
      slug: 'salesforce-mcp-server',
      name: 'Salesforce',
      displayName: 'salesforce-mcp-server',
      description: 'CLI-installable server that exposes SOQL querying, record CRUD, Apex code access, and schema introspection. Lets support or sales assistants pull account context, open cases, and update opportunities directly from AI prompts.',
      logo: mcpServerLogos['salesforce-mcp-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 8,
      callCount: '31.2k',
      successRate: '98.45%',
      publishedDate: '1/5/2025',
      modifiedDate: '1/10/2025',
      homepage: 'https://github.com/tsmztech/mcp-server-salesforce',
      sourceUrl: 'https://github.com/tsmztech/mcp-server-salesforce',
      provider: 'tsmztech',
      version: '1.8.3',
      license: 'MIT',
      tags: ['salesforce', 'crm', 'soql', 'customer-support'],
      transport: 'SSE',
      transportType: 'http-streaming',
      deploymentMode: 'Local to cluster',
      location: 'https://github.com/tsmztech/mcp-server-salesforce',
      deployedFrom: {
        branch: 'main',
        commit: '8e5f1a9'
      },
      isLocal: false,
      connectionUrl: 'salesforce-mcp-server.demo-namespace.svc.cluster.local:8080',
      role: 'default-mcp',
      podId: 'salesforce-mcp-server-7c9b4e6f2a-r8t5w',
      tools: [
        {
          name: 'soql_query',
          description: 'Execute SOQL queries against Salesforce data',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'SOQL query string' },
            { name: 'limit', type: 'number', required: false, description: 'Maximum number of records to return' }
          ]
        },
        {
          name: 'get_account',
          description: 'Get account details by ID or name',
          parameters: [
            { name: 'account_id', type: 'string', required: false, description: 'Salesforce Account ID' },
            { name: 'account_name', type: 'string', required: false, description: 'Account name to search for' },
            { name: 'include_contacts', type: 'boolean', required: false, description: 'Include related contacts' }
          ]
        },
        {
          name: 'create_case',
          description: 'Create a new support case',
          parameters: [
            { name: 'subject', type: 'string', required: true, description: 'Case subject' },
            { name: 'description', type: 'string', required: false, description: 'Case description' },
            { name: 'account_id', type: 'string', required: false, description: 'Related account ID' },
            { name: 'contact_id', type: 'string', required: false, description: 'Related contact ID' },
            { name: 'priority', type: 'string', required: false, description: 'Case priority (High, Medium, Low)' }
          ]
        },
        {
          name: 'update_opportunity',
          description: 'Update an existing opportunity',
          parameters: [
            { name: 'opportunity_id', type: 'string', required: true, description: 'Opportunity ID' },
            { name: 'stage', type: 'string', required: false, description: 'Sales stage' },
            { name: 'amount', type: 'number', required: false, description: 'Opportunity amount' },
            { name: 'close_date', type: 'string', required: false, description: 'Expected close date (YYYY-MM-DD)' },
            { name: 'probability', type: 'number', required: false, description: 'Win probability percentage' }
          ]
        },
        {
          name: 'search_contacts',
          description: 'Search for contacts by various criteria',
          parameters: [
            { name: 'email', type: 'string', required: false, description: 'Contact email address' },
            { name: 'name', type: 'string', required: false, description: 'Contact name (first or last)' },
            { name: 'account_id', type: 'string', required: false, description: 'Related account ID' },
            { name: 'limit', type: 'number', required: false, description: 'Maximum number of results' }
          ]
        },
        {
          name: 'get_object_schema',
          description: 'Get schema information for Salesforce objects',
          parameters: [
            { name: 'object_name', type: 'string', required: true, description: 'Salesforce object API name (e.g., Account, Contact)' },
            { name: 'include_fields', type: 'boolean', required: false, description: 'Include field definitions' }
          ]
        },
        {
          name: 'execute_apex',
          description: 'Execute custom Apex code',
          parameters: [
            { name: 'apex_code', type: 'string', required: true, description: 'Apex code to execute' },
            { name: 'log_level', type: 'string', required: false, description: 'Debug log level' }
          ]
        },
        {
          name: 'get_recent_records',
          description: 'Get recently created or modified records',
          parameters: [
            { name: 'object_type', type: 'string', required: true, description: 'Salesforce object type' },
            { name: 'limit', type: 'number', required: false, description: 'Number of records to return' },
            { name: 'modified_since', type: 'string', required: false, description: 'ISO date to filter modifications since' }
          ]
        }
      ],
      readme: `# Salesforce MCP Server

An MCP (Model Context Protocol) server implementation that integrates Claude with Salesforce, enabling natural language interactions with your Salesforce data and metadata. This server allows Claude to query, modify, and manage your Salesforce objects and records using everyday language.

## Features

- **Object and Field Management**: Create and modify custom objects and fields using natural language
- **Smart Object Search**: Find Salesforce objects using partial name matches
- **Detailed Schema Information**: Get comprehensive field and relationship details for any object
- **Flexible Data Queries**: Query records with relationship support and complex filters
- **Data Manipulation**: Insert, update, delete, and upsert records with ease
- **Cross-Object Search**: Search across multiple objects using SOSL
- **Apex Code Management**: Read, create, and update Apex classes and triggers
- **Intuitive Error Handling**: Clear feedback with Salesforce-specific error details
- **Switchable Authentication**: Supports multiple orgs. Easily switch your active Salesforce org based on the default org configured in your VS Code workspace (use Salesforce_CLI authentication for this feature).

## Installation

### Global Installation (npm)

\`\`\`bash
npm install -g @tsmztech/mcp-server-salesforce
\`\`\`

### Claude Desktop Quick Installation

For easy setup with Claude Desktop, download the pre-configured extension:

1. Download salesforce-mcp-extension.dxt from the claude-desktop/ folder
2. Open Claude Desktop → Settings → Extensions
3. Drag the .dxt file into the Extensions window
4. Configure your Salesforce credentials when prompted

For manual Claude Desktop configuration, see Usage with Claude Desktop below.

## Tools

### salesforce_search_objects

Search for standard and custom objects:

- Search by partial name matches
- Finds both standard and custom objects
- Example: "Find objects related to Account" will find Account, AccountHistory, etc.

### salesforce_describe_object

Get detailed object schema information:

- Field definitions and properties
- Relationship details
- Picklist values
- Example: "Show me all fields in the Account object"

### salesforce_query_records

Query records with relationship support:

- Parent-to-child relationships
- Child-to-parent relationships
- Complex WHERE conditions
- Example: "Get all Accounts with their related Contacts"

**Note:** For queries with GROUP BY or aggregate functions, use salesforce_aggregate_query

### salesforce_aggregate_query

Execute aggregate queries with GROUP BY:

- GROUP BY single or multiple fields
- Aggregate functions: COUNT, COUNT_DISTINCT, SUM, AVG, MIN, MAX
- HAVING clauses for filtering grouped results
- Date/time grouping functions
- Example: "Count opportunities by stage" or "Find accounts with more than 10 opportunities"

### salesforce_dml_records

Perform data operations:

- Insert new records
- Update existing records
- Delete records
- Upsert using external IDs
- Example: "Update status of multiple accounts"

### salesforce_manage_object

Create and modify custom objects:

- Create new custom objects
- Update object properties
- Configure sharing settings
- Example: "Create a Customer Feedback object"

### salesforce_manage_field

Manage object fields:

- Add new custom fields
- Modify field properties
- Create relationships
- Automatically grants Field Level Security to System Administrator by default
- Use grantAccessTo parameter to specify different profiles
- Example: "Add a Rating picklist field to Account"

### salesforce_manage_field_permissions

Manage Field Level Security (Field Permissions):

- Grant or revoke read/edit access to fields for specific profiles
- View current field permissions
- Bulk update permissions for multiple profiles
- Useful for managing permissions after field creation or for existing fields
- Example: "Grant System Administrator access to Custom_Field__c on Account"

### salesforce_search_all

Search across multiple objects:

- SOSL-based search
- Multiple object support
- Field snippets
- Example: "Search for 'cloud' across Accounts and Opportunities"

### salesforce_read_apex

Read Apex classes:

- Get full source code of specific classes
- List classes matching name patterns
- View class metadata (API version, status, etc.)
- Support for wildcards (* and ?) in name patterns
- Example: "Show me the AccountController class" or "Find all classes matching AccountCont"

### salesforce_write_apex

Create and update Apex classes:

- Create new Apex classes
- Update existing class implementations
- Specify API versions
- Example: "Create a new Apex class for handling account operations"

### salesforce_read_apex_trigger

Read Apex triggers:

- Get full source code of specific triggers
- List triggers matching name patterns
- View trigger metadata (API version, object, status, etc.)
- Support for wildcards (* and ?) in name patterns
- Example: "Show me the AccountTrigger" or "Find all triggers for Contact object"

### salesforce_write_apex_trigger

Create and update Apex triggers:

- Create new Apex triggers for specific objects
- Update existing trigger implementations
- Specify API versions and event operations
- Example: "Create a new trigger for the Account object" or "Update the Lead trigger"

### salesforce_execute_anonymous

Execute anonymous Apex code:

- Run Apex code without creating a permanent class
- View debug logs and execution results
- Useful for data operations not directly supported by other tools
- Example: "Execute Apex code to calculate account metrics" or "Run a script to update related records"

### salesforce_manage_debug_logs

Manage debug logs for Salesforce users:

- Enable debug logs for specific users
- Disable active debug log configurations
- Retrieve and view debug logs
- Configure log levels (NONE, ERROR, WARN, INFO, DEBUG, FINE, FINER, FINEST)
- Example: "Enable debug logs for user@example.com" or "Retrieve recent logs for an admin user"

## Setup

### Salesforce Authentication

You can connect to Salesforce using one of three authentication methods:

1. **Username/Password Authentication (Default)**
   - Set up your Salesforce credentials
   - Get your security token (Reset from Salesforce Settings)

2. **OAuth 2.0 Client Credentials Flow**
   - Create a Connected App in Salesforce
   - Enable OAuth settings and select "Client Credentials Flow"
   - Set appropriate scopes (typically "api" is sufficient)
   - Save the Client ID and Client Secret
   - **Important:** Note your instance URL (e.g., https://your-domain.my.salesforce.com) as it's required for authentication

3. **Salesforce CLI Authentication (Recommended for local/dev)** (contribution by @andrea9293)
   - Install and authenticate Salesforce CLI (sf).
   - Make sure your org is authenticated and accessible via \`sf org display --json\` in the root of your Salesforce project.
   - The server will automatically retrieve the access token and instance url using the CLI.

## Usage with Claude Desktop

Add to your claude_desktop_config.json:

**For Salesforce CLI Authentication:**

\`\`\`json
{
  "mcpServers": {
    "salesforce": {
      "command": "npx",
      "args": ["-y", "@tsmztech/mcp-server-salesforce"],
      "env": {
        "SALESFORCE_CONNECTION_TYPE": "Salesforce_CLI"
      }
    }
  }
}
\`\`\`

**For Username/Password Authentication:**

\`\`\`json
{
  "mcpServers": {
    "salesforce": {
      "command": "npx",
      "args": ["-y", "@tsmztech/mcp-server-salesforce"],
      "env": {
        "SALESFORCE_CONNECTION_TYPE": "User_Password",
        "SALESFORCE_USERNAME": "your_username",
        "SALESFORCE_PASSWORD": "your_password",
        "SALESFORCE_TOKEN": "your_security_token",
        "SALESFORCE_INSTANCE_URL": "org_url"
      }
    }
  }
}
\`\`\`

**For OAuth 2.0 Client Credentials Flow:**

\`\`\`json
{
  "mcpServers": {
    "salesforce": {
      "command": "npx",
      "args": ["-y", "@tsmztech/mcp-server-salesforce"],
      "env": {
        "SALESFORCE_CONNECTION_TYPE": "OAuth_2.0_Client_Credentials",
        "SALESFORCE_CLIENT_ID": "your_client_id",
        "SALESFORCE_CLIENT_SECRET": "your_client_secret",
        "SALESFORCE_INSTANCE_URL": "https://your-domain.my.salesforce.com"
      }
    }
  }
}
\`\`\`

**Note:** For OAuth 2.0 Client Credentials Flow, the SALESFORCE_INSTANCE_URL must be your exact Salesforce instance URL (e.g., https://your-domain.my.salesforce.com). The token endpoint will be constructed as <instance_url>/services/oauth2/token.

## Example Usage

### Searching Objects

- "Find all objects related to Accounts"
- "Show me objects that handle customer service"
- "What objects are available for order management?"

### Getting Schema Information

- "What fields are available in the Account object?"
- "Show me the picklist values for Case Status"
- "Describe the relationship fields in Opportunity"

### Querying Records

- "Get all Accounts created this month"
- "Show me high-priority Cases with their related Contacts"
- "Find all Opportunities over $100k"

### Aggregate Queries

- "Count opportunities by stage"
- "Show me the total revenue by account"
- "Find accounts with more than 10 opportunities"
- "Calculate average deal size by sales rep and quarter"
- "Get the number of cases by priority and status"

### Managing Custom Objects

- "Create a Customer Feedback object"
- "Add a Rating field to the Feedback object"
- "Update sharing settings for the Service Request object"

**Examples with Field Level Security:**

- Default - grants access to System Administrator automatically: "Create a Status picklist field on Custom_Object__c"
- Custom profiles - grants access to specified profiles: "Create a Revenue currency field on Account and grant access to Sales User and Marketing User profiles"

### Managing Field Permissions

- "Grant System Administrator access to Custom_Field__c on Account"
- "Give read-only access to Rating__c field for Sales User profile"
- "View which profiles have access to the Custom_Field__c"
- "Revoke field access for specific profiles"

### Searching Across Objects

- "Search for 'cloud' in Accounts and Opportunities"
- "Find mentions of 'network issue' in Cases and Knowledge Articles"
- "Search for customer name across all relevant objects"

### Managing Apex Code

- "Show me all Apex classes with 'Controller' in the name"
- "Get the full code for the AccountService class"
- "Create a new Apex utility class for handling date operations"
- "Update the LeadConverter class to add a new method"

### Managing Apex Triggers

- "List all triggers for the Account object"
- "Show me the code for the ContactTrigger"
- "Create a new trigger for the Opportunity object"
- "Update the Case trigger to handle after delete events"

### Executing Anonymous Apex Code

- "Execute Apex code to calculate account metrics"
- "Run a script to update related records"
- "Execute a batch job to process large datasets"

### Managing Debug Logs

- "Enable debug logs for user@example.com"
- "Retrieve recent logs for an admin user"
- "Disable debug logs for a specific user"
- "Configure log level to DEBUG for a user"

## Development

### Building from source

\`\`\`bash
# Clone the repository
git clone https://github.com/tsmztech/mcp-server-salesforce.git

# Navigate to directory
cd mcp-server-salesforce

# Install dependencies
npm install

# Build the project
npm run build
\`\`\`

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Issues and Support

If you encounter any issues or need support, please file an issue on the GitHub repository.`
    },
    {
      id: 5,
      slug: 'splunk-mcp-server',
      name: 'Splunk',
      displayName: 'splunk-mcp-server',
      description: 'FastMCP-based tool that runs SPL queries, returns logs/metrics, and auto-scrubs sensitive data. Enables an AI SRE bot to explain spikes, correlate incidents, or draft post-mortems using live Splunk data.',
      logo: mcpServerLogos['splunk-mcp-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 6,
      callCount: '19.8k',
      successRate: '99.23%',
      publishedDate: '1/3/2025',
      modifiedDate: '1/11/2025',
      homepage: 'https://github.com/livehybrid/splunk-mcp',
      sourceUrl: 'https://github.com/livehybrid/splunk-mcp',
      provider: 'livehybrid',
      version: '1.3.1',
      license: 'MIT',
      tags: ['splunk', 'observability', 'logs', 'security'],
      transport: 'SSE',
      transportType: ['sse', 'http-streaming'],
      deploymentMode: 'Remote',
      location: 'https://github.com/livehybrid/splunk-mcp',
      deployedFrom: {
        branch: 'main',
        commit: 'b2d8f93'
      },
      isLocal: false,
      connectionUrl: 'splunk-mcp-server.demo-namespace.svc.cluster.local:8080',
      role: 'default-mcp',
      podId: 'splunk-mcp-server-9e5f3b7c2d-k8p4r',
      tools: [
        {
          name: 'run_search',
          description: 'Execute SPL (Splunk Processing Language) search query',
          parameters: [
            { name: 'search_query', type: 'string', required: true, description: 'SPL search query' },
            { name: 'earliest_time', type: 'string', required: false, description: 'Earliest time for search (e.g., -24h, -7d)' },
            { name: 'latest_time', type: 'string', required: false, description: 'Latest time for search (e.g., now, -1h)' },
            { name: 'max_results', type: 'number', required: false, description: 'Maximum number of results to return' }
          ]
        },
        {
          name: 'get_indexes',
          description: 'List available Splunk indexes',
          parameters: [
            { name: 'filter', type: 'string', required: false, description: 'Filter indexes by name pattern' }
          ]
        },
        {
          name: 'search_events',
          description: 'Search for specific events with filtering',
          parameters: [
            { name: 'index', type: 'string', required: false, description: 'Splunk index to search' },
            { name: 'source', type: 'string', required: false, description: 'Source filter' },
            { name: 'sourcetype', type: 'string', required: false, description: 'Sourcetype filter' },
            { name: 'keywords', type: 'array', required: false, description: 'Keywords to search for' },
            { name: 'time_range', type: 'string', required: false, description: 'Time range (e.g., -1h, -24h)' }
          ]
        },
        {
          name: 'get_metrics',
          description: 'Retrieve metrics and performance data',
          parameters: [
            { name: 'metric_name', type: 'string', required: false, description: 'Specific metric name' },
            { name: 'host', type: 'string', required: false, description: 'Host filter' },
            { name: 'time_range', type: 'string', required: false, description: 'Time range for metrics' },
            { name: 'aggregation', type: 'string', required: false, description: 'Aggregation method (avg, sum, max, min)' }
          ]
        },
        {
          name: 'analyze_patterns',
          description: 'Analyze log patterns and anomalies',
          parameters: [
            { name: 'search_query', type: 'string', required: true, description: 'Base search query for pattern analysis' },
            { name: 'field', type: 'string', required: false, description: 'Field to analyze patterns for' },
            { name: 'time_range', type: 'string', required: false, description: 'Time range for analysis' },
            { name: 'threshold', type: 'number', required: false, description: 'Anomaly detection threshold' }
          ]
        },
        {
          name: 'export_results',
          description: 'Export search results to various formats',
          parameters: [
            { name: 'search_query', type: 'string', required: true, description: 'SPL search query to export' },
            { name: 'format', type: 'string', required: false, description: 'Export format (csv, json, xml)' },
            { name: 'max_results', type: 'number', required: false, description: 'Maximum results to export' },
            { name: 'fields', type: 'array', required: false, description: 'Specific fields to include in export' }
          ]
        }
      ],
      readme: `# Splunk MCP (Model Context Protocol) Tool

A FastMCP-based tool for interacting with Splunk Enterprise/Cloud through natural language. This tool provides a set of capabilities for searching Splunk data, managing KV stores, and accessing Splunk resources through an intuitive interface.

## Operating Modes

The tool operates in three modes:

### SSE Mode (Default)
- Server-Sent Events based communication
- Real-time bidirectional interaction
- Suitable for web-based MCP clients
- Default mode when no arguments provided
- Access via \`/sse\` endpoint

### API Mode
- RESTful API endpoints
- Access via \`/api/v1\` endpoint prefix
- Start with \`python splunk_mcp.py api\`

### STDIO Mode
- Standard input/output based communication
- Compatible with Claude Desktop and other MCP clients
- Ideal for direct integration with AI assistants
- Start with \`python splunk_mcp.py stdio\`

## Features

- **Splunk Search**: Execute Splunk searches with natural language queries
- **Index Management**: List and inspect Splunk indexes
- **User Management**: View and manage Splunk users
- **KV Store Operations**: Create, list, and manage KV store collections
- **Async Support**: Built with async/await patterns for better performance
- **Detailed Logging**: Comprehensive logging with emoji indicators for better visibility
- **SSL Configuration**: Flexible SSL verification options for different security requirements
- **Enhanced Debugging**: Detailed connection and error logging for troubleshooting
- **Comprehensive Testing**: Unit tests covering all major functionality
- **Error Handling**: Robust error handling with appropriate status codes
- **SSE Compliance**: Fully compliant with MCP SSE specification

## Available MCP Tools

The following tools are available via the MCP interface:

### Tools Management
- **list_tools**: Lists all available MCP tools with their descriptions and parameters

### Health Check
- **health_check**: Returns a list of available Splunk apps to verify connectivity
- **ping**: Simple ping endpoint to verify MCP server is alive

### User Management
- **current_user**: Returns information about the currently authenticated user
- **list_users**: Returns a list of all users and their roles

### Index Management
- **list_indexes**: Returns a list of all accessible Splunk indexes
- **get_index_info**: Returns detailed information about a specific index
  - Parameters: index_name (string)
- **indexes_and_sourcetypes**: Returns a comprehensive list of indexes and their sourcetypes

### Search
- **search_splunk**: Executes a Splunk search query
  - Parameters:
    - search_query (string): Splunk search string
    - earliest_time (string, optional): Start time for search window
    - latest_time (string, optional): End time for search window
    - max_results (integer, optional): Maximum number of results to return
- **list_saved_searches**: Returns a list of saved searches in the Splunk instance

### KV Store
- **list_kvstore_collections**: Lists all KV store collections
- **create_kvstore_collection**: Creates a new KV store collection
  - Parameters: collection_name (string)
- **delete_kvstore_collection**: Deletes an existing KV store collection
  - Parameters: collection_name (string)

## SSE Endpoints

When running in SSE mode, the following endpoints are available:

- **/sse**: Returns SSE connection information in text/event-stream format
  - Provides metadata about the SSE connection
  - Includes URL for the messages endpoint
  - Provides protocol and capability information
- **/sse/messages**: The main SSE stream endpoint
  - Streams system events like heartbeats
  - Maintains persistent connection
  - Sends properly formatted SSE events
- **/sse/health**: Health check endpoint for SSE mode
  - Returns status and version information in SSE format

## Error Handling

The MCP implementation includes consistent error handling:

- Invalid search commands or malformed requests
- Insufficient permissions
- Resource not found
- Invalid input validation
- Unexpected server errors
- Connection issues with Splunk server

All error responses include a detailed message explaining the error.

## Installation

### Using UV (Recommended)

UV is a fast Python package installer and resolver, written in Rust. It's significantly faster than pip and provides better dependency resolution.

#### Prerequisites
- Python 3.10 or higher
- UV installed (see UV installation guide)

#### Quick Start with UV

1. **Clone the repository:**
\`\`\`bash
git clone <repository-url>
cd splunk-mcp
\`\`\`

2. **Install dependencies with UV:**
\`\`\`bash
# Install main dependencies
uv sync

# Or install with development dependencies
uv sync --extra dev
\`\`\`

3. **Run the application:**
\`\`\`bash
# SSE mode (default)
uv run python splunk_mcp.py

# STDIO mode
uv run python splunk_mcp.py stdio

# API mode
uv run python splunk_mcp.py api
\`\`\`

#### UV Commands Reference

\`\`\`bash
# Install dependencies
uv sync

# Install with development dependencies
uv sync --extra dev

# Run the application
uv run python splunk_mcp.py

# Run tests
uv run pytest

# Run with specific Python version
uv run --python 3.11 python splunk_mcp.py

# Add a new dependency
uv add fastapi

# Add a development dependency
uv add --dev pytest

# Update dependencies
uv sync --upgrade

# Generate requirements.txt
uv pip compile pyproject.toml -o requirements.txt
\`\`\`

### Using Poetry (Alternative)

If you prefer Poetry, you can still use it:

\`\`\`bash
# Install dependencies
poetry install

# Run the application
poetry run python splunk_mcp.py
\`\`\`

### Using pip (Alternative)

\`\`\`bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python splunk_mcp.py
\`\`\`

## Usage

### Local Usage

The tool can run in three modes:

1. **SSE mode (default for MCP clients):**
\`\`\`bash
# Start in SSE mode (default)
poetry run python splunk_mcp.py
# or explicitly:
poetry run python splunk_mcp.py sse

# Use uvicorn directly:
SERVER_MODE=api poetry run uvicorn splunk_mcp:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

2. **STDIO mode:**
\`\`\`bash
poetry run python splunk_mcp.py stdio
\`\`\`

### Docker Usage

The project supports both the new \`docker compose\` (V2) and legacy \`docker-compose\` (V1) commands. The examples below use V2 syntax, but both are supported.

1. **SSE Mode (Default):**
\`\`\`bash
docker compose up -d mcp
\`\`\`

2. **API Mode:**
\`\`\`bash
docker compose run --rm mcp python splunk_mcp.py api
\`\`\`

3. **STDIO Mode:**
\`\`\`bash
docker compose run -i --rm mcp python splunk_mcp.py stdio
\`\`\`

### Testing with Docker

The project includes a dedicated test environment in Docker:

1. **Run all tests:**
\`\`\`bash
./run_tests.sh --docker
\`\`\`

2. **Run specific test components:**
\`\`\`bash
# Run only the MCP server
docker compose up -d mcp

# Run only the test container
docker compose up test

# Run both with test results
docker compose up --abort-on-container-exit
\`\`\`

Test results will be available in the \`./test-results\` directory.

### Docker Development Tips

1. **Building Images:**
\`\`\`bash
# Build both images
docker compose build

# Build specific service
docker compose build mcp
docker compose build test
\`\`\`

2. **Viewing Logs:**
\`\`\`bash
# View all logs
docker compose logs

# Follow specific service logs
docker compose logs -f mcp
\`\`\`

3. **Debugging:**
\`\`\`bash
# Run with debug mode
DEBUG=true docker compose up mcp

# Access container shell
docker compose exec mcp /bin/bash
\`\`\`

Note: If you're using Docker Compose V1, replace \`docker compose\` with \`docker-compose\` in the above commands.

## Security Notes

1. **Environment Variables:**
   - Never commit \`.env\` files
   - Use \`.env.example\` as a template
   - Consider using Docker secrets for production

2. **SSL Verification:**
   - \`VERIFY_SSL=true\` recommended for production
   - Can be disabled for development/testing
   - Configure through environment variables

3. **Port Exposure:**
   - Only expose necessary ports
   - Use internal Docker network when possible
   - Consider network security in production

## Environment Variables

Configure the following environment variables:

- \`SPLUNK_HOST\`: Your Splunk host address
- \`SPLUNK_PORT\`: Splunk management port (default: 8089)
- \`SPLUNK_USERNAME\`: Your Splunk username
- \`SPLUNK_PASSWORD\`: Your Splunk password
- \`SPLUNK_TOKEN\`: (Optional) Splunk authentication token. If set, this will be used instead of username/password.
- \`SPLUNK_SCHEME\`: Connection scheme (default: https)
- \`VERIFY_SSL\`: Enable/disable SSL verification (default: true)
- \`FASTMCP_LOG_LEVEL\`: Logging level (default: INFO)
- \`SERVER_MODE\`: Server mode (sse, api, stdio) when using uvicorn

## SSL Configuration

The tool provides flexible SSL verification options:

1. **Default (Secure) Mode:**
\`\`\`
VERIFY_SSL=true
\`\`\`
- Full SSL certificate verification
- Hostname verification enabled
- Recommended for production environments

2. **Relaxed Mode:**
\`\`\`
VERIFY_SSL=false
\`\`\`
- SSL certificate verification disabled
- Hostname verification disabled
- Useful for testing or self-signed certificates

## Testing

The project includes comprehensive test coverage using pytest and end-to-end testing with a custom MCP client:

### Running Tests

**Basic test execution:**
\`\`\`bash
poetry run pytest
\`\`\`

**With coverage reporting:**
\`\`\`bash
poetry run pytest --cov=splunk_mcp
\`\`\`

## Repository

https://github.com/livehybrid/splunk-mcp`
    },
    {
      id: 6,
      slug: 'dynatrace-mcp-server',
      name: 'Dynatrace',
      displayName: 'dynatrace-mcp-server',
      description: 'Official Dynatrace-OSS project exposing DQL queries, problem feeds, and vulnerability data. Gives agents real-time service health, letting them recommend rollbacks or capacity fixes inside OpenShift.',
      logo: mcpServerLogos['dynatrace-mcp-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 7,
      callCount: '24.6k',
      successRate: '98.91%',
      publishedDate: '12/28/2024',
      modifiedDate: '1/9/2025',
      homepage: 'https://github.com/dynatrace-oss/dynatrace-mcp',
      sourceUrl: 'https://github.com/dynatrace-oss/dynatrace-mcp',
      provider: 'dynatrace-oss',
      version: '2.0.4',
      license: 'Apache-2.0',
      tags: ['dynatrace', 'monitoring', 'apm', 'vulnerability'],
      transport: 'SSE',
      transportType: 'http-streaming',
      deploymentMode: 'Local to cluster',
      location: 'quay.io/dynatrace-oss/dynatrace-mcp:2.0.4',
      deployedFrom: {
        branch: 'main',
        commit: 'e7f4b12'
      },
      isLocal: true,
      connectionUrl: 'dynatrace-mcp-server.demo-namespace.svc.cluster.local:8080',
      role: 'default-mcp',
      podId: 'dynatrace-mcp-server-7b3e9d4c8f-n6m2q',
      tools: [
        {
          name: 'execute_dql',
          description: 'Execute Dynatrace Query Language (DQL) queries',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'DQL query to execute' },
            { name: 'time_range', type: 'string', required: false, description: 'Time range for query (e.g., -1h, -24h)' },
            { name: 'limit', type: 'number', required: false, description: 'Maximum number of results' }
          ]
        },
        {
          name: 'get_problems',
          description: 'Retrieve current problems and incidents',
          parameters: [
            { name: 'status', type: 'string', required: false, description: 'Problem status filter (open, closed)' },
            { name: 'impact_level', type: 'string', required: false, description: 'Impact level filter (application, service, infrastructure)' },
            { name: 'time_range', type: 'string', required: false, description: 'Time range for problems' }
          ]
        },
        {
          name: 'get_service_health',
          description: 'Get health status of services',
          parameters: [
            { name: 'service_name', type: 'string', required: false, description: 'Specific service name' },
            { name: 'environment', type: 'string', required: false, description: 'Environment filter' },
            { name: 'include_metrics', type: 'boolean', required: false, description: 'Include performance metrics' }
          ]
        },
        {
          name: 'get_vulnerabilities',
          description: 'Retrieve security vulnerability data',
          parameters: [
            { name: 'severity', type: 'string', required: false, description: 'Vulnerability severity filter (critical, high, medium, low)' },
            { name: 'entity_type', type: 'string', required: false, description: 'Entity type (service, host, application)' },
            { name: 'status', type: 'string', required: false, description: 'Vulnerability status' }
          ]
        },
        {
          name: 'analyze_performance',
          description: 'Analyze application and service performance',
          parameters: [
            { name: 'entity_id', type: 'string', required: false, description: 'Specific entity ID to analyze' },
            { name: 'metric_types', type: 'array', required: false, description: 'Types of metrics to analyze' },
            { name: 'time_range', type: 'string', required: false, description: 'Time range for analysis' },
            { name: 'comparison_period', type: 'string', required: false, description: 'Comparison time period' }
          ]
        },
        {
          name: 'get_topology',
          description: 'Get service topology and dependencies',
          parameters: [
            { name: 'entity_id', type: 'string', required: false, description: 'Starting entity ID for topology' },
            { name: 'depth', type: 'number', required: false, description: 'Topology depth to retrieve' },
            { name: 'relationship_types', type: 'array', required: false, description: 'Types of relationships to include' }
          ]
        },
        {
          name: 'create_maintenance_window',
          description: 'Create a maintenance window to suppress alerts',
          parameters: [
            { name: 'name', type: 'string', required: true, description: 'Maintenance window name' },
            { name: 'start_time', type: 'string', required: true, description: 'Start time (ISO format)' },
            { name: 'end_time', type: 'string', required: true, description: 'End time (ISO format)' },
            { name: 'entity_ids', type: 'array', required: false, description: 'Entity IDs to include in maintenance' },
            { name: 'description', type: 'string', required: false, description: 'Maintenance window description' }
          ]
        }
      ],
      readme: `# Dynatrace MCP Server

The local Dynatrace MCP server allows AI Assistants to interact with the Dynatrace observability platform, bringing real-time observability data directly into your development workflow.

**Note:** This product is not officially supported by Dynatrace.

If you need help, please contact us via GitHub Issues if you have feature requests, questions, or need help.

## Quickstart

You can add this MCP server to your MCP Client like VSCode, Claude, Cursor, Amazon Q, Windsurf, ChatGPT, or Github Copilot via the command is \`npx -y @dynatrace-oss/dynatrace-mcp-server\` (type: stdio). For more details, please refer to the configuration section below.

Furthermore, you need to configure the URL to a Dynatrace environment:

- \`DT_ENVIRONMENT\` (string, e.g., https://abc12345.apps.dynatrace.com) - URL to your Dynatrace Platform (do not use Dynatrace classic URLs like abc12345.live.dynatrace.com)

Once you are done, we recommend looking into example prompts, like "Get all details of the entity 'my-service'" or "Show me error logs". Please mind that these prompts lead to executing DQL statements which may incur costs in accordance to your licence.

## Use Cases

- **Real-time observability** - Fetch production-level data for early detection and proactive monitoring
- **Contextual debugging** - Fix issues with full context from monitored exceptions, logs, and anomalies
- **Security insights** - Get detailed vulnerability analysis and security problem tracking
- **Natural language queries** - Use AI-powered DQL generation and explanation
- **Multi-phase incident investigation** - Systematic 4-phase approach with automated impact assessment
- **Advanced transaction analysis** - Precise root cause identification with file/line-level accuracy
- **Cross-data source correlation** - Connect problems → spans → logs with trace ID correlation
- **DevOps automation** - Deployment health gates with automated promotion/rollback logic
- **Security compliance monitoring** - Multi-cloud compliance assessment with evidence-based investigation

## Capabilities

- List and get problem details from your services (for example Kubernetes)
- List and get security problems / vulnerability details
- Execute DQL (Dynatrace Query Language) and retrieve logs, events, spans and metrics
- Send Slack messages (via Slack Connector)
- Set up notification Workflow (via Dynatrace AutomationEngine)
- Get more information about a monitored entity
- Get Ownership of an entity
- Create, list, and read documents (Notebooks, Dashboards, Launchpads, and other Dynatrace documents)

## Costs

**Important:** While this local MCP server is provided for free, using certain capabilities to access data in Dynatrace Grail may incur additional costs based on your Dynatrace consumption model. This affects \`execute_dql\` tool and other capabilities that query Dynatrace Grail storage, and costs depend on the volume (GB scanned).

Before using this MCP server extensively, please:

- Review your current Dynatrace consumption model and pricing
- Understand the cost implications of the specific data you plan to query (logs, events, metrics) - see Dynatrace Pricing and Rate Card
- Start with smaller timeframes (e.g., 12h-24h) and make use of buckets to reduce the cost impact
- Set an appropriate \`DT_GRAIL_QUERY_BUDGET_GB\` environment variable (default: 1000 GB) to control and monitor your Grail query consumption

### Grail Budget Tracking

The MCP server includes built-in budget tracking for Grail queries to help you monitor and control costs:

- Set \`DT_GRAIL_QUERY_BUDGET_GB\` (default: 1000 GB) to define your session budget limit
- The server tracks bytes scanned across all Grail queries in the current session
- You'll receive warnings when approaching 80% of your budget
- Budget exceeded alerts help prevent unexpected high consumption
- Budget resets when you restart the MCP server session

To understand costs that occured:

Execute the following DQL statement in a notebook to see how much bytes have been queried from Grail (Logs, Events, etc...):

\`\`\`
fetch dt.system.events
| filter event.kind == "QUERY_EXECUTION_EVENT" and contains(client.client_context, "dynatrace-mcp")
| sort timestamp desc
| fields timestamp, query_id, query_string, scanned_bytes, table, bucket, user.id, user.email, client.client_context
| maketimeSeries sum(scanned_bytes), by: { user.email, user.id, table }
\`\`\`

## AI-Powered Assistance (Preview)

- **Natural Language to DQL** - Convert plain English queries to Dynatrace Query Language
- **DQL Explanation** - Get plain English explanations of complex DQL queries
- **AI Chat Assistant** - Get contextual help and guidance for Dynatrace questions
- **Feedback System** - Provide feedback to improve AI responses over time

**Note:** While Davis CoPilot AI is generally available (GA), the Davis CoPilot APIs are currently in preview. For more information, visit the Davis CoPilot Preview Community.

## Configuration

You can add this MCP server (using STDIO) to your MCP Client like VS Code, Claude, Cursor, Amazon Q Developer CLI, Windsurf Github Copilot via the package \`@dynatrace-oss/dynatrace-mcp-server\`.

We recommend to always set it up for your current workspace instead of using it globally.

### VS Code

\`\`\`json
{
  "servers": {
    "npx-dynatrace-mcp-server": {
      "command": "npx",
      "cwd": "{workspaceFolder}",
      "args": ["-y", "@dynatrace-oss/dynatrace-mcp-server@latest"],
      "envFile": "{workspaceFolder}/.env"
    }
  }
}
\`\`\`

**Note:** In your actual VS Code configuration file, replace the placeholder \`{workspaceFolder}\` with the VS Code variable that references your workspace folder (dollar sign followed by workspaceFolder in curly braces).

### Claude Desktop

\`\`\`json
{
  "mcpServers": {
    "dynatrace-mcp-server": {
      "command": "npx",
      "args": ["-y", "@dynatrace-oss/dynatrace-mcp-server@latest"],
      "env": {
        "DT_ENVIRONMENT": ""
      }
    }
  }
}
\`\`\`

### HTTP Server Mode (Alternative)

For scenarios where you need to run the MCP server as an HTTP service instead of using stdio (e.g., for stateful sessions, load balancing, or integration with web clients), you can use the HTTP server mode:

\`\`\`bash
# Run with HTTP server on default port 3000
npx -y @dynatrace-oss/dynatrace-mcp-server@latest --http

# Run with custom port
npx -y @dynatrace-oss/dynatrace-mcp-server@latest --http --port 8080
\`\`\`

## Environment Variables

**Breaking Change in v1.0.0:** The MCP server no longer automatically loads .env files. To use environment variables from a .env file, you need to configure your MCP client to load environment variables using the native envFile configuration option.

- \`DT_ENVIRONMENT\` (required, string, e.g., https://abc12345.apps.dynatrace.com) - URL to your Dynatrace Platform (do not use Dynatrace classic URLs like abc12345.live.dynatrace.com)
- \`DT_PLATFORM_TOKEN\` (optional, string, e.g., dt0s16.SAMPLE.abcd1234) - Dynatrace Platform Token
- \`OAUTH_CLIENT_ID\` (optional, string, e.g., dt0s02.SAMPLE) - Alternative: Dynatrace OAuth Client ID (for advanced use cases)
- \`OAUTH_CLIENT_SECRET\` (optional, string, e.g., dt0s02.SAMPLE.abcd1234) - Alternative: Dynatrace OAuth Client Secret (for advanced use cases)
- \`DT_SSO_URL\` (optional, string, e.g., https://sso.dynatrace.com) - Override the SSO URL for OAuth authentication. By default, the SSO URL is automatically discovered from your Dynatrace environment.
- \`DT_GRAIL_QUERY_BUDGET_GB\` (optional, number, default: 1000) - Budget limit in GB (base 1000) for Grail query bytes scanned per session. The MCP server tracks your Grail usage and warns when approaching or exceeding this limit.
- \`SLACK_CONNECTION_ID\` (string) - connection ID of a Slack Connection

When just providing \`DT_ENVIRONMENT\`, the local MCP server will try to open a browser window to authenticate against the Dynatrace SSO.

### Proxy Configuration

The MCP server honors system proxy settings for corporate environments:

- \`https_proxy\` or \`HTTPS_PROXY\` (optional, string, e.g., http://proxy.example.com:8080) - Proxy server URL for HTTPS requests
- \`http_proxy\` or \`HTTP_PROXY\` (optional, string, e.g., http://proxy.example.com:8080) - Proxy server URL for HTTP requests
- \`no_proxy\` or \`NO_PROXY\` (optional, string, e.g., localhost,127.0.0.1,.local) - Comma-separated list of hostnames or domains that should bypass the proxy

## Scopes for Authentication

Depending on the features you are using, the following scopes are needed:

- \`app-engine:apps:run\` - needed for almost all tools
- \`automation:workflows:read\` - read Workflows
- \`automation:workflows:write\` - create and update Workflows
- \`automation:workflows:run\` - run Workflows
- \`app-settings:objects:read\` - read app-settings - needed for send_slack_message tool to read connection details from App-Settings
- \`storage:buckets:read\` - needed for execute_dql tool to read all system data stored on Grail
- \`storage:logs:read\` - needed for execute_dql tool to read logs for reliability guardian validations
- \`storage:metrics:read\` - needed for execute_dql tool to read metrics for reliability guardian validations
- \`storage:bizevents:read\` - needed for execute_dql tool to read bizevents for reliability guardian validations
- \`storage:spans:read\` - needed for execute_dql tool to read spans from Grail
- \`storage:entities:read\` - needed for execute_dql tool to read Entities from Grail
- \`storage:events:read\` - needed for execute_dql tool to read Events from Grail
- \`storage:security.events:read\` - needed for execute_dql tool to read Security Events from Grail
- \`storage:system:read\` - needed for execute_dql tool to read System Data from Grail
- \`storage:user.events:read\` - needed for execute_dql tool to read User events from Grail
- \`storage:user.sessions:read\` - needed for execute_dql tool to read User sessions from Grail
- \`storage:smartscape:read\` - needed for execute_dql tool to read Smartscape Data
- \`davis-copilot:conversations:execute\` - execute conversational skill (chat with Copilot)
- \`davis-copilot:nl2dql:execute\` - execute Davis Copilot Natural Language (NL) to DQL skill
- \`davis-copilot:dql2nl:execute\` - execute DQL to Natural Language (NL) skill
- \`davis:analyzers:read\` - needed for listing and getting Davis analyzer definitions
- \`davis:analyzers:execute\` - needed for executing Davis analyzers
- \`email:emails:send\` - needed for send_email tool to send emails
- \`document:documents:read\` - needed for list_documents and read_document tools to list and read Dynatrace documents (Notebooks, Dashboards, Launchpads, etc.)
- \`document:documents:write\` - needed for create_document tool to create new documents

## Example Prompts

You can start with something as simple as "Is my component monitored by Dynatrace?", and follow up with more sophisticated examples.

## Troubleshooting

### Authentication Issues

In most cases, authentication issues are related to missing scopes or invalid tokens. Please ensure that you have added all required scopes as listed above.

For Platform Tokens:
- Verify your Platform Token has all the necessary scopes listed in the "Scopes for Authentication" section
- Ensure your token is valid and not expired
- Check that your user has the required permissions in your Dynatrace Environment

### Problem accessing data on Grail

Grail has a dedicated section about permissions in the Dynatrace Docs. Please refer to https://docs.dynatrace.com/docs/discover-dynatrace/platform/grail/data-model/assign-permissions-in-grail for more details.

## Telemetry

The Dynatrace MCP Server sends telemetry data using Dynatrace OpenKit BizEvents to help improve the product. This includes:

- Server start events (com.dynatrace-oss.mcp.server-start)
- Client initialization events (com.dynatrace-oss.mcp.client-initialization) - which MCP client is connecting (e.g., VS Code, Claude Desktop, Cursor)
- Tool usage events (com.dynatrace-oss.mcp.tool-usage) - which tools are called, success/failure, execution duration
- Error events (com.dynatrace-oss.mcp.error) - error tracking for debugging and improvement

All telemetry data is sent as Business Events and is accessible via Grail for analysis.

### Privacy and Opt-out

- Telemetry is enabled by default but can be disabled by setting \`DT_MCP_DISABLE_TELEMETRY=true\`
- No sensitive data from your Dynatrace environment is tracked
- Only anonymous usage statistics and error information are collected
- Usage statistics and error data are transmitted to Dynatrace's analytics endpoint

### Configuration options

- \`DT_MCP_DISABLE_TELEMETRY\` (boolean, default: false) - Disable Telemetry
- \`DT_MCP_TELEMETRY_APPLICATION_ID\` (string, default: dynatrace-mcp-server) - Application ID for tracking
- \`DT_MCP_TELEMETRY_ENDPOINT_URL\` (string, default: Dynatrace endpoint) - OpenKit endpoint URL
- \`DT_MCP_TELEMETRY_DEVICE_ID\` (string, default: auto-generated) - Device identifier for tracking

To disable usage tracking, add this to your environment:

\`\`\`
DT_MCP_DISABLE_TELEMETRY=true
\`\`\`

## License

Dynatrace MCP Server is released under the MIT License.

## Repository

https://github.com/dynatrace-oss/dynatrace-mcp`
    },
    {
      id: 7,
      slug: 'github-mcp-server',
      name: 'GitHub',
      displayName: 'github-mcp-server',
      description: 'GitHub-maintained server for listing repos, issues, PRs, commits and creating comments/branches. Fuels coding copilots that can open PRs, draft release notes, or review diffs while respecting repo permissions.',
      logo: mcpServerLogos['github-mcp-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 10,
      callCount: '48.3k',
      successRate: '99.67%',
      publishedDate: '1/6/2025',
      modifiedDate: '1/12/2025',
      homepage: 'https://github.com/github/github-mcp-server',
      sourceUrl: 'https://github.com/github/github-mcp-server',
      provider: 'github',
      version: '1.2.5',
      license: 'MIT',
      tags: ['github', 'git', 'repositories', 'development'],
      transport: 'SSE',
      transportType: ['http-streaming'],
      deploymentMode: 'Remote',
      location: 'https://github.com/github/github-mcp-server',
      deployedFrom: {
        branch: 'main',
        commit: 'c4e7f89'
      },
      isLocal: false,
      connectionUrl: 'github-mcp-server.demo-namespace.svc.cluster.local:8080',
      role: 'default-mcp',
      podId: 'github-mcp-server-5a8c9d2f7e-t3w6y',
      tools: [
        {
          name: 'list_repositories',
          description: 'List repositories for a user or organization',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner (user or organization)' },
            { name: 'type', type: 'string', required: false, description: 'Repository type (all, owner, member)' },
            { name: 'sort', type: 'string', required: false, description: 'Sort order (created, updated, pushed, full_name)' },
            { name: 'per_page', type: 'number', required: false, description: 'Results per page (max 100)' }
          ]
        },
        {
          name: 'get_repository',
          description: 'Get detailed information about a repository',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' }
          ]
        },
        {
          name: 'list_issues',
          description: 'List issues for a repository',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'state', type: 'string', required: false, description: 'Issue state (open, closed, all)' },
            { name: 'labels', type: 'string', required: false, description: 'Comma-separated list of labels' },
            { name: 'assignee', type: 'string', required: false, description: 'Assigned user' }
          ]
        },
        {
          name: 'create_issue',
          description: 'Create a new issue',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'title', type: 'string', required: true, description: 'Issue title' },
            { name: 'body', type: 'string', required: false, description: 'Issue description' },
            { name: 'labels', type: 'array', required: false, description: 'Array of label names' },
            { name: 'assignees', type: 'array', required: false, description: 'Array of usernames to assign' }
          ]
        },
        {
          name: 'list_pull_requests',
          description: 'List pull requests for a repository',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'state', type: 'string', required: false, description: 'PR state (open, closed, all)' },
            { name: 'base', type: 'string', required: false, description: 'Base branch name' },
            { name: 'head', type: 'string', required: false, description: 'Head branch name' }
          ]
        },
        {
          name: 'create_pull_request',
          description: 'Create a new pull request',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'title', type: 'string', required: true, description: 'PR title' },
            { name: 'head', type: 'string', required: true, description: 'Head branch name' },
            { name: 'base', type: 'string', required: true, description: 'Base branch name' },
            { name: 'body', type: 'string', required: false, description: 'PR description' },
            { name: 'draft', type: 'boolean', required: false, description: 'Create as draft PR' }
          ]
        },
        {
          name: 'get_commits',
          description: 'List commits for a repository',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'sha', type: 'string', required: false, description: 'SHA or branch to start listing from' },
            { name: 'path', type: 'string', required: false, description: 'Path to filter commits' },
            { name: 'since', type: 'string', required: false, description: 'ISO date to filter commits since' }
          ]
        },
        {
          name: 'create_branch',
          description: 'Create a new branch',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'branch_name', type: 'string', required: true, description: 'New branch name' },
            { name: 'from_branch', type: 'string', required: false, description: 'Source branch (defaults to default branch)' }
          ]
        },
        {
          name: 'add_comment',
          description: 'Add a comment to an issue or pull request',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'issue_number', type: 'number', required: true, description: 'Issue or PR number' },
            { name: 'body', type: 'string', required: true, description: 'Comment body' }
          ]
        },
        {
          name: 'get_file_content',
          description: 'Get content of a file from a repository',
          parameters: [
            { name: 'owner', type: 'string', required: true, description: 'Repository owner' },
            { name: 'repo', type: 'string', required: true, description: 'Repository name' },
            { name: 'path', type: 'string', required: true, description: 'File path' },
            { name: 'ref', type: 'string', required: false, description: 'Branch, tag, or commit SHA' }
          ]
        }
      ],
      readme: `# GitHub MCP Server

The GitHub MCP Server connects AI tools directly to GitHub's platform. This gives AI agents, assistants, and chatbots the ability to read repositories and code files, manage issues and PRs, analyze code, and automate workflows. All through natural language interactions.

## Use Cases

- **Repository Management**: Browse and query code, search files, analyze commits, and understand project structure across any repository you have access to.
- **Issue & PR Automation**: Create, update, and manage issues and pull requests. Let AI help triage bugs, review code changes, and maintain project boards.
- **CI/CD & Workflow Intelligence**: Monitor GitHub Actions workflow runs, analyze build failures, manage releases, and get insights into your development pipeline.
- **Code Analysis**: Examine security findings, review Dependabot alerts, understand code patterns, and get comprehensive insights into your codebase.
- **Team Collaboration**: Access discussions, manage notifications, analyze team activity, and streamline processes for your team.

Built for developers who want to connect their AI tools to GitHub context and capabilities, from simple natural language queries to complex multi-step agent workflows.

## Remote GitHub MCP Server

The remote GitHub MCP Server is hosted by GitHub and provides the easiest method for getting up and running. If your MCP host does not support remote MCP servers, don't worry! You can use the local version of the GitHub MCP Server instead.

### Prerequisites

- A compatible MCP host with remote server support (VS Code 1.101+, Claude Desktop, Cursor, Windsurf, etc.)
- Any applicable policies enabled

### Install in VS Code

For quick installation, use the one-click install button. Once you complete that flow, toggle Agent mode (located by the Copilot Chat text input) and the server will start. Make sure you're using VS Code 1.101 or later for remote MCP and OAuth support.

Alternatively, to manually configure VS Code, choose the appropriate JSON block from the examples below and add it to your host configuration:

**Using OAuth:**
\`\`\`json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
\`\`\`

**Using a GitHub PAT:**
\`\`\`json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer {input:github_mcp_pat}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "github_mcp_pat",
      "description": "GitHub Personal Access Token",
      "password": true
    }
  ]
}
\`\`\`

### Install in other MCP hosts

- GitHub Copilot in other IDEs - Installation for JetBrains, Visual Studio, Eclipse, and Xcode with GitHub Copilot
- Claude Applications - Installation guide for Claude Desktop and Claude Code CLI
- Codex - Installation guide for Open AI Codex
- Cursor - Installation guide for Cursor IDE
- Windsurf - Installation guide for Windsurf IDE
- Rovo Dev CLI - Installation guide for Rovo Dev CLI

**Note:** Each MCP host application needs to configure a GitHub App or OAuth App to support remote access via OAuth. Any host application that supports remote MCP servers should support the remote GitHub server with PAT authentication. Configuration details and support levels vary by host. Make sure to refer to the host application's documentation for more info.

### Configuration

#### Toolset configuration

See Remote Server Documentation for full details on remote server configuration, toolsets, headers, and advanced usage. This file provides comprehensive instructions and examples for connecting, customizing, and installing the remote GitHub MCP Server in VS Code and other MCP hosts.

When no toolsets are specified, default toolsets are used.

#### GitHub Enterprise

**GitHub Enterprise Cloud with data residency (ghe.com)**

GitHub Enterprise Cloud can also make use of the remote server.

Example for https://octocorp.ghe.com with GitHub PAT token:

\`\`\`json
{
    ...
    "proxima-github": {
      "type": "http",
      "url": "https://copilot-api.octocorp.ghe.com/mcp",
      "headers": {
        "Authorization": "Bearer {input:github_mcp_pat}"
      }
    },
    ...
}
\`\`\`

**Note:** When using OAuth with GitHub Enterprise with VS Code and GitHub Copilot, you also need to configure your VS Code settings to point to your GitHub Enterprise instance - see Authenticate from VS Code

**GitHub Enterprise Server**

GitHub Enterprise Server does not support remote server hosting. Please refer to GitHub Enterprise Server and Enterprise Cloud with data residency (ghe.com) from the local server configuration.

## Local GitHub MCP Server

### Prerequisites

To run the server in a container, you will need to have Docker installed.
Once Docker is installed, you will also need to ensure Docker is running. The Docker image is available at \`ghcr.io/github/github-mcp-server\`. The image is public; if you get errors on pull, you may have an expired token and need to docker logout ghcr.io.
Lastly you will need to Create a GitHub Personal Access Token. The MCP server can use many of the GitHub APIs, so enable the permissions that you feel comfortable granting your AI tools (to learn more about access tokens, please check out the documentation).

### Handling PATs Securely

#### GitHub Enterprise Server and Enterprise Cloud with data residency (ghe.com)

The flag \`--gh-host\` and the environment variable \`GITHUB_HOST\` can be used to set the hostname for GitHub Enterprise Server or GitHub Enterprise Cloud with data residency.

- For GitHub Enterprise Server, prefix the hostname with the https:// URI scheme, as it otherwise defaults to http://, which GitHub Enterprise Server does not support.
- For GitHub Enterprise Cloud with data residency, use \`https://YOURSUBDOMAIN.ghe.com\` as the hostname.

\`\`\`json
"github": {
    "command": "docker",
    "args": [
    "run",
    "-i",
    "--rm",
    "-e",
    "GITHUB_PERSONAL_ACCESS_TOKEN",
    "-e",
    "GITHUB_HOST",
    "ghcr.io/github/github-mcp-server"
    ],
    "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "{input:github_token}",
        "GITHUB_HOST": "https://<your GHES or ghe.com domain name>"
    }
}
\`\`\`

### Installation

#### Install in GitHub Copilot on VS Code

For quick installation, use the one-click install button. Once you complete that flow, toggle Agent mode (located by the Copilot Chat text input) and the server will start.

More about using MCP server tools in VS Code's agent mode documentation.

#### Install in GitHub Copilot on other IDEs (JetBrains, Visual Studio, Eclipse, etc.)

Add the following JSON block to your IDE's MCP settings.

\`\`\`json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "github_token",
        "description": "GitHub Personal Access Token",
        "password": true
      }
    ],
    "servers": {
      "github": {
        "command": "docker",
        "args": [
          "run",
          "-i",
          "--rm",
          "-e",
          "GITHUB_PERSONAL_ACCESS_TOKEN",
          "ghcr.io/github/github-mcp-server"
        ],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "{input:github_token}"
        }
      }
    }
  }
}
\`\`\`

Optionally, you can add a similar example (i.e. without the mcp key) to a file called \`.vscode/mcp.json\` in your workspace. This will allow you to share the configuration with other host applications that accept the same format.

#### Install in Other MCP Hosts

For other MCP host applications, please refer to our installation guides:

- GitHub Copilot in other IDEs - Installation for JetBrains, Visual Studio, Eclipse, and Xcode with GitHub Copilot
- Claude Code & Claude Desktop - Installation guide for Claude Code and Claude Desktop
- Cursor - Installation guide for Cursor IDE
- Google Gemini CLI - Installation guide for Google Gemini CLI
- Windsurf - Installation guide for Windsurf IDE

For a complete overview of all installation options, see our Installation Guides Index.

**Note:** Any host application that supports local MCP servers should be able to access the local GitHub MCP server. However, the specific configuration process, syntax and stability of the integration will vary by host application. While many may follow a similar format to the examples above, this is not guaranteed. Please refer to your host application's documentation for the correct MCP configuration syntax and setup process.

### Build from source

If you don't have Docker, you can use \`go build\` to build the binary in the \`cmd/github-mcp-server\` directory, and use the \`github-mcp-server stdio\` command with the \`GITHUB_PERSONAL_ACCESS_TOKEN\` environment variable set to your token. To specify the output location of the build, use the \`-o\` flag. You should configure your server to use the built executable as its command. For example:

\`\`\`json
{
  "mcp": {
    "servers": {
      "github": {
        "command": "/path/to/github-mcp-server",
        "args": ["stdio"],
        "env": {
          "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
        }
      }
    }
  }
}
\`\`\`

## Tool Configuration

The GitHub MCP Server supports enabling or disabling specific groups of functionalities via the \`--toolsets\` flag. This allows you to control which GitHub API capabilities are available to your AI tools. Enabling only the toolsets that you need can help the LLM with tool choice and reduce the context size.

Toolsets are not limited to Tools. Relevant MCP Resources and Prompts are also included where applicable.

When no toolsets are specified, default toolsets are used.

Looking for examples? See the Server Configuration Guide for common recipes like minimal setups, read-only mode, and combining tools with toolsets.

### Specifying Toolsets

To specify toolsets you want available to the LLM, you can pass an allow-list in two ways:

**Using Command Line Argument:**
\`\`\`bash
github-mcp-server --toolsets repos,issues,pull_requests,actions,code_security
\`\`\`

**Using Environment Variable:**
\`\`\`bash
GITHUB_TOOLSETS="repos,issues,pull_requests,actions,code_security" ./github-mcp-server
\`\`\`

The environment variable \`GITHUB_TOOLSETS\` takes precedence over the command line argument if both are provided.

### Specifying Individual Tools

You can also configure specific tools using the \`--tools\` flag. Tools can be used independently or combined with toolsets and dynamic toolsets discovery for fine-grained control.

**Using Command Line Argument:**
\`\`\`bash
github-mcp-server --tools get_file_contents,issue_read,create_pull_request
\`\`\`

**Using Environment Variable:**
\`\`\`bash
GITHUB_TOOLS="get_file_contents,issue_read,create_pull_request" ./github-mcp-server
\`\`\`

**Combining with Toolsets (additive):**
\`\`\`bash
github-mcp-server --toolsets repos,issues --tools get_gist
\`\`\`

This registers all tools from repos and issues toolsets, plus get_gist.

**Combining with Dynamic Toolsets (additive):**
\`\`\`bash
github-mcp-server --tools get_file_contents --dynamic-toolsets
\`\`\`

This registers get_file_contents plus the dynamic toolset tools (enable_toolset, list_available_toolsets, get_toolset_tools).

**Important Notes:**

- Tools, toolsets, and dynamic toolsets can all be used together
- Read-only mode takes priority: write tools are skipped if \`--read-only\` is set, even if explicitly requested via \`--tools\`
- Tool names must match exactly (e.g., get_file_contents, not getFileContents). Invalid tool names will cause the server to fail at startup with an error message
- When tools are renamed, old names are preserved as aliases for backward compatibility. See Deprecated Tool Aliases for details.

### Using Toolsets With Docker

When using Docker, you can pass the toolsets as environment variables:

\`\`\`bash
docker run -i --rm \\
  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> \\
  -e GITHUB_TOOLSETS="repos,issues,pull_requests,actions,code_security" \\
  ghcr.io/github/github-mcp-server
\`\`\`

### Using Tools With Docker

When using Docker, you can pass specific tools as environment variables. You can also combine tools with toolsets:

**Tools only:**
\`\`\`bash
docker run -i --rm \\
  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> \\
  -e GITHUB_TOOLS="get_file_contents,issue_read,create_pull_request" \\
  ghcr.io/github/github-mcp-server
\`\`\`

**Tools combined with toolsets (additive):**
\`\`\`bash
docker run -i --rm \\
  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> \\
  -e GITHUB_TOOLSETS="repos,issues" \\
  -e GITHUB_TOOLS="get_gist" \\
  ghcr.io/github/github-mcp-server
\`\`\`

### Special toolsets

#### "all" toolset

The special toolset \`all\` can be provided to enable all available toolsets regardless of any other configuration:

\`\`\`bash
./github-mcp-server --toolsets all
\`\`\`

Or using the environment variable:

\`\`\`bash
GITHUB_TOOLSETS="all" ./github-mcp-server
\`\`\`

#### "default" toolset

The default toolset \`default\` is the configuration that gets passed to the server if no toolsets are specified.

The default configuration is:

- context
- repos
- issues
- pull_requests
- users

To keep the default configuration and add additional toolsets:

\`\`\`bash
GITHUB_TOOLSETS="default,stargazers" ./github-mcp-server
\`\`\`

### Available Toolsets

The following sets of tools are available:

- **person / context**: Strongly recommended: Tools that provide context about the current user and GitHub context you are operating in
- **workflow / actions**: GitHub Actions workflows and CI/CD operations
- **codescan / code_security**: Code security related tools, such as GitHub Code Scanning
- **dependabot**: Dependabot tools
- **comment-discussion / discussions**: GitHub Discussions related tools
- **logo-gist / gists**: GitHub Gist related tools
- **git-branch / git**: GitHub Git API related tools for low-level Git operations
- **issue-opened / issues**: GitHub Issues related tools
- **tag / labels**: GitHub Labels related tools
- **bell / notifications**: GitHub Notifications related tools
- **organization / orgs**: GitHub Organization related tools
- **project / projects**: GitHub Projects related tools
- **git-pull-request / pull_requests**: GitHub Pull Request related tools
- **repo / repos**: GitHub Repository related tools
- **shield-lock / secret_protection**: Secret protection related tools, such as GitHub Secret Scanning
- **shield / security_advisories**: Security advisories related tools
- **star / stargazers**: GitHub Stargazers related tools
- **people / users**: GitHub User related tools

### Additional Toolsets in Remote GitHub MCP Server

- **copilot**: Copilot related tools (e.g. Copilot Coding Agent)
- **copilot_spaces**: Copilot Spaces related tools
- **github_support_docs_search**: Search docs to answer GitHub product and support questions

## Dynamic Tool Discovery

**Note:** This feature is currently in beta and is not available in the Remote GitHub MCP Server. Please test it out and let us know if you encounter any issues.

Instead of starting with all tools enabled, you can turn on dynamic toolset discovery. Dynamic toolsets allow the MCP host to list and enable toolsets in response to a user prompt. This should help to avoid situations where the model gets confused by the sheer number of tools available.

### Using Dynamic Tool Discovery

When using the binary, you can pass the \`--dynamic-toolsets\` flag.

\`\`\`bash
./github-mcp-server --dynamic-toolsets
\`\`\`

When using Docker, you can pass the toolsets as environment variables:

\`\`\`bash
docker run -i --rm \\
  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> \\
  -e GITHUB_DYNAMIC_TOOLSETS=1 \\
  ghcr.io/github/github-mcp-server
\`\`\`

## Read-Only Mode

To run the server in read-only mode, you can use the \`--read-only\` flag. This will only offer read-only tools, preventing any modifications to repositories, issues, pull requests, etc.

\`\`\`bash
./github-mcp-server --read-only
\`\`\`

When using Docker, you can pass the read-only mode as an environment variable:

\`\`\`bash
docker run -i --rm \\
  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> \\
  -e GITHUB_READ_ONLY=1 \\
  ghcr.io/github/github-mcp-server
\`\`\`

## Lockdown Mode

Lockdown mode limits the content that the server will surface from public repositories. When enabled, the server checks whether the author of each item has push access to the repository. Private repositories are unaffected, and collaborators keep full access to their own content.

\`\`\`bash
./github-mcp-server --lockdown-mode
\`\`\`

When running with Docker, set the corresponding environment variable:

\`\`\`bash
docker run -i --rm \\
  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> \\
  -e GITHUB_LOCKDOWN_MODE=1 \\
  ghcr.io/github/github-mcp-server
\`\`\`

The behavior of lockdown mode depends on the tool invoked.

Following tools will return an error when the author lacks the push access:

- issue_read:get
- pull_request_read:get

Following tools will filter out content from users lacking the push access:

- issue_read:get_comments
- issue_read:get_sub_issues
- pull_request_read:get_comments
- pull_request_read:get_review_comments
- pull_request_read:get_reviews

## i18n / Overriding Descriptions

The descriptions of the tools can be overridden by creating a \`github-mcp-server-config.json\` file in the same directory as the binary.

The file should contain a JSON object with the tool names as keys and the new descriptions as values. For example:

\`\`\`json
{
  "TOOL_ADD_ISSUE_COMMENT_DESCRIPTION": "an alternative description",
  "TOOL_CREATE_BRANCH_DESCRIPTION": "Create a new branch in a GitHub repository"
}
\`\`\`

You can create an export of the current translations by running the binary with the \`--export-translations\` flag.

This flag will preserve any translations/overrides you have made, while adding any new translations that have been added to the binary since the last time you exported.

\`\`\`bash
./github-mcp-server --export-translations
cat github-mcp-server-config.json
\`\`\`

You can also use ENV vars to override the descriptions. The environment variable names are the same as the keys in the JSON file, prefixed with \`GITHUB_MCP_\` and all uppercase.

For example, to override the \`TOOL_ADD_ISSUE_COMMENT_DESCRIPTION\` tool, you can set the following environment variable:

\`\`\`bash
export GITHUB_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION="an alternative description"
\`\`\`

## Library Usage

The exported Go API of this module should currently be considered unstable, and subject to breaking changes. In the future, we may offer stability; please file an issue if there is a use case where this would be valuable.

## License

This project is licensed under the terms of the MIT open source license. Please refer to MIT for the full terms.`
    },
    {
      id: 8,
      slug: 'postgres-mcp-server',
      name: 'PostgreSQL',
      displayName: '@modelcontextprotocol/server-postgres',
      description: 'Read-only SQL querying with schema discovery, run in a container or as a Node service. Ideal for healthcare/finance use-cases that need tight RBAC, audit trails, and deterministic queries against clinical or financial databases.',
      logo: mcpServerLogos['postgres-mcp-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 6,
      callCount: '22.1k',
      successRate: '99.84%',
      publishedDate: '1/4/2025',
      modifiedDate: '1/7/2025',
      homepage: 'https://www.npmjs.com/package/@modelcontextprotocol/server-postgres',
      sourceUrl: 'https://github.com/modelcontextprotocol/servers',
      provider: 'modelcontextprotocol',
      version: '1.0.8',
      license: 'MIT',
      tags: ['postgresql', 'database', 'sql', 'healthcare'],
      transport: 'SSE',
      transportType: 'sse',
      deploymentMode: 'Local to cluster',
      location: 'quay.io/modelcontextprotocol/server-postgres:1.0.8',
      deployedFrom: {
        branch: 'main',
        commit: 'a9b5c73'
      },
      isLocal: true,
      connectionUrl: 'postgres-mcp-server.demo-namespace.svc.cluster.local:8080',
      role: 'default-mcp',
      podId: 'postgres-mcp-server-3f7b9e1c5d-p2k8m',
      tools: [
        {
          name: 'execute_query',
          description: 'Execute a read-only SQL query against the PostgreSQL database',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'SQL query to execute (read-only)' },
            { name: 'limit', type: 'number', required: false, description: 'Maximum number of rows to return' },
            { name: 'timeout', type: 'number', required: false, description: 'Query timeout in seconds' }
          ]
        },
        {
          name: 'describe_table',
          description: 'Get schema information for a specific table',
          parameters: [
            { name: 'table_name', type: 'string', required: true, description: 'Name of the table to describe' },
            { name: 'schema_name', type: 'string', required: false, description: 'Schema name (defaults to public)' },
            { name: 'include_indexes', type: 'boolean', required: false, description: 'Include index information' }
          ]
        },
        {
          name: 'list_tables',
          description: 'List all tables in the database',
          parameters: [
            { name: 'schema_name', type: 'string', required: false, description: 'Filter by schema name' },
            { name: 'include_views', type: 'boolean', required: false, description: 'Include database views' },
            { name: 'pattern', type: 'string', required: false, description: 'Table name pattern filter' }
          ]
        },
        {
          name: 'list_schemas',
          description: 'List all schemas in the database',
          parameters: [
            { name: 'include_system', type: 'boolean', required: false, description: 'Include system schemas' }
          ]
        },
        {
          name: 'get_table_stats',
          description: 'Get statistics for database tables',
          parameters: [
            { name: 'table_name', type: 'string', required: false, description: 'Specific table name' },
            { name: 'schema_name', type: 'string', required: false, description: 'Schema name' },
            { name: 'include_row_counts', type: 'boolean', required: false, description: 'Include row count estimates' }
          ]
        },
        {
          name: 'explain_query',
          description: 'Get query execution plan without executing the query',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'SQL query to explain' },
            { name: 'analyze', type: 'boolean', required: false, description: 'Include actual execution statistics (executes query)' },
            { name: 'format', type: 'string', required: false, description: 'Output format (text, json, xml, yaml)' }
          ]
        }
      ],
      readme: `# Postgres MCP Pro

A Postgres MCP server with index tuning, explain plans, health checks, and safe sql execution.

## Overview

Postgres MCP Pro is an open source Model Context Protocol (MCP) server built to support you and your AI agents throughout the entire development process—from initial coding, through testing and deployment, and to production tuning and maintenance.

Postgres MCP Pro does much more than wrap a database connection.

Features include:

- 🔍 **Database Health** - analyze index health, connection utilization, buffer cache, vacuum health, sequence limits, replication lag, and more.
- ⚡ **Index Tuning** - explore thousands of possible indexes to find the best solution for your workload, using industrial-strength algorithms.
- 📈 **Query Plans** - validate and optimize performance by reviewing EXPLAIN plans and simulating the impact of hypothetical indexes.
- 🧠 **Schema Intelligence** - context-aware SQL generation based on detailed understanding of the database schema.
- 🛡️ **Safe SQL Execution** - configurable access control, including support for read-only mode and safe SQL parsing, making it usable for both development and production.

Postgres MCP Pro supports both the Standard Input/Output (stdio) and Server-Sent Events (SSE) transports, for flexibility in different environments.

## Quick Start

### Prerequisites

Before getting started, ensure you have:

- Access credentials for your database.
- Docker or Python 3.12 or higher.

### Access Credentials

You can confirm your access credentials are valid by using psql or a GUI tool such as pgAdmin.

### Docker or Python

The choice to use Docker or Python is yours. We generally recommend Docker because Python users can encounter more environment-specific issues. However, it often makes sense to use whichever method you are most familiar with.

### Installation

Choose one of the following methods to install Postgres MCP Pro:

#### Option 1: Using Docker

Pull the Postgres MCP Pro MCP server Docker image. This image contains all necessary dependencies, providing a reliable way to run Postgres MCP Pro in a variety of environments.

\`\`\`bash
docker pull crystaldba/postgres-mcp
\`\`\`

#### Option 2: Using Python

If you have pipx installed you can install Postgres MCP Pro with:

\`\`\`bash
pipx install postgres-mcp
\`\`\`

Otherwise, install Postgres MCP Pro with uv:

\`\`\`bash
uv pip install postgres-mcp
\`\`\`

If you need to install uv, see the uv installation instructions.

### Configure Your AI Assistant

We provide full instructions for configuring Postgres MCP Pro with Claude Desktop. Many MCP clients have similar configuration files, you can adapt these steps to work with the client of your choice.

#### Claude Desktop Configuration

You will need to edit the Claude Desktop configuration file to add Postgres MCP Pro. The location of this file depends on your operating system:

- **MacOS**: \`~/Library/Application Support/Claude/claude_desktop_config.json\`
- **Windows**: \`%APPDATA%/Claude/claude_desktop_config.json\`

You can also use Settings menu item in Claude Desktop to locate the configuration file.

You will now edit the mcpServers section of the configuration file.

**If you are using Docker:**

\`\`\`json
{
  "mcpServers": {
    "postgres": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "DATABASE_URI",
        "crystaldba/postgres-mcp",
        "--access-mode=unrestricted"
      ],
      "env": {
        "DATABASE_URI": "postgresql://username:password@localhost:5432/dbname"
      }
    }
  }
}
\`\`\`

The Postgres MCP Pro Docker image will automatically remap the hostname localhost to work from inside of the container.

- **MacOS/Windows**: Uses host.docker.internal automatically
- **Linux**: Uses 172.17.0.1 or the appropriate host address automatically

**If you are using pipx:**

\`\`\`json
{
  "mcpServers": {
    "postgres": {
      "command": "postgres-mcp",
      "args": [
        "--access-mode=unrestricted"
      ],
      "env": {
        "DATABASE_URI": "postgresql://username:password@localhost:5432/dbname"
      }
    }
  }
}
\`\`\`

**If you are using uv:**

\`\`\`json
{
  "mcpServers": {
    "postgres": {
      "command": "uv",
      "args": [
        "run",
        "postgres-mcp",
        "--access-mode=unrestricted"
      ],
      "env": {
        "DATABASE_URI": "postgresql://username:password@localhost:5432/dbname"
      }
    }
  }
}
\`\`\`

#### Connection URI

Replace \`postgresql://...\` with your Postgres database connection URI.

#### Access Mode

Postgres MCP Pro supports multiple access modes to give you control over the operations that the AI agent can perform on the database:

- **Unrestricted Mode**: Allows full read/write access to modify data and schema. It is suitable for development environments.
- **Restricted Mode**: Limits operations to read-only transactions and imposes constraints on resource utilization (presently only execution time). It is suitable for production environments.

To use restricted mode, replace \`--access-mode=unrestricted\` with \`--access-mode=restricted\` in the configuration examples above.

#### Other MCP Clients

Many MCP clients have similar configuration files to Claude Desktop, and you can adapt the examples above to work with the client of your choice.

- If you are using Cursor, you can use navigate from the Command Palette to Cursor Settings, then open the MCP tab to access the configuration file.
- If you are using Windsurf, you can navigate to from the Command Palette to Open Windsurf Settings Page to access the configuration file.
- If you are using Goose run \`goose configure\`, then select Add Extension.

#### SSE Transport

Postgres MCP Pro supports the SSE transport, which allows multiple MCP clients to share one server, possibly a remote server. To use the SSE transport, you need to start the server with the \`--transport=sse\` option.

For example, with Docker run:

\`\`\`bash
docker run -p 8000:8000 \\
  -e DATABASE_URI=postgresql://username:password@localhost:5432/dbname \\
  crystaldba/postgres-mcp --access-mode=unrestricted --transport=sse
\`\`\`

Then update your MCP client configuration to call the the MCP server. For example, in Cursor's mcp.json or Cline's cline_mcp_settings.json you can put:

\`\`\`json
{
    "mcpServers": {
        "postgres": {
            "type": "sse",
            "url": "http://localhost:8000/sse"
        }
    }
}
\`\`\`

For Windsurf, the format in mcp_config.json is slightly different:

\`\`\`json
{
    "mcpServers": {
        "postgres": {
            "type": "sse",
            "serverUrl": "http://localhost:8000/sse"
        }
    }
}
\`\`\`

### Postgres Extension Installation (Optional)

To enable index tuning and comprehensive performance analysis you need to load the pg_stat_statements and hypopg extensions on your database.

- The **pg_stat_statements** extension allows Postgres MCP Pro to analyze query execution statistics. For example, this allows it to understand which queries are running slow or consuming significant resources.
- The **hypopg** extension allows Postgres MCP Pro to simulate the behavior of the Postgres query planner after adding indexes.

#### Installing extensions on AWS RDS, Azure SQL, or Google Cloud SQL

If your Postgres database is running on a cloud provider managed service, the pg_stat_statements and hypopg extensions should already be available on the system. In this case, you can just run CREATE EXTENSION commands using a role with sufficient privileges:

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS hypopg;
\`\`\`

#### Installing extensions on self-managed Postgres

If you are managing your own Postgres installation, you may need to do additional work. Before loading the pg_stat_statements extension you must ensure that it is listed in the shared_preload_libraries in the Postgres configuration file. The hypopg extension may also require additional system-level installation (e.g., via your package manager) because it does not always ship with Postgres.

## Usage Examples

### Get Database Health Overview

Ask:

> Check the health of my database and identify any issues.

### Analyze Slow Queries

Ask:

> What are the slowest queries in my database? And how can I speed them up?

### Get Recommendations On How To Speed Things Up

Ask:

> My app is slow. How can I make it faster?

### Generate Index Recommendations

Ask:

> Analyze my database workload and suggest indexes to improve performance.

### Optimize a Specific Query

Ask:

> Help me optimize this query: SELECT * FROM orders JOIN customers ON orders.customer_id = customers.id WHERE orders.created_at > '2023-01-01';

## MCP Server API

The MCP standard defines various types of endpoints: Tools, Resources, Prompts, and others.

Postgres MCP Pro provides functionality via MCP tools alone. We chose this approach because the MCP client ecosystem has widespread support for MCP tools. This contrasts with the approach of other Postgres MCP servers, including the Reference Postgres MCP Server, which use MCP resources to expose schema information.

### Postgres MCP Pro Tools:

| Tool Name | Description |
|-----------|-------------|
| list_schemas | Lists all database schemas available in the PostgreSQL instance. |
| list_objects | Lists database objects (tables, views, sequences, extensions) within a specified schema. |
| get_object_details | Provides information about a specific database object, for example, a table's columns, constraints, and indexes. |
| execute_sql | Executes SQL statements on the database, with read-only limitations when connected in restricted mode. |
| explain_query | Gets the execution plan for a SQL query describing how PostgreSQL will process it and exposing the query planner's cost model. Can be invoked with hypothetical indexes to simulate the behavior after adding indexes. |
| get_top_queries | Reports the slowest SQL queries based on total execution time using pg_stat_statements data. |
| analyze_workload_indexes | Analyzes the database workload to identify resource-intensive queries, then recommends optimal indexes for them. |
| analyze_query_indexes | Analyzes a list of specific SQL queries (up to 10) and recommends optimal indexes for them. |
| analyze_db_health | Performs comprehensive health checks including: buffer cache hit rates, connection health, constraint validation, index health (duplicate/unused/invalid), sequence limits, and vacuum health. |

## Frequently Asked Questions

### How is Postgres MCP Pro different from other Postgres MCP servers?

There are many MCP servers allow an AI agent to run queries against a Postgres database. Postgres MCP Pro does that too, but also adds tools for understanding and improving the performance of your Postgres database. For example, it implements a version of the Anytime Algorithm of Database Tuning Advisor for Microsoft SQL Server, a modern industrial-strength algorithm for automatic index tuning.

| Postgres MCP Pro | Other Postgres MCP Servers |
|------------------|----------------------------|
| ✅ Deterministic database health checks | ❌ Unrepeatable LLM-generated health queries |
| ✅ Principled indexing search strategies | ❌ Gen-AI guesses at indexing improvements |
| ✅ Workload analysis to find top problems | ❌ Inconsistent problem analysis |
| ✅ Simulates performance improvements | ❌ Try it yourself and see if it works |

Postgres MCP Pro complements generative AI by adding deterministic tools and classical optimization algorithms The combination is both reliable and flexible.

### Why are MCP tools needed when the LLM can reason, generate SQL, etc?

LLMs are invaluable for tasks that involve ambiguity, reasoning, or natural language. When compared to procedural code, however, they can be slow, expensive, non-deterministic, and sometimes produce unreliable results. In the case of database tuning, we have well established algorithms, developed over decades, that are proven to work. Postgres MCP Pro lets you combine the best of both worlds by pairing LLMs with classical optimization algorithms and other procedural tools.

### How do you test Postgres MCP Pro?

Testing is critical to ensuring that Postgres MCP Pro is reliable and accurate. We are building out a suite of AI-generated adversarial workloads designed to challenge Postgres MCP Pro and ensure it performs under a broad variety of scenarios.

### What Postgres versions are supported?

Our testing presently focuses on Postgres 15, 16, and 17. We plan to support Postgres versions 13 through 17.

### Who created this project?

This project is created and maintained by Crystal DBA.

## Technical Notes

This section includes a high-level overview technical considerations that influenced the design of Postgres MCP Pro.

### Index Tuning

Developers know that missing indexes are one of the most common causes of database performance issues. Indexes provide access methods that allow Postgres to quickly locate data that is required to execute a query. When tables are small, indexes make little difference, but as the size of the data grows, the difference in algorithmic complexity between a table scan and an index lookup becomes significant (typically O(n) vs O(log n), potentially more if joins on multiple tables are involved).

Generating suggested indexes in Postgres MCP Pro proceeds in several stages:

1. **Identify SQL queries in need of tuning.** If you know you are having a problem with a specific SQL query you can provide it. Postgres MCP Pro can also analyze the workload to identify index tuning targets. To do this, it relies on the pg_stat_statements extension, which records the runtime and resource consumption of each query.

   A query is a candidate for index tuning if it is a top resource consumer, either on a per-execution basis or in aggregate. At present, we use execution time as a proxy for cumulative resource consumption, but it may also make sense to look at specifics resources, e.g., the number of blocks accessed or the number of blocks read from disk. The analyze_query_workload tool focuses on slow queries, using the mean time per execution with thresholds for execution count and mean execution time. Agents may also call get_top_queries, which accepts a parameter for mean vs. total execution time, then pass these queries analyze_query_indexes to get index recommendations.

   Sophisticated index tuning systems use "workload compression" to produce a representative subset of queries that reflects the characteristics of the workload as a whole, reducing the problem for downstream algorithms. Postgres MCP Pro performs a limited form of workload compression by normalizing queries so that those generated from the same template appear as one. It weights each query equally, a simplification that works when the benefits to indexing are large.

2. **Generate candidate indexes** Once we have a list of SQL queries that we want to improve through indexing, we generate a list of indexes that we might want to add. To do this, we parse the SQL and identify any columns used in filters, joins, grouping, or sorting.

   To generate all possible indexes we need to consider combinations of these columns, because Postgres supports multicolumn indexes. In the present implementation, we include only one permutation of each possible multicolumn index, which is selected at random. We make this simplification to reduce the search space because permutations often have equivalent performance. However, we hope to improve in this area.

3. **Search for the optimal index configuration.** Our objective is to find the combination of indexes that optimally balances the performance benefits against the costs of storing and maintaining those indexes. We estimate the performance improvement by using the "what if?" capabilities provided by the hypopg extension. This simulates how the Postgres query optimizer will execute a query after the addition of indexes, and reports changes based on the actual Postgres cost model.

   One challenge is that generating query plans generally requires knowledge of the specific parameter values used in the query. Query normalization, which is necessary to reduce the queries under consideration, removes parameter constants. Parameter values provided via bind variables are similarly not available to us.

   To address this problem, we produce realistic constants that we can provide as parameters by sampling from the table statistics. In version 16, Postgres added generic explain plan functionality, but it has limitations, for example around LIKE clauses, which our implementation does not have.

   Search strategy is critical because evaluating all possible index combinations feasible only in simple situations. This is what most sets apart various indexing approaches. Adapting the approach of Microsoft's Anytime algorithm, we employ a greedy search strategy, i.e., find the best one-index solution, then find the best index to add to that to produce a two-index solution. Our search terminates when the time budget is exhausted or when a round of exploration fails to produce any gains above the minimum improvement threshold of 10%.

4. **Cost-benefit analysis.** When posed with two indexing alternatives, one which produces better performance and one which requires more space, how do we decide which to choose? Traditionally, index advisors ask for a storage budget and optimize performance with respect to that storage budget. We also take a storage budget, but perform a cost-benefit analysis throughout the optimization.

   We frame this as the problem of selecting a point along the Pareto front—the set of choices for which improving one quality metric necessarily worsens another. In an ideal world, we might want to assess the cost of the storage and the benefit of improved performance in monetary terms. However, there is a simpler and more practical approach: to look at the changes in relative terms. Most people would agree that a 100x performance improvement is worth it, even if the storage cost is 2x. In our implementation, we use a configurable parameter to set this threshold. By default, we require the change in the log (base 10) of the performance improvement to be 2x the difference in the log of the space cost. This works out to allowing a maximum 10x increase in space for a 100x performance improvement.

   Our implementation is most closely related to the Anytime Algorithm found in Microsoft SQL Server. Compared to Dexter, an automatic indexing tool for Postgres, we search a larger space and use different heuristics. This allows us to generate better solutions at the cost of longer runtime.

   We also show the work done in each round of the search, including a comparison of the query plans before and after the addition of each index. This give the LLM additional context that it can use when responding to the indexing recommendations.

### Database Health

Database health checks identify tuning opportunities and maintenance needs before they lead to critical issues. In the present release, Postgres MCP Pro adapts the database health checks directly from PgHero. We are working to fully validate these checks and may extend them in the future.

- **Index Health.** Looks for unused indexes, duplicate indexes, and indexes that are bloated. Bloated indexes make inefficient use of database pages. Postgres autovacuum cleans up index entries pointing to dead tuples, and marks the entries as reusable. However, it does not compact the index pages and, eventually, index pages may contain few live tuple references.
- **Buffer Cache Hit Rate.** Measures the proportion of database reads that are served from the buffer cache instead of disk. A low buffer cache hit rate must be investigated as it is often not cost-optimal and leads to degraded application performance.
- **Connection Health.** Checks the number of connections to the database and reports on their utilization. The biggest risk is running out of connections, but a high number of idle or blocked connections can also indicate issues.
- **Vacuum Health.** Vacuum is important for many reasons. A critical one is preventing transaction id wraparound, which can cause the database to stop accepting writes. The Postgres multi-version concurrency control (MVCC) mechanism requires a unique transaction id for each transaction. However, because Postgres uses a 32-bit signed integer for transaction ids, it needs to reuse transaction ids after after a maximum of 2 billion transactions. To do this it "freezes" the transaction ids of historical transactions, setting them all to a special value that indicates distant past. When records first go to disk, they are written visibility for a range of transaction ids. Before re-using these transaction ids, Postgres must update any on-disk records, "freezing" them to remove the references to the transaction ids to be reused. This check looks for tables that require vacuuming to prevent transaction id wraparound.
- **Replication Health.** Checks replication health by monitoring lag between primary and replicas, verifying replication status, and tracking usage of replication slots.
- **Constraint Health.** During normal operation, Postgres rejects any transactions that would cause a constraint violation. However, invalid constraints may occur after loading data or in recovery scenarios. This check looks for any invalid constraints.
- **Sequence Health.** Looks for sequences that are at risk of exceeding their maximum value.

### Protected SQL Execution

AI amplifies longstanding challenges of protecting databases from a range of threats, ranging from simple mistakes to sophisticated attacks by malicious actors. Whether the threat is accidental or malicious, a similar security framework applies, with aims that fall into three categories: confidentiality, integrity, and availability. The familiar tension between convenience and safety is also evident and pronounced.

Postgres MCP Pro's protected SQL execution mode focuses on integrity. In the context of MCP, we are most concerned with LLM-generated SQL causing damage—for example, unintended data modification or deletion, or other changes that might circumvent an organization's change management process.

The simplest way to provide integrity is to ensure that all SQL executed against the database is read-only. One way to do this is by creating a database user with read-only access permissions. While this is a good approach, many find this cumbersome in practice. Postgres does not provide a way to place a connection or session into read-only mode, so Postgres MCP Pro uses a more complex approach to ensure read-only SQL execution on top of a read-write connection.

Postgres MCP Provides a read-only transaction mode that prevents data and schema modifications. Like the Reference PostgreSQL MCP Server, we use read-only transactions to provide protected SQL execution.

To make this mechanism robust, we need to ensure that the SQL does not somehow circumvent the read-only transaction mode, say by issuing a COMMIT or ROLLBACK statement and then beginning a new transaction.

For example, the LLM can circumvent the read-only transaction mode by issuing a ROLLBACK statement and then beginning a new transaction. For example:

\`\`\`sql
ROLLBACK; DROP TABLE users;
\`\`\`

To prevent cases like this, we parse the SQL before execution using the pglast library. We reject any SQL that contains commit or rollback statements. Helpfully, the popular Postgres stored procedure languages, including PL/pgSQL and PL/Python, do not allow for COMMIT or ROLLBACK statements. If you have unsafe stored procedure languages enabled on your database, then our read-only protections could be circumvented.

At present, Postgres MCP Pro provides two levels of protection for the database, one at either extreme of the convenience/safety spectrum.

- **"Unrestricted"** provides maximum flexibility. It is suitable for development environments where speed and flexibility are paramount, and where there is no need to protect valuable or sensitive data.
- **"Restricted"** provides a balance between flexibility and safety. It is suitable for production environments where the database is exposed to untrusted users, and where it is important to protect valuable or sensitive data.

Unrestricted mode aligns with the approach of Cursor's auto-run mode, where the AI agent operates with limited human oversight or approvals. We expect auto-run to be deployed in development environments where the consequences of mistakes are low, where databases do not contain valuable or sensitive data, and where they can be recreated or restored from backups when needed.

We designed restricted mode to be conservative, erring on the side of safety even though it may be inconvenient. Restricted mode is limited to read-only operations, and we limit query execution time to prevent long-running queries from impacting system performance. We may add measures in the future to make sure that restricted mode is safe to use with production databases.`
    },
    {
      id: 9,
      slug: 'zapier-mcp-server',
      name: 'Zapier GitHub MCP',
      displayName: 'zapier-mcp-beta',
      description: 'Hosted server that unlocks 7,000-plus SaaS actions via Zapier without writing glue code. Swiss-army-knife for quick PoCs: one endpoint gives agents access to calendars, Jira, NetSuite, etc., under Zapier\'s enterprise security model.',
      logo: mcpServerLogos['zapier-mcp-server'],
      type: 'PUBLIC',
      status: 'Running',
      statusColor: '#52c41a',
      toolCount: 12,
      callCount: '67.4k',
      successRate: '98.32%',
      publishedDate: '1/2/2025',
      modifiedDate: '1/8/2025',
      homepage: 'https://zapier.com/mcp/github',
      sourceUrl: 'https://zapier.com/mcp/github',
      provider: 'zapier',
      version: '3.2.1',
      license: 'Commercial',
      tags: ['zapier', 'automation', 'integration', 'saas'],
      transport: 'SSE',
      transportType: 'http-streaming',
      deploymentMode: 'Remote',
      location: 'https://zapier.com/mcp/github',
      deployedFrom: {
        branch: 'production',
        commit: 'd8c3f92'
      },
      isLocal: false,
      connectionUrl: 'zapier-mcp-server.zapier.com:443',
      role: 'default-mcp',
      podId: 'zapier-mcp-server-6b4e8a9c2f-x7z5w',
      tools: [
        {
          name: 'trigger_zap',
          description: 'Trigger a Zapier automation workflow',
          parameters: [
            { name: 'zap_id', type: 'string', required: true, description: 'Zapier automation ID' },
            { name: 'trigger_data', type: 'object', required: false, description: 'Data to pass to the trigger' },
            { name: 'test_mode', type: 'boolean', required: false, description: 'Run in test mode without executing actions' }
          ]
        },
        {
          name: 'list_zaps',
          description: 'List available Zapier automations',
          parameters: [
            { name: 'status', type: 'string', required: false, description: 'Filter by status (on, off, draft)' },
            { name: 'app_filter', type: 'string', required: false, description: 'Filter by connected app name' },
            { name: 'limit', type: 'number', required: false, description: 'Maximum number of results' }
          ]
        },
        {
          name: 'search_apps',
          description: 'Search available Zapier app integrations',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query for app names' },
            { name: 'category', type: 'string', required: false, description: 'App category filter' },
            { name: 'has_triggers', type: 'boolean', required: false, description: 'Filter apps with triggers' },
            { name: 'has_actions', type: 'boolean', required: false, description: 'Filter apps with actions' }
          ]
        },
        {
          name: 'get_app_actions',
          description: 'Get available actions for a specific app',
          parameters: [
            { name: 'app_name', type: 'string', required: true, description: 'App name or slug' },
            { name: 'action_type', type: 'string', required: false, description: 'Filter by action type' }
          ]
        },
        {
          name: 'execute_action',
          description: 'Execute a specific app action through Zapier',
          parameters: [
            { name: 'app_name', type: 'string', required: true, description: 'App name' },
            { name: 'action_name', type: 'string', required: true, description: 'Action name' },
            { name: 'input_data', type: 'object', required: true, description: 'Input data for the action' },
            { name: 'auth_id', type: 'string', required: false, description: 'Authentication ID for the app' }
          ]
        },
        {
          name: 'create_calendar_event',
          description: 'Create a calendar event (Google Calendar, Outlook, etc.)',
          parameters: [
            { name: 'calendar_app', type: 'string', required: true, description: 'Calendar app (google_calendar, outlook, etc.)' },
            { name: 'title', type: 'string', required: true, description: 'Event title' },
            { name: 'start_time', type: 'string', required: true, description: 'Start time (ISO format)' },
            { name: 'end_time', type: 'string', required: true, description: 'End time (ISO format)' },
            { name: 'description', type: 'string', required: false, description: 'Event description' },
            { name: 'attendees', type: 'array', required: false, description: 'List of attendee email addresses' }
          ]
        },
        {
          name: 'create_jira_ticket',
          description: 'Create a Jira ticket through Zapier',
          parameters: [
            { name: 'project_key', type: 'string', required: true, description: 'Jira project key' },
            { name: 'summary', type: 'string', required: true, description: 'Ticket summary' },
            { name: 'description', type: 'string', required: false, description: 'Ticket description' },
            { name: 'issue_type', type: 'string', required: false, description: 'Issue type (Bug, Task, Story, etc.)' },
            { name: 'priority', type: 'string', required: false, description: 'Priority level' },
            { name: 'assignee', type: 'string', required: false, description: 'Assignee email or username' }
          ]
        },
        {
          name: 'send_slack_message',
          description: 'Send a Slack message through Zapier',
          parameters: [
            { name: 'channel', type: 'string', required: true, description: 'Slack channel name or ID' },
            { name: 'message', type: 'string', required: true, description: 'Message text' },
            { name: 'username', type: 'string', required: false, description: 'Custom username for the message' },
            { name: 'emoji', type: 'string', required: false, description: 'Emoji icon for the message' }
          ]
        },
        {
          name: 'update_spreadsheet',
          description: 'Update Google Sheets or Excel spreadsheet',
          parameters: [
            { name: 'spreadsheet_app', type: 'string', required: true, description: 'Spreadsheet app (google_sheets, excel, etc.)' },
            { name: 'spreadsheet_id', type: 'string', required: true, description: 'Spreadsheet ID' },
            { name: 'worksheet', type: 'string', required: false, description: 'Worksheet name' },
            { name: 'row_data', type: 'object', required: true, description: 'Row data to add or update' },
            { name: 'operation', type: 'string', required: false, description: 'Operation type (create, update, append)' }
          ]
        },
        {
          name: 'send_email',
          description: 'Send email through various email providers',
          parameters: [
            { name: 'email_app', type: 'string', required: true, description: 'Email provider (gmail, outlook, sendgrid, etc.)' },
            { name: 'to', type: 'string', required: true, description: 'Recipient email address' },
            { name: 'subject', type: 'string', required: true, description: 'Email subject' },
            { name: 'body', type: 'string', required: true, description: 'Email body content' },
            { name: 'cc', type: 'string', required: false, description: 'CC email addresses' },
            { name: 'attachments', type: 'array', required: false, description: 'File attachments' }
          ]
        },
        {
          name: 'create_crm_record',
          description: 'Create or update CRM records (Salesforce, HubSpot, etc.)',
          parameters: [
            { name: 'crm_app', type: 'string', required: true, description: 'CRM application (salesforce, hubspot, pipedrive, etc.)' },
            { name: 'record_type', type: 'string', required: true, description: 'Record type (contact, lead, deal, account)' },
            { name: 'record_data', type: 'object', required: true, description: 'Record data fields' },
            { name: 'operation', type: 'string', required: false, description: 'Operation (create, update, upsert)' }
          ]
        },
        {
          name: 'webhook_trigger',
          description: 'Send data to a webhook endpoint',
          parameters: [
            { name: 'webhook_url', type: 'string', required: true, description: 'Webhook URL endpoint' },
            { name: 'payload', type: 'object', required: true, description: 'Data payload to send' },
            { name: 'method', type: 'string', required: false, description: 'HTTP method (POST, PUT, PATCH)' },
            { name: 'headers', type: 'object', required: false, description: 'Custom headers' }
          ]
        }
      ],
      readme: `# Zapier MCP

Connect your AI to thousands of apps with the Model Context Protocol

Transform your AI assistant from a conversational tool into a functional extension of your applications. Zapier MCP is a remote MCP server that gives your AI direct access to 8,000+ apps and 30,000+ actions—no complex API integrations required.

## 🚀 What is Zapier MCP?

Zapier MCP is a standardized way to connect AI assistants to thousands of apps and services. It enables your AI to take real actions like:

- 💬 Send Slack messages and create channels
- 📊 Add rows to Google Sheets and create spreadsheets
- 📧 Send Gmail emails and manage labels
- ✅ Create Asana tasks and update projects
- 🐙 Create GitHub issues and manage PRs
- 📈 Update HubSpot deals and manage contacts

All through natural language commands—just describe what you want done.

## ⚡ Key Features

- **8,000+ App Connections** - Access Zapier's massive library of pre-built integrations
- **30,000+ Actions** - Enable specific tasks and searches across apps
- **Natural Language** - No complex commands needed
- **Secure by Default** - Authentication, encryption, and rate limiting handled by Zapier
- **Multiple Client Support** - Works with Claude, Cursor, Windsurf, and more

## 📚 Getting Started

### 🌟 For Everyone

Quick setup guides and user-friendly overview:

- 🏠 Zapier MCP →
- 🤖 Claude Skills →

### 👨‍💻 For Developers

Get technical documentation, API references, and integration guides:

- 📖 Developer Documentation →
- 🤖 Claude Skills →

## 🏗️ Repository Structure & Development

This repository is not explicitly our Zapier MCP server, but rather all accompanying docs associated with it and organized to maximize reusability and maintainability:

\`\`\`
zapier-mcp/
├── skills/              # Source of truth for all skills
├── commands/            # Source of truth for all commands  
├── plugins/             # Plugin distributions (built from skills/commands)
├── Makefile             # Build system
└── BUILD.md             # Build system documentation
\`\`\`

### Quick Start for Developers

\`\`\`bash
# Initial setup
./scripts/setup.sh

# Build all plugins
make build-all

# Build a specific plugin
make build PLUGIN=zapier-eng-plugin
\`\`\`

**Documentation:**

- QUICKSTART.md - Get started in 5 minutes
- BUILD.md - Complete build system documentation
- CONTRIBUTING.md - Development guidelines

## 🛟 Support

If you need assistance with Zapier MCP, please reach out here:

🆘 Zapier MCP Support →

Zapier MCP is part of the Model Context Protocol ecosystem`
    }
  ];

  const server = servers.find(s => s.slug === serverSlug);

  // Get deployment mode helper function
  const getDeploymentMode = React.useCallback(() => {
    if (!server) return 'N/A';
    if (server.deploymentMode) {
      return server.deploymentMode;
    }
    // Fallback based on isLocal or connectionUrl
    if (server.isLocal !== undefined) {
      return server.isLocal ? 'Local to cluster' : 'Remote';
    }
    return 'N/A';
  }, [server]);

  // Load existing excluded tools when component mounts (only if persist flag is enabled)
  React.useEffect(() => {
    if (server && flags.persistData) {
      try {
        const excludedToolsData = JSON.parse(localStorage.getItem('excludedToolsData') || '{}');
        if (excludedToolsData[server.name] && Array.isArray(excludedToolsData[server.name])) {
          setExcludedTools(new Set(excludedToolsData[server.name]));
        }
      } catch (error) {
        console.warn('Failed to load excluded tools from localStorage:', error);
      }
    }
  }, [server, flags.persistData]); // Depend on server object and persist flag

  // Clear excluded tools when persistData flag is turned off
  const [previousPersistData, setPreviousPersistData] = React.useState(flags.persistData);
  React.useEffect(() => {
    // Only clear when the flag changes from true to false
    if (previousPersistData && !flags.persistData) {
      setExcludedTools(new Set());
      // Also clear from localStorage if it exists
      if (server) {
        try {
          const excludedToolsData = JSON.parse(localStorage.getItem('excludedToolsData') || '{}');
          if (excludedToolsData[server.name]) {
            delete excludedToolsData[server.name];
            localStorage.setItem('excludedToolsData', JSON.stringify(excludedToolsData));
          }
        } catch (error) {
          console.warn('Failed to clear excluded tools from localStorage:', error);
        }
      }
    }
    setPreviousPersistData(flags.persistData);
  }, [flags.persistData, server, previousPersistData]);

  // Clear tokens for this server on component mount (page reload)
  React.useEffect(() => {
    if (server?.name) {
      // Clear token from sessionStorage
      sessionStorage.removeItem(`mcp-token-${server.name}`);
      // Reset authentication state
      setIsAuthenticated(false);
      // Clear form data
      setOAuthForm({
        clientId: '',
        clientSecret: '',
        redirectUri: 'https://your-app.com/oauth/callback'
      });
    }
  }, [server?.name]); // Run when server changes

  // Tools area loading state: show skeleton, then reveal content after delay
  React.useEffect(() => {
    if (!server) return;
    setToolsLoading(true);
    const t = setTimeout(() => setToolsLoading(false), 2500);
    return () => clearTimeout(t);
  }, [server?.slug]);

  if (!server) {
    return (
      <PageSection>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Title headingLevel="h2" size="lg">Server Not Found</Title>
          <p style={{ marginTop: '1rem' }}>The requested MCP server could not be found.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/ai-hub/mcp/catalog')}
            style={{ marginTop: '1rem' }}
          >
            Back to MCP Servers
          </Button>
        </div>
      </PageSection>
    );
  }



  const renderToolsSection = () => {
    const toolsPerPage = 5;

    if (toolsLoading) {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Title headingLevel="h2" size="xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ToolsIcon />
              Tools
            </Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Skeleton width="3rem" height="1.5rem" screenreaderText="Loading pagination" />
              <Skeleton width="2.5rem" height="1rem" screenreaderText="Loading page count" />
              <Skeleton width="3rem" height="1.5rem" screenreaderText="Loading pagination" />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <Skeleton width="100%" height="2.25rem" screenreaderText="Loading search" />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <Card style={{ border: '1px solid #e5e7eb' }}>
                  <CardBody style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Skeleton width="40%" fontSize="md" screenreaderText="Loading tool name" />
                      <Skeleton width="90%" height="0.875rem" screenreaderText="Loading description" />
                      <Skeleton width="70%" height="0.875rem" screenreaderText="Loading description" />
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Sort tools by access level: destructive first, then read/write, then read-only
    const sortedTools = [...server.tools].sort((a, b) => {
      const aIsDestructive = a.name === 'k8s_delete';
      const bIsDestructive = b.name === 'k8s_delete';
      const aIsWriteAccess = writeTools.has(a.name) || servicenowWriteTools.has(a.name) || dynatraceWriteTools.has(a.name) || githubWriteTools.has(a.name) || postgresWriteTools.has(a.name) || salesforceWriteTools.has(a.name) || slackWriteTools.has(a.name) || zapierWriteTools.has(a.name);
      const bIsWriteAccess = writeTools.has(b.name) || servicenowWriteTools.has(b.name) || dynatraceWriteTools.has(b.name) || githubWriteTools.has(b.name) || postgresWriteTools.has(b.name) || salesforceWriteTools.has(b.name) || slackWriteTools.has(b.name) || zapierWriteTools.has(b.name);
      
      // Destructive tools first
      if (aIsDestructive && !bIsDestructive) return -1;
      if (!aIsDestructive && bIsDestructive) return 1;
      
      // If both or neither are destructive, check read/write access
      if (aIsWriteAccess && !bIsWriteAccess && !bIsDestructive) return -1;
      if (!aIsWriteAccess && bIsWriteAccess && !aIsDestructive) return 1;
      
      // If same access level, maintain original order
      return 0;
    });

    // Filter tools by name or description
    const filterLower = toolsFilterValue.trim().toLowerCase();
    const filteredTools = filterLower
      ? sortedTools.filter(t =>
          t.name.toLowerCase().includes(filterLower) ||
          (t.description && t.description.toLowerCase().includes(filterLower))
        )
      : sortedTools;

    const startIndex = toolPageIndex * toolsPerPage;
    const endIndex = Math.min(startIndex + toolsPerPage, filteredTools.length);
    const currentTools = filteredTools.slice(startIndex, endIndex);
    const totalPages = Math.max(1, Math.ceil(filteredTools.length / toolsPerPage));

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Title headingLevel="h2" size="xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ToolsIcon />
            Tools
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="plain"
              isDisabled={toolPageIndex === 0}
              onClick={() => setToolPageIndex(prev => Math.max(0, prev - 1))}
              style={{ fontSize: '0.75rem' }}
            >
              &lt;
            </Button>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {toolPageIndex + 1} / {totalPages}
            </span>
            <Button
              variant="plain"
              isDisabled={toolPageIndex >= totalPages - 1}
              onClick={() => setToolPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
              style={{ fontSize: '0.75rem' }}
            >
              &gt;
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <SearchInput
            placeholder="Filter by name or description"
            value={toolsFilterValue}
            onChange={(_event, value) => {
              setToolsFilterValue(value);
              setToolPageIndex(0);
            }}
            onClear={() => {
              setToolsFilterValue('');
              setToolPageIndex(0);
            }}
            aria-label="Filter tools by name or description"
            id="mcp-details-tools-filter"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          {currentTools.length === 0 ? (
            <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
              {toolsFilterValue.trim() ? 'No tools match the filter.' : 'No tools available.'}
            </div>
          ) : currentTools.map((tool, index) => (
            <div key={index} style={{ marginBottom: '0.75rem' }}>
              <Card style={{ border: '1px solid #e5e7eb' }}>
                <CardBody style={{ padding: 0 }}>
                  <div>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '1rem',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        borderBottom: expandedTools.has(tool.name) ? '1px solid #e5e7eb' : 'none'
                      }}
                      onClick={() => toggleToolExpansion(tool.name)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#151515' }}>
                            {tool.name}
                          </span>
                          {tool.name === 'k8s_delete' && (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#dc2626',
                              backgroundColor: '#fef2f2',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontWeight: 500
                            }}>
                              destructive
                            </span>
                          )}
                          {(writeTools.has(tool.name) || servicenowWriteTools.has(tool.name) || dynatraceWriteTools.has(tool.name) || githubWriteTools.has(tool.name) || postgresWriteTools.has(tool.name) || salesforceWriteTools.has(tool.name) || slackWriteTools.has(tool.name) || zapierWriteTools.has(tool.name)) && (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#d97706',
                              backgroundColor: '#fef3c7',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontWeight: 500
                            }}>
                              read/write
                            </span>
                          )}
                          {excludedTools.has(tool.name) && (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#d97706',
                              backgroundColor: '#fef3c7',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '0.25rem',
                              fontWeight: 500
                            }}>
                              Usage example updated: tool exclusion
                            </span>
                          )}
                        </div>
                        {tool.description && (
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              color: '#6b7280',
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical' as const,
                            }}
                          >
                            {tool.description}
                          </div>
                        )}
                      </div>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280',
                        transform: expandedTools.has(tool.name) ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}>
                        &#9654;
                      </span>
                    </div>
                    {expandedTools.has(tool.name) && (
                    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280', 
                          margin: 0,
                          lineHeight: '1.5'
                        }}>
                          {tool.description}
                        </p>
                      </div>
                      {tool.parameters.length === 0 ? (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                            No input parameters required
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                              Input Parameters:
                            </span>
                          </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {tool.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} style={{ 
                            backgroundColor: '#ffffff',
                            padding: '0.75rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span style={{ 
                                fontFamily: 'monospace', 
                                fontSize: '0.875rem', 
                                fontWeight: 600,
                                color: '#1f2937'
                              }}>
                                {param.name}
                              </span>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                color: '#6b7280',
                                backgroundColor: '#f3f4f6',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem'
                              }}>
                                {param.type}
                              </span>
                              {param.required && (
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  color: '#dc2626',
                                  backgroundColor: '#fef2f2',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '0.25rem',
                                  fontWeight: 500
                                }}>
                                  required
                                </span>
                              )}
                              {!param.required && (
                                <span style={{ 
                                  fontSize: '0.75rem', 
                                  color: '#6b7280',
                                  backgroundColor: '#f9fafb',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '0.25rem'
                                }}>
                                  optional
                                </span>
                              )}
                            </div>
                            <p style={{ 
                              fontSize: '0.875rem', 
                              color: '#4b5563', 
                              margin: 0,
                              lineHeight: '1.4'
                            }}>
                              {param.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                      </div>
                    )}
                  </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        </div>
      );
    };



  const escapeHtml = (text: string) => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const processInlineFormatting = (text: string): string => {
    // Process links first (before other formatting)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: none;">$1</a>');
    
    // Process bold (**text**)
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Process italic (*text* or _text_)
    text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    text = text.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
    
    // Process inline code (`code`)
    text = text.replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>');
    
    return text;
  };

  const renderMarkdown = (markdown: string) => {
    if (!markdown) return '';
    
    const lines = markdown.split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeBlockContent = '';
    let inList = false;
    let inOrderedList = false;
    let currentParagraph = '';
    
    const flushParagraph = () => {
      if (currentParagraph.trim()) {
        const processed = processInlineFormatting(currentParagraph.trim());
        html += `<p style="margin-bottom: 1rem; line-height: 1.6;">${processed}</p>`;
        currentParagraph = '';
      }
    };
    
    const closeLists = () => {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (inOrderedList) {
        html += '</ol>';
        inOrderedList = false;
      }
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          // Close code block
          flushParagraph();
          closeLists();
          const escapedContent = escapeHtml(codeBlockContent);
          html += `<pre style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 1rem; overflow-x: auto; margin: 1rem 0;"><code style="font-family: monospace; font-size: 0.875rem; line-height: 1.5;">${escapedContent}</code></pre>`;
          codeBlockContent = '';
          inCodeBlock = false;
        } else {
          // Open code block
          flushParagraph();
          closeLists();
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeBlockContent += (codeBlockContent ? '\n' : '') + line;
        continue;
      }
      
      // Headers (h1-h6)
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        flushParagraph();
        closeLists();
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const processed = processInlineFormatting(text);
        const styles = {
          1: 'font-size: 2rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem;',
          2: 'font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem;',
          3: 'font-size: 1.25rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem;',
          4: 'font-size: 1.125rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem;',
          5: 'font-size: 1rem; font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem;',
          6: 'font-size: 0.875rem; font-weight: 600; margin-top: 0.5rem; margin-bottom: 0.5rem;'
        };
        html += `<h${level} style="${styles[level as keyof typeof styles] || ''}">${processed}</h${level}>`;
        continue;
      }
      
      // Ordered lists
      const orderedListMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (orderedListMatch) {
        flushParagraph();
        if (!inOrderedList) {
          closeLists();
          html += '<ol style="margin-left: 1.5rem; margin-bottom: 1rem;">';
          inOrderedList = true;
        }
        const listItem = orderedListMatch[2];
        const processed = processInlineFormatting(listItem);
        html += `<li style="margin-bottom: 0.5rem;">${processed}</li>`;
        continue;
      }
      
      // Unordered lists
      if (trimmedLine.match(/^[-*]\s+(.+)$/)) {
        flushParagraph();
        if (!inList) {
          closeLists();
          html += '<ul style="margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc;">';
          inList = true;
        }
        const listItem = trimmedLine.substring(2);
        const processed = processInlineFormatting(listItem);
        html += `<li style="margin-bottom: 0.5rem;">${processed}</li>`;
        continue;
      }
      
      // Horizontal rule
      if (trimmedLine.match(/^[-*_]{3,}$/)) {
        flushParagraph();
        closeLists();
        html += '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />';
        continue;
      }
      
      // Empty lines
      if (!trimmedLine) {
        flushParagraph();
        if (inList || inOrderedList) {
          // Don't close lists on empty lines, just continue
          continue;
        }
        continue;
      }
      
      // Regular text - accumulate into paragraph
      currentParagraph += (currentParagraph ? ' ' : '') + line;
    }
    
    // Flush any remaining content
    flushParagraph();
    closeLists();
    
    // Close any open code block
    if (inCodeBlock) {
      const escapedContent = escapeHtml(codeBlockContent);
      html += `<pre style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 1rem; overflow-x: auto; margin: 1rem 0;"><code style="font-family: monospace; font-size: 0.875rem; line-height: 1.5;">${escapedContent}</code></pre>`;
    }
    
    return html;
  };

  const renderReadmeSection = () => {
    if (!server.readme) return null;

    return (
      <div>
        <Title headingLevel="h2" size="xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <GithubIcon />
          README
        </Title>
        
        <div 
          style={{ 
            fontSize: '0.875rem',
            lineHeight: '1.6',
            color: '#1f2937'
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(server.readme) }}
        />
      </div>
    );
  };

  const renderDetailsSection = () => {
    // Get transport type display - handle both single and multiple transport types
    const getTransportType = () => {
      if (server.transportType) {
        if (Array.isArray(server.transportType)) {
          return server.transportType.join(', ');
        }
        return server.transportType;
      }
      // Fallback to transport field if transportType doesn't exist
      return server.transport || 'N/A';
    };

    // Get deployment mode
    const getDeploymentMode = () => {
      if (server.deploymentMode) {
        return server.deploymentMode;
      }
      // Fallback based on isLocal or connectionUrl
      if (server.isLocal !== undefined) {
        return server.isLocal ? 'Local to cluster' : 'Remote';
      }
      return 'N/A';
    };

    // Format date as relative time (e.g. "12 months ago") - use months through 23 months, then years
    const formatDateRelative = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return '1 day ago';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 730) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    };

    // Format date for tooltip (e.g. "2/10/2025, 6:04:43 PM UTC")
    const formatDateFull = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { timeZone: 'UTC', month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }) + ' UTC';
    };

    return (
      <div>
        <Title headingLevel="h2" size="xl" style={{ marginBottom: '1rem' }}>
          Server details
        </Title>
        
        <div>
          <div style={{ padding: '1rem 0' }}>
            <Grid hasGutter>
              {/* Endpoint - first item, only for remote servers */}
              {server.connectionUrl && getDeploymentMode() === 'Remote' && (
                <GridItem span={12}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                      Endpoint
                    </Title>
                    <div style={{ overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
                      <ClipboardCopy
                        id="mcp-details-connection-endpoint-copy"
                        variant="inline-compact"
                        hoverTip="Copy"
                        clickTip="Copied"
                        isReadOnly
                      >
                        {server.connectionUrl}
                      </ClipboardCopy>
                    </div>
                  </div>
                </GridItem>
              )}

              {/* Tags */}
              {server.tags && server.tags.length > 0 && (
                <GridItem span={12}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                      Labels
                    </Title>
                    <LabelGroup>
                      {server.tags.map((tag: string, index: number) => (
                        <Label key={index} variant="outline">
                          {tag}
                        </Label>
                      ))}
                    </LabelGroup>
                  </div>
                </GridItem>
              )}

              {/* License */}
              {server.license && (
                <GridItem span={12}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                      License
                    </Title>
                    {(() => {
                      const licenseUrl = server.slug === 'zapier-mcp-server'
                        ? 'https://opensource.org/license/mit'
                        : (server.sourceUrl && server.sourceUrl.includes('github.com')
                          ? `${server.sourceUrl}/blob/main/LICENSE`
                          : null);
                      return licenseUrl ? (
                        <Button
                          variant="link"
                          isInline
                          component="a"
                          href={licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          icon={<ExternalLinkAltIcon />}
                          iconPosition="end"
                          style={{ fontSize: '0.875rem', fontWeight: 500, padding: 0 }}
                        >
                          Agreement
                        </Button>
                      ) : (
                        <Button
                          variant="link"
                          isInline
                          icon={<ExternalLinkAltIcon />}
                          iconPosition="end"
                          style={{ fontSize: '0.875rem', fontWeight: 500, padding: 0 }}
                          onClick={() => {}}
                        >
                          Agreement
                        </Button>
                      );
                    })()}
                  </div>
                </GridItem>
              )}

              {/* Version */}
              {server.version && (
                <GridItem span={12}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                      Version
                    </Title>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{server.version}</span>
                  </div>
                </GridItem>
              )}

              {/* Deployment Mode */}
              <GridItem span={12}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                    Deployment mode
                  </Title>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{getDeploymentMode()}</span>
                </div>
              </GridItem>

              {/* Artifacts - copyable text field like model catalog */}
              {server.location && getDeploymentMode() !== 'Remote' && (
                <GridItem span={12}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                      Artifacts
                    </Title>
                    <div style={{ overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
                      <ClipboardCopy
                        id="mcp-details-location-copy"
                        variant="inline-compact"
                        hoverTip="Copy"
                        clickTip="Copied"
                        isReadOnly
                      >
                        {server.location}
                      </ClipboardCopy>
                    </div>
                  </div>
                </GridItem>
              )}

              {/* Source Code */}
              {server.sourceUrl && (
                <GridItem span={12}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                      Source Code
                    </Title>
                    <a 
                      href={server.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '0.875rem', 
                        textDecoration: 'none', 
                        color: '#1f2937',
                        maxWidth: '100%'
                      }}
                    >
                      <GithubIcon style={{ width: '1rem', height: '1rem', marginRight: '0.25rem', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {server.sourceUrl.replace('https://github.com/', '')}
                      </span>
                    </a>
                  </div>
                </GridItem>
              )}

              {/* Provider - below Source Code */}
              {server.provider && (
                <GridItem span={12}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                      Provider
                    </Title>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{server.provider}</span>
                  </div>
                </GridItem>
              )}

              {/* Transport Type - below Source Code */}
              <GridItem span={12}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                    Transport type
                  </Title>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{getTransportType()}</span>
                </div>
              </GridItem>

              {/* Last modified - matches model catalog timestamp (relative + tooltip) */}
              {server.modifiedDate && (
                <GridItem span={12}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                      Last modified
                    </Title>
                    <Tooltip content={formatDateFull(server.modifiedDate)}>
                      <span id="mcp-details-last-modified-timestamp" className="pf-v6-c-timestamp pf-m-help-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <OutlinedClockIcon style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} aria-hidden />
                        <time dateTime={new Date(server.modifiedDate).toISOString()}>
                          {formatDateRelative(server.modifiedDate)}
                        </time>
                      </span>
                    </Tooltip>
                  </div>
                </GridItem>
              )}
            </Grid>
          </div>
        </div>
      </div>
    );
  };

  // Handle accordion toggle
  const onToggle = (id: string) => {
    const index = expandedAccordions.indexOf(id);
    const newExpanded = index >= 0 
      ? [...expandedAccordions.slice(0, index), ...expandedAccordions.slice(index + 1, expandedAccordions.length)]
      : [...expandedAccordions, id];
    setExpandedAccordions(newExpanded);
  };

  // Handle knowledge source selection
  const handleKnowledgeSourceChange = (sourceId: string, checked: boolean) => {
    if (checked) {
      setSelectedKnowledgeSources(prev => [...prev, sourceId]);
    } else {
      setSelectedKnowledgeSources(prev => prev.filter(id => id !== sourceId));
    }
  };

  // Render configuration accordions for drawer
  const renderConfigurationAccordions = () => {
    const availableModels = [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
      { value: 'llama-3.1-70b', label: 'Llama 3.1 70B' }
    ];

    const availableKnowledgeSources = [
      { id: 'company-docs', name: 'Company Documentation', description: 'Internal documentation and policies' },
      { id: 'product-specs', name: 'Product Specifications', description: 'Technical product documentation' },
      { id: 'customer-data', name: 'Customer Data', description: 'Customer profiles and interaction history' },
      { id: 'external-apis', name: 'External APIs', description: 'Third-party service documentation' }
    ];

    return (
      <div style={{ marginBottom: '1rem' }}>
                 <Accordion>
           <AccordionItem>
                         <AccordionToggle
              onClick={() => onToggle('model-selection')}
              id="model-selection-toggle"
            >
              Models
            </AccordionToggle>
             <AccordionContent
               id="model-selection-content"
               hidden={!expandedAccordions.includes('model-selection')}
             >
               <div style={{ padding: '1rem 0' }}>
                 <FormSelect
                   value={selectedModel}
                   onChange={(_event, value) => setSelectedModel(value)}
                   aria-label="Select AI Model"
                 >
                   {availableModels.map(model => (
                     <FormSelectOption key={model.value} value={model.value} label={model.label} />
                   ))}
                 </FormSelect>
               </div>
             </AccordionContent>
           </AccordionItem>

           <AccordionItem>
             <AccordionToggle
               onClick={() => onToggle('knowledge-sources')}
               id="knowledge-sources-toggle"
             >
               Knowledge Sources
             </AccordionToggle>
             <AccordionContent
               id="knowledge-sources-content"
               hidden={!expandedAccordions.includes('knowledge-sources')}
             >
               <div style={{ padding: '1rem 0' }}>
                 {availableKnowledgeSources.map(source => (
                   <div key={source.id} style={{ marginBottom: '0.5rem' }}>
                     <Checkbox
                       label={source.name}
                       description={source.description}
                       isChecked={selectedKnowledgeSources.includes(source.id)}
                       onChange={(_event, checked) => handleKnowledgeSourceChange(source.id, checked)}
                       id={`knowledge-source-${source.id}`}
                     />
                   </div>
                 ))}
               </div>
             </AccordionContent>
           </AccordionItem>
         </Accordion>
      </div>
    );
  };

    // Render chat interface for drawer
  const renderChatInterface = () => {
    // Generate initial welcome message if no chat history exists
    const showWelcomeMessage = chatHistory.length === 0;

    return (
      <div style={{ 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
                {/* Welcome Header */}
        <div style={{ 
          padding: '1.5rem 1.5rem 1rem', 
          borderBottom: showWelcomeMessage ? 'none' : '1px solid #f3f4f6',
          flexShrink: 0
        }}>
          <div style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#3b82f6', 
            marginBottom: '0.25rem' 
          }}>
            Hello {localStorage.getItem('userProfile') || 'AI Engineer'}
          </div>
          <div style={{ 
            fontSize: '1rem', 
            color: '#1f2937',
            fontWeight: '400'
          }}>
            Welcome to the chat playground
          </div>
        </div>

        {/* Chat Messages Area */}
        <div style={{ 
          flex: 1, 
          padding: showWelcomeMessage ? '0 1.5rem' : '1rem 1.5rem', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: 0,
          maxHeight: 'calc(100vh - 400px)' // Ensure input area is always visible
        }}>
          {showWelcomeMessage ? (
                         /* Initial AI Message */
             <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
               <div style={{ 
                 width: '2.5rem', 
                 height: '2.5rem', 
                 borderRadius: '50%', 
                 backgroundColor: '#8b5cf6',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 flexShrink: 0
               }}>
                 <RobotIcon style={{ color: 'white', fontSize: '1rem' }} />
               </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginBottom: '0.5rem' 
                }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#1f2937' 
                  }}>
                    AI
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280' 
                  }}>
                    1:30 PM
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#374151',
                  lineHeight: '1.5'
                }}>
                  Send a message to test your configuration
                </div>
              </div>
            </div>
          ) : (
            chatHistory.map((message) => (
              <div key={message.id} style={{ display: 'flex', gap: '0.75rem' }}>
                                 <div style={{ 
                   width: '2.5rem', 
                   height: '2.5rem', 
                   borderRadius: '50%', 
                   backgroundColor: message.role === 'user' ? '#3b82f6' : '#8b5cf6',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   flexShrink: 0
                 }}>
                   {message.role === 'user' ? (
                     <UserIcon style={{ color: 'white', fontSize: '1rem' }} />
                   ) : (
                     <RobotIcon style={{ color: 'white', fontSize: '1rem' }} />
                   )}
                 </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '0.5rem' 
                  }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1f2937' 
                    }}>
                      {message.role === 'user' ? 'You' : 'AI'}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#6b7280' 
                    }}>
                      {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Tool Responses Box (if present) */}
                  {message.toolResponses && message.toolResponses.length > 0 && (
                    <div style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold', 
                        color: '#6b7280', 
                        marginBottom: '0.5rem' 
                      }}>
                        Tool Responses:
                      </div>
                      {message.toolResponses.map((toolResponse, index) => (
                        <div key={index} style={{ 
                          fontSize: '0.875rem',
                          color: '#374151',
                          marginBottom: index < message.toolResponses!.length - 1 ? '0.5rem' : '0'
                        }}
                        dangerouslySetInnerHTML={{ __html: toolResponse }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Excluded Tools Info Box */}
                  {(() => {
                    if (message.role !== 'assistant' || !server || !flags.persistData) return null;
                    
                    const excludedToolsData = JSON.parse(localStorage.getItem('excludedToolsData') || '{}');
                    const serverExcludedTools = excludedToolsData[server.name] || [];
                    
                    return serverExcludedTools.length > 0 ? (
                      <div style={{ 
                        backgroundColor: '#fef3c7', 
                        padding: '0.75rem', 
                        borderRadius: '8px',
                        border: '1px solid #fbbf24',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold', 
                          color: '#d97706', 
                          marginBottom: '0.5rem' 
                        }}>
                          Excluded tools:
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem',
                          color: '#92400e'
                        }}>
                          {serverExcludedTools.join(', ')}
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Main Message Content */}
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: '#374151',
                    lineHeight: '1.5'
                  }}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
                         <div style={{ display: 'flex', gap: '0.75rem' }}>
               <div style={{ 
                 width: '2.5rem', 
                 height: '2.5rem', 
                 borderRadius: '50%', 
                 backgroundColor: '#8b5cf6',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 flexShrink: 0
               }}>
                 <RobotIcon style={{ color: 'white', fontSize: '1rem' }} />
               </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginBottom: '0.5rem' 
                }}>
                  <span style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '600', 
                    color: '#1f2937' 
                  }}>
                    AI
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div style={{ 
          padding: '1rem 1.5rem 1.5rem', 
          borderTop: '1px solid #f3f4f6',
          backgroundColor: 'white',
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            alignItems: 'flex-end',
            backgroundColor: '#f9fafb',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            padding: '0.75rem 1rem'
          }}>
            <TextArea
              id="drawer-chat-input"
              aria-label="Chat input field"
              value={inputText}
              onChange={(_event, value) => setInputText(value)}
              placeholder="Send a message..."
              rows={1}
              style={{ 
                flex: 1, 
                resize: 'none',
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '0.875rem'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              variant="primary" 
              isDisabled={!inputText.trim() || isTyping}
              onClick={handleSendMessage}
              icon={<PaperPlaneIcon />}
              style={{
                borderRadius: '50%',
                width: '2.5rem',
                height: '2.5rem',
                padding: 0,
                minWidth: 'auto',
                maxWidth: '2.5rem',
                maxHeight: '2.5rem',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1'
              }}
            />
          </div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            marginTop: '0.75rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem'
          }}>
            Bot uses AI. Check for mistakes.
            <InfoCircleIcon style={{ fontSize: '0.75rem' }} />
          </div>
        </div>
      </div>
    );
  };

  const ProjectEndpointPopover: React.FunctionComponent<{
    projectName: string;
    permission: string;
  }> = ({ projectName, permission }) => {
    const [isPopoverVisible, setIsPopoverVisible] = React.useState(false);
    const endpointUrl = generateEndpointUrl(projectName);
    const apiKey = generateApiKey(projectName);
    const endpointId = `endpoint-${projectName}`;
    const tokenId = `token-${projectName}`;

    const popoverContent = (
      <div style={{ padding: '1rem', width: '450px', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
            Connection URL
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <TextInput
                value={endpointUrl}
                readOnly
                aria-label="Connection URL"
                style={{ 
                  fontSize: '0.75rem', 
                  height: '28px', 
                  fontFamily: 'monospace',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <Tooltip content={copiedEndpointItems.has(endpointId) ? 'Copied' : 'Copy URL'}>
              <Button
                variant="plain"
                size="sm"
                aria-label="Copy URL"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyEndpointWithFeedback(endpointUrl, endpointId);
                }}
                style={{ padding: '4px', flexShrink: 0 }}
              >
                {copiedEndpointItems.has(endpointId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
              </Button>
            </Tooltip>
          </div>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
            API key
          </label>
          {permission === 'User token' ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
              User provided
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <TextInput
                  value={apiKey}
                  type="password"
                  readOnly
                  aria-label="API Key"
                  style={{ 
                    fontSize: '0.75rem', 
                    height: '28px', 
                    fontFamily: 'monospace',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <Tooltip content={copiedEndpointItems.has(tokenId) ? 'Copied' : 'Copy key'}>
                <Button
                  variant="plain"
                  size="sm"
                  aria-label="Copy key"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyEndpointWithFeedback(apiKey, tokenId);
                  }}
                  style={{ padding: '4px', flexShrink: 0 }}
                >
                  {copiedEndpointItems.has(tokenId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <Popover
        isVisible={isPopoverVisible}
        shouldClose={() => setIsPopoverVisible(false)}
        shouldOpen={() => setIsPopoverVisible(true)}
        bodyContent={popoverContent}
        position="right"
        maxWidth="450px"
        hideOnOutsideClick
        withFocusTrap={false}
        hasAutoWidth={false}
      >
        <Button variant="link">
          View
        </Button>
      </Popover>
    );
  };

  const renderPermissionsSection = () => {
    return (
      <Card id="mcp-details-permissions-card" style={{ border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        <CardBody>
        <Title headingLevel="h2" size="xl" style={{ marginBottom: '1rem' }}>
          Permissions
        </Title>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--pf-v5-global--Color--200)', 
          marginBottom: '1.5rem' 
        }}>
          Grant access to this server by adding it to a project.
        </p>

        {/* Projects Section */}
        <div>
          <Table aria-label="Projects permissions table">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Permission</Th>
                <Th>Endpoint</Th>
                <Th>Date added</Th>
                <Th screenReaderText="Actions"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {projectsList.map((project, index) => (
                editingProjectIndex === index ? (
                  // Editing mode
                  <Tr key={index}>
                    <Td dataLabel="Name">
                      <div style={{ position: 'relative' }}>
                        <TextInput
                          value={editProjectName}
                          onChange={(_event, value) => {
                            setEditProjectName(value);
                            setShowEditTypeahead(true);
                          }}
                          onFocus={() => setShowEditTypeahead(true)}
                          onBlur={() => {
                            setTimeout(() => setShowEditTypeahead(false), 200);
                          }}
                          placeholder="Enter project name"
                          aria-label="Edit project name"
                        />
                        {showEditTypeahead && filteredEditProjects.length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #d2d2d2',
                            borderTop: 'none',
                            borderRadius: '0 0 4px 4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: 10000,
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {filteredEditProjects.map((proj) => (
                              <div
                                key={proj}
                                onClick={() => {
                                  setEditProjectName(proj);
                                  setShowEditTypeahead(false);
                                }}
                                style={{
                                  padding: '0.5rem 1rem',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #f0f0f0',
                                  fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                {proj}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Td>
                    <Td dataLabel="Permission">
                      <FormSelect
                        value={editProjectPermission}
                        onChange={(_event, value) => setEditProjectPermission(value)}
                        aria-label="Permission select"
                      >
                        <FormSelectOption key="user-token" value="User token" label="User token" />
                        <FormSelectOption key="service-account" value="Service account" label="Service account" />
                      </FormSelect>
                    </Td>
                    <Td dataLabel="Endpoint">
                      <ProjectEndpointPopover projectName={editProjectName || project.name} permission={editProjectPermission} />
                    </Td>
                    <Td dataLabel="Date added">{project.dateAdded}</Td>
                    <Td isActionCell modifier="fitContent" style={{ alignContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => {
                            // Save the edited project
                            if (editProjectName.trim()) {
                              const updatedProjects = [...projectsList];
                              updatedProjects[index] = {
                                ...project,
                                name: editProjectName,
                                permission: editProjectPermission
                              };
                              setProjectsList(updatedProjects);
                            }
                            setEditingProjectIndex(null);
                            setEditProjectName('');
                            setEditProjectPermission('');
                            setShowEditTypeahead(false);
                          }}
                          isDisabled={!editProjectName.trim()}
                        >
                          Save
                        </Button>
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditingProjectIndex(null);
                            setEditProjectName('');
                            setEditProjectPermission('');
                            setShowEditTypeahead(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ) : (
                  // Normal view mode
                  <Tr key={index}>
                    <Td dataLabel="Name">{project.name}</Td>
                    <Td dataLabel="Permission">{project.permission}</Td>
                    <Td dataLabel="Endpoint">
                      <ProjectEndpointPopover projectName={project.name} permission={project.permission} />
                    </Td>
                    <Td dataLabel="Date added">{project.dateAdded}</Td>
                    <Td isActionCell>
                      <Dropdown
                        isOpen={openKebabIndex === index}
                        onSelect={() => setOpenKebabIndex(null)}
                        onOpenChange={(isOpen) => setOpenKebabIndex(isOpen ? index : null)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            variant="plain"
                            onClick={() => setOpenKebabIndex(openKebabIndex === index ? null : index)}
                            isExpanded={openKebabIndex === index}
                            aria-label="Actions"
                          >
                            <EllipsisVIcon />
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem
                            key="edit"
                            onClick={() => {
                              setEditingProjectIndex(index);
                              setEditProjectName(project.name);
                              setEditProjectPermission(project.permission);
                              setOpenKebabIndex(null);
                            }}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            onClick={() => {
                              setProjectsList(projectsList.filter((_, i) => i !== index));
                              setOpenKebabIndex(null);
                            }}
                          >
                            Remove
                          </DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </Td>
                  </Tr>
                )
              ))}
              {isAddingProject && (
                <Tr>
                  <Td dataLabel="Name">
                    <div style={{ position: 'relative' }}>
                      <TextInput
                        value={newProjectName}
                        onChange={(_event, value) => {
                          setNewProjectName(value);
                          setShowTypeahead(true);
                        }}
                        onFocus={() => setShowTypeahead(true)}
                        onBlur={() => {
                          // Delay hiding to allow click on suggestion
                          setTimeout(() => setShowTypeahead(false), 200);
                        }}
                        placeholder="Enter project name"
                        aria-label="New project name"
                      />
                      {showTypeahead && filteredProjects.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'white',
                          border: '1px solid #d2d2d2',
                          borderTop: 'none',
                          borderRadius: '0 0 4px 4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          zIndex: 10000,
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {filteredProjects.map((project) => (
                            <div
                              key={project}
                              onClick={() => {
                                setNewProjectName(project);
                                setShowTypeahead(false);
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f0f0f0',
                                fontSize: '0.875rem'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              {project}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td dataLabel="Permission">
                    <FormSelect
                      value={newProjectPermission}
                      onChange={(_event, value) => setNewProjectPermission(value)}
                      aria-label="Permission select"
                    >
                      <FormSelectOption key="user-token" value="User token" label="User token" />
                      <FormSelectOption key="service-account" value="Service account" label="Service account" />
                    </FormSelect>
                  </Td>
                  <Td dataLabel="Endpoint">
                    {newProjectName && <ProjectEndpointPopover projectName={newProjectName} permission={newProjectPermission} />}
                  </Td>
                  <Td dataLabel="Date added"></Td>
                  <Td isActionCell modifier="fitContent" style={{ alignContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Button 
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          // Add the new project to the list
                          if (newProjectName.trim()) {
                            setProjectsList([
                              ...projectsList,
                              {
                                name: newProjectName,
                                permission: newProjectPermission,
                                dateAdded: 'Just now'
                              }
                            ]);
                          }
                          // Reset the form
                          setIsAddingProject(false);
                          setNewProjectName('');
                          setNewProjectPermission('User token');
                          setShowTypeahead(false);
                        }}
                        isDisabled={!newProjectName.trim()}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsAddingProject(false);
                          setNewProjectName('');
                          setNewProjectPermission('User token');
                          setShowTypeahead(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          <Button 
            variant="primary" 
            icon={<PlusCircleIcon />}
            style={{ marginTop: '1rem' }}
            onClick={() => setIsAddingProject(true)}
            isDisabled={isAddingProject}
          >
            Add to project
          </Button>
        </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <Drawer isExpanded={isDrawerOpen}>
      <DrawerContent
        panelContent={
          <DrawerPanelContent 
            isResizable
            defaultSize="500px"
            minSize="400px"
            maxSize="800px"
          >
            <DrawerHead>
              <Title headingLevel="h3" size="lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {server?.logo ? (
                  <Logo 
                    svgContent={server.logo} 
                    alt={`${server.name} logo`}
                    style={{ 
                      width: '1.5rem', 
                      height: '1.5rem'
                    }} 
                  />
                ) : (
                  <RobotIcon />
                )}
                Test {server?.name}
              </Title>
              <DrawerActions>
                <DrawerCloseButton onClick={handleCloseDrawer} />
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody style={{ 
              padding: '1rem', 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              {renderConfigurationAccordions()}
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: 0 
              }}>
                {renderChatInterface()}
              </div>
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody>
          <PageSection>
      {/* Main content */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '1rem' }}>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to="/ai-hub/mcp/catalog">MCP catalog</Link>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{server.name}</BreadcrumbItem>
            </Breadcrumb>
          </div>

          {/* Server header - logo, title, and deploy/remote button */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', ...getAnimationStyle(animationState.header) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
              <Logo 
                svgContent={server.logo} 
                alt={server.name}
                style={{ 
                  width: '3.5rem', 
                  height: '3.5rem', 
                  flexShrink: 0, 
                  borderRadius: '0.375rem',
                  filter: 'contrast(1.1) brightness(1.1)'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                <Title headingLevel="h1" size="2xl" style={{ 
                  minWidth: 0, 
                  flex: '0 1 auto',
                  lineHeight: 1.2,
                  margin: 0
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {server.name}
                  </span>
                </Title>
                {getDeploymentMode() === 'Remote' && (
                  <Label color="grey" id="mcp-details-remote-badge" style={{ flexShrink: 0 }}>Remote</Label>
                )}
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              {getDeploymentMode() !== 'Remote' && (
                <Popover
                  isVisible={deployButtonPopoverVisible && flags.mcpLifecycleOperatorNotInstalled}
                  shouldClose={() => setDeployButtonPopoverVisible(false)}
                  bodyContent={
                    <>
                      Install the MCP Lifecycle operator
                      <br />
                      to enable deployments.
                    </>
                  }
                  position="top"
                  aria-label="Deploy button disabled message"
                  id="mcp-deploy-button-disabled-popover"
                  showClose={false}
                  hasAutoWidth
                >
                  <span
                    style={{ display: 'inline-block' }}
                    onMouseEnter={() => flags.mcpLifecycleOperatorNotInstalled && setDeployButtonPopoverVisible(true)}
                    onMouseLeave={() => setDeployButtonPopoverVisible(false)}
                  >
                    <Button
                      id="mcp-details-deploy-server-button"
                      variant="primary"
                      type="button"
                      isDisabled={flags.mcpLifecycleOperatorNotInstalled}
                      onClick={() => {
                        if (mcpDeploymentFlow === 'modal') {
                          setIsDeployModalOpen(true);
                        } else {
                          navigate('/ai-hub/mcp/deploy', {
                            state: {
                              containerImage: server?.location,
                              mcpServerName: server?.name,
                              version: server?.version,
                              serverSlug: serverSlug,
                            },
                          });
                        }
                      }}
                    >
                      Deploy MCP Server
                    </Button>
                  </span>
                </Popover>
              )}
            </div>
          </div>

          {/* Content - Single Column Layout */}
          <div>
            {/* Permissions section - Only visible for AI Admin */}
            {userProfile === 'AI Admin' && (
              <div style={{ position: 'relative', zIndex: 100, ...getAnimationStyle(animationState.about) }}>
                {renderPermissionsSection()}
              </div>
            )}

            {/* Two-column layout: Description, Tools and README on left, Details on right */}
            <Grid hasGutter style={{ gap: '1rem' }}>
              {/* Left column - Description, Tools and README */}
              <GridItem span={8}>
                {/* Description card */}
                <Card id="mcp-details-description-card" style={{ border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                  <CardBody>
                    <Title headingLevel="h2" size="xl" style={{ marginBottom: '1rem' }}>
                      Description
                    </Title>
                    <div style={{ color: '#6b7280', ...getAnimationStyle(animationState.about) }}>
                      <p style={{ lineHeight: 1.6, margin: 0 }}>{server.description}</p>
                    </div>
                  </CardBody>
                </Card>

                {/* Tools section */}
                <Card id="mcp-details-tools-card" style={{ border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                  <CardBody>
                    <div style={getAnimationStyle(animationState.tools)}>
                      {renderToolsSection()}
                    </div>
                  </CardBody>
                </Card>

                {/* README section */}
                {server.readme && (
                  <Card id="mcp-details-readme-card" style={{ border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                    <CardBody>
                      <div style={getAnimationStyle(animationState.details)}>
                        {renderReadmeSection()}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </GridItem>

              {/* Right column - Details */}
              <GridItem span={4}>
                <Card id="mcp-details-server-details-card" style={{ border: '1px solid #e5e7eb' }}>
                  <CardBody>
                    <div style={getAnimationStyle(animationState.details)}>
                      {renderDetailsSection()}
                    </div>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </div>
        </div>
      </div>
    </PageSection>
        </DrawerContentBody>
      </DrawerContent>
      </Drawer>

      {/* OAuth Modal */}
      <Modal
      variant={ModalVariant.medium}
      isOpen={isOAuthModalOpen}
      onClose={handleOAuthCancel}
    >
      <ModalHeader 
        title={`Configure ${server?.name}`}
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
                value={oauthForm.clientSecret}
                onChange={(_event, value) => handleOAuthFormChange('clientSecret', value)}
                placeholder="Enter your access token"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && oauthForm.clientSecret) {
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
                isDisabled={!oauthForm.clientSecret}
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
                  isDisabled={!oauthForm.clientSecret}
                >
                  Configure
                </Button>
              </FlexItem>
            </Flex>
          </Flex>
        </Form>
      </ModalBody>
    </Modal>

    {isDeployModalOpen && server && (
      <DeployMCPServerModal
        embedInModal
        initialLocationState={{
          containerImage: server?.location,
          mcpServerName: server?.name,
          version: server?.version,
          serverSlug: serverSlug ?? undefined,
        }}
        savedFormState={savedDeployFormByServer[serverSlug ?? server?.location ?? ''] ?? null}
        onClose={(formState) => {
          if (formState) {
            const key = serverSlug ?? server?.location ?? '';
            if (key) {
              setSavedDeployFormByServer((prev) => ({ ...prev, [key]: formState }));
            }
          }
          setIsDeployModalOpen(false);
        }}
        onDeploySuccess={(state) => {
          navigate('/ai-hub/mcp/deployments', { state });
          setIsDeployModalOpen(false);
          const key = serverSlug ?? server?.location ?? '';
          if (key) {
            setSavedDeployFormByServer((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
          }
        }}
      />
    )}

    </>
  );
};

export { MCPCatalogDetails }; 