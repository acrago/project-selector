import React from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  FormGroup,
  Label,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Slider,
  Switch,
  Tab,
  TabTitleText,
  Tabs,
  TextArea,
  TextInput,
  Title,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  AngleRightIcon,
  CogIcon,
  EllipsisVIcon,
  LockIcon,
  PlusCircleIcon,
  PlusIcon,
  SaveIcon,
} from '@patternfly/react-icons';

interface BuildPanelTabsProps {
  selectedTab: string | number;
  onSelectTab: (tabIndex: string | number) => void;
  selectedModel: string;
  isModelSelectOpen: boolean;
  onModelSelectOpenChange: (isOpen: boolean) => void;
  onModelSelect: (model: string) => void;
  AIIcon: string;
  SlidersIcon: string;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  repetitionPenalty: number;
  onRepetitionPenaltyChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  isSystemPromptReadOnly: boolean;
  onLoadPromptClick: () => void;
  onEditPromptClick: () => void;
  isRagEnabled: boolean;
  onRagEnabledChange: (enabled: boolean) => void;
  vectorStores: any[];
  onVectorStoresChange: (stores: any[]) => void;
  isVectorStoreDropdownOpen: boolean;
  onVectorStoreDropdownOpenChange: (isOpen: boolean) => void;
  openVectorStoreActionId: string | null;
  onOpenVectorStoreActionChange: (id: string | null) => void;
  onEditVectorStore: (store: any) => void;
  onAddVectorStoreClick: () => void;
  mcpServers: any[];
  jailbreaksEnabled: boolean;
  onJailbreaksEnabledChange: (enabled: boolean) => void;
  contentModerationUserEnabled: boolean;
  onContentModerationUserEnabledChange: (enabled: boolean) => void;
  piiUserEnabled: boolean;
  onPiiUserEnabledChange: (enabled: boolean) => void;
  contentModerationOutputEnabled: boolean;
  onContentModerationOutputEnabledChange: (enabled: boolean) => void;
  piiOutputEnabled: boolean;
  onPiiOutputEnabledChange: (enabled: boolean) => void;
}

