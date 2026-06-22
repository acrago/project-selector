import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Stack,
  StackItem,
  Tab,
  TabTitleText,
  Tabs,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectConnections } from './connections';

export const ProjectDetail: React.FunctionComponent = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);
  const [apiKeyValue, setApiKeyValue] = React.useState('');
  const [isApiKeyVisible, setIsApiKeyVisible] = React.useState(false);
  const [apiKeyModalState, setApiKeyModalState] = React.useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [simulateError, setSimulateError] = React.useState(false);
  const [isApiKeySaved, setIsApiKeySaved] = React.useState(false);

  const resetApiKeyModal = (keySaved?: boolean) => {
    if (keySaved) setIsApiKeySaved(true);
    setIsApiKeyModalOpen(false);
    setApiKeyValue('');
    setIsApiKeyVisible(false);
    setApiKeyModalState('idle');
  };

  const handleApiKeySubmit = () => {
    setApiKeyModalState('validating');
    setTimeout(() => {
      setApiKeyModalState(simulateError ? 'error' : 'success');
    }, 3000);
  };

  // Mock project data - replace with actual API call
  const projectName = projectId ? `Project ${projectId}` : 'Project';

  const handleTabSelect = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <>
      <PageSection id="project-detail-header">
        <Stack hasGutter>
          <StackItem>
            <Breadcrumb id="project-breadcrumb">
              <BreadcrumbItem
                to="/projects"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/projects');
                }}
                id="projects-breadcrumb-item"
              >
                Projects
              </BreadcrumbItem>
              <BreadcrumbItem isActive id="project-name-breadcrumb-item">
                {projectName}
              </BreadcrumbItem>
            </Breadcrumb>
          </StackItem>
          <StackItem>
            <Title headingLevel="h1" size="2xl" id="project-detail-title">
              {projectName}
            </Title>
          </StackItem>
        </Stack>
      </PageSection>

      <PageSection type="tabs" isWidthLimited id="project-detail-tabs-section">
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          aria-label="Project detail tabs"
          role="region"
          id="project-detail-tabs"
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Overview</TabTitleText>}
            aria-label="Project overview"
            id="overview-tab"
          >
            <PageSection isFilled id="overview-tab-content">
              <Title headingLevel="h2" id="overview-title">
                Project Overview
              </Title>
              {/* Add overview content here */}
            </PageSection>
          </Tab>

          <Tab
            eventKey={1}
            title={<TabTitleText>Connections</TabTitleText>}
            aria-label="Project connections"
            id="connections-tab"
          >
            <ProjectConnections projectId={projectId} />
          </Tab>

          <Tab
            eventKey={2}
            title={<TabTitleText>Workbenches</TabTitleText>}
            aria-label="Project workbenches"
            id="workbenches-tab"
          >
            <PageSection isFilled id="workbenches-tab-content">
              <Title headingLevel="h2" id="workbenches-title">
                Workbenches
              </Title>
              {/* Add workbenches content here */}
            </PageSection>
          </Tab>

          <Tab
            eventKey={3}
            title={<TabTitleText>Pipelines</TabTitleText>}
            aria-label="Project pipelines"
            id="pipelines-tab"
          >
            <PageSection isFilled id="pipelines-tab-content">
              <Title headingLevel="h2" id="pipelines-title">
                Pipelines
              </Title>
              {/* Add pipelines content here */}
            </PageSection>
          </Tab>

          <Tab
            eventKey={4}
            title={<TabTitleText>Data</TabTitleText>}
            aria-label="Project data"
            id="data-tab"
          >
            <PageSection isFilled id="data-tab-content">
              <Title headingLevel="h2" id="data-title">
                Data
              </Title>
              {/* Add data content here */}
            </PageSection>
          </Tab>

          <Tab
            eventKey={5}
            title={<TabTitleText>Settings</TabTitleText>}
            aria-label="Project settings"
            id="settings-tab"
          >
            <PageSection isFilled id="settings-tab-content">
              <Card id="nim-settings-card">
                <CardTitle id="nim-settings-card-title">NVIDIA NIM</CardTitle>
                <CardBody id="nim-settings-card-body">
                  <p style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    NVIDIA NIM, part of NVIDIA AI Enterprise, is a set of easy to use microservices designed to accelerate the deployment of generative AI models across the cloud, data center, and workstations.
                  </p>
                  {isApiKeySaved ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--sm)' }}>
                      <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />
                      <strong>Your personal API key has been saved.</strong>
                    </div>
                  ) : (
                    <Button variant="secondary" id="add-personal-api-key-button" onClick={() => setIsApiKeyModalOpen(true)}>
                      Add personal API key
                    </Button>
                  )}
                </CardBody>
              </Card>
            </PageSection>
          </Tab>
        </Tabs>
      </PageSection>

      {/* Enter NVIDIA personal API key modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isApiKeyModalOpen}
        onClose={() => resetApiKeyModal()}
        id="nvidia-api-key-modal"
        aria-label="Enter NVIDIA personal API key"
      >
        <ModalHeader title={apiKeyModalState === 'success' ? 'API key validated' : 'Enter NVIDIA personal API key'} />
        <ModalBody>
          {apiKeyModalState === 'success' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--sm)' }}>
              <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />
              <span>Your NVIDIA personal API key has been validated and saved.</span>
            </div>
          ) : (
            <>
              <FormGroup label="NVIDIA personal API key" fieldId="nvidia-api-key-input">
                <InputGroup>
                  <InputGroupItem isFill>
                    <TextInput
                      id="nvidia-api-key-input"
                      type={isApiKeyVisible ? 'text' : 'password'}
                      value={apiKeyValue}
                      onChange={(_event, value) => {
                        setApiKeyValue(value);
                        if (apiKeyModalState === 'error') setApiKeyModalState('idle');
                      }}
                      aria-label="NVIDIA personal API key"
                      isDisabled={apiKeyModalState === 'validating'}
                      validated={apiKeyModalState === 'error' ? 'error' : 'default'}
                    />
                  </InputGroupItem>
                  <InputGroupItem>
                    <Button
                      variant="plain"
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                      aria-label={isApiKeyVisible ? 'Hide API key' : 'Show API key'}
                      id="toggle-api-key-visibility-button"
                      isDisabled={apiKeyModalState === 'validating'}
                    >
                      {isApiKeyVisible ? <EyeSlashIcon /> : <EyeIcon />}
                    </Button>
                  </InputGroupItem>
                </InputGroup>
                <FormHelperText>
                  <HelperText>
                    {apiKeyModalState === 'error' ? (
                      <HelperTextItem variant="error" icon={<ExclamationCircleIcon />}>
                        Invalid API key. Verify your key and try again.
                      </HelperTextItem>
                    ) : (
                      <HelperTextItem>This key is given to you by NVIDIA</HelperTextItem>
                    )}
                  </HelperText>
                </FormHelperText>
              </FormGroup>
              <div style={{ marginTop: 'var(--pf-t--global--spacer--md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="simulate-error-checkbox"
                  checked={simulateError}
                  onChange={(e) => setSimulateError(e.target.checked)}
                  style={{ accentColor: 'var(--pf-t--global--color--status--danger--default)' }}
                />
                <label htmlFor="simulate-error-checkbox" style={{ color: 'var(--pf-t--global--color--status--danger--default)', fontSize: '0.75rem', cursor: 'pointer' }}>
                  Error state
                </label>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {apiKeyModalState === 'success' ? (
            <Button variant="primary" onClick={() => resetApiKeyModal(true)} id="nvidia-api-key-close-button">
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="primary"
                isDisabled={!apiKeyValue.trim() || apiKeyModalState === 'validating'}
                isLoading={apiKeyModalState === 'validating'}
                onClick={handleApiKeySubmit}
                id="nvidia-api-key-submit-button"
              >
                {apiKeyModalState === 'validating' ? 'Validating' : 'Submit'}
              </Button>
              <Button
                variant="link"
                onClick={() => resetApiKeyModal()}
                isDisabled={apiKeyModalState === 'validating'}
                id="nvidia-api-key-cancel-button"
              >
                Cancel
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

