import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Checkbox,

  Divider,
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
  FormHelperText,
  FormSection,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  TextArea,
  TextInput,
  Title
} from '@patternfly/react-core';
import { 
  CommentIcon,
  CubeIcon,
  DatabaseIcon,
  GithubIcon,
  GlobeIcon,
  InfoCircleIcon,
  LinkIcon,
  LockIcon,
  LockOpenIcon,
  PaperPlaneIcon,
  RobotIcon,
  ToolsIcon,
  UserIcon
} from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { mcpServerLogos } from './mcpServerLogos';

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
  
  // Convert SVG content to data URI for regular SVG content
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  
  return (
    <img 
      src={dataUri} 
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

interface JsonSchemaProperty {
  type: 'string' | 'integer' | 'boolean' | 'array';
  description: string;
  items?: { type: string };
}

type MCPServerDetailsProps = Record<string, never>;

const MCPServerDetails: React.FunctionComponent<MCPServerDetailsProps> = () => {
  const { serverSlug } = useParams<{ serverSlug: string }>();
  const navigate = useNavigate();
  const [toolPageIndex, setToolPageIndex] = React.useState(0);
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  const [expandedTools, setExpandedTools] = React.useState<Set<string>>(new Set());
  const [excludedTools, setExcludedTools] = React.useState<Set<string>>(new Set());
  
  // OAuth state
  const [isOAuthModalOpen, setIsOAuthModalOpen] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [oauthForm, setOAuthForm] = React.useState({
    clientId: '',
    clientSecret: '',
    redirectUri: 'https://your-app.com/oauth/callback'
  });
  const [animationState, setAnimationState] = React.useState({
    breadcrumbs: false,
    header: false,
    playground: false,
    divider: false,
    about: false,
    tools: false,
    resources: false,
    connect: false,
    details: false
  });
  
  // Drawer and chat state
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  
  // Model and knowledge source selection state
  const [selectedModel, setSelectedModel] = React.useState('gpt-4o');
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = React.useState<string[]>([]);
  const [expandedAccordions, setExpandedAccordions] = React.useState<string[]>([]);
  
  const { flags } = useFeatureFlags();

  // Animation effect on component mount
  React.useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, breadcrumbs: true })), 100));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, header: true })), 200));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, playground: true })), 400));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, divider: true })), 600));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, about: true })), 800));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, tools: true })), 1000));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, resources: true })), 1200));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, connect: true })), 900));
    timeouts.push(setTimeout(() => setAnimationState(prev => ({ ...prev, details: true })), 1100));

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const getAnimationStyle = (isVisible: boolean) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
  });

  const handlePlaygroundAction = () => {
    if (server) {
      const playgroundServers = JSON.parse(localStorage.getItem('playgroundMcpServers') || '[]');
      
      if (isDrawerOpen) {
        // Close drawer
        setIsDrawerOpen(false);
      } else {
        // Add to playground and open drawer
        if (!playgroundServers.includes(server.name)) {
          playgroundServers.push(server.name);
          localStorage.setItem('playgroundMcpServers', JSON.stringify(playgroundServers));
        }
        setIsDrawerOpen(true);
      }
    }
  };

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

  const toggleToolExcluded = (toolName: string) => {
    setExcludedTools(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolName)) {
        newSet.delete(toolName);
      } else {
        newSet.add(toolName);
      }
      // Manually save to localStorage
      saveExcludedToolsToStorage(newSet);
      return newSet;
    });
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
Click the "Configure" button at the top of this page to get started.
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

  // OAuth handlers
  const handleOAuthClick = () => {
    // Load any existing token for this server from sessionStorage
    if (server?.name) {
      const existingToken = sessionStorage.getItem(`mcp-token-${server.name}`);
      if (existingToken) {
        setOAuthForm(prev => ({
          ...prev,
          clientSecret: existingToken
        }));
        // Mark as authenticated if token exists
        setIsAuthenticated(true);
      }
    }
    
    setIsOAuthModalOpen(true);
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

  useDocumentTitle('MCP Server Details');

  // Mock data for the selected server (in a real app, this would come from an API)
  const servers = [
    {
      id: 1,
      slug: 'mcp-kubernetes-server',
      name: 'Kubernetes MCP Server',
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
      homepage: 'https://pypi.org/project/mcp-kubernetes-server/',
      sourceUrl: 'https://github.com/feiskyer/mcp-kubernetes-server',
      deployedFrom: {
        branch: 'main',
        commit: 'a7b9c15'
      },
      isLocal: false,
      connectionUrl: 'k8s-mcp-server.demo-namespace.svc.cluster.local:8080',
      transport: 'SSE',
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
      ]
    },
    {
      id: 2,
      slug: 'slack-mcp-server',
      name: 'Slack MCP Server',
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
      homepage: 'https://github.com/korotovsky/slack-mcp-server',
      sourceUrl: 'https://github.com/korotovsky/slack-mcp-server',
      deployedFrom: {
        branch: 'main',
        commit: 'f8e2d41'
      },
      isLocal: false,
      connectionUrl: 'slack-mcp-server.demo-namespace.svc.cluster.local:8080',
      transport: 'SSE',
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
      ]
    },
    {
      id: 3,
      slug: 'servicenow-mcp-server',
      name: 'ServiceNow MCP Server',
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
      homepage: 'https://store.servicenow.com/store/app/5eeda18f1b996a10229141d1b24bcbfc',
      sourceUrl: 'https://github.com/echelon-ai-labs/servicenow-mcp',
      deployedFrom: {
        branch: 'main',
        commit: '3c8d5e7'
      },
      isLocal: false,
      connectionUrl: 'servicenow-mcp-server.demo-namespace.svc.cluster.local:8080',
      transport: 'SSE',
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
      ]
    },
    {
      id: 4,
      slug: 'salesforce-mcp-server',
      name: 'Salesforce MCP Server',
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
      homepage: 'https://github.com/tsmztech/mcp-server-salesforce',
      sourceUrl: 'https://github.com/tsmztech/mcp-server-salesforce',
      deployedFrom: {
        branch: 'main',
        commit: '8e5f1a9'
      },
      isLocal: false,
      connectionUrl: 'salesforce-mcp-server.demo-namespace.svc.cluster.local:8080',
      transport: 'SSE',
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
      ]
    },
    {
      id: 5,
      slug: 'splunk-mcp-server',
      name: 'Splunk MCP Server',
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
      homepage: 'https://github.com/livehybrid/splunk-mcp',
      sourceUrl: 'https://github.com/livehybrid/splunk-mcp',
      deployedFrom: {
        branch: 'main',
        commit: 'b2d8f93'
      },
      isLocal: false,
      connectionUrl: 'splunk-mcp-server.demo-namespace.svc.cluster.local:8080',
      transport: 'SSE',
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
      ]
    },
    {
      id: 6,
      slug: 'dynatrace-mcp-server',
      name: 'Dynatrace MCP Server',
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
      homepage: 'https://github.com/dynatrace-oss/dynatrace-mcp',
      sourceUrl: 'https://github.com/dynatrace-oss/dynatrace-mcp',
      deployedFrom: {
        branch: 'main',
        commit: 'e7f4b12'
      },
      isLocal: false,
      connectionUrl: 'dynatrace-mcp-server.demo-namespace.svc.cluster.local:8080',
      transport: 'SSE',
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
      ]
    },
    {
      id: 7,
      slug: 'github-mcp-server',
      name: 'GitHub MCP Server',
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
      homepage: 'https://github.com/github/github-mcp-server',
      sourceUrl: 'https://github.com/github/github-mcp-server',
      deployedFrom: {
        branch: 'main',
        commit: 'c4e7f89'
      },
      isLocal: false,
      connectionUrl: 'github-mcp-server.demo-namespace.svc.cluster.local:8080',
      transport: 'SSE',
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
      ]
    },
    {
      id: 8,
      slug: 'postgres-mcp-server',
      name: 'PostgreSQL MCP Server',
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
      homepage: 'https://www.npmjs.com/package/@modelcontextprotocol/server-postgres',
      sourceUrl: 'https://github.com/modelcontextprotocol/servers',
      deployedFrom: {
        branch: 'main',
        commit: 'a9b5c73'
      },
      isLocal: false,
      connectionUrl: 'postgres-mcp-server.demo-namespace.svc.cluster.local:8080',
      transport: 'SSE',
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
      ]
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
      homepage: 'https://zapier.com/mcp/github',
      sourceUrl: 'https://zapier.com/mcp/github',
      deployedFrom: {
        branch: 'production',
        commit: 'd8c3f92'
      },
      isLocal: false,
      connectionUrl: 'zapier-mcp-server.zapier.com:443',
      transport: 'SSE',
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
      ]
    }
  ];

  const server = servers.find(s => s.slug === serverSlug);

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

  // Manual save function (called only when user explicitly excludes/includes tools and persist flag is enabled)
  const saveExcludedToolsToStorage = React.useCallback((tools: Set<string>) => {
    if (server && flags.persistData) {
      try {
        const excludedToolsData = JSON.parse(localStorage.getItem('excludedToolsData') || '{}');
        excludedToolsData[server.name] = Array.from(tools);
        localStorage.setItem('excludedToolsData', JSON.stringify(excludedToolsData));
      } catch (error) {
        console.warn('Failed to save excluded tools to localStorage:', error);
      }
    }
  }, [server, flags.persistData]);

  if (!server) {
    return (
      <PageSection>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Title headingLevel="h2" size="lg">Server Not Found</Title>
          <p style={{ marginTop: '1rem' }}>The requested MCP server could not be found.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/ai-assets/mvp-servers')}
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
    
    // Sort tools by access level: destructive first, then read/write, then read-only
    const sortedTools = [...server.tools].sort((a, b) => {
      const aIsDestructive = a.name === 'k8s_delete';
      const bIsDestructive = b.name === 'k8s_delete';
      const aIsWriteAccess = writeTools.has(a.name);
      const bIsWriteAccess = writeTools.has(b.name);
      
      // Destructive tools first
      if (aIsDestructive && !bIsDestructive) return -1;
      if (!aIsDestructive && bIsDestructive) return 1;
      
      // If both or neither are destructive, check read/write access
      if (aIsWriteAccess && !bIsWriteAccess && !bIsDestructive) return -1;
      if (!aIsWriteAccess && bIsWriteAccess && !aIsDestructive) return 1;
      
      // If same access level, maintain original order
      return 0;
    });
    
    const startIndex = toolPageIndex * toolsPerPage;
    const endIndex = Math.min(startIndex + toolsPerPage, sortedTools.length);
    const currentTools = sortedTools.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedTools.length / toolsPerPage);

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

        <div style={{ marginBottom: '1.5rem' }}>
          {currentTools.map((tool, index) => (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                        {writeTools.has(tool.name) && (
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
                            Config update: excluded
                          </span>
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
                          <div style={{ marginBottom: '1rem' }}>
                            <Checkbox
                              id={`block-${tool.name}`}
                              label="Exclude this tool"
                              isChecked={excludedTools.has(tool.name)}
                              onChange={() => toggleToolExcluded(tool.name)}
                              style={{ marginBottom: '0.75rem' }}
                            />
                          </div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                            No input parameters required
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ marginBottom: '1rem' }}>
                            <Checkbox
                              id={`block-${tool.name}`}
                              label="Exclude this tool"
                              isChecked={excludedTools.has(tool.name)}
                              onChange={() => toggleToolExcluded(tool.name)}
                              style={{ marginBottom: '0.75rem' }}
                            />
                          </div>
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

  const renderResourcesSection = () => (
    <div>
      <Title headingLevel="h2" size="xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <DatabaseIcon />
        Resources
      </Title>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Universal Resource Access: Works with any Kubernetes or OpenShift resource
        </p>
        
        <Card style={{ marginBottom: '1rem' }}>
          <CardBody>
            <div style={{ marginBottom: '0.75rem' }}>
              <Title headingLevel="h3" size="md" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Supported Resources
              </Title>
            </div>
            
            <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
              <p style={{ marginBottom: '0.75rem', color: '#374151' }}>
                Access any Kubernetes or OpenShift resource type through the MCP interface
              </p>
              
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>Includes:</span>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem', color: '#374151' }}>
                  <li style={{ marginBottom: '0.25rem' }}>Pods, Services, Deployments, ConfigMaps</li>
                  <li style={{ marginBottom: '0.25rem' }}>Namespaces, Nodes, Events, Logs</li>
                  <li style={{ marginBottom: '0.25rem' }}>Custom Resource Definitions (CRDs)</li>
                  <li style={{ marginBottom: '0.25rem' }}>OpenShift-specific resources (Projects, Routes, etc.)</li>
                  <li style={{ marginBottom: '0.25rem' }}>Resource metrics and status information</li>
                </ul>
              </div>
              
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', fontStyle: 'italic' }}>
                Dynamically discovers available API resources from cluster
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTabKey) {
      case 0: // Jupyter
        return (
          <div>
            
            <div style={{ marginBottom: '1rem' }}>

              <CodeEditor
                code={`import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class KubernetesToolFilter:
    def __init__(self):
        self.excluded_tools = {${Array.from(excludedTools).map(tool => `"${tool}"`).join(', ')}}
        self.read_only_tools = {
            "k8s_get", "k8s_describe", "k8s_logs", "k8s_events",
            "k8s_apis", "k8s_crds", "k8s_top_nodes", "k8s_top_pods",
            "k8s_rollout_status", "k8s_rollout_history", 
            "k8s_auth_can_i", "k8s_auth_whoami"
        }
    
    def is_tool_allowed(self, tool_name):
        return tool_name not in self.excluded_tools

async def use_kubernetes_mcp():
    tool_filter = KubernetesToolFilter()
    
    server_params = StdioServerParameters(
        command="uvx",
        args=["mcp-kubernetes-server"],
        env={"KUBECONFIG": "/path/to/your/kubeconfig"}
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # List available tools and filter excluded ones
            all_tools = await session.list_tools()
            filtered_tools = [tool for tool in all_tools.tools 
                            if tool_filter.is_tool_allowed(tool.name)]
            
            print("Available tools:")
            for tool in filtered_tools:
                print(f"- {tool.name}: {tool.description}")
            ${excludedTools.size > 0 ? `
            print(f"\\nExcluded tools: ${Array.from(excludedTools).join(', ')}")` : ''}
            
            # Example: List pods in a namespace (if not excluded)
            if tool_filter.is_tool_allowed("k8s_get"):
                result = await session.call_tool("k8s_get", {
                    "resource": "pods",
                    "namespace": "default"
                })
                print("Pods:", result.content)

# Run the async function
await use_kubernetes_mcp()`}
                language={Language.python}
                height="600px"
                isReadOnly
                isLanguageLabelVisible
              />
            </div>
            <p style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
              Replace <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.125rem' }}>/path/to/your/kubeconfig</code> with the path to your Kubernetes configuration file (usually <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.125rem' }}>~/.kube/config</code>).
              ${excludedTools.size > 0 ? `The Python example above includes client-side filtering to exclude ${excludedTools.size} selected tool${excludedTools.size > 1 ? 's' : ''}.` : ''}
            </p>
          </div>
        );
      case 1: // Claude Desktop
        return (
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Claude Desktop</span>
            </div>
            
            {/* Method 1: Manual Configuration */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>(Recommended) Via JSON configuration</span>
              </div>
              <ol style={{ fontSize: '0.6875rem', color: '#374151', marginLeft: '1rem', lineHeight: 1.5 }}>
                <li style={{ marginBottom: '0.25rem' }}>Open Claude Desktop and go to Settings → Developer</li>
                <li style={{ marginBottom: '0.25rem' }}>Edit your claude_desktop_config.json file</li>
                <li style={{ marginBottom: '0.25rem' }}>Add the Kubernetes MCP server configuration (see JSON example below)</li>
                <li style={{ marginBottom: '0.25rem' }}>Save the file and restart Claude Desktop</li>
              </ol>
            </div>
            
            {/* Method 2: Prerequisites */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>Prerequisites</span>
              </div>
              <ul style={{ fontSize: '0.6875rem', color: '#374151', marginLeft: '1rem', lineHeight: 1.5 }}>
                <li style={{ marginBottom: '0.25rem' }}>Install uv: <code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.125rem' }}>curl -LsSf https://astral.sh/uv/install.sh | sh</code></li>
                <li style={{ marginBottom: '0.25rem' }}>Install kubectl and configure access to your Kubernetes cluster</li>
                <li style={{ marginBottom: '0.25rem' }}>Ensure your kubeconfig file is properly configured</li>
              </ul>
            </div>
            
            {/* Method 3: JSON Configuration */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>(Advanced) Alternative: Via JSON configuration</span>
              </div>
              <ol style={{ fontSize: '0.6875rem', color: '#374151', marginLeft: '1rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                <li style={{ marginBottom: '0.25rem' }}>Install Node.js</li>
                <li style={{ marginBottom: '0.25rem' }}>Open Claude Desktop and go to Settings → Developer</li>
                <li style={{ marginBottom: '0.25rem' }}>Click &quot;Edit Config&quot; to open your claude_desktop_config.json file</li>
                <li style={{ marginBottom: '0.25rem' }}>Add the following configuration to the &quot;mcpServers&quot; section, replacing pat123.abc123 with your API key:</li>
              </ol>
              <CodeEditor
                code={`{
  "mcpServers": {
    "kubernetes": {
      "command": "uvx",
      "args": [
        "mcp-kubernetes-server"
      ],
      "env": {
        "KUBECONFIG": "/home/username/.kube/config"
      }${excludedTools.size > 0 ? `,
      // Note: Client-side filtering would exclude these tools:
      // ${Array.from(excludedTools).join(', ')}` : ''}
    }
  }
}`}
                language={Language.json}
                height="300px"
                isReadOnly
                isLanguageLabelVisible
              />
              <ol start={5} style={{ fontSize: '0.6875rem', color: '#374151', marginLeft: '1rem', lineHeight: 1.5 }}>
                <li>Save the file and restart Claude Desktop</li>
              </ol>
            </div>
          </div>
        );
      case 2: // Cursor
        return (
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Cursor</span>
            </div>
            
            {/* Method 1: JSON Configuration */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>(Recommended) Via JSON configuration</span>
              </div>
              <ol style={{ fontSize: '0.6875rem', color: '#374151', marginLeft: '1rem', lineHeight: 1.5 }}>
                <li style={{ marginBottom: '0.25rem' }}>Install prerequisites (uv, kubectl)</li>
                <li style={{ marginBottom: '0.25rem' }}>Configure your kubeconfig file</li>
                <li style={{ marginBottom: '0.25rem' }}>Create or edit your mcp.json configuration file</li>
                <li style={{ marginBottom: '0.25rem' }}>Restart Cursor to load the new configuration</li>
              </ol>
            </div>
            
            {/* Method 2: Configuration Details */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>Configuration file location</span>
              </div>
              <p style={{ fontSize: '0.6875rem', color: '#374151', marginLeft: '1rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                Create either a global (<code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.125rem' }}>~/.cursor/mcp.json</code>) or project-specific (<code style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.25rem', borderRadius: '0.125rem' }}>.cursor/mcp.json</code>) configuration file, replacing the KUBECONFIG path with your actual kubeconfig location:
              </p>
              <CodeEditor
                code={`{
  "mcpServers": {
    "kubernetes": {
      "command": "uvx",
      "args": ["mcp-kubernetes-server"],
      "env": {
        "KUBECONFIG": "/home/username/.kube/config"
      }${excludedTools.size > 0 ? `,
      // Note: Client-side filtering would exclude these tools:
      // ${Array.from(excludedTools).join(', ')}` : ''}
    }
  }
}`}
                language={Language.json}
                height="250px"
                isReadOnly
                isLanguageLabelVisible
              />
            </div>
          </div>
        );
      case 3: // JSON
        return (
          <div>
            
            <div style={{ marginBottom: '1rem' }}>
            
              <CodeEditor
                code={JSON.stringify({
                  "jsonrpc": "2.0",
                  "id": 1,
                  "result": {
                    "tools": server?.tools?.filter(tool => !excludedTools.has(tool.name)).map(tool => ({
                      "name": tool.name,
                      "description": tool.description,
                      "inputSchema": {
                        "type": "object",
                        "properties": tool.parameters.reduce((acc, param) => {
                          acc[param.name] = {
                            "type": param.type === 'integer' ? 'integer' : param.type === 'boolean' ? 'boolean' : param.type === 'array' ? 'array' : 'string',
                            "description": param.description,
                            ...(param.type === 'array' && { "items": { "type": "string" } })
                          };
                          return acc;
                        }, {} as Record<string, JsonSchemaProperty>),
                        "required": tool.parameters.filter(p => p.required).map(p => p.name)
                      }
                    })) || []
                  }
                }, null, 2)}
                language={Language.json}
                height="500px"
                isReadOnly
                isLanguageLabelVisible
              />
            </div>
            
            {excludedTools.size > 0 && (
              <div style={{ 
                backgroundColor: '#fef3c7', 
                padding: '0.75rem', 
                borderRadius: '0.375rem',
                border: '1px solid #fbbf24',
                marginTop: '1rem'
              }}>
                <p style={{ fontSize: '0.6875rem', color: '#92400e', margin: 0 }}>
                  <strong>Note:</strong> {excludedTools.size} tool{excludedTools.size > 1 ? 's are' : ' is'} currently excluded ({Array.from(excludedTools).join(', ')}) and not included in this response.
                </p>
              </div>
            )}
          </div>
        );
      case 4: // TypeScript
        return (
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>TypeScript/JavaScript</span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151' }}>Tool Filtering Implementation</span>
              </div>
              <CodeEditor
                code={`class KubernetesToolFilter {
  private readonly excludedTools = new Set([${Array.from(excludedTools).map(tool => `\n    '${tool}'`).join(',')}${excludedTools.size > 0 ? '\n  ' : ''}]);
  
  private readonly readOnlyTools = new Set([
    'k8s_get', 'k8s_describe', 'k8s_logs', 'k8s_events',
    'k8s_apis', 'k8s_crds', 'k8s_top_nodes', 'k8s_top_pods',
    'k8s_rollout_status', 'k8s_rollout_history', 
    'k8s_auth_can_i', 'k8s_auth_whoami'
  ]);

  async getFilteredTools(): Promise<Tool[]> {
    // Get all tools from the Kubernetes server
    const allTools = await this.client.request(
      { method: "tools/list" },
      ListToolsResultSchema
    );

    // Filter out excluded tools
    const allowedTools = allTools.tools.filter(tool => {
      return !this.excludedTools.has(tool.name);
    });

    return allowedTools;
  }

  isToolAllowed(toolName: string): boolean {
    return !this.excludedTools.has(toolName);
  }
}${excludedTools.size > 0 ? `

// Currently excluded tools: ${Array.from(excludedTools).join(', ')}` : ''}
`}
                language={Language.typescript}
                height="450px"
                isReadOnly
                isLanguageLabelVisible
              />
            </div>
          </div>
        );
      default:
        return (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <p>Configuration for this client type coming soon...</p>
          </div>
        );
    }
  };

  const renderConnectSection = () => (
    <div>
      <Title headingLevel="h2" size="xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <LinkIcon />
        Connect
      </Title>
      
      {flags.showMcpConnectionUrl && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>Cluster endpoint</span>
          </div>
          
          <Card style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <CardBody style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  backgroundColor: '#ffffff', 
                  borderRadius: '0.375rem', 
                  padding: '0.5rem 0.75rem', 
                  flex: 1,
                  minWidth: 0
                }}>
                  <GlobeIcon style={{ width: '0.875rem', height: '0.875rem', color: '#6b7280' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b7280' }}>HTTP</span>
                  <code style={{ 
                    fontSize: '0.75rem', 
                    fontFamily: 'monospace', 
                    color: '#1f2937',
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {server.connectionUrl}
                  </code>
                </div>
                <Button variant="primary" size="sm">
                  Copy
                </Button>
              </div>
              <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: '0.75rem' }}>
                Streamable HTTP endpoint
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {flags.showMcpConnectionUrl && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>Or add to your client</span>
        </div>
      )}
      
      <Card style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <CardBody style={{ padding: '0.75rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <Tabs activeKey={activeTabKey} onSelect={(_, eventKey) => setActiveTabKey(eventKey as number)}>
              <Tab eventKey={0} title={<TabTitleText>Jupyter</TabTitleText>} />
              <Tab eventKey={1} title={<TabTitleText>Claude Desktop</TabTitleText>} />
              <Tab eventKey={2} title={<TabTitleText>Cursor</TabTitleText>} />
              <Tab eventKey={3} title={<TabTitleText>JSON</TabTitleText>} />
              <Tab eventKey={4} title={<TabTitleText>TypeScript</TabTitleText>} />
            </Tabs>
          </div>
          
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '0.375rem',
            padding: '1rem'
          }}>
            {renderTabContent()}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderDetailsSection = () => (
    <div>
      <Title headingLevel="h2" size="xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <InfoCircleIcon />
        Details
      </Title>
      
      <Card style={{ border: '1px solid #e5e7eb', paddingTop: 0, paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <CardBody style={{ padding: '1rem 0' }}>
          <Grid hasGutter>
            <GridItem span={6}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                  Status
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                  <div style={{ 
                    width: '0.5rem', 
                    height: '0.5rem', 
                    borderRadius: '50%', 
                    backgroundColor: '#10b981', 
                    marginRight: '0.5rem' 
                  }} />
                  <span>Available</span>
                </div>
              </div>
            </GridItem>

            <GridItem span={6}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                  Published
                </Title>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{server.publishedDate}</span>
              </div>
            </GridItem>

            <GridItem span={6}>
              <div style={{ marginBottom: '1.5rem' }}>
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
                    feiskyer/mcp-kubernetes-server
                  </span>
                </a>
              </div>
            </GridItem>

            <GridItem span={6}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                  Transport
                </Title>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{server.transport}</span>
              </div>
            </GridItem>



            <GridItem span={6}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                  Role
                </Title>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{server.role}</span>
              </div>
            </GridItem>

            <GridItem span={6}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Title headingLevel="h3" size="md" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                  Pod ID
                </Title>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, fontFamily: 'monospace' }}>{server.podId}</span>
              </div>
            </GridItem>


          </Grid>
        </CardBody>
      </Card>
    </div>
  );

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
            {/* Header with breadcrumbs and back button */}
            <div style={{ marginBottom: '1rem', ...getAnimationStyle(animationState.breadcrumbs) }}>
              <Breadcrumb>
                <BreadcrumbItem>
                  <Link to="/ai-assets/mvp-servers">MCP Servers</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isActive>{server.name}</BreadcrumbItem>
              </Breadcrumb>
            </div>



      {/* Main content */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '1.5rem' }}>
          {/* Server header */}
          <div style={{ marginBottom: '1.5rem', ...getAnimationStyle(animationState.header) }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <Title headingLevel="h1" size="2xl" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      minWidth: 0, 
                      flex: 1, 
                      lineHeight: 1.2,
                      marginBottom: '0.25rem'
                    }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {server.name}
                      </span>
                    </Title>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.25rem', 
                      fontSize: '0.875rem', 
                      color: '#6b7280', 
                      lineHeight: 1.2,
                      marginTop: '0.25rem'
                    }}>
                      <a 
                        href={server.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          cursor: 'pointer', 
                          transition: 'opacity 0.2s',
                          color: '#0066cc',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'}
                        onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}
                      >
                        {server.displayName}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <Badge style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px', 
                backgroundColor: '#f3f4f6', 
                fontSize: '0.75rem', 
                fontWeight: 500, 
                color: '#6b7280'
              }}>
                <GlobeIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                demo-namespace
              </Badge>
              <Badge style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                padding: '0.125rem 0.5rem', 
                borderRadius: '9999px', 
                backgroundColor: '#f3f4f6', 
                fontSize: '0.75rem', 
                fontWeight: 500, 
                color: '#6b7280'
              }}>
                <ToolsIcon style={{ width: '0.75rem', height: '0.75rem' }} />
                {server.toolCount} tools
              </Badge>


            </div>

            {/* Warning line for Kubernetes */}
            {server.slug === 'mcp-kubernetes-server' && (() => {
              // Calculate tool counts by access level
              const readWriteCount = server.tools.filter(tool => writeTools.has(tool.name)).length;
              const destructiveCount = server.tools.filter(tool => tool.name === 'k8s_delete').length;
              
              return (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginTop: '0.75rem',
                  fontSize: '0.875rem'
                }}>
                  <span>Provides access to</span>
                  <Badge style={{ 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem', 
                    backgroundColor: '#fef3c7', 
                    color: '#d97706', 
                    fontSize: '0.75rem', 
                    fontWeight: 500
                  }}>
                    {readWriteCount} read/write
                  </Badge>
                  <span>and</span>
                  <Badge style={{ 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '0.25rem', 
                    backgroundColor: '#fef2f2', 
                    color: '#dc2626', 
                    fontSize: '0.75rem', 
                    fontWeight: 500
                  }}>
                    {destructiveCount} destructive
                  </Badge>
                  <span>tools</span>
                </div>
              );
            })()}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginBottom: '1rem', ...getAnimationStyle(animationState.playground) }}>
            {/* Authentication button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button variant="secondary" size="lg" onClick={handleOAuthClick}>
                {(() => {
                  const isServerAuthenticated = isAuthenticated && server?.name && sessionStorage.getItem(`mcp-token-${server.name}`) === 'mytoken';
                  return isServerAuthenticated ? 
                    <LockOpenIcon style={{ marginRight: '0.5rem', color: '#28a745' }} /> : 
                    <LockIcon style={{ marginRight: '0.5rem' }} />;
                })()}
                Configure
              </Button>
            </div>
            
            {/* Try this server button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button 
                variant="primary"
                size="lg"
                isDisabled={isDrawerOpen}
                onClick={handlePlaygroundAction}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  fontWeight: 500,
                  fontSize: '1rem',
                  padding: '0.75rem 1.5rem'
                }}
              >
                <CommentIcon style={{ marginRight: '0.5rem' }} />
                Try this server
              </Button>
            </div>
          </div>

          <Divider style={{ margin: '1rem 0', background: 'linear-gradient(to right, transparent, #d1d5db, transparent)', ...getAnimationStyle(animationState.divider) }} />

          {/* Content - Single Column Layout */}
          <div>
            {/* About section */}
            <div style={{ marginBottom: '1rem', ...getAnimationStyle(animationState.about) }}>
              <Title headingLevel="h2" size="xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <InfoCircleIcon />
                About
              </Title>
              <div style={{ color: '#6b7280' }}>
                <p style={{ lineHeight: 1.6 }}>{server.description}</p>
              </div>
            </div>

            {/* Tools section */}
            <div style={getAnimationStyle(animationState.tools)}>
              {renderToolsSection()}
            </div>

            {/* Resources section */}
            <div style={getAnimationStyle(animationState.resources)}>
              {renderResourcesSection()}
            </div>

            {/* Connect section */}
            <div style={{ marginBottom: '1rem', ...getAnimationStyle(animationState.connect) }}>
              {renderConnectSection()}
            </div>

            {/* Details section */}
            <div style={getAnimationStyle(animationState.details)}>
              {renderDetailsSection()}
            </div>
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
    </>
  );
};

export { MCPServerDetails }; 