import React from 'react';
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  InputGroup,
  InputGroupItem,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Pagination,
  Popover,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@patternfly/react-table';
import {
  CheckCircleIcon,
  CopyIcon,
  EllipsisVIcon,
  ExclamationCircleIcon,
  FilterIcon,
  OutlinedFolderIcon,
  OutlinedQuestionCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { useFeatureFlags } from '../../utils/FeatureFlagsContext';
import { MCPIcon } from '@app/Home/icons';

// Full deployment YAML for "Edit" – includes metadata, spec, status (LLMInferenceService)
function getFullYamlForEdit(deployment: { name: string; project: string }): string {
  const name = deployment.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const namespace = deployment.project.toLowerCase().replace(/\s+/g, '-');
  return `apiVersion: serving.kserve.io/v1alpha1
kind: LLMInferenceService
metadata:
  annotations:
    opendatahub.io/hardware-profile-name: cypress-llmd-hardware-profile-model
    opendatahub.io/hardware-profile-namespace: opendatahub
    opendatahub.io/hardware-profile-resource-version: "16697227"
    opendatahub.io/model-type: generative
    openshift.io/display-name: ${deployment.name}
    serving.kserve.io/stop: "true"
    opendatahub.io/connections: hf://TinyLlama/TinyLlama-1.1B-Chat-v1.0
  name: ${name}
  namespace: ${namespace}
  labels:
    opendatahub.io/dashboard: "true"
spec:
  model:
    uri: ""
    name: ${name}
  replicas: 1
  router:
    gateway: {}
    route: []
    scheduler: {}
  template:
    containers:
      - name: main
        resources:
          requests:
            cpu: "1"
            memory: 8Gi
          limits:
            cpu: "1"
            memory: 8Gi
status:
  conditions:
    - lastTransitionTime: "2026-03-06T21:07:54Z"
      message: Service is stopped
      reason: Stopped
      status: "False"
      type: Ready
`;
}

// Mock data types
interface ModelDeployment {
  id: string;
  name: string;
  project: string;
  projectType: string;
  servingRuntime: string;
  inferenceEndpoint: string;
  apiProtocol: string;
  lastDeployed: string;
  status: 'Ready' | 'Failed' | 'Deploying' | 'Stopped' | 'Active';
}

// Mock data
const INITIAL_MOCK_DEPLOYMENTS: ModelDeployment[] = [
  {
    id: '1',
    name: 'Llama-3.1-8B-Instruct',
    project: 'Project X',
    projectType: 'Single-model serving enabled',
    servingRuntime: 'Caikit Standalone ServingRuntime for KServe',
    inferenceEndpoint: 'Available',
    apiProtocol: 'Not defined',
    lastDeployed: 'Today',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Mistral-7B-Instruct-v0.3',
    project: 'Project X',
    projectType: 'Single-model serving enabled',
    servingRuntime: 'Caikit Standalone ServingRuntime for KServe',
    inferenceEndpoint: 'Available',
    apiProtocol: 'REST',
    lastDeployed: 'Today',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Qwen2.5-7B-Instruct',
    project: 'Project X',
    projectType: 'Single-model serving enabled',
    servingRuntime: 'Unknown',
    inferenceEndpoint: 'Not available',
    apiProtocol: 'REST',
    lastDeployed: '-',
    status: 'Failed',
  },
  {
    id: '4',
    name: 'Llama-3.1-8B-Instruct',
    project: 'Project Y',
    projectType: 'Single-model serving enabled',
    servingRuntime: 'Caikit Standalone ServingRuntime for KServe',
    inferenceEndpoint: 'Available',
    apiProtocol: 'REST',
    lastDeployed: '2 hours ago',
    status: 'Ready',
  },
];

/** PatternFly table alignment: top-align cells so rows with mixed content stay consistent */
const deploymentsTableTdStyle = { verticalAlign: 'top' as const };

/** Keep first occurrence of each id to avoid duplicate rows and duplicate kebab menus */
function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

interface DeploymentsProps {
  isTabContent?: boolean;
}

const Deployments: React.FunctionComponent<DeploymentsProps> = ({ isTabContent = false }) => {
  useDocumentTitle('Deployments');
  const navigate = useNavigate();
  const location = useLocation();

  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  
  const pageTitle = 'Deployments';
  const DEPLOYMENTS_STORAGE_KEY = 'prototype-deployments';

  const [deployments, setDeploymentsRaw] = React.useState<ModelDeployment[]>(() => {
    const saved = localStorage.getItem(DEPLOYMENTS_STORAGE_KEY);
    const list = saved ? JSON.parse(saved) : INITIAL_MOCK_DEPLOYMENTS;
    return dedupeById(Array.isArray(list) ? list : INITIAL_MOCK_DEPLOYMENTS);
  });

  const setDeployments = React.useCallback((updater: ModelDeployment[] | ((prev: ModelDeployment[]) => ModelDeployment[])) => {
    setDeploymentsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const deduped = dedupeById(Array.isArray(next) ? next : prev);
      localStorage.setItem(DEPLOYMENTS_STORAGE_KEY, JSON.stringify(deduped));
      return deduped;
    });
  }, []);
  const [sortBy, setSortBy] = React.useState<string>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filterValue, setFilterValue] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);
  const [isNameSortOpen, setIsNameSortOpen] = React.useState(false);
  const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
  const [isFeatureModalOpen, setIsFeatureModalOpen] = React.useState(false);
  const [openKebabMenus, setOpenKebabMenus] = React.useState<Set<string>>(new Set());
  const [deploymentToDelete, setDeploymentToDelete] = React.useState<ModelDeployment | null>(null);
  const [isSelectProjectModalOpen, setIsSelectProjectModalOpen] = React.useState(false);
  const [modalProjectSelectOpen, setModalProjectSelectOpen] = React.useState(false);
  const [modalSelectedProject, setModalSelectedProject] = React.useState<string>('Project X');

  // Prevent adding the same newDeployment twice (e.g. React Strict Mode double-mount)
  const addedDeploymentIdRef = React.useRef<string | null>(null);

  // When returning from deploy wizard with newDeployment, add it to the list and clear state
  React.useEffect(() => {
    const state = location.state as { newDeployment?: ModelDeployment } | null;
    if (!state?.newDeployment) {
      addedDeploymentIdRef.current = null;
      return;
    }
    const id = state.newDeployment.id;
    if (addedDeploymentIdRef.current === id) return;
    addedDeploymentIdRef.current = id;
    setDeployments(prev => [state.newDeployment as ModelDeployment, ...prev]);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate, setDeployments]);

  // Copy handler with feedback
  const handleCopyWithFeedback = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set(Array.from(prev).concat(itemId)));
    setTimeout(() => {
      setCopiedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 2000);
  };

  // Model name click handler
  const handleModelNameClick = () => {
    setIsFeatureModalOpen(true);
  };

  // Stop button click handler
  const handleStopClick = () => {
    setIsFeatureModalOpen(true);
  };

  // Kebab menu handlers
  const toggleKebabMenu = (deploymentId: string) => {
    setOpenKebabMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deploymentId)) {
        newSet.delete(deploymentId);
      } else {
        newSet.add(deploymentId);
      }
      return newSet;
    });
  };


  const handleEditDeployment = (deployment: ModelDeployment) => {
    setOpenKebabMenus(new Set());
    navigate('/ai-hub/models/deployments/deploy', {
      state: { editMode: true, startInYaml: true, yamlContent: getFullYamlForEdit(deployment) },
    });
  };

  const handleDeleteDeployment = (deployment: ModelDeployment) => {
    setDeploymentToDelete(deployment);
    setOpenKebabMenus(new Set());
  };

  const handleDeployModelClick = () => {
    if (selectedProject === 'All projects') {
      setIsSelectProjectModalOpen(true);
    } else {
      navigate('/ai-hub/models/deployments/deploy');
    }
  };

  const handleModalDeployConfirm = () => {
    setSelectedProject(modalSelectedProject);
    setIsSelectProjectModalOpen(false);
    navigate('/ai-hub/models/deployments/deploy');
  };

  const confirmDeleteDeployment = () => {
    if (deploymentToDelete) {
      setDeployments(prev => prev.filter(d => d.id !== deploymentToDelete.id));
      setDeploymentToDelete(null);
    }
  };


  // Filter deployments based on search and project
  const getFilteredDeployments = () => {
    let filtered = [...deployments];
    
    // Filter by selected project (show all when "All projects" is selected)
    if (selectedProject !== 'All projects') {
      filtered = filtered.filter(d => d.project === selectedProject);
    }
    
    // Filter by search term
    if (filterValue) {
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Sort deployments
  const getSortedDeployments = () => {
    const filtered = getFilteredDeployments();
    
    return filtered.sort((a, b) => {
      let compareResult = 0;
      
      switch (sortBy) {
        case 'name':
          compareResult = a.name.localeCompare(b.name);
          break;
        case 'project':
          compareResult = a.project.localeCompare(b.project);
          break;
        case 'lastDeployed':
          // For now, since they're all "-", we'll just maintain order
          compareResult = 0;
          break;
        default:
          compareResult = 0;
      }
      
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  };

  // Paginate deployments
  const getPaginatedDeployments = () => {
    const sorted = getSortedDeployments();
    const startIdx = (currentPage - 1) * perPage;
    const endIdx = startIdx + perPage;
    return sorted.slice(startIdx, endIdx);
  };

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDirection('asc');
    }
  };

  const renderStatusBadge = (status: ModelDeployment['status']) => {
    switch (status) {
      case 'Ready':
        return <Label color="green">Ready</Label>;
      case 'Active':
        return <Label color="green" icon={<CheckCircleIcon />}>Active</Label>;
      case 'Failed':
        return <Label color="red" icon={<ExclamationCircleIcon />}>Failed</Label>;
      case 'Deploying':
        return <Label color="blue">Deploying</Label>;
      case 'Stopped':
        return <Label color="grey">Stopped</Label>;
      default:
        return <Label color="grey">Unknown</Label>;
    }
  };

  const renderTable = () => {
    const deployments = getSortedDeployments();
    
    if (deployments.length === 0) {
      return (
        <EmptyState>
          <Title headingLevel="h4" size="lg">
            <SearchIcon className="pf-v5-u-mr-sm" />
            No deployments found
          </Title>
          <EmptyStateBody>
            {filterValue ? 
              'No deployments match your filter criteria.' :
              'No model deployments are currently available in this project.'
            }
          </EmptyStateBody>
          {filterValue && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={() => setFilterValue('')}>
                  Clear filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      );
    }

    return (
      <>
        <Table aria-label="Model deployments table" id="model-deployments-table" variant="compact">
          <Thead>
            <Tr>
              <Th
                style={deploymentsTableTdStyle}
                width={20}
                sort={{
                  sortBy: { index: 0, direction: sortBy === 'name' ? sortDirection : undefined },
                  onSort: () => handleSort('name'),
                  columnIndex: 0
                }}
              >
                Model deployment name
              </Th>
              <Th
                style={deploymentsTableTdStyle}
                width={10}
                sort={{
                  sortBy: { index: 1, direction: sortBy === 'project' ? sortDirection : undefined },
                  onSort: () => handleSort('project'),
                  columnIndex: 1
                }}
              >
                Project
              </Th>
              <Th style={deploymentsTableTdStyle} width={15}>Serving runtime</Th>
              <Th style={deploymentsTableTdStyle} width={15}>Inference endpoints</Th>
              <Th style={deploymentsTableTdStyle} width={10}>API protocol</Th>
              <Th
                style={deploymentsTableTdStyle}
                width={10}
                sort={{
                  sortBy: { index: 5, direction: sortBy === 'lastDeployed' ? sortDirection : undefined },
                  onSort: () => handleSort('lastDeployed'),
                  columnIndex: 5
                }}
              >
                Last deployed
              </Th>
              <Th style={deploymentsTableTdStyle} width={10}>Status</Th>
              <Th style={deploymentsTableTdStyle} width={10} screenReaderText="Actions"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {getPaginatedDeployments().map((deployment) => (
              <Tr key={deployment.id}>
                <Td dataLabel="Model deployment name" style={deploymentsTableTdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Button
                      variant="link"
                      isInline
                      onClick={handleModelNameClick}
                      style={{ padding: 0, fontSize: 'inherit', fontWeight: 'bold', textDecoration: 'none' }}
                    >
                      {deployment.name}
                    </Button>
                    <Popover
                      bodyContent={
                        <div style={{ padding: '0.5rem', maxWidth: '300px' }}>
                          <div style={{ marginBottom: '1rem' }}>
                            Resource names and types are used to find your resources in OpenShift.
                          </div>
                          
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                              Resource name
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <TextInput
                                value={`${deployment.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-version-1`}
                                readOnly
                                aria-label="Resource name"
                                style={{ fontSize: '0.75rem', height: '28px' }}
                              />
                              <Tooltip content={copiedItems.has(`resource-${deployment.id}`) ? 'Copied' : 'Copy resource name'}>
                                <Button
                                  variant="plain"
                                  size="sm"
                                  aria-label="Copy resource name"
                                  onClick={() => handleCopyWithFeedback(`${deployment.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-version-1`, `resource-${deployment.id}`)}
                                  style={{ padding: '4px' }}
                                >
                                  {copiedItems.has(`resource-${deployment.id}`) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
                                </Button>
                              </Tooltip>
                            </div>
                          </div>

                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                              Resource type
                            </div>
                            <div>InferenceService</div>
                          </div>
                        </div>
                      }
                      position="right"
                    >
                      <Button variant="plain" aria-label="Deployment info" style={{ padding: '2px' }}>
                        <OutlinedQuestionCircleIcon style={{ fontSize: '14px', color: '#6A6E73' }} />
                      </Button>
                    </Popover>
                  </div>
                </Td>
                <Td dataLabel="Project" style={deploymentsTableTdStyle}>
                  <div>
                    <div>{deployment.project}</div>
                    <Badge isRead>{deployment.projectType}</Badge>
                  </div>
                </Td>
                <Td dataLabel="Serving runtime" style={deploymentsTableTdStyle}>
                  {deployment.servingRuntime}
                </Td>
                <Td dataLabel="Inference endpoints" style={deploymentsTableTdStyle}>
                  {deployment.inferenceEndpoint === 'Available' ? (
                    <Popover
                      bodyContent={
                        <div style={{ padding: '0.5rem', width: '300px', minWidth: '300px' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                              Inference endpoint
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <TextInput
                                value={`https://${deployment.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${deployment.project.toLowerCase().replace(/\s+/g, '-')}.apps.cluster.example.com`}
                                readOnly
                                aria-label="Inference endpoint"
                                style={{ fontSize: '0.75rem', height: '28px', fontFamily: 'monospace', width: '230px' }}
                              />
                              <Tooltip content={copiedItems.has(`endpoint-${deployment.id}`) ? 'Copied' : 'Copy endpoint'}>
                                <Button
                                  variant="plain"
                                  size="sm"
                                  aria-label="Copy endpoint"
                                  onClick={() => handleCopyWithFeedback(`https://${deployment.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${deployment.project.toLowerCase().replace(/\s+/g, '-')}.apps.cluster.example.com`, `endpoint-${deployment.id}`)}
                                  style={{ padding: '4px' }}
                                >
                                  {copiedItems.has(`endpoint-${deployment.id}`) ? <CheckCircleIcon style={{ fontSize: '12px' }} /> : <CopyIcon style={{ fontSize: '12px' }} />}
                                </Button>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      }
                      position="right"
                    >
                      <Button
                        variant="link"
                        isInline
                        style={{ padding: 0, textDecoration: 'none' }}
                      >
                        View
                      </Button>
                    </Popover>
                  ) : (
                    deployment.inferenceEndpoint
                  )}
                </Td>
                <Td dataLabel="API protocol" style={deploymentsTableTdStyle}>
                  {deployment.apiProtocol === 'REST' ? (
                    <Label color="yellow">REST</Label>
                  ) : (
                    <span style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                      {deployment.apiProtocol}
                    </span>
                  )}
                </Td>
                <Td dataLabel="Last deployed" style={deploymentsTableTdStyle}>
                  {deployment.lastDeployed}
                </Td>
                <Td dataLabel="Status" style={deploymentsTableTdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {renderStatusBadge(deployment.status)}
                    {(deployment.status === 'Active' || deployment.status === 'Ready') && (
                      <Button 
                        variant="link" 
                        isInline
                        onClick={handleStopClick}
                        style={{ padding: 0 }}
                      >
                        Stop
                      </Button>
                    )}
                  </div>
                </Td>
                <Td dataLabel="Actions" style={{ ...deploymentsTableTdStyle, textAlign: 'right' }}>
                  <Dropdown
                    isOpen={openKebabMenus.has(deployment.id)}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setOpenKebabMenus(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(deployment.id);
                          return newSet;
                        });
                      }
                    }}
                    popperProps={{ position: 'end', appendTo: () => document.body }}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleKebabMenu(deployment.id);
                        }}
                        variant="plain"
                        aria-label={`Actions for ${deployment.name}`}
                        isExpanded={openKebabMenus.has(deployment.id)}
                        id={`deployment-${deployment.id}-kebab-toggle`}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem
                        id={`deployment-${deployment.id}-edit`}
                        key="edit"
                        onClick={() => handleEditDeployment(deployment)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        id={`deployment-${deployment.id}-delete`}
                        key="delete"
                        onClick={() => handleDeleteDeployment(deployment)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Pagination
          itemCount={deployments.length}
          perPage={perPage}
          page={currentPage}
          onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
          onPerPageSelect={(_event, newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1);
          }}
          variant="bottom"
          perPageOptions={[
            { title: '5', value: 5 },
            { title: '10', value: 10 },
            { title: '20', value: 20 },
            { title: '50', value: 50 }
          ]}
        />
      </>
    );
  };

  return (
    <>
      {/* Header - Only show when not tab content */}
      {!isTabContent && (
      <PageSection>
        <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--ai-model-server--BackgroundColor, #E7F1FA)', borderRadius: '20px', padding: '4px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MCPIcon size={32} />
          </div>
          {pageTitle}
        </Title>
        <div style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
          Manage and view the health and performance of your deployed models.
        </div>
      </PageSection>
      )}

      {/* Project Selector - wrap in PageSection only when not tab content */}
      {flags.showProjectWorkspaceDropdowns && (
        !isTabContent ? (
          <PageSection style={{ paddingTop: '0.5rem', paddingBottom: '0.25rem' }}>
            <Toolbar>
              <ToolbarContent>
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
                            <SelectOption value="All projects">All projects</SelectOption>
                            <SelectOption value="Project X">Project X</SelectOption>
                            <SelectOption value="Project Y">Project Y</SelectOption>
                          </SelectList>
                        </Select>
                      </InputGroupItem>
                    </InputGroup>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
          </PageSection>
        ) : (
          <Toolbar>
            <ToolbarContent>
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
                          <SelectOption value="All projects">All projects</SelectOption>
                          <SelectOption value="Project X">Project X</SelectOption>
                          <SelectOption value="Project Y">Project Y</SelectOption>
                        </SelectList>
                      </Select>
                    </InputGroupItem>
                  </InputGroup>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        )
      )}

      {/* Main content - wrap in PageSection only when not tab content */}
      {!isTabContent ? (
        <PageSection style={{ paddingTop: '0.5rem' }}>
          <Toolbar id="deployments-toolbar">
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                <Dropdown
                  isOpen={isNameSortOpen}
                  onOpenChange={setIsNameSortOpen}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsNameSortOpen(!isNameSortOpen)}
                      isExpanded={isNameSortOpen}
                      icon={<FilterIcon />}
                    >
                      Name
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="name">Name</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <InputGroup>
                  <InputGroupItem isFill>
                    <SearchInput
                      placeholder="Filter by name"
                      value={filterValue}
                      onChange={(_event, value) => setFilterValue(value)}
                      onClear={() => setFilterValue('')}
                      aria-label="Filter deployments"
                    />
                  </InputGroupItem>
                </InputGroup>
              </ToolbarItem>
              <ToolbarItem>
                <Button
                  id="deployments-deploy-model-button"
                  variant="primary"
                  onClick={handleDeployModelClick}
                >
                  Deploy model
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              <ToolbarItem variant="pagination">
                <Pagination
                  itemCount={getSortedDeployments().length}
                  perPage={perPage}
                  page={currentPage}
                  onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
                  onPerPageSelect={(_event, newPerPage) => {
                    setPerPage(newPerPage);
                    setCurrentPage(1);
                  }}
                  variant="top"
                  isCompact
                  perPageOptions={[
                    { title: '5', value: 5 },
                    { title: '10', value: 10 },
                    { title: '20', value: 20 },
                    { title: '50', value: 50 }
                  ]}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>

        {renderTable()}
        </PageSection>
      ) : (
        <>
          <Toolbar id="deployments-toolbar">
            <ToolbarContent>
              <ToolbarGroup variant="filter-group">
                <ToolbarItem>
                  <Dropdown
                    isOpen={isNameSortOpen}
                    onOpenChange={setIsNameSortOpen}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setIsNameSortOpen(!isNameSortOpen)}
                        isExpanded={isNameSortOpen}
                        icon={<FilterIcon />}
                      >
                        Name
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="name">Name</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
                <ToolbarItem>
                  <InputGroup>
                    <InputGroupItem isFill>
                      <SearchInput
                        placeholder="Filter by name"
                        value={filterValue}
                        onChange={(_event, value) => setFilterValue(value)}
                        onClear={() => setFilterValue('')}
                        aria-label="Filter deployments"
                      />
                    </InputGroupItem>
                  </InputGroup>
                </ToolbarItem>
                <ToolbarItem>
                  <Button
                    id="deployments-deploy-model-button"
                    variant="primary"
                    onClick={handleDeployModelClick}
                  >
                    Deploy model
                  </Button>
                </ToolbarItem>
              </ToolbarGroup>
              <ToolbarGroup align={{ default: 'alignEnd' }}>
                <ToolbarItem variant="pagination">
                  <Pagination
                    itemCount={getSortedDeployments().length}
                    perPage={perPage}
                    page={currentPage}
                    onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
                    onPerPageSelect={(_event, newPerPage) => {
                      setPerPage(newPerPage);
                      setCurrentPage(1);
                    }}
                    variant="top"
                    isCompact
                    perPageOptions={[
                      { title: '5', value: 5 },
                      { title: '10', value: 10 },
                      { title: '20', value: 20 },
                      { title: '50', value: 50 }
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>

          {renderTable()}
        </>
      )}

      {/* Feature Not Available Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
      >
        <ModalHeader title="Not shown" />
        <ModalBody>
          <p>This interaction is out of scope for this prototype.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsFeatureModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete deployment confirmation */}
      <Modal
        variant={ModalVariant.small}
        isOpen={deploymentToDelete !== null}
        onClose={() => setDeploymentToDelete(null)}
        id="delete-deployment-modal"
        aria-label="Confirm delete deployment"
      >
        <ModalHeader title="Delete deployment?" />
        <ModalBody>
          {deploymentToDelete && (
            <p>
              Are you sure you want to delete <strong>{deploymentToDelete.name}</strong>? This action cannot be undone.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={confirmDeleteDeployment} id="delete-deployment-confirm-button">
            Delete
          </Button>
          <Button variant="link" onClick={() => setDeploymentToDelete(null)} id="delete-deployment-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Select Project modal – shown when deploying from "All projects" view */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isSelectProjectModalOpen}
        onClose={() => setIsSelectProjectModalOpen(false)}
        id="select-project-deploy-modal"
        aria-label="Select a project to deploy"
      >
        <ModalHeader title="Select a project" />
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="modal-project-select">Project</label>
            <Select
              id="modal-project-select"
              isOpen={modalProjectSelectOpen}
              selected={modalSelectedProject}
              onSelect={(_event, value) => {
                setModalSelectedProject(value as string);
                setModalProjectSelectOpen(false);
              }}
              onOpenChange={(isOpen) => setModalProjectSelectOpen(isOpen)}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setModalProjectSelectOpen(!modalProjectSelectOpen)}
                  isExpanded={modalProjectSelectOpen}
                  isFullWidth
                  id="modal-project-select-toggle"
                >
                  {modalSelectedProject}
                </MenuToggle>
              )}
              shouldFocusToggleOnSelect
            >
              <SelectList>
                <SelectOption id="modal-project-option-x" value="Project X">Project X</SelectOption>
                <SelectOption id="modal-project-option-y" value="Project Y">Project Y</SelectOption>
              </SelectList>
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleModalDeployConfirm} id="modal-deploy-confirm-button">
            Deploy model
          </Button>
          <Button variant="link" onClick={() => setIsSelectProjectModalOpen(false)} id="modal-deploy-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { Deployments };

