import React from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Pagination,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Spinner,
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
  EllipsisVIcon,
  ExclamationCircleIcon,
  OutlinedFolderIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { DeleteMCPDeploymentModal } from './DeleteMCPDeploymentModal';
import { MCPIcon } from '@app/Home/icons';

// Pod status values (stretch goal - matches OpenShift/Kubernetes pod status)
type PodStatus = 'Pending' | 'Running' | 'Failed' | 'Succeeded' | 'Unknown' | 'Unavailable';

// OpenShift pod status descriptions for tooltips
const POD_STATUS_DESCRIPTIONS: Record<PodStatus, string> = {
  Running:
    'The pod and its containers are healthy and running without issues.',
  Pending:
    'The pod has been accepted by the Kubernetes cluster but one or more of its containers have not yet been created or started. This can be due to image pulls, pending persistent volume claims, or scheduling issues.',
  Succeeded:
    'All containers in the pod have terminated successfully and will not restart. This is typical for jobs or one-off tasks.',
  Failed:
    'All containers in the pod have terminated, but at least one terminated in a failure (non-zero exit code).',
  Unknown:
    'The state of the pod could not be determined, often due to a communication error with the host node.',
  Unavailable:
    'The deployment did not complete successfully and is unavailable.',
};

// Mock data types for deployed MCP servers
interface MCPDeployment {
  id: string;
  userName: string;
  mcpServerName: string;
  version: string;
  created: string; // ISO timestamp
  status: PodStatus;
  endpoint?: string;
  apiKey?: string;
}

// Format ISO timestamp for display
const formatCreated = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

// Mock data for deployed MCP servers
const mockMCPDeployments: MCPDeployment[] = [
  {
    id: '1',
    userName: 'Kubernetes Test',
    mcpServerName: 'Kubernetes',
    version: '1.0.0',
    created: '2024-11-15T10:30:00Z',
    status: 'Running',
    endpoint: 'kubernetes-test:8080',
    apiKey: 'sk-kubernetes-test-abc123',
  },
  {
    id: '2',
    userName: 'PostgreSQL Dev',
    mcpServerName: 'PostgreSQL',
    version: '2.1.0',
    created: '2024-11-15T09:00:00Z',
    status: 'Running',
    endpoint: 'postgresql-dev:8080',
    apiKey: 'sk-postgresql-dev-def456',
  },
  {
    id: '3',
    userName: 'ServiceNow Production',
    mcpServerName: 'ServiceNow',
    version: '1.2.0',
    created: '2024-11-12T14:00:00Z',
    status: 'Failed',
    endpoint: 'servicenow-production:8080',
    apiKey: 'sk-servicenow-prod-ghi789',
  },
];

interface MCPDeploymentsProps {
  isTabContent?: boolean;
}