export const BuildPanelTabs: React.FunctionComponent<BuildPanelTabsProps> = ({
  selectedTab,
  onSelectTab,
  selectedModel,
  isModelSelectOpen,
  onModelSelectOpenChange,
  onModelSelect,
  AIIcon,
  temperature,
  onTemperatureChange,
  repetitionPenalty,
  onRepetitionPenaltyChange,
  maxTokens,
  onMaxTokensChange,
  systemPrompt,
  onSystemPromptChange,
  isSystemPromptReadOnly,
  onLoadPromptClick,
  onEditPromptClick,
  isRagEnabled,
  onRagEnabledChange,
  vectorStores,
  onVectorStoresChange,
  isVectorStoreDropdownOpen,
  onVectorStoreDropdownOpenChange,
  openVectorStoreActionId,
  onOpenVectorStoreActionChange,
  onEditVectorStore,
  onAddVectorStoreClick,
  mcpServers,
  jailbreaksEnabled,
  onJailbreaksEnabledChange,
  contentModerationUserEnabled,
  onContentModerationUserEnabledChange,
  piiUserEnabled,
  onPiiUserEnabledChange,
  contentModerationOutputEnabled,
  onContentModerationOutputEnabledChange,
  piiOutputEnabled,
  onPiiOutputEnabledChange,
}) => {
  const getModelDisplayName = (modelId: string) => {
    switch(modelId) {
      case 'llama-3.1-8b-instruct': return 'Llama 3.1 8B-Instruct';
      case 'mistral-7b-instruct': return 'Mistral 7B-Instruct';
      case 'granite-8b-code': return 'Granite 8B Code';
      case 'falcon-7b': return 'Falcon 7B';
      case 'bloom-7b1': return 'BLOOM 7B1';
      default: return 'Select model';
    }
  };

  return (
    <>
      <div style={{  
        borderBottom: '1px solid var(--pf-v6-global--BorderColor--100)',
        padding: '1rem'
      }}>
        <Title headingLevel="h2" size="lg">
          Build
        </Title>
      </div>

      <Tabs
        activeKey={selectedTab}
        onSelect={(_event, tabIndex) => onSelectTab(tabIndex)}
        isBox
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        id="build-tabs"
      >
        <Tab eventKey={0} title={<TabTitleText>Model</TabTitleText>} id="model-tab">
          <div style={{ padding: '1rem', height: '100%', overflowY: 'auto' }}>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '1rem' }}>
              Model
            </Title>
            
            <FormGroup label="Model selection" fieldId="model-select-field">
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <div 
                    style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center' }}
                    dangerouslySetInnerHTML={{ __html: AIIcon }}
                  />
                </FlexItem>
                <FlexItem style={{ flex: 1 }}>
                  <Select
                    id="model-select"
                    isOpen={isModelSelectOpen}
                    selected={selectedModel}
                    onSelect={(_event, value) => {
                      onModelSelect(value as string);
                      onModelSelectOpenChange(false);
                    }}
                    onOpenChange={onModelSelectOpenChange}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => onModelSelectOpenChange(!isModelSelectOpen)}
                        isExpanded={isModelSelectOpen}
                        style={{ width: '100%' }}
                      >
                        {getModelDisplayName(selectedModel)}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="llama-3.1-8b-instruct">Llama 3.1 8B-Instruct</SelectOption>
                      <SelectOption value="mistral-7b-instruct">Mistral 7B-Instruct</SelectOption>
                      <SelectOption value="granite-8b-code">Granite 8B Code</SelectOption>
                      <SelectOption value="falcon-7b">Falcon 7B</SelectOption>
                      <SelectOption value="bloom-7b1">BLOOM 7B1</SelectOption>
                    </SelectList>
                  </Select>
                </FlexItem>
              </Flex>
            </FormGroup>

            <FormGroup label="Temperature" fieldId="temperature" style={{ marginTop: '1.5rem' }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <FlexItem style={{ flex: 1 }}>
                  <Slider
                    id="temperature-slider"
                    value={temperature}
                    onChange={(_event, value) => onTemperatureChange(value)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </FlexItem>
                <FlexItem>
                  <TextInput
                    id="temperature-input"
                    value={temperature}
                    onChange={(_event, value) => onTemperatureChange(parseFloat(value) || 0)}
                    type="number"
                    step={0.1}
                    style={{ width: '80px' }}
                  />
                </FlexItem>
              </Flex>
            </FormGroup>

            <FormGroup label="Max Tokens" fieldId="max-tokens" style={{ marginTop: '1.5rem' }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <FlexItem style={{ flex: 1 }}>
                  <Slider
                    id="max-tokens-slider"
                    value={maxTokens}
                    onChange={(_event, value) => onMaxTokensChange(value)}
                    min={0}
                    max={2048}
                    step={1}
                  />
                </FlexItem>
                <FlexItem>
                  <TextInput
                    id="max-tokens-input"
                    value={maxTokens}
                    onChange={(_event, value) => onMaxTokensChange(parseInt(value) || 0)}
                    type="number"
                    style={{ width: '80px' }}
                  />
                </FlexItem>
              </Flex>
            </FormGroup>

            <FormGroup label="Repetition Penalty" fieldId="repetition-penalty" style={{ marginTop: '1.5rem' }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
                <FlexItem style={{ flex: 1 }}>
                  <Slider
                    id="repetition-penalty-slider"
                    value={repetitionPenalty}
                    onChange={(_event, value) => onRepetitionPenaltyChange(value)}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </FlexItem>
                <FlexItem>
                  <TextInput
                    id="repetition-penalty-input"
                    value={repetitionPenalty}
                    onChange={(_event, value) => onRepetitionPenaltyChange(parseFloat(value) || 0)}
                    type="number"
                    step={0.1}
                    style={{ width: '80px' }}
                  />
                </FlexItem>
              </Flex>
            </FormGroup>
          </div>
        </Tab>

        <Tab eventKey={1} title={<TabTitleText>Prompt</TabTitleText>} id="prompt-tab">
          <div style={{ padding: '1rem', height: '100%', overflowY: 'auto' }}>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <Title headingLevel="h3" size="md">
                  System instructions
                </Title>
              </FlexItem>
              <FlexItem>
                <Button 
                  variant="link" 
                  icon={<PlusCircleIcon />} 
                  onClick={onLoadPromptClick}
                >
                  Load prompt
                </Button>
              </FlexItem>
            </Flex>

            <TextArea
              id="system-instructions"
              value={systemPrompt}
              onChange={(_event, value) => onSystemPromptChange(value)}
              placeholder="This will display the default system prompt"
              rows={15}
              readOnly={isSystemPromptReadOnly}
              style={{
                backgroundColor: isSystemPromptReadOnly ? 'var(--pf-v6-global--BackgroundColor--200)' : 'white',
                marginBottom: '1rem'
              }}
            />

            <Flex gap={{ default: 'gapSm' }}>
              <FlexItem>
                <Button variant="primary" icon={<SaveIcon />}>
                  Save
                </Button>
              </FlexItem>
              {isSystemPromptReadOnly && systemPrompt && (
                <FlexItem>
                  <Button variant="link" onClick={onEditPromptClick}>
                    Edit prompt
                  </Button>
                </FlexItem>
              )}
            </Flex>
          </div>
        </Tab>

        <Tab eventKey={2} title={<TabTitleText>Knowledge</TabTitleText>} id="knowledge-tab">
          <div style={{ padding: '1rem', height: '100%', overflowY: 'auto' }}>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <Title headingLevel="h3" size="md">Knowledge</Title>
              </FlexItem>
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                  <Button
                    variant="plain"
                    icon={<AngleRightIcon style={{ transform: isRagEnabled ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />}
                    onClick={() => onRagEnabledChange(!isRagEnabled)}
                    aria-label="Toggle knowledge section"
                  />
                  <Switch
                    id="knowledge-toggle"
                    isChecked={isRagEnabled}
                    onChange={(_event, checked) => onRagEnabledChange(checked)}
                    aria-label="Enable Knowledge"
                  />
                </Flex>
              </FlexItem>
            </Flex>

            {isRagEnabled && (
              <>
                <Dropdown
                  isOpen={isVectorStoreDropdownOpen}
                  onSelect={() => {}}
                  onOpenChange={(isOpen: boolean) => onVectorStoreDropdownOpenChange(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => onVectorStoreDropdownOpenChange(!isVectorStoreDropdownOpen)}
                      isExpanded={isVectorStoreDropdownOpen}
                      style={{ width: '100%', marginBottom: '1rem' }}
                      id="vector-store-dropdown"
                    >
                      Browse or add vector stores
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="header" isDisabled>
                      <strong>Vector store</strong>
                    </DropdownItem>
                    {vectorStores.map((store) => (
                      <DropdownItem key={store.id}>
                        <Checkbox
                          id={`dropdown-vs-${store.id}`}
                          isChecked={store.selected}
                          label={store.name}
                          onChange={(_event, checked) => {
                            onVectorStoresChange(vectorStores.map(s =>
                              s.id === store.id ? { ...s, selected: checked } : s
                            ));
                          }}
                        />
                      </DropdownItem>
                    ))}
                    <Divider component="li" />
                    <DropdownItem key="add-new">
                      <Button 
                        variant="link" 
                        icon={<PlusIcon />}
                        onClick={() => {
                          onVectorStoreDropdownOpenChange(false);
                          onAddVectorStoreClick();
                        }}
                        style={{ padding: 0, fontWeight: 400 }}
                      >
                        Add new vector store
                      </Button>
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>

                {vectorStores.filter(s => s.selected).length > 0 && (
                  <Table variant="compact" aria-label="Selected vector stores">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Type</Th>
                        <Th width={10}></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {vectorStores.filter(s => s.selected).map((store) => (
                        <Tr key={store.id}>
                          <Td>{store.name}</Td>
                          <Td>{store.type}</Td>
                          <Td>
                            <Dropdown
                              isOpen={openVectorStoreActionId === store.id}
                              onSelect={() => onOpenVectorStoreActionChange(null)}
                              onOpenChange={(isOpen: boolean) => onOpenVectorStoreActionChange(isOpen ? store.id : null)}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  variant="plain"
                                  onClick={() => onOpenVectorStoreActionChange(openVectorStoreActionId === store.id ? null : store.id)}
                                  isExpanded={openVectorStoreActionId === store.id}
                                >
                                  <EllipsisVIcon />
                                </MenuToggle>
                              )}
                            >
                              <DropdownList>
                                <DropdownItem onClick={() => onEditVectorStore(store)}>
                                  Edit vector store
                                </DropdownItem>
                                <DropdownItem onClick={() => {
                                  onVectorStoresChange(vectorStores.map(s =>
                                    s.id === store.id ? { ...s, selected: false } : s
                                  ));
                                }}>
                                  Remove
                                </DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </>
            )}
          </div>
        </Tab>

        <Tab eventKey={3} title={<TabTitleText>MCP</TabTitleText>} id="mcp-tab">
          <div style={{ padding: '1rem', height: '100%', overflowY: 'auto' }}>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <Title headingLevel="h3" size="md">MCP Servers</Title>
              </FlexItem>
              <FlexItem>
                <Label variant="outline" color="blue">2 enabled</Label>
              </FlexItem>
            </Flex>
            
            <Table variant="compact" aria-label="MCP Servers">
              <Thead>
                <Tr>
                  <Th width={10}></Th>
                  <Th>Name</Th>
                  <Th>Tools</Th>
                  <Th width={10}>Authorization</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mcpServers.map((server) => (
                  <Tr key={server.id}>
                    <Td>
                      <Checkbox id={`mcp-${server.id}`} isChecked={server.enabled} aria-label={`Enable ${server.name}`} />
                    </Td>
                    <Td>{server.name}</Td>
                    <Td>{server.toolsCount} enabled</Td>
                    <Td>
                      <Button variant="plain" icon={<LockIcon />} isDisabled={!server.enabled} aria-label="Authorization" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey={4} title={<TabTitleText>Guardrails</TabTitleText>} id="guardrails-tab">
          <div style={{ padding: '1rem', height: '100%', overflowY: 'auto' }}>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginBottom: '1.5rem' }}>
              <FlexItem>
                <Title headingLevel="h3" size="md">Guardrails</Title>
              </FlexItem>
              <FlexItem>
                <Label variant="outline" color="blue">
                  {(jailbreaksEnabled ? 1 : 0) + (contentModerationUserEnabled ? 1 : 0) + (piiUserEnabled ? 1 : 0)} enabled
                </Label>
              </FlexItem>
            </Flex>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', marginTop: 0 }}>
                User input
              </h4>

              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginBottom: '1rem' }}>
                <FlexItem>
                  <Switch
                    id="guardrails-jailbreaks"
                    isChecked={jailbreaksEnabled}
                    onChange={(_event, checked) => onJailbreaksEnabledChange(checked)}
                    aria-label="Enable jailbreaks protection"
                  />
                </FlexItem>
                <FlexItem style={{ flex: 1 }}>
                  Jailbreaks and prompt attacks
                </FlexItem>
              </Flex>

              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginBottom: '1rem' }}>
                <FlexItem>
                  <Switch
                    id="guardrails-content-mod-user"
                    isChecked={contentModerationUserEnabled}
                    onChange={(_event, checked) => onContentModerationUserEnabledChange(checked)}
                    aria-label="Enable content moderation for user input"
                  />
                </FlexItem>
                <FlexItem style={{ flex: 1 }}>
                  Content moderation
                </FlexItem>
                <FlexItem>
                  <Button 
                    variant="plain" 
                    icon={<CogIcon />} 
                    aria-label="Configure content moderation"
                  />
                </FlexItem>
              </Flex>

              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Switch
                    id="guardrails-pii-user"
                    isChecked={piiUserEnabled}
                    onChange={(_event, checked) => onPiiUserEnabledChange(checked)}
                    aria-label="Enable PII detection for user input"
                  />
                </FlexItem>
                <FlexItem style={{ flex: 1 }}>
                  Personal identifiable information (PII)
                </FlexItem>
              </Flex>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', marginTop: 0 }}>
                Model output
              </h4>

              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginBottom: '1rem' }}>
                <FlexItem>
                  <Switch
                    id="guardrails-content-mod-output"
                    isChecked={contentModerationOutputEnabled}
                    onChange={(_event, checked) => onContentModerationOutputEnabledChange(checked)}
                    aria-label="Enable content moderation for model output"
                  />
                </FlexItem>
                <FlexItem style={{ flex: 1 }}>
                  Content moderation
                </FlexItem>
                <FlexItem>
                  <Button 
                    variant="plain" 
                    icon={<CogIcon />} 
                    aria-label="Configure content moderation for output"
                  />
                </FlexItem>
              </Flex>

              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Switch
                    id="guardrails-pii-output"
                    isChecked={piiOutputEnabled}
                    onChange={(_event, checked) => onPiiOutputEnabledChange(checked)}
                    aria-label="Enable PII detection for model output"
                  />
                </FlexItem>
                <FlexItem style={{ flex: 1 }}>
                  Personal identifiable information (PII)
                </FlexItem>
              </Flex>
            </div>
          </div>
        </Tab>
      </Tabs>
    </>
  );
};

