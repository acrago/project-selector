import React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  CodeBlock,
  CodeBlockCode,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  ExpandableSection,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Pagination,
  Popover,
  Progress,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Tab,
  TabTitleText,
  Tabs,
  TextArea,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import {
  InnerScrollContainer,
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
  DatabaseIcon,
  EllipsisVIcon,
  EyeIcon,
  EyeSlashIcon,
  FilterIcon,
  InfoCircleIcon,
  ListIcon,
  OutlinedFolderIcon,
  OutlinedQuestionCircleIcon,
  PlayIcon,
  PlusCircleIcon,
  SearchIcon,
  ThIcon,
  TimesIcon
} from '@patternfly/react-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { useFeatureFlags } from '../../utils/FeatureFlagsContext';
import { useUserProfile } from '../../utils/UserProfileContext';
import { AIAssetEndpointsIcon } from '../../Home/icons/AIAssetEndpointsIcon';
import { getMCPServersForAssetEndpoints } from '../../AIHub/MCPServers/mcpCatalogServers';
import { modelLogos } from '../../AIHub/Models/modelLogos';
import { ModelDeploymentModal } from './ModelDeploymentModal';
import { EndpointCreationProgressModal } from './EndpointCreationProgressModal';
import { TokenCopyModal } from './TokenCopyModal';
import { ToolsModal } from './ToolsModal';
import { CollectionOption, ModelSelectionModal } from './ModelSelectionModal';
import { AutoConfigModal } from './AutoConfigModal';
import { AddAssetModal, ModelType } from './AddAssetModal';

// Types
interface PlaygroundModel {
  id: string;
  name: string;
  slug: string;
  endpoint: string;
  token: string;
}

