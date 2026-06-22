import * as React from 'react';
import {
  ActionGroup,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  FileUpload,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Label,
  PageSection,
  Panel,
  PanelMain,
  PanelMainBody,
  Radio,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { CubesIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as yaml from 'js-yaml';

// Server data mapping from MCP catalog
const serverData: Record<string, any> = {
  'servicenow-mcp-server': {
    source: 'ServiceNow MCP Server',
    mcp_servers: [{
      name: 'ServiceNow',
      provider: 'echelon-ai-labs',
      version: '2.1.0',
      description: 'Automate incident management by creating, updating, and querying ServiceNow tickets and change requests.',
      transports: ['stdio'],
      deploymentMode: 'local',
      tools: [
        { name: 'create_incident', description: 'Create a new incident ticket', accessType: 'read_write' },
        { name: 'update_incident', description: 'Update an existing incident', accessType: 'read_write' },
        { name: 'query_tickets', description: 'Query ServiceNow tickets', accessType: 'read_only' }
      ]
    }]
  },
  'splunk-mcp-server': {
    source: 'Splunk MCP Server',
    mcp_servers: [{
      name: 'Splunk',
      provider: 'livehybrid',
      version: '1.3.1',
      description: 'Query logs and metrics with SPL to analyze incidents, explain anomalies, and draft post-mortems.',
      transports: ['http'],
      deploymentMode: 'remote',
      tools: [
        { name: 'search_logs', description: 'Search logs using SPL', accessType: 'read_only' },
        { name: 'get_metrics', description: 'Retrieve metrics data', accessType: 'read_only' }
      ]
    }]
  },
  'mcp-kubernetes-server': {
    source: 'Kubernetes MCP Server',
    mcp_servers: [{
      name: 'Kubernetes',
      provider: 'feiskyer',
      version: '0.1.11',
      description: 'Control and inspect Kubernetes clusters using natural language queries for health, resources, and deployments.',
      transports: ['stdio'],
      deploymentMode: 'local',
      tools: [
        { name: 'get_pods', description: 'List pods in a namespace', accessType: 'read_only' },
        { name: 'get_deployments', description: 'List deployments', accessType: 'read_only' },
        { name: 'scale_deployment', description: 'Scale a deployment', accessType: 'read_write' },
        { name: 'delete_pod', description: 'Delete a pod', accessType: 'destructive' }
      ]
    }]
  },
  'slack-mcp-server': {
    source: 'Slack MCP Server',
    mcp_servers: [{
      name: 'Slack',
      provider: 'korotovsky',
      version: '1.4.2',
      description: 'Post messages, read threads, and trigger workflows to automate DevOps team communications in Slack.',
      transports: ['http'],
      deploymentMode: 'remote',
      tools: [
        { name: 'post_message', description: 'Post a message to a channel', accessType: 'read_write' },
        { name: 'read_thread', description: 'Read messages in a thread', accessType: 'read_only' }
      ]
    }]
  },
  'salesforce-mcp-server': {
    source: 'Salesforce MCP Server',
    mcp_servers: [{
      name: 'Salesforce',
      provider: 'tsmztech',
      version: '1.8.3',
      description: 'Access CRM data with SOQL queries to retrieve accounts, cases, and opportunities for AI.',
      transports: ['stdio'],
      deploymentMode: 'local',
      tools: [
        { name: 'query_accounts', description: 'Query accounts using SOQL', accessType: 'read_only' },
        { name: 'query_cases', description: 'Query cases using SOQL', accessType: 'read_only' },
        { name: 'create_case', description: 'Create a new case', accessType: 'read_write' }
      ]
    }]
  },
  'dynatrace-mcp-server': {
    source: 'Dynatrace MCP Server',
    mcp_servers: [{
      name: 'Dynatrace',
      provider: 'dynatrace-oss',
      version: '2.0.4',
      description: 'Monitor service health in real-time with DQL queries and vulnerability feeds for proactive recommendations.',
      transports: ['stdio'],
      deploymentMode: 'local',
      tools: [
        { name: 'query_metrics', description: 'Query metrics using DQL', accessType: 'read_only' },
        { name: 'get_vulnerabilities', description: 'Get vulnerability information', accessType: 'read_only' }
      ]
    }]
  },
  'github-mcp-server': {
    source: 'GitHub MCP Server',
    mcp_servers: [{
      name: 'GitHub',
      provider: 'github',
      version: '1.2.5',
      description: 'Manage repositories, issues, and pull requests while automating code reviews, releases, and developer workflows.',
      transports: ['http'],
      deploymentMode: 'remote',
      tools: [
        { name: 'create_issue', description: 'Create a new issue', accessType: 'read_write' },
        { name: 'list_repos', description: 'List repositories', accessType: 'read_only' },
        { name: 'create_pr', description: 'Create a pull request', accessType: 'read_write' },
        { name: 'delete_repo', description: 'Delete a repository', accessType: 'destructive' }
      ]
    }]
  },
  'postgres-mcp-server': {
    source: 'PostgreSQL MCP Server',
    mcp_servers: [{
      name: 'PostgreSQL',
      provider: 'modelcontextprotocol',
      version: '1.0.8',
      description: 'Execute read-only SQL queries with audit trails for secure access to healthcare and financial databases.',
      transports: ['stdio'],
      deploymentMode: 'local',
      tools: [
        { name: 'execute_query', description: 'Execute a SELECT query', accessType: 'read_only' },
        { name: 'describe_table', description: 'Get table schema', accessType: 'read_only' }
      ]
    }]
  },
  'zapier-mcp-server': {
    source: 'Zapier MCP Server',
    mcp_servers: [{
      name: 'Zapier',
      provider: 'zapier',
      version: '3.2.1',
      description: 'Connect to 7,000+ SaaS applications instantly without code for calendars, tickets, and enterprise workflows.',
      transports: ['http'],
      deploymentMode: 'remote',
      tools: [
        { name: 'trigger_zap', description: 'Trigger a Zapier automation', accessType: 'read_write' },
        { name: 'list_zaps', description: 'List available Zaps', accessType: 'read_only' }
      ]
    }]
  }
};

const ManageMCPSource: React.FunctionComponent = () => {
  const { sourceId } = useParams<{ sourceId: string }>();
  const navigate = useNavigate();
  useDocumentTitle('Manage MCP Source');

  // Get initial server data if available
  const initialServerData = sourceId && serverData[sourceId] ? serverData[sourceId] : null;

  // Use the server name from the data, or fall back to parsing the sourceId
  const initialName = initialServerData?.mcp_servers?.[0]?.name || '';

  const [name, setName] = React.useState(initialName);
  const [sourceType, setSourceType] = React.useState('yaml');
  const [filename, setFilename] = React.useState('');
  const [yamlContent, setYamlContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisibleInCatalog, setIsVisibleInCatalog] = React.useState(true);
  const [parsedServer, setParsedServer] = React.useState<any>(initialServerData);
  const [parseError, setParseError] = React.useState<string>('');

  const handleFileInputChange = (_event: any, file: File) => {
    setFilename(file.name);
  };

  const handleFileReadStarted = (_event: any, _fileHandle: File) => {
    setIsLoading(true);
  };

  const handleFileReadFinished = (_event: any, _fileHandle: File) => {
    setIsLoading(false);
  };

  const parseYamlContent = (content: string) => {
    if (!content.trim()) {
      setParsedServer(null);
      setParseError('');
      return;
    }

    try {
      const parsed = yaml.load(content, {
        schema: yaml.JSON_SCHEMA,
        json: true
      });
      setParsedServer(parsed);
      setParseError('');
    } catch (error) {
      setParsedServer(null);

      let errorMessage = 'Invalid YAML format';
      if (error instanceof Error) {
        errorMessage = error.message;
        const firstLine = errorMessage.split('\n')[0];
        errorMessage = firstLine || errorMessage;
      }
      setParseError(errorMessage);
    }
  };

  const handleTextAreaChange = (_event: React.ChangeEvent<HTMLTextAreaElement>, value: string) => {
    setYamlContent(value);
    parseYamlContent(value);
  };

  const handleClear = () => {
    setFilename('');
    setYamlContent('');
    setParsedServer(null);
    setParseError('');
  };

  const handleUpdate = () => {
    const serverNames: string[] = [];
    if (parsedServer?.mcp_servers) {
      parsedServer.mcp_servers.forEach((server: any) => {
        if (server.name) {
          serverNames.push(server.name);
        }
      });
    }

    navigate('/settings/mcp-resources/settings', {
      state: {
        updatedSource: {
          id: sourceId,
          name,
          sourceType,
          serverNames,
          isVisibleInCatalog
        }
      }
    });
  };

  return (
    <>
      <PageSection>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/settings/mcp-resources/settings">MCP catalog settings</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Manage source</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      <PageSection>
        <Flex alignItems={{ default: 'alignItemsStretch' }}>
          <FlexItem flex={{ default: 'flex_2' }} style={{ paddingRight: 'var(--pf-v5-global--spacer--lg)' }}>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h1" size="2xl">Manage source</Title>
                <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
                  Update the MCP server source configuration.
                </p>
              </StackItem>

              <StackItem>
                <Form>
                  <FormGroup label="Name" isRequired fieldId="source-name">
                    <TextInput
                      isRequired
                      type="text"
                      id="source-name"
                      name="source-name"
                      value={name}
                      onChange={(_event, value) => setName(value)}
                    />
                  </FormGroup>

                  <FormGroup label="Source type" isRequired fieldId="source-type">
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <Radio
                        isChecked={sourceType === 'github'}
                        name="source-type"
                        onChange={() => setSourceType('github')}
                        label="Remote endpoint"
                        id="source-type-github"
                      />
                      <Radio
                        isChecked={sourceType === 'yaml'}
                        name="source-type"
                        onChange={() => setSourceType('yaml')}
                        label="YAML file"
                        id="source-type-yaml"
                      />
                    </div>
                  </FormGroup>

                  <FormGroup label="Upload a YAML file" isRequired fieldId="yaml-upload">
                    <FileUpload
                      id="yaml-file-upload"
                      type="text"
                      value={yamlContent}
                      filename={filename}
                      filenamePlaceholder="Drag and drop a YAML file or upload one"
                      onFileInputChange={handleFileInputChange}
                      onDataChange={(_event, value) => {
                        setYamlContent(value);
                        parseYamlContent(value);
                      }}
                      onTextChange={handleTextAreaChange}
                      onReadStarted={handleFileReadStarted}
                      onReadFinished={handleFileReadFinished}
                      onClearClick={handleClear}
                      isLoading={isLoading}
                      allowEditingUploadedText
                      browseButtonText="Upload"
                      clearButtonText="Clear"
                      dropzoneProps={{
                        accept: { 'text/yaml': ['.yaml', '.yml'] }
                      }}
                    />
                    <div style={{
                      color: 'var(--pf-v5-global--Color--200)',
                      fontSize: 'var(--pf-v5-global--FontSize--sm)',
                      marginTop: '0.5rem'
                    }}>
                      Upload or paste a YAML string.
                    </div>
                  </FormGroup>

                  <FormGroup fieldId="visible-in-catalog">
                    <Checkbox
                      id="visible-in-catalog"
                      label="Visible in catalog"
                      isChecked={isVisibleInCatalog}
                      onChange={(_event, checked) => setIsVisibleInCatalog(checked)}
                    />
                  </FormGroup>

                  <ActionGroup style={{ marginTop: '2rem' }}>
                    <Button variant="secondary" onClick={handleUpdate} isDisabled={!name || !yamlContent}>
                      Update
                    </Button>
                    <Button variant="link" component={(props: any) => <Link {...props} to="/settings/mcp-resources/settings" />}>
                      Cancel
                    </Button>
                  </ActionGroup>
                </Form>
              </StackItem>
            </Stack>
          </FlexItem>

          <Divider orientation={{ default: 'vertical' }} />

          <FlexItem flex={{ default: 'flex_1' }} style={{ paddingLeft: 'var(--pf-v5-global--spacer--lg)' }}>
            <Panel>
              <PanelMain>
                <PanelMainBody>
                  <Stack hasGutter>
                    <StackItem>
                      <Title headingLevel="h2" size="lg">MCP catalog preview</Title>
                    </StackItem>

                    <StackItem>
                      {parseError ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2rem 1rem',
                          textAlign: 'center'
                        }}>
                          <ExclamationCircleIcon style={{ fontSize: '3rem', color: 'var(--pf-v5-global--danger-color--100)', marginBottom: '1rem' }} />
                          <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }}>
                            YAML Parsing Error
                          </Title>
                          <p style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                            {parseError}
                          </p>
                        </div>
                      ) : parsedServer ? (
                        <div>
                          {parsedServer.source && (
                            <div style={{ marginBottom: '1rem' }}>
                              <Label color="blue">{parsedServer.source}</Label>
                            </div>
                          )}

                          {parsedServer.mcp_servers && parsedServer.mcp_servers.length > 0 ? (
                            <>
                              {parsedServer.mcp_servers.map((server: any, index: number) => (
                                <div key={index} style={{ marginBottom: index < parsedServer.mcp_servers.length - 1 ? '2rem' : 0 }}>
                                  {parsedServer.mcp_servers.length > 1 && (
                                    <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem' }}>
                                      Server {index + 1}
                                    </Title>
                                  )}
                                  <DescriptionList isCompact>
                                    {server.name && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Name</DescriptionListTerm>
                                        <DescriptionListDescription>{server.name}</DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.provider && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Provider</DescriptionListTerm>
                                        <DescriptionListDescription>{server.provider}</DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.version && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Version</DescriptionListTerm>
                                        <DescriptionListDescription>{server.version}</DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.license && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>License</DescriptionListTerm>
                                        <DescriptionListDescription>
                                          {server.license_link ? (
                                            <a href={server.license_link} target="_blank" rel="noopener noreferrer">
                                              {server.license}
                                            </a>
                                          ) : (
                                            server.license
                                          )}
                                        </DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.description && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Description</DescriptionListTerm>
                                        <DescriptionListDescription
                                          style={{
                                            maxHeight: '100px',
                                            overflow: 'auto',
                                            fontSize: 'var(--pf-v5-global--FontSize--sm)'
                                          }}
                                        >
                                          {server.description}
                                        </DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.transports && server.transports.length > 0 && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Transports</DescriptionListTerm>
                                        <DescriptionListDescription>
                                          {server.transports.join(', ')}
                                        </DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.deploymentMode && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Deployment</DescriptionListTerm>
                                        <DescriptionListDescription>
                                          <Label color={server.deploymentMode === 'remote' ? 'purple' : 'blue'}>
                                            {server.deploymentMode}
                                          </Label>
                                        </DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.tools && server.tools.length > 0 && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Tools</DescriptionListTerm>
                                        <DescriptionListDescription>
                                          {server.tools.length} tool{server.tools.length !== 1 ? 's' : ''} provided
                                        </DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.documentationUrl && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Documentation</DescriptionListTerm>
                                        <DescriptionListDescription>
                                          <a href={server.documentationUrl} target="_blank" rel="noopener noreferrer">
                                            View docs
                                          </a>
                                        </DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.repositoryUrl && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Repository</DescriptionListTerm>
                                        <DescriptionListDescription>
                                          <a href={server.repositoryUrl} target="_blank" rel="noopener noreferrer">
                                            View source
                                          </a>
                                        </DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                    {server.publishedDate && (
                                      <DescriptionListGroup>
                                        <DescriptionListTerm>Published</DescriptionListTerm>
                                        <DescriptionListDescription>{server.publishedDate}</DescriptionListDescription>
                                      </DescriptionListGroup>
                                    )}
                                  </DescriptionList>
                                </div>
                              ))}
                            </>
                          ) : (
                            <div>
                              <Title headingLevel="h3" size="md" style={{ marginBottom: '1rem' }}>
                                Server Properties
                              </Title>
                              <p style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                                No MCP servers found in the YAML. Expected structure with "mcp_servers" array.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '3rem 1rem',
                          textAlign: 'center'
                        }}>
                          <CubesIcon style={{ fontSize: '4rem', color: 'var(--pf-v5-global--Color--200)', marginBottom: '1.5rem' }} />
                          <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>
                            Preview servers
                          </Title>
                          <p style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                            Upload or paste a YAML file to preview the MCP servers from this source.
                          </p>
                        </div>
                      )}
                    </StackItem>
                  </Stack>
                </PanelMainBody>
              </PanelMain>
            </Panel>
          </FlexItem>
        </Flex>
      </PageSection>
    </>
  );
};

export { ManageMCPSource };
