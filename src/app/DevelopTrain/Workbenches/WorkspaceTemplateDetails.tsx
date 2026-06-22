import * as React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { initialRows } from './Workbenches';
import type { WorkbenchRecord } from './Workbenches';
import JupyterLogoRaw from '@app/assets/logos/Jupyter_logo.svg';
import VSCodeLogoRaw from '@app/assets/logos/Visual_Studio_Code_1.35_icon.svg';
import PyTorchLogoRaw from '@app/assets/logos/PyTorch_logo_icon.svg';
import RStudioLogoRaw from '@app/assets/logos/RStudio.svg';

const toDataUri = (svgContent: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardTitle,
  ClipboardCopy,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
  PageSection,
  Pagination,
  Popover,
  PopoverPosition,
  SearchInput,
  Stack,
  StackItem,
  Tab,
  TabTitleText,
  Tabs,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import {
  ActionsColumn,
  IAction,
  ISortBy,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@patternfly/react-table';
import {
  AngleRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExternalLinkAltIcon,
  InProgressIcon,
  InfoCircleIcon,
  MigrationIcon,
  OffIcon,
  OutlinedQuestionCircleIcon,
  PauseIcon,
  SyncAltIcon
} from '@patternfly/react-icons';
type WorkspaceKind = {
  id: string;
  name: string;
  type: string;
  isLegacyV1: boolean;
  baseImage: string;
  usageCount: number;
  isActive: boolean;
  description?: string;
  hidden?: boolean;
  iconUrl?: string;
  logoUrl?: string;
};

// Mock data - in real app, this would come from props or API
const mockWorkspaceKinds: WorkspaceKind[] = [
  {
    id: 'kind-1',
    name: 'Jupyter Notebook 2.0',
    type: 'Jupyter',
    isLegacyV1: false,
    baseImage: 'quay.io/org/notebook-nb20:2.0.0',
    usageCount: 12,
    isActive: true,
    description: 'Jupyter Notebook environment with NB 2.0 compliance',
    iconUrl: toDataUri(JupyterLogoRaw),
    logoUrl: toDataUri(JupyterLogoRaw)
  },
  {
    id: 'kind-2',
    name: 'VS Code Legacy',
    type: 'VS Code',
    isLegacyV1: true,
    baseImage: 'quay.io/org/vscode:1.3.0',
    usageCount: 5,
    isActive: true,
    description: 'Legacy VS Code development environment',
    iconUrl: toDataUri(VSCodeLogoRaw),
    logoUrl: toDataUri(VSCodeLogoRaw)
  },
  {
    id: 'kind-3',
    name: 'PyTorch Training 2.0',
    type: 'PyTorch',
    isLegacyV1: false,
    baseImage: 'quay.io/org/pytorch-nb20:2.1.0',
    usageCount: 8,
    isActive: true,
    description: 'PyTorch training environment with GPU support',
    iconUrl: toDataUri(PyTorchLogoRaw),
    logoUrl: toDataUri(PyTorchLogoRaw)
  },
  {
    id: 'kind-4',
    name: 'TensorFlow Legacy',
    type: 'TensorFlow',
    isLegacyV1: true,
    baseImage: 'quay.io/org/tensorflow:1.2.8',
    usageCount: 3,
    isActive: true,
    description: 'Legacy TensorFlow environment (deprecated)',
    iconUrl: 'https://www.tensorflow.org/images/tf_logo_social.png',
    logoUrl: 'https://www.tensorflow.org/images/tf_logo_social.png'
  },
  {
    id: 'kind-5',
    name: 'R Studio 2.0',
    type: 'R Studio',
    isLegacyV1: false,
    baseImage: 'quay.io/org/rstudio-nb20:2.0.2',
    usageCount: 4,
    isActive: true,
    description: 'R Studio environment for statistical analysis',
    iconUrl: toDataUri(RStudioLogoRaw),
    logoUrl: toDataUri(RStudioLogoRaw)
  }
];

export const WorkspaceTemplateDetails: React.FunctionComponent = () => {
  const { workspaceKindId } = useParams<{ workspaceKindId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use state to manage workbenches so actions can update them
  const [workbenches, setWorkbenches] = React.useState<WorkbenchRecord[]>(() => initialRows);
  
  const [searchValue, setSearchValue] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState<ISortBy>({ 
    index: 6, // Last activity column (0-indexed)
    direction: 'desc' 
  });
  const [isSummaryExpanded, setIsSummaryExpanded] = React.useState(true);
  const [filterIdleGPU, setFilterIdleGPU] = React.useState(false);
  const [filterNamespace, setFilterNamespace] = React.useState<string | null>(null);
  const [filterImage, setFilterImage] = React.useState<string | null>(null);
  const [filterPodConfig, setFilterPodConfig] = React.useState<string | null>(null);
  const [isIDEModalOpen, setIsIDEModalOpen] = React.useState(false);
  const [, setSelectedWorkbenchForIDE] = React.useState<WorkbenchRecord | null>(null);
  const [questionPopoverOpenId, setQuestionPopoverOpenId] = React.useState<string | null>(null);
  const [isWorkbenchDetailsDrawerExpanded, setIsWorkbenchDetailsDrawerExpanded] = React.useState(false);
  const [selectedWorkbenchDetails, setSelectedWorkbenchDetails] = React.useState<WorkbenchRecord | null>(null);
  const [workbenchDetailsTab, setWorkbenchDetailsTab] = React.useState<string | number>(0);
  const labelGroupRef = React.useRef<HTMLDivElement>(null);
  const namespaceLabelGroupRef = React.useRef<HTMLDivElement>(null);
  const imageLabelGroupRef = React.useRef<HTMLDivElement>(null);
  const podConfigLabelGroupRef = React.useRef<HTMLDivElement>(null);

  // Initialize filters from URL params on mount
  React.useEffect(() => {
    const imageParam = searchParams.get('image');
    const podConfigParam = searchParams.get('podConfig');
    const namespaceParam = searchParams.get('namespace');
    
    if (imageParam) {
      setFilterImage(decodeURIComponent(imageParam));
    }
    if (podConfigParam) {
      setFilterPodConfig(decodeURIComponent(podConfigParam));
    }
    if (namespaceParam) {
      setFilterNamespace(decodeURIComponent(namespaceParam));
    }
  }, [searchParams]);

  // Handle LabelGroup close button click
  React.useEffect(() => {
    if (!(filterIdleGPU && labelGroupRef.current)) {
      return undefined;
    }

    const closeButton = labelGroupRef.current.querySelector(
      '.pf-v6-c-label-group__close button, .pf-c-label-group__close button'
    );
    if (!closeButton) {
      return undefined;
    }

    const handleClose = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setFilterIdleGPU(false);
      setSearchValue('');
      setPage(1);
    };
    closeButton.addEventListener('click', handleClose);
    return () => {
      closeButton.removeEventListener('click', handleClose);
    };
  }, [filterIdleGPU]);

  React.useEffect(() => {
    if (!(filterNamespace && namespaceLabelGroupRef.current)) {
      return undefined;
    }

    const closeButton = namespaceLabelGroupRef.current.querySelector(
      '.pf-v6-c-label-group__close button, .pf-c-label-group__close button'
    );
    if (!closeButton) {
      return undefined;
    }

    const handleClose = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setFilterNamespace(null);
      setSearchValue('');
      setPage(1);
      // Update URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('namespace');
      setSearchParams(newParams);
    };
    closeButton.addEventListener('click', handleClose);
    return () => {
      closeButton.removeEventListener('click', handleClose);
    };
  }, [filterNamespace, searchParams, setSearchParams]);

  React.useEffect(() => {
    if (!(filterImage && imageLabelGroupRef.current)) {
      return undefined;
    }

    const closeButton = imageLabelGroupRef.current.querySelector(
      '.pf-v6-c-label-group__close button, .pf-c-label-group__close button'
    );
    if (!closeButton) {
      return undefined;
    }

    const handleClose = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setFilterImage(null);
      setSearchValue('');
      setPage(1);
      // Update URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('image');
      setSearchParams(newParams);
    };
    closeButton.addEventListener('click', handleClose);
    return () => {
      closeButton.removeEventListener('click', handleClose);
    };
  }, [filterImage, searchParams, setSearchParams]);

  React.useEffect(() => {
    if (!(filterPodConfig && podConfigLabelGroupRef.current)) {
      return undefined;
    }

    const closeButton = podConfigLabelGroupRef.current.querySelector(
      '.pf-v6-c-label-group__close button, .pf-c-label-group__close button'
    );
    if (!closeButton) {
      return undefined;
    }

    const handleClose = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      setFilterPodConfig(null);
      setSearchValue('');
      setPage(1);
      // Update URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('podConfig');
      setSearchParams(newParams);
    };
    closeButton.addEventListener('click', handleClose);
    return () => {
      closeButton.removeEventListener('click', handleClose);
    };
  }, [filterPodConfig, searchParams, setSearchParams]);

  // Find the workspace template
  const workspaceTemplate = React.useMemo(() => {
    return mockWorkspaceKinds.find(k => k.id === workspaceKindId);
  }, [workspaceKindId]);

  // Filter workbenches by workspace template (before idle GPU filter)
  const baseFilteredWorkbenches = React.useMemo(() => {
    if (!workspaceKindId) return [];
    
    let filtered = workbenches.filter(wb => wb.workspaceKindId === workspaceKindId);
    
    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(wb =>
        wb.name.toLowerCase().includes(searchLower) ||
        wb.project.toLowerCase().includes(searchLower) ||
        wb.createdBy.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [workspaceKindId, searchValue, workbenches]);

  // Helper to map pod config names (e.g., "Small CPU" -> "Small", "Standard")
  const getPodConfigMappedNames = (podConfigName: string): string[] => {
    const mapping: Record<string, string[]> = {
      'Tiny CPU': ['Tiny'],
      'Small CPU': ['Small', 'Standard'],
      'Medium CPU': ['Medium'],
      'Large CPU': ['Large']
    };
    return mapping[podConfigName] || [podConfigName];
  };

  // Apply filters to base filtered workbenches
  const filteredWorkbenches = React.useMemo(() => {
    let filtered = baseFilteredWorkbenches;
    
    // Apply idle GPU filter
    if (filterIdleGPU) {
      filtered = filtered.filter(wb => wb.status !== 'Running');
    }
    
    // Apply namespace filter
    if (filterNamespace) {
      filtered = filtered.filter(wb => wb.project === filterNamespace);
    }
    
    // Apply image filter
    if (filterImage) {
      filtered = filtered.filter(wb => wb.image === filterImage);
    }
    
    // Apply pod config filter
    if (filterPodConfig) {
      const mappedNames = getPodConfigMappedNames(filterPodConfig);
      filtered = filtered.filter(wb => {
        // Check podConfig.name or hardwareProfile
        const podConfigName = wb.podConfig?.name || wb.hardwareProfile || '';
        return mappedNames.some(name => 
          podConfigName.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(podConfigName.toLowerCase())
        );
      });
    }
    
    return filtered;
  }, [baseFilteredWorkbenches, filterIdleGPU, filterNamespace, filterImage, filterPodConfig]);

  // Sort workbenches
  const sortedWorkbenches = React.useMemo(() => {
    const sorted = [...filteredWorkbenches];
    
    if (sortBy.index === 6) { // Last activity column
      sorted.sort((a, b) => {
        const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        return sortBy.direction === 'asc' ? aTime - bTime : bTime - aTime;
      });
    }
    
    return sorted;
  }, [filteredWorkbenches, sortBy]);

  // Pagination
  const paginatedWorkbenches = React.useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return sortedWorkbenches.slice(start, end);
  }, [sortedWorkbenches, page, perPage]);

  // Helper to calculate GPU count - returns 1 or 2 for all workbenches
  const getGPUCount = React.useCallback((record: WorkbenchRecord): number => {
    // Use record ID to deterministically assign 1 or 2
    // This ensures consistent values for the same workbench
    const hash = record.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 2) + 1; // Returns 1 or 2
  }, []);

  // Calculate summary statistics (based on baseFilteredWorkbenches, not filteredWorkbenches)
  const summaryStats = React.useMemo(() => {
    const totalGPUs = baseFilteredWorkbenches.reduce((sum, wb) => {
      // Use getGPUCount to get consistent GPU values (1 or 2)
      return sum + getGPUCount(wb);
    }, 0);
    
    const requestedGPUs = baseFilteredWorkbenches.length * 4; // Mock: assume 4 GPUs requested per workspace
    
    // Count workbenches where Idle GPU = "Yes" (status !== 'Running')
    // This should match the count in the table when filterIdleGPU is false
    const idleWorkspaces = baseFilteredWorkbenches.filter(wb => wb.status !== 'Running').length;
    
    // Group by namespace (project) and calculate GPU usage based on filteredWorkbenches (what's shown in table)
    const namespaceGPUs = filteredWorkbenches.reduce((acc, wb) => {
      const gpus = getGPUCount(wb);
      acc[wb.project] = (acc[wb.project] || 0) + gpus;
      return acc;
    }, {} as Record<string, number>);
    
    const topNamespaces = Object.entries(namespaceGPUs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, gpus]) => ({ name, gpus }));
    
    return {
      totalGPUsInUse: totalGPUs,
      requestedGPUs,
      idleGPUWorkspaces: idleWorkspaces,
      topNamespaces
    };
  }, [baseFilteredWorkbenches, filteredWorkbenches, getGPUCount]);

  // Render status cell
  const renderStatusCell = (record: WorkbenchRecord) => {
    const statusConfig: Record<string, { icon: React.ReactNode; color?: string; modifier?: string; label: string }> = {
      Running: {
        icon: <CheckCircleIcon />,
        modifier: 'pf-m-success',
        label: 'Running'
      },
      Stopped: {
        icon: <OffIcon />,
        color: 'grey',
        label: 'Stopped'
      },
      Starting: {
        icon: <InProgressIcon />,
        color: 'blue',
        label: 'Starting'
      },
      Stopping: {
        icon: <SyncAltIcon className="pf-v6-u-animation-rotate" />,
        color: 'grey',
        label: 'Stopping'
      },
      Paused: {
        icon: <PauseIcon />,
        color: 'orange',
        label: 'Paused'
      },
      Migrating: {
        icon: <MigrationIcon />,
        color: 'blue',
        label: 'Migrating'
      },
      Failed: {
        icon: <ExclamationCircleIcon />,
        modifier: 'pf-m-danger',
        label: 'Failed'
      }
    };

    const config = statusConfig[record.status] || {
      icon: <ExclamationCircleIcon />,
      color: 'red',
      label: record.status
    };

    const labelProps: any = {
      icon: config.icon
    };

    // Use modifier if available (for Running and Failed), otherwise use color
    if (config.modifier) {
      labelProps.className = config.modifier;
    } else if (config.color) {
      labelProps.color = config.color;
    }

    return (
      <Label {...labelProps}>
        {config.label}
      </Label>
    );
  };

  // Render version/compliance cell (matching Workbenches table style)
  const renderVersionCell = (record: WorkbenchRecord) => {
    return (
      <Label 
        id={record.isLegacyV1 ? 'label-legacy-v1' : 'label-nb20'} 
        color={record.isLegacyV1 ? 'grey' : 'blue'}
        variant="outline"
      >
        {record.isLegacyV1 ? 'Legacy V1' : 'NB 2.0 Compliant'}
      </Label>
    );
  };

  // Helper to render primary status label (for drawer)
  const renderPrimaryStatusLabel = (record: WorkbenchRecord) => {
    return renderStatusCell(record);
  };

  // Helper to get template/image display with logo
  const getTemplateImageDisplay = (record: WorkbenchRecord): React.ReactNode => {
    if (record.isLegacyV1) {
      // For V1: Show image name (extract from full path)
      const parts = (record.templateImage || record.image || '').split('/');
      const imageName = parts[parts.length - 1] || record.templateImage || record.image || 'Unknown';
      return (
        <code style={{ fontSize: 'var(--pf-t--global--font--size--sm)' }}>
          {imageName}
        </code>
      );
    }
    // For V2: Show template name with logo
    if (record.workspaceKindId) {
      const kind = mockWorkspaceKinds.find(k => k.id === record.workspaceKindId);
      if (kind) {
        const logoSrc = kind.logoUrl || kind.iconUrl;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--sm)' }}>
            {logoSrc && (
              <img
                src={logoSrc}
                alt={`${kind.name} logo`}
                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <span>{kind.name}</span>
          </div>
        );
      }
    }
    // Fallback: show template image name if available
    return record.templateImage || 'Unknown';
  };

  // Helper to render name cell
  const renderNameCell = (record: WorkbenchRecord) => {
    const isRunning = record.status === 'Running';
    const textColor = isRunning ? '#0066cc' : '#6a6e73'; // Blue for Running, Grey for others
    
    const handleNameClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent row click
      if (isRunning) {
        setSelectedWorkbenchForIDE(record);
        setIsIDEModalOpen(true);
      }
    };
    
    return (
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }}>
        <FlexItem>
          <span 
            onClick={isRunning ? handleNameClick : undefined}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 'var(--pf-t--global--spacer--xs)',
              cursor: isRunning ? 'pointer' : 'default',
              color: textColor
            }}
          >
            <span style={{ color: textColor }}>{record.name}</span>
            <ExternalLinkAltIcon style={{ 
              fontSize: '0.875em', 
              verticalAlign: 'middle', 
              marginLeft: 'var(--pf-t--global--spacer--xs)',
              color: textColor,
              fill: textColor
            }} />
          </span>
        </FlexItem>
        <FlexItem>
          <Popover
            position={PopoverPosition.right}
            isVisible={questionPopoverOpenId === record.id}
            shouldClose={() => setQuestionPopoverOpenId(null)}
            bodyContent={
              <div>
                <div style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                  Resource names and types are used to find your resources in OpenShift.
                </div>
                <div style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <strong>Resource name</strong>
                    <ClipboardCopy
                      isReadOnly
                      hoverTip="Copy to clipboard"
                      clickTip="Copied to clipboard!"
                      variant="inline-compact"
                    >
                      {record.name}
                    </ClipboardCopy>
                  </Flex>
                </div>
                <div>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                    <strong>Resource type</strong>
                    <span>Notebook</span>
                  </Flex>
                </div>
              </div>
            }
          >
            <Button 
              variant="plain" 
              icon={<OutlinedQuestionCircleIcon style={{ color: '#4d5258', fill: '#4d5258' }} />} 
              aria-label="More information"
              onClick={(e) => {
                e.stopPropagation();
                setQuestionPopoverOpenId(questionPopoverOpenId === record.id ? null : record.id);
              }}
            />
          </Popover>
        </FlexItem>
      </Flex>
    );
  };

  // Helper to render Idle GPU cell
  const renderIdleGPU = (record: WorkbenchRecord): string => {
    // If status is "Running", Idle GPU = "No"
    // All other statuses, Idle GPU = "Yes"
    if (record.status === 'Running') {
      return 'No';
    }
    return 'Yes';
  };

  // Helper to open workbench details drawer
  const openWorkbenchDetailsDrawer = (record: WorkbenchRecord) => {
    setSelectedWorkbenchDetails(record);
    setWorkbenchDetailsTab(0);
    setIsWorkbenchDetailsDrawerExpanded(true);
  };

  const closeWorkbenchDetailsDrawer = () => {
    setIsWorkbenchDetailsDrawerExpanded(false);
    setSelectedWorkbenchDetails(null);
  };

  const onWorkbenchDrawerExpand = () => {
    // Focus the drawer title for accessibility
    setTimeout(() => {
      const titleElement = document.getElementById('workbench-details-title');
      if (titleElement) {
        (titleElement as HTMLElement).focus({ preventScroll: true });
      }
    }, 100);
  };

  // Build actions for kebab menu (matching Workbenches table)
  const buildActions = (record: WorkbenchRecord): IAction[] => {
    const start: IAction = {
      title: 'Start',
      onClick: () => {
        // Update workbench status to Starting, then Running after 2 seconds
        setWorkbenches(prevWorkbenches => prevWorkbenches.map(wb => 
          wb.id === record.id ? { ...wb, status: 'Starting' } : wb
        ));
        setTimeout(() => {
          setWorkbenches(prevWorkbenches => prevWorkbenches.map(wb => 
            wb.id === record.id ? { ...wb, status: 'Running' } : wb
          ));
        }, 2000);
      }
    };

    const stop: IAction = {
      title: 'Stop',
      onClick: () => {
        // Update workbench status to Stopping, then Stopped after 2 seconds
        setWorkbenches(prevWorkbenches => prevWorkbenches.map(wb => 
          wb.id === record.id ? { ...wb, status: 'Stopping' } : wb
        ));
        setTimeout(() => {
          setWorkbenches(prevWorkbenches => prevWorkbenches.map(wb => 
            wb.id === record.id ? { ...wb, status: 'Stopped' } : wb
          ));
        }, 2000);
      }
    };

    const restart: IAction = {
      title: 'Restart',
      onClick: () => {
        // Restart logic: stop then start
        setWorkbenches(prevWorkbenches => prevWorkbenches.map(wb => 
          wb.id === record.id ? { ...wb, status: 'Stopping' } : wb
        ));
        setTimeout(() => {
          setWorkbenches(prevWorkbenches => prevWorkbenches.map(wb => 
            wb.id === record.id ? { ...wb, status: 'Starting' } : wb
          ));
          setTimeout(() => {
            setWorkbenches(prevWorkbenches => prevWorkbenches.map(wb => 
              wb.id === record.id ? { ...wb, status: 'Running' } : wb
            ));
          }, 2000);
        }, 2000);
      }
    };

    const viewDetails: IAction = {
      title: 'View Details',
      onClick: () => {
        openWorkbenchDetailsDrawer(record);
      }
    };

    const edit: IAction = {
      title: 'Edit',
      onClick: () => {
        // eslint-disable-next-line no-console
        console.log('Edit workbench:', record.id);
        // TODO: Open edit dialog/modal
      }
    };

    const archiveAction: IAction = {
      title: 'Archive',
      onClick: () => {
        // Archive the workbench (remove from list)
        setWorkbenches(prevWorkbenches => prevWorkbenches.filter(wb => wb.id !== record.id));
        if (selectedWorkbenchDetails?.id === record.id) {
          closeWorkbenchDetailsDrawer();
        }
      }
    };

    const deleteAction: IAction = {
      title: 'Delete',
      onClick: () => {
        // Delete the workbench (remove from records without archiving)
        setWorkbenches(prevWorkbenches => prevWorkbenches.filter(wb => wb.id !== record.id));
        if (selectedWorkbenchDetails?.id === record.id) {
          closeWorkbenchDetailsDrawer();
        }
      }
    };

    // Build actions to match the standard kebab menu: View Details, Edit, Archive, separator, Stop, Restart
    const actions: IAction[] = [];
    
    // Always show: View Details, Edit, Archive
    actions.push(viewDetails, edit, archiveAction);
    
    // Separator
    actions.push({ isSeparator: true });
    
    // Add Stop (when running) or Start (when stopped)
    if (record.status === 'Stopped') {
      actions.push(start);
    } else if (record.status === 'Running') {
      actions.push(stop);
      actions.push(restart);
    }

    // Add separator before Delete
    actions.push({ isSeparator: true });
    
    // Add Delete action at the bottom
    actions.push(deleteAction);

    return actions;
  };

  if (!workspaceTemplate) {
    return (
      <PageSection>
        <Title headingLevel="h1">Workbench Template Not Found</Title>
        <Button variant="link" icon={<ArrowLeftIcon />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </PageSection>
    );
  }

  return (
    <>
      <PageSection variant="default">
        <Breadcrumb>
          <BreadcrumbItem>
            <Button variant="link" onClick={() => navigate('/develop-train/workbenches?tab=templates')}>
              Workbench Templates
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            Workbenches in {workspaceTemplate.name}
          </BreadcrumbItem>
        </Breadcrumb>
        <Title headingLevel="h1" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
          {workspaceTemplate.name}
        </Title>
        <p style={{ color: '#6a6e73', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          View a summary of your workbenches and their GPU usage.
        </p>
      </PageSection>

      {/* Workbench Details Drawer */}
      <Drawer id="workbench-details-drawer" isExpanded={isWorkbenchDetailsDrawerExpanded} onExpand={onWorkbenchDrawerExpand} position="end">
        <DrawerContent
          panelContent={
            <DrawerPanelContent 
              id="workbench-details-drawer-panel" 
              isResizable 
              onResize={() => {}} 
              defaultSize="500px" 
              minSize="150px"
            >
              <DrawerHead>
                <Title headingLevel="h3" id="workbench-details-title" tabIndex={isWorkbenchDetailsDrawerExpanded ? 0 : -1}>
                  {selectedWorkbenchDetails ? selectedWorkbenchDetails.name : 'Workbench details'}
                </Title>
                <DrawerActions>
                  <DrawerCloseButton onClick={closeWorkbenchDetailsDrawer} />
                </DrawerActions>
              </DrawerHead>
              <DrawerPanelBody>
                <Stack hasGutter>
                  {selectedWorkbenchDetails && (
                    <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                      <FlexItem>
                        <Button
                          variant="primary"
                          onClick={() => {
                            // eslint-disable-next-line no-console
                            console.log('Edit clicked for', selectedWorkbenchDetails.id);
                            // TODO: Open edit dialog/modal
                          }}
                        >
                          Edit
                        </Button>
                      </FlexItem>
                      <FlexItem>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            // Archive the workbench
                            setWorkbenches(prevWorkbenches => prevWorkbenches.filter(wb => wb.id !== selectedWorkbenchDetails.id));
                            closeWorkbenchDetailsDrawer();
                          }}
                        >
                          Archive
                        </Button>
                      </FlexItem>
                    </Flex>
                  )}

                  {!selectedWorkbenchDetails ? (
                    <Content component={ContentVariants.p} id="workbench-details-empty">
                      Select <strong>View details</strong> to see workbench information.
                    </Content>
                  ) : (
                    <Tabs
                      id="workbench-details-tabs"
                      activeKey={workbenchDetailsTab}
                      onSelect={(_event, tabIndex) => setWorkbenchDetailsTab(tabIndex)}
                      aria-label="Workbench details tabs"
                    >
                      <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
                        <DescriptionList isHorizontal isCompact id="workbench-details-overview">
                          <DescriptionListGroup>
                            <DescriptionListTerm>Project</DescriptionListTerm>
                            <DescriptionListDescription>{selectedWorkbenchDetails.project}</DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Status</DescriptionListTerm>
                            <DescriptionListDescription>{renderPrimaryStatusLabel(selectedWorkbenchDetails)}</DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Version</DescriptionListTerm>
                            <DescriptionListDescription>{renderVersionCell(selectedWorkbenchDetails)}</DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Created by</DescriptionListTerm>
                            <DescriptionListDescription>{selectedWorkbenchDetails.createdBy || '-'}</DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Image</DescriptionListTerm>
                            <DescriptionListDescription>{selectedWorkbenchDetails.image || '-'}</DescriptionListDescription>
                          </DescriptionListGroup>
                          {selectedWorkbenchDetails.podConfig && (
                            <DescriptionListGroup>
                              <DescriptionListTerm>Pod Config</DescriptionListTerm>
                              <DescriptionListDescription>
                                {selectedWorkbenchDetails.podConfig.name || '-'}
                                {selectedWorkbenchDetails.podConfig.cpu && selectedWorkbenchDetails.podConfig.memory && 
                                  ` (${selectedWorkbenchDetails.podConfig.cpu} CPU, ${selectedWorkbenchDetails.podConfig.memory} Memory)`
                                }
                              </DescriptionListDescription>
                            </DescriptionListGroup>
                          )}
                        </DescriptionList>
                        {!selectedWorkbenchDetails.isLegacyV1 && selectedWorkbenchDetails.podConfig && (
                          <Stack hasGutter style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                            <Title headingLevel="h4">Pod Config Details</Title>
                            <DescriptionList isHorizontal isCompact>
                              <DescriptionListGroup>
                                <DescriptionListTerm>Name</DescriptionListTerm>
                                <DescriptionListDescription>{selectedWorkbenchDetails.podConfig.name || '-'}</DescriptionListDescription>
                              </DescriptionListGroup>
                              {selectedWorkbenchDetails.podConfig.cpu && (
                                <DescriptionListGroup>
                                  <DescriptionListTerm>CPU</DescriptionListTerm>
                                  <DescriptionListDescription>{selectedWorkbenchDetails.podConfig.cpu}</DescriptionListDescription>
                                </DescriptionListGroup>
                              )}
                              {selectedWorkbenchDetails.podConfig.memory && (
                                <DescriptionListGroup>
                                  <DescriptionListTerm>Memory</DescriptionListTerm>
                                  <DescriptionListDescription>{selectedWorkbenchDetails.podConfig.memory}</DescriptionListDescription>
                                </DescriptionListGroup>
                              )}
                            </DescriptionList>
                          </Stack>
                        )}
                      </Tab>
                      <Tab eventKey={1} title={<TabTitleText>Activity</TabTitleText>}>
                        <DescriptionList isHorizontal isCompact id="workbench-details-activity">
                          <DescriptionListGroup>
                            <DescriptionListTerm>Last activity</DescriptionListTerm>
                            <DescriptionListDescription>
                              {selectedWorkbenchDetails.lastActivity
                                ? new Date(selectedWorkbenchDetails.lastActivity).toLocaleString()
                                : '-'}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Last update</DescriptionListTerm>
                            <DescriptionListDescription>
                              {selectedWorkbenchDetails.lastUpdate
                                ? new Date(selectedWorkbenchDetails.lastUpdate).toLocaleString()
                                : '-'}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Pause time</DescriptionListTerm>
                            <DescriptionListDescription>{selectedWorkbenchDetails.pauseTime || '-'}</DescriptionListDescription>
                          </DescriptionListGroup>
                          <DescriptionListGroup>
                            <DescriptionListTerm>Pending restart</DescriptionListTerm>
                            <DescriptionListDescription>
                              {typeof selectedWorkbenchDetails.pendingRestart === 'boolean'
                                ? (selectedWorkbenchDetails.pendingRestart ? 'Yes' : 'No')
                                : '-'}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        </DescriptionList>
                      </Tab>
                    </Tabs>
                  )}
                </Stack>
              </DrawerPanelBody>
            </DrawerPanelContent>
          }
        >
          <DrawerContentBody id="workbench-details-drawer-body">
            <PageSection>
        {/* Summary Cards */}
        <Card 
          style={{ marginBottom: 'var(--pf-t--global--spacer--lg)', backgroundColor: '#f5f5f5' }}
          isExpanded={isSummaryExpanded}
        >
          <CardTitle>
            <div 
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--pf-t--global--spacer--sm)', 
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <AngleRightIcon 
                style={{ 
                  transform: isSummaryExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out'
                }} 
              />
              <Title headingLevel="h1" size="2xl">Workbenches summary</Title>
            </div>
          </CardTitle>
          <CardExpandableContent>
            <CardBody>
              <div style={{ display: 'flex', gap: 'var(--pf-t--global--spacer--lg)' }}>
                <div style={{ flex: 1 }}>
                  <Stack>
                    <StackItem>
                      <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                        Total GPUs in use
                      </Title>
                    </StackItem>
                    <StackItem>
                      <Title headingLevel="h2" size="2xl" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                        {summaryStats.totalGPUsInUse} GPUs
                      </Title>
                    </StackItem>
                    <StackItem>
                      <p style={{ color: '#6a6e73', margin: 0 }}>
                        Requested of {summaryStats.requestedGPUs} GPUs
                      </p>
                    </StackItem>
                  </Stack>
                </div>
                <Divider orientation={{ default: 'vertical' }} />
                <div style={{ flex: 1 }}>
                  <Stack>
                    <StackItem>
                      <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                        Idle GPU workbenches
                      </Title>
                    </StackItem>
                    <StackItem>
                            <Button
                              variant="link"
                              isInline
                              onClick={() => {
                                // Toggle filter to show only idle GPU workbenches (Idle GPU = "Yes")
                                setFilterIdleGPU(!filterIdleGPU);
                                setPage(1); // Reset to first page when filter changes
                              }}
                              style={{
                                padding: 0,
                                color: filterIdleGPU ? '#004080' : '#0066cc',
                                fontSize: 'var(--pf-t--global--font--size--2xl)',
                                fontWeight: 'bold',
                                textDecoration: 'underline',
                                marginBottom: 'var(--pf-t--global--spacer--sm)'
                              }}
                            >
                              {summaryStats.idleGPUWorkspaces}
                            </Button>
                    </StackItem>
                    <StackItem>
                      <p style={{ color: '#6a6e73', margin: 0 }}>
                        Idle GPU Workbenches
                      </p>
                    </StackItem>
                  </Stack>
                </div>
                <Divider orientation={{ default: 'vertical' }} />
                <div style={{ flex: 1 }}>
                  <Stack>
                    <StackItem>
                      <Title headingLevel="h3" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                        Top GPU Consumer Projects
                      </Title>
                    </StackItem>
                    <StackItem>
                      {summaryStats.topNamespaces.length > 0 ? (
                        <Stack>
                          {summaryStats.topNamespaces.map((ns, idx) => (
                            <StackItem key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => {
                                    // Filter table by namespace
                                    setFilterNamespace(ns.name);
                                    setPage(1);
                                  }}
                                  style={{ padding: 0, color: '#0066cc', textDecoration: 'underline' }}
                                >
                                  {ns.name}
                                </Button>
                                <span style={{ color: '#6a6e73' }}>
                                  {ns.gpus} GPUs
                                </span>
                              </div>
                            </StackItem>
                          ))}
                        </Stack>
                      ) : (
                        <p style={{ color: '#6a6e73', margin: 0 }}>No namespaces found</p>
                      )}
                    </StackItem>
                  </Stack>
                </div>
              </div>
            </CardBody>
          </CardExpandableContent>
        </Card>

        {/* Workbenches Table */}
        <Card>
          <CardTitle>Workbenches</CardTitle>
          <CardBody>
            <Toolbar style={{ paddingBottom: 0 }}>
              <ToolbarContent>
                <ToolbarItem>
                  <SearchInput
                    placeholder="Search by name, project, or creator"
                    value={searchValue}
                    onChange={(_, value) => setSearchValue(value)}
                    onClear={() => {
                      setSearchValue('');
                      if (filterIdleGPU || filterNamespace || filterImage || filterPodConfig) {
                        setFilterIdleGPU(false);
                        setFilterNamespace(null);
                        setFilterImage(null);
                        setFilterPodConfig(null);
                        setPage(1);
                        // Clear URL params
                        setSearchParams({});
                      }
                    }}
                  />
                </ToolbarItem>
                <ToolbarGroup align={{ default: 'alignEnd' }}>
                  <ToolbarItem>
                    <Pagination
                      itemCount={filteredWorkbenches.length}
                      page={page}
                      perPage={perPage}
                      onSetPage={(_, newPage) => setPage(newPage)}
                      onPerPageSelect={(_, newPerPage) => {
                        setPerPage(newPerPage);
                        setPage(1);
                      }}
                      widgetId="workbenches-pagination-top"
                    />
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>

            {/* Active Filters */}
            {(filterIdleGPU || filterNamespace || filterImage || filterPodConfig) && (
              <div style={{ marginTop: 'var(--pf-t--global--spacer--md)', marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--pf-t--global--spacer--sm)', marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  {filterIdleGPU && (
                    <div ref={labelGroupRef} style={{ display: 'inline-block' }}>
                      <LabelGroup
                        categoryName="Idle GPU"
                        isClosable
                        numLabels={1}
                      >
                        <Label
                          variant="outline"
                          onClose={() => {
                            setFilterIdleGPU(false);
                            setPage(1);
                          }}
                        >
                          Yes
                        </Label>
                      </LabelGroup>
                    </div>
                  )}
                  {filterNamespace && (
                    <div ref={namespaceLabelGroupRef} style={{ display: 'inline-block' }}>
                      <LabelGroup
                        categoryName="Namespace"
                        isClosable
                        numLabels={1}
                      >
                        <Label
                          variant="outline"
                          onClose={() => {
                            setFilterNamespace(null);
                            setPage(1);
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('namespace');
                            setSearchParams(newParams);
                          }}
                        >
                          {filterNamespace}
                        </Label>
                      </LabelGroup>
                    </div>
                  )}
                  {filterImage && (
                    <div ref={imageLabelGroupRef} style={{ display: 'inline-block' }}>
                      <LabelGroup
                        categoryName="Image"
                        isClosable
                        numLabels={1}
                      >
                        <Label
                          variant="outline"
                          onClose={() => {
                            setFilterImage(null);
                            setPage(1);
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('image');
                            setSearchParams(newParams);
                          }}
                        >
                          {filterImage}
                        </Label>
                      </LabelGroup>
                    </div>
                  )}
                  {filterPodConfig && (
                    <div ref={podConfigLabelGroupRef} style={{ display: 'inline-block' }}>
                      <LabelGroup
                        categoryName="Pod Config"
                        isClosable
                        numLabels={1}
                      >
                        <Label
                          variant="outline"
                          onClose={() => {
                            setFilterPodConfig(null);
                            setPage(1);
                            const newParams = new URLSearchParams(searchParams);
                            newParams.delete('podConfig');
                            setSearchParams(newParams);
                          }}
                        >
                          {filterPodConfig}
                        </Label>
                      </LabelGroup>
                    </div>
                  )}
                </div>
                <div style={{ display: 'block' }}>
                  <Button
                    variant="link"
                    onClick={() => {
                      setFilterIdleGPU(false);
                      setFilterNamespace(null);
                      setFilterImage(null);
                      setFilterPodConfig(null);
                      setSearchValue('');
                      setPage(1);
                      setSearchParams({});
                    }}
                    style={{ padding: 0 }}
                  >
                    Clear all filters
                  </Button>
                </div>
              </div>
            )}

            <Table aria-label="Workbenches table" variant="compact">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Image</Th>
                  <Th>Namespace</Th>
                  <Th>Status</Th>
                  <Th>GPU</Th>
                  <Th>Idle GPU</Th>
                  <Th
                    sort={{
                      sortBy,
                      onSort: (_event, _index, direction) => {
                        setSortBy({ index: 6, direction: direction || 'desc' });
                      },
                      columnIndex: 6,
                    }}
                  >
                    Last activity
                  </Th>
                  <Th screenReaderText="Actions"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedWorkbenches.length === 0 ? (
                  <Tr>
                    <Td colSpan={8}>No workbenches found</Td>
                  </Tr>
                ) : (
                  paginatedWorkbenches.map((record) => (
                    <Tr key={record.id}>
                      <Td dataLabel="Name">{renderNameCell(record)}</Td>
                      <Td dataLabel="Image">
                        {getTemplateImageDisplay(record)}
                      </Td>
                      <Td dataLabel="Namespace">{record.project}</Td>
                      <Td dataLabel="Status">{renderStatusCell(record)}</Td>
                      <Td dataLabel="GPU">{getGPUCount(record)}</Td>
                      <Td dataLabel="Idle GPU">{renderIdleGPU(record)}</Td>
                      <Td dataLabel="Last activity">
                        {record.lastActivity
                          ? new Date(record.lastActivity).toLocaleString()
                          : record.createdAt
                          ? new Date(record.createdAt).toLocaleString()
                          : new Date().toLocaleString()}
                      </Td>
                      <Td isActionCell dataLabel="Actions">
                        <ActionsColumn items={buildActions(record)} />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--pf-t--global--spacer--lg)' }}>
          <Pagination
            itemCount={filteredWorkbenches.length}
            page={page}
            perPage={perPage}
            onSetPage={(_, newPage) => setPage(newPage)}
            onPerPageSelect={(_, newPerPage) => {
              setPerPage(newPerPage);
              setPage(1);
            }}
            widgetId="workbenches-pagination-bottom"
          />
        </div>
          </PageSection>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>

      {/* IDE Environment Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isIDEModalOpen}
        onClose={() => {
          setIsIDEModalOpen(false);
          setSelectedWorkbenchForIDE(null);
        }}
      >
        <ModalHeader 
          title={
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <InfoCircleIcon />
              <span>Open IDE Environment</span>
            </Flex>
          }
        />
        <ModalBody>
          This will open the IDE environment in a new tab.
        </ModalBody>
      </Modal>
    </>
  );
};
