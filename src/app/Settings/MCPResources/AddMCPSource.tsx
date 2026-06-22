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
import { Link, useNavigate } from 'react-router-dom';
import * as yaml from 'js-yaml';

const AddMCPSource: React.FunctionComponent = () => {
  useDocumentTitle('Add MCP Source');
  const navigate = useNavigate();

  const [name, setName] = React.useState('');
  const [sourceType, setSourceType] = React.useState('yaml');
  const [filename, setFilename] = React.useState('');
  const [yamlContent, setYamlContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisibleInCatalog, setIsVisibleInCatalog] = React.useState(true);
  const [parsedServer, setParsedServer] = React.useState<any>(null);
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
      // Try to parse with lenient schema
      const parsed = yaml.load(content, {
        schema: yaml.JSON_SCHEMA,
        json: true
      });
      setParsedServer(parsed);
      setParseError('');
    } catch (error) {
      setParsedServer(null);

      // Provide a more user-friendly error message
      let errorMessage = 'Invalid YAML format';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Extract just the first line of the error for cleaner display
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

  const handleAdd = () => {
    // Extract server names from the parsed YAML
    const serverNames: string[] = [];
    if (parsedServer?.mcp_servers) {
      parsedServer.mcp_servers.forEach((server: any) => {
        if (server.name) {
          serverNames.push(server.name);
        }
      });
    }

    // Navigate back to settings page with new server data
    navigate('/settings/mcp-resources/settings', {
      state: {
        newSource: {
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
          <BreadcrumbItem isActive>Add a source</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      <PageSection>
        <Flex alignItems={{ default: 'alignItemsStretch' }}>
          <FlexItem flex={{ default: 'flex_2' }} style={{ paddingRight: 'var(--pf-v5-global--spacer--lg)' }}>
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h1" size="2xl">Add a source</Title>
                <p style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
                  Add a new MCP server source to your organization.
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
                    <Button variant="secondary" onClick={handleAdd} isDisabled={!name || !yamlContent}>
                      Add
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

export { AddMCPSource };