// Resource Info Tooltip Component
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future use
const ResourceInfoTooltip: React.FunctionComponent<{
  resourceName: string;
  copiedItems: Set<string>;
  handleCopyWithFeedback: (text: string, itemId: string) => void;
}> = ({ resourceName, copiedItems, handleCopyWithFeedback }) => {
  const tooltipContent = (
    <div style={{ padding: '0.5rem', maxWidth: '300px' }}>
      <div style={{ marginBottom: '1rem' }}>
        The model ID is a unique identifier required to access this model directly.
      </div>
      
      <div>
        <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
          Model ID
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <TextInput
            value={resourceName}
            readOnly
            aria-label="Model ID"
            style={{ fontSize: '0.75rem', height: '28px' }}
          />
          <Tooltip content={copiedItems.has(`resource-name-${resourceName}`) ? 'Copied' : 'Copy model ID'}>
            <Button
              variant="plain"
              size="sm"
              aria-label="Copy model ID"
              onClick={() => handleCopyWithFeedback(resourceName, `resource-name-${resourceName}`)}
              style={{ padding: '4px' }}
            >
              {copiedItems.has(`resource-name-${resourceName}`) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  return (
    <Popover
      bodyContent={tooltipContent}
      position="right"
    >
      <Button
        variant="plain"
        size="sm"
        aria-label="Resource information"
        style={{ 
          padding: '2px',
          marginLeft: '4px',
          verticalAlign: 'middle'
        }}
      >
        <OutlinedQuestionCircleIcon style={{ fontSize: '14px', color: '#6A6E73' }} />
      </Button>
    </Popover>
  );
};

// Endpoint Popover Component
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future use
const EndpointPopover: React.FunctionComponent<{
  model: ModelAsset;
  copiedItems: Set<string>;
  handleCopyWithFeedback: (text: string, itemId: string) => void;
  type: 'internal' | 'external';
  generatedTokens?: Map<string, string>;
  isGeneratingToken?: Set<string>;
  onGenerateToken?: (modelId: string) => void;
  onClearGeneratedToken?: (modelId: string) => void;
  isMaaS?: boolean;
}> = ({ model, copiedItems, handleCopyWithFeedback, type, generatedTokens, isGeneratingToken, onGenerateToken, onClearGeneratedToken, isMaaS }) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const endpoint = type === 'internal' ? model.internalEndpoint : model.externalEndpoint;
  const _token = type === 'internal' ? model.internalToken : model.externalToken;
  const endpointId = `${type}-endpoint-${model.id}`;
  const tokenId = `${type}-token-${model.id}`;

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
    // Clear generated token when popover closes
    if (type === 'external') {
      onClearGeneratedToken?.(model.id);
    }
  };

  const popoverContent = (
    <div style={{ padding: '0.5rem', width: '400px', minWidth: '400px' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
          {isMaaS && type === 'external' ? 'MaaS route' : `${type === 'internal' ? 'Internal' : 'External'} Endpoint URL`}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <TextInput
            value={endpoint || ''}
            readOnly
            aria-label="Endpoint URL"
            style={{ fontSize: '0.75rem', height: '28px', fontFamily: 'monospace' }}
          />
          <Tooltip content={copiedItems.has(endpointId) ? 'Copied' : 'Copy endpoint'}>
            <Button
              variant="plain"
              size="sm"
              aria-label="Copy endpoint"
              onClick={() => handleCopyWithFeedback(endpoint!, endpointId)}
              style={{ padding: '4px' }}
            >
              {copiedItems.has(endpointId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
            </Button>
          </Tooltip>
        </div>
      </div>
      
      {type === 'external' && (
        <div>
          <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
            API Key
          </label>
          {generatedTokens?.has(model.id) ? (
            <div>
              <Alert
                variant="info"
                title="Important: Copy and store this token"
                isInline
                style={{ marginBottom: '0.5rem' }}
              >
                This token cannot be viewed again after you close this dialog.
              </Alert>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TextInput
                  value={generatedTokens.get(model.id) || ''}
                  readOnly
                  aria-label="Generated API Key"
                  style={{ fontSize: '0.75rem', height: '28px', fontFamily: 'monospace' }}
                />
                <Tooltip content={copiedItems.has(tokenId) ? 'Copied' : 'Copy token'}>
                  <Button
                    variant="plain"
                    size="sm"
                    aria-label="Copy token"
                    onClick={() => handleCopyWithFeedback(generatedTokens.get(model.id)!, tokenId)}
                    style={{ padding: '4px' }}
                  >
                    {copiedItems.has(tokenId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
                  </Button>
                </Tooltip>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onGenerateToken?.(model.id)}
              isLoading={isGeneratingToken?.has(model.id)}
              isDisabled={isGeneratingToken?.has(model.id)}
            >
              {isGeneratingToken?.has(model.id) ? 'Generating...' : 'Generate API key'}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      bodyContent={popoverContent}
      position="right"
      hasAutoWidth
      enableFlip={false}
      isVisible={isPopoverOpen}
      shouldOpen={() => setIsPopoverOpen(true)}
      shouldClose={handlePopoverClose}
    >
      <Button
        variant="link"
        onClick={() => setIsPopoverOpen(true)}
      >
        View
      </Button>
    </Popover>
  );
};

// Combined Endpoints Popover Component (shows both internal and external)
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future use
const CombinedEndpointsPopover: React.FunctionComponent<{
  model: ModelAsset;
  copiedItems: Set<string>;
  handleCopyWithFeedback: (text: string, itemId: string) => void;
  generatedTokens?: Map<string, string>;
  isGeneratingToken?: Set<string>;
  onGenerateToken?: (modelId: string) => void;
  onClearGeneratedToken?: (modelId: string) => void;
  isMaaS?: boolean;
}> = ({ model, copiedItems, handleCopyWithFeedback, generatedTokens, isGeneratingToken, onGenerateToken, onClearGeneratedToken, isMaaS }) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [isUsageModalOpen, setIsUsageModalOpen] = React.useState(false);
  
  const internalEndpointId = `internal-endpoint-${model.id}`;
  const externalEndpointId = `external-endpoint-${model.id}`;
  const externalTokenId = `external-token-${model.id}`;

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
    // Clear generated token when popover closes (only for MaaS models)
    if (isMaaS && model.externalEndpoint) {
      onClearGeneratedToken?.(model.id);
    }
  };

  const popoverContent = (
    <div style={{ padding: '0.5rem', width: '400px', minWidth: '400px' }}>

      {/* External Endpoint Section (if available) */}
      {model.externalEndpoint && (
        <>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              {isMaaS ? 'MaaS route' : 'Endpoint'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TextInput
                value={model.externalEndpoint || ''}
                readOnly
                aria-label={isMaaS ? 'MaaS route URL' : 'Endpoint URL'}
                style={{ fontSize: '0.75rem', height: '28px', fontFamily: 'monospace' }}
              />
              <Tooltip content={copiedItems.has(externalEndpointId) ? 'Copied' : 'Copy endpoint'}>
                <Button
                  variant="plain"
                  size="sm"
                  aria-label={isMaaS ? 'Copy MaaS route' : 'Copy endpoint'}
                  onClick={() => handleCopyWithFeedback(model.externalEndpoint!, externalEndpointId)}
                  style={{ padding: '4px' }}
                >
                  {copiedItems.has(externalEndpointId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* API Key Section - only for MaaS models */}
          {isMaaS && (
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                API Key
              </label>
              {generatedTokens?.has(model.id) ? (
                <div>
                  <Alert
                    variant="info"
                    title="Important: Copy and store this token"
                    isInline
                    style={{ marginBottom: '0.5rem' }}
                  >
                    This token cannot be viewed again after you close this dialog.
                  </Alert>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TextInput
                      value={generatedTokens.get(model.id) || ''}
                      readOnly
                      aria-label="Generated API Key"
                      style={{ fontSize: '0.75rem', height: '28px', fontFamily: 'monospace' }}
                    />
                    <Tooltip content={copiedItems.has(externalTokenId) ? 'Copied' : 'Copy token'}>
                      <Button
                        variant="plain"
                        size="sm"
                        aria-label="Copy token"
                        onClick={() => handleCopyWithFeedback(generatedTokens.get(model.id)!, externalTokenId)}
                        style={{ padding: '4px' }}
                      >
                        {copiedItems.has(externalTokenId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
                      </Button>
                    </Tooltip>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => setIsUsageModalOpen(true)}
                      id={`view-usage-example-${model.id}-generated`}
                      style={{ padding: 0, fontSize: '0.875rem', color: 'var(--pf-t--global--color--brand--default)' }}
                    >
                      View usage example
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onGenerateToken?.(model.id)}
                  isLoading={isGeneratingToken?.has(model.id)}
                  isDisabled={isGeneratingToken?.has(model.id)}
                >
                  {isGeneratingToken?.has(model.id) ? 'Generating...' : 'Generate API key'}
                </Button>
              )}
            </div>
          )}

          {/* View usage example link for non-MaaS models */}
          {!isMaaS && (
            <div style={{ marginBottom: '0.75rem' }}>
              <Button
                variant="link"
                isInline
                onClick={() => setIsUsageModalOpen(true)}
                id={`view-usage-example-${model.id}-external`}
                style={{ padding: 0, fontSize: '0.875rem', color: 'var(--pf-t--global--color--brand--default)' }}
              >
                View usage example
              </Button>
            </div>
          )}
        </>
      )}

      {/* Internal Endpoint Section */}
      {isMaaS ? (
        // MaaS models: Internal endpoint in expandable section
        <div style={{ marginBottom: model.externalEndpoint ? '1rem' : '0.75rem' }}>
          <ExpandableSection
            toggleText="Internal endpoint"
            id={`internal-endpoint-expandable-${model.id}`}
          >
            <div style={{ marginTop: '0.5rem' }}>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="indeterminate">
                    The internal endpoint is accessible only within the cluster. When possible, use the endpoint with your API token for better security and access control.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                  Internal Endpoint URL
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TextInput
                    value={model.internalEndpoint || ''}
                    readOnly
                    aria-label="Internal Endpoint URL"
                    style={{ fontSize: '0.75rem', height: '28px', fontFamily: 'monospace' }}
                  />
                  <Tooltip content={copiedItems.has(internalEndpointId) ? 'Copied' : 'Copy endpoint'}>
                    <Button
                      variant="plain"
                      size="sm"
                      aria-label="Copy internal endpoint"
                      onClick={() => handleCopyWithFeedback(model.internalEndpoint!, internalEndpointId)}
                      style={{ padding: '4px' }}
                    >
                      {copiedItems.has(internalEndpointId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </ExpandableSection>
        </div>
      ) : (
        // Non-MaaS models: Internal endpoint always visible
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
              Internal endpoint
            </label>
            <Tooltip content="The internal endpoint is accessible only within the cluster.">
              <Button
                variant="plain"
                aria-label="Internal endpoint info"
                style={{ padding: '0', minWidth: 'auto' }}
              >
                <InfoCircleIcon style={{ fontSize: '14px', color: '#6A6E73' }} />
              </Button>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TextInput
              value={model.internalEndpoint || ''}
              readOnly
              aria-label="Internal Endpoint URL"
              style={{ fontSize: '0.75rem', height: '28px', fontFamily: 'monospace' }}
            />
            <Tooltip content={copiedItems.has(internalEndpointId) ? 'Copied' : 'Copy endpoint'}>
              <Button
                variant="plain"
                size="sm"
                aria-label="Copy internal endpoint"
                onClick={() => handleCopyWithFeedback(model.internalEndpoint!, internalEndpointId)}
                style={{ padding: '4px' }}
              >
                {copiedItems.has(internalEndpointId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Popover
        bodyContent={popoverContent}
        position="right"
        hasAutoWidth
        enableFlip={false}
        isVisible={isPopoverOpen}
        shouldOpen={() => setIsPopoverOpen(true)}
        shouldClose={handlePopoverClose}
      >
        <Button
          variant="link"
          onClick={() => setIsPopoverOpen(true)}
        >
          View
        </Button>
      </Popover>
      {isMaaS ? (
        // MaaS models: Usage modal with API key and subscription header
        model.externalEndpoint && (model.externalToken || generatedTokens?.has(model.id)) && (
          <UsageExampleModal
            isOpen={isUsageModalOpen}
            onClose={() => setIsUsageModalOpen(false)}
            endpoint={model.externalEndpoint}
            apiKey={generatedTokens?.get(model.id) || model.externalToken || ''}
            isModel={true}
            subscriptionId="sub-enterprise-2026-001"
          />
        )
      ) : (
        // Non-MaaS models: Usage modal without API key (use external endpoint if available, otherwise internal)
        <UsageExampleModal
          isOpen={isUsageModalOpen}
          onClose={() => setIsUsageModalOpen(false)}
          endpoint={model.externalEndpoint || model.internalEndpoint}
          isModel={true}
        />
      )}
    </>
  );
};

// MCP Endpoint Popover Component
const MCPEndpointPopover: React.FunctionComponent<{
  server: MCPServer;
  copiedItems: Set<string>;
  handleCopyWithFeedback: (text: string, itemId: string) => void;
}> = ({ server, copiedItems, handleCopyWithFeedback }) => {
  const endpoint = server.streamableEndpoint;
  const endpointId = `streamable-endpoint-${server.id}`;

  const popoverContent = (
    <div style={{ padding: '0.5rem', maxWidth: '400px' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={{ fontWeight: 'bold', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
          Service endpoint
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <TextInput
            value={endpoint || ''}
            readOnly
            aria-label="Service endpoint"
            style={{ fontSize: '0.75rem', height: '28px', fontFamily: 'monospace' }}
          />
          <Tooltip content={copiedItems.has(endpointId) ? 'Copied' : 'Copy endpoint'}>
            <Button
              variant="plain"
              size="sm"
              aria-label="Copy endpoint"
              onClick={() => handleCopyWithFeedback(endpoint!, endpointId)}
              style={{ padding: '4px' }}
            >
              {copiedItems.has(endpointId) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
            </Button>
          </Tooltip>
        </div>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)', margin: 0 }}>
        For authentication information refer to the{' '}
        <Link
          to={server.slug ? `/ai-hub/mcp/catalog/${server.slug}` : '/ai-hub/mcp/catalog'}
          style={{ fontSize: '0.875rem' }}
          id={`mcp-catalog-auth-link-${server.id}`}
        >
          catalog listing
        </Link>
        {' '}for this server.
      </p>
    </div>
  );

  return (
    <Popover
      bodyContent={popoverContent}
      position="right"
    >
      <Button
        variant="link"
      >
        View
      </Button>
    </Popover>
  );
};

// Usage Example Modal Component
const UsageExampleModal: React.FunctionComponent<{
  isOpen: boolean;
  onClose: () => void;
  endpoint: string;
  apiKey?: string;
  isModel?: boolean;
  subscriptionId?: string;
}> = ({ isOpen, onClose, endpoint, apiKey, isModel = true, subscriptionId }) => {
  const authHeader = apiKey ? `\n  -H "Authorization: Bearer ${apiKey}" \\` : '';
  const subscriptionHeader = subscriptionId ? `\n  -H "X-MAAS-SUBSCRIPTION: ${subscriptionId}" \\` : '';
  const curlExample = isModel 
    ? `curl -X POST ${endpoint}/chat/completions \\
  -H "Content-Type: application/json" \\${authHeader}${subscriptionHeader}
  -d '{
    "model": "model-name",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 150
  }'`
    : `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\${authHeader}${subscriptionHeader}
  -d '{
    "action": "query",
    "parameters": {}
  }'`;

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="usage-example-modal-title"
      aria-describedby="usage-example-modal-description"
    >
      <ModalHeader 
        title="Usage example" 
        labelId="usage-example-modal-title" 
      />
      <ModalBody id="usage-example-modal-description">
        <p style={{ marginBottom: '1rem' }}>
          {apiKey 
            ? 'Use this cURL command to connect to the endpoint with your API key:'
            : 'Use this cURL command to connect to the endpoint:'}
        </p>
        <CodeBlock id="usage-example-code-block">
          <CodeBlockCode>
            {curlExample}
          </CodeBlockCode>
        </CodeBlock>
        {subscriptionId && (
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
            <strong>Note:</strong> The <code>X-MAAS-SUBSCRIPTION</code> header specifies which subscription to use for this request. 
            This header is optional if you only have access to one subscription.
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button 
          key="close" 
          variant="primary" 
          onClick={onClose}
          id="usage-example-modal-close-button"
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// Mock data for user's API keys and subscriptions
const _mockUserApiKeys = [
  { id: 'key-1', name: 'Production Key', token: 'sk-prod-abc123xyz789...', createdAt: '2026-01-15' },
  { id: 'key-2', name: 'Development Key', token: 'sk-dev-def456uvw012...', createdAt: '2026-01-20' },
  { id: 'key-3', name: 'Testing Key', token: 'sk-test-ghi789rst345...', createdAt: '2026-02-01' }
];

const modalMockSubscriptions = [
  { id: 'sub-enterprise-2026-001', name: 'Enterprise Plan', tier: 'Enterprise', rateLimit: '10,000 req/min' },
  { id: 'sub-team-2026-002', name: 'Team Plan', tier: 'Team', rateLimit: '1,000 req/min' },
  { id: 'sub-dev-2026-003', name: 'Developer Plan', tier: 'Developer', rateLimit: '100 req/min' },
  { id: 'sub-research-2026-004', name: 'Research Lab', tier: 'Research', rateLimit: '5,000 req/min' },
  { id: 'sub-sandbox-2026-005', name: 'Sandbox', tier: 'Sandbox', rateLimit: '50 req/min' },
];

// Connect to Endpoint Modal Component - Combines endpoint, API keys, subscription, and usage example
// Adapts based on model type: Self-service (MaaS), External, or Internal-only
// Toggle between versions via the pink flag dropdown: "Ephemeral API key flow (3.4)"
const MaaSEndpointModal: React.FunctionComponent<{
  isOpen: boolean;
  onClose: () => void;
  model: ModelAsset;
  copiedItems: Set<string>;
  handleCopyWithFeedback: (text: string, itemId: string) => void;
  generatedTokens?: Map<string, string>;
  isGeneratingToken?: Set<string>;
  onGenerateToken?: (modelId: string) => void;
  isMaaS?: boolean;
}> = ({ isOpen, onClose, model, copiedItems, handleCopyWithFeedback, isMaaS = true }) => {
  const endpointId = `maas-endpoint-modal-${model.id}`;
  const useEphemeralFlow = true;

  const [selectedSubscriptionId, setSelectedSubscriptionId] = React.useState<string>(modalMockSubscriptions[0]?.id || '');
  const [isSubscriptionSelectOpen, setIsSubscriptionSelectOpen] = React.useState(false);
  const selectedSubscription = modalMockSubscriptions.find(s => s.id === selectedSubscriptionId);

  const [ephemeralToken, setEphemeralToken] = React.useState<string | null>(null);
  const [isGeneratingEphemeral, setIsGeneratingEphemeral] = React.useState(false);
  const [showEphemeralToken, setShowEphemeralToken] = React.useState(false);

  const handleGenerateEphemeralKey = async () => {
    setIsGeneratingEphemeral(true);
    setShowEphemeralToken(false);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'sk-maas-';
    for (let i = 0; i < 40; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEphemeralToken(key);
    setIsGeneratingEphemeral(false);
  };

  const handleClose = () => {
    setEphemeralToken(null);
    setIsGeneratingEphemeral(false);
    setShowEphemeralToken(false);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="maas-endpoint-modal-title"
      aria-describedby="maas-endpoint-modal-description"
    >
      <ModalHeader 
        labelId="maas-endpoint-modal-title"
        title={
          isMaaS ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              Endpoints
              <Label color="purple" id={`endpoint-modal-source-badge-${model.id}`}>
                Model as a Service
              </Label>
            </span>
          ) : 'Endpoints'
        }
      />
      <ModalBody id="maas-endpoint-modal-description">
            <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                {isMaaS && 'The underlying model is managed by a cluster administrator and shared across projects via the API gateway. '}
                Use this endpoint to connect your application to this model. Copy the endpoint URL below to start making requests.
              </Content>
              {model.modelId && (
                <Content component="small" style={{ color: 'var(--pf-t--global--color--200)' }}>
                  Model ID: <code>{model.modelId}</code>
                </Content>
              )}
            </div>
            <Form>
              {/* External API Endpoint */}
              {model.externalEndpoint && (
                <FormGroup 
                  label={model.source === 'external' ? 'Provider URL' : 'External API endpoint'}
                  fieldId={endpointId}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TextInput
                      id={endpointId}
                      value={model.externalEndpoint || ''}
                      readOnly
                      aria-label={model.source === 'external' ? 'Provider URL' : 'External API endpoint URL'}
                      style={{ fontFamily: 'monospace', flex: 1 }}
                    />
                    <Tooltip content={copiedItems.has(endpointId) ? 'Copied' : 'Copy endpoint'}>
                      <Button
                        variant="control"
                        aria-label={model.source === 'external' ? 'Copy provider URL' : 'Copy external API endpoint'}
                        onClick={() => handleCopyWithFeedback(model.externalEndpoint!, endpointId)}
                        id={`copy-external-endpoint-${model.id}`}
                      >
                        {copiedItems.has(endpointId) ? <CheckCircleIcon /> : <CopyIcon />}
                      </Button>
                    </Tooltip>
                  </div>
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        {model.source === 'external'
                          ? 'The base URL of the third-party provider\'s API.'
                          : 'Use this endpoint to access the model from outside the cluster.'}
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                </FormGroup>
              )}

              {/* Internal API Endpoint */}
              {model.internalEndpoint && (
                <FormGroup 
                  label="Internal API endpoint" 
                  fieldId={`internal-${endpointId}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TextInput
                      id={`internal-${endpointId}`}
                      value={model.internalEndpoint || ''}
                      readOnly
                      aria-label="Internal API endpoint URL"
                      style={{ fontFamily: 'monospace', flex: 1 }}
                    />
                    <Tooltip content={copiedItems.has(`internal-${endpointId}`) ? 'Copied' : 'Copy endpoint'}>
                      <Button
                        variant="control"
                        aria-label="Copy internal API endpoint"
                        onClick={() => handleCopyWithFeedback(model.internalEndpoint!, `internal-${endpointId}`)}
                        id={`copy-internal-endpoint-${model.id}`}
                      >
                        {copiedItems.has(`internal-${endpointId}`) ? <CheckCircleIcon /> : <CopyIcon />}
                      </Button>
                    </Tooltip>
                  </div>
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem>
                        Use this endpoint to access the model from within the cluster.
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                </FormGroup>
              )}

              {/* ── Version 1 (previous): API key links + subscription dropdown + copyable header ── */}
              {isMaaS && !useEphemeralFlow && (
                <>
                  <FormGroup 
                    label="API key" 
                    fieldId="maas-api-key-info"
                  >
                    <Content component={ContentVariants.p} id="maas-api-key-guidance">
                      Use any of your <Link to="/gen-ai-studio/api-keys" id="maas-modal-existing-keys-link">existing API keys</Link> to
                      authenticate requests to this model, or <Link to="/gen-ai-studio/api-keys" id="maas-modal-create-key-link">create a new API key</Link>.
                    </Content>
                  </FormGroup>

                  <FormGroup
                    label="Subscription"
                    fieldId="maas-subscription-select"
                  >
                    <Content component={ContentVariants.p} id="maas-subscription-guidance">
                      Select a subscription to include in your request header.
                    </Content>

                    <Select
                      id="maas-subscription-select"
                      isOpen={isSubscriptionSelectOpen}
                      selected={selectedSubscriptionId}
                      onSelect={(_event, value) => {
                        setSelectedSubscriptionId(value as string);
                        setIsSubscriptionSelectOpen(false);
                      }}
                      onOpenChange={(isOpen) => setIsSubscriptionSelectOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsSubscriptionSelectOpen(!isSubscriptionSelectOpen)}
                          isExpanded={isSubscriptionSelectOpen}
                          style={{ width: '100%' }}
                          id="maas-subscription-toggle"
                        >
                          {selectedSubscription ? selectedSubscription.name : 'Select a subscription'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {modalMockSubscriptions.map((sub) => (
                          <SelectOption key={sub.id} value={sub.id} description={sub.id} id={`maas-sub-option-${sub.id}`}>
                            {sub.name}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>

                    <Content component={ContentVariants.small} style={{ fontWeight: 'bold', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                      Request header
                    </Content>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TextInput
                        id="maas-subscription-header-value"
                        value={`X-MAAS-SUBSCRIPTION: ${selectedSubscription?.id || ''}`}
                        readOnly
                        aria-label="Subscription header"
                        style={{ fontFamily: 'monospace', flex: 1 }}
                      />
                      <Tooltip content={copiedItems.has('maas-subscription-header') ? 'Copied' : 'Copy header'}>
                        <Button
                          variant="control"
                          aria-label="Copy subscription header"
                          onClick={() => handleCopyWithFeedback(`X-MAAS-SUBSCRIPTION: ${selectedSubscription?.id || ''}`, 'maas-subscription-header')}
                          id="copy-maas-subscription-header"
                        >
                          {copiedItems.has('maas-subscription-header') ? <CheckCircleIcon /> : <CopyIcon />}
                        </Button>
                      </Tooltip>
                    </div>
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          This header is required when you have access to more than one subscription.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>
                </>
              )}

              {/* ── Version 2 (new / 3.4): Subscription first, then Generate ephemeral API key ── */}
              {isMaaS && useEphemeralFlow && (
                <div id="maas-auth-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pf-t--global--spacer--md)' }}>
                  <div>
                    <Content component="p" style={{ fontWeight: 'bold', marginBottom: '0.25rem' }} id="maas-auth-group-title">
                      Authentication
                    </Content>
                    <Content component="small" style={{ color: 'var(--pf-t--global--color--200)' }} id="maas-auth-group-description">
                      Select a subscription, then generate a temporary API key to authenticate requests to this model.
                    </Content>
                  </div>
                  <FormGroup
                    label="Subscription"
                    fieldId="maas-subscription-select-v2"
                  >
                    <Select
                      id="maas-subscription-select-v2"
                      isOpen={isSubscriptionSelectOpen}
                      selected={selectedSubscriptionId}
                      onSelect={(_event, value) => {
                        setSelectedSubscriptionId(value as string);
                        setIsSubscriptionSelectOpen(false);
                        setEphemeralToken(null);
                      }}
                      onOpenChange={(isOpen) => setIsSubscriptionSelectOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsSubscriptionSelectOpen(!isSubscriptionSelectOpen)}
                          isExpanded={isSubscriptionSelectOpen}
                          style={{ width: '100%' }}
                          id="maas-subscription-toggle-v2"
                        >
                          {selectedSubscription ? selectedSubscription.name : 'Select a subscription'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {modalMockSubscriptions.map((sub) => (
                          <SelectOption key={sub.id} value={sub.id} description={sub.id} id={`maas-sub-v2-option-${sub.id}`}>
                            {sub.name}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  </FormGroup>

                  <FormGroup
                    label="API key"
                    fieldId="maas-ephemeral-api-key"
                  >
                    {ephemeralToken ? (
                      <>
                        <Alert
                          variant="info"
                          isInline
                          title="This is an ephemeral API key"
                          id="maas-ephemeral-key-alert"
                        >
                          This key expires in 1 hour and will not appear in your list of API keys.
                          To create a permanent key, visit the <Link to="/gen-ai-studio/api-keys" id="maas-ephemeral-permanent-key-link">API Keys</Link> page.
                        </Alert>
                        <InputGroup style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                          <InputGroupItem isFill>
                            <TextInput
                              id="maas-ephemeral-token-value"
                              value={showEphemeralToken ? ephemeralToken : '•'.repeat(ephemeralToken.length)}
                              readOnly
                              aria-label="Generated ephemeral API key"
                              style={{ fontFamily: 'monospace' }}
                            />
                          </InputGroupItem>
                          <InputGroupItem>
                            <Tooltip content={showEphemeralToken ? 'Hide key' : 'Show key'}>
                              <Button
                                variant="control"
                                aria-label={showEphemeralToken ? 'Hide API key' : 'Show API key'}
                                onClick={() => setShowEphemeralToken(!showEphemeralToken)}
                                id="toggle-maas-ephemeral-token-visibility"
                              >
                                {showEphemeralToken ? <EyeSlashIcon /> : <EyeIcon />}
                              </Button>
                            </Tooltip>
                          </InputGroupItem>
                          <InputGroupItem>
                            <Tooltip content={copiedItems.has('maas-ephemeral-token') ? 'Copied' : 'Copy API key'}>
                              <Button
                                variant="control"
                                aria-label="Copy ephemeral API key"
                                onClick={() => handleCopyWithFeedback(ephemeralToken, 'maas-ephemeral-token')}
                                id="copy-maas-ephemeral-token"
                              >
                                {copiedItems.has('maas-ephemeral-token') ? <CheckCircleIcon /> : <CopyIcon />}
                              </Button>
                            </Tooltip>
                          </InputGroupItem>
                          <InputGroupItem>
                            <Tooltip content="Clear key">
                              <Button
                                variant="control"
                                aria-label="Clear ephemeral API key"
                                onClick={() => { setEphemeralToken(null); setShowEphemeralToken(false); }}
                                id="maas-clear-ephemeral-key"
                              >
                                <TimesIcon />
                              </Button>
                            </Tooltip>
                          </InputGroupItem>
                        </InputGroup>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={handleGenerateEphemeralKey}
                          isLoading={isGeneratingEphemeral}
                          isDisabled={isGeneratingEphemeral || !selectedSubscriptionId}
                          id="maas-generate-ephemeral-key-btn"
                        >
                          {isGeneratingEphemeral ? 'Generating...' : 'Generate API key'}
                        </Button>
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem>
                              To create a permanent API key, visit the <Link to="/gen-ai-studio/api-keys" id="maas-modal-permanent-key-link">API Keys</Link> page.
                            </HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                      </>
                    )}
                  </FormGroup>
                </div>
              )}

            </Form>
      </ModalBody>
      <ModalFooter>
        <Button 
          key="close" 
          variant="primary" 
          onClick={handleClose}
          id="maas-endpoint-modal-close-button"
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};


// Mock data types
interface ModelAsset {
  id: string;
  name: string;
  /** Friendly display name for this endpoint (e.g. "Customer Support GPT-4o"). Falls back to formatted name if not set. */
  displayName?: string;
  /** Verbatim model ID from the provider (e.g. "gemini-2.0-flash"). Only set for external models. */
  modelId?: string;
  slug: string;
  internalEndpoint: string;
  internalToken?: string;
  externalEndpoint?: string;
  externalToken?: string;
  llsStatus: 'registered' | 'not-registered';
  useCase: string;
  description?: string;
  framework?: string;
  version?: string;
  logo: string;
  hasReasoning?: boolean;
  status: string;
  statusColor: string;
  availability?: 'unpublished' | 'pending' | 'available';
  /** 'external' = user-added via name/URL/key; omitted or 'deployed' = from RHOAI deployment */
  source?: 'deployed' | 'external';
  /** Model type: 'inference' for inferencing models, 'embedding' for embedding models */
  modelType?: 'inference' | 'embedding';
  /** Cloud provider for Llama Stack registration */
  provider?: 'openai' | 'gemini' | 'anthropic' | 'other';
  /** Output vector size for embedding models */
  embeddingDimension?: string;
}

type EndpointKind = 'internal' | 'external' | 'maas' | 'public-route';

interface EndpointRow {
  model: ModelAsset;
  endpointKind: EndpointKind;
  endpointUrl: string;
  rowKey: string;
}

interface MCPServer {
  id: string;
  name: string;
  status: string;
  statusColor: string;
  version: string;
  description: string;
  logo: string;
  slug: string;
  streamableEndpoint?: string;
  streamableToken?: string;
}

type VectorStoreStatus = 'Active' | 'Unreachable' | 'Misconfigured';
type VectorStoreProvider = 'PGVector' | 'Qdrant' | 'Milvus';
type DistanceMetric = 'cosine' | 'euclidean' | 'dotproduct';

interface VectorStore {
  id: string;
  name: string;
  provider: VectorStoreProvider;
  status: VectorStoreStatus;
  dimensions: number;
  distanceMetric: DistanceMetric;
  linkedModelId: string;
  linkedModelName: string;
  linkedModelSlug: string;
  embeddingModelId: string;
  endpoint: string;
  collection: string;
  secretRef: string;
  description: string;
  owner: string;
  domain: string;
  documentCount: number;
  createdAt: string;
}

interface VectorStoreCollectionRow {
  id: string;
  vectorStoreName: string;
  description: string;
  providerId: string;
  providerType: string;
  vectorStoreUuid: string;
  embeddingModel: string;
  embeddingDimension: number;
  embeddingModelConnected: boolean;
  linkedModelId: string;
  linkedModelName: string;
  linkedModelSlug: string;
  owner: string;
  domain: string;
  playgroundState: 'disabled' | 'add' | 'added';
}

const embeddingModelDimensions: Record<string, number> = {
  'ibm-granite/granite-embedding-125m-english': 768,
  'nomic-ai/nomic-embed-text-v1.5': 768,
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
};

const vectorStoreProviders: VectorStoreProvider[] = ['PGVector', 'Qdrant', 'Milvus'];

const initialVectorStores: VectorStore[] = [
  {
    id: 'vs-1',
    name: 'product-catalog-search',
    provider: 'PGVector',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'cosine',
    linkedModelId: 'external-embedding-1',
    linkedModelName: 'Granite Embedding 125M',
    linkedModelSlug: 'ibm-granite-granite-embedding-125m-english',
    embeddingModelId: 'ibm-granite/granite-embedding-125m-english',
    endpoint: 'postgresql://pgvector.demo-ns.svc.cluster.local:5432/catalog',
    collection: 'product_embeddings',
    secretRef: 'pgvector-catalog-credentials',
    description: 'Product catalog embeddings for e-commerce search and recommendations.',
    owner: 'Platform Team — Search',
    domain: 'Product',
    documentCount: 48_230,
    createdAt: '2026-01-28',
  },
  {
    id: 'vs-2',
    name: 'support-ticket-embeddings',
    provider: 'Milvus',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'dotproduct',
    linkedModelId: 'external-embedding-2',
    linkedModelName: 'Nomic Embed Text v1.5',
    linkedModelSlug: 'nomic-ai-nomic-embed-text-v1.5',
    embeddingModelId: 'nomic-ai/nomic-embed-text-v1.5',
    endpoint: 'milvus.demo-ns.svc.cluster.local:19530',
    collection: 'support_tickets_v2',
    secretRef: 'milvus-support-secret',
    description: 'Historical support tickets for customer-facing RAG assistant.',
    owner: 'Support Engineering',
    domain: 'Customer Support',
    documentCount: 12_870,
    createdAt: '2026-02-10',
  },
  {
    id: 'vs-3',
    name: 'internal-docs-rag',
    provider: 'Qdrant',
    status: 'Unreachable',
    dimensions: 1536,
    distanceMetric: 'cosine',
    linkedModelId: 'ext-ada-002',
    linkedModelName: 'text-embedding-ada-002',
    linkedModelSlug: 'text-embedding-ada-002',
    embeddingModelId: 'openai/text-embedding-ada-002',
    endpoint: 'https://qdrant.internal.example.com:6333',
    collection: 'internal_documentation',
    secretRef: 'qdrant-docs-api-key',
    description: 'Internal engineering docs and runbooks for on-call RAG.',
    owner: 'DevOps',
    domain: 'Engineering',
    documentCount: 5_410,
    createdAt: '2026-02-18',
  },
  {
    id: 'vs-4',
    name: 'compliance-kb',
    provider: 'PGVector',
    status: 'Misconfigured',
    dimensions: 3072,
    distanceMetric: 'euclidean',
    linkedModelId: 'ext-embed-large',
    linkedModelName: 'text-embedding-3-large',
    linkedModelSlug: 'text-embedding-3-large',
    embeddingModelId: 'openai/text-embedding-3-large',
    endpoint: 'postgresql://pgvector-compliance.demo-ns.svc.cluster.local:5432/compliance',
    collection: 'regulatory_docs',
    secretRef: '',
    description: 'Regulatory and compliance documents. Missing credentials secret.',
    owner: 'Legal & Compliance',
    domain: 'Compliance',
    documentCount: 0,
    createdAt: '2026-02-22',
  },
  {
    id: 'vs-5',
    name: 'hr-policies-search',
    provider: 'Qdrant',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'cosine',
    linkedModelId: 'external-embedding-1',
    linkedModelName: 'Granite Embedding 125M',
    linkedModelSlug: 'ibm-granite-granite-embedding-125m-english',
    embeddingModelId: 'ibm-granite/granite-embedding-125m-english',
    endpoint: 'https://qdrant-hr.demo-ns.svc.cluster.local:6333',
    collection: 'hr_policies_2026',
    secretRef: 'qdrant-hr-api-key',
    description: 'Company HR policies, benefits guides, and employee handbook.',
    owner: 'People Operations',
    domain: 'HR',
    documentCount: 1_240,
    createdAt: '2026-02-01',
  },
  {
    id: 'vs-6',
    name: 'api-docs-v3',
    provider: 'Milvus',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'dotproduct',
    linkedModelId: 'external-embedding-2',
    linkedModelName: 'Nomic Embed Text v1.5',
    linkedModelSlug: 'nomic-ai-nomic-embed-text-v1.5',
    embeddingModelId: 'nomic-ai/nomic-embed-text-v1.5',
    endpoint: 'milvus-apidocs.demo-ns.svc.cluster.local:19530',
    collection: 'openapi_specs_v3',
    secretRef: 'milvus-apidocs-secret',
    description: 'OpenAPI specifications and developer documentation for platform APIs.',
    owner: 'Platform Engineering',
    domain: 'Engineering',
    documentCount: 3_850,
    createdAt: '2026-01-15',
  },
  {
    id: 'vs-7',
    name: 'sales-enablement',
    provider: 'PGVector',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'cosine',
    linkedModelId: 'external-embedding-1',
    linkedModelName: 'Granite Embedding 125M',
    linkedModelSlug: 'ibm-granite-granite-embedding-125m-english',
    embeddingModelId: 'ibm-granite/granite-embedding-125m-english',
    endpoint: 'postgresql://pgvector-sales.demo-ns.svc.cluster.local:5432/sales',
    collection: 'sales_collateral',
    secretRef: 'pgvector-sales-credentials',
    description: 'Sales decks, battle cards, and competitive intelligence.',
    owner: 'Sales Ops',
    domain: 'Sales',
    documentCount: 920,
    createdAt: '2026-02-05',
  },
  {
    id: 'vs-8',
    name: 'security-advisories',
    provider: 'Qdrant',
    status: 'Unreachable',
    dimensions: 768,
    distanceMetric: 'cosine',
    linkedModelId: 'external-embedding-2',
    linkedModelName: 'Nomic Embed Text v1.5',
    linkedModelSlug: 'nomic-ai-nomic-embed-text-v1.5',
    embeddingModelId: 'nomic-ai/nomic-embed-text-v1.5',
    endpoint: 'https://qdrant-security.demo-ns.svc.cluster.local:6333',
    collection: 'cve_advisories',
    secretRef: 'qdrant-security-api-key',
    description: 'CVE advisories and security bulletins for vulnerability triage.',
    owner: 'Security Team',
    domain: 'Security',
    documentCount: 6_780,
    createdAt: '2026-01-20',
  },
];

const initialCollectionRows: VectorStoreCollectionRow[] = [
  {
    id: 'col-1', vectorStoreName: 'Product Docs RAG Store',
    description: 'Vector store for product documentation',
    providerId: 'vector-store-provider-1', providerType: 'remote::pgvector',
    vectorStoreUuid: 'vs_282695f8-7e3e-48da-abac-d81a0aa225a4',
    embeddingModel: 'ibm-granite/granite-embedding-125m-english', embeddingDimension: 768,
    embeddingModelConnected: true,
    linkedModelId: 'external-embedding-1', linkedModelName: 'Granite Embedding 125M', linkedModelSlug: 'ibm-granite-granite-embedding-125m-english',
    owner: 'platform-team', domain: 'rag', playgroundState: 'added',
  },
  {
    id: 'col-2', vectorStoreName: 'Legal Contracts Store',
    description: 'Vector store for legal document search',
    providerId: 'vector-store-provider-1', providerType: 'remote::pgvector',
    vectorStoreUuid: 'vs_50f14ad3-6cf4-466b-a7b6-8b01afcc1e47',
    embeddingModel: 'ibm-granite/granite-embedding-125m-english', embeddingDimension: 768,
    embeddingModelConnected: true,
    linkedModelId: 'external-embedding-1', linkedModelName: 'Granite Embedding 125M', linkedModelSlug: 'ibm-granite-granite-embedding-125m-english',
    owner: 'legal-team', domain: 'legal', playgroundState: 'add',
  },
  {
    id: 'col-3', vectorStoreName: 'Enterprise Search Store',
    description: 'Company-wide document search',
    providerId: 'vector-store-provider-2', providerType: 'remote::milvus',
    vectorStoreUuid: 'vs_4c4b74e3-30ac-4e46-9057-213154f83dba',
    embeddingModel: 'ibm-granite/granite-embedding-125m-english', embeddingDimension: 768,
    embeddingModelConnected: true,
    linkedModelId: 'external-embedding-1', linkedModelName: 'Granite Embedding 125M', linkedModelSlug: 'ibm-granite-granite-embedding-125m-english',
    owner: 'search-team', domain: 'search', playgroundState: 'add',
  },
  {
    id: 'col-4', vectorStoreName: 'Internal Knowledge Base',
    description: 'Secure internal knowledge base',
    providerId: 'vector-store-provider-3', providerType: 'remote::milvus',
    vectorStoreUuid: 'vs_a2607363-cea0-4d2a-8a93-7fb76863403b',
    embeddingModel: 'ibm-granite/granite-embedding-125m-english', embeddingDimension: 768,
    embeddingModelConnected: false,
    linkedModelId: '', linkedModelName: '', linkedModelSlug: '',
    owner: 'platform-team', domain: 'internal', playgroundState: 'disabled',
  },
  {
    id: 'col-5', vectorStoreName: 'Support Knowledge Base',
    description: '',
    providerId: 'vector-store-provider-4', providerType: 'remote::qdrant',
    vectorStoreUuid: 'vs_3fa896ef-5e25-4935-baeb-adf9ac59cb6d',
    embeddingModel: 'ibm-granite/granite-embedding-125m-english', embeddingDimension: 768,
    embeddingModelConnected: false,
    linkedModelId: '', linkedModelName: '', linkedModelSlug: '',
    owner: 'ml-team', domain: 'support', playgroundState: 'disabled',
  },
];

// Mock data
const mockModels: ModelAsset[] = [
  {
    id: '1',
    name: 'llama-3.1-8b-instruct',
    displayName: 'Llama 3.1 8B General',
    slug: 'llama-3-1-8b-instruct',
    internalEndpoint: 'http://llama-3-1-8b.demo-namespace.svc.cluster.local:8080/v1',
    internalToken: 'sk-internal-token-123',
    externalEndpoint: 'https://api.demo.openshift.ai/models/llama-3-1-8b/v1',
    externalToken: 'sk-external-token-456',
    llsStatus: 'registered',
    useCase: 'General chat',
    description: 'Meta Llama 3.1 8B parameter model optimized for instruction following',
    framework: 'vLLM',
    version: '3.1',
    logo: modelLogos['llama-3-1-8b-instruct'],
    hasReasoning: false,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: '2',
    name: 'granite-7b-code',
    displayName: 'Granite 7B Code',
    slug: 'granite-7b-code',
    internalEndpoint: 'http://granite-7b-code.demo-namespace.svc.cluster.local:8080/v1',
    internalToken: 'sk-internal-granite-789',
    llsStatus: 'not-registered',
    useCase: 'Code generation',
    description: 'IBM Granite 7B model specialized for code generation tasks',
    framework: 'TGI',
    version: '1.0',
    logo: modelLogos['granite-7b-code'],
    hasReasoning: false,
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: '3',
    name: 'mistral-7b-instruct',
    displayName: 'Mistral 7B Reasoning',
    slug: 'mistral-7b-instruct',
    internalEndpoint: 'http://mistral-7b.demo-namespace.svc.cluster.local:8080/v1',
    internalToken: 'sk-internal-mistral-abc',
    externalEndpoint: 'https://api.demo.openshift.ai/models/mistral-7b/v1',
    externalToken: 'sk-external-mistral-def',
    llsStatus: 'registered',
    useCase: 'Multilingual, Reasoning',
    description: 'Mistral 7B instruction-tuned model for general purpose tasks',
    framework: 'vLLM',
    version: '0.1',
    logo: modelLogos['mistral-7b-instruct'],
    hasReasoning: true,
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: '3b',
    name: 'mistral-7b-instruct',
    displayName: 'Mistral 7B Translation',
    slug: 'mistral-7b-instruct-translation',
    internalEndpoint: 'http://mistral-7b-translate.demo-namespace.svc.cluster.local:8080/v1',
    internalToken: 'sk-internal-mistral-translate-xyz',
    llsStatus: 'registered',
    useCase: 'Translation',
    description: 'Mistral 7B configured for multilingual translation tasks',
    framework: 'vLLM',
    version: '0.1',
    logo: modelLogos['mistral-7b-instruct'],
    hasReasoning: false,
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: '4',
    name: 'gpt-oss-120b-FP8-Dynamic',
    displayName: 'GPT OSS 120B',
    slug: 'gpt-oss-120b-fp8-dynamic',
    internalEndpoint: 'http://gpt-oss-120b.demo-namespace.svc.cluster.local:8080/v1',
    internalToken: 'sk-internal-gpt-oss-120b-xyz',
    externalEndpoint: 'https://api.demo.openshift.ai/models/gpt-oss-120b/v1',
    externalToken: 'sk-external-gpt-oss-120b-abc',
    llsStatus: 'not-registered',
    useCase: 'Text generation',
    description: 'For production, general purpose, high reasoning use cases that fit into a single 80GB GPU (like NVIDIA H100 or AMD MI300X) (117B parameters with 5.1B active parameters)',
    framework: 'vLLM',
    version: '1.0',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: true,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: '5',
    name: 'Pixtral-Large-Instruct-2411-hf-quantized.w8a8',
    displayName: 'Pixtral Large Vision',
    slug: 'pixtral-large-instruct-2411-hf-quantized-w8a8',
    internalEndpoint: 'http://pixtral-large.demo-namespace.svc.cluster.local:8080/v1',
    internalToken: 'sk-internal-pixtral-abc123',
    externalEndpoint: 'https://api.demo.openshift.ai/models/pixtral-large/v1',
    externalToken: 'sk-external-pixtral-789',
    llsStatus: 'not-registered',
    useCase: 'Vision, Multimodal',
    description: 'This model was obtained by quantizing the weights of neuralmagic/Pixtral-Large-Instruct-2411-hf to INT8 data type, ready for inference with vLLM >= 0.5.2.',
    framework: 'vLLM',
    version: '1.5.0',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: true,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: '6',
    name: 'codellama-34b-instruct',
    displayName: 'Code Llama 34B',
    slug: 'codellama-34b-instruct',
    internalEndpoint: 'http://codellama-34b.demo-namespace.svc.cluster.local:8080/v1',
    internalToken: 'sk-internal-codellama-456',
    externalEndpoint: 'https://api.demo.openshift.ai/models/codellama-34b/v1',
    externalToken: 'sk-external-codellama-789',
    llsStatus: 'registered',
    useCase: 'Code generation',
    description: 'Meta Code Llama 34B instruction-tuned model for code generation and understanding',
    framework: 'vLLM',
    version: '1.0',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: false,
    availability: 'pending',
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: '7',
    name: 'Customer Support GPT-4o',
    displayName: 'Customer Support GPT-4o',
    modelId: 'gpt-4o',
    slug: 'customer-support-gpt-4o',
    internalEndpoint: '',
    externalEndpoint: 'https://api.openai.com/v1',
    externalToken: 'sk-ext-cs-gpt4o-abc',
    llsStatus: 'registered',
    useCase: 'Customer support',
    description: 'GPT-4o configured for customer support workflows',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: false,
    status: 'Running',
    statusColor: '#3e8635',
    source: 'external',
    provider: 'openai'
  },
  {
    id: '8',
    name: 'Internal Docs GPT-4o',
    displayName: 'Internal Docs GPT-4o',
    modelId: 'gpt-4o',
    slug: 'internal-docs-gpt-4o',
    internalEndpoint: '',
    externalEndpoint: 'https://api.openai.com/v1',
    externalToken: 'sk-ext-docs-gpt4o-xyz',
    llsStatus: 'registered',
    useCase: 'Documentation Q&A',
    description: 'GPT-4o configured for internal documentation queries',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: false,
    status: 'Running',
    statusColor: '#3e8635',
    source: 'external',
    provider: 'openai'
  },
  {
    id: '9',
    name: 'Code Review Claude',
    displayName: 'Code Review Claude',
    modelId: 'claude-sonnet-4-20250514',
    slug: 'code-review-claude',
    internalEndpoint: '',
    externalEndpoint: 'https://api.anthropic.com/v1',
    externalToken: 'sk-ext-claude-code-review',
    llsStatus: 'registered',
    useCase: 'Code review',
    description: 'Claude Sonnet configured for automated code review',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: true,
    status: 'Running',
    statusColor: '#3e8635',
    source: 'external',
    provider: 'anthropic'
  },
  {
    id: '10',
    name: 'gemini-2.0-flash',
    displayName: 'Gemini Flash Experiment',
    modelId: 'gemini-2.0-flash',
    slug: 'gemini-flash-experiment',
    internalEndpoint: '',
    externalEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    externalToken: 'sk-ext-gemini-experiment',
    llsStatus: 'not-registered',
    useCase: 'Experimentation',
    description: 'Gemini 2.0 Flash endpoint — status cannot be verified.',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: false,
    status: 'Unknown',
    statusColor: '#6a6e73',
    source: 'external',
    provider: 'gemini'
  },
  {
    id: '11',
    name: 'Sales Analytics GPT-4o',
    displayName: 'Sales Analytics GPT-4o',
    modelId: 'gpt-4o',
    slug: 'sales-analytics-gpt-4o',
    internalEndpoint: '',
    externalEndpoint: 'https://api.openai.com/v1',
    externalToken: 'sk-ext-sales-gpt4o-def',
    llsStatus: 'registered',
    useCase: 'Sales forecasting',
    description: 'GPT-4o configured for sales pipeline analysis and forecasting',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: true,
    status: 'Running',
    statusColor: '#3e8635',
    source: 'external',
    provider: 'openai'
  },
  {
    id: '12',
    name: 'Content Moderation Claude',
    displayName: 'Content Moderation Claude',
    modelId: 'claude-sonnet-4-20250514',
    slug: 'content-moderation-claude',
    internalEndpoint: '',
    externalEndpoint: 'https://api.anthropic.com/v1',
    externalToken: 'sk-ext-claude-moderation',
    llsStatus: 'registered',
    useCase: 'Content moderation',
    description: 'Claude Sonnet configured for content safety and moderation',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: false,
    status: 'Stopped',
    statusColor: '#c9190b',
    source: 'external',
    provider: 'anthropic'
  },
  {
    id: '13',
    name: 'Gemini Flash Summarizer',
    displayName: 'Gemini Flash Summarizer',
    modelId: 'gemini-2.0-flash',
    slug: 'gemini-flash-summarizer',
    internalEndpoint: '',
    externalEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    externalToken: 'sk-ext-gemini-summarizer',
    llsStatus: 'registered',
    useCase: 'Summarization',
    description: 'Gemini 2.0 Flash configured for document summarization',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: false,
    status: 'Running',
    statusColor: '#3e8635',
    source: 'external',
    provider: 'gemini'
  },
  {
    id: 'maas-1',
    name: 'granite-3.1-8b-instruct',
    displayName: 'AI Gateway — Granite 3.1 8B',
    slug: 'granite-3-1-8b-instruct-maas',
    internalEndpoint: 'http://granite-3-1-8b.llama-stack.svc.cluster.local:8080/v1',
    externalEndpoint: 'https://api-gateway.demo.openshift.ai/v1/models/granite-3-1-8b-instruct',
    externalToken: 'maas-api-key-granite-001',
    llsStatus: 'registered',
    useCase: 'General chat, Summarization',
    description: 'IBM Granite 3.1 8B instruction-tuned model available via MaaS API gateway.',
    framework: 'vLLM',
    version: '3.1',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: false,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: 'maas-1b',
    name: 'granite-3.1-8b-instruct',
    displayName: 'AI Gateway — Granite 3.1 Compliance',
    slug: 'granite-3-1-8b-compliance-maas',
    internalEndpoint: 'http://granite-3-1-8b.llama-stack.svc.cluster.local:8080/v1',
    externalEndpoint: 'https://api-gateway.demo.openshift.ai/v1/models/granite-3-1-8b-instruct',
    externalToken: 'maas-api-key-granite-compliance-004',
    llsStatus: 'registered',
    useCase: 'Compliance review',
    description: 'IBM Granite 3.1 8B configured for regulatory compliance checks, available via MaaS API gateway.',
    framework: 'vLLM',
    version: '3.1',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: false,
    availability: 'available',
    status: 'Unknown',
    statusColor: '#6a6e73'
  },
  {
    id: 'maas-2',
    name: 'llama-3.3-70b-instruct',
    displayName: 'Llama 3.3 70B Instruct',
    slug: 'llama-3-3-70b-instruct-maas',
    internalEndpoint: 'http://llama-3-3-70b.llama-stack.svc.cluster.local:8080/v1',
    externalEndpoint: 'https://api-gateway.demo.openshift.ai/v1/models/llama-3-3-70b-instruct',
    externalToken: 'maas-api-key-llama70b-002',
    llsStatus: 'registered',
    useCase: 'Reasoning, Code generation',
    description: 'Meta Llama 3.3 70B parameter model for complex reasoning tasks, available via MaaS.',
    framework: 'vLLM',
    version: '3.3',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: true,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635'
  },
  {
    id: 'maas-3',
    name: 'mistral-large-latest',
    displayName: 'Mistral Large',
    slug: 'mistral-large-maas',
    internalEndpoint: 'http://mistral-large.llama-stack.svc.cluster.local:8080/v1',
    externalEndpoint: 'https://api-gateway.demo.openshift.ai/v1/models/mistral-large-latest',
    externalToken: 'maas-api-key-mistral-large-003',
    llsStatus: 'registered',
    useCase: 'Enterprise chat, Analysis',
    description: 'Mistral Large model for enterprise use cases, available via MaaS API gateway.',
    framework: 'vLLM',
    version: '1.0',
    logo: modelLogos['generic-model-icon'],
    hasReasoning: true,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635'
  }
];

// MCP servers are derived from the MCP catalog - single source of truth

// Function to format model deployment names
const formatModelName = (name: string): string => {
  return name
    .replace(/:[0-9]+(\.[0-9]+)*$/, '') // Remove version numbers like :1.4.0, :1.1, :9.1.1
    .replace(/-/g, ' ') // Remove dashes
    .replace(/\bgpt\b/gi, 'GPT') // Capitalize GPT
    .replace(/\bgranite\b/gi, 'Granite') // Capitalize Granite
    .replace(/\bmistral\b/gi, 'Mistral'); // Capitalize Mistral
};

const AvailableAIAssets: React.FunctionComponent = () => {
  useDocumentTitle('AI asset endpoints');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  const { userProfile: _userProfile } = useUserProfile();
  const mockMCPServers = React.useMemo(() => getMCPServersForAssetEndpoints(), []);
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);

  // Layout flags — hardcoded to nosource-ephemeral (3.4 design)
  const isV1Layout = false;
  const useSourceLabel = true;
  const useBadgeModelType = true;
  const useEndpointRows = true;
  const hideSourceColumn = true;

  const [isTokenModalOpen, setIsTokenModalOpen] = React.useState(false);
  const [selectedToken] = React.useState('');
  const [tokenType] = React.useState('');
  const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
  const [mcpSortBy, setMcpSortBy] = React.useState<string>('name');
  const [mcpSortDirection, setMcpSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [modelsSortBy, setModelsSortBy] = React.useState<string>('name');
  const [modelsSortDirection, setModelsSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [, setModelsWithEndpoints] = React.useState<Set<string>>(new Set());
  const [isAddingToPlayground, setIsAddingToPlayground] = React.useState(false);
  const [configProgress, setConfigProgress] = React.useState(0);
  const [currentConfigStep, setCurrentConfigStep] = React.useState(0);
  const [configSteps, setConfigSteps] = React.useState([
    { label: 'Verifying model details', completed: false },
    { label: 'Checking model compatibility', completed: false },
    { label: 'Validating your configuration', completed: false }
  ]);
  const [modelsAddedToPlayground, setModelsAddedToPlayground] = React.useState<Set<string>>(new Set());
  const [isCreateEndpointModalOpen, setIsCreateEndpointModalOpen] = React.useState(false);
  const [selectedModelForEndpoint, setSelectedModelForEndpoint] = React.useState<{id: string, name: string}>({id: '', name: ''});
  const [isCreatingEndpoint] = React.useState(false);
  const [creationProgress] = React.useState(0);
  
  // MaaS token generation state
  const [generatedTokens, setGeneratedTokens] = React.useState<Map<string, string>>(new Map());
  const [isGeneratingToken, setIsGeneratingToken] = React.useState<Set<string>>(new Set());
  
  // MaaS endpoint modal state
  const [maasEndpointModalOpen, setMaasEndpointModalOpen] = React.useState<string | null>(null);
  
  const [currentProgressMessage] = React.useState<string>('');
  const [isModelSelectionModalOpen, setIsModelSelectionModalOpen] = React.useState(false);
  const [selectedModelsForPlayground, setSelectedModelsForPlayground] = React.useState<Set<string>>(new Set());
  const [selectedVectorStoreForPlayground, setSelectedVectorStoreForPlayground] = React.useState<string | null>(null);
  const [modalInitialStep, setModalInitialStep] = React.useState<1 | 2>(1);
  const [collectionsRegisteredInPlayground, setCollectionsRegisteredInPlayground] = React.useState<Set<string>>(
    new Set(initialCollectionRows.filter(r => r.playgroundState === 'added').map(r => r.id))
  );
  const [isModalFilterDropdownOpen, setIsModalFilterDropdownOpen] = React.useState(false);
  const [modalFilterBy, setModalFilterBy] = React.useState('name');
  const [modalSearchText, setModalSearchText] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [mcpCurrentPage, setMcpCurrentPage] = React.useState(1);
  const [mcpPerPage, setMcpPerPage] = React.useState(10);
  const [openKebabMenus, setOpenKebabMenus] = React.useState<Set<string>>(new Set());
  
  // Availability info popover: icon gray by default, black on hover or when open (PatternFly guideline)
  const [isAvailabilityPopoverOpen, setAvailabilityPopoverOpen] = React.useState(false);
  const [isAvailabilityTriggerHovered, setAvailabilityTriggerHovered] = React.useState(false);

  // Create endpoint type picker (Version 3 / Ideal UXD)
  const [isEndpointTypePickerOpen, setIsEndpointTypePickerOpen] = React.useState(false);
  const [selectedEndpointType, setSelectedEndpointType] = React.useState<'namespace' | 'maas' | 'external'>('namespace');

  // Create external endpoint modal state
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = React.useState(false);
  const [addExternalModelType, setAddExternalModelType] = React.useState<ModelType>('inference');
  const [addExternalModelName, setAddExternalModelName] = React.useState('');
  const [addExternalModelAlias, setAddExternalModelAlias] = React.useState('');
  const [addExternalUrl, setAddExternalUrl] = React.useState('');
  const [addExternalToken, setAddExternalToken] = React.useState('');
  const [addExternalUseCase, setAddExternalUseCase] = React.useState('');
  const [addExternalEmbeddingDimension, setAddExternalEmbeddingDimension] = React.useState('');

  // Model source: 'deployed' (from project) or 'external' (name/URL/key)
  const [_modelSource, _setModelSource] = React.useState<'deployed' | 'external'>('deployed');
  const [_isModelSourceOpen, _setIsModelSourceOpen] = React.useState(false);
  // External endpoint form (when model source = external)
  const [_externalDisplayName, _setExternalDisplayName] = React.useState('');
  const [_externalEndpointUrl, _setExternalEndpointUrl] = React.useState('');
  const [_externalApiKey, _setExternalApiKey] = React.useState('');
  const [_isModelSourceSelectOpen, _setIsModelSourceSelectOpen] = React.useState(false);
  // User-added external models (appended to list; persisted in session). One default row to show how external endpoints look.
  const [userAddedExternalModels, setUserAddedExternalModels] = React.useState<ModelAsset[]>([
    {
      id: 'external-demo',
      name: 'Gemini 2.0 Flash',
      modelId: 'gemini-2.0-flash',
      slug: 'gemini-2.0-flash',
      internalEndpoint: '',
      externalEndpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
      externalToken: 'AIza••••••••••••',
      llsStatus: 'not-registered',
      useCase: 'General chat, Summarization',
      logo: modelLogos['generic-model-icon'],
      status: 'Running',
      statusColor: '#3e8635',
      source: 'external',
      modelType: 'inference',
      provider: 'gemini'
    },
    {
      id: 'external-embedding-1',
      name: 'Granite Embedding 125M',
      displayName: 'AI Embedding — Granite 125M',
      modelId: 'ibm-granite/granite-embedding-125m-english',
      slug: 'ibm-granite-granite-embedding-125m-english',
      internalEndpoint: '',
      externalEndpoint: 'https://inference.example.com/v1',
      externalToken: 'sk-••••••••••••',
      llsStatus: 'not-registered',
      useCase: 'RAG experimentation',
      logo: modelLogos['generic-model-icon'],
      status: 'Running',
      statusColor: '#3e8635',
      source: 'external',
      modelType: 'embedding',
      provider: 'openai'
    },
    {
      id: 'external-embedding-2',
      name: 'Nomic Embed Text v1.5',
      displayName: 'Nomic Embed Text v1.5',
      modelId: 'nomic-ai/nomic-embed-text-v1.5',
      slug: 'nomic-ai-nomic-embed-text-v1.5',
      internalEndpoint: '',
      externalEndpoint: 'https://inference.example.com/v1',
      externalToken: 'sk-••••••••••••',
      llsStatus: 'not-registered',
      useCase: 'Semantic search',
      logo: modelLogos['generic-model-icon'],
      status: 'Running',
      statusColor: '#3e8635',
      source: 'external',
      modelType: 'embedding',
      provider: 'openai'
    }
  ]);
  // Remove asset confirmation
  const [modelToRemove, setModelToRemove] = React.useState<ModelAsset | null>(null);
  const [isRemoveAssetModalOpen, setIsRemoveAssetModalOpen] = React.useState(false);
  // Track removed base (mock) model IDs so they disappear from the table
  const [removedModelIds, setRemovedModelIds] = React.useState<Set<string>>(new Set());

  const handleRemoveAsset = () => {
    if (!modelToRemove) return;
    if (modelToRemove.source === 'external') {
      // Remove from the user-added external models list
      setUserAddedExternalModels(prev => prev.filter(m => m.id !== modelToRemove.id));
    } else {
      // Hide the base/mock model by adding its ID to the removed set
      setRemovedModelIds(prev => {
        const next = new Set(prev);
        next.add(modelToRemove.id);
        return next;
      });
    }
    // Clean up any playground / MaaS references
    setModelsAddedToPlayground(prev => {
      const next = new Set(prev);
      next.delete(modelToRemove.id);
      return next;
    });
    setPublishedAsMaasModels(prev => {
      const next = new Set(prev);
      next.delete(modelToRemove.id);
      return next;
    });
    setIsRemoveAssetModalOpen(false);
    setModelToRemove(null);
  };

  const [showEmptyState, setShowEmptyState] = React.useState(false);
  const [selectedProjectForPlayground, setSelectedProjectForPlayground] = React.useState('Research Lab');
  const [_isProjectSelectorPopoverOpen, _setIsProjectSelectorPopoverOpen] = React.useState(false);
  const [_projectSelectorForPopoverOpen, _setProjectSelectorForPopoverOpen] = React.useState(false);
  const [_selectedProjectInPopover, _setSelectedProjectInPopover] = React.useState('AI Platform Team');
  const [emptyStateProjectSelectOpen, setEmptyStateProjectSelectOpen] = React.useState(false);

  // Initialize state from localStorage
  React.useEffect(() => {
    // Initialize modelsAddedToPlayground from localStorage
    const playgroundModels = JSON.parse(localStorage.getItem('playgroundModels') || '[]');
    const playgroundModelIds = playgroundModels.map((m: PlaygroundModel) => m.id);
    setModelsAddedToPlayground(new Set(playgroundModelIds));
    
    // Initialize modelsWithEndpoints from localStorage  
    const modelsWithEndpointsFromStorage = JSON.parse(localStorage.getItem('modelsWithEndpoints') || '[]');
    setModelsWithEndpoints(new Set(modelsWithEndpointsFromStorage));
  }, []);

  // Check for tab URL parameter to open specific tab (e.g. ?tab=mcp)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam === 'mcp') {
      setActiveTabKey(2);
    }
  }, [location.search]);

  // Check for configurePlayground URL parameter and auto-open modal
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('configurePlayground') === 'true') {
      // Auto-open the model selection modal
      setIsModelSelectionModalOpen(true);
      // Don't pre-select any model when opening from empty state
      setSelectedModelsForPlayground(new Set());
      // Removed addingModelId state
      // Clear the URL parameter
      urlParams.delete('configurePlayground');
      const newUrl = `${location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);
  const [modelsViewMode, setModelsViewMode] = React.useState<'cards' | 'table'>('table');
  const [mcpViewMode, setMcpViewMode] = React.useState<'cards' | 'table'>('table');
  const [selectedMcpServers, setSelectedMcpServers] = React.useState<Set<string>>(new Set());
  const [isToolsModalOpen, setIsToolsModalOpen] = React.useState(false);
  const [selectedServerForTools, setSelectedServerForTools] = React.useState<MCPServer | null>(null);
  const [_isDeploymentHelpPopoverOpen, _setIsDeploymentHelpPopoverOpen] = React.useState(false);

  // Publish as MaaS modal state
  const [isPublishMaasModalOpen, setIsPublishMaasModalOpen] = React.useState(false);
  const [publishMaasModelId, setPublishMaasModelId] = React.useState<string | null>(null);
  const [publishMaasCheckbox, setPublishMaasCheckbox] = React.useState(false);
  const [publishedAsMaasModels, setPublishedAsMaasModels] = React.useState<Set<string>>(new Set());

  const [modelsCardAnimations, setModelsCardAnimations] = React.useState<boolean[]>([]);
  const [mcpCardAnimations, setMcpCardAnimations] = React.useState<boolean[]>([]);

  // Vector Store state
  const [vectorStores, setVectorStores] = React.useState<VectorStore[]>(initialVectorStores);
  const [collectionRows, _setCollectionRows] = React.useState<VectorStoreCollectionRow[]>(initialCollectionRows);
  const [isCreateVSModalOpen, setIsCreateVSModalOpen] = React.useState(false);
  const [vsName, setVsName] = React.useState('');
  const [vsProvider, setVsProvider] = React.useState<VectorStoreProvider | ''>('');
  const [vsProviderOpen, setVsProviderOpen] = React.useState(false);
  const [vsModelId, setVsModelId] = React.useState('');
  const [vsModelOpen, setVsModelOpen] = React.useState(false);
  const [vsDistanceMetric, setVsDistanceMetric] = React.useState<DistanceMetric>('cosine');
  const [vsDistanceOpen, setVsDistanceOpen] = React.useState(false);
  const [vsEndpoint, setVsEndpoint] = React.useState('');
  const [vsCollection, setVsCollection] = React.useState('');
  const [vsSecretRef, setVsSecretRef] = React.useState('');
  const [vsDescription, setVsDescription] = React.useState('');
  const [vsOwner, setVsOwner] = React.useState('');
  const [vsDomain, setVsDomain] = React.useState('');

  const embeddingModels = React.useMemo(() => {
    const allModels = [...userAddedExternalModels, ...mockModels];
    return allModels.filter(m => m.modelType === 'embedding');
  }, [userAddedExternalModels]);

  const visibleVectorStores = vectorStores;

  const collectionOptionsForModal: CollectionOption[] = React.useMemo(
    () =>
      collectionRows.map(row => ({
        id: row.id,
        collectionName: row.vectorStoreName,
        subtitle: row.description || row.domain,
        vectorStoreName: row.providerType,
        provider: row.providerType.split('::')[1] || row.providerType,
        embeddingModel: row.linkedModelName || row.embeddingModel,
        embeddingModelConnected: row.embeddingModelConnected,
        embeddingDimension: row.embeddingDimension,
        isRegistered: collectionsRegisteredInPlayground.has(row.id),
        status: (row.embeddingModelConnected ? 'active' : 'error') as 'active' | 'error',
        owner: row.owner,
        domain: row.domain,
      })),
    [collectionRows, collectionsRegisteredInPlayground],
  );

  const handleCreateVectorStore = () => {
    if (!isCreateVSFormValid || !selectedVsModel || !vsAutoFilledDimensions || !vsProvider) return;
    const newStore: VectorStore = {
      id: `vs-${Date.now()}`,
      name: vsName.trim(),
      provider: vsProvider,
      status: 'Active',
      dimensions: vsAutoFilledDimensions,
      distanceMetric: vsDistanceMetric,
      linkedModelId: selectedVsModel.id,
      linkedModelName: selectedVsModel.name,
      linkedModelSlug: selectedVsModel.slug,
      embeddingModelId: selectedVsModel.modelId || selectedVsModel.name,
      endpoint: vsEndpoint.trim(),
      collection: vsCollection.trim(),
      secretRef: vsSecretRef.trim(),
      description: vsDescription.trim(),
      owner: vsOwner.trim(),
      domain: vsDomain.trim(),
      documentCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVectorStores(prev => [newStore, ...prev]);
    setIsCreateVSModalOpen(false);
    resetVSForm();
  };

  const [vsEndpointModalOpen, setVsEndpointModalOpen] = React.useState<string | null>(null);
  const vsEndpointModalStore = React.useMemo(
    () => vectorStores.find(s => s.id === vsEndpointModalOpen) ?? null,
    [vectorStores, vsEndpointModalOpen],
  );

  // Filter state for models
  const [modelsFilters, setModelsFilters] = React.useState<{
    name: string[];
    keyword: string[];
    useCase: string[];
    availability: string[];
    status: string[];
    type: string[];
  }>({
    name: [],
    keyword: [],
    useCase: [],
    availability: [],
    status: [],
    type: []
  });
  const [modelsFilterAttribute, setModelsFilterAttribute] = React.useState<'name' | 'keyword' | 'useCase' | 'availability' | 'status' | 'type'>('name');
  const [modelsFilterInput, setModelsFilterInput] = React.useState<string>('');
  const [modelsFilterDropdownOpen, setModelsFilterDropdownOpen] = React.useState<boolean>(false);
  const [availabilitySelectOpen, setAvailabilitySelectOpen] = React.useState<boolean>(false);
  const [statusSelectOpen, setStatusSelectOpen] = React.useState<boolean>(false);
  
  // MaaS models filter state (separate from regular models)
  const [maasFilters, setMaasFilters] = React.useState<{
    name: string[];
    keyword: string[];
    useCase: string[];
  }>({
    name: [],
    keyword: [],
    useCase: []
  });
  const [_maasFilterAttribute, _setMaasFilterAttribute] = React.useState<'name' | 'keyword' | 'useCase'>('name');
  const [_maasFilterInput, setMaasFilterInput] = React.useState<string>('');
  const [_maasFilterDropdownOpen, _setMaasFilterDropdownOpen] = React.useState<boolean>(false);
  const [_maasViewMode, setMaasViewMode] = React.useState<'cards' | 'table'>('table');
  const [maasPerPage, _setMaasPerPage] = React.useState(10);
  const [maasCurrentPage, setMaasCurrentPage] = React.useState(1);

  // Filter state for MCP servers
  const [mcpFilters, setMcpFilters] = React.useState<{
    name: string[];
    keyword: string[];
    description: string[];
  }>({
    name: [],
    keyword: [],
    description: []
  });
  const [mcpFilterAttribute, setMcpFilterAttribute] = React.useState<'name' | 'keyword' | 'description'>('name');
  const [mcpFilterInput, setMcpFilterInput] = React.useState<string>('');
  const [mcpFilterDropdownOpen, setMcpFilterDropdownOpen] = React.useState<boolean>(false);

  // Filter state for Vector Stores
  const [vsFilters, setVsFilters] = React.useState<{
    name: string[];
    provider: string[];
    status: string[];
    owner: string[];
  }>({ name: [], provider: [], status: [], owner: [] });
  const [vsFilterAttribute, setVsFilterAttribute] = React.useState<'name' | 'provider' | 'status' | 'owner'>('name');
  const [vsFilterInput, setVsFilterInput] = React.useState('');
  const [vsFilterDropdownOpen, setVsFilterDropdownOpen] = React.useState(false);
  const [vsProviderSelectOpen, setVsProviderSelectOpen] = React.useState(false);
  const [vsStatusSelectOpen, setVsStatusSelectOpen] = React.useState(false);
  const [vsCurrentPage, setVsCurrentPage] = React.useState(1);
  const [vsPerPage, setVsPerPage] = React.useState(10);

  const getFilteredCollectionRows = React.useCallback(() => {
    return collectionRows.filter(row => {
      const matchesName = vsFilters.name.length === 0 || vsFilters.name.some(f => {
        const search = f.toLowerCase();
        return row.vectorStoreName.toLowerCase().includes(search) ||
          row.description.toLowerCase().includes(search) ||
          (row.owner || '').toLowerCase().includes(search) ||
          (row.domain || '').toLowerCase().includes(search);
      });
      const providerShort = row.providerType.split('::')[1] || row.providerType;
      const matchesProvider = vsFilters.provider.length === 0 || vsFilters.provider.some(f => providerShort.toLowerCase().includes(f.toLowerCase()));
      const matchesStatus = vsFilters.status.length === 0 || vsFilters.status.includes(row.embeddingModelConnected ? 'Active' : 'Disabled');
      const matchesOwner = vsFilters.owner.length === 0 || vsFilters.owner.some(f => (row.owner || '').toLowerCase().includes(f.toLowerCase()));
      return matchesName && matchesProvider && matchesStatus && matchesOwner;
    });
  }, [collectionRows, vsFilters]);

  const getPaginatedCollectionRows = React.useCallback(() => {
    const filtered = getFilteredCollectionRows();
    const start = (vsCurrentPage - 1) * vsPerPage;
    return filtered.slice(start, start + vsPerPage);
  }, [getFilteredCollectionRows, vsCurrentPage, vsPerPage]);

  const selectedVsModel = React.useMemo(
    () => embeddingModels.find(m => m.id === vsModelId),
    [embeddingModels, vsModelId],
  );

  const vsAutoFilledDimensions = React.useMemo(() => {
    if (!selectedVsModel) return null;
    const modelKey = selectedVsModel.modelId || selectedVsModel.name;
    return embeddingModelDimensions[modelKey] ?? (selectedVsModel.embeddingDimension ? Number(selectedVsModel.embeddingDimension) : null);
  }, [selectedVsModel]);

  const isCreateVSFormValid = !!(vsName.trim() && vsProvider && vsModelId && vsAutoFilledDimensions && vsEndpoint.trim() && vsCollection.trim());

  const resetVSForm = () => {
    setVsName('');
    setVsProvider('');
    setVsModelId('');
    setVsDistanceMetric('cosine');
    setVsEndpoint('');
    setVsCollection('');
    setVsSecretRef('');
    setVsDescription('');
    setVsOwner('');
    setVsDomain('');
  };

  // Filter helper functions
  const addFilter = (category: 'models' | 'mcp' | 'maas' | 'vs', filterType: string, value: string) => {
    if (category === 'models') {
      setModelsFilters(prev => ({
        ...prev,
        [filterType]: [...prev[filterType as keyof typeof prev], value]
      }));
      setModelsFilterInput('');
      setCurrentPage(1);
    } else if (category === 'maas') {
      setMaasFilters(prev => ({
        ...prev,
        [filterType]: [...prev[filterType as keyof typeof prev], value]
      }));
      setMaasFilterInput('');
      setMaasCurrentPage(1);
    } else if (category === 'vs') {
      setVsFilters(prev => ({
        ...prev,
        [filterType]: [...prev[filterType as keyof typeof prev], value]
      }));
      setVsFilterInput('');
      setVsCurrentPage(1);
    } else {
      setMcpFilters(prev => ({
        ...prev,
        [filterType]: [...prev[filterType as keyof typeof prev], value]
      }));
      setMcpFilterInput('');
      setMcpCurrentPage(1);
    }
  };

  const removeFilter = (category: 'models' | 'mcp' | 'maas' | 'vs', filterType: string, value: string) => {
    if (category === 'models') {
      setModelsFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType as keyof typeof prev].filter(item => item !== value)
      }));
      setCurrentPage(1);
    } else if (category === 'maas') {
      setMaasFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType as keyof typeof prev].filter(item => item !== value)
      }));
      setMaasCurrentPage(1);
    } else if (category === 'vs') {
      setVsFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType as keyof typeof prev].filter(item => item !== value)
      }));
      setVsCurrentPage(1);
    } else {
      setMcpFilters(prev => ({
        ...prev,
        [filterType]: prev[filterType as keyof typeof prev].filter(item => item !== value)
      }));
      setMcpCurrentPage(1);
    }
  };

  const clearAllFilters = (category: 'models' | 'mcp' | 'maas' | 'vs') => {
    if (category === 'models') {
      setModelsFilters({ name: [], keyword: [], useCase: [], availability: [], status: [], type: [] });
      setModelsFilterInput('');
      setCurrentPage(1);
    } else if (category === 'maas') {
      setMaasFilters({ name: [], keyword: [], useCase: [] });
      setMaasFilterInput('');
      setMaasCurrentPage(1);
    } else if (category === 'vs') {
      setVsFilters({ name: [], provider: [], status: [], owner: [] });
      setVsFilterInput('');
      setVsCurrentPage(1);
    } else {
      setMcpFilters({ name: [], keyword: [], description: [] });
      setMcpFilterInput('');
      setMcpCurrentPage(1);
    }
  };

  const getFilterPlaceholder = (category: 'models' | 'mcp' | 'maas', attribute: string) => {
    if (category === 'models' || category === 'maas') {
      switch (attribute) {
        case 'name': return 'Filter by name';
        case 'keyword': return 'Filter by keyword';
        case 'useCase': return 'e.g. General chat, Code generation';
        case 'availability': return useSourceLabel ? 'e.g. MaaS, External' : 'e.g. Self-service, External';
        case 'status': return 'e.g. Ready, Error';
        case 'type': return 'Filter by type';
        default: return 'Filter';
      }
    } else {
      switch (attribute) {
        case 'name': return 'Filter by name';
        case 'keyword': return 'Filter by keyword...';
        case 'description': return 'Filter by description...';
        default: return 'Filter...';
      }
    }
  };

  // Helper functions for MaaS models - check availability field
  const isMaaSModel = (model: ModelAsset) => {
    return model.availability === 'available' || model.availability === 'pending';
  };

  /** Availability label for display: Self-service | Pending | External | Public route | Internal */
  const getAvailabilityLabel = (model: ModelAsset): string => {
    if (useSourceLabel) {
      if (model.availability === 'available' || model.availability === 'pending') return 'MaaS';
      if (model.source === 'external') return 'External';
      if (model.externalEndpoint) return 'Public route';
      return 'Internal';
    }
    if (model.availability === 'available') return 'Self-service';
    if (model.availability === 'pending') return 'Pending';
    if (model.source === 'external') return 'External';
    if (model.externalEndpoint) return 'Public route';
    return 'Internal';
  };

  const getStatusLabel = (model: ModelAsset): string => {
    return model.status;
  };

  /** Renders availability/source as plain text in the table/card. */
  const renderAvailabilityText = (model: ModelAsset) => {
    return getAvailabilityLabel(model);
  };

  const getMaaSModels = () => {
    return mockModels.filter(isMaaSModel);
  };

  const _getRegularModels = () => {
    return mockModels.filter(model => !isMaaSModel(model));
  };

  // Get all models (user-added external first, then base — excluding removed ones)
  const getAllModels = () => {
    return [...userAddedExternalModels, ...mockModels.filter(m => !removedModelIds.has(m.id))];
  };

  // Enhanced filter functions for all models (MaaS + regular combined)
  const filteredModels = getAllModels().filter(model => {
    // Note: Project selection does not filter models in the Models tab

    // Type filter - filter by MaaS, Project-scoped, or External
    const matchesTypeFilters = modelsFilters.type.length === 0 ||
      modelsFilters.type.some(typeFilter => {
        if (typeFilter.toLowerCase() === 'maas') return isMaaSModel(model);
        if (typeFilter.toLowerCase() === 'project') return !isMaaSModel(model) && model.source !== 'external';
        if (typeFilter.toLowerCase() === 'external') return model.source === 'external';
        return true;
      });

    // Name filters (search both display name and model ID)
    const matchesNameFilters = modelsFilters.name.length === 0 || 
      modelsFilters.name.some(filter => 
        model.name.toLowerCase().includes(filter.toLowerCase()) ||
        (model.modelId && model.modelId.toLowerCase().includes(filter.toLowerCase()))
      );

    // Keyword filters (search in name, description, and use case)
    const matchesKeywordFilters = modelsFilters.keyword.length === 0 || 
      modelsFilters.keyword.some(filter => 
        model.name.toLowerCase().includes(filter.toLowerCase()) ||
        (model.description && model.description.toLowerCase().includes(filter.toLowerCase())) ||
        model.useCase.toLowerCase().includes(filter.toLowerCase())
      );

    // Use case filters
    const matchesUseCaseFilters = modelsFilters.useCase.length === 0 || 
      modelsFilters.useCase.some(filter => 
        model.useCase.toLowerCase().includes(filter.toLowerCase())
      );

    // Availability filters
    const matchesAvailabilityFilters = modelsFilters.availability.length === 0 ||
      modelsFilters.availability.some(filter =>
        getAvailabilityLabel(model).toLowerCase().includes(filter.toLowerCase())
      );

    // Status filters
    const matchesStatusFilters = modelsFilters.status.length === 0 ||
      modelsFilters.status.some(filter =>
        model.status.toLowerCase().includes(filter.toLowerCase())
      );

    const matchesVariation = !isV1Layout || !isMaaSModel(model);
    return matchesVariation && matchesTypeFilters && matchesNameFilters && matchesKeywordFilters && matchesUseCaseFilters && matchesAvailabilityFilters && matchesStatusFilters;
  });

  // Enhanced filter functions for MaaS models
  const filteredMaaSModels = getMaaSModels().filter(model => {
    // Project-based filtering - MaaS models are available in all projects
    const matchesProjectFilter = true;

    // Name filters
    const matchesNameFilters = maasFilters.name.length === 0 || 
      maasFilters.name.some(filter => model.name.toLowerCase().includes(filter.toLowerCase()));

    // Keyword filters
    const matchesKeywordFilters = maasFilters.keyword.length === 0 || 
      maasFilters.keyword.some(filter => 
        model.name.toLowerCase().includes(filter.toLowerCase()) ||
        (model.description?.toLowerCase() || '').includes(filter.toLowerCase()) ||
        model.useCase.toLowerCase().includes(filter.toLowerCase())
      );

    // Use case filters
    const matchesUseCaseFilters = maasFilters.useCase.length === 0 || 
      maasFilters.useCase.some(filter => model.useCase.toLowerCase().includes(filter.toLowerCase()));

    return matchesProjectFilter && matchesNameFilters && matchesKeywordFilters && matchesUseCaseFilters;
  });

  const filteredMCPServers = mockMCPServers.filter(server => {
    // All MCP servers from the catalog are shown regardless of project
    const matchesProjectFilter = true;

    // Name filters
    const matchesNameFilters = mcpFilters.name.length === 0 || 
      mcpFilters.name.some(filter => 
        server.name.toLowerCase().includes(filter.toLowerCase())
      );

    // Keyword filters (search in name and description)
    const matchesKeywordFilters = mcpFilters.keyword.length === 0 || 
      mcpFilters.keyword.some(filter => 
        server.name.toLowerCase().includes(filter.toLowerCase()) ||
        server.description.toLowerCase().includes(filter.toLowerCase())
      );

    // Description filters
    const matchesDescriptionFilters = mcpFilters.description.length === 0 || 
      mcpFilters.description.some(filter => 
        server.description.toLowerCase().includes(filter.toLowerCase())
      );

    return matchesProjectFilter && matchesNameFilters && matchesKeywordFilters && matchesDescriptionFilters;
  });

  // Sorting functions for MCP servers
  const handleMcpSort = (column: string) => {
    if (mcpSortBy === column) {
      setMcpSortDirection(mcpSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setMcpSortBy(column);
      setMcpSortDirection('asc');
    }
  };



  const getSortedMcpServers = () => {
    return [...filteredMCPServers].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (mcpSortBy === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (mcpSortBy === 'status') {
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
      } else {
        return 0;
      }

      if (mcpSortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  // Sorting functions for Models
  const handleModelsSort = (column: string) => {
    if (modelsSortBy === column) {
      setModelsSortDirection(modelsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setModelsSortBy(column);
      setModelsSortDirection('asc');
    }
  };



  // Availability sort priority: External first, then Self-service, Pending, Public route, Internal
  const getSortedModels = () => {
    return [...filteredModels].sort((a, b) => {
      const aValue = (a.displayName || a.name).toLowerCase();
      const bValue = (b.displayName || b.name).toLowerCase();
      return modelsSortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  const getPaginatedModels = () => {
    const sortedModels = getSortedModels();
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return sortedModels.slice(start, end);
  };

  const expandModelsToEndpointRows = (models: ModelAsset[]): EndpointRow[] => {
    const rows: EndpointRow[] = [];
    for (const model of models) {
      const isMaaS = isMaaSModel(model);
      if (hideSourceColumn) {
        const kind: EndpointKind = isMaaS ? 'maas'
          : model.source === 'external' ? 'external'
          : model.externalEndpoint ? 'public-route'
          : 'internal';
        rows.push({
          model,
          endpointKind: kind,
          endpointUrl: model.externalEndpoint || model.internalEndpoint || '',
          rowKey: model.id,
        });
      } else {
        if (model.externalEndpoint) {
          const kind: EndpointKind = isMaaS ? 'maas'
            : model.source === 'external' ? 'external'
            : 'public-route';
          rows.push({
            model,
            endpointKind: kind,
            endpointUrl: model.externalEndpoint,
            rowKey: `${model.id}-ext`,
          });
        }
        if (model.internalEndpoint) {
          rows.push({
            model,
            endpointKind: 'internal',
            endpointUrl: model.internalEndpoint,
            rowKey: `${model.id}-int`,
          });
        }
        if (!model.externalEndpoint && !model.internalEndpoint) {
          rows.push({
            model,
            endpointKind: 'internal',
            endpointUrl: '',
            rowKey: model.id,
          });
        }
      }
    }
    return rows;
  };

  const getDualEndpointRows = (): EndpointRow[] => {
    const sortedModels = getSortedModels();
    const allRows = expandModelsToEndpointRows(sortedModels);
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return allRows.slice(start, end);
  };

  const getDualEndpointTotalCount = (): number => {
    return expandModelsToEndpointRows(getSortedModels()).length;
  };

  // Similar functions for MaaS models
  const getSortedMaaSModels = () => {
    return [...filteredMaaSModels].sort((a, b) => {
      if (modelsSortBy === 'name') {
        const aValue = a.name.toLowerCase();
        const bValue = b.name.toLowerCase();
        return modelsSortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  };

  const getPaginatedMaaSModels = () => {
    const sortedModels = getSortedMaaSModels();
    const start = (maasCurrentPage - 1) * maasPerPage;
    const end = start + maasPerPage;
    return sortedModels.slice(start, end);
  };

  const getPaginatedMcpServers = () => {
    const sortedServers = getSortedMcpServers();
    const start = (mcpCurrentPage - 1) * mcpPerPage;
    const end = start + mcpPerPage;
    return sortedServers.slice(start, end);
  };




  // Animation helper function
  const getCardAnimationStyle = (isVisible: boolean, index: number) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.4s ease-out ${index * 0.1}s, transform 0.4s ease-out ${index * 0.1}s`
  });

  // Handle models view mode change with animation
  const handleModelsViewModeChange = (mode: 'cards' | 'table') => {
    setModelsViewMode(mode);
    if (mode === 'cards') {
      const modelCount = getSortedModels().length;
      setModelsCardAnimations(new Array(modelCount).fill(false));
      setTimeout(() => {
        setModelsCardAnimations(new Array(modelCount).fill(true));
      }, 50);
    }
  };

  const _handleMaasViewModeChange = (mode: 'cards' | 'table') => {
    setMaasViewMode(mode);
  };

  // Handle MCP view mode change with animation
  const handleMcpViewModeChange = (mode: 'cards' | 'table') => {
    setMcpViewMode(mode);
    if (mode === 'cards') {
      const mcpCount = getSortedMcpServers().length;
      setMcpCardAnimations(new Array(mcpCount).fill(false));
      setTimeout(() => {
        setMcpCardAnimations(new Array(mcpCount).fill(true));
      }, 50);
    }
  };

  const handleCopyWithFeedback = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000); // Show "Copied" for 2 seconds
  };



  const _handleCreateEndpoint = (modelId: string, modelName: string) => {
    setSelectedModelForEndpoint({id: modelId, name: modelName});
    setIsCreateEndpointModalOpen(true);
  };

  const handleConfirmCreateEndpoint = () => {
    setIsCreateEndpointModalOpen(false);
    // Add the model to the set that have external endpoints created
    setModelsWithEndpoints(prev => new Set(Array.from(prev).concat(selectedModelForEndpoint.id)));
    
    // Store models with endpoints in localStorage for playground access
    const currentModelsWithEndpoints = JSON.parse(localStorage.getItem('modelsWithEndpoints') || '[]');
    if (!currentModelsWithEndpoints.includes(selectedModelForEndpoint.id)) {
      currentModelsWithEndpoints.push(selectedModelForEndpoint.id);
      localStorage.setItem('modelsWithEndpoints', JSON.stringify(currentModelsWithEndpoints));
    }
    
    setSelectedModelForEndpoint({id: '', name: ''});
  };

  const handleCancelCreateEndpoint = () => {
    setIsCreateEndpointModalOpen(false);
    setSelectedModelForEndpoint({id: '', name: ''});
  };

  const handleOpenAddAssetModal = () => {
    setIsAddAssetModalOpen(true);
  };

  const handleCloseAddAssetModal = () => {
    setIsAddAssetModalOpen(false);
    setAddExternalModelType('inference');
    setAddExternalModelName('');
    setAddExternalModelAlias('');
    setAddExternalUrl('');
    setAddExternalToken('');
    setAddExternalUseCase('');
    setAddExternalEmbeddingDimension('');
  };

  const handleAddAsset = () => {
    const id = `external-${Date.now()}`;
    const verbatimId = addExternalModelName.trim();
    const displayName = addExternalModelAlias.trim() || verbatimId;
    const slug = verbatimId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-/]/g, '');
    const newModel: ModelAsset = {
      id,
      name: verbatimId,
      displayName: displayName,
      modelId: verbatimId,
      slug: slug || id,
      internalEndpoint: '',
      externalEndpoint: addExternalUrl.trim(),
      externalToken: addExternalToken.trim(),
      llsStatus: 'not-registered',
      useCase: addExternalUseCase.trim() || (addExternalModelType === 'embedding' ? 'Embedding' : 'Inference'),
      logo: modelLogos['generic-model-icon'],
      status: 'Running',
      statusColor: '#3e8635',
      source: 'external',
      modelType: addExternalModelType,
      provider: addExternalUrl.includes('openai.com') ? 'openai'
        : addExternalUrl.includes('googleapis.com') ? 'gemini'
        : addExternalUrl.includes('anthropic.com') ? 'anthropic'
        : 'other',
      embeddingDimension: addExternalModelType === 'embedding' ? addExternalEmbeddingDimension.trim() : undefined
    };
    setUserAddedExternalModels(prev => [newModel, ...prev]);
    handleCloseAddAssetModal();
  };

  const existingDisplayNames = React.useMemo(() => {
    const allModels = [...mockModels, ...userAddedExternalModels];
    return allModels
      .map(m => m.displayName || m.name)
      .filter(Boolean);
  }, [userAddedExternalModels]);

  const isAddAssetFormValid = () => {
    const baseValid = !!(addExternalModelName.trim() && addExternalUrl.trim() && addExternalToken.trim());
    const aliasValid = hideSourceColumn ? !!addExternalModelAlias.trim() : true;
    const noDuplicate = !hideSourceColumn || !existingDisplayNames.some(
      name => name.toLowerCase() === addExternalModelAlias.trim().toLowerCase()
    );
    if (addExternalModelType === 'embedding') {
      return baseValid && aliasValid && noDuplicate && !!addExternalEmbeddingDimension.trim();
    }
    return baseValid && aliasValid && noDuplicate;
  };

  const handleGenerateToken = async (modelId: string) => {
    setIsGeneratingToken(prev => {
      const newSet = new Set(prev);
      newSet.add(modelId);
      return newSet;
    });
    
    // Simulate token generation
    setTimeout(() => {
      const newToken = `sk-maas-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
      setGeneratedTokens(prev => new Map(prev.set(modelId, newToken)));
      setIsGeneratingToken(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
    }, 1500);
  };

  const _handleClearGeneratedToken = (modelId: string) => {
    setGeneratedTokens(prev => {
      const newMap = new Map(prev);
      newMap.delete(modelId);
      return newMap;
    });
  };

  const handleAddToPlayground = (modelId: string) => {
    console.log('Add to playground clicked for model ID:', modelId);
    const model = getAllModels().find(m => m.id === modelId);
    console.log('Model details:', model?.name);
    console.log('Current modelsAddedToPlayground:', Array.from(modelsAddedToPlayground));
    
    // Show empty state only if Research Lab is selected
    if (selectedProject === 'Research Lab') {
      setShowEmptyState(true);
      setSelectedModelsForPlayground(new Set([modelId]));
      setIsModelSelectionModalOpen(true);
      return;
    }
    
    // Removed addingModelId state
    // Pre-select the clicked model
    setSelectedModelsForPlayground(new Set([modelId]));
    // Show model selection modal first (without empty state)
    setShowEmptyState(false);
    setIsModelSelectionModalOpen(true);
  };

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

  const handleConfigurePlayground = () => {
    // Close model selection modal and open status modal
    setIsModelSelectionModalOpen(false);
    setIsAddingToPlayground(true);
    setConfigProgress(0);
    setCurrentConfigStep(0);
    
    // Get selected model names for the configuration steps
    const selectedModelNames = Array.from(selectedModelsForPlayground)
      .map(id => mockModels.find(m => m.id === id)?.name)
      .filter(name => name)
      .join(', ');
    
    // Update configuration steps with model names
    setConfigSteps([
      { label: `Verifying ${selectedModelNames} details`, completed: false },
      { label: `Checking ${selectedModelNames} compatibility`, completed: false },
      { label: 'Validating your configuration', completed: false }
    ]);
    
    // Start the auto-configuration process
    startAutoConfiguration();
  };

  const handleCancelModelSelection = () => {
    setIsModelSelectionModalOpen(false);
    setSelectedModelsForPlayground(new Set());
    setSelectedVectorStoreForPlayground(null);
    setModalInitialStep(1);
    setShowEmptyState(false);
    // Reset search when closing modal
    setModalSearchText('');
    setModalFilterBy('name');
  };

  // Filter models for the modal based on search text and filter type
  const getFilteredModalModels = () => {
    // Include all models that are not yet registered in the playground (external + not-registered base models)
    let filteredModels = getAllModels().filter(m => {
      return m.source === 'external' || m.llsStatus === 'not-registered';
    });

    // Apply search filter
    if (modalSearchText.trim()) {
      const searchLower = modalSearchText.toLowerCase();
      filteredModels = filteredModels.filter(model => {
        if (modalFilterBy === 'name') {
          return model.name.toLowerCase().includes(searchLower) ||
            (model.modelId && model.modelId.toLowerCase().includes(searchLower));
        } else if (modalFilterBy === 'useCase') {
          return model.useCase.toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    // Map to match Model interface with displayName for consistent rendering
    return filteredModels.map(m => ({
      id: m.id,
      name: m.modelId || m.name,
      displayName: m.displayName || (m.source === 'external' ? m.name : formatModelName(m.name)),
      availability: m.availability || 'Ready',
      useCase: m.useCase,
      status: (m.status === 'active' || m.status === 'error' ? m.status : undefined) as 'active' | 'error' | undefined,
      modelType: m.modelType
    }));
  };

  const startAutoConfiguration = () => {
    const steps = [
      { delay: 1000, progress: 33, message: 'Registering your deployed models' },
      { delay: 1500, progress: 66, message: 'Creating sample RAG vectorDB' },
      { delay: 1000, progress: 100, message: 'Validating your configuration' }
    ];

    let currentStep = 0;
    
    const processStep = () => {
      if (currentStep < steps.length) {
        setCurrentConfigStep(currentStep);
        
        setTimeout(() => {
          setConfigProgress(steps[currentStep].progress);
          currentStep++;
          
          if (currentStep < steps.length) {
            setTimeout(processStep, steps[currentStep - 1].delay);
          } else {
            // Configuration complete
            setTimeout(() => {
              handleConfirmAddToPlayground();
            }, 1000);
          }
        }, 500);
      }
    };
    
    processStep();
  };

  const handleConfirmAddToPlayground = () => {
    // Complete the addition
    setIsAddingToPlayground(false);
    
    // Add ALL selected models to the playground state, not just the initial one
    const selectedModelIds = Array.from(selectedModelsForPlayground);
    setModelsAddedToPlayground(prev => new Set([...Array.from(prev), ...selectedModelIds]));
    
    // Store added models in localStorage for playground access
    const currentPlaygroundModels = JSON.parse(localStorage.getItem('playgroundModels') || '[]');
    
    selectedModelIds.forEach(modelId => {
      const modelToAdd = getAllModels().find(m => m.id === modelId);
      if (modelToAdd && !currentPlaygroundModels.some((m: PlaygroundModel) => m.id === modelToAdd.id)) {
        const endpoint = modelToAdd.source === 'external' ? modelToAdd.externalEndpoint : (modelToAdd.externalEndpoint || modelToAdd.internalEndpoint);
        const token = modelToAdd.source === 'external' ? modelToAdd.externalToken : (modelToAdd.externalToken || modelToAdd.internalToken);
        currentPlaygroundModels.push({
          id: modelToAdd.id,
          name: modelToAdd.name,
          slug: modelToAdd.slug,
          endpoint: endpoint || modelToAdd.internalEndpoint,
          token: token || modelToAdd.internalToken
        });
      }
    });
    
    localStorage.setItem('playgroundModels', JSON.stringify(currentPlaygroundModels));

    // Persist selected collections to localStorage for playground access
    const selectedCollectionIds = Array.from(collectionsRegisteredInPlayground);
    const collectionsToStore = collectionRows
      .filter(r => selectedCollectionIds.includes(r.id))
      .map(r => ({
        id: r.id,
        collectionName: r.vectorStoreName,
        description: r.description,
        vectorStoreName: r.vectorStoreName,
        provider: r.providerType.split('::')[1] || r.providerType,
        embeddingModel: r.linkedModelName || r.embeddingModel,
        isInline: false,
      }));
    const existingCollections = JSON.parse(localStorage.getItem('playgroundCollections') || '[]');
    const existingIds = new Set(existingCollections.map((c: any) => c.id));
    const merged = [...existingCollections, ...collectionsToStore.filter(c => !existingIds.has(c.id))];
    localStorage.setItem('playgroundCollections', JSON.stringify(merged));

    // Removed addingModelId state
    setSelectedModelsForPlayground(new Set());
    setConfigProgress(0);
    setCurrentConfigStep(0);

    // Navigate to the playground
    navigate('/gen-ai-studio/playground');
  };

  const handleCancelAddToPlayground = () => {
    setIsAddingToPlayground(false);
    // Removed addingModelId state
    setConfigProgress(0);
    setCurrentConfigStep(0);
  };



  const handlePlayground = (assetId: string, assetType: 'model' | 'mcp', _skipPopover: boolean = false) => {
    // Navigate to AI Playground with pre-selected asset
    if (assetType === 'model') {
      const model = getAllModels().find(m => m.id === assetId);
      if (model) {
        // Add model to playground models if it's granite, gpt, or Pixtral (non-default models), or any external model
        const isTargetDeployedModel = model.name === 'granite-7b-code:1.1' || model.name === 'gpt-oss-120b-FP8-Dynamic:1.4.0' || model.name === 'Pixtral-Large-Instruct-2411-hf-quantized.w8a8';
        if (isTargetDeployedModel || model.source === 'external') {
          const currentPlaygroundModels = JSON.parse(localStorage.getItem('playgroundModels') || '[]');
          const endpoint = model.source === 'external' ? model.externalEndpoint : (model.externalEndpoint || model.internalEndpoint);
          const token = model.source === 'external' ? model.externalToken : (model.externalToken || model.internalToken);
          // Check if model is already in the list
          if (!currentPlaygroundModels.some((m: PlaygroundModel) => m.id === model.id)) {
            currentPlaygroundModels.push({
              id: model.id,
              name: model.name,
              slug: model.slug,
              endpoint: endpoint || model.internalEndpoint,
              token: token || model.internalToken
            });
            localStorage.setItem('playgroundModels', JSON.stringify(currentPlaygroundModels));
          }
        }
        
        const navEndpoint = model.source === 'external' ? model.externalEndpoint : (model.externalEndpoint || model.internalEndpoint);
        const navToken = model.source === 'external' ? model.externalToken : (model.externalToken || model.internalToken);
        navigate('/gen-ai-studio/playground', { 
          state: { 
            preselectedModel: model.name,
            modelEndpoint: navEndpoint,
            modelToken: navToken
          }
        });
      }
    } else {
      const server = mockMCPServers.find(s => s.id === assetId);
      if (server) {
        // Get all currently selected MCP servers
        const selectedServerNames = Array.from(selectedMcpServers).map(serverId => {
          const selectedServer = mockMCPServers.find(s => s.id === serverId);
          return selectedServer?.name;
        }).filter(Boolean) as string[];
        
        // If no servers are selected, just preselect the clicked server
        // If servers are selected, include all selected servers
        const serversToPreselect = selectedServerNames.length > 0 
          ? selectedServerNames.includes(server.name) 
            ? selectedServerNames // Clicked server is already selected, use all selected
            : [...selectedServerNames, server.name] // Add clicked server to selected ones
          : [server.name]; // No servers selected, just use clicked server
        
        navigate('/gen-ai-studio/playground', { 
          state: { 
            preselectedMCPs: serversToPreselect
          }
        });
      }
    }
  };



  // MCP Server selection handlers
  const handleMcpServerSelect = (serverId: string, isSelected: boolean) => {
    setSelectedMcpServers(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(serverId);
      } else {
        newSet.delete(serverId);
      }
      return newSet;
    });
  };

  const handleMcpSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allServerIds = getSortedMcpServers().map(server => server.id);
      setSelectedMcpServers(new Set(allServerIds));
    } else {
      setSelectedMcpServers(new Set());
    }
  };

  // Bulk selection function
  const getBulkSelectCheckboxState = () => {
    const totalServers = getSortedMcpServers().length;
    const selectedCount = selectedMcpServers.size;
    
    if (selectedCount === 0) return { checked: false };
    if (selectedCount === totalServers) return { checked: true };
    return { checked: false }; // Partial selection - treat as unchecked for simplicity
  };

  // Tools helper functions
  const getServerTools = (serverSlug: string) => {
    const serverToolsData: Record<string, Array<{name: string, description: string}>> = {
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

  const getEnabledToolsCount = (serverSlug: string) => {
    const tools = getServerTools(serverSlug);
    return tools.length; // For now, assume all tools are enabled
  };

  const handleViewTools = (server: MCPServer) => {
    setSelectedServerForTools(server);
    setIsToolsModalOpen(true);
  };



  const renderStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'available' || statusLower === 'running') {
      return (
        <Label variant="outline" status="success">
          Ready
        </Label>
      );
    } else if (statusLower === 'unavailable' || statusLower === 'stopped' || statusLower === 'error') {
      return (
        <Label variant="outline" status="danger">
          Error
        </Label>
      );
    } else if (statusLower === 'unknown') {
      return (
        <Label variant="outline" color="grey" icon={<OutlinedQuestionCircleIcon />}>
          Unknown
        </Label>
      );
    } else {
      return (
        <Label variant="outline" status="success">
          Ready
        </Label>
      );
    }
  };

  const renderModelsTable = () => {
    if (getSortedModels().length === 0) {
      return (
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            <SearchIcon className="pf-v5-u-mr-sm" />
            No models found
          </Title>
          <EmptyStateBody>
            {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0 || modelsFilters.availability.length > 0 || modelsFilters.status.length > 0 || modelsFilters.type.length > 0) ? 
              'No models match your filter criteria.' :
              'No models are currently available in this project.'
            }
          </EmptyStateBody>
          {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0 || modelsFilters.availability.length > 0 || modelsFilters.status.length > 0 || modelsFilters.type.length > 0) && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={() => clearAllFilters('models')}>
                  Clear filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      );
    }

    return (
      <>
        <Table aria-label="Models table" variant="compact">
          <Thead>
            <Tr>

              <Th 
                width={20}
                sort={{
                  sortBy: { index: 1, direction: modelsSortBy === 'name' ? modelsSortDirection : undefined },
                  onSort: () => handleModelsSort('name'),
                  columnIndex: 1
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  Model
                  <Popover
                    aria-label="Model column information"
                    position="right"
                    headerContent="Model"
                    bodyContent={
                      <div>
                        <strong>Display name</strong> — friendly name shown across the UI. For endpoints you created, this is the name you provided.<br /><br />
                        <strong>Model ID</strong> — exact identifier used in API calls. For endpoints you created, this must match the provider&apos;s model ID.
                      </div>
                    }
                    id="models-name-info-popover"
                  >
                    <Button
                      variant="plain"
                      aria-label="Model column information"
                      style={{ padding: '2px' }}
                      id="models-name-info-button"
                    >
                      <OutlinedQuestionCircleIcon
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--pf-t--global--icon--color--subtle)'
                        }}
                      />
                    </Button>
                  </Popover>
                </span>
              </Th>
              {useEndpointRows && !hideSourceColumn && <Th width={15}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  Source
                  <Popover
                    aria-label="Source information"
                    position="bottom"
                    headerContent="Endpoint source types"
                    hasAutoWidth
                    bodyContent={
                      <div style={{ width: '380px' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                          <tbody>
                            {!isV1Layout && (
                            <tr>
                              <td style={{ verticalAlign: 'top', paddingRight: '0.75rem', whiteSpace: 'nowrap' }}><Label color="blue" id="dual-source-label-maas">MaaS</Label></td>
                              <td style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Model as a Service — managed by an admin and shared across projects via the API gateway.</td>
                            </tr>
                            )}
                            <tr>
                              <td style={{ verticalAlign: 'top', paddingRight: '0.75rem', whiteSpace: 'nowrap' }}><Label color="teal" id="dual-source-label-external">External</Label></td>
                              <td style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Hosted outside your cluster — a third-party provider, another cluster, or a shared namespace endpoint.</td>
                            </tr>
                            <tr>
                              <td style={{ verticalAlign: 'top', paddingRight: '0.75rem', whiteSpace: 'nowrap' }}><Label color="purple" id="dual-source-label-public-route">Public route</Label></td>
                              <td style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Running in your cluster and accessible externally via a public route URL.</td>
                            </tr>
                            <tr>
                              <td style={{ verticalAlign: 'top', paddingRight: '0.75rem', whiteSpace: 'nowrap' }}><Label color="grey" id="dual-source-label-internal">Internal</Label></td>
                              <td style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Running in your cluster, only accessible from within.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    }
                    id="dual-source-info-popover"
                  >
                    <Button
                      variant="plain"
                      aria-label="Source information"
                      style={{ padding: '2px' }}
                      id="dual-source-info-button"
                      onMouseEnter={() => setAvailabilityTriggerHovered(true)}
                      onMouseLeave={() => setAvailabilityTriggerHovered(false)}
                    >
                      <OutlinedQuestionCircleIcon
                        style={{
                          fontSize: '14px',
                          color: isAvailabilityPopoverOpen || isAvailabilityTriggerHovered
                            ? 'var(--pf-v5-global--Color--100)'
                            : '#6A6E73'
                        }}
                      />
                    </Button>
                  </Popover>
                </span>
              </Th>}
              {!useEndpointRows && <Th width={15}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  {useSourceLabel ? 'Source' : 'Availability'}
                  <Popover
                    aria-label={useSourceLabel ? 'Source information' : 'Availability information'}
                    position="bottom"
                    headerContent={useSourceLabel ? 'Model source types' : 'Model availability states'}
                    hasAutoWidth
                    onShow={() => setAvailabilityPopoverOpen(true)}
                    onHide={() => setAvailabilityPopoverOpen(false)}
                    bodyContent={
                      useSourceLabel ? (
                        <div style={{ width: '380px' }}>
                          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                            <tbody>
                              {!isV1Layout && (
                              <tr>
                                <td style={{ verticalAlign: 'top', paddingRight: '0.75rem', whiteSpace: 'nowrap' }}><Label color="blue" id="source-label-maas">MaaS</Label></td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Model as a Service — managed by an admin and shared across projects via the API gateway.</td>
                              </tr>
                              )}
                              <tr>
                                <td style={{ verticalAlign: 'top', paddingRight: '0.75rem', whiteSpace: 'nowrap' }}><Label color="teal" id="source-label-external">External</Label></td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Hosted outside your cluster — a third-party provider, another cluster, or a shared namespace endpoint.</td>
                              </tr>
                              <tr>
                                <td style={{ verticalAlign: 'top', paddingRight: '0.75rem', whiteSpace: 'nowrap' }}><Label color="purple" id="source-label-public-route">Public route</Label></td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Running in your cluster and accessible externally via a public route URL.</td>
                              </tr>
                              <tr>
                                <td style={{ verticalAlign: 'top', paddingRight: '0.75rem', whiteSpace: 'nowrap' }}><Label color="grey" id="source-label-internal">Internal</Label></td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Running in your cluster, only accessible from within.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                      <div style={{ minWidth: 'min(380px, 90vw)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '0.75rem' }}>
                          {isV1Layout
                            ? 'This table shows two types of model endpoints:'
                            : 'This table shows three types of model endpoints:'}
                        </p>
                        <div style={{ border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: '8px', overflow: 'hidden' }}>
                          {!isV1Layout && (
                            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--pf-t--global--border--color--default)', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>MaaS models</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '0.625rem' }}>Managed by an admin and shared across projects via the API gateway.</div>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <Label color="blue" id="availability-label-self-service" style={{ flexShrink: 0 }}>Self-service</Label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Ready to use. No additional setup needed.</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <Label color="orange" id="availability-label-pending" style={{ flexShrink: 0 }}>Pending</Label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Awaiting administrator approval.</span>
                              </div>
                            </div>
                          )}
                          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--pf-t--global--border--color--default)', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>External models</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '0.625rem' }}>Third-party endpoints added by users in this project (e.g. OpenAI, Google).</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                              <Label color="teal" id="availability-label-external" style={{ flexShrink: 0 }}>External</Label>
                              <span style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Hosted by a third-party provider.</span>
                            </div>
                          </div>
                          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Deployed models</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '0.625rem' }}>Running inside your cluster via model serving. May or may not be accessible externally.</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.375rem' }}>
                              <Label color="purple" id="availability-label-public-route" style={{ flexShrink: 0 }}>Public route</Label>
                              <span style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Accessible from outside via a URL.</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                              <Label color="grey" id="availability-label-internal" style={{ flexShrink: 0 }}>Internal</Label>
                              <span style={{ fontSize: '0.8rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Only accessible from inside the cluster.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      )
                    }
                    id="models-availability-info-popover"
                  >
                    <Button
                      variant="plain"
                      aria-label={useSourceLabel ? 'Source information' : 'Availability information'}
                      style={{ padding: '2px' }}
                      id="models-availability-info-button"
                      onMouseEnter={() => setAvailabilityTriggerHovered(true)}
                      onMouseLeave={() => setAvailabilityTriggerHovered(false)}
                    >
                      <OutlinedQuestionCircleIcon
                        style={{
                          fontSize: '14px',
                          color: isAvailabilityPopoverOpen || isAvailabilityTriggerHovered
                            ? 'var(--pf-v5-global--Color--100)'
                            : '#6A6E73'
                        }}
                      />
                    </Button>
                  </Popover>
                </span>
              </Th>}
              {!useBadgeModelType && <Th width={10}>Model type</Th>}
              <Th width={10}>Use case</Th>
              <Th width={10}>Status</Th>
              <Th width={10}>Endpoints</Th>
              <Th width={15}>Playground</Th>
              <Th width={10} screenReaderText="Actions"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {(useEndpointRows ? getDualEndpointRows() : getPaginatedModels().map((m): EndpointRow => ({ model: m, endpointKind: 'external', endpointUrl: m.externalEndpoint || m.internalEndpoint, rowKey: m.id }))).map(({ model, endpointKind, endpointUrl: _endpointUrl, rowKey }) => (
              <Tr key={rowKey}>
                <Td dataLabel="Model name" modifier="truncate">
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }} id={`model-name-${rowKey}`}>
                      {hideSourceColumn
                        ? (model.displayName || `${(model.modelId || model.name).split('/').pop()}-${rowKey.replace(/.*-/, '')}`)
                        : (model.displayName || (model.source === 'external' ? model.name : formatModelName(model.name)))}
                    </span>
                    {useBadgeModelType && model.modelType === 'embedding' && (
                      <Label color="blue" isCompact id={`model-badge-embedding-${rowKey}`}>Embedding</Label>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--pf-t--global--font--family--mono)',
                      fontSize: '0.75rem',
                      color: 'var(--pf-t--global--text--color--subtle)',
                      marginTop: '0.125rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {model.modelId || model.name}
                  </div>
                </Td>
                {useEndpointRows && !hideSourceColumn && (
                  <Td dataLabel="Source" id={`models-availability-${rowKey}`}>
                    <Label
                      isCompact
                      color={endpointKind === 'maas' ? 'blue' : endpointKind === 'external' ? 'teal' : endpointKind === 'public-route' ? 'purple' : 'grey'}
                      id={`endpoint-source-label-${rowKey}`}
                    >
                      {{ maas: 'MaaS', external: 'External', 'public-route': 'Public route', internal: 'Internal' }[endpointKind]}
                    </Label>
                  </Td>
                )}
                {!useEndpointRows && (
                  <Td dataLabel={useSourceLabel ? 'Source' : 'Availability'} id={`models-availability-${rowKey}`}>
                    {publishedAsMaasModels.has(model.id) && !useSourceLabel ? (
                      <Popover
                        aria-label="Pending availability information"
                        headerContent="Pending administrator action"
                        bodyContent={
                          <div>
                            <p style={{ marginBottom: '0.5rem' }}>
                              This model has been published as a MaaS model and is awaiting administrator action.
                            </p>
                            <p>
                              A cluster administrator needs to add this model to a subscription to make it fully available through the API gateway to all users.
                            </p>
                          </div>
                        }
                        id={`pending-availability-popover-${rowKey}`}
                      >
                        <span
                          id={`pending-availability-label-${rowKey}`}
                          style={{ cursor: 'pointer', textDecoration: 'underline dashed', textUnderlineOffset: '3px' }}
                        >
                          Pending
                        </span>
                      </Popover>
                    ) : (
                      renderAvailabilityText(model)
                    )}
                  </Td>
                )}
                {!useBadgeModelType && (
                  <Td dataLabel="Model type" id={`model-type-${rowKey}`}>
                    {model.modelType === 'embedding' ? 'Embedding' : 'Inferencing'}
                  </Td>
                )}
                <Td dataLabel="Use case">{model.useCase}</Td>
                <Td dataLabel="Status">
                  {useEndpointRows && endpointKind === 'internal'
                    ? renderStatusIcon('Running')
                    : renderStatusIcon(getStatusLabel(model))}
                </Td>
                <Td dataLabel="Endpoints">
                  <Button
                    variant="link"
                    onClick={() => setMaasEndpointModalOpen(model.id)}
                    id={`models-table-view-endpoint-${rowKey}`}
                  >
                    View
                  </Button>
                  <MaaSEndpointModal
                    isOpen={maasEndpointModalOpen === model.id}
                    onClose={() => setMaasEndpointModalOpen(null)}
                    model={model}
                    copiedItems={copiedItems}
                    handleCopyWithFeedback={handleCopyWithFeedback}
                    generatedTokens={generatedTokens}
                    isGeneratingToken={isGeneratingToken}
                    onGenerateToken={handleGenerateToken}
                    isMaaS={isMaaSModel(model)}
                  />
                </Td>
                <Td>
                    {model.modelType === 'embedding' ? (
                      <Button
                        variant="link"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTabKey(3);
                        }}
                        id={`model-see-vector-stores-${rowKey}`}
                      >
                        See vector stores
                      </Button>
                    ) : (
                    <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                      {model.name === 'mistral-7b-instruct:9.1.1' && selectedProject === 'AI Platform Team' && (
                        <FlexItem>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayground(model.id, 'model');
                            }}
                          >
                            Try in playground
                          </Button>
                        </FlexItem>
                      )}
                      {!(model.name === 'mistral-7b-instruct:9.1.1' && selectedProject === 'AI Platform Team') && (
                        <FlexItem>
                          <Button
                            variant="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToPlayground(model.id);
                            }}
                          >
                            <PlusCircleIcon style={{ marginRight: '0.25rem' }} />
                            Add to playground
                          </Button>
                        </FlexItem>
                      )}
                    </Flex>
                    )}
                  </Td>
                <Td 
                  dataLabel="Actions" 
                  style={{ textAlign: 'right' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Dropdown
                    id={`model-actions-${rowKey}`}
                    isOpen={openKebabMenus.has(`model-${rowKey}`)}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setOpenKebabMenus(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(`model-${rowKey}`);
                          return newSet;
                        });
                      }
                    }}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        id={`model-menu-toggle-${rowKey}`}
                        ref={toggleRef}
                        onClick={() => {
                          setOpenKebabMenus(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(`model-${rowKey}`)) {
                              newSet.delete(`model-${rowKey}`);
                            } else {
                              newSet.add(`model-${rowKey}`);
                            }
                            return newSet;
                          });
                        }}
                        variant="plain"
                        aria-label={`Actions for ${model.name}`}
                        isExpanded={openKebabMenus.has(`model-${rowKey}`)}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {!isMaaSModel(model) && !publishedAsMaasModels.has(model.id) && model.source !== 'external' && (
                        <DropdownItem
                          id={`publish-maas-${rowKey}`}
                          key="publish-maas"
                          onClick={() => {
                            setPublishMaasModelId(model.id);
                            setPublishMaasCheckbox(false);
                            setIsPublishMaasModalOpen(true);
                            setOpenKebabMenus(new Set());
                          }}
                        >
                          Publish as MaaS endpoint
                        </DropdownItem>
                      )}
                      <DropdownItem
                        id={`remove-asset-${rowKey}`}
                        key="remove"
                        isDanger
                        onClick={() => {
                          setOpenKebabMenus(new Set());
                          setModelToRemove(model);
                          setIsRemoveAssetModalOpen(true);
                        }}
                      >
                        Remove asset
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Pagination
          itemCount={useEndpointRows ? getDualEndpointTotalCount() : getSortedModels().length}
          perPage={perPage}
          page={currentPage}
          onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
          onPerPageSelect={(_event, newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
          variant="bottom"
          perPageOptions={[
            { title: '5', value: 5 },
            { title: '10', value: 10 },
            { title: '20', value: 20 },
            { title: '50', value: 50 }
          ]}
        />
      </>
    );
  };

  const renderMCPTable = () => {
    if (getSortedMcpServers().length === 0) {
      return (
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            <SearchIcon className="pf-v5-u-mr-sm" />
            No MCP servers found
          </Title>
          <EmptyStateBody>
            {(mcpFilters.name.length > 0 || mcpFilters.keyword.length > 0 || mcpFilters.description.length > 0) ? 
              'No MCP servers match your filter criteria.' :
              'No MCP servers are currently available in this project.'
            }
          </EmptyStateBody>
          {(mcpFilters.name.length > 0 || mcpFilters.keyword.length > 0 || mcpFilters.description.length > 0) && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={() => clearAllFilters('mcp')}>
                  Clear filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      );
    }

    return (
      <>
        <Table aria-label="MCP Servers table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <Thead>
          <Tr>
            <Th style={{ width: '1%', padding: '0.5rem 0.25rem' }}></Th>
            <Th 
              style={{ width: 'auto' }}
              sort={{
                sortBy: { index: 0, direction: mcpSortBy === 'name' ? mcpSortDirection : undefined },
                onSort: () => handleMcpSort('name'),
                columnIndex: 0
              }}
            >
              Name
            </Th>
            <Th 
              width={10}
              sort={{
                sortBy: { index: 1, direction: mcpSortBy === 'status' ? mcpSortDirection : undefined },
                onSort: () => handleMcpSort('status'),
                columnIndex: 1
              }}
            >
              Status
            </Th>
            <Th width={15}>Endpoint</Th>
            <Th width={10}>Tools</Th>
            <Th width={10}>Version</Th>
          </Tr>
        </Thead>
        <Tbody>
          {getPaginatedMcpServers().map((server) => (
            <Tr 
              key={server.id}
            >
              <Td style={{ width: '1%', padding: '0.5rem 0.25rem', verticalAlign: 'top' }}>
                <div style={{ paddingTop: '0.5rem' }}>
                  <Checkbox
                    isChecked={selectedMcpServers.has(server.id)}
                    onChange={(_event, checked) => handleMcpServerSelect(server.id, checked)}
                    aria-label={`Select ${server.name}`}
                    id={`select-mcp-${server.id}`}
                  />
                </div>
              </Td>
              <Td dataLabel="Name" style={{ verticalAlign: 'top' }}>
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {flags.enableMcpDetailsPage ? (
                        <Button
                          variant="link"
                          isInline
                          onClick={() => navigate(`/ai-assets/mvp-servers/${server.slug}`)}
                          style={{ fontWeight: 'bold', padding: 0, fontSize: '0.875rem' }}
                        >
                          {server.name}
                        </Button>
                      ) : (
                        <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                          {server.name}
                        </span>
                      )}
                    </div>
                    <Tooltip content={server.description}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--pf-v5-global--Color--200)',
                        marginTop: '0.25rem',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'help'
                      }}>
                        {server.description}
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </Td>
              <Td dataLabel="Status" style={{ verticalAlign: 'middle' }}>
                {renderStatusIcon(server.status)}
              </Td>
              <Td dataLabel="Streamable endpoint" style={{ verticalAlign: 'middle' }}>
                {server.streamableEndpoint && !['error', 'unavailable', 'stopped'].includes(server.status.toLowerCase()) ? (
                  <MCPEndpointPopover 
                    server={server}
                    copiedItems={copiedItems}
                    handleCopyWithFeedback={handleCopyWithFeedback}
                  />
                ) : (
                  <span style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>—</span>
                )}
              </Td>
              <Td dataLabel="Tools" style={{ verticalAlign: 'middle' }}>
                {!['error', 'unavailable', 'stopped'].includes(server.status.toLowerCase()) ? (
                  <Tooltip content={`View ${getEnabledToolsCount(server.slug)} ${server.name} tools`}>
                    <Button
                      variant="link"
                      onClick={() => handleViewTools(server)}
                      aria-label={`View ${getEnabledToolsCount(server.slug)} ${server.name} tools`}
                      style={{ padding: 0, fontSize: '0.875rem' }}
                    >
                      {getEnabledToolsCount(server.slug)}
                    </Button>
                  </Tooltip>
                ) : (
                  <span style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>—</span>
                )}
              </Td>
              <Td dataLabel="Version" style={{ verticalAlign: 'middle' }}>
                {!['error', 'unavailable', 'stopped'].includes(server.status.toLowerCase()) ? (
                  <span style={{ fontSize: '0.875rem' }}>{server.version}</span>
                ) : (
                  <span style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>—</span>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Pagination
        itemCount={getSortedMcpServers().length}
        perPage={mcpPerPage}
        page={mcpCurrentPage}
        onSetPage={(_event, pageNumber) => setMcpCurrentPage(pageNumber)}
        onPerPageSelect={(_event, newPerPage) => {
          setMcpPerPage(newPerPage);
          setMcpCurrentPage(1); // Reset to first page when changing items per page
        }}
        variant="bottom"
        perPageOptions={[
          { title: '5', value: 5 },
          { title: '10', value: 10 },
          { title: '20', value: 20 },
          { title: '50', value: 50 }
        ]}
      />
      </>
    );
  };

  const renderModelsCards = () => {
    if (getSortedModels().length === 0) {
      return (
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            <SearchIcon className="pf-v5-u-mr-sm" />
            No models found
          </Title>
          <EmptyStateBody>
            {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0) ? 
              'No models match your filter criteria.' :
              'No models are currently available in this project.'
            }
          </EmptyStateBody>
          {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0) && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={() => clearAllFilters('models')}>
                  Clear filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      );
    }

    return (
      <Grid hasGutter>
        {getSortedModels().map((model, index) => (
          <GridItem key={model.id} lg={4} md={6} sm={12}>
            <Card 
              isFullHeight
              onClick={() => navigate(`/gen-ai-studio/asset-endpoints/${model.slug}`)}
              style={{ 
                cursor: 'pointer',
                ...getCardAnimationStyle(modelsCardAnimations[index] || false, index)
              }}
              id={`model-card-${model.id}`}
            >
              <CardHeader>
                <CardTitle>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Title headingLevel="h2" size="lg">{formatModelName(model.name)}</Title>
                    <Tooltip 
                      content={copiedItems.has(`card-model-id-${model.id}`) ? 'Copied' : 'Click to copy'}
                      trigger={copiedItems.has(`card-model-id-${model.id}`) ? 'manual' : 'mouseenter focus'}
                      isVisible={copiedItems.has(`card-model-id-${model.id}`) ? true : undefined}
                    >
                      <span 
                        style={{ 
                          fontFamily: 'var(--pf-t--global--font--family--mono)',
                          fontSize: '0.75rem',
                          color: 'var(--pf-t--global--text--color--subtle)',
                          marginTop: '0.125rem',
                          cursor: 'pointer',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyWithFeedback(model.name, `card-model-id-${model.id}`);
                        }}
                        id={`card-model-id-text-${model.id}`}
                      >
                        {model.name}
                      </span>
                    </Tooltip>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardBody style={{ paddingTop: 0, paddingBottom: '0.5rem', flexGrow: 1 }}>
                {model.description && (
                  <div className="pf-v5-u-mb-md">
                    <div className="pf-v5-u-font-size-sm pf-v5-u-color-200 pf-v5-u-mb-xs" style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: '1.3'
                    }}>
                      {model.description}
                    </div>
                  </div>
                )}
                
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <div className="pf-v5-u-font-size-sm">
                      <strong>Use Case:</strong> {model.useCase}
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <div className="pf-v5-u-font-size-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{useSourceLabel ? 'Source:' : 'Availability:'}</strong>
                      {publishedAsMaasModels.has(model.id) && !useSourceLabel ? (
                        <Popover
                          aria-label="Pending availability information"
                          headerContent="Pending administrator action"
                          bodyContent={
                            <div>
                              <p style={{ marginBottom: '0.5rem' }}>
                                This model has been published as a MaaS model and is awaiting administrator action.
                              </p>
                              <p>
                                A cluster administrator needs to add this model to a subscription to make it fully available through the API gateway to all users.
                              </p>
                            </div>
                          }
                          id={`pending-availability-popover-card-${model.id}`}
                        >
                          <span
                            id={`pending-availability-label-card-${model.id}`}
                            style={{ cursor: 'pointer', textDecoration: 'underline dashed', textUnderlineOffset: '3px' }}
                          >
                            Pending
                          </span>
                        </Popover>
                      ) : (
                        renderAvailabilityText(model)
                      )}
                    </div>
                  </FlexItem>
                  {model.provider && (
                    <FlexItem>
                      <div className="pf-v5-u-font-size-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong>Provider:</strong>
                        {{ 'self-hosted': 'Self-hosted / vLLM', openai: 'OpenAI', gemini: 'Google Gemini', anthropic: 'Anthropic', other: 'Other' }[model.provider]}
                      </div>
                    </FlexItem>
                  )}
                  <FlexItem>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {renderStatusIcon(getStatusLabel(model))}
                    </div>
                  </FlexItem>
                </Flex>
                
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMaasEndpointModalOpen(model.id);
                    }}
                    id={`models-card-view-endpoint-${model.id}`}
                  >
                    View endpoint
                  </Button>
                  <MaaSEndpointModal
                    isOpen={maasEndpointModalOpen === model.id}
                    onClose={() => setMaasEndpointModalOpen(null)}
                    model={model}
                    copiedItems={copiedItems}
                    handleCopyWithFeedback={handleCopyWithFeedback}
                    generatedTokens={generatedTokens}
                    isGeneratingToken={isGeneratingToken}
                    onGenerateToken={handleGenerateToken}
                    isMaaS={isMaaSModel(model)}
                  />
                  
                  {/* Show "Try in playground" for Mistral when AI Platform Team is selected */}
                  {model.name === 'mistral-7b-instruct:9.1.1' && selectedProject === 'AI Platform Team' && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayground(model.id, 'model');
                      }}
                    >
                      Try in playground
                    </Button>
                  )}
                  {/* Show "Add to playground" for all other cases */}
                  {!(model.name === 'mistral-7b-instruct:9.1.1' && selectedProject === 'AI Platform Team') && (
                    <Button 
                      variant="link" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToPlayground(model.id);
                      }}
                    >
                      <PlusCircleIcon style={{ marginRight: '0.25rem' }} />
                      Add to playground
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    );
  };

  // Render functions for MaaS models
  const renderMaaSModelsTable = () => {
    if (getSortedMaaSModels().length === 0) {
      return (
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            <SearchIcon className="pf-v5-u-mr-sm" />
            No MaaS models found
          </Title>
          <EmptyStateBody>
            {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0 || modelsFilters.availability.length > 0 || modelsFilters.status.length > 0 || modelsFilters.type.length > 0) ? 
              'No MaaS models match your filter criteria.' :
              'No MaaS models are currently available in this project.'
            }
          </EmptyStateBody>
          {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0 || modelsFilters.availability.length > 0 || modelsFilters.status.length > 0 || modelsFilters.type.length > 0) && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={() => clearAllFilters('models')}>
                  Clear all filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      );
    }

    return (
      <>
        <Table aria-label="MaaS Models table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <Thead>
            <Tr>
              <Th 
                width={20}
                style={{ 
                  maxWidth: 0,
                  overflow: 'hidden'
                }}
                sort={{
                  sortBy: { index: 1, direction: modelsSortBy === 'name' ? modelsSortDirection : undefined },
                  onSort: () => handleModelsSort('name'),
                  columnIndex: 1
                }}
              >
                <div style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  minWidth: 0
                }}>Model</div>
              </Th>
              <Th width={10}>Endpoint</Th>
              <Th width={10}>Use case</Th>
              <Th width={10}>Status</Th>
              <Th width={10}>Playground</Th>
            </Tr>
          </Thead>
          <Tbody>
            {getPaginatedMaaSModels().map((model) => (
              <Tr key={model.id}>
                <Td>
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {flags.enableModelDescriptionPages ? (
                          <Button
                            variant="link"
                            isInline
                            onClick={() => navigate(`/ai-assets/models/${model.slug}`)}
                            style={{ 
                              padding: 0, 
                              fontSize: 'inherit', 
                              fontWeight: 'bold',
                              textAlign: 'left',
                              justifyContent: 'flex-start',
                              height: 'auto',
                              minHeight: 'auto'
                            }}
                          >
                            {model.name}
                          </Button>
                        ) : (
                          <span style={{ fontWeight: 'bold' }}>{model.name}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6A6E73', marginTop: '0.25rem' }}>
                        {model.description}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td dataLabel="Endpoint">
                  <Button
                    variant="link"
                    onClick={() => setMaasEndpointModalOpen(model.id)}
                    id={`maas-view-endpoint-${model.id}`}
                  >
                    View
                  </Button>
                  <MaaSEndpointModal
                    isOpen={maasEndpointModalOpen === model.id}
                    onClose={() => setMaasEndpointModalOpen(null)}
                    model={model}
                    copiedItems={copiedItems}
                    handleCopyWithFeedback={handleCopyWithFeedback}
                    generatedTokens={generatedTokens}
                    isGeneratingToken={isGeneratingToken}
                    onGenerateToken={handleGenerateToken}
                    isMaaS={true}
                  />
                </Td>
                <Td dataLabel="Use case">{model.useCase}</Td>
                <Td dataLabel="Status">
                  <Label variant="outline" status="success">
                    Ready
                  </Label>
                </Td>
                <Td dataLabel="Playground">
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Button 
                        variant="link" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlayground(model.id);
                        }}
                      >
                        <PlusCircleIcon style={{ marginRight: '0.25rem' }} />
                        Add to playground
                      </Button>
                    </FlexItem>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Pagination
          itemCount={getSortedMaaSModels().length}
          perPage={perPage}
          page={currentPage}
          onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
          onPerPageSelect={(_event, newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
          variant="bottom"
          perPageOptions={[
            { title: '5', value: 5 },
            { title: '10', value: 10 },
            { title: '20', value: 20 }
          ]}
          isCompact
        />
      </>
    );
  };

  const _renderMaaSModelsCards = () => {
    if (getSortedMaaSModels().length === 0) {
      return (
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            <SearchIcon className="pf-v5-u-mr-sm" />
            No MaaS models found
          </Title>
          <EmptyStateBody>
            {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0 || modelsFilters.availability.length > 0 || modelsFilters.status.length > 0 || modelsFilters.type.length > 0) ? 
              'No MaaS models match your filter criteria.' :
              'No MaaS models are currently available in this project.'
            }
          </EmptyStateBody>
          {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0 || modelsFilters.availability.length > 0 || modelsFilters.status.length > 0 || modelsFilters.type.length > 0) && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={() => clearAllFilters('models')}>
                  Clear all filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      );
    }

    return (
      <Grid hasGutter>
        {getSortedMaaSModels().map((model, index) => (
          <GridItem key={model.id} lg={4} md={6} sm={12}>
            <Card 
              isFullHeight
              onClick={flags.enableModelDescriptionPages ? () => navigate(`/ai-assets/models/${model.slug}`) : undefined}
              style={{ 
                cursor: flags.enableModelDescriptionPages ? 'pointer' : 'default',
                ...getCardAnimationStyle(modelsCardAnimations[index] || false, index)
              }}
            >
              <CardHeader>
                <CardTitle>
                  <span>{model.name}</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6A6E73' }}>
                  {model.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <strong>Use Case:</strong> {model.useCase}
                  </div>
                  <Label variant="outline" status="success">
                    Ready
                  </Label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button 
                    variant="link" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMaasEndpointModalOpen(model.id);
                    }}
                    id={`maas-card-view-endpoint-${model.id}`}
                  >
                    View endpoint
                  </Button>
                  <Button 
                    variant="link" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPlayground(model.id);
                    }}
                  >
                    <PlusCircleIcon style={{ marginRight: '0.25rem' }} />
                    Add to playground
                  </Button>
                </div>
                <MaaSEndpointModal
                  isOpen={maasEndpointModalOpen === model.id}
                  onClose={() => setMaasEndpointModalOpen(null)}
                  model={model}
                  copiedItems={copiedItems}
                  handleCopyWithFeedback={handleCopyWithFeedback}
                  generatedTokens={generatedTokens}
                  isGeneratingToken={isGeneratingToken}
                  onGenerateToken={handleGenerateToken}
                  isMaaS={true}
                />
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    );
  };

  const renderMCPCards = () => {
    if (getSortedMcpServers().length === 0) {
      return (
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            <SearchIcon className="pf-v5-u-mr-sm" />
            No MCP servers found
          </Title>
          <EmptyStateBody>
            {(mcpFilters.name.length > 0 || mcpFilters.keyword.length > 0 || mcpFilters.description.length > 0) ? 
              'No MCP servers match your filter criteria.' :
              'No MCP servers are currently available in this project.'
            }
          </EmptyStateBody>
          {(mcpFilters.name.length > 0 || mcpFilters.keyword.length > 0 || mcpFilters.description.length > 0) && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={() => clearAllFilters('mcp')}>
                  Clear filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      );
    }

    return (
      <Grid hasGutter>
        {getSortedMcpServers().map((server, index) => (
          <GridItem key={server.id} lg={4} md={6} sm={12}>
            <Card 
              isFullHeight
              onClick={flags.enableMcpDetailsPage ? () => navigate(`/ai-assets/mvp-servers/${server.slug}`) : undefined}
              style={{ 
                cursor: flags.enableMcpDetailsPage ? 'pointer' : 'default',
                ...getCardAnimationStyle(mcpCardAnimations[index] || false, index)
              }}
            >
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h2" size="lg">{server.name}</Title>
                </CardTitle>
              </CardHeader>
              <CardBody style={{ paddingTop: 0, paddingBottom: '0.5rem', flexGrow: 1 }}>
                <div className="pf-v5-u-mb-md">
                  <div style={{ marginBottom: '0.75rem' }}>
                    {renderStatusIcon(server.status)}
                  </div>
                  <div className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                    {server.description}
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayground(server.id, 'mcp');
                    }}
                  >
                    Try in playground
                  </Button>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <PageSection>
        <Flex spaceItems={{ default: 'spaceItemsLg' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center' }}>
              <AIAssetEndpointsIcon withBackground size={40} />
            </div>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h1" size="2xl" id="ai-asset-endpoints-title">
              AI asset endpoints
            </Title>
          </FlexItem>
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
                    id="ai-asset-endpoints-project-select"
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
                        id="ai-asset-endpoints-project-toggle"
                      >
                        {selectedProject}
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                  >
                    <SelectList>
                      <SelectOption value="AI Platform Team" id="ai-asset-endpoints-project-platform">AI Platform Team</SelectOption>
                      <SelectOption value="Research Lab" id="ai-asset-endpoints-project-research">Research Lab</SelectOption>
                    </SelectList>
                  </Select>
                </InputGroupItem>
              </InputGroup>
            </FlexItem>
          )}
        </Flex>
        <div className="pf-v5-u-color-200 pf-v5-u-mt-sm" id="ai-asset-endpoints-description">
          Browse endpoints for models and MCP servers that are available to this project.
        </div>
      </PageSection>

      {selectedProject === 'Research Lab' ? (
        <PageSection isFilled>
          <EmptyState
            titleText="No endpoints available"
            headingLevel="h2"
            icon={PlusCircleIcon}
            id="aae-empty-state"
          >
            <EmptyStateBody>
              There are no model or MCP server endpoints in this project yet. Connect an external model API or deploy a model to create your first endpoint.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={handleOpenAddAssetModal} id="aae-empty-state-create-external-button">
                  Create endpoint
                </Button>
              </EmptyStateActions>
              <EmptyStateActions>
                <Button variant="link" onClick={() => navigate('/ai-hub/models/deployments/deploy')} id="aae-empty-state-deploy-button">
                  Deploy a model
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </PageSection>
      ) : (
      <PageSection style={{ paddingTop: '0.5rem' }}>
        {/* Tabs */}
        <Tabs
          activeKey={activeTabKey}
          onSelect={(_event, tabKey) => setActiveTabKey(tabKey)}
          aria-label="AI Assets tabs"
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Models</TabTitleText>}
            aria-label="Models tab"
          >
            <div style={{ paddingTop: '1rem' }}>
              {/* Filters and Controls for Models */}
              <div 
                className="pf-v5-u-mb-lg"
                style={{ 
                  position: 'sticky',
                  top: '0',
                  zIndex: 100,
                  backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)'
                }}
              >
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      <ToolbarItem>
                        <InputGroup>
                          <InputGroupItem>
                            <Dropdown
                              isOpen={modelsFilterDropdownOpen}
                              onSelect={() => setModelsFilterDropdownOpen(false)}
                              onOpenChange={(isOpen: boolean) => setModelsFilterDropdownOpen(isOpen)}
                              toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  onClick={() => setModelsFilterDropdownOpen(!modelsFilterDropdownOpen)}
                                  isExpanded={modelsFilterDropdownOpen}
                                  style={{
                                    minWidth: '120px',
                                    backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                                    borderRight: 'none',
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0
                                  }}
                                >
                                  <FilterIcon style={{ marginRight: '0.5rem' }} />
                                  {modelsFilterAttribute === 'name' && 'Name'}
                                  {modelsFilterAttribute === 'availability' && !hideSourceColumn && (useSourceLabel ? 'Source' : 'Availability')}
                                  {modelsFilterAttribute === 'useCase' && 'Use Case'}
                                  {modelsFilterAttribute === 'status' && 'Status'}
                                </MenuToggle>
                              )}
                            >
                              <DropdownList>
                                <DropdownItem 
                                  key="name"
                                  onClick={() => {
                                    setModelsFilterAttribute('name');
                                    setModelsFilterInput('');
                                  }}
                                >
                                  Name
                                </DropdownItem>
                                {!hideSourceColumn && (
                                <DropdownItem 
                                  key="availability"
                                  id="filter-availability-dropdown-item"
                                  onClick={() => {
                                    setModelsFilterAttribute('availability');
                                    setModelsFilterInput('');
                                  }}
                                >
                                  {useSourceLabel ? 'Source' : 'Availability'}
                                </DropdownItem>
                                )}
                                <DropdownItem 
                                  key="useCase"
                                  onClick={() => {
                                    setModelsFilterAttribute('useCase');
                                    setModelsFilterInput('');
                                  }}
                                >
                                  Use Case
                                </DropdownItem>
                                <DropdownItem 
                                  key="status"
                                  id="filter-status-dropdown-item"
                                  onClick={() => {
                                    setModelsFilterAttribute('status');
                                    setModelsFilterInput('');
                                  }}
                                >
                                  Status
                                </DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </InputGroupItem>
                          <InputGroupItem isFill>
                            {modelsFilterAttribute === 'availability' ? (
                              <Select
                                id="availability-filter-select"
                                isOpen={availabilitySelectOpen}
                                onOpenChange={setAvailabilitySelectOpen}
                                onSelect={(_event, value) => {
                                  const val = value as string;
                                  if (modelsFilters.availability.includes(val)) {
                                    removeFilter('models', 'availability', val);
                                  } else {
                                    addFilter('models', 'availability', val);
                                  }
                                }}
                                toggle={(toggleRef) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setAvailabilitySelectOpen(!availabilitySelectOpen)}
                                    isExpanded={availabilitySelectOpen}
                                    style={{ minWidth: '300px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                    id="availability-filter-toggle"
                                  >
                                    {modelsFilters.availability.length > 0
                                      ? `${modelsFilters.availability.length} selected`
                                      : useSourceLabel ? 'Filter by source' : 'Filter by availability'}
                                  </MenuToggle>
                                )}
                              >
                                <SelectList>
                                  {(useSourceLabel
                                    ? ['MaaS', 'External', 'Public route', 'Internal']
                                    : ['Self-service', 'Pending', 'External', 'Public route', 'Internal']
                                  ).map(val => (
                                    <SelectOption
                                      key={val}
                                      value={val}
                                      hasCheckbox
                                      isSelected={modelsFilters.availability.includes(val)}
                                    >
                                      {val}
                                    </SelectOption>
                                  ))}
                                </SelectList>
                              </Select>
                            ) : modelsFilterAttribute === 'status' ? (
                              <Select
                                id="status-filter-select"
                                isOpen={statusSelectOpen}
                                onOpenChange={setStatusSelectOpen}
                                onSelect={(_event, value) => {
                                  const val = value as string;
                                  if (modelsFilters.status.includes(val)) {
                                    removeFilter('models', 'status', val);
                                  } else {
                                    addFilter('models', 'status', val);
                                  }
                                }}
                                toggle={(toggleRef) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setStatusSelectOpen(!statusSelectOpen)}
                                    isExpanded={statusSelectOpen}
                                    style={{ minWidth: '300px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                    id="status-filter-toggle"
                                  >
                                    {modelsFilters.status.length > 0
                                      ? `${modelsFilters.status.length} selected`
                                      : 'Filter by status'}
                                  </MenuToggle>
                                )}
                              >
                                <SelectList>
                                  {['Running', 'Unknown', 'Error'].map(val => (
                                    <SelectOption
                                      key={val}
                                      value={val}
                                      hasCheckbox
                                      isSelected={modelsFilters.status.includes(val)}
                                    >
                                      {val}
                                    </SelectOption>
                                  ))}
                                </SelectList>
                              </Select>
                            ) : (
                              <SearchInput
                                placeholder={getFilterPlaceholder('models', modelsFilterAttribute)}
                                value={modelsFilterInput}
                                onChange={(_event, value) => setModelsFilterInput(value)}
                                onSearch={() => {
                                  if (modelsFilterInput.trim()) {
                                    addFilter('models', modelsFilterAttribute, modelsFilterInput.trim());
                                  }
                                }}
                                onClear={() => setModelsFilterInput('')}
                                style={{ 
                                  borderTopLeftRadius: 0,
                                  borderBottomLeftRadius: 0,
                                  minWidth: '300px'
                                }}
                              />
                            )}
                          </InputGroupItem>
                        </InputGroup>
                      </ToolbarItem>
                      <ToolbarItem>
                        <Button 
                          variant="primary" 
                          onClick={handleOpenAddAssetModal}
                          id="add-model-button"
                        >
                          {hideSourceColumn ? 'Create endpoint' : 'Register endpoint'}
                        </Button>
                      </ToolbarItem>
                    </ToolbarGroup>
                    {flags.enableCardTableViewSwitcher && (
                      <ToolbarGroup align={{ default: 'alignEnd' }}>
                        <ToolbarItem>
                          {/* View Toggle */}
                          <div style={{ display: 'flex' }}>
                            <Button
                              variant={modelsViewMode === 'cards' ? 'primary' : 'secondary'}
                              onClick={() => handleModelsViewModeChange('cards')}
                              style={{ 
                                fontSize: '0.75rem',
                                height: '2rem',
                                paddingLeft: '0.75rem',
                                paddingRight: '0.75rem',
                                marginRight: '0.25rem'
                              }}
                              icon={<ThIcon style={{ marginRight: '0.5rem' }} />}
                            >
                              Cards
                            </Button>
                            <Button
                              variant={modelsViewMode === 'table' ? 'primary' : 'secondary'}
                              onClick={() => handleModelsViewModeChange('table')}
                              style={{ 
                                fontSize: '0.75rem',
                                height: '2rem',
                                paddingLeft: '0.75rem',
                                paddingRight: '0.75rem'
                              }}
                              icon={<ListIcon style={{ marginRight: '0.5rem' }} />}
                            >
                              Table
                            </Button>
                          </div>
                        </ToolbarItem>
                      </ToolbarGroup>
                    )}
                    <ToolbarGroup align={{ default: 'alignEnd' }}>
                      <ToolbarItem>
                        <Pagination
                          itemCount={useEndpointRows ? getDualEndpointTotalCount() : getSortedModels().length}
                          perPage={perPage}
                          page={currentPage}
                          onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
                          onPerPageSelect={(_event, newPerPage) => {
                            setPerPage(newPerPage);
                            setCurrentPage(1);
                          }}
                          variant="top"
                          isCompact
                          perPageOptions={[
                            { title: '5', value: 5 },
                            { title: '10', value: 10 },
                            { title: '20', value: 20 },
                            { title: '50', value: 50 }
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>

                    {/* Active Filters Row */}
                    {(modelsFilters.name.length > 0 || modelsFilters.keyword.length > 0 || modelsFilters.useCase.length > 0 || modelsFilters.availability.length > 0 || modelsFilters.status.length > 0 || modelsFilters.type.length > 0) && (
                      <ToolbarGroup>
                        <ToolbarItem variant="label-group">
                          <LabelGroup
                            categoryName="Active filters"
                            isClosable={false}
                            numLabels={modelsFilters.name.length + modelsFilters.keyword.length + modelsFilters.useCase.length + modelsFilters.availability.length + modelsFilters.status.length + modelsFilters.type.length}
                          >
                            {modelsFilters.name.map(filter => (
                              <Label 
                                key={`name-${filter}`}
                                variant="outline"
                                onClose={() => removeFilter('models', 'name', filter)}
                              >
                                {filter}
                              </Label>
                            ))}
                            {modelsFilters.keyword.map(filter => (
                              <Label 
                                key={`keyword-${filter}`}
                                variant="outline"
                                onClose={() => removeFilter('models', 'keyword', filter)}
                              >
                                {filter}
                              </Label>
                            ))}
                            {modelsFilters.useCase.map(filter => (
                              <Label 
                                key={`useCase-${filter}`}
                                variant="outline"
                                onClose={() => removeFilter('models', 'useCase', filter)}
                              >
                                {filter}
                              </Label>
                            ))}
                            {!hideSourceColumn && modelsFilters.availability.map(filter => (
                              <Label 
                                key={`availability-${filter}`}
                                variant="outline"
                                color="purple"
                                onClose={() => removeFilter('models', 'availability', filter)}
                              >
                                {useSourceLabel ? 'Source' : 'Availability'}: {filter}
                              </Label>
                            ))}
                            {modelsFilters.status.map(filter => (
                              <Label 
                                key={`status-${filter}`}
                                variant="outline"
                                color="green"
                                onClose={() => removeFilter('models', 'status', filter)}
                              >
                                Status: {filter}
                              </Label>
                            ))}
                            {modelsFilters.type.map(filter => (
                              <Label 
                                key={`type-${filter}`}
                                variant="outline"
                                color="yellow"
                                onClose={() => removeFilter('models', 'type', filter)}
                              >
                                Type: {filter}
                              </Label>
                            ))}
                          </LabelGroup>
                          <Button 
                            variant="link" 
                            onClick={() => clearAllFilters('models')}
                            size="sm"
                          >
                            Clear filters
                          </Button>
                        </ToolbarItem>
                      </ToolbarGroup>
                    )}
                  </ToolbarContent>
                </Toolbar>
              </div>
              <div style={{ marginTop: modelsViewMode === 'cards' ? '1.5rem' : '0' }}>
                {modelsViewMode === 'table' ? renderModelsTable() : renderModelsCards()}
              </div>
            </div>
          </Tab>
          {isV1Layout && (
            <Tab
              eventKey={1}
              title={<TabTitleText>MaaS Models</TabTitleText>}
              aria-label="MaaS Models tab"
              id="maas-models-tab"
            >
              <div style={{ paddingTop: '1rem' }}>
                {renderMaaSModelsTable()}
              </div>
            </Tab>
          )}
          <Tab
            eventKey={2}
            title={<TabTitleText>MCP servers</TabTitleText>}
            aria-label="MCP Servers tab"
          >
            <div style={{ paddingTop: '1rem' }}>
              {/* Filters and Controls for MCP Servers */}
              <div 
                className="pf-v5-u-mb-lg"
                style={{ 
                  position: 'sticky',
                  top: '0',
                  zIndex: 100,
                  backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)'
                }}
              >
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      <ToolbarItem>
                        {/* Bulk Selection */}
                        <InputGroup>
                          <InputGroupItem>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              padding: '0.375rem 0.75rem',
                              border: '1px solid var(--pf-v5-global--BorderColor--100)',
                              borderRadius: 'var(--pf-v5-global--BorderRadius--sm)',
                              height: '36px',
                              minWidth: '120px'
                            }}>
                              <Checkbox
                                isChecked={getBulkSelectCheckboxState().checked}
                                onChange={(_event, checked) => handleMcpSelectAll(checked)}
                                aria-label="Bulk select MCP servers"
                                id="bulk-select-mcp"
                              />
                              <span style={{ fontSize: '0.875rem' }}>
                                {selectedMcpServers.size} selected
                              </span>
                            </div>
                          </InputGroupItem>
                        </InputGroup>
                      </ToolbarItem>
                    </ToolbarGroup>
                    <ToolbarGroup>
                      <ToolbarItem>
                        <InputGroup>
                          <InputGroupItem>
                            <Dropdown
                              isOpen={mcpFilterDropdownOpen}
                              onSelect={() => setMcpFilterDropdownOpen(false)}
                              onOpenChange={(isOpen: boolean) => setMcpFilterDropdownOpen(isOpen)}
                              toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  onClick={() => setMcpFilterDropdownOpen(!mcpFilterDropdownOpen)}
                                  isExpanded={mcpFilterDropdownOpen}
                                  style={{
                                    minWidth: '120px',
                                    backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                                    borderRight: 'none',
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0
                                  }}
                                >
                                  <FilterIcon style={{ marginRight: '0.5rem' }} />
                                  {mcpFilterAttribute === 'name' && 'Name'}
                                  {mcpFilterAttribute === 'keyword' && 'Keyword'}
                                  {mcpFilterAttribute === 'description' && 'Description'}
                                </MenuToggle>
                              )}
                            >
                              <DropdownList>
                                <DropdownItem 
                                  key="name"
                                  onClick={() => setMcpFilterAttribute('name')}
                                >
                                  Name
                                </DropdownItem>
                                <DropdownItem 
                                  key="keyword"
                                  onClick={() => setMcpFilterAttribute('keyword')}
                                >
                                  Keyword
                                </DropdownItem>
                                <DropdownItem 
                                  key="description"
                                  onClick={() => setMcpFilterAttribute('description')}
                                >
                                  Description
                                </DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </InputGroupItem>
                          <InputGroupItem isFill>
                            <SearchInput
                              placeholder={getFilterPlaceholder('mcp', mcpFilterAttribute)}
                              value={mcpFilterInput}
                              onChange={(_event, value) => setMcpFilterInput(value)}
                              onSearch={() => {
                                if (mcpFilterInput.trim()) {
                                  addFilter('mcp', mcpFilterAttribute, mcpFilterInput.trim());
                                }
                              }}
                              onClear={() => setMcpFilterInput('')}
                              style={{ 
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                                minWidth: '300px'
                              }}
                            />
                          </InputGroupItem>
                        </InputGroup>
                      </ToolbarItem>

                      <ToolbarItem>
                        <Button 
                          variant="primary" 
                          isDisabled={selectedMcpServers.size === 0}
                          onClick={() => {
                            // Navigate to playground with selected MCP servers
                            const selectedServerNames = Array.from(selectedMcpServers).map(id => {
                              const server = mockMCPServers.find(s => s.id === id);
                              return server ? server.name : '';
                            }).filter(Boolean);
                            
                            navigate('/gen-ai-studio/playground', { 
                              state: { 
                                preselectedMCPs: selectedServerNames
                              }
                            });
                          }}
                        >
                          <PlayIcon style={{ marginRight: '0.25rem' }} />
                          Try in playground
                        </Button>
                      </ToolbarItem>
                    </ToolbarGroup>
                    {flags.enableCardTableViewSwitcher && (
                      <ToolbarGroup align={{ default: 'alignEnd' }}>
                        <ToolbarItem>
                          {/* View Toggle */}
                          <div style={{ display: 'flex' }}>
                            <Button
                              variant={mcpViewMode === 'cards' ? 'primary' : 'secondary'}
                              onClick={() => handleMcpViewModeChange('cards')}
                              style={{ 
                                fontSize: '0.75rem',
                                height: '2rem',
                                paddingLeft: '0.75rem',
                                paddingRight: '0.75rem',
                                marginRight: '0.25rem'
                              }}
                              icon={<ThIcon style={{ marginRight: '0.5rem' }} />}
                            >
                              Cards
                            </Button>
                            <Button
                              variant={mcpViewMode === 'table' ? 'primary' : 'secondary'}
                              onClick={() => handleMcpViewModeChange('table')}
                              style={{ 
                                fontSize: '0.75rem',
                                height: '2rem',
                                paddingLeft: '0.75rem',
                                paddingRight: '0.75rem'
                              }}
                              icon={<ListIcon style={{ marginRight: '0.5rem' }} />}
                            >
                              Table
                            </Button>
                          </div>
                        </ToolbarItem>
                      </ToolbarGroup>
                    )}
                    <ToolbarGroup align={{ default: 'alignEnd' }}>
                      <ToolbarItem>
                        <Pagination
                          itemCount={getSortedMcpServers().length}
                          perPage={mcpPerPage}
                          page={mcpCurrentPage}
                          onSetPage={(_event, pageNumber) => setMcpCurrentPage(pageNumber)}
                          onPerPageSelect={(_event, newPerPage) => {
                            setMcpPerPage(newPerPage);
                            setMcpCurrentPage(1);
                          }}
                          variant="top"
                          isCompact
                          perPageOptions={[
                            { title: '5', value: 5 },
                            { title: '10', value: 10 },
                            { title: '20', value: 20 },
                            { title: '50', value: 50 }
                          ]}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                    {/* Active Filters Row */}
                    {(mcpFilters.name.length > 0 || mcpFilters.keyword.length > 0 || mcpFilters.description.length > 0) && (
                      <ToolbarGroup>
                        <ToolbarItem variant="label-group">
                          <LabelGroup
                            categoryName="Active filters"
                            isClosable={false}
                            numLabels={mcpFilters.name.length + mcpFilters.keyword.length + mcpFilters.description.length}
                          >
                            {mcpFilters.name.map(filter => (
                              <Label 
                                key={`name-${filter}`}
                                variant="outline"
                                onClose={() => removeFilter('mcp', 'name', filter)}
                              >
                                {filter}
                              </Label>
                            ))}
                            {mcpFilters.keyword.map(filter => (
                              <Label 
                                key={`keyword-${filter}`}
                                variant="outline"
                                onClose={() => removeFilter('mcp', 'keyword', filter)}
                              >
                                {filter}
                              </Label>
                            ))}
                            {mcpFilters.description.map(filter => (
                              <Label 
                                key={`description-${filter}`}
                                variant="outline"
                                onClose={() => removeFilter('mcp', 'description', filter)}
                              >
                                {filter}
                              </Label>
                            ))}
                          </LabelGroup>
                          <Button 
                            variant="link" 
                            onClick={() => clearAllFilters('mcp')}
                            size="sm"
                          >
                            Clear filters
                          </Button>
                        </ToolbarItem>
                      </ToolbarGroup>
                    )}
                  </ToolbarContent>
                </Toolbar>
              </div>
              <div style={{ marginTop: mcpViewMode === 'cards' ? '1.5rem' : '0' }}>
                {mcpViewMode === 'table' ? renderMCPTable() : renderMCPCards()}
              </div>
            </div>
          </Tab>
          <Tab
            eventKey={3}
            title={<TabTitleText>Vector store</TabTitleText>}
            aria-label="Vector Store tab"
            id="vector-store-tab"
          >
            <div style={{ paddingTop: '1rem' }}>
              {visibleVectorStores.length === 0 ? (
                <EmptyState
                  headingLevel="h2"
                  titleText="No vector stores available"
                  icon={DatabaseIcon}
                  id="vector-store-empty-state"
                >
                  <EmptyStateBody>
                    Vector stores are registered by your platform team via ConfigMaps.
                    No vector stores are currently configured in this namespace.
                    Contact your platform administrator to register a vector store.
                  </EmptyStateBody>
                </EmptyState>
              ) : (
                <>
                  <div
                    className="pf-v5-u-mb-lg"
                    style={{
                      position: 'sticky',
                      top: '0',
                      zIndex: 100,
                      backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                      paddingTop: '0.5rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)'
                    }}
                  >
                  <Toolbar id="vector-store-toolbar">
                    <ToolbarContent>
                      <ToolbarGroup>
                        <ToolbarItem>
                          <InputGroup>
                            <InputGroupItem>
                              <Dropdown
                                isOpen={vsFilterDropdownOpen}
                                onSelect={() => setVsFilterDropdownOpen(false)}
                                onOpenChange={(isOpen: boolean) => setVsFilterDropdownOpen(isOpen)}
                                toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setVsFilterDropdownOpen(!vsFilterDropdownOpen)}
                                    isExpanded={vsFilterDropdownOpen}
                                    style={{
                                      minWidth: '120px',
                                      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                                      borderRight: 'none',
                                      borderTopRightRadius: 0,
                                      borderBottomRightRadius: 0
                                    }}
                                    id="vs-filter-attribute-toggle"
                                  >
                                    <FilterIcon style={{ marginRight: '0.5rem' }} />
                                    {vsFilterAttribute === 'name' && 'Name'}
                                    {vsFilterAttribute === 'provider' && 'Provider'}
                                    {vsFilterAttribute === 'status' && 'Status'}
                                    {vsFilterAttribute === 'owner' && 'Owner'}
                                  </MenuToggle>
                                )}
                              >
                                <DropdownList>
                                  <DropdownItem key="name" onClick={() => { setVsFilterAttribute('name'); setVsFilterInput(''); }}>Name</DropdownItem>
                                  <DropdownItem key="provider" onClick={() => { setVsFilterAttribute('provider'); setVsFilterInput(''); }}>Provider</DropdownItem>
                                  <DropdownItem key="status" onClick={() => { setVsFilterAttribute('status'); setVsFilterInput(''); }}>Status</DropdownItem>
                                  <DropdownItem key="owner" onClick={() => { setVsFilterAttribute('owner'); setVsFilterInput(''); }}>Owner</DropdownItem>
                                </DropdownList>
                              </Dropdown>
                            </InputGroupItem>
                            <InputGroupItem isFill>
                              {vsFilterAttribute === 'provider' ? (
                                <Select
                                  id="vs-provider-filter-select"
                                  isOpen={vsProviderSelectOpen}
                                  onOpenChange={setVsProviderSelectOpen}
                                  onSelect={(_event, value) => {
                                    const val = value as string;
                                    if (vsFilters.provider.includes(val)) {
                                      removeFilter('vs', 'provider', val);
                                    } else {
                                      addFilter('vs', 'provider', val);
                                    }
                                  }}
                                  toggle={(toggleRef) => (
                                    <MenuToggle
                                      ref={toggleRef}
                                      onClick={() => setVsProviderSelectOpen(!vsProviderSelectOpen)}
                                      isExpanded={vsProviderSelectOpen}
                                      style={{ minWidth: '300px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                      id="vs-provider-filter-toggle"
                                    >
                                      {vsFilters.provider.length > 0 ? `${vsFilters.provider.length} selected` : 'Filter by provider'}
                                    </MenuToggle>
                                  )}
                                >
                                  <SelectList>
                                    {['PGVector', 'Qdrant', 'Milvus'].map(val => (
                                      <SelectOption key={val} value={val} hasCheckbox isSelected={vsFilters.provider.includes(val)}>
                                        {val}
                                      </SelectOption>
                                    ))}
                                  </SelectList>
                                </Select>
                              ) : vsFilterAttribute === 'status' ? (
                                <Select
                                  id="vs-status-filter-select"
                                  isOpen={vsStatusSelectOpen}
                                  onOpenChange={setVsStatusSelectOpen}
                                  onSelect={(_event, value) => {
                                    const val = value as string;
                                    if (vsFilters.status.includes(val)) {
                                      removeFilter('vs', 'status', val);
                                    } else {
                                      addFilter('vs', 'status', val);
                                    }
                                  }}
                                  toggle={(toggleRef) => (
                                    <MenuToggle
                                      ref={toggleRef}
                                      onClick={() => setVsStatusSelectOpen(!vsStatusSelectOpen)}
                                      isExpanded={vsStatusSelectOpen}
                                      style={{ minWidth: '300px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                      id="vs-status-filter-toggle"
                                    >
                                      {vsFilters.status.length > 0 ? `${vsFilters.status.length} selected` : 'Filter by status'}
                                    </MenuToggle>
                                  )}
                                >
                                  <SelectList>
                                    {['Active', 'Unreachable', 'Misconfigured'].map(val => (
                                      <SelectOption key={val} value={val} hasCheckbox isSelected={vsFilters.status.includes(val)}>
                                        {val}
                                      </SelectOption>
                                    ))}
                                  </SelectList>
                                </Select>
                              ) : (
                                <SearchInput
                                  placeholder={vsFilterAttribute === 'name' ? 'Filter by name' : 'Filter by owner'}
                                  value={vsFilterInput}
                                  onChange={(_event, value) => setVsFilterInput(value)}
                                  onSearch={() => {
                                    if (vsFilterInput.trim()) {
                                      addFilter('vs', vsFilterAttribute, vsFilterInput.trim());
                                    }
                                  }}
                                  onClear={() => setVsFilterInput('')}
                                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, minWidth: '300px' }}
                                  id="vs-filter-search-input"
                                />
                              )}
                            </InputGroupItem>
                          </InputGroup>
                        </ToolbarItem>
                      </ToolbarGroup>
                      <ToolbarGroup align={{ default: 'alignEnd' }}>
                        <ToolbarItem>
                          <Pagination
                            itemCount={getFilteredCollectionRows().length}
                            perPage={vsPerPage}
                            page={vsCurrentPage}
                            onSetPage={(_event, pageNumber) => setVsCurrentPage(pageNumber)}
                            onPerPageSelect={(_event, newPerPage) => { setVsPerPage(newPerPage); setVsCurrentPage(1); }}
                            variant="top"
                            isCompact
                            perPageOptions={[
                              { title: '5', value: 5 },
                              { title: '10', value: 10 },
                              { title: '20', value: 20 }
                            ]}
                            id="vs-pagination-top"
                          />
                        </ToolbarItem>
                      </ToolbarGroup>

                      {(vsFilters.name.length > 0 || vsFilters.provider.length > 0 || vsFilters.status.length > 0 || vsFilters.owner.length > 0) && (
                        <ToolbarGroup>
                          <ToolbarItem variant="label-group">
                            <LabelGroup categoryName="Active filters" isClosable={false} numLabels={vsFilters.name.length + vsFilters.provider.length + vsFilters.status.length + vsFilters.owner.length}>
                              {vsFilters.name.map(f => (
                                <Label key={`name-${f}`} variant="outline" onClose={() => removeFilter('vs', 'name', f)}>{f}</Label>
                              ))}
                              {vsFilters.provider.map(f => (
                                <Label key={`provider-${f}`} variant="outline" color="purple" onClose={() => removeFilter('vs', 'provider', f)}>Provider: {f}</Label>
                              ))}
                              {vsFilters.status.map(f => (
                                <Label key={`status-${f}`} variant="outline" color="green" onClose={() => removeFilter('vs', 'status', f)}>Status: {f}</Label>
                              ))}
                              {vsFilters.owner.map(f => (
                                <Label key={`owner-${f}`} variant="outline" onClose={() => removeFilter('vs', 'owner', f)}>Owner: {f}</Label>
                              ))}
                            </LabelGroup>
                            <Button variant="link" onClick={() => clearAllFilters('vs')} size="sm">Clear filters</Button>
                          </ToolbarItem>
                        </ToolbarGroup>
                      )}
                    </ToolbarContent>
                  </Toolbar>
                  </div>

                  <InnerScrollContainer>
                  <Table aria-label="Vector store collections table" variant="compact" id="vector-store-table">
                    <Thead>
                      <Tr>
                        <Th width={30} modifier="nowrap" id="vs-th-collection" style={{ verticalAlign: 'middle' }} info={{ tooltip: 'The registered vector store name and description' }}>Collection name</Th>
                        <Th width={20} modifier="nowrap" id="vs-th-model" style={{ verticalAlign: 'middle' }} info={{ tooltip: 'The embedding model used to generate vectors for this collection' }}>Embedding model</Th>
                        <Th width={10} modifier="nowrap" id="vs-th-dimensions" style={{ verticalAlign: 'middle', textAlign: 'right' }} info={{ tooltip: 'The number of dimensions in the embedding vector' }}>Dimensions</Th>
                        {flags.showVectorStoreTags && <Th width={15} modifier="nowrap" id="vs-th-tags" style={{ verticalAlign: 'middle' }} info={{ tooltip: 'Owner and domain labels from the vector store metadata' }}>Labels</Th>}
                        <Th width={15} modifier="nowrap" id="vs-th-playground" style={{ verticalAlign: 'middle' }} info={{ tooltip: 'Add this collection to the playground for testing' }}>Playground</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {getPaginatedCollectionRows().map(row => (
                          <Tr key={row.id} id={`collection-row-${row.id}`}>
                            <Td dataLabel="Collection name" modifier="truncate" id={`col-name-${row.id}`} style={{ verticalAlign: 'middle', ...(!row.embeddingModelConnected ? { opacity: 0.5 } : {}) }}>
                              <div>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                                  <FlexItem>
                                    <span style={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.vectorStoreName}</span>
                                  </FlexItem>
                                  <FlexItem>
                                    <Popover
                                      headerContent="Vector store details"
                                      bodyContent={
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                          {[
                                            { label: 'Provider ID', value: row.providerId },
                                            { label: 'Provider type', value: row.providerType },
                                            { label: 'Vector store ID', value: row.vectorStoreUuid },
                                          ].map(field => (
                                            <div key={field.label}>
                                              <label style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                                                {field.label}
                                              </label>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <TextInput
                                                  value={field.value}
                                                  readOnly
                                                  aria-label={field.label}
                                                  style={{ fontSize: '0.75rem', height: '28px' }}
                                                  id={`vs-field-${field.label.replace(/\s/g, '-').toLowerCase()}-${row.id}`}
                                                />
                                                <Tooltip content={copiedItems.has(`vs-${field.label}-${row.id}`) ? 'Copied' : `Copy ${field.label.toLowerCase()}`}>
                                                  <Button
                                                    variant="plain"
                                                    size="sm"
                                                    aria-label={`Copy ${field.label}`}
                                                    onClick={() => handleCopyWithFeedback(field.value, `vs-${field.label}-${row.id}`)}
                                                    style={{ padding: '4px' }}
                                                    id={`vs-copy-${field.label.replace(/\s/g, '-').toLowerCase()}-${row.id}`}
                                                  >
                                                    {copiedItems.has(`vs-${field.label}-${row.id}`) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
                                                  </Button>
                                                </Tooltip>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      }
                                      id={`col-details-popover-${row.id}`}
                                    >
                                      <Button variant="plain" style={{ padding: '2px', verticalAlign: 'middle' }} aria-label="Vector store details" id={`col-info-${row.id}`}>
                                        <InfoCircleIcon style={{ fontSize: '14px', color: 'var(--pf-t--global--icon--color--subtle)' }} />
                                      </Button>
                                    </Popover>
                                  </FlexItem>
                                </Flex>
                                {row.description && (
                                  <span style={{ display: 'block', color: 'var(--pf-t--global--text--color--subtle)' }}>{row.description}</span>
                                )}
                              </div>
                            </Td>
                            <Td dataLabel="Embedding model" modifier="truncate" id={`col-model-${row.id}`} style={{ verticalAlign: 'middle' }}>
                              {row.embeddingModelConnected ? (
                                <div>
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                    <FlexItem>
                                      <Button
                                        variant="link"
                                        isInline
                                        style={{ padding: 0 }}
                                        onClick={() => navigate(`/gen-ai-studio/asset-endpoints/${row.linkedModelSlug}`)}
                                        id={`col-model-link-${row.id}`}
                                      >
                                        {row.linkedModelName}
                                      </Button>
                                    </FlexItem>
                                    <FlexItem>
                                      <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />
                                    </FlexItem>
                                  </Flex>
                                  <span style={{ display: 'block', color: 'var(--pf-t--global--text--color--subtle)', fontSize: 'var(--pf-t--global--font--size--sm)', marginTop: '0.125rem' }}>
                                    {row.embeddingModel}
                                  </span>
                                </div>
                              ) : (
                                <Popover
                                  headerContent="Embedding model not available"
                                  bodyContent={`This collection requires an endpoint for ${row.embeddingModel}. Contact your administrator to add this model.`}
                                  triggerAction="hover"
                                  position="top"
                                >
                                  <div style={{ cursor: 'pointer' }}>
                                    <Alert variant="warning" isInline isPlain title="Missing model" id={`col-missing-model-alert-${row.id}`} />
                                    <span style={{ color: 'var(--pf-t--global--text--color--disabled)', textDecoration: 'underline', display: 'block', marginTop: '0.25rem' }}>
                                      {row.embeddingModel}
                                    </span>
                                  </div>
                                </Popover>
                              )}
                            </Td>
                            <Td dataLabel="Dimensions" modifier="nowrap" style={{ verticalAlign: 'middle', textAlign: 'right', ...(!row.embeddingModelConnected ? { opacity: 0.5 } : {}) }}>
                              <span style={{ fontFamily: 'var(--pf-t--global--font--family--mono)', fontSize: 'var(--pf-t--global--font--size--sm)' }}>
                                {row.embeddingDimension.toLocaleString('en-US')}
                              </span>
                            </Td>
                            {flags.showVectorStoreTags && (
                            <Td dataLabel="Labels" style={{ verticalAlign: 'middle', ...(!row.embeddingModelConnected ? { opacity: 0.5 } : {}) }}>
                              <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                                {row.owner && (
                                  <FlexItem>
                                    <Tooltip content="Owner">
                                      <Label color="blue" isCompact id={`col-tag-owner-${row.id}`}>{row.owner}</Label>
                                    </Tooltip>
                                  </FlexItem>
                                )}
                                {row.domain && (
                                  <FlexItem>
                                    <Tooltip content="Domain">
                                      <Label color="blue" isCompact id={`col-tag-domain-${row.id}`}>{row.domain}</Label>
                                    </Tooltip>
                                  </FlexItem>
                                )}
                              </Flex>
                            </Td>
                            )}
                            <Td dataLabel="Playground" style={{ verticalAlign: 'middle' }}>
                              {row.embeddingModelConnected ? (
                                row.playgroundState === 'added' ? (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedVectorStoreForPlayground(row.id);
                                      setModalInitialStep(2);
                                      const inferenceIds = getFilteredModalModels().filter(m => m.useCase !== 'Embedding').slice(0, 2).map(m => m.id);
                                      if (selectedModelsForPlayground.size === 0 && inferenceIds.length > 0) {
                                        setSelectedModelsForPlayground(new Set(inferenceIds));
                                      }
                                      setIsModelSelectionModalOpen(true);
                                    }}
                                    id={`col-try-playground-${row.id}`}
                                  >
                                    Try in playground
                                  </Button>
                                ) : (
                                  <Button
                                    variant="link"
                                    onClick={() => {
                                      setSelectedVectorStoreForPlayground(row.id);
                                      setModalInitialStep(2);
                                      const inferenceIds = getFilteredModalModels().filter(m => m.useCase !== 'Embedding').slice(0, 2).map(m => m.id);
                                      if (selectedModelsForPlayground.size === 0 && inferenceIds.length > 0) {
                                        setSelectedModelsForPlayground(new Set(inferenceIds));
                                      }
                                      setIsModelSelectionModalOpen(true);
                                    }}
                                    id={`col-add-playground-${row.id}`}
                                  >
                                    <PlusCircleIcon style={{ marginRight: '0.25rem' }} />
                                    Add to playground
                                  </Button>
                                )
                              ) : null}
                            </Td>
                          </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  </InnerScrollContainer>
                </>
              )}
            </div>
          </Tab>
        </Tabs>
      </PageSection>
      )}

      {/* Register Vector Store Modal */}
      <Modal
        variant={ModalVariant.medium}
        isOpen={isCreateVSModalOpen}
        onClose={() => { setIsCreateVSModalOpen(false); resetVSForm(); }}
        aria-label="Register vector store"
        id="create-vector-store-modal"
      >
        <ModalHeader title="Register vector store" />
        <ModalBody>
          <Form id="create-vector-store-form">
            {/* ── Identity ── */}
            <Title headingLevel="h4" size="md" id="vs-section-identity">Identity</Title>

            <FormGroup label="Store name" isRequired fieldId="vs-store-name">
              <TextInput
                isRequired
                id="vs-store-name"
                value={vsName}
                onChange={(_e, val) => setVsName(val)}
                placeholder="e.g. product-catalog-search"
              />
            </FormGroup>

            <FormGroup label="Provider" isRequired fieldId="vs-provider-select">
              <Select
                id="vs-provider-select"
                isOpen={vsProviderOpen}
                onOpenChange={setVsProviderOpen}
                onSelect={(_e, val) => { setVsProvider(val as VectorStoreProvider); setVsProviderOpen(false); }}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setVsProviderOpen(!vsProviderOpen)}
                    isExpanded={vsProviderOpen}
                    isFullWidth
                    id="vs-provider-toggle"
                  >
                    {vsProvider || 'Select a provider'}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {vectorStoreProviders.map(p => (
                    <SelectOption key={p} value={p} isSelected={vsProvider === p}>{p}</SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FormGroup>

            {/* ── Connection ── */}
            <Divider style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }} />
            <Title headingLevel="h4" size="md" id="vs-section-connection">Connection</Title>

            <FormGroup label="Endpoint URL" isRequired fieldId="vs-endpoint">
              <TextInput
                isRequired
                id="vs-endpoint"
                value={vsEndpoint}
                onChange={(_e, val) => setVsEndpoint(val)}
                placeholder={vsProvider === 'PGVector' ? 'postgresql://host:5432/dbname' : vsProvider === 'Milvus' ? 'milvus.ns.svc.cluster.local:19530' : 'https://qdrant.example.com:6333'}
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>Kubernetes service name or external URL for the vector database.</HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>

            <FormGroup label="Collection / Index name" isRequired fieldId="vs-collection">
              <TextInput
                isRequired
                id="vs-collection"
                value={vsCollection}
                onChange={(_e, val) => setVsCollection(val)}
                placeholder="e.g. product_embeddings"
              />
            </FormGroup>

            <FormGroup label="Secret reference" fieldId="vs-secret-ref">
              <TextInput
                id="vs-secret-ref"
                value={vsSecretRef}
                onChange={(_e, val) => setVsSecretRef(val)}
                placeholder="e.g. pgvector-credentials"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>Name of the Kubernetes Secret containing database credentials (namespace-scoped). Leave empty if no auth required.</HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>

            {/* ── Embedding Model ── */}
            <Divider style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }} />
            <Title headingLevel="h4" size="md" id="vs-section-embedding">Embedding model</Title>

            <FormGroup label="Select embedding model" isRequired fieldId="vs-model-select">
              <Select
                id="vs-model-select"
                isOpen={vsModelOpen}
                onOpenChange={setVsModelOpen}
                onSelect={(_e, val) => { setVsModelId(val as string); setVsModelOpen(false); }}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setVsModelOpen(!vsModelOpen)}
                    isExpanded={vsModelOpen}
                    isFullWidth
                    id="vs-model-toggle"
                  >
                    {selectedVsModel ? selectedVsModel.name : 'Select an embedding model'}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {embeddingModels.length === 0 ? (
                    <SelectOption isDisabled value="none">
                      No embedding models available — add one in the Models tab first
                    </SelectOption>
                  ) : (
                    embeddingModels.map(m => (
                      <SelectOption key={m.id} value={m.id} isSelected={vsModelId === m.id} description={m.modelId}>
                        {m.name}
                      </SelectOption>
                    ))
                  )}
                </SelectList>
              </Select>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    The vector store will only be visible in the AAE table when this embedding model is available. If the model is removed, the store is hidden.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>

            <FormGroup label="Dimensions" fieldId="vs-dimensions">
              <TextInput
                id="vs-dimensions"
                value={vsAutoFilledDimensions ? String(vsAutoFilledDimensions) : ''}
                readOnlyVariant="default"
                placeholder="Auto-filled from selected model"
              />
              {vsAutoFilledDimensions && (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem variant="success">
                      Dimension set automatically based on {selectedVsModel?.name}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              )}
              {vsModelId && !vsAutoFilledDimensions && (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem variant="warning">
                      Could not determine dimensions for this model. Please verify manually.
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              )}
            </FormGroup>

            <FormGroup label="Distance metric" isRequired fieldId="vs-distance-metric">
              <Select
                id="vs-distance-metric"
                isOpen={vsDistanceOpen}
                onOpenChange={setVsDistanceOpen}
                onSelect={(_e, val) => { setVsDistanceMetric(val as DistanceMetric); setVsDistanceOpen(false); }}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setVsDistanceOpen(!vsDistanceOpen)}
                    isExpanded={vsDistanceOpen}
                    isFullWidth
                    id="vs-distance-toggle"
                  >
                    {{ cosine: 'Cosine', euclidean: 'Euclidean', dotproduct: 'Dot Product' }[vsDistanceMetric]}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="cosine" isSelected={vsDistanceMetric === 'cosine'} description="Best for normalized embeddings, most common">
                    Cosine
                  </SelectOption>
                  <SelectOption value="euclidean" isSelected={vsDistanceMetric === 'euclidean'} description="Sensitive to magnitude differences">
                    Euclidean
                  </SelectOption>
                  <SelectOption value="dotproduct" isSelected={vsDistanceMetric === 'dotproduct'} description="Fast, works well with normalized vectors">
                    Dot Product
                  </SelectOption>
                </SelectList>
              </Select>
            </FormGroup>

            {/* ── Metadata ── */}
            <Divider style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }} />
            <Title headingLevel="h4" size="md" id="vs-section-metadata">Metadata (optional)</Title>

            <FormGroup label="Description" fieldId="vs-description">
              <TextArea
                id="vs-description"
                value={vsDescription}
                onChange={(_e, val) => setVsDescription(val)}
                placeholder="Describe what data this store contains and its intended use"
                rows={2}
              />
            </FormGroup>

            <FormGroup label="Owner" fieldId="vs-owner">
              <TextInput
                id="vs-owner"
                value={vsOwner}
                onChange={(_e, val) => setVsOwner(val)}
                placeholder="e.g. Platform Team — Search"
              />
            </FormGroup>

            <FormGroup label="Domain" fieldId="vs-domain">
              <TextInput
                id="vs-domain"
                value={vsDomain}
                onChange={(_e, val) => setVsDomain(val)}
                placeholder="e.g. Product, Engineering, Customer Support"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={handleCreateVectorStore}
            isDisabled={!isCreateVSFormValid}
            id="vs-modal-create-button"
          >
            Register vector store
          </Button>
          <Button variant="link" onClick={() => { setIsCreateVSModalOpen(false); resetVSForm(); }} id="vs-modal-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Vector Store Endpoint Detail Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={!!vsEndpointModalStore}
        onClose={() => setVsEndpointModalOpen(null)}
        aria-labelledby="vs-endpoint-modal-title"
        aria-describedby="vs-endpoint-modal-description"
        id="vs-endpoint-detail-modal"
      >
        {vsEndpointModalStore && (
          <>
            <ModalHeader title="Endpoints" labelId="vs-endpoint-modal-title" />
            <ModalBody id="vs-endpoint-modal-description">
              <Grid hasGutter>
                {/* Left Column — Connection fields */}
                <GridItem span={5}>
                  <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    Connection details for <strong>{vsEndpointModalStore.name}</strong>.
                    Use the endpoint URL and collection name to query this vector store from your application.
                  </Content>
                  <Form>
                    <FormGroup label="Endpoint URL" fieldId={`vs-modal-endpoint-${vsEndpointModalStore.id}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TextInput
                          id={`vs-modal-endpoint-${vsEndpointModalStore.id}`}
                          value={vsEndpointModalStore.endpoint}
                          readOnly
                          aria-label="Endpoint URL"
                          style={{ fontFamily: 'monospace', flex: 1 }}
                        />
                        <Tooltip content={copiedItems.has(`vs-endpoint-${vsEndpointModalStore.id}`) ? 'Copied' : 'Copy endpoint'}>
                          <Button
                            variant="control"
                            aria-label="Copy endpoint URL"
                            onClick={() => handleCopyWithFeedback(vsEndpointModalStore.endpoint, `vs-endpoint-${vsEndpointModalStore.id}`)}
                            id={`copy-vs-endpoint-${vsEndpointModalStore.id}`}
                          >
                            {copiedItems.has(`vs-endpoint-${vsEndpointModalStore.id}`) ? <CheckCircleIcon /> : <CopyIcon />}
                          </Button>
                        </Tooltip>
                      </div>
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem>
                            Use this endpoint to connect to the {vsEndpointModalStore.provider} vector database.
                          </HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    </FormGroup>

                    <FormGroup label="Collection / Index" fieldId={`vs-modal-collection-${vsEndpointModalStore.id}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TextInput
                          id={`vs-modal-collection-${vsEndpointModalStore.id}`}
                          value={vsEndpointModalStore.collection}
                          readOnly
                          aria-label="Collection name"
                          style={{ fontFamily: 'monospace', flex: 1 }}
                        />
                        <Tooltip content={copiedItems.has(`vs-collection-${vsEndpointModalStore.id}`) ? 'Copied' : 'Copy collection name'}>
                          <Button
                            variant="control"
                            aria-label="Copy collection name"
                            onClick={() => handleCopyWithFeedback(vsEndpointModalStore.collection, `vs-collection-${vsEndpointModalStore.id}`)}
                            id={`copy-vs-collection-${vsEndpointModalStore.id}`}
                          >
                            {copiedItems.has(`vs-collection-${vsEndpointModalStore.id}`) ? <CheckCircleIcon /> : <CopyIcon />}
                          </Button>
                        </Tooltip>
                      </div>
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem>
                            The target collection or index within the vector database.
                          </HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    </FormGroup>

                    <FormGroup label="Secret reference" fieldId={`vs-modal-secret-${vsEndpointModalStore.id}`}>
                      {vsEndpointModalStore.secretRef ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <TextInput
                            id={`vs-modal-secret-${vsEndpointModalStore.id}`}
                            value={vsEndpointModalStore.secretRef}
                            readOnly
                            aria-label="Secret reference"
                            style={{ fontFamily: 'monospace', flex: 1 }}
                          />
                          <Tooltip content={copiedItems.has(`vs-secret-${vsEndpointModalStore.id}`) ? 'Copied' : 'Copy secret name'}>
                            <Button
                              variant="control"
                              aria-label="Copy secret reference"
                              onClick={() => handleCopyWithFeedback(vsEndpointModalStore.secretRef, `vs-secret-${vsEndpointModalStore.id}`)}
                              id={`copy-vs-secret-${vsEndpointModalStore.id}`}
                            >
                              {copiedItems.has(`vs-secret-${vsEndpointModalStore.id}`) ? <CheckCircleIcon /> : <CopyIcon />}
                            </Button>
                          </Tooltip>
                        </div>
                      ) : (
                        <TextInput
                          id={`vs-modal-secret-${vsEndpointModalStore.id}`}
                          value="Not configured"
                          readOnly
                          aria-label="Secret reference"
                          isDisabled
                        />
                      )}
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem>
                            Kubernetes Secret containing database credentials (namespace-scoped).
                          </HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    </FormGroup>
                  </Form>
                </GridItem>

                {/* Right Column — Usage example */}
                <GridItem span={7}>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    <FlexItem>
                      <Content component="h3" style={{ margin: 0 }}>Usage example</Content>
                    </FlexItem>
                    <FlexItem>
                      <Tooltip content={copiedItems.has(`vs-usage-${vsEndpointModalStore.id}`) ? 'Copied' : 'Copy'}>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            const code = vsEndpointModalStore.provider === 'PGVector'
                              ? `import psycopg2\n\nconn = psycopg2.connect("${vsEndpointModalStore.endpoint}")\ncur = conn.cursor()\n\n# Query similar vectors\nquery_embedding = [0.1, 0.2, ...]  # ${vsEndpointModalStore.dimensions}-dim vector\ncur.execute(\n    "SELECT id, content, embedding <=> %s::vector AS distance "\n    "FROM ${vsEndpointModalStore.collection} "\n    "ORDER BY distance LIMIT 5",\n    (query_embedding,)\n)\n\nresults = cur.fetchall()\nfor row in results:\n    print(row)`
                              : vsEndpointModalStore.provider === 'Milvus'
                              ? `from pymilvus import connections, Collection\n\nconnections.connect(uri="${vsEndpointModalStore.endpoint}")\ncollection = Collection("${vsEndpointModalStore.collection}")\ncollection.load()\n\n# Query similar vectors\nquery_embedding = [[0.1, 0.2, ...]]  # ${vsEndpointModalStore.dimensions}-dim vector\nresults = collection.search(\n    data=query_embedding,\n    anns_field="embedding",\n    param={"metric_type": "${vsEndpointModalStore.distanceMetric === 'cosine' ? 'COSINE' : vsEndpointModalStore.distanceMetric === 'dotproduct' ? 'IP' : 'L2'}"},\n    limit=5,\n    output_fields=["content"]\n)\n\nfor hits in results:\n    for hit in hits:\n        print(hit.entity.get("content"), hit.distance)`
                              : `from qdrant_client import QdrantClient\n\nclient = QdrantClient(url="${vsEndpointModalStore.endpoint}")\n\n# Query similar vectors\nquery_embedding = [0.1, 0.2, ...]  # ${vsEndpointModalStore.dimensions}-dim vector\nresults = client.search(\n    collection_name="${vsEndpointModalStore.collection}",\n    query_vector=query_embedding,\n    limit=5\n)\n\nfor point in results:\n    print(point.payload, point.score)`;
                            handleCopyWithFeedback(code, `vs-usage-${vsEndpointModalStore.id}`);
                          }}
                          icon={copiedItems.has(`vs-usage-${vsEndpointModalStore.id}`) ? <CheckCircleIcon /> : <CopyIcon />}
                          id={`copy-vs-usage-${vsEndpointModalStore.id}`}
                        >
                          {copiedItems.has(`vs-usage-${vsEndpointModalStore.id}`) ? 'Copied' : 'Copy'}
                        </Button>
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                  <CodeBlock id={`vs-usage-code-${vsEndpointModalStore.id}`}>
                    <CodeBlockCode>
                      {vsEndpointModalStore.provider === 'PGVector'
                        ? `import psycopg2

conn = psycopg2.connect("${vsEndpointModalStore.endpoint}")
cur = conn.cursor()

# Query similar vectors
query_embedding = [0.1, 0.2, ...]  # ${vsEndpointModalStore.dimensions}-dim vector
cur.execute(
    "SELECT id, content, embedding <=> %s::vector AS distance "
    "FROM ${vsEndpointModalStore.collection} "
    "ORDER BY distance LIMIT 5",
    (query_embedding,)
)

results = cur.fetchall()
for row in results:
    print(row)`
                        : vsEndpointModalStore.provider === 'Milvus'
                        ? `from pymilvus import connections, Collection

connections.connect(uri="${vsEndpointModalStore.endpoint}")
collection = Collection("${vsEndpointModalStore.collection}")
collection.load()

# Query similar vectors
query_embedding = [[0.1, 0.2, ...]]  # ${vsEndpointModalStore.dimensions}-dim vector
results = collection.search(
    data=query_embedding,
    anns_field="embedding",
    param={"metric_type": "${vsEndpointModalStore.distanceMetric === 'cosine' ? 'COSINE' : vsEndpointModalStore.distanceMetric === 'dotproduct' ? 'IP' : 'L2'}"},
    limit=5,
    output_fields=["content"]
)

for hits in results:
    for hit in hits:
        print(hit.entity.get("content"), hit.distance)`
                        : `from qdrant_client import QdrantClient

client = QdrantClient(url="${vsEndpointModalStore.endpoint}")

# Query similar vectors
query_embedding = [0.1, 0.2, ...]  # ${vsEndpointModalStore.dimensions}-dim vector
results = client.search(
    collection_name="${vsEndpointModalStore.collection}",
    query_vector=query_embedding,
    limit=5
)

for point in results:
    print(point.payload, point.score)`}
                    </CodeBlockCode>
                  </CodeBlock>
                </GridItem>
              </Grid>

            </ModalBody>
            <ModalFooter>
              <Button variant="primary" onClick={() => setVsEndpointModalOpen(null)} id="vs-endpoint-modal-close-button">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Endpoint Creation Progress Modal */}
      <Modal
        variant={ModalVariant.small}
        title="Creating Endpoint"
        isOpen={isCreatingEndpoint}
        onClose={() => {}} // Prevent closing during creation
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl">
            Creating Endpoint
          </Title>
        </ModalHeader>
        <ModalBody>
          <div className="pf-v5-u-mb-lg">
            <div className="pf-v5-u-mb-md">{currentProgressMessage}</div>
            <Progress value={creationProgress} />
          </div>
        </ModalBody>
      </Modal>

      {/* Endpoint Creation Progress Modal */}
      <EndpointCreationProgressModal
        isOpen={isCreatingEndpoint}
        progressMessage={currentProgressMessage}
        progressValue={creationProgress}
      />

      {/* Model Selection Modal */}
      <ModelSelectionModal
        isOpen={isModelSelectionModalOpen}
        onClose={handleCancelModelSelection}
        onConfigure={handleConfigurePlayground}
        initialStep={modalInitialStep}
        selectedModels={selectedModelsForPlayground}
        onModelToggle={handleModelSelectionToggle}
        onSelectAll={() => {
          const availableModels = getFilteredModalModels();
          if (selectedModelsForPlayground.size === availableModels.length) {
            setSelectedModelsForPlayground(new Set());
          } else {
            setSelectedModelsForPlayground(new Set(availableModels.map(m => m.id)));
          }
        }}
        filteredModels={getFilteredModalModels()}
        filterBy={modalFilterBy}
        onFilterByChange={(value) => setModalFilterBy(value)}
        searchText={modalSearchText}
        onSearchTextChange={(value) => setModalSearchText(value)}
        isFilterDropdownOpen={isModalFilterDropdownOpen}
        onFilterDropdownToggle={(isOpen) => setIsModalFilterDropdownOpen(isOpen)}
        onNavigateToModels={() => navigate('/ai-assets/models')}
        showEmptyState={showEmptyState}
        selectedProject={selectedProjectForPlayground}
        onProjectChange={(project) => setSelectedProjectForPlayground(project)}
        isProjectSelectOpen={emptyStateProjectSelectOpen}
        onProjectSelectOpenChange={(isOpen) => setEmptyStateProjectSelectOpen(isOpen)}
        onEmptyStateConfigure={() => {
          setShowEmptyState(false);
        }}
        vectorStores={visibleVectorStores.map(s => ({
          id: s.id,
          name: s.name,
          provider: s.provider,
          status: s.status,
          linkedModelName: s.linkedModelName,
          domain: s.domain,
        }))}
        selectedVectorStoreId={selectedVectorStoreForPlayground}
        onVectorStoreSelect={(storeId) => setSelectedVectorStoreForPlayground(storeId)}
        collections={collectionOptionsForModal}
        selectedCollections={collectionsRegisteredInPlayground}
        onCollectionToggle={(collectionId) => {
          setCollectionsRegisteredInPlayground(prev => {
            const next = new Set(prev);
            if (next.has(collectionId)) next.delete(collectionId);
            else next.add(collectionId);
            return next;
          });
        }}
        preSelectedCollectionId={selectedVectorStoreForPlayground}
      />

      {/* Auto Config Modal */}
      <AutoConfigModal
        isOpen={isAddingToPlayground}
        onClose={configProgress === 100 ? handleConfirmAddToPlayground : undefined}
        onCancel={handleCancelAddToPlayground}
        configProgress={configProgress}
        currentConfigStep={currentConfigStep}
        configSteps={configSteps}
        modelNames={Array.from(selectedModelsForPlayground).map(id => mockModels.find(m => m.id === id)?.name).filter(name => name).join(', ')}
      />

      {/* Deploy Model Modal */}
      <ModelDeploymentModal
        isOpen={isCreateEndpointModalOpen}
        onClose={handleCancelCreateEndpoint}
        onDeploy={handleConfirmCreateEndpoint}
        selectedProject={selectedProject}
      />

      {/* Token Copy Modal */}
      <TokenCopyModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        tokenType={tokenType}
        token={selectedToken}
      />

      {/* Tools Modal */}
      <ToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        selectedServer={selectedServerForTools}
        tools={selectedServerForTools ? getServerTools(selectedServerForTools.slug) : []}
      />

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={handleCloseAddAssetModal}
        onSubmit={handleAddAsset}
        isFormValid={isAddAssetFormValid}
        modelType={addExternalModelType}
        setModelType={setAddExternalModelType}
        modelName={addExternalModelName}
        setModelName={setAddExternalModelName}
        modelAlias={addExternalModelAlias}
        setModelAlias={setAddExternalModelAlias}
        url={addExternalUrl}
        setUrl={setAddExternalUrl}
        token={addExternalToken}
        setToken={setAddExternalToken}
        useCase={addExternalUseCase}
        setUseCase={setAddExternalUseCase}
        embeddingDimension={addExternalEmbeddingDimension}
        setEmbeddingDimension={setAddExternalEmbeddingDimension}
        useBadgeModelType={useBadgeModelType}
        displayNameRequired={hideSourceColumn}
        existingDisplayNames={existingDisplayNames}
      />

      {/* Endpoint Type Picker Modal (Version 3 / Ideal UXD) */}
      <Modal
        isOpen={isEndpointTypePickerOpen}
        onClose={() => setIsEndpointTypePickerOpen(false)}
        aria-labelledby="endpoint-type-picker-title"
        aria-describedby="endpoint-type-picker-body"
        variant={ModalVariant.medium}
        id="endpoint-type-picker-modal"
      >
        <ModalHeader
          title={hideSourceColumn ? 'Create endpoint' : 'Register endpoint'}
          description={hideSourceColumn ? 'Select the type of endpoint you want to create.' : 'Select the type of endpoint you want to register.'}
          labelId="endpoint-type-picker-title"
        />
        <ModalBody id="endpoint-type-picker-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                value: 'namespace' as const,
                title: 'Project model endpoint',
                description: 'Deploy a model from the catalog to your project. The endpoint will be accessible within the cluster and optionally via a public route.'
              },
              {
                value: 'maas' as const,
                title: 'MaaS endpoint',
                description: 'Publish a model as a managed service. The endpoint will be shared across projects via the API gateway and managed by an administrator.'
              },
              {
                value: 'external' as const,
                title: 'Create endpoint',
                description: 'Connect to a third-party model provider (e.g. OpenAI, Google, Anthropic) by providing a URL and API key.'
              }
            ].map((option) => (
              <Card
                key={option.value}
                isSelectable
                isSelected={selectedEndpointType === option.value}
                onClick={() => setSelectedEndpointType(option.value)}
                id={`endpoint-type-card-${option.value}`}
                style={{ cursor: 'pointer' }}
              >
                <CardHeader
                  selectableActions={{
                    selectableActionId: `endpoint-type-radio-${option.value}`,
                    selectableActionAriaLabelledby: `endpoint-type-label-${option.value}`,
                    name: 'endpoint-type-selection',
                    variant: 'single'
                  }}
                >
                  <CardTitle id={`endpoint-type-label-${option.value}`}>
                    {option.title}
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <Content>
                    <small style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                      {option.description}
                    </small>
                  </Content>
                </CardBody>
              </Card>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            key="next"
            variant="primary"
            onClick={() => {
              setIsEndpointTypePickerOpen(false);
              if (selectedEndpointType === 'external') {
                setIsAddAssetModalOpen(true);
              } else if (selectedEndpointType === 'maas') {
                setPublishMaasModelId('new');
                setPublishMaasCheckbox(false);
                setIsPublishMaasModalOpen(true);
              } else {
                setIsCreateEndpointModalOpen(true);
              }
            }}
            id="endpoint-type-next-button"
          >
            Next
          </Button>
          <Button
            key="cancel"
            variant="link"
            onClick={() => setIsEndpointTypePickerOpen(false)}
            id="endpoint-type-cancel-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Publish as MaaS Endpoint Modal */}
      <Modal
        isOpen={isPublishMaasModalOpen}
        onClose={() => {
          setIsPublishMaasModalOpen(false);
          setPublishMaasModelId(null);
          setPublishMaasCheckbox(false);
        }}
        aria-labelledby="publish-maas-modal-title"
        aria-describedby="publish-maas-modal-body"
        variant={ModalVariant.medium}
        id="publish-maas-modal"
      >
        <ModalHeader
          title="Publish as MaaS endpoint"
          labelId="publish-maas-modal-title"
        />
        <ModalBody id="publish-maas-modal-body">
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Publishing this endpoint as a Model as a Service (MaaS) model will enable other users in any project to access the model through the API gateway.
            </p>
            <Alert
              variant="info"
              isInline
              title="Administrator action required"
              id="publish-maas-admin-alert"
              style={{ marginBottom: '1rem' }}
            >
              After publishing, a cluster administrator will need to add this model to a subscription in order to make it fully available to all users. This action registers your intent to share the model and makes it discoverable by administrators.
            </Alert>
          </div>
          <Form>
            <FormGroup fieldId="publish-maas-checkbox">
              <Checkbox
                id="publish-maas-checkbox"
                label="Yes, make available as a MaaS model"
                isChecked={publishMaasCheckbox}
                onChange={(_event, checked) => setPublishMaasCheckbox(checked)}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            key="confirm"
            variant="primary"
            onClick={() => {
              if (publishMaasModelId) {
                setPublishedAsMaasModels(prev => new Set([...prev, publishMaasModelId]));
              }
              setIsPublishMaasModalOpen(false);
              setPublishMaasModelId(null);
              setPublishMaasCheckbox(false);
            }}
            isDisabled={!publishMaasCheckbox}
            id="publish-maas-confirm-button"
          >
            Confirm
          </Button>
          <Button
            key="cancel"
            variant="link"
            onClick={() => {
              setIsPublishMaasModalOpen(false);
              setPublishMaasModelId(null);
              setPublishMaasCheckbox(false);
            }}
            id="publish-maas-cancel-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Remove asset confirmation modal */}
      <Modal
        isOpen={isRemoveAssetModalOpen}
        onClose={() => {
          setIsRemoveAssetModalOpen(false);
          setModelToRemove(null);
        }}
        aria-labelledby="remove-asset-modal-title"
        aria-describedby="remove-asset-modal-body"
        variant={ModalVariant.small}
        id="remove-asset-modal"
      >
        <ModalHeader
          title="Remove asset?"
          labelId="remove-asset-modal-title"
        />
        <ModalBody id="remove-asset-modal-body">
          <p>
            <strong>{modelToRemove?.name}</strong> will be removed from this project&apos;s endpoints list.
            {modelToRemove?.source === 'external'
              ? ' The endpoint configuration will be deleted.'
              : ' The model will no longer appear in the table.'}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            key="confirm"
            variant="danger"
            onClick={handleRemoveAsset}
            id="remove-asset-confirm-button"
          >
            Remove
          </Button>
          <Button
            key="cancel"
            variant="link"
            onClick={() => {
              setIsRemoveAssetModalOpen(false);
              setModelToRemove(null);
            }}
            id="remove-asset-cancel-button"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

    </>
  );
};

export default AvailableAIAssets;
