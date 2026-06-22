import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  CodeBlock,
  CodeBlockCode,
  Content,
  ContentVariants,
  Divider,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  MenuToggle,
  PageSection,
  Select,
  SelectList,
  SelectOption,
  Tab,
  TabTitleText,
  Tabs,
  TextInput,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CopyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@patternfly/react-icons';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { useFeatureFlags } from '../../utils/FeatureFlagsContext';
import GenericModelSvgIcon from '@app/assets/generic-model-icon.svg';

// Types
interface ModelAsset {
  id: string;
  name: string;
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
  hasReasoning?: boolean;
  status: string;
  statusColor: string;
  availability?: 'unpublished' | 'pending' | 'available';
  provider?: string;
  source?: 'deployed' | 'external';
}

// Mock data - same as in AIAssets.tsx
const mockModels: ModelAsset[] = [
  {
    id: '1',
    name: 'llama-3.1-8b-instruct',
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
    hasReasoning: false,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635',
    provider: 'Meta',
  },
  {
    id: '2',
    name: 'granite-7b-code',
    slug: 'granite-7b-code',
    internalEndpoint: 'http://granite-7b-code.demo-namespace.svc.cluster.local:8080/v1',
    internalToken: 'sk-internal-granite-789',
    llsStatus: 'not-registered',
    useCase: 'Code generation',
    description: 'IBM Granite 7B model specialized for code generation tasks',
    framework: 'TGI',
    version: '1.0',
    hasReasoning: false,
    status: 'Running',
    statusColor: '#3e8635',
    provider: 'IBM',
  },
  {
    id: '3',
    name: 'mistral-7b-instruct',
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
    hasReasoning: true,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635',
    provider: 'Mistral AI',
  },
  {
    id: '4',
    name: 'gpt-oss-120b-FP8-Dynamic',
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
    hasReasoning: true,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635',
    provider: 'Open Source',
  },
  {
    id: '5',
    name: 'Pixtral-Large-Instruct-2411-hf-quantized.w8a8',
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
    hasReasoning: true,
    availability: 'available',
    status: 'Running',
    statusColor: '#3e8635',
    provider: 'Mistral AI',
  },
  {
    id: '6',
    name: 'codellama-34b-instruct',
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
    hasReasoning: false,
    availability: 'pending',
    status: 'Running',
    statusColor: '#3e8635',
    provider: 'Meta',
  },
  {
    id: 'external-embedding-1',
    name: 'Granite Embedding 125M',
    slug: 'ibm-granite-granite-embedding-125m-english',
    internalEndpoint: '',
    externalEndpoint: 'https://inference.example.com/v1',
    llsStatus: 'not-registered',
    useCase: 'Embedding',
    description: 'IBM Granite 125M parameter English embedding model for RAG and semantic search.',
    framework: 'vLLM',
    version: '1.0',
    hasReasoning: false,
    status: 'Running',
    statusColor: '#3e8635',
    source: 'external',
    provider: 'IBM',
  },
  {
    id: 'external-embedding-2',
    name: 'Nomic Embed Text v1.5',
    slug: 'nomic-ai-nomic-embed-text-v1.5',
    internalEndpoint: '',
    externalEndpoint: 'https://inference.example.com/v1',
    llsStatus: 'not-registered',
    useCase: 'Embedding',
    description: 'Nomic AI open-source text embedding model with 768-dimensional output for semantic search.',
    framework: 'vLLM',
    version: '1.5',
    hasReasoning: false,
    status: 'Running',
    statusColor: '#3e8635',
    source: 'external',
    provider: 'Nomic AI',
  },
];

// Function to format model deployment names
const formatModelName = (name: string): string => {
  return name
    .replace(/:[0-9]+(\.[0-9]+)*$/, '') // Remove version numbers like :1.4.0, :1.1, :9.1.1
    .replace(/-/g, ' ') // Remove dashes
    .replace(/\bgpt\b/gi, 'GPT') // Capitalize GPT
    .replace(/\bgranite\b/gi, 'Granite') // Capitalize Granite
    .replace(/\bmistral\b/gi, 'Mistral'); // Capitalize Mistral
};

// Mock data for user's API keys and subscriptions
const mockMaaSSubscriptions = [
  { id: 'sub-enterprise-2026-001', name: 'Enterprise Plan', tier: 'Enterprise', rateLimit: '10,000 req/min' },
  { id: 'sub-team-2026-002', name: 'Team Plan', tier: 'Team', rateLimit: '1,000 req/min' },
  { id: 'sub-dev-2026-003', name: 'Developer Plan', tier: 'Developer', rateLimit: '100 req/min' }
];

