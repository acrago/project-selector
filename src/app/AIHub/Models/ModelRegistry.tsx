import React, { useState } from 'react';
import {
  Button,
  ClipboardCopy,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  PageSection,
  Popover,
  Tab,
  TabTitleText,
  Tabs,
  Title
} from '@patternfly/react-core';
import {
  HelpIcon,
  InfoCircleIcon
} from '@patternfly/react-icons';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { ModelRegistryIconNew } from '@app/Home/icons';
import { RegistryModelsTab } from './RegistryModelsTab';
import { RegistryPromptsTab } from './RegistryPromptsTab';

const ModelRegistry: React.FunctionComponent<{ isTabContent?: boolean }> = ({ isTabContent = false }) => {
  useDocumentTitle('Model Registry');

  // State management
  const [registryDropdownOpen, setRegistryDropdownOpen] = useState(false);
  const [isRegistryDetailsPopoverOpen, setIsRegistryDetailsPopoverOpen] = useState(false);
  const [isNeedRegistryPopoverOpen, setIsNeedRegistryPopoverOpen] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  return (
    <>
      {/* Page Header Section - Only show when not tab content */}
      {!isTabContent && (
      <PageSection>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: '#ece6ff', borderRadius: '20px', padding: '4px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ModelRegistryIconNew size={32} />
              </div>
              Registry
            </Title>
          </FlexItem>
          
          <FlexItem>
            <Content component="p">
              Select a model registry to view and manage your registered models. Model registries provide a structured and organized way to store, share, version, deploy, and track models.
            </Content>
          </FlexItem>
          
          {/* Registry Selector Row */}
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <span style={{ fontWeight: 400 }}>Model registry</span>
              </FlexItem>
              <FlexItem>
                <Dropdown
                  isOpen={registryDropdownOpen}
                  onOpenChange={(isOpen) => setRegistryDropdownOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setRegistryDropdownOpen(!registryDropdownOpen)}
                      aria-label="Options menu"
                      isDisabled
                      isExpanded={registryDropdownOpen}
                      data-testid="model-registry-selector-dropdown"
                      id="model-registry-selector-toggle"
                      style={{ 
                        background: '#f0f0f0',
                        border: '1px solid #d2d2d2',
                        opacity: 0.5,
                        cursor: 'not-allowed'
                      }}
                    >
                      registry
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="registry">registry</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </FlexItem>
              <FlexItem>
                <Popover
                  isVisible={isRegistryDetailsPopoverOpen}
                  shouldClose={() => setIsRegistryDetailsPopoverOpen(false)}
                  headerContent={<div>Registry details</div>}
                  bodyContent={
                    <div style={{ width: '350px', maxWidth: '350px', padding: '0' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>Description</strong>
                        <div style={{ marginTop: '0.5rem' }}>Model Registry</div>
                      </div>
                      <div>
                        <strong>Server URL</strong>
                        <div style={{ 
                          marginTop: '0.5rem', 
                          overflow: 'hidden',
                          width: '100%',
                          maxWidth: '100%'
                        }}>
                          <ClipboardCopy
                            hoverTip="Copy"
                            clickTip="Copied"
                            isReadOnly
                            style={{ 
                              width: 'calc(100% - 40px)', 
                              maxWidth: 'calc(100% - 40px)',
                              boxSizing: 'border-box'
                            }}
                          >
                            https://registry-rest.apps.prod.rhoai.rh-aiservices-bu.com:443
                          </ClipboardCopy>
                        </div>
                      </div>
                    </div>
                  }
                  position="right"
                  enableFlip
                >
                  <Button 
                    variant="link" 
                    icon={<InfoCircleIcon />}
                    iconPosition="start"
                    data-testid="view-details-button"
                    onClick={() => setIsRegistryDetailsPopoverOpen(!isRegistryDetailsPopoverOpen)}
                  >
                    View details
                  </Button>
                </Popover>
              </FlexItem>
              <FlexItem style={{ marginLeft: 'auto' }}>
                <Popover
                  isVisible={isNeedRegistryPopoverOpen}
                  shouldClose={() => setIsNeedRegistryPopoverOpen(false)}
                  headerContent={<div>Need another registry?</div>}
                  bodyContent={
                    <div style={{ width: '300px', maxWidth: '300px' }}>
                      <p style={{ marginBottom: '1rem' }}>
                        To request access to a new or existing model registry, contact your administrator.
                      </p>
                      <div>
                        <strong>Your administrator might be:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                          <li style={{ marginBottom: '0.5rem' }}>
                            The person who gave you your username, or who helped you to log in for the first time
                          </li>
                          <li style={{ marginBottom: '0.5rem' }}>
                            Your team lead or manager, if you work in an IT department or development team
                          </li>
                          <li>
                            A member of your organization's IT helpdesk or support team
                          </li>
                        </ul>
                      </div>
                    </div>
                  }
                  position="right"
                  enableFlip
                >
                  <Button
                    variant="link"
                    icon={<HelpIcon />}
                    iconPosition="start"
                    data-testid="model-registry-help-button"
                    onClick={() => setIsNeedRegistryPopoverOpen(!isNeedRegistryPopoverOpen)}
                  >
                    Need another registry?
                  </Button>
                </Popover>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>
      )}

      {/* Tabs Section - Only show when not tab content */}
      {!isTabContent && (
      <PageSection variant="default" padding={{ default: 'noPadding' }}>
        <Tabs
          activeKey={activeTabKey}
          onSelect={(_event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent, tabIndex: string | number) => setActiveTabKey(tabIndex)}
          aria-label="Registry tabs"
          role="region"
          id="registry-tabs"
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Models</TabTitleText>}
            aria-label="Models tab"
          />
          <Tab
            eventKey={1}
            title={<TabTitleText>Prompts</TabTitleText>}
            aria-label="Prompts tab"
          />
        </Tabs>
      </PageSection>
      )}

      {/* Tab Content Section - wrap in PageSection only when not tab content */}
      {!isTabContent ? (
        <PageSection>
          {activeTabKey === 0 && <RegistryModelsTab />}
          {activeTabKey === 1 && <RegistryPromptsTab />}
        </PageSection>
      ) : (
        <RegistryModelsTab />
      )}
    </>
  );
};

export { ModelRegistry };
