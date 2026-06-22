import React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  PageSection,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  Title
} from '@patternfly/react-core';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  LayerGroupIcon,
  RocketIcon,
  WrenchIcon
} from '@patternfly/react-icons';

interface WorkflowLayoutProps {
  children: React.ReactNode;
}

interface WizardStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

export const WorkflowLayout: React.FunctionComponent<WorkflowLayoutProps> = ({ children }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const steps: WizardStep[] = [
    {
      id: 'configure',
      name: 'Configure',
      description: 'Set up basic agent configuration',
      icon: <CogIcon />,
      completed: currentStep > 0
    },
    {
      id: 'components',
      name: 'Components',
      description: 'Add models, knowledge sources, and guardrails',
      icon: <LayerGroupIcon />,
      completed: currentStep > 1
    },
    {
      id: 'customize',
      name: 'Customize',
      description: 'Fine-tune settings and parameters',
      icon: <WrenchIcon />,
      completed: currentStep > 2
    },
    {
      id: 'deploy',
      name: 'Deploy',
      description: 'Test and deploy your agent',
      icon: <RocketIcon />,
      completed: currentStep > 3
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>
              Basic Configuration
            </Title>
            <p style={{ marginBottom: '1.5rem', color: 'var(--pf-v5-global--Color--200)' }}>
              Start by setting up the basic configuration for your AI agent. Choose a template and provide a description.
            </p>
            <div style={{ 
              border: '1px solid #e9ecef', 
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {children}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>
              Add Components
            </Title>
            <p style={{ marginBottom: '1.5rem', color: 'var(--pf-v5-global--Color--200)' }}>
              Select the AI models, knowledge sources, MCP servers, and guardrails for your agent.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <Card>
                <CardHeader>
                  <CardTitle>🤖 AI Models</CardTitle>
                </CardHeader>
                <CardBody>
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Choose the language model that will power your agent
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#e3f2fd', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      ✅ Claude 3 Sonnet
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      ➕ Add Model
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>📚 RAG</CardTitle>
                </CardHeader>
                <CardBody>
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Add RAG-enabled knowledge bases
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      ➕ Add Knowledge Source
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>🛡️ Guardrails</CardTitle>
                </CardHeader>
                <CardBody>
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Configure content filtering and safety
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      ➕ Add Input Guardrail
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      ➕ Add Output Guardrail
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>⚙️ MCP Servers</CardTitle>
                </CardHeader>
                <CardBody>
                  <p style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Connect external tools and services
                  </p>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '0.5rem' }}>
                      ➕ Add MCP Server
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>
              Customize Settings
            </Title>
            <p style={{ marginBottom: '1.5rem', color: 'var(--pf-v5-global--Color--200)' }}>
              Fine-tune your agent&apos;s behavior with advanced configuration options.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <Card>
                <CardHeader>
                  <CardTitle>🎛️ Model Parameters</CardTitle>
                </CardHeader>
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Temperature: 0.7</div>
                      <div style={{ height: '4px', backgroundColor: '#e9ecef', borderRadius: '2px' }}>
                        <div style={{ width: '70%', height: '100%', backgroundColor: '#0066cc', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Max Tokens: 2048</div>
                      <div style={{ height: '4px', backgroundColor: '#e9ecef', borderRadius: '2px' }}>
                        <div style={{ width: '50%', height: '100%', backgroundColor: '#0066cc', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Top P: 0.95</div>
                      <div style={{ height: '4px', backgroundColor: '#e9ecef', borderRadius: '2px' }}>
                        <div style={{ width: '95%', height: '100%', backgroundColor: '#0066cc', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>🎯 System Prompt</CardTitle>
                </CardHeader>
                <CardBody>
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    border: '1px solid #d2d2d2'
                  }}>
                    You are a helpful AI assistant that provides accurate, concise information...
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>
              Deploy & Test
            </Title>
            <p style={{ marginBottom: '1.5rem', color: 'var(--pf-v5-global--Color--200)' }}>
              Test your agent and deploy it to production when ready.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <Card>
                <CardHeader>
                  <CardTitle>🧪 Test Agent</CardTitle>
                </CardHeader>
                <CardBody>
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '1rem', 
                    borderRadius: '4px',
                    minHeight: '200px',
                    border: '1px solid #d2d2d2',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                      Chat interface for testing your agent...
                    </div>
                  </div>
                  <Button variant="primary" style={{ width: '100%' }}>
                    Start Test Chat
                  </Button>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>🚀 Deployment</CardTitle>
                </CardHeader>
                <CardBody>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: '4px',
                      border: '1px solid #4caf50'
                    }}>
                      <div style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: '0.5rem' }}>
                        ✅ Configuration Valid
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#2e7d32' }}>
                        Your agent is ready for deployment
                      </div>
                    </div>
                    
                    <Button variant="primary" icon={<RocketIcon />} style={{ width: '100%' }}>
                      Deploy Agent
                    </Button>
                    
                    <Button variant="secondary" style={{ width: '100%' }}>
                      Export Configuration
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <PageSection padding={{ default: 'noPadding' }}>
      <div style={{ backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 200px)' }}>
        {/* Workflow Header */}
        <div style={{ 
          padding: '1.5rem 2rem', 
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #d2d2d2',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsLg' }}>
                <FlexItem>
                  <LayerGroupIcon style={{ marginRight: '0.5rem', color: '#0066cc' }} />
                  <Title headingLevel="h2" size="lg" style={{ display: 'inline' }}>
                    Workflow Layout
                  </Title>
                </FlexItem>
                <FlexItem>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Step-by-step agent creation wizard
                  </div>
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <Progress 
                value={(currentStep + 1) / steps.length * 100} 
                title="Progress"
                size={ProgressSize.lg}
                measureLocation={ProgressMeasureLocation.top}
                style={{ width: '200px' }}
              />
            </FlexItem>
          </Flex>
        </div>

                 {/* Step Navigation */}
         <div style={{ 
           padding: '1rem 2rem', 
           backgroundColor: '#ffffff',
           borderBottom: '1px solid #e9ecef'
         }}>
           <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
             {steps.map((step, index) => (
               <div
                 key={step.id}
                 onClick={() => handleStepClick(index)}
                 style={{ 
                   cursor: 'pointer',
                   flex: 1,
                   textAlign: 'center',
                   padding: '1rem',
                   borderRadius: '8px',
                   backgroundColor: currentStep === index ? '#e3f2fd' : 'transparent',
                   border: currentStep === index ? '2px solid #0066cc' : '2px solid transparent',
                   margin: '0 0.5rem'
                 }}
               >
                 <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                   <FlexItem style={{ color: currentStep === index ? '#0066cc' : 'inherit', fontSize: '1.5rem' }}>
                     {step.icon}
                   </FlexItem>
                   <FlexItem>
                     <div style={{ fontWeight: currentStep === index ? 'bold' : 'normal' }}>
                       {step.name}
                     </div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)', marginTop: '0.25rem' }}>
                       {step.description}
                     </div>
                   </FlexItem>
                   {step.completed && (
                     <FlexItem>
                       <CheckIcon style={{ color: '#3e8635' }} />
                     </FlexItem>
                   )}
                 </Flex>
               </div>
             ))}
           </Flex>
         </div>

        {/* Main Content */}
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Card>
            <CardBody style={{ padding: '2rem' }}>
              {getCurrentStepContent()}
            </CardBody>
          </Card>
        </div>

        {/* Footer Navigation */}
        <div style={{ 
          padding: '1rem 2rem', 
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e9ecef',
          position: 'sticky',
          bottom: 0
        }}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem>
              <Button 
                variant="secondary" 
                icon={<ChevronLeftIcon />}
                onClick={handlePrevious}
                isDisabled={currentStep === 0}
              >
                Previous
              </Button>
            </FlexItem>
            <FlexItem>
              <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <span style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <Button 
                variant="primary" 
                iconPosition="end"
                icon={currentStep === steps.length - 1 ? <CheckIcon /> : <ChevronRightIcon />}
                onClick={handleNext}
                isDisabled={currentStep === steps.length - 1}
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </FlexItem>
          </Flex>
        </div>
      </div>
    </PageSection>
  );
}; 