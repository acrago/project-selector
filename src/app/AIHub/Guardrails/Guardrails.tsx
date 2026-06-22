import * as React from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  SearchInput,
  Tab,
  TabTitleText,
  Tabs,
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
  CheckIcon,
  PlusIcon,
  TableIcon,
  ThIcon,
  UsersIcon,
} from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { useNavigate } from 'react-router-dom';

// Types for guardrail data
interface GuardrailData {
  id: string;
  name: string;
  type: 'Content' | 'Security' | 'Privacy' | 'Custom';
  severity: 'Low' | 'Medium' | 'High';
  evaluation: 'Pass' | 'Fail' | 'Not Evaluated';
  evaluationScore?: number;
  version: string;
  blockRate: string;
  tags: string[];
  lastModified: string;
  userCount: number;
  status: 'active' | 'inactive' | 'warning';
}

// Mock data for guardrails
const mockGuardrails: GuardrailData[] = [
  {
    id: '1',
    name: 'Basic Profanity Filter',
    type: 'Content',
    severity: 'Low',
    evaluation: 'Fail',
    evaluationScore: 6.8,
    version: '1.0',
    blockRate: '12.0%',
    tags: ['profanity', 'content', 'basic'],
    lastModified: 'Oct 5, 2023',
    userCount: 5,
    status: 'active',
  },
  {
    id: '2',
    name: 'Code Security Scanner',
    type: 'Security',
    severity: 'High',
    evaluation: 'Not Evaluated',
    version: '1.0',
    blockRate: '10.0%',
    tags: ['code', 'security', 'scanner', 'vulnerability'],
    lastModified: 'Dec 2, 2023',
    userCount: 3,
    status: 'inactive',
  },
  {
    id: '3',
    name: 'Development Testing Guardrail',
    type: 'Custom',
    severity: 'Low',
    evaluation: 'Not Evaluated',
    version: '1.0',
    blockRate: '5.0%',
    tags: ['development', 'testing', 'custom'],
    lastModified: 'Dec 19, 2023',
    userCount: 2,
    status: 'active',
  },
  {
    id: '4',
    name: 'Educational Content Safety',
    type: 'Content',
    severity: 'Medium',
    evaluation: 'Pass',
    evaluationScore: 9.1,
    version: '2.0',
    blockRate: '14.0%',
    tags: ['education', 'safety', 'content', 'schools'],
    lastModified: 'Oct 20, 2023',
    userCount: 11,
    status: 'warning',
  },
  {
    id: '5',
    name: 'Enterprise Security Guard',
    type: 'Security',
    severity: 'High',
    evaluation: 'Pass',
    evaluationScore: 9.8,
    version: '1.2',
    blockRate: '22.0%',
    tags: ['security', 'enterprise', 'protection'],
    lastModified: 'Dec 18, 2023',
    userCount: 24,
    status: 'inactive',
  },
  {
    id: '6',
    name: 'Financial Data Protection',
    type: 'Privacy',
    severity: 'High',
    evaluation: 'Pass',
    evaluationScore: 9.6,
    version: '1.2',
    blockRate: '20.0%',
    tags: ['finance', 'privacy', 'data', 'protection'],
    lastModified: 'Dec 8, 2023',
    userCount: 15,
    status: 'inactive',
  },
  {
    id: '7',
    name: 'Government Data Protection',
    type: 'Privacy',
    severity: 'High',
    evaluation: 'Pass',
    evaluationScore: 9.7,
    version: '2.1',
    blockRate: '28.0%',
    tags: ['government', 'privacy', 'compliance', 'data'],
    lastModified: 'Nov 10, 2023',
    userCount: 6,
    status: 'inactive',
  },
  {
    id: '8',
    name: 'Healthcare Compliance',
    type: 'Custom',
    severity: 'High',
    evaluation: 'Pass',
    evaluationScore: 9.3,
    version: '1.1',
    blockRate: '25.0%',
    tags: ['healthcare', 'compliance', 'hipaa', 'medical'],
    lastModified: 'Nov 25, 2023',
    userCount: 9,
    status: 'inactive',
  },
  {
    id: '9',
    name: 'Legal Document Guardrail',
    type: 'Custom',
    severity: 'Medium',
    evaluation: 'Pass',
    evaluationScore: 8.9,
    version: '1.1',
    blockRate: '15.0%',
    tags: ['legal', 'documents', 'compliance'],
    lastModified: 'Nov 15, 2023',
    userCount: 7,
    status: 'warning',
  },
  {
    id: '10',
    name: 'Multi-language Content Filter',
    type: 'Content',
    severity: 'Medium',
    evaluation: 'Fail',
    evaluationScore: 7.2,
    version: '1.1',
    blockRate: '17.0%',
    tags: ['multilingual', 'content', 'international', 'filter'],
    lastModified: 'Nov 28, 2023',
    userCount: 8,
    status: 'warning',
  },
  {
    id: '11',
    name: 'PII Protection',
    type: 'Privacy',
    severity: 'High',
    evaluation: 'Pass',
    evaluationScore: 9.5,
    version: '2.0',
    blockRate: '18.0%',
    tags: ['pii', 'privacy', 'personal', 'data'],
    lastModified: 'Dec 12, 2023',
    userCount: 18,
    status: 'inactive',
  },
  {
    id: '12',
    name: 'Standard Content Filter',
    type: 'Content',
    severity: 'Medium',
    evaluation: 'Pass',
    evaluationScore: 9.2,
    version: '2.1',
    blockRate: '15.0%',
    tags: ['profanity', 'content', 'standard'],
    lastModified: 'Dec 15, 2023',
    userCount: 12,
    status: 'warning',
  },
];

