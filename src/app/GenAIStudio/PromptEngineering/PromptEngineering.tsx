import * as React from 'react';
import { 
  Alert, 
  Badge, 
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CodeBlock,
  CodeBlockCode,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  FormGroup,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Slider,
  Spinner,
  Switch,
  Tab,
  TabTitleText,
  Tabs,
  TextArea,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { 
  BalanceScaleIcon,
  ClipboardIcon,
  CodeIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  FlaskIcon,
  FolderIcon,
  HelpIcon,
  HistoryIcon,
  OptimizeIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  ShareIcon,
  UploadIcon,
  UsersIcon
} from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  variables: string[];
  usageCount: number;
}

interface PromptVersion {
  id: string;
  version: string;
  content: string;
  timestamp: Date;
  performance?: number;
}

interface TestResult {
  id: string;
  input: string;
  output: string;
  timestamp: Date;
  model: string;
  performance: number;
}

const PromptEngineering: React.FunctionComponent = () => {
  useDocumentTitle("Prompt Engineering");

  const { flags } = useFeatureFlags();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [modelDropdownOpen, setModelDropdownOpen] = React.useState(false);
  const [templateDropdownOpen, setTemplateDropdownOpen] = React.useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = React.useState(false);
  const [selectedModel, setSelectedModel] = React.useState('claude-3-opus');
  const [promptContent, setPromptContent] = React.useState('You are a helpful AI assistant. Please assist the user with their request.\n\nUser: {{user_input}}\n\nAssistant:');
  const [testOutput, setTestOutput] = React.useState('');
  const [isTesting, setIsTesting] = React.useState(false);
  const [variables, setVariables] = React.useState<{ [key: string]: string }>({
    user_input: 'What is the capital of France?'
  });
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const [config, setConfig] = React.useState({
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9
  });

  const models = [
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
    { id: 'granite-3b', name: 'Granite 3B', provider: 'IBM' }
  ];

  const promptTemplates: PromptTemplate[] = [
    {
      id: '1',
      name: 'Creative Writing',
      description: 'Template for creative writing tasks',
      category: 'Creative',
      content: 'You are a creative writer. Write a {{type}} about {{topic}} in the style of {{style}}. Make it engaging and vivid.',
      variables: ['type', 'topic', 'style'],
      usageCount: 156
    },
    {
      id: '2',
      name: 'Code Review',
      description: 'Template for code review and analysis',
      category: 'Development',
      content: 'Review the following {{language}} code for:\n- Best practices\n- Security issues\n- Performance optimizations\n- Bug detection\n\nCode:\n{{code}}\n\nProvide detailed feedback:',
      variables: ['language', 'code'],
      usageCount: 89
    },
    {
      id: '3',
      name: 'Data Analysis',
      description: 'Template for data analysis and insights',
      category: 'Analytics',
      content: 'Analyze the following dataset and provide insights:\n\nDataset: {{dataset_description}}\nData: {{data}}\n\nPlease provide:\n1. Key patterns and trends\n2. Statistical insights\n3. Recommendations\n4. Potential next steps',
      variables: ['dataset_description', 'data'],
      usageCount: 203
    },
    {
      id: '4',
      name: 'Customer Support',
      description: 'Template for customer service responses',
      category: 'Support',
      content: 'You are a helpful customer support representative. Address the customer&apos;s concern professionally and empathetically.\n\nCustomer Issue: {{issue}}\nCustomer Sentiment: {{sentiment}}\n\nProvide a helpful response:',
      variables: ['issue', 'sentiment'],
      usageCount: 445
    }
  ];

  const versions: PromptVersion[] = [
    {
      id: '1',
      version: 'v1.3',
      content: promptContent,
      timestamp: new Date(),
      performance: 8.7
    },
    {
      id: '2',
      version: 'v1.2',
      content: 'You are a helpful assistant. Help the user with: {{user_input}}',
      timestamp: new Date(Date.now() - 86400000),
      performance: 7.2
    },
    {
      id: '3',
      version: 'v1.1',
      content: 'Please help the user: {{user_input}}',
      timestamp: new Date(Date.now() - 172800000),
      performance: 6.1
    }
  ];

  const testResults: TestResult[] = [
    {
      id: '1',
      input: 'What is the capital of France?',
      output: 'The capital of France is Paris. Paris is located in the north-central part of France and serves as the country&apos;s political, economic, and cultural center.',
      timestamp: new Date(),
      model: 'Claude 3 Opus',
      performance: 9.2
    },
    {
      id: '2',
      input: 'Explain machine learning',
      output: 'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.',
      timestamp: new Date(Date.now() - 300000),
      model: 'Claude 3 Opus',
      performance: 8.8
    }
  ];

  const selectedModelInfo = models.find(m => m.id === selectedModel);

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.slice(2, -2).trim()) : [];
  };

  const replaceVariables = (content: string, vars: { [key: string]: string }): string => {
    let result = content;
    Object.entries(vars).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return result;
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestOutput('');
    
    const processedPrompt = replaceVariables(promptContent, variables);
    
    // Simulate API call
    setTimeout(() => {
      setTestOutput(`Test response using ${selectedModelInfo?.name}:\n\nProcessed prompt: "${processedPrompt}"\n\nThis is a simulated response based on your prompt template. The actual response would be generated by the selected model using the specified parameters.\n\nConfiguration:\n- Temperature: ${config.temperature}\n- Max Tokens: ${config.maxTokens}\n- Top P: ${config.topP}`);
      setIsTesting(false);
    }, 2000);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization
    setTimeout(() => {
      const optimizedPrompt = `You are an expert AI assistant with deep knowledge across multiple domains. Your responses should be accurate, helpful, and well-structured.

Context: {{user_input}}

Please provide a comprehensive response that:
1. Directly addresses the user&apos;s question
2. Provides relevant context and background
3. Offers actionable insights when applicable
4. Uses clear, professional language

Response:`;
      
      setPromptContent(optimizedPrompt);
      setIsOptimizing(false);
    }, 3000);
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    setPromptContent(template.content);
    
    // Initialize variables
    const newVars: { [key: string]: string } = {};
    template.variables.forEach(variable => {
      newVars[variable] = '';
    });
    setVariables(newVars);
    setTemplateDropdownOpen(false);
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const detectedVariables = extractVariables(promptContent);

  return (
    <>
      {/* Header with Project and Workspace Selectors */}
      {flags.showProjectWorkspaceDropdowns && (
        <PageSection padding={{ default: 'noPadding' }}>
          <Toolbar>
            <ToolbarContent style={{ padding: '1rem' }}>
              <ToolbarGroup>
                <ToolbarItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      <span className="pf-v5-u-font-size-sm pf-v5-u-font-weight-bold">Project:</span>
                    </FlexItem>
                    <FlexItem>
                      <Dropdown
                        isOpen={projectDropdownOpen}
                        onSelect={() => setProjectDropdownOpen(false)}
                        onOpenChange={(isOpen: boolean) => setProjectDropdownOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                            isExpanded={projectDropdownOpen}
                            variant="secondary"
                            size="sm"
                          >
                            <FolderIcon style={{ marginRight: '0.5rem' }} />
                            Default Project
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="default">Default Project</DropdownItem>
                          <DropdownItem key="project2">AI Research Project</DropdownItem>
                          <DropdownItem key="project3">Production Models</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </FlexItem>
                  </Flex>
                </ToolbarItem>
                <ToolbarItem>
                  <Button variant="plain" aria-label="Help" icon={<HelpIcon />} />
                </ToolbarItem>
                <ToolbarItem>
                  <Divider orientation={{ default: 'vertical' }} />
                </ToolbarItem>
                <ToolbarItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      <span className="pf-v5-u-font-size-sm pf-v5-u-font-weight-bold">Workspace:</span>
                    </FlexItem>
                    <FlexItem>
                      <Dropdown
                        isOpen={workspaceDropdownOpen}
                        onSelect={() => setWorkspaceDropdownOpen(false)}
                        onOpenChange={(isOpen: boolean) => setWorkspaceDropdownOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                            isExpanded={workspaceDropdownOpen}
                            variant="secondary"
                            size="sm"
                          >
                            <UsersIcon style={{ marginRight: '0.5rem' }} />
                            Private Workspace
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="private">Private Workspace</DropdownItem>
                          <DropdownItem key="team">Team Workspace</DropdownItem>
                          <DropdownItem key="shared">Shared Workspace</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </FlexItem>
                  </Flex>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </PageSection>
      )}

      {/* Page Header */}
      <PageSection padding={{ default: 'noPadding' }}>
        <Toolbar>
          <ToolbarContent style={{ padding: '1rem' }}>
            <ToolbarGroup>
              <ToolbarItem>
                <Title headingLevel="h1" size="xl">Prompt Engineering</Title>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              <ToolbarItem>
                <Button variant="secondary" icon={<HistoryIcon />}>
                  Version History
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant="secondary" icon={<ShareIcon />}>
                  Share
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant="primary" icon={<SaveIcon />}>
                  Save Prompt
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </PageSection>

      <PageSection>
        <Grid hasGutter span={12}>
          {/* Left Panel - Prompt Editor */}
          <GridItem lg={8} md={7} sm={12}>
            <Card isFullHeight style={{ minHeight: '600px' }}>
              <CardHeader>
                <Tabs
                  activeKey={activeTabKey}
                  onSelect={(event, tabIndex) => setActiveTabKey(tabIndex)}
                  isBox={false}
                  style={{ width: '100%' }}
                >
                  <Tab eventKey={0} title={<TabTitleText><EditIcon style={{ marginRight: '0.5rem' }} />Editor</TabTitleText>} />
                  <Tab eventKey={1} title={<TabTitleText><FlaskIcon style={{ marginRight: '0.5rem' }} />Test</TabTitleText>} />
                  <Tab eventKey={2} title={<TabTitleText><ClipboardIcon style={{ marginRight: '0.5rem' }} />Templates</TabTitleText>} />
                  <Tab eventKey={3} title={<TabTitleText><BalanceScaleIcon style={{ marginRight: '0.5rem' }} />Compare</TabTitleText>} />
                </Tabs>
              </CardHeader>
              <CardBody>
                {activeTabKey === 0 && (
                  /* Editor Tab */
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Title headingLevel="h3" size="lg">Prompt Editor</Title>
                        </FlexItem>
                        <FlexItem>
                          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                            <FlexItem>
                              <Button variant="secondary" size="sm" icon={<OptimizeIcon />} onClick={handleOptimize} isLoading={isOptimizing}>
                                {isOptimizing ? 'Optimizing...' : 'Optimize'}
                              </Button>
                            </FlexItem>
                            <FlexItem>
                              <Dropdown
                                isOpen={templateDropdownOpen}
                                onSelect={() => setTemplateDropdownOpen(false)}
                                onOpenChange={(isOpen: boolean) => setTemplateDropdownOpen(isOpen)}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
                                    isExpanded={templateDropdownOpen}
                                    size="sm"
                                  >
                                    Load Template
                                  </MenuToggle>
                                )}
                              >
                                <DropdownList>
                                  {promptTemplates.map((template) => (
                                    <DropdownItem 
                                      key={template.id} 
                                      onClick={() => handleTemplateSelect(template)}
                                    >
                                      <div>
                                        <div style={{ fontWeight: 'bold' }}>{template.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                                          {template.category} • {template.usageCount} uses
                                        </div>
                                      </div>
                                    </DropdownItem>
                                  ))}
                                </DropdownList>
                              </Dropdown>
                            </FlexItem>
                          </Flex>
                        </FlexItem>
                      </Flex>
                    </div>

                    <FormGroup label="Prompt Content" fieldId="prompt-content">
                      <TextArea
                        value={promptContent}
                        onChange={(_event, value) => setPromptContent(value)}
                        rows={15}
                        placeholder="Enter your prompt here..."
                      />
                      <HelperText>
                        <HelperTextItem>
                          Use {'{{'} variable_name {'}}'} syntax to define variables in your prompt
                        </HelperTextItem>
                      </HelperText>
                    </FormGroup>

                    {detectedVariables.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem' }}>
                          <CodeIcon style={{ marginRight: '0.5rem' }} />
                          Variables ({detectedVariables.length})
                        </Title>
                        <Grid hasGutter>
                          {detectedVariables.map((variable, index) => (
                            <GridItem key={index} lg={6} md={12}>
                              <FormGroup label={variable} fieldId={`var-${variable}`}>
                                <TextInput
                                  value={variables[variable] || ''}
                                  onChange={(_event, value) => handleVariableChange(variable, value)}
                                  placeholder={`Enter value for ${variable}`}
                                />
                              </FormGroup>
                            </GridItem>
                          ))}
                        </Grid>
                      </div>
                    )}

                    <Alert 
                      variant="info" 
                      title="Prompt Engineering Tips"
                      style={{ marginTop: '1rem' }}
                    >
                      <p>• Be specific and clear about the desired output format</p>
                      <p>• Use examples to guide the model&apos;s behavior</p>
                      <p>• Include role definition for better context</p>
                      <p>• Test with various inputs to ensure consistency</p>
                    </Alert>
                  </div>
                )}

                {activeTabKey === 1 && (
                  /* Test Tab */
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <Title headingLevel="h3" size="lg">Test Prompt</Title>
                      <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
                        Test your prompt with different inputs to evaluate performance
                      </p>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <Alert variant="info" title="Preview">
                        <CodeBlock>
                          <CodeBlockCode>
                            {replaceVariables(promptContent, variables)}
                          </CodeBlockCode>
                        </CodeBlock>
                      </Alert>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <Button 
                        variant="primary" 
                        onClick={handleTest}
                        isDisabled={isTesting}
                        icon={isTesting ? <Spinner size="sm" /> : <PlayIcon />}
                      >
                        {isTesting ? 'Testing...' : 'Test Prompt'}
                      </Button>
                    </div>

                    {(testOutput || isTesting) && (
                      <FormGroup label="Test Results" fieldId="test-output">
                        <div style={{ 
                          backgroundColor: '#f5f5f5', 
                          padding: '1rem', 
                          borderRadius: '8px',
                          minHeight: '200px',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {isTesting ? (
                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                              <FlexItem>
                                <Spinner size="md" />
                              </FlexItem>
                              <FlexItem>
                                Generating response...
                              </FlexItem>
                            </Flex>
                          ) : (
                            testOutput
                          )}
                        </div>
                      </FormGroup>
                    )}

                    {testResults.length > 0 && (
                      <div style={{ marginTop: '2rem' }}>
                        <Title headingLevel="h4" size="md" style={{ marginBottom: '1rem' }}>
                          Recent Test Results
                        </Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {testResults.map((result) => (
                            <Card key={result.id}>
                              <CardBody>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                    <FlexItem>
                                      <strong>Input:</strong> {result.input}
                                    </FlexItem>
                                    <FlexItem>
                                      <Badge color="blue">Score: {result.performance}/10</Badge>
                                    </FlexItem>
                                  </Flex>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                                  <strong>Output:</strong> {result.output}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
                                  {result.model} • {result.timestamp.toLocaleTimeString()}
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTabKey === 2 && (
                  /* Templates Tab */
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <div>
                            <Title headingLevel="h3" size="lg">Prompt Templates</Title>
                            <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
                              Choose from pre-built templates or create your own
                            </p>
                          </div>
                        </FlexItem>
                        <FlexItem>
                          <Button variant="secondary" icon={<PlusIcon />}>
                            Create Template
                          </Button>
                        </FlexItem>
                      </Flex>
                    </div>

                    <Grid hasGutter>
                      {promptTemplates.map((template) => (
                        <GridItem key={template.id} lg={6} md={12}>
                          <Card 
                            isSelectable 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardHeader>
                              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                <FlexItem>
                                  <CardTitle>{template.name}</CardTitle>
                                </FlexItem>
                                <FlexItem>
                                  <Badge color="purple">{template.category}</Badge>
                                </FlexItem>
                              </Flex>
                            </CardHeader>
                            <CardBody>
                              <p style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)', marginBottom: '1rem' }}>
                                {template.description}
                              </p>
                              <div style={{ marginBottom: '1rem' }}>
                                <LabelGroup>
                                  {template.variables.map((variable, index) => (
                                    <Label key={index} color="blue" variant="outline">
                                      {variable}
                                    </Label>
                                  ))}
                                </LabelGroup>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                                Used {template.usageCount} times
                              </div>
                            </CardBody>
                          </Card>
                        </GridItem>
                      ))}
                    </Grid>
                  </div>
                )}

                {activeTabKey === 3 && (
                  /* Compare Tab */
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <Title headingLevel="h3" size="lg">Version Comparison</Title>
                      <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
                        Compare different versions of your prompts and their performance
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {versions.map((version) => (
                        <Card key={version.id}>
                          <CardHeader>
                            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                              <FlexItem>
                                <CardTitle>{version.version}</CardTitle>
                              </FlexItem>
                              <FlexItem>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                  <FlexItem>
                                    {version.performance && (
                                      <Badge color="green">Performance: {version.performance}/10</Badge>
                                    )}
                                  </FlexItem>
                                  <FlexItem>
                                    <Button variant="link" size="sm">
                                      Load Version
                                    </Button>
                                  </FlexItem>
                                </Flex>
                              </FlexItem>
                            </Flex>
                          </CardHeader>
                          <CardBody>
                            <div style={{ 
                              backgroundColor: '#f8f8f8', 
                              padding: '0.75rem', 
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              fontFamily: 'monospace',
                              marginBottom: '0.5rem'
                            }}>
                              {version.content}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                              {version.timestamp.toLocaleDateString()} at {version.timestamp.toLocaleTimeString()}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Right Panel - Configuration */}
          <GridItem lg={4} md={5} sm={12}>
            <Card isFullHeight>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardBody>
                {/* Model Selection */}
                <FormGroup label="Model" fieldId="model-select">
                  <Dropdown
                    isOpen={modelDropdownOpen}
                    onSelect={() => setModelDropdownOpen(false)}
                    onOpenChange={(isOpen: boolean) => setModelDropdownOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                        isExpanded={modelDropdownOpen}
                        style={{ width: '100%' }}
                      >
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{selectedModelInfo?.name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                            {selectedModelInfo?.provider}
                          </div>
                        </div>
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {models.map((model) => (
                        <DropdownItem 
                          key={model.id} 
                          onClick={() => setSelectedModel(model.id)}
                        >
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{model.name}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                              {model.provider}
                            </div>
                          </div>
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </Dropdown>
                </FormGroup>

                <Divider style={{ margin: '1rem 0' }} />

                {/* Advanced Settings Toggle */}
                <FormGroup>
                  <Switch
                    id="advanced-toggle"
                    label="Show Advanced Settings"
                    isChecked={showAdvanced}
                    onChange={(_event, checked) => setShowAdvanced(checked)}
                  />
                </FormGroup>

                {showAdvanced && (
                  <>
                    <Divider style={{ margin: '1rem 0' }} />
                    
                    {/* Temperature */}
                    <FormGroup label={`Temperature: ${config.temperature}`} fieldId="temperature">
                      <Slider
                        value={config.temperature}
                        onChange={(_event, value) => setConfig(prev => ({ ...prev, temperature: value }))}
                        min={0}
                        max={2}
                        step={0.1}
                      />
                      <HelperText>
                        <HelperTextItem>Controls randomness in output</HelperTextItem>
                      </HelperText>
                    </FormGroup>

                    {/* Max Tokens */}
                    <FormGroup label="Max Tokens" fieldId="max-tokens">
                      <TextInput
                        type="number"
                        value={config.maxTokens}
                        onChange={(_event, value) => setConfig(prev => ({ ...prev, maxTokens: parseInt(value) || 1000 }))}
                        min={1}
                        max={4000}
                      />
                    </FormGroup>

                    {/* Top P */}
                    <FormGroup label={`Top P: ${config.topP}`} fieldId="top-p">
                      <Slider
                        value={config.topP}
                        onChange={(_event, value) => setConfig(prev => ({ ...prev, topP: value }))}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </FormGroup>
                  </>
                )}

                <Divider style={{ margin: '1rem 0' }} />

                {/* Prompt Stats */}
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Prompt Statistics
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Characters: {promptContent.length}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Estimated tokens: ~{Math.ceil(promptContent.length / 4)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Variables: {detectedVariables.length}
                  </div>
                </div>

                <Divider style={{ margin: '1rem 0' }} />

                {/* Quick Actions */}
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Quick Actions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Button variant="secondary" size="sm" icon={<CopyIcon />} isBlock>
                      Copy Prompt
                    </Button>
                    <Button variant="secondary" size="sm" icon={<DownloadIcon />} isBlock>
                      Export
                    </Button>
                    <Button variant="secondary" size="sm" icon={<UploadIcon />} isBlock>
                      Import
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
};

export { PromptEngineering }; 