const MCPDeployments: React.FunctionComponent<MCPDeploymentsProps> = ({ isTabContent = false }) => {
  useDocumentTitle('MCP Deployments');
  const location = useLocation();
  const navigate = useNavigate();

  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  const [deployments, setDeployments] = React.useState<MCPDeployment[]>(mockMCPDeployments);
  const [sortBy, setSortBy] = React.useState<string>('created');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [filterValue, setFilterValue] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = React.useState(false);
  const [deployingDeploymentId, setDeployingDeploymentId] = React.useState<string | null>(null);
  const [newlyDeployedId, setNewlyDeployedId] = React.useState<string | null>(null);
  const addedDeploymentIdRef = React.useRef<string | null>(null);
  const [openKebabDeploymentId, setOpenKebabDeploymentId] = React.useState<string | null>(null);
  const [deploymentToDelete, setDeploymentToDelete] = React.useState<MCPDeployment | null>(null);
  const [publishAsAssetDeployment, setPublishAsAssetDeployment] = React.useState<MCPDeployment | null>(null);
  const [publishAsAssetStatus, setPublishAsAssetStatus] = React.useState<'in-progress' | 'success' | null>(null);
  const [pendingStatusUpdateId, setPendingStatusUpdateId] = React.useState<string | null>(null);

  // Add newly deployed server from deploy modal navigation state (once per deployment)
  React.useEffect(() => {
    const state = location.state as { newDeployment?: MCPDeployment; fromEmbedModal?: boolean };
    const newDeployment = state?.newDeployment;
    if (!newDeployment || addedDeploymentIdRef.current === newDeployment.id) return;
    addedDeploymentIdRef.current = newDeployment.id;
    setDeployments(prev => [newDeployment, ...prev]);
    setCurrentPage(1);
    if (state?.fromEmbedModal && newDeployment.status === 'Pending') {
      setPendingStatusUpdateId(newDeployment.id);
    } else if (state?.fromEmbedModal) {
      setNewlyDeployedId(newDeployment.id);
    } else {
      setDeployingDeploymentId(newDeployment.id);
    }
    navigate('/ai-hub/mcp/deployments', { replace: true, state: {} });
  }, [location.state, navigate]);

  // After ~8s, transition Pending deployment to Running (available) or Unavailable (from embed modal)
  React.useEffect(() => {
    if (!pendingStatusUpdateId) return;
    const id = pendingStatusUpdateId;
    const targetStatus = flags.successfulMcpDeployment ? 'Running' : 'Unavailable';
    const timeout = setTimeout(() => {
      setDeployments(prev =>
        prev.map(d => (d.id === id ? { ...d, status: targetStatus } : d))
      );
      setNewlyDeployedId(id);
      setPendingStatusUpdateId(null);
    }, 8000);
    return () => clearTimeout(timeout);
  }, [pendingStatusUpdateId, flags.successfulMcpDeployment]);

  // Clear loading state after short delay, then trigger row highlight
  React.useEffect(() => {
    if (!deployingDeploymentId) return;
    const id = deployingDeploymentId;
    const timeout = setTimeout(() => {
      setDeployingDeploymentId(null);
      setNewlyDeployedId(id);
    }, 1800);
    return () => clearTimeout(timeout);
  }, [deployingDeploymentId]);

  // Clear row highlight after fade animation completes
  React.useEffect(() => {
    if (!newlyDeployedId) return;
    const timeout = setTimeout(() => setNewlyDeployedId(null), 2000);
    return () => clearTimeout(timeout);
  }, [newlyDeployedId]);

  const getFilteredDeployments = () => {
    let filtered = [...deployments];
    if (filterValue) {
      const v = filterValue.toLowerCase();
      filtered = filtered.filter(
        d =>
          d.userName.toLowerCase().includes(v) ||
          d.mcpServerName.toLowerCase().includes(v)
      );
    }
    return filtered;
  };

  const getSortedDeployments = () => {
    const filtered = getFilteredDeployments();
    return filtered.sort((a, b) => {
      let compareResult = 0;
      switch (sortBy) {
        case 'userName':
          compareResult = a.userName.localeCompare(b.userName);
          break;
        case 'mcpServerName':
          compareResult = a.mcpServerName.localeCompare(b.mcpServerName);
          break;
        case 'created':
          compareResult = new Date(a.created).getTime() - new Date(b.created).getTime();
          break;
        case 'status':
          compareResult = a.status.localeCompare(b.status);
          break;
        default:
          compareResult = 0;
      }
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  };

  const getPaginatedDeployments = () => {
    const sorted = getSortedDeployments();
    const startIdx = (currentPage - 1) * perPage;
    return sorted.slice(startIdx, startIdx + perPage);
  };

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDirection('asc');
    }
  };

  const renderStatusBadge = (status: PodStatus) => {
    const isAvailable = status === 'Running' || status === 'Succeeded';
    const isPending = status === 'Pending';
    const badge = isAvailable ? (
      <Label color="green" icon={<CheckCircleIcon />}>available</Label>
    ) : isPending ? (
      <Label color="orange" icon={<ExclamationCircleIcon />}>Pending</Label>
    ) : (
      <Label color="red" icon={<ExclamationCircleIcon />}>unavailable</Label>
    );
    return (
      <Tooltip content={POD_STATUS_DESCRIPTIONS[status]}>
        <span>{badge}</span>
      </Tooltip>
    );
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
            {filterValue
              ? 'No deployments match your filter criteria.'
              : 'No MCP server deployments are currently available in this project.'}
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
        <Table aria-label="MCP server deployments table" variant="compact">
          <Thead>
            <Tr>
              <Th
                width={30}
                sort={{
                  sortBy: { index: 0, direction: sortBy === 'mcpServerName' ? sortDirection : undefined },
                  onSort: () => handleSort('mcpServerName'),
                  columnIndex: 0,
                }}
              >
                Server
              </Th>
              <Th
                width={20}
                sort={{
                  sortBy: { index: 1, direction: sortBy === 'userName' ? sortDirection : undefined },
                  onSort: () => handleSort('userName'),
                  columnIndex: 1,
                }}
              >
                Name
              </Th>
              <Th
                width={25}
                sort={{
                  sortBy: { index: 2, direction: sortBy === 'created' ? sortDirection : undefined },
                  onSort: () => handleSort('created'),
                  columnIndex: 2,
                }}
              >
                Created
              </Th>
              <Th
                width={15}
                sort={{
                  sortBy: { index: 3, direction: sortBy === 'status' ? sortDirection : undefined },
                  onSort: () => handleSort('status'),
                  columnIndex: 3,
                }}
              >
                Status
              </Th>
              <Th width={10} />
            </Tr>
          </Thead>
          <Tbody>
            {getPaginatedDeployments().map((deployment) => {
              const serverNameWithVersion = `${deployment.mcpServerName.replace(/\s+/g, '-')}-${deployment.version}`;
              const isNewlyDeployed = deployment.id === newlyDeployedId;
              return (
                <Tr
                  key={deployment.id}
                  className={isNewlyDeployed ? 'mcp-deploy-highlight-row' : undefined}
                >
                  <Td dataLabel="Server">
                    <span style={{ fontWeight: 'bold' }}>{serverNameWithVersion}</span>
                  </Td>
                  <Td dataLabel="Name">{deployment.userName}</Td>
                  <Td dataLabel="Created">{formatCreated(deployment.created)}</Td>
                  <Td dataLabel="Status">{renderStatusBadge(deployment.status)}</Td>
                  <Td isActionCell>
                    <Dropdown
                      isOpen={openKebabDeploymentId === deployment.id}
                      onSelect={() => setOpenKebabDeploymentId(null)}
                      onOpenChange={(isOpen) => setOpenKebabDeploymentId(isOpen ? deployment.id : null)}
                      popperProps={{ position: 'right' }}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          variant="plain"
                          onClick={() =>
                            setOpenKebabDeploymentId(openKebabDeploymentId === deployment.id ? null : deployment.id)
                          }
                          isExpanded={openKebabDeploymentId === deployment.id}
                          aria-label={`Actions for ${deployment.userName}`}
                          id={`mcp-deployment-kebab-${deployment.id}`}
                        >
                          <EllipsisVIcon />
                        </MenuToggle>
                      )}
                    >
                      <DropdownList>
                        <DropdownItem
                          key="edit"
                          onClick={() => {
                            setOpenKebabDeploymentId(null);
                            const containerImageBase: Record<string, string> = {
                              Kubernetes: 'quay.io/feiskyer/mcp-kubernetes-server',
                              PostgreSQL: 'quay.io/modelcontextprotocol/server-postgres',
                              ServiceNow: 'quay.io/echelon-ai-labs/servicenow-mcp',
                            };
                            const base = containerImageBase[deployment.mcpServerName] ?? '';
                            const containerImage = base ? `${base}:${deployment.version}` : '';
                            navigate('/ai-hub/mcp/deploy', {
                              state: {
                                containerImage,
                                mcpServerName: deployment.mcpServerName,
                                version: deployment.version,
                                deploymentName: deployment.userName,
                              },
                            });
                          }}
                          id={`mcp-deployment-edit-${deployment.id}`}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          onClick={() => {
                            setOpenKebabDeploymentId(null);
                            setDeploymentToDelete(deployment);
                          }}
                          id={`mcp-deployment-delete-${deployment.id}`}
                        >
                          Delete
                        </DropdownItem>
                        {(deployment.status === 'Running' || deployment.status === 'Succeeded') && (
                          <DropdownItem
                            key="publish"
                            onClick={() => {
                              setOpenKebabDeploymentId(null);
                              setPublishAsAssetDeployment(deployment);
                              setPublishAsAssetStatus('in-progress');
                              setTimeout(() => setPublishAsAssetStatus('success'), 2000);
                            }}
                            id={`mcp-deployment-publish-${deployment.id}`}
                          >
                            Publish as AI asset
                          </DropdownItem>
                        )}
                      </DropdownList>
                    </Dropdown>
                  </Td>
                </Tr>
              );
            })}
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
            { title: '50', value: 50 },
          ]}
        />
      </>
    );
  };

  return (
    <>
      <style>
        {`
          .mcp-deploy-highlight-row {
            animation: mcp-deploy-highlight 2s ease-out forwards;
          }
          .mcp-deploy-highlight-row td {
            background-color: inherit !important;
          }
          @keyframes mcp-deploy-highlight {
            0% {
              background-color: #d4edda;
            }
            100% {
              background-color: transparent;
            }
          }
        `}
      </style>
      {/* Header - Only show when not tab content */}
      {!isTabContent && (
      <PageSection>
        <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--ai-model-server--BackgroundColor, #E7F1FA)', borderRadius: '20px', padding: '4px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MCPIcon size={32} />
          </div>
          MCP server deployments
        </Title>
        <div style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
          Manage and view the health and performance of your deployed MCP servers.
        </div>
      </PageSection>
      )}

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

      {!isTabContent ? (
        <PageSection style={{ paddingTop: '0.5rem' }}>
          <Toolbar id="mcp-deployments-toolbar">
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                <InputGroup>
                  <InputGroupItem isFill>
                    <SearchInput
                      placeholder="Filter by name or server name"
                      value={filterValue}
                      onChange={(_event, value) => setFilterValue(value)}
                      onClear={() => setFilterValue('')}
                      aria-label="Filter MCP deployments"
                    />
                  </InputGroupItem>
                </InputGroup>
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
                    { title: '50', value: 50 },
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
          <Toolbar id="mcp-deployments-toolbar">
            <ToolbarContent>
              <ToolbarGroup variant="filter-group">
                <ToolbarItem>
                  <InputGroup>
                    <InputGroupItem isFill>
                      <SearchInput
                        placeholder="Filter by name or server name"
                        value={filterValue}
                        onChange={(_event, value) => setFilterValue(value)}
                        onClear={() => setFilterValue('')}
                        aria-label="Filter MCP deployments"
                      />
                    </InputGroupItem>
                  </InputGroup>
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
                      { title: '50', value: 50 },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>

          {renderTable()}
        </>
      )}

      {/* Deployment in progress modal */}
      <Modal
        id="mcp-deployments-deploying-modal"
        variant={ModalVariant.small}
        isOpen={deployingDeploymentId !== null}
        onClose={() => {
          const id = deployingDeploymentId;
          setDeployingDeploymentId(null);
          if (id) setNewlyDeployedId(id);
        }}
      >
        <ModalHeader title="Deployment in progress" />
        <ModalBody>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapLg' }}>
            <FlexItem>
              <Spinner size="lg" aria-label="Deploying MCP server" />
            </FlexItem>
            <FlexItem>
              <p style={{ margin: 0, fontWeight: 500 }}>
                Your MCP server is being deployed.
              </p>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>
                This usually takes a few moments. The deployment will appear in the table when ready.
              </p>
            </FlexItem>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              const id = deployingDeploymentId;
              setDeployingDeploymentId(null);
              if (id) setNewlyDeployedId(id);
            }}
            id="mcp-deployments-deploying-modal-close"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Not shown / out-of-scope modal */}
      <Modal
        id="mcp-deployments-not-shown-modal"
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

      <DeleteMCPDeploymentModal
        isOpen={deploymentToDelete !== null}
        onClose={() => setDeploymentToDelete(null)}
        deployment={deploymentToDelete}
        onDelete={(d) => setDeployments((prev) => prev.filter((x) => x.id !== d.id))}
      />

      {/* Publish as AI asset modal */}
      <Modal
        id="mcp-deployments-publish-as-asset-modal"
        variant={ModalVariant.small}
        isOpen={publishAsAssetDeployment !== null}
        onClose={() => {
          setPublishAsAssetDeployment(null);
          setPublishAsAssetStatus(null);
        }}
      >
        <ModalHeader
          title={publishAsAssetStatus === 'success' ? 'Publish complete' : 'Publishing as AI asset'}
        />
        <ModalBody>
          {publishAsAssetStatus === 'in-progress' ? (
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapLg' }}>
              <FlexItem>
                <Spinner size="lg" aria-label="Publishing MCP server as AI asset" />
              </FlexItem>
              <FlexItem>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  Publishing {publishAsAssetDeployment?.userName} as an AI asset.
                </p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>
                  This usually takes a few moments.
                </p>
              </FlexItem>
            </Flex>
          ) : (
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapLg' }}>
              <FlexItem>
                <CheckCircleIcon
                  style={{ fontSize: '2rem', color: 'var(--pf-v5-global--success-color--100)' }}
                  aria-hidden
                />
              </FlexItem>
              <FlexItem>
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {publishAsAssetDeployment?.userName} has been successfully published as an AI asset.
                </p>
                <p style={{ margin: '0.25rem 0 0', color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>
                  The MCP server is now available in the{' '}
                  <Link
                    to="/gen-ai-studio/asset-endpoints?tab=mcp"
                    style={{ fontSize: 'inherit' }}
                    id="mcp-deployments-publish-success-link"
                  >
                    AI asset endpoints MCP tab
                  </Link>
                  .
                </p>
              </FlexItem>
            </Flex>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              setPublishAsAssetDeployment(null);
              setPublishAsAssetStatus(null);
            }}
            id="mcp-deployments-publish-modal-close"
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { MCPDeployments };
