import * as React from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  ExpandableSection,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Popover,
  Select,
  SelectList,
  SelectOption,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import {
  ChartDonutUtilization,
} from '@patternfly/react-charts/victory';
import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  AngleLeftIcon,
  AngleRightIcon,
  CheckCircleIcon,
  CheckIcon,
  EllipsisVIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  FilterIcon,
  FolderIcon,
  InProgressIcon,
  OutlinedClockIcon,
  OutlinedQuestionCircleIcon,
  PendingIcon,
  SearchIcon,
} from '@patternfly/react-icons';

const WorkloadMetrics: React.FunctionComponent = () => {
  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState('All projects');
  const [isAttributeSelectOpen, setIsAttributeSelectOpen] = React.useState(false);
  const [selectedAttribute, setSelectedAttribute] = React.useState<string>('Status');
  const [isFilterSelectOpen, setIsFilterSelectOpen] = React.useState(false);
  const [selectedStatusFilters, setSelectedStatusFilters] = React.useState<string[]>([]);
  const [selectedPriorityFilters, setSelectedPriorityFilters] = React.useState<string[]>([]);
  const [selectedHardwareFilters, setSelectedHardwareFilters] = React.useState<string[]>([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [openKebabIndex, setOpenKebabIndex] = React.useState<number | null>(null);
  const [isAdmissionMetricsExpanded, setIsAdmissionMetricsExpanded] = React.useState(true);
  const [isAdmissionFlowExpanded, setIsAdmissionFlowExpanded] = React.useState(true);
  const [isResourceAvailabilityExpanded, setIsResourceAvailabilityExpanded] = React.useState(true);
  const [isWorkloadsExpanded, setIsWorkloadsExpanded] = React.useState(true);
  const [isTimeRangeSelectOpen, setIsTimeRangeSelectOpen] = React.useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('Last 1 hour');
  const [isStatusTimeRangeSelectOpen, setIsStatusTimeRangeSelectOpen] = React.useState(false);
  const [selectedStatusTimeRange, setSelectedStatusTimeRange] = React.useState('Last 24 hours');
  
  // Sorting state for workloads table
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const projectOptions = ['All projects', 'Project-A', 'Project-B', 'Project-C'];
  const timeRangeOptions = ['Last 1 hour', 'Last 6 hours', 'Last 12 hours', 'Last 24 hours', 'Last 7 days'];

  const attributeOptions = ['Status', 'Priority', 'Hardware profile'];
  
  const filterOptionsByAttribute: { [key: string]: string[] } = {
    'Status': ['Queued', 'Pending', 'Admitted', 'Running', 'Paused', 'Preempted', 'Inadmissible', 'Evicted', 'Complete', 'Failed'],
    'Priority': ['Critical\n2000', 'Reserved\n1000', 'Standard\n500', 'On demand\n100'],
    'Hardware profile': ['High Performance (H100 - 80GB)\nnvidia.com/mig-7g.80gb', 'Standard (H100 MIG - 20GB)\nnvidia.com/mig-1g.20gb'],
  };
  
  const currentFilterOptions = filterOptionsByAttribute[selectedAttribute] || [];
  
  // Get current selected filters based on attribute
  const getCurrentSelectedFilters = () => {
    switch(selectedAttribute) {
      case 'Status': return selectedStatusFilters;
      case 'Priority': return selectedPriorityFilters;
      case 'Hardware profile': return selectedHardwareFilters;
      default: return [];
    }
  };
  
  const currentSelectedFilters = getCurrentSelectedFilters();
  
  // Get all active filters across all categories
  const allActiveFilters = [
    ...selectedStatusFilters.map(f => ({ category: 'Status', value: f })),
    ...selectedPriorityFilters.map(f => ({ category: 'Priority', value: f })),
    ...selectedHardwareFilters.map(f => ({ category: 'Hardware profile', value: f })),
  ];

  // Helper function to create ECharts bar chart options (24-hour rolling window)
  const getBarChartOptions = (data: Array<{ x: string | number; y: number }>, color: string) => ({
    grid: {
      left: '0%',
      right: '0%',
      top: 5,
      bottom: 5,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      show: false,
      data: data.map(d => d.x),
      boundaryGap: true,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}: ${item.value}`;
      },
    },
    series: [
      {
        data: data.map(d => d.y),
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: color,
          borderRadius: [2, 2, 0, 0],
        },
      },
    ],
  });

  const onProjectToggle = () => {
    setIsProjectSelectOpen(!isProjectSelectOpen);
  };

  const onProjectSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (value && typeof value === 'string') {
      setSelectedProject(value);
      setIsProjectSelectOpen(false);
    }
  };

  const onAttributeToggle = () => {
    setIsAttributeSelectOpen(!isAttributeSelectOpen);
  };

  const onAttributeSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (value && typeof value === 'string') {
      setSelectedAttribute(value);
      setIsAttributeSelectOpen(false);
    }
  };

  const onFilterToggle = () => {
    setIsFilterSelectOpen(!isFilterSelectOpen);
  };

  const onFilterSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (value && typeof value === 'string') {
      switch(selectedAttribute) {
        case 'Status':
          setSelectedStatusFilters((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
          );
          break;
        case 'Priority':
          setSelectedPriorityFilters((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
          );
          break;
        case 'Hardware profile':
          setSelectedHardwareFilters((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
          );
          break;
      }
    }
  };

  const clearFilters = () => {
    setSelectedStatusFilters([]);
    setSelectedPriorityFilters([]);
    setSelectedHardwareFilters([]);
  };

  const onTimeRangeToggle = () => {
    setIsTimeRangeSelectOpen(!isTimeRangeSelectOpen);
  };

  const onTimeRangeSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (value && typeof value === 'string') {
      setSelectedTimeRange(value);
      setIsTimeRangeSelectOpen(false);
    }
  };

  const onStatusTimeRangeToggle = () => {
    setIsStatusTimeRangeSelectOpen(!isStatusTimeRangeSelectOpen);
  };

  const onStatusTimeRangeSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (value && typeof value === 'string') {
      setSelectedStatusTimeRange(value);
      setIsStatusTimeRangeSelectOpen(false);
    }
  };

  const clearFilter = (category: string, filter: string) => {
    switch(category) {
      case 'Status':
        setSelectedStatusFilters((prev) => prev.filter((item) => item !== filter));
        break;
      case 'Priority':
        setSelectedPriorityFilters((prev) => prev.filter((item) => item !== filter));
        break;
      case 'Hardware profile':
        setSelectedHardwareFilters((prev) => prev.filter((item) => item !== filter));
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: 'blue' | 'orange' | 'green' | 'grey' | 'red' | 'purple', icon?: React.ReactNode, customColor?: string, whiteText?: boolean } } = {
      'Running': { 
        color: 'blue', 
        icon: (
          <span style={{ 
            display: 'inline-block', 
            animation: 'spin 2s linear infinite',
          }}>
            <InProgressIcon />
          </span>
        ) 
      },
      'Admitted': { color: 'grey', icon: <CheckIcon /> },
      'Pending': { color: 'purple', icon: <PendingIcon /> },
      'Queued': { color: 'grey', icon: <OutlinedClockIcon /> },
      'Preempted': { color: 'orange', icon: <ExclamationTriangleIcon />, customColor: '#FFCC17' },
      'Inadmissible': { color: 'orange', icon: <ExclamationTriangleIcon />, customColor: '#FFCC17' },
      'Evicted': { color: 'orange', icon: <ExclamationTriangleIcon />, customColor: '#FFCC17' },
      'Complete': { color: 'green', icon: <CheckCircleIcon />, customColor: '#3D7317', whiteText: true },
      'Failed': { color: 'red', icon: <ExclamationCircleIcon />, customColor: '#B1380B', whiteText: true },
    };

    const config = statusConfig[status] || { color: 'grey' as const };
    
    const customStyle = config.customColor ? {
      '--pf-v6-c-label--BackgroundColor': config.customColor,
      '--pf-v6-c-label--m-filled--BackgroundColor': config.customColor,
      ...(config.whiteText && {
        '--pf-v6-c-label--Color': '#ffffff',
        '--pf-v6-c-label__icon--Color': '#ffffff',
      }),
    } as React.CSSProperties : undefined;

    return (
      <Label 
        color={config.color} 
        id={`status-badge-${status}`} 
        icon={config.icon} 
        variant="filled"
        style={customStyle}
      >
        {status}
      </Label>
    );
  };

  // Sample data for the table with resource usage
  const jobData = [
    {
      id: 'gpt-finetune-run',
      name: 'gpt-finetune-run',
      project: 'Project-A',
      type: 'Train job',
      status: 'Running',
      queuePosition: '--',
      priority: 'Reserved (1000)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'inference-prod-v1',
      name: 'inference-prod-v1',
      project: 'Project-B',
      type: 'Inference',
      status: 'Admitted',
      queuePosition: '--',
      priority: 'Critical (2000)',
      waitTime: '12s',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'ray-tune-experiment',
      name: 'ray-tune-experiment',
      project: 'Project-C',
      type: 'Ray job',
      status: 'Pending',
      queuePosition: 'Position #1\n(~ 5 min)',
      priority: 'On Demand (100)',
      waitTime: '45s',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'notebook-interactive',
      name: 'notebook-interactive',
      project: 'Project-A',
      type: 'Notebook',
      status: 'Queued',
      queuePosition: 'Position #5\n(~ 20 min)',
      priority: 'On Demand (100)',
      waitTime: '5m',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'batch-process-nightly',
      name: 'batch-process-nightly',
      project: 'Project-B',
      type: 'Train job',
      status: 'Preempted',
      queuePosition: 'Position #1\n(Paused)',
      priority: 'On Demand (100)',
      waitTime: '2h 10m',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'massive-model-test',
      name: 'massive-model-test',
      project: 'Project-C',
      type: 'Train job',
      status: 'Inadmissible',
      queuePosition: '--',
      priority: 'On Demand (100)',
      waitTime: '10m',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'long-run-analysis',
      name: 'long-run-analysis',
      project: 'Project-A',
      type: 'Ray job',
      status: 'Evicted',
      queuePosition: '--',
      priority: 'On Demand (100)',
      waitTime: '--',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'data-prep-daily',
      name: 'data-prep-daily',
      project: 'Project-B',
      type: 'Notebook',
      status: 'Complete',
      queuePosition: '--',
      priority: 'Standard (500)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'broken-code-v4',
      name: 'broken-code-v4',
      project: 'Project-C',
      type: 'Train job',
      status: 'Failed',
      queuePosition: '--',
      priority: 'Reserved (1000)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    // Additional workloads for pagination demo
    {
      id: 'llm-eval-batch',
      name: 'llm-eval-batch',
      project: 'Project-A',
      type: 'Train job',
      status: 'Running',
      queuePosition: '--',
      priority: 'Critical (2000)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'sentiment-analysis-v2',
      name: 'sentiment-analysis-v2',
      project: 'Project-B',
      type: 'Inference',
      status: 'Admitted',
      queuePosition: '--',
      priority: 'Standard (500)',
      waitTime: '8s',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'image-classifier-train',
      name: 'image-classifier-train',
      project: 'Project-C',
      type: 'Train job',
      status: 'Pending',
      queuePosition: 'Position #2\n(~ 8 min)',
      priority: 'On Demand (100)',
      waitTime: '1m 30s',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'data-pipeline-etl',
      name: 'data-pipeline-etl',
      project: 'Project-A',
      type: 'Ray job',
      status: 'Running',
      queuePosition: '--',
      priority: 'Standard (500)',
      waitTime: '--',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'model-serving-api',
      name: 'model-serving-api',
      project: 'Project-B',
      type: 'Inference',
      status: 'Running',
      queuePosition: '--',
      priority: 'Critical (2000)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'hyperparameter-sweep',
      name: 'hyperparameter-sweep',
      project: 'Project-C',
      type: 'Ray job',
      status: 'Queued',
      queuePosition: 'Position #3\n(~ 12 min)',
      priority: 'On Demand (100)',
      waitTime: '3m 45s',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'notebook-exploration',
      name: 'notebook-exploration',
      project: 'Project-A',
      type: 'Notebook',
      status: 'Admitted',
      queuePosition: '--',
      priority: 'On Demand (100)',
      waitTime: '25s',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'feature-engineering',
      name: 'feature-engineering',
      project: 'Project-B',
      type: 'Train job',
      status: 'Complete',
      queuePosition: '--',
      priority: 'Standard (500)',
      waitTime: '--',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'model-validation-suite',
      name: 'model-validation-suite',
      project: 'Project-C',
      type: 'Train job',
      status: 'Failed',
      queuePosition: '--',
      priority: 'On Demand (100)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'rag-indexing-job',
      name: 'rag-indexing-job',
      project: 'Project-A',
      type: 'Ray job',
      status: 'Pending',
      queuePosition: 'Position #4\n(~ 15 min)',
      priority: 'Standard (500)',
      waitTime: '2m 10s',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'embeddings-generator',
      name: 'embeddings-generator',
      project: 'Project-B',
      type: 'Inference',
      status: 'Running',
      queuePosition: '--',
      priority: 'Reserved (1000)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'drift-detection-daily',
      name: 'drift-detection-daily',
      project: 'Project-C',
      type: 'Train job',
      status: 'Queued',
      queuePosition: 'Position #6\n(~ 25 min)',
      priority: 'On Demand (100)',
      waitTime: '8m 20s',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'notebook-demo-env',
      name: 'notebook-demo-env',
      project: 'Project-A',
      type: 'Notebook',
      status: 'Preempted',
      queuePosition: 'Position #2\n(Paused)',
      priority: 'On Demand (100)',
      waitTime: '1h 5m',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'benchmark-runner',
      name: 'benchmark-runner',
      project: 'Project-B',
      type: 'Train job',
      status: 'Complete',
      queuePosition: '--',
      priority: 'Critical (2000)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'text-summarizer-v3',
      name: 'text-summarizer-v3',
      project: 'Project-C',
      type: 'Inference',
      status: 'Admitted',
      queuePosition: '--',
      priority: 'Standard (500)',
      waitTime: '15s',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'anomaly-detector',
      name: 'anomaly-detector',
      project: 'Project-A',
      type: 'Ray job',
      status: 'Evicted',
      queuePosition: '--',
      priority: 'On Demand (100)',
      waitTime: '--',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'chatbot-finetune',
      name: 'chatbot-finetune',
      project: 'Project-B',
      type: 'Train job',
      status: 'Inadmissible',
      queuePosition: '--',
      priority: 'Reserved (1000)',
      waitTime: '15m',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'vector-db-sync',
      name: 'vector-db-sync',
      project: 'Project-C',
      type: 'Ray job',
      status: 'Running',
      queuePosition: '--',
      priority: 'Standard (500)',
      waitTime: '--',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
    {
      id: 'multimodal-trainer',
      name: 'multimodal-trainer',
      project: 'Project-A',
      type: 'Train job',
      status: 'Pending',
      queuePosition: 'Position #7\n(~ 30 min)',
      priority: 'On Demand (100)',
      waitTime: '12m 45s',
      hardwareProfile: 'High Performance\nnvidia.com/mig-7g.80gb',
      gpuSlices: 2,
      cpuCores: 4,
      memoryGB: 16,
    },
    {
      id: 'qa-inference-test',
      name: 'qa-inference-test',
      project: 'Project-B',
      type: 'Inference',
      status: 'Complete',
      queuePosition: '--',
      priority: 'On Demand (100)',
      waitTime: '--',
      hardwareProfile: 'Standard\nnvidia.com/mig-3g.20gb',
      gpuSlices: 1,
      cpuCores: 2,
      memoryGB: 8,
    },
  ];
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Filter jobs based on project, search value, and all active filters
  // This filtered list is used for ALL sections (metrics, flow, resources, table)
  const filteredJobs = jobData.filter(job => {
    // Project filter
    const matchesProject = selectedProject === 'All projects' || job.project === selectedProject;
    
    // Search filter (only applies to workloads table)
    const matchesSearch = job.name.toLowerCase().includes(searchValue.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatusFilters.length === 0 || 
      selectedStatusFilters.includes(job.status);
    
    // Priority filter (match on priority name, e.g., "Critical" from "Critical\n2000")
    const jobPriorityName = job.priority.split('\n')[0];
    const matchesPriority = selectedPriorityFilters.length === 0 || 
      selectedPriorityFilters.some(filter => filter.split('\n')[0] === jobPriorityName);
    
    // Hardware profile filter (match on hardware profile name)
    const jobHardwareName = job.hardwareProfile.split('\n')[0];
    const matchesHardware = selectedHardwareFilters.length === 0 || 
      selectedHardwareFilters.some(filter => filter.split('\n')[0] === jobHardwareName);
    
    return matchesProject && matchesSearch && matchesStatus && matchesPriority && matchesHardware;
  });

  // Column keys for sorting
  const columnKeys = ['name', 'project', 'type', 'status', 'queuePosition', 'priority', 'waitTime', 'hardwareProfile'] as const;
  
  // Sort handler
  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex as number,
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  // Sort the filtered jobs
  const sortedJobs = React.useMemo(() => {
    if (activeSortIndex === null) {
      return filteredJobs;
    }
    
    const columnKey = columnKeys[activeSortIndex];
    
    return [...filteredJobs].sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];
      
      // Handle special cases for display values
      if (columnKey === 'priority') {
        // Extract numeric value from priority string like "Reserved (1000)"
        const aMatch = aValue.match(/\((\d+)\)/);
        const bMatch = bValue.match(/\((\d+)\)/);
        const aNum = aMatch ? parseInt(aMatch[1]) : 0;
        const bNum = bMatch ? parseInt(bMatch[1]) : 0;
        return activeSortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      if (columnKey === 'waitTime') {
        // Convert wait time to seconds for comparison
        const parseWaitTime = (time: string): number => {
          if (time === '--') return 0;
          let seconds = 0;
          const hours = time.match(/(\d+)h/);
          const minutes = time.match(/(\d+)m/);
          const secs = time.match(/(\d+)s/);
          if (hours) seconds += parseInt(hours[1]) * 3600;
          if (minutes) seconds += parseInt(minutes[1]) * 60;
          if (secs) seconds += parseInt(secs[1]);
          return seconds;
        };
        const aNum = parseWaitTime(aValue);
        const bNum = parseWaitTime(bValue);
        return activeSortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Default string comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (activeSortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [filteredJobs, activeSortIndex, activeSortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJobs = sortedJobs.slice(startIndex, endIndex);
  
  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedProject, selectedStatusFilters, selectedPriorityFilters, selectedHardwareFilters, searchValue]);

  // Jobs filtered by project and attribute filters only (without search) for metrics sections
  const filteredJobsForMetrics = jobData.filter(job => {
    const matchesProject = selectedProject === 'All projects' || job.project === selectedProject;
    const matchesStatus = selectedStatusFilters.length === 0 || 
      selectedStatusFilters.includes(job.status);
    const jobPriorityName = job.priority.split('\n')[0];
    const matchesPriority = selectedPriorityFilters.length === 0 || 
      selectedPriorityFilters.some(filter => filter.split('\n')[0] === jobPriorityName);
    const jobHardwareName = job.hardwareProfile.split('\n')[0];
    const matchesHardware = selectedHardwareFilters.length === 0 || 
      selectedHardwareFilters.some(filter => filter.split('\n')[0] === jobHardwareName);
    
    return matchesProject && matchesStatus && matchesPriority && matchesHardware;
  });

  // Calculate Admission Metrics from filtered jobs
  const pendingStatuses = ['Pending', 'Queued'];
  const activeStatuses = ['Running', 'Admitted'];
  const pendingCount = filteredJobsForMetrics.filter(job => pendingStatuses.includes(job.status)).length;
  const activeCount = filteredJobsForMetrics.filter(job => activeStatuses.includes(job.status)).length;
  
  // Calculate admission rate based on filtered jobs (simulated)
  const baseAdmissionRate = 0.195;
  const admissionRateMultiplier = filteredJobsForMetrics.length / jobData.length;
  const admissionsRate = (baseAdmissionRate * admissionRateMultiplier).toFixed(3);

  // Calculate individual status counts from filtered jobs
  const statusCounts = {
    running: filteredJobsForMetrics.filter(job => job.status === 'Running').length,
    admitted: filteredJobsForMetrics.filter(job => job.status === 'Admitted').length,
    pending: filteredJobsForMetrics.filter(job => job.status === 'Pending').length,
    queued: filteredJobsForMetrics.filter(job => job.status === 'Queued').length,
    preempted: filteredJobsForMetrics.filter(job => job.status === 'Preempted').length,
    inadmissible: filteredJobsForMetrics.filter(job => job.status === 'Inadmissible').length,
    evicted: filteredJobsForMetrics.filter(job => job.status === 'Evicted').length,
    complete: filteredJobsForMetrics.filter(job => job.status === 'Complete').length,
    failed: filteredJobsForMetrics.filter(job => job.status === 'Failed').length,
  };
  
  // Calculate Resource Availability from filtered active jobs
  const activeJobs = filteredJobsForMetrics.filter(job => activeStatuses.includes(job.status));
  const totalGpuCapacity = 8;
  const totalCpuCapacity = 14;
  const totalMemoryCapacity = 96;
  
  const usedGpuSlices = activeJobs.reduce((sum, job) => sum + job.gpuSlices, 0);
  const usedCpuCores = activeJobs.reduce((sum, job) => sum + job.cpuCores, 0);
  const usedMemoryGB = activeJobs.reduce((sum, job) => sum + job.memoryGB, 0);
  
  const gpuPercentage = Math.round((usedGpuSlices / totalGpuCapacity) * 100);
  const cpuPercentage = Math.round((usedCpuCores / totalCpuCapacity) * 100);
  const memoryPercentage = Math.round((usedMemoryGB / totalMemoryCapacity) * 100);

  // Generate 24-hour labels (past 24 hours)
  const generate24HourLabels = (): string[] => {
    const labels: string[] = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      labels.push(`${hour.getHours()}:00`);
    }
    return labels;
  };
  const hourLabels = generate24HourLabels();

  // Dynamic chart data based on filtered jobs - 24 hour rolling window
  const rateValue = parseFloat(admissionsRate);
  const baseRateMultipliers = [0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.55, 0.7, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.8, 0.85, 0.9];
  const admissionsRateData = hourLabels.map((label, i) => ({
    x: label,
    y: Math.round(rateValue * baseRateMultipliers[i] * 1000) / 1000,
  }));

  // Admission lead time data (24 hour rolling window)
  const baseLeadTimeValues = [42, 45, 48, 52, 55, 50, 47, 44, 46, 49, 51, 53, 50, 48, 45, 47, 50, 52, 49, 46, 44, 47, 49, 49];
  const admissionsLeadTimeData = hourLabels.map((label, i) => ({
    x: label,
    y: baseLeadTimeValues[i],
  }));

  // Pending workloads data (24 hour rolling window)
  const basePendingMultipliers = [0.6, 0.5, 0.4, 0.35, 0.3, 0.35, 0.4, 0.5, 0.7, 0.85, 0.95, 1.0, 1.1, 1.15, 1.2, 1.15, 1.1, 1.0, 0.9, 0.85, 0.8, 0.75, 0.7, 0.8];
  const pendingWorkloadsData = hourLabels.map((label, i) => ({
    x: label,
    y: Math.max(1, Math.round(pendingCount * basePendingMultipliers[i])),
  }));

  // Active workloads data (24 hour rolling window)
  const baseActiveMultipliers = [0.5, 0.45, 0.4, 0.35, 0.3, 0.35, 0.45, 0.6, 0.75, 0.9, 1.0, 1.05, 1.1, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85, 0.8, 0.7, 0.6, 0.55, 0.6];
  const activeWorkloadsData = hourLabels.map((label, i) => ({
    x: label,
    y: Math.max(1, Math.round(activeCount * baseActiveMultipliers[i])),
  }));

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          .inner-overage-ring path {
            stroke-linecap: butt !important;
          }
          
          #admission-metrics-expandable,
          #admission-flow-expandable {
            width: 100%;
          }
          
          #admission-metrics-expandable .pf-v6-c-expandable-section__toggle,
          #admission-flow-expandable .pf-v6-c-expandable-section__toggle {
            width: 100%;
            max-width: 100%;
            padding-right: 0;
            padding-left: 0;
          }
          
          #admission-metrics-expandable .pf-v6-c-expandable-section__toggle-text,
          #admission-flow-expandable .pf-v6-c-expandable-section__toggle-text {
            width: 100%;
            display: flex !important;
            padding: 0 24px;
          }
        `}
      </style>
  <PageSection>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Content component={ContentVariants.h1} id="workload-metrics-title">Workload metrics</Content>
          </FlexItem>
        </Flex>
        <Content component={ContentVariants.p} id="workload-metrics-subtitle">
          Monitor the metrics of your active resources.
    </Content>
        
        {/* Project selector */}
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }} style={{ marginTop: '24px' }}>
          <FlexItem>
            <Icon>
              <FolderIcon />
            </Icon>
          </FlexItem>
          <FlexItem>
            <span style={{ fontWeight: 600 }}>Project</span>
          </FlexItem>
          <FlexItem>
            <Select
              id="project-filter-select"
              isOpen={isProjectSelectOpen}
              selected={selectedProject}
              onSelect={onProjectSelect}
              onOpenChange={setIsProjectSelectOpen}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={onProjectToggle}
                  isExpanded={isProjectSelectOpen}
                  id="project-filter-toggle"
                  style={{ minWidth: '200px' }}
                >
                  {selectedProject}
                </MenuToggle>
              )}
            >
              <SelectList id="project-select-list">
                {projectOptions.map((option, index) => (
                  <SelectOption
                    key={option}
                    value={option}
                    id={`project-option-${index}`}
                  >
                    {option}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>
          <FlexItem>
            <Button 
              variant="link" 
              icon={<ExternalLinkAltIcon />} 
              iconPosition="end"
              id="go-to-projects-button"
            >
              Go to Projects
            </Button>
          </FlexItem>
        </Flex>

        {/* Attribute and Filter selector */}
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }} style={{ marginTop: '16px' }}>
          <FlexItem>
            <Select
              id="attribute-filter-select"
              isOpen={isAttributeSelectOpen}
              selected={selectedAttribute}
              onSelect={onAttributeSelect}
              onOpenChange={setIsAttributeSelectOpen}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={onAttributeToggle}
                  isExpanded={isAttributeSelectOpen}
                  icon={<FilterIcon />}
                  id="attribute-filter-toggle"
                  style={{ minWidth: '200px' }}
                >
                  {selectedAttribute}
                </MenuToggle>
              )}
            >
              <SelectList id="attribute-select-list">
                {attributeOptions.map((option, index) => (
                  <SelectOption
                    key={option}
                    value={option}
                    id={`attribute-option-${index}`}
                  >
                    {option}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>
          <FlexItem>
            <Select
              id="filter-options-select"
              isOpen={isFilterSelectOpen}
              selected={currentSelectedFilters}
              onSelect={onFilterSelect}
              onOpenChange={setIsFilterSelectOpen}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={onFilterToggle}
                  isExpanded={isFilterSelectOpen}
                  id="filter-options-toggle"
                  style={{ minWidth: '300px' }}
                >
                  Filter by {selectedAttribute.toLowerCase()}
                </MenuToggle>
              )}
            >
              <SelectList id="filter-options-list">
                {currentFilterOptions.map((option, index) => {
                  const lines = option.split('\n');
                  return (
                    <SelectOption
                      key={option}
                      value={option}
                      isSelected={currentSelectedFilters.includes(option)}
                      id={`filter-option-${index}`}
                    >
                      {lines.length > 1 ? (
                        <div>
                          <div>{lines[0]}</div>
                          <div style={{ fontSize: '12px', color: '#6A6E73' }}>{lines[1]}</div>
                        </div>
                      ) : (
                        option
                      )}
                    </SelectOption>
                  );
                })}
              </SelectList>
            </Select>
          </FlexItem>
        </Flex>

        {/* Active filters */}
        {allActiveFilters.length > 0 && (
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '16px' }}>
            {selectedStatusFilters.length > 0 && (
              <FlexItem>
                <LabelGroup categoryName="Status" id="filter-label-group-status">
                  {selectedStatusFilters.map((filter) => {
                    const displayText = filter.split('\n')[0];
                    return (
                      <Label key={filter} onClose={() => clearFilter('Status', filter)} id={`filter-label-status-${filter}`} color="grey">
                        {displayText}
                      </Label>
                    );
                  })}
                </LabelGroup>
              </FlexItem>
            )}
            {selectedPriorityFilters.length > 0 && (
              <FlexItem>
                <LabelGroup categoryName="Priority" id="filter-label-group-priority">
                  {selectedPriorityFilters.map((filter) => {
                    const displayText = filter.split('\n')[0];
                    return (
                      <Label key={filter} onClose={() => clearFilter('Priority', filter)} id={`filter-label-priority-${filter}`} color="grey">
                        {displayText}
                      </Label>
                    );
                  })}
                </LabelGroup>
              </FlexItem>
            )}
            {selectedHardwareFilters.length > 0 && (
              <FlexItem>
                <LabelGroup categoryName="Hardware profile" id="filter-label-group-hardware">
                  {selectedHardwareFilters.map((filter) => {
                    const displayText = filter.split('\n')[0];
                    return (
                      <Label key={filter} onClose={() => clearFilter('Hardware profile', filter)} id={`filter-label-hardware-${filter}`} color="grey">
                        {displayText}
                      </Label>
                    );
                  })}
                </LabelGroup>
              </FlexItem>
            )}
            <FlexItem>
              <Button variant="link" onClick={clearFilters} id="clear-filters-button">
                Clear all filters
              </Button>
            </FlexItem>
          </Flex>
        )}
      </PageSection>

      <PageSection>
        {/* Quota availability - moved above Admission Metrics */}
        <ExpandableSection
          toggleText="Quota availability"
          isExpanded={isResourceAvailabilityExpanded}
          onToggle={(_event, isExpanded) => setIsResourceAvailabilityExpanded(isExpanded)}
          displaySize="lg"
          id="quota-availability-expandable"
          style={{ backgroundColor: 'transparent' }}
        >
          <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
            <Grid hasGutter>
              <GridItem span={4}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>GPU</div>
                  <div style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '12px' }}>
                    {usedGpuSlices}/{totalGpuCapacity} slices used
                  </div>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChartDonutUtilization
                      ariaTitle="GPU utilization"
                      ariaDesc={`${gpuPercentage}% of GPU slices are currently used`}
                      constrainToVisibleArea
                      data={{ x: 'GPU slices used', y: gpuPercentage }}
                      labels={({ datum }) => `${datum.x}: ${datum.y}%`}
                      subTitle="slices used"
                      title={`${gpuPercentage}%`}
                      height={200}
                      width={200}
                    />
                  </div>
                </div>
              </GridItem>
              <GridItem span={4}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>CPU</div>
                  <div style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '12px' }}>
                    {usedCpuCores}/{totalCpuCapacity} cores used
                  </div>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChartDonutUtilization
                      ariaTitle="CPU utilization"
                      ariaDesc={`${cpuPercentage}% of CPU cores are currently used`}
                      constrainToVisibleArea
                      data={{ x: 'CPU cores used', y: cpuPercentage }}
                      labels={({ datum }) => `${datum.x}: ${datum.y}%`}
                      subTitle="cores used"
                      title={`${cpuPercentage}%`}
                      height={200}
                      width={200}
                    />
                  </div>
                </div>
              </GridItem>
              <GridItem span={4}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>Memory</div>
                  <div style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '12px' }}>
                    {usedMemoryGB}/{totalMemoryCapacity} GB used
                  </div>
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChartDonutUtilization
                      ariaTitle="Memory utilization"
                      ariaDesc={`${memoryPercentage}% of memory is currently used`}
                      constrainToVisibleArea
                      data={{ x: 'Memory used', y: memoryPercentage }}
                      labels={({ datum }) => `${datum.x}: ${datum.y}%`}
                      subTitle="GB used"
                      title={`${memoryPercentage}%`}
                      height={200}
                      width={200}
                    />
                  </div>
                </div>
              </GridItem>
            </Grid>
          </div>
        </ExpandableSection>

        {/* Admission Metrics */}
        <ExpandableSection
          toggleContent={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              width: '100%',
              marginRight: '24px'
            }}>
              <span>Workload admission</span>
              <Select
                id="time-range-select"
                isOpen={isTimeRangeSelectOpen}
                selected={selectedTimeRange}
                onSelect={onTimeRangeSelect}
                onOpenChange={setIsTimeRangeSelectOpen}
                onClick={(e) => e.stopPropagation()}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimeRangeToggle();
                    }}
                    isExpanded={isTimeRangeSelectOpen}
                    id="time-range-toggle"
                    style={{ minWidth: '150px' }}
                  >
                    {selectedTimeRange}
                  </MenuToggle>
                )}
              >
                <SelectList id="time-range-select-list">
                  {timeRangeOptions.map((option, index) => (
                    <SelectOption
                      key={option}
                      value={option}
                      id={`time-range-option-${index}`}
                    >
                      {option}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </div>
          }
          isExpanded={isAdmissionMetricsExpanded}
          onToggle={(_event, isExpanded) => setIsAdmissionMetricsExpanded(isExpanded)}
          displaySize="lg"
          id="admission-metrics-expandable"
          style={{ marginTop: '24px', backgroundColor: 'transparent' }}
        >
          <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
            <Flex>
            <FlexItem flex={{ default: 'flex_1' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }} id="admissions-rate-title">Admissions rate</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{admissionsRate}/s</div>
                <div style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Target: 0.200/s
                </div>
                <div style={{ height: '60px', marginTop: '8px', width: '100%' }}>
                  <ReactECharts
                    option={getBarChartOptions(admissionsRateData, '#73BCF7')}
                    style={{ height: '60px', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </div>
            </FlexItem>
            <Divider orientation={{ default: 'vertical' }} />
            <FlexItem flex={{ default: 'flex_1' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }} id="admission-lead-time-title">Admission lead time</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>49.3 ms</div>
                <div style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Target: {'<'}50ms
                </div>
                <div style={{ height: '60px', marginTop: '8px', width: '100%' }}>
                  <ReactECharts
                    option={getBarChartOptions(admissionsLeadTimeData, '#73BCF7')}
                    style={{ height: '60px', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </div>
            </FlexItem>
            <Divider orientation={{ default: 'vertical' }} />
            <FlexItem flex={{ default: 'flex_1' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }} id="pending-workloads-title">Pending workloads</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{pendingCount} pending</div>
                <div style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Waiting for resources
                </div>
                <div style={{ height: '60px', marginTop: '8px', width: '100%' }}>
                  <ReactECharts
                    option={getBarChartOptions(pendingWorkloadsData, '#F4C145')}
                    style={{ height: '60px', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </div>
            </FlexItem>
            <Divider orientation={{ default: 'vertical' }} />
            <FlexItem flex={{ default: 'flex_1' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }} id="active-workloads-title">Active workloads</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{activeCount} active</div>
                <div style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Admitted & Executing
                </div>
                <div style={{ height: '60px', marginTop: '8px', width: '100%' }}>
                  <ReactECharts
                    option={getBarChartOptions(activeWorkloadsData, '#73BCF7')}
                    style={{ height: '60px', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                  />
                </div>
              </div>
            </FlexItem>
          </Flex>
          </div>
        </ExpandableSection>

        {/* Workload status overview - Aggregate Status Cards */}
        <ExpandableSection
          toggleContent={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              width: '100%',
              marginRight: '24px'
            }}>
              <span>Workload status overview</span>
              <Select
                  id="status-time-range-select"
                  isOpen={isStatusTimeRangeSelectOpen}
                  selected={selectedStatusTimeRange}
                  onSelect={onStatusTimeRangeSelect}
                  onOpenChange={setIsStatusTimeRangeSelectOpen}
                  onClick={(e) => e.stopPropagation()}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusTimeRangeToggle();
                      }}
                      isExpanded={isStatusTimeRangeSelectOpen}
                      id="status-time-range-toggle"
                      style={{ minWidth: '150px' }}
                    >
                      {selectedStatusTimeRange}
                    </MenuToggle>
                  )}
                >
                  <SelectList id="status-time-range-select-list">
                    {timeRangeOptions.map((option, index) => (
                      <SelectOption
                        key={option}
                        value={option}
                        id={`status-time-range-option-${index}`}
                      >
                        {option}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
            </div>
          }
          isExpanded={isAdmissionFlowExpanded}
          onToggle={(_event, isExpanded) => setIsAdmissionFlowExpanded(isExpanded)}
          displaySize="lg"
          id="admission-flow-expandable"
          style={{ marginTop: '24px', backgroundColor: 'transparent' }}
        >
          <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
            <Flex spaceItems={{ default: 'spaceItemsLg' }} flexWrap={{ default: 'wrap' }}>
              {/* Running - Brand icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-running-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.running}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="custom" style={{ color: 'var(--pf-t--global--icon--color--brand--default)' }}>
                          <InProgressIcon style={{ animation: 'spin 2s linear infinite' }} />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Running</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>

              {/* Admitted - Subtle icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-admitted-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.admitted}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="custom" style={{ color: 'var(--pf-t--global--icon--color--subtle)' }}>
                          <CheckIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Admitted</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>

              {/* Pending - Info icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-pending-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.pending}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="info">
                          <PendingIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Pending</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>

              {/* Queued - Subtle icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-queued-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.queued}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="custom" style={{ color: 'var(--pf-t--global--icon--color--subtle)' }}>
                          <OutlinedClockIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Queued</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>

              {/* Preempted - Warning icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-preempted-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.preempted}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="warning">
                          <ExclamationTriangleIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Preempted</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>

              {/* Inadmissible - Warning icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-inadmissible-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.inadmissible}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="warning">
                          <ExclamationTriangleIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Inadmissible</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>

              {/* Evicted - Warning icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-evicted-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.evicted}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="warning">
                          <ExclamationTriangleIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Evicted</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>

              {/* Complete - Success icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-complete-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.complete}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="success">
                          <CheckCircleIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Complete</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>

              {/* Failed - Danger icon color */}
              <FlexItem>
                <Card isCompact isClickable id="status-failed-card" style={{ minWidth: '120px', textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                  <CardBody style={{ padding: '16px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{statusCounts.failed}</div>
                    <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <Icon status="danger">
                          <ExclamationCircleIcon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>Failed</span>
                      </FlexItem>
                    </Flex>
                  </CardBody>
                </Card>
              </FlexItem>
            </Flex>
          </div>
        </ExpandableSection>
  </PageSection>

      {/* Jobs table */}
      <PageSection style={{ paddingTop: '24px', backgroundColor: 'var(--pf-t--global--background--color--primary)' }}>
        <ExpandableSection
          toggleText={
            <>
              Workloads <Badge isRead id="workloads-count-badge">{filteredJobs.length}</Badge>
            </> as any
          }
          isExpanded={isWorkloadsExpanded}
          onToggle={(_event, isExpanded) => setIsWorkloadsExpanded(isExpanded)}
          displaySize="lg"
          id="workloads-expandable"
          style={{ backgroundColor: 'transparent' }}
        >
          <div style={{ padding: '24px', backgroundColor: '#ffffff' }}>
              {/* Toolbar with search and pagination */}
            <Toolbar id="workloads-toolbar">
              <ToolbarContent style={{ alignItems: 'baseline' }}>
                <ToolbarItem>
                  <TextInput
                    id="job-search-input"
                    type="search"
                    placeholder="Find by job name"
                    aria-label="Search jobs"
                    value={searchValue}
                    onChange={(_event, value) => setSearchValue(value)}
                    customIcon={<SearchIcon />}
                  />
                </ToolbarItem>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }} style={{ alignSelf: 'center' }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                  <span style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                        {sortedJobs.length > 0 ? `${startIndex + 1} - ${Math.min(endIndex, sortedJobs.length)} of ${sortedJobs.length}` : '0 of 0'}
                  </span>
                    </FlexItem>
                    <FlexItem>
                      <Button 
                        variant="plain" 
                        isDisabled={currentPage === 1}
                        onClick={() => setCurrentPage(1)}
                        aria-label="First page"
                        id="pagination-first-btn"
                      >
                        <AngleDoubleLeftIcon />
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Button 
                        variant="plain" 
                        isDisabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        aria-label="Previous page"
                        id="pagination-prev-btn"
                      >
                        <AngleLeftIcon />
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <span style={{ fontSize: '14px' }}>
                        {currentPage} of {totalPages || 1}
                      </span>
                    </FlexItem>
                    <FlexItem>
                      <Button 
                        variant="plain" 
                        isDisabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        aria-label="Next page"
                        id="pagination-next-btn"
                      >
                        <AngleRightIcon />
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Button 
                        variant="plain" 
                        isDisabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        aria-label="Last page"
                        id="pagination-last-btn"
                      >
                        <AngleDoubleRightIcon />
                      </Button>
                    </FlexItem>
                  </Flex>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Table aria-label="Workload jobs table" variant="compact" id="jobs-table">
                <Thead>
                  <Tr>
                    <Th id="job-name-header" sort={getSortParams(0)}>Job name</Th>
                    <Th id="project-header" sort={getSortParams(1)}>Project</Th>
                    <Th id="type-header" sort={getSortParams(2)}>Type</Th>
                    <Th id="status-header" sort={getSortParams(3)}>Status</Th>
                    <Th id="queue-position-header" sort={getSortParams(4)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Queue position (est. start)
                        <Popover
                          aria-label="Queue position information"
                          headerContent="Queue position"
                          bodyContent="The position of the job in the queue and estimated start time"
                        >
                          <Button variant="plain" aria-label="More info for queue position" id="queue-position-info-button" style={{ padding: 0, minHeight: 'auto' }}>
                            <OutlinedQuestionCircleIcon />
                          </Button>
                        </Popover>
                      </span>
                    </Th>
                    <Th id="priority-header" sort={getSortParams(5)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Priority
                        <Popover
                          aria-label="Priority information"
                          headerContent="Priority"
                          bodyContent="The priority level determines the order in which jobs are scheduled"
                        >
                          <Button variant="plain" aria-label="More info for priority" id="priority-info-button" style={{ padding: 0, minHeight: 'auto' }}>
                            <OutlinedQuestionCircleIcon />
                          </Button>
                        </Popover>
                      </span>
                    </Th>
                    <Th id="wait-time-header" sort={getSortParams(6)}>Wait time</Th>
                    <Th id="hardware-profile-header" sort={getSortParams(7)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Hardware profile
                        <Popover
                          aria-label="Hardware profile information"
                          headerContent="Hardware profile"
                          bodyContent="The hardware configuration and GPU specifications for the job"
                        >
                          <Button variant="plain" aria-label="More info for hardware profile" id="hardware-profile-info-button" style={{ padding: 0, minHeight: 'auto' }}>
                            <OutlinedQuestionCircleIcon />
                          </Button>
                        </Popover>
                      </span>
                    </Th>
                    <Th id="actions-header"></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedJobs.map((job, index) => {
                    const queuePositionLines = job.queuePosition.split('\n');
                    const priorityMatch = job.priority.match(/^(.*?)(\(.*\))$/);
                    const hardwareProfileLines = job.hardwareProfile.split('\n');
                    
                    return (
                      <Tr key={job.id}>
                        <Td dataLabel="Job name">
                          <Button variant="link" isInline id={`job-link-${startIndex + index}`}>{job.name}</Button>
                        </Td>
                        <Td dataLabel="Project">{job.project}</Td>
                        <Td dataLabel="Type">{job.type}</Td>
                        <Td dataLabel="Status">{getStatusBadge(job.status)}</Td>
                        <Td dataLabel="Queue position">
                          {queuePositionLines[0]}
                          {queuePositionLines[1] && (
                            <>
                              <br />
                              <span style={{ color: '#4D4D4D' }}>{queuePositionLines[1]}</span>
                            </>
                          )}
                        </Td>
                        <Td dataLabel="Priority">
                          {priorityMatch ? (
                            <>
                              {priorityMatch[1]}
                              <span style={{ color: '#4D4D4D' }}>{priorityMatch[2]}</span>
                            </>
                          ) : (
                            job.priority
                          )}
                        </Td>
                        <Td dataLabel="Wait time">{job.waitTime}</Td>
                        <Td dataLabel="Hardware profile">
                          {hardwareProfileLines[0]}
                          {hardwareProfileLines[1] && (
                            <>
                              <br />
                              <span style={{ color: '#4D4D4D' }}>{hardwareProfileLines[1]}</span>
                            </>
                          )}
                        </Td>
                        <Td isActionCell>
                          <Dropdown
                            isOpen={openKebabIndex === index}
                            onOpenChange={(isOpen: boolean) => setOpenKebabIndex(isOpen ? index : null)}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                              <MenuToggle
                                ref={toggleRef}
                                aria-label={`Actions for ${job.name}`}
                                variant="plain"
                                onClick={() => setOpenKebabIndex(openKebabIndex === index ? null : index)}
                                isExpanded={openKebabIndex === index}
                                id={`job-actions-${index}`}
                              >
                                <EllipsisVIcon />
                              </MenuToggle>
                            )}
                            popperProps={{ appendTo: () => document.body }}
                          >
                            <DropdownList id={`job-actions-list-${index}`}>
                              <DropdownItem key="view" id={`job-action-view-${index}`}>View details</DropdownItem>
                              <DropdownItem key="pause" id={`job-action-pause-${index}`}>Pause job</DropdownItem>
                              <DropdownItem key="cancel" id={`job-action-cancel-${index}`}>Cancel job</DropdownItem>
                              <DropdownItem key="logs" id={`job-action-logs-${index}`}>View logs</DropdownItem>
                            </DropdownList>
                          </Dropdown>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
              
              {/* Bottom pagination */}
              <Toolbar id="workloads-bottom-toolbar">
                <ToolbarContent style={{ alignItems: 'baseline' }}>
                  <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }} style={{ alignSelf: 'center' }}>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                    <span style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {sortedJobs.length > 0 ? `${startIndex + 1} - ${Math.min(endIndex, sortedJobs.length)} of ${sortedJobs.length}` : '0 of 0'}
                    </span>
                      </FlexItem>
                      <FlexItem>
                        <Button 
                          variant="plain" 
                          isDisabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                          aria-label="First page"
                          id="pagination-bottom-first-btn"
                        >
                          <AngleDoubleLeftIcon />
                        </Button>
                      </FlexItem>
                      <FlexItem>
                        <Button 
                          variant="plain" 
                          isDisabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          aria-label="Previous page"
                          id="pagination-bottom-prev-btn"
                        >
                          <AngleLeftIcon />
                        </Button>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '14px' }}>
                          {currentPage} of {totalPages || 1}
                        </span>
                      </FlexItem>
                      <FlexItem>
                        <Button 
                          variant="plain" 
                          isDisabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          aria-label="Next page"
                          id="pagination-bottom-next-btn"
                        >
                          <AngleRightIcon />
                        </Button>
                      </FlexItem>
                      <FlexItem>
                        <Button 
                          variant="plain" 
                          isDisabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          aria-label="Last page"
                          id="pagination-bottom-last-btn"
                        >
                          <AngleDoubleRightIcon />
                        </Button>
                      </FlexItem>
                    </Flex>
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>
          </div>
        </ExpandableSection>
      </PageSection>
    </>
  );
};

export { WorkloadMetrics };
