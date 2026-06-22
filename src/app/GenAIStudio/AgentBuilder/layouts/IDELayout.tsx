import React from 'react';
import {
  Divider,
  Flex,
  FlexItem,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  Title
} from '@patternfly/react-core';
import {
  CodeIcon,
  CubeIcon,
  DesktopIcon,
  ProjectDiagramIcon,
  TerminalIcon
} from '@patternfly/react-icons';

interface IDELayoutProps {
  children: React.ReactNode;
}

export const IDELayout: React.FunctionComponent<IDELayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = React.useState<string | number>(0);

  return (
    <PageSection padding={{ default: 'noPadding' }}>
      <div style={{ 
        height: 'calc(100vh - 200px)', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#f8f9fa'
      }}>
        {/* IDE Header */}
        <div style={{ 
          padding: '0.75rem 1rem', 
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #d2d2d2',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsLg' }}>
                <FlexItem>
                  <DesktopIcon style={{ marginRight: '0.5rem', color: '#0066cc' }} />
                  <Title headingLevel="h2" size="lg" style={{ display: 'inline' }}>
                    IDE Layout
                  </Title>
                </FlexItem>
                <FlexItem>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Three-panel developer interface
                  </div>
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        </div>

        {/* Main IDE Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left Panel - Explorer/Project */}
          <div style={{ 
            width: '300px', 
            backgroundColor: '#ffffff',
            borderRight: '1px solid #d2d2d2',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              padding: '0.75rem 1rem', 
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa'
            }}>
              <Title headingLevel="h3" size="md">
                <CubeIcon style={{ marginRight: '0.5rem' }} />
                Explorer
              </Title>
            </div>
            <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
              <div style={{ marginBottom: '1rem' }}>
                                 <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem' }}>
                   Agent Structure
                 </Title>
                <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                  <div style={{ padding: '0.25rem 0', cursor: 'pointer' }}>📁 agent-builder/</div>
                  <div style={{ padding: '0.25rem 0 0.25rem 1rem', cursor: 'pointer' }}>🔧 configuration.yaml</div>
                  <div style={{ padding: '0.25rem 0 0.25rem 1rem', cursor: 'pointer' }}>🤖 model.py</div>
                  <div style={{ padding: '0.25rem 0 0.25rem 1rem', cursor: 'pointer' }}>🛡️ guardrails.py</div>
                  <div style={{ padding: '0.25rem 0 0.25rem 1rem', cursor: 'pointer' }}>📚 knowledge_sources.py</div>
                  <div style={{ padding: '0.25rem 0 0.25rem 1rem', cursor: 'pointer' }}>⚙️ mcp_servers.py</div>
                  <div style={{ padding: '0.25rem 0', cursor: 'pointer' }}>📦 requirements.txt</div>
                  <div style={{ padding: '0.25rem 0', cursor: 'pointer' }}>🐳 Dockerfile</div>
                </div>
              </div>
              
              <Divider style={{ margin: '1rem 0' }} />
              
              <div>
                                 <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem' }}>
                   Quick Actions
                 </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ 
                    padding: '0.5rem', 
                    backgroundColor: '#f0f8ff', 
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    🔍 Search Files
                  </div>
                  <div style={{ 
                    padding: '0.5rem', 
                    backgroundColor: '#f0f8ff', 
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    ➕ New Component
                  </div>
                  <div style={{ 
                    padding: '0.5rem', 
                    backgroundColor: '#f0f8ff', 
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    🔧 Settings
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Editor */}
          <div style={{ 
            flex: 1, 
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Tabs
              activeKey={activeTab}
              onSelect={(event, tabIndex) => setActiveTab(tabIndex)}
              isBox={false}
              style={{ 
                borderBottom: '1px solid #d2d2d2',
                backgroundColor: '#f8f9fa'
              }}
            >
              <Tab eventKey={0} title={<TabTitleText><ProjectDiagramIcon style={{ marginRight: '0.5rem' }} />Agent Canvas</TabTitleText>} />
              <Tab eventKey={1} title={<TabTitleText><CodeIcon style={{ marginRight: '0.5rem' }} />Code Editor</TabTitleText>} />
              <Tab eventKey={2} title={<TabTitleText><TerminalIcon style={{ marginRight: '0.5rem' }} />Console</TabTitleText>} />
            </Tabs>
            
            <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
              {activeTab === 0 && (
                <div style={{ height: '100%' }}>
                  <div style={{ 
                    height: '100%', 
                    border: '2px dashed #d2d2d2', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ textAlign: 'center', color: 'var(--pf-v5-global--Color--200)' }}>
                      <ProjectDiagramIcon style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Agent Canvas
                      </div>
                      <div>Visual agent composition interface</div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 1 && (
                <div style={{ height: '100%' }}>
                  <div style={{ 
                    height: '100%', 
                    backgroundColor: '#1e1e1e', 
                    borderRadius: '4px',
                    padding: '1rem',
                    fontFamily: 'Monaco, Consolas, &quot;Courier New&quot;, monospace',
                    fontSize: '0.875rem',
                    color: '#d4d4d4',
                    overflow: 'auto'
                  }}>
                    <div style={{ color: '#6a9955' }}># Agent Configuration</div>
                    <div style={{ color: '#569cd6' }}>from</div> <span style={{ color: '#d4d4d4' }}>llama_stack_client</span> <div style={{ color: '#569cd6', display: 'inline' }}>import</div> <span style={{ color: '#d4d4d4' }}>LlamaStackClient, Agent</span>
                    <br /><br />
                    <div style={{ color: '#dcdcaa' }}>client</div> <span style={{ color: '#d4d4d4' }}>=</span> <span style={{ color: '#dcdcaa' }}>LlamaStackClient</span><span style={{ color: '#d4d4d4' }}>(</span>
                    <br />
                    <span style={{ color: '#d4d4d4' }}>&nbsp;&nbsp;&nbsp;&nbsp;base_url=</span><span style={{ color: '#ce9178' }}>&quot;http://localhost:8000&quot;</span>
                    <br />
                    <span style={{ color: '#d4d4d4' }}>)</span>
                    <br /><br />
                    <div style={{ color: '#dcdcaa' }}>agent</div> <span style={{ color: '#d4d4d4' }}>=</span> <span style={{ color: '#dcdcaa' }}>Agent</span><span style={{ color: '#d4d4d4' }}>(</span>
                    <br />
                    <span style={{ color: '#d4d4d4' }}>&nbsp;&nbsp;&nbsp;&nbsp;client,</span>
                    <br />
                    <span style={{ color: '#d4d4d4' }}>&nbsp;&nbsp;&nbsp;&nbsp;model=</span><span style={{ color: '#ce9178' }}>&quot;Llama3.2-3B-Instruct&quot;</span><span style={{ color: '#d4d4d4' }}>,</span>
                    <br />
                    <span style={{ color: '#d4d4d4' }}>&nbsp;&nbsp;&nbsp;&nbsp;instructions=</span><span style={{ color: '#ce9178' }}>&quot;You are a helpful assistant&quot;</span>
                    <br />
                    <span style={{ color: '#d4d4d4' }}>)</span>
                  </div>
                </div>
              )}
              
              {activeTab === 2 && (
                <div style={{ height: '100%' }}>
                  <div style={{ 
                    height: '100%', 
                    backgroundColor: '#000000', 
                    borderRadius: '4px',
                    padding: '1rem',
                    fontFamily: 'Monaco, Consolas, &quot;Courier New&quot;, monospace',
                    fontSize: '0.875rem',
                    color: '#00ff00',
                    overflow: 'auto'
                  }}>
                    <div>$ llama-stack-client models list</div>
                    <div style={{ color: '#ffffff' }}>Available models:</div>
                    <div style={{ color: '#ffffff' }}>- Llama3.2-3B-Instruct</div>
                    <div style={{ color: '#ffffff' }}>- Claude-3-Sonnet</div>
                    <div style={{ color: '#ffffff' }}>- GPT-4</div>
                    <br />
                    <div>$ llama-stack-client agents create --name &quot;my-agent&quot;</div>
                    <div style={{ color: '#ffffff' }}>Agent created successfully</div>
                    <br />
                    <div>$ <span style={{ animation: 'blink 1s infinite' }}>_</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Properties/Tools */}
          <div style={{ 
            width: '350px', 
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #d2d2d2',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              padding: '0.75rem 1rem', 
              borderBottom: '1px solid #e9ecef',
              backgroundColor: '#f8f9fa'
            }}>
              <Title headingLevel="h3" size="md">
                Properties
              </Title>
            </div>
            <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
              {/* Original AgentBuilder content will be embedded here */}
              <div style={{ 
                border: '1px solid #e9ecef', 
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#f8f9fa'
              }}>
                                 <Title headingLevel="h4" size="md" style={{ marginBottom: '1rem' }}>
                   Agent Builder Content
                 </Title>
                <div style={{ 
                  maxHeight: '400px', 
                  overflow: 'auto',
                  fontSize: '0.875rem'
                }}>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  );
}; 