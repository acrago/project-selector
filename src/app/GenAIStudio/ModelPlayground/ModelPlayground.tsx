import * as React from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem,
  AccordionToggle,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Select,
  SelectList,
  SelectOption,
  Switch,
  Tab,
  TabTitleText,
  Tabs,
  TextArea,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { 
  ArrowRightIcon,
  ChevronUpIcon,
  CompressIcon,
  DatabaseIcon,
  DownloadIcon,
  EditIcon,
  HelpIcon,
  OutlinedFolderIcon,
  PaperPlaneIcon,
  PlusIcon,
  RobotIcon,
  SaveIcon,
  ServerIcon,
  UserIcon,
  UsersIcon
} from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const ModelPlayground: React.FunctionComponent = () => {
  useDocumentTitle("Model Playground");

  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  const [selectedModel, setSelectedModel] = React.useState('gpt-4');
  const [modelDropdownOpen, setModelDropdownOpen] = React.useState(false);
  const [playgroundDropdownOpen, setPlaygroundDropdownOpen] = React.useState(false);

  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = React.useState(false);
  const [activeCompareTab, setActiveCompareTab] = React.useState<string | number>(0);
  const [activeMetricsTab, setActiveMetricsTab] = React.useState<string | number>(0);
  const [ragEnabled, setRagEnabled] = React.useState(false);
  const [ragConfigEnabled, setRagConfigEnabled] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [inputText, setInputText] = React.useState('');
  const [isMetricsCollapsed, setIsMetricsCollapsed] = React.useState(true);
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);
  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);

  const models = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' }
  ];

  const selectedModelInfo = models.find(m => m.id === selectedModel);

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

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Hello! I'm ${selectedModelInfo?.name}. This is a simulated response to your message: "${userMessage.content}". In a real implementation, this would be the actual model response.`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, assistantMessage]);
    }, 1000);
  };

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

  return (
    <>
      {/* Header with Project and Workspace Selectors */}
      {flags.showProjectWorkspaceDropdowns && (
        <PageSection padding={{ default: 'noPadding' }}>
          <Toolbar>
            <ToolbarContent style={{ padding: '1rem' }}>
              <ToolbarGroup>
                <ToolbarItem>
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

      <PageSection>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Header */}
          <Title headingLevel="h1" size="2xl">Model Playground</Title>

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Left Content Area */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Main Chat Card */}
            <Card>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  {/* Compare Section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Compare</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Tabs
                          activeKey={activeCompareTab}
                          onSelect={(event, tabIndex) => setActiveCompareTab(tabIndex)}
                          isBox
                          style={{ marginRight: '0.5rem' }}
                        >
                          <Tab eventKey={0} title={<TabTitleText>GPT-4</TabTitleText>} />
                        </Tabs>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          icon={<PlusIcon />}
                        >
                          Add Additional Chat
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      icon={<SaveIcon />}
                      aria-label="Save Playground"
                    />
                    <Button 
                      variant="plain" 
                      size="sm"
                      icon={<CompressIcon />}
                      aria-label="Collapse"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody style={{ padding: 0 }}>
                {/* Chat Interface */}
                <div style={{ height: '600px', display: 'flex', flexDirection: 'column', border: '2px solid #0066cc', borderRadius: '8px', margin: '1rem' }}>
                  {/* Chat Header */}
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid #d2d2d2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Dropdown
                        isOpen={modelDropdownOpen}
                        onSelect={() => setModelDropdownOpen(false)}
                        onOpenChange={(isOpen: boolean) => setModelDropdownOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                            isExpanded={modelDropdownOpen}
                            variant="secondary"
                            size="sm"
                          >
                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                              <FlexItem>
                                <ServerIcon />
                              </FlexItem>
                              <FlexItem>
                                {selectedModelInfo?.name}
                              </FlexItem>
                            </Flex>
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
                    </div>
                    <div>
                      <ToggleGroup>
                        <ToggleGroupItem 
                          text="RAG" 
                          buttonId="rag-toggle"
                          isSelected={ragEnabled}
                          onChange={(_event, selected) => setRagEnabled(selected)}
                          icon={<DatabaseIcon />}
                        />
                      </ToggleGroup>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    {chatHistory.length === 0 ? (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        textAlign: 'center',
                        color: 'var(--pf-v5-global--Color--200)'
                      }}>
                        <Title headingLevel="h3" size="lg" style={{ marginBottom: '0.5rem' }}>
                          Start a conversation
                        </Title>
                        <p>Send a message to begin chatting with {selectedModelInfo?.name}</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {chatHistory.map((message) => (
                          <div key={message.id} style={{ display: 'flex', gap: '0.75rem' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              backgroundColor: message.role === 'user' ? '#0066cc' : '#3E8635',
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
                                backgroundColor: 'white', 
                                padding: '0.75rem', 
                                borderRadius: '8px',
                                border: '1px solid #d2d2d2'
                              }}>
                                {message.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div style={{ padding: '1rem', borderTop: '1px solid #d2d2d2' }}>
                    <Flex alignItems={{ default: 'alignItemsFlexEnd' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <TextArea
                          value={inputText}
                          onChange={(_event, value) => setInputText(value)}
                          placeholder="Type your message..."
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                              handleSendMessage();
                            }
                          }}
                        />
                      </FlexItem>
                      <FlexItem>
                        <Button
                          variant="primary"
                          icon={<PaperPlaneIcon />}
                          isDisabled={!inputText.trim()}
                          onClick={handleSendMessage}
                        />
                      </FlexItem>
                    </Flex>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Model Comparison Metrics */}
            <Card style={{ height: isMetricsCollapsed ? '171px' : '400px' }}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ArrowRightIcon style={{ marginRight: '0.5rem' }} />
                    <Title headingLevel="h3" size="lg">Model Comparison Metrics</Title>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tabs
                      activeKey={activeMetricsTab}
                      onSelect={(event, tabIndex) => setActiveMetricsTab(tabIndex)}
                      isBox
                      style={{ width: '180px' }}
                    >
                      <Tab eventKey={0} title={<TabTitleText>Columns</TabTitleText>} />
                      <Tab eventKey={1} title={<TabTitleText>Table</TabTitleText>} />
                    </Tabs>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      icon={<DownloadIcon />}
                    >
                      Export
                    </Button>
                    <Button 
                      variant="plain" 
                      size="sm"
                      icon={<ChevronUpIcon />}
                      onClick={() => setIsMetricsCollapsed(!isMetricsCollapsed)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody style={{ flex: 1, overflow: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <div>
                    <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }}>
                      No comparison data available
                    </Title>
                    <p style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                      Send a message to generate model responses and comparison metrics
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div style={{ width: '400px', borderLeft: '1px solid #d2d2d2', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Title headingLevel="h3" size="lg">Configure {selectedModelInfo?.name}</Title>
                <Button variant="plain" size="sm" icon={<EditIcon />} style={{ marginLeft: '0.25rem' }} />
              </div>
            </div>

            {/* Playground Selector */}
            <div>
              <Dropdown
                isOpen={playgroundDropdownOpen}
                onSelect={() => setPlaygroundDropdownOpen(false)}
                onOpenChange={(isOpen: boolean) => setPlaygroundDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setPlaygroundDropdownOpen(!playgroundDropdownOpen)}
                    isExpanded={playgroundDropdownOpen}
                    style={{ width: '100%' }}
                  >
                    Select Playground
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="default">Default Playground</DropdownItem>
                  <DropdownItem key="comparison">Comparison Playground</DropdownItem>
                  <DropdownItem key="custom">Custom Playground</DropdownItem>
                </DropdownList>
              </Dropdown>
            </div>

            {/* Configuration Accordion */}
            <div style={{ flex: 1 }}>
              <Accordion asDefinitionList={false}>
                {/* Model Section */}
                <AccordionItem>
                  <AccordionToggle
                    onClick={() => onToggle('model')}
                    id="model-toggle"
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                        <ServerIcon />
                      </FlexItem>
                      <FlexItem>
                        Model
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                          (Required)
                        </span>
                      </FlexItem>
                    </Flex>
                  </AccordionToggle>
                  <AccordionContent
                    id="model-content"
                    hidden={!expandedSections.includes('model')}
                  >
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--pf-v5-global--Color--200)' }}>
                      Model configuration will be available here.
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Knowledge Sources Section */}
                <AccordionItem>
                  <AccordionToggle
                    onClick={() => onToggle('rag')}
                    id="rag-toggle"
                  >
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
                      <FlexItem>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <FlexItem>
                            <ServerIcon />
                          </FlexItem>
                          <FlexItem>
                            Knowledge Sources (RAG)
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                      <FlexItem>
                        <Switch
                          id="rag-config-enabled"
                          isChecked={ragConfigEnabled}
                          onChange={(_event, checked) => setRagConfigEnabled(checked)}
                        />
                      </FlexItem>
                    </Flex>
                  </AccordionToggle>
                  <AccordionContent
                    id="rag-content"
                    hidden={!expandedSections.includes('rag')}
                  >
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--pf-v5-global--Color--200)' }}>
                      RAG configuration will be available here.
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
              </div>
      </PageSection>
    </>
    );
};

export { ModelPlayground }; 