// Code language type for usage examples
type CodeLanguage = 'curl' | 'python' | 'javascript' | 'java' | 'go';

// Check if model is MaaS (self-service)
const isMaaSModel = (model: ModelAsset): boolean => {
  return model.availability === 'available' || model.availability === 'pending';
};

type EndpointModelDetailsProps = Record<string, never>;

const EndpointModelDetails: React.FunctionComponent<EndpointModelDetailsProps> = () => {
  const { modelSlug } = useParams<{ modelSlug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useFeatureFlags();
  
  // Find the model by slug — check base models first, then user-added external models from localStorage
  const model = React.useMemo(() => {
    const found = mockModels.find(m => m.slug === modelSlug);
    if (found) return found;
    try {
      const externalModels: ModelAsset[] = JSON.parse(localStorage.getItem('externalModels') || '[]');
      return externalModels.find(m => m.slug === modelSlug) || null;
    } catch {
      return null;
    }
  }, [modelSlug]);
  
  // Copy functionality
  const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
  
  const handleCopyWithFeedback = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
  };
  
  // API Key and Subscription state for Endpoints tab
  const [selectedSubscriptionId, setSelectedSubscriptionId] = React.useState<string>(mockMaaSSubscriptions[0]?.id || '');
  const [isSubscriptionSelectOpen, setIsSubscriptionSelectOpen] = React.useState(false);
  const [activeLanguageTab, setActiveLanguageTab] = React.useState<CodeLanguage>('curl');
  
  // External endpoint token authentication state
  const [externalTokenAuthEnabled, setExternalTokenAuthEnabled] = React.useState(false);
  const [externalGeneratedToken, setExternalGeneratedToken] = React.useState<string | null>(null);
  const [isGeneratingExternalToken, setIsGeneratingExternalToken] = React.useState(false);
  const [showExternalToken, setShowExternalToken] = React.useState(false);
  
  const isMaaS = model ? isMaaSModel(model) : false;

  useDocumentTitle(model ? `${formatModelName(model.name)} - Endpoint Details` : 'Endpoint Details');

  const generateAPIKey = (): string => {
    const prefix = 'sk-';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < 48; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateExternalToken = async () => {
    setIsGeneratingExternalToken(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const token = generateAPIKey();
    setExternalGeneratedToken(token);
    setIsGeneratingExternalToken(false);
  };
  
  const getSelectedApiKeyToken = () => '$API_KEY';
  
  const selectedSubscription = mockMaaSSubscriptions.find(s => s.id === selectedSubscriptionId);
  
  // Check if this is an external model without auth by default (currently none)
  const isExternalModelWithoutAuth = false;
  
  // Generate code examples
  const getCodeExamples = (): Record<CodeLanguage, { label: string; code: string }> | null => {
    if (!model) return null;
    
    const apiKeyToken = getSelectedApiKeyToken();
    const subscriptionHeader = selectedSubscriptionId;
    const endpointForExamples = isMaaS ? model.externalEndpoint : (model.externalEndpoint || model.internalEndpoint);
    
    const curlAuthHeader = isMaaS ? `\n  -H "Authorization: Bearer ${apiKeyToken}"` : '';
    const curlSubscriptionHeader = isMaaS && subscriptionHeader 
      ? `\n  -H "X-MAAS-SUBSCRIPTION: ${subscriptionHeader}"` 
      : '';
    
    const pythonAuthHeader = isMaaS ? `,\n    "Authorization": "Bearer ${apiKeyToken}"` : '';
    const pythonSubscriptionHeader = isMaaS && subscriptionHeader
      ? `,\n    "X-MAAS-SUBSCRIPTION": "${subscriptionHeader}"`
      : '';
    
    const jsAuthHeader = isMaaS ? `,\n    'Authorization': 'Bearer ${apiKeyToken}'` : '';
    const jsSubscriptionHeader = isMaaS && subscriptionHeader
      ? `,\n    'X-MAAS-SUBSCRIPTION': '${subscriptionHeader}'`
      : '';
    
    const javaAuthHeader = isMaaS ? `\n    .header("Authorization", "Bearer ${apiKeyToken}")` : '';
    const javaSubscriptionHeader = isMaaS && subscriptionHeader
      ? `\n    .header("X-MAAS-SUBSCRIPTION", "${subscriptionHeader}")`
      : '';
    
    const goAuthHeader = isMaaS ? `\n    req.Header.Set("Authorization", "Bearer ${apiKeyToken}")` : '';
    const goSubscriptionHeader = isMaaS && subscriptionHeader
      ? `\n    req.Header.Set("X-MAAS-SUBSCRIPTION", "${subscriptionHeader}")`
      : '';

    return {
      curl: {
        label: 'cURL',
        code: `curl -X POST ${endpointForExamples}/chat/completions \\
  -H "Content-Type: application/json"${curlAuthHeader}${curlSubscriptionHeader} \\
  -d '{
    "model": "${model.name}",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 150
  }'`,
      },
      python: {
        label: 'Python',
        code: `import requests

url = "${endpointForExamples}/chat/completions"
headers = {
    "Content-Type": "application/json"${pythonAuthHeader}${pythonSubscriptionHeader}
}

payload = {
    "model": "${model.name}",
    "messages": [
        {
            "role": "user",
            "content": "Hello, how are you?"
        }
    ],
    "temperature": 0.7,
    "max_tokens": 150
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`,
      },
      javascript: {
        label: 'JavaScript',
        code: `const response = await fetch('${endpointForExamples}/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'${jsAuthHeader}${jsSubscriptionHeader}
  },
  body: JSON.stringify({
    model: '${model.name}',
    messages: [
      {
        role: 'user',
        content: 'Hello, how are you?'
      }
    ],
    temperature: 0.7,
    max_tokens: 150
  })
});

const data = await response.json();
console.log(data);`,
      },
      java: {
        label: 'Java',
        code: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();

String requestBody = """
    {
        "model": "${model.name}",
        "messages": [
            {
                "role": "user",
                "content": "Hello, how are you?"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 150
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${endpointForExamples}/chat/completions"))
    .header("Content-Type", "application/json")${javaAuthHeader}${javaSubscriptionHeader}
    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
      },
      go: {
        label: 'Go',
        code: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    url := "${endpointForExamples}/chat/completions"

    payload := map[string]interface{}{
        "model": "${model.name}",
        "messages": []map[string]string{
            {
                "role":    "user",
                "content": "Hello, how are you?",
            },
        },
        "temperature": 0.7,
        "max_tokens": 150,
    }

    jsonData, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")${goAuthHeader}${goSubscriptionHeader}

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    fmt.Println(result)
}`,
      },
    };
  };
  
  const codeExamples = getCodeExamples();

  const renderHighlightedCode = (code: string, highlights: string[]) => {
    const terms = highlights.filter(Boolean);
    if (terms.length === 0) return code;
    const escaped = terms.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'g');
    const parts = code.split(pattern);
    return parts.map((part, i) =>
      terms.includes(part) ? (
        <span
          key={i}
          style={{
            backgroundColor: '#fdf0d5',
            color: '#795600',
            borderRadius: '3px',
            padding: '1px 4px',
            fontWeight: 600,
          }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  if (!model) {
    return (
      <PageSection>
        <Title headingLevel="h1" size="2xl">Model Not Found</Title>
        <p>The requested model could not be found.</p>
        <Button variant="primary" onClick={() => navigate('/gen-ai-studio/asset-endpoints')}>
          Back to AI Asset Endpoints
        </Button>
      </PageSection>
    );
  }

  return (
    <PageSection isFilled style={{ padding: 0, minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <PageSection style={{ paddingBottom: 0 }}>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/gen-ai-studio/asset-endpoints">
              AI asset endpoints
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{formatModelName(model.name)}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      {/* Header */}
      <PageSection style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            {/* Icon */}
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}
              dangerouslySetInnerHTML={{ __html: GenericModelSvgIcon }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <Title headingLevel="h1" size="2xl" style={{ margin: 0 }}>
                  {formatModelName(model.name)}
                </Title>
                <Label variant="outline" id="asset-type-label">
                  {model.source === 'external' ? 'Created endpoint' : 'Model endpoint'}
                </Label>
                {isMaaS && (
                  <Label color="blue">Self-service</Label>
                )}
                {model.status === 'Running' && (
                  <Label variant="outline" status="success">
                    Ready
                  </Label>
                )}
              </div>
              <div
                style={{
                  fontFamily: 'var(--pf-t--global--font--family--mono)',
                  fontSize: '0.8rem',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  marginBottom: '0.25rem'
                }}
              >
                {model.name}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                Provided by {model.provider || 'Unknown'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary" onClick={() => navigate('/gen-ai-studio/playground')}>
              Try in playground
            </Button>
          </div>
        </div>
      </PageSection>

      {/* Overview content (endpoints) */}
      <PageSection style={{ paddingTop: '1.5rem' }}>
          <Card id="endpoint-model-endpoints-card">
            <CardHeader>
              <Title headingLevel="h3" size="md">Connect to endpoint</Title>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6A6E73', fontSize: '0.875rem' }}>
                Use the information below to connect to this model endpoint from your applications.
              </p>
            </CardHeader>
            <CardBody>
              <Form>
                {/* Internal API Endpoint Section */}
                {model.internalEndpoint && (
                  <FormGroup 
                    label="Internal API endpoint" 
                    fieldId="endpoint-internal-url"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TextInput
                        id="endpoint-internal-url"
                        value={model.internalEndpoint || ''}
                        readOnly
                        aria-label="Internal API endpoint URL"
                        style={{ fontFamily: 'monospace', flex: 1 }}
                      />
                      <Tooltip content={copiedItems.has('endpoint-internal-url') ? 'Copied' : 'Copy endpoint'}>
                        <Button
                          variant="control"
                          aria-label="Copy internal API endpoint"
                          onClick={() => handleCopyWithFeedback(model.internalEndpoint!, 'endpoint-internal-url')}
                          id="copy-internal-endpoint-btn"
                        >
                          {copiedItems.has('endpoint-internal-url') ? <CheckCircleIcon /> : <CopyIcon />}
                        </Button>
                      </Tooltip>
                    </div>
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          The internal API endpoint for accessing this model within the cluster.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>
                )}

                {/* External API Endpoint Section */}
                {model.externalEndpoint && (
                  <FormGroup 
                    label="External API endpoint" 
                    fieldId="endpoint-external-url"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TextInput
                        id="endpoint-external-url"
                        value={model.externalEndpoint || ''}
                        readOnly
                        aria-label="External API endpoint URL"
                        style={{ fontFamily: 'monospace', flex: 1 }}
                      />
                      <Tooltip content={copiedItems.has('endpoint-external-url') ? 'Copied' : 'Copy endpoint'}>
                        <Button
                          variant="control"
                          aria-label="Copy external API endpoint"
                          onClick={() => handleCopyWithFeedback(model.externalEndpoint!, 'endpoint-external-url')}
                          id="copy-external-endpoint-btn"
                        >
                          {copiedItems.has('endpoint-external-url') ? <CheckCircleIcon /> : <CopyIcon />}
                        </Button>
                      </Tooltip>
                    </div>
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          The external API endpoint for accessing this model.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                    
                    {/* Security warning for external models without auth */}
                    {isExternalModelWithoutAuth && !externalTokenAuthEnabled && (
                      <Alert
                        variant="warning"
                        isInline
                        title="No authorization required"
                        actionLinks={
                          <Button
                            variant="link"
                            isInline
                            onClick={() => setExternalTokenAuthEnabled(true)}
                            id="enable-token-auth-btn"
                          >
                            Turn on token authentication
                          </Button>
                        }
                        style={{ marginTop: '1rem' }}
                        id="external-no-auth-warning"
                      >
                        This model is available externally without requiring authorization, which could lead to security vulnerabilities. Creating an authorization token is recommended.
                      </Alert>
                    )}
                    
                    {/* Token generation UI after enabling auth */}
                    {isExternalModelWithoutAuth && externalTokenAuthEnabled && !externalGeneratedToken && (
                      <div style={{ marginTop: '1rem' }}>
                        <Button
                          variant="secondary"
                          onClick={handleGenerateExternalToken}
                          isLoading={isGeneratingExternalToken}
                          isDisabled={isGeneratingExternalToken}
                          id="generate-external-token-btn"
                        >
                          {isGeneratingExternalToken ? 'Generating...' : 'Generate token'}
                        </Button>
                      </div>
                    )}
                    
                    {/* Generated token display */}
                    {isExternalModelWithoutAuth && externalTokenAuthEnabled && externalGeneratedToken && (
                      <FormGroup 
                        label="Authorization token" 
                        fieldId="endpoint-external-token"
                        style={{ marginTop: '1rem' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <TextInput
                            id="endpoint-external-token"
                            value={showExternalToken ? externalGeneratedToken : '••••••••••••••••••••••••••••••••'}
                            readOnly
                            aria-label="Authorization token"
                            style={{ fontFamily: 'monospace', flex: 1 }}
                          />
                          <Tooltip content={showExternalToken ? 'Hide token' : 'Show token'}>
                            <Button
                              variant="control"
                              aria-label={showExternalToken ? 'Hide token' : 'Show token'}
                              onClick={() => setShowExternalToken(!showExternalToken)}
                              id="toggle-external-token-visibility-btn"
                            >
                              {showExternalToken ? <EyeSlashIcon /> : <EyeIcon />}
                            </Button>
                          </Tooltip>
                          <Tooltip content={copiedItems.has('endpoint-external-token') ? 'Copied' : 'Copy token'}>
                            <Button
                              variant="control"
                              aria-label="Copy token"
                              onClick={() => handleCopyWithFeedback(externalGeneratedToken, 'endpoint-external-token')}
                              id="copy-external-token-btn"
                            >
                              {copiedItems.has('endpoint-external-token') ? <CheckCircleIcon /> : <CopyIcon />}
                            </Button>
                          </Tooltip>
                        </div>
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem>
                              Use this token in the Authorization header when making API requests.
                            </HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                      </FormGroup>
                    )}
                  </FormGroup>
                )}

                {/* API Key guidance - only for MaaS/Self-service models */}
                {isMaaS && (
                  <FormGroup 
                    label="API key" 
                    fieldId="endpoint-api-key-info"
                  >
                    <Content component={ContentVariants.p} id="endpoint-api-key-guidance">
                      Use any of your <Link to="/gen-ai-studio/api-keys" id="endpoint-existing-keys-link">existing API keys</Link> to
                      authenticate requests to this model. You can also <Link to="/gen-ai-studio/api-keys" id="endpoint-create-key-link">create a new API key</Link>.
                    </Content>
                  </FormGroup>
                )}

                {/* Subscription Selection - only for MaaS/Self-service models */}
                {isMaaS && (
                  <FormGroup 
                    label="Subscription" 
                    fieldId="endpoint-subscription-select"
                  >
                    <Select
                      id="endpoint-subscription-select"
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
                          id="endpoint-subscription-toggle"
                        >
                          {selectedSubscription ? `${selectedSubscription.name} (${selectedSubscription.tier})` : 'Select a subscription'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {mockMaaSSubscriptions.map((sub) => (
                          <SelectOption key={sub.id} value={sub.id}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 'bold' }}>{sub.name}</span>
                              <span style={{ fontSize: '0.875rem', color: '#6A6E73' }}>
                                {sub.tier} · {sub.rateLimit}
                              </span>
                            </div>
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                    <FormHelperText>
                      <HelperText>
                        <HelperTextItem>
                          Include a subscription in your request to access this endpoint.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  </FormGroup>
                )}

                <Divider style={{ marginTop: '1rem', marginBottom: '1rem' }} />

                {/* Usage Example Section with Language Tabs */}
                <FormGroup 
                  label="Usage example" 
                  fieldId="endpoint-usage-example"
                >
                  {codeExamples && (
                    <Tabs
                      id="endpoint-usage-example-language-tabs"
                      activeKey={activeLanguageTab}
                      onSelect={(_event, tabKey) => setActiveLanguageTab(tabKey as CodeLanguage)}
                      aria-label="Code example language tabs"
                      style={{ marginBottom: '0' }}
                    >
                      {(Object.keys(codeExamples) as CodeLanguage[]).map((lang) => (
                        <Tab
                          key={lang}
                          eventKey={lang}
                          title={<TabTitleText>{codeExamples[lang].label}</TabTitleText>}
                          aria-label={`${codeExamples[lang].label} example`}
                          id={`endpoint-usage-tab-${lang}`}
                        >
                          <CodeBlock id={`endpoint-usage-example-code-${lang}`}>
                            <CodeBlockCode id={`endpoint-code-content-${lang}`}>
                              {renderHighlightedCode(codeExamples[lang].code, ['$API_KEY', selectedSubscriptionId])}
                            </CodeBlockCode>
                          </CodeBlock>
                        </Tab>
                      ))}
                    </Tabs>
                  )}
                  {isMaaS && (
                    <FormHelperText style={{ marginTop: '0.75rem' }}>
                      <HelperText>
                        <HelperTextItem>
                          The <code>X-MAAS-SUBSCRIPTION</code> header specifies which subscription to use for this request. 
                          This header is optional if you only have access to one subscription.
                        </HelperTextItem>
                      </HelperText>
                    </FormHelperText>
                  )}
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </PageSection>
    </PageSection>
  );
};

export default EndpointModelDetails;