const Guardrails: React.FunctionComponent = () => {
  useDocumentTitle('Guardrails');
  const { flags, agentBuilder, updateAgentBuilder } = useFeatureFlags();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = React.useState('');
  const [filteredGuardrails, setFilteredGuardrails] = React.useState<GuardrailData[]>(mockGuardrails);
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);

  // Handle adding/removing guardrails from agent
  const handleAddToAgent = (guardrailName: string, type: 'input' | 'output') => {
    if (!flags.agentBuilderMode) return;
    
    const currentGuardrails = agentBuilder.selectedGuardrails;
    const isCurrentlySelected = currentGuardrails[type] === guardrailName;
    
    if (isCurrentlySelected) {
      // Remove the guardrail
      updateAgentBuilder({ 
        selectedGuardrails: {
          ...currentGuardrails,
          [type]: null
        }
      });
    } else {
      // Add the guardrail
      updateAgentBuilder({ 
        selectedGuardrails: {
          ...currentGuardrails,
          [type]: guardrailName
        }
      });
    }
    
    // Navigate back to Agent Builder if in agent builder mode
    if (flags.agentBuilderMode) {
      navigate('/gen-ai-studio/playground');
    }
  };

  const isGuardrailSelected = (guardrailName: string): 'input' | 'output' | null => {
    if (agentBuilder.selectedGuardrails.input === guardrailName) return 'input';
    if (agentBuilder.selectedGuardrails.output === guardrailName) return 'output';
    return null;
  };

  // Filter guardrails based on search and filters
  React.useEffect(() => {
    let filtered = mockGuardrails;

    // Search filter
    if (searchValue) {
      filtered = filtered.filter(guardrail =>
        guardrail.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        guardrail.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }

    setFilteredGuardrails(filtered);
  }, [searchValue]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Content': return 'blue';
      case 'Security': return 'red';
      case 'Privacy': return 'purple';
      case 'Custom': return 'orange';
      default: return 'grey';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'green';
      case 'Medium': return 'gold';
      case 'High': return 'red';
      default: return 'grey';
    }
  };

  const getEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case 'Pass': return 'green';
      case 'Fail': return 'red';
      case 'Not Evaluated': return 'grey';
      default: return 'grey';
    }
  };

  return (
    <PageSection>
      <div style={{ padding: '1.5rem 0' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Title headingLevel="h1" size="2xl" style={{ marginBottom: '0.5rem' }}>
            Available Guardrails
          </Title>
          <p style={{ color: 'var(--pf-v5-global--Color--200)', margin: 0 }}>
            Browse, compare, and manage safety guardrails
          </p>
        </div>

        {/* Search and Create Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <SearchInput
              placeholder="Search guardrails..."
              value={searchValue}
              onChange={(_, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
            />
          </div>
          <Button 
            variant="primary" 
            icon={<PlusIcon />}
            onClick={() => navigate('/ai-assets/guardrails/create')}
          >
            Create Guardrail
          </Button>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '1.5rem', backgroundColor: 'var(--pf-v5-global--BackgroundColor--200)' }}>
          <CardBody>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)' }}>
                  Guardrails:
                </span>{' '}
                {filteredGuardrails.length} of {mockGuardrails.length}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)' }}>
                  Filters:
                </span>
                <Button variant="control" size="sm">Type</Button>
                <Button variant="control" size="sm">Severity</Button>
                <Button variant="control" size="sm">Evaluation</Button>
                <Button variant="control" size="sm">Tags</Button>
                <Button variant="control" size="sm">Version</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Results count and view tabs */}
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
          <FlexItem>
            <span style={{ fontSize: '0.875rem' }}>
              Showing <span style={{ fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)' }}>{filteredGuardrails.length}</span> of{' '}
              <span style={{ fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)' }}>{mockGuardrails.length}</span> guardrails
            </span>
          </FlexItem>
        </Flex>

        {/* View Toggle */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Tabs
            activeKey={activeTabKey}
            onSelect={(event, tabIndex) => setActiveTabKey(typeof tabIndex === 'number' ? tabIndex : 0)}
            isBox={false}
          >
            <Tab eventKey={0} title={<TabTitleText><ThIcon style={{ marginRight: '0.5rem' }} />Grid View</TabTitleText>} />
            <Tab eventKey={1} title={<TabTitleText><TableIcon style={{ marginRight: '0.5rem' }} />Table View</TabTitleText>} />
          </Tabs>
        </div>

        {/* Guardrails Content */}
        {activeTabKey === 0 ? (
          // Grid View
          <Grid hasGutter>
            {filteredGuardrails.map((guardrail) => (
              <GridItem key={guardrail.id} lg={4} md={6} sm={12}>
                <Card isFullHeight>
                  <CardHeader>
                    <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <Flex direction={{ default: 'column' }}>
                          <FlexItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                              <FlexItem>
                                <CardTitle>
                                  <Title headingLevel="h2" size="lg">{guardrail.name}</Title>
                                </CardTitle>
                              </FlexItem>
                              <FlexItem>
                                <div 
                                  style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%' 
                                  }}
                                  className={getStatusColor(guardrail.status)}
                                  title={`Status: ${guardrail.status}`}
                                />
                              </FlexItem>
                            </Flex>
                          </FlexItem>
                          <FlexItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                              <FlexItem>
                                <Badge color={getTypeColor(guardrail.type)}>{guardrail.type}</Badge>
                              </FlexItem>
                              <FlexItem>
                                <Badge color={getSeverityColor(guardrail.severity)}>{guardrail.severity}</Badge>
                              </FlexItem>
                            </Flex>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Grid hasGutter>
                      <GridItem span={6}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>Evaluation:</span>
                      </GridItem>
                      <GridItem span={6}>
                        <div style={{ textAlign: 'right' }}>
                          {guardrail.evaluation === 'Not Evaluated' ? (
                            <Badge color={getEvaluationColor(guardrail.evaluation)}>Not Evaluated</Badge>
                          ) : (
                            <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentFlexEnd' }} spaceItems={{ default: 'spaceItemsXs' }}>
                              <FlexItem>
                                <Badge color={getEvaluationColor(guardrail.evaluation)}>{guardrail.evaluation}</Badge>
                              </FlexItem>
                              {guardrail.evaluationScore && (
                                <FlexItem>
                                  <span style={{ fontSize: '0.875rem', fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)' }}>
                                    {guardrail.evaluationScore}
                                  </span>
                                </FlexItem>
                              )}
                            </Flex>
                          )}
                        </div>
                      </GridItem>
                      <GridItem span={6}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>Version:</span>
                      </GridItem>
                      <GridItem span={6}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)', textAlign: 'right', display: 'block' }}>
                          {guardrail.version}
                        </span>
                      </GridItem>
                      <GridItem span={6}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>Block Rate:</span>
                      </GridItem>
                      <GridItem span={6}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)', textAlign: 'right', display: 'block' }}>
                          {guardrail.blockRate}
                        </span>
                      </GridItem>
                      <GridItem span={6}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>Last Modified:</span>
                      </GridItem>
                      <GridItem span={6}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)', textAlign: 'right', display: 'block' }}>
                          {guardrail.lastModified}
                        </span>
                      </GridItem>
                    </Grid>
                    
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>Tags:</span>
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {guardrail.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} isRead>{tag}</Badge>
                        ))}
                        {guardrail.tags.length > 3 && (
                          <Badge isRead>+{guardrail.tags.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </CardBody>
                  <CardFooter>
                    {flags.agentBuilderMode ? (
                      // Agent Builder mode - show input/output selection buttons
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(() => {
                          const selectedType = isGuardrailSelected(guardrail.name);
                          const inputTaken = !!(agentBuilder.selectedGuardrails.input && agentBuilder.selectedGuardrails.input !== guardrail.name);
                          const outputTaken = !!(agentBuilder.selectedGuardrails.output && agentBuilder.selectedGuardrails.output !== guardrail.name);
                          
                          return (
                            <>
                              <Button 
                                variant={selectedType === 'input' ? 'secondary' : 'primary'}
                                size="sm"
                                isBlock 
                                icon={selectedType === 'input' ? <CheckIcon /> : <PlusIcon />}
                                onClick={() => handleAddToAgent(guardrail.name, 'input')}
                                isDisabled={inputTaken}
                              >
                                {selectedType === 'input' ? 'Input Guardrail' : inputTaken ? 'Input Slot Taken' : 'Add as Input'}
                              </Button>
                              <Button 
                                variant={selectedType === 'output' ? 'secondary' : 'primary'}
                                size="sm"
                                isBlock 
                                icon={selectedType === 'output' ? <CheckIcon /> : <PlusIcon />}
                                onClick={() => handleAddToAgent(guardrail.name, 'output')}
                                isDisabled={outputTaken}
                              >
                                {selectedType === 'output' ? 'Output Guardrail' : outputTaken ? 'Output Slot Taken' : 'Add as Output'}
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      // Normal mode - show user count
                      <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }}>
                        <FlexItem>
                          <UsersIcon style={{ width: '16px', height: '16px', color: 'var(--pf-v5-global--Color--200)' }} />
                        </FlexItem>
                        <FlexItem>
                          <span style={{ color: 'var(--pf-v5-global--Color--200)' }}>{guardrail.userCount} users</span>
                        </FlexItem>
                      </Flex>
                    )}
                  </CardFooter>
                </Card>
              </GridItem>
            ))}
          </Grid>
        ) : (
          // Table View
          <Table aria-label="Guardrails table" variant="compact">
            <Thead style={{ backgroundColor: 'black', color: 'white' }}>
              <Tr>
                <Th style={{ color: 'white', minWidth: '250px' }}>Name</Th>
                <Th style={{ color: 'var(--pf-v5-global--Color--200)' }}>Type</Th>
                <Th style={{ color: 'var(--pf-v5-global--Color--200)' }}>Severity</Th>
                <Th style={{ color: 'var(--pf-v5-global--Color--200)' }}>Evaluation</Th>
                <Th style={{ color: 'var(--pf-v5-global--Color--200)' }}>Version</Th>
                <Th style={{ color: 'var(--pf-v5-global--Color--200)' }}>Block Rate</Th>
                <Th style={{ color: 'var(--pf-v5-global--Color--200)' }}>Tags</Th>
                <Th style={{ color: 'var(--pf-v5-global--Color--200)', textAlign: 'right' }}>Last Modified</Th>
                <Th style={{ color: 'var(--pf-v5-global--Color--200)', width: '100px' }}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredGuardrails.map((guardrail) => (
                <Tr key={guardrail.id}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div 
                        style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%' 
                        }}
                        className={getStatusColor(guardrail.status)}
                      ></div>
                      <span style={{ fontWeight: 'var(--pf-v5-global--FontWeight--semi-bold)' }}>
                        {guardrail.name}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <Badge color={getTypeColor(guardrail.type)}>{guardrail.type}</Badge>
                  </Td>
                  <Td>
                    <Badge color={getSeverityColor(guardrail.severity)}>{guardrail.severity}</Badge>
                  </Td>
                  <Td>
                    {guardrail.evaluation === 'Not Evaluated' ? (
                      <Badge color={getEvaluationColor(guardrail.evaluation)}>Not Evaluated</Badge>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge color={getEvaluationColor(guardrail.evaluation)}>{guardrail.evaluation}</Badge>
                        {guardrail.evaluationScore && (
                          <span style={{ fontSize: '0.875rem' }}>{guardrail.evaluationScore}</span>
                        )}
                      </div>
                    )}
                  </Td>
                  <Td>{guardrail.version}</Td>
                  <Td>{guardrail.blockRate}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Badge isRead style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {guardrail.tags[0]}
                      </Badge>
                      {guardrail.tags.length > 1 && (
                        <Badge isRead>+{guardrail.tags.length - 1}</Badge>
                      )}
                    </div>
                  </Td>
                  <Td style={{ textAlign: 'right' }}>{guardrail.lastModified}</Td>
                  <Td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {flags.agentBuilderMode ? (
                        // Agent Builder mode - show input/output selection buttons
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {(() => {
                            const selectedType = isGuardrailSelected(guardrail.name);
                            const inputTaken = !!(agentBuilder.selectedGuardrails.input && agentBuilder.selectedGuardrails.input !== guardrail.name);
                            const outputTaken = !!(agentBuilder.selectedGuardrails.output && agentBuilder.selectedGuardrails.output !== guardrail.name);
                            
                            return (
                              <>
                                <Button 
                                  variant={selectedType === 'input' ? 'secondary' : 'primary'}
                                  size="sm"
                                  icon={selectedType === 'input' ? <CheckIcon /> : <PlusIcon />}
                                  onClick={() => handleAddToAgent(guardrail.name, 'input')}
                                  isDisabled={inputTaken}
                                >
                                  {selectedType === 'input' ? 'Input' : inputTaken ? 'Input Taken' : 'Add Input'}
                                </Button>
                                <Button 
                                  variant={selectedType === 'output' ? 'secondary' : 'primary'}
                                  size="sm"
                                  icon={selectedType === 'output' ? <CheckIcon /> : <PlusIcon />}
                                  onClick={() => handleAddToAgent(guardrail.name, 'output')}
                                  isDisabled={outputTaken}
                                >
                                  {selectedType === 'output' ? 'Output' : outputTaken ? 'Output Taken' : 'Add Output'}
                                </Button>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        // Normal mode - show user count
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--pf-v5-global--Color--200)' }}>
                          <UsersIcon style={{ width: '16px', height: '16px' }} />
                          <span>{guardrail.userCount}</span>
                        </div>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </div>
    </PageSection>
  );
};

export { Guardrails }; 