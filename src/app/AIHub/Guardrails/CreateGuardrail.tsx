import * as React from 'react';
import {
  ActionGroup,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  PageSection,
  Select,
  SelectOption,
  TextArea,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const CreateGuardrail: React.FunctionComponent = () => {
  useDocumentTitle('Create Guardrail');
  const navigate = useNavigate();

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState('');
  const [severity, setSeverity] = React.useState('');
  const [isTypeOpen, setIsTypeOpen] = React.useState(false);
  const [isSeverityOpen, setIsSeverityOpen] = React.useState(false);

  const typeOptions = [
    { value: 'Content', label: 'Content' },
    { value: 'Security', label: 'Security' },
    { value: 'Privacy', label: 'Privacy' },
    { value: 'Custom', label: 'Custom' },
  ];

  const severityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual guardrail creation logic
    console.log('Creating guardrail:', { name, description, type, severity });
    // For now, navigate back to guardrails page
    navigate('/ai-assets/guardrails');
  };

  const handleCancel = () => {
    navigate('/ai-assets/guardrails');
  };

  return (
    <PageSection>
      <div style={{ padding: '1.5rem 0' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: '1.5rem' }}>
          <BreadcrumbItem>
            <Link to="/ai-assets/guardrails">Guardrails</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Create Guardrail</BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Title headingLevel="h1" size="2xl" style={{ marginBottom: '0.5rem' }}>
            Create New Guardrail
          </Title>
          <p style={{ color: 'var(--pf-v5-global--Color--200)', margin: 0 }}>
            Define a new safety guardrail for your AI applications
          </p>
        </div>

        {/* Form */}
        <Grid hasGutter>
          <GridItem lg={8} md={12}>
            <Card>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <FormGroup label="Name" isRequired fieldId="guardrail-name">
                    <TextInput
                      id="guardrail-name"
                      name="guardrail-name"
                      type="text"
                      value={name}
                      onChange={(_, value) => setName(value)}
                      placeholder="Enter guardrail name"
                      isRequired
                    />
                    <HelperText>
                      <HelperTextItem>Provide a descriptive name for your guardrail</HelperTextItem>
                    </HelperText>
                  </FormGroup>

                  <FormGroup label="Description" fieldId="guardrail-description">
                    <TextArea
                      id="guardrail-description"
                      name="guardrail-description"
                      value={description}
                      onChange={(_, value) => setDescription(value)}
                      placeholder="Describe what this guardrail does and when it should be applied"
                      rows={4}
                    />
                    <HelperText>
                      <HelperTextItem>Explain the purpose and behavior of this guardrail</HelperTextItem>
                    </HelperText>
                  </FormGroup>

                  <Grid hasGutter>
                    <GridItem md={6}>
                      <FormGroup label="Type" isRequired fieldId="guardrail-type">
                        <Select
                          aria-label="Select guardrail type"
                          toggle={(toggleRef) => (
                            <button
                              ref={toggleRef}
                              onClick={() => setIsTypeOpen(!isTypeOpen)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--pf-v5-global--BorderColor--100)',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                textAlign: 'left',
                                cursor: 'pointer'
                              }}
                            >
                              {type || 'Select type'}
                            </button>
                          )}
                          onSelect={(_, selection) => {
                            setType(selection as string);
                            setIsTypeOpen(false);
                          }}
                          selected={type}
                          isOpen={isTypeOpen}
                        >
                          {typeOptions.map((option) => (
                            <SelectOption key={option.value} value={option.value}>
                              {option.label}
                            </SelectOption>
                          ))}
                        </Select>
                        <HelperText>
                          <HelperTextItem>Choose the category that best describes this guardrail</HelperTextItem>
                        </HelperText>
                      </FormGroup>
                    </GridItem>
                    <GridItem md={6}>
                      <FormGroup label="Severity" isRequired fieldId="guardrail-severity">
                        <Select
                          aria-label="Select guardrail severity"
                          toggle={(toggleRef) => (
                            <button
                              ref={toggleRef}
                              onClick={() => setIsSeverityOpen(!isSeverityOpen)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid var(--pf-v5-global--BorderColor--100)',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                textAlign: 'left',
                                cursor: 'pointer'
                              }}
                            >
                              {severity || 'Select severity'}
                            </button>
                          )}
                          onSelect={(_, selection) => {
                            setSeverity(selection as string);
                            setIsSeverityOpen(false);
                          }}
                          selected={severity}
                          isOpen={isSeverityOpen}
                        >
                          {severityOptions.map((option) => (
                            <SelectOption key={option.value} value={option.value}>
                              {option.label}
                            </SelectOption>
                          ))}
                        </Select>
                        <HelperText>
                          <HelperTextItem>Set the risk level for violations of this guardrail</HelperTextItem>
                        </HelperText>
                      </FormGroup>
                    </GridItem>
                  </Grid>

                  <ActionGroup>
                    <Button variant="primary" type="submit" isDisabled={!name || !type || !severity}>
                      Create Guardrail
                    </Button>
                    <Button variant="link" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </ActionGroup>
                </Form>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem lg={4} md={12}>
            <Card>
              <CardBody>
                <Title headingLevel="h3" size="md" style={{ marginBottom: '1rem' }}>
                  Guardrail Guidelines
                </Title>
                <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Content:</strong> Filters for inappropriate, harmful, or policy-violating content
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Security:</strong> Protects against security threats and vulnerabilities
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Privacy:</strong> Ensures personal and sensitive information protection
                  </p>
                  <p style={{ marginBottom: '1rem' }}>
                    <strong>Custom:</strong> Organization-specific rules and policies
                  </p>
                  <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--pf-v5-global--BorderColor--100)' }} />
                  <p style={{ margin: 0 }}>
                    Choose severity based on the potential impact of violations and your organization&apos;s risk tolerance.
                  </p>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </div>
    </PageSection>
  );
};

export { CreateGuardrail }